import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = await fs.mkdtemp(path.resolve('scripts/.tmp-b4-2a-exit-'));
await build({ entryPoints: ['src/services/webcontainer/webcontainerService.ts'], bundle: true,
  format: 'esm', outfile: root + '/service.mjs', plugins: [{ name: 'controlled-api', setup(b) {
    b.onResolve({ filter: /^@webcontainer\/api$/ }, () => ({ path: 'api', namespace: 'mock' }));
    b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({
      contents: 'export const WebContainer={boot:async()=>{throw Error("unexpected boot")}}',
    }));
  } }] });
const { webcontainerService: service } = await import(pathToFileURL(root + '/service.mjs'));
const unhandled = [], results = [];
const onUnhandled = (reason, promise) => unhandled.push({ reason, promise });
process.on('unhandledRejection', onUnhandled);
const settle = () => new Promise(resolve => setImmediate(() => setImmediate(resolve)));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function shell(project, { runtime, forceRestart = false } = {}) {
  service.attachProject(project);
  const exit = deferred(), writes = [], callbacks = {};
  const process = { exit: exit.promise, output: new ReadableStream(),
    input: new WritableStream({ write(value) { writes.push(value); } }),
    kill() {}, resize() {},
  };
  const instance = runtime || { teardown() {}, fs: { async readdir() { return ['react']; } },
    on(name, fn) { callbacks[name] = fn; return () => {}; } };
  instance.spawn = async () => process;
  service.instance = instance;
  service.setupServerListeners(instance);
  const handle = await service.spawnInteractiveShell({ cols: 80, rows: 24, onData() {}, forceRestart });
  return { project, exit, writes, callbacks, instance, process, handle, owner: service.captureStartupOwner() };
}
function start(a) {
  const owner = service.beginAutomaticStartup('pending-' + a.project, true, a.owner);
  assert.ok(owner);
  assert.equal(service.automaticCommandDispatched(owner), true);
  return owner;
}
const fingerprint = project => 'verified-' + project;
function protectedState() {
  return { state: JSON.stringify(service.getState()), diagnostics: JSON.stringify(service.getStartupDiagnostics()),
    proof: service.getInstalledFingerprint(), operation: service.automaticStartup,
    operationState: JSON.stringify(service.automaticStartup && {
      dispatched: service.automaticStartup.dispatched,
      completionObserved: service.automaticStartup.completionObserved,
      fingerprint: service.automaticStartup.fingerprint,
      ownerProject: service.automaticStartup.owner.projectId,
      ownerEpoch: service.automaticStartup.owner.epoch,
      ownerGeneration: service.automaticStartup.owner.generation,
    }), watchdog: service.startupWatchdog,
    instance: service.instance, shell: service.shellProcess, writer: service.shellWriter,
    epoch: service.getSessionEpoch(), spawns: service.getSpawnAttempts() };
}
function unchanged(before) {
  const after = protectedState();
  for (const key of Object.keys(before)) assert.equal(after[key], before[key], 'Old shell changed ' + key);
}
async function test(name, fn) {
  const before = unhandled.length;
  try {
    await fn();
    await settle();
    assert.equal(unhandled.length - before, 0, 'Unhandled derived shell-exit rejection');
    results.push({ name, status: 'PASS', unhandledRejections: 0 });
    console.log('PASS ' + name);
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message,
      unhandledRejections: unhandled.length - before });
    console.error('FAIL ' + name + ': ' + error.message);
  }
}
try {
  await test('A retires, B owns proof/operation: old rejection is consumed without mutation', async () => {
    const a = await shell('A');
    const b = await shell('B');
    service.recordInstallComplete(fingerprint('B'), b.owner);
    start(b);
    const before = protectedState();
    a.exit.reject(new Error('Process aborted'));
    await settle();
    unchanged(before);
    const newUnhandled = unhandled.filter(item => item.promise !== a.exit.promise);
    if (newUnhandled.length) console.log('Observed rejection of a derived promise; next-project state remained unchanged.');
  });
  if (!process.argv.includes('--retirement-only')) {
    await test('B retires on return to A: delayed rejection cannot corrupt new A', async () => {
      const b = await shell('return-B');
      const a = await shell('return-A');
      service.recordInstallComplete(fingerprint('return-A'), a.owner);
      const before = protectedState();
      b.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('full teardown: rejection cannot alter detached runtime or diagnostics', async () => {
      const a = await shell('teardown');
      service.detachProject();
      const before = protectedState();
      a.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('replacement shell in same runtime keeps proof, operation and manual input', async () => {
      const old = await shell('replacement');
      const current = await shell('replacement', { runtime: old.instance, forceRestart: true });
      service.recordInstallComplete(fingerprint('replacement'), current.owner);
      start(current);
      const before = protectedState();
      old.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
      current.handle.write('node -v\n');
      await settle(); assert.equal(current.writes.at(-1), 'node -v\n');
    });
    await test('runtime-instance replacement rejects an old shell even without a generation change', async () => {
      const old = await shell('instance');
      service.instance = { teardown() {}, fs: { async readdir() { return ['react']; } } };
      const before = protectedState();
      old.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('runtime replacement during delayed spawn cannot lend its owner to the old process', async () => {
      service.attachProject('delayed-spawn-owner');
      const spawn = deferred(), exit = deferred();
      service.instance = { teardown() {}, spawn: () => spawn.promise };
      const pending = service.spawnInteractiveShell({ cols: 80, rows: 24, onData() {} });
      await settle();
      service.instance = { teardown() {}, fs: { async readdir() { return ['react']; } } };
      spawn.resolve({ exit: exit.promise, output: new ReadableStream(), input: new WritableStream(), kill() {}, resize() {} });
      await pending;
      service.recordInstallComplete('replacement-runtime-proof', service.captureStartupOwner());
      const before = protectedState();
      exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('project identity mismatch alone consumes rejection without a current-project mutation', async () => {
      const a = await shell('project-owner');
      service.activeProjectId = 'different-project-owner';
      const before = protectedState();
      a.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('active automatic shell rejects: unknown outcome, no proof or duplicate startup', async () => {
      const a = await shell('active'); start(a);
      a.exit.reject(new Error('Process aborted'));
      await settle();
      assert.equal(service.getState().startupStage, 'error');
      assert.equal(service.getStartupDiagnostics().at(-1).state, 'unknown');
      assert.ok(service.getStartupDiagnostics().at(-1).events.some(e => e.phase === 'shell' && e.outcome === 'unknown'));
      assert.equal(service.getInstalledFingerprint(), null);
      assert.equal(service.isAutomaticStartupBusy(), true);
      assert.equal(service.beginAutomaticStartup('duplicate', true, a.owner), null);
      assert.equal(service.automaticCommandDispatched(a.owner), false);
      const epoch = service.getSessionEpoch(), spawns = service.getSpawnAttempts();
      service.requestRestart('Explicit retry');
      assert.equal(service.getSessionEpoch(), epoch); assert.equal(service.getSpawnAttempts(), spawns);
      assert.equal(service.shellProcess, null); assert.equal(service.shellWriter, null);
    });
    await test('completion hint then rejected exit cannot accept a late server event as installed proof', async () => {
      const a = await shell('hint-then-reject'); start(a);
      service.setDevServerStarting(true);
      service.observeStartupOutput('\nadded 61 packages in 1s\n');
      a.exit.reject(new Error('Process aborted'));
      await settle();
      a.callbacks['server-ready'](5173, 'http://synthetic-late-server');
      assert.equal(service.getState().startupStage, 'error');
      assert.equal(service.getInstalledFingerprint(), null);
      assert.equal(service.isAutomaticStartupBusy(), true);
      assert.equal(service.getStartupDiagnostics().at(-1).state, 'unknown');
    });
    await test('current shell survives a session restart: rejection belongs to the current epoch', async () => {
      const a = await shell('epoch-reuse');
      service.recordInstallComplete(fingerprint('epoch-reuse'), a.owner);
      service.requestRestart('same runtime');
      const owner = service.captureStartupOwner();
      assert.notEqual(owner.epoch, a.owner.epoch);
      service.beginAutomaticStartup(fingerprint('epoch-reuse'), false, owner);
      service.automaticCommandDispatched(owner);
      a.exit.reject(new Error('Process aborted'));
      await settle();
      assert.equal(service.getStartupDiagnostics().at(-1).epoch, owner.epoch);
      assert.equal(service.getStartupDiagnostics().at(-1).state, 'unknown');
      assert.equal(service.getInstalledFingerprint(), fingerprint('epoch-reuse'));
      assert.equal(service.isAutomaticStartupBusy(), true);
    });
    await test('stale automatic-operation epoch cannot authorize active-owner rejection mutations', async () => {
      const a = await shell('stale-epoch'); start(a);
      service.sessionEpoch++;
      const before = protectedState();
      a.exit.reject(new Error('Process aborted'));
      await settle(); unchanged(before);
    });
    await test('manual shell rejection after a completed attempt gets a new sanitized record', async () => {
      const a = await shell('manual-completed');
      service.recordInstallComplete(fingerprint('manual-completed'), a.owner);
      service.setPreviewStatus('ready');
      const prior = service.getStartupDiagnostics().at(-1);
      a.exit.reject(new Error('PRIVATE_SOURCE_MARKER authorization=PRIVATE_SECRET_MARKER'));
      await settle();
      const records = service.getStartupDiagnostics(), current = records.at(-1);
      assert.equal(records.find(r => r.id === prior.id).state, 'succeeded');
      assert.notEqual(current.id, prior.id); assert.equal(current.state, 'unknown');
      assert.equal(service.getState().startupStage, 'error');
      assert.equal(service.getInstalledFingerprint(), fingerprint('manual-completed'));
      const diagnostic = JSON.stringify(records);
      assert.equal(diagnostic.includes('PRIVATE_'), false);
      assert.equal(JSON.stringify(service.getState()).includes('PRIVATE_'), false);
      assert.equal(current.events.some(e => 'exitCode' in e), false);
    });
    await test('prior inferred failure remains preserved when the same shell subsequently rejects', async () => {
      const a = await shell('prior-failure'); start(a);
      service.observeStartupOutput('npm error code ECONNRESET\n');
      const failed = service.getStartupDiagnostics().at(-1);
      assert.equal(failed.state, 'failed');
      a.exit.reject(new Error('Process aborted'));
      await settle();
      const records = service.getStartupDiagnostics();
      assert.deepEqual(records.find(r => r.id === failed.id), failed);
      assert.equal(records.at(-1).state, 'unknown');
      assert.equal(service.isAutomaticStartupBusy(), true);
    });
    for (const code of [0, 7]) {
      await test('fulfilled numeric shell exit ' + code + ' keeps its existing handling', async () => {
        const a = await shell('numeric-' + code);
        service.setStartupStage('starting_server');
        a.exit.resolve(code); await settle();
        assert.equal(service.getState().startupStage, code === 0 ? 'idle' : 'error');
        const event = service.getStartupDiagnostics().at(-1).events.find(e => e.phase === 'shell' && 'exitCode' in e);
        assert.equal(event.exitCode, code); assert.equal(service.shellProcess, null);
      });
      await test('fulfilled numeric exit ' + code + ' during automatic startup does not fabricate npm exit', async () => {
        const a = await shell('numeric-auto-' + code); start(a);
        a.exit.resolve(code); await settle();
        const record = service.getStartupDiagnostics().at(-1);
        assert.equal(record.state, 'unknown'); assert.equal(service.isAutomaticStartupBusy(), true);
        assert.equal(record.events.find(e => 'exitCode' in e)?.exitCode, code);
        assert.equal(record.events.some(e => e.phase === 'install' && 'exitCode' in e), false);
      });
    }
    await test('same-runtime manual reconnect retains the existing shell and forwards input', async () => {
      const a = await shell('manual-input');
      const spawns = service.getSpawnAttempts(); a.handle.disconnect();
      const handle = await service.spawnInteractiveShell({ cols: 80, rows: 24, onData() {} });
      handle.write('printf safe-manual-input\n'); await settle();
      assert.equal(a.writes.at(-1), 'printf safe-manual-input\n');
      assert.equal(service.getSpawnAttempts(), spawns);
    });
  }
} finally {
  service.detachProject();
  await settle();
  process.removeListener('unhandledRejection', onUnhandled);
  // root is the exact directory created by mkdtemp within scripts.
  assert.ok(root.startsWith(path.resolve('scripts') + path.sep));
  await fs.rm(root, { recursive: true, force: true });
}
const evidenceArg = process.argv.find(arg => arg.startsWith('--evidence='));
if (evidenceArg) await fs.writeFile(evidenceArg.slice('--evidence='.length), JSON.stringify({ results,
  unhandledRejections: unhandled.length, derivedRejections: unhandled.filter(e => e.promise).length }, null, 2));
console.log(`${results.filter(r => r.status === 'PASS').length} passed, ${results.filter(r => r.status === 'FAIL').length} failed`);
process.exitCode = results.some(r => r.status !== 'PASS') ? 1 : 0;
