import { chromium } from 'playwright';
const mod = await import('./src/services/templates/business/agency.ts');
const t = mod.default;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on('pageerror', e => console.log('PAGEERROR:', e.message));
await p.setContent('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>'+t.css+'</style></head><body>'+t.html+'<script>'+t.javascript.replace(/<\/script/gi,'<\\/script')+'</script></body></html>', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
console.log('initial:', JSON.stringify(await p.evaluate(() => {
  const f = document.querySelector('.filters');
  const pr = document.querySelector('.proj');
  const w = document.querySelector('.work');
  return { filtersHasVisible: f.classList.contains('is-visible'), filtersOpacity: getComputedStyle(f).opacity,
           projHasVisible: pr.classList.contains('is-visible'), projOpacity: getComputedStyle(pr).opacity,
           workTop: Math.round(w.getBoundingClientRect().top + window.scrollY),
           reduceMotionMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
           scrollY: window.scrollY };
})));
await p.evaluate(() => { const w = document.querySelector('.work'); window.scrollTo(0, w.getBoundingClientRect().top + window.scrollY - 100); });
await p.waitForTimeout(1500);
console.log('after scroll to work:', JSON.stringify(await p.evaluate(() => {
  const f = document.querySelector('.filters');
  const pr = document.querySelector('.proj');
  return { filtersHasVisible: f.classList.contains('is-visible'), filtersOpacity: getComputedStyle(f).opacity,
           projHasVisible: pr.classList.contains('is-visible'), projOpacity: getComputedStyle(pr).opacity,
           scrollY: Math.round(window.scrollY) };
})));
await b.close();
