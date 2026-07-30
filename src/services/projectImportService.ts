/**
 * Import pipeline: loose files, .zip archives, and remote URLs / GitHub Gists.
 *
 * Produces a `MultiFileProject` (or a partial file list) rather than poking at
 * the three legacy editors directly, so a React/Vue project round-trips through
 * export → import intact. The previous importer only understood .html/.css/.js
 * and silently dropped everything else.
 */

import {
  FileLanguage,
  MultiFileProject,
  PLAIN_CSS_PATH,
  PLAIN_HTML_PATH,
  PLAIN_JS_PATH,
  ProjectFile,
  ProjectType,
  createPlainProject,
  getExtension,
  languageForPath,
  normalizePath,
} from '../types/files';

/** Per-file cap. Generous enough for real projects, small enough to stay responsive. */
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
/** Cap on a whole archive, to avoid unzipping something pathological. */
export const MAX_ARCHIVE_BYTES = 20 * 1024 * 1024;
export const MAX_ARCHIVE_ENTRIES = 300;

const IMPORTABLE_EXTENSIONS = new Set([
  'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'vue', 'json', 'md', 'txt',
]);

/** Paths that are noise in an exported project and should never be imported. */
const IGNORED_PATH_PATTERN =
  /(^|\/)(node_modules|\.git|dist|build|\.next|coverage|__MACOSX)(\/|$)|(^|\/)\.DS_Store$/i;

export interface ImportWarning {
  file: string;
  reason: string;
}

export interface ImportResult {
  /** Files that were accepted, with normalised paths. */
  files: ProjectFile[];
  /** Detected project type, inferred from the file mix. */
  projectType: ProjectType;
  /** Entry module for framework projects. */
  entry?: string;
  warnings: ImportWarning[];
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Infers the project type from the imported file set.
 *
 * A `.vue` file is decisive. Otherwise jsx/tsx implies React. Everything else is
 * treated as a plain project, which is the safe default: it keeps the familiar
 * three-panel editor rather than dropping the user into a framework mode their
 * files cannot satisfy.
 */
export const inferProjectType = (paths: string[]): ProjectType => {
  const extensions = paths.map((path) => getExtension(path));
  if (extensions.includes('vue')) return 'vue';
  if (extensions.includes('jsx') || extensions.includes('tsx')) return 'react';
  return 'plain';
};

const ENTRY_PREFERENCE = ['main', 'index', 'app'];

/** Picks the most plausible module entry from an imported framework project. */
export const inferEntry = (paths: string[], projectType: ProjectType): string | undefined => {
  if (projectType === 'plain') return undefined;

  const scripts = paths.filter((path) =>
    ['js', 'jsx', 'ts', 'tsx'].includes(getExtension(path)),
  );
  if (scripts.length === 0) return undefined;

  // Prefer shallow files named main/index/app, in that order.
  const scored = scripts
    .map((path) => {
      const base = (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase();
      const nameRank = ENTRY_PREFERENCE.indexOf(base);
      return { path, nameRank: nameRank === -1 ? ENTRY_PREFERENCE.length : nameRank, depth: path.split('/').length };
    })
    .sort((a, b) => a.nameRank - b.nameRank || a.depth - b.depth || a.path.localeCompare(b.path));

  return scored[0]?.path;
};

/**
 * Strips a common leading directory shared by every entry.
 *
 * Exported archives (and GitHub downloads) wrap everything in a folder; without
 * this, importing one would produce `my-project/src/App.jsx` paths that no
 * relative import resolves against.
 */
export const stripCommonPrefix = (paths: string[]): string[] => {
  if (paths.length === 0) return paths;

  const segmentLists = paths.map((path) => path.split('/'));
  if (segmentLists.some((segments) => segments.length < 2)) return paths;

  const firstSegment = segmentLists[0][0];
  if (!segmentLists.every((segments) => segments[0] === firstSegment)) return paths;

  const stripped = segmentLists.map((segments) => segments.slice(1).join('/'));
  // Recurse in case the archive nests several redundant levels.
  return stripCommonPrefix(stripped);
};

/**
 * Removes a `src/` wrapper so an exported framework project re-imports with the
 * same paths it had in the editor (export writes sources under `src/`).
 */
const unwrapSrcDirectory = (files: ProjectFile[]): ProjectFile[] => {
  const sourceFiles = files.filter((file) => file.path.startsWith('src/'));
  if (sourceFiles.length === 0) return files;

  // Only unwrap when src/ holds all the code; scaffolding files stay behind.
  const scaffolding = new Set(['index.html', 'package.json', 'vite.config.js', 'README.md', '.gitignore']);
  const outside = files.filter(
    (file) => !file.path.startsWith('src/') && !scaffolding.has(file.path),
  );
  if (outside.length > 0) return files;

  return sourceFiles.map((file) => ({ ...file, path: file.path.slice('src/'.length) }));
};

// ─── Loose file import ────────────────────────────────────────────────────────

const validateEntry = (path: string, size: number): string | null => {
  if (IGNORED_PATH_PATTERN.test(path)) return 'Skipped build or metadata file';
  const extension = getExtension(path);
  if (!extension) return 'No file extension';
  if (!IMPORTABLE_EXTENSIONS.has(extension)) return `Unsupported file type (.${extension})`;
  if (size > MAX_FILE_BYTES) return `Too large (max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB)`;
  return null;
};

/** Reads a FileList (or array) of loose files into project files. */
export const importFromFiles = async (files: File[]): Promise<ImportResult> => {
  const accepted: ProjectFile[] = [];
  const warnings: ImportWarning[] = [];

  for (const file of files) {
    // webkitRelativePath is populated for folder imports and preserves structure.
    const rawPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    const path = normalizePath(rawPath);

    const problem = validateEntry(path, file.size);
    if (problem) {
      warnings.push({ file: path, reason: problem });
      continue;
    }

    const content = await file.text();
    accepted.push({ path, content, language: languageForPath(path) });
  }

  return finalizeImport(accepted, warnings);
};

// ─── ZIP import ───────────────────────────────────────────────────────────────

/** Extracts a .zip into project files. */
export const importFromZip = async (archive: File | Blob): Promise<ImportResult> => {
  if (archive.size > MAX_ARCHIVE_BYTES) {
    throw new Error(
      `Archive is too large (max ${Math.round(MAX_ARCHIVE_BYTES / 1024 / 1024)} MB).`,
    );
  }

  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(archive);

  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.length === 0) throw new Error('The archive is empty.');
  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error(`Archive has too many files (max ${MAX_ARCHIVE_ENTRIES}).`);
  }

