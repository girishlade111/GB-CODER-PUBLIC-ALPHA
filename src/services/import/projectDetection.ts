/**
 * Project-type detection.
 *
 * Lives behind a dynamic import and is only reached from the import engine, so
 * none of this reaches the initial bundle. Pure and synchronous: it takes a
 * manifest of paths (plus the contents of the few files that actually carry
 * signal) and returns a classification with its reasoning, so the UI can show
 * *why* it guessed and let the user override it.
 */
import { ProjectType } from '../../types/files';

export type DetectedProjectKind = 'simple' | 'react' | 'vue' | 'fullstack';

/** A single piece of evidence, shown to the user in the override dialog. */
export interface DetectionSignal {
  label: string;
  detail: string;
}

export interface DetectionResult {
  kind: DetectedProjectKind;
  /** Rough certainty, used to decide how loudly to offer the override. */
  confidence: 'high' | 'medium' | 'low';
  signals: DetectionSignal[];
  /** Best guess at the entry file to open once imported. */
  entry?: string;
  /**
   * True for full-stack projects, which need the editor mode that does not exist
   * yet. Detection flags them; nothing tries to open them.
   */
  requiresAdvancedMode: boolean;
}

/** One manifest entry. `content` is only needed for files that carry signal. */
export interface ManifestEntry {
  path: string;
  content?: string;
}

/**
 * Dependencies that mean a server is part of the project.
 *
 * Matched against both `dependencies` and `devDependencies`, because a project
 * with `nodemon` + `express` in dev deps is still full-stack.
 */
const BACKEND_DEPENDENCIES = [
  'express',
  'fastify',
  'koa',
  'hapi',
  '@hapi/hapi',
  '@nestjs/core',
  '@nestjs/common',
  'nest',
  'apollo-server',
  '@apollo/server',
  'mongoose',
  'prisma',
  '@prisma/client',
  'sequelize',
  'typeorm',
  'pg',
  'mysql',
  'mysql2',
  'socket.io',
  'ws',
  'passport',
  'jsonwebtoken',
];

/** Files that mean a non-JS backend or a container build is involved. */
const BACKEND_FILE_PATTERNS: { pattern: RegExp; label: string; detail: string }[] = [
  {
    pattern: /(^|\/)requirements\.txt$/i,
    label: 'Python dependencies',
    detail: 'requirements.txt is present, so this project has a Python backend.',
  },
  {
    pattern: /(^|\/)pyproject\.toml$/i,
    label: 'Python project',
    detail: 'pyproject.toml is present, so this project has a Python backend.',
  },
  {
    pattern: /(^|\/)Pipfile$/i,
    label: 'Python dependencies',
    detail: 'A Pipfile is present, so this project has a Python backend.',
  },
  {
    pattern: /(^|\/)Dockerfile$/i,
    label: 'Container build',
    detail: 'A Dockerfile is present, so this project expects a container runtime.',
  },
  {
    pattern: /(^|\/)docker-compose\.ya?ml$/i,
    label: 'Multi-service setup',
    detail: 'docker-compose defines services that cannot run in the browser.',
  },
  {
    pattern: /(^|\/)(go\.mod|Cargo\.toml|composer\.json|Gemfile|pom\.xml|build\.gradle)$/i,
    label: 'Non-JavaScript backend',
    detail: 'A backend manifest for another language is present.',
  },
];

/** Server entry points that sit alongside a client folder. */
const SERVER_FILE_PATTERN =
  /(^|\/)(server|api|backend)(\/|\.)|(^|\/)(server|app|index)\.(js|ts|mjs|cjs)$/i;
const CLIENT_FOLDER_PATTERN = /(^|\/)(client|frontend|web|public|src)\//i;

/** Next.js API routes make an otherwise-React project full-stack. */
const NEXT_API_PATTERN = /(^|\/)(pages|app|src\/pages|src\/app)\/api\//i;

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  main?: string;
}

/** Parses package.json defensively; a malformed one must not throw. */
export const parsePackageJson = (content: string | undefined): PackageManifest | null => {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === 'object' && parsed !== null ? (parsed as PackageManifest) : null;
  } catch {
    return null;
  }
};

const allDependencies = (manifest: PackageManifest | null): Record<string, string> => ({
  ...(manifest?.dependencies ?? {}),
  ...(manifest?.devDependencies ?? {}),
});

const hasExtension = (paths: string[], extensions: string[]): boolean =>
  paths.some((path) => extensions.some((extension) => path.toLowerCase().endsWith(extension)));

/**
 * Classifies a project.
 *
 * Order matters: full-stack is checked first because it is the most specific
 * and the most consequential to get wrong — silently loading a project whose
 * server half cannot run would leave the user debugging a broken app rather
 * than being told the truth.
 */
