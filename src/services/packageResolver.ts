/**
 * Resolves bare npm import specifiers to CDN URLs, entirely in the browser.
 *
 * There is no npm install and no Node.js. Instead every bare import is left
 * bare in the bundle and mapped to a CDN URL through an import map in the
 * preview iframe. That indirection is what lets the user's code and any CDN
 * package share a single React/Vue instance — bundling separate copies would
 * break hooks and provide/inject across the boundary.
 *
 * esm.sh is primary (best ESM compatibility); skypack.dev is the fallback.
 */

import { MultiFileProject, ProjectFile, ProjectType, isScriptFile } from '../types/files';

const ESM_SH = 'https://esm.sh';
const SKYPACK = 'https://cdn.skypack.dev';

/** CDN a package was resolved from, surfaced in the Dependencies panel. */
export type ResolverSource = 'esm.sh' | 'skypack.dev';

export interface ResolvedPackage {
  /** The specifier as written in code, e.g. `framer-motion` or `lodash-es/map`. */
  specifier: string;
  /** Package name without version or subpath, e.g. `@scope/name`. */
  name: string;
  /** Requested version, or `latest`. */
  version: string;
  /**
   * Concrete version the CDN actually served, e.g. `4.18.1` for a `latest`
   * request. Both CDNs disclose it in a banner comment at the top of the module.
   */
  resolvedVersion?: string;
  url: string;
  source: ResolverSource;
}

export interface PackageResolutionError {
  specifier: string;
  name: string;
  message: string;
  /** True for Node-only builtins, which CDNs can never provide. */
  requiresSandbox: boolean;
}

export type PackageResolution =
  | { ok: true; resolved: ResolvedPackage }
  | { ok: false; error: PackageResolutionError };

/**
 * Node.js builtins. These cannot run in a browser at all, so they fail with a
 * pointer to Sandbox mode rather than a generic resolution error.
 */
const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain', 'events', 'fs', 'http', 'http2',
  'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode',
  'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls',
  'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

/**
 * Packages that are commonly server-only. Detected up front so the error names
 * Sandbox mode instead of leaving the user guessing why a valid package fails.
 */
const SERVER_ONLY_PACKAGES = new Set([
  'express', 'fastify', 'koa', 'next', 'nest', '@nestjs/core', 'mongoose', 'mongodb',
  'pg', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3', 'redis', 'ioredis', 'prisma',
  '@prisma/client', 'typeorm', 'sequelize', 'knex', 'nodemailer', 'bcrypt', 'jsonwebtoken',
  'dotenv', 'multer', 'sharp', 'puppeteer', 'playwright',
]);

export const SANDBOX_HINT =
  'Server-side packages (databases, file system access) require Sandbox mode.';

// ─── Specifier parsing ────────────────────────────────────────────────────────

export interface ParsedSpecifier {
  name: string;
  /** Explicit version from the specifier, if any (`axios@1.6.0`). */
  version: string | null;
  /** Deep-import path including its leading slash, e.g. `/dist/esm`. */
  subpath: string;
}

/**
 * Splits a bare specifier into name, version and subpath.
 *
 * Handles scoped packages, where the leading `@` must not be mistaken for a
 * version separator, and deep imports like `lodash-es/map`.
 */
export const parseSpecifier = (specifier: string): ParsedSpecifier => {
  const raw = specifier.trim();
  const isScoped = raw.startsWith('@');

  // Name is the first segment, or the first two for scoped packages.
  const segments = raw.split('/');
  const nameSegmentCount = isScoped ? 2 : 1;
  const namePart = segments.slice(0, nameSegmentCount).join('/');
  const subpath = segments.length > nameSegmentCount ? `/${segments.slice(nameSegmentCount).join('/')}` : '';

  // Split a trailing @version off the name, skipping the scope's own '@'.
  const versionIndex = namePart.lastIndexOf('@');
  if (versionIndex > 0) {
    return {
      name: namePart.slice(0, versionIndex),
      version: namePart.slice(versionIndex + 1) || null,
      subpath,
    };
  }

  return { name: namePart, version: null, subpath };
};

/** True for project-relative imports, which never go to a CDN. */
export const isRelativeSpecifier = (specifier: string): boolean =>
  specifier.startsWith('.') || specifier.startsWith('/');

export const isNodeBuiltin = (name: string): boolean =>
  name.startsWith('node:') || NODE_BUILTINS.has(name);

// ─── Framework runtimes ───────────────────────────────────────────────────────