  const accepted: ProjectFile[] = [];
  const warnings: ImportWarning[] = [];

  for (const entry of entries) {
    const path = normalizePath(entry.name);
    const problem = validateEntry(path, 0);
    if (problem) {
      warnings.push({ file: path, reason: problem });
      continue;
    }

    const content = await entry.async('string');
    if (content.length > MAX_FILE_BYTES) {
      warnings.push({ file: path, reason: 'Too large' });
      continue;
    }
    accepted.push({ path, content, language: languageForPath(path) });
  }

  if (accepted.length === 0) {
    throw new Error('No importable files found in the archive.');
  }

  return finalizeImport(accepted, warnings);
};

// ─── URL / Gist import ────────────────────────────────────────────────────────

/**
 * Rewrites common "page" URLs to their raw equivalents.
 *
 * Users paste the URL they are looking at, not the raw one, so a GitHub blob or
 * Gist page would otherwise import a page of HTML instead of the file.
 */
export const toRawUrl = (input: string): { url: string; kind: 'gist' | 'github' | 'raw' } => {
  const url = input.trim();

  // https://gist.github.com/user/<id>  ->  Gist API
  const gist = url.match(/^https?:\/\/gist\.github\.com\/(?:[^/]+\/)?([0-9a-f]+)/i);
  if (gist) return { url: `https://api.github.com/gists/${gist[1]}`, kind: 'gist' };

  // https://github.com/o/r/blob/ref/path -> raw.githubusercontent.com
  const blob = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
  if (blob) {
    return {
      url: `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`,
      kind: 'github',
    };
  }

  return { url, kind: 'raw' };
};

/** Derives a filename from a URL path, falling back to a language guess. */
const filenameFromUrl = (url: string): string => {
  try {
    const { pathname } = new URL(url);
    const base = pathname.split('/').filter(Boolean).pop() ?? '';
    return getExtension(base) ? base : '';
  } catch {
    return '';
  }
};

interface GistResponse {
  files?: Record<string, { filename?: string; content?: string; truncated?: boolean }>;
}

/**
 * Fetches a single file or a whole Gist.
 *
 * Requires the remote to send permissive CORS headers; raw.githubusercontent.com
 * and the Gist API both do. Anything else fails with an explicit message rather
 * than an opaque network error.
 */
export const importFromUrl = async (rawInput: string): Promise<ImportResult> => {
  if (!rawInput.trim()) throw new Error('Enter a URL.');

  let parsed: URL;
  try {
    parsed = new URL(rawInput.trim());
  } catch {
    throw new Error('That does not look like a valid URL.');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are supported.');
  }

  const { url, kind } = toRawUrl(rawInput);

  let response: Response;
  try {
    response = await fetch(url, { redirect: 'follow' });
  } catch {
    throw new Error(
      'Could not fetch that URL. The server may not allow cross-origin requests (CORS).',
    );
  }

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'Not found (404). Check the URL.'
        : `Fetch failed with status ${response.status}.`,
    );
  }

  // ── Gist: many files in one response ──
  if (kind === 'gist') {
    const gist = (await response.json()) as GistResponse;
    const gistFiles = Object.values(gist.files ?? {});
    if (gistFiles.length === 0) throw new Error('That Gist has no files.');

    const accepted: ProjectFile[] = [];
    const warnings: ImportWarning[] = [];

    for (const file of gistFiles) {
      const path = normalizePath(file.filename ?? '');
      if (!path) continue;
      if (file.truncated) {
        warnings.push({ file: path, reason: 'File was truncated by the Gist API' });
      }
      const problem = validateEntry(path, 0);
      if (problem) {
        warnings.push({ file: path, reason: problem });
        continue;
      }
      accepted.push({ path, content: file.content ?? '', language: languageForPath(path) });
    }

    if (accepted.length === 0) throw new Error('No importable files in that Gist.');
    return finalizeImport(accepted, warnings);
  }

  // ── Single file ──
  const content = await response.text();
  if (!content.trim()) throw new Error('That file is empty.');

  const name = filenameFromUrl(url) || guessFilenameFromContent(content);
  const problem = validateEntry(name, byteLengthOf(content));
  if (problem) throw new Error(`${name}: ${problem}`);

  return finalizeImport(
    [{ path: name, content, language: languageForPath(name) }],
    [],
  );
};

