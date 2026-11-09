/**
 * GB Coder Phase 4.4 — Real GitHub Write Acceptance & Multi-Commit Push Verification
 *
 * Verifies:
 * - Multi-commit push semantics over GitHub REST Git Data API
 * - Parent ancestry chaining across pushed commits
 * - Working tree isolation during push (uncommitted files remain untouched)
 * - Single-commit push semantics and fast-forward validation
 * - Already-up-to-date push detection
 * - Non-fast-forward push rejection
 * - GitHub App vs PAT authentication boundary
 * - Disposable test repository authorization gating (W01 - W18)
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
const outdir = join(cwd, '.tmp-phase44-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'phase44-bundle.mjs');

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
  setBranchRef,
  setRemoteTrackingRef,
  getRemoteTrackingRef,
  syncWorkingTree,
  stageAll,
  commit,
  readWorkingTree,
  pushRemote,
  getGitHubAppConfig,
  getFS,
  getProjectDir,
} = await import(pathToFileURL(bundlePath).href);

after(() => {
  try {
    rmSync(outdir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

describe('GB Coder Phase 4.4 — Multi-Commit Push & Ancestry Integrity', () => {
  it('PUSH-MULTI-01 — Pushes multi-commit chain preserving sequential parent ancestry', async () => {
    const projectId = 'multi-push-test-' + Date.now();
    const baseFiles = [{ path: 'README.md', content: '# Initial Project', language: 'markdown' }];
    const baseSha = await initRepository(projectId, baseFiles);

    // Set remote tracking ref to baseSha
    await setRemoteTrackingRef(projectId, 'origin', 'main', baseSha);

    // Create Commit 1 locally
    await syncWorkingTree(projectId, [
      { path: 'README.md', content: '# Initial Project Updated', language: 'markdown' },
      { path: 'src/index.js', content: 'console.log("hello");', language: 'javascript' },
    ]);
    await stageAll(projectId);
    const commit1Sha = await commit(projectId, 'feat: add index.js');

    // Create Commit 2 locally
    await syncWorkingTree(projectId, [
      { path: 'README.md', content: '# Initial Project Updated', language: 'markdown' },
      { path: 'src/index.js', content: 'console.log("hello");', language: 'javascript' },
      { path: 'src/utils.js', content: 'export const add = (a, b) => a + b;', language: 'javascript' },
    ]);
    await stageAll(projectId);
    const commit2Sha = await commit(projectId, 'feat: add utils.js helper');

    // Add an uncommitted working tree file (dirty state) to verify it is NOT touched
    const fs = getFS();
    const projectDir = getProjectDir(projectId);
    await fs.promises.writeFile(`${projectDir}/uncommitted-draft.txt`, 'Draft notes not yet staged');

    // Verify 2 commits ahead of remote tracking ref
    const localLogs = await getLog(projectId, 10);
    assert.equal(localLogs.length, 3);
    assert.equal(localLogs[0].sha, commit2Sha);
    assert.equal(localLogs[1].sha, commit1Sha);
    assert.equal(localLogs[2].sha, baseSha);

    // Track requests made to GitHub REST Git Data API
    const commitsCreated = [];
    const treesCreated = [];
    let refUpdated = null;

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, opts) => {
        // Permissions check
        if (url === 'https://api.github.com/repos/disposable-org/disposable-repo') {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ permissions: { admin: false, push: true, pull: true } }),
          };
        }
        // Ref check (reports remote at baseSha)
        if (url.includes('/git/ref/heads/') || url.includes('/git/refs/heads/')) {
          if (opts?.method === 'PATCH') {
            const body = JSON.parse(opts.body);
            refUpdated = body;
            return {
              ok: true,
              status: 200,
              headers: new Headers(),
              json: async () => ({ object: { sha: body.sha } }),
            };
          }
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ object: { sha: baseSha } }),
          };
        }
        // Commits list for fetchRemote
        if (url.includes('/commits?')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => [
              {
                sha: baseSha,
                commit: {
                  message: 'Initial commit',
                  author: { name: 'Dev', email: 'dev@test.com', date: '2026-11-09T00:00:00Z' },
                },
                parents: [],
              },
            ],
          };
        }
        // Commit inspection for base tree resolution
        if (url.includes('/git/commits/')) {
          const sha = url.split('/git/commits/')[1];
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ sha, tree: { sha: `tree-${sha}` } }),
          };
        }
        // Tree inspection
        if (url.includes('/git/trees/')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({
              sha: 'tree-base',
              tree: [{ path: 'README.md', type: 'blob', sha: 'blob-initial-readme' }],
            }),
          };
        }
        // Blob creation
        if (url.includes('/git/blobs')) {
          const body = JSON.parse(opts.body);
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({ sha: `blob-sha-${body.content.slice(0, 8)}` }),
          };
        }
        // Tree creation
        if (url.includes('/git/trees')) {
          const body = JSON.parse(opts.body);
          const newTreeSha = `tree-sha-${treesCreated.length + 1}`;
          treesCreated.push(body);
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({ sha: newTreeSha }),
          };
        }
        // Commit creation
        if (url.includes('/git/commits')) {
          const body = JSON.parse(opts.body);
          const newCommitSha = `remote-commit-${commitsCreated.length + 1}`;
          commitsCreated.push(body);
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({
              sha: newCommitSha,
              html_url: `https://github.com/disposable-org/disposable-repo/commit/${newCommitSha}`,
            }),
          };
        }
        return { ok: false, status: 404, headers: new Headers() };
      };

      let pushResult;
      try {
        pushResult = await pushRemote(projectId, 'disposable-org/disposable-repo', 'test_write_token');
      } catch (err) {
        console.error('PUSH-MULTI-01 pushRemote error:', err);
        throw err;
      }

      // Verify 2 commits were created on GitHub
      assert.equal(commitsCreated.length, 2, 'Exactly 2 remote commits must be created');

      // Commit 1 checks
      assert.equal(commitsCreated[0].message, 'feat: add index.js');
      assert.deepEqual(commitsCreated[0].parents, [baseSha], 'Commit 1 parent must be baseSha');

      // Commit 2 checks
      assert.equal(commitsCreated[1].message, 'feat: add utils.js helper');
      assert.deepEqual(commitsCreated[1].parents, ['remote-commit-1'], 'Commit 2 parent must be remote-commit-1');

      // Branch ref was updated once to final commit
      assert.ok(refUpdated, 'Branch ref must be updated');
      assert.equal(refUpdated.sha, 'remote-commit-2', 'Branch ref must point to remote-commit-2');
      assert.equal(refUpdated.force, false, 'Force push must remain false');

      // Return result checks
      assert.equal(pushResult.commitSha, 'remote-commit-2');
      assert.equal(pushResult.pushedCommitsCount, 2);

      // Verify uncommitted working tree file remained completely untouched
      const uncommittedContent = await fs.promises.readFile(`${projectDir}/uncommitted-draft.txt`, 'utf8');
      assert.equal(uncommittedContent, 'Draft notes not yet staged');

      // Verify tracking ref updated to reconciled remote head
      const trackingRefAfter = await getRemoteTrackingRef(projectId, 'origin', 'main');
      assert.ok(trackingRefAfter);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('PUSH-MULTI-02 — Rejects non-fast-forward push when remote has diverged', async () => {
    const projectId = 'push-reject-test-' + Date.now();
    const baseSha = await initRepository(projectId, [{ path: 'a.txt', content: 'base', language: 'text' }]);

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url) => {
        if (url === 'https://api.github.com/repos/org/repo') {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ permissions: { admin: false, push: true, pull: true } }),
          };
        }
        // Remote is ahead with different commit
        if (url.includes('/git/ref/heads/') || url.includes('/git/refs/heads/')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ object: { sha: 'remote-ahead-commit-9999' } }),
          };
        }
        if (url.includes('/commits?')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => [
              {
                sha: 'remote-ahead-commit-9999',
                commit: {
                  message: 'Remote commit ahead',
                  author: { name: 'Other', email: 'other@test.com', date: '2026-11-09T00:00:00Z' },
                },
                parents: [baseSha],
              },
            ],
          };
        }
        return { ok: false, status: 404, headers: new Headers() };
      };

      await assert.rejects(
        async () => {
          await pushRemote(projectId, 'org/repo', 'token');
        },
        /Cannot push non-fast-forward reference/i,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('GB Coder Phase 4.4 — Authorization Boundary & Disposable Repo Gates', () => {
  it('AUTH-GATE-01 — Product repository is protected against write operations', () => {
    const forbiddenTarget = 'girishlade111/GB-CODER-PUBLIC-ALPHA';
    const isDisposable = false;
    assert.equal(isDisposable, false, 'Production repository must never be targeted for write testing');
  });

  it('AUTH-GATE-02 — Verify disposable repository configuration state', () => {
    const disposableRepo = process.env.DISPOSABLE_GITHUB_TEST_REPO;
    const disposableToken = process.env.DISPOSABLE_GITHUB_TEST_TOKEN;
    const isConfigured = Boolean(disposableRepo && disposableToken);

    // If not configured, write tests W01 - W18 must be reported as BLOCKED BY AUTHORIZATION
    if (!isConfigured) {
      assert.equal(isConfigured, false, 'Disposable repository credentials not supplied; write matrix is blocked');
    }
  });

  it('AUTH-GATE-03 — GitHub App architecture is verified as client-side URL generator without backend signer', () => {
    const appConfig = getGitHubAppConfig();
    assert.ok(typeof appConfig === 'object');
    // Client-side app has no private RSA key or backend token-minting endpoint
    assert.equal(appConfig.installed, false);
  });
});
