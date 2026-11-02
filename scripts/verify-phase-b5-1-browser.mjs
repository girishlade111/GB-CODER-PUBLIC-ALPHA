import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createPreviewServer } from './preview-combined.mjs';
import { observeRuntime } from './helpers/b4-runtime-observer.mjs';
import { seedProjects } from './helpers/b4-fixtures.mjs';

const PORT = 42996; // Expected by b4-runtime-observer
const BASE_URL = `http://127.0.0.1:${PORT}`;
const EVIDENCE_FILE = 'reports/b5-1-browser-acceptance.json';

// Load locked synthetic React fixture from Phase B.4.4 fixtures
const fixturesPath = path.resolve('scripts/.tmp-b4-4/fixtures.json');
const fixturesRaw = JSON.parse(await fs.readFile(fixturesPath, 'utf8'));
const reactFixture = fixturesRaw.react;

// Prepare initial files with B5_1_REACT_INITIAL marker
const initialFiles = Object.entries(reactFixture.files).map(([filePath, content]) => {
  if (filePath === 'src/main.js') {
    return {
      path: filePath,
      content: `import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('app')).render(React.createElement('h1', { id: 'marker' }, 'B5_1_REACT_INITIAL'));\n`,
    };
  }
  return { path: filePath, content };
});

const REACT_PROJECT = {
  id: 'b5-1-react-proj',
  name: 'B5.1 React Synthetic',
  editorStyle: 'vscode',
  projectType: 'react',
  files: initialFiles,
};

const results = {
  startedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    port: PORT,
  },
  budget: {
    maxBoots: 2,
    maxRestarts: 2,
    actualBoots: 0,
    actualRestarts: 0,
  },
  steps: [],
  verdict: 'PENDING',
};

function logStep(name, details = {}) {
  const entry = { step: name, timestamp: Date.now(), ...details };
  results.steps.push(entry);
  console.log(`[B5.1 Browser] ${name}`, details);
}

let server;
let browser;
let context;

