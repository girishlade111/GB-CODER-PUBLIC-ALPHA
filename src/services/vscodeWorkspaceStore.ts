/**
 * Persistence for the workspace open in VS Code mode.
 *
 * Two stores, split by payload size:
 *
 *   - **IndexedDB** holds the project files. `localStorage` is not viable for
 *     these: the import pipeline accepts archives up to 50 MB, an origin's
 *     localStorage quota is around 5 MB, and the app's `useLocalStorage` reports a
 *     quota failure with `console.error` and carries on — so a large project would
 *     look persisted and then silently fail to come back. IndexedDB also stores
 *     structured values, so the file list needs no JSON round-trip.
 *   - **localStorage** holds which tabs are open, which is a handful of short
 *     strings and has to be readable *synchronously* while the component sets up
 *     its initial state.
 *
 * Deliberately free of sandbox/E2B vocabulary. `App` imports this eagerly so the
 * first render can already decide whether to show VS Code mode, and
 * `scripts/measure-initial-bundle.mjs` fails the build if full-stack marker
 * strings reach the initial payload.
 */
import type { MultiFileProject, ProjectFile, ProjectType } from '../types/files';

const DB_NAME = 'gb-coder-workspace';
const DB_VERSION = 1;
const STORE_NAME = 'vscode';
/** Single-record store: one workspace is open at a time. */
const RECORD_KEY = 'current';

/** localStorage key for the open-tab set. */
const VIEW_STATE_KEY = 'gb-coder-vscode-view';

export interface StoredWorkspace {
  projectType: ProjectType;
  files: ProjectFile[];
  entry?: string;
  /**
   * What the standard editor should be restored to on exit — App's `vsCodeReturn`.
   *
   * Persisted because a React or Vue project entered by hand has to come back as
   * itself after a refresh, rather than being flattened to plain.
   */
  returnTo?: { projectType: ProjectType; entry?: string } | null;
  savedAt: number;
}

/**
 * Opens the database, resolving `null` on any failure.
 *
 * Never rejects. Losing persistence is a degraded experience — private browsing
 * can refuse IndexedDB outright, and `open` may throw rather than fire an error
 * event — but it is not a reason to fail a render or surface an error to someone
 * who only wanted to edit a file.
 */
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
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

/**
 * Serialises every operation.
 *
 * Leaving the mode clears the record while a debounced save may still be in
 * flight. Without ordering, that save could land *after* the clear and resurrect
 * a workspace the user just closed — which would then reappear on their next
 * visit to the route.
 */
let pending: Promise<unknown> = Promise.resolve();

const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
  // Both handlers run `operation`, so one failed write cannot stall the queue.
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
};

export const STORAGE_WARNING_EVENT = 'gb-coder:storage-warning';

export interface StorageWarningDetail {
  reason: string;
  quotaExceeded?: boolean;
}

const dispatchStorageWarning = (reason: string, quotaExceeded = false): void => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent<StorageWarningDetail>(STORAGE_WARNING_EVENT, {
          detail: { reason, quotaExceeded },
        }),
      );
    } catch {
      // Ignored in non-window / test environments
    }
  }
};

const withStore = <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T | null> =>
  openDatabase().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          dispatchStorageWarning('IndexedDB unavailable or blocked');
          resolve(null);
          return;
        }

        const settle = (value: T | null) => {
          db.close();
          resolve(value);
        };

        let request: IDBRequest;
        try {
          request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
        } catch (err) {
          const isQuota = (err as Error)?.name === 'QuotaExceededError';
          dispatchStorageWarning(isQuota ? 'Storage quota exceeded' : 'Transaction failed', isQuota);
          settle(null);
          return;
        }

        request.onsuccess = () => settle(request.result as T);
        request.onerror = () => {
          const error = request.error;
          const isQuota = error?.name === 'QuotaExceededError';
          dispatchStorageWarning(isQuota ? 'Storage quota exceeded' : (error?.message || 'Storage write failed'), isQuota);
          settle(null);
        };
      }),
  );

/** Records the workspace so the next visit to the route can rebuild it. */
export const saveWorkspace = (
  project: MultiFileProject,
  returnTo: StoredWorkspace['returnTo'],
): Promise<boolean> =>
  enqueue(async () => {
    const record: StoredWorkspace = {
      projectType: project.projectType,
      files: project.files,
      entry: project.entry,
      returnTo: returnTo ?? null,
      savedAt: Date.now(),
    };
    const result = await withStore('readwrite', (store) => store.put(record, RECORD_KEY));
    return result !== null;
  });

/**
 * Reads the stored workspace back, or `null` when there is nothing usable.
 *
 * Validates data integrity: corrupt records or malformed file objects are
 * rejected or sanitized rather than breaking the editor during initialization.
 */
export const loadWorkspace = (): Promise<StoredWorkspace | null> =>
  enqueue(() => withStore<StoredWorkspace>('readonly', (store) => store.get(RECORD_KEY))).then(
    (record) => {
      if (!record || !Array.isArray(record.files)) return null;

      // Filter out any corrupted or incomplete file records
      const validFiles = record.files.filter(
        (file): file is ProjectFile =>
          Boolean(file) &&
          typeof file.path === 'string' &&
          typeof file.content === 'string' &&
          file.path.trim().length > 0,
      );

      if (validFiles.length === 0) return null;

      return {
        ...record,
        files: validFiles,
      };
    },
  );

/** Forgets the workspace. Called on exit, so a refresh does not reopen it. */
export const clearWorkspace = (): Promise<void> =>
  enqueue(async () => {
    await withStore('readwrite', (store) => store.delete(RECORD_KEY));
    try {
      window.localStorage.removeItem(VIEW_STATE_KEY);
    } catch {
      // Nothing to do: the record that matters is already gone.
    }
  });

export interface WorkspaceViewState {
  openPaths: string[];
  activePath: string | null;
}

const EMPTY_VIEW_STATE: WorkspaceViewState = { openPaths: [], activePath: null };

export const readViewState = (): WorkspaceViewState => {
  try {
    const raw = window.localStorage.getItem(VIEW_STATE_KEY);
    if (!raw) return EMPTY_VIEW_STATE;

    const parsed = JSON.parse(raw) as Partial<WorkspaceViewState>;
    return {
      openPaths: Array.isArray(parsed.openPaths)
        ? parsed.openPaths.filter((path): path is string => typeof path === 'string')
        : [],
      activePath: typeof parsed.activePath === 'string' ? parsed.activePath : null,
    };
  } catch {
    return EMPTY_VIEW_STATE;
  }
};

export const writeViewState = (state: WorkspaceViewState): void => {
  try {
    window.localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(state));
  } catch {
    // Remembering the tab layout is a convenience; failing to must not interrupt
    // editing.
  }
};

/**
 * Drops remembered paths the project no longer contains.
 *
 * The tab set has to be re-validated against the files that actually came back:
 * a project can change between visits, and a tab pointing at a missing file
 * renders an empty editor that looks broken.
 */
export const reconcileViewState = (
  state: WorkspaceViewState,
  files: ProjectFile[],
): WorkspaceViewState => {
  const known = new Set(files.map((file) => file.path));
  const openPaths = state.openPaths.filter((path) => known.has(path));
  const activePath =
    state.activePath && openPaths.includes(state.activePath)
      ? state.activePath
      : (openPaths[0] ?? null);

  return { openPaths, activePath };
};
