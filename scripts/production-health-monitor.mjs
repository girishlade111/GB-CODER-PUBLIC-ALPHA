/**
 * GB Coder — Automated Production Reliability Health Monitor
 * 
 * Executes non-destructive health checks against production (https://code.ladestack.in):
 * 1. HTTP Status & Security Header Verification (COOP, COEP, HTTPS)
 * 2. Marketing Route & Static Asset Availability
 * 3. Real WebContainer Chromium Runtime Verification:
 *    - Cross-Origin Isolation & SharedArrayBuffer
 *    - React + Vite Dev Server & Native HMR via Monaco
 *    - Vue + Vite Dev Server & Native HMR via Monaco
 *    - Multi-Project Switching & Isolation
 *    - IndexedDB Autosave & Reload Persistence
 * 4. Diagnostics & Failure Artifact Capture
 */

import { chromium } from 'playwright';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_URL = (process.argv[2] || process.env.TARGET_URL || 'https://code.ladestack.in').replace(/\/+$/, '');
const BYPASS_SECRET = process.env.VERCEL_PROTECTION_BYPASS || '';
const DIAGNOSTICS_DIR = path.resolve(process.cwd(), 'diagnostics');

const report = {
  timestamp: new Date().toISOString(),
  targetUrl: TARGET_URL,
  status: 'PENDING',
  browserVersion: null,
  durationMs: 0,
  phases: {},
  consoleLogs: [],
  consoleErrors: [],
  failures: [],
};

function ensureDiagnosticsDir() {
  if (!fs.existsSync(DIAGNOSTICS_DIR)) {
    fs.mkdirSync(DIAGNOSTICS_DIR, { recursive: true });
  }
}