export const detectProject = (entries: ManifestEntry[]): DetectionResult => {
  const paths = entries.map((entry) => entry.path.replace(/^\.\//, ''));
  const lowerPaths = paths.map((path) => path.toLowerCase());
  const signals: DetectionSignal[] = [];

  const packageEntry = entries.find((entry) => /(^|\/)package\.json$/i.test(entry.path));
  const manifest = parsePackageJson(packageEntry?.content);
  const dependencies = allDependencies(manifest);
  const dependencyNames = Object.keys(dependencies);

  /* ── Full-stack ─────────────────────────────────────────────────────── */

  const backendDeps = BACKEND_DEPENDENCIES.filter((name) => dependencyNames.includes(name));
  if (backendDeps.length > 0) {
    signals.push({
      label: 'Server dependencies',
      detail: `package.json depends on ${backendDeps.slice(0, 3).join(', ')}.`,
    });
  }

  for (const { pattern, label, detail } of BACKEND_FILE_PATTERNS) {
    if (paths.some((path) => pattern.test(path))) signals.push({ label, detail });
  }

  if (lowerPaths.some((path) => NEXT_API_PATTERN.test(path))) {
    signals.push({
      label: 'Next.js API routes',
      detail: 'An api/ route folder is present, which runs server-side.',
    });
  }

  /*
   * A server file *and* a client folder together. Either alone is too weak: a
   * bare `index.js` is normal in a plain project, and `src/` is normal in React.
   */
  const hasServerFile = lowerPaths.some(
    (path) => SERVER_FILE_PATTERN.test(path) && !path.startsWith('src/'),
  );
  const hasClientFolder = lowerPaths.some((path) => CLIENT_FOLDER_PATTERN.test(path));
  if (hasServerFile && hasClientFolder && backendDeps.length === 0) {
    signals.push({
      label: 'Split client/server layout',
      detail: 'A server entry file sits beside a separate client folder.',
    });
  }

  if (signals.length > 0) {
    return {
      kind: 'fullstack',
      // One weak structural signal is a guess; a named backend dep is not.
      confidence: backendDeps.length > 0 || signals.length > 1 ? 'high' : 'medium',
      signals,
      requiresAdvancedMode: true,
      entry: manifest?.main,
    };
  }

  /* ── Vue ────────────────────────────────────────────────────────────── */

  const hasVueDependency = dependencyNames.includes('vue');
  const hasVueFiles = hasExtension(lowerPaths, ['.vue']);
  if (hasVueDependency || hasVueFiles) {
    return {
      kind: 'vue',
      confidence: hasVueDependency && hasVueFiles ? 'high' : 'medium',
      signals: [
        hasVueDependency
          ? { label: 'Vue dependency', detail: 'package.json depends on vue.' }
          : { label: 'Vue components', detail: 'The project contains .vue files.' },
      ],
      requiresAdvancedMode: false,
      entry: pickEntry(paths, ['src/main.js', 'src/main.ts', 'src/App.vue']),
    };
  }

  /* ── React ──────────────────────────────────────────────────────────── */

  const hasReactDependency = dependencyNames.includes('react');
  const hasJsxFiles = hasExtension(lowerPaths, ['.jsx', '.tsx']);
  if (hasReactDependency || hasJsxFiles) {
    return {
      kind: 'react',
      confidence: hasReactDependency && hasJsxFiles ? 'high' : 'medium',
      signals: [
        hasReactDependency
          ? { label: 'React dependency', detail: 'package.json depends on react.' }
          : { label: 'JSX components', detail: 'The project contains .jsx or .tsx files.' },
      ],
      requiresAdvancedMode: false,
      entry: pickEntry(paths, ['src/main.jsx', 'src/main.tsx', 'src/index.jsx', 'src/App.jsx']),
    };
  }

  /* ── Simple ─────────────────────────────────────────────────────────── */

  const rootHtml = lowerPaths.find((path) => !path.includes('/') && path.endsWith('.html'));
  const hasPackageJson = Boolean(packageEntry);

  return {
    kind: 'simple',
    confidence: rootHtml && !hasPackageJson ? 'high' : 'low',
    signals: [
      rootHtml
        ? { label: 'Static page', detail: `${rootHtml} at the project root, with no build step.` }
        : {
            label: 'No framework detected',
            detail: 'Falling back to the plain HTML/CSS/JS editor, which is always safe.',
          },
    ],
    requiresAdvancedMode: false,
    entry: rootHtml,
  };
};

/** First candidate that exists, else the first source file we can find. */
const pickEntry = (paths: string[], candidates: string[]): string | undefined => {
  const lower = paths.map((path) => path.toLowerCase());
  for (const candidate of candidates) {
    const index = lower.indexOf(candidate.toLowerCase());
    if (index !== -1) return paths[index];
  }
  return paths.find((path) => /^src\/.*\.(jsx|tsx|vue|js|ts)$/i.test(path));
};

/** Maps a detected kind onto the editor's project model. */
export const projectTypeForKind = (kind: DetectedProjectKind): ProjectType => {
  if (kind === 'react') return 'react';
  if (kind === 'vue') return 'vue';
  // Full-stack has no editor mode yet, so it is treated as plain if forced.
  return 'plain';
};

/** Human label for the "Detected as …" line. */
export const KIND_LABEL: Record<DetectedProjectKind, string> = {
  simple: 'Static HTML/CSS/JS',
  react: 'React project',
  vue: 'Vue project',
  fullstack: 'Full-stack project',
};

/** Options offered in the override dropdown. */
export const OVERRIDE_OPTIONS: { kind: DetectedProjectKind; label: string }[] = [
  { kind: 'simple', label: KIND_LABEL.simple },
  { kind: 'react', label: KIND_LABEL.react },
  { kind: 'vue', label: KIND_LABEL.vue },
];
