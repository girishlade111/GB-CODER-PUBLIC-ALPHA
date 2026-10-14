/**
 * GB Coder — Phase 2.1C coordination unit tests.
 *
 * Pure-function coverage for src/utils/workspaceCoordination.ts plus the
 * saveProjectFiles persisted-flag contract. Runs against the real bundled
 * modules (node:test + scripts/audit-harness.mjs, fake storage).
 *
 * Run with: npm run audit:workspace-coordination
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  createTransitionCoordinator,
  remapPath,
  remapPaths,
  chooseEvictionTab,
  isGitkeepPath,
  validateWorkspacePath,
  validateWorkspaceFolder,
  createProject,
  deleteProject,
  listProjects,
  saveProjectFiles,
  readProjectFiles,
} = services;

after(() => {
  cleanup();
});

describe('Phase 2.1C — transition coordinator', () => {
  test('C01: only the latest begun transition is current', () => {
    const coord = createTransitionCoordinator();
    const a = coord.begin();
    const b = coord.begin();
    assert.equal(coord.isCurrent(a), false);
    assert.equal(coord.isCurrent(b), true);
    const c = coord.begin();
    assert.equal(coord.isCurrent(b), false);
    assert.equal(coord.isCurrent(c), true);
  });

  test('C02: independent coordinators do not interfere', () => {
    const x = createTransitionCoordinator();
    const y = createTransitionCoordinator();
    const xid = x.begin();
    y.begin();
    y.begin();
    assert.equal(x.isCurrent(xid), true);
  });
});

describe('Phase 2.1C — path remapping', () => {
  test('C03: exact, nested and unrelated paths', () => {
    assert.equal(remapPath('src/a.jsx', 'src/a.jsx', 'src/b.jsx'), 'src/b.jsx');
    assert.equal(remapPath('src/a.jsx', 'src', 'lib'), 'lib/a.jsx');
    assert.equal(remapPath('src/deep/a.jsx', 'src', 'lib'), 'lib/deep/a.jsx');
    assert.equal(remapPath('other/a.jsx', 'src', 'lib'), 'other/a.jsx');
    // Prefix lookalikes must not remap.
    assert.equal(remapPath('srclib/a.jsx', 'src', 'lib'), 'srclib/a.jsx');
  });

  test('C04: batch remap preserves order and leaves others', () => {
    assert.deepEqual(
      remapPaths(['src/a.jsx', 'x.jsx'], 'src', 'lib'),
      ['lib/a.jsx', 'x.jsx'],
    );
  });
});

describe('Phase 2.1C — tab eviction', () => {
  test('C05: no eviction under capacity', () => {
    assert.equal(chooseEvictionTab(['a', 'b'], 'a', new Set(), 12), null);
  });

  test('C06: spares the focused tab, prefers oldest clean tab', () => {
    const open = ['t0', 't1', 't2'];
    // t0 dirty, t1 focused: evict t2.
    assert.equal(chooseEvictionTab(open, 't1', new Set(['t0']), 3), 't2');
    // None dirty: evict oldest non-focused.
    assert.equal(chooseEvictionTab(open, 't2', new Set(), 3), 't0');
  });

  test('C07: all other tabs dirty falls back to oldest non-focused', () => {
    assert.equal(
      chooseEvictionTab(['t0', 't1'], 't1', new Set(['t0', 't1']), 2),
      't0',
    );
  });
});

describe('Phase 2.1C — workspace path validation', () => {
  const existing = ['src/a.jsx', 'src/dir/b.jsx'];

  test('C08: traversal, case collision and extensions rejected', () => {
    assert.equal(validateWorkspacePath('../../evil.js', 'react', existing).valid, false);
    assert.equal(validateWorkspacePath('SRC/A.JSX', 'react', existing).valid, false);
    assert.equal(validateWorkspacePath('notes.txt', 'react', existing).valid, false);
    const ok = validateWorkspacePath('src/./c.jsx', 'react', existing);
    assert.equal(ok.valid, true);
    assert.equal(ok.path, 'src/c.jsx');
  });

  test('C09: nesting under an existing file path rejected', () => {
    assert.equal(validateWorkspacePath('src/a.jsx/inner.jsx', 'react', existing).valid, false);
  });

  test('C10: gitkeep sentinels bypass the extension allowlist but not safety', () => {
    assert.equal(isGitkeepPath('src/new/.gitkeep'), true);
    assert.equal(validateWorkspacePath('src/new/.gitkeep', 'react', existing).valid, true);
    assert.equal(validateWorkspacePath('../x/.gitkeep', 'react', existing).valid, false);
    assert.equal(
      validateWorkspacePath('src/a.jsx', 'react', ['src/a.jsx']).valid,
      false,
    );
  });

  test('C11: folder rules (no extension needed, no self-nesting)', () => {
    assert.equal(validateWorkspaceFolder('src/newdir', existing).valid, true);
    assert.equal(validateWorkspaceFolder('', existing).valid, false);
    assert.equal(validateWorkspaceFolder('../evil', existing).valid, false);
    assert.equal(validateWorkspaceFolder('src', existing, 'src').valid, true);
    assert.equal(validateWorkspaceFolder('src/sub', existing, 'src').valid, false);
    assert.equal(validateWorkspaceFolder('src/dir', existing, 'other').valid, false);
  });
});

describe('Phase 2.1C — saveProjectFiles persisted flag', () => {
  test('C12: success reports persisted:true with a usable snapshot', async () => {
    for (const p of await listProjects()) await deleteProject(p.id);
    const proj = await createProject({
      name: 'persist-flag',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [{ path: 'src/a.jsx', content: 'v1' }],
    });
    assert.ok(proj);
    const res = await saveProjectFiles(proj.id, [{ path: 'src/a.jsx', content: 'v2' }], null);
    assert.equal(res.persisted, true);
    assert.ok(res.snapshot instanceof Map);
    assert.equal((await readProjectFiles(proj.id))[0].content, 'v2');
  });

  test('C13: failed transaction reports persisted:false and keeps previous', async () => {
    for (const p of await listProjects()) await deleteProject(p.id);
    const proj = await createProject({
      name: 'persist-fail',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [{ path: 'src/a.jsx', content: 'v1' }],
    });
    assert.ok(proj);
    const previous = new Map([['src/a.jsx', 'v1']]);
    const realIDB = globalThis.indexedDB;
    globalThis.indexedDB = undefined;
    try {
      const res = await saveProjectFiles(proj.id, [{ path: 'src/a.jsx', content: 'v2' }], previous);
      assert.equal(res.persisted, false);
      assert.equal(res.snapshot, previous);
    } finally {
      globalThis.indexedDB = realIDB;
    }
  });
});
