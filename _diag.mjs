import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src/services/templates');

const load = async (rel) => {
  const mod = await import(pathToFileURL(join(DIR, rel)).href);
  return mod.default ?? mod;
};

const browser = await chromium.launch();

const diagnose = async (rel, viewport) => {
  const t = await load(rel);
  const page = await browser.newPage({ viewport });
  await page.setContent(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>' + (t.css || '') +
    '</style></head><body>' + t.html + '<script>' + (t.javascript || '').replace(/<\/script/gi, '<\\/script') + '</script></body></html>',
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const out = await page.evaluate(() => {
    const desc = (el) => el.tagName.toLowerCase() +
      (el.id ? '#' + el.id : '') +
      (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') +
      ' | text="' + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 55) + '"';

    const w = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > w + 2 && getComputedStyle(el).position !== 'fixed';
      })
      .slice(0, 6)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return desc(el) + ' [w=' + Math.round(r.width) + ' right=' + Math.round(r.right) + ' pos=' + getComputedStyle(el).position + ' parentOverflowX=' + getComputedStyle(el.parentElement || document.body).overflowX + ']';
      });

    const invisibleReveal = [...document.querySelectorAll('[data-reveal]')]
      .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.05)
      .slice(0, 4).map(desc);

    const invisibleText = [...document.querySelectorAll('h1,h2,h3,p,li,button,a')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && parseFloat(getComputedStyle(el).opacity) < 0.05;
      })
      .slice(0, 4).map(desc);

    return { scrollW: document.documentElement.scrollWidth, clientW: w, wide, invisibleReveal, invisibleText };
  });
  await page.close();
  return out;
};

const targets = [
  ['ai-agents/chatbot.ts', { width: 1280, height: 900 }],
  ['business/agency.ts', { width: 1280, height: 900 }],
  ['ecommerce/store.ts', { width: 1280, height: 900 }],
  ['plain/blog.ts', { width: 1280, height: 900 }],
  ['startup/landing.ts', { width: 1280, height: 900 }],
  ['portfolio/developer.ts', { width: 360, height: 780 }],
];

for (const [rel, vp] of targets) {
  const r = await diagnose(rel, vp);
  console.log('\n=== ' + rel + ' @ ' + vp.width + 'px ===');
  console.log('scrollWidth=' + r.scrollW + ' clientWidth=' + r.clientW);
  if (r.wide.length) { console.log(' WIDE:'); r.wide.forEach((x) => console.log('   - ' + x)); }
  if (r.invisibleReveal.length) { console.log(' INVISIBLE [data-reveal]:'); r.invisibleReveal.forEach((x) => console.log('   - ' + x)); }
  if (r.invisibleText.length) { console.log(' INVISIBLE TEXT:'); r.invisibleText.forEach((x) => console.log('   - ' + x)); }
}

await browser.close();