/**
 * End-to-end browser regression and validation test suite for GB Coder.
 *
 * Runs headless Chromium via Playwright against the live deployment
 * (default: https://code.ladestack.in/) or a specified preview URL.
 *
 * Verifies:
 * - Live HTTP headers (COOP same-origin, COEP require-corp)
 * - Browser runtime isolation (isSecureContext, crossOriginIsolated, SharedArrayBuffer)
 * - TerminalTab UI elements (WebContainer pill enabled, Local pill)
 * - Terminal mode switching
 * - Normal Mode editor loading
 *
 * Usage:
 *   node scripts/e2e-browser-test.mjs
 *   node scripts/e2e-browser-test.mjs --target-url=https://code.ladestack.in/
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const targetArg = process.argv.find((a) => a.startsWith('--target-url='));
const TARGET_URL = (targetArg ? targetArg.split('=')[1] : 'https://code.ladestack.in').replace(/\/+$/, '');

let browser;
let context;

before(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
});

after(async () => {
  if (context) await context.close();
  if (browser) await browser.close();
});

describe('Live HTTP isolation headers', () => {
  test('serves COOP: same-origin and COEP: require-corp on /ide', async () => {
    const res = await fetch(`${TARGET_URL}/ide`);
    assert.equal(res.status, 200, `Expected 200 from ${TARGET_URL}/ide`);
    assert.equal(res.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(res.headers.get('cross-origin-embedder-policy'), 'require-corp');
  });

  test('serves COOP: same-origin and COEP: require-corp on /', async () => {
    const res = await fetch(`${TARGET_URL}/`);
    assert.equal(res.status, 200, `Expected 200 from ${TARGET_URL}/`);
    assert.equal(res.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(res.headers.get('cross-origin-embedder-policy'), 'require-corp');
  });
});

describe('Real browser runtime isolation (/ide)', () => {
  test('window.isSecureContext is true', async () => {
    const page = await context.newPage();
    await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const isSecure = await page.evaluate(() => window.isSecureContext);
    await page.close();
    assert.equal(isSecure, true);
  });

  test('window.crossOriginIsolated is true', async () => {
    const page = await context.newPage();
    await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const isolated = await page.evaluate(() => window.crossOriginIsolated);
    await page.close();
    assert.equal(isolated, true);
  });

  test('typeof SharedArrayBuffer is function', async () => {
    const page = await context.newPage();
    await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const sabType = await page.evaluate(() => typeof SharedArrayBuffer);
    await page.close();
    assert.equal(sabType, 'function');
  });
});

describe('Advanced IDE Terminal Tab UI (/ide)', () => {
  test('renders WebContainer and Local switcher pills', async () => {
    const page = await context.newPage();
    await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'networkidle', timeout: 30000 });

    const wcButton = page.locator('button:has-text("WebContainer")').first();
    await wcButton.waitFor({ state: 'visible', timeout: 15000 });

    const localButton = page.locator('button:has-text("Local")').first();
    await localButton.waitFor({ state: 'visible', timeout: 15000 });

    const isDisabled = await wcButton.isDisabled();
    assert.equal(isDisabled, false, 'WebContainer button must not be disabled when crossOriginIsolated is true');

    await page.close();
  });

  test('switches between WebContainer and Local Simulated Shell', async () => {
    const page = await context.newPage();
    await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'networkidle', timeout: 30000 });

    const localButton = page.locator('button:has-text("Local")').first();
    await localButton.waitFor({ state: 'visible', timeout: 15000 });
    await localButton.click();

    const localIndicator = page.locator('text=Local Simulated Shell').first();
    await localIndicator.waitFor({ state: 'visible', timeout: 10000 });
    const text = await localIndicator.textContent();
    assert.ok(text.includes('Local Simulated Shell'));

    const wcButton = page.locator('button:has-text("WebContainer")').first();
    await wcButton.click();
    const wcIndicator = page.locator('text=WebContainer').first();
    await wcIndicator.waitFor({ state: 'visible', timeout: 10000 });

    await page.close();
  });
});

describe('Normal Mode (/ regression)', () => {
  test('loads home page successfully', async () => {
    const page = await context.newPage();
    const res = await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(res.status(), 200);
    const title = await page.title();
    assert.ok(title.length > 0, 'Page title must not be empty');
    await page.close();
  });
});
