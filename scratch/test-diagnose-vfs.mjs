import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log('  [CONSOLE]', msg.type(), msg.text());
  });

  const testId = `diag-${Date.now()}`;
  await page.goto('http://127.0.0.1:4195/app/ide');

  // Seed project
  await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
        tx.objectStore('projects').put({
          id: pid,
          name: 'Diag Project',
          createdAt: Date.now(),
          lastOpenedAt: Date.now(),
          editorStyle: 'vscode',
          projectType: 'react',
          fileCount: 2,
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'package.json',
          content: '{"name":"diag"}',
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'src/main.js',
          content: 'console.log("ready");',
        });
        tx.oncomplete = () => resolve();
      };
    });
  }, testId);

  await page.goto(`http://127.0.0.1:4195/app/projects/${testId}/ide`);
  await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
  await page.waitForSelector('text="WebContainer Ready"', { timeout: 25000 });

  // Create file
  await page.evaluate(async () => {
    let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
    if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
      container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
    }
    const proc = await container.spawn('sh', ['-c', 'echo "export const v1 = 100;" > src/sync-test.js']);
    await proc.exit;
  });

  await page.waitForSelector('[data-testid="tree-file"][data-path="src/sync-test.js"]', { timeout: 10000 });
  await page.locator('[data-testid="tree-file"][data-path="src/sync-test.js"]').click();
  await page.waitForTimeout(1000);

  // Type dirty
  await page.locator('.monaco-editor .view-lines').click();
  await page.keyboard.press('PageDown');
  await page.keyboard.type('\n// LOCAL_UNSAVED_DIRT', { delay: 5 });
  await page.waitForTimeout(300);

  // External edit to trigger conflict
  await page.evaluate(async () => {
    let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
    if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
      container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
    }
    const proc = await container.spawn('sh', ['-c', 'echo "export const v4 = 400;" > src/sync-test.js']);
    await proc.exit;
  });

  await page.waitForSelector('[data-testid="conflict-banner"]', { timeout: 10000 });

  // Inspect conflict object BEFORE reload
  const conflictBefore = await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const raw = localStorage.getItem('gb_coder_active_conflicts');
      resolve(raw);
    });
  }, testId);
  console.log('Conflict in localStorage BEFORE reload:', conflictBefore);

  // Hard reload
  console.log('Reloading page...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
  await page.waitForSelector('[data-testid="conflict-banner"]', { timeout: 15000 });

  // Inspect conflict object AFTER reload
  const conflictAfter = await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const raw = localStorage.getItem('gb_coder_active_conflicts');
      resolve(raw);
    });
  }, testId);
  console.log('Conflict in localStorage AFTER reload:', conflictAfter);

  page.once('dialog', async (d) => {
    console.log('Dialog:', d.message());
    await d.accept();
  });

  await page.locator('[data-testid="conflict-keep-mine-btn"]').click();
  await page.waitForSelector('[data-testid="conflict-banner"]', { state: 'detached', timeout: 10000 });

  const vfsContent = await page.evaluate(async () => {
    let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
    return container ? await container.fs.readFile('src/sync-test.js', 'utf-8') : 'NO_CONTAINER';
  });
  console.log('vfsContent AFTER resolution:', JSON.stringify(vfsContent));

  const idbContent = await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction(['projectFiles'], 'readonly');
        const getAll = tx.objectStore('projectFiles').getAll();
        getAll.onsuccess = () => {
          resolve(getAll.result.filter((r) => r.projectId === pid));
        };
      };
    });
  }, testId);
  console.log('idbContent AFTER resolution:', JSON.stringify(idbContent));

  await browser.close();
}

diagnose().catch(console.error);
