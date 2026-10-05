import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://127.0.0.1:5199', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Get past the projects landing screen.
const newProject = page.locator('button:has-text("New Project")').first();
if (await newProject.count()) {
  await newProject.click();
  await page.waitForTimeout(2000);
  console.log('AFTER NEW PROJECT CLICK:', (await page.locator('body').innerText()).slice(0, 700));
  const buttons = await page.locator('button').evaluateAll((els) =>
    els.map((e) => (e.innerText || '').trim()).filter(Boolean).slice(0, 40),
  );
  console.log('BUTTONS:', JSON.stringify(buttons));
  await browser.close();
  process.exit(0);
}
console.log('no New Project button');
await browser.close();
