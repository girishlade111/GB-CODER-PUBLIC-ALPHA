/**
 * Ambient declarations for browser-specific vendor entry points used by the
 * client-side bundler.
 */

/** esbuild-wasm ships the wasm binary as an asset; Vite's `?url` gives its URL. */
declare module 'esbuild-wasm/esbuild.wasm?url' {
  const url: string;
  export default url;
}

/**
 * The browser ESM build of the Vue SFC compiler. The package's default entry
 * pulls in Node built-ins, so this specific file must be imported instead. It
 * exposes the same surface as the package root.
 */
declare module '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js' {
  export * from '@vue/compiler-sfc';
}