function recordPhase(name, status, details = {}) {
  report.phases[name] = {
    status,
    timestamp: new Date().toISOString(),
    ...details,
  };
  const marker = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${marker} [${name}] — ${status}: ${details.message || ''}`);
}

async function verifyHttpEndpoints() {
  console.log('\n--- Phase 1: HTTP Status, Isolation & Route Availability ---');

  // 1. Root & Marketing Routes
  const routesToCheck = [
    { path: '/', label: 'Homepage' },
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/docs', label: 'Documentation' },
    { path: '/blog', label: 'Blog' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-and-conditions', label: 'Terms and Conditions' },
  ];

  for (const route of routesToCheck) {
    const url = `${TARGET_URL}${route.path}`;
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'GBCoder-HealthMonitor/1.0' } });
    if (!res.ok) {
      throw new Error(`Route ${route.label} (${url}) returned HTTP ${res.status}`);
    }
  }
  recordPhase('HTTP Marketing Routes', 'PASS', { message: '8/8 public marketing routes responded HTTP 200' });

  // 2. Application Route & Security Headers (/app/projects)
  const appUrl = `${TARGET_URL}/app/projects`;
  const appRes = await fetch(appUrl, { method: 'GET', headers: { 'User-Agent': 'GBCoder-HealthMonitor/1.0' } });
  if (!appRes.ok) {
    throw new Error(`Application route ${appUrl} returned HTTP ${appRes.status}`);
  }

  const coop = appRes.headers.get('cross-origin-opener-policy');
  const coep = appRes.headers.get('cross-origin-embedder-policy');

  assert.strictEqual(coop, 'same-origin', `Expected COOP "same-origin", received "${coop}"`);
  assert.strictEqual(coep, 'require-corp', `Expected COEP "require-corp", received "${coep}"`);

  recordPhase('Security Headers', 'PASS', {
    message: 'COOP: same-origin & COEP: require-corp verified on /app/projects',
    headers: { coop, coep },
  });
}

async function runChromiumWebContainerChecks() {
  console.log('\n--- Phase 2: Real WebContainer Chromium Automation ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--disable-dev-shm-usage'],
  });

  report.browserVersion = browser.version();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Route headers if bypass secret is provided for preview deployments
  if (BYPASS_SECRET) {
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
  }

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    report.consoleLogs.push({ type, text, time: new Date().toISOString() });
    if (type === 'error') {
      report.consoleErrors.push({ text, location: msg.location() });
    }
    if (text.includes('[vite]') || text.includes('Contextify') || text.includes('GB Coder')) {
      console.log('  [browser console]', text);
    }
  });

  try {
    // 1. Dashboard & Browser Context Isolation
    console.log(`Navigating to ${TARGET_URL}/app/projects...`);
    await page.goto(`${TARGET_URL}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 20000 });

    const isolation = await page.evaluate(() => ({
      isSecureContext: window.isSecureContext,
      crossOriginIsolated: window.crossOriginIsolated,
      hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    }));

    assert.strictEqual(isolation.isSecureContext, true, 'Page must be in secure context');
    assert.strictEqual(isolation.crossOriginIsolated, true, 'Page must be cross-origin isolated');
    assert.strictEqual(isolation.hasSharedArrayBuffer, true, 'SharedArrayBuffer must be available');
    recordPhase('Browser Context Isolation', 'PASS', { isolation });

    // Helper: Wait for dev server readiness
    const waitForDevServer = async (label, timeoutMs = 360000) => {
      console.log(`Waiting for ${label} dev server readiness...`);
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const state = await page.evaluate(() => {
          const svc = window.__GBCODER_WEBCONTAINER_SERVICE__ || window.webcontainerService;
          return {
            stage: svc?.getState().startupStage,
            serverUrl: svc?.getState().serverUrl,
          };
        });
        if (state.serverUrl) {
          console.log(`  [dev-server] ${label} ready at: ${state.serverUrl}`);
          return state.serverUrl;
        }
        await page.waitForTimeout(2000);
      }
      throw new Error(`Timeout waiting for ${label} dev server to become ready`);
    };

    // 2. Test A: React + Vite Lifecycle
    console.log('\n--- Step 2A: React + Vite Lifecycle Check ---');
    const newBtn = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newBtn.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyle = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyle.click();

    const reactOpt = await page.waitForSelector('[data-testid="new-project-template-react"]', { timeout: 10000 });
    await reactOpt.click();

    const reactName = `Health React ${Date.now().toString().slice(-4)}`;
    const nameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await nameInput.fill(reactName);

    const createBtn = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createBtn.click();

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 35000, waitUntil: 'domcontentloaded' });
    const reactServerUrl = await waitForDevServer('React');

    const reactFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactFrame.locator('#root h1').waitFor({ timeout: 35000 });
    const initialReactHeading = await reactFrame.locator('#root h1').textContent();
    assert.match(initialReactHeading, /Hello from React/i);

    // Monaco Keyboard Edit
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

    const uniqueReactHeading = `GB Coder Production Monitor React ${Date.now().toString().slice(-4)}`;
    const editedReactCode = `import { useState } from 'react';

export default function App() {
  return (
    <div className="card">
      <h1 data-testid="heading">${uniqueReactHeading}</h1>
      <p>Production reliability monitor verified.</p>
    </div>
  );
}
`;
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedReactCode);

    // Wait for Vite HMR in preview iframe
    await reactFrame.locator(`text=${uniqueReactHeading}`).waitFor({ timeout: 30000 });
    const hmrReactHeading = await reactFrame.locator('#root h1').textContent();
    assert.strictEqual(hmrReactHeading.trim(), uniqueReactHeading);
    await page.waitForTimeout(2000); // Wait for debounced autosave

    recordPhase('React + Vite Lifecycle & HMR', 'PASS', {
      serverUrl: reactServerUrl,
      initialHeading: initialReactHeading.trim(),
      updatedHeading: hmrReactHeading.trim(),
    });

    // 3. Test B: Vue + Vite Lifecycle
    console.log('\n--- Step 2B: Vue + Vite Lifecycle Check ---');
    await page.goto(`${TARGET_URL}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    const newBtnVue = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newBtnVue.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyleVue = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyleVue.click();

    const vueOpt = await page.waitForSelector('[data-testid="new-project-template-vue"]', { timeout: 10000 });
    await vueOpt.click();

    const vueName = `Health Vue ${Date.now().toString().slice(-4)}`;
    const vueNameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await vueNameInput.fill(vueName);

    const createBtnVue = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createBtnVue.click();

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 35000, waitUntil: 'domcontentloaded' });
    const vueServerUrl = await waitForDevServer('Vue');

    const vueFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await vueFrame.locator('#app h1, h1').waitFor({ timeout: 35000 });
    const initialVueHeading = await vueFrame.locator('#app h1, h1').textContent();
    assert.match(initialVueHeading, /Hello from Vue/i);

    // Monaco Keyboard Edit on App.vue
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

    const uniqueVueHeading = `GB Coder Production Monitor Vue ${Date.now().toString().slice(-4)}`;
    const editedVueCode = `<template>
  <div class="card">
    <h1 data-testid="heading">${uniqueVueHeading}</h1>
    <p>Vue production health check verified.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
</script>
`;
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedVueCode);

    // Wait for Vite HMR in Vue preview
    await vueFrame.locator(`text=${uniqueVueHeading}`).waitFor({ timeout: 30000 });
    const hmrVueHeading = await vueFrame.locator('#app h1, h1').textContent();
    assert.strictEqual(hmrVueHeading.trim(), uniqueVueHeading);
    await page.waitForTimeout(2000); // Wait for debounced autosave

    recordPhase('Vue + Vite Lifecycle & HMR', 'PASS', {
      serverUrl: vueServerUrl,
      initialHeading: initialVueHeading.trim(),
      updatedHeading: hmrVueHeading.trim(),
    });

    // 4. Test C: Project Switching Persistence (React -> Vue -> React)
    console.log('\n--- Step 2C: Project Switching Persistence ---');
    await page.goto(`${TARGET_URL}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    const reactCard = await page.waitForSelector(`text=${reactName}`, { timeout: 10000 });
    await reactCard.click();
    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 35000, waitUntil: 'domcontentloaded' });

    await waitForDevServer('React Reopen');
    const reactReopenFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactReopenFrame.locator('#root h1').waitFor({ timeout: 35000 });
    const reopenedReactHeading = await reactReopenFrame.locator('#root h1').textContent();
    assert.strictEqual(reopenedReactHeading.trim(), uniqueReactHeading);

    recordPhase('Project Switching Persistence', 'PASS', {
      message: 'Reopened React project rendered edited heading from IndexedDB after Vue switch',
      reopenedHeading: reopenedReactHeading.trim(),
    });

    // 5. Test D: Browser Hard Reload Persistence
    console.log('\n--- Step 2D: Browser Reload Persistence ---');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForDevServer('React Reload');

    const reactReloadFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactReloadFrame.locator('#root h1').waitFor({ timeout: 35000 });
    const reloadedReactHeading = await reactReloadFrame.locator('#root h1').textContent();
    assert.strictEqual(reloadedReactHeading.trim(), uniqueReactHeading);

    recordPhase('Browser Reload Persistence', 'PASS', {
      message: 'Persisted heading survived full Chromium page reload',
      reloadedHeading: reloadedReactHeading.trim(),
    });

  } catch (err) {
    console.error('\n❌ CHROMIUM RUNTIME ERROR:', err);
    ensureDiagnosticsDir();
    try {
      await page.screenshot({ path: path.join(DIAGNOSTICS_DIR, 'failure-screenshot.png'), fullPage: true });
      console.log('Saved failure screenshot to diagnostics/failure-screenshot.png');
    } catch (screenshotErr) {
      console.error('Failed to capture failure screenshot:', screenshotErr.message);
    }
    throw err;
  } finally {
    await browser.close();
  }
}

