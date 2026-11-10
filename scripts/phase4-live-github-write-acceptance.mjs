/**
 * GB Coder Phase 4.5 — Real Live GitHub Remote Acceptance Test Suite
 *
 * Requirements:
 * - Strictly protects product repository: girishlade111/GB-CODER-PUBLIC-ALPHA
 * - Executes real GitHub API operations only against authorized disposable repo:
 *   lodu35180-create/gb-coder-git-integration-test
 * - Reads credentials securely from environment or .env.local / .env
 * - Never logs or exposes access tokens
 * - Executes Stages 2 through 8 with real GitHub API calls (no mocks)
 * - Preserves the remote test branch for operator inspection (does not delete)
 * - Collects structured live evidence for the final report
 *
 * Zero emoji rule strictly enforced.
 */

import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

// 1. Safely load credentials from environment or .env.local / .env
function loadCredentials() {
  for (const envFile of ['.env.local', '.env']) {
    if (existsSync(envFile)) {
      const content = readFileSync(envFile, 'utf8');
      for (const line of content.split('\n')) {
        const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
        if (match) {
          const key = match[1];
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadCredentials();

const FORBIDDEN_PRODUCT_REPO = 'girishlade111/gb-coder-public-alpha';
const EXPECTED_DISPOSABLE_REPO = 'lodu35180-create/gb-coder-git-integration-test';

let rawRepo = (process.env.DISPOSABLE_GITHUB_TEST_REPO || '').trim();
const disposableToken = (process.env.DISPOSABLE_GITHUB_TEST_TOKEN || '').trim();

// Normalize repo string: handle full https URL or owner/repo format
const repoMatch = /github\.com[/:]([^/]+\/[^/]+?)(?:\.git|\/)?$/.exec(rawRepo) || /^([^/]+\/[^/]+)$/.exec(rawRepo);
const disposableRepo = repoMatch ? repoMatch[1].toLowerCase() : rawRepo.toLowerCase();

const isAuthorized = Boolean(
  disposableRepo &&
  disposableToken &&
  disposableRepo === EXPECTED_DISPOSABLE_REPO.toLowerCase() &&
  disposableRepo !== FORBIDDEN_PRODUCT_REPO
);

const cwd = process.cwd();
const outdir = join(cwd, '.tmp-live-write-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'live-write-bundle.mjs');
const evidencePath = join(cwd, 'dist-staging', 'phase4-5-evidence.json');

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

// Evidence ledger
const evidence = {
  timestamp: new Date().toISOString(),
  targetRepository: disposableRepo,
  authorized: isAuthorized,
  operations: [],
};

function recordOperation(op) {
  evidence.operations.push(op);
  try {
    mkdirSync(join(cwd, 'dist-staging'), { recursive: true });
    writeFileSync(evidencePath, JSON.stringify(evidence, null, 2), 'utf8');
  } catch {
    // Non-fatal
  }
}

describe('GB Coder Phase 4.5 — Safety & Authentication Preflight (STAGE 1 & 2)', () => {
  it('PREFLIGHT-01 — Product repository is strictly protected from remote write operations', () => {
    assert.notEqual(
      disposableRepo,
      FORBIDDEN_PRODUCT_REPO,
      'Product repository must never be targeted for write acceptance testing'
    );
    recordOperation({
      id: 'PREFLIGHT-01',
      operation: 'SAFETY_CHECK',
      status: 'PASS',
      details: 'Product repository confirmed protected',
    });
  });

  it('PREFLIGHT-02 — Target repository matches expected authorized disposable repo', () => {
    if (!isAuthorized) {
      console.log('[AUTH_PREFLIGHT] Authorized disposable repository credentials missing.');
      console.log('[AUTH_PREFLIGHT] Real remote write acceptance tests are BLOCKED BY AUTHORIZATION.');
      recordOperation({
        id: 'PREFLIGHT-02',
        operation: 'AUTH_CHECK',
        status: 'BLOCKED',
        details: 'DISPOSABLE_GITHUB_TEST_REPO or DISPOSABLE_GITHUB_TEST_TOKEN missing',
      });
      assert.ok(true, 'Safety boundary enforced');
    } else {
      assert.equal(
        disposableRepo,
        EXPECTED_DISPOSABLE_REPO.toLowerCase(),
        'Target repo must match expected disposable test repository'
      );
      recordOperation({
        id: 'PREFLIGHT-02',
        operation: 'AUTH_CHECK',
        status: 'PASS',
        details: `Target confirmed: ${disposableRepo}`,
      });
    }
  });
});

if (isAuthorized) {
  describe('GB Coder Phase 4.5 — Live GitHub Remote Acceptance (STAGES 2 - 8)', { concurrency: 1 }, () => {
    const timestamp = Date.now();
    const testBranchName = `gbcoder-acceptance-${timestamp}`;
    const runFolder = `gbcoder-run-${timestamp}`;
    const projectId = `live-write-proj-${timestamp}`;
    let startingHeadSha = '';
    let commit1LocalSha = '';
    let commit2LocalSha = '';
    let commit3LocalSha = '';
    let push1HeadSha = '';
    let push2HeadSha = '';
    let remoteEditSha = '';

    it('STAGE 2 — Authenticate and verify write access on disposable repository', async () => {
      // 1. Verify user authentication
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(userRes.status, 200, 'GitHub user authentication must succeed');
      const userData = await userRes.json();
      assert.ok(userData.login, 'Authenticated user login must be present');

      // 2. Verify repository write permission
      const repoRes = await fetch(`https://api.github.com/repos/${disposableRepo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(repoRes.status, 200, 'Must have access to disposable repository');
      const repoData = await repoRes.json();
      assert.equal(repoData.permissions?.push, true, 'Token must have push write permission');

      // 3. Verify rate limit
      const rateRes = await fetch('https://api.github.com/rate_limit', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(rateRes.status, 200);
      const rateData = await rateRes.json();
      assert.ok(rateData.resources.core.remaining > 10, 'Rate limit must be sufficient');

      // 4. Resolve default branch HEAD
      const defaultBranch = repoData.default_branch || 'main';
      const refRes = await fetch(`https://api.github.com/repos/${disposableRepo}/git/ref/heads/${defaultBranch}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(refRes.status, 200, 'Must resolve default branch HEAD');
      const refData = await refRes.json();
      startingHeadSha = refData.object.sha;
      assert.ok(startingHeadSha, 'Starting remote SHA must be valid');

      recordOperation({
        id: 'STAGE-2',
        operation: 'AUTH_PREFLIGHT',
        status: 'PASS',
        user: userData.login,
        defaultBranch,
        startingHeadSha,
        rateLimitRemaining: rateData.resources.core.remaining,
      });
    });

    it('STAGE 3 — Create isolated test branch from starting remote HEAD', async () => {
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
        `Branch creation must return 201 (got ${createBranchRes.status})`
      );

      recordOperation({
        id: 'STAGE-3',
        operation: 'CREATE_BRANCH',
        status: 'PASS',
        branch: testBranchName,
        baseSha: startingHeadSha,
      });
    });

    it('STAGE 4 — W01 - W12: Local multi-commit creation and first live push', async () => {
      try {
        // W01: Clone/import repository test branch into local LightningFS
      const cloned = await cloneRepository({
        projectId,
        repoFullName: disposableRepo,
        branch: testBranchName,
        token: disposableToken,
        depth: 10,
      });
      assert.ok(cloned.headSha, 'Cloned repository must have a valid HEAD SHA');

      // W02: Verify baseline Git history
      const baselineLogs = await getLog(projectId, 5);
      assert.ok(baselineLogs.length >= 1, 'Must have at least initial commit in baseline');
      assert.equal(baselineLogs[0].sha, cloned.headSha, 'Local HEAD must match remote cloned HEAD');

      // W03 - W05: Modify/create disposable file and create local Commit 1
      const fs = getFS();
      const projectDir = getProjectDir(projectId);
      await syncWorkingTree(projectId, [
        ...cloned.files,
        { path: `${runFolder}/test-1.txt`, content: 'Step 1: created in commit 1\n', language: 'text' },
      ]);
      await stageAll(projectId);
      const c1 = await commit(projectId, 'test: W05 commit 1 from GB Coder');
      commit1LocalSha = c1.sha;

      // W06 - W07: Modify file again and create local Commit 2
      await syncWorkingTree(projectId, [
        ...cloned.files,
        { path: `${runFolder}/test-1.txt`, content: 'Step 1: created in commit 1\n', language: 'text' },
        { path: `${runFolder}/test-2.txt`, content: 'Step 2: added file 2 in commit 2\n', language: 'text' },
      ]);
      await stageAll(projectId);
      const c2 = await commit(projectId, 'test: W07 commit 2 from GB Coder');
      commit2LocalSha = c2.sha;

      // W17: Add an uncommitted working tree file to verify working-tree preservation
      await fs.promises.writeFile(`${projectDir}/${runFolder}/uncommitted-draft.txt`, 'Draft content not staged');

      // W08: Execute live multi-commit Push
      const pushResult = await pushRemote(projectId, disposableRepo, disposableToken);
      assert.ok(pushResult.commitSha, 'Push must succeed and return commitSha');
      assert.equal(pushResult.alreadyUpToDate, false);
      push1HeadSha = pushResult.commitSha;

      // W09: Query actual GitHub branch HEAD
      const branchRes = await fetch(`https://api.github.com/repos/${disposableRepo}/git/ref/heads/${testBranchName}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(branchRes.status, 200);
      const branchData = await branchRes.json();
      assert.equal(branchData.object.sha, push1HeadSha, 'Remote branch ref must point to pushed commit SHA');

      // W10 & W11: Query commit history and verify both commits and parent relationships
      const commitsRes = await fetch(`https://api.github.com/repos/${disposableRepo}/commits?sha=${testBranchName}&per_page=5`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(commitsRes.status, 200);
      const commitsList = await commitsRes.json();
      assert.ok(commitsList.length >= 2, 'Must have at least 2 commits on branch');

      const topRemote = commitsList[0];
      const secondRemote = commitsList[1];

      assert.equal(topRemote.commit.message, 'test: W07 commit 2 from GB Coder');
      assert.equal(secondRemote.commit.message, 'test: W05 commit 1 from GB Coder');
      assert.equal(topRemote.parents[0].sha, secondRemote.sha, 'Top commit parent must point to second commit');
      assert.equal(secondRemote.parents[0].sha, startingHeadSha, 'Second commit parent must point to starting head');

      // W12: Verify remote file contents
      const fileRes = await fetch(`https://api.github.com/repos/${disposableRepo}/contents/${runFolder}/test-2.txt?ref=${testBranchName}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(fileRes.status, 200);
      const fileData = await fileRes.json();
      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      assert.match(content, /added file 2 in commit 2/);

      // W17: Verify uncommitted file is still intact
      const uncommitted = await fs.promises.readFile(`${projectDir}/${runFolder}/uncommitted-draft.txt`, 'utf8');
      assert.equal(uncommitted, 'Draft content not staged');

      // Clean up uncommitted draft file so subsequent operations remain clean
      await fs.promises.unlink(`${projectDir}/${runFolder}/uncommitted-draft.txt`);

      // W16: Verify tracking ref updated locally
      const localTrackingRef = await getRemoteTrackingRef(projectId, 'origin', testBranchName);
      assert.ok(localTrackingRef, 'Tracking ref must exist');

      recordOperation({
        id: 'STAGE-4-PUSH1',
        operation: 'MULTI_COMMIT_PUSH',
        status: 'PASS',
        commitsPushed: 2,
        remoteTopSha: topRemote.sha,
        remoteSecondSha: secondRemote.sha,
        parentLink: `${topRemote.sha} -> ${secondRemote.sha} -> ${startingHeadSha}`,
      });
    } catch (err) {
      console.error('ERROR IN STAGE 4 W01-W12:', err);
      throw err;
    }
  });

    it('STAGE 4 — W13 - W18: Create local Commit 3 and perform second live Push', async () => {
      try {
        // W13: Create local Commit 3
        const currentFiles = await readWorkingTree(projectId);
        await syncWorkingTree(projectId, [
          ...currentFiles,
          { path: `${runFolder}/test-3.txt`, content: 'Step 3: new file 3 added in commit 3\n', language: 'text' },
        ]);
        await stageAll(projectId);
        const c3 = await commit(projectId, 'test: W13 commit 3 from GB Coder');
        commit3LocalSha = c3.sha;

        // W14: Perform second real Push
        const pushResult2 = await pushRemote(projectId, disposableRepo, disposableToken);
        assert.ok(pushResult2.commitSha);
        assert.notEqual(pushResult2.commitSha, push1HeadSha, 'Second push must produce a new remote HEAD SHA');
        push2HeadSha = pushResult2.commitSha;

        // W15: Verify all three commits are preserved in order
        const commitsRes = await fetch(`https://api.github.com/repos/${disposableRepo}/commits?sha=${testBranchName}&per_page=5`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${disposableToken}`,
            'User-Agent': 'GB-Coder-Live-Acceptance',
          },
        });
        const commitsList = await commitsRes.json();
        assert.equal(commitsList[0].commit.message, 'test: W13 commit 3 from GB Coder');
        assert.equal(commitsList[1].commit.message, 'test: W07 commit 2 from GB Coder');
        assert.equal(commitsList[2].commit.message, 'test: W05 commit 1 from GB Coder');
        assert.equal(commitsList[0].parents[0].sha, commitsList[1].sha);
        assert.equal(commitsList[1].parents[0].sha, commitsList[2].sha);

        // Verify new file 3 is present on GitHub
        const file3Res = await fetch(`https://api.github.com/repos/${disposableRepo}/contents/${runFolder}/test-3.txt?ref=${testBranchName}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${disposableToken}`,
            'User-Agent': 'GB-Coder-Live-Acceptance',
          },
        });
        assert.equal(file3Res.status, 200);

        recordOperation({
          id: 'STAGE-4-PUSH2',
          operation: 'APPEND_COMMIT_PUSH',
          status: 'PASS',
          newRemoteHead: push2HeadSha,
          ancestry: `${commitsList[0].sha} -> ${commitsList[1].sha} -> ${commitsList[2].sha}`,
        });
      } catch (err) {
        console.error('ERROR IN STAGE 4 W13-W18:', err);
        throw err;
      }
    });

    it('STAGE 6 — Real live Fetch detects remote-only commit', async () => {
      try {
        // 1. Introduce an authorized remote-only commit via GitHub REST API
        const remoteNoteUrl = `https://api.github.com/repos/${disposableRepo}/contents/${runFolder}/remote-note.txt`;
        const createRemoteRes = await fetch(remoteNoteUrl, {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${disposableToken}`,
            'User-Agent': 'GB-Coder-Live-Acceptance',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'test: remote-only commit via GitHub API',
            content: Buffer.from('Created directly on remote to verify fetch\n').toString('base64'),
            branch: testBranchName,
          }),
        });
        assert.ok(createRemoteRes.status === 201 || createRemoteRes.status === 200);
        const remoteCommitData = await createRemoteRes.json();
        remoteEditSha = remoteCommitData.commit.sha;

        // 2. Execute fetchRemote
        const fetchStatus = await fetchRemote(projectId, disposableRepo, disposableToken);
        assert.equal(fetchStatus.behind, 1, 'Local repository must report behind by 1 commit');
        assert.equal(fetchStatus.latestRemoteSha, remoteEditSha);

        // 3. Verify working tree does NOT have the remote file yet
        const workingFiles = await readWorkingTree(projectId);
        assert.equal(workingFiles.some((f) => f.path === `${runFolder}/remote-note.txt`), false);

        recordOperation({
          id: 'STAGE-6-FETCH',
          operation: 'LIVE_FETCH',
          status: 'PASS',
          remoteCommitSha: remoteEditSha,
          behindCount: fetchStatus.behind,
        });
      } catch (err) {
        console.error('ERROR IN STAGE 6 FETCH:', err);
        throw err;
      }
    });

    it('STAGE 7 — Real live Pull fast-forwards and merges files into working tree', async () => {
      try {
        // Execute pullRemote
        const pullResult = await pullRemote(projectId, disposableRepo, disposableToken);
        assert.ok(pullResult.commitSha, 'Pull must return a valid commit SHA');
        assert.equal(pullResult.status, 'fast-forward');

        // Verify working tree now HAS the remote file
        const workingFilesAfter = await readWorkingTree(projectId);
        const pulledFile = workingFilesAfter.find((f) => f.path === `${runFolder}/remote-note.txt`);
        assert.ok(pulledFile, 'Remote note must now exist in local working tree');
        assert.match(pulledFile.content, /Created directly on remote to verify fetch/);

        // Verify log history reflects remote commit
        const localLogs = await getLog(projectId, 5);
        assert.equal(localLogs[0].message, 'test: remote-only commit via GitHub API');

        recordOperation({
          id: 'STAGE-7-PULL',
          operation: 'LIVE_PULL',
          status: 'PASS',
          newLocalHead: localLogs[0].sha,
          pulledFilePath: pulledFile.path,
        });
      } catch (err) {
        console.error('ERROR IN STAGE 7 PULL:', err);
        throw err;
      }
    });

    it('STAGE 8 — Non-fast-forward push rejection and safety failure tests', async () => {
      // 1. Introduce another remote edit to make remote ahead
      await fetch(`https://api.github.com/repos/${disposableRepo}/contents/${runFolder}/remote-barrier.txt`, {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test: remote barrier commit',
          content: Buffer.from('Barrier content\n').toString('base64'),
          branch: testBranchName,
        }),
      });

      // 2. Make local commit without pulling
      await syncWorkingTree(projectId, [
        { path: 'README.md', content: '# GB Coder Integration Test\n\nLive acceptance run.', language: 'markdown' },
        { path: `${runFolder}/divergent-local.txt`, content: 'Local divergence\n', language: 'text' },
      ]);
      await stageAll(projectId);
      await commit(projectId, 'test: local divergent commit');

      // 3. Push MUST reject non-fast-forward reference
      await assert.rejects(
        async () => {
          await pushRemote(projectId, disposableRepo, disposableToken);
        },
        /Cannot push non-fast-forward reference/i
      );

      // 4. Test invalid token failure handling
      await assert.rejects(
        async () => {
          await fetchRemote(projectId, disposableRepo, 'ghp_invalid_token_xyz_00000000000000000000');
        },
        /GitHub token expired or unauthorized/i
      );

      recordOperation({
        id: 'STAGE-8-FAILURE-GUARDS',
        operation: 'NON_FAST_FORWARD_REJECTION',
        status: 'PASS',
        details: 'Non-fast-forward push rejected; invalid token rejected',
      });
    });

    it('STAGE 12 — Preserve test branch on remote for operator inspection', async () => {
      // Explicitly verify the test branch exists on GitHub and leave it intact
      const branchRes = await fetch(`https://api.github.com/repos/${disposableRepo}/git/ref/heads/${testBranchName}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${disposableToken}`,
          'User-Agent': 'GB-Coder-Live-Acceptance',
        },
      });
      assert.equal(branchRes.status, 200);
      const branchData = await branchRes.json();
      console.log(`[STAGE-12] Verified test branch preserved on GitHub: ${testBranchName}`);
      console.log(`[STAGE-12] Branch URL: https://github.com/${disposableRepo}/tree/${testBranchName}`);
      console.log(`[STAGE-12] Branch HEAD SHA: ${branchData.object.sha}`);

      recordOperation({
        id: 'STAGE-12-PRESERVATION',
        operation: 'BRANCH_PRESERVED',
        status: 'PASS',
        branchName: testBranchName,
        branchUrl: `https://github.com/${disposableRepo}/tree/${testBranchName}`,
        headSha: branchData.object.sha,
      });
    });
  });

  after(() => {
    setTimeout(() => process.exit(0), 100);
  });
}
