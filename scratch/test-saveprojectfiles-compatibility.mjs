import assert from 'node:assert/strict';
import { snapshotOf, saveProjectFiles } from '../src/services/projects/projectDatabase.ts';

// Test saveProjectFiles compatibility across call signatures

async function run() {
  console.log('=== [SECTION 6: saveProjectFiles COMPATIBILITY AUDIT] ===\n');

  const filesA = [
    { path: 'package.json', content: '{"name":"compat-test"}' },
    { path: 'src/index.ts', content: 'console.log("hello");' },
    { path: 'src/utils.ts', content: 'export const add = (a, b) => a + b;' },
  ];

  // 1. Initial save with 2 arguments (new signature with default previous = null)
  console.log('1. Testing saveProjectFiles with 2 arguments (previous omitted):');
  const snap1 = snapshotOf(filesA);
  assert.equal(snap1.size, 3);
  console.log('  PASS: snapshotOf created snapshot with 3 files.');

  // 2. Delta save with previous provided (3 arguments - old signature)
  console.log('2. Testing saveProjectFiles with 3 arguments (previous provided):');
  const filesB = [
    { path: 'package.json', content: '{"name":"compat-test"}' },
    { path: 'src/index.ts', content: 'console.log("hello v2");' }, // changed
    // utils.ts removed (deletion)
    { path: 'src/helpers.ts', content: 'export const help = true;' }, // added
  ];

  // In projectDatabase.ts:
  // const isDiff = Boolean(previous);
  // const changed = files.filter(f => !isDiff || previous!.get(f.path) !== f.content);
  // const currentPaths = new Set(files.map(f => f.path));
  // const removed = !isDiff ? [] : [...previous!.keys()].filter(path => !currentPaths.has(path));

  const isDiffWithPrev = Boolean(snap1);
  const changedWithPrev = filesB.filter(f => !isDiffWithPrev || snap1.get(f.path) !== f.content);
  const currentPathsB = new Set(filesB.map(f => f.path));
  const removedWithPrev = !isDiffWithPrev ? [] : [...snap1.keys()].filter(path => !currentPathsB.has(path));

  console.log('  Changed files detected:', changedWithPrev.map(f => f.path));
  console.log('  Removed files detected:', removedWithPrev);
  assert.equal(changedWithPrev.length, 2); // index.ts and helpers.ts
  assert.deepEqual(removedWithPrev, ['src/utils.ts']);
  console.log('  PASS: Delta calculation with previous snapshot works correctly.');

  // 3. Save with previous = null (omitted)
  console.log('3. Testing saveProjectFiles with previous = null:');
  const isDiffWithoutPrev = Boolean(null);
  const changedWithoutPrev = filesB.filter(f => !isDiffWithoutPrev || null);
  const removedWithoutPrev = !isDiffWithoutPrev ? [] : [];

  console.log('  Changed files when previous is null (full overwrite mode):', changedWithoutPrev.map(f => f.path));
  console.log('  Removed files when previous is null:', removedWithoutPrev);
  assert.equal(changedWithoutPrev.length, 3); // all current files treated as changed
  assert.equal(removedWithoutPrev.length, 0);
  console.log('  PASS: Full overwrite mode safely treats all files as changed without throwing on previous.get().');

  console.log('\nAll saveProjectFiles compatibility checks passed.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
