import { chromium } from 'playwright';
const b = await chromium.launch();
const mod = await import('./src/services/templates/portfolio/developer.ts');
const t = mod.default;
const p = await b.newPage({ viewport: { width: 360, height: 900 } });
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+t.javascript.replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
console.log(JSON.stringify(await p.evaluate(() => {
  const cw = document.documentElement.clientWidth;
  const res = [];
  for (const el of document.querySelectorAll('body *')) {
    const bb = el.getBoundingClientRect();
    if (bb.right <= cw + 1) continue;
    let clippedAt = null;
    let a = el.parentElement;
    while (a) {
      const ox = getComputedStyle(a).overflowX;
      if (ox !== 'visible') { clippedAt = a.tagName.toLowerCase()+'.'+(typeof a.className==='string'?a.className.trim().split(/\s+/)[0]:'')+'('+ox+')'; break; }
      a = a.parentElement;
    }
    res.push({ el: el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):''), right: Math.round(bb.right), w: Math.round(bb.width), clippedAt });
  }
  return res.slice(0, 14);
}), null, 1));
await b.close();
