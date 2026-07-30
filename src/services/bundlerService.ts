/**
 * Client-side bundler for multi-file React and Vue projects.
 *
 * Everything runs in the browser: esbuild-wasm bundles the in-memory virtual
 * file system, and @vue/compiler-sfc turns `.vue` single-file components into
 * render functions first. There is no package resolution — bare imports like
 * `react` or `vue` are shimmed onto the runtime globals that the preview iframe
 * loads from a CDN. Real npm imports are explicitly out of scope for this phase.
 *
 * Output is a single IIFE plus the project's collected CSS, which the existing
 * preview pipeline injects exactly like it injects hand-written JS today.
 */

import type { Plugin } from 'esbuild-wasm';
import {
  FileLanguage,
  MultiFileProject,
  ProjectType,
  getExtension,
  languageForPath,
  normalizePath,
} from '../types/files';
import {
  PackageResolutionError,
  ResolvedPackage,
  detectDependencies,
  requiredRuntimeSpecifiers,
  resolvePackages,
} from './packageResolver';

export interface BundleError {
  message: string;
  /** Source file the error came from, when esbuild reports one. */
  file?: string;
  line?: number;
  column?: number;
}

export interface BundleResult {
  code: string;
  css: string;
  errors: BundleError[];
  warnings: BundleError[];
  /** Specifier -> CDN URL, rendered as an import map in the preview iframe. */
  importMap: Record<string, string>;
  /** Successfully resolved packages, for the Dependencies panel. */
  resolved: ResolvedPackage[];
  /** Packages that could not be resolved from any CDN. */
  unresolved: PackageResolutionError[];
}

/** Formats a bundle error the way it will appear in the Console panel. */
export const formatBundleError = (error: BundleError): string => {
  const location = error.file
    ? `${error.file}${error.line ? `:${error.line}${error.column ? `:${error.column}` : ''}` : ''}`
    : '';
  return location ? `${location} — ${error.message}` : error.message;
};

// ─── esbuild lifecycle ────────────────────────────────────────────────────────

type EsbuildModule = typeof import('esbuild-wasm');

let esbuildModule: EsbuildModule | null = null;
let initPromise: Promise<EsbuildModule> | null = null;

/**
 * Loads and initialises esbuild-wasm exactly once. `initialize` throws if it is
 * called twice, so the promise is cached rather than the boolean result.
 */
