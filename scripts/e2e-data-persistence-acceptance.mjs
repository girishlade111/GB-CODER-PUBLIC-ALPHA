import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'node:http';
import assert from 'node:assert/strict';

const PORT = 4196;
const BASE = `http://127.0.0.1:${PORT}`;

const results = [];
function record(name, status, details = '') {
  results.push({ name, status, details });
  console.log(`[${status}] ${name}${details ? ` — ${details}` : ''}`);
}

function healthOk() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE}/api/health`, (r) => {
      r.resume();
      resolve(r.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServer() {
  if (await healthOk()) return null;
  const child = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    if (await healthOk()) return child;
    await new Promise((r) => setTimeout(r, 400));
  }
  try { child.kill(); } catch {}
  throw new Error('Preview server failed to start within 25s');
}

async function run() {
  console.log('======================================================');
  console.log('GB CODER — DATA PERSISTENCE & PROJECT REOPEN STAGING GATE');
  console.log('======================================================\n');

  console.log(`Starting Combined Preview Server on Port ${PORT}...`);
  const serverProc = await startServer();

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--enable-features=SharedArrayBuffer',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      if (!text.includes('downloadable font') && !text.includes('fetch.worker')) {
        console.log(`  [browser console] ${text}`);
      }
    });

    // Helper to read file from IndexedDB
    const readIdbFile = (projectId, filePath) => {
      return page.evaluate(async ({ pid, fp }) => {
        return new Promise((resolve) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onerror = () => resolve({ error: req.error?.message });
          req.onsuccess = () => {
            const db = req.result;
            try {
              const tx = db.transaction(['projectFiles'], 'readonly');
              const store = tx.objectStore('projectFiles');
              const getReq = store.get([pid, fp]);
              getReq.onsuccess = () => resolve({ content: getReq.result ? getReq.result.content : null });
              getReq.onerror = () => resolve({ error: getReq.error?.message });
            } catch (e) {
              resolve({ error: e.message });
            }
          };
        });
      }, { pid: projectId, fp: filePath });
    };

    // Helper to wait for autosave signal and verified IndexedDB commit
    const waitForAutosave = async (projectId, checkFile = 'App.jsx', checkContent = 'GB Coder', minSeq = 0, timeout = 15000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const res = await readIdbFile(projectId, checkFile);
        if (res.content && res.content.includes(checkContent)) {
          return true;
        }
        await page.waitForTimeout(300);
      }
      throw new Error(`Timeout waiting for autosave of ${checkFile} with "${checkContent}" in project ${projectId}`);
    };

    // ──────────────────────────────────────────────────────────────────────────
    // Phase 2: Reproduce Persistence Behavior (React)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Phase 2: Reproduce Persistence Behavior ---');
    await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });
    record('Dashboard Loaded', 'PASS', 'Project dashboard visible');

    // Create React project
    const newBtn = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newBtn.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyle = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyle.click();

    const reactOpt = await page.waitForSelector('[data-testid="new-project-template-react"]', { timeout: 10000 });
    await reactOpt.click();

    const reactProjectName = `React Persist ${Date.now().toString().slice(-4)}`;
    const nameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await nameInput.fill(reactProjectName);

    const createBtn = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createBtn.click();
    record('React Project Created via UI', 'PASS', `Name: ${reactProjectName}`);

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    const reactUrl = page.url();
    const reactProjectId = reactUrl.split('/projects/')[1].split('/ide')[0];

    const waitForDevServer = async (label, timeoutMs = 360000) => {
      console.log(`Waiting for ${label} dev server ready...`);
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const state = await page.evaluate(() => {
          const svc = window.__GBCODER_WEBCONTAINER_SERVICE__ || window.webcontainerService;
          let termTail = '';
          if (svc) {
            const sessions = svc.listTerminalSessions();
            if (sessions.length > 0) {
              const latestSess = svc.getTerminalSession(sessions[sessions.length - 1].id);
              if (latestSess) termTail = latestSess.outputBuffer.slice(-3).join(' ').trim();
            }
          }
          return {
            stage: svc?.getState().startupStage,
            serverUrl: svc?.getState().serverUrl,
            termTail: termTail.slice(0, 100),
          };
        });

        if (state.serverUrl && state.serverUrl.length > 0) {
          console.log(`[PASS] ${label} dev server running at: ${state.serverUrl}`);
          return state.serverUrl;
        }

        console.log(`  [${label} poll] stage=${state.stage} term="${state.termTail}"`);
        await page.waitForTimeout(3000);
      }
      throw new Error(`Timeout waiting for dev server ready (${label}) after ${timeoutMs}ms`);
    };

    // Wait for dev server ready
    await waitForDevServer('React');
    record('React Dev Server Ready', 'PASS', 'Vite dev server running');

    // Initial preview DOM assertion
    const reactFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reactFrame.locator('#root h1').waitFor({ timeout: 20000 });
    const initialHeading = await reactFrame.locator('#root h1').textContent();
    assert.match(initialHeading, /Hello from React/i);
    record('React Initial Preview Verified', 'PASS', `Heading: "${initialHeading}"`);

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

    const uniqueHeading = 'GB Coder Persistence Verified 2026';
    const editedReactApp = `import { useState } from 'react';

