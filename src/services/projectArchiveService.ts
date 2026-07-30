/**
 * Unified export for both single-file and multi-file projects.
 *
 * Replaces three divergent ZIP implementations that previously disagreed about
 * folder layout, file naming and whether index.html even referenced the CSS/JS
 * (`utils/downloadUtils.downloadAsZip` wrote an index.html with no <link> or
 * <script> at all, producing an unstyled, inert page).
 *
 * Everything here is pure and client-side: file trees are built as plain data so
 * they can be asserted in tests, and only `createZipBlob` touches JSZip.
 */

import {
  MultiFileProject,
  PLAIN_CSS_PATH,
  PLAIN_HTML_PATH,
  PLAIN_JS_PATH,
  ProjectType,
  getFileContent,
  projectToTriple,
} from '../types/files';
import { detectDependencies } from './packageResolver';
import { ExternalLibrary } from './externalLibraryService';

/** A file destined for the archive. */
export interface ArchiveFile {
  path: string;
  content: string;
}

export interface ArchiveOptions {
  projectName?: string;
  externalLibraries?: ExternalLibrary[];
  /** Resolved versions from the bundler, used to write a real package.json. */
  resolvedVersions?: Record<string, string>;
}

export interface ZipProgress {
  /** 0-100. */
  percent: number;
  /** File currently being written, when known. */
  currentFile?: string;
}

const DEFAULT_PROJECT_NAME = 'gb-coder-project';

/** Filesystem-safe project name. */
export const sanitizeProjectName = (name: string | undefined): string => {
  const cleaned = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || DEFAULT_PROJECT_NAME;
};

// ─── External library tags ────────────────────────────────────────────────────

const libraryTags = (libraries: ExternalLibrary[] = []): { head: string; body: string } => {
  const head = libraries
    .filter((library) => library.type === 'css')
    .map((library) => `    <link rel="stylesheet" href="${library.url}">`)
    .join('\n');

  const body = libraries
    .filter((library) => library.type === 'js')
    .map((library) => `    <script src="${library.url}"></script>`)
    .join('\n');

  return { head, body };
};

/*
 * `</script>` inside a JS string would terminate the surrounding script tag
 * early, so it is split across a concatenation.
 */
const escapeClosingScript = (code: string): string =>
  code.replace(/<\/script>/gi, "</scr' + 'ipt>");

// ─── Standalone single-file HTML ──────────────────────────────────────────────

/**
 * Bundles a plain project into one self-contained .html file with inline
 * <style> and <script>. This is the "Export as HTML" output for single-file mode.
 */
export const buildStandaloneHtml = (
  project: MultiFileProject,
  options: ArchiveOptions = {},
): string => {
  const { html, css, javascript } = projectToTriple(project);
  const title = options.projectName ?? 'GB Coder Project';
  const tags = libraryTags(options.externalLibraries);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
${tags.head}
    <style>
${css}
    </style>
</head>
<body>
${html}
${tags.body}
    <script>
${escapeClosingScript(javascript)}
    </script>
</body>
</html>
`;
};

// ─── Linked multi-asset HTML (used inside plain ZIPs) ─────────────────────────

/**
 * index.html for a plain-project ZIP: references the sibling files rather than
 * inlining them, so the archive is an editable project instead of one blob.
 */
const buildLinkedHtml = (project: MultiFileProject, options: ArchiveOptions): string => {
  const { html } = projectToTriple(project);
  const title = options.projectName ?? 'GB Coder Project';
  const tags = libraryTags(options.externalLibraries);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
${tags.head}
    <link rel="stylesheet" href="./${PLAIN_CSS_PATH}">
</head>
<body>
${html}
${tags.body}
    <script src="./${PLAIN_JS_PATH}"></script>
</body>
</html>
`;
};

// ─── Framework scaffolding ────────────────────────────────────────────────────

/** Runtime dependency versions written into a generated package.json. */
const FRAMEWORK_DEPENDENCIES: Record<Exclude<ProjectType, 'plain'>, Record<string, string>> = {
  react: { react: '^18.3.1', 'react-dom': '^18.3.1' },
  vue: { vue: '^3.5.0' },
};

