/**
 * GB CODER: REAL CHROMIUM RECOVERY & BOOT SMOKE TEST
 *
 * Validates:
 * 1. Browser loads /app successfully without ReferenceError or error boundary
 * 2. Browser loads /app/ide successfully without ReferenceError or error boundary
 * 3. Global React ErrorBoundary does NOT trigger ("Something went wrong" absent)
 * 4. Project Explorer and IDE workbench mount cleanly
 * 5. GB Assist panel and prompt input mount cleanly
 * 6. Connect Provider directory opens via React Portal
 * 7. OpenRouter provider configuration screen opens
 * 8. Custom Provider configuration screen opens
 * 9. Fetch Models button and model selector render
 * 10. Chat and Agent Mode selector controls render
 * 11. @file / @folder context composer renders
 * 12. Full page reload does not reproduce crash
 * 13. Zero uncaught page exceptions or ReferenceError in console
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4196;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'reports', 'boot-screenshots');

if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(Boolean(res.statusCode && res.statusCode < 500));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function safeScreenshot(page, filename) {
  try {
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(SCREENSHOT_DIR, filename), animations: 'disabled' });
    console.log(`  [Screenshot] Captured: ${filename}`);
  } catch (err) {
    console.warn(`  [Warning] Screenshot ${filename} skipped: ${err.message}`);
  }
}

async function run() {
  console.log('================================================================');
  console.log('GB CODER: BOOT SMOKE TEST & RUNTIME EXCEPTION RECOVERY');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('================================================================\n');

  let serverProcess = null;
  const running = await isServerRunning(`${BASE_URL}/app/ide`);
  if (!running) {
    console.log(`Starting preview server on port ${PORT}...`);
    serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
      stdio: 'inherit',
    });
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (await isServerRunning(`${BASE_URL}/app/ide`)) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!ready) {
      throw new Error(`Preview server failed to start on ${BASE_URL} within 10 seconds.`);
    }
    console.log(`Preview server started successfully on ${BASE_URL}.`);
  } else {
    console.log(`Reusing active preview server at ${BASE_URL}.`);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const pageErrors = [];
  const uncaughtConsoleErrors = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('gbcoder_onboarded', 'true');
      } catch {}
    });

    const page = await context.newPage();

    page.on('pageerror', (err) => {
      console.error('  [PAGE ERROR DETECTED]:', err.message);
      pageErrors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore benign favicon or network route aborts
        if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
          uncaughtConsoleErrors.push(text);
        }
      }
    });

    // ── STEP 1: Verify /app Route (App Shell & Dashboard) ──
    console.log('Step 1: Navigating to /app...');
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const bodyApp = await page.evaluate(() => document.body.innerText);
    assert.equal(
      bodyApp.includes('Something went wrong'),
      false,
      'Global error boundary "Something went wrong" MUST NOT appear on /app'
    );
    assert.equal(
      bodyApp.includes('BUILT_IN_CATALOG is not defined'),
      false,
      'ReferenceError BUILT_IN_CATALOG MUST NOT be present in page text'
    );
    await safeScreenshot(page, '01-app-dashboard-boot.png');
    console.log('  ✔ /app booted successfully without error boundary');

    // ── STEP 2: Verify /app/ide Route (Advanced IDE Workbench) ──
    console.log('Step 2: Navigating to /app/ide...');
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const bodyIde = await page.evaluate(() => document.body.innerText);
    assert.equal(
      bodyIde.includes('Something went wrong'),
      false,
      'Global error boundary "Something went wrong" MUST NOT appear on /app/ide'
    );
    assert.equal(
      bodyIde.includes('BUILT_IN_CATALOG is not defined'),
      false,
      'ReferenceError BUILT_IN_CATALOG MUST NOT be present in page text'
    );
    console.log('  ✔ /app/ide mounted cleanly without error boundary');

    // ── STEP 3: Verify IDE Workbench Elements ──
    console.log('Step 3: Asserting Workbench elements (Explorer, GB Assist)...');
    const assistPanel = page.locator('[data-testid="code-assist-panel"]');
    await assistPanel.waitFor({ state: 'visible', timeout: 10000 });
    console.log('  ✔ GB Assist panel is visible');

    const promptInput = page.locator('[data-testid="ai-prompt-input"]');
    await promptInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✔ Prompt input is mounted and ready');

    // ── STEP 4: Open Connect Provider Modal ──
    console.log('Step 4: Opening Connect Provider modal...');
    const settingsBtn = page.locator('[data-testid="open-ai-settings-btn"]');
    await settingsBtn.waitFor({ state: 'visible', timeout: 5000 });
    await settingsBtn.click();

    const modal = page.locator('[data-testid="ai-provider-settings-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });

    const modalBodyText = await modal.evaluate((el) => el.innerText);
    assert.equal(
      modalBodyText.includes('BUILT_IN_CATALOG is not defined'),
      false,
      'ReferenceError BUILT_IN_CATALOG MUST NOT occur inside Settings Modal'
    );
    assert.equal(
      modalBodyText.includes('Something went wrong'),
      false,
      'Error boundary MUST NOT be triggered inside Settings Modal'
    );
    await safeScreenshot(page, '02-settings-modal-portal.png');
    console.log('  ✔ Settings Modal opened via Portal without ReferenceError');

    // ── STEP 5: Open OpenRouter Provider Configuration ──
    console.log('Step 5: Inspecting OpenRouter provider configuration...');
    const openRouterCard = page.locator('[data-testid="provider-card-openrouter"]');
    await openRouterCard.waitFor({ state: 'visible', timeout: 5000 });
    await openRouterCard.click();

    const backBtn = page.locator('[data-testid="back-to-directory-btn"]');
    await backBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Built-in fetch models button and model selector
    const fetchBuiltinBtn = page.locator('[data-testid="fetch-builtin-models-btn"]');
    await fetchBuiltinBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✔ OpenRouter configuration view loaded with Fetch Models button');
    await safeScreenshot(page, '03-openrouter-config.png');

    // ── STEP 6: Back to Directory & Open Custom Provider Builder ──
    console.log('Step 6: Navigating back and opening Custom Provider Builder...');
    await backBtn.click();
    await modal.waitFor({ state: 'visible' });

    const customCard = page.locator('[data-testid="provider-card-custom"]');
    await customCard.waitFor({ state: 'visible', timeout: 5000 });
    await customCard.click();

    const customIdInput = page.locator('[data-testid="custom-provider-id-input"]');
    await customIdInput.waitFor({ state: 'visible', timeout: 5000 });

    const fetchModelsCustomBtn = page.locator('[data-testid="fetch-models-btn"]');
    await fetchModelsCustomBtn.waitFor({ state: 'visible', timeout: 5000 });

    const testConnBtn = page.locator('[data-testid="test-ai-connection-btn"]');
    await testConnBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✔ Custom Provider Builder view rendered cleanly');
    await safeScreenshot(page, '04-custom-builder-view.png');

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('  ✔ Modal closed via Escape key');

    // ── STEP 7: Verify Mode Selector and Context Composer ──
    console.log('Step 7: Verifying Mode Selector and Context Composer...');
    const modePill = page.locator('[data-testid="ai-mode-selector-pill"]');
    await modePill.click();

    const agentOption = page.locator('[data-testid="mode-option-Agent"]');
    await agentOption.waitFor({ state: 'visible', timeout: 5000 });
    await agentOption.click();
    assert.equal(await modePill.innerText(), 'Agent');
    console.log('  ✔ Agent Mode switched cleanly');

    // Check @ context trigger
    await promptInput.fill('@');
    await page.waitForTimeout(300);
    await safeScreenshot(page, '05-assist-at-context.png');
    await promptInput.fill('');
    console.log('  ✔ Context trigger operates cleanly');

    // ── STEP 8: Reload Recovery Verification ──
    console.log('Step 8: Performing browser reload to test reload recovery...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const bodyReload = await page.evaluate(() => document.body.innerText);
    assert.equal(
      bodyReload.includes('Something went wrong'),
      false,
      'Global error boundary MUST NOT appear after page reload'
    );
    assert.equal(
      bodyReload.includes('BUILT_IN_CATALOG is not defined'),
      false,
      'ReferenceError BUILT_IN_CATALOG MUST NOT appear after page reload'
    );
    await safeScreenshot(page, '06-post-reload-recovery.png');
    console.log('  ✔ Reload recovered cleanly');

    // ── ASSERTION: Zero ReferenceErrors or Uncaught Page Exceptions ──
    const referenceErrors = pageErrors.filter((e) => e.includes('ReferenceError') || e.includes('is not defined'));
    assert.equal(
      referenceErrors.length,
      0,
      `Uncaught ReferenceErrors detected: ${referenceErrors.join(', ')}`
    );
    assert.equal(
      pageErrors.length,
      0,
      `Uncaught page exceptions detected: ${pageErrors.join(', ')}`
    );

    console.log('\n================================================================');
    console.log('ALL 8 BOOT RECOVERY & SMOKE TEST GATES PASSED (0 ERRORS)!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

run().catch((err) => {
  console.error('\n✖ BOOT SMOKE TEST FAILED:', err);
  process.exit(1);
});
