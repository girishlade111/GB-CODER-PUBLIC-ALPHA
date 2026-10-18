import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {
  sha,
  artifactKey,
  cloneBinary,
  validateBinaryArtifact,
  restoreBinaryChoice,
  verifyBinary,
  BinaryMemoryStore,
  CAPS_BINARY,
  sameOwner,
  resolveExecutableTarget,
  validatePermissionRepairPath
} from './policy.mjs';

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

const dir = 'scripts/.tmp-b4-4';
const fixtures = JSON.parse(fs.readFileSync(path.join(dir, 'fixtures.json'), 'utf8'));

// 1. Diagnostic script syntax validation (prevent task-365 failure)
await test('1. Diagnostic script syntax validation', async () => {
  const browserCode = fs.readFileSync(path.join(dir, 'browser.mjs'), 'utf8');
  const match = browserCode.match(/const DIAG_SCRIPT = `([\s\S]*?)`;/);
  assert.ok(match, 'DIAG_SCRIPT must be defined in browser.mjs');
  const scriptContent = match[1];

  // Must parse as valid Node.js / JavaScript syntax without throwing
  assert.doesNotThrow(() => {
    new vm.Script(scriptContent, { filename: 'diagnostic-preflight.cjs' });
  }, 'DIAG_SCRIPT has JavaScript syntax errors');
});

// 2. Diagnostic script execution in mock filesystem
await test('2. Diagnostic script execution in mock filesystem', async () => {
  const browserCode = fs.readFileSync(path.join(dir, 'browser.mjs'), 'utf8');
  const match = browserCode.match(/const DIAG_SCRIPT = `([\s\S]*?)`;/);
  const scriptContent = match[1];

  const tmpTestDir = path.join(dir, '.test-diag-tmp');
  fs.mkdirSync(path.join(tmpTestDir, 'node_modules', '.bin'), { recursive: true });
  fs.mkdirSync(path.join(tmpTestDir, 'node_modules', 'vite', 'bin'), { recursive: true });

  const dummyViteTarget = path.join(tmpTestDir, 'node_modules', 'vite', 'bin', 'vite.js');
  fs.writeFileSync(dummyViteTarget, '#!/usr/bin/env node\nconsole.log("vite");\n', { mode: 0o755 });

  const symlinkSource = path.join(tmpTestDir, 'node_modules', '.bin', 'vite');
  try {
    fs.unlinkSync(symlinkSource);
  } catch {}

  try {
    fs.symlinkSync('../vite/bin/vite.js', symlinkSource);
  } catch (e) {
    // On Windows without Developer Mode, file symlink or copy
    fs.writeFileSync(symlinkSource, 'symlink-stub');
  }

  const diagPath = path.join(tmpTestDir, 'diag.cjs');
  fs.writeFileSync(diagPath, scriptContent);

  const output = execFileSync(process.execPath, ['diag.cjs'], {
    cwd: tmpTestDir,
    encoding: 'utf8'
  });

  const parsed = JSON.parse(output.trim());
  assert.ok(parsed.symlinkInfo.exists, 'Symlink probe must report exists: true');
  assert.ok(parsed.targetInfo.exists, 'Target probe must report exists: true');
  assert.equal(parsed.targetPath, 'node_modules/vite/bin/vite.js');

  // Clean up mock directory
  fs.rmSync(tmpTestDir, { recursive: true, force: true });
});

// 3. Shell command invocation argument safety check
await test('3. Shell command invocation argument safety check', async () => {
  const browserCode = fs.readFileSync(path.join(dir, 'browser.mjs'), 'utf8');
  // Match all command(...) calls
  const commandCalls = [...browserCode.matchAll(/command\s*\([^)]+?\)/g)];
  assert.ok(commandCalls.length >= 4, 'Must find command invocations in browser.mjs');

  // Verify no inline multiline template literals are passed into command args
  assert.ok(!browserCode.includes("['-e', DIAG_SCRIPT]"), 'DIAG_SCRIPT must never be passed via -e');
  assert.ok(browserCode.includes("'node_modules/.b4-4-diag.cjs'"), 'Diagnostics must run via VFS script file');
});

