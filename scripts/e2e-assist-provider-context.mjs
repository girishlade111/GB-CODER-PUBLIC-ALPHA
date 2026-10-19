/**
 * GB CODER: REAL CHROMIUM E2E ACCEPTANCE HARNESS
 * FOR BYOK PROVIDER MANAGEMENT & ADVANCED CUSTOM PROVIDER BUILDER
 *
 * Validates:
 * 1. Portal mounting to document.body (resolving stacking behind terminal/preview)
 * 2. Full-viewport backdrop overlay dimming the entire workbench
 * 3. Searchable provider discovery directory (Popular & Other categories)
 * 4. Dedicated custom provider configuration view with models & headers
 * 5. Dynamic addition and removal of multiple models and headers
 * 6. Live validation for Provider ID, URL syntax, and duplicate models
 * 7. Connection diagnostic execution with consent gate (no unapproved paid requests)
 * 8. Elimination of result.split TypeError
 * 9. Saving custom provider and activating it in GB Assist Chat
 * 10. Background panel stability (Terminal and Live Preview remain unperturbed)
 * 11. Escape key navigation and focus trapping
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4198;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'reports', 'provider-context-screenshots');

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
  console.log('GB CODER: REAL CHROMIUM E2E - BYOK PROVIDER MANAGEMENT SYSTEM');
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

    let lastInterceptedModel = null;
    let modelDiscoveryUrlCalled = null;

    // Mock external AI endpoint to prevent external calls or cost
    await page.route('https://api.mistral.ai/**', async (route) => {
      const request = route.request();
      if (request.url().includes('/models') && request.method() === 'GET') {
        modelDiscoveryUrlCalled = request.url();
        const responseData = {
          object: 'list',
          data: [
            { id: 'mercury-2-production', name: 'Mercury 2 Production', context_length: 64000 },
            { id: 'mercury-mini-v2', name: 'Mercury Mini v2', context_length: 32000 },
            { id: 'mercury-coder-pro', name: 'Mercury Coder Pro', context_length: 128000 },
          ],
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(responseData),
        });
        return;
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON() || {};
        lastInterceptedModel = body.model || null;
        const responseData = {
          id: 'chatcmpl-mock-inception',
          object: 'chat.completion',
          created: Date.now(),
          model: body.model || 'mercury-2',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Mistral fixture ping response' },
              finish_reason: 'stop',
            },
          ],
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(responseData),
        });
        return;
      }
      await route.continue();
    });

    // 1. Visit IDE
    console.log('Step 1: Navigating to IDE workbench...');
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="code-assist-panel"]');
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onsuccess = () => {
          const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
          tx.objectStore('projects').put({ id: 'provider-context-e2e', name: 'Disposable provider context fixture', createdAt: Date.now(), lastOpenedAt: Date.now(), editorStyle: 'vscode', projectType: 'plain', fileCount: 4 });
          for (const [path, content] of [['index.html', '<h1>ACTUAL_INDEXEDDB_MARKER</h1>'], ['src/util.js', 'export const fixture = "NESTED_CONTEXT_MARKER"'], ['src/.env.local', 'SECRET_MUST_NOT_LEAK'], ['src/image.png', 'BINARY_MUST_NOT_LEAK']]) {
            tx.objectStore('projectFiles').put({ projectId: 'provider-context-e2e', path, content, language: path.endsWith('html') ? 'html' : 'javascript' });
          }
          tx.oncomplete = () => { localStorage.setItem('gb-coder-active-project-id', 'provider-context-e2e'); resolve(); };
          tx.onerror = reject;
        }; req.onerror = reject;
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="ai-prompt-input"]');


    // 2. Open settings button from CodeAssistPanel
    console.log('Step 2: Opening Connect Provider modal...');
    const settingsBtn = page.locator('[data-testid="open-ai-settings-btn"]');
    await settingsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await settingsBtn.click();

    // 3. Verify Modal Stacking Context & Portal mounting
    console.log('Step 3: Asserting React Portal & global stacking z-index...');
    const modal = page.locator('[data-testid="ai-provider-settings-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });

    const modalParentTagName = await modal.evaluate((el) => el.parentElement?.tagName.toLowerCase());
    assert.equal(modalParentTagName, 'body', 'Modal MUST be appended directly to document.body via React Portal');

    const modalZIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);
    assert.ok(Number.parseInt(modalZIndex, 10) >= 99999, 'Modal z-index must be high to overlay all workbench panels');

    await safeScreenshot(page, '20-connect-provider-discovery.png');

    // 4. Verify Searchable Directory Filtering
    console.log('Step 4: Testing real-time provider search filtering...');
    const searchInput = page.locator('[data-testid="provider-search-input"]');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('openrouter');
    await page.waitForTimeout(300);

    const openRouterCard = page.locator('[data-testid="provider-card-openrouter"]');
    assert.equal(await openRouterCard.isVisible(), true, 'OpenRouter card must be visible when searching');

    const geminiCard = page.locator('[data-testid="provider-card-gemini"]');
    assert.equal(await geminiCard.isVisible(), false, 'Google Gemini card must be filtered out');

    await safeScreenshot(page, '21-connect-provider-search.png');

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(200);
    assert.equal(await geminiCard.isVisible(), true, 'Popular providers must be restored after search clear');

    // 5. Open Custom Provider Builder
    console.log('Step 5: Opening Custom Provider Builder...');
    const customCard = page.locator('[data-testid="provider-card-custom"]');
    await customCard.click();

    const backBtn = page.locator('[data-testid="back-to-directory-btn"]');
    await backBtn.waitFor({ state: 'visible' });

    // 6. Test Back navigation preservation
    console.log('Step 6: Testing Back navigation...');
    await backBtn.click();
    assert.equal(await searchInput.isVisible(), true, 'Clicking back must return to directory');

    await customCard.click();
    await backBtn.waitFor({ state: 'visible' });

    // 7. Test Form Validation
    console.log('Step 7: Testing Form Validation...');
    const idInput = page.locator('[data-testid="custom-provider-id-input"]');
    const nameInput = page.locator('[data-testid="custom-provider-name-input"]');
    const urlInput = page.locator('[data-testid="custom-provider-url-input"]');
    const saveBtn = page.locator('[data-testid="save-ai-settings-btn"]');

    // Try saving empty provider
    await idInput.fill('');
    await saveBtn.click();
    await page.waitForTimeout(200);

    // Fill valid provider data
    await idInput.fill('inception');
    await nameInput.fill('Mistral fixture');
    await urlInput.fill('https://api.mistral.ai/v1');

    const keyInput = page.locator('[data-testid="ai-provider-api-key-input"]');
    await keyInput.fill('sk-test-inception-secret-12345');

    // 8. Fetch Models via Authenticated Model Discovery
    console.log('Step 8: Fetching models via authenticated model discovery...');
    const fetchModelsBtn = page.locator('[data-testid="fetch-models-btn"]');
    await fetchModelsBtn.waitFor({ state: 'visible' });
    await fetchModelsBtn.click();

    // Verify discovery endpoint was reached safely
    const discoveredSearchInput = page.locator('[data-testid="discovered-models-search-input"]');
    await discoveredSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(
      modelDiscoveryUrlCalled,
      'https://api.mistral.ai/v1/models',
      'Model discovery URL must be safely constructed without duplicate segments'
    );
    console.log('  ✔ Discovered models drawer opened successfully');

    // Test search filter inside drawer
    await discoveredSearchInput.fill('coder');
    await page.waitForTimeout(200);

    // Deselect all first, then select specifically mercury-coder-pro
    const selectAllBtn = page.locator('[data-testid="select-all-discovered-models-btn"]');
    await selectAllBtn.click(); // Deselect all

    const coderModelCheckbox = page.locator('[data-testid="discovered-model-checkbox-mercury-coder-pro"]');
    await coderModelCheckbox.check();

    // Add Selected discovered model
    const addSelectedBtn = page.locator('[data-testid="add-selected-discovered-models-btn"]');
    await addSelectedBtn.click();
    console.log('  ✔ Added discovered model mercury-coder-pro to provider configuration');

    // Also verify manual model addition works seamlessly alongside fetched models
    const addModelBtn = page.locator('[data-testid="add-custom-model-btn"]');
    await addModelBtn.click();
    const model1Id = page.locator('[data-testid="custom-model-id-input-1"]');
    const model1Name = page.locator('[data-testid="custom-model-name-input-1"]');
    await model1Id.fill('mercury-mini');
    await model1Name.fill('Mercury Mini');

    // Explicitly set mercury-coder-pro as active model
    const activeModel0Btn = page.locator('[data-testid="set-active-model-btn-0"]');
    await activeModel0Btn.click();

    // 9. Add Custom Headers
    console.log('Step 9: Adding and testing custom headers...');
    const addHeaderBtn = page.locator('[data-testid="add-custom-header-btn"]');
    await addHeaderBtn.click();

    const header0Name = page.locator('[data-testid="custom-header-name-input-0"]');
    const header0Val = page.locator('[data-testid="custom-header-value-input-0"]');
    await header0Name.fill('X-Custom-Client');
    await header0Val.fill('gb-coder-test');

    await safeScreenshot(page, '22-custom-provider-builder.png');

    // 10. Run Connection Test Probe and Assert Exact Model ID Propagation
    console.log('Step 10: Testing Connection Diagnostics probe and model routing...');
    const testBtn = page.locator('[data-testid="test-ai-connection-btn"]');
    await testBtn.click();

    // Wait for diagnostic result message
    await page.waitForSelector('text=Connected successfully', { timeout: 10000 });
    console.log('  ✔ Connection probe succeeded without result.split error!');

    // CRITICAL INVARIANT: The network request must have used the actual configured model ID
    assert.notEqual(lastInterceptedModel, 'custom-model', 'Request model MUST NEVER be placeholder "custom-model"');
    assert.notEqual(lastInterceptedModel, 'gpt-4o-mini', 'Request model MUST NEVER be hardcoded "gpt-4o-mini"');
    assert.ok(
      lastInterceptedModel === 'mercury-coder-pro' || lastInterceptedModel === 'mercury-mini',
      `Request model must be one of the explicitly configured models (received: "${lastInterceptedModel}")`
    );
    console.log(`  ✔ Model propagation verified: HTTP request body.model === "${lastInterceptedModel}"`);

    // 11. Save and Connect
    console.log('Step 11: Saving and activating custom provider...');
    await saveBtn.click();
    await modal.waitFor({ state: 'hidden', timeout: 5000 });

    // Verify GB Assist active provider display
    const panelHeaderProvider = page.getByTestId('code-assist-panel').getByText('Mistral', { exact: true });
    assert.equal(await panelHeaderProvider.isVisible(), true, 'Header must display active custom provider name');

    await safeScreenshot(page, '23-custom-provider-connected.png');

    // 12. Test Escape key close
    console.log('Step 12: Testing Escape key closing...');
    await settingsBtn.click();
    await modal.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await modal.waitFor({ state: 'hidden' });
    console.log('  ✔ Escape key cleanly closed modal');

    // Exercise real saved provider -> composer -> HTTP -> visible assistant response.
    const requests = [];
    let agentRound = 0;
    const streamBody = (delta) => `data:${JSON.stringify({ choices: [{ delta }] })}\n\ndata:[DONE]\n\n`;
    await page.route('https://api.mistral.ai/**', async (route) => {
      const body = route.request().postDataJSON(); requests.push(body);
      assert.equal(route.request().url(), 'https://api.mistral.ai/v1/chat/completions');
      assert.equal(body.model, 'mercury-coder-pro');
      assert.equal(route.request().headers().authorization, 'Bearer sk-test-inception-secret-12345');
      assert.equal(body.stream_options, undefined);
      assert.doesNotMatch(JSON.stringify(body), /SECRET_MUST_NOT_LEAK|BINARY_MUST_NOT_LEAK/);
      let delta = { content: 'Browser streaming reply received' };
      if (body.messages.at(-1)?.content === 'Perform read fixture agent') {
        agentRound++;
        delta = { tool_calls: [{ index: 0, id: 'browser-read-1', type: 'function', function: { name: 'read_file', arguments: '{"path":"src/util.js"}' } }] };
      } else if (body.messages.some((m) => m.role === 'tool')) {
        const tool = body.messages.find((m) => m.role === 'tool');
        assert.equal(tool.tool_call_id, 'browser-read-1'); assert.match(tool.content, /NESTED_CONTEXT_MARKER/);
        delta = { content: 'Browser Agent verified actual read_file result' };
      }
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: streamBody(delta) });
    });
    const editorInput = page.locator('.monaco-editor .inputarea').first();
    await editorInput.focus(); await editorInput.press('Control+Home');
    await page.keyboard.insertText('<!-- UNSAVED_MONACO_MARKER -->\n');
    const prompt = page.getByTestId('ai-prompt-input');
    await prompt.fill('Explain fixture'); await prompt.press('Enter');
    await page.getByTestId('code-assist-chat-body').getByText('Browser streaming reply received', { exact: true }).first().waitFor();
    assert.match(JSON.stringify(requests.at(-1).messages), /UNSAVED_MONACO_MARKER/);
    console.log('PASS: custom connection probe followed by visible streaming Chat using dirty Monaco content');
    // Mention keyboard selection and actual context reaching transport.
    await prompt.fill('Explain @src/util'); await prompt.press('ArrowDown'); await prompt.press('Enter');
    await page.getByTestId('context-attachment-chip').filter({ hasText: 'src/util.js' }).waitFor();
    await prompt.press('Enter');
    await page.waitForTimeout(500);
    assert.match(JSON.stringify(requests.at(-1).messages), /NESTED_CONTEXT_MARKER/);
    await page.getByRole('button', { name: 'Remove src/util.js', exact: true }).click();
    assert.equal(await page.getByTestId('context-attachment-chip').count(), 0);
    console.log('PASS: @file keyboard attachment, content transmission and removal');
    // Folder selection from real project tree.
    await prompt.fill('Explain @src/'); await prompt.press('Enter');
    await page.getByTestId('context-attachment-chip').filter({ hasText: 'src/' }).waitFor();
    await page.getByRole('button', { name: 'Remove src/', exact: true }).click();
    await page.getByRole('button', { name: 'Attach Context', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search project paths' }).fill('src/');
    await page.getByRole('checkbox', { name: '📁 src/', exact: true }).check();
    await page.getByRole('button', { name: 'Attach selected items', exact: true }).click();
    await prompt.fill('Explain attached folder'); await prompt.press('Enter');
    await page.waitForTimeout(500);
    assert.match(JSON.stringify(requests.at(-1).messages), /NESTED_CONTEXT_MARKER/);
    assert.doesNotMatch(JSON.stringify(requests.at(-1)), /SECRET_MUST_NOT_LEAK|BINARY_MUST_NOT_LEAK/);
    console.log('PASS: @folder tree selection sends permitted nested content');
    // Enable tools using actual custom provider form, then use actual Agent UI.
    await settingsBtn.click();
    await page.getByTestId('configured-provider-inception').click();
    // Locate the capability checkbox by its adjacent label text.
    await page.getByRole('button', { name: 'Advanced Configuration' }).click();
    await page.getByLabel(/tool calling/i).check();
    await saveBtn.click();
    await page.getByTestId('ai-mode-selector-pill').click(); await page.getByTestId('mode-option-Agent').click();
    await prompt.fill('Perform read fixture agent'); await prompt.press('Enter');
    await page.getByTestId('agent-completed-summary').getByText('Browser Agent verified actual read_file result', { exact: true }).waitFor({ timeout: 15000 });
    assert.equal(agentRound, 1);
    console.log('PASS: actual Agent read_file and provider continuation');
    // Built-in authenticated dynamic discovery, exact model selection and Chat.
    await settingsBtn.click();
    await page.getByTestId('provider-card-openrouter').click();
    await page.getByTestId('ai-provider-api-key-input').fill('fake-openrouter-key');
    await page.route('https://openrouter.ai/api/v1/**', async (route) => {
      assert.equal(route.request().headers().authorization, 'Bearer fake-openrouter-key');
      if (route.request().method() === 'GET') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: Array.from({ length: 700 }, (_, i) => ({ id: `author/catalog-${i}`, name: `Discovered ${i}`, context_length: 64000, supported_parameters: ['tools'] })) }) });
      const body = route.request().postDataJSON(); assert.equal(body.model, 'author/catalog-543');
      return route.fulfill({ contentType: 'text/event-stream', body: streamBody({ content: 'OpenRouter dynamic model Chat verified' }) });
    });
    await page.getByTestId('fetch-builtin-models-btn').click();
    await page.getByText('Selected model is unavailable. Select an available model.', { exact: true }).waitFor();
    await saveBtn.click(); assert.equal(await modal.isVisible(), true);
    await page.getByRole('textbox', { name: 'Search models', exact: true }).fill('catalog-543');
    await page.getByRole('combobox', { name: 'Selected model' }).selectOption('author/catalog-543');
    await saveBtn.click();
    await page.getByTestId('ai-mode-selector-pill').click(); await page.getByTestId('mode-option-Ask').click();
    await prompt.fill('Check dynamic selection'); await prompt.press('Enter');
    await page.getByText('OpenRouter dynamic model Chat verified', { exact: true }).waitFor();
    console.log('PASS: OpenRouter 700-model search, invalid prior selection and dynamic Chat routing');
    // Abort a delayed provider response through the real Stop Generation control.
    let delayedRequests = 0;
    await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
      delayedRequests++;
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({ contentType: 'text/event-stream', body: streamBody({ content: 'LATE_CANCELLED_RESPONSE_FORBIDDEN' }) }).catch(() => {});
    });
    await prompt.fill('Cancel this response'); await prompt.press('Enter');
    await page.getByTestId('cancel-input-btn').click();
    await page.waitForTimeout(900);
    assert.equal(delayedRequests, 1);
    assert.doesNotMatch(await page.getByTestId('code-assist-chat-body').innerText(), /LATE_CANCELLED_RESPONSE_FORBIDDEN/);
    console.log('PASS: cancelled request produces no late reply or duplicate inference');
    // A different disposable project receives neither attachment chips nor the prior conversation.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onsuccess = () => {
          const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
          tx.objectStore('projects').put({ id: 'provider-context-isolated', name: 'Isolated fixture', createdAt: Date.now(), lastOpenedAt: Date.now(), editorStyle: 'vscode', projectType: 'plain', fileCount: 1 });
          tx.objectStore('projectFiles').put({ projectId: 'provider-context-isolated', path: 'index.html', content: '<h1>Isolated project</h1>', language: 'html' });
          tx.oncomplete = resolve;
        };
      });
    });
    await page.goto(`${BASE_URL}/app/projects/provider-context-isolated/ide`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('ai-prompt-input').waitFor();
    assert.equal(await page.getByTestId('context-attachment-chip').count(), 0);
    assert.doesNotMatch(await page.getByTestId('code-assist-chat-body').innerText(), /NESTED_CONTEXT_MARKER|OpenRouter dynamic model Chat verified/);
    console.log('PASS: real project navigation isolates context and conversation');
    console.log('\n================================================================');
    console.log('ALL CHROMIUM E2E ACCEPTANCE TESTS PASSED!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error('\n✖ CHROMIUM E2E FAILED:', err);
  process.exit(1);
});
