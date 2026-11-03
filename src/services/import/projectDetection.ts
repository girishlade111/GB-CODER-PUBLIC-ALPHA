/**
 * Project and framework type detection.
 *
 * Pure and synchronous: analyzes manifests, paths, configurations, and dependencies
 * to produce deterministic, evidence-based framework recognition without executing
 * imported code or performing network requests.
 */
import { ProjectType } from '../../types/files';

export type DetectedProjectKind = 'simple' | 'react' | 'vue' | 'fullstack';

export type FrameworkId =
  | 'vanilla'
  | 'typescript'
  | 'react'
  | 'react-vite'
  | 'vue'
  | 'vue-vite'
  | 'nextjs'
  | 'astro'
  | 'angular'
  | 'svelte'
  | 'sveltekit'
  | 'express'
  | 'node-cli'
  | 'unknown';

export type FrameworkRuntimeSupport =
  | 'verified'         // Vanilla, React+Vite, Vue+Vite, Node-CLI
  | 'experimental'     // Svelte, SvelteKit, Express
  | 'not_implemented' // Genuine Next.js (Phase 1E), Astro (Phase 1F), Angular (Phase 1F)
  | 'unsupported'      // Non-JS backend / Docker
  | 'unverified';      // Unrecognized or missing manifest

export interface FrameworkCapabilities {
  supportsSSR: boolean;
  supportsAPI: boolean;
  supportsHMR: boolean;
  requiresBuildStep: boolean;
  recommendedEditor: 'plain' | 'vscode';
  defaultPort: number;
}

/** A single piece of evidence, shown to the user in the override dialog. */
export interface DetectionSignal {
  label: string;
  detail: string;
}

export interface FrameworkDetectionResult {
  primaryFramework: FrameworkId;
  displayName: string;
  technologies: string[];
  confidence: 'high' | 'medium' | 'low';
  evidence: DetectionSignal[];
  configFiles: string[];
  manifestPath?: string | null;
  workspaceRoot?: string | null;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  runtimeSupport: FrameworkRuntimeSupport;
  detectedScripts: Record<string, string>;
  routerType?: 'app-router' | 'pages-router' | 'none';
  warnings: string[];
  conflicts: string[];
  entry?: string;
  projectType: ProjectType;
  requiresAdvancedMode: boolean;
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
  framework?: FrameworkDetectionResult;
}

/** One manifest entry. `content` is only needed for files that carry signal. */
export interface ManifestEntry {
  path: string;
  content?: string;
}

/**
 * Dependencies that mean a server is part of the project.
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

export interface PackageManifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  main?: string;
  packageManager?: string;
  bin?: unknown;
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

export const FRAMEWORK_LABELS: Record<FrameworkId, string> = {
  vanilla: 'Static HTML/CSS/JS',
  typescript: 'TypeScript',
  react: 'React',
  'react-vite': 'React + Vite',
  vue: 'Vue',
  'vue-vite': 'Vue + Vite',
  nextjs: 'Next.js',
  astro: 'Astro',
  angular: 'Angular',
  svelte: 'Svelte',
  sveltekit: 'SvelteKit',
  express: 'Express / Node.js',
  'node-cli': 'Node.js CLI',
  unknown: 'Web Project',
};

export const FRAMEWORK_CAPABILITIES: Record<FrameworkId, FrameworkCapabilities> = {
  vanilla: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: false,
    requiresBuildStep: false,
    recommendedEditor: 'plain',
    defaultPort: 3000,
  },
  typescript: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: false,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  react: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  'react-vite': {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 5173,
  },
  vue: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  'vue-vite': {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 5173,
  },
  nextjs: {
    supportsSSR: true,
    supportsAPI: true,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  astro: {
    supportsSSR: true,
    supportsAPI: true,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 4321,
  },
  angular: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 4200,
  },
  svelte: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 5173,
  },
  sveltekit: {
    supportsSSR: true,
    supportsAPI: true,
    supportsHMR: true,
    requiresBuildStep: true,
    recommendedEditor: 'vscode',
    defaultPort: 5173,
  },
  express: {
    supportsSSR: false,
    supportsAPI: true,
    supportsHMR: false,
    requiresBuildStep: false,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  'node-cli': {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: false,
    requiresBuildStep: false,
    recommendedEditor: 'vscode',
    defaultPort: 3000,
  },
  unknown: {
    supportsSSR: false,
    supportsAPI: false,
    supportsHMR: false,
    requiresBuildStep: false,
    recommendedEditor: 'plain',
    defaultPort: 3000,
  },
};

/**
 * Performs comprehensive, evidence-based framework recognition.
 */
