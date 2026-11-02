/**
 * GB CODER: REAL CHROMIUM E2E ACCEPTANCE HARNESS
 * FOR INCEPTION LABS BYOK AUTH, CORS & MODEL DISCOVERY FIX
 *
 * Validates in REAL Headless Chromium:
 * 1. Directory Search and Selection of Inception Labs (Mercury)
 * 2. Configuration View with default Base URL https://api.inceptionlabs.ai/v1
 * 3. Default model is official mercury-2.5 (elimination of stale mercury-coder)
 * 4. Transparent provider CORS disclosure in UI
 * 5. Upstream CORS failure on Fetch Models classified truthfully with manual entry preservation
 * 6. Missing API key validation before network probe (prevents unauthenticated 401s)
 * 7. Truthful HTTP 401 error display on invalid/rejected API key
 * 8. Successful Connection Test probe with mercury-2.5
 * 9. Save & Connect updates active provider scope in GB Assist
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4202;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'reports', 'multi-provider-screenshots');

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

async function main() {
  console.log('================================================================');
  console.log('GB CODER: REAL CHROMIUM E2E - INCEPTION LABS BYOK ACCEPTANCE');
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

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('gbcoder_onboarded', 'true');
      } catch {}
    });

    const page = await context.newPage();

    let chatCompletionsReturn401 = false;
    let interceptedChatBody = null;
    let interceptedChatHeaders = null;

    // Intercept Inception Labs API calls
    await page.route('https://api.inceptionlabs.ai/**', async (route) => {
      const request = route.request();
      const url = request.url();

      if (url.includes('/models') && request.method() === 'GET') {
        // Simulate upstream CloudFront omitting Access-Control-Allow-Origin on GET (browser CORS failure)
        return route.abort('failed');
      }

      if (url.includes('/chat/completions') && request.method() === 'POST') {
        interceptedChatBody = JSON.parse(request.postData() || '{}');
        interceptedChatHeaders = request.headers();

        if (chatCompletionsReturn401) {
          return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              error: {
                message: 'Incorrect API key provided',
                type: 'authentication_error',
                code: 'invalid_api_key',
              },
            }),
          });
        }

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'chatcmpl-inception-test',
            object: 'chat.completion',
            created: Date.now(),
            model: interceptedChatBody.model || 'mercury-2.5',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'Connected to Inception Labs Mercury 2.5 successfully.',
                },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
          }),
        });
      }

      return route.continue();
    });

    console.log('Step 1: Navigating to IDE workbench...');
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 15000 });
    await page.locator('#loading').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    console.log('Step 2: Opening Connect Provider modal...');
    const connectBtn = page.locator('[data-testid="open-ai-settings-btn"]');
    await connectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await connectBtn.click();

    const modal = page.locator('[data-testid="ai-provider-settings-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Step 3: Searching and selecting Inception Labs (Mercury)...');
    const searchInput = page.locator('[data-testid="provider-search-input"]');
    await searchInput.fill('inception');

    const inceptionCard = page.locator('[data-testid="provider-card-inception"]');
    await inceptionCard.waitFor({ state: 'visible', timeout: 5000 });
    await inceptionCard.click();

    console.log('Step 4: Verifying Inception Labs configuration view & default model...');
    await page.locator('[data-testid="custom-provider-url-input"]').waitFor({ state: 'visible', timeout: 5000 });

    const baseUrlVal = await page.locator('[data-testid="custom-provider-url-input"]').inputValue();
    assert.equal(baseUrlVal, 'https://api.inceptionlabs.ai/v1', 'Base URL must default to Inception Labs v1 endpoint');

    const model0Id = await page.locator('[data-testid="custom-model-id-input-0"]').inputValue();
    assert.equal(model0Id, 'mercury-2.5', 'Default model ID must be official mercury-2.5, not stale mercury-coder');

    // Verify transparent CORS notice
    const corsNotice = await page.getByText(/restricted by provider CORS/i).first();
    assert.ok(await corsNotice.isVisible(), 'Must display CORS note for Inception Labs');
    await safeScreenshot(page, '50-inception-config-view.png');

    console.log('Step 5: Testing Fetch Models browser CORS handling...');
    const fetchModelsBtn = page.locator('[data-testid="fetch-models-btn"]');
    await fetchModelsBtn.click();

    const corsErrorAlert = page.locator('text=Browser CORS restriction');
    await corsErrorAlert.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await corsErrorAlert.textContent();
    assert.match(errorText, /Cannot access provider models endpoint from the browser/i);

    // Verify model mercury-2.5 is preserved
    const preservedModel = await page.locator('[data-testid="custom-model-id-input-0"]').inputValue();
    assert.equal(preservedModel, 'mercury-2.5', 'Configured model mercury-2.5 must remain preserved');
    await safeScreenshot(page, '51-inception-cors-handling.png');

    console.log('Step 6: Testing missing API key validation on Test Connection...');
    const keyInput = page.locator('[data-testid="ai-provider-api-key-input"]');
    await keyInput.fill('');

    const testConnBtn = page.locator('[data-testid="test-ai-connection-btn"]');
    await testConnBtn.click();

    const keyError = page.locator('text=An API key is required before testing connection');
    await keyError.waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(interceptedChatBody, null, 'No network probe must be fired when API key is empty');
    await safeScreenshot(page, '52-inception-missing-key-validation.png');

    console.log('Step 7: Testing remote HTTP 401 error display on invalid API key...');
    chatCompletionsReturn401 = true;
    await keyInput.fill('sk-invalid-inception-key-999');

    // Consent checkbox if present
    const consentCb = page.locator('[data-testid="test-probe-consent-checkbox"]');
    if (await consentCb.isVisible()) {
      await consentCb.check();
    }

    await testConnBtn.click();

    const diagnosticAlert = page.locator('[data-testid="diagnostic-result-alert"]');
    await diagnosticAlert.waitFor({ state: 'visible', timeout: 10000 });
    const diagnosticText = await diagnosticAlert.textContent();
    assert.match(diagnosticText, /Authentication failed \(401\)/i);
    assert.match(diagnosticText, /Incorrect API key provided/i);
    assert.equal(interceptedChatBody.model, 'mercury-2.5');
    assert.equal(interceptedChatHeaders['authorization'], 'Bearer sk-invalid-inception-key-999');
    await safeScreenshot(page, '53-inception-401-diagnostic.png');

    console.log('Step 8: Testing successful connection with mercury-2.5...');
    chatCompletionsReturn401 = false;
    await keyInput.fill('sk-valid-inception-mercury-key-12345');
    await testConnBtn.click();

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="diagnostic-result-alert"]');
      return el && el.textContent && el.textContent.includes('Connected successfully to Inception Labs');
    }, { timeout: 10000 });

    const successText = await diagnosticAlert.textContent();
    assert.match(successText, /Connected successfully to Inception Labs/i);
    assert.match(successText, /model: "mercury-2\.5"/i);
    await safeScreenshot(page, '54-inception-connection-success.png');

    console.log('Step 9: Saving Inception Labs provider and verifying active GB Assist scope...');
    const saveBtn = page.locator('[data-testid="save-ai-settings-btn"]');
    await saveBtn.click();

    // Verify modal closes
    await modal.waitFor({ state: 'hidden', timeout: 10000 });

    // Verify active model / provider in GB Assist panel
    const assistBadge = page.getByTestId('code-assist-panel');
    await assistBadge.waitFor({ state: 'visible', timeout: 10000 });
    const assistText = await assistBadge.textContent();
    assert.ok(
      assistText.includes('Inception') || assistText.includes('Mercury') || assistText.includes('mercury-2.5'),
      'GB Assist panel must reflect active Inception provider or mercury-2.5 model'
    );
    await safeScreenshot(page, '55-inception-active-gbassist.png');

    console.log('\n================================================================');
    console.log('ALL CHROMIUM E2E INCEPTION LABS ACCEPTANCE TESTS PASSED!');
    console.log('================================================================');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error('\nE2E INCEPTION LABS ACCEPTANCE FAILED:', err);
  process.exit(1);
});