try {
  logStep('Starting preview server', { port: PORT });
  server = createPreviewServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', resolve);
  });

  logStep('Launching headless chromium');
  browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer'],
  });
  results.browserVersion = browser.version();

  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(observeRuntime);
  await context.addInitScript(() => {
    localStorage.setItem('gbcoder_onboarded', 'true');
    localStorage.setItem('gbcoder_welcome_dismissed', 'true');
  });

  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message.slice(0, 500), at: Date.now() });
  });

  // Step 1: Seed synthetic project into IndexedDB
  logStep('Navigating to dashboard and seeding synthetic project');
  await page.goto(`${BASE_URL}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });
  await seedProjects(page, [REACT_PROJECT]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

  // Step 2: Open project in VSCode Mode
  logStep('Opening synthetic project in VSCode Mode');
  await page.getByText(REACT_PROJECT.name, { exact: true }).click({ timeout: 10000 });
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 15000 });

  // Step 3: Wait for initial startup and Preview DOM readiness
  logStep('Waiting for initial WebContainer startup and Preview DOM (B5_1_REACT_INITIAL)');
  const startWait = Date.now();
  const maxWait = 180000; // 180 seconds budget
  let initialRendered = false;

  while (Date.now() - startWait < maxWait) {
    if (pageErrors.length > 0) {
      throw new Error(`Uncaught page error during initial startup: ${pageErrors[0].message}`);
    }

    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 200 }).catch(() => null);
        if (text === 'B5_1_REACT_INITIAL') {
          initialRendered = true;
          break;
        }
      }
    }
    if (initialRendered) break;
    await page.waitForTimeout(500);
  }

  if (!initialRendered) {
    const term = await page.locator('.xterm-rows').first().innerText({ timeout: 1000 }).catch(() => 'no term');
    console.error('Terminal snapshot on timeout:\n', term);
  }
  assert.ok(initialRendered, 'Initial React preview failed to render B5_1_REACT_INITIAL within budget');
  const initialDurationMs = Date.now() - startWait;
  results.budget.actualBoots++;
  logStep('Initial Preview DOM rendered successfully', { durationMs: initialDurationMs });

  // Inspect runtime diagnostic snapshot after initial startup
  const initialDiag = await page.evaluate(() => globalThis.__runtimeDiagnostic);
  const initialMountEvents = (initialDiag?.events || []).filter((e) => e.type === 'mount_invoked');
  const initialBootEvents = (initialDiag?.events || []).filter((e) => e.type === 'boot_completed');
  logStep('Initial mount diagnostics captured', {
    mountCount: initialMountEvents.length,
    bootCount: initialBootEvents.length,
  });
  assert.equal(initialMountEvents.length, 1, 'Initial startup must execute exactly 1 filesystem mount');
  assert.equal(initialBootEvents.length, 1, 'Initial startup must execute exactly 1 WebContainer boot');

  // Step 4: Perform intentional synthetic edit to src/main.js
  logStep('Performing intentional synthetic edit in editor (B5_1_REACT_EDITED)');
  await page.locator('[data-testid="tree-file"][data-path="src/main.js"]').click();
  await page.locator('.monaco-editor').first().waitFor({ timeout: 15000 });
  await page.evaluate(() => {
    const ta = document.querySelector('.monaco-editor textarea');
    if (ta) ta.focus();
  });
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(
    `import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('app')).render(React.createElement('h1', { id: 'marker' }, 'B5_1_REACT_EDITED'));\n`,
    { delay: 1 }
  );
  await page.waitForTimeout(1000); // Allow Monaco/fileSync to register change

  // Step 5: Trigger Restart Dev Server UI action
  logStep('Triggering Restart Dev Server via toolbar action');
  const restartButton = page.locator('button[aria-label="New Terminal / Restart"]');
  await restartButton.waitFor({ timeout: 5000 });

  const restartClickAt = Date.now();
  await restartButton.click();
  results.budget.actualRestarts++;

  // Step 6: Wait for restarted preview DOM to render updated marker
  logStep('Waiting for restarted Preview DOM to reflect edited marker (B5_1_REACT_EDITED)');
  let restartRendered = false;
  const restartDeadline = Date.now() + 60000; // 60 seconds budget for restart

  while (Date.now() < restartDeadline) {
    if (pageErrors.length > 0) {
      throw new Error(`Uncaught page error during restart: ${pageErrors[0].message}`);
    }

    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 200 }).catch(() => null);
        if (text === 'B5_1_REACT_EDITED') {
          restartRendered = true;
          break;
        }
      }
    }
    if (restartRendered) break;
    await page.waitForTimeout(300);
  }

  assert.ok(restartRendered, 'Restarted preview failed to render B5_1_REACT_EDITED');
  const restartDurationMs = Date.now() - restartClickAt;
  logStep('Restarted Preview DOM rendered successfully', { durationMs: restartDurationMs });

  // Step 7: Verify Mount Count Invariant (Critical optimization proof!)
  const postRestartDiag = await page.evaluate(() => globalThis.__runtimeDiagnostic);
  const totalMountEvents = (postRestartDiag?.events || []).filter((e) => e.type === 'mount_invoked');
  const restartMountEvents = (postRestartDiag?.events || []).filter(
    (e) => e.type === 'mount_invoked' && e.at >= restartClickAt - 200,
  );
  const totalBootEvents = (postRestartDiag?.events || []).filter((e) => e.type === 'boot_completed');

  logStep('Mount count analysis after restart', {
    totalMounts: totalMountEvents.length,
    mountsDuringRestart: restartMountEvents.length,
    totalBoots: totalBootEvents.length,
  });

  // Proof of optimization:
  // Before fix: total mounts = 3 (1 initial + 2 restart)
  // After fix: total mounts = 2 (1 initial + 1 restart)
  assert.equal(totalMountEvents.length, 2, 'Total mounts must be exactly 2 (1 initial + 1 restart)');
  assert.equal(restartMountEvents.length, 1, 'Restart dev server must execute exactly 1 mount in the eligible path');
  assert.equal(totalBootEvents.length, 1, 'Restart dev server must NOT reboot WebContainer instance');

  // Step 8: Verify terminal remains interactive
  logStep('Verifying terminal interactivity');
  const termRows = await page.locator('.xterm-rows').first().innerText({ timeout: 5000 });
  assert.ok(termRows.length > 0, 'Terminal rows must be visible and populated');
  assert.ok(!termRows.includes('Mount aborted'), 'Terminal must not report aborted mounts');

  // Step 9: Verify IndexedDB persistence
  logStep('Verifying IndexedDB storage integrity');
  const storedFiles = await page.evaluate((pid) => new Promise((resolve, reject) => {
    const req = indexedDB.open('gb-coder-projects-db', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('projectFiles', 'readonly');
      const store = tx.objectStore('projectFiles');
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result.filter((f) => f.projectId === pid));
      getAll.onerror = () => reject(getAll.error);
      tx.oncomplete = () => db.close();
    };
  }), REACT_PROJECT.id);

  const mainFile = storedFiles.find((f) => f.path === 'src/main.js');
  assert.ok(mainFile, 'src/main.js must exist in IndexedDB');
  assert.ok(mainFile.content.includes('B5_1_REACT_EDITED'), 'IndexedDB must contain authoritative edited content');

  results.verdict = 'B5_1_LOCAL_ACCEPTED';
  logStep('All Phase B.5.1 browser acceptance criteria successfully satisfied');

} catch (error) {
  results.verdict = 'B5_1_BROWSER_REJECTED';
  results.error = {
    message: error.message,
    stack: error.stack,
  };
  console.error('[B5.1 Browser Error]', error);
} finally {
  results.completedAt = new Date().toISOString();
  await fs.writeFile(EVIDENCE_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[B5.1 Browser] Evidence saved to ${EVIDENCE_FILE}`);

  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  if (server) await new Promise((r) => server.close(r)).catch(() => {});
}

process.exitCode = results.verdict === 'B5_1_LOCAL_ACCEPTED' ? 0 : 1;