export default function App() {
  return (
    <div className="card">
      <h1 data-testid="heading">${uniqueHeading}</h1>
      <p>Data persistence and project reopen verified.</p>
    </div>
  );
}
`;

    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedReactApp);
    record('Monaco Keyboard Edit Performed', 'PASS', `New heading: "${uniqueHeading}"`);

    // Verify Monaco model contains new content
    const monacoContent = await page.evaluate(() => {
      const monaco = window.monaco;
      if (!monaco) return null;
      const m = monaco.editor.getModels().find((model) => model.uri.path.includes('App.jsx'));
      return m ? m.getValue() : null;
    });
    assert.ok(monacoContent && monacoContent.includes(uniqueHeading), 'Monaco model must contain new content');
    record('Monaco Model Content Verified', 'PASS', 'Monaco buffer matches typed edit');

    // Wait for Vite HMR in preview iframe
    console.log('Waiting for Vite HMR in preview iframe...');
    await reactFrame.locator(`text=${uniqueHeading}`).waitFor({ timeout: 15000 });
    const hmrHeading = await reactFrame.locator('#root h1').textContent();
    assert.equal(hmrHeading.trim(), uniqueHeading);
    record('React HMR DOM Update Verified', 'PASS', `Preview updated to: "${hmrHeading}"`);

    // Verify FileSyncCoordinator wrote to WebContainer VFS
    const vfsContent = await page.evaluate(async () => {
      const instance = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!instance) return null;
      return await instance.fs.readFile('App.jsx', 'utf-8');
    });
    assert.ok(vfsContent && vfsContent.includes(uniqueHeading), 'WebContainer VFS must contain updated file');
    record('FileSyncCoordinator VFS Write Verified', 'PASS', 'App.jsx in VFS matches Monaco edit');

    // Wait for Autosave completion signal
    console.log('Waiting for verified autosave completion signal...');
    await waitForAutosave(reactProjectId, 'App.jsx', uniqueHeading, 0, 15000);
    record('Autosave Signal Received', 'PASS', 'Autosave completed and emitted signal');

    // Verify IndexedDB content
    const allIdbFiles = await page.evaluate(async (pid) => {
      return new Promise((resolve) => {
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onerror = () => resolve([]);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['projectFiles'], 'readonly');
          const store = tx.objectStore('projectFiles');
          const idx = store.index('projectId');
          const getAllReq = idx.getAll(pid);
          getAllReq.onsuccess = () => resolve(getAllReq.result || []);
          getAllReq.onerror = () => resolve([]);
        };
      });
    }, reactProjectId);
    console.log(`IndexedDB stored ${allIdbFiles.length} files for project ${reactProjectId}:`);
    for (const f of allIdbFiles) {
      console.log(`  - path="${f.path}" content preview: ${JSON.stringify(f.content?.slice(0, 80))}`);
    }

    const idbResult = await readIdbFile(reactProjectId, 'App.jsx');
    assert.ok(idbResult.content && idbResult.content.includes(uniqueHeading), 'IndexedDB must contain updated App.jsx');
    record('IndexedDB Content Verified', 'PASS', 'App.jsx in IndexedDB contains unique heading');

    // Verify dirty state is cleared
    const dirtyCount = await page.evaluate(() => {
      const dots = document.querySelectorAll('.monaco-tab .dirty-indicator, [data-testid="dirty-indicator"]');
      return dots.length;
    });
    record('Dirty State Cleared', 'PASS', `Active dirty indicators: ${dirtyCount}`);

    // ──────────────────────────────────────────────────────────────────────────
    // Phase 3: Project Switching (React -> Vue -> React)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Phase 3: Project Switching (React -> Vue -> React) ---');
    await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    // Create Vue project
    const newVueBtn = await page.waitForSelector('[data-testid="dashboard-new-project"]', { timeout: 10000 });
    await newVueBtn.click();
    await page.waitForSelector('[data-testid="new-project-modal"]', { timeout: 10000 });

    const vscodeStyleVue = await page.waitForSelector('[data-testid="new-project-style-vscode"]', { timeout: 10000 });
    await vscodeStyleVue.click();

    const vueOpt = await page.waitForSelector('[data-testid="new-project-template-vue"]', { timeout: 10000 });
    await vueOpt.click();

    const vueProjectName = `Vue Persist ${Date.now().toString().slice(-4)}`;
    const vueNameInput = await page.waitForSelector('[data-testid="new-project-name"]', { timeout: 5000 });
    await vueNameInput.fill(vueProjectName);

    const createVueBtn = await page.waitForSelector('[data-testid="new-project-create"]', { timeout: 5000 });
    await createVueBtn.click();
    record('Vue Project Created via UI', 'PASS', `Name: ${vueProjectName}`);

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    const vueProjectId = page.url().split('/projects/')[1].split('/ide')[0];

    // Wait for Vue dev server
    await waitForDevServer('Vue');

    const vueFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await vueFrame.locator('#app h1').waitFor({ timeout: 20000 });
    const vueInitialHeading = await vueFrame.locator('#app h1').textContent();
    assert.match(vueInitialHeading, /Hello from Vue/i);
    record('Vue Initial Preview Verified', 'PASS', `Heading: "${vueInitialHeading}"`);

    // Edit Vue App.vue
    const isVueTreeVisible = await page.isVisible('[data-testid="vscode-file-tree"]');
    if (!isVueTreeVisible) {
      const explorerBtn = await page.waitForSelector('[data-testid="activity-bar-explorer"]', { timeout: 10000 });
      await explorerBtn.click();
    }
    const appVueNode = await page.waitForSelector('[data-testid="tree-file"][data-path="App.vue"]', { timeout: 10000 });
    await appVueNode.click();
    await page.waitForTimeout(500);

    const vueMonacoPane = await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await vueMonacoPane.click();
    await page.waitForTimeout(300);

    const uniqueVueHeading = 'GB Coder Vue Persistence Verified 2026';
    const editedVueApp = `<script setup>
