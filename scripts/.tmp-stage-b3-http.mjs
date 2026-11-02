import {chromium,base} from './.tmp-stage-b3-browser-helper.mjs';
import fs from 'node:fs/promises';
const b=await chromium.launch({headless:true});const c=await b.newContext();const results=[];
for(const path of ['/app/','/app/projects','/ide','/app/sw.js','/app/manifest.webmanifest','/app/assets/stage-b3-missing.js','/api/stage-b3-missing']){
 const r=await c.request.get(base+path,{maxRedirects:0});const t=await r.text();results.push({path,status:r.status(),mime:r.headers()['content-type'],coop:r.headers()['cross-origin-opener-policy'],coep:r.headers()['cross-origin-embedder-policy'],html:/^\s*(<!doctype html|<html)/i.test(t),bytes:Buffer.byteLength(t)});
}
await fs.writeFile('reports/stage-b3-http.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));await c.close();await b.close();
