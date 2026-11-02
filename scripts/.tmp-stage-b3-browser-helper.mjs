import { chromium as original } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
export const base = 'https://gb-coder-public-alpha-ccyelci13.vercel.app';
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
  await context.exposeBinding('__stageB3Metric',(_,event)=>evidence.telemetry.push(event));
  await context.addInitScript(()=>{
   if(location.origin !== 'https://gb-coder-public-alpha-ccyelci13.vercel.app')return;
   const send=(stage,extra={})=>void globalThis.__stageB3Metric({stage,url:location.href,at:Date.now(),navigationMs:performance.now(),...extra});
   addEventListener('DOMContentLoaded',()=>send('application_dom_loaded'));
   let previousPromise,previousInstance,previousInstall=false,previousVite='';
   setInterval(()=>{
    const promise=globalThis.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
    if(promise && promise!==previousPromise){previousPromise=promise;const start=performance.now();send('boot_promise_observed');promise.then(()=>send('boot_promise_resolved',{durationMs:performance.now()-start}),()=>send('boot_promise_rejected'));}
    const instance=globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    if(instance && instance!==previousInstance){previousInstance=instance;send('runtime_instance_available');}
    const text=Array.from(document.querySelectorAll('.xterm-rows')).map(n=>n.innerText).join('\n');
    if(!previousInstall && /Installing dependencies|npm install/.test(text)){previousInstall=true;send('npm_install_text_observed');}
    const completion=text.match(/(?:added \d+ packages?|up to date)[^\n]*/);
    if(completion && previousInstall){send('npm_completion_text_observed',{text:completion[0]});previousInstall=false;}
    const vite=text.match(/ready in\s+(\d+)\s*ms/i);
    if(vite && previousVite!==vite[0]){previousVite=vite[0];send('vite_ready_text_observed',{reportedMs:Number(vite[1])});}
   },50);
  });
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
 const close=browser.close.bind(browser);browser.close=async()=>{await fs.writeFile('reports/stage-b3-'+(process.env.STAGE_B3_SUITE||'browser')+'-diagnostics.json',JSON.stringify(safe(evidence),null,2));await close();};
 return browser;
}};
