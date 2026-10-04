import { chromium } from 'playwright';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = join(ROOT, 'src/services/templates');
const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });

const templates = [];
for (const file of walk(DIR).sort()) {
  const mod = await import(pathToFileURL(file).href);
  const t = mod.default ?? mod;
  if (t.files || !t.html) continue;
  templates.push({
    name: file.replace(DIR + '\\', '').replace(/\\/g, '/'),
    html: t.html,
    css: t.css || '',
    js: t.javascript || '',
  });
}

const browser = await chromium.launch();
let failed = 0;

for (const t of templates) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 160));
  });

  await page.setContent(
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<style>body{margin:0;padding:0;background:#fff;color:#333}</style>' +
    '<style>' + t.css + '</style></head><body>' + t.html +
    '<script>' + t.js.replace(/<\/script/gi, '<\\/script') + '</script></body></html>',
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(1400);

  // Scroll the whole page so IntersectionObserver reveals fire, like a real visit.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  const audit = await page.evaluate(() => {
    const doc = document;
    const reveal = [...doc.querySelectorAll('[data-reveal]')];
    const hidden = reveal.filter((el) => {
      const s = getComputedStyle(el);
      return parseFloat(s.opacity) < 0.05;
    });
    // Any element with non-zero size but fully transparent text = invisible content.
    let invisibleText = 0;
    for (const el of doc.querySelectorAll('h1,h2,h3,p,li,button,a')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && parseFloat(getComputedStyle(el).opacity) < 0.05) invisibleText++;
    }
    const body = doc.body;
    return {
      height: Math.max(body.scrollHeight, doc.documentElement.scrollHeight),
      revealTotal: reveal.length,
      revealHidden: hidden.length,
      invisibleText,
      h1: doc.querySelectorAll('h1').length,
      text: (body.innerText || '').trim().length,
      svgIcons: doc.querySelectorAll('svg').length,
      imgs: doc.querySelectorAll('img').length,
      emoji: (body.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length,
      overflowX: doc.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });

  const problems = [];
  if (errors.length) problems.push(...errors.slice(0, 3));
  if (audit.height < 1200) problems.push('page only ' + audit.height + 'px tall — likely not rendering');
  if (audit.revealHidden > 0) problems.push(audit.revealHidden + '/' + audit.revealTotal + ' [data-reveal] still invisible');
  if (audit.invisibleText > 0) problems.push(audit.invisibleText + ' visible-box text nodes at opacity 0');
  if (audit.text < 900) problems.push('only ' + audit.text + ' chars of text');
  if (audit.h1 !== 1) problems.push('h1 count ' + audit.h1);
  if (audit.imgs > 0) problems.push(audit.imgs + ' <img> tags (should be 0)');
  if (audit.emoji > 0) problems.push(audit.emoji + ' emoji characters found');
  if (audit.overflowX) problems.push('horizontal overflow at 1280px');

  const status = problems.length ? 'FAIL' : ' ok ';
  if (problems.length) failed++;
  console.log(
    '[' + status + '] ' + t.name.padEnd(26) +
    'h=' + String(audit.height).padStart(6) +
    ' text=' + String(audit.text).padStart(6) +
    ' svg=' + String(audit.svgIcons).padStart(3) +
    ' reveal=' + audit.revealTotal + '/' + (audit.revealTotal - audit.revealHidden) +
    (problems.length ? '\n         -> ' + problems.join('\n         -> ') : ''),
  );
  await page.close();
}

// Narrow-viewport pass to catch layout overflow.
console.log('\n--- 360px overflow check ---');
for (const t of templates) {
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await page.setContent(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>' + t.css +
    '</style></head><body>' + t.html + '<script>' + t.js.replace(/<\/script/gi, '<\\/script') + '</script></body></html>',
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(500);
  const over = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > w + 2 && getComputedStyle(el).position !== 'fixed';
    });
    return { scrollW: document.documentElement.scrollWidth, count: wide.length, first: wide[0] ? wide[0].className || wide[0].tagName : '' };
  });
  if (over.scrollW > 362) {
    failed++;
    console.log('[FAIL] ' + t.name.padEnd(26) + ' scrollWidth=' + over.scrollW + ' (' + over.count + ' wide els, first: ' + over.first + ')');
  } else {
    console.log('[ ok ] ' + t.name.padEnd(26) + ' no overflow');
  }
  await page.close();
}

await browser.close();
console.log('\n' + (failed === 0 ? 'ALL ' + templates.length + ' PLAIN TEMPLATES RENDER CLEAN' : failed + ' FAILURE(S)'));
process.exit(failed === 0 ? 0 : 1);