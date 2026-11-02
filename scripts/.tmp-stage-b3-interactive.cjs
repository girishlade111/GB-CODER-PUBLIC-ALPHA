const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:false});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
await page.goto('https://gb-coder-public-alpha-ccyelci13.vercel.app/app/projects',{waitUntil:'domcontentloaded'});
console.log('OWNER_LOGIN_WINDOW_OPEN '+new URL(page.url()).hostname);
fs.writeFileSync('reports/stage-b3-interactive-session.json',JSON.stringify({status:'AWAITING_OWNER_LOGIN',deploymentId:'dpl_FYnW629mEkc4KRPXEY6vdg5dpTUR',readyVerified:true}));
let authenticated=false;
while(browser.isConnected()){
 await new Promise(r=>setTimeout(r,2000));
 if(!authenticated && page.url().startsWith('https://gb-coder-public-alpha-ccyelci13.vercel.app/app')){
  authenticated=true; console.log('PREVIEW_AUTHENTICATED');
  fs.writeFileSync('reports/stage-b3-interactive-session.json',JSON.stringify({status:'AUTHENTICATED',deploymentId:'dpl_FYnW629mEkc4KRPXEY6vdg5dpTUR',readyVerified:true}));
 }
}
})().catch(e=>{console.error(e);process.exitCode=1});
