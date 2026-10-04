import { chromium } from 'playwright';
const b = await chromium.launch();
const mod = await import('./src/services/templates/ai-agents/chatbot.ts');
const t = mod.default;
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'</body></html>', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  let el = document.querySelector('.trust-strip');
  const chain = [];
  while (el && el !== document.documentElement) {
    const bb = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push({ el: el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):''),
      w: Math.round(bb.width), left: Math.round(bb.left), display: cs.display, gtc: cs.gridTemplateColumns, minW: cs.minWidth, pad: cs.padding, maxW: cs.maxWidth });
    el = el.parentElement;
  }
  return chain;
}), null, 1));
await b.close();