/**
 * Versions of the framework runtimes served from the CDN.
 *
 * Vue is pinned to the same minor as the bundled @vue/compiler-sfc: a compiled
 * SFC imports internal render helpers, and a runtime/compiler mismatch produces
 * confusing failures at render time.
 */
export const RUNTIME_VERSIONS: Record<string, string> = {
  react: '18.3.1',
  'react-dom': '18.3.1',
  vue: '3.5.40',
};

const RUNTIME_PACKAGES: Record<Exclude<ProjectType, 'plain'>, string[]> = {
  react: ['react', 'react-dom'],
  vue: ['vue'],
};

/** True when the specifier is a framework runtime (or a subpath of one). */
export const isRuntimePackage = (name: string, projectType: ProjectType): boolean => {
  if (projectType === 'plain') return false;
  return RUNTIME_PACKAGES[projectType].includes(name);
};

/**
 * Specifiers that must always be present in the import map, even if the user's
 * code never imports them directly — the JSX runtime is injected by esbuild and
 * `react-dom/client` is needed by the scaffold.
 */
export const requiredRuntimeSpecifiers = (projectType: ProjectType): string[] => {
  if (projectType === 'react') {
    return ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'];
  }
  if (projectType === 'vue') return ['vue'];
  return [];
};

/**
 * Packages the CDN should NOT bundle its own copy of.
 *
 * Passing these to esm.sh's `external` makes a package emit bare `react`
 * imports, which the import map then points at the same runtime the user's code
 * uses. Without this, a library like framer-motion ships its own React and
 * hooks break across the boundary.
 */
const externalsFor = (projectType: ProjectType): string[] => {
  if (projectType === 'react') return ['react', 'react-dom'];
  if (projectType === 'vue') return ['vue'];
  return [];
};

// ─── URL building ─────────────────────────────────────────────────────────────

const buildEsmShUrl = (
  parsed: ParsedSpecifier,
  version: string,
  projectType: ProjectType,
  isRuntime: boolean,
): string => {
  const versionPart = version && version !== 'latest' ? `@${version}` : '';
  const base = `${ESM_SH}/${parsed.name}${versionPart}${parsed.subpath}`;

  // Runtimes are the shared copy, so they must not declare themselves external.
  if (isRuntime) return base;

  const externals = externalsFor(projectType);
  return externals.length ? `${base}?external=${externals.join(',')}` : base;
};

const buildSkypackUrl = (parsed: ParsedSpecifier, version: string): string => {
  const versionPart = version && version !== 'latest' ? `@${version}` : '';
  return `${SKYPACK}/${parsed.name}${versionPart}${parsed.subpath}`;
};

/**
 * Version precedence: an explicit version in the specifier wins, then a manual
 * pin from the Dependencies panel, then the framework's pinned runtime version,
 * and finally `latest`.
 */
export const effectiveVersion = (
  parsed: ParsedSpecifier,
  pins: Record<string, string>,
  projectType: ProjectType,
): string =>
  parsed.version ??
  pins[parsed.name] ??
  (isRuntimePackage(parsed.name, projectType) ? RUNTIME_VERSIONS[parsed.name] : undefined) ??
  'latest';

// ─── Session cache ────────────────────────────────────────────────────────────

/**
 * Per-session resolution cache, keyed by specifier + requested version so a
 * version change re-resolves but repeated builds do not. Holds negative results
 * too, so a typo'd package is not re-fetched on every keystroke.
 */
const resolutionCache = new Map<string, PackageResolution>();

const cacheKey = (specifier: string, version: string, projectType: ProjectType): string =>
  `${projectType}|${specifier}|${version}`;

export const clearResolutionCache = (): void => resolutionCache.clear();

export const getCachedResolutions = (): PackageResolution[] => [...resolutionCache.values()];

// ─── Reachability ─────────────────────────────────────────────────────────────

interface ProbeResult {
  ok: boolean;
  /** Concrete version parsed from the CDN's banner comment, when present. */
  resolvedVersion?: string;
}

/*
 * Both CDNs announce the exact version they served in a leading comment:
 *   esm.sh   ->  /* esm.sh - lodash-es@4.18.1 *\/
 *   skypack  ->  /* Skypack CDN - date-fns@4.1.0 ... *\/
 * Requiring a digit after the '@' keeps this from matching a package scope.
 */
const VERSION_BANNER = /@(\d+\.\d+\.\d+[\w.\-+]*)/;