const ensureEsbuild = async (): Promise<EsbuildModule> => {
  if (esbuildModule) return esbuildModule;

  if (!initPromise) {
    initPromise = (async () => {
      const [esbuild, wasmUrlModule] = await Promise.all([
        import('esbuild-wasm'),
        import('esbuild-wasm/esbuild.wasm?url'),
      ]);

      await esbuild.initialize({
        wasmURL: (wasmUrlModule as { default: string }).default,
        worker: true,
      });

      esbuildModule = esbuild;
      return esbuild;
    })().catch((error) => {
      // Allow a later attempt to retry instead of caching the failure forever.
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};

/** Warms up the toolchain so the first real build is not slowed by the download. */
export const preloadBundler = (): void => {
  void ensureEsbuild().catch(() => {
    /* surfaced on the first real build instead */
  });
};

// ─── Vue SFC compilation ──────────────────────────────────────────────────────

type VueCompiler = typeof import('@vue/compiler-sfc');

let vueCompiler: VueCompiler | null = null;

const ensureVueCompiler = async (): Promise<VueCompiler> => {
  if (!vueCompiler) {
    // The browser ESM build is required — the default entry pulls in Node APIs.
    vueCompiler = (await import(
      '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'
    )) as unknown as VueCompiler;
  }
  return vueCompiler;
};

/** Stable, filename-derived scope id for scoped styles. */
const scopeIdFor = (path: string): string => {
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    hash = (hash << 5) - hash + path.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
};

interface CompiledSfc {
  /** Module that exports the component's script half. */
  script: string;
  scriptLoader: 'js' | 'ts';
  /** Render-function module, when the template is compiled separately. */
  template?: string;
  css: string;
  /** True when the script module already has the render function inlined. */
  templateInlined: boolean;
  scopeId?: string;
}

/**
 * Compiles one `.vue` SFC into JS modules plus extracted CSS.
 *
 * `<script setup>` is compiled with an inlined template, which is both faster
 * and the only way the setup bindings are visible to the render function.
 * A plain `<script>` needs its template compiled as a separate module.
 */
const compileVueFile = async (path: string, source: string): Promise<CompiledSfc> => {
  const compiler = await ensureVueCompiler();
  const id = scopeIdFor(path);

  const { descriptor, errors } = compiler.parse(source, { filename: path });
  if (errors.length) {
    throw new Error(`${path}: ${errors.map((e) => e.message ?? String(e)).join('; ')}`);
  }

  const hasScopedStyle = descriptor.styles.some((style) => style.scoped);
  const scopeId = hasScopedStyle ? `data-v-${id}` : undefined;
  const isScriptSetup = !!descriptor.scriptSetup;
  const hasTemplate = !!descriptor.template;

  // ── Styles ──
  let css = '';
  for (const style of descriptor.styles) {
    const compiled = compiler.compileStyle({
      source: style.content,
      filename: path,
      id,
      scoped: style.scoped,
    });
    if (compiled.errors.length) {
      throw new Error(`${path} <style>: ${compiled.errors.map((e) => e.message).join('; ')}`);
    }
    css += `${compiled.code}\n`;
  }

  // ── Script ──
  const usesTypeScript =
    descriptor.script?.lang === 'ts' || descriptor.scriptSetup?.lang === 'ts';

  let script: string;
  if (descriptor.script || descriptor.scriptSetup) {
    const compiled = compiler.compileScript(descriptor, {
      id,
      inlineTemplate: isScriptSetup && hasTemplate,
      templateOptions: { compilerOptions: { scopeId } },
    });
    script = compiled.content;
  } else {
    // Template-only component.
    script = 'export default {};';
  }

  // ── Template (only when not already inlined) ──
  let template: string | undefined;
  const templateInlined = isScriptSetup && hasTemplate;

  if (hasTemplate && !templateInlined) {
    const compiled = compiler.compileTemplate({
      source: descriptor.template!.content,
      filename: path,
      id,
      compilerOptions: { scopeId },
    });
    if (compiled.errors.length) {
      throw new Error(
        `${path} <template>: ${compiled.errors.map((e) => (typeof e === 'string' ? e : e.message)).join('; ')}`,
      );
    }
    template = compiled.code;
  }

  return {
    script,
    scriptLoader: usesTypeScript ? 'ts' : 'js',
    template,
    css,
    templateInlined,
    scopeId,
  };
};

// ─── Bare-import shims ────────────────────────────────────────────────────────

/*
 * Bare specifiers are deliberately left BARE and marked external.
 *
 * The bundle is emitted as an ES module and the preview iframe carries an import
 * map pointing each specifier at a CDN URL. Keeping them bare is what allows the
 * user's code and any CDN package (loaded with esm.sh `?external=react`) to
 * resolve to the *same* runtime module — bundling copies instead would break
 * hooks and provide/inject across the boundary.
 */

// ─── Virtual file system plugin ───────────────────────────────────────────────

const LOADER_FOR_LANGUAGE: Record<FileLanguage, string> = {
  html: 'text',
  css: 'css',
  javascript: 'js',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  vue: 'js',
  json: 'json',
};

const RESOLVE_EXTENSIONS = ['', '.jsx', '.tsx', '.ts', '.js', '.vue', '.json', '.css'];

/** Resolves a relative specifier against the importer, trying common extensions. */
const resolveRelative = (
  importer: string,
  specifier: string,
  filePaths: Set<string>,
): string | null => {
  const importerDir = importer.includes('/') ? importer.slice(0, importer.lastIndexOf('/')) : '';
  const segments = (importerDir ? `${importerDir}/${specifier}` : specifier).split('/');
  const stack: string[] = [];

  for (const segment of segments) {
    if (segment === '.' || segment === '') continue;
    if (segment === '..') stack.pop();
    else stack.push(segment);
  }

  const base = stack.join('/');

  for (const extension of RESOLVE_EXTENSIONS) {
    const candidate = `${base}${extension}`;
    if (filePaths.has(candidate)) return candidate;
  }

  // Directory import: ./components -> ./components/index.jsx
  for (const extension of RESOLVE_EXTENSIONS.slice(1)) {
    const candidate = `${base}/index${extension}`;
    if (filePaths.has(candidate)) return candidate;
  }

  return null;
};

const VUE_SCRIPT_SUFFIX = '?vue-script';
const VUE_TEMPLATE_SUFFIX = '?vue-template';

export interface PluginContext {
  contents: Map<string, string>;
  collectedCss: string[];
  sfcCache: Map<string, CompiledSfc>;
  /** Bare specifiers encountered, to be resolved to CDN URLs. */
  bareSpecifiers: Set<string>;
}

export const createVirtualFsPlugin = (ctx: PluginContext): Plugin => ({
  name: 'gb-coder-virtual-fs',
  setup(build) {
    const filePaths = new Set(ctx.contents.keys());

    build.onResolve({ filter: /.*/ }, (args) => {
      const raw = args.path;

      // Vue sub-modules carry their parent path plus a query suffix.
      if (raw.endsWith(VUE_SCRIPT_SUFFIX) || raw.endsWith(VUE_TEMPLATE_SUFFIX)) {
        return { path: raw, namespace: 'vfs' };
      }

      if (args.kind === 'entry-point') {
        return { path: normalizePath(raw), namespace: 'vfs' };
      }

      // Already a URL (e.g. hand-written CDN import): leave it alone.
      if (/^https?:\/\//.test(raw)) {
        return { path: raw, external: true };
      }

      /*
       * Bare specifier: record it and leave it external so the iframe's import
       * map resolves it at runtime. Node builtins are recorded too, so the
       * resolver can produce the "use Sandbox mode" error for them.
       */
      if (!raw.startsWith('.') && !raw.startsWith('/')) {
        ctx.bareSpecifiers.add(raw);
        return { path: raw, external: true };
      }

      const resolved = resolveRelative(args.importer, raw, filePaths);
      if (!resolved) {
        return {
          errors: [
            {
              text: `Cannot resolve "${raw}" from "${args.importer}". Check the file exists in your project.`,
              location: args.importer ? { file: args.importer } : null,
            },
          ],
        };
      }

      return { path: resolved, namespace: 'vfs' };
    });

    build.onLoad({ filter: /.*/, namespace: 'vfs' }, async (args) => {
      // ── Vue sub-modules ──
      if (args.path.endsWith(VUE_SCRIPT_SUFFIX)) {
        const parent = args.path.slice(0, -VUE_SCRIPT_SUFFIX.length);
        const sfc = ctx.sfcCache.get(parent);
        if (!sfc) return { errors: [{ text: `Vue component "${parent}" was not compiled.` }] };
        return { contents: sfc.script, loader: sfc.scriptLoader, resolveDir: '' };
      }

      if (args.path.endsWith(VUE_TEMPLATE_SUFFIX)) {
        const parent = args.path.slice(0, -VUE_TEMPLATE_SUFFIX.length);
        const sfc = ctx.sfcCache.get(parent);
        if (!sfc?.template) {
          return { errors: [{ text: `Vue component "${parent}" has no template.` }] };
        }
        return { contents: sfc.template, loader: 'js', resolveDir: '' };
      }

      const source = ctx.contents.get(args.path);
      if (source === undefined) {
        return { errors: [{ text: `File "${args.path}" not found in the project.` }] };
      }

      const language = languageForPath(args.path);

      // ── CSS: collect rather than letting esbuild emit a second output file ──
      if (language === 'css') {
        ctx.collectedCss.push(`/* ${args.path} */\n${source}`);
        return { contents: '', loader: 'js' };
      }

      // ── Vue SFC: expand into script (+ template) sub-modules ──
      if (language === 'vue') {
        let sfc = ctx.sfcCache.get(args.path);
        if (!sfc) {
          try {
            sfc = await compileVueFile(args.path, source);
          } catch (error) {
            return {
              errors: [
                {
                  text: error instanceof Error ? error.message : String(error),
                  location: { file: args.path },
                },
              ],
            };
          }
          ctx.sfcCache.set(args.path, sfc);
        }

        if (sfc.css) ctx.collectedCss.push(`/* ${args.path} */\n${sfc.css}`);

        const lines = [`import _sfc_main from ${JSON.stringify(args.path + VUE_SCRIPT_SUFFIX)};`];

        if (sfc.template) {
          lines.push(
            `import { render as _sfc_render } from ${JSON.stringify(args.path + VUE_TEMPLATE_SUFFIX)};`,
            `_sfc_main.render = _sfc_render;`,
          );
        }
        if (sfc.scopeId) {
          lines.push(`_sfc_main.__scopeId = ${JSON.stringify(sfc.scopeId)};`);
        }
        lines.push(`export default _sfc_main;`);

        return { contents: lines.join('\n'), loader: 'js' };
      }

      return {
        contents: source,
        loader: (LOADER_FOR_LANGUAGE[language] ?? 'js') as 'js',
      };
    });
  },
});

// ─── Entry resolution ─────────────────────────────────────────────────────────

const ENTRY_CANDIDATES: Record<Exclude<ProjectType, 'plain'>, string[]> = {
  react: ['main.jsx', 'main.tsx', 'index.jsx', 'index.tsx', 'main.js', 'index.js', 'App.jsx'],
  vue: ['main.js', 'main.ts', 'index.js', 'index.ts'],
};

/** Picks the module entry point, preferring an explicit one. */
export const resolveEntry = (project: MultiFileProject): string | null => {
  const paths = new Set(project.files.map((f) => f.path));

  if (project.entry && paths.has(project.entry)) return project.entry;
  if (project.projectType === 'plain') return null;

  for (const candidate of ENTRY_CANDIDATES[project.projectType]) {
    if (paths.has(candidate)) return candidate;
  }

  // Last resort: the first script file in the project.
  const firstScript = project.files.find((f) =>
    ['jsx', 'tsx', 'javascript', 'typescript'].includes(f.language),
  );
  return firstScript?.path ?? null;
};

// ─── Public build API ─────────────────────────────────────────────────────────

const toBundleError = (
  message: { text: string; location?: { file?: string; line?: number; column?: number } | null },
): BundleError => ({
  message: message.text,
  file: message.location?.file || undefined,
  line: message.location?.line,
  column: message.location?.column,
});

/**
 * Bundles a React or Vue project into a single IIFE plus its CSS.
 * Never throws for user errors — compilation problems come back in `errors` so
 * the caller can route them to the Console panel.
 */
export const buildProject = async (project: MultiFileProject): Promise<BundleResult> => {
  const empty: BundleResult = {
    code: '',
    css: '',
    errors: [],
    warnings: [],
    importMap: {},
    resolved: [],
    unresolved: [],
  };

  if (project.projectType === 'plain') return empty;

  let esbuild: EsbuildModule;
  try {
    esbuild = await ensureEsbuild();
  } catch (error) {
    return {
      ...empty,
      errors: [
        {
          message: `Could not start the bundler: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }

  return buildProjectWith(esbuild, project);
};

/**
 * The bundling core, with esbuild injected.
 *
 * Split out from `buildProject` so the plugin logic can be exercised against
 * the native esbuild binary in tests — the plugin API is identical, so this
 * verifies module resolution, the CJS global shims and Vue SFC compilation
 * without needing a browser and a wasm download.
 */
export const buildProjectWith = async (
  esbuild: Pick<EsbuildModule, 'build'>,
  project: MultiFileProject,
): Promise<BundleResult> => {
  const empty: BundleResult = {
    code: '',
    css: '',
    errors: [],
    warnings: [],
    importMap: {},
    resolved: [],
    unresolved: [],
  };

  const entry = resolveEntry(project);
  if (!entry) {
    return {
      ...empty,
      errors: [
        {
          message:
            project.projectType === 'react'
              ? 'No entry file found. Create main.jsx to start your app.'
              : 'No entry file found. Create main.js to start your app.',
        },
      ],
    };
  }

  const ctx: PluginContext = {
    contents: new Map(project.files.map((f) => [f.path, f.content])),
    collectedCss: [],
    sfcCache: new Map(),
    bareSpecifiers: new Set(),
  };

  try {
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      /*
       * ESM output, not IIFE: bare imports must survive into the output so the
       * iframe's import map can resolve them to CDN URLs at runtime.
       */
      format: 'esm',
      target: 'es2020',
      platform: 'browser',
      sourcemap: false,
      /*
       * Automatic JSX runtime. The classic transform needed a `React` global,
       * which no longer exists now that React is an ES module from the CDN.
       * esbuild emits `import { jsx } from "react/jsx-runtime"`, which the
       * import map resolves to the same React instance as everything else.
       */
      ...(project.projectType === 'react'
        ? { jsx: 'automatic' as const, jsxImportSource: 'react' }
        : { jsx: 'transform' as const }),
      define: {
        'process.env.NODE_ENV': '"development"',
        global: 'globalThis',
      },
      logLevel: 'silent',
      plugins: [createVirtualFsPlugin(ctx)],
    });

    /*
     * Resolve every bare specifier the build left external, plus the framework
     * runtimes (react/jsx-runtime is injected by esbuild rather than written by
     * the user, so it would otherwise be missing from the map).
     *
     * Resolution is cached per session, so repeated builds only pay the network
     * cost for genuinely new or re-versioned packages.
     */
    /*
     * The set is a union of three sources rather than just what esbuild saw:
     *   - specifiers esbuild actually encountered (the authoritative graph)
     *   - specifiers scanned from every file, including ones not yet reachable
     *     from the entry, so the Dependencies panel does not sit on "Pending"
     *     for a package in a file the user has not wired up yet
     *   - manual pins, so a version can be resolved before the import exists
     *   - the framework runtimes, since react/jsx-runtime is injected by the
     *     compiler and never appears in user code
     */
    const specifiers = [
      ...new Set([
        ...ctx.bareSpecifiers,
        ...detectDependencies(project).flatMap((dependency) => dependency.specifiers),
        ...Object.keys(project.dependencies ?? {}),
        ...requiredRuntimeSpecifiers(project.projectType),
      ]),
    ];

    const resolutions = await resolvePackages(specifiers, {
      projectType: project.projectType,
      pins: project.dependencies ?? {},
    });

    const importMap: Record<string, string> = {};
    const resolved: ResolvedPackage[] = [];
    const unresolved: PackageResolutionError[] = [];

    for (const resolution of resolutions) {
      if (resolution.ok) {
        importMap[resolution.resolved.specifier] = resolution.resolved.url;
        resolved.push(resolution.resolved);
      } else {
        unresolved.push(resolution.error);
      }
    }

    // A failed package is a build error: the module would throw at runtime with
    // a far less useful message than the resolver's.
    const resolutionErrors: BundleError[] = unresolved.map((error) => ({ message: error.message }));

    return {
      code: result.outputFiles?.[0]?.text ?? '',
      css: ctx.collectedCss.join('\n\n'),
      errors: [...(result.errors ?? []).map(toBundleError), ...resolutionErrors],
      warnings: (result.warnings ?? []).map(toBundleError),
      importMap,
      resolved,
      unresolved,
    };
  } catch (error) {
    const buildFailure = error as { errors?: Array<{ text: string; location?: never }> };

    if (Array.isArray(buildFailure.errors) && buildFailure.errors.length) {
      return {
        ...empty,
        css: ctx.collectedCss.join('\n\n'),
        errors: buildFailure.errors.map(toBundleError),
      };
    }

    return {
      ...empty,
      errors: [{ message: error instanceof Error ? error.message : String(error) }],
    };
  }
};

/**
 * Framework runtimes are no longer injected as UMD <script> tags — they are
 * resolved through the import map like any other package, which guarantees a
 * single shared instance between user code and CDN packages.
 */

export const isBundledProjectType = (projectType: ProjectType): boolean => projectType !== 'plain';

export { getExtension };
