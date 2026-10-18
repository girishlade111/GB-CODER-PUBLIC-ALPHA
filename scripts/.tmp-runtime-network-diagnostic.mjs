import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium,base} from './.tmp-routing-deployed-helper.mjs';
const attempt=Number(process.argv.find(a=>a.startsWith('--attempt='))?.split('=')[1]||1);
if(![1,2].includes(attempt))throw Error('Only two controlled attempts authorized');
const id='runtime-network-'+attempt,marker='RUNTIME_NETWORK_REACT_'+attempt;
const pkg='{"name":"wc-react","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-react":"^4.3.0"}}';
const files={'package.json':pkg,'vite.config.js':"import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n",'index.html':'<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>','src/main.jsx':`import React from 'react';\nimport {createRoot} from 'react-dom/client';\ncreateRoot(document.getElementById('root')).render(<h1 id="marker">${marker}</h1>);\n`};
const evidence={attempt,deploymentId:'dpl_6FDZFqyKFYgzsW4sZ9FtKXNaShbK',sha:'546e74c084387d007b0312b9fbd69a9f6a6b55f1',base,timeoutMs:240000,startedAt:new Date().toISOString(),network:[],console:[],pageErrors:[],snapshots:[],observations:[],status:'RUNNING'};
const out=`reports/runtime-network-attempt-${attempt}.json`;
const b=await chromium.launch({headless:true,args:['--enable-features=SharedArrayBuffer']});let context,page;
const relevant=url=>/nr\.staticblitz\.com|stackblitz\.com|staticblitz\.com|webcontainer-api\.io/.test(url);
const seen=new Map();
async function save(){await fs.writeFile(out,JSON.stringify(evidence,null,2));}
try{
 context=await b.newContext({viewport:{width:1440,height:1000}});
 context.on('request',r=>{if(relevant(r.url()))seen.set(r,{start:Date.now(),url:r.url(),method:r.method()});});
 context.on('requestfailed',r=>{const row=seen.get(r);if(row)evidence.network.push({...row,end:Date.now(),failure:r.failure()?.errorText,timing:r.timing()});});
 context.on('response',async r=>{const row=seen.get(r.request());if(row)evidence.network.push({...row,responseAt:Date.now(),status:r.status(),mime:r.headers()['content-type'],timing:r.request().timing(),security:await r.securityDetails().catch(()=>null)});});
 await context.addInitScript(()=>{
  if(location.origin!=='https://gb-coder-public-alpha-g1c7qkmuj.vercel.app')return;
  localStorage.setItem('gbcoder_onboarded','true');
  const d={events:[],processes:[],output:[],outputBytes:0};globalThis.__runtimeDiagnostic=d;
  const event=(type,details={})=>d.events.push({type,at:Date.now(),navigationMs:performance.now(),...details});
  const instrumented=new WeakSet();let instance,bootPromise;
  Object.defineProperty(globalThis,'__GBCODER_WEBCONTAINER_BOOT_PROMISE__',{configurable:true,get:()=>bootPromise,set:p=>{bootPromise=p;if(p){event('boot_promise_assigned');p.then(()=>event('boot_completed'),e=>event('boot_failed',{error:String(e)}));}}});
  function instrument(c){if(!c||instrumented.has(c))return;instrumented.add(c);event('runtime_instance_assigned');
   try{
    c.on('server-ready',(port,url)=>event('server_ready',{port,url}));
    const mount=c.mount.bind(c);c.mount=async(...args)=>{event('mount_invoked',{topLevelNames:Object.keys(args[0]||{})});try{const r=await mount(...args);event('mount_completed');return r;}catch(e){event('mount_failed',{error:String(e)});throw e;}};
    const spawn=c.spawn.bind(c);c.spawn=async(...args)=>{const index=d.processes.length;const p={index,command:args[0],args:Array.isArray(args[1])?args[1]:null,invokedAt:Date.now(),state:'spawning'};d.processes.push(p);event('process_spawn_invoked',{index,command:p.command,args:p.args});try{const process=await spawn(...args);p.state='running';p.spawnedAt=Date.now();event('process_spawned',{index,command:p.command});process.exit.then(code=>{p.state='exited';p.exitCode=code;p.exitedAt=Date.now();event('process_exit',{index,code});},e=>event('process_exit_error',{index,error:String(e)}));
     const [applicationOutput,diagnosticOutput]=process.output.tee();
     void(async()=>{const reader=diagnosticOutput.getReader();while(true){const {done,value}=await reader.read();if(done)break;const text=typeof value==='string'?value:new TextDecoder().decode(value);if(d.outputBytes<262144){d.output.push({at:Date.now(),index,text});d.outputBytes+=text.length;}}})().catch(e=>event('output_capture_error',{index,error:String(e)}));
     const input=new Proxy(process.input,{get(target,key){if(key==='getWriter')return(...a)=>{const writer=target.getWriter(...a);return new Proxy(writer,{get(w,k){if(k==='write')return chunk=>{event('shell_input',{index,text:String(chunk).slice(0,4096)});return w.write(chunk);};const v=Reflect.get(w,k,w);return typeof v==='function'?v.bind(w):v;}});};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
     return new Proxy(process,{get(target,key){if(key==='output')return applicationOutput;if(key==='input')return input;const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
    }catch(e){p.state='spawn_failed';p.error=String(e);event('process_spawn_failed',{index,error:String(e)});throw e;}};
   }catch(e){event('instrumentation_error',{error:String(e)});}
  }
  Object.defineProperty(globalThis,'__GBCODER_WEBCONTAINER_INSTANCE__',{configurable:true,get:()=>instance,set:c=>{instance=c;instrument(c);}});
  addEventListener('DOMContentLoaded',()=>event('document_loaded'));
 });
 page=await context.newPage();
 page.on('console',m=>evidence.console.push({at:Date.now(),type:m.type(),text:m.text()}));page.on('pageerror',e=>evidence.pageErrors.push({at:Date.now(),message:e.message}));
 await page.goto(base+'/app/projects',{waitUntil:'domcontentloaded'});await page.getByTestId('project-dashboard').waitFor();
 await page.evaluate(({id,files})=>new Promise((resolve,reject)=>{const r=indexedDB.open('gb-coder-projects-db',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction(['projects','projectFiles'],'readwrite');tx.objectStore('projects').put({id,name:'Controlled runtime diagnostic',editorStyle:'vscode',projectType:'react',createdAt:Date.now(),lastOpenedAt:Date.now(),fileCount:Object.keys(files).length});for(const [path,content]of Object.entries(files))tx.objectStore('projectFiles').put({projectId:id,path,content});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};r.onerror=()=>reject(r.error);}),{id,files});
 evidence.ideNavigationAt=Date.now();await page.goto(base+`/app/projects/${id}/ide`,{waitUntil:'domcontentloaded'});await page.getByTestId('vscode-mode').waitFor({timeout:60000});
 const deadline=Date.now()+240000;let lastCount=0,lastSnapshot=0,dom;
 while(Date.now()<deadline){
  evidence.runtime=await page.evaluate(()=>globalThis.__runtimeDiagnostic);
  if(evidence.runtime.events.length!==lastCount){for(const e of evidence.runtime.events.slice(lastCount).filter(e=>!['shell_input'].includes(e.type)))console.log(`attempt ${attempt} ${e.type}`);lastCount=evidence.runtime.events.length;}
  if(Date.now()-lastSnapshot>10000){evidence.snapshots.push({at:Date.now(),terminal:await page.locator('.xterm-rows').first().innerText().catch(()=>''),previewUrl:await page.getByTestId('preview-iframe').first().getAttribute('src').catch(()=>null),activeProject:await page.evaluate(()=>localStorage.getItem('gb-coder-active-project-id'))});lastSnapshot=Date.now();await save();}
  for(const frame of page.frames()){if(frame===page.mainFrame()||!frame.url().includes('webcontainer-api.io'))continue;const text=await frame.locator('#marker').textContent({timeout:500}).catch(()=>null);if(text===marker){dom={at:Date.now(),url:frame.url(),marker:text};break;}}
  if(dom)break;await page.waitForTimeout(1000);
 }
 evidence.runtime=await page.evaluate(()=>globalThis.__runtimeDiagnostic);evidence.finalTerminal=await page.locator('.xterm-rows').first().innerText().catch(()=>'');
 evidence.previewUrl=await page.getByTestId('preview-iframe').first().getAttribute('src').catch(()=>null);
 evidence.filesystem=await page.evaluate(async()=>{const c=globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;if(!c)return null;return {root:await c.fs.readdir('.'),package:await c.fs.readFile('package.json','utf-8'),source:await c.fs.readFile('src/main.jsx','utf-8')};}).catch(e=>({error:e.message}));
 evidence.previewDom=dom||null;evidence.elapsedMs=Date.now()-evidence.ideNavigationAt;
 const output=evidence.runtime.output.map(x=>x.text).join('');const plain=output.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');evidence.plainOutput=plain;
 evidence.readinessRegexObserved=/ready in \d+\s?ms/i.test(plain)||/ready in \d+\s?ms/i.test(evidence.finalTerminal);
 evidence.npmCompletionObserved=/added \d+ packages?|up to date/.test(plain);
 assert.ok(evidence.runtime.events.some(e=>e.type==='boot_completed'),'boot completed');assert.ok(evidence.runtime.events.some(e=>e.type==='mount_completed'),'mount completed');assert.ok(evidence.npmCompletionObserved,'successful dependency completion text observed');assert.ok(evidence.runtime.events.some(e=>e.type==='server_ready'),'server-ready observed');assert.ok(dom,'expected actual React preview DOM rendered');assert.equal(evidence.filesystem.package,pkg,'project root scope');assert.equal(evidence.filesystem.source,files['src/main.jsx'],'project source scope');assert.equal(new URL(page.url()).pathname,`/app/projects/${id}/ide`);
 evidence.status='PASS';console.log(`attempt ${attempt} PASS actual DOM in ${evidence.elapsedMs}ms`);
}catch(e){evidence.status='FAIL';evidence.error=e.stack;console.error(`attempt ${attempt} FAIL ${e.message}`);if(page){evidence.runtime=await page.evaluate(()=>globalThis.__runtimeDiagnostic).catch(()=>null);evidence.finalTerminal=await page.locator('.xterm-rows').first().innerText().catch(()=>'');evidence.finalBody=await page.locator('body').innerText().catch(()=>'');await page.screenshot({path:`reports/runtime-network-attempt-${attempt}-failure.png`,fullPage:true}).catch(()=>{});}process.exitCode=1;}
finally{evidence.finishedAt=new Date().toISOString();await save();await context?.close();await b.close();}
