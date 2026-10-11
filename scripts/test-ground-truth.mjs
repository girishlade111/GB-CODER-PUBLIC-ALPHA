/**
 * Test real WebContainer server-ready URL in browser top-level tab vs iframe
 */

import { chromium } from 'playwright';

async function testWebContainer() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Navigate to http://localhost:4175/ide
  console.log('[Ground Truth] Navigating to http://localhost:4175/ide...');
  await page.goto('http://localhost:4175/ide', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Evaluate WebContainer boot and server start inside the browser context
  console.log('[Ground Truth] Booting WebContainer and starting a simple HTTP server...');
  const serverInfo = await page.evaluate(async () => {
    try {
      const { WebContainer } = await import('/node_modules/.vite/deps/@webcontainer_api.js').catch(async () => {
        // Fallback: try window import
        return await import('@webcontainer/api');
      });

      console.log('[Evaluate] Booting WebContainer instance...');
      const wc = await WebContainer.boot();
      console.log('[Evaluate] WebContainer booted.');

      // Mount a basic index.html and server.js
      await wc.mount({
        'server.js': {
          file: {
            contents: `
              const http = require('http');
              const server = http.createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<!DOCTYPE html><html><body><h1>Ground Truth: WebContainer App Running!</h1></body></html>');
              });
              server.listen(3000, () => {
                console.log('Server listening on port 3000');
              });
            `,
          },
        },
      });

      let serverReadyUrl = null;
      let serverReadyPort = null;

      const readyPromise = new Promise((resolve) => {
        wc.on('server-ready', (port, url) => {
          serverReadyPort = port;
          serverReadyUrl = url;
          resolve({ port, url });
        });
      });

      console.log('[Evaluate] Spawning node server.js...');
      await wc.spawn('node', ['server.js']);

      const ready = await Promise.race([
        readyPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for server-ready')), 15000)),
      ]);

      return { success: true, url: ready.url, port: ready.port };
    } catch (err) {
      return { success: false, error: err.message, stack: err.stack };
    }
  });

  console.log('[Ground Truth] Server Info Result:', JSON.stringify(serverInfo, null, 2));

  if (serverInfo.success && serverInfo.url) {
    const previewUrl = serverInfo.url;
    console.log(`[Ground Truth] REAL WebContainer Preview URL: ${previewUrl}`);

    // Test 1: Direct window.open / tab navigation to previewUrl
    console.log('[Ground Truth] Test 1: Navigating a fresh tab directly to previewUrl...');
    const directTab = await context.newPage();
    try {
      const res = await directTab.goto(previewUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log('[Ground Truth] Direct tab status:', res?.status());
      await directTab.waitForTimeout(2000);
      const text = await directTab.evaluate(() => document.body.innerText);
      console.log('[Ground Truth] Direct tab body text:\n', text);
      await directTab.screenshot({ path: 'real_direct_tab.png' });
    } catch (err) {
      console.error('[Ground Truth] Direct tab navigation failed:', err.message);
    } finally {
      await directTab.close();
    }

    // Test 2: Popout page /preview-popout with iframe embedding previewUrl
    console.log('[Ground Truth] Test 2: Navigating to /preview-popout with iframe...');
    const popoutTab = await context.newPage();
    try {
      const popoutUrl = `http://localhost:4175/preview-popout?url=${encodeURIComponent(previewUrl)}&port=${serverInfo.port}`;
      const res = await popoutTab.goto(popoutUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log('[Ground Truth] Popout tab status:', res?.status());
      await popoutTab.waitForTimeout(2000);
      const popoutText = await popoutTab.evaluate(() => document.body.innerText);
      console.log('[Ground Truth] Popout tab text:\n', popoutText);
      await popoutTab.screenshot({ path: 'real_popout_tab.png' });
    } catch (err) {
      console.error('[Ground Truth] Popout tab failed:', err.message);
    } finally {
      await popoutTab.close();
    }
  }

  await context.close();
  await browser.close();
}

testWebContainer().catch(console.error);
