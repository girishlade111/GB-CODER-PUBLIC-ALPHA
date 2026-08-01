/**
 * Import engine — the lazy chunk.
 *
 * Everything expensive about importing lives behind this module's dynamic
 * import: JSZip, archive traversal, and project-type detection. Nothing here is
 * reachable from the initial bundle, so a user who never imports anything never
 * downloads any of it.
 *
 * The engine does its own archive scan rather than delegating wholesale to
 * `projectImportService.importFromZip`, because detection needs to see the *raw*
 * manifest. That importer filters to a set of editable extensions, which would
 * hide exactly the files that identify a full-stack project — `Dockerfile` has
 * no extension at all, and `docker-compose.yml` / `pyproject.toml` are not
 * editable types.
 */
import {
  DetectionResult,
  ManifestEntry,
  detectProject,
} from './projectDetection';
import {
  ImportResult,
  ImportWarning,
  MAX_FILE_BYTES,
  isZipFile,
  stripCommonPrefix,
} from '../projectImportService';
import {
  ProjectFile,
  ProjectType,
  getExtension,
  languageForPath,
  normalizePath,
} from '../../types/files';

/**
 * Archive ceiling. Raised from the importer's 20 MB to the 50 MB the product
 * spec calls for; anything larger is rejected before unzipping rather than
 * after, since decompression is where the memory goes.
 */
export const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;
/** Soft ceiling: beyond this we warn but still import. */
export const WARN_ARCHIVE_BYTES = 25 * 1024 * 1024;
/** Hard cap on entries actually loaded into the editor. */
export const MAX_IMPORT_ENTRIES = 1500;

/**
 * Directories that are build output or dependency caches.
 *
 * Skipped during traversal, so their contents are never decompressed, never
 * counted, and never pushed into the project. `npm install` regenerates
 * node_modules, and dist/build are derived artefacts.
 */
const SKIPPED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.cache',
  'coverage',
  '.turbo',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  '__MACOSX',
];

const SKIP_PATTERN = new RegExp(
  `(^|/)(${SKIPPED_DIRECTORIES.map((name) => name.replace('.', '\\.')).join('|')})(/|$)`,
  'i',
);

/** Junk files that carry no meaning. */
const JUNK_FILE_PATTERN = /(^|\/)(\.DS_Store|Thumbs\.db|npm-debug\.log|yarn-error\.log)$/i;

/** Extensions we can actually open in an editor panel. */
const EDITABLE_EXTENSIONS = new Set([
  // Front-end
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
  /*
   * Back-end sources. Omitting these meant a full-stack import silently dropped
   * every server file: detection could still see `app.py` in the manifest and
   * classify the project correctly, but the file itself was never imported, so
   * the editor opened a "Python project" containing no Python.
   */
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'php', 'cs', 'sh', 'bash', 'sql',
  'prisma', 'graphql', 'gql', 'proto',
  // Config and docs
  'json', 'jsonc', 'md', 'mdx', 'txt', 'svg', 'yml', 'yaml', 'toml', 'ini',
  'env', 'cfg', 'conf', 'lock', 'gitignore', 'dockerignore', 'editorconfig',
]);

/** Files without an extension that still matter for detection. */
const SIGNIFICANT_EXTENSIONLESS = new Set(['dockerfile', 'procfile', 'makefile', 'pipfile']);

/** Files whose contents detection actually reads. */
const DETECTION_CONTENT_FILES = /(^|\/)(package\.json|composer\.json|go\.mod|Cargo\.toml)$/i;

/** A file plus the path it should occupy in the project. */
export interface DroppedFile {
  path: string;
  file: File;
}

/**
 * What a drop handler collected. `entries` are unresolved `FileSystemEntry`
 * objects (typed loosely so the core bundle needs no DOM filesystem types).
 */
export interface DropInput {
  files?: File[];
  entries?: unknown[];
}

export interface SkippedGroup {
  /** Directory or pattern that was skipped, e.g. `node_modules`. */
  name: string;
  /** How many entries it accounted for. */
  entries: number;
}

export interface ImportPlan {
  detection: DetectionResult;
  /** Files ready to load into the editor. */
  result: ImportResult;
  /** Every path in the archive, before editability filtering. */
  manifest: string[];
  skipped: SkippedGroup[];
  warnings: ImportWarning[];
  /** Uncompressed size of everything kept. */
  totalBytes: number;
  /** Original archive or file-set size. */
  sourceBytes: number;
  sourceName: string;
}

export class ImportTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(
      `That archive is ${(bytes / 1024 / 1024).toFixed(1)} MB, over the ${
        MAX_ARCHIVE_BYTES / 1024 / 1024
      } MB limit. Remove build output and dependencies, or import the source folder directly.`,
    );
    this.name = 'ImportTooLargeError';
  }
}

/** True when a path lies inside a skipped directory or is junk. */
export const shouldSkipPath = (path: string): boolean =>
  SKIP_PATTERN.test(path) || JUNK_FILE_PATTERN.test(path);

