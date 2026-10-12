import { chromium } from 'playwright';
import { join } from 'node:path';

const TARGET_URL = 'http://localhost:4175';
const ARTIFACTS_DIR = 'C:/Users/Girish Lade/.gemini/antigravity-ide/brain/c4bc647e-779e-4344-8097-d2d709c8f2fb';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  // 1. Capture Normal Mode
  const contextNormal = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageNormal = await contextNormal.newPage();
  await pageNormal.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
  await pageNormal.waitForTimeout(500);

  const newProjBtn = pageNormal.locator('button', { hasText: 'New Project' }).first();
  if (await newProjBtn.isVisible()) {
    await newProjBtn.click();
    await pageNormal.waitForTimeout(300);
    const createBtn = pageNormal.locator('button', { hasText: 'Create project' }).first();
    await createBtn.click();
  }

  await pageNormal.waitForSelector('.monaco-editor', { timeout: 15000 });
  await pageNormal.waitForTimeout(2000);

  const normalShot = join(ARTIFACTS_DIR, 'monaco_normal_mode_workers.png');
  await pageNormal.screenshot({ path: normalShot });
  console.log('Saved Normal Mode screenshot:', normalShot);
  await contextNormal.close();

  // 2. Capture Advanced VSCode Mode
  const contextIde = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageIde = await contextIde.newPage();
  await pageIde.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded' });
  await pageIde.waitForTimeout(2000);

  const ideShot = join(ARTIFACTS_DIR, 'monaco_vscode_mode_workers.png');
  await pageIde.screenshot({ path: ideShot });
  console.log('Saved VS Code Mode screenshot:', ideShot);
  await contextIde.close();

  await browser.close();
}

capture().catch(console.error);
