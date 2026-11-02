import { chromium, base, writeEvidence } from './.tmp-b4-deployed-access.mjs';
const evidence = { states: [], failedRequests: [], responses: [], consoleErrors: [], pageErrors: [] };
let browser, context;
try {
  browser = await chromium.launch({headless:true}); context = await browser.newContext();
  context.on('requestfailed', r=>evidence.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  context.on('response', r=>{if(r.status()>=400 || /sw\.js|workbox/.test(r.url()))evidence.responses.push({url:r.url(),status:r.status()});});
  const page=await context.newPage();page.on('console',m=>{if(m.type()==='error')evidence.consoleErrors.push(m.text());});
  page.on('pageerror',e=>evidence.pageErrors.push(e.message));
  await page.goto(base+'/app/projects');await page.getByTestId('project-dashboard').waitFor();
  for(let i=0;i<31;i++) {
    const state=await page.evaluate(async()=>({at:Date.now(),controller:navigator.serviceWorker.controller?.scriptURL,
      registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,
        installing:r.installing?{state:r.installing.state,url:r.installing.scriptURL}:null,
        waiting:r.waiting?{state:r.waiting.state,url:r.waiting.scriptURL}:null,
        active:r.active?{state:r.active.state,url:r.active.scriptURL}:null}))}));
    evidence.states.push(state);
    if(state.controller===base+'/app/sw.js'&&state.registrations.some(r=>r.scope===base+'/app/'&&r.active?.state==='activated')) { evidence.status='PASS';break; }
    if(i<30)await page.waitForTimeout(1000);
  }
  if(evidence.status!=='PASS'){evidence.status='FAIL';process.exitCode=1;}
  console.log(JSON.stringify({status:evidence.status,first:evidence.states[0],last:evidence.states.at(-1),failedRequests:evidence.failedRequests,pageErrors:evidence.pageErrors}));
} catch(error) {evidence.status='FAIL';evidence.error=error.message;process.exitCode=1;}
finally {await writeEvidence('reports/b4-deployed-sw-lifecycle.json',evidence);await context?.close();await browser?.close();}
