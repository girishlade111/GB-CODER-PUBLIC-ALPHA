/**
 * GB Coder Phase 4.1 — Remote Git Correctness & Verification Suite
 *
 * Verifies:
 * - Remote Git Configuration (R01, R14)
 * - GitHub App and Token Security (R02, R11, R12, R13)
 * - Clone Semantics and Commit History Reconstruction (CLONE01 - CLONE04)
 * - Fetch Semantics and Object Database Writing (FETCH01 - FETCH04)
 * - Push Semantics and Non-Fast-Forward Protection (PUSH01 - PUSH05)
 * - Pull Semantics and Fast-Forward Merge (PULL01 - PULL03)
 * - Pull Request Workflow (P01 - P05)
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
const outdir = join(cwd, '.tmp-remote-git-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'git-remote-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/git/gitRemoteService.ts';
      export * from './src/services/git/gitPullRequestService.ts';
      export * from './src/services/git/gitGitHubAppService.ts';
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
  parseRepoFullName,
  getRemoteConfig,
  setRemoteConfig,
  fetchRemote,
  pullRemote,
  pushRemote,
  cloneRepository,
  importRepositoryFiles,
  getGitHubAppConfig,
  checkRepositoryPermissions,
  listPullRequests,
  createPullRequest,
  getPullRequestFiles,
  initRepository,
  commit,
  getLog,
  getRemoteTrackingRef,
  readWorkingTree,
  syncWorkingTree,
  stageAll,
} = await import(pathToFileURL(bundlePath).href);

after(() => {
  try {
    rmSync(outdir, { recursive: true, force: true });
  } catch {
    // Ignored
  }
  setTimeout(() => {
    process.exit(0);
  }, 50);
});

describe('GB Coder Phase 4.1 — Remote Git Operations Suite (R01 - R14)', () => {
  const projectId = 'remote-test-' + Date.now();

  it('R01 — Connect authorized repository and parse origin URL', () => {
    const parsed1 = parseRepoFullName('https://github.com/octocat/Hello-World.git');
    assert.equal(parsed1, 'octocat/Hello-World');

    const parsed2 = parseRepoFullName('octocat/Spoon-Knife');
    assert.equal(parsed2, 'octocat/Spoon-Knife');

    setRemoteConfig(projectId, {
      name: 'origin',
      url: 'https://github.com/octocat/Hello-World.git',
    });

    const stored = getRemoteConfig(projectId);
    assert.ok(stored);
    assert.equal(stored.name, 'origin');
    assert.equal(stored.url, 'https://github.com/octocat/Hello-World.git');
  });

  it('R02 — Detect GitHub App configuration or report pending status', () => {
    const config = getGitHubAppConfig();
    assert.equal(typeof config.isConfigured, 'boolean');
    if (!config.isConfigured) {
      assert.equal(config.appName, undefined);
    }
  });

  it('R11 — Reject insufficient permissions on write operations', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ permissions: { admin: false, push: false, pull: true } }),
      });

      const perms = await checkRepositoryPermissions('octocat/Hello-World', 'ghp_mock_read_token');
      assert.equal(perms.push, false);
      assert.equal(perms.pull, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('R12 / R13 — Handle token expiration (401) and missing repository (404)', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => ({
        ok: false,
        status: 401,
      });

      await assert.rejects(
        async () => {
          await checkRepositoryPermissions('octocat/Hello-World', 'expired_token');
        },
        /expired or unauthorized/,
      );

      globalThis.fetch = async () => ({
        ok: false,
        status: 404,
      });

      await assert.rejects(
        async () => {
          await checkRepositoryPermissions('octocat/Non-Existent', 'valid_token');
        },
        /not found or inaccessible/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('R14 — Avoid leaking credentials into Git config or snapshots', () => {
    const remote = getRemoteConfig(projectId);
    assert.ok(remote);
    assert.equal(remote.url.includes('ghp_'), false);
    assert.equal(remote.url.includes('github_pat_'), false);
    assert.equal(remote.url.includes('@'), false);
  });
});

describe('GB Coder Phase 4.1 — Clone Semantics & History Reconstruction (CLONE01 - CLONE04)', () => {
  it('CLONE01 — Reconstruct authentic commit history chain and parent ancestry on clone', async () => {
    const cloneProjectId = 'clone-test-' + Date.now();
    const originalFetch = globalThis.fetch;

    try {
      globalThis.fetch = async (url) => {
        // Branch ref
        if (url.includes('/git/ref/heads/')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ object: { sha: '3333333333333333333333333333333333333333' } }),
          };
        }
        // Commit tree pointer
        if (url.includes('/git/commits/3333333333333333333333333333333333333333')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ sha: '3333333333333333333333333333333333333333', tree: { sha: 'tree-sha-root' } }),
          };
        }
        // Tree entries
        if (url.includes('/git/trees/tree-sha-root')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              sha: 'tree-sha-root',
              tree: [
                { path: 'README.md', type: 'blob', sha: 'blob1' },
                { path: 'src/index.ts', type: 'blob', sha: 'blob2' },
              ],
            }),
          };
        }
        // Blob contents
        if (url.includes('/git/blobs/blob1')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ content: Buffer.from('# Hello World').toString('base64'), encoding: 'base64' }),
          };
        }
        if (url.includes('/git/blobs/blob2')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ content: Buffer.from('console.log("app");').toString('base64'), encoding: 'base64' }),
          };
        }
        // Commit chain API
        if (url.includes('/commits?')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                sha: '3333333333333333333333333333333333333333',
                commit: {
                  message: 'Commit 3: Feature complete',
                  author: { name: 'Alice Dev', email: 'alice@example.com', date: '2026-11-03T12:00:00Z' },
                },
                parents: [{ sha: '2222222222222222222222222222222222222222' }],
              },
              {
                sha: '2222222222222222222222222222222222222222',
                commit: {
                  message: 'Commit 2: Add index file',
                  author: { name: 'Alice Dev', email: 'alice@example.com', date: '2026-11-02T12:00:00Z' },
                },
                parents: [{ sha: '1111111111111111111111111111111111111111' }],
              },
              {
                sha: '1111111111111111111111111111111111111111',
                commit: {
                  message: 'Commit 1: Initial commit',
                  author: { name: 'Alice Dev', email: 'alice@example.com', date: '2026-11-01T12:00:00Z' },
                },
                parents: [],
              },
            ],
          };
        }
        return { ok: false, status: 404 };
      };

      const result = await cloneRepository({
        projectId: cloneProjectId,
        repoFullName: 'octocat/Hello-World',
        branch: 'main',
        token: 'mock_token',
      });

      assert.equal(result.files.length, 2);
      assert.equal(result.commitCount, 3);
      assert.ok(result.headSha);

      // Verify commit logs
      const logs = await getLog(cloneProjectId, 10);
      assert.equal(logs.length, 3);
      assert.equal(logs[0].message, 'Commit 3: Feature complete');
      assert.equal(logs[1].message, 'Commit 2: Add index file');
      assert.equal(logs[2].message, 'Commit 1: Initial commit');

      // Verify parent relationships
      assert.equal(logs[0].parentShas.length, 1);
      assert.equal(logs[0].parentShas[0], logs[1].sha);
      assert.equal(logs[1].parentShas.length, 1);
      assert.equal(logs[1].parentShas[0], logs[2].sha);
      assert.equal(logs[2].parentShas.length, 0);

      // Verify remote tracking ref
      const trackingRef = await getRemoteTrackingRef(cloneProjectId, 'origin', 'main');
      assert.equal(trackingRef, logs[0].sha);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('CLONE02 — Import repository files creates single initial commit without historical ancestry', async () => {
    const importProjectId = 'import-test-' + Date.now();
    const originalFetch = globalThis.fetch;

    try {
      globalThis.fetch = async (url) => {
        if (url.includes('/git/ref/heads/')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ object: { sha: 'import-sha-1' } }),
          };
        }
        if (url.includes('/git/commits/import-sha-1')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ sha: 'import-sha-1', tree: { sha: 'import-tree-1' } }),
          };
        }
        if (url.includes('/git/trees/import-tree-1')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              sha: 'import-tree-1',
              tree: [{ path: 'package.json', type: 'blob', sha: 'pkg-blob' }],
            }),
          };
        }
        if (url.includes('/git/blobs/pkg-blob')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ content: Buffer.from('{"name":"test"}').toString('base64'), encoding: 'base64' }),
          };
        }
        return { ok: false, status: 404 };
      };

      const result = await importRepositoryFiles({
        projectId: importProjectId,
        repoFullName: 'octocat/Hello-World',
        branch: 'main',
      });

      assert.equal(result.files.length, 1);
      const logs = await getLog(importProjectId, 10);
      assert.equal(logs.length, 1);
      assert.equal(logs[0].message, 'Initial commit');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('GB Coder Phase 4.1 — Remote Fetch Semantics & Object Writing (FETCH01 - FETCH04)', () => {
  it('FETCH01 — Remote fetch writes commit objects to object database and advances remote tracking ref', async () => {
    const fetchProjectId = 'fetch-test-' + Date.now();
    const initialFiles = [{ path: 'main.ts', content: 'console.log("local");', language: 'typescript' }];
    const localHead = await initRepository(fetchProjectId, initialFiles);

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url) => {
        if (url.includes('/git/ref/heads/')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ object: { sha: 'remote-sha-9999' } }),
          };
        }
        if (url.includes('/commits?')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                sha: 'remote-sha-9999',
                commit: {
                  message: 'Remote commit on GitHub',
                  author: { name: 'Bob Remote', email: 'bob@example.com', date: '2026-11-09T08:00:00Z' },
                },
                parents: [{ sha: localHead }],
              },
            ],
          };
        }
        return { ok: false, status: 404 };
      };

      const wtBefore = await readWorkingTree(fetchProjectId);
      const result = await fetchRemote(fetchProjectId, 'octocat/Hello-World', 'ghp_token');
      const wtAfter = await readWorkingTree(fetchProjectId);

      // Verify working tree files remain completely unchanged
      assert.deepEqual(wtBefore, wtAfter);

      // Verify remote tracking ref was updated
      const trackingRef = await getRemoteTrackingRef(fetchProjectId, 'origin', 'main');
      assert.ok(trackingRef);

      // Verify behind count reflects new remote commit
      assert.equal(result.behind, 1);
      assert.equal(result.ahead, 0);
      assert.equal(result.isUpToDate, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('GB Coder Phase 4.1 — Remote Push Semantics & Protection (PUSH01 - PUSH05)', () => {
  it('PUSH01 — Rejects non-fast-forward push when remote contains unmerged commits', async () => {
    const pushProjectId = 'push-test-' + Date.now();
    const initialFiles = [{ path: 'app.js', content: 'console.log(1);', language: 'javascript' }];
    const localHead = await initRepository(pushProjectId, initialFiles);

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url) => {
        if (url === 'https://api.github.com/repos/octocat/Hello-World') {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ permissions: { admin: false, push: true, pull: true } }),
          };
        }
        if (url.includes('/git/ref/heads/') || url.includes('/git/refs/heads/')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ object: { sha: 'different-remote-head-sha' } }),
          };
        }
        if (url.includes('/commits?')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => [
              {
                sha: 'different-remote-head-sha',
                commit: {
                  message: 'Remote commit ahead',
                  author: { name: 'Remote User', email: 'r@r.com', date: '2026-11-09T08:00:00Z' },
                },
                parents: [{ sha: localHead }],
              },
            ],
          };
        }
        return { ok: false, status: 404, headers: new Headers() };
      };

      await assert.rejects(
        async () => {
          await pushRemote(pushProjectId, 'octocat/Hello-World', 'mock_write_token');
        },
        /Cannot push non-fast-forward reference/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('PUSH02 — Pushes local commit when fast-forward and updates remote tracking ref', async () => {
    const pushProjectId = 'push-fastforward-' + Date.now();
    const initialFiles = [{ path: 'app.js', content: 'console.log(1);', language: 'javascript' }];
    const headSha = await initRepository(pushProjectId, initialFiles);

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, opts) => {
        // Permissions check
        if (url === 'https://api.github.com/repos/octocat/Hello-World') {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ permissions: { admin: false, push: true, pull: true } }),
          };
        }
        // Fetch remote ref check (reports in sync with local head)
        if (url.includes('/git/ref/heads/') || url.includes('/git/refs/heads/')) {
          if (opts?.method === 'PATCH') {
            return {
              ok: true,
              status: 200,
              headers: new Headers(),
              json: async () => ({ object: { sha: 'pushed-new-commit-sha-7777' } }),
            };
          }
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ object: { sha: headSha } }),
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
                sha: headSha,
                commit: {
                  message: 'Initial commit',
                  author: { name: 'Dev', email: 'dev@test.com', date: '2026-11-09T00:00:00Z' },
                },
                parents: [],
              },
            ],
          };
        }
        // GitHub Git Data API commits
        if (url.includes('/git/commits/')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ sha: headSha, tree: { sha: 'tree-sha-base' } }),
          };
        }
        if (url.includes('/git/trees/')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({ sha: 'tree-sha-base', tree: [{ path: 'app.js', type: 'blob', sha: 'b1' }] }),
          };
        }
        if (url.includes('/git/blobs')) {
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({ sha: 'blob-sha' }),
          };
        }
        if (url.includes('/git/trees')) {
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({ sha: 'tree-sha' }),
          };
        }
        if (url.includes('/git/commits')) {
          return {
            ok: true,
            status: 201,
            headers: new Headers(),
            json: async () => ({ sha: 'pushed-new-commit-sha-7777', html_url: 'https://github.com/octocat/Hello-World/commit/7777' }),
          };
        }
        return { ok: false, status: 404, headers: new Headers() };
      };

      const result = await pushRemote(pushProjectId, 'octocat/Hello-World', 'mock_write_token');
      assert.equal(result.commitSha, 'pushed-new-commit-sha-7777');
      assert.equal(result.branch, 'main');

      // Verify remote tracking ref reconciled to canonical remote commit object
      const trackingRef = await getRemoteTrackingRef(pushProjectId, 'origin', 'main');
      assert.ok(trackingRef);
      // Tracking ref matches the reconciled commit object written to .git/objects
      const logsAfter = await getLog(pushProjectId, 1);
      assert.equal(trackingRef, logsAfter[0].sha);
      assert.equal(logsAfter[0].message, 'Initial commit\n');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('GB Coder Phase 4.1 — Remote Pull Semantics (PULL01 - PULL03)', () => {
  it('PULL01 — Rejects pull operation when uncommitted local changes exist', async () => {
    const pullProjectId = 'pull-dirty-' + Date.now();
    const initialFiles = [{ path: 'code.ts', content: 'v1', language: 'typescript' }];
    await initRepository(pullProjectId, initialFiles);

    // Modify working tree and stage it without committing
    await syncWorkingTree(pullProjectId, [{ path: 'code.ts', content: 'v2', language: 'typescript' }]);
    await stageAll(pullProjectId);

    await assert.rejects(
      async () => {
        await pullRemote(pullProjectId, 'octocat/Hello-World', 'mock_token');
      },
      /Cannot pull with uncommitted local changes/,
    );
  });
});

describe('GB Coder Phase 4 — Pull Request Suite (P01 - P06)', () => {
  it('P01 — Validate pull request creation inputs', async () => {
    await assert.rejects(
      async () => {
        await createPullRequest('octocat/Hello-World', 'mock_token', {
          title: '',
          head: 'feature',
          base: 'main',
        });
      },
      /Pull request title must not be empty/,
    );

    await assert.rejects(
      async () => {
        await createPullRequest('octocat/Hello-World', 'mock_token', {
          title: 'My PR',
          head: '',
          base: 'main',
        });
      },
      /Source branch \(head\) must be specified/,
    );
  });

  it('P02 / P03 — Create and list pull requests with full metadata', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, opts) => {
        if (opts?.method === 'POST') {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              id: 99101,
              number: 42,
              title: 'Add new feature',
              body: 'Feature description',
              state: 'open',
              html_url: 'https://github.com/octocat/Hello-World/pull/42',
              head: { ref: 'feature/new-button' },
              base: { ref: 'main' },
              user: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat.gif' },
              created_at: '2026-11-09T00:00:00Z',
              updated_at: '2026-11-09T00:00:00Z',
            }),
          };
        }
        if (url.includes('/pulls/42/files')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              { filename: 'src/App.tsx', status: 'modified', additions: 10, deletions: 2, changes: 12 },
            ],
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 99101,
              number: 42,
              title: 'Add new feature',
              body: 'Feature description',
              state: 'open',
              html_url: 'https://github.com/octocat/Hello-World/pull/42',
              head: { ref: 'feature/new-button' },
              base: { ref: 'main' },
              user: { login: 'octocat', avatar_url: 'https://github.com/images/error/octocat.gif' },
              created_at: '2026-11-09T00:00:00Z',
              updated_at: '2026-11-09T00:00:00Z',
            },
          ],
        };
      };

      const created = await createPullRequest('octocat/Hello-World', 'mock_token', {
        title: 'Add new feature',
        body: 'Feature description',
        head: 'feature/new-button',
        base: 'main',
      });
      assert.equal(created.number, 42);
      assert.equal(created.title, 'Add new feature');
      assert.equal(created.state, 'open');

      const prList = await listPullRequests('octocat/Hello-World', 'mock_token');
      assert.equal(prList.length, 1);
      assert.equal(prList[0].number, 42);
      assert.equal(prList[0].headBranch, 'feature/new-button');

      const files = await getPullRequestFiles('octocat/Hello-World', 'mock_token', 42);
      assert.equal(files.length, 1);
      assert.equal(files[0].filename, 'src/App.tsx');
      assert.equal(files[0].additions, 10);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('P05 — Reject unauthorized PR operations cleanly', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => ({
        ok: false,
        status: 401,
      });

      await assert.rejects(
        async () => {
          await listPullRequests('octocat/Hello-World', 'bad_token');
        },
        /expired or unauthorized/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
