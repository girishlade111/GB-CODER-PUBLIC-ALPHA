import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';

const cwd = process.cwd();
const bundle = await build({
  stdin: {
    contents: `
      export * from './src/services/git/gitRemoteService.ts';
      export * from './src/services/git/gitEngineService.ts';
    `,
    resolveDir: cwd,
    loader: 'ts',
  },
  bundle: true,
  external: ['isomorphic-git', '@isomorphic-git/lightning-fs', 'fake-indexeddb/auto'],
  format: 'esm',
  platform: 'node',
  write: false,
});

const mod = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const { initRepository, syncWorkingTree, stageAll, commit, setRemoteTrackingRef, pushRemote } = mod;

const projectId = 'debug-push-1';
const baseSha = await initRepository(projectId, [{ path: 'README.md', content: 'init', language: 'markdown' }]);
await setRemoteTrackingRef(projectId, 'origin', 'main', baseSha);

await syncWorkingTree(projectId, [{ path: 'README.md', content: 'init' }, { path: 'a.js', content: 'a' }]);
await stageAll(projectId);
await commit(projectId, 'commit 1');

await syncWorkingTree(projectId, [{ path: 'README.md', content: 'init' }, { path: 'a.js', content: 'a' }, { path: 'b.js', content: 'b' }]);
await stageAll(projectId);
await commit(projectId, 'commit 2');

globalThis.fetch = async (url, opts) => {
  console.log('FETCH:', opts?.method || 'GET', url);
  if (url.includes('/git/ref/heads/') || url.includes('/git/refs/heads/')) {
    if (opts?.method === 'PATCH') return { ok: true, status: 200, json: async () => ({ object: { sha: 'pushed-head' } }) };
    return { ok: true, status: 200, json: async () => ({ object: { sha: baseSha } }) };
  }
  if (url === 'https://api.github.com/repos/org/repo') return { ok: true, status: 200, json: async () => ({ permissions: { push: true } }) };
  if (url.includes('/commits?')) return { ok: true, status: 200, json: async () => [{ sha: baseSha, commit: { message: 'm', author: {} }, parents: [] }] };
  if (url.includes('/git/commits/')) return { ok: true, status: 200, json: async () => ({ sha: baseSha, tree: { sha: 'base-tree' } }) };
  if (url.includes('/git/trees/')) return { ok: true, status: 200, json: async () => ({ sha: 'base-tree', tree: [{ path: 'README.md', type: 'blob', sha: 'b1' }] }) };
  if (url.includes('/git/blobs')) return { ok: true, status: 201, json: async () => ({ sha: 'blob1' }) };
  if (url.includes('/git/trees')) return { ok: true, status: 201, json: async () => ({ sha: 'tree1' }) };
  if (url.includes('/git/commits')) return { ok: true, status: 201, json: async () => ({ sha: 'commit-sha-new' }) };
  return { ok: false, status: 404 };
};

try {
  const res = await pushRemote(projectId, 'org/repo', 'tok');
  console.log('SUCCESS:', res);
} catch (err) {
  console.error('ERROR in debug-test:', err);
}

