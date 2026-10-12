import { chromium } from 'playwright';

const TARGET_URL = 'http://localhost:4175';

async function testPreviewResources() {
  console.log('[PREVIEW TEST] Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failedRequests = [];
  const successfulRequests = [];

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
    console.log(`[REQ FAILED] ${req.url()} (${req.failure()?.errorText})`);
  });

  page.on('response', res => {
    if (res.url().includes('picsum') || res.url().includes('cdnjs') || res.url().includes('jsdelivr')) {
      console.log(`[EXTERNAL RES ${res.status()}] ${res.url()}`);
      successfulRequests.push({ url: res.url(), status: res.status() });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('CORP') || msg.text().includes('COEP')) {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
  const newProjBtn = page.locator('button', { hasText: 'New Project' }).first();
  if (await newProjBtn.isVisible()) {
    await newProjBtn.click();
    await page.locator('button', { hasText: 'Create project' }).first().click();
  }

  await page.waitForSelector('.monaco-editor', { timeout: 15000 });
  console.log('[PREVIEW TEST] Editor mounted. Injecting external resources into HTML panel...');

  // Set HTML model to include various CDN resources, stylesheets, and images
  await page.evaluate(() => {
    const htmlModel = window.monaco.editor.getModels().find(m => m.getLanguageId() === 'html');
    if (htmlModel) {
      htmlModel.setValue(`
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        </head>
        <body>
          <h1 class="text-primary"><i class="fas fa-check"></i> CDN Test</h1>
          <img src="https://picsum.photos/200/200" alt="Random Photo" id="test-img" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
          <script>
            console.log('Lodash loaded inside preview:', typeof _ !== 'undefined' ? _.VERSION : 'missing');
          </script>
        </body>
        </html>
      `);
    }
  });

  // Wait 4 seconds for preview iframe update and external fetches
  await page.waitForTimeout(4000);

  // Check inside preview iframe
  const frame = page.frameLocator('iframe[title="Code Preview"]');
  const h1Text = await frame.locator('h1').textContent().catch(() => 'frame query error');
  console.log('[PREVIEW TEST] Inside frame h1 text:', h1Text);

  console.log('\n--- RESULTS ---');
  console.log('Successful external requests:', successfulRequests.length);
  successfulRequests.forEach(r => console.log(' ->', r.url, r.status));
  console.log('Failed external requests:', failedRequests.filter(r => !r.url.includes('_vercel')).length);
  failedRequests.filter(r => !r.url.includes('_vercel')).forEach(r => console.log(' -> FAILED:', r.url, r.error));

  await browser.close();
}

testPreviewResources().catch(console.error);
