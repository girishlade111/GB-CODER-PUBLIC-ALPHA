/**
 * Project storage.
 *
 * IndexedDB holds anything that can grow: the project records and, separately,
 * every project's files. localStorage holds only the pointer to which project is
 * active, because that has to be readable synchronously during the first render
 * and is a single short string.
 *
 * ## Why files live in their own store
 *
 * The obvious shape is one record per project with a `files` array inside it. That
 * makes every keystroke rewrite the entire project: a 40 MB import would be
 * re-serialised on each autosave. Files are therefore keyed by
 * `[projectId, path]`, so saving an edit writes one small record and leaves the
 * rest of the tree untouched. `saveProjectFiles` diffs against the caller's last
 * snapshot to work out that minimum set.
 *
 * The project record deliberately does *not* carry a copy of the file tree. The
 * tree is derivable from `projectFiles`, and storing it twice would mean two
 * sources of truth that can disagree. It carries `fileCount` instead, which is
 * what the dashboard actually needs to render a list without reading any files.
 *
 * ## Failure behaviour
 *
 * Nothing here rejects. IndexedDB can be refused outright — private browsing, a
 * blocked upgrade, a storage-pressure eviction — and none of that is a reason to
 * fail a render. Reads resolve `null`/`[]` and writes resolve quietly, so the app
 * degrades to "this session is not being remembered" rather than breaking.
 *
 * Contains no sandbox or E2B vocabulary: this is imported eagerly so the first
 * render can decide between the dashboard and the editor, and
 * `scripts/measure-initial-bundle.mjs` fails the build if full-stack marker
 * strings reach the initial payload.
 */
import type { ProjectFile, ProjectType } from '../../types/files';

const DB_NAME = 'gb-coder-projects-db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const FILES_STORE = 'projectFiles';
const LAST_OPENED_INDEX = 'lastOpenedAt';
const PROJECT_ID_INDEX = 'projectId';

/**
 * Which editor a project opens in.
 *
 * Distinct from `ProjectType` (`plain | react | vue`), which describes the code.
 * A React project can be opened in either editor, so the two are stored
 * separately rather than one being inferred from the other.
 */
export type EditorStyle = 'plain' | 'vscode';

export interface ProjectRecord {
  id: string;
  name: string;
  /** Epoch ms. Numbers rather than ISO strings so the index sorts numerically. */
  createdAt: number;
  lastOpenedAt: number;
  editorStyle: EditorStyle;
  /** Preserved so a React or Vue project reopens as itself. */
  projectType: ProjectType;
  entry?: string;
  /** Denormalised so the dashboard can list projects without reading files. */
  fileCount: number;
}

export interface NewProjectInput {
  name: string;
  editorStyle: EditorStyle;
  projectType: ProjectType;
  entry?: string;
  files: ProjectFile[];
}

/** A file record. The compound key is `[projectId, path]`. */
interface StoredFile extends ProjectFile {
  projectId: string;
}

/**
 * What was last written, so the next save can send only the difference.
 * Path to content.
 */
export type FileSnapshot = Map<string, string>;

export const snapshotOf = (files: ProjectFile[]): FileSnapshot =>
  new Map(files.map((file) => [file.path, file.content]));

/** localStorage key for the active-project pointer. */
export const ACTIVE_PROJECT_KEY = 'gb-coder-active-project-id';

export const readActiveProjectId = (): string | null => {
  try {
    return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
};

export const writeActiveProjectId = (id: string | null): void => {
  try {
    if (id === null) window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
    else window.localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch {
    // Not remembering which project was open is survivable; the dashboard is the
    // fallback and nothing is lost.
  }
};

const createId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    // Non-secure contexts have no randomUUID. Uniqueness within one browser's
    // own database is all that is needed here.
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

const openDatabase = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const projects = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        // Indexed so the dashboard's "most recent first" ordering is the
        // database's job rather than a sort over every record.
        projects.createIndex(LAST_OPENED_INDEX, 'lastOpenedAt');
      }

      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const files = db.createObjectStore(FILES_STORE, { keyPath: ['projectId', 'path'] });
        // Needed to read or delete one project's files without scanning others'.
        files.createIndex(PROJECT_ID_INDEX, 'projectId');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

/**
 * Serialises operations.
 *
 * Deleting a project and a debounced save of that same project can otherwise
 * interleave, and the save landing second would leave orphaned file records
 * behind a deleted project.
 */
let pending: Promise<unknown> = Promise.resolve();

const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
  // Both handlers run the operation, so one failure cannot stall the queue.
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
};

const awaitRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/**
 * Runs `work` inside one transaction and resolves once it has *committed*.
 *
 * Resolving on commit rather than on the last request matters: a caller that
 * reloads immediately after saving would otherwise race the commit and read back
 * stale data.
 */
const withTransaction = <T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  work: (transaction: IDBTransaction) => Promise<T>,
): Promise<T | null> =>
  openDatabase().then((db) => {
    if (!db) return null;

    return new Promise<T | null>((resolve) => {
      let transaction: IDBTransaction;
      try {
        transaction = db.transaction(storeNames, mode);
      } catch {
        db.close();
        resolve(null);
        return;
      }

      let value: T | null = null;
      let settled = false;
      const settle = (result: T | null) => {
        if (settled) return;
        settled = true;
        db.close();
        resolve(result);
      };

      transaction.oncomplete = () => settle(value);
      transaction.onerror = () => settle(null);
      transaction.onabort = () => settle(null);

      work(transaction).then(
        (result) => {
          value = result;
        },
        () => {
          try {
            transaction.abort();
          } catch {
            settle(null);
          }
        },
      );
    });
  });

/** Every project, most recently opened first. */
export const listProjects = (): Promise<ProjectRecord[]> =>
  enqueue(() =>
    withTransaction<ProjectRecord[]>([PROJECTS_STORE], 'readonly', async (transaction) => {
      const index = transaction.objectStore(PROJECTS_STORE).index(LAST_OPENED_INDEX);
      const records = await awaitRequest(index.getAll() as IDBRequest<ProjectRecord[]>);
      // getAll on an index returns ascending order; the dashboard wants newest first.
      return records.reverse();
    }),
  ).then((records) => records ?? []);

export const getProject = (id: string): Promise<ProjectRecord | null> =>
  enqueue(() =>
    withTransaction<ProjectRecord | null>([PROJECTS_STORE], 'readonly', async (transaction) => {
      const record = await awaitRequest(
        transaction.objectStore(PROJECTS_STORE).get(id) as IDBRequest<ProjectRecord | undefined>,
      );
      return record ?? null;
    }),
  ).then((record) => record ?? null);

/** Creates a project and writes its starter files in one transaction. */
export const createProject = (input: NewProjectInput): Promise<ProjectRecord | null> => {
  const now = Date.now();
  const record: ProjectRecord = {
    id: createId(),
    name: input.name,
    createdAt: now,
    lastOpenedAt: now,
    editorStyle: input.editorStyle,
    projectType: input.projectType,
    entry: input.entry,
    fileCount: input.files.length,
  };

  return enqueue(() =>
    withTransaction<ProjectRecord>(
      [PROJECTS_STORE, FILES_STORE],
      'readwrite',
      async (transaction) => {
        transaction.objectStore(PROJECTS_STORE).put(record);
        const files = transaction.objectStore(FILES_STORE);
        for (const file of input.files) {
          const stored: StoredFile = { ...file, projectId: record.id };
          files.put(stored);
        }
        return record;
      },
    ),
  );
};

export const readProjectFiles = (projectId: string): Promise<ProjectFile[]> =>
  enqueue(() =>
    withTransaction<ProjectFile[]>([FILES_STORE], 'readonly', async (transaction) => {
      const index = transaction.objectStore(FILES_STORE).index(PROJECT_ID_INDEX);
      const stored = await awaitRequest(
        index.getAll(projectId) as IDBRequest<StoredFile[]>,
      );
      return stored.map(({ path, content, language }) => ({ path, content, language }));
    }),
  ).then((files) => files ?? []);

