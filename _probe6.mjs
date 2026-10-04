import { chromium } from 'playwright';
const b = await chromium.launch();
const mod = await import('./src/services/templates/portfolio/developer.ts');
const t = mod.default;
const p = await b.newPage({ viewport: { width: 360, height: 900 } });
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+t.javascript.replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
console.log(JSON.stringify(await p.evaluate(() => {
  const main = document.getElementById('main');
  const out = [];
  for (const sec of main.children) {
    const prev = sec.style.display;
    sec.style.display = 'none';
    const w = document.documentElement.scrollWidth;
    sec.style.display = prev;
    if (w < 805) out.push({ sec: sec.tagName.toLowerCase()+'#'+sec.id+'.'+(typeof sec.className==='string'?sec.className.trim().split(/\s+/).slice(0,2).join('.'):''), withoutIt: w });
  }
  return out;
}), null, 1));
await b.close();