/**
 * Checks a CDN URL actually serves a module, and reads back the concrete
 * version it resolved to.
 *
 * A GET is used rather than HEAD because the version is only visible in the
 * body. The cost is small: these entry modules are a few hundred bytes that
 * merely re-export the real implementation. Both CDNs send permissive CORS
 * headers, so this works from the parent page.
 */
const probe = async (url: string, timeoutMs = 10_000): Promise<ProbeResult> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) return { ok: false };

    const banner = (await response.text()).slice(0, 400);
    return { ok: true, resolvedVersion: banner.match(VERSION_BANNER)?.[1] };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
};

// ─── Resolution ───────────────────────────────────────────────────────────────

export interface ResolveOptions {
  projectType: ProjectType;
  /** Manual version pins by package name, from the Dependencies panel. */
  pins?: Record<string, string>;
  /** Skip network checks (used by tests). */
  skipReachabilityCheck?: boolean;
}

/**
 * Resolves one bare specifier to a CDN URL.
 *
 * Never throws: failures come back as a structured error so the caller can put
 * them in the Console tab without breaking the whole build.
 */
export const resolvePackage = async (
  specifier: string,
  options: ResolveOptions,
): Promise<PackageResolution> => {
  const { projectType, pins = {}, skipReachabilityCheck = false } = options;
  const parsed = parseSpecifier(specifier);

  // ── Node builtins and known server-only packages ──
  if (isNodeBuiltin(parsed.name)) {
    return {
      ok: false,
      error: {
        specifier,
        name: parsed.name,
        message:
          `"${parsed.name}" is a Node.js built-in module and cannot run in the browser. ${SANDBOX_HINT}`,
        requiresSandbox: true,
      },
    };
  }

  if (SERVER_ONLY_PACKAGES.has(parsed.name)) {
    return {
      ok: false,
      error: {
        specifier,
        name: parsed.name,
        message: `"${parsed.name}" is a server-side package and cannot run in the browser. ${SANDBOX_HINT}`,
        requiresSandbox: true,
      },
    };
  }

  const isRuntime = isRuntimePackage(parsed.name, projectType);
  const version = effectiveVersion(parsed, pins, projectType);

  const key = cacheKey(specifier, version, projectType);
  const cached = resolutionCache.get(key);
  if (cached) return cached;

  const esmUrl = buildEsmShUrl(parsed, version, projectType, isRuntime);

  if (skipReachabilityCheck) {
    const result: PackageResolution = {
      ok: true,
      resolved: { specifier, name: parsed.name, version, url: esmUrl, source: 'esm.sh' },
    };
    resolutionCache.set(key, result);
    return result;
  }

  const esmProbe = await probe(esmUrl);
  if (esmProbe.ok) {
    const result: PackageResolution = {
      ok: true,
      resolved: {
        specifier,
        name: parsed.name,
        version,
        resolvedVersion: esmProbe.resolvedVersion,
        url: esmUrl,
        source: 'esm.sh',
      },
    };
    resolutionCache.set(key, result);
    return result;
  }

  // ── Fallback: skypack ──
  const skypackUrl = buildSkypackUrl(parsed, version);
  const skypackProbe = await probe(skypackUrl);
  if (skypackProbe.ok) {
    const result: PackageResolution = {
      ok: true,
      resolved: {
        specifier,
        name: parsed.name,
        version,
        resolvedVersion: skypackProbe.resolvedVersion,
        url: skypackUrl,
        source: 'skypack.dev',
      },
    };
    resolutionCache.set(key, result);
    return result;
  }

  const failure: PackageResolution = {
    ok: false,
    error: {
      specifier,
      name: parsed.name,
      message: `Package '${specifier}' could not be resolved. Check the package name/version.`,
      requiresSandbox: false,
    },
  };
  resolutionCache.set(key, failure);
  return failure;
};

/** Resolves many specifiers concurrently. */
export const resolvePackages = async (
  specifiers: string[],
  options: ResolveOptions,
): Promise<PackageResolution[]> =>
  Promise.all([...new Set(specifiers)].map((specifier) => resolvePackage(specifier, options)));

/** True when a specifier+version pair is already resolved this session. */
export const isResolutionCached = (
  specifier: string,
  version: string,
  projectType: ProjectType,
): boolean => resolutionCache.has(cacheKey(specifier, version, projectType));

// ─── Import scanning ──────────────────────────────────────────────────────────

