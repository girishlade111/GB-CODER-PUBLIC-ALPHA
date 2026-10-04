import { chromium } from 'playwright';
const b = await chromium.launch();
const mod = await import('./src/services/templates/portfolio/developer.ts');
const t = mod.default;
const p = await b.newPage({ viewport: { width: 360, height: 900 } });
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+t.javascript.replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
console.log(JSON.stringify(await p.evaluate(() => {
  const base = document.documentElement.scrollWidth;
  const kids = [...document.body.children];
  const results = [];
  for (const k of kids) {
    const prev = k.style.display;
    k.style.display = 'none';
    const w = document.documentElement.scrollWidth;
    k.style.display = prev;
    if (w < base) results.push({ tag: k.tagName.toLowerCase()+'#'+k.id+'.'+(typeof k.className==='string'?k.className.trim().split(/\s+/).slice(0,2).join('.'):''), without: w, saves: base - w });
  }
  return { base, culprits: results };
}), null, 1));
await b.close();
