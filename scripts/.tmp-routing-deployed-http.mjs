import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,base} from './.tmp-routing-deployed-helper.mjs';
const evidence={base,deploymentId:'dpl_6FDZFqyKFYgzsW4sZ9FtKXNaShbK',sha:'546e74c084387d007b0312b9fbd69a9f6a6b55f1',results:[]};
const browser=await chromium.launch({headless:true});const context=await browser.newContext();
async function response(path){const r=await context.request.get(base+path,{maxRedirects:0});const body=await r.text();const row={path,status:r.status(),mime:r.headers()['content-type'],coop:r.headers()['cross-origin-opener-policy'],coep:r.headers()['cross-origin-embedder-policy'],bytes:Buffer.byteLength(body),appShell:/^\s*(<!doctype html|<html)/i.test(body)&&body.includes('id="root"')};evidence.results.push(row);return{r,body,row};}
try{
 const app=await response('/app/projects');assert.equal(app.row.status,200);assert.ok(app.row.appShell);
 for(const path of ['/app','/app/','/app/projects/routing-synthetic/editor','/app/projects/routing-synthetic/ide','/ide','/preview-popout']){const {row,body}=await response(path);assert.equal(row.status,200,path);assert.equal(body,app.body,path);assert.equal(row.coop,'same-origin',path);assert.equal(row.coep,'require-corp',path);}
 for(const path of ['/preview/routing-synthetic','/mpreview/routing-synthetic']){const {row,body}=await response(path);assert.equal(row.status,200,path);assert.equal(body,app.body,path);}
 for(const path of ['/app/assets/stage-b3-missing.js','/app/assets/stage-b3-missing.css','/app/assets/missing.worker.js','/app/workbox-missing.js','/app/assets/nested/missing.js','/app/assets/missing.js.map','/app/missing.mjs','/app/missing.wasm','/app/assets/extensionless','/app/sw-missing.js?version=1','/app/manifest-missing.webmanifest']){const {row,body}=await response(path);assert.equal(row.status,404,path);assert.notEqual(body,app.body,path);assert.equal(row.appShell,false,path);}
 const buildLog=await fs.readFile('reports/routing-deployed-build.log','utf8');
 const names=[...buildLog.matchAll(/dist-staging\/ide\/assets\/([^\s]+)/g)].map(m=>m[1]);
 const urls=new Set([...app.body.matchAll(/(?:src|href)="(\/app\/assets\/[^"?]+)"/g)].map(m=>m[1]));
 for(const prefix of ['editor.main-','html.worker-','css.worker-','ts.worker-','editor.worker-']){const name=names.find(n=>n.startsWith(prefix)&&n.endsWith('.js'));assert.ok(name,prefix);urls.add('/app/assets/'+name);}
 for(const path of urls){const {row}=await response(path);assert.equal(row.status,200,path);assert.match(row.mime,path.endsWith('.css')?/text\/css/:path.endsWith('.ico')?/image\//:/javascript/,path);assert.equal(row.appShell,false,path);}
 for(const [path,mime] of [['/app/sw.js',/javascript/],['/app/manifest.webmanifest',/manifest/]]){const {row}=await response(path);assert.equal(row.status,200,path);assert.match(row.mime,mime,path);assert.equal(row.appShell,false,path);}
 const health=await response('/api/health');assert.equal(health.row.status,200);assert.match(health.row.mime,/json/);JSON.parse(health.body);
 const missing=await response('/api/stage-b3-missing');assert.equal(missing.row.status,404);assert.equal(missing.row.appShell,false);
 for(const path of ['/','/about/']){const {row}=await response(path);assert.equal(row.status,200,path);assert.equal(row.appShell,false,path);}
 evidence.status='PASS';console.log(`${evidence.results.length} deployed HTTP routing/asset/header assertions passed`);
}catch(e){evidence.status='FAIL';evidence.error=e.stack;console.error(e.message);process.exitCode=1;}
finally{await fs.writeFile('reports/routing-deployed-http.json',JSON.stringify(evidence,null,2));await context.close();await browser.close();}
