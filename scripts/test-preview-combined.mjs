import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createPreviewServer } from './preview-combined.mjs';

const server = createPreviewServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let passed = 0;
try {
  const homepage = await fetch(base);
  assert.equal(homepage.status, 200); assert.match(await homepage.text(), /Start Coding/); passed++;
  const app = await fetch(`${base}/app/projects/disposable/editor`);
  assert.equal(app.status, 200); assert.equal(app.headers.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(app.headers.get('cross-origin-embedder-policy'), 'require-corp');
  assert.match(await app.text(), /id="root"/); passed++;
  const assets = await fs.readdir('dist/app/assets');
  const script = assets.find((name) => name.endsWith('.js') && name.startsWith('index-'));
  const worker = assets.find((name) => name.endsWith('.js') && name.startsWith('html.worker-'));
  for (const asset of [script, worker]) {
    assert.ok(asset); const response = await fetch(`${base}/app/assets/${asset}`);
    assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /javascript/);
    assert.ok(!(await response.text()).trimStart().startsWith('<')); passed++;
  }
  const missingAsset = await fetch(`${base}/app/assets/missing-module.js`);
  assert.equal(missingAsset.status, 404); assert.match(missingAsset.headers.get('content-type'), /text\/plain/); passed++;
  const missingApi = await fetch(`${base}/api/missing-route`);
  assert.equal(missingApi.status, 404); assert.match(missingApi.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await missingApi.json(), { error: 'API route not found' }); passed++;
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200); assert.match(health.headers.get('content-type'), /application\/json/);
  assert.ok(await health.json()); passed++;
  const bundle = JSON.parse(execFileSync(process.execPath, ['scripts/measure-initial-bundle.mjs', '--json'], { encoding: 'utf8' }));
  assert.ok(bundle.criticalJsBytes < 600 * 1024, `initial JS budget exceeded: ${bundle.criticalJsBytes} bytes`);
  assert.equal(bundle.chunks.some((chunk) => /monaco-runtime|editor\.main/.test(chunk.file)), false, 'Monaco engine must stay outside dashboard preload');
  console.log(`Initial JS ${bundle.criticalJsBytes} bytes; Monaco engine excluded from preload`);
  console.log(`${passed}/7 HTTP route, script, worker, MIME and API checks passed`);
} finally { await new Promise((resolve) => server.close(resolve)); }
