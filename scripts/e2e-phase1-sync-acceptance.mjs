import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

// Parse optional --port argument or PORT env var, defaulting to 4195
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const PORT = portArg ? parseInt(portArg.split('=')[1], 10) : parseInt(process.env.PORT || '4195', 10);
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function isServerRunning(url) {
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

async function getIdbFiles(page, pid) {
  return page.evaluate((id) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction(['projectFiles'], 'readonly');
        const store = tx.objectStore('projectFiles');
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
          const files = {};
          for (const item of getAllReq.result) {
            if (item.projectId === id) files[item.path] = item.content;
          }
          resolve(files);
        };
      };
      req.onerror = () => resolve({});
    });
  }, pid);
}

async function getMonacoLines(page) {
  return page.evaluate(() => {
    const viewLines = document.querySelector('.monaco-editor .view-lines');
    return viewLines ? viewLines.innerText.trim().replace(/\u00a0/g, ' ') : '';
  });
}

async function main() {
  console.log('================================================================');
  console.log('GB CODER — PHASE 1 SYNC ACCEPTANCE & RUNTIME E2E SUITE');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('================================================================\n');

  let serverProcess = null;
  const running = await isServerRunning(BASE_URL);
  if (!running) {
    console.log(`Starting preview server on port ${PORT}...`);
    serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
      stdio: 'inherit',
    });
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (await isServerRunning(BASE_URL)) {
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
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('gbcoder_onboarded', 'true');
      } catch {}
    });

    const page = await context.newPage();
    page.on('console', (msg) => {
      console.log('  [BROWSER CONSOLE]', msg.type(), msg.text());
    });

    page.on('pageerror', (err) => {
      console.log('  [BROWSER PAGEERROR]', err.message);
    });

    const testId = `sync-acc-bench-${Date.now()}`;

    // Steps 1 & 2: Boot WebContainer and open project
    console.log('\n[Step 1 & 2] Navigating to IDE and seeding test project...');
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

    await page.evaluate((pid) => {
      return new Promise((resolve) => {
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onsuccess = () => {
          const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
          tx.objectStore('projects').put({
            id: pid,
            name: 'Sync Acceptance Project',
            createdAt: Date.now(),
            lastOpenedAt: Date.now(),
            editorStyle: 'vscode',
            projectType: 'react',
            fileCount: 2,
          });
          tx.objectStore('projectFiles').put({
            projectId: pid,
            path: 'package.json',
            content: '{"name":"sync-test"}',
          });
          tx.objectStore('projectFiles').put({
            projectId: pid,
            path: 'src/main.js',
            content: '// main entry\nconsole.log("ready");\n',
          });
          tx.oncomplete = () => resolve();
        };
      });
    }, testId);

    await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 25000 });
    console.log('✔ PASS: WebContainer booted cleanly.');

    // Steps 3 & 4: Confirm no automatic npm install or npm run dev
    console.log('\n[Step 3 & 4] Verifying no automatic npm commands ran on boot...');
    const termRowsText = await page.evaluate(() => {
      const el = document.querySelector('.xterm-rows');
      return el ? el.innerText : '';
    });
    assert.ok(!termRowsText.includes('npm install'), 'No automatic npm install occurred');
    assert.ok(!termRowsText.includes('npm run dev'), 'No automatic npm run dev occurred');
    console.log('✔ PASS: Zero unprompted terminal commands executed.');

    // Step 5 & 6: Create src/sync-test.js via terminal
    console.log('\n[Step 5 & 6] Spawning process to create src/sync-test.js...');
    await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
        container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
      }
      const proc = await container.spawn('sh', ['-c', 'echo "export const v1 = 100;" > src/sync-test.js']);
      await proc.exit;
    });

    // Step 7: Wait for file to appear in Explorer tree
    console.log('\n[Step 7] Checking Explorer tree for dynamically created file...');
    await page.waitForSelector('[data-testid="tree-file"][data-path="src/sync-test.js"]', { timeout: 10000 });
    console.log('✔ PASS: src/sync-test.js appeared dynamically in Explorer.');

    // Step 8: Open in Monaco and verify v1
    console.log('\n[Step 8] Opening src/sync-test.js in Monaco...');
    await page.locator('[data-testid="tree-file"][data-path="src/sync-test.js"]').click();
    await page.waitForTimeout(1000);
    const monacoV1 = await getMonacoLines(page);
    assert.ok(monacoV1.includes('export const v1 = 100;'), 'Monaco loaded v1 content');
    console.log('✔ PASS: Monaco displays v1 content.');

    // Steps 9 & 10: Modify via terminal to v2 and verify live Monaco update WITHOUT refresh
    console.log('\n[Step 9 & 10] Modifying src/sync-test.js via terminal to v2...');
    await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
        container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
      }
      const proc = await container.spawn('sh', ['-c', 'echo "export const v2 = 200;" > src/sync-test.js']);
      await proc.exit;
    });

    console.log('Waiting for live Monaco sync without reload...');
    let monacoV2 = '';
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(300);
      monacoV2 = await getMonacoLines(page);
      if (monacoV2.includes('export const v2 = 200;')) break;
    }
    assert.ok(monacoV2.includes('export const v2 = 200;'), 'Monaco updated live to v2 without refresh');
    console.log('✔ PASS: Monaco updated live to v2 without page reload.');

    // Steps 11 & 12: Modify to v3 and verify live Monaco update
    console.log('\n[Step 11 & 12] Modifying src/sync-test.js via terminal to v3...');
    await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
        container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
      }
      const proc = await container.spawn('sh', ['-c', 'echo "export const v3 = 300;" > src/sync-test.js']);
      await proc.exit;
    });

    let monacoV3 = '';
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(300);
      monacoV3 = await getMonacoLines(page);
      if (monacoV3.includes('export const v3 = 300;')) break;
    }
    assert.ok(monacoV3.includes('export const v3 = 300;'), 'Monaco updated live to v3');
    console.log('✔ PASS: Monaco updated live to v3.');

    // Step 13: Verify IndexedDB persistence
    console.log('\n[Step 13] Verifying IndexedDB persistence for v3...');
    await page.waitForTimeout(1500); // Allow coordinator and auto-save debounce
    const idbFiles = await getIdbFiles(page, testId);
    assert.ok(idbFiles['src/sync-test.js']?.includes('export const v3 = 300;'), 'IndexedDB persisted v3');
    console.log('✔ PASS: IndexedDB persisted v3 content.');

    // Steps 14 & 15: Refresh and confirm content survives
    console.log('\n[Step 14 & 15] Reloading browser and checking persistence...');
    await page.evaluate(() => {
      window.localStorage.setItem('gb-coder-autosave-enabled', 'false');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 25000 });
    await page.waitForTimeout(1500);

    const monacoAfterReload = await getMonacoLines(page);
    assert.ok(monacoAfterReload.includes('export const v3 = 300;'), 'Content restored from IndexedDB');
    console.log('✔ PASS: v3 content verified after browser reload.');

    // Step 16: Make Monaco buffer dirty
    console.log('\n[Step 16] Typing dirty unsaved edits into Monaco buffer...');
    await page.locator('.monaco-editor .view-lines').click();
    await page.keyboard.press('PageDown');
    await page.keyboard.type('\n// LOCAL_UNSAVED_DIRT', { delay: 5 });
    await page.waitForTimeout(300);
    const dirtyContent = await getMonacoLines(page);
    assert.ok(dirtyContent.includes('LOCAL_UNSAVED_DIRT'), 'Monaco buffer is dirty');
    console.log('✔ PASS: Monaco buffer is dirty with unsaved edits.');

    // Steps 17 & 18: Modify same file through terminal -> conflict banner appears
    console.log('\n[Step 17 & 18] Modifying file externally via terminal while Monaco buffer is dirty...');
    await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
        container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
      }
      const proc = await container.spawn('sh', ['-c', 'echo "export const v4 = 400;" > src/sync-test.js']);
      await proc.exit;
    });

    await page.waitForSelector('[data-testid="conflict-banner"]', { timeout: 10000 });
    const bannerText = await page.locator('[data-testid="conflict-banner"]').innerText();
    assert.ok(bannerText.includes('File changed externally while you have unsaved edits'), 'Conflict banner displayed');
    console.log('✔ PASS: Conflict banner rendered successfully.');

    // Step 19: Diff editor verification
    console.log('\n[Step 19] Clicking Compare Changes...');
    await page.locator('[data-testid="conflict-compare-btn"]').click();
    await page.waitForTimeout(1000);
    const hasDiff = await page.evaluate(() => Boolean(document.querySelector('.monaco-diff-editor')));
    assert.ok(hasDiff, 'Monaco diff editor mounted');
    console.log('✔ PASS: Monaco diff editor mounted.');

    // Steps 20 & 21: Reload with unresolved conflict -> verify durable restoration
    console.log('\n[Step 20 & 21] Reloading with unresolved conflict to verify durable recovery...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
    await page.waitForSelector('[data-testid="conflict-banner"]', { timeout: 15000 });
    await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
        container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
      }
      return Boolean(container);
    });
    console.log('✔ PASS: Durable conflict banner restored after hard reload.');

    // Steps 22 & 23: Resolve conflict with "Keep My Changes"
    console.log('\n[Step 22 & 23] Resolving conflict via Keep My Changes...');
    const keepBtn = page.locator('[data-testid="conflict-keep-mine-btn"]');
    await keepBtn.waitFor({ state: 'visible', timeout: 5000 });
    page.once('dialog', async (dialog) => {
      console.log('  [CONFIRM DIALOG]:', dialog.message());
      await dialog.accept();
    });
    console.log('Clicking conflict-keep-mine-btn...');
    await keepBtn.click();
    console.log('Waiting for banner dismissal...');
    await page.waitForSelector('[data-testid="conflict-banner"]', { state: 'detached', timeout: 10000 });
    console.log('✔ PASS: Conflict banner dismissed upon resolution.');

    // Confirm WebContainer VFS and IndexedDB reflect kept version
    let vfsFinal = '';
    for (let i = 0; i < 20; i++) {
      vfsFinal = await page.evaluate(async () => {
        let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
        return container ? await container.fs.readFile('src/sync-test.js', 'utf-8') : '';
      });
      if (vfsFinal.includes('LOCAL_UNSAVED_DIRT')) break;
      await page.waitForTimeout(250);
    }
    assert.ok(vfsFinal.includes('LOCAL_UNSAVED_DIRT'), 'VFS contains kept editor changes');

    const idbFinal = await getIdbFiles(page, testId);
    assert.ok(idbFinal['src/sync-test.js']?.includes('LOCAL_UNSAVED_DIRT'), 'IndexedDB contains kept editor changes');
    console.log('✔ PASS: Conflict resolution successfully written to VFS and IndexedDB.');

    console.log('\n================================================================');
    console.log('✅ ALL 23 PHASE 1 RUNTIME ACCEPTANCE STEPS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
