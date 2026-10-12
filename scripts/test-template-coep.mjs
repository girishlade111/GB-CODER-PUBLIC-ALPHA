import { chromium } from 'playwright';

const TARGET_URL = 'http://localhost:4175';

async function testCoepPreviewAndTemplates() {
  console.log('[AUDIT] Launching Playwright browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const failedRequests = [];
  const successfulImages = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.text().includes('COEP') || msg.text().includes('CORP') || msg.text().includes('Unsplash') || msg.type() === 'error') {
      console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });

  page.on('response', res => {
    if (res.url().includes('unsplash.com')) {
      successfulImages.push({
        url: res.url(),
        status: res.status(),
        corp: res.headers()['cross-origin-resource-policy'],
        cors: res.headers()['access-control-allow-origin']
      });
      console.log(`[IMG LOADED] ${res.status()} - ${res.url().slice(0, 70)}... (corp: ${res.headers()['cross-origin-resource-policy']})`);
    }
  });

  console.log('[AUDIT] Navigating to GB Coder...');
  await page.goto(`${TARGET_URL}/`, { waitUntil: 'networkidle' });

  // Verify crossOriginIsolated
  const isolation = await page.evaluate(() => ({
    isolated: window.crossOriginIsolated,
    sab: typeof SharedArrayBuffer !== 'undefined',
    secure: window.isSecureContext
  }));
  console.log('[AUDIT] Isolation status:', isolation);

  // Test 1: Load Photo Gallery Template
  console.log('[AUDIT] Opening template picker to select Photo Gallery...');
  const templatesBtn = page.locator('button', { hasText: 'Templates' }).first();
  if (await templatesBtn.isVisible()) {
    await templatesBtn.click();
    await page.waitForTimeout(1000);
    // Find Photo Gallery template card
    const galleryCard = page.locator('text=Photo Gallery').first();
    if (await galleryCard.isVisible()) {
      await galleryCard.click();
      console.log('[AUDIT] Clicked Photo Gallery template');
    }
  }

  // Wait for preview iframe to mount and images to request
  await page.waitForTimeout(5000);

  // Inspect preview iframe
  const iframe = page.frameLocator('iframe[title="Code Preview"]');
  const imgCount = await iframe.locator('img').count().catch(() => 0);
  console.log(`[AUDIT] Inside preview iframe, found ${imgCount} images.`);

  // Test 2: Inject non-CORP resource and verify diagnostic message in console
  console.log('[AUDIT] Injecting non-CORP resource to verify COEP diagnostic warning...');
  await page.evaluate(() => {
    const htmlModel = window.monaco?.editor?.getModels().find(m => m.getLanguageId() === 'html');
    if (htmlModel) {
      htmlModel.setValue(`
        <!DOCTYPE html>
        <html>
        <body>
          <h2>COEP Diagnostic Test</h2>
          <img src="https://picsum.photos/100/100" id="blocked-img" />
        </body>
        </html>
      `);
    }
  });

  // Wait for debounce and reload
  await page.waitForTimeout(4000);

  // Check if diagnostic log was received
  const diagnosticLogs = consoleLogs.filter(l => l.text.includes('[COEP Diagnostic]'));
  console.log(`[AUDIT] Found ${diagnosticLogs.length} [COEP Diagnostic] log entries:`);
  diagnosticLogs.forEach(d => console.log(' ->', d.text));

  await browser.close();

  const passed = isolation.isolated && isolation.sab && (successfulImages.length > 0 || imgCount >= 8);
  console.log(`\n[AUDIT RESULT] Preview & Template COEP test ${passed ? 'PASSED' : 'FAILED'}`);
  process.exit(passed ? 0 : 1);
}

testCoepPreviewAndTemplates().catch(err => {
  console.error('[AUDIT ERROR]', err);
  process.exit(1);
});
