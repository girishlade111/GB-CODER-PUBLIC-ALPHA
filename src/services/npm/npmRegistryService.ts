/**
 * NPM Registry & Package Manager Service.
 *
 * Provides live search via the public npm registry API, trending/curated packages,
 * weekly download metrics, and package.json synchronization for the in-browser IDE.
 */

import { ProjectFile } from '../../types/files';

export interface NpmPackageSummary {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  publisher?: string;
  npmUrl: string;
  homepageUrl?: string;
  downloadsWeekly?: number;
  score?: number;
}

export interface CuratedCategory {
  id: string;
  label: string;
  packages: Array<{
    name: string;
    version: string;
    description: string;
    tags: string[];
  }>;
}

export const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    id: 'popular',
    label: '🔥 Trending & Popular',
    packages: [
      {
        name: 'lucide-react',
        version: '0.469.0',
        description: 'Beautiful & consistent icon toolkit for React applications',
        tags: ['icons', 'react', 'svg', 'ui'],
      },
      {
        name: 'axios',
        version: '1.7.9',
        description: 'Promise-based HTTP client for browser and node.js with interceptors',
        tags: ['http', 'ajax', 'promises'],
      },
      {
        name: 'canvas-confetti',
        version: '1.9.4',
        description: 'Performant in-browser confetti animations using canvas',
        tags: ['canvas', 'confetti', 'animation', 'fx'],
      },
      {
        name: 'zod',
        version: '3.24.1',
        description: 'TypeScript-first schema declaration and validation library with static type inference',
        tags: ['validation', 'schema', 'typescript'],
      },
      {
        name: 'zustand',
        version: '5.0.3',
        description: 'Bear necessities for state management in React without boilerplate',
        tags: ['state', 'react', 'hooks'],
      },
      {
        name: 'framer-motion',
        version: '11.15.0',
        description: 'Production-ready motion library for React with gesture support',
        tags: ['animation', 'react', 'gestures'],
      },
      {
        name: 'lodash-es',
        version: '4.17.21',
        description: 'Modern lodash exported as ES modules for tree-shakeable utility functions',
        tags: ['utilities', 'functional', 'helpers'],
      },
      {
        name: 'date-fns',
        version: '4.1.0',
        description: 'Modern, modular JavaScript date utility library',
        tags: ['date', 'time', 'formatting'],
      },
    ],
  },
  {
    id: 'ui',
    label: '🎨 UI & Styling',
    packages: [
      {
        name: 'clsx',
        version: '2.1.1',
        description: 'Tiny utility for constructing className strings conditionally',
        tags: ['css', 'classes', 'tailwind'],
      },
      {
        name: 'tailwind-merge',
        version: '2.6.0',
        description: 'Merge Tailwind CSS classes without style conflicts',
        tags: ['tailwind', 'css', 'classes'],
      },
      {
        name: 'sonner',
        version: '1.7.1',
        description: 'An opinionated, beautiful toast component for React',
        tags: ['toast', 'notifications', 'ui'],
      },
      {
        name: 'class-variance-authority',
        version: '0.7.1',
        description: 'Declarative component variant management for design systems',
        tags: ['variants', 'styling', 'components'],
      },
    ],
  },
  {
    id: 'state',
    label: '⚡ State & Data',
    packages: [
      {
        name: '@tanstack/react-query',
        version: '5.62.15',
        description: 'Powerful asynchronous state management, server-state caching and data synchronization',
        tags: ['query', 'cache', 'fetch', 'react'],
      },
      {
        name: 'swr',
        version: '2.3.0',
        description: 'React Hooks library for data fetching with stale-while-revalidate strategy',
        tags: ['fetch', 'hooks', 'cache'],
      },
      {
        name: 'jotai',
        version: '2.11.0',
        description: 'Primitive and flexible atomic state management for React',
        tags: ['state', 'atoms', 'react'],
      },
    ],
  },
  {
    id: 'utils',
    label: '🛠️ Utilities',
    packages: [
      {
        name: 'nanoid',
        version: '5.0.9',
        description: 'Tiny, secure, URL-friendly unique string ID generator',
        tags: ['uuid', 'id', 'random'],
      },
      {
        name: 'dayjs',
        version: '1.11.13',
        description: 'Fast 2kB alternative to Moment.js with largely compatible API',
        tags: ['date', 'time', 'moment'],
      },
      {
        name: 'canvas-confetti',
        version: '1.9.4',
        description: 'Lightweight on-demand canvas confetti particles',
        tags: ['canvas', 'confetti'],
      },
    ],
  },
  {
    id: 'backend',
    label: '🌐 Backend & Full-Stack',
    packages: [
      {
        name: 'express',
        version: '4.21.2',
        description: 'Fast, unopinionated, minimalist web framework for node',
        tags: ['server', 'http', 'rest', 'api'],
      },
      {
        name: 'cors',
        version: '2.8.5',
        description: 'Node.js CORS middleware enabling Cross-Origin Resource Sharing',
        tags: ['cors', 'express', 'middleware'],
      },
      {
        name: 'dotenv',
        version: '16.4.7',
        description: 'Loads environment variables from .env file into process.env',
        tags: ['environment', 'config', 'dotenv'],
      },
    ],
  },
];