// 4. Vue fixture integrity & exact SHA-256 verification
await test('4. Vue fixture integrity & exact SHA-256 verification', async () => {
  const vue = fixtures.vue;
  assert.ok(vue, 'Vue fixture missing in fixtures.json');
  assert.equal(vue.project, 'B');
  assert.equal(vue.incarnation, 'synthetic-vue-1');
  assert.equal(vue.marker, 'B44_VUE_B');
  assert.equal(vue.packages, 78);

  const vuePkgRaw = fs.readFileSync(path.join(dir, 'vue', 'package.json'), 'utf8');
  const vueLockRaw = fs.readFileSync(path.join(dir, 'vue', 'package-lock.json'), 'utf8');

  const shaCalc = data => crypto.createHash('sha256').update(data).digest('hex');
  assert.equal(shaCalc(vuePkgRaw), vue.manifestSha, 'vue/package.json SHA mismatch with fixture manifestSha');
  assert.equal(shaCalc(vueLockRaw), vue.lockSha, 'vue/package-lock.json SHA mismatch with fixture lockSha');

  // Verify dev script
  const pkgObj = JSON.parse(vuePkgRaw);
  assert.equal(pkgObj.scripts.dev, 'vite --host 0.0.0.0 --port 5173 --strictPort');
  assert.equal(pkgObj.dependencies.vue, '3.5.13');
  assert.equal(pkgObj.devDependencies.vite, '5.4.21');

  // Verify main.js contains expected marker
  assert.ok(vue.files['src/main.js'].includes('B44_VUE_B'), 'src/main.js does not render B44_VUE_B marker');
});

// 5. Vue executable target resolution
await test('5. Vue executable target resolution', async () => {
  const resolved = resolveExecutableTarget('node_modules/.bin/vite', '../vite/bin/vite.js');
  assert.equal(resolved, 'node_modules/vite/bin/vite.js');

  // Escaping target must throw
  assert.throws(() => {
    resolveExecutableTarget('node_modules/.bin/vite', '../../package.json');
  }, /escapes/);
});

// 6. Vue permission repair path validation
await test('6. Vue permission repair path validation', async () => {
  const valid = validatePermissionRepairPath('node_modules/vite/bin/vite.js');
  assert.equal(valid, 'node_modules/vite/bin/vite.js');

  // Outside paths must throw
  assert.throws(() => validatePermissionRepairPath('src/main.js'), /strictly inside node_modules/);
  assert.throws(() => validatePermissionRepairPath('package.json'), /strictly inside node_modules/);
  assert.throws(() => validatePermissionRepairPath('/etc/passwd'), /Unsafe/);
});

// 7. Vue vs React artifact key isolation
await test('7. Vue vs React artifact key isolation', async () => {
  const react = fixtures.react;
  const vue = fixtures.vue;
  const runtime = { node: '22.22.3', platform: 'linux', arch: 'x64', npm: '10.8.2', api: '1.6.4' };
  const flags = ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0'];

  const keyReact = await artifactKey({
    project: react.project,
    incarnation: react.incarnation,
    manifestSha: react.manifestSha,
    lockSha: react.lockSha,
    configSha: react.configSha,
    flags,
    runtime,
    api: '1.6.4',
    policy: 2,
    format: 'binary'
  });

  const keyVue = await artifactKey({
    project: vue.project,
    incarnation: vue.incarnation,
    manifestSha: vue.manifestSha,
    lockSha: vue.lockSha,
    configSha: vue.configSha,
    flags,
    runtime,
    api: '1.6.4',
    policy: 2,
    format: 'binary'
  });

  assert.notEqual(keyReact, keyVue, 'React and Vue keys must be strictly isolated');
});

