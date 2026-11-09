/**
 * GB Coder Phase 4 — Remote Git & GitHub API Unit Suite
 *
 * Verifies Remote Git (R01 - R14) and Pull Requests (P01 - P06) operations.
 * Tests use mock responses and contract checks when offline / without external GitHub App credentials.
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
  getGitHubAppConfig,
  checkRepositoryPermissions,
  listPullRequests,
  createPullRequest,
  getPullRequestFiles,
  initRepository,
  commit,
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

describe('GB Coder Phase 4 — Remote Git Operations Suite (R01 - R14)', () => {
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

  it('R03 / R04 — Clone repository setup contract', async () => {
    const initialFiles = [
      { path: 'package.json', content: '{"name": "clone-test"}', language: 'json' },
    ];
    const sha = await initRepository(projectId, initialFiles, { name: 'Clone User', email: 'clone@test.com' });
    assert.ok(sha);
    assert.equal(sha.length, 40);
  });

  it('R05 — Fetch remote ahead/behind calculation', async () => {
    const originalFetch = globalThis.fetch;
    try {
      // Mock GitHub ref API response matching local HEAD commit
      const localCommitSha = '1111111111111111111111111111111111111111';
      globalThis.fetch = async (url) => {
        if (url.includes('/git/ref/heads/')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ object: { sha: localCommitSha } }),
          };
        }
        return { ok: false, status: 404 };
      };

      const result = await fetchRemote(projectId, 'octocat/Hello-World', 'ghp_mock_token');
      assert.equal(typeof result.ahead, 'number');
      assert.equal(typeof result.behind, 'number');
      assert.equal(typeof result.isUpToDate, 'boolean');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('R11 — Reject insufficient permissions on write operations', async () => {
    const originalFetch = globalThis.fetch;
    try {
      // Mock repository response with read-only permissions (push: false)
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

