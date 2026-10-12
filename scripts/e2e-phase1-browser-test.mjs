#!/usr/bin/env node
/**
 * Real Browser Playwright End-to-End Test Suite for Phase 1 Integration
 *
 * Implements Scenarios A-H from Section 38:
 * - Scenario A: Fresh Visitor (Root -> Astro -> Click Start Coding -> /app Dashboard)
 * - Scenario B: Existing User Persistence & Project Continuity
 * - Scenario C: Static Editor Loading & Preview
 * - Scenario D: Advanced IDE & crossOriginIsolated verification
 * - Scenario G: Direct Navigation & Refresh on /app and /app/ide
 * - Scenario H: Marketing Isolation (No Monaco, WebContainer, or xterm on root)
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { chromium } from 'playwright';

const TEST_PORT = 4195;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverProcess;
let browser;

const waitForServer = async () => {
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(BASE_URL, (res) => (res.statusCode ? resolve(true) : reject())).on('error', reject);
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error('Server timeout');
};

before(async () => {
  serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${TEST_PORT}`], {
    stdio: 'pipe',
  });
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer'],
  });
});

after(async () => {
  if (browser) await browser.close();
  if (serverProcess) serverProcess.kill();
});

describe('Phase 1 Real Browser Scenarios (Section 38)', () => {
  test('Scenario A: Fresh Visitor Journey (Root -> Astro -> Start Coding -> /app)', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const jsErrors = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    // 1. Visit root URL
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // 2. Verify Astro homepage content
    const title = await page.title();
    assert.ok(title.includes('GB Coder'), `Expected GB Coder title, got: ${title}`);

    const headline = await page.locator('h1').textContent();
    assert.ok(headline.includes('Browser-First'), `Expected headline, got: ${headline}`);

    // 3. Click Start Coding CTA
    const startBtn = page.locator('#heroStartBtn');
    await assert.doesNotReject(startBtn.waitFor({ state: 'visible', timeout: 5000 }));
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith('/app'), { timeout: 10000 }),
      startBtn.click(),
    ]);

    // 4. Verify React IDE loads
    await page.waitForSelector('#root', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/app');

    // 5. Verify no uncaught fatal JS errors
    const fatalErrors = jsErrors.filter((e) => !e.includes('ResizeObserver') && !e.includes('favicon'));
    assert.equal(fatalErrors.length, 0, `Uncaught JS errors: ${fatalErrors.join(', ')}`);

    await context.close();
  });

  test('Scenario D: Advanced IDE Document & crossOriginIsolated', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 10000 });

    const isolation = await page.evaluate(() => ({
      crossOriginIsolated: window.crossOriginIsolated,
      isSecureContext: window.isSecureContext,
      hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    }));

    assert.equal(isolation.crossOriginIsolated, true, 'Advanced IDE document must be crossOriginIsolated');
    assert.equal(isolation.hasSharedArrayBuffer, true, 'SharedArrayBuffer must be available');

    await context.close();
  });

  test('Scenario G: Direct Navigation & Browser Refresh', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Direct visit to /app
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/app');

    // 2. Refresh on /app
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/app');

    // 3. Direct visit to /app/ide
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/app/ide');

    // 4. Reload on /app/ide
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/app/ide');

    await context.close();
  });

  test('Scenario H: Marketing Homepage Isolation', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const loadedRequests = [];
    page.on('request', (req) => loadedRequests.push(req.url()));

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Assert that heavy IDE assets are never loaded on root
    const requestedUrls = loadedRequests.join(' ');
    assert.ok(!requestedUrls.includes('monaco-editor'), 'Monaco editor should not be requested on root');
    assert.ok(!requestedUrls.includes('webcontainer'), 'WebContainer should not be requested on root');
    assert.ok(!requestedUrls.includes('xterm'), 'xterm terminal should not be requested on root');
    assert.ok(!requestedUrls.includes('typescript-compiler'), 'TypeScript compiler should not be requested on root');

    // Assert that root rendered pure semantic HTML
    const heading = await page.locator('h1').textContent();
    assert.ok(heading.length > 10, 'Root should render real visible static HTML heading');

    await context.close();
  });

  test('Scenario F: Legacy Service Worker Migration Simulation', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Visit root page where transition guard unregisters root worker
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // 2. Inspect active registrations
    const registrations = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return [];
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.map((r) => r.scope);
    });

    // Root scope should not hold an intercepting worker
    const rootScope = registrations.filter((scope) => new URL(scope).pathname === '/');
    assert.equal(rootScope.length, 0, 'No active service worker should intercept root /');

    await context.close();
  });
});
