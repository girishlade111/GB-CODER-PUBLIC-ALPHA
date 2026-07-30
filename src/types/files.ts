/**
 * Multi-file project model.
 *
 * This is the source of truth for project contents. Plain HTML/CSS/JS projects
 * are represented in exactly the same structure as React/Vue ones — they simply
 * hold three fixed files. That lets every existing feature (export, templates,
 * snippets, stats, validation, AI) keep reading a plain `html`/`css`/
 * `javascript` triple which is derived from these files, so nothing had to be
 * rewritten to gain multi-file support.
 */

/** Project modes. `plain` is the default, zero-setup experience. */
export type ProjectType = 'plain' | 'react' | 'vue';

/**
 * Languages a project file can hold. A superset of the editor's original
 * three-language union, since React/Vue projects introduce jsx/tsx/vue/json.
 */
export type FileLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'vue'
  | 'json';

export interface ProjectFile {
  /** Virtual path, always forward-slashed and without a leading slash. */
  path: string;
  content: string;
  language: FileLanguage;
}

export interface MultiFileProject {
  projectType: ProjectType;
  files: ProjectFile[];
  /** Module entry point. Unused by plain projects. */
  entry?: string;
  /**
   * Manual version pins by package name, e.g. `{ axios: '1.6.0' }`.
   *
   * Lets a version be fixed before the import is even written, and overrides the
   * default `latest` when a specifier carries no explicit version. A version
   * written inline in code still wins over a pin.
   */
  dependencies?: Record<string, string>;
}

/** Fixed paths that back the three original editors in plain mode. */
export const PLAIN_HTML_PATH = 'index.html';
export const PLAIN_CSS_PATH = 'style.css';
export const PLAIN_JS_PATH = 'script.js';

export const PLAIN_PATHS = [PLAIN_HTML_PATH, PLAIN_CSS_PATH, PLAIN_JS_PATH] as const;

const EXTENSION_LANGUAGE: Record<string, FileLanguage> = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  vue: 'vue',
  json: 'json',
};

/** File extensions the user is allowed to create, per project type. */
export const ALLOWED_EXTENSIONS: Record<ProjectType, string[]> = {
  plain: ['html', 'css', 'js'],
  react: ['jsx', 'tsx', 'js', 'ts', 'css', 'json', 'html'],
  vue: ['vue', 'js', 'ts', 'css', 'json', 'html'],
};

export const getExtension = (path: string): string => {
  const base = path.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  return dot === -1 ? '' : base.slice(dot + 1).toLowerCase();
};

/** Infers a file's language from its extension, defaulting to JavaScript. */
export const languageForPath = (path: string): FileLanguage =>
  EXTENSION_LANGUAGE[getExtension(path)] ?? 'javascript';

/** Languages that Monaco should highlight using a different id than our own. */
export const monacoLanguageFor = (language: FileLanguage): string => {
  switch (language) {
    case 'jsx':
      return 'javascript';
    case 'tsx':
    case 'typescript':
      return 'typescript';
    // Monaco has no Vue SFC grammar bundled; HTML is the closest usable match
    // since an SFC is template/script/style blocks.
    case 'vue':
      return 'html';
    case 'json':
      return 'json';
    default:
      return language;
  }
};

/** True when the file participates in the JS module graph. */
export const isScriptFile = (language: FileLanguage): boolean =>
  language === 'javascript' ||
  language === 'typescript' ||
  language === 'jsx' ||
  language === 'tsx' ||
  language === 'vue';

// ─── Path helpers ─────────────────────────────────────────────────────────────

