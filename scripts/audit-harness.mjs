/**
 * Test harness for the deploy, GitHub and credential services.
 *
 * The repo has no test runner, so this uses `node --test` and drives the real
 * modules through a stubbed `fetch`. The services are the layer where the
 * interesting logic lives — request shapes, polling, error classification, the
 * git-blob diff — and all of it is reachable without a network by controlling what
 * `fetch` returns.
 *
 * Run with:  node scripts/audit-run-tests.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/* ── Bundle the real modules ────────────────────────────────────────────────
 * esbuild resolves the project's extensionless bundler-style imports and strips
 * TypeScript. Testing a hand-copied version of the logic would prove nothing.
 */
const outdir = mkdtempSync(join(tmpdir(), 'gb-audit-'));

await build({
  stdin: {
    contents: `
      export * from './src/services/deployService.ts';
      export * from './src/services/githubSyncService.ts';
      export * from './src/services/credentialStore.ts';
      export * from './src/utils/terminalSafety.ts';
      export * from './src/utils/safeMarkup.ts';
      export * from './src/services/localShell.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: join(outdir, 'bundle.mjs'),
  logLevel: 'error',
});

globalThis.window = globalThis.window ?? {
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  localStorage: makeStorage(),
  crypto: globalThis.crypto,
};

function makeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
  };
}

// On Windows a bare absolute path is not a valid ESM specifier, so it has to be
// converted to a file:// URL before dynamic import.
export const services = await import(pathToFileURL(join(outdir, 'bundle.mjs')).href);
export const cleanup = () => rmSync(outdir, { recursive: true, force: true });
