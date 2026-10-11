import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[PAGE_ERROR] ${err.message}`));

  console.log('Navigating to http://localhost:4175/preview-popout?url=https%3A%2F%2Fmock-preview.local-credentialless.webcontainer-api.io&port=5173...');
  const res = await page.goto('http://localhost:4175/preview-popout?url=https%3A%2F%2Fmock-preview.local-credentialless.webcontainer-api.io&port=5173', {
    waitUntil: 'networkidle',
    timeout: 15000,
  });

  console.log('Response status:', res.status());
  console.log('Final URL:', page.url());
  
  // Check what is rendered
  const title = await page.title();
  console.log('Page Title:', title);

  const iframeCount = await page.locator('iframe').count();
  console.log('Iframe count:', iframeCount);
  if (iframeCount > 0) {
    const src = await page.locator('iframe').first().getAttribute('src');
    console.log('Iframe src:', src);
  }

  const waitingHeading = await page.locator('h2:has-text("Waiting for Live Preview")').count();
  console.log('Waiting heading count:', waitingHeading);

  const dashboardCount = await page.locator('text=Project Dashboard').count();
  console.log('Dashboard text count:', dashboardCount);

  console.log('Logs:');
  console.log(logs.slice(-10).join('\n'));

  await browser.close();
}

run().catch(console.error);
