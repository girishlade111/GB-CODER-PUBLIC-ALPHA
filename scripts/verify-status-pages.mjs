import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const compiled = await build({ entryPoints: ['src/components/status/status-config.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { STATUS_CODES, getStatusConfig, safeStatusHref } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const expected = [100,101,102,103,200,201,202,204,206,300,301,302,304,307,308,400,401,403,404,405,408,409,410,413,414,415,418,422,429,451,500,501,502,503,504];
assert.deepEqual(STATUS_CODES, expected);
for (const code of [...expected, 199, 299, 399, 499, 599]) {
  const config = getStatusConfig(code);
  assert.equal(config.class, Math.floor(code / 100));
  assert.equal(config.code, code);
  for (const field of ['reason', 'title', 'message', 'hint', 'variant', 'accentTone']) assert.ok(config[field], `${code}: ${field}`);
  assert.ok(config.primaryCta.label && config.secondaryCta.href);
}
assert.equal(getStatusConfig(NaN).code, 500);
for (const href of ['javascript:alert(1)', '//example.com', '/\\example.com', '/\nexample.com', 'https://example.com']) assert.equal(safeStatusHref(href), '/');
assert.equal(safeStatusHref('/docs?from=status'), '/docs?from=status');
const { sendStatusPage } = require('../api/_lib/status-response.cjs');
const invalidResponse = { statusCode: 0, setHeader() {}, end() {} };
sendStatusPage(invalidResponse, 100);
assert.equal(invalidResponse.statusCode, 500);

const { createPreviewServer } = await import('./preview-combined.mjs');
const server = createPreviewServer({ beforeRequest: req => { if (req.url === '/test-server-failure') throw new Error('PRIVATE_INTERNAL_STACK'); } });
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const report = { configEntries: STATUS_CODES.length, http: [], gallery: [], viewports: [], checks: [] };
let browser;
try {
  for (const [path, expectedStatus] of [['/missing-status-test', 404], ['/test-server-failure', 500], ['/api/missing-status-test', 404]]) {
    const response = await fetch(base + path, { headers: { Accept: 'text/html' } });
    const html = await response.text();
    assert.equal(response.status, expectedStatus);
    assert.ok(html.includes('status-page') && html.includes(`data-status-code="${expectedStatus}"`));
    assert.match(html, /name="robots" content="noindex"/);
    assert.ok(!html.includes('PRIVATE_INTERNAL_STACK'));
    report.http.push({ path, status: response.status });
  }
  const jsonFailure = await fetch(base + '/test-server-failure', { headers: { Accept: 'application/json' } });
  assert.equal(jsonFailure.status, 500);
  assert.deepEqual(await jsonFailure.json(), { error: 'Internal Server Error' });
  for (const code of expected.filter(code => code >= 400)) {
    let actual;
    const fake = { statusCode: 0, setHeader() {}, end(html) { actual = html; } };
    sendStatusPage(fake, code);
    assert.equal(fake.statusCode, code);
    assert.ok(actual.includes(`data-status-code="${code}"`));
    assert.ok(!actual.includes('Developer details'));
  }
  assert.ok(!existsSync('dist/__status') && !existsSync('dist/_status-documents'));
  assert.ok(!readFileSync('dist/sitemap.xml', 'utf8').includes('__status'));
  for (const path of ['/__status', '/__status/200', '/__status/throw', '/_status-documents/500']) assert.equal((await fetch(base + path)).status, 404);
  report.checks.push('All 20 server error documents match HTTP status; JSON stays JSON; gallery/templates absent from production and sitemap');

  if (process.argv.includes('--browser')) {
    const dev = process.env.STATUS_DEV_URL || 'http://127.0.0.1:4330';
    for (const code of expected) {
      const response = await fetch(`${dev}/__status/${code}`);
      const html = await response.text();
      assert.equal(response.status, 200, `Gallery ${code}`);
      assert.ok(html.includes(`data-status-code="${code}"`), `${code} preview missing`);
      report.gallery.push(code);
    }
    for (const [path, code] of [['/missing-status-test', 404], ['/__status/throw', 500], ['/__status/error/429', 429]]) {
      const response = await fetch(dev + path);
      const html = await response.text();
      assert.equal(response.status, code);
      assert.ok(html.includes(`data-status-code="${code}"`));
      assert.ok(!html.includes('Development-only status boundary fixture'));
    }
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const shots = resolve('apps/marketing/.impeccable/review/status');
    mkdirSync(shots, { recursive: true });
    let captures = 0;
    for (const code of [102, 201, 302, 404, 503]) {
      for (const theme of ['light', 'dark']) {
        for (const width of [360, 768, 1280]) {
          await page.setViewportSize({ width, height: width === 360 ? 800 : 900 });
          await page.goto(`${dev}/__status/${code}?theme=${theme}`, { waitUntil: 'networkidle' });
          await page.evaluate(() => Promise.all(document.getAnimations().filter(a => a.effect.getTiming().iterations !== Infinity).map(a => a.finished)));
          await page.evaluate(() => document.fonts.ready);
          const state = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, bg: getComputedStyle(document.querySelector('.status-page')).backgroundColor, title: document.title, heading: document.querySelector('h1').textContent, animations: document.getAnimations().map(a => a.animationName) }));
          assert.equal(state.scroll, width, `${code}/${theme}/${width} overflow`);
          assert.ok(state.heading);
          assert.equal(state.bg, theme === 'dark' ? 'rgb(21, 43, 35)' : 'rgb(245, 248, 246)');
          report.viewports.push({ code, theme, ...state });
          if ((width === 1280 && theme === 'light') || (width === 360 && theme === 'dark')) {
            await page.screenshot({ path: resolve(shots, `${code}-${theme}-${width}.png`), fullPage: true }); captures++;
          }
        }
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    await page.goto(`${dev}/__status/404?theme=auto`, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    assert.equal(await page.locator('.status-page').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(21, 43, 35)');
    await page.screenshot({ path: resolve(shots, 'reduced-dark.png'), fullPage: true }); captures++;
    await page.keyboard.press('Tab');
    // Gallery toolbar precedes the screen; focus the screen skip link explicitly.
    await page.locator('.status-skip').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'status-main');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
    await page.selectOption('#gallery-code', '418');
    await page.selectOption('#gallery-theme', 'dark');
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.waitForURL('**/__status/418?theme=dark');
    assert.equal(await page.locator('.status-page').getAttribute('data-status-code'), '418');
    report.checks.push(`${captures} validated screenshots; 30 class/theme/viewport combinations; system dark, reduced motion, keyboard focus and code/theme switcher`);

    await page.clock.install();
    await page.goto(`${dev}/__status/302?timer=on`);
    await page.getByRole('button', { name: 'Cancel redirect' }).click();
    await page.clock.runFor(9000);
    assert.ok(page.url().includes('/302'));
    await page.getByText('Go now', { exact: true }).click();
    await page.waitForURL('**/__status/200');
    await page.goto(`${dev}/__status/302?timer=on`);
    await page.clock.runFor(9000);
    await page.waitForURL('**/__status/200');
    await page.goto(`${dev}/__status/429`);
    const retry = page.locator('[data-status-action="retry"]');
    assert.equal(await retry.getAttribute('aria-disabled'), 'true');
    await page.clock.runFor(6000);
    assert.equal(await retry.getAttribute('aria-disabled'), 'false');
    await page.goto(`${dev}/__status/503?timer=on`);
    await page.getByRole('button', { name: 'Cancel auto-retry' }).click();
    await page.clock.runFor(11000);
    assert.match(await page.locator('[data-status-countdown]').textContent(), /cancelled/);
    await page.goto(`${dev}/__status/503?timer=on`);
    await page.clock.runFor(11000);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('gbcoder:status-retry:/__status/503')), '1');
    await page.clock.runFor(21000);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('gbcoder:status-retry:/__status/503')), '2');
    await page.clock.runFor(41000);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('gbcoder:status-retry:/__status/503')), '3');
    assert.match(await page.locator('[data-status-countdown]').textContent(), /paused/);
    report.checks.push('Redirect cancellation/manual/automatic navigation; Retry-After gate; auto-retry cancellation, exponential backoff and three-attempt cap');
    assert.deepEqual(errors, []);
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    assert.equal((await noJS.goto(base + '/missing-no-js')).status(), 404);
    await noJS.getByText('Go back', { exact: true }).click();
    await noJS.waitForURL(base + '/');
    await noJS.close();
    report.checks.push('No browser script errors; no-JavaScript home recovery works');
  }
  console.log(JSON.stringify(report, null, 2));
} finally {
  mkdirSync('apps/marketing/.impeccable/review/status', { recursive: true });
  writeFileSync('apps/marketing/.impeccable/review/status/verification.json', JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(done => server.close(done));
}
