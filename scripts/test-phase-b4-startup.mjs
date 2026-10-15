import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await fs.mkdtemp(path.resolve('scripts/.tmp-b4-module-'));
await build({
  entryPoints: ['src/services/webcontainer/webcontainerService.ts'],
  bundle: true,
  format: 'esm',
  outfile: dir + '/service.mjs',
  plugins: [
    {
      name: 'mock-api',
      setup(b) {
        b.onResolve({ filter: /^@webcontainer\/api$/ }, () => ({
          path: 'api',
          namespace: 'test',
        }));
        b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
          contents:
            'export const WebContainer = {boot:async()=>{throw Error("Unexpected boot")}}',
        }));
      },
    },
  ],
});
const { webcontainerService: s, computeDependencyFingerprint: fp } =
  await import(pathToFileURL(dir + '/service.mjs'));
const files = [
  { path: 'package.json', content: '{"dependencies":{"react":"18.3.1"}}' },
];
function runtime(entries = ['react', '.bin']) {
  return {
    teardown() {},
    on() {
      return () => {};
    },
    fs: {
      async readdir(p) {
        return p === 'node_modules' ? entries : [];
      },
    },
  };
}
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
try {
  await test('help-only node_modules is not installed dependencies', async () => {
    s.attachProject('help');
    s.instance = runtime(['.bin']);
    assert.equal(await s.isDependenciesInstalled(), false);
  });
  await test('runtime retirement invalidates installed proof', async () => {
    s.attachProject('old');
    s.instance = runtime();
    s.recordInstallComplete(fp(files));
    s.attachProject('new');
    assert.equal(s.getInstalledFingerprint(), null);
  });
  await test('same-length lockfile tail changes invalidate fingerprint', () => {
    const prefix = 'a'.repeat(600);
    assert.notEqual(
      fp([...files, { path: 'package-lock.json', content: prefix + 'X' }]),
      fp([...files, { path: 'package-lock.json', content: prefix + 'Y' }]),
    );
  });
  await test('late install completion cannot mark another project installed', () => {
    s.attachProject('late-A');
    s.instance = runtime();
    const owner = {
      projectId: s.activeProjectId,
      epoch: s.sessionEpoch,
      generation: s.runtimeGeneration,
      instance: s.instance,
    };
    s.attachProject('late-B');
    s.instance = runtime();
    s.recordInstallComplete(fp(files), owner);
    assert.equal(s.getInstalledFingerprint(), null);
  });
  await test('same-project reuse keeps proof but replacement instance does not', async () => {
    s.attachProject('same');
    const r = runtime();
    s.instance = r;
    s.recordInstallComplete(fp(files));
    s.attachProject('same');
    assert.equal(s.instance, r);
    assert.equal((await s.needsDependencyInstall(files)).needsInstall, false);
    s.instance = runtime();
    assert.equal((await s.needsDependencyInstall(files)).needsInstall, true);
  });
  await test('fingerprint input order is stable and full manifest/config are included', () => {
    const lock = { path: 'yarn.lock', content: 'lock' };
    assert.equal(fp([...files, lock]), fp([lock, ...files]));
    assert.notEqual(
      fp(files),
      fp([...files, { path: '.npmrc', content: 'legacy-peer-deps=false' }]),
    );
  });
} finally {
  s.instance = null;
  await fs.rm(dir, { recursive: true, force: true });
}
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
