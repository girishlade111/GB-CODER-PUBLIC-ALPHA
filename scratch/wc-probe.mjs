import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outdir = mkdtempSync(join(tmpdir(), 'gb-wc-probe-'));
globalThis.window = {};
try {
  await build({
    stdin: {
      contents: "export * from './src/services/webcontainer/webcontainerService.ts';",
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
  const m = await import(pathToFileURL(join(outdir, 'bundle.mjs')).href);
  console.log('IMPORT OK; isSupported =', m.webcontainerService.isSupported());
  console.log('state =', JSON.stringify(m.webcontainerService.getState()));
  try {
    await m.webcontainerService.boot();
    console.log('boot unexpectedly resolved');
  } catch (e) {
    console.log('boot rejected as expected:', String(e?.message ?? e).slice(0, 120));
    console.log('state after =', JSON.stringify(m.webcontainerService.getState()));
  }
} catch (e) {
  console.log('PROBE FAILED:', String(e).slice(0, 800));
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