export function detectFramework(entries: ManifestEntry[]): FrameworkDetectionResult {
  const paths = entries.map((e) => e.path.replace(/^\.\//, '').replace(/^\/+/, ''));
  const lowerPaths = paths.map((p) => p.toLowerCase());
  const evidence: DetectionSignal[] = [];
  const configFiles: string[] = [];
  const warnings: string[] = [];
  const conflicts: string[] = [];
  const technologies: string[] = [];

  // 1. Locate manifest(s)
  const rootPackageEntry = entries.find((e) => {
    const clean = e.path.replace(/^\.\//, '').replace(/^\/+/, '').toLowerCase();
    return clean === 'package.json';
  });

  const allPackageEntries = entries.filter((e) => {
    const clean = e.path.replace(/^\.\//, '').replace(/^\/+/, '').toLowerCase();
    return clean.endsWith('package.json');
  });

  if (allPackageEntries.length > 1) {
    warnings.push(`Monorepo or nested package.json manifests detected (${allPackageEntries.length} manifests found). GB Coder executes root workspace by default.`);
  }

  if (rootPackageEntry?.content) {
    try {
      const parsed = JSON.parse(rootPackageEntry.content);
      if (!parsed || typeof parsed !== 'object') {
        warnings.push('Failed to parse package.json: content is not a valid JSON object.');
      }
    } catch (err) {
      warnings.push(`Failed to parse package.json: ${(err as Error).message}`);
    }
  }

  const manifest = parsePackageJson(rootPackageEntry?.content);
  const dependencies = allDependencies(manifest);
  const depNames = Object.keys(dependencies);
  const scripts = manifest?.scripts || {};

  // 2. Identify Package Manager
  let packageManager: 'npm' | 'pnpm' | 'yarn' = 'npm';
  if (lowerPaths.includes('pnpm-lock.yaml') || lowerPaths.includes('pnpm-lock.yml')) {
    packageManager = 'pnpm';
  } else if (lowerPaths.includes('yarn.lock')) {
    packageManager = 'yarn';
  } else if (manifest?.packageManager) {
    if (manifest.packageManager.toLowerCase().startsWith('pnpm')) packageManager = 'pnpm';
    else if (manifest.packageManager.toLowerCase().startsWith('yarn')) packageManager = 'yarn';
  }

  // 3. Scan Config Files
  const hasNextConfig = lowerPaths.some((p) => /^next\.config\.(js|mjs|ts)$/i.test(p));
  if (hasNextConfig) configFiles.push('next.config');

  const hasAstroConfig = lowerPaths.some((p) => /^astro\.config\.(mjs|js|ts)$/i.test(p));
  if (hasAstroConfig) configFiles.push('astro.config');

  const hasAngularJson = lowerPaths.includes('angular.json');
  if (hasAngularJson) configFiles.push('angular.json');

  const hasSvelteConfig = lowerPaths.some((p) => /^svelte\.config\.(js|ts|cjs)$/i.test(p));
  if (hasSvelteConfig) configFiles.push('svelte.config');

  const hasViteConfig = lowerPaths.some((p) => /^vite\.config\.(js|ts|mjs)$/i.test(p));
  if (hasViteConfig) configFiles.push('vite.config');

  const hasTsConfig = lowerPaths.includes('tsconfig.json');
  if (hasTsConfig) configFiles.push('tsconfig.json');

  // Multi-manifest monorepo detection
  if (allPackageEntries.length > 1) {
    warnings.push(`Monorepo structure detected (${allPackageEntries.length} manifests). Root workspace prioritized.`);
  }

  // 4. Framework Recognition with Precedence

  // NEXT.JS
  const hasNextDep = depNames.includes('next');
  const hasNextScript = Object.values(scripts).some((s) => /\bnext\s+(dev|build|start)\b/i.test(s));
  const hasAppRouter = lowerPaths.some((p) => /(^|\/)(app|src\/app)\//i.test(p));
  const hasPagesRouter = lowerPaths.some((p) => /(^|\/)(pages|src\/pages)\//i.test(p));

  const isNextJs = hasNextDep || hasNextConfig || (hasNextScript && (hasAppRouter || hasPagesRouter));

  // ASTRO
  const hasAstroDep = depNames.includes('astro');
  const hasAstroFiles = lowerPaths.some((p) => p.endsWith('.astro'));
  const hasAstroScript = Object.values(scripts).some((s) => /\bastro\s+(dev|build|preview)\b/i.test(s));

  const isAstro = hasAstroDep || hasAstroConfig || hasAstroFiles || hasAstroScript;

  // ANGULAR
  const hasAngularDep = depNames.some((d) => d.startsWith('@angular/'));
  const isAngular = hasAngularJson || hasAngularDep;

  // SVELTE / SVELTEKIT
  const hasSvelteKitDep = depNames.includes('@sveltejs/kit');
  const hasSvelteDep = depNames.includes('svelte');
  const hasSvelteFiles = lowerPaths.some((p) => p.endsWith('.svelte'));
  const hasRoutesFolder = lowerPaths.some((p) => /(^|\/)(src\/routes|routes)\//i.test(p));

  const isSvelteKit = hasSvelteKitDep || (hasSvelteConfig && hasRoutesFolder);
  const isSvelte = !isSvelteKit && (hasSvelteDep || hasSvelteFiles);

  // VUE
  const hasVueDep = depNames.includes('vue');
  const hasVuePlugin = depNames.includes('@vitejs/plugin-vue');
  const hasVueFiles = hasExtension(lowerPaths, ['.vue']);
  const isVueVite = (hasVueDep || hasVueFiles) && (hasViteConfig || hasVuePlugin || depNames.includes('vite'));
  const isVue = (hasVueDep || hasVueFiles) && !isVueVite;

  // REACT
  const hasReactDep = depNames.includes('react');
  const hasReactPlugin = depNames.includes('@vitejs/plugin-react');
  const hasJsx = hasExtension(lowerPaths, ['.jsx', '.tsx']);
  const isReactVite = (hasReactDep || hasJsx) && (hasViteConfig || hasReactPlugin || depNames.includes('vite')) && !isNextJs;
  const isReact = (hasReactDep || hasJsx) && !isReactVite && !isNextJs;

  // EXPRESS / NODE BACKEND
  const backendDepsFound = BACKEND_DEPENDENCIES.filter((d) => depNames.includes(d));
  const hasNonJsBackend = BACKEND_FILE_PATTERNS.some(({ pattern }) => paths.some((p) => pattern.test(p)));
  const isExpress = backendDepsFound.length > 0 && !isNextJs && !isAstro && !isReactVite && !isVueVite;

  // TYPESCRIPT
  const isTypeScript =
    (hasTsConfig || hasExtension(lowerPaths, ['.ts'])) &&
    !isNextJs &&
    !isAngular &&
    !isReact &&
    !isReactVite &&
    !isVue &&
    !isVueVite &&
    !isSvelte &&
    !isSvelteKit &&
    !isAstro;

  // NODE CLI
  const hasBinField = Boolean(manifest?.bin);
  const isNodeCli =
    Boolean(rootPackageEntry) &&
    !isNextJs &&
    !isAstro &&
    !isAngular &&
    !isReact &&
    !isReactVite &&
    !isVue &&
    !isVueVite &&
    !isTypeScript &&
    (hasBinField || depNames.length > 0);

  // SERVER & CLIENT PATTERNS
  const hasServerFile = paths.some((p) => SERVER_FILE_PATTERN.test(p));
  const hasClientFolder = paths.some((p) => CLIENT_FOLDER_PATTERN.test(p));
  const hasNextApi = paths.some((p) => NEXT_API_PATTERN.test(p));

  if (hasNextApi) {
    evidence.push({
      label: 'Next.js API routes',
      detail: 'Project contains API route files under pages/api or app/api.',
    });
  }
  if (hasServerFile && hasClientFolder) {
    evidence.push({
      label: 'Multi-tier codebase',
      detail: 'Found server entry files alongside client directory structure.',
    });
  }

  // CONFLICT DETECTION
  if (isNextJs && isAngular) {
    conflicts.push('Conflicting framework evidence: Next.js and Angular indicators detected simultaneously.');
  }
  if (isNextJs && isAstro) {
    conflicts.push('Conflicting framework evidence: Next.js and Astro indicators detected simultaneously.');
  }
  if (isAstro && isAngular) {
    conflicts.push('Conflicting framework evidence: Astro and Angular indicators detected simultaneously.');
  }

  // 5. Apply Explicit Precedence

  let primaryFramework: FrameworkId = 'unknown';
  let displayName = 'Web Project';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let runtimeSupport: FrameworkRuntimeSupport = 'unverified';
  let routerType: 'app-router' | 'pages-router' | 'none' = 'none';
  let projectType: ProjectType = 'plain';
  let requiresAdvancedMode = false;

  if (isNextJs) {
    primaryFramework = 'nextjs';
    displayName = 'Next.js';
    technologies.push('nextjs', 'react');
    if (hasTsConfig || hasExtension(lowerPaths, ['.ts', '.tsx'])) technologies.push('typescript');
    confidence = hasNextDep && (hasNextConfig || hasAppRouter || hasPagesRouter) ? 'high' : 'medium';
    routerType = hasAppRouter ? 'app-router' : hasPagesRouter ? 'pages-router' : 'none';
    projectType = 'react';
    requiresAdvancedMode = true;

    // Phase 1E.1: Evaluate WebContainer Next.js security and runtime compatibility
    const devScript = scripts['dev'] || '';
    const hasTurbo = devScript.includes('--turbo');
    const hasSwcWasm = depNames.includes('@next/swc-wasm-nodejs');
    const nextVersion = dependencies['next'] || '';

    // Check for known vulnerable versions (< 16.4.4)
    if (nextVersion && (/^(?:[~^]?1[0-5]\.|\^?14\.|\^?15\.)/.test(nextVersion) || (nextVersion.startsWith('16.') && nextVersion < '16.4.4'))) {
      warnings.push('Next.js versions prior to 16.4.4 contain published security advisories (including critical GHSA-f82v-jwr5-mffw and GHSA-2xp9-vwfh-vxw4). Upgrade to a supported, security-patched release.');
    }

    if (hasTurbo) {
      runtimeSupport = 'unsupported';
      warnings.push('Next.js Turbopack (--turbo) is not supported in WebContainers. Use standard "next dev --webpack" with Webpack and @next/swc-wasm-nodejs.');
    } else {
      runtimeSupport = 'experimental'; // Phase 1E.1: Experimental runtime due to browser WebAssembly sandbox memory and execution limits
      evidence.push({
        label: 'Next.js WebContainer Runtime',
        detail: hasSwcWasm
          ? 'Runs in WebContainer in experimental mode using Webpack and bundled @next/swc-wasm-nodejs compiler bindings.'
          : 'Runs in WebContainer in experimental mode using Webpack and WASM SWC fallback.',
      });
      warnings.push('Next.js in browser WebContainers is experimental. Large dependency trees may cause high memory usage or long install times in the browser sandbox.');
    }

    evidence.push({
      label: 'Next.js framework',
      detail: hasNextDep
        ? `next dependency (${dependencies['next'] || 'detected'})`
        : 'Next.js configuration and router structure',
    });
  } else if (isAstro) {
    primaryFramework = 'astro';
    displayName = 'Astro';
    technologies.push('astro');
    if (hasReactDep) technologies.push('react');
    if (hasVueDep) technologies.push('vue');
    if (hasSvelteDep) technologies.push('svelte');
    confidence = hasAstroConfig || (hasAstroDep && hasAstroFiles) ? 'high' : 'medium';
    runtimeSupport = 'not_implemented'; // Phase 1F
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Astro framework',
      detail: hasAstroDep
        ? `astro dependency (${dependencies['astro'] || 'detected'})`
        : 'Astro configuration (.astro files)',
    });
    warnings.push('Astro project detected. Astro server execution is scheduled for Phase 1F.');
  } else if (isAngular) {
    primaryFramework = 'angular';
    displayName = 'Angular';
    technologies.push('angular', 'typescript');
    confidence = hasAngularJson ? 'high' : 'medium';
    runtimeSupport = 'not_implemented'; // Phase 1F
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Angular framework',
      detail: hasAngularJson ? 'angular.json workspace configuration' : 'Angular core dependencies',
    });
    warnings.push('Angular project detected. Angular CLI runtime build is scheduled for Phase 1F.');
  } else if (isSvelteKit) {
    primaryFramework = 'sveltekit';
    displayName = 'SvelteKit';
    technologies.push('sveltekit', 'svelte');
    confidence = 'high';
    runtimeSupport = 'experimental';
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'SvelteKit framework',
      detail: '@sveltejs/kit dependency and routes structure',
    });
  } else if (isSvelte) {
    primaryFramework = 'svelte';
    displayName = 'Svelte';
    technologies.push('svelte');
    confidence = hasSvelteDep && hasSvelteFiles ? 'high' : 'medium';
    runtimeSupport = 'experimental';
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Svelte component framework',
      detail: 'svelte dependency with .svelte files',
    });
  } else if (isVueVite) {
    primaryFramework = 'vue-vite';
    displayName = 'Vue + Vite';
    technologies.push('vue', 'vite');
    confidence = 'high';
    runtimeSupport = 'verified';
    projectType = 'vue';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Vue + Vite project',
      detail: 'vue dependency with vite build tool',
    });
  } else if (isVue) {
    primaryFramework = 'vue';
    displayName = 'Vue';
    technologies.push('vue');
    confidence = hasVueDep && hasVueFiles ? 'high' : 'medium';
    runtimeSupport = 'verified';
    projectType = 'vue';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Vue project',
      detail: 'vue dependency with .vue components',
    });
  } else if (isReactVite) {
    primaryFramework = 'react-vite';
    displayName = 'React + Vite';
    technologies.push('react', 'vite');
    if (hasTsConfig || hasExtension(lowerPaths, ['.tsx'])) technologies.push('typescript');
    confidence = 'high';
    runtimeSupport = 'verified';
    projectType = 'react';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'React + Vite project',
      detail: 'react dependency with vite bundler',
    });
  } else if (isReact) {
    primaryFramework = 'react';
    displayName = 'React';
    technologies.push('react');
    if (hasTsConfig || hasExtension(lowerPaths, ['.tsx'])) technologies.push('typescript');
    confidence = hasReactDep && hasJsx ? 'high' : 'medium';
    runtimeSupport = 'verified';
    projectType = 'react';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'React project',
      detail: 'react dependency with JSX components',
    });
  } else if (isExpress) {
    primaryFramework = 'express';
    displayName = 'Express / Node.js';
    technologies.push('express', 'node');
    confidence = 'high';
    runtimeSupport = 'experimental';
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Node.js backend dependencies',
      detail: `Backend modules: ${backendDepsFound.slice(0, 3).join(', ')}`,
    });
  } else if (hasNonJsBackend) {
    primaryFramework = 'unknown';
    displayName = 'Non-JS Backend Project';
    confidence = 'high';
    runtimeSupport = 'unsupported';
    projectType = 'plain';
    requiresAdvancedMode = true;

    warnings.push('Non-JavaScript backend manifest detected (e.g. Python, Docker, Go). Browser WebContainers execute Node.js only.');
    evidence.push({
      label: 'External runtime manifest',
      detail: 'Project contains non-JS backend configuration files',
    });
  } else if (isTypeScript) {
    primaryFramework = 'typescript';
    displayName = 'TypeScript';
    technologies.push('typescript');
    confidence = 'high';
    runtimeSupport = 'verified';
    projectType = 'plain';
    requiresAdvancedMode = false;

    evidence.push({
      label: 'TypeScript configuration',
      detail: 'tsconfig.json or .ts files without frontend framework',
    });
  } else if (isNodeCli) {
    primaryFramework = 'node-cli';
    displayName = 'Node.js CLI';
    technologies.push('node');
    confidence = 'medium';
    runtimeSupport = 'verified';
    projectType = 'plain';
    requiresAdvancedMode = true;

    evidence.push({
      label: 'Node.js package',
      detail: 'package.json with Node scripts or binary entries',
    });
  } else {
    const rootHtml = lowerPaths.find((p) => !p.includes('/') && p.endsWith('.html'));
    if (rootHtml || lowerPaths.includes('index.html')) {
      primaryFramework = 'vanilla';
      displayName = 'Static HTML/CSS/JS';
      technologies.push('html', 'css', 'javascript');
      confidence = 'high';
      runtimeSupport = 'verified';
      projectType = 'plain';
      requiresAdvancedMode = false;

      evidence.push({
        label: 'Static web page',
        detail: 'index.html entry at root without build step',
      });
    } else {
      primaryFramework = 'unknown';
      displayName = 'Web Project';
      confidence = 'low';
      runtimeSupport = 'unverified';
      projectType = 'plain';
      requiresAdvancedMode = false;

      evidence.push({
        label: 'Generic workspace',
        detail: 'Standard web files without explicit framework manifests',
      });
    }
  }

  // Pick Entry Point
  const entry = pickEntry(paths, [
    'src/main.jsx',
    'src/main.tsx',
    'src/main.js',
    'src/main.ts',
    'src/index.jsx',
    'src/index.tsx',
    'src/index.js',
    'src/index.ts',
    'src/App.jsx',
    'src/App.vue',
    'src/app/page.tsx',
    'src/app/page.jsx',
    'app/page.tsx',
    'app/page.jsx',
    'src/pages/index.astro',
    'src/pages/index.tsx',
    'src/pages/index.jsx',
    'index.html',
  ]);

  return {
    primaryFramework,
    displayName,
    technologies,
    confidence,
    evidence,
    configFiles,
    manifestPath: rootPackageEntry?.path || null,
    workspaceRoot: '.',
    packageManager,
    runtimeSupport,
    detectedScripts: scripts,
    routerType,
    warnings,
    conflicts,
    entry,
    projectType,
    requiresAdvancedMode,
  };
}

