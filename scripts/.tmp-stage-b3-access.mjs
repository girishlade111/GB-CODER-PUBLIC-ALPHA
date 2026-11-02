import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base='https://gb-coder-public-alpha-ccyelci13.vercel.app';
const evidence={deploymentId:'dpl_FYnW629mEkc4KRPXEY6vdg5dpTUR',base,startedAt:new Date().toISOString(),console:[],pageErrors:[],failedRequests:[]};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext();
const page=await context.newPage();
page.on('console',m=>{if(m.type()==='error')evidence.console.push(m.text())});
page.on('pageerror',e=>evidence.pageErrors.push(e.message));
page.on('requestfailed',r=>evidence.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
try {
 const response=await page.goto(base+'/app/projects',{waitUntil:'domcontentloaded',timeout:45000});
 evidence.finalUrl=page.url(); evidence.status=response?.status(); evidence.title=await page.title();
 evidence.loginRequired=new URL(page.url()).hostname==='vercel.com' && new URL(page.url()).pathname.includes('login');
 evidence.responseHeaders=await response?.allHeaders();
 await page.screenshot({path:'reports/stage-b3-preview-access.png',fullPage:true});
 evidence.outcome=evidence.loginRequired?'BLOCKED_VERCEL_AUTHENTICATION':'ACCESS_REQUIRES_FURTHER_VERIFICATION';
} catch(e) {evidence.outcome='ACCESS_INCONCLUSIVE';evidence.error=e.stack;}
finally {await context.close();await browser.close();await fs.writeFile('reports/stage-b3-preview-access.json',JSON.stringify(evidence,null,2));}
console.log(JSON.stringify({outcome:evidence.outcome,url:evidence.finalUrl,status:evidence.status,title:evidence.title,error:evidence.error}));
