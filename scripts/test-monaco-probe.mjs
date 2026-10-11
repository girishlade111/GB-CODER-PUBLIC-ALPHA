import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const page = await browser.newPage();

  const networkRequests = [];
  page.on('request', req => {
    networkRequests.push({ url: req.url(), resourceType: req.resourceType() });
    if (req.url().includes('monaco') || req.url().includes('worker') || req.url().includes('jsdelivr')) {
      console.log(`[NET REQ] ${req.resourceType()} ${req.url()}`);
    }
  });

  page.on('response', res => {
    if (res.url().includes('monaco') || res.url().includes('worker') || res.url().includes('jsdelivr')) {
      console.log(`[NET RES ${res.status()}] ${res.url()}`);
    }
  });

  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  await page.goto('http://localhost:4175/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const newProjBtn = page.locator('button', { hasText: 'New Project' }).first();
  await newProjBtn.click();
  await page.waitForTimeout(500);

  const createSubmitBtn = page.locator('button', { hasText: 'Create project' }).first();
  await createSubmitBtn.click();

  await page.waitForSelector('.monaco-editor', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('\nTotal network requests recorded:', networkRequests.length);
  const monacoReqs = networkRequests.filter(r => r.url.includes('monaco') || r.url.includes('jsdelivr'));
  console.log('Monaco / jsdelivr requests:\n', JSON.stringify(monacoReqs, null, 2));

  await browser.close();
}

run().catch(console.error);
