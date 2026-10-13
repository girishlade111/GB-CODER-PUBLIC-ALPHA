/**
 * GB Coder — Phase 2.1A Workspace Reliability Regression Harness
 *
 * Failure-reproduction suite for the 2.1 persistence audit. Every W-prefixed
 * test encodes a defect demonstrated against the real bundled services
 * (node:test + scripts/audit-harness.mjs, in-memory IndexedDB/localStorage).
 *
 * Convention: W-tests FAIL on the pre-fix codebase (defect reproduced) and
 * must turn GREEN after the minimal 2.1B fixes. G-tests are passing guards
 * that pin currently-correct behavior (byte integrity, isolation, recovery).
 *
 * Scope: service/hook-adjacent pure logic only. React-level races
 * (stale async project-switch loads, autosave debounce windows, dirty-dot
 * signalling) are documented with file:line evidence in
 * reports/PHASE_2_1_WORKSPACE_RELIABILITY_IMPLEMENTATION.md and covered by
 * manual/e2e follow-ups — they are not asserted here.
 *
 * Run with: npm run audit:workspace-reliability
 *   (or: node scripts/workspace-reliability-tests.mjs)
 *
 * Data safety: synthetic projects only, fake storage only. Never touches
 * real user IndexedDB / localStorage / profiles.
 */

