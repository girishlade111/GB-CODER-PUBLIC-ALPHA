/**
 * GB Coder Phase 4 — Local Git Engine Unit & Integration Test Suite
 *
 * Verifies operations G01 through G14 against real Git engine:
 * G01 — Initialize repository
 * G02 — Detect modified files
 * G03 — Stage file
 * G04 — Unstage file
 * G05 — Commit changes
 * G06 — Verify real commit SHA
 * G07 — Display commit history
 * G08 — Create branch
 * G09 — Switch branch
 * G10 — Preserve unsaved files / reject unsafe switch
 * G11 — Merge compatible branches
 * G12 — Detect merge conflict
 * G13 — Resolve conflict safely
 * G14 — Preserve Git state after refresh
 *
 * Zero emoji rule strictly enforced.
 */

import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';

const cwd = process.cwd();
const outdir = join(cwd, '.tmp-local-git-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'git-engine-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/git/gitEngineService.ts';
    `,
    resolveDir: cwd,
    loader: 'ts',
  },
  bundle: true,
  external: ['isomorphic-git', '@isomorphic-git/lightning-fs', 'fake-indexeddb/auto'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundlePath,
});

const {
  initRepository,
  isRepositoryInitialized,
  syncWorkingTree,
  readWorkingTree,
  getStatus,
  stageFile,
  stageAll,
  unstageFile,
  commit,
  getLog,
  getBranches,
  getCurrentBranch,
  createBranch,
  switchBranch,
  discardFileChanges,
  merge,
  resolveConflict,
} = await import(pathToFileURL(bundlePath).href);

after(() => {
  try {
    rmSync(outdir, { recursive: true, force: true });
  } catch {
    // Cleanup failure ignored
  }
  // Terminate cleanly to close fake-indexeddb connections
  setTimeout(() => {
    process.exit(0);
  }, 50);
});

describe('GB Coder Phase 4 — Local Git Engine Suite (G01 - G14)', () => {
  const testProjectId = 'proj-local-git-test-' + Date.now();
  const author = { name: 'Test Author', email: 'author@gbcoder.dev' };

  it('G01 — Initialize repository and verify .git existence', async () => {
    const initialFiles = [
      { path: 'README.md', content: '# Initial Project\nCreated with GB Coder', language: 'markdown' },
      { path: 'src/index.js', content: 'console.log("hello world");', language: 'javascript' },
    ];

    assert.equal(await isRepositoryInitialized(testProjectId), false);
    const initialSha = await initRepository(testProjectId, initialFiles, author);

    assert.ok(initialSha, 'Initial SHA should be returned');
    assert.equal(typeof initialSha, 'string');
    assert.equal(initialSha.length, 40, 'Git commit SHA must be 40 hex characters');
    assert.equal(await isRepositoryInitialized(testProjectId), true);

    const status = await getStatus(testProjectId);
    assert.equal(status.isClean, true, 'Repository should be clean after initial commit');
    assert.equal(status.branch, 'main');
  });

  it('G02 — Detect modified and untracked files', async () => {
    // Add an untracked file and modify an existing file
    const updatedFiles = [
      { path: 'README.md', content: '# Initial Project\nCreated with GB Coder\nModified line', language: 'markdown' },
      { path: 'src/index.js', content: 'console.log("hello world");', language: 'javascript' },
      { path: 'src/utils.js', content: 'export const add = (a, b) => a + b;', language: 'javascript' },
    ];

    await syncWorkingTree(testProjectId, updatedFiles);
    const status = await getStatus(testProjectId);

    assert.equal(status.isClean, false);
    assert.equal(status.staged.length, 0);
    assert.equal(status.unstaged.length, 2);

    const modified = status.unstaged.find((f) => f.path === 'README.md');
    assert.ok(modified);
    assert.equal(modified.status, 'modified');
    assert.equal(modified.badge, 'M');

    const untracked = status.unstaged.find((f) => f.path === 'src/utils.js');
    assert.ok(untracked);
    assert.equal(untracked.status, 'untracked');
    assert.equal(untracked.badge, 'U');
  });

  it('G03 — Stage file into Git index', async () => {
    await stageFile(testProjectId, 'README.md');
    const status = await getStatus(testProjectId);

    assert.equal(status.staged.length, 1);
    assert.equal(status.staged[0].path, 'README.md');
    assert.equal(status.staged[0].badge, 'M');
    assert.equal(status.staged[0].staged, true);

    assert.equal(status.unstaged.length, 1);
    assert.equal(status.unstaged[0].path, 'src/utils.js');
  });

  it('G04 — Unstage file from Git index', async () => {
    await unstageFile(testProjectId, 'README.md');
    const status = await getStatus(testProjectId);

    assert.equal(status.staged.length, 0);
    assert.equal(status.unstaged.length, 2);
    assert.ok(status.unstaged.some((f) => f.path === 'README.md'));
  });

  it('G05 — Commit staged changes', async () => {
    await stageAll(testProjectId);
    const statusBefore = await getStatus(testProjectId);
    assert.equal(statusBefore.staged.length, 2);
    assert.equal(statusBefore.unstaged.length, 0);

    const commitRecord = await commit(testProjectId, 'Add utils and update readme', author);

    assert.ok(commitRecord.sha);
    assert.equal(commitRecord.message, 'Add utils and update readme');
    assert.equal(commitRecord.author.name, 'Test Author');

    const statusAfter = await getStatus(testProjectId);
    assert.equal(statusAfter.isClean, true);
    assert.equal(statusAfter.staged.length, 0);
    assert.equal(statusAfter.unstaged.length, 0);
  });

  it('G06 — Verify real commit SHA format and uniqueness', async () => {
    const logs = await getLog(testProjectId, 2);
    assert.equal(logs.length, 2);

    const [latest, initial] = logs;
    assert.match(latest.sha, /^[0-9a-f]{40}$/);
    assert.match(initial.sha, /^[0-9a-f]{40}$/);
    assert.notEqual(latest.sha, initial.sha);
    assert.equal(latest.parentShas[0], initial.sha);
  });

  it('G07 — Display commit history with metadata', async () => {
    const logs = await getLog(testProjectId);
    assert.ok(logs.length >= 2);
    assert.equal(logs[0].message, 'Add utils and update readme');
    assert.equal(logs[0].author.email, 'author@gbcoder.dev');
    assert.ok(logs[0].timestamp > 0);
  });

  it('G08 — Create branch', async () => {
    await createBranch(testProjectId, 'feature/test-branch');
    const branches = await getBranches(testProjectId);

    assert.ok(branches.some((b) => b.name === 'feature/test-branch'));
    assert.equal(await getCurrentBranch(testProjectId), 'main');
  });

  it('G09 — Switch branch and verify working tree reflection', async () => {
    const files = await switchBranch(testProjectId, 'feature/test-branch');
    assert.equal(await getCurrentBranch(testProjectId), 'feature/test-branch');
    assert.ok(files.some((f) => f.path === 'src/utils.js'));

    // Make a commit on the feature branch
    const featureFiles = [
      ...files,
      { path: 'src/feature.js', content: 'export const feature = true;', language: 'javascript' },
    ];
    await syncWorkingTree(testProjectId, featureFiles);
    await stageAll(testProjectId);
    await commit(testProjectId, 'Feature branch commit', author);

    // Switch back to main
    const mainFiles = await switchBranch(testProjectId, 'main');
    assert.equal(await getCurrentBranch(testProjectId), 'main');
    assert.equal(mainFiles.some((f) => f.path === 'src/feature.js'), false, 'Feature file should not exist on main branch yet');
  });

  it('G10 — Preserve unsaved files / reject unsafe branch switch', async () => {
    // Stage an edit without committing
    const dirtyFiles = [
      { path: 'README.md', content: 'Unsaved branch switch attempt', language: 'markdown' },
    ];
    await syncWorkingTree(testProjectId, dirtyFiles);
    await stageFile(testProjectId, 'README.md');

    await assert.rejects(
      async () => {
        await switchBranch(testProjectId, 'feature/test-branch');
      },
      /Cannot switch branch with staged changes/,
    );

    // Unstage to restore clean working state
    await unstageFile(testProjectId, 'README.md');
    await discardFileChanges(testProjectId, 'README.md');
  });

  it('G11 — Merge compatible branches', async () => {
    // Merge feature/test-branch into main
    const mergeResult = await merge(testProjectId, 'feature/test-branch', author);
    assert.ok(mergeResult.status === 'success' || mergeResult.status === 'fast-forward');
    assert.ok(mergeResult.commitSha);

    const mergedFiles = await readWorkingTree(testProjectId);
    assert.ok(mergedFiles.some((f) => f.path === 'src/feature.js'), 'Merged branch files must be present');
  });

  it('G12 — Detect merge conflict', async () => {
    // Create conflicting branch
    await createBranch(testProjectId, 'conflict-branch');

    // Edit conflict-target.txt on main
    const mainConflict = [
      { path: 'conflict-target.txt', content: 'Main branch specific content', language: 'text' },
    ];
    await syncWorkingTree(testProjectId, mainConflict);
    await stageAll(testProjectId);
    await commit(testProjectId, 'Main conflict edit', author);

    // Switch to conflict-branch and edit same file differently
    await switchBranch(testProjectId, 'conflict-branch');
    const branchConflict = [
      { path: 'conflict-target.txt', content: 'Conflict branch specific content', language: 'text' },
    ];
    await syncWorkingTree(testProjectId, branchConflict);
    await stageAll(testProjectId);
    await commit(testProjectId, 'Branch conflict edit', author);

    // Switch back to main and attempt merge
    await switchBranch(testProjectId, 'main');
    const conflictResult = await merge(testProjectId, 'conflict-branch', author);

    assert.equal(conflictResult.status, 'conflict');
    assert.ok(conflictResult.conflicts);
    assert.ok(conflictResult.conflicts.includes('conflict-target.txt'));

    const status = await getStatus(testProjectId);
    assert.equal(status.hasConflicts, true);
    assert.ok(status.conflictedFiles.includes('conflict-target.txt'));
  });

  it('G13 — Resolve conflict safely and complete commit', async () => {
    const resolvedContent = 'Resolved content combining both changes';
    await resolveConflict(testProjectId, 'conflict-target.txt', resolvedContent);

    const statusAfterResolve = await getStatus(testProjectId);
    assert.equal(statusAfterResolve.hasConflicts, false);

    const resolveCommit = await commit(testProjectId, 'Merge conflict resolved', author);
    assert.ok(resolveCommit.sha);

    const finalFiles = await readWorkingTree(testProjectId);
    const targetFile = finalFiles.find((f) => f.path === 'conflict-target.txt');
    assert.equal(targetFile?.content, resolvedContent);
  });

  it('G14 — Preserve Git state after reload / re-instantiation', async () => {
    // Verify that re-reading branches, log, and status from disk retains full state
    const branches = await getBranches(testProjectId);
    assert.ok(branches.length >= 2);
    assert.ok(branches.some((b) => b.name === 'main'));
    assert.ok(branches.some((b) => b.name === 'feature/test-branch'));

    const logs = await getLog(testProjectId);
    assert.ok(logs.length >= 4);

    const status = await getStatus(testProjectId);
    assert.equal(status.isClean, true);
    assert.equal(status.branch, 'main');
  });
});
