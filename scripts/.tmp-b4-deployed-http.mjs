import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { request } from 'playwright';
import { base, deploymentId, approvedSha, get, getDeployment, writeEvidence } from './.tmp-b4-deployed-access.mjs';
const evidence = { base, deploymentId, sha: approvedSha, startedAt: Date.now(), results: [] };
const deployment = getDeployment();
assert.equal(deployment.readyState, 'READY'); assert.equal(deployment.environment, 'preview');
const context = await request.newContext();
async function response(path) {
  const r = await get(context, path), body = await r.text();
  const row = { path, status: r.status(), mime: r.headers()['content-type'],
    coop: r.headers()['cross-origin-opener-policy'], coep: r.headers()['cross-origin-embedder-policy'],
    bytes: Buffer.byteLength(body), appShell: /^\s*(<!doctype html|<html)/i.test(body) && body.includes('id="root"') };
  evidence.results.push(row); return { r, body, row };
}
try {
  const app = await response('/app/projects'); assert.equal(app.row.status, 200); assert.ok(app.row.appShell);
  for (const path of ['/app', '/app/', '/app/projects/b4-synthetic/editor', '/app/projects/b4-synthetic/ide', '/ide', '/preview-popout']) {
    const {row, body} = await response(path); assert.equal(row.status, 200, path); assert.equal(body, app.body, path);
    assert.equal(row.coop, 'same-origin', path); assert.equal(row.coep, 'require-corp', path);
  }
  for (const path of ['/preview/b4-synthetic', '/mpreview/b4-synthetic']) {
    const {row, body} = await response(path); assert.equal(row.status, 200); assert.equal(body, app.body);
  }
  for (const path of ['/app/assets/b4-missing.js','/app/assets/b4-missing.css','/app/assets/b4-missing.worker.js',
    '/app/workbox-b4-missing.js','/app/assets/nested/b4-missing.js','/app/assets/b4-missing.js.map',
    '/app/b4-missing.mjs','/app/b4-missing.wasm','/app/assets/b4-extensionless','/app/sw-b4-missing.js?version=1','/app/manifest-b4-missing.webmanifest']) {
    const {row, body} = await response(path); assert.equal(row.status, 404, path); assert.notEqual(body, app.body); assert.equal(row.appShell, false);
  }
  const log = (await fs.readFile('reports/b4-deployed-build.log', 'utf8')).replace(/\x1b\[[0-9;]*m/g, '');
  const names = [...log.matchAll(/dist-staging\/ide\/assets\/([^\s]+)/g)].map(m=>m[1]);
  const urls = new Set([...app.body.matchAll(/(?:src|href)="(\/app\/assets\/[^"?]+)"/g)].map(m=>m[1]));
  for (const prefix of ['editor.main-','html.worker-','css.worker-','ts.worker-','editor.worker-','webcontainerService-']) {
    const name = names.find(n=>n.startsWith(prefix)&&n.endsWith('.js')); assert.ok(name, prefix); urls.add('/app/assets/'+name);
  }
  for (const path of urls) {
    const {row, body} = await response(path); assert.equal(row.status, 200, path);
    assert.match(row.mime, path.endsWith('.css')?/text\/css/:path.endsWith('.ico')?/image\//:/javascript/); assert.equal(row.appShell, false);
    if (path.includes('/webcontainerService-')) {
      evidence.servicePath = path; evidence.serviceSha256 = crypto.createHash('sha256').update(body).digest('hex');
      const record = JSON.parse(await fs.readFile('reports/b4-2a-final-source-artifact.json'));
      const expected = record.jsHashes.find(x=>x.path.endsWith(path.split('/').at(-1)));
      assert.ok(expected, 'Remote compiled service must match accepted local build'); assert.equal(evidence.serviceSha256, expected.sha256);
    }
  }
  for (const [path,mime] of [['/app/sw.js',/javascript/],['/app/manifest.webmanifest',/manifest/]]) {
    const {row}=await response(path); assert.equal(row.status,200); assert.match(row.mime,mime); assert.equal(row.appShell,false);
  }
  const health=await response('/api/health');assert.equal(health.row.status,200);assert.match(health.row.mime,/json/);JSON.parse(health.body);
  const missing=await response('/api/b4-missing');assert.equal(missing.row.status,404);assert.equal(missing.row.appShell,false);
  for(const path of ['/','/about/']) {const {row}=await response(path);assert.equal(row.status,200);assert.equal(row.appShell,false);}
  evidence.status='PASS'; console.log(evidence.results.length+' deployed HTTP cases PASS; compiled service hash matches accepted artifact');
} catch(error) { evidence.status='FAIL';evidence.error=error.message;console.error(error.message);process.exitCode=1; }
finally { evidence.completedAt=Date.now();await writeEvidence('reports/b4-deployed-http.json',evidence);await context.dispose(); }
