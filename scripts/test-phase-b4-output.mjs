import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const baseline = process.argv.includes('--baseline');
const dir = await fs.mkdtemp(path.resolve('scripts/.tmp-b4-output-'));
const options = baseline
  ? {
      stdin: {
        contents: execFileSync(
          'git',
          [
            'show',
            '546e74c084387d007b0312b9fbd69a9f6a6b55f1:src/services/webcontainer/webcontainerService.ts',
          ],
          { encoding: 'utf8' },
        ),
        resolveDir: path.resolve('src/services/webcontainer'),
        loader: 'ts',
      },
    }
  : { entryPoints: ['src/services/webcontainer/webcontainerService.ts'] };
await build({
  ...options,
  bundle: true,
  format: 'esm',
  outfile: dir + '/service.mjs',
  plugins: [
    {
      name: 'mock',
      setup(b) {
        b.onResolve({ filter: /^@webcontainer\/api$/ }, () => ({
          path: 'api',
          namespace: 'mock',
        }));
        b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({
          contents:
            'export const WebContainer={boot:async()=>{throw Error("unexpected boot")}}',
        }));
      },
    },
  ],
});
const { webcontainerService: s } = await import(
  pathToFileURL(dir + '/service.mjs')
);
let passed = 0,
  failed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log('PASS ' + name);
  } catch (e) {
    failed++;
    console.error('FAIL ' + name + ': ' + e.message);
  }
}
async function shell(id, dispatched = true) {
  s.attachProject(id);
  let output;
  const written = [];
  const callbacks = {};
  const runtime = {
    teardown() {},
    on(name, fn) {
      callbacks[name] = fn;
      return () => {};
    },
    fs: {
      async readdir() {
        return ['react'];
      },
    },
    async spawn() {
      return {
        output: new ReadableStream({
          start(c) {
            output = c;
          },
        }),
        input: new WritableStream({ write(data) { written.push(data); } }),
        exit: new Promise(() => {}),
        resize() {},
        kill() {},
      };
    },
  };
  s.instance = runtime;
  s.setupServerListeners(runtime);
  const owner = s.captureStartupOwner?.();
  const handle = await s.spawnInteractiveShell({ cols: 80, rows: 24, onData() {} });
  if (s.beginAutomaticStartup) {
    s.beginAutomaticStartup('fingerprint', true, owner);
    if (dispatched) s.automaticCommandDispatched(owner);
  } else s.setStartupStage('installing');
  return {
    owner,
    callbacks,
    written,
    handle,
    send: async (text) => {
      output.enqueue(text);
      await new Promise((r) => setTimeout(r, 0));
    },
  };
}
try {
  await test('production stream recognizes completion split across chunks without claiming exit code', async () => {
    const a = await shell('split');
    await a.send('\r\nadded 61 pack');
    await a.send('ages in 1s\r\n');
    assert.equal(s.getState().startupStage, 'starting_server');
    if (!baseline) assert.equal(s.getInstalledFingerprint(), null);
  });
  if (!baseline) {
    await test('output before owned command dispatch cannot confirm installation', async () => { const a=await shell('not-dispatched',false);await a.send('\r\nadded 61 packages in 1s\r\n');assert.equal(s.getState().startupStage,'installing'); });

    await test('same-project shell reconnection preserves manual input without spawning', async () => {
      const a=await shell('manual-reconnect');await a.send('\r\nadded 61 packages in 1s\r\n');a.callbacks['server-ready'](5173,'http://manual');const count=s.spawnAttempts;
      a.handle.disconnect();
      const reconnected=await s.spawnInteractiveShell({cols:80,rows:24,onData(){}});reconnected.write('node -v\n');await new Promise(r=>setTimeout(r,0));assert.equal(s.spawnAttempts,count);assert.equal(a.written.at(-1),'node -v\n');
    });
    await test('dispatch start flag preserves the dependency-install phase',async()=>{await shell('install-phase');s.setDevServerStarting(true);assert.equal(s.getState().startupStage,'installing');});
    await test('proof is recorded only after owned install hint and genuine server-ready', async () => {
      const a = await shell('server');
      await a.send('\r\nadded 61 packages in 1s\r\n');
      a.callbacks['server-ready'](5173, 'http://current');
      assert.equal(s.getInstalledFingerprint(), 'fingerprint');
      assert.equal(s.isAutomaticStartupBusy(), false);
    });
    await test('modern split npm error is classified; unknown child remains busy', async () => {
      const a = await shell('failure');
      await a.send('npm err');
      await a.send('or code ECONNRESET\r\n');
      assert.equal(s.getState().startupStage, 'error');
      const epoch = s.sessionEpoch;
      s.requestRestart('Retry Installation');
      assert.equal(s.sessionEpoch, epoch);
      assert.equal(s.automaticCommandDispatched(a.owner), false);
      assert.equal(s.getInstalledFingerprint(), null);
    });
    await test('an error after completion text cannot leave installed proof', async () => {
      const a = await shell('completion-then-error');
      s.setDevServerStarting(true);
      await a.send('\r\nadded 61 packages in 1s\r\n');
      await a.send('npm error code ECONNRESET\r\n');
      a.callbacks['server-ready'](5173, 'http://late-server');
      assert.equal(s.getInstalledFingerprint(), null);
    });
    await test('timeout is not npm exit and cannot duplicate automatic command', async () => {
      const a = await shell('timeout');
      s.markStartupUnknown(a.owner);
      assert.equal(s.getState().startupStage, 'error');
      assert.match(s.getState().runtimeError.message, /unknown/);
      assert.equal(s.beginAutomaticStartup('other', true, a.owner), null);
      assert.equal(s.getStartupDiagnostics().at(-1).state, 'timed_out');
    });
    await test('retired output and old timeout cannot mutate next project', async () => {
      const a = await shell('old');
      const oldAttempt = s.getStartupDiagnostics().at(-1).id;
      s.attachProject('new');
      assert.equal(s.getStartupDiagnostics().find(d => d.id === oldAttempt).state, 'cancelled');
      assert.equal(s.isAutomaticStartupBusy(), false);
      s.instance = {
        teardown() {},
        fs: {
          async readdir() {
            return [];
          },
        },
      };
      await a.send('\r\nadded 61 packages in 1s\r\n');
      s.markStartupUnknown(a.owner);
      assert.equal(s.getState().startupStage, 'idle');
      assert.equal(s.getInstalledFingerprint(), null);
    });
    await test('late shell spawn cannot add a diagnostic to the next project', async () => {
      s.attachProject('spawn-old');
      let resolveSpawn;
      s.instance = { teardown() {}, on() { return () => {}; }, spawn: () => new Promise(resolve => { resolveSpawn = resolve; }) };
      const pending = s.spawnInteractiveShell({cols:80,rows:24,onData(){}}).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 0));
      s.attachProject('spawn-new');
      resolveSpawn({kill(){}});
      await pending;
      assert.equal(s.getStartupDiagnostics().at(-1).events.some(e => e.phase === 'shell'), false);
    });
  }
} finally {
  s.detachProject();
  await fs.rm(dir, { recursive: true, force: true });
}
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
