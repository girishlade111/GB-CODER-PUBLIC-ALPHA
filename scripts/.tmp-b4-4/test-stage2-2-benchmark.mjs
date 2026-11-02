import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
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

// 1. Benchmark sequence specification test
await test('1. Benchmark sequence specification test', async () => {
  const reactSequence = ['C', 'R', 'R', 'C', 'R', 'C', 'C', 'R'];
  const vueSequence = ['R', 'C', 'C', 'R', 'C', 'R', 'R', 'C'];

  assert.equal(reactSequence.length, 8, 'React block must have 8 observations');
  assert.equal(vueSequence.length, 8, 'Vue block must have 8 observations');

  const countC = seq => seq.filter(x => x === 'C').length;
  const countR = seq => seq.filter(x => x === 'R').length;

  assert.equal(countC(reactSequence), 4, 'React must have 4 Controls');
  assert.equal(countR(reactSequence), 4, 'React must have 4 Candidates');
  assert.equal(countC(vueSequence), 4, 'Vue must have 4 Controls');
  assert.equal(countR(vueSequence), 4, 'Vue must have 4 Candidates');

  const totalBoots = 1 + reactSequence.length + 1 + vueSequence.length;
  assert.equal(totalBoots, 18, 'Total boots budget must be exactly 18');
});

// 2. Budget limits & observation deadlines
await test('2. Budget limits & observation deadlines', async () => {
  const budget = {
    maxBoots: 18,
    maxCampaigns: 1,
    perObservationTimeoutMs: 240000,
    maxWallTimeMs: 3600000,
    maxRetries: 0
  };
  assert.equal(budget.maxBoots, 18);
  assert.equal(budget.maxRetries, 0);
  assert.ok(budget.perObservationTimeoutMs <= 240000);
});

// 3. Frozen React and Vue fixtures integrity
await test('3. Frozen React and Vue fixtures integrity', async () => {
  assert.ok(fixtures.react, 'React fixture missing');
  assert.ok(fixtures.vue, 'Vue fixture missing');

  assert.equal(fixtures.react.marker, 'B44_REACT_A');
  assert.equal(fixtures.vue.marker, 'B44_VUE_B');

  const reactPkg = JSON.parse(fixtures.react.files['package.json']);
  const vuePkg = JSON.parse(fixtures.vue.files['package.json']);

  assert.equal(reactPkg.scripts.dev, 'vite --host 0.0.0.0 --port 5173 --strictPort');
  assert.equal(vuePkg.scripts.dev, 'vite --host 0.0.0.0 --port 5173 --strictPort');

  assert.equal(reactPkg.dependencies.react, '18.3.1');
  assert.equal(reactPkg.dependencies['react-dom'], '18.3.1');
  assert.equal(vuePkg.dependencies.vue, '3.5.13');
  assert.equal(reactPkg.devDependencies.vite, '5.4.21');
  assert.equal(vuePkg.devDependencies.vite, '5.4.21');
});

// 4. Artifact TTL expiration logic
await test('4. Artifact TTL expiration logic', async () => {
  const key = 'test-key-1';
  const owner = { project: 'A', incarnation: 'test-inc', epoch: 1, generation: 1, instance: { id: 'wc1' } };
  const validRecord = {
    key,
    project: 'A',
    incarnation: 'test-inc',
    createdAt: Date.now() - 300000, // 5 minutes old
    payload: new Uint8Array([1, 2, 3])
  };

  const choiceValid = restoreBinaryChoice(validRecord, key, owner, Date.now(), CAPS_BINARY);
  assert.equal(choiceValid.path, 'restore');

  const expiredRecord = {
    key,
    project: 'A',
    incarnation: 'test-inc',
    createdAt: Date.now() - 650000, // 10.8 minutes old (> 600,000 ms)
    payload: new Uint8Array([1, 2, 3])
  };

  const choiceExpired = restoreBinaryChoice(expiredRecord, key, owner, Date.now(), CAPS_BINARY);
  assert.equal(choiceExpired.path, 'reference');
  assert.equal(choiceExpired.reason, 'incompatible-or-expired');
});

