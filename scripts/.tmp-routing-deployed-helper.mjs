import { chromium as original } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
export const base = 'https://gb-coder-public-alpha-g1c7qkmuj.vercel.app';
const cli = 'C:/Users/Girish Lade/AppData/Local/npm-cache/_npx/69f9afb961c37556/node_modules/vercel/dist/index.js';
const project = JSON.parse(execFileSync(process.execPath, [cli, '--scope', 'girishlade111-gmailcoms-projects', 'api', '/v9/projects/prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD?teamId=team_0KwVxrmoybIMrA9NiwTV5FLY', '--method', 'GET'], {encoding:'utf8',stdio:['ignore','pipe','pipe']}));
if(project.id !== 'prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD') throw new Error('Wrong project');
const secret = Object.keys(project.protectionBypass || {}).find(key => project.protectionBypass[key].scope === 'automation-bypass');
if(!secret) throw new Error('Existing automation credential unavailable; creation prohibited by this harness');
const evidence={base,credential:'existing shared credential; not created or revoked',pages:[],http:[],telemetry:[]};
function safe(value){return JSON.parse(JSON.stringify(value).split(secret).join('[REDACTED]'));}
export const chromium={async launch(options){
 const browser=await original.launch(options); const newContext=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await newContext(options);
  await context.route(base+'/**', async route=>{
   const request=route.request();
   await route.continue({headers:{...request.headers(),'x-vercel-protection-bypass':secret,'x-vercel-set-bypass-cookie':'true'}});
  });
  const access=await context.request.get(base+'/app/projects',{headers:{'x-vercel-protection-bypass':secret,'x-vercel-set-bypass-cookie':'true'},maxRedirects:0});
  evidence.http.push({path:'/app/projects',status:access.status(),mime:access.headers()['content-type'],coop:access.headers()['cross-origin-opener-policy'],coep:access.headers()['cross-origin-embedder-policy']});
  context.on('page',page=>{
   const item={console:[],pageErrors:[],failedRequests:[],timings:[]};evidence.pages.push(item);
   page.on('console',m=>item.console.push({type:m.type(),text:m.text(),at:Date.now()}));
   page.on('pageerror',e=>item.pageErrors.push(e.message));
   page.on('requestfailed',r=>item.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
   page.on('domcontentloaded',()=>item.timings.push({url:page.url(),at:Date.now()}));
  });
  return context;
 };
 const close=browser.close.bind(browser);browser.close=async()=>{await fs.writeFile('reports/routing-deployed-'+(process.env.STAGE_B3_SUITE||'browser')+'-diagnostics.json',JSON.stringify(safe(evidence),null,2));await close();};
 return browser;
}};
