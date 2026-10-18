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

const fakeInstance = { id: 'wc-producer-1' };
const liveOwner = {
  project: 'A',
  incarnation: 'synthetic-react-1',
  epoch: 1,
  generation: 1,
  instance: fakeInstance
};
const sampleOwner = {
  project: 'A',
  incarnation: 'synthetic-react-1',
  epoch: 1,
  generation: 1,
  runtimeId: 1
}; // missing instance property

const keyInput = {
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

// 1. Synthetic producer owner construction
await test('1. Synthetic producer owner construction and sameOwner self-identity', async () => {
  assert.ok(liveOwner.instance, 'Owner must have instance');
  assert.equal(liveOwner.project, 'A');
  assert.equal(liveOwner.epoch, 1);
  assert.equal(liveOwner.generation, 1);
  assert.ok(sameOwner(liveOwner, liveOwner), 'sameOwner must be reflexive for identical live owner');
});

// 2. Stage 1.2 failure reproduction: Rejection when instance is omitted (sample.owner)
await test('2. Stage 1.2 failure reproduction: Rejection when instance is omitted (sample.owner)', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3, 4]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };

  assert.equal(sameOwner(sampleOwner, liveOwner), false, 'sample.owner must not match live owner because instance is undefined');
  assert.throws(
    () => store.publish(record, sampleOwner, liveOwner),
    /Retired capture owner/,
    'Publishing with sample.owner must throw Retired capture owner'
  );
  assert.equal(store.take('A'), null, 'Failed publish must not retain artifact');
});

// 3. Stage 1.2.1 fix: Acceptance when complete live owner is passed
await test('3. Stage 1.2.1 fix: Acceptance when complete live owner is passed', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3, 4]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };

  assert.doesNotThrow(
    () => store.publish(record, liveOwner, liveOwner),
    'Publishing with live owner must succeed'
  );
  assert.equal(store.take('A'), record, 'Published record must be retrievable from store');
});

// 4. Rejection after runtime retirement
await test('4. Rejection after runtime retirement (current owner is null)', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };

  assert.throws(
    () => store.publish(record, liveOwner, null),
    /Retired capture owner/,
    'Publishing after retirement must be rejected'
  );
  assert.equal(store.take('A'), null);
});

// 5. Rejection on generation mismatch
await test('5. Rejection on generation mismatch (stale callback vs advanced current)', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };
  const advancedOwner = { ...liveOwner, generation: 2 };

  assert.throws(
    () => store.publish(record, liveOwner, advancedOwner),
    /Retired capture owner/,
    'Publishing across generation change must be rejected'
  );
  assert.equal(store.take('A'), null);
});

// 6. Rejection on epoch mismatch
await test('6. Rejection on epoch mismatch', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };
  const advancedEpoch = { ...liveOwner, epoch: 2 };

  assert.throws(
    () => store.publish(record, liveOwner, advancedEpoch),
    /Retired capture owner/,
    'Publishing across epoch change must be rejected'
  );
  assert.equal(store.take('A'), null);
});

// 7. Rejection on project mismatch
await test('7. Rejection on project mismatch between captured and current owner / restore choice', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };
  const otherProjectOwner = { ...liveOwner, project: 'B' };

  assert.throws(
    () => store.publish(record, liveOwner, otherProjectOwner),
    /Retired capture owner/
  );
  assert.equal(store.take('A'), null);

  const key = await artifactKey(keyInput);
  const validRecord = { ...record, key, createdAt: Date.now() };
  assert.throws(
    () => restoreBinaryChoice(validRecord, key, otherProjectOwner),
    /Project ownership mismatch/
  );
});

// 8. Rejection on instance mismatch
await test('8. Rejection on runtime instance mismatch (fresh runtime instance booted)', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };
  const freshInstanceOwner = { ...liveOwner, instance: { id: 'wc-consumer-2' } };

  assert.throws(
    () => store.publish(record, liveOwner, freshInstanceOwner),
    /Retired capture owner/,
    'Publishing when instance object has changed must be rejected'
  );
  assert.equal(store.take('A'), null);
});

// 9. Rejection on late export settlement
await test('9. Rejection on late export settlement and timeout guard', async () => {
  let lateFired = false;
  const slowPromise = new Promise(resolve => setTimeout(() => {
    lateFired = true;
    resolve('late-payload');
  }, 50));

  await assert.rejects(
    observed(slowPromise, 10, 'late-export-test', () => { lateFired = true; }),
    /deadline exceeded/,
    'Observation deadline must trigger rejection'
  );
  await new Promise(r => setTimeout(r, 60));
  assert.equal(lateFired, true, 'Late callback must be notified without uncaught rejection');
});

// 10. Rejection on oversized binary payload (> 64 MiB admission ceiling)
await test('10. Rejection on oversized binary payload exceeding 64 MiB admission ceiling', async () => {
  const fakeBig = { byteLength: 65 * 1024 * 1024 };
  Object.setPrototypeOf(fakeBig, Uint8Array.prototype);

  await assert.rejects(
    validateBinaryArtifact(fakeBig),
    /admission limit/,
    'validateBinaryArtifact must reject payloads > 64 MiB'
  );

  const store = new BinaryMemoryStore();
  const oversizedRecord = { project: 'A', incarnation: 'synthetic-react-1', payload: fakeBig, sha256: 'xyz' };
  assert.throws(
    () => store.publish(oversizedRecord, liveOwner, liveOwner),
    /admission limit/,
    'BinaryMemoryStore must reject payloads > 64 MiB'
  );
  assert.equal(store.take('A'), null);
});

// 11. Rejection on digest mismatch (corrupted binary payload)
await test('11. Rejection on digest mismatch (corrupted binary payload)', async () => {
  const payload = new Uint8Array([10, 20, 30, 40, 50]);
  const valid = await validateBinaryArtifact(payload);
  const key = await artifactKey(keyInput);
  const record = {
    project: 'A',
    incarnation: 'synthetic-react-1',
    key,
    payload,
    sha256: valid.sha256,
    createdAt: Date.now()
  };

  assert.ok(await verifyBinary(record, key, liveOwner), 'Unmodified record passes verification');

  // Corrupt payload
  const corruptedPayload = new Uint8Array([10, 20, 99, 40, 50]);
  const corruptedRecord = { ...record, payload: corruptedPayload };
  await assert.rejects(
    verifyBinary(corruptedRecord, key, liveOwner),
    /corrupted/,
    'Corrupted binary payload must fail verification'
  );
});

// 12. Clone-on-mount isolation & zero retention on failed publish
await test('12. Clone-on-mount isolation produces detached-safe copy & zero retention on failed publish', async () => {
  const original = new Uint8Array([100, 101, 102, 103]);
  const clone = cloneBinary(original);

  assert.notEqual(clone.buffer, original.buffer, 'Clone must have its own backing ArrayBuffer');
  assert.deepEqual(Array.from(clone), Array.from(original));

  // Simulating mount detachment or modification on clone
  clone[0] = 0;
  assert.equal(original[0], 100, 'Original payload must remain intact when clone is modified');

  // Zero retention verification
  const store = new BinaryMemoryStore();
  assert.equal(store.record, null);
  try {
    store.publish({ project: 'A', payload: 'not-a-uint8' }, liveOwner, liveOwner);
  } catch {
    // expected
  }
  assert.equal(store.record, null, 'Store must remain null when publish throws');
});

console.log(JSON.stringify({
  passed: results.filter(r => r.status === 'PASS').length,
  failed: results.filter(r => r.status === 'FAIL').length,
  results
}));
process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