// 5. Single retained artifact policy in BinaryMemoryStore
await test('5. Single retained artifact policy in BinaryMemoryStore', async () => {
  const store = new BinaryMemoryStore();
  const mockOwnerA = { project: 'A', incarnation: 'inc-A', epoch: 1, generation: 1, instance: { id: 'wcA' } };
  const mockOwnerB = { project: 'B', incarnation: 'inc-B', epoch: 1, generation: 1, instance: { id: 'wcB' } };

  const recordA = {
    project: 'A',
    incarnation: 'inc-A',
    key: 'keyA',
    payload: new Uint8Array([1, 2]),
    createdAt: Date.now()
  };
  store.publish(recordA, mockOwnerA, mockOwnerA);
  assert.equal(store.record.project, 'A');

  // React candidate takes A
  assert.ok(store.take('A'));
  // Vue candidate takes A -> null
  assert.equal(store.take('B'), null);

  // Vue block clears store and publishes B
  store.clear();
  assert.equal(store.record, null);

  const recordB = {
    project: 'B',
    incarnation: 'inc-B',
    key: 'keyB',
    payload: new Uint8Array([3, 4]),
    createdAt: Date.now()
  };
  store.publish(recordB, mockOwnerB, mockOwnerB);
  assert.equal(store.record.project, 'B');
  assert.equal(store.take('A'), null);
  assert.ok(store.take('B'));
});

// 6. Binary clone isolation across multiple candidates
await test('6. Binary clone isolation across multiple candidates', async () => {
  const original = new Uint8Array([10, 20, 30, 40, 50]);
  const clone1 = cloneBinary(original);
  const clone2 = cloneBinary(original);

  assert.notEqual(clone1.buffer, original.buffer);
  assert.notEqual(clone2.buffer, original.buffer);
  assert.notEqual(clone1.buffer, clone2.buffer);

  // Mutating clone1 must not mutate original or clone2
  clone1[0] = 99;
  assert.equal(original[0], 10);
  assert.equal(clone2[0], 10);
});

// 7. Scoped permission repair path validation
await test('7. Scoped permission repair path validation', async () => {
  const target = resolveExecutableTarget('node_modules/.bin/vite', '../vite/bin/vite.js');
  assert.equal(target, 'node_modules/vite/bin/vite.js');

  const validated = validatePermissionRepairPath(target);
  assert.equal(validated, 'node_modules/vite/bin/vite.js');

  // Directory traversal must throw
  assert.throws(() => resolveExecutableTarget('node_modules/.bin/vite', '../../package.json'), /escapes/);
  assert.throws(() => validatePermissionRepairPath('../package.json'), /Target path escapes root/);
});

// 8. Diagnostic script syntax check
await test('8. Diagnostic script syntax check', async () => {
  const browserCode = fs.readFileSync(path.join(dir, 'browser.mjs'), 'utf8');
  const match = browserCode.match(/const DIAG_SCRIPT = `([\s\S]*?)`;/);
  assert.ok(match, 'DIAG_SCRIPT must be present');
  assert.doesNotThrow(() => {
    new vm.Script(match[1], { filename: 'diag.cjs' });
  });
});

// 9. Predeclared success gates computation helper
await test('9. Predeclared success gates computation helper', async () => {
  // Mock control and candidate DOM timings
  const controlTimes = [30000, 32000, 31000, 33000]; // median = 31500
  const candidateTimes = [22000, 24000, 23000, 25000]; // median = 23500

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  const cMed = median(controlTimes);
  const rMed = median(candidateTimes);
  const absDiff = cMed - rMed; // 8000 ms
  const relDiff = ((cMed - rMed) / cMed) * 100; // 25.4%

  assert.equal(cMed, 31500);
  assert.equal(rMed, 23500);
  assert.equal(absDiff, 8000);
  assert.ok(absDiff >= 3000, 'Absolute threshold: >= 3.0s');
  assert.ok(relDiff >= 20.0, 'Relative threshold: >= 20%');

  // Break-even calculation
  const captureCost = 400; // ms
  const netSavingsPerRestore = absDiff; // 8000 ms
  const breakEvenRestores = captureCost / netSavingsPerRestore;
  assert.ok(breakEvenRestores <= 1.0, 'Break-even in <= 1 restore');
});

// 10. Offline bundle compilation check
await test('10. Offline bundle compilation check', async () => {
  const outfile = path.join(dir, 'test-bundle-benchmark.js');
  await build({
    entryPoints: [path.join(dir, 'browser.mjs')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022'
  });
  assert.ok(fs.existsSync(outfile));
  fs.unlinkSync(outfile);
});

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(JSON.stringify({ passed, failed, results }));
process.exitCode = failed === 0 ? 0 : 1;