import { test, describe, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { services, cleanup } from './audit-harness.mjs';

const {
  // projectDatabase (canonical IDB)
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  duplicateProject,
  saveProjectFiles,
  readProjectFiles,
  writeActiveProjectId,
  readActiveProjectId,
  // vscodeWorkspaceStore
  saveWorkspace,
  loadWorkspace,
  clearWorkspace,
  readViewState,
  writeViewState,
  reconcileViewState,
  // snapshotService
  snapshotService,
  // types/files (pure)
  normalizePath,
  validateFilePath,
  addFile,
  deleteFile,
  renameFile,
  setFileContent,
} = services;

after(() => {
  cleanup();
});

const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

// Raw autosave slot key (src/services/snapshotService.ts AUTOSAVE_KEY).
const AUTOSAVE_KEY = 'gbcoder_autosave_current';

function makeReactProject(name, fileCount = 3) {
  const files = [];
  for (let i = 0; i < fileCount; i++) {
    files.push({ path: `src/file${i}.jsx`, content: `export const v${i} = ${i};\n` });
  }
  files.push({ path: 'package.json', content: '{"name":"x"}' });
  return { name, projectType: 'react', editorStyle: 'vscode', files };
}

async function clearAllProjects() {
  const current = await listProjects();
  for (const p of current) {
    await deleteProject(p.id);
  }
  writeActiveProjectId(null);
  await clearWorkspace();
  try {
    globalThis.localStorage.removeItem(AUTOSAVE_KEY);
  } catch { /* ignore */ }
}

beforeEach(async () => {
  await clearAllProjects();
});

describe('Phase 2.1A — defect reproduction (W-tests: red before fix)', () => {
  test('W01: backupAutoSave() must not throw under storage quota pressure', async () => {
    snapshotService.saveAutoSave({
      project: { projectType: 'react', files: [{ path: 'a.jsx', content: 'x', language: 'jsx' }] },
      openPaths: ['a.jsx'],
      activePath: 'a.jsx',
      externalLibraries: [],
    });
    const realSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    globalThis.localStorage.setItem = () => {
      throw quotaError;
    };
    try {
      // Desired: survives quota (keeps original slot, reports failure) instead of
      // throwing out of the "Start Fresh" click handler (snapshotService.ts:73-80).
      assert.doesNotThrow(() => snapshotService.backupAutoSave());
      assert.ok(globalThis.localStorage.getItem(AUTOSAVE_KEY) !== null);
    } finally {
      globalThis.localStorage.setItem = realSetItem;
    }
  });

  test('W02: clearAutoSave() must not throw when storage is blocked', () => {
    const realRemove = globalThis.localStorage.removeItem.bind(globalThis.localStorage);
    globalThis.localStorage.removeItem = () => {
      throw new Error('Access denied');
    };
    try {
      // Desired: dismiss path never wedges the recovery modal (snapshotService.ts:69-71).
      assert.doesNotThrow(() => snapshotService.clearAutoSave());
    } finally {
      globalThis.localStorage.removeItem = realRemove;
    }
  });

  test('W03: getAutoSave() must reject shape-invalid records', () => {
    globalThis.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ nope: true }));
    // Desired: null for records without project.files (snapshotService.ts:58-67
    // returns the junk object; App.tsx:4711 setFileProject would crash on it).
    assert.equal(snapshotService.getAutoSave(), null);
  });

  test('W04: normalizePath() must resolve single-dot segments', () => {
    // Desired: 'src/./a.jsx' -> 'src/a.jsx' (types/files.ts:118-119 keeps a
    // literal '.' folder that becomes a phantom tree node / bundler specifier).
    assert.equal(normalizePath('src/./a.jsx'), 'src/a.jsx');
  });

  test('W04b: dot normalization preserves traversal signals, slashes, unicode, nesting', () => {
    assert.equal(normalizePath('./src/components/./Button.tsx'), 'src/components/Button.tsx');
    assert.equal(normalizePath('src\\win\\style.css'), 'src/win/style.css');
    // '..' must survive verbatim so validateFilePath keeps rejecting it.
    assert.equal(normalizePath('../../evil.js'), '../../evil.js');
    assert.equal(validateFilePath('../../evil.js', 'react', []).valid, false);
    assert.equal(validateFilePath('src/../evil.js', 'react', []).valid, false);
    // Repeat slashes still collapse; trailing slash still signals a directory.
    assert.equal(normalizePath('a//b.jsx'), 'a/b.jsx');
    assert.equal(validateFilePath('foo.jsx/', 'react', []).valid, false);
    // Unicode and deep nesting pass through untouched.
    assert.equal(normalizePath('src/日本語/café.jsx'), 'src/日本語/café.jsx');
    assert.equal(normalizePath('a/b/c/d/e/f/g.jsx'), 'a/b/c/d/e/f/g.jsx');
    assert.equal(normalizePath(''), '');
  });

  test('W03b: valid and legacy recovery records still restore; malformed variants rejected', () => {
    const valid = {
      project: {
        projectType: 'react',
        files: [{ path: 'src/a.jsx', content: 'aaa', language: 'jsx' }],
      },
      openPaths: ['src/a.jsx'],
      activePath: 'src/a.jsx',
      externalLibraries: [],
    };
    snapshotService.saveAutoSave(valid);
    const back = snapshotService.getAutoSave();
    assert.ok(back);
    assert.equal(back.project.files[0].content, 'aaa');

    const bad = [
      'not json{{{',
      'null',
      '[]',
      '{}',
      '{"nope":true}',
      JSON.stringify({ ...valid, project: { projectType: 'react', files: [{ path: '', content: 'x' }] } }),
      JSON.stringify({ ...valid, project: { projectType: 'react', files: [{ path: 'a.jsx' }] } }),
      JSON.stringify({ ...valid, openPaths: 'src/a.jsx' }),
      JSON.stringify({ ...valid, openPaths: [42] }),
      JSON.stringify({ ...valid, activePath: 42 }),
      JSON.stringify({ ...valid, externalLibraries: {} }),
    ];
    for (const raw of bad) {
      globalThis.localStorage.setItem(AUTOSAVE_KEY, raw);
      assert.equal(snapshotService.getAutoSave(), null, `accepted malformed record: ${raw.slice(0, 60)}`);
      // The raw bytes must be retained, never wiped by validation.
      assert.ok(globalThis.localStorage.getItem(AUTOSAVE_KEY) !== null);
    }
  });

  test('W05b: failed deletion preserves the active-project pointer', async () => {
    const proj = await createProject({
      name: 'keep-me',
      projectType: 'plain',
      editorStyle: 'plain',
      files: [{ path: 'index.html', content: 'x' }],
    });
    assert.ok(proj);
    writeActiveProjectId(proj.id);
    const realIDB = globalThis.indexedDB;
    globalThis.indexedDB = undefined;
    try {
      await deleteProject(proj.id); // resolves (never rejects), transaction failed
      assert.equal(readActiveProjectId(), proj.id);
    } finally {
      globalThis.indexedDB = realIDB;
    }
    // Store is healthy again: project and pointer intact, deletable for real.
    assert.ok(await getProject(proj.id));
    await deleteProject(proj.id);
    assert.equal(readActiveProjectId(), null);
  });

  test('W05: deleteProject() must not leave a dangling active-project pointer', async () => {
    const proj = await createProject({
      name: 'doomed',
      projectType: 'plain',
      editorStyle: 'plain',
      files: [{ path: 'index.html', content: '<h1>x</h1>' }],
    });
    assert.ok(proj);
    writeActiveProjectId(proj.id);
    await deleteProject(proj.id);
    assert.equal(await getProject(proj.id), null);
    // Desired: pointer cleared or invalid (projectDatabase.ts:466 never touches
    // gb-coder-active-project-id, so cold start resolves a ghost id).
    assert.equal(readActiveProjectId(), null);
  });

  test('W06: updateProject() must not allow fileCount/id clobber via patch', async () => {    const proj = await createProject({
      name: 'victim',
      projectType: 'plain',
      editorStyle: 'plain',
      files: [{ path: 'index.html', content: '<h1>x</h1>' }],
    });
    assert.ok(proj);
    const before = await getProject(proj.id);
    const updated = await updateProject(proj.id, { fileCount: 9999 });
    assert.ok(updated);
    // Desired: denormalised fileCount stays honest (projectDatabase.ts:449 blind
    // spread; type omits id/createdAt but runtime does not strip, and fileCount
    // is not omitted at all).
    assert.equal(updated.fileCount, before.fileCount);
    assert.equal(updated.id, proj.id);
  });

  test('W06b: legitimate metadata updates still apply and fileCount tracks the file store', async () => {
    const proj = await createProject({
      name: 'legit',
      projectType: 'react',
      editorStyle: 'plain',
      files: [{ path: 'src/a.jsx', content: 'aaa' }],
    });
    assert.ok(proj);
    const renamed = await updateProject(proj.id, { name: 'legit-renamed', editorStyle: 'vscode' });
    assert.ok(renamed);
    assert.equal(renamed.name, 'legit-renamed');
    assert.equal(renamed.editorStyle, 'vscode');
    assert.equal(renamed.projectType, 'react');
    const snap = await saveProjectFiles(proj.id, [
      { path: 'src/a.jsx', content: 'aaa' },
      { path: 'src/b.jsx', content: 'bbb' },
    ], null);
    assert.ok(snap);
    const after = await updateProject(proj.id, { lastOpenedAt: Date.now() });
    assert.ok(after);
    assert.equal(after.fileCount, (await readProjectFiles(proj.id)).length);
  });

  test('W07: duplicateProject() concurrent with deleteProject() must never yield a file-less copy', async () => {
    const proj = await createProject({
      name: 'original',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [
        { path: 'src/a.jsx', content: 'aaa' },
        { path: 'src/b.jsx', content: 'bbb' },
      ],
    });
    assert.ok(proj);
    // Order 1 — duplicate queued before delete: the copy must be complete.
    const [copy] = await Promise.all([duplicateProject(proj.id), deleteProject(proj.id)]);
    assert.ok(copy, 'duplicate queued first must still produce the copy');
    const copyFiles = await readProjectFiles(copy.id);
    assert.deepEqual(
      copyFiles.map((f) => [f.path, f.content]).sort(),
      [['src/a.jsx', 'aaa'], ['src/b.jsx', 'bbb']],
    );
    await deleteProject(copy.id);
  });

  test('W07b: delete queued before duplicate yields no copy at all', async () => {
    const proj = await createProject({
      name: 'gone-first',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [{ path: 'src/a.jsx', content: 'aaa' }],
    });
    assert.ok(proj);
    // Order 2 — delete commits first: duplicate must see nothing and create nothing.
    const before = (await listProjects()).length;
    const [delRes, copy] = await Promise.all([deleteProject(proj.id), duplicateProject(proj.id)]);
    assert.equal(copy, null);
    assert.equal((await listProjects()).length, before - 1);
    assert.equal(delRes, undefined);
  });

  test('W07c: duplicating a nonexistent project creates nothing', async () => {
    const before = (await listProjects()).length;
    assert.equal(await duplicateProject('ghost-id'), null);
    assert.equal((await listProjects()).length, before);
  });

  test('W07d: duplicating a 112-file project is byte-for-byte identical', async () => {
    const files = [];
    for (let i = 0; i < 112; i++) {
      const dir = `src/mod${Math.floor(i / 16)}`;
      const name = i % 17 === 0 ? `ünìcode-${i}.jsx` : `file${i}.jsx`;
      files.push({ path: `${dir}/${name}`, content: `// file ${i}\nexport const v${i} = ${i};\n` });
    }
    const expected = new Map(files.map((f) => [f.path, sha256(f.content)]));
    const proj = await createProject({
      name: 'dup-112',
      projectType: 'react',
      editorStyle: 'vscode',
      files,
    });
    assert.ok(proj);
    const copy = await duplicateProject(proj.id);
    assert.ok(copy);
    assert.equal(copy.fileCount, 112);
    const back = await readProjectFiles(copy.id);
    assert.equal(back.length, 112);
    for (const b of back) {
      assert.equal(sha256(b.content), expected.get(b.path));
    }
  });
});

