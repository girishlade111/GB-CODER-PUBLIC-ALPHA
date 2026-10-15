import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = await fs.mkdtemp(path.resolve('scripts/.tmp-codex-runtime-'));
let bootFactory;
globalThis.__codexTestAPI = { boot: () => bootFactory() };
const bundle = path.join(root, 'service.mjs');
await build({ entryPoints: ['src/services/webcontainer/webcontainerService.ts'], bundle: true,
  format: 'esm', outfile: bundle, plugins: [{ name: 'controlled-runtime', setup(b) {
    b.onResolve({ filter: /^@webcontainer\/api$/ }, () => ({ path: 'api', namespace: 'test' }));
    b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const WebContainer = globalThis.__codexTestAPI;' }));
  } }] });
const { webcontainerService: service } = await import(pathToFileURL(bundle));
let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`PASS ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}: ${e.stack}`); }
}
function runtime() {
  const files = new Map();
  const events = {};
  const container = { destroyed: false, files, events,
    teardown() { this.destroyed = true; },
    on(name, fn) { events[name] = fn; return () => {}; },
    async mount(tree) {
      assert.equal(this.destroyed, false);
      for (const [name, node] of Object.entries(tree)) files.set(name, node);
    },
    fs: { writeFile: async (p, content) => {
      assert.equal(container.destroyed, false); files.set(p, content);
    } } };
  return container;
}
try {
  await test('retired runtime events cannot claim the next project even with prompt ready', async () => {
    service.attachProject('events-A');
    const a = runtime(); service.instance = a; service.setupServerListeners(a);
    service.setDevServerStarting(true);
    a.events['server-ready'](5173, 'http://old-A');
    service.attachProject('events-B');
    const b = runtime(); service.instance = b; service.setupServerListeners(b);
    service.setDevServerStarting(true); service.setShellPromptReady(true);
    a.events['server-ready'](5173, 'http://late-A');
    a.events.port(5173, 'open', 'http://late-A');
    assert.equal(service.getState().serverUrl, null);
    assert.equal(a.destroyed, true);
    b.events['server-ready'](5173, 'http://new-B');
    assert.equal(service.getState().serverUrl, 'http://new-B');
  });
  await test('switch to nested-manifest project does not retain the previous root manifest', async () => {
    service.attachProject('mount-A');
    bootFactory = async () => runtime();
    service.isSupported = () => true;
    await service.mountProject([{ path: 'package.json', content: '{}' }, { path: 'old-only.txt', content: 'A' }]);
    const a = service.instance;
    service.attachProject('mount-B');
    await service.mountProject([{ path: 'packages/client/package.json', content: '{}' }]);
    assert.notEqual(service.instance, a);
    assert.equal(a.destroyed, true);
    assert.equal(service.instance.files.has('package.json'), false);
    assert.equal(service.instance.files.has('old-only.txt'), false);
  });
  await test('delayed old boot is retired before the next boot starts', async () => {
    service.detachProject();
    service.attachProject('boot-A');
    service.instance = null;
    service.bootPromise = null;
    globalThis.__GBCODER_WEBCONTAINER_INSTANCE__ = null;
    globalThis.__GBCODER_WEBCONTAINER_BOOT_PROMISE__ = null;
    let resolveA, calls = 0;
    const a = runtime(), b = runtime();
    bootFactory = () => { calls++; return calls === 1 ? new Promise((r) => { resolveA = r; }) : Promise.resolve(b); };
    const oldBoot = service.boot();
    // Attach rejection handler before retiring the pending boot.
    const outcome = oldBoot.then(() => ({ rejected: false }), (error) => ({ rejected: true, error }));
    while (!resolveA) await new Promise((r) => setTimeout(r, 0));
    service.attachProject('boot-B');
    const newBoot = service.boot();
    await new Promise((r) => setTimeout(r, 0));
    const callsBeforeRetirement = calls;
    resolveA(a);
    const result = await outcome;
    assert.equal(callsBeforeRetirement, 1);
    assert.equal(result.rejected, true);
    assert.match(result.error.message, /changed|retired|superseded/i);
    assert.equal(await newBoot, b);
    assert.equal(a.destroyed, true);
    assert.equal(calls, 2);
  });
  await test('old write delayed in mkdir cannot write into the next runtime', async () => {
    service.attachProject('write-A');
    const a = runtime(); let finish, entered;
    const started = new Promise((r) => { entered = r; });
    a.fs.mkdir = async () => { entered(); await new Promise((r) => { finish = r; }); };
    service.instance = a;
    await service.syncFile('src/data.js', 'old-A');
    const flushing = service.flushFileSync();
    await started;
    service.attachProject('write-B');
    const b = runtime(); service.instance = b;
    finish();
    assert.equal((await flushing).ok, false);
    assert.equal(b.files.has('src/data.js'), false);
    assert.equal(a.files.has('src/data.js'), false);
  });
  await test('mount delayed across a switch cannot mutate the next runtime', async () => {
    service.attachProject('delayed-mount-A');
    const a = runtime(), b = runtime(); let finish, entered;
    const started = new Promise((r) => { entered = r; });
    a.mount = async () => { entered(); await new Promise((r) => { finish = r; }); assert.equal(a.destroyed, false); };
    bootFactory = async () => a;
    const mountingA = service.mountProject([{ path: 'old-only.js', content: 'A' }]);
    await started;
    service.attachProject('delayed-mount-B');
    bootFactory = async () => b;
    const mountingB = service.mountProject([{ path: 'current.js', content: 'B' }]);
    finish();
    assert.equal(await mountingA, false);
    assert.equal(await mountingB, true);
    assert.equal(service.instance, b);
    assert.equal(b.files.has('old-only.js'), false);
    assert.equal(b.files.has('current.js'), true);
  });
} finally {
  service.instance = null;
  service.cancelPendingSync();
  await fs.rm(root, { recursive: true, force: true });
  delete globalThis.__codexTestAPI;
}
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
