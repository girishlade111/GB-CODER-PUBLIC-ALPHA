import fs from 'node:fs';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const config='registry=https://registry.npmjs.org\nignore-scripts=true\naudit=false\nfund=false\nprogress=false\nupdate-notifier=false\nfetch-retries=0\n';
const fixtures={};
for(const kind of ['react','vue']){
  const dir='scripts/.tmp-b4-4/'+kind,pkg=fs.readFileSync(dir+'/package.json','utf8'),lock=fs.readFileSync(dir+'/package-lock.json','utf8'),data=JSON.parse(lock);
  for(const [p,e]of Object.entries(data.packages)){
    if(p&&(!e.resolved?.startsWith('https://registry.npmjs.org/')||!e.integrity||e.link))throw Error('Ineligible fixture lock '+p);
    if(e.hasInstallScript&&!['node_modules/esbuild','node_modules/fsevents'].includes(p))throw Error('Unreviewed lifecycle '+p);
  }
  const marker=kind==='react'?'B44_REACT_A':'B44_VUE_B';
  const main=kind==='react'?`import React from 'react';import{createRoot}from'react-dom/client';createRoot(document.getElementById('app')).render(React.createElement('h1',{id:'marker'},'${marker}'));`:
    `import{createApp,h}from'vue';createApp({render:()=>h('h1',{id:'marker'},'${marker}')}).mount('#app');`;
  const files={'package.json':pkg,'package-lock.json':lock,'.npmrc':config,'.empty-user.npmrc':'','.empty-global.npmrc':'',
    'index.html':'<!doctype html><div id="app"></div><script type="module" src="/src/main.js"></script>',
    'src/main.js':main,['project-'+kind+'.txt']:marker};
  fixtures[kind]={project:kind==='react'?'A':'B',incarnation:'synthetic-'+kind+'-1',marker,files,
    manifestSha:sha(pkg),lockSha:sha(lock),configSha:sha(config),packages:Object.keys(data.packages).length,
    scriptPackages:Object.entries(data.packages).filter(([,e])=>e.hasInstallScript).map(([p,e])=>({path:p,version:e.version,execution:'disabled by ignore-scripts'})),
    nativeToolingJustification:'Vite tooling only: esbuild/rollup platform helpers generated in WebContainer, never copied from host. All lifecycle scripts disabled, no arbitrary native addons; exact Node/npm/platform/API compatibility and actual Vite execution required. No cross-engine portability assumption.'};
}
fs.writeFileSync('scripts/.tmp-b4-4/fixtures.json',JSON.stringify(fixtures));
fs.writeFileSync('reports/b4-4-fixture-identity.json',JSON.stringify(Object.fromEntries(Object.entries(fixtures).map(([k,v])=>[k,{...v,files:undefined}])),null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(fixtures).map(([k,v])=>[k,{manifestSha:v.manifestSha,lockSha:v.lockSha,packages:v.packages,scriptPackages:v.scriptPackages}]))));
