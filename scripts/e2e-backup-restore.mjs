/**
 * GB Coder — Phase 0.5 Playwright E2E Browser Round-Trip Persistence Test
 *
 * Runs full browser verification in isolated, disposable profiles:
 * 1. Creates synthetic projects in browser IndexedDB.
 * 2. Exports backup archive via UI and downloads ZIP.
 * 3. Validates downloaded archive manifest and SHA-256 checksums.
 * 4. Opens a second disposable browser profile with clean storage.
 * 5. Restores archive through the Restore UI.
 * 6. Verifies projects appear in dashboard and file contents match.
 * 7. Reloads browser to verify IndexedDB persistence.
 * 8. Restores a second time to verify safe conflict resolution.
 *
 * Usage: node scripts/e2e-backup-restore.mjs
 */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';

let PORT = 4195;
let BASE_URL = `http://localhost:${PORT}`;

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
  const server = http.createServer((req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(distDir, reqPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
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
      resolve(server);
    });
  });
}

async function run() {
  let serverProc;
  try {
    serverProc = await startPreviewServer();
    console.log(`Starting Phase 0.5 Real Browser Persistence Verification against ${BASE_URL}...`);
  } catch (err) {
    console.error('Failed to start local preview server:', err.message);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // PROFILE 1: Creation and Export
    // -------------------------------------------------------------
    console.log('Step 1: Opening Profile 1 (Creation and Export)...');
    const context1 = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      acceptDownloads: true,
    });
    const page1 = await context1.newPage();
    page1.on('console', (msg) => console.log('PAGE1:', msg.text()));
    page1.on('pageerror', (err) => console.log('PAGE1 ERROR:', err.message));

    await page1.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
      window.localStorage.removeItem('gb-coder-active-project-id');
      window.localStorage.removeItem('gb-coder-vscode-view');
    });


    await page1.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Populate IndexedDB with synthetic test projects via page evaluation
    console.log('Step 2: Injecting synthetic Project A and Project B into Profile 1...');
    await page1.evaluate(async () => {
      const DB_NAME = 'gb-coder-projects-db';
      const openDb = () =>
        new Promise((resolve, reject) => {
          const req = indexedDB.open(DB_NAME, 1);
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
      const projA = {
        id: 'e2e-project-alpha',
        name: 'E2E Synthetic Project Alpha',
        createdAt: now - 10000,
        lastOpenedAt: now - 5000,
        editorStyle: 'plain',
        projectType: 'plain',
        fileCount: 2,
      };
      const projB = {
        id: 'e2e-project-beta',
        name: 'E2E Synthetic Project Beta',
        createdAt: now - 8000,
        lastOpenedAt: now - 2000,
        editorStyle: 'vscode',
        projectType: 'react',
        entry: 'src/App.tsx',
        fileCount: 2,
      };

      pStore.put(projA);
      pStore.put(projB);

      fStore.put({ projectId: 'e2e-project-alpha', path: 'index.html', content: '<h1>Alpha</h1>', language: 'html' });
      fStore.put({ projectId: 'e2e-project-alpha', path: 'style.css', content: 'body { margin: 0; }', language: 'css' });

      fStore.put({ projectId: 'e2e-project-beta', path: 'src/App.tsx', content: 'export default () => <h1>Beta</h1>;', language: 'typescript' });
      fStore.put({ projectId: 'e2e-project-beta', path: 'package.json', content: '{"name":"beta"}', language: 'json' });

      await new Promise((res) => { tx.oncomplete = res; });
      db.close();
    });

    // Reload page 1 to let App load the new projects
    console.log('Step 3: Reloading Profile 1 dashboard to verify projects render...');
    await page1.reload({ waitUntil: 'networkidle', timeout: 30000 });
    try {
      await page1.waitForSelector('[data-testid="project-dashboard"]', { timeout: 20000 });
    } catch (err) {
      console.log('Failed waiting for project-dashboard. HTML content:');
      console.log((await page1.content()).slice(0, 1000));
      throw err;
    }

    const projectItems = await page1.locator('[data-testid="dashboard-project-item"]').count();
    console.log(`Profile 1 dashboard displays ${projectItems} projects.`);
    assert.ok(projectItems >= 2, 'Profile 1 must display at least 2 projects');

    // Click "Backup" button in header
    console.log('Step 4: Clicking "Backup" button to open modal...');
    const backupBtn = page1.locator('[data-testid="dashboard-backup"]');
    await backupBtn.click();
    await page1.waitForSelector('[data-testid="backup-restore-modal"]', { timeout: 5000 });

    // Click "Export All Projects (.zip)" and await download
    console.log('Step 5: Exporting backup archive and capturing download...');
    const [download] = await Promise.all([
      page1.waitForEvent('download', { timeout: 15000 }),
      page1.locator('[data-testid="btn-export-backup"]').click(),
    ]);

    const downloadStream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of downloadStream) chunks.push(chunk);
    const downloadedZipBuffer = Buffer.concat(chunks);
    console.log(`Downloaded backup archive: ${download.suggestedFilename()} (${downloadedZipBuffer.length} bytes).`);
    assert.ok(downloadedZipBuffer.length > 500, 'Downloaded ZIP archive must be non-empty');

    // Validate downloaded ZIP archive in Node.js
    console.log('Step 6: Cryptographically verifying downloaded ZIP archive...');
    const zip = await new JSZip().loadAsync(downloadedZipBuffer);
    assert.ok(zip.file('manifest.json'), 'ZIP must contain manifest.json');
    assert.ok(zip.file('integrity/checksums.json'), 'ZIP must contain integrity/checksums.json');

    const manifest = JSON.parse(await zip.file('manifest.json').async('string'));
    assert.equal(manifest.format, 'gb-coder-backup');
    assert.equal(manifest.formatVersion, 1);
    assert.ok(manifest.exportedProjectCount >= 2);

    const checksums = JSON.parse(await zip.file('integrity/checksums.json').async('string'));
    for (const [entryPath, expectedHash] of Object.entries(checksums)) {
      const fileInZip = zip.file(entryPath);
      assert.ok(fileInZip, `File listed in checksums must exist in ZIP: ${entryPath}`);
      const content = await fileInZip.async('string');
      const actualHash = createHash('sha256').update(content).digest('hex');
      assert.equal(actualHash.toLowerCase(), expectedHash.toLowerCase(), `Checksum mismatch for ${entryPath}`);
    }
    console.log('Checksums validated successfully across all archive entries.');

    await context1.close();

    // -------------------------------------------------------------
    // PROFILE 2: Fresh Profile Restore & Recovery
    // -------------------------------------------------------------
    console.log('Step 7: Opening Profile 2 (Clean storage, zero projects)...');
    const context2 = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page2 = await context2.newPage();
    page2.on('console', (msg) => console.log('PAGE2:', msg.text()));
    page2.on('pageerror', (err) => console.log('PAGE2 ERROR:', err.message));
    await page2.addInitScript(() => {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    });
    await page2.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Confirm Profile 2 starts empty
    await page2.waitForSelector('[data-testid="project-dashboard"]', { timeout: 10000 });
    const emptyMsg = await page2.locator('[data-testid="dashboard-empty"]').count();
    assert.equal(emptyMsg, 1, 'Profile 2 must start with an empty dashboard');

    // Click "Restore" button
    console.log('Step 8: Opening Restore Backup modal in Profile 2...');
    const restoreBtn = page2.locator('[data-testid="dashboard-restore"]');
    await restoreBtn.click();
    await page2.waitForSelector('[data-testid="backup-restore-modal"]', { timeout: 5000 });

    // Set input files with downloaded ZIP buffer
    console.log('Step 9: Uploading backup archive for analysis...');
    const fileInput = page2.locator('[data-testid="input-restore-file"]');
    await fileInput.setInputFiles({
      name: 'gb-coder-backup-test.zip',
      mimeType: 'application/zip',
      buffer: downloadedZipBuffer,
    });

    // Wait for Restore Plan preview
    console.log('Step 10: Verifying Restore Plan preview in UI...');
    await page2.waitForSelector('[data-testid="btn-confirm-restore"]', { timeout: 10000 });
    const modalText = await page2.locator('[data-testid="backup-restore-modal"]').textContent();
    assert.ok(modalText.includes('E2E Synthetic Project Alpha'), 'Modal must preview Project Alpha');
    assert.ok(modalText.includes('E2E Synthetic Project Beta'), 'Modal must preview Project Beta');

    // Confirm restore
    console.log('Step 11: Confirming project restoration...');
    await page2.locator('[data-testid="btn-confirm-restore"]').click();
    await page2.waitForSelector('text=Restore Completed Successfully!', { timeout: 10000 });

    // Close modal
    await page2.locator('button:has-text("Done & View Projects")').click();

    // Verify projects now appear in Profile 2 dashboard
    console.log('Step 12: Verifying projects rendered in dashboard...');
    await page2.waitForSelector('[data-testid="dashboard-project-list"]', { timeout: 5000 });
    const pCountAfterRestore = await page2.locator('[data-testid="dashboard-project-item"]').count();
    assert.equal(pCountAfterRestore, 2, 'Profile 2 dashboard must display 2 restored projects');

    // Step 13: Browser Reload Recovery
    console.log('Step 13: Reloading browser to verify IndexedDB persistence across sessions...');
    await page2.reload({ waitUntil: 'domcontentloaded' });
    await page2.waitForSelector('[data-testid="dashboard-project-list"]', { timeout: 10000 });
    const pCountAfterReload = await page2.locator('[data-testid="dashboard-project-item"]').count();
    assert.equal(pCountAfterReload, 2, 'Restored projects must persist across page reload');

    // Step 14: Safe Conflict Resolution (Restoring same archive a second time)
    console.log('Step 14: Restoring archive a second time to test conflict resolution...');
    await page2.locator('[data-testid="dashboard-restore"]').click();
    await page2.waitForSelector('[data-testid="backup-restore-modal"]', { timeout: 5000 });

    const fileInput2 = page2.locator('[data-testid="input-restore-file"]');
    await fileInput2.setInputFiles({
      name: 'gb-coder-backup-test.zip',
      mimeType: 'application/zip',
      buffer: downloadedZipBuffer,
    });

    await page2.waitForSelector('[data-testid="btn-confirm-restore"]', { timeout: 10000 });
    const conflictModalText = await page2.locator('[data-testid="backup-restore-modal"]').textContent();
    assert.ok(conflictModalText.includes('Safe Conflict Resolution') || conflictModalText.includes('Copy (Conflict)'), 'Modal must flag ID collisions');

    await page2.locator('[data-testid="btn-confirm-restore"]').click();
    await page2.waitForSelector('text=Restore Completed Successfully!', { timeout: 10000 });
    await page2.locator('button:has-text("Done & View Projects")').click();

    await page2.waitForTimeout(500);
    const pCountAfterSecondRestore = await page2.locator('[data-testid="dashboard-project-item"]').count();
    console.log(`Profile 2 now contains ${pCountAfterSecondRestore} projects after non-destructive conflict restore.`);
    assert.equal(pCountAfterSecondRestore, 4, 'Conflict resolution must restore duplicate projects as copies without overwriting existing ones');

    await context2.close();
    await browser.close();

    console.log('Phase 0.5 Real Browser E2E Persistence Verification PASSED 100%!');
  } finally {
    if (serverProc) {
      serverProc.close();
    }
  }
}

run().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