/**
 * Writes only what changed since `previous`.
 *
 * Passing `previous` as `null` writes every file, which is what a first save or a
 * freshly loaded project needs. Returns the snapshot the caller should hold for
 * the next call.
 */
export const saveProjectFiles = (
  projectId: string,
  files: ProjectFile[],
  previous: FileSnapshot | null,
): Promise<FileSnapshot> => {
  const changed = files.filter(
    (file) => previous === null || previous.get(file.path) !== file.content,
  );
  const currentPaths = new Set(files.map((file) => file.path));
  const removed = previous === null ? [] : [...previous.keys()].filter((path) => !currentPaths.has(path));
  const next = snapshotOf(files);

  // Nothing to do — avoids opening a transaction on every debounce tick when the
  // user is reading rather than typing.
  if (changed.length === 0 && removed.length === 0) return Promise.resolve(next);

  return enqueue(() =>
    withTransaction<void>([PROJECTS_STORE, FILES_STORE], 'readwrite', async (transaction) => {
      const fileStore = transaction.objectStore(FILES_STORE);

      for (const file of changed) {
        const stored: StoredFile = { ...file, projectId };
        fileStore.put(stored);
      }
      for (const path of removed) {
        fileStore.delete([projectId, path]);
      }

      /*
       * Keep the denormalised count honest. Read-modify-write inside the same
       * transaction, so a concurrent save cannot interleave and lose one update.
       */
      const projects = transaction.objectStore(PROJECTS_STORE);
      const record = await awaitRequest(
        projects.get(projectId) as IDBRequest<ProjectRecord | undefined>,
      );
      if (record && record.fileCount !== files.length) {
        projects.put({ ...record, fileCount: files.length });
      }
    }),
  ).then(() => next);
};

/** Patches a project's metadata, leaving its files alone. */
export const updateProject = (
  id: string,
  patch: Partial<Omit<ProjectRecord, 'id' | 'createdAt'>>,
): Promise<ProjectRecord | null> =>
  enqueue(() =>
    withTransaction<ProjectRecord | null>(
      [PROJECTS_STORE],
      'readwrite',
      async (transaction) => {
        const projects = transaction.objectStore(PROJECTS_STORE);
        const record = await awaitRequest(
          projects.get(id) as IDBRequest<ProjectRecord | undefined>,
        );
        if (!record) return null;

        const updated: ProjectRecord = { ...record, ...patch };
        projects.put(updated);
        return updated;
      },
    ),
  );

/** Marks a project as just opened, which is what orders the dashboard list. */
export const touchProject = (id: string): Promise<ProjectRecord | null> =>
  updateProject(id, { lastOpenedAt: Date.now() });

/**
 * Removes a project and every file belonging to it.
 *
 * Both stores in one transaction: a half-deleted project would leave file records
 * that nothing can ever reach or clean up.
 */
export const deleteProject = (id: string): Promise<void> =>
  enqueue(() =>
    withTransaction<void>([PROJECTS_STORE, FILES_STORE], 'readwrite', async (transaction) => {
      transaction.objectStore(PROJECTS_STORE).delete(id);

      const index = transaction.objectStore(FILES_STORE).index(PROJECT_ID_INDEX);
      const keys = await awaitRequest(index.getAllKeys(id) as IDBRequest<IDBValidKey[]>);
      const files = transaction.objectStore(FILES_STORE);
      for (const key of keys) files.delete(key);
    }),
  ).then(() => undefined);

/**
 * Suggests the next default name, e.g. `Untitled Project 3`.
 *
 * Counts from the highest existing number rather than the project total, so
 * deleting "Untitled Project 2" does not make the next one collide with an
 * "Untitled Project 3" that is still there.
 */
export const suggestProjectName = (existing: ProjectRecord[]): string => {
  const used = existing
    .map((project) => /^Untitled Project (\d+)$/.exec(project.name)?.[1])
    .filter((value): value is string => value !== undefined)
    .map(Number);

  const next = used.length === 0 ? 1 : Math.max(...used) + 1;
  return `Untitled Project ${next}`;
};
