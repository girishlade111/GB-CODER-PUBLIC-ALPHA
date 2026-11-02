import assert from 'node:assert/strict';
import { chromium } from './.tmp-stage-b3-browser-helper.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const base = 'https://gb-coder-public-alpha-ccyelci13.vercel.app';
const evidenceName = process.argv.find((arg) => arg.startsWith('--evidence='))?.split('=')[1] ?? 'codex-file-operations-browser';
if (!/^[a-z0-9-]+$/.test(evidenceName)) throw new Error('Invalid evidence name');
const child = {kill(){}};
let browser, context;
const results = [];
async function poll(fn, label, ms = 30000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await fn().catch(() => false)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out: ${label}`);
}
try {
  
  browser = await chromium.launch({ headless: true, args: ['--enable-features=SharedArrayBuffer'] });
  context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => localStorage.setItem('gbcoder_onboarded', 'true'));
  const page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') console.error('BROWSER:', message.text()); });
  page.on('pageerror', (error) => console.error('PAGEERROR:', error.message));
  await page.goto(`${base}/app/projects`);
  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('gb-coder-projects-db', 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      tx.objectStore('projects').put({ id: 'codex-ops', name: 'Codex disposable operations',
        editorStyle: 'vscode', projectType: 'react', createdAt: Date.now(), lastOpenedAt: Date.now(), fileCount: 3 });
      for (const path of ['index.html', 'src/keep.js', 'src/other.js']) {
        tx.objectStore('projectFiles').put({ projectId: 'codex-ops', path,
          content: path === 'index.html' ? '<h1>Disposable</h1>' : 'export const marker = 1;' });
      }
      tx.objectStore('projects').put({ id: 'codex-static', name: 'Codex disposable static',
        editorStyle: 'plain', projectType: 'plain', createdAt: Date.now(), lastOpenedAt: Date.now(), fileCount: 3 });
      for (const [path, content] of [['index.html', '<h1>STATIC_CODEX_MARKER</h1>'], ['style.css', 'h1 { color: red; }'], ['script.js', 'console.log("static");']]) {
        tx.objectStore('projectFiles').put({ projectId: 'codex-static', path, content });
      }
      tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  }));
  const storedPaths = () => page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('gb-coder-projects-db', 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('projectFiles');
      const get = tx.objectStore('projectFiles').getAll();
      get.onsuccess = () => resolve(get.result.filter((f) => f.projectId === 'codex-ops').map((f) => f.path));
      get.onerror = () => reject(get.error); tx.oncomplete = () => db.close();
    }; request.onerror = () => reject(request.error);
  }));
  const row = (path) => page.locator(`[data-testid="tree-file"][data-path="${path}"]`);
  const record = (name) => { results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); };
  await page.goto(`${base}/app/projects/codex-ops/ide`);
  await page.getByTestId('vscode-mode').waitFor({ timeout: 60000 });
  await poll(async () => /[$#❯]\s*$/m.test(await page.locator('.xterm-rows').first().innerText()), 'real shell prompt', 90000);
  await page.getByRole('button', { name: 'New File', exact: true }).click();
  const treeInput = page.getByTestId('vscode-file-tree').locator('input');
  await treeInput.fill('fresh.js'); await treeInput.press('Enter');
  await row('fresh.js').waitFor();
  await poll(async () => (await storedPaths()).includes('fresh.js'), 'creation persisted');
  record('actual App file creation reaches IndexedDB');
  await page.getByRole('button',{name:'New Folder',exact:true}).click();
  await treeInput.fill('scratch');await treeInput.press('Enter');
  const scratch=page.locator('[data-testid="tree-folder"][data-path="scratch"]');await scratch.waitFor();
  await poll(async()=>(await storedPaths()).includes('scratch/.gitkeep'),'folder marker persisted');
  record('folder creation persists its automatic .gitkeep record');
  await scratch.click({button:'right'});await page.getByRole('menuitem',{name:/^Delete/}).click();await page.getByRole('button',{name:'Delete',exact:true}).click();
  await poll(async()=>!(await storedPaths()).some(p=>p.startsWith('scratch/')),'directory delete persisted');assert.equal(await scratch.count(),0);
  record('folder delete removes descendant tree and IndexedDB records');

} catch (error) {
  results.push({ name: 'browser acceptance', status: 'FAIL', error: error.stack });
  console.error(error); process.exitCode = 1;
} finally {
  await context?.close(); await browser?.close(); child.kill();
  await fs.writeFile(`reports/${evidenceName}.json`, JSON.stringify(results, null, 2));
}