const FRAMEWORK_DEV_DEPENDENCIES: Record<Exclude<ProjectType, 'plain'>, Record<string, string>> = {
  react: { vite: '^5.4.0', '@vitejs/plugin-react': '^4.3.1' },
  vue: { vite: '^5.4.0', '@vitejs/plugin-vue': '^5.1.0' },
};

/**
 * Turns the project's CDN imports into real npm dependencies.
 *
 * Versions come from what the bundler actually resolved where available, so an
 * exported project pins the same versions the preview ran, rather than drifting
 * to whatever `latest` means later.
 */
const npmDependenciesFor = (
  project: MultiFileProject,
  resolvedVersions: Record<string, string> = {},
): Record<string, string> => {
  const framework = FRAMEWORK_DEPENDENCIES[project.projectType as Exclude<ProjectType, 'plain'>] ?? {};
  const dependencies: Record<string, string> = { ...framework };

  const caret = (version: string | undefined): string =>
    version && version !== 'latest' ? `^${version.replace(/^[\^~]/, '')}` : 'latest';

  // Manually pinned packages are declared intent, so they belong in the export
  // even if the import has not been written yet.
  for (const [name, version] of Object.entries(project.dependencies ?? {})) {
    dependencies[name] = caret(version);
  }

  for (const dependency of detectDependencies(project)) {
    const pinned = project.dependencies?.[dependency.name];
    const resolved = resolvedVersions[dependency.name];
    dependencies[dependency.name] = caret(dependency.requestedVersion ?? pinned ?? resolved);
  }

  return Object.fromEntries(Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)));
};

const buildPackageJson = (project: MultiFileProject, options: ArchiveOptions): string => {
  const projectType = project.projectType as Exclude<ProjectType, 'plain'>;

  return `${JSON.stringify(
    {
      name: sanitizeProjectName(options.projectName),
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: npmDependenciesFor(project, options.resolvedVersions),
      devDependencies: FRAMEWORK_DEV_DEPENDENCIES[projectType],
    },
    null,
    2,
  )}\n`;
};

const buildViteConfig = (projectType: Exclude<ProjectType, 'plain'>): string => {
  const plugin = projectType === 'react' ? 'react' : 'vue';
  const pkg = projectType === 'react' ? '@vitejs/plugin-react' : '@vitejs/plugin-vue';

  return `import { defineConfig } from 'vite';
import ${plugin} from '${pkg}';

export default defineConfig({
  plugins: [${plugin}()],
});
`;
};

/** Entry HTML for a Vite project, pointing at the module entry under src/. */
const buildViteIndexHtml = (
  project: MultiFileProject,
  entry: string,
  options: ArchiveOptions,
): string => {
  const mountId = project.projectType === 'react' ? 'root' : 'app';
  const title = options.projectName ?? 'GB Coder Project';
  const tags = libraryTags(options.externalLibraries);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
${tags.head}
</head>
<body>
    <div id="${mountId}"></div>
${tags.body}
    <script type="module" src="/src/${entry}"></script>
</body>
</html>
`;
};

const buildReadme = (project: MultiFileProject, options: ArchiveOptions): string => {
  const name = options.projectName ?? 'GB Coder Project';

  if (project.projectType === 'plain') {
    return `# ${name}

Exported from GB Coder.

## Files

- \`${PLAIN_HTML_PATH}\` — markup
- \`${PLAIN_CSS_PATH}\` — styles
- \`${PLAIN_JS_PATH}\` — behaviour

## Running it

Open \`${PLAIN_HTML_PATH}\` in any browser. No build step, no dependencies.
`;
  }

  return `# ${name}

A ${project.projectType === 'react' ? 'React' : 'Vue'} project exported from GB Coder,
scaffolded for [Vite](https://vitejs.dev).

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Notes

In GB Coder these packages were loaded from a CDN in the browser. This export
lists them as real npm dependencies, pinned to the versions the preview used
where they were known.
`;
};

// ─── File tree assembly ───────────────────────────────────────────────────────

/**
 * Builds the archive's file tree.
 *
 * Pure and synchronous so the layout can be asserted directly in tests without
 * unzipping anything.
 */
