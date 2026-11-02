import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.text().includes('conflict') || msg.text().includes('Conflict') || msg.text().includes('writeFile') || msg.text().includes('VSCodeMode')) {
      console.log('  [BROWSER]', msg.text());
    }
  });

  const testId = `check-${Date.now()}`;
  await page.goto('http://127.0.0.1:4195/app/ide');

  // Seed project
  await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
        tx.objectStore('projects').put({
          id: pid,
          name: 'Check Project',
          createdAt: Date.now(),
          lastOpenedAt: Date.now(),
          editorStyle: 'vscode',
          projectType: 'react',
          fileCount: 2,
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'package.json',
          content: '{"name":"check"}',
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'src/sync-test.js',
          content: 'export const v3 = 300;\n',
        });
        tx.oncomplete = () => resolve();
      };
    });
  }, testId);

  await page.goto(`http://127.0.0.1:4195/app/projects/${testId}/ide`);
  await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
  await page.waitForSelector('text="WebContainer Ready"', { timeout: 25000 });

  // Open src/sync-test.js
  await page.locator('[data-testid="tree-file"][data-path="src/sync-test.js"]').click();
  await page.waitForTimeout(1000);

  // Type dirty edit
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('PageDown');
  await page.keyboard.type('\n// LOCAL_UNSAVED_DIRT', { delay: 10 });
  await page.waitForTimeout(600);

  const monacoText = await page.evaluate(() => {
    const el = document.querySelector('.monaco-editor .view-lines');
    return el ? el.innerText : '';
  });
  console.log('Monaco text after typing:', JSON.stringify(monacoText));

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

  const rawBefore = await page.evaluate(() => localStorage.getItem('gb-coder-durable-conflicts'));
  console.log('Conflict in localStorage BEFORE reload:', rawBefore);

  console.log('Reloading page...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
  await page.waitForSelector('[data-testid="conflict-banner"]', { timeout: 15000 });

  const rawAfter = await page.evaluate(() => localStorage.getItem('gb-coder-durable-conflicts'));
  console.log('Conflict in localStorage AFTER reload:', rawAfter);

  page.once('dialog', async (d) => {
    console.log('Dialog:', d.message());
    await d.accept();
  });

  console.log('Clicking conflict-keep-mine-btn...');
  await page.locator('[data-testid="conflict-keep-mine-btn"]').click();
  await page.waitForSelector('[data-testid="conflict-banner"]', { state: 'detached', timeout: 10000 });

  await page.waitForTimeout(1500);

  const vfsContent = await page.evaluate(async () => {
    let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
    return container ? await container.fs.readFile('src/sync-test.js', 'utf-8') : 'NO_CONTAINER';
  });
  console.log('VFS after keep mine:', JSON.stringify(vfsContent));

  await browser.close();
}

check().catch(console.error);
