import { chromium } from 'playwright';

async function measure() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  let requestCount = 0;
  let totalTransferBytes = 0;
  const requests = [];

  page.on('request', () => requestCount++);
  page.on('response', async (res) => {
    try {
      const buffer = await res.body();
      totalTransferBytes += buffer.length;
      requests.push({ url: res.url(), status: res.status(), size: buffer.length });
    } catch (e) {
      // ignore
    }
  });

  const start = Date.now();
  await page.goto('http://127.0.0.1:4195/app/', { waitUntil: 'networkidle' });
  const loadDuration = Date.now() - start;

  const diagnostics = await page.evaluate(() => {
    return {
      isSecureContext: window.isSecureContext,
      crossOriginIsolated: window.crossOriginIsolated,
      hasRandomUUID: typeof crypto.randomUUID === 'function',
      performanceTiming: {
        domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart,
        loadEvent: performance.timing?.loadEventEnd - performance.timing?.navigationStart
      },
      paintEntries: performance.getEntriesByType('paint').map(p => ({ name: p.name, startTime: p.startTime }))
    };
  });

  console.log('Production Preview Diagnostics:');
  console.log(JSON.stringify({
    requestCount,
    totalTransferMB: (totalTransferBytes / (1024 * 1024)).toFixed(2),
    loadDurationMs: loadDuration,
    diagnostics
  }, null, 2));

  await browser.close();
}

measure().catch(err => {
  console.error(err);
  process.exit(1);
});
