import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = 'C:/Users/Girish Lade/.gemini/antigravity-ide/brain/c4bc647e-779e-4344-8097-d2d709c8f2fb';
const BASE_URL = process.env.TARGET_URL || 'http://localhost:4175';

async function run() {
  console.log(`Starting E2E Browser Reload Recovery Test against ${BASE_URL}...`);
  
  // Use persistent context directory to test storage across browser restart
  const userDataDir = path.join(ARTIFACT_DIR, 'scratch', 'test-user-data-dir');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1280, height: 800 },
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  const consoleLogs = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  console.log(`Navigating to ${BASE_URL}/ide...`);
  await page.goto(`${BASE_URL}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for IDE container to load
  await page.waitForTimeout(2000);

  // Seed project in IndexedDB to test full reload recovery
  console.log('Seeding project files in IndexedDB...');
  const seedResult = await page.evaluate(async () => {
    try {
      const dbRequest = indexedDB.open('gb-coder-projects-db', 1);
      const db = await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result);
        dbRequest.onerror = () => reject(dbRequest.error);
        dbRequest.onupgradeneeded = () => {
          const d = dbRequest.result;
          if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' });
          if (!d.objectStoreNames.contains('projectFiles')) {
            const fs = d.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] });
            fs.createIndex('projectId', 'projectId');
          }
        };
      });

      const projectId = 'e2e-restore-test-proj';
      const projectRecord = {
        id: projectId,
        name: 'Auto-Restored Fullstack App',
        createdAt: Date.now(),
        lastOpenedAt: Date.now(),
        editorStyle: 'vscode',
        projectType: 'react',
        entry: 'src/App.tsx',
        fileCount: 3,
      };

      const files = [
        { projectId, path: 'package.json', content: JSON.stringify({ name: 'restored-app', scripts: { dev: 'vite' }, dependencies: { react: '^18.0.0' } }), language: 'json' },
        { projectId, path: 'src/App.tsx', content: 'export default () => <h1>Recovery Content Verified</h1>;', language: 'typescript' },
        { projectId, path: 'src/main.tsx', content: 'import React from "react";', language: 'typescript' },
      ];

      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      tx.objectStore('projects').put(projectRecord);
      for (const f of files) {
        tx.objectStore('projectFiles').put(f);
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });

      // Write active project pointer in localStorage
      localStorage.setItem('gb-coder-active-project-id', projectId);
      // Write view state with src/App.tsx active
      localStorage.setItem('gb-coder-vscode-view', JSON.stringify({
        openPaths: ['package.json', 'src/App.tsx'],
        activePath: 'src/App.tsx',
      }));

      return { success: true, projectId };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });

  assert.equal(seedResult.success, true, `Project seed must succeed: ${seedResult.error}`);
  console.log('Project successfully seeded in IndexedDB.');

  // Reload the IDE page to test automatic reload restoration
  console.log('Triggering full browser page reload (F5)...');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Screenshot after reload
  const reloadScreenshotPath = path.join(ARTIFACT_DIR, 'project_restored_after_reload.png');
  await page.screenshot({ path: reloadScreenshotPath, fullPage: true });
  console.log(`Saved reload screenshot to ${reloadScreenshotPath}`);

  // Verify that the project was restored from IndexedDB
  const restoredState = await page.evaluate(async () => {
    const activeId = localStorage.getItem('gb-coder-active-project-id');
    const viewState = JSON.parse(localStorage.getItem('gb-coder-vscode-view') || '{}');
    
    // Check IndexedDB
    const dbRequest = indexedDB.open('gb-coder-projects-db', 1);
    const db = await new Promise((resolve) => {
      dbRequest.onsuccess = () => resolve(dbRequest.result);
      dbRequest.onerror = () => resolve(null);
    });

    let record = null;
    let files = [];
    if (db) {
      const tx = db.transaction(['projects', 'projectFiles'], 'readonly');
      record = await new Promise((res) => {
        const req = tx.objectStore('projects').get(activeId);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
      const indexReq = tx.objectStore('projectFiles').index('projectId').getAll(activeId);
      files = await new Promise((res) => {
        indexReq.onsuccess = () => res(indexReq.result);
        indexReq.onerror = () => res([]);
      });
    }

    return {
      activeId,
      viewState,
      hasRecord: Boolean(record),
      projectName: record?.name,
      fileCount: files.length,
      appFileContent: files.find((f) => f.path === 'src/App.tsx')?.content,
    };
  });

  console.log('Restored state:', restoredState);
  assert.equal(restoredState.activeId, 'e2e-restore-test-proj');
  assert.equal(restoredState.hasRecord, true);
  assert.equal(restoredState.projectName, 'Auto-Restored Fullstack App');
  assert.equal(restoredState.fileCount, 3);
  assert.equal(restoredState.appFileContent, 'export default () => <h1>Recovery Content Verified</h1>;');
  assert.equal(restoredState.viewState.activePath, 'src/App.tsx');
  assert.deepEqual(restoredState.viewState.openPaths, ['package.json', 'src/App.tsx']);

  // Close context to simulate browser closing
  console.log('Closing browser context to simulate browser quit...');
  await context.close();

  // Re-open persistent context to verify persistence across browser restart
  console.log('Re-opening persistent context (simulating browser restart)...');
  const context2 = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1280, height: 800 },
  });

  const page2 = context2.pages().length > 0 ? context2.pages()[0] : await context2.newPage();
  await page2.goto(`${BASE_URL}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.waitForTimeout(2000);

  const postRestartScreenshot = path.join(ARTIFACT_DIR, 'project_restored_after_restart.png');
  await page2.screenshot({ path: postRestartScreenshot, fullPage: true });
  console.log(`Saved post-restart screenshot to ${postRestartScreenshot}`);

  const postRestartState = await page2.evaluate(() => {
    return {
      activeId: localStorage.getItem('gb-coder-active-project-id'),
      viewState: JSON.parse(localStorage.getItem('gb-coder-vscode-view') || '{}'),
    };
  });

  assert.equal(postRestartState.activeId, 'e2e-restore-test-proj');
  assert.equal(postRestartState.viewState.activePath, 'src/App.tsx');

  await context2.close();
  console.log('E2E Browser Reload Recovery Test PASSED!');
}

run().catch((err) => {
  console.error('E2E Browser Test Failed:', err);
  process.exit(1);
});
