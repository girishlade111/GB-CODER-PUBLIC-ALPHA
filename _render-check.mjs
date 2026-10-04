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

const VIEW_W = 1280;

for (const t of templates) {
  const page = await browser.newPage({ viewport: { width: VIEW_W, height: 900 } });
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

  // Scroll the whole page so IntersectionObserver reveals fire, like a real
  // visit. Must be slow enough that the observer gets a frame per step.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.5);
    const max = document.body.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  const audit = await page.evaluate(() => {
    const doc = document;
    const inHiddenSubtree = (el) => {
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        if (a.hasAttribute && a.hasAttribute('hidden')) return true;
        if (a.classList && a.classList.contains('is-open') === false && a.hasAttribute('aria-expanded') && a.getAttribute('aria-expanded') === 'false') return true;
      }
      return false;
    };
    const reveal = [...doc.querySelectorAll('[data-reveal]')];
    const hidden = reveal.filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.05 && !inHiddenSubtree(el));
    // Text that occupies space but is fully transparent, excluding controls
    // that are intentionally hidden until you scroll (back-to-top etc).
    let invisibleText = 0;
    for (const el of doc.querySelectorAll('h1,h2,h3,p,li,button,a')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && parseFloat(getComputedStyle(el).opacity) < 0.05 && !inHiddenSubtree(el)) {
        if (el.tagName === 'BUTTON' && !el.textContent.trim()) continue;
        invisibleText++;
      }
    }
    // Real sideways scroll test.
    const before = window.scrollX;
    window.scrollTo(9999, window.scrollY);
    const canScrollX = window.scrollX > before;
    window.scrollTo(0, window.scrollY);

    const body = doc.body;
    return {
      height: Math.max(body.scrollHeight, doc.documentElement.scrollHeight),
      revealTotal: reveal.length,
      revealHidden: hidden.length,
      invisibleText,
      canScrollX,
      h1: doc.querySelectorAll('h1').length,
      text: (body.innerText || '').trim().length,
      svgIcons: doc.querySelectorAll('svg').length,
      imgs: doc.querySelectorAll('img').length,
      emoji: (body.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length,
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
  if (audit.canScrollX) problems.push('page scrolls sideways at ' + VIEW_W + 'px');

  const status = problems.length ? 'FAIL' : ' ok ';
  if (problems.length) failed++;
  console.log(
    '[' + status + '] ' + t.name.padEnd(26) +
    'h=' + String(audit.height).padStart(6) +
    ' text=' + String(audit.text).padStart(6) +
    ' svg=' + String(audit.svgIcons).padStart(3) +
    ' reveal=' + (audit.revealTotal - audit.revealHidden) + '/' + audit.revealTotal +
    (problems.length ? '\n         -> ' + problems.join('\n         -> ') : ''),
  );
  await page.close();
}

// Narrow-viewport pass: the real question is whether the user can scroll sideways.
console.log('\n--- 360px sideways-scroll check ---');
for (const t of templates) {
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await page.setContent(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0}</style><style>' + t.css +
    '</style></head><body>' + t.html + '<script>' + t.js.replace(/<\/script/gi, '<\\/script') + '</script></body></html>',
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(700);
  const over = await page.evaluate(() => {
    const before = window.scrollX;
    window.scrollTo(9999, window.scrollY);
    const max = window.scrollX;
    window.scrollTo(0, window.scrollY);
    return { max, can: max > before };
  });
  if (over.can) {
    failed++;
    console.log('[FAIL] ' + t.name.padEnd(26) + ' scrolls ' + over.max + 'px sideways');
  } else {
    console.log('[ ok ] ' + t.name.padEnd(26) + ' no sideways scroll');
  }
  await page.close();
}

await browser.close();
console.log('\n' + (failed === 0 ? 'ALL ' + templates.length + ' PLAIN TEMPLATES RENDER CLEAN' : failed + ' FAILURE(S)'));
process.exit(failed === 0 ? 0 : 1);