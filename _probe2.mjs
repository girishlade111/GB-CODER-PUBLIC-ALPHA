import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [rel, w] of [['ai-agents/chatbot.ts',1280],['portfolio/developer.ts',360]]) {
  const mod = await import('./src/services/templates/'+rel);
  const t = mod.default;
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'</body></html>', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.right > cw + 1 || b.left < -1) {
        // is any ancestor clipping on the x axis?
        let clipped = false, a = el.parentElement;
        while (a && a !== document.documentElement) {
          const ox = getComputedStyle(a).overflowX;
          if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; }
          a = a.parentElement;
        }
        if (!clipped) out.push({ el: el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.trim().split(/\s+/).slice(0,2).join('.'):''), pos: getComputedStyle(el).position, left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width) });
      }
    }
    return { cw, scrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, unclipped: out.slice(0,10) };
  });
  console.log('\n=== '+rel+' @'+w+' === scrollW='+r.scrollW+' bodyScrollW='+r.bodyScrollW+' clientW='+r.cw);
  r.unclipped.forEach(x => console.log('   ', JSON.stringify(x)));
  await p.close();
}
await b.close();
