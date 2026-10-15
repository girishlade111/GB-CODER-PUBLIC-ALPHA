import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRoutingPreview, compileRoutes } from './helpers/vercel-routing-preview.mjs';

const config=JSON.parse(readFileSync('vercel.json','utf8'));
const before=JSON.parse(execFileSync('git',['show','ac58b6b552422aa78e3f94c9e2dc5ee94902a018:vercel.json'],{encoding:'utf8'}));
// Only the final app rewrite may change. Headers/API/marketing/legacy routes
// and configured function count must remain identical to the reviewed candidate.
const oldRule=before.rewrites.pop(),newRule=config.rewrites.at(-1);
assert.deepEqual({...config,rewrites:config.rewrites.slice(0,-1)},before);
assert.equal(oldRule.source,'/app/(.*)');
assert.equal(newRule.destination,'/app/index.html');
const routes=compileRoutes(config);
assert.ok(routes.findIndex(r=>r.handle==='filesystem')<routes.findIndex(r=>r.dest));
const appRule=routes.at(-1);
const spa=['/app','/app/','/app/projects','/app/projects/synthetic-id/editor','/app/projects/synthetic-id/ide',
  '/app/projects/synthetic-id/editor/','/app/ide','/app/editor','/ide','/preview-popout',
  '/preview/synthetic-id','/mpreview/synthetic-id'];
const missing=['/app/assets/stage-b3-missing.js','/app/assets/stage-b3-missing.css',
  '/app/assets/missing.worker.js','/app/workbox-missing.js','/app/assets/nested/missing.js',
  '/app/assets/missing.js.map','/app/assets/extensionless','/app/assets','/app/missing.mjs',
  '/app/missing.wasm','/app/missing.js/','/app/missing.CSS','/app/icons/missing.png',
  '/app/sw-missing.js?version=1','/app/manifest-missing.webmanifest'];
for(const url of missing)assert.equal(new RegExp(appRule.src).test(new URL(url,'http://localhost').pathname),false,url);
const servers=[createRoutingPreview({...before,rewrites:[...before.rewrites,oldRule]}),createRoutingPreview(config)];
for(const server of servers)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const [oldBase,base]=servers.map(s=>`http://127.0.0.1:${s.address().port}`);
const evidence={method:'official routing-utils compilation plus local HTTP filesystem/rewrites model; not deployed Vercel',results:[]};
async function check(url,status,type,app=false) {
  const r=await fetch(base+url),body=Buffer.from(await r.arrayBuffer());
  assert.equal(r.status,status,url);assert.match(r.headers.get('content-type') || '',type,url);
  if(app){assert.deepEqual(body,readFileSync('dist/app/index.html'));assert.equal(r.headers.get('cross-origin-opener-policy'),'same-origin');assert.equal(r.headers.get('cross-origin-embedder-policy'),'require-corp');}
  evidence.results.push({url,status:r.status,mime:r.headers.get('content-type'),bytes:body.length});
}
try {
  const r=await fetch(oldBase+missing[0]);assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),readFileSync('dist/app/index.html'));
  evidence.before={url:missing[0],status:200,spaHtml:true};
  for(const path of spa)await check(path,200,/html/,!path.startsWith('/preview/')&&!path.startsWith('/mpreview/'));
  for(const url of missing)await check(url,404,/text\/plain/);
  function walk(dir){return readdirSync(dir).flatMap(name=>statSync(dir+'/'+name).isDirectory()?walk(dir+'/'+name):[dir+'/'+name]);}
  const assets=walk('dist/app/assets');
  const selected=[assets.find(p=>/\/index-[^/]+\.js$/.test(p)),assets.find(p=>p.endsWith('.css')),
    assets.find(p=>/editor\.main-.*\.js$/.test(p)),...['html','css','ts','editor'].map(n=>assets.find(p=>p.includes('/'+n+'.worker-')&&p.endsWith('.js')))];
  for(const file of selected){assert.ok(file);await check(file.replace(/^dist/,''),200,file.endsWith('.css')?/text\/css/:/javascript/);}
  await check('/app/sw.js',200,/javascript/);await check('/app/manifest.webmanifest',200,/manifest/);
  const resource=walk('dist/app').find(p=>/\.(png|svg|ico|jpeg)$/.test(p));assert.ok(resource);await check(resource.replace(/^dist/,''),200,/image/);
  await check('/api/stage-b3-missing',404,/json/);await check('/api/health',200,/json/);
  await check('/',200,/html/);await check('/about/',200,/html/);
  const marketingAsset=walk('dist/_astro').find(p=>p.endsWith('.css')||p.endsWith('.js'));assert.ok(marketingAsset);await check(marketingAsset.replace(/^dist/,''),200,marketingAsset.endsWith('.css')?/css/:/javascript/);
  console.log(`${evidence.results.length} routing HTTP assertions passed; old config reproduces 200 SPA HTML; new config rejects asset rewrites`);
} finally {
  await Promise.all(servers.map(s=>new Promise(r=>s.close(r))));
  writeFileSync('reports/stage-b3-routing-http.json',JSON.stringify(evidence,null,2));
}
