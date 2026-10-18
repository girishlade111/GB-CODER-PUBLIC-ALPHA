import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,base,writeEvidence} from './.tmp-b4-deployed-access.mjs';
import {seedProjects,REACT_PKG,REACT_VITE_CONFIG,REACT_INDEX,reactMain,VUE_PKG,VUE_VITE_CONFIG,VUE_INDEX,VUE_MAIN,vueApp} from './helpers/b4-fixtures.mjs';
const source=JSON.parse(await fs.readFile('reports/b4-deployed-runtime.json','utf8'));
assert.equal(source.samples.length,3);assert.ok(source.samples.every(s=>s.status==='PASS'));
assert.equal(source.controls[0].status,'PASS');
const records=source.controls[0].evidence.diagnostics;
const specs=[{id:'b4-a',name:'B4 React A',projectType:'react',editorStyle:'vscode',files:[
  {path:'package.json',content:REACT_PKG},{path:'vite.config.js',content:REACT_VITE_CONFIG},
  {path:'index.html',content:REACT_INDEX},{path:'src/main.jsx',content:reactMain('B4_REACT_A')}]},
{id:'b4-b',name:'B4 Vue B',projectType:'vue',editorStyle:'vscode',files:[
  {path:'package.json',content:VUE_PKG},{path:'vite.config.js',content:VUE_VITE_CONFIG},
  {path:'index.html',content:VUE_INDEX},{path:'src/main.js',content:VUE_MAIN},
  {path:'src/App.vue',content:vueApp('B4_VUE_B')},{path:'src/style.css',content:''}]}];
const http=JSON.parse(await fs.readFile('reports/b4-deployed-http.json','utf8'));
const evidence={method:'Captured sanitized runtime history and synthetic source fixtures seeded in a fresh disposable dashboard context; public attach/detach writes a synthetic cancelled diagnostic attempt; two measured reloads, no WebContainer startup',pageErrors:[],consoleErrors:[],failedRequests:[],observations:[]};
let browser,context;
try {
  browser=await chromium.launch({headless:true});context=await browser.newContext();
  const page=await context.newPage();page.on('pageerror',e=>evidence.pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')evidence.consoleErrors.push(m.text());});
  page.on('requestfailed',r=>evidence.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  await page.addInitScript(()=>{
    localStorage.setItem('gbcoder_onboarded','true');let boots=0;
    Object.defineProperty(globalThis,'__B4_PERSISTENCE_BOOTS__',{get:()=>boots});
    let promise;Object.defineProperty(globalThis,'__GBCODER_WEBCONTAINER_BOOT_PROMISE__',{
      configurable:true,get:()=>promise,set:p=>{promise=p;if(p)boots++;}});
  });
  await page.goto(base+'/app/projects');await page.getByTestId('project-dashboard').waitFor();
  await seedProjects(page,specs);
  await page.evaluate(records=>sessionStorage.setItem('gbcoder.startup.diagnostics.v1',JSON.stringify(records)),records);
  await page.reload();await page.getByTestId('project-dashboard').waitFor();
  const expectedRecords=await page.evaluate(async url=>{
    const {webcontainerService:s}=await import(url);
    s.attachProject('b4-synthetic-retention-control');s.detachProject();
    const records=s.getStartupDiagnostics(), stored=sessionStorage.getItem('gbcoder.startup.diagnostics.v1');
    if(JSON.stringify(records)!==stored||records.at(-1)?.state!=='cancelled'||stored.includes('b4-synthetic-retention-control'))
      throw Error('Actual compiled diagnostic writer failed retention/privacy check');
    if(globalThis.__B4_PERSISTENCE_BOOTS__!==0||s.captureStartupOwner().instance)throw Error('Unexpected runtime boot');
    return records;
  },base+http.servicePath);
  evidence.actualCompiledWriter={status:'PASS',newAttemptState:'cancelled',attempts:expectedRecords.length,rawProjectIdExcluded:true,bootCount:0};
  for(let i=0;i<2;i++) {
    await page.reload();await page.getByTestId('project-dashboard').waitFor();
    const state=await page.evaluate(async ({url,specs})=>{
      const {webcontainerService:s}=await import(url);
      const all=await new Promise((resolve,reject)=>{const r=indexedDB.open('gb-coder-projects-db',1);
        r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('projectFiles','readonly'),g=tx.objectStore('projectFiles').getAll();
          g.onsuccess=()=>resolve(g.result);g.onerror=()=>reject(g.error);tx.oncomplete=()=>db.close();};});
      return {records:s.getStartupDiagnostics(),stored:sessionStorage.getItem('gbcoder.startup.diagnostics.v1'),
        boots:globalThis.__B4_PERSISTENCE_BOOTS__,hasRuntime:Boolean(s.captureStartupOwner().instance),
        projects:specs.map(spec=>{const actual=all.filter(f=>f.projectId===spec.id);return {id:spec.id,count:actual.length,
          exact:actual.length===spec.files.length&&spec.files.every(f=>actual.find(a=>a.path===f.path)?.content===f.content)};})};
    },{url:base+http.servicePath,specs});
    assert.deepEqual(state.records,expectedRecords);assert.equal(state.stored,JSON.stringify(expectedRecords));
    assert.equal(state.boots,0);assert.equal(state.hasRuntime,false);assert.ok(state.projects.every(p=>p.exact));
    assert.doesNotMatch(state.stored,/B4_REACT_A|B4_VUE_B|npm install|"b4-a"|"b4-b"/);
    assert.ok(records.length<=5&&Buffer.byteLength(state.stored)<=262144);
    evidence.observations.push({reload:i+1,attempts:state.records.length,bytes:Buffer.byteLength(state.stored),
      recordsExact:true,projects:state.projects,boots:state.boots,hasRuntime:state.hasRuntime});
  }
  assert.equal(evidence.pageErrors.length,0);evidence.status='PASS';console.log('PASS: sanitized diagnostic history and both exact IndexedDB fixtures survive two dashboard reloads; zero WebContainer starts');
}catch(error){evidence.status='FAIL';evidence.error=error.message;process.exitCode=1;}
finally{await writeEvidence('reports/b4-deployed-persistence.json',evidence);await context?.close();await browser?.close();}
