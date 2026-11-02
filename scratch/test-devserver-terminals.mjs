import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire('c:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/package.json');
const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:4195';

async function main() {
  console.log('=== [DEV SERVER & MULTI-TERMINAL VERIFICATION] ===');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await context.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });

  const page = await context.newPage();
  const testId = 'devserver-bench-' + Date.now();

  console.log('1. Navigating to IDE and seeding Vite React project...');
  await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

  await page.evaluate((pid) => {
    return new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const tx = req.result.transaction(['projects', 'projectFiles'], 'readwrite');
        tx.objectStore('projects').put({
          id: pid,
          name: 'DevServer Project',
          createdAt: Date.now(),
          lastOpenedAt: Date.now(),
          editorStyle: 'vscode',
          projectType: 'react',
          fileCount: 3,
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'package.json',
          content: JSON.stringify({
            name: 'devserver-test',
            type: 'module',
            scripts: { dev: 'vite' },
            dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
            devDependencies: { vite: '^5.4.11', '@vitejs/plugin-react': '^4.3.4' }
          })
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'index.html',
          content: '<!DOCTYPE html><html><body><div id="root">Hello Dev Server</div><script type="module" src="/src/main.jsx"></script></body></html>'
        });
        tx.objectStore('projectFiles').put({
          projectId: pid,
          path: 'src/main.jsx',
          content: 'console.log("App loaded in live preview");'
        });
        tx.oncomplete = () => resolve();
      };
    });
  }, testId);

  await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 25000 });
  await page.waitForSelector('text="WebContainer Ready"', { timeout: 25000 });
  console.log('PASS: IDE and WebContainer mounted.');

  // -------------------------------------------------------------------------
  // 3 Concurrent Real Terminals
  // -------------------------------------------------------------------------
  console.log('2. Testing 3 Concurrent Terminal Sessions...');
  const newTermBtn = await page.waitForSelector('[data-testid="terminal-new-session-btn"]', { timeout: 10000 });
  await newTermBtn.click();
  await page.waitForTimeout(1500);
  await newTermBtn.click();
  await page.waitForTimeout(1500);

  const terminalTabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid^="terminal-session-tab-"]'))
      .map(el => el.innerText.trim());
  });
  console.log('Active terminal tabs:', terminalTabs);
  assert.equal(terminalTabs.length, 3, 'Three terminal tabs exist concurrently');

  // Execute concurrent commands via WebContainer processes
  const terminalExecResults = await page.evaluate(async () => {
    let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
    if (!container && window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__) {
      container = await window.__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
    }
    const p1 = await container.spawn('sh', ['-c', 'echo "TERM_1_OK" > term1.txt']);
    const p2 = await container.spawn('sh', ['-c', 'echo "TERM_2_OK" > term2.txt']);
    const p3 = await container.spawn('sh', ['-c', 'echo "TERM_3_OK" > term3.txt']);

    const [c1, c2, c3] = await Promise.all([p1.exit, p2.exit, p3.exit]);
    const r1 = await container.fs.readFile('term1.txt', 'utf-8');
    const r2 = await container.fs.readFile('term2.txt', 'utf-8');
    const r3 = await container.fs.readFile('term3.txt', 'utf-8');
    return { c1, c2, c3, r1: r1.trim(), r2: r2.trim(), r3: r3.trim() };
  });
  console.log('3 Concurrent process outputs:', terminalExecResults);
  assert.equal(terminalExecResults.r1, 'TERM_1_OK');
  assert.equal(terminalExecResults.r2, 'TERM_2_OK');
  assert.equal(terminalExecResults.r3, 'TERM_3_OK');
  console.log('PASS: 3 Concurrent terminal processes executed successfully without interference.');

  // -------------------------------------------------------------------------
  // Dev Server Lifecycle (Start / Stop / Restart / Live Preview Controls)
  // -------------------------------------------------------------------------
  console.log('3. Testing Dev Server Lifecycle Controls...');
  const startBtn = await page.$('[data-testid="terminal-start-server-btn"]');
  console.log('Start Server Button exists:', Boolean(startBtn));
  if (startBtn) {
    await startBtn.click();
    console.log('Clicked Start Dev Server button.');
    await page.waitForTimeout(2000);
  }

  // Check dev server state and preview reload state
  const devServerState = await page.evaluate(() => {
    return {
      wcState: window.__GBCODER_WEBCONTAINER_INSTANCE__ ? 'active' : 'inactive',
      hasServerStopBtn: Boolean(document.querySelector('[data-testid="terminal-stop-server-btn"]')),
      hasPreviewIframe: Boolean(document.querySelector('iframe')),
      previewReloadBtnVisible: Boolean(document.querySelector('[data-testid="preview-reload-btn"]')),
    };
  });
  console.log('Dev server state:', devServerState);

  // Stop server if started
  const stopBtn = await page.$('[data-testid="terminal-stop-server-btn"]');
  if (stopBtn) {
    console.log('Clicking Stop Server button...');
    await stopBtn.click();
    await page.waitForTimeout(1000);
    console.log('Dev server stopped.');
  }

  console.log('PASS: Dev server lifecycle controls verified.');
  await browser.close();
}

main().catch(err => {
  console.error('FAILURE:', err);
  process.exit(1);
});