/** Which skipped directory a path belongs to, for the summary. */
const skipReasonFor = (path: string): string => {
  const match = SKIP_PATTERN.exec(path);
  if (match) return match[2].toLowerCase();
  return 'junk files';
};

const isEditable = (path: string): boolean => {
  const extension = getExtension(path).toLowerCase();
  if (extension && EDITABLE_EXTENSIONS.has(extension)) return true;
  // Extensionless files like `Dockerfile` are worth keeping and are text.
  const base = path.split('/').pop()?.toLowerCase() ?? '';
  return SIGNIFICANT_EXTENSIONLESS.has(base);
};

const tally = (groups: Map<string, number>, key: string) =>
  groups.set(key, (groups.get(key) ?? 0) + 1);

const toSkippedGroups = (groups: Map<string, number>): SkippedGroup[] =>
  [...groups.entries()]
    .map(([name, entries]) => ({ name, entries }))
    .sort((a, b) => b.entries - a.entries);

/* ────────────────────────────────────────────────────────────────────────── */
/* ZIP                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Reads an archive into a plan.
 *
 * Skipped directories are filtered *before* `async('string')` is called, so
 * their bytes are never decompressed — the difference between ignoring
 * node_modules and merely discarding it afterwards.
 */
const planFromZip = async (archive: File): Promise<ImportPlan> => {
  if (archive.size > MAX_ARCHIVE_BYTES) throw new ImportTooLargeError(archive.size);

  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(archive);

  const warnings: ImportWarning[] = [];
  const skippedGroups = new Map<string, number>();
  const manifest: string[] = [];
  const candidates: { path: string; entry: import('jszip').JSZipObject }[] = [];

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (shouldSkipPath(relativePath)) {
      tally(skippedGroups, skipReasonFor(relativePath));
      return;
    }
    manifest.push(relativePath);
    candidates.push({ path: relativePath, entry });
  });

  if (archive.size > WARN_ARCHIVE_BYTES) {
    warnings.push({
      file: archive.name,
      reason: `Large archive (${(archive.size / 1024 / 1024).toFixed(1)} MB) — import may take a moment.`,
    });
  }

  // Common wrapper folder ("my-app/") is stripped so paths look natural.
  const stripped = stripCommonPrefix(manifest);
  const strippedByOriginal = new Map(manifest.map((path, index) => [path, stripped[index]]));

  const files: ProjectFile[] = [];
  const detectionEntries: ManifestEntry[] = [];
  let totalBytes = 0;

  for (const { path, entry } of candidates) {
    const normalizedPath = normalizePath(strippedByOriginal.get(path) ?? path);
    const editable = isEditable(path);
    const needsContent = editable || DETECTION_CONTENT_FILES.test(path);

    if (!needsContent) {
      // Binary or irrelevant: recorded in the manifest for detection, not read.
      detectionEntries.push({ path: normalizedPath });
      continue;
    }

    let content: string;
    try {
      content = await entry.async('string');
    } catch {
      warnings.push({ file: normalizedPath, reason: 'Could not be read.' });
      continue;
    }

    const bytes = new TextEncoder().encode(content).length;
    detectionEntries.push({ path: normalizedPath, content });

    if (!editable) continue;

    if (bytes > MAX_FILE_BYTES) {
      warnings.push({ file: normalizedPath, reason: 'Skipped: larger than 2 MB.' });
      continue;
    }
    if (files.length >= MAX_IMPORT_ENTRIES) {
      warnings.push({ file: normalizedPath, reason: 'Skipped: import entry limit reached.' });
      continue;
    }

    totalBytes += bytes;
    files.push({ path: normalizedPath, content, language: languageForPath(normalizedPath) });
  }

  const detection = detectProject(detectionEntries);

  return {
    detection,
    result: {
      files,
      projectType: projectTypeFor(detection),
      entry: detection.entry,
      warnings,
    },
    manifest: stripped,
    skipped: toSkippedGroups(skippedGroups),
    warnings,
    totalBytes,
    sourceBytes: archive.size,
    sourceName: archive.name,
  };
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Loose files / folders                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Reads dropped files. A dropped folder arrives as a flat file list whose
 * `webkitRelativePath` carries the structure, so folders and multi-file
 * selections take the same path.
 */
