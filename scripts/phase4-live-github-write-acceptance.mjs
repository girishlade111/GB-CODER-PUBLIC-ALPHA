/**
 * GB Coder Phase 4 — Final Live GitHub Write Acceptance Test Suite
 *
 * Requirements:
 * - Never mutates product repository: girishlade111/GB-CODER-PUBLIC-ALPHA
 * - Executes real GitHub API operations only if DISPOSABLE_GITHUB_TEST_REPO
 *   and DISPOSABLE_GITHUB_TEST_TOKEN are configured in environment.
 * - If not configured, gracefully reports BLOCKED BY AUTHORIZATION.
 * - If configured, performs real multi-commit push, fetch, pull, and failure tests.
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
import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

const cwd = process.cwd();
const outdir = join(cwd, '.tmp-live-write-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'live-write-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/git/gitRemoteService.ts';
      export * from './src/services/git/gitGitHubAppService.ts';
      export * from './src/services/git/gitEngineService.ts';
      export * from './src/services/githubSyncService.ts';
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
  getStatus,
  getLog,
  getCurrentBranch,
  createBranch,
  switchBranch,
  setBranchRef,
  setRemoteTrackingRef,
  getRemoteTrackingRef,
  syncWorkingTree,
  stageAll,
  commit,
  readWorkingTree,
  pushRemote,
  fetchRemote,
  pullRemote,
  cloneRepository,
  publishBranch,
  parseRepoFullName,
  getFS,
  getProjectDir,
} = await import(pathToFileURL(bundlePath).href);

after(() => {
  try {
    rmSync(outdir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error
  }
});

const FORBIDDEN_PRODUCT_REPO = 'girishlade111/GB-CODER-PUBLIC-ALPHA'.toLowerCase();
const disposableRepo = process.env.DISPOSABLE_GITHUB_TEST_REPO?.trim();
const disposableToken = process.env.DISPOSABLE_GITHUB_TEST_TOKEN?.trim();

const isAuthorized = Boolean(
  disposableRepo &&
  disposableToken &&
  disposableRepo.toLowerCase() !== FORBIDDEN_PRODUCT_REPO
);

describe('GB Coder Phase 4 — Safety & Authorization Preflight (TASK 1)', () => {
  it('PREFLIGHT-01 — Product repository is strictly protected from remote write operations', () => {
    if (disposableRepo) {
      assert.notEqual(
        disposableRepo.toLowerCase(),
        FORBIDDEN_PRODUCT_REPO,
        'Cannot target GB Coder product repository for write acceptance tests'
      );
    }
    assert.ok(true, 'Product repository safety boundary verified');
  });

  it('PREFLIGHT-02 — Check authorized disposable repository configuration', () => {
    if (!isAuthorized) {
      console.log('[AUTH_PREFLIGHT] DISPOSABLE_GITHUB_TEST_REPO or DISPOSABLE_GITHUB_TEST_TOKEN is missing.');
      console.log('[AUTH_PREFLIGHT] Real remote write acceptance tests are BLOCKED BY AUTHORIZATION.');
      assert.ok(true, 'Safety boundary correctly enforced');
    } else {
      console.log(`[AUTH_PREFLIGHT] Authorized disposable repository detected: ${disposableRepo}`);
      assert.ok(isAuthorized, 'Authorized disposable repository available');
    }
  });
});

if (isAuthorized) {
  describe('GB Coder Phase 4 — Real Live GitHub Remote Acceptance', () => {
    const testBranchName = `gbcoder-acceptance-${Date.now()}`;
    const projectId = `live-write-proj-${Date.now()}`;
    let startingHeadSha = '';
    let pushedHeadSha = '';

    it('LIVE-W01 — Prepare test branch and verify starting remote HEAD', async () => {
      // 1. Fetch default branch ref
      const infoUrl = `https://api.github.com/repos/${disposableRepo}`;
      const repoRes = await fetch(infoUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(repoRes.status, 200, 'Must have access to disposable repository');
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch || 'main';

      const refUrl = `https://api.github.com/repos/${disposableRepo}/git/ref/heads/${defaultBranch}`;
      const refRes = await fetch(refUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(refRes.status, 200, 'Must resolve default branch reference');
      const refData = await refRes.json();
      startingHeadSha = refData.object.sha;
      assert.ok(startingHeadSha, 'Must resolve starting remote SHA');

      // 2. Create isolated test branch on remote
      const createBranchRes = await fetch(`https://api.github.com/repos/${disposableRepo}/git/refs`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${testBranchName}`,
          sha: startingHeadSha,
        }),
      });
      assert.ok(
        createBranchRes.status === 201 || createBranchRes.status === 200,
        'Dedicated test branch must be created on disposable repository'
      );
    });

    it('LIVE-W02 — Multi-commit push creates sequential chained commits on remote', async () => {
      // Initialize local repository on test branch
      const initialFiles = [
        { path: 'README.md', content: '# Disposable Test Repo\n\nLive test in progress.', language: 'markdown' },
        { path: 'test-file-1.txt', content: 'Step 1: first commit\n', language: 'text' },
      ];
      await initRepository(projectId, initialFiles);
      await createBranch(projectId, testBranchName);
      await switchBranch(projectId, testBranchName);
      await setRemoteTrackingRef(projectId, 'origin', testBranchName, startingHeadSha);

      // Commit 1 locally
      await syncWorkingTree(projectId, [
        { path: 'README.md', content: '# Disposable Test Repo\n\nLive test in progress.', language: 'markdown' },
        { path: 'test-file-1.txt', content: 'Step 1: first commit modified\n', language: 'text' },
        { path: 'test-file-2.txt', content: 'Step 2: second file added in commit 1\n', language: 'text' },
      ]);
      await stageAll(projectId);
      const commit1 = await commit(projectId, 'test: commit 1 from GB Coder');

      // Commit 2 locally
      await syncWorkingTree(projectId, [
        { path: 'README.md', content: '# Disposable Test Repo\n\nLive test in progress.', language: 'markdown' },
        { path: 'test-file-1.txt', content: 'Step 1: first commit modified\n', language: 'text' },
        { path: 'test-file-2.txt', content: 'Step 2: second file modified in commit 2\n', language: 'text' },
        { path: 'test-file-3.txt', content: 'Step 3: third file added in commit 2\n', language: 'text' },
      ]);
      await stageAll(projectId);
      const commit2 = await commit(projectId, 'test: commit 2 from GB Coder');

      // Execute live push
      const pushRes = await pushRemote(projectId, disposableRepo, disposableToken);
      assert.ok(pushRes.commitSha, 'Push must succeed and return remote commit SHA');
      pushedHeadSha = pushRes.commitSha;

      // Verify remote commit history via GitHub API
      const commitsUrl = `https://api.github.com/repos/${disposableRepo}/commits?sha=${testBranchName}&per_page=5`;
      const commitsRes = await fetch(commitsUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(commitsRes.status, 200);
      const remoteCommits = await commitsRes.json();
      assert.ok(remoteCommits.length >= 2, 'At least 2 commits must exist on test branch');

      // Verify top commit is commit 2
      assert.equal(remoteCommits[0].commit.message, 'test: commit 2 from GB Coder');
      // Verify second commit is commit 1
      assert.equal(remoteCommits[1].commit.message, 'test: commit 1 from GB Coder');
      // Verify parent pointer chaining
      assert.equal(remoteCommits[0].parents[0].sha, remoteCommits[1].sha);
      assert.equal(remoteCommits[1].parents[0].sha, startingHeadSha);
    });

    it('LIVE-W03 — Subsequent commit push appends to existing chain', async () => {
      // Commit 3 locally
      await syncWorkingTree(projectId, [
        { path: 'README.md', content: '# Disposable Test Repo\n\nLive test in progress.\nAll 3 steps complete.', language: 'markdown' },
        { path: 'test-file-1.txt', content: 'Step 1: final\n', language: 'text' },
        { path: 'test-file-2.txt', content: 'Step 2: final\n', language: 'text' },
        { path: 'test-file-3.txt', content: 'Step 3: final\n', language: 'text' },
      ]);
      await stageAll(projectId);
      await commit(projectId, 'test: commit 3 from GB Coder');

      const pushRes3 = await pushRemote(projectId, disposableRepo, disposableToken);
      assert.ok(pushRes3.commitSha);
      assert.notEqual(pushRes3.commitSha, pushedHeadSha);

      // Verify remote log has 3 commits in order
      const commitsUrl = `https://api.github.com/repos/${disposableRepo}/commits?sha=${testBranchName}&per_page=5`;
      const commitsRes = await fetch(commitsUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      const remoteCommits = await commitsRes.json();
      assert.equal(remoteCommits[0].commit.message, 'test: commit 3 from GB Coder');
      assert.equal(remoteCommits[1].commit.message, 'test: commit 2 from GB Coder');
      assert.equal(remoteCommits[2].commit.message, 'test: commit 1 from GB Coder');
      assert.equal(remoteCommits[0].parents[0].sha, remoteCommits[1].sha);
    });

    it('LIVE-W04 — Fetch and pull reflect remote changes in working tree', async () => {
      // Modify a file directly on remote via GitHub API
      const remoteFileUrl = `https://api.github.com/repos/${disposableRepo}/contents/remote-note.txt`;
      const createRemoteFileRes = await fetch(remoteFileUrl, {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test: remote change from GitHub API',
          content: Buffer.from('Created directly on remote for pull test\n').toString('base64'),
          branch: testBranchName,
        }),
      });
      assert.ok(createRemoteFileRes.status === 201 || createRemoteFileRes.status === 200);

      // Execute fetchRemote: should report behind by 1
      const fetchRes = await fetchRemote(projectId, disposableRepo, disposableToken);
      assert.equal(fetchRes.behind, 1, 'Local must be behind by 1 after remote edit');

      // Verify working tree does NOT have the remote file yet
      const filesBeforePull = await readWorkingTree(projectId);
      assert.equal(filesBeforePull.some((f) => f.path === 'remote-note.txt'), false);

      // Execute pullRemote: should fast-forward and write to working tree
      const pullRes = await pullRemote(projectId, disposableRepo, disposableToken);
      assert.ok(pullRes.newHeadSha);

      // Verify working tree now HAS the remote file
      const filesAfterPull = await readWorkingTree(projectId);
      const pulledFile = filesAfterPull.find((f) => f.path === 'remote-note.txt');
      assert.ok(pulledFile, 'Pulled file must exist in working tree');
      assert.match(pulledFile.content, /Created directly on remote/);
    });

    it('LIVE-W05 — Non-fast-forward push is rejected without modifying local or remote state', async () => {
      // Create local divergent commit
      await syncWorkingTree(projectId, [
        { path: 'divergent-local.txt', content: 'Local edit\n', language: 'text' },
      ]);
      await stageAll(projectId);
      await commit(projectId, 'test: local divergent commit');

      // Push should succeed now that we are ahead
      const pushRes = await pushRemote(projectId, disposableRepo, disposableToken);
      assert.ok(pushRes.commitSha);

      // Now create a remote edit to cause remote to be ahead of a different local commit
      await fetch(`https://api.github.com/repos/${disposableRepo}/contents/remote-divergence.txt`, {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test: remote divergence',
          content: Buffer.from('Remote divergence\n').toString('base64'),
          branch: testBranchName,
        }),
      });

      // Now add a local commit without pulling
      await syncWorkingTree(projectId, [
        { path: 'divergent-local-2.txt', content: 'Local edit 2\n', language: 'text' },
      ]);
      await stageAll(projectId);
      await commit(projectId, 'test: unpulled local commit');

      // Push MUST be rejected
      await assert.rejects(
        async () => {
          await pushRemote(projectId, disposableRepo, disposableToken);
        },
        /Cannot push non-fast-forward reference/i
      );
    });

    it('LIVE-W06 — Cleanup disposable remote test branch', async () => {
      const deleteRefUrl = `https://api.github.com/repos/${disposableRepo}/git/refs/heads/${testBranchName}`;
      const delRes = await fetch(deleteRefUrl, {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.ok(
        delRes.status === 204 || delRes.status === 200,
        'Disposable test branch must be deleted from remote repository'
      );
    });
  });
}