/**
 * Classifies a project (backward-compatible API with rich framework metadata).
 */
export const detectProject = (entries: ManifestEntry[]): DetectionResult => {
  const fw = detectFramework(entries);

  // Backward-compatible kind mapping
  let kind: DetectedProjectKind = 'simple';
  if (fw.primaryFramework === 'nextjs' || fw.primaryFramework === 'astro' || fw.primaryFramework === 'angular' || fw.primaryFramework === 'express' || fw.runtimeSupport === 'unsupported') {
    kind = 'fullstack';
  } else if (fw.primaryFramework === 'vue' || fw.primaryFramework === 'vue-vite') {
    kind = 'vue';
  } else if (fw.primaryFramework === 'react' || fw.primaryFramework === 'react-vite') {
    kind = 'react';
  } else {
    kind = 'simple';
  }

  return {
    kind,
    confidence: fw.confidence,
    signals: fw.evidence,
    entry: fw.entry,
    requiresAdvancedMode: fw.requiresAdvancedMode,
    framework: fw,
  };
};

/** First candidate that exists, else the first source file we can find. */
const pickEntry = (paths: string[], candidates: string[]): string | undefined => {
  const lower = paths.map((path) => path.toLowerCase());
  for (const candidate of candidates) {
    const index = lower.indexOf(candidate.toLowerCase());
    if (index !== -1) return paths[index];
  }
  return paths.find((path) => /^src\/.*\.(jsx|tsx|vue|astro|svelte|js|ts)$/i.test(path));
};

/** Maps a detected kind onto the editor's project model. */
export const projectTypeForKind = (kind: DetectedProjectKind): ProjectType => {
  if (kind === 'react') return 'react';
  if (kind === 'vue') return 'vue';
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
