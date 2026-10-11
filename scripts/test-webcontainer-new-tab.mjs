/**
 * GB Coder — Task 06: Test WebContainer New Tab Behavior
 *
 * Boots WebContainer on http://localhost:4174/ide, captures the server-ready URL,
 * and tests opening it both directly and via /preview-popout in a new tab.
 */

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log('[Test] Navigating to http://localhost:4175/ide...');
  await page.goto('http://localhost:4175/ide', { waitUntil: 'domcontentloaded' });

  // Monitor console for [WebContainer] messages
  let serverReadyUrl = null;
  let serverReadyPort = null;

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[WebContainer] Server ready at port') || text.includes('Server ready at port')) {
      console.log('[IDE Console]', text);
      const match = text.match(/port\s+(\d+):\s+(https?:\/\/[^\s]+)/i);
      if (match) {
        serverReadyPort = match[1];
        serverReadyUrl = match[2];
      }
    }
  });

  // Check if WebContainer starts automatically or if we need to click npm run dev
  console.log('[Test] Waiting for dev server or terminal...');
  await page.waitForTimeout(5000);

  // Look for npm run dev button or terminal
  const runDevBtn = page.locator('button:has-text("npm run dev")');
  if (await runDevBtn.count() > 0) {
    console.log('[Test] Clicking "npm run dev" button...');
    await runDevBtn.click();
  }

  // Wait up to 30s for server ready
  console.log('[Test] Waiting for server-ready event...');
  const maxWait = Date.now() + 30000;
  while (!serverReadyUrl && Date.now() < maxWait) {
    await page.waitForTimeout(1000);
    // Also check page state
    const urlFromPage = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[data-testid="preview-iframe"]');
      return iframe?.src || null;
    });
    if (urlFromPage && urlFromPage.startsWith('http')) {
      serverReadyUrl = urlFromPage;
      console.log('[Test] Captured iframe src from page:', serverReadyUrl);
      break;
    }
  }

  console.log(`[Test] Final Captured Server URL: ${serverReadyUrl}`);

  if (serverReadyUrl) {
    // TEST 1: Open serverReadyUrl directly in a new tab
    console.log('[Test] Opening serverReadyUrl directly in new tab...');
    const directTab = await context.newPage();
    try {
      const directRes = await directTab.goto(serverReadyUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log('[Test] Direct tab response status:', directRes?.status());
      await directTab.waitForTimeout(2000);
      const directText = await directTab.evaluate(() => document.body.innerText);
      console.log('[Test] Direct tab body text:', directText.slice(0, 200));
      await directTab.screenshot({ path: 'direct_tab_screenshot.png' });
    } catch (err) {
      console.error('[Test] Direct tab failed:', err.message);
    } finally {
      await directTab.close();
    }

    // TEST 2: Open /preview-popout in a new tab
    console.log('[Test] Opening /preview-popout in new tab...');
    const popoutTab = await context.newPage();
    try {
      const popoutUrl = `http://localhost:4175/preview-popout?url=${encodeURIComponent(serverReadyUrl)}&port=${serverReadyPort || 5173}`;
      const popoutRes = await popoutTab.goto(popoutUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log('[Test] Popout tab response status:', popoutRes?.status());
      await popoutTab.waitForTimeout(2000);
      const popoutText = await popoutTab.evaluate(() => document.body.innerText);
      console.log('[Test] Popout tab body text:', popoutText.slice(0, 200));
      await popoutTab.screenshot({ path: 'popout_tab_screenshot.png' });
    } catch (err) {
      console.error('[Test] Popout tab failed:', err.message);
    } finally {
      await popoutTab.close();
    }
  }

  await context.close();
  await browser.close();
}

main().catch(console.error);
