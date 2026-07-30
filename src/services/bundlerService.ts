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

/**
 * Maps a bare module specifier onto the global the preview iframe exposes.
 *
 * These shims are intentionally CommonJS (`module.exports = ...`). esbuild then
 * resolves named imports as runtime property lookups on the namespace object,
 * which means arbitrary names work — important because Vue's compiled output
 * imports dozens of internal helpers (`openBlock`, `createElementVNode`, ...)
 * that would be impractical to enumerate as static ESM exports.
 */
const GLOBAL_FOR_MODULE: Record<string, string> = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/client': 'ReactDOM',
  'react/jsx-runtime': 'React',
  'react/jsx-dev-runtime': 'React',
  vue: 'Vue',
};

const shimSource = (specifier: string): string | null => {
  const globalName = GLOBAL_FOR_MODULE[specifier];
  if (!globalName) return null;

  return `
var _g = globalThis.${globalName};
if (!_g) {
  throw new Error(
    'The "${specifier}" runtime is not available in the preview. ' +
    'It is normally loaded automatically — try refreshing the preview.'
  );
}
module.exports = _g;
`;
};

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

      // Bare specifier -> runtime global shim.
      if (!raw.startsWith('.') && !raw.startsWith('/')) {
        if (shimSource(raw)) return { path: raw, namespace: 'shim' };
        return {
          errors: [
            {
              text:
                `Cannot import "${raw}" — npm packages are not supported yet. ` +
                `Only relative imports and react/react-dom/vue are available.`,
              location: args.importer ? { file: args.importer } : null,
            },
          ],
        };
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

    build.onLoad({ filter: /.*/, namespace: 'shim' }, (args) => ({
      contents: shimSource(args.path) ?? '',
      loader: 'js',
    }));

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
  const empty: BundleResult = { code: '', css: '', errors: [], warnings: [] };

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
  const empty: BundleResult = { code: '', css: '', errors: [], warnings: [] };

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
  };

  try {
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'iife',
      target: 'es2019',
      platform: 'browser',
      sourcemap: false,
      // Classic JSX transform: React.createElement resolves against the UMD
      // global in the iframe, so user code need not import React itself.
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      define: {
        'process.env.NODE_ENV': '"development"',
        global: 'globalThis',
      },
      logLevel: 'silent',
      plugins: [createVirtualFsPlugin(ctx)],
    });

    return {
      code: result.outputFiles?.[0]?.text ?? '',
      css: ctx.collectedCss.join('\n\n'),
      errors: (result.errors ?? []).map(toBundleError),
      warnings: (result.warnings ?? []).map(toBundleError),
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

/** CDN runtimes injected into the preview iframe for each framework. */
export const RUNTIME_SCRIPTS: Record<Exclude<ProjectType, 'plain'>, string[]> = {
  react: [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  ],
  vue: ['https://unpkg.com/vue@3/dist/vue.global.prod.js'],
};

export const isBundledProjectType = (projectType: ProjectType): boolean => projectType !== 'plain';

export { getExtension };