function writeSummaryAndMarkdown() {
  ensureDiagnosticsDir();
  const summaryPath = path.join(DIAGNOSTICS_DIR, 'health-report.json');
  fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nDiagnostics report saved to: ${summaryPath}`);

  // Emit GitHub Step Summary if running in GitHub Actions
  const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummaryFile) {
    const markdown = [
      `# GB Coder Production Reliability Health Report`,
      `**Target**: \`${report.targetUrl}\`  `,
      `**Status**: \`${report.status}\`  `,
      `**Timestamp**: \`${report.timestamp}\`  `,
      `**Duration**: \`${(report.durationMs / 1000).toFixed(1)}s\`  `,
      `**Browser Version**: \`${report.browserVersion || 'N/A'}\`  `,
      ``,
      `## Verification Phases`,
      `| Phase | Status | Details |`,
      `| :--- | :--- | :--- |`,
      ...Object.entries(report.phases).map(([name, data]) => {
        const icon = data.status === 'PASS' ? '✅' : '❌';
        const msg = data.message || (data.headers ? JSON.stringify(data.headers) : 'OK');
        return `| ${name} | ${icon} **${data.status}** | ${msg} |`;
      }),
      ``,
    ];

    if (report.failures.length > 0) {
      markdown.push(`## Failures Encountered`);
      for (const fail of report.failures) {
        markdown.push(`- ❌ \`${fail}\``);
      }
      markdown.push(``);
    }

    try {
      fs.appendFileSync(stepSummaryFile, markdown.join('\n'), 'utf-8');
      console.log('Appended summary to GITHUB_STEP_SUMMARY');
    } catch (e) {
      console.error('Failed to write to GITHUB_STEP_SUMMARY:', e.message);
    }
  }
}

async function main() {
  const startTime = Date.now();
  console.log('================================================================');
  console.log('GB CODER — PRODUCTION RELIABILITY HEALTH MONITOR');
  console.log('Target:', TARGET_URL);
  console.log('Timestamp:', report.timestamp);
  console.log('================================================================');

  try {
    await verifyHttpEndpoints();
    await runChromiumWebContainerChecks();

    report.status = 'PASS';
    console.log('\n================================================================');
    console.log('ALL PRODUCTION RELIABILITY HEALTH CHECKS PASSED (100%)');
    console.log('================================================================');
  } catch (err) {
    report.status = 'FAIL';
    report.failures.push(err.message || String(err));
    console.error('\n❌ MONITORING FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    report.durationMs = Date.now() - startTime;
    writeSummaryAndMarkdown();
  }
}

main();
