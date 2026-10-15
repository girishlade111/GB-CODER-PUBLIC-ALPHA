import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await fs.mkdtemp(path.resolve('scripts/.tmp-b4-diagnostics-'));
try {
  await build({
    entryPoints: ['src/services/webcontainer/startupDiagnostics.ts'],
    bundle: true,
    format: 'esm',
    outfile: dir + '/module.mjs',
  });
  const { StartupDiagnostics } = await import(
    pathToFileURL(dir + '/module.mjs')
  );
  let stored;
  const storage = {
    getItem: () => stored,
    setItem: (_, s) => {
      stored = s;
    },
  };
  const d = new StartupDiagnostics(storage);
  let id;
  for (let i = 0; i < 7; i++) {
    id = d.begin('SECRET_PROJECT_' + i, i, i);
    for (let j = 0; j < 250; j++)
      d.record(id, 'install', 'observed', {
        code: 'ECONNRESET',
        reason: 'SECRET_SOURCE',
        durationMs: 10,
        output: 'TOKEN_SECRET',
        url: 'https://secret',
      });
  }
  assert.equal(d.snapshot().length, 5);
  assert.ok(d.snapshot().every((a) => a.events.length <= 200));
  assert.ok(Buffer.byteLength(stored) <= 256 * 1024);
  assert.doesNotMatch(stored, /SECRET|TOKEN|https:/);
  const reload = new StartupDiagnostics(storage);
  assert.equal(reload.snapshot().at(-1).state, 'unknown');
  assert.ok(
    reload
      .snapshot()
      .at(-1)
      .events.some((e) => e.code === 'INTERRUPTED'),
  );
  const snapshot = reload.snapshot();
  snapshot.length = 0;
  assert.equal(reload.snapshot().length, 5);
  assert.doesNotThrow(() => {
    const x = new StartupDiagnostics({
      getItem() {
        throw Error('denied');
      },
      setItem() {
        throw Error('quota');
      },
    });
    x.begin('project', 1, 1);
  });
  const bad = new StartupDiagnostics({
    getItem: () => '{broken',
    setItem() {},
  });
  assert.equal(bad.snapshot().length, 0);
  console.log(
    'PASS bounded/allowlisted persistence, reload unknown outcome, copy isolation, unavailable/malformed storage',
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
