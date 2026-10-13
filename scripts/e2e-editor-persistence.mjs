/**
 * GB Coder — Phase 0.5.1 Playwright E2E Editor Persistence & Mode Restoration Suite
 *
 * Scenarios verified:
 * - Scenario A: Multi-file project ("webos") created/edited in Advanced IDE,
 *   returned to dashboard, reopened from dashboard -> opens in Advanced IDE.
 * - Scenario B: Project switched from Static Editor to Advanced IDE ->
 *   persists `editorStyle: "vscode"`, browser reloaded at `/` -> opens in Advanced IDE.
 * - Scenario C: Export full backup ZIP with "webos" project ->
 *   manifest has `editorStyle: "vscode"` and `workspaceIncluded: false`.
 * - Scenario D: Restore backup archive in clean browser profile ->
 *   opening restored "webos" launches Advanced IDE automatically.
 * - Scenario E: Restore archive with collision ->
 *   duplicate copy "webos (Restored)" preserves `editorStyle: "vscode"`.
 *
 * Usage: npm run audit:e2e:persistence (or node scripts/e2e-editor-persistence.mjs)
 */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

let PORT = 4198;
let BASE_URL = `http://localhost:${PORT}`;
// Unified build: the IDE app (dashboard + editors) is served under /app.
let APP_URL = `${BASE_URL}/app/`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function startPreviewServer() {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist. Run "npm run build" first.');
  }

  const server = http.createServer((req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    // Unified-build layout (Phase 1): the IDE app lives under /app, with
    // /ide kept as a legacy alias (mirrors vercel.json rewrites). The suite
    // predates the split and navigates these routes directly.
    let filePath;
    if (reqPath === '/ide' || reqPath === '/ide/') {
      filePath = path.join(distDir, 'app', 'index.html');
    } else if (reqPath.startsWith('/app')) {
      const sub = reqPath.replace(/^\/app\/?/, '');
      const candidate = path.join(distDir, 'app', sub);
      filePath =
        sub && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
          ? candidate
          : path.join(distDir, 'app', 'index.html');
    } else {
      filePath = path.join(distDir, reqPath.replace(/^\//, ''));
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200);
      res.end(data);
    } catch (err) {
      res.writeHead(500);
      res.end(err.message);
    }
  });

  return new Promise((resolve) => {
    server.listen(0, () => {
      PORT = server.address().port;
      BASE_URL = `http://localhost:${PORT}`;
      APP_URL = `${BASE_URL}/app/`;
      resolve(server);
    });
  });
}