export const buildArchiveFiles = (
  project: MultiFileProject,
  options: ArchiveOptions = {},
): ArchiveFile[] => {
  if (project.projectType === 'plain') {
    return [
      { path: PLAIN_HTML_PATH, content: buildLinkedHtml(project, options) },
      { path: PLAIN_CSS_PATH, content: getFileContent(project, PLAIN_CSS_PATH) },
      { path: PLAIN_JS_PATH, content: getFileContent(project, PLAIN_JS_PATH) },
      { path: 'README.md', content: buildReadme(project, options) },
    ];
  }

  const projectType = project.projectType as Exclude<ProjectType, 'plain'>;
  const entry = project.entry ?? (projectType === 'react' ? 'main.jsx' : 'main.js');

  // Source files move under src/, matching the Vite convention the generated
  // package.json and index.html expect.
  const sourceFiles: ArchiveFile[] = project.files.map((file) => ({
    path: `src/${file.path}`,
    content: file.content,
  }));

  return [
    { path: 'index.html', content: buildViteIndexHtml(project, entry, options) },
    { path: 'package.json', content: buildPackageJson(project, options) },
    { path: 'vite.config.js', content: buildViteConfig(projectType) },
    { path: '.gitignore', content: 'node_modules\ndist\n.DS_Store\n' },
    { path: 'README.md', content: buildReadme(project, options) },
    ...sourceFiles,
  ];
};

// ─── Size estimation ──────────────────────────────────────────────────────────

const BYTES = ['B', 'KB', 'MB', 'GB'];

/** Human-readable byte count, e.g. `12.4 KB`. */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTES.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${BYTES[exponent]}`;
};

/** UTF-8 byte length of a string. */
export const byteLength = (text: string): number => new TextEncoder().encode(text).length;

export interface ExportSizeEstimate {
  /** Uncompressed total of every archive member. */
  rawBytes: number;
  /** Rough post-deflate estimate; text compresses to roughly a third. */
  zipBytes: number;
  htmlBytes: number;
  fileCount: number;
}

/**
 * Estimates export sizes without generating anything.
 *
 * The ZIP figure is an approximation (~35% of raw plus per-entry overhead) —
 * enough to warn about a large download, and labelled as approximate in the UI.
 */
export const estimateExportSize = (
  project: MultiFileProject,
  options: ArchiveOptions = {},
): ExportSizeEstimate => {
  const files = buildArchiveFiles(project, options);
  const rawBytes = files.reduce((sum, file) => sum + byteLength(file.content), 0);
  const perEntryOverhead = 100;

  return {
    rawBytes,
    zipBytes: Math.round(rawBytes * 0.35) + files.length * perEntryOverhead,
    htmlBytes: byteLength(buildStandaloneHtml(project, options)),
    fileCount: files.length,
  };
};

// ─── ZIP generation ───────────────────────────────────────────────────────────

/**
 * Creates the .zip archive.
 *
 * Progress is reported both while adding entries and from JSZip's own streaming
 * callback, so large projects show movement rather than freezing at 0%.
 */
export const createZipBlob = async (
  project: MultiFileProject,
  options: ArchiveOptions = {},
  onProgress?: (progress: ZipProgress) => void,
): Promise<Blob> => {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const files = buildArchiveFiles(project, options);

  files.forEach((file, index) => {
    zip.file(file.path, file.content);
    // Adding entries is the first half of the work; compression is the second.
    onProgress?.({
      percent: Math.round(((index + 1) / files.length) * 50),
      currentFile: file.path,
    });
  });

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (metadata) => {
    onProgress?.({
      percent: 50 + Math.round(metadata.percent / 2),
      currentFile: metadata.currentFile ?? undefined,
    });
  });
};

// ─── Download helpers ─────────────────────────────────────────────────────────

/** Triggers a browser download for a Blob or string. */
export const downloadBlob = (content: Blob | string, filename: string, mimeType?: string): void => {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType ?? 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoked on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const zipFilename = (projectName?: string): string => `${sanitizeProjectName(projectName)}.zip`;

export const htmlFilename = (projectName?: string): string =>
  `${sanitizeProjectName(projectName)}.html`;
