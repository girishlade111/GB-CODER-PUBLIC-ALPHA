import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [rel, w] of [['ai-agents/chatbot.ts',1280],['portfolio/developer.ts',360],['portfolio/developer.ts',1280],['startup/landing.ts',1280],['business/agency.ts',1280],['plain/blog.ts',1280]]) {
  const mod = await import('./src/services/templates/'+rel);
  const t = mod.default;
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+(t.javascript||'').replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const before = window.scrollX;
    window.scrollTo(9999, window.scrollY);
    const after = window.scrollX;
    window.scrollTo(0, window.scrollY);
    return { canScrollX: after > before, scrollXMax: after, docScrollW: document.documentElement.scrollWidth,
             bodyOverflowX: getComputedStyle(document.body).overflowX,
             htmlOverflowX: getComputedStyle(document.documentElement).overflowX };
  });
  console.log(rel.padEnd(28)+' @'+String(w).padEnd(5)+' canScrollX='+String(r.canScrollX).padEnd(6)+' maxScrollX='+String(r.scrollXMax).padEnd(5)+' docScrollW='+String(r.docScrollW).padEnd(5)+' body.ox='+r.bodyOverflowX+' html.ox='+r.htmlOverflowX);
  await p.close();
}
await b.close();