const byteLengthOf = (text: string): number => new TextEncoder().encode(text).length;

/** Last-resort filename when the URL has no usable extension. */
const guessFilenameFromContent = (content: string): string => {
  const sample = content.slice(0, 500).toLowerCase();
  if (sample.includes('<!doctype html') || sample.includes('<html')) return PLAIN_HTML_PATH;
  if (/^[\s@.#a-z[]*\{/m.test(content.slice(0, 200))) return PLAIN_CSS_PATH;
  return PLAIN_JS_PATH;
};

// ─── Finalisation ─────────────────────────────────────────────────────────────

/** Normalises paths, infers type/entry, and unwraps export scaffolding. */
const finalizeImport = (files: ProjectFile[], warnings: ImportWarning[]): ImportResult => {
  if (files.length === 0) {
    return { files: [], projectType: 'plain', warnings };
  }

  // Collapse redundant leading folders from archive downloads.
  const strippedPaths = stripCommonPrefix(files.map((file) => file.path));
  let normalized = files.map((file, index) => ({ ...file, path: strippedPaths[index] }));
  normalized = unwrapSrcDirectory(normalized);

  const paths = normalized.map((file) => file.path);
  const projectType = inferProjectType(paths);

  return {
    files: normalized,
    projectType,
    entry: inferEntry(paths, projectType),
    warnings,
  };
};

// ─── Applying an import to a project ──────────────────────────────────────────

const PLAIN_TARGET_BY_LANGUAGE: Partial<Record<FileLanguage, string>> = {
  html: PLAIN_HTML_PATH,
  css: PLAIN_CSS_PATH,
  javascript: PLAIN_JS_PATH,
};

/**
 * Merges an import into a project.
 *
 * Plain imports map onto the three fixed panels so the familiar single-file
 * experience is preserved. Framework imports replace the file tree wholesale,
 * because a half-merged module graph would not build.
 */
export const applyImport = (
  current: MultiFileProject,
  result: ImportResult,
): { project: MultiFileProject; summary: string } => {
  if (result.files.length === 0) {
    return { project: current, summary: 'Nothing was imported.' };
  }

  if (result.projectType === 'plain') {
    const triple = { html: '', css: '', javascript: '' };
    let matched = 0;

    for (const file of result.files) {
      const target = PLAIN_TARGET_BY_LANGUAGE[file.language];
      if (!target) continue;
      matched++;
      if (target === PLAIN_HTML_PATH) triple.html = file.content;
      if (target === PLAIN_CSS_PATH) triple.css = file.content;
      if (target === PLAIN_JS_PATH) triple.javascript = file.content;
    }

    if (matched === 0) {
      return { project: current, summary: 'No HTML, CSS or JS files were found.' };
    }

    // Keep panels the import did not supply, so importing only a stylesheet
    // does not blank the user's markup.
    const base = current.projectType === 'plain' ? current : createPlainProject('', '', '');
    return {
      project: createPlainProject(
        triple.html || getExistingPlain(base, PLAIN_HTML_PATH),
        triple.css || getExistingPlain(base, PLAIN_CSS_PATH),
        triple.javascript || getExistingPlain(base, PLAIN_JS_PATH),
      ),
      summary: `Imported ${matched} file${matched === 1 ? '' : 's'} into the editor.`,
    };
  }

  return {
    project: {
      projectType: result.projectType,
      files: result.files,
      entry: result.entry,
      dependencies: current.dependencies,
    },
    summary: `Imported ${result.files.length} files as a ${
      result.projectType === 'react' ? 'React' : 'Vue'
    } project.`,
  };
};

const getExistingPlain = (project: MultiFileProject, path: string): string =>
  project.files.find((file) => file.path === path)?.content ?? '';

/** True when the file looks like a ZIP archive. */
export const isZipFile = (file: File): boolean =>
  file.type === 'application/zip' ||
  file.type === 'application/x-zip-compressed' ||
  file.name.toLowerCase().endsWith('.zip');
