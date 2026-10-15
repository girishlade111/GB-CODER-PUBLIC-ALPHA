import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = await fs.mkdtemp(path.resolve('scripts/.tmp-codex-rename-'));
const bundle = path.join(root, 'service.mjs');
await build({ entryPoints: ['src/services/webcontainer/webcontainerService.ts'], bundle: true,
  format: 'esm', outfile: bundle, external: ['@webcontainer/api'] });
const { webcontainerService: service, FileSyncCoordinator } = await import(pathToFileURL(bundle));
let passed = 0;
let failed = 0;
async function test(name, run) {
  try { await run(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.stack}`); }
}
function diskAdapter(base, overrides = {}) {
  const resolve = (name) => {
    const target = path.resolve(base, name);
    assert.ok(target === base || target.startsWith(base + path.sep), 'test path stays inside disposable directory');
    return target;
  };
  return { readFile: (p, ...args) => fs.readFile(resolve(p), ...args),
    writeFile: (p, ...args) => fs.writeFile(resolve(p), ...args),
    mkdir: (p, ...args) => fs.mkdir(resolve(p), ...args),
    readdir: (p, ...args) => fs.readdir(resolve(p), ...args),
    rm: (p, ...args) => fs.rm(resolve(p), ...args),
    rename: (a, b) => fs.rename(resolve(a), resolve(b)), ...overrides };
}
async function fixture(name, overrides = {}) {
  const base = path.join(root, name);
  await fs.mkdir(base);
  const disk = diskAdapter(base);
  service.attachProject(name);
  service.instance = { fs: { ...disk, ...overrides(disk) }, teardown() {} };
  return { base, disk };
}
const exdev = () => { throw Object.assign(new Error('cross device'), { code: 'EXDEV' }); };
try {
  await test('partial directory copy preserves every source byte', async () => {
    const { disk } = await fixture('partial', (disk) => ({ rename: exdev,
      writeFile: (p, bytes) => p === 'new/b.bin' ? Promise.reject(new Error('disk full')) : disk.writeFile(p, bytes) }));
    await disk.mkdir('old');
    await disk.writeFile('old/a.bin', new Uint8Array([0, 255, 128]));
    await disk.writeFile('old/b.bin', new Uint8Array([7, 0, 250]));
    await assert.rejects(service.renameFile('old', 'new'));
    assert.deepEqual(await disk.readFile('old/a.bin'), Buffer.from([0, 255, 128]));
    assert.deepEqual(await disk.readFile('old/b.bin'), Buffer.from([7, 0, 250]));
  });
  await test('destination collision preserves both files', async () => {
    const { disk } = await fixture('collision', () => ({}));
    await disk.writeFile('old.txt', 'source');
    await disk.writeFile('new.txt', 'existing');
    await assert.rejects(service.renameFile('old.txt', 'new.txt'));
    assert.equal(await disk.readFile('old.txt', 'utf8'), 'source');
    assert.equal(await disk.readFile('new.txt', 'utf8'), 'existing');
  });
  await test('failed physical move keeps pending edits at original path', async () => {
    const writes = [];
    const coordinator = new FileSyncCoordinator({ debounceMs: 10000,
      rawWrite: async (p, content) => { writes.push([p, content]); }, rawDelete: async () => {} });
    coordinator.setScope('pending');
    coordinator.queueSync('old.txt', 'latest');
    await assert.rejects(coordinator.handleRename('old.txt', 'new.txt', 100,
      async () => { throw new Error('permission denied'); }));
    await coordinator.flush();
    assert.deepEqual(writes, [['old.txt', 'latest']]);
  });
  await test('successful binary directory fallback copies bytes before removing source', async () => {
    const { disk } = await fixture('binary', () => ({ rename: exdev }));
    await disk.mkdir('old/sub', { recursive: true });
    await disk.writeFile('old/sub/data.bin', new Uint8Array([0, 255, 128, 17]));
    await service.renameFile('old', 'new');
    assert.deepEqual(await disk.readFile('new/sub/data.bin'), Buffer.from([0, 255, 128, 17]));
    await assert.rejects(disk.readFile('old/sub/data.bin'), { code: 'ENOENT' });
  });
  await test('flush waits for rename and includes edits queued during the move', async () => {
    const writes = [];
    let finish, enterMove;
    const entered = new Promise((r) => { enterMove = r; });
    const coordinator = new FileSyncCoordinator({ debounceMs: 10000,
      rawWrite: async (p, c) => { writes.push([p, c]); }, rawDelete: async () => {} });
    coordinator.setScope('flush');
    coordinator.queueSync('old.txt', 'before');
    const moving = coordinator.handleRename('old.txt', 'new.txt', 100,
      () => new Promise((r) => { finish = r; enterMove(); }));
    const flushing = coordinator.flush();
    await entered;
    coordinator.queueSync('old.txt', 'during');
    finish(); await moving;
    assert.equal((await flushing).ok, true);
    assert.deepEqual(writes, [['old.txt', 'before'], ['new.txt', 'during']]);
  });
  await test('failed delete keeps the latest pending edit', async () => {
    const writes = [];
    const coordinator = new FileSyncCoordinator({ debounceMs: 10000,
      rawWrite: async (p, c) => { writes.push([p, c]); }, rawDelete: async () => { throw new Error('permission denied'); } });
    coordinator.setScope('delete'); coordinator.queueSync('keep.txt', 'latest');
    await assert.rejects(coordinator.handleDelete('keep.txt'));
    await coordinator.flush();
    assert.deepEqual(writes, [['keep.txt', 'latest']]);
  });
  await test('permission errors do not invoke copy fallback', async () => {
    let copied = false;
    const { disk } = await fixture('permission', () => ({
      rename: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); },
      writeFile: async () => { copied = true; },
    }));
    await disk.writeFile('old.txt', 'safe');
    await assert.rejects(service.renameFile('old.txt', 'new.txt'), { code: 'EACCES' });
    assert.equal(copied, false);
    assert.equal(await disk.readFile('old.txt', 'utf8'), 'safe');
  });
  await test('invalid paths are rejected before filesystem mutation', async () => {
    let removed = false;
    await fixture('invalid', () => ({ rm: async () => { removed = true; } }));
    await assert.rejects(service.deleteFile('../'), /Invalid delete path/);
    await assert.rejects(service.renameFile('old', 'old/inside'), /Invalid rename path/);
    assert.equal(removed, false);
  });
  await test('rename immediately after queued creation materializes the source first', async () => {
    const { disk } = await fixture('new-file', () => ({}));
    await service.syncFile('fresh.js', 'export const fresh = 1;');
    await service.renameFile('fresh.js', 'renamed.js');
    await service.flushFileSync();
    assert.equal(await disk.readFile('renamed.js', 'utf8'), 'export const fresh = 1;');
    await assert.rejects(disk.readFile('fresh.js'), { code: 'ENOENT' });
  });
} finally {
  service.cancelPendingSync();
  service.instance = null;
  // root was created by this script inside scripts/, never a user data directory.
  await fs.rm(root, { recursive: true, force: true });
}
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