export const normalizePath = (path: string): string =>
  path.trim().replace(/\\/g, '/').replace(/^\.?\//, '').replace(/\/+/g, '/');

export interface PathValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a user-entered file path. Deliberately strict: these paths become
 * virtual module specifiers for the bundler, so odd characters cause confusing
 * build failures rather than obvious UI errors.
 */
export const validateFilePath = (
  rawPath: string,
  projectType: ProjectType,
  existingPaths: string[],
  /** Path being renamed, which is allowed to collide with itself. */
  ignorePath?: string,
): PathValidationResult => {
  const path = normalizePath(rawPath);

  if (!path) return { valid: false, error: 'Enter a file name.' };
  if (path.endsWith('/')) return { valid: false, error: 'File name cannot end with "/".' };
  if (path.includes('..')) return { valid: false, error: 'File name cannot contain "..".' };
  if (!/^[a-zA-Z0-9._\-/]+$/.test(path)) {
    return { valid: false, error: 'Use only letters, numbers, dots, dashes, underscores and "/".' };
  }

  const extension = getExtension(path);
  if (!extension) return { valid: false, error: 'Include a file extension, e.g. .jsx' };

  const allowed = ALLOWED_EXTENSIONS[projectType];
  if (!allowed.includes(extension)) {
    return {
      valid: false,
      error: `.${extension} is not supported here. Allowed: ${allowed.map((e) => `.${e}`).join(', ')}`,
    };
  }

  if (existingPaths.some((p) => p !== ignorePath && p.toLowerCase() === path.toLowerCase())) {
    return { valid: false, error: `"${path}" already exists.` };
  }

  return { valid: true };
};

/** Plain mode's three files are structural and cannot be added to or removed. */
export const isFixedPath = (projectType: ProjectType, path: string): boolean =>
  projectType === 'plain' && (PLAIN_PATHS as readonly string[]).includes(path);

// ─── Read / write helpers ─────────────────────────────────────────────────────

export const findFile = (project: MultiFileProject, path: string): ProjectFile | undefined =>
  project.files.find((f) => f.path === path);

export const getFileContent = (project: MultiFileProject, path: string): string =>
  findFile(project, path)?.content ?? '';

/**
 * Returns a new project with `path` set to `content`. Creates the file when it
 * is missing so the plain-mode setters can never fail.
 */
export const setFileContent = (
  project: MultiFileProject,
  path: string,
  content: string,
): MultiFileProject => {
  const existing = findFile(project, path);

  if (!existing) {
    return {
      ...project,
      files: [...project.files, { path, content, language: languageForPath(path) }],
    };
  }

  if (existing.content === content) return project;

  return {
    ...project,
    files: project.files.map((f) => (f.path === path ? { ...f, content } : f)),
  };
};

export const addFile = (project: MultiFileProject, path: string, content = ''): MultiFileProject => {
  if (findFile(project, path)) return project;
  return {
    ...project,
    files: [...project.files, { path, content, language: languageForPath(path) }],
  };
};

export const deleteFile = (project: MultiFileProject, path: string): MultiFileProject => {
  if (isFixedPath(project.projectType, path)) return project;
  return { ...project, files: project.files.filter((f) => f.path !== path) };
};

export const renameFile = (
  project: MultiFileProject,
  fromPath: string,
  toPath: string,
): MultiFileProject => {
  if (isFixedPath(project.projectType, fromPath)) return project;
  if (!findFile(project, fromPath) || findFile(project, toPath)) return project;

  return {
    ...project,
    entry: project.entry === fromPath ? toPath : project.entry,
    files: project.files.map((f) =>
      f.path === fromPath ? { ...f, path: toPath, language: languageForPath(toPath) } : f,
    ),
  };
};

/** Files sorted for display: entry first, then folders/names alphabetically. */
export const sortedFiles = (project: MultiFileProject): ProjectFile[] =>
  [...project.files].sort((a, b) => {
    if (a.path === project.entry) return -1;
    if (b.path === project.entry) return 1;
    return a.path.localeCompare(b.path);
  });

// ─── Plain-mode compatibility bridge ─────────────────────────────────────────

export interface CodeTriple {
  html: string;
  css: string;
  javascript: string;
}

/** Builds a plain project from the legacy three-value triple. */
export const createPlainProject = (html: string, css: string, javascript: string): MultiFileProject => ({
  projectType: 'plain',
  files: [
    { path: PLAIN_HTML_PATH, content: html, language: 'html' },
    { path: PLAIN_CSS_PATH, content: css, language: 'css' },
    { path: PLAIN_JS_PATH, content: javascript, language: 'javascript' },
  ],
});

/**
 * Projects the file list back down to the legacy triple.
 *
 * For plain projects this is a direct read of the three fixed files. For
 * framework projects there is no single html/css/js, so we return the closest
 * honest approximation: any index.html, all stylesheets concatenated, and an
 * empty script (the real script is the bundler's output, not a source file).
 * This keeps export/stats/validation working instead of crashing on undefined.
 */
export const projectToTriple = (project: MultiFileProject): CodeTriple => {
  if (project.projectType === 'plain') {
    return {
      html: getFileContent(project, PLAIN_HTML_PATH),
      css: getFileContent(project, PLAIN_CSS_PATH),
      javascript: getFileContent(project, PLAIN_JS_PATH),
    };
  }

  const css = project.files
    .filter((f) => f.language === 'css')
    .map((f) => `/* ${f.path} */\n${f.content}`)
    .join('\n\n');

  return {
    html: getFileContent(project, PLAIN_HTML_PATH),
    css,
    javascript: '',
  };
};

// ─── Scaffolds ────────────────────────────────────────────────────────────────

const REACT_MAIN = `import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
`;

const REACT_APP = `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <h1>Hello from React</h1>
      <p>Edit App.jsx and the preview updates automatically.</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </button>
    </div>
  );
}
`;

const SHARED_CSS = `:root {
  --accent: #7c3aed;
  --surface: #18181b;
  --stroke: #27272a;
  --text: #fafafa;
  --text-muted: #a1a1aa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #0a0a0a;
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.card {
  max-width: 380px;
  padding: 32px;
  border: 1px solid var(--stroke);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.2;
}

p {
  margin: 0 0 24px;
  color: var(--text-muted);
  font-size: 14px;
}

button {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 120ms ease-out;
}

button:hover {
  filter: brightness(1.12);
}
`;

const VUE_MAIN = `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
`;

const VUE_APP = `<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div class="card">
    <h1>Hello from Vue</h1>
    <p>Edit App.vue and the preview updates automatically.</p>
    <button type="button" @click="count++">
      Clicked {{ count }} {{ count === 1 ? 'time' : 'times' }}
    </button>
  </div>
</template>
`;

/** Creates a starter project for the given type. */
export const createProjectOfType = (
  projectType: ProjectType,
  plainDefaults?: CodeTriple,
): MultiFileProject => {
  if (projectType === 'react') {
    return {
      projectType: 'react',
      entry: 'main.jsx',
      files: [
        { path: 'main.jsx', content: REACT_MAIN, language: 'jsx' },
        { path: 'App.jsx', content: REACT_APP, language: 'jsx' },
        { path: 'index.css', content: SHARED_CSS, language: 'css' },
      ],
    };
  }

  if (projectType === 'vue') {
    return {
      projectType: 'vue',
      entry: 'main.js',
      files: [
        { path: 'main.js', content: VUE_MAIN, language: 'javascript' },
        { path: 'App.vue', content: VUE_APP, language: 'vue' },
        { path: 'style.css', content: SHARED_CSS, language: 'css' },
      ],
    };
  }

  return createPlainProject(
    plainDefaults?.html ?? '',
    plainDefaults?.css ?? '',
    plainDefaults?.javascript ?? '',
  );
};

/** The DOM node id a framework app mounts into, per project type. */
export const MOUNT_ELEMENT_ID: Record<Exclude<ProjectType, 'plain'>, string> = {
  react: 'root',
  vue: 'app',
};

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  plain: 'Plain HTML/CSS/JS',
  react: 'React',
  vue: 'Vue',
};
