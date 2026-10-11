import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  page.on('requestfailed', req => {
    console.log(`[REQ FAILED] ${req.url()} - ${req.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:4175/ ...');
  await page.goto('http://localhost:4175/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Look for any button to start/open editor
  const buttons = await page.locator('button').allTextContents();
  console.log('Available buttons on page:', buttons);

  const newProj = page.locator('button', { hasText: 'New Project' }).first();
  if (await newProj.isVisible()) {
    console.log('Clicking New Project...');
    await newProj.click();
    await page.waitForTimeout(3000);
  }

  const editorCount = await page.locator('.monaco-editor').count();
  console.log(`Monaco editor elements found: ${editorCount}`);

  const info = await page.evaluate(() => {
    return {
      hasWindowMonaco: typeof window.monaco !== 'undefined',
      hasMonacoEnv: typeof window.MonacoEnvironment !== 'undefined',
      monacoEnv: typeof window.MonacoEnvironment !== 'undefined' ? String(window.MonacoEnvironment) : null,
      webWorkers: window.Worker ? 'Worker constructor exists' : 'No Worker'
    };
  });
  console.log('Page window state:', info);

  await browser.close();
}

run().catch(console.error);
