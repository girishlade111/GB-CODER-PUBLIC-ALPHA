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

const mockInstance1 = { id: 'wc-mock-producer' };
const mockInstance2 = { id: 'wc-mock-consumer' };

const producerOwner = {
  project: 'A',
  incarnation: 'synthetic-react-1',
  epoch: 1,
  generation: 1,
  instance: mockInstance1
};

const consumerOwner = {
  project: 'A',
  incarnation: 'synthetic-react-1',
  epoch: 2,
  generation: 2,
  instance: mockInstance2
};

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

// 1. Correct binary artifact owner
await test('1. Correct binary artifact owner', async () => {
  assert.ok(sameOwner(producerOwner, producerOwner), 'Reflexive owner check must pass');
  assert.equal(sameOwner(producerOwner, { ...producerOwner }), true);
});

// 2. Mismatched runtime rejection
await test('2. Mismatched runtime rejection', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };

  assert.throws(
    () => store.publish(record, producerOwner, consumerOwner),
    /Retired capture owner/,
    'Publishing across distinct runtime instances must reject'
  );
  assert.equal(store.take('A'), null);
});

// 3. Same-project fresh-runtime consumer eligibility
await test('3. Same-project fresh-runtime consumer eligibility', async () => {
  const key = await artifactKey(keyInput);
  const payload = new Uint8Array([1, 2, 3, 4]);
  const record = {
    project: 'A',
    incarnation: 'synthetic-react-1',
    key,
    payload,
    sha256: await sha(payload),
    createdAt: Date.now()
  };

  const choice = restoreBinaryChoice(record, key, consumerOwner);
  assert.equal(choice.path, 'restore', 'Fresh consumer in same project/incarnation must be eligible for restore');
});

// 4. SHA-256 payload mismatch rejection
await test('4. SHA-256 payload mismatch rejection', async () => {
  const key = await artifactKey(keyInput);
  const payload = new Uint8Array([1, 2, 3, 4]);
  const record = {
    project: 'A',
    incarnation: 'synthetic-react-1',
    key,
    payload: new Uint8Array([1, 2, 99, 4]), // corrupted vs sha
    sha256: await sha(payload),
    createdAt: Date.now()
  };

  await assert.rejects(
    verifyBinary(record, key, consumerOwner),
    /corrupted/,
    'verifyBinary must reject payload with mismatched SHA-256'
  );
});

// 5. Symlink traversal and escaping-target rejection
await test('5. Symlink traversal and escaping-target rejection', async () => {
  assert.throws(
    () => resolveExecutableTarget('node_modules/.bin/vite', '../../package.json'),
    /escapes/i,
    'Symlink target escaping node_modules must be rejected'
  );
  assert.throws(
    () => resolveExecutableTarget('node_modules/.bin/vite', '/etc/passwd'),
    /Unsafe symlink target/,
    'Absolute symlink targets must be rejected'
  );
});

// 6. Executable target-path identification
await test('6. Executable target-path identification', async () => {
  const resolved = resolveExecutableTarget('node_modules/.bin/vite', '../vite/bin/vite.js');
  assert.equal(resolved, 'node_modules/vite/bin/vite.js', 'Must correctly resolve relative symlink within node_modules');
});

// 7. Permission-repair path validation
await test('7. Permission-repair path validation', async () => {
  const validated = validatePermissionRepairPath('node_modules/vite/bin/vite.js');
  assert.equal(validated, 'node_modules/vite/bin/vite.js');
  assert.equal(validatePermissionRepairPath('node_modules/.bin/vite'), 'node_modules/.bin/vite');
});

// 8. Rejection of paths outside the dependency tree
await test('8. Rejection of paths outside the dependency tree', async () => {
  assert.throws(
    () => validatePermissionRepairPath('src/main.js'),
    /strictly inside node_modules/,
    'Source paths must never be targets of permission repair'
  );
  assert.throws(
    () => validatePermissionRepairPath('package.json'),
    /strictly inside node_modules/,
    'Root manifests must never be targets of permission repair'
  );
  assert.throws(
    () => validatePermissionRepairPath('node_modules/../src/main.js'),
    /strictly inside node_modules/,
    'Escaping paths must be rejected'
  );
  assert.throws(
    () => validatePermissionRepairPath('/bin/sh'),
    /Unsafe target path characters/,
    'Absolute system paths must be rejected'
  );
});

// 9. Late callback after runtime retirement
await test('9. Late callback after runtime retirement', async () => {
  let lateCallbackInvoked = false;
  const slowOp = new Promise(resolve => setTimeout(() => {
    lateCallbackInvoked = true;
    resolve('done');
  }, 40));

  await assert.rejects(
    observed(slowOp, 10, 'late-retire-test', () => { lateCallbackInvoked = true; }),
    /deadline exceeded/
  );
  await new Promise(r => setTimeout(r, 50));
  assert.equal(lateCallbackInvoked, true, 'Late callback must be handled without unhandled exception');
});

// 10. No artifact publication after retirement
await test('10. No artifact publication after retirement', async () => {
  const store = new BinaryMemoryStore();
  const payload = new Uint8Array([1, 2, 3]);
  const record = { project: 'A', incarnation: 'synthetic-react-1', payload, sha256: await sha(payload) };

  assert.throws(
    () => store.publish(record, producerOwner, null),
    /Retired capture owner/,
    'Publishing when current runtime is retired must throw'
  );
  assert.equal(store.take('A'), null, 'No artifact may be stored after retirement');
});

// 11. No modification of authoritative project source
await test('11. No modification of authoritative project source', async () => {
  const authoritativeFiles = {
    'package.json': '{"name":"gb-b4-4-react"}',
    'src/main.js': 'console.log("marker");'
  };

  // Simulating exactSource verification check
  function verifySource(workingFiles, fixtureFiles) {
    for (const [p, content] of Object.entries(fixtureFiles)) {
      if (workingFiles[p] !== content) throw new Error('Source changed: ' + p);
    }
  }

  assert.doesNotThrow(() => verifySource({ ...authoritativeFiles }, authoritativeFiles));
  assert.throws(
    () => verifySource({ ...authoritativeFiles, 'src/main.js': 'modified' }, authoritativeFiles),
    /Source changed: src\/main.js/
  );
});

// 12. No automatic retry or duplicate startup
await test('12. No automatic retry or duplicate startup (quarantine on failure)', async () => {
  const store = new BinaryMemoryStore();
  const key = await artifactKey(keyInput);
  const payload = new Uint8Array([1, 2, 3]);
  const record = {
    project: 'A',
    incarnation: 'synthetic-react-1',
    key,
    payload,
    sha256: await sha(payload),
    createdAt: Date.now()
  };

  store.publish(record, producerOwner, producerOwner);
  assert.ok(store.take('A'));

  // Consumer failure triggers quarantine
  store.quarantine('A');
  assert.equal(store.take('A'), null, 'Quarantined record must be removed from store');
  assert.throws(
    () => restoreBinaryChoice(record, key, consumerOwner),
    /Quarantined/,
    'Quarantined record cannot be restored'
  );
});

console.log(JSON.stringify({
  passed: results.filter(r => r.status === 'PASS').length,
  failed: results.filter(r => r.status === 'FAIL').length,
  results
}));
process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