// In-memory cache for npm search queries
const searchCache = new Map<string, NpmPackageSummary[]>();
const downloadsCache = new Map<string, number>();

/**
 * Searches the public npm registry API for packages matching a query string.
 */
export async function searchNpmRegistry(
  query: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<NpmPackageSummary[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const cacheKey = `${trimmed}:${limit}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const endpoint = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(
    trimmed,
  )}&size=${limit}`;

  try {
    const res = await fetch(endpoint, { signal });
    if (!res.ok) {
      throw new Error(`NPM registry responded with status ${res.status}`);
    }

    const data = await res.json();
    const results: NpmPackageSummary[] = (data.objects || []).map(
      (item: {
        package: {
          name: string;
          version: string;
          description?: string;
          keywords?: string[];
          publisher?: { username?: string };
          links?: { npm?: string; homepage?: string };
        };
        score?: { final?: number };
      }) => ({
        name: item.package.name,
        version: item.package.version,
        description: item.package.description ?? 'No description provided',
        keywords: item.package.keywords ?? [],
        publisher: item.package.publisher?.username,
        npmUrl: item.package.links?.npm ?? `https://www.npmjs.com/package/${item.package.name}`,
        homepageUrl: item.package.links?.homepage,
        score: item.score?.final,
      }),
    );

    searchCache.set(cacheKey, results);
    return results;
  } catch (err: unknown) {
    if (signal?.aborted) return [];
    console.warn('[npmRegistryService] Search failed:', err);
    return [];
  }
}

/**
 * Fetches weekly download count for an npm package.
 */
export async function fetchPackageWeeklyDownloads(name: string): Promise<number | null> {
  const cleanName = name.trim().toLowerCase();
  if (downloadsCache.has(cleanName)) {
    return downloadsCache.get(cleanName)!;
  }

  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${cleanName}`);
    if (!res.ok) return null;
    const data = await res.json();
    const downloads = typeof data.downloads === 'number' ? data.downloads : null;
    if (downloads !== null) {
      downloadsCache.set(cleanName, downloads);
    }
    return downloads;
  } catch {
    return null;
  }
}

/**
 * Formats a download count into a human-readable string (e.g. 1.2M/wk, 45k/wk).
 */
export function formatDownloadCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M/wk`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}k/wk`;
  }
  return `${count}/wk`;
}

// ─── package.json Helpers ──────────────────────────────────────────────────

/**
 * Finds package.json inside a file list if present.
 */
export function findPackageJson(files: ProjectFile[]): ProjectFile | null {
  return (
    files.find((f) => /(^|\/)package\.json$/i.test(f.path)) ?? null
  );
}

/**
 * Parses package.json safely, returning empty object on failure.
 */
export function parsePackageJson(content: string): {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
} {
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Adds or updates a dependency in package.json content, preserving indentation.
 */
export function addDependencyToPackageJson(
  content: string,
  packageName: string,
  version: string,
  isDev = false,
): string {
  const targetKey = isDev ? 'devDependencies' : 'dependencies';
  let json: Record<string, any>;

  try {
    json = JSON.parse(content);
  } catch {
    json = {
      name: 'gb-coder-project',
      private: true,
      version: '0.0.0',
      type: 'module',
    };
  }

  if (!json[targetKey] || typeof json[targetKey] !== 'object') {
    json[targetKey] = {};
  }

  // Use caret prefix for semver compatibility unless version already has a prefix
  const formattedVersion = /^[0-9]/.test(version) ? `^${version}` : version;
  json[targetKey][packageName] = formattedVersion;

  return JSON.stringify(json, null, 2) + '\n';
}

/**
 * Removes a dependency from package.json content.
 */
export function removeDependencyFromPackageJson(
  content: string,
  packageName: string,
): string {
  try {
    const json = JSON.parse(content);
    let modified = false;

    if (json.dependencies && typeof json.dependencies === 'object' && packageName in json.dependencies) {
      delete json.dependencies[packageName];
      modified = true;
    }

    if (json.devDependencies && typeof json.devDependencies === 'object' && packageName in json.devDependencies) {
      delete json.devDependencies[packageName];
      modified = true;
    }

    if (!modified) return content;
    return JSON.stringify(json, null, 2) + '\n';
  } catch {
    return content;
  }
}
