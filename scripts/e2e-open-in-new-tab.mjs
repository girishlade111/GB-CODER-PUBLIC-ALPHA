import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = 'C:/Users/Girish Lade/.gemini/antigravity-ide/brain/c4bc647e-779e-4344-8097-d2d709c8f2fb';
const BASE_URL = process.env.TARGET_URL || 'http://localhost:4175';

async function run() {
  console.log(`Starting E2E Open in New Tab Browser Test against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  const consoleLogs = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  // 1. Test /preview-popout with WebContainer dev server URL param
  const mockDevServerUrl = 'https://mock-dev-server.local-credentialless.webcontainer-api.io';
  const targetPopoutUrl = `${BASE_URL}/preview-popout?url=${encodeURIComponent(mockDevServerUrl)}&port=5173`;

  console.log(`Navigating to ${targetPopoutUrl}...`);
  const response = await page.goto(targetPopoutUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  assert.equal(response.status(), 200, 'Popout route must return HTTP 200');

  // Verify UI elements
  await page.waitForSelector('header', { timeout: 10000 });
  const brandText = await page.textContent('header');
  assert.ok(brandText.includes('GB Coder Live'), 'Header must contain "GB Coder Live" branding');
  assert.ok(brandText.includes('Port 5173'), 'Header must contain "Port 5173" badge');

  // Verify address bar
  const addressBar = await page.locator('header .truncate.font-mono').textContent();
  assert.equal(addressBar.trim(), mockDevServerUrl, 'Address bar must display active preview URL');

  // Verify iframe mounted synchronously with correct src and sandbox
  const iframe = page.locator('iframe[data-testid="popout-preview-iframe"]');
  await iframe.waitFor({ state: 'attached', timeout: 5000 });
  const src = await iframe.getAttribute('src');
  assert.equal(src, mockDevServerUrl, 'Iframe src must match encoded URL');

  const sandbox = await iframe.getAttribute('sandbox');
  assert.ok(sandbox.includes('allow-scripts'), 'Sandbox must permit scripts');
  assert.ok(sandbox.includes('allow-same-origin'), 'Sandbox must permit same-origin');
  assert.ok(sandbox.includes('allow-forms'), 'Sandbox must permit forms');
  assert.ok(sandbox.includes('allow-downloads'), 'Sandbox must permit downloads');

  // Take Dev Server Screenshot
  const devServerScreenshotPath = path.join(ARTIFACT_DIR, 'preview_popout_dev_server.png');
  await page.screenshot({ path: devServerScreenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${devServerScreenshotPath}`);

  // 2. Test Device Width Switcher
  console.log('Testing device width presets...');
  const mobileBtn = page.locator('button[title="Mobile (375px)"]');
  await mobileBtn.click();
  await page.waitForTimeout(300);

  const mobileContainer = page.locator('main > div');
  const styleAttr = await mobileContainer.getAttribute('style');
  assert.ok(styleAttr.includes('375px'), 'Container width must transition to 375px');

  const responsiveScreenshotPath = path.join(ARTIFACT_DIR, 'preview_popout_responsive.png');
  await page.screenshot({ path: responsiveScreenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${responsiveScreenshotPath}`);

  // Reset to 100%
  const fullWidthBtn = page.locator('button[title="Responsive 100%"]');
  await fullWidthBtn.click();

  // 3. Test Reload button
  console.log('Testing manual reload button...');
  const reloadBtn = page.locator('button[data-testid="popout-reload-btn"]');
  await reloadBtn.click();
  await page.waitForTimeout(500);

  // 4. Test Standalone HTML broadcast preview
  console.log('Testing Standalone Code Broadcast to Popout...');
  await page.evaluate(() => {
    const channel = new BroadcastChannel('gbcoder_live_preview_channel');
    channel.postMessage({
      type: 'standalone_code',
      html: '<div style="font-family:sans-serif;padding:30px;background:#f0fdf4;color:#166534;border-radius:12px;text-align:center;"><h2>🎉 Live Popout Standalone Preview!</h2><p>Real-time HMR and zero-cost live synchronization working seamlessly.</p></div>',
      css: 'body { margin: 0; background: #ffffff; }',
      javascript: 'console.log("Popout Standalone Code Mounted Successfully!");',
      timestamp: Date.now(),
    });
  });

  await page.waitForTimeout(600);
  const srcDocIframe = page.locator('iframe[data-testid="popout-srcdoc-iframe"]');
  await srcDocIframe.waitFor({ state: 'attached', timeout: 5000 });

  const standaloneScreenshotPath = path.join(ARTIFACT_DIR, 'preview_popout_standalone.png');
  await page.screenshot({ path: standaloneScreenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${standaloneScreenshotPath}`);

  // 5. Test Live Disconnect Notification
  console.log('Testing dev server offline broadcast...');
  await page.evaluate(() => {
    const channel = new BroadcastChannel('gbcoder_live_preview_channel');
    channel.postMessage({
      type: 'dev_server_offline',
      timestamp: Date.now(),
    });
  });

  await page.waitForTimeout(400);
  const disconnectedBadge = page.locator('text=IDE Disconnected');
  await disconnectedBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('IDE Disconnected badge successfully verified');

  await browser.close();
  console.log('All E2E Open in New Tab browser checks passed successfully!');
}

run().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