describe('Phase 2.1A — behavior guards (G-tests: green, must stay green)', () => {
  test('G01: save -> reload round-trip is byte-identical (nested, unicode, empty, unusual)', async () => {
    const files = [
      { path: 'index.html', content: '<h1>hi</h1>' },
      { path: 'src/nested/deep/a.jsx', content: 'export default 1;\n' },
      { path: 'src/café-日本語.jsx', content: '// unicode path\n' },
      { path: 'src/empty.js', content: '' },
      { path: 'src/weird.css', content: '\uFEFF/* bom */\r\n.a::after{content:"🎉\\0"}\n' },
    ];
    const proj = await createProject({
      name: 'roundtrip',
      projectType: 'react',
      editorStyle: 'vscode',
      files,
    });
    assert.ok(proj);
    // Simulate refresh: fresh read from the store, no in-memory reuse.
    const back = await readProjectFiles(proj.id);
    assert.equal(back.length, files.length);
    for (const f of files) {
      const got = back.find((b) => b.path === f.path);
      assert.ok(got, `missing ${f.path}`);
      assert.equal(sha256(got.content), sha256(f.content), `content drift in ${f.path}`);
    }
  });

  test('G02: 112-file synthetic fixture passes SHA-256 verification', async () => {
    const files = [];
    for (let i = 0; i < 112; i++) {
      const dir = `src/mod${Math.floor(i / 16)}`;
      const name = i % 17 === 0 ? `ünìcode-${i}.jsx` : `file${i}.jsx`;
      const content = i % 11 === 0 ? '' : `// file ${i}\nexport const v${i} = ${i};\n`;
      files.push({ path: `${dir}/${name}`, content });
    }
    const expected = new Map(files.map((f) => [f.path, sha256(f.content)]));
    const proj = await createProject({
      name: 'large-112',
      projectType: 'react',
      editorStyle: 'vscode',
      files,
    });
    assert.ok(proj);
    const back = await readProjectFiles(proj.id);
    assert.equal(back.length, 112);
    for (const b of back) {
      assert.ok(expected.has(b.path), `unexpected path ${b.path}`);
      assert.equal(sha256(b.content), expected.get(b.path));
    }
  });

  test('G03: concurrent saves to two projects never cross-contaminate', async () => {
    const a = await createProject({ ...makeReactProject('projA'), files: [{ path: 'a.jsx', content: 'A1' }] });
    const b = await createProject({ ...makeReactProject('projB'), files: [{ path: 'b.jsx', content: 'B1' }] });
    assert.ok(a && b);
    await Promise.all([
      saveProjectFiles(a.id, [{ path: 'a.jsx', content: 'A2' }], null),
      saveProjectFiles(b.id, [{ path: 'b.jsx', content: 'B2' }], null),
    ]);
    const backA = await readProjectFiles(a.id);
    const backB = await readProjectFiles(b.id);
    assert.deepEqual(
      backA.map((f) => [f.path, f.content]),
      [['a.jsx', 'A2']],
    );
    assert.deepEqual(
      backB.map((f) => [f.path, f.content]),
      [['b.jsx', 'B2']],
    );
  });

  test('G04: overlapping saves to one project settle FIFO (last write wins, nothing lost)', async () => {
    const proj = await createProject({
      name: 'overlap',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [{ path: 'a.jsx', content: 'v0' }],
    });
    assert.ok(proj);
    const [s1, s2] = await Promise.all([
      saveProjectFiles(proj.id, [{ path: 'a.jsx', content: 'v1' }], null),
      saveProjectFiles(proj.id, [{ path: 'a.jsx', content: 'v2' }], null),
    ]);
    assert.ok(s1 && s2);
    const back = await readProjectFiles(proj.id);
    assert.equal(back.find((f) => f.path === 'a.jsx').content, 'v2');
  });

  test('G05: IndexedDB unavailable degrades gracefully (no throw, false/null signals)', async () => {
    const realIDB = globalThis.indexedDB;
    globalThis.indexedDB = undefined;
    try {
      assert.equal(await saveWorkspace({ projectType: 'react', files: [], entry: undefined }, null), false);
      assert.equal(await loadWorkspace(), null);
      assert.equal(await getProject('missing'), null);
    } finally {
      globalThis.indexedDB = realIDB;
    }
  });

  test('G06: active-project pointer round-trips (write/read/clear)', async () => {
    const proj = await createProject({
      name: 'pointed',
      projectType: 'plain',
      editorStyle: 'plain',
      files: [{ path: 'index.html', content: 'x' }],
    });
    assert.ok(proj);
    writeActiveProjectId(proj.id);
    assert.equal(readActiveProjectId(), proj.id);
    writeActiveProjectId(null);
    assert.equal(readActiveProjectId(), null);
  });

  test('G07: reconcileViewState drops missing tabs and falls back to first open path', () => {
    const files = [
      { path: 'a.jsx', content: '', language: 'jsx' },
      { path: 'b.jsx', content: '', language: 'jsx' },
    ];
    const out = reconcileViewState(
      { openPaths: ['a.jsx', 'gone.jsx'], activePath: 'gone.jsx' },
      files,
    );
    assert.deepEqual(out, { openPaths: ['a.jsx'], activePath: 'a.jsx' });
  });

  test('G08: validateFilePath rejects empty/traversal/bad-extension/collision, accepts nested', () => {
    const existing = ['src/a.jsx'];
    assert.equal(validateFilePath('', 'react', existing).valid, false);
    assert.equal(validateFilePath('../../evil.js', 'react', existing).valid, false);
    assert.equal(validateFilePath('notes.txt', 'react', existing).valid, false);
    assert.equal(validateFilePath('SRC/A.JSX', 'react', existing).valid, false);
    assert.equal(validateFilePath('src/a.jsx', 'react', existing, 'src/a.jsx').valid, true);
    assert.equal(validateFilePath('src/nested/deep/b.tsx', 'react', existing).valid, true);
  });

  test('G09: pure file transitions preserve entry and fixed-path invariants', () => {
    const project = {
      projectType: 'react',
      entry: 'src/a.jsx',
      files: [
        { path: 'src/a.jsx', content: 'a', language: 'jsx' },
        { path: 'src/b.jsx', content: 'b', language: 'jsx' },
      ],
    };
    const renamed = renameFile(project, 'src/a.jsx', 'src/c.jsx');
    assert.equal(renamed.entry, 'src/c.jsx');
    assert.ok(renamed.files.some((f) => f.path === 'src/c.jsx'));
    const dup = addFile(project, 'src/a.jsx');
    assert.equal(dup.files.length, 2);
    const plain = { projectType: 'plain', files: [{ path: 'index.html', content: 'x', language: 'html' }] };
    assert.equal(deleteFile(plain, 'index.html').files.length, 1);
    assert.equal(setFileContent(project, 'src/a.jsx', 'a2').files[0].content, 'a2');
  });

  test('G10: duplicateProject normal path is byte-identical including editorStyle', async () => {
    const proj = await createProject({
      name: 'dup-me',
      projectType: 'react',
      editorStyle: 'vscode',
      files: [
        { path: 'src/a.jsx', content: 'aaa' },
        { path: 'src/b.jsx', content: 'bbb' },
      ],
    });
    assert.ok(proj);
    const copy = await duplicateProject(proj.id, 'dup-me-copy');
    assert.ok(copy);
    assert.notEqual(copy.id, proj.id);
    assert.equal(copy.editorStyle, 'vscode');
    const back = await readProjectFiles(copy.id);
    assert.deepEqual(
      back.map((f) => [f.path, f.content]).sort(),
      [['src/a.jsx', 'aaa'], ['src/b.jsx', 'bbb']],
    );
  });

  test('G11: view-state write/read round-trips and readViewState tolerates corruption', () => {
    writeViewState({ openPaths: ['a.jsx'], activePath: 'a.jsx' });
    assert.deepEqual(readViewState(), { openPaths: ['a.jsx'], activePath: 'a.jsx' });
    globalThis.localStorage.setItem('gb-coder-vscode-view', '{corrupt');
    assert.deepEqual(readViewState(), { openPaths: [], activePath: null });
  });
});