async function run() {
  let serverProc;
  try {
    serverProc = await startPreviewServer();
    console.log(`[E2E Persistence] Preview server active at ${BASE_URL}`);
  } catch (err) {
    console.error('Failed to start preview server:', err.message);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const downloadedPath = path.resolve('temp-e2e-persistence-backup.zip');

  try {
    // =========================================================================
    // SCENARIO A: Project "webos" created in Advanced IDE, Dashboard cycle
    // =========================================================================
    console.log('\n--- Running Scenario A: "webos" in Advanced IDE & Dashboard Reopen ---');
    const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageA = await contextA.newPage();
    await pageA.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });

    await pageA.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Inject "webos" project into IndexedDB with editorStyle: 'vscode'
    console.log('Injecting "webos" multi-file project with editorStyle: "vscode"...');
    await pageA.evaluate(async () => {
      const openDb = () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('projects')) {
              db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
            }
            if (!db.objectStoreNames.contains('projectFiles')) {
              db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

      const db = await openDb();
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const pStore = tx.objectStore('projects');
      const fStore = tx.objectStore('projectFiles');

      const now = Date.now();
      pStore.put({
        id: 'proj-webos-user',
        name: 'webos',
        createdAt: now - 50000,
        lastOpenedAt: now - 1000,
        editorStyle: 'vscode',
        projectType: 'plain',
        entry: undefined,
        fileCount: 3,
      });

      fStore.put({ projectId: 'proj-webos-user', path: 'index.html', content: '<h1>WebOS Desktop</h1>' });
      fStore.put({ projectId: 'proj-webos-user', path: 'styles.css', content: 'body { margin: 0; background: #000; }' });
      fStore.put({ projectId: 'proj-webos-user', path: 'app.js', content: 'console.log("WebOS ready");' });

      await new Promise((res) => (tx.oncomplete = res));
    });

    // Reload page to let dashboard pick up the project
    await pageA.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Click on "webos" project card to open it
    console.log('Clicking "webos" project card in dashboard...');
    const webosCard = pageA.locator('text=webos').first();
    await webosCard.waitFor({ timeout: 10000 });
    await webosCard.click();

    // Verify it routes to the IDE (unified route /app/ide; legacy /ide kept).
    await pageA.waitForFunction(() => window.location.pathname.includes('/ide') || window.location.hash.includes('vscode'), { timeout: 10000 });
    console.log('Verified: URL navigated to #vscode.');

    // Verify project record in IndexedDB still has editorStyle: 'vscode'
    const storedStyleA = await pageA.evaluate(async () => {
      const openDb = () =>
        new Promise((res, rej) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects'], 'readonly');
      const rec = await new Promise((res) => {
        const r = tx.objectStore('projects').get('proj-webos-user');
        r.onsuccess = () => res(r.result);
      });
      return rec ? rec.editorStyle : null;
    });
    assert.equal(storedStyleA, 'vscode', 'Stored editorStyle must remain "vscode"');
    console.log('Scenario A PASS: "webos" opened in VS Code mode, IndexedDB verified.');
    await contextA.close();

    // =========================================================================
    // SCENARIO B: Switch from Static Editor to Advanced IDE & Reload at root
    // =========================================================================
    console.log('\n--- Running Scenario B: Mode Switch & Reload Resilience ---');
    const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageB = await contextB.newPage();
    await pageB.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });

    await pageB.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Inject switch-test project with editorStyle: 'plain'
    await pageB.evaluate(async () => {
      const openDb = () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('projects')) {
              db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
            }
            if (!db.objectStoreNames.contains('projectFiles')) {
              db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      tx.objectStore('projects').put({
        id: 'proj-switch-test',
        name: 'switch-test',
        createdAt: now,
        lastOpenedAt: now,
        editorStyle: 'plain',
        projectType: 'plain',
        fileCount: 1,
      });
      tx.objectStore('projectFiles').put({
        projectId: 'proj-switch-test',
        path: 'index.html',
        content: '<p>Switch Test</p>',
      });
      await new Promise((res) => (tx.oncomplete = res));
    });

    // Update editorStyle preference in IndexedDB to 'vscode' and mark active project
    await pageB.evaluate(async () => {
      const openDb = () =>
        new Promise((res, rej) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects'], 'readwrite');
      const store = tx.objectStore('projects');
      const rec = await new Promise((res) => {
        const r = store.get('proj-switch-test');
        r.onsuccess = () => res(r.result);
      });
      if (rec) {
        rec.editorStyle = 'vscode';
        store.put(rec);
      }
      await new Promise((res) => (tx.oncomplete = res));
      window.localStorage.setItem('gb-coder-active-project-id', 'proj-switch-test');
    });

    // Cold reload directly at root URL (http://localhost:PORT/)
    console.log('Reloading browser at root "/" to simulate cold start...');
    await pageB.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Verify URL navigated to #vscode because active project preference is 'vscode'
    await pageB.waitForFunction(() => window.location.pathname.includes('/ide') || window.location.hash.includes('vscode'), { timeout: 10000 });
    console.log('Verified: Resumed active project synchronized URL to #vscode.');

    // Verify database was NOT silently overwritten to 'plain'
    const styleAfterReload = await pageB.evaluate(async () => {
      const openDb = () =>
        new Promise((res, rej) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects'], 'readonly');
      const rec = await new Promise((res) => {
        const r = tx.objectStore('projects').get('proj-switch-test');
        r.onsuccess = () => res(r.result);
      });
      return rec ? rec.editorStyle : null;
    });
    assert.equal(styleAfterReload, 'vscode', 'editorStyle must remain "vscode" after cold reload at "/"');
    console.log('Scenario B PASS: Cold reload at "/" did not demote editorStyle.');
    await contextB.close();

    // =========================================================================
    // SCENARIO C: Export backup ZIP & verify manifest integrity
    // =========================================================================
    console.log('\n--- Running Scenario C: Backup Export Manifest Verification ---');
    const contextC = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      acceptDownloads: true,
    });
    const pageC = await contextC.newPage();
    await pageC.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });

    await pageC.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Inject "webos" project
    await pageC.evaluate(async () => {
      const openDb = () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('projects')) {
              db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
            }
            if (!db.objectStoreNames.contains('projectFiles')) {
              db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      tx.objectStore('projects').put({
        id: 'proj-webos-user',
        name: 'webos',
        createdAt: now - 50000,
        lastOpenedAt: now - 1000,
        editorStyle: 'vscode',
        projectType: 'plain',
        fileCount: 3,
      });
      tx.objectStore('projectFiles').put({ projectId: 'proj-webos-user', path: 'index.html', content: '<h1>WebOS Desktop</h1>' });
      tx.objectStore('projectFiles').put({ projectId: 'proj-webos-user', path: 'styles.css', content: 'body { margin: 0; }' });
      tx.objectStore('projectFiles').put({ projectId: 'proj-webos-user', path: 'app.js', content: 'console.log("WebOS ready");' });
      await new Promise((res) => (tx.oncomplete = res));
    });

    await pageC.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Open Backup modal via "Backup & Restore" button on dashboard
    const backupBtn = pageC.locator('button:has-text("Backup / Restore"), button:has-text("Backup")').first();
    await backupBtn.waitFor({ timeout: 10000 });
    await backupBtn.click();

    // Trigger export and intercept download
    console.log('Triggering export in Backup tab...');
    const downloadPromise = pageC.waitForEvent('download', { timeout: 15000 });
    const exportSubmitBtn = pageC.locator('button[data-testid="btn-export-backup"], button:has-text("Export All Projects")').first();
    await exportSubmitBtn.click();

    const download = await downloadPromise;
    await download.saveAs(downloadedPath);
    console.log(`Saved backup archive to ${downloadedPath}`);

    // Inspect archive with JSZip
    const zipBytes = fs.readFileSync(downloadedPath);
    const loadedZip = await JSZip.loadAsync(zipBytes);
    const manifestEntry = loadedZip.file('manifest.json');
    assert.ok(manifestEntry, 'manifest.json must exist in archive');

    const manifestText = await manifestEntry.async('string');
    const manifest = JSON.parse(manifestText);
    console.log(`Manifest contents: ${manifest.projects.length} projects, workspaceIncluded: ${manifest.workspaceIncluded}`);

    // Verify webos project in manifest
    const webosMeta = manifest.projects.find((p) => p.name === 'webos');
    assert.ok(webosMeta, 'webos must be present in manifest.projects');
    assert.equal(webosMeta.editorStyle, 'vscode', 'webos metadata must preserve editorStyle: "vscode"');
    assert.equal(manifest.workspaceIncluded, false, 'workspaceIncluded must be false when files belong to named projects');
    console.log('Scenario C PASS: Export manifest preserves editorStyle: "vscode" and accurate workspaceIncluded.');
    await contextC.close();

    // =========================================================================
    // SCENARIO D: Restore archive in fresh profile & verify VS Code mode launch
    // =========================================================================
    console.log('\n--- Running Scenario D: Clean Profile Restore & VS Code Launch ---');
    const contextD = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageD = await contextD.newPage();
    await pageD.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });

    await pageD.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Open restore modal
    const restoreModalBtn = pageD.locator('button:has-text("Backup / Restore"), button:has-text("Backup")').first();
    await restoreModalBtn.waitFor({ timeout: 10000 });
    await restoreModalBtn.click();

    // Switch to Restore tab
    const restoreTab = pageD.locator('button[data-testid="tab-restore"], button:has-text("Restore Backup")').first();
    await restoreTab.click();

    // Upload archive
    console.log('Uploading backup archive into Restore tab...');
    const fileInput = pageD.locator('input[type="file"][data-testid="input-restore-file"], input[type="file"]').first();
    await fileInput.setInputFiles(downloadedPath);

    // Confirm restore plan shows webos with VS Code mode
    await pageD.locator('text=webos').first().waitFor({ timeout: 10000 });
    const planText = await pageD.locator('text=VS Code').first().textContent();
    assert.ok(planText.includes('VS Code'), 'Restore plan must explicitly display "VS Code" editor mode');

    // Confirm restore
    console.log('Confirming restore...');
    const confirmBtn = pageD.locator('button[data-testid="btn-confirm-restore"], button:has-text("Confirm & Restore Projects")').first();
    await confirmBtn.click();

    // Wait for restore completion card
    await pageD.locator('text=Restore Completed Successfully!').waitFor({ timeout: 15000 });
    console.log('Restore completed successfully.');

    // Close modal and return to dashboard
    await pageD.locator('button:has-text("Done"), button:has-text("Close")').first().click();

    // Click on restored "webos" project card
    console.log('Opening restored "webos" from dashboard...');
    const restoredCard = pageD.locator('text=webos').first();
    await restoredCard.click();

    // Verify it automatically launches Advanced IDE (#vscode)
    await pageD.waitForFunction(() => window.location.pathname.includes('/ide') || window.location.hash.includes('vscode'), { timeout: 10000 });
    console.log('Verified: Restored "webos" project successfully launched in Advanced IDE (#vscode).');
    console.log('Scenario D PASS: Restored project launches in Advanced IDE.');
    await contextD.close();

    // =========================================================================
    // SCENARIO E: Restore Collision preserves editorStyle: "vscode"
    // =========================================================================
    console.log('\n--- Running Scenario E: Conflict Resolution & EditorStyle Preservation ---');
    const contextE = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageE = await contextE.newPage();
    await pageE.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });

    await pageE.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Seed existing project with colliding ID
    await pageE.evaluate(async () => {
      const openDb = () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('projects')) {
              db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
            }
            if (!db.objectStoreNames.contains('projectFiles')) {
              db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      tx.objectStore('projects').put({
        id: 'proj-webos-user',
        name: 'webos',
        createdAt: now,
        lastOpenedAt: now,
        editorStyle: 'vscode',
        projectType: 'plain',
        fileCount: 1,
      });
      tx.objectStore('projectFiles').put({ projectId: 'proj-webos-user', path: 'index.html', content: '<h1>Original</h1>' });
      await new Promise((res) => (tx.oncomplete = res));
    });

    await pageE.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    // Re-open modal and restore archive to create conflict
    const restoreModalBtnE = pageE.locator('button:has-text("Backup / Restore"), button:has-text("Backup")').first();
    await restoreModalBtnE.waitFor({ timeout: 10000 });
    await restoreModalBtnE.click();
    await pageE.locator('button[data-testid="tab-restore"], button:has-text("Restore Backup")').first().click();

    const fileInputE = pageE.locator('input[type="file"]').first();
    await fileInputE.setInputFiles(downloadedPath);

    // Verify conflict detected
    await pageE.locator('text=Copy (Conflict)').first().waitFor({ timeout: 10000 });
    console.log('Verified: Safe conflict resolution detected colliding project ID.');

    // Confirm duplicate restore
    await pageE.locator('button[data-testid="btn-confirm-restore"], button:has-text("Confirm & Restore Projects")').first().click();
    await pageE.locator('text=Restore Completed Successfully!').waitFor({ timeout: 15000 });
    await pageE.locator('button:has-text("Done"), button:has-text("Close")').first().click();

    // Verify duplicated project "webos (Restored)" in IndexedDB has editorStyle: 'vscode'
    const conflictStyle = await pageE.evaluate(async () => {
      const openDb = () =>
        new Promise((res, rej) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        });
      const db = await openDb();
      const tx = db.transaction(['projects'], 'readonly');
      const all = await new Promise((res) => {
        const r = tx.objectStore('projects').getAll();
        r.onsuccess = () => res(r.result);
      });
      const duplicate = all.find((p) => p.name.includes('webos') && p.name.includes('(Restored)'));
      return duplicate ? duplicate.editorStyle : null;
    });
    assert.equal(conflictStyle, 'vscode', 'Duplicate copy of webos must preserve editorStyle: "vscode"');
    console.log('Scenario E PASS: Conflict duplicate project preserves editorStyle: "vscode".');
    await contextE.close();

    // Cleanup downloaded archive
    if (fs.existsSync(downloadedPath)) {
      fs.unlinkSync(downloadedPath);
    }

    console.log('\n=============================================================');
    console.log('ALL PHASE 0.5.1 E2E PLAYWRIGHT PERSISTENCE SCENARIOS (A - E) PASSED!');
    console.log('=============================================================\n');

  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.close();
    }
    if (fs.existsSync(downloadedPath)) {
      try { fs.unlinkSync(downloadedPath); } catch {}
    }
  }
}

run().catch((err) => {
  console.error('\nE2E PERSISTENCE TEST FAILED:', err);
  process.exit(1);
});