const planFromFiles = async (
  input: DroppedFile[],
  sourceName: string,
): Promise<ImportPlan> => {
  const sourceBytes = input.reduce((total, item) => total + item.file.size, 0);
  if (sourceBytes > MAX_ARCHIVE_BYTES) throw new ImportTooLargeError(sourceBytes);

  const warnings: ImportWarning[] = [];
  const skippedGroups = new Map<string, number>();
  const kept: DroppedFile[] = [];

  for (const item of input) {
    if (shouldSkipPath(item.path)) {
      tally(skippedGroups, skipReasonFor(item.path));
      continue;
    }
    kept.push(item);
  }

  const stripped = stripCommonPrefix(kept.map((item) => item.path));

  const files: ProjectFile[] = [];
  const detectionEntries: ManifestEntry[] = [];
  let totalBytes = 0;

  for (const [index, item] of kept.entries()) {
    const normalizedPath = normalizePath(stripped[index]);
    const editable = isEditable(item.path);
    const needsContent = editable || DETECTION_CONTENT_FILES.test(item.path);

    if (!needsContent) {
      detectionEntries.push({ path: normalizedPath });
      continue;
    }

    if (item.file.size > MAX_FILE_BYTES) {
      warnings.push({ file: normalizedPath, reason: 'Skipped: larger than 2 MB.' });
      detectionEntries.push({ path: normalizedPath });
      continue;
    }

    const content = await item.file.text();
    detectionEntries.push({ path: normalizedPath, content });
    if (!editable) continue;

    totalBytes += item.file.size;
    files.push({ path: normalizedPath, content, language: languageForPath(normalizedPath) });
  }

  const detection = detectProject(detectionEntries);

  return {
    detection,
    result: {
      files,
      projectType: projectTypeFor(detection),
      entry: detection.entry,
      warnings,
    },
    manifest: stripped,
    skipped: toSkippedGroups(skippedGroups),
    warnings,
    totalBytes,
    sourceBytes,
    sourceName,
  };
};

/**
 * Editor project type for a detection result.
 *
 * Full-stack maps to `plain` only as a container: nothing opens it, the UI shows
 * the "advanced mode coming" notice instead.
 */
const projectTypeFor = (detection: DetectionResult): ProjectType => {
  if (detection.kind === 'react') return 'react';
  if (detection.kind === 'vue') return 'vue';
  return 'plain';
};

/**
 * Single entry point for every drop.
 *
 * Accepts one zip, a folder, or loose files and returns a plan for the UI to
 * confirm. Nothing is applied to the project here — the user gets to see and
 * correct the detection first.
 */
export const buildImportPlan = async (input: DropInput): Promise<ImportPlan> => {
  /*
   * Directory entries are expanded here rather than in the drop handler: the
   * traversal is import logic and belongs in this chunk. `FileSystemEntry`
   * objects stay valid across an await, unlike `DataTransferItem`, which is why
   * the caller may hand them over unresolved.
   */
  const fromEntries = await flattenEntries(input.entries ?? []);
  const fromFiles: DroppedFile[] = (input.files ?? []).map((file) => ({
    path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
    file,
  }));

  /*
   * Deduplicated by path. `collectTransfer` is careful to put a given file in
   * exactly one of the two lists, but a duplicate here is silent and expensive —
   * it inflates the file count shown to the user and, when a lone archive is
   * duplicated, defeats the single-archive check below. Belt and braces.
   */
  const all: DroppedFile[] = [];
  const seen = new Set<string>();
  for (const item of [...fromEntries, ...fromFiles]) {
    const key = `${item.path}\u0000${item.file.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(item);
  }

  if (all.length === 0) {
    throw new Error('Nothing importable was found in that folder, file or archive.');
  }

  // A lone archive is the common case and takes the zip path.
  if (all.length === 1 && isZipFile(all[0].file)) return planFromZip(all[0].file);

  const rootFolder = all[0].path.includes('/') ? all[0].path.split('/')[0] : null;
  const sourceName =
    rootFolder ?? (all.length === 1 ? all[0].file.name : `${all.length} files`);

  return planFromFiles(all, sourceName);
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Directory traversal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/** Depth limit, so a pathological tree cannot recurse forever. */
const MAX_TRAVERSAL_DEPTH = 12;

const readDirectory = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> =>
  new Promise((resolve) => {
    reader.readEntries(
      (batch) => resolve(batch),
      () => resolve([]),
    );
  });

const entryToFile = (entry: FileSystemFileEntry): Promise<File | null> =>
  new Promise((resolve) => {
    entry.file(
      (file) => resolve(file),
      () => resolve(null),
    );
  });

/**
 * Flattens dropped directory entries into files with their relative paths.
 *
 * `readEntries` returns at most 100 entries per call and must be drained in a
 * loop until it yields an empty batch — reading it once silently truncates large
 * folders, which is a classic source of "some files went missing" bugs.
 */
export const flattenEntries = async (
  entries: unknown[],
  depth = 0,
  prefix = '',
): Promise<DroppedFile[]> => {
  if (depth > MAX_TRAVERSAL_DEPTH) return [];

  const collected: DroppedFile[] = [];

  for (const raw of entries) {
    const entry = raw as FileSystemEntry | null;
    if (!entry) continue;

    const path = prefix ? `${prefix}/${entry.name}` : entry.name;

    // Prune whole directories before descending into them.
    if (shouldSkipPath(path)) continue;

    if (entry.isFile) {
      const file = await entryToFile(entry as FileSystemFileEntry);
      if (file) collected.push({ path, file });
      continue;
    }

    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const children: FileSystemEntry[] = [];
      for (;;) {
        const batch = await readDirectory(reader);
        if (batch.length === 0) break;
        children.push(...batch);
      }
      collected.push(...(await flattenEntries(children, depth + 1, path)));
    }
  }

  return collected;
};

export type { DetectionResult } from './projectDetection';
export { KIND_LABEL, OVERRIDE_OPTIONS, projectTypeForKind } from './projectDetection';
