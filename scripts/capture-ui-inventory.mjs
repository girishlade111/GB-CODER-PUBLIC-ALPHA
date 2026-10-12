import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4175';
const OUT_DIR = process.env.OUT_DIR || 'reports/screenshots/before';

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log(`[SCREENSHOT AUDIT] Launching browser to capture UI inventory to ${OUT_DIR}...`);
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

  // 1. Normal Mode
  console.log('Capturing Normal Mode...');
  await page.goto(`${TARGET_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Close tour if visible
  const closeTour = page.locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("Get Started")').first();
  if (await closeTour.isVisible().catch(() => false)) {
    await closeTour.click().catch(() => {});
  }

  // Open a project in Normal mode if new project dialog is open
  const newProjBtn = page.locator('button:has-text("New Project")').first();
  if (await newProjBtn.isVisible().catch(() => false)) {
    await newProjBtn.click().catch(() => {});
    await page.waitForTimeout(300);
    const createBtn = page.locator('button:has-text("Create project")').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click().catch(() => {});
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT_DIR, '01_normal_mode.png'), fullPage: false });

  // 2. Advanced IDE
  console.log('Capturing Advanced IDE...');
  await page.goto(`${TARGET_URL}/ide`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT_DIR, '02_advanced_ide.png'), fullPage: false });

  // 3. File Explorer
  console.log('Capturing File Explorer...');
  const explorerPanel = page.locator('[data-testid="file-explorer"], .file-tree, aside, [aria-label="Explorer"]').first();
  if (await explorerPanel.isVisible().catch(() => false)) {
    await explorerPanel.screenshot({ path: join(OUT_DIR, '03_file_explorer.png') });
  } else {
    // Crop left pane
    await page.screenshot({ path: join(OUT_DIR, '03_file_explorer.png'), clip: { x: 0, y: 40, width: 280, height: 800 } });
  }

  // 4. Code Editor
  console.log('Capturing Code Editor...');
  const editorEl = page.locator('.monaco-editor').first();
  if (await editorEl.isVisible().catch(() => false)) {
    await editorEl.screenshot({ path: join(OUT_DIR, '04_code_editor.png') });
  }

  // 5. Terminal WebContainer mode
  console.log('Capturing Terminal (WebContainer mode)...');
  const termTab = page.locator('button:has-text("Terminal")').first();
  if (await termTab.isVisible().catch(() => false)) {
    await termTab.click().catch(() => {});
  }
  await page.waitForTimeout(1000);
  const terminalArea = page.locator('.xterm, [data-testid="terminal-container"]').first();
  if (await terminalArea.isVisible().catch(() => false)) {
    await terminalArea.screenshot({ path: join(OUT_DIR, '05_terminal_webcontainer.png') });
  } else {
    await page.screenshot({ path: join(OUT_DIR, '05_terminal_webcontainer.png'), clip: { x: 280, y: 550, width: 700, height: 300 } });
  }

  // 6. Terminal Local mode
  console.log('Capturing Terminal (Local mode)...');
  const localModeBtn = page.locator('button:has-text("Local"), button:has-text("Simulated"), [aria-label*="Local"]').first();
  if (await localModeBtn.isVisible().catch(() => false)) {
    await localModeBtn.click().catch(() => {});
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: join(OUT_DIR, '06_terminal_local.png'), clip: { x: 280, y: 550, width: 700, height: 300 } });

  // 7. Live Preview
  console.log('Capturing Live Preview...');
  const previewPanel = page.locator('[data-testid="preview-panel"], iframe[title="Code Preview"], .preview-container').first();
  if (await previewPanel.isVisible().catch(() => false)) {
    await previewPanel.screenshot({ path: join(OUT_DIR, '07_live_preview.png') });
  } else {
    await page.screenshot({ path: join(OUT_DIR, '07_live_preview.png'), clip: { x: 950, y: 40, width: 490, height: 800 } });
  }

  // 8. Loading state
  console.log('Capturing Loading State...');
  // Navigate to popout or mock loading
  const loaderPage = await context.newPage();
  await loaderPage.goto(`${TARGET_URL}/?loading=1`, { waitUntil: 'commit' });
  await loaderPage.screenshot({ path: join(OUT_DIR, '08_loading_state.png'), fullPage: false });
  await loaderPage.close();

  // 9. Error state
  console.log('Capturing Error State (Enhanced Console / Diagnostics)...');
  const consoleTab = page.locator('button:has-text("Console")').first();
  if (await consoleTab.isVisible().catch(() => false)) {
    await consoleTab.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: join(OUT_DIR, '09_error_state.png'), clip: { x: 280, y: 550, width: 700, height: 300 } });

  // 10. Theme state
  console.log('Capturing Theme State...');
  await page.screenshot({ path: join(OUT_DIR, '10_theme_state.png'), fullPage: false });

  // 11. Narrow Viewport
  console.log('Capturing Narrow Viewport (768px)...');
  await page.setViewportSize({ width: 768, height: 800 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT_DIR, '11_narrow_viewport.png'), fullPage: false });

  // 12. Full-Screen Editor
  console.log('Capturing Full-Screen Editor...');
  await page.setViewportSize({ width: 1440, height: 900 });
  const fullscreenBtn = page.locator('button[title*="Fullscreen"], button[aria-label*="Fullscreen"]').first();
  if (await fullscreenBtn.isVisible().catch(() => false)) {
    await fullscreenBtn.click().catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: join(OUT_DIR, '12_fullscreen_editor.png'), fullPage: false });

  await browser.close();
  console.log('[SCREENSHOT AUDIT] Capture complete.');
}

capture().catch(err => {
  console.error('[SCREENSHOT ERROR]', err);
  process.exit(1);
});
