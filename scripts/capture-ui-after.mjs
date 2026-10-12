import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4175';
const OUT_DIR = process.env.OUT_DIR || 'reports/screenshots/after';

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log(`[LADESTACK UI AUDIT] Launching browser to capture redesigned UI inventory to ${OUT_DIR}...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('gbcoder_onboarded', 'true');
    } catch (e) {}
  });
  const page = await context.newPage();

  // 1. Normal Mode (LadeStack Dark Canvas)
  console.log('1. Capturing Normal Mode...');
  await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const newProj = page.locator('button:has-text("New Project")').first();
  if (await newProj.isVisible().catch(() => false)) {
    await newProj.click().catch(() => {});
    await page.waitForTimeout(500);
    const createBtn = page.locator('button:has-text("Create project"), button:has-text("Create")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click().catch(() => {});
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT_DIR, '01_normal_mode.png'), fullPage: false });

  // 2. Advanced IDE Mode (LadeStack IDE)
  console.log('2. Capturing Advanced IDE...');
  await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT_DIR, '02_advanced_ide.png'), fullPage: false });

  // 3. File Explorer (LadeStack Activity Bar + Tree View)
  console.log('3. Capturing File Explorer...');
  await page.screenshot({
    path: join(OUT_DIR, '03_file_explorer.png'),
    clip: { x: 0, y: 40, width: 300, height: 830 },
  });

  // 4. Code Editor (Monaco Editor in LadeStack Dark Theme)
  console.log('4. Capturing Code Editor...');
  const editorEl = page.locator('.monaco-editor').first();
  if (await editorEl.isVisible().catch(() => false)) {
    await editorEl.screenshot({ path: join(OUT_DIR, '04_code_editor.png') });
  } else {
    await page.screenshot({
      path: join(OUT_DIR, '04_code_editor.png'),
      clip: { x: 300, y: 80, width: 680, height: 460 },
    });
  }

  // 5. Terminal Container
  console.log('5. Capturing Terminal Panel...');
  await page.screenshot({
    path: join(OUT_DIR, '05_terminal_panel.png'),
    clip: { x: 300, y: 560, width: 680, height: 310 },
  });

  // 6. Terminal WebContainer Mode
  console.log('6. Capturing WebContainer Mode Terminal...');
  const wcPill = page.locator('button:has-text("WebContainer")').first();
  if (await wcPill.isVisible().catch(() => false)) {
    await wcPill.click().catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.screenshot({
    path: join(OUT_DIR, '06_terminal_webcontainer.png'),
    clip: { x: 300, y: 560, width: 680, height: 310 },
  });

  // 7. Terminal Local Mode
  console.log('7. Capturing Local Terminal Mode...');
  const localPill = page.locator('button:has-text("Local")').first();
  if (await localPill.isVisible().catch(() => false)) {
    await localPill.click().catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.screenshot({
    path: join(OUT_DIR, '07_terminal_local.png'),
    clip: { x: 300, y: 560, width: 680, height: 310 },
  });

  // 8. Live Preview Panel (Browser Chrome + Responsive Controls)
  console.log('8. Capturing Live Preview...');
  await page.screenshot({
    path: join(OUT_DIR, '08_live_preview.png'),
    clip: { x: 980, y: 40, width: 460, height: 830 },
  });

  // 9. Loading State (StackBlitz Startup Loader with Multi-Stage Verification)
  console.log('9. Capturing Loading State...');
  const loaderEl = page.locator('[data-testid="stackblitz-startup-loader"]').first();
  if (await loaderEl.isVisible().catch(() => false)) {
    await loaderEl.screenshot({ path: join(OUT_DIR, '09_loading_state.png') });
  } else {
    // Screenshot loader area or popout
    await page.screenshot({
      path: join(OUT_DIR, '09_loading_state.png'),
      clip: { x: 980, y: 80, width: 460, height: 600 },
    });
  }

  // 10. Error State (Enhanced Console / Problems Panel)
  console.log('10. Capturing Error / Problems Panel State...');
  const problemsTab = page.locator('button:has-text("PROBLEMS")').first();
  if (await problemsTab.isVisible().catch(() => false)) {
    await problemsTab.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: join(OUT_DIR, '10_error_state.png'),
    clip: { x: 300, y: 560, width: 680, height: 310 },
  });

  // 11. Light Theme
  console.log('11. Capturing Light Theme...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('theme-light');
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT_DIR, '11_light_theme.png'), fullPage: false });

  // 12. Dark Theme (Reset to LadeStack Dark)
  console.log('12. Capturing Dark Theme...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.remove('theme-light');
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT_DIR, '12_dark_theme.png'), fullPage: false });

  // 13. Narrow Viewport (768px Tablet)
  console.log('13. Capturing Narrow Viewport (768px)...');
  await page.setViewportSize({ width: 768, height: 850 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT_DIR, '13_narrow_viewport.png'), fullPage: false });

  // 14. Full-Screen Editor Mode
  console.log('14. Capturing Full-Screen Editor Mode...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  // Minimize preview panel to maximize editor
  const minPreviewBtn = page.locator('button[title*="Minimize Preview"]').first();
  if (await minPreviewBtn.isVisible().catch(() => false)) {
    await minPreviewBtn.click().catch(() => {});
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: join(OUT_DIR, '14_fullscreen_editor.png'), fullPage: false });

  await browser.close();
  console.log(`[LADESTACK UI AUDIT] Successfully captured all 14 states to ${OUT_DIR}!`);
}

capture().catch((err) => {
  console.error('[SCREENSHOT ERROR]', err);
  process.exit(1);
});
