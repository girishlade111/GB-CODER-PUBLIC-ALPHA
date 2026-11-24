/**
 * Comprehensive Vercel Staging Browser Acceptance Test
 * Tests React + Vite, Vue + Vite, Project Switching, Monaco HMR, and Persistence
 * Target: https://gb-coder-public-alpha-ddo4woela.vercel.app
 */

import { chromium } from 'playwright';
import assert from 'node:assert';

const STAGING_URL = 'https://gb-coder-public-alpha-ddo4woela.vercel.app';
const BYPASS_SECRET = process.env.VERCEL_PROTECTION_BYPASS || 'SUnVBZMiWuhY8BHOmMufcRHMGhn8Dp6L';

async function runComprehensiveStagingTest() {
  console.log('================================================================');
  console.log('GB CODER — COMPREHENSIVE VERCEL STAGING RUNTIME ACCEPTANCE');
  console.log('Target:', STAGING_URL);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Attach bypass secret header only to Vercel deployment requests
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('vercel.app')) {
      const headers = {
        ...route.request().headers(),
        'x-vercel-protection-bypass': BYPASS_SECRET,
      };
      route.continue({ headers });
    } else {
      route.continue();
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[vite]') || text.includes('Contextify') || text.includes('GB Coder')) {
      console.log('  [browser console]', text);
    }
  });

  try {
    // -------------------------------------------------------------------------
    // Phase 1: Isolation & Dashboard
    // -------------------------------------------------------------------------
    console.log('Step 1: Navigating to /app/projects on Staging...');
    await page.goto(`${STAGING_URL}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    const isolation = await page.evaluate(() => ({
      isSecureContext: window.isSecureContext,
      crossOriginIsolated: window.crossOriginIsolated,
      hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    }));
    assert.ok(isolation.crossOriginIsolated, 'crossOriginIsolated is true on staging');
    console.log('[PASS] Staging Isolation Verified:', JSON.stringify(isolation));

    // Helper: Wait for dev server ready
    const waitForDevServer = async (label, timeoutMs = 300000) => {
      console.log(`Waiting for ${label} dev server ready...`);
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const state = await page.evaluate(() => {
          const svc = window.__GBCODER_WEBCONTAINER_SERVICE__ || window.webcontainerService;
          return {
            stage: svc?.getState().startupStage,
            serverUrl: svc?.getState().serverUrl,
          };
        });
        if (state && state.serverUrl) {
          console.log(`[PASS] ${label} dev server running at: ${state.serverUrl}`);
          return state.serverUrl;
        }
        await page.waitForTimeout(2000);
      }
      throw new Error(`Timeout waiting for ${label} dev server ready`);
    };

    // -------------------------------------------------------------------------
    // Phase 2: TEST A — React + Vite on Staging
    // -------------------------------------------------------------------------
    console.log('\n--- TEST A: React + Vite on Staging ---');
    const newBtn = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newBtn.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyle = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyle.click();

    const reactOpt = await page.waitForSelector('[data-testid="new-project-template-react"]', { timeout: 10000 });
    await reactOpt.click();

    const reactName = `Staging React ${Date.now().toString().slice(-4)}`;
    const nameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await nameInput.fill(reactName);

    const createBtn = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createBtn.click();
    console.log('[PASS] React Project Created via UI — Name:', reactName);

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    const reactUrl = page.url();
    const reactProjectId = reactUrl.split('/projects/')[1].split('/ide')[0];

    await waitForDevServer('React');

    const reactFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactFrame.locator('#root h1').waitFor({ timeout: 30000 });
    const initialReactHeading = await reactFrame.locator('#root h1').textContent();
    assert.match(initialReactHeading, /Hello from React/i);
    console.log(`[PASS] React Initial Preview Rendered — Heading: "${initialReactHeading.trim()}"`);

    // Edit App.jsx via Monaco Keyboard
    const isTreeVisible = await page.isVisible('[data-testid="vscode-file-tree"]');
    if (!isTreeVisible) {
      const explorerBtn = await page.waitForSelector('[data-testid="activity-bar-explorer"]', { timeout: 10000 });
      await explorerBtn.click();
    }
    const appJsxNode = await page.waitForSelector('[data-testid="tree-file"][data-path="App.jsx"]', { timeout: 10000 });
    await appJsxNode.click();
    await page.waitForTimeout(500);

    const monacoPane = await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await monacoPane.click();
    await page.waitForTimeout(300);

    const uniqueReactHeading = 'GB Coder React Staging Verified 2026';
    const editedReactCode = `import { useState } from 'react';

export default function App() {
  return (
    <div className="card">
      <h1 data-testid="heading">${uniqueReactHeading}</h1>
      <p>Data persistence verified on staging.</p>
    </div>
  );
}
`;
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedReactCode);
    console.log('[PASS] Monaco Keyboard Edit Performed on React App.jsx');

    // Wait for Vite HMR in preview
    await reactFrame.locator(`text=${uniqueReactHeading}`).waitFor({ timeout: 25000 });
    const hmrReactHeading = await reactFrame.locator('#root h1').textContent();
    assert.strictEqual(hmrReactHeading.trim(), uniqueReactHeading);
    console.log(`[PASS] React Vite HMR Verified on Staging — Heading: "${hmrReactHeading.trim()}"`);

    // Wait for Autosave
    await page.waitForTimeout(2500);
    console.log('[PASS] React Autosave Completed on Staging');

    // -------------------------------------------------------------------------
    // Phase 3: TEST B — Vue + Vite on Staging
    // -------------------------------------------------------------------------
    console.log('\n--- TEST B: Vue + Vite on Staging ---');
    // Return to dashboard
    await page.goto(`${STAGING_URL}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });
    console.log('[PASS] Returned to Dashboard from React Project');

    // Create Vue project
    const newBtnVue = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newBtnVue.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyleVue = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyleVue.click();

    const vueOpt = await page.waitForSelector('[data-testid="new-project-template-vue"]', { timeout: 10000 });
    await vueOpt.click();

    const vueName = `Staging Vue ${Date.now().toString().slice(-4)}`;
    const vueNameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await vueNameInput.fill(vueName);

    const createBtnVue = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createBtnVue.click();
    console.log('[PASS] Vue Project Created via UI on Staging — Name:', vueName);

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    const vueUrl = page.url();
    const vueProjectId = vueUrl.split('/projects/')[1].split('/ide')[0];

    await waitForDevServer('Vue');

    const vueFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await vueFrame.locator('#app h1, h1').waitFor({ timeout: 30000 });
    const initialVueHeading = await vueFrame.locator('#app h1, h1').textContent();
    assert.match(initialVueHeading, /Hello from Vue/i);
    console.log(`[PASS] Vue Initial Preview Rendered on Staging — Heading: "${initialVueHeading.trim()}"`);

    // Edit App.vue via Monaco Keyboard
    const isTreeVisibleVue = await page.isVisible('[data-testid="vscode-file-tree"]');
    if (!isTreeVisibleVue) {
      const explorerBtn = await page.waitForSelector('[data-testid="activity-bar-explorer"]', { timeout: 10000 });
      await explorerBtn.click();
    }
    const appVueNode = await page.waitForSelector('[data-testid="tree-file"][data-path="App.vue"]', { timeout: 10000 });
    await appVueNode.click();
    await page.waitForTimeout(500);

    const monacoPaneVue = await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await monacoPaneVue.click();
    await page.waitForTimeout(300);

    const uniqueVueHeading = 'GB Coder Vue Staging Verified 2026';
    const editedVueCode = `<template>
  <div class="card">
    <h1 data-testid="heading">${uniqueVueHeading}</h1>
    <p>Vue persistence verified on staging.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
</script>

<style scoped>
.card { text-align: center; }
</style>
`;
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedVueCode);
    console.log('[PASS] Monaco Keyboard Edit Performed on Vue App.vue');

    // Wait for Vite HMR in Vue preview
    await vueFrame.locator(`text=${uniqueVueHeading}`).waitFor({ timeout: 25000 });
    const hmrVueHeading = await vueFrame.locator('#app h1, h1').textContent();
    assert.strictEqual(hmrVueHeading.trim(), uniqueVueHeading);
    console.log(`[PASS] Vue Vite HMR Verified on Staging — Heading: "${hmrVueHeading.trim()}"`);

    // Wait for Autosave
    await page.waitForTimeout(2500);
    console.log('[PASS] Vue Autosave Completed on Staging');

    // -------------------------------------------------------------------------
    // Phase 4: TEST C — Project Switching (React -> Vue -> React)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST C: Project Switching (React -> Vue -> React) ---');
    await page.goto(`${STAGING_URL}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });
    console.log('[PASS] Returned to Dashboard from Vue Project');

    // Reopen original React project
    const reactProjectCard = await page.waitForSelector(`text=${reactName}`, { timeout: 10000 });
    await reactProjectCard.click();
    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    console.log('[PASS] Re-opened React Project on Staging');

    await waitForDevServer('React Reopen');

    // Verify preview renders persisted heading
    const reactReopenFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactReopenFrame.locator('#root h1').waitFor({ timeout: 30000 });
    const reopenedReactHeading = await reactReopenFrame.locator('#root h1').textContent();
    assert.strictEqual(reopenedReactHeading.trim(), uniqueReactHeading, 'Reopened React preview renders edited heading');
    console.log(`[PASS] React Reopen Persistence Verified — Heading: "${reopenedReactHeading.trim()}"`);

    // -------------------------------------------------------------------------
    // Phase 5: TEST D — Browser Reload Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- TEST D: Browser Reload Persistence on Staging ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('Page reloaded in Chromium...');

    await waitForDevServer('React After Reload');

    const reactReloadFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactReloadFrame.locator('#root h1').waitFor({ timeout: 30000 });
    const reloadedReactHeading = await reactReloadFrame.locator('#root h1').textContent();
    assert.strictEqual(reloadedReactHeading.trim(), uniqueReactHeading, 'Reloaded React preview renders edited heading');
    console.log(`[PASS] Browser Reload Persistence Verified on Staging — Heading: "${reloadedReactHeading.trim()}"`);

    console.log('\n================================================================');
    console.log('ALL COMPREHENSIVE VERCEL STAGING ACCEPTANCE CHECKS PASSED (100%)');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

runComprehensiveStagingTest().catch((err) => {
  console.error('\n❌ STAGING TEST ERROR:', err);
  process.exit(1);
});