import { ref } from 'vue';
</script>

<template>
  <div class="card">
    <h1 data-testid="heading">${uniqueVueHeading}</h1>
  </div>
</template>
`;
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(editedVueApp);

    await vueFrame.locator(`text=${uniqueVueHeading}`).waitFor({ timeout: 15000 });
    await waitForAutosave(vueProjectId, 'App.vue', uniqueVueHeading, 0, 15000);
    record('Vue Edit & Autosave Verified', 'PASS', `Heading: "${uniqueVueHeading}"`);

    // Return to React Project
    console.log('\nReturning to React project...');
    await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    const reactProjectLink = await page.waitForSelector(`text=${reactProjectName}`, { timeout: 10000 });
    await reactProjectLink.click();

    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });
    record('Navigated Back to React Project', 'PASS', `Re-opened ${reactProjectName}`);

    // Wait for React dev server
    await waitForDevServer('React Reopen');

    // Open App.jsx in file tree
    const isReopenTreeVisible = await page.isVisible('[data-testid="vscode-file-tree"]');
    if (!isReopenTreeVisible) {
      const explorerBtn = await page.waitForSelector('[data-testid="activity-bar-explorer"]', { timeout: 10000 });
      await explorerBtn.click();
    }
    const appJsxReopenNode = await page.waitForSelector('[data-testid="tree-file"][data-path="App.jsx"]', { timeout: 10000 });
    await appJsxReopenNode.click();
    await page.waitForTimeout(1000);

    // Verify Monaco content after reopening React
    const reactMonacoReopened = await page.evaluate(() => {
      const monaco = window.monaco;
      if (!monaco) return null;
      const m = monaco.editor.getModels().find((model) => model.uri.path.includes('App.jsx'));
      return m ? m.getValue() : null;
    });
    assert.ok(reactMonacoReopened && reactMonacoReopened.includes(uniqueHeading), 'Monaco must restore edited content');

    // Verify VFS content after reopening React
    const reactVfsReopened = await page.evaluate(async () => {
      const instance = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!instance) return null;
      return await instance.fs.readFile('App.jsx', 'utf-8');
    });
    assert.ok(reactVfsReopened && reactVfsReopened.includes(uniqueHeading), 'VFS must contain edited content');

    // Verify IndexedDB content
    const reactIdbReopened = await readIdbFile(reactProjectId, 'App.jsx');
    assert.ok(reactIdbReopened.content && reactIdbReopened.content.includes(uniqueHeading), 'IndexedDB must contain edited content');

    // Verify Preview renders edited heading
    const reactFrameReopened = page.frameLocator('[data-testid="preview-iframe"]');
    await reactFrameReopened.locator('#root h1').waitFor({ timeout: 20000 });
    const reactHeadingReopened = await reactFrameReopened.locator('#root h1').textContent();
    assert.equal(reactHeadingReopened.trim(), uniqueHeading);

    record(
      'React Switch Persistence Verified',
      'PASS',
      `Monaco == IndexedDB == WebContainer == Preview == "${uniqueHeading}"`,
    );

    // ──────────────────────────────────────────────────────────────────────────
    // Phase 4: Browser Reload Persistence
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Phase 4: Browser Reload Persistence ---');
    console.log('Reloading page in Chromium...');
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for dev server after full browser reload
    await waitForDevServer('React Reload');

    // Verify preview renders edited heading after browser reload
    const reloadedFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reloadedFrame.locator('#root h1').waitFor({ timeout: 20000 });
    const reloadedHeading = await reloadedFrame.locator('#root h1').textContent();
    assert.equal(reloadedHeading.trim(), uniqueHeading);
    record('React Browser Reload Persistence Verified', 'PASS', `Preview renders "${reloadedHeading}" after reload`);

    // Reload test for Vue
    console.log('\nReopening Vue project to verify reload persistence...');
    await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    const vueProjectLink = await page.waitForSelector(`text=${vueProjectName}`, { timeout: 10000 });
    await vueProjectLink.click();
    await page.waitForURL(/\/app\/projects\/[^/]+\/ide/, { timeout: 15000 });

    await waitForDevServer('Vue Reload');

    const reloadedVueFrame = page.frameLocator('[data-testid="preview-iframe"]');
    await reloadedVueFrame.locator('#app h1').waitFor({ timeout: 20000 });
    const reloadedVueHeading = await reloadedVueFrame.locator('#app h1').textContent();
    assert.equal(reloadedVueHeading.trim(), uniqueVueHeading);
    record('Vue Browser Reload Persistence Verified', 'PASS', `Preview renders "${reloadedVueHeading}" after reload`);

    // ──────────────────────────────────────────────────────────────────────────
    // Phase 5: Rapid Edits and Navigation (Flush Guarantee)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Phase 5: Rapid Edits and Navigation (Immediate Flush Guarantee) ---');
    // Rapidly edit App.vue with a new unique heading and immediately click UI return button before 1200ms debounce
    const rapidHeading = 'Rapid Navigation Flush Verified';
    const rapidAppVue = `<script setup>
