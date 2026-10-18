import assert from 'node:assert/strict';

function testProjectStoreUUID(mockInsecure = false) {
  if (mockInsecure) {
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function testSnapshotUUID(mockInsecure = false) {
  if (mockInsecure) {
    return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

console.log('=== [UUID COMPATIBILITY AUDIT] ===\n');

// 1. Secure context (standard Node / Chromium)
const secureId = testProjectStoreUUID(false);
console.log('1. Secure Context UUID:', secureId);
assert.match(secureId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

// 2. Insecure context fallback (simulating http://169.254.x.x)
const insecureId = testProjectStoreUUID(true);
console.log('2. Insecure Context Project Fallback:', insecureId);
assert.match(insecureId, /^p-[0-9a-z]+-[0-9a-z]{8}$/);

const insecureSnapId = testSnapshotUUID(true);
console.log('3. Insecure Context Snapshot Fallback:', insecureSnapId);
assert.match(insecureSnapId, /^snap-[0-9a-z]+-[0-9a-z]{8}$/);

// 4. Collision test: 10,000 generated fallback IDs
const generated = new Set();
for (let i = 0; i < 10000; i++) {
  const id = testProjectStoreUUID(true);
  assert.ok(!generated.has(id), `Collision detected on iteration ${i}: ${id}`);
  generated.add(id);
}
console.log('4. Collision Test: 10,000 rapid fallback IDs generated with 0 collisions.');
console.log('\nUUID Compatibility Audit PASSED.');