/*
 * Matches the specifier in:
 *   import x from 'pkg'      import 'pkg'      import type {} from 'pkg'
 *   export { x } from 'pkg'  export * from 'pkg'
 *   import('pkg')            require('pkg')
 * Deliberately regex-based: this only feeds the Dependencies panel, and esbuild
 * remains the authority on what actually gets imported during a build.
 */
const IMPORT_PATTERNS: RegExp[] = [
  /\bimport\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+(?:\*|[\w*{},\s]+)\s+from\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

/** Strips comments and strings-in-templates that would yield false positives. */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Extracts bare specifiers from a single file's source. */
export const scanFileImports = (source: string): string[] => {
  const cleaned = stripComments(source);
  const found = new Set<string>();

  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match = pattern.exec(cleaned);
    while (match !== null) {
      const specifier = match[1];
      if (specifier && !isRelativeSpecifier(specifier) && !specifier.startsWith('http')) {
        found.add(specifier);
      }
      match = pattern.exec(cleaned);
    }
  }

  return [...found];
};

const scannableSource = (file: ProjectFile): string => {
  // A Vue SFC's imports live inside its <script> blocks.
  if (file.language !== 'vue') return file.content;
  const blocks = file.content.match(/<script[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  return blocks.join('\n');
};

export interface DetectedDependency {
  /** Package name without version or subpath. */
  name: string;
  /** Every specifier referencing it, e.g. `lodash-es` and `lodash-es/map`. */
  specifiers: string[];
  /** Version requested inline in code, if any. */
  requestedVersion: string | null;
  /** Files importing it. */
  importedBy: string[];
}

/**
 * Scans every script file for bare imports, grouped by package name.
 *
 * Excludes framework runtimes, which are managed automatically and would only
 * clutter the Dependencies panel.
 */
export const detectDependencies = (project: MultiFileProject): DetectedDependency[] => {
  const byName = new Map<string, DetectedDependency>();

  for (const file of project.files) {
    if (!isScriptFile(file.language)) continue;

    for (const specifier of scanFileImports(scannableSource(file))) {
      const parsed = parseSpecifier(specifier);
      if (isRuntimePackage(parsed.name, project.projectType)) continue;
      // react/jsx-runtime etc. are injected by the compiler, not user deps.
      if (parsed.name === 'react' || parsed.name === 'react-dom' || parsed.name === 'vue') continue;

      const existing = byName.get(parsed.name);
      if (existing) {
        if (!existing.specifiers.includes(specifier)) existing.specifiers.push(specifier);
        if (!existing.importedBy.includes(file.path)) existing.importedBy.push(file.path);
        if (!existing.requestedVersion && parsed.version) existing.requestedVersion = parsed.version;
      } else {
        byName.set(parsed.name, {
          name: parsed.name,
          specifiers: [specifier],
          requestedVersion: parsed.version,
          importedBy: [file.path],
        });
      }
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** Validates a `name@version` string typed into the Dependencies panel. */
export const validateDependencyInput = (
  raw: string,
): { valid: boolean; name?: string; version?: string; error?: string } => {
  const value = raw.trim();
  if (!value) return { valid: false, error: 'Enter a package name.' };
  if (isRelativeSpecifier(value)) return { valid: false, error: 'Enter a package name, not a path.' };

  const parsed = parseSpecifier(value);

  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(parsed.name)) {
    return { valid: false, error: `"${parsed.name}" is not a valid package name.` };
  }
  if (isNodeBuiltin(parsed.name)) {
    return { valid: false, error: `"${parsed.name}" is a Node.js built-in. ${SANDBOX_HINT}` };
  }
  if (parsed.subpath) {
    return { valid: false, error: 'Pin the package itself, without a subpath.' };
  }

  return { valid: true, name: parsed.name, version: parsed.version ?? 'latest' };
};

/**
 * True when the project references at least one package that has not been
 * resolved yet this session. Drives the preview's "fetching packages" overlay,
 * so it only appears on a genuinely cold resolution rather than every rebuild.
 */
export const hasUncachedPackages = (project: MultiFileProject): boolean => {
  if (project.projectType === 'plain') return false;

  const pins = project.dependencies ?? {};
  const specifiers = new Set<string>([
    ...detectDependencies(project).flatMap((dependency) => dependency.specifiers),
    ...requiredRuntimeSpecifiers(project.projectType),
  ]);

  return [...specifiers].some((specifier) => {
    const parsed = parseSpecifier(specifier);
    const version = effectiveVersion(parsed, pins, project.projectType);
    return !isResolutionCached(specifier, version, project.projectType);
  });
};
