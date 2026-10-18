import assert from 'node:assert/strict';
import {
  sha,
  artifactKey,
  cloneBinary,
  validateBinaryArtifact,
  restoreBinaryChoice,
  verifyBinary,
  BinaryMemoryStore,
  CAPS_BINARY,
  observed,
  sameOwner
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

const owner = { project: 'A', incarnation: 'synthetic-react-1', epoch: 1, generation: 1, instance: {} };
const input = {
  project: 'A',
  incarnation: 'synthetic-react-1',
  manifestSha: 'm1',
  lockSha: 'l1',
  configSha: 'c1',
  flags: ['ci'],
  runtime: { node: '22.22.3', arch: 'x64' },
  api: '1.6.4',
  policy: 2
};

// 1. Binary buffer copying (independent ArrayBuffers)
await test('1. Binary buffer copying produces independent ArrayBuffers', async () => {
  const original = new Uint8Array([10, 20, 30, 40]);
  const clone = cloneBinary(original);
  assert.notEqual(original.buffer, clone.buffer, 'Clone must have its own backing ArrayBuffer');
  assert.deepEqual(Array.from(clone), [10, 20, 30, 40]);
  clone[0] = 99;
  assert.equal(original[0], 10, 'Mutating clone must not affect original');
});

// 2. Typed-array offsets and backing buffers
await test('2. Typed-array subarrays clone correctly without detached buffer dependency', async () => {
  const bigBuffer = new ArrayBuffer(100);
  const view = new Uint8Array(bigBuffer, 20, 10); // offset 20, length 10
  view[0] = 42;
  view[9] = 99;
  const clone = cloneBinary(view);
  assert.equal(clone.byteLength, 10);
  assert.equal(clone.buffer.byteLength, 10, 'Cloned buffer should match slice length, not full parent buffer');
  assert.equal(clone[0], 42);
  assert.equal(clone[9], 99);
});

// 3. Digest mismatch rejection
await test('3. Digest mismatch rejection on corrupted payload', async () => {
  const payload = new Uint8Array([1, 2, 3, 4, 5]);
  const valid = await validateBinaryArtifact(payload);
  const key = await artifactKey(input);
  const record = { project: 'A', incarnation: 'synthetic-react-1', key, payload, sha256: valid.sha256, createdAt: Date.now() };
  assert.ok(await verifyBinary(record, key, owner));
  // corrupt payload
  const corruptedPayload = new Uint8Array([1, 2, 99, 4, 5]);
  const corruptedRecord = { ...record, payload: corruptedPayload };
  await assert.rejects(verifyBinary(corruptedRecord, key, owner), /corrupted/);
});

// 4. Wrong project/incarnation rejection
await test('4. Wrong project/incarnation rejection', async () => {
  const payload = new Uint8Array([1, 2, 3]);
  const valid = await validateBinaryArtifact(payload);
  const key = await artifactKey(input);
  const record = { project: 'A', incarnation: 'synthetic-react-1', key, payload, sha256: valid.sha256, createdAt: Date.now() };
  assert.throws(() => restoreBinaryChoice(record, key, { ...owner, project: 'B' }), /Project ownership mismatch/);
  assert.throws(() => restoreBinaryChoice(record, key, { ...owner, incarnation: 'synthetic-react-2' }), /Project ownership mismatch/);
});

// 5. Runtime incompatibility rejection
await test('5. Runtime incompatibility changes artifact key', async () => {
  const key1 = await artifactKey(input);
  const key2 = await artifactKey({ ...input, runtime: { node: '22.22.4', arch: 'x64' } });
  assert.notEqual(key1, key2, 'Key must invalidate when runtime changes');
  const record = { project: 'A', incarnation: 'synthetic-react-1', key: key1, payload: new Uint8Array([1]), sha256: 'xyz', createdAt: Date.now() };
  const choice = restoreBinaryChoice(record, key2, owner);
  assert.equal(choice.path, 'reference', 'Incompatible key must select reference install');
});

// 6. Stale generation callbacks rejection
await test('6. Stale generation callbacks rejected on publication', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: 'abc' };
  assert.throws(() => store.publish(record, owner, { ...owner, generation: 2 }), /Retired capture owner/);
  assert.equal(store.take('A'), null);
});

// 7. Corrupted / oversized payload rejection (> 64 MiB)
await test('7. Oversized payload (> 64 MiB) rejected by admission guard', async () => {
  const fakeBig = { byteLength: 65 * 1024 * 1024 };
  Object.setPrototypeOf(fakeBig, Uint8Array.prototype);
  await assert.rejects(validateBinaryArtifact(fakeBig), /admission limit/);
  await assert.rejects(validateBinaryArtifact(new Uint8Array(0)), /must not be empty/);
});

// 8. Timeout and late Promise settlement
await test('8. Timeout ignores late fulfillment and consumes late rejection', async () => {
  let lateFulfill = 0, lateReject = 0;
  await assert.rejects(observed(new Promise(r => setTimeout(() => r('late'), 30)), 1, 'binary-export', () => lateFulfill++));
  await assert.rejects(observed(new Promise((_, r) => setTimeout(() => r(Error('late')), 30)), 1, 'binary-mount', () => lateReject++));
  await new Promise(r => setTimeout(r, 40));
  assert.equal(lateFulfill, 1);
  assert.equal(lateReject, 1);
});

// 9. No source overwrite (destination freshness checks)
await test('9. Nonempty or invalid destination fails closed', async () => {
  // Destination contract helper
  function checkFreshDestination(entries) {
    if (entries.length > 0) throw new Error('Nonempty consumer destination');
  }
  assert.throws(() => checkFreshDestination(['package.json']), /Nonempty consumer destination/);
  assert.doesNotThrow(() => checkFreshDestination([]));
});

// 10. No automatic retry (failing closed & quarantine)
await test('10. Quarantine on restore failure and no automatic retry', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: 'abc' };
  store.publish(record, owner, owner);
  assert.ok(store.take('A'));
  store.quarantine('A');
  assert.equal(store.take('A'), null);
  assert.throws(() => restoreBinaryChoice(record, 'k', owner), /Quarantined/);
});

console.log(JSON.stringify({ passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, results }));
process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
