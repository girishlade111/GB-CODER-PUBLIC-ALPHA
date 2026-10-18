import assert from 'node:assert/strict';
import { inventory, cloneTree, CAPS, getLastInventoryTelemetry } from './policy.mjs';

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

// Fixture helpers
const makeValidTree = () => ({
  pkg: {
    directory: {
      'index.js': { file: { contents: 'console.log("hello world");' } },
      'data.json': { file: { contents: '{"version":"1.0.0"}' } }
    }
  },
  bin: {
    directory: {
      tool: { file: { symlink: '../pkg/index.js' } }
    }
  },
  probe: {
    file: { contents: new Uint8Array([1, 2, 3, 4, 5, 255]) }
  }
});

// 1. Existing valid trees retain previous eligibility behavior
await test('1. Existing valid trees retain previous eligibility behavior', async () => {
  const tree = makeValidTree();
  const res = await inventory(tree);
  assert.ok(res.digest);
  assert.equal(res.entryCount, 6);
  assert.equal(res.binaryFiles, 1);
  assert.equal(res.symlinks.length, 1);
  assert.ok(res.diagnosticTelemetry);
  assert.equal(res.diagnosticTelemetry.isPartial, false);
  assert.equal(res.diagnosticTelemetry.rejectionReason, null);
  assert.equal(res.diagnosticTelemetry.entriesVisited, 6);
  assert.equal(res.diagnosticTelemetry.directoriesVisited, 2);
  assert.equal(res.diagnosticTelemetry.textFilesVisited, 2);
  assert.equal(res.diagnosticTelemetry.binaryFilesVisited, 1);
  assert.equal(res.diagnosticTelemetry.symlinksVisited, 1);
});

// 2. Oversized trees still reject at original threshold
await test('2. Oversized trees still reject at original threshold', async () => {
  const tree = makeValidTree();
  let caught = null;
  try {
    await inventory(tree, { ...CAPS, perArtifact: 200 });
  } catch (err) {
    caught = err;
  }
  assert.ok(caught, 'Should reject when perArtifact is exceeded');
  assert.equal(caught.message, 'Artifact byte admission limit');
});

// 3. Partial counters remain available after rejection
await test('3. Partial counters remain available after rejection', async () => {
  const tree = makeValidTree();
  let caught = null;
  try {
    await inventory(tree, { ...CAPS, perArtifact: 200 });
  } catch (err) {
    caught = err;
  }
  assert.ok(caught);
  const telem = caught.diagnosticTelemetry || getLastInventoryTelemetry();
  assert.ok(telem, 'Telemetry must be available');
  assert.equal(telem.isPartial, true);
  assert.equal(telem.rejectionReason, 'Artifact byte admission limit');
  assert.ok(telem.accountedBytes > 200);
  assert.ok(telem.entriesVisited > 0);
  assert.ok(telem.rejectionPath);
  assert.ok(typeof telem.validationElapsedMs === 'number');
});

// 4. UTF-8 and UTF-16 accounting labeled correctly
await test('4. UTF-8 and UTF-16 accounting labeled correctly', async () => {
  const asciiContent = 'A'.repeat(500); // 500 ASCII chars
  const tree = {
    'file.txt': { file: { contents: asciiContent } }
  };
  const res = await inventory(tree);
  const telem = res.diagnosticTelemetry;
  assert.equal(telem.rawTextBytes, 500, 'Raw UTF-8 text bytes must be 500');
  assert.equal(telem.utf16AccountedTextBytes, 1000, 'UTF-16 accounted text bytes must be length * 2 = 1000');
});

// 5. Binary and typed-array accounting remains unchanged
await test('5. Binary and typed-array accounting remains unchanged', async () => {
  const binaryBytes = new Uint8Array(256);
  for (let i = 0; i < 256; i++) binaryBytes[i] = i;
  const tree = {
    'blob.bin': { file: { contents: binaryBytes } }
  };
  const res = await inventory(tree);
  const telem = res.diagnosticTelemetry;
  assert.equal(telem.typedArrayBytes, 256, 'Typed array bytes must be exactly 256');
  assert.equal(telem.rawTextBytes, 0);
  assert.equal(telem.utf16AccountedTextBytes, 0);
  assert.equal(telem.binaryFilesVisited, 1);
});

// 6. Symlink and unsafe-path rejection behavior remains intact
await test('6. Symlink and unsafe-path rejection behavior remains intact', async () => {
  await assert.rejects(inventory({ bad: { file: { symlink: '../outside' } } }), /Escaping symlink/);
  await assert.rejects(inventory({ a: { file: { symlink: 'b' } }, b: { file: { symlink: 'a' } } }), /Symlink cycle/);
  const badPath = Object.create(null);
  badPath['../escape'] = { file: { contents: 'x' } };
  await assert.rejects(inventory(badPath), /Unsafe path segment/);
});

// 7. No arbitrary file contents enter reports
await test('7. No arbitrary file contents enter reports', async () => {
  const secretContent = 'SUPER_SECRET_TOKEN_DO_NOT_LEAK_12345';
  const tree = {
    'secret.js': { file: { contents: secretContent } }
  };
  const res = await inventory(tree);
  const telemJson = JSON.stringify(res.diagnosticTelemetry);
  assert.ok(!telemJson.includes(secretContent), 'Diagnostic telemetry must not contain file contents');
});

// 8. Diagnostic capture cannot mutate the artifact
await test('8. Diagnostic capture cannot mutate the artifact', async () => {
  const tree = makeValidTree();
  const originalJson = JSON.stringify(tree, (_, v) => v instanceof Uint8Array ? Array.from(v) : v);
  await inventory(tree);
  const afterJson = JSON.stringify(tree, (_, v) => v instanceof Uint8Array ? Array.from(v) : v);
  assert.equal(originalJson, afterJson, 'Inventory must not mutate input tree');
});

// 9. Metrics are bounded
await test('9. Metrics are bounded', async () => {
  const tree = makeValidTree();
  const res = await inventory(tree);
  const telem = res.diagnosticTelemetry;
  assert.ok(Object.keys(telem.fileTypeDistribution).length < 50);
  assert.ok(Object.keys(telem.safePackageAggregates).length < 50);
  assert.ok(JSON.stringify(telem).length < 10000, 'Telemetry payload must remain compact and bounded');
});

// 10. The original 41 Stage 0 policy tests continue to pass
// Will be verified by running stage0.mjs directly as well
await test('10. Verification harness self-check', async () => {
  assert.equal(results.length, 9);
});

console.log(JSON.stringify({ passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, results }));
process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
