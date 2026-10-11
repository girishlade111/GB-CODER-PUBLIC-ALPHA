import { chromium } from 'playwright';

async function testProduction() {
  console.log('Testing production https://code.ladestack.in/ ...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    console.log(`[PROD ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PROD PAGE ERROR] ${err.message}`);
  });

  await page.goto('https://code.ladestack.in/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const newProjBtn = page.locator('button', { hasText: 'New Project' }).first();
  if (await newProjBtn.isVisible()) {
    await newProjBtn.click();
    await page.waitForTimeout(500);
    const createBtn = page.locator('button', { hasText: 'Create project' }).first();
    await createBtn.click();
  }

  await page.waitForSelector('.monaco-editor', { timeout: 20000 });
  await page.waitForTimeout(3000);

  const prodEnv = await page.evaluate(() => {
    return {
      crossOriginIsolated: window.crossOriginIsolated,
      monacoEnv: typeof window.MonacoEnvironment !== 'undefined' ? String(window.MonacoEnvironment) : 'undefined'
    };
  });
  console.log('Production Environment State:', prodEnv);

  await browser.close();
}

testProduction().catch(console.error);