// 8. Vue owner propagation and cross-project rejection
await test('8. Vue owner propagation and cross-project rejection', async () => {
  const mockInstanceProducer = { id: 'wc-vue-producer' };
  const mockInstanceConsumer = { id: 'wc-vue-consumer' };

  const vueProducerOwner = {
    project: 'B',
    incarnation: 'synthetic-vue-1',
    epoch: 1,
    generation: 1,
    instance: mockInstanceProducer
  };

  const vueConsumerOwner = {
    project: 'B',
    incarnation: 'synthetic-vue-1',
    epoch: 2,
    generation: 2,
    instance: mockInstanceConsumer
  };

  const reactOwner = {
    project: 'A',
    incarnation: 'synthetic-react-1',
    epoch: 1,
    generation: 1,
    instance: mockInstanceProducer
  };

  assert.ok(sameOwner(vueProducerOwner, vueProducerOwner));
  assert.ok(!sameOwner(vueProducerOwner, reactOwner), 'Vue producer must not match React owner');
  assert.ok(!sameOwner(vueProducerOwner, vueConsumerOwner), 'Different runtime instances must not match sameOwner');
});

// 9. Transient store Vue artifact retention & single-artifact policy
await test('9. Transient store Vue artifact retention & single-artifact policy', async () => {
  const store = new BinaryMemoryStore();
  const dummyPayload = new Uint8Array([1, 2, 3, 4]);

  const mockInstance = { id: 'wc-mock' };
  const owner = { project: 'B', incarnation: 'synthetic-vue-1', epoch: 1, generation: 1, instance: mockInstance };

  const artifact = {
    payload: dummyPayload,
    sha256: await sha(dummyPayload),
    byteLength: dummyPayload.byteLength,
    probeSha256: 'p1',
    key: 'key-vue-1',
    project: 'B',
    incarnation: 'synthetic-vue-1',
    createdAt: Date.now(),
    producer: { project: 'B', incarnation: 'synthetic-vue-1', epoch: 1, generation: 1, runtimeId: 1 }
  };

  store.publish(artifact, owner, owner);
  assert.ok(store.record, 'Store must retain artifact');
  assert.equal(store.record.project, 'B');

  // React consumer must not be able to take Vue artifact
  const wrongProject = store.take('A');
  assert.equal(wrongProject, null, 'Cross-project artifact take must return null');

  // Vue consumer takes artifact
  const taken = store.take('B');
  assert.ok(taken, 'Vue consumer must receive Vue artifact');
  assert.equal(taken.project, 'B');
});

// 10. Synthetic binary payload cloning
await test('10. Synthetic binary payload cloning', async () => {
  const original = new Uint8Array([10, 20, 30, 40]);
  const clone = cloneBinary(original);
  assert.notEqual(clone.buffer, original.buffer, 'Clone must have separate ArrayBuffer');
  assert.deepEqual(clone, original);
});

// 11. Safe shell exit and quarantine on consumer failure
await test('11. Safe shell exit and quarantine on consumer failure', async () => {
  const store = new BinaryMemoryStore();
  const dummyPayload = new Uint8Array([1, 2, 3]);
  const mockInstance = { id: 'wc-mock' };
  const owner = { project: 'B', incarnation: 'synthetic-vue-1', epoch: 1, generation: 1, instance: mockInstance };

  store.publish({
    payload: dummyPayload,
    sha256: await sha(dummyPayload),
    byteLength: dummyPayload.byteLength,
    probeSha256: 'p1',
    key: 'key-1',
    project: 'B',
    incarnation: 'synthetic-vue-1',
    createdAt: Date.now(),
    producer: { project: 'B', incarnation: 'synthetic-vue-1', epoch: 1, generation: 1, runtimeId: 1 }
  }, owner, owner);

  assert.ok(store.record);
  // Simulate consumer failure
  store.quarantine('B');
  assert.equal(store.record, null, 'Quarantined record must be cleared from store');
  assert.equal(store.take('B'), null, 'Subsequent take must fail');
});

// 12. Offline bundle compilation check
await test('12. Offline bundle compilation check', async () => {
  const outfile = path.join(dir, 'test-bundle-check.js');
  await build({
    entryPoints: [path.join(dir, 'browser.mjs')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022'
  });
  assert.ok(fs.existsSync(outfile), 'Bundle file must be generated');
  fs.unlinkSync(outfile);
});

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(JSON.stringify({ passed, failed, results }));
process.exitCode = failed === 0 ? 0 : 1;
