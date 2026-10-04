import { chromium } from 'playwright';
const b = await chromium.launch();
const mod = await import('./src/services/templates/ai-agents/chatbot.ts');
const t = mod.default;
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+(t.javascript||'').replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
console.log(JSON.stringify(await p.evaluate(() => {
  const base = document.documentElement.scrollWidth;
  const out = [];
  const walk = (parent, depth) => {
    for (const k of parent.children) {
      const prev = k.style.display;
      k.style.display = 'none';
      const w = document.documentElement.scrollWidth;
      k.style.display = prev;
      if (w < base) {
        const id = k.tagName.toLowerCase()+(k.id?'#'+k.id:'')+(typeof k.className==='string'&&k.className?'.'+k.className.trim().split(/\s+/).slice(0,2).join('.'):'');
        if (depth < 3) walk(k, depth+1); else out.push({ el: id, withoutIt: w });
      }
    }
  };
  walk(document.body, 0);
  return { base, deepest: out.slice(0,8) };
}), null, 1));
await b.close();