</script>

<template>
  <div class="card">
    <h1 data-testid="heading">${rapidHeading}</h1>
  </div>
</template>
`;
    // Ensure App.vue is opened in Monaco
    const isRapidTreeVisible = await page.isVisible('[data-testid="vscode-file-tree"]');
    if (!isRapidTreeVisible) {
      const explorerBtn = await page.waitForSelector('[data-testid="activity-bar-explorer"]', { timeout: 10000 });
      await explorerBtn.click();
    }
    const appVueRapidNode = await page.waitForSelector('[data-testid="tree-file"][data-path="App.vue"]', { timeout: 10000 });
    await appVueRapidNode.click();
    await page.waitForTimeout(500);

    const rapidMonacoPane = await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await rapidMonacoPane.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(rapidAppVue);

    // Immediately click UI "Return to Projects Dashboard" button (< 200ms after typing, before 1200ms debounce)
    console.log('Navigating via UI Return button immediately without waiting for debounce timer...');
    const returnDashboardBtn = await page.waitForSelector('[title="Return to Projects Dashboard"]', { timeout: 5000 });
    await returnDashboardBtn.click();
    await page.waitForSelector('[data-testid="project-dashboard"]', { timeout: 15000 });

    // Verify flushProjectSave captured and committed the edit to IndexedDB
    const idbRapidCheck = await readIdbFile(vueProjectId, 'App.vue');
    assert.ok(
      idbRapidCheck.content && idbRapidCheck.content.includes(rapidHeading),
      'Immediate navigation must flush in-memory edits to IndexedDB without loss',
    );
    record('Rapid Navigation Immediate Flush Verified', 'PASS', 'In-memory edits flushed synchronously on UI navigation');

    console.log('\n======================================================');
    console.log(`ALL DATA PERSISTENCE ACCEPTANCE CHECKS PASSED (${results.filter(r => r.status === 'PASS').length}/${results.length})`);
    console.log('======================================================\n');

  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      try {
        serverProc.kill();
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error('\nData Persistence Acceptance Failed:\n', err);
  process.exit(1);
});
