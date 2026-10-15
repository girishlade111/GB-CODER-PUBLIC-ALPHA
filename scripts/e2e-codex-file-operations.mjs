import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const base = 'http://127.0.0.1:42984';
const evidenceName = process.argv.find((arg) => arg.startsWith('--evidence='))?.split('=')[1] ?? 'codex-file-operations-browser';
if (!/^[a-z0-9-]+$/.test(evidenceName)) throw new Error('Invalid evidence name');
const child = spawn('node', ['scripts/preview-combined.mjs', '--port=42984'], { stdio: 'ignore' });
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
  await poll(async () => (await fetch(`${base}/api/health`)).ok, 'preview startup');
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
  console.log('Runtime paths after create:', await page.evaluate(async () => {
    const container = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    return container ? await container.fs.readdir('.') : 'no runtime';
  }));
  await row('fresh.js').click({ button: 'right' });
  await page.getByRole('menuitem', { name: /Rename/ }).click();
  await treeInput.fill('renamed.js'); await treeInput.press('Enter');
  await row('renamed.js').waitFor();
  await poll(async () => { const paths = await storedPaths(); return paths.includes('renamed.js') && !paths.includes('fresh.js'); }, 'rename persisted');
  record('actual App rename updates tree and persisted paths');
  await page.getByRole('button', { name: 'New File', exact: true }).click();
  await treeInput.fill('RENAMED.js'); await treeInput.press('Enter');
  await page.waitForTimeout(500);
  assert.equal(await row('RENAMED.js').count(), 0);
  assert.equal((await storedPaths()).includes('RENAMED.js'), false);
  assert.equal(await page.getByText('Created RENAMED.js', { exact: true }).count(), 0);
  record('case collision create rejection suppresses phantom tab and success toast');
  await treeInput.press('Escape');
  await page.evaluate(() => {
    const container = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    globalThis.__codexOriginalRename = container.fs.rename;
    container.fs.rename = async () => { throw Object.assign(new Error('Injected permission denied'), { code: 'EACCES' }); };
  });
  await row('renamed.js').click({ button: 'right' });
  await page.getByRole('menuitem', { name: /Rename/ }).click();
  await treeInput.fill('rejected.js'); await treeInput.press('Enter');
  await page.getByText('Failed to rename "renamed.js". Virtual filesystem write failed.', { exact: true }).waitFor();
  assert.equal(await row('renamed.js').count(), 1);
  assert.equal((await storedPaths()).includes('rejected.js'), false);
  record('physical rename rejection preserves App tree and IndexedDB paths');
  await page.evaluate(() => {
    const container = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    container.fs.rename = globalThis.__codexOriginalRename;
    globalThis.__codexOriginalRm = container.fs.rm;
    container.fs.rm = async () => { throw new Error('Injected delete failure'); };
  });
  await row('renamed.js').click({ button: 'right' });
  await page.getByRole('menuitem', { name: /^Delete/ }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Failed to delete "renamed.js". Virtual filesystem write failed.', { exact: true }).waitFor();
  assert.equal(await row('renamed.js').count(), 1);
  assert.equal((await storedPaths()).includes('renamed.js'), true);
  assert.equal(await page.getByRole('button', { name: 'Delete', exact: true }).count(), 1);
  assert.equal(await page.getByText('Deleted renamed.js', { exact: true }).count(), 0);
  record('physical delete rejection preserves dialog, App tree, and IndexedDB paths');
  await page.evaluate(() => { globalThis.__GBCODER_WEBCONTAINER_INSTANCE__.fs.rm = globalThis.__codexOriginalRm; });
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await poll(async () => !(await storedPaths()).includes('renamed.js'), 'delete persisted');
  assert.equal(await row('renamed.js').count(), 0);
  record('actual App delete updates tree and persisted paths');
  const folder = page.locator('[data-testid="tree-folder"][data-path="src"]');
  await folder.click({ button: 'right' });
  await page.getByRole('menuitem', { name: /Rename/ }).click();
  await treeInput.fill('lib'); await treeInput.press('Enter');
  await poll(async () => { const paths = await storedPaths(); return paths.includes('lib/keep.js') && paths.includes('lib/other.js') && !paths.some((p) => p.startsWith('src/')); }, 'folder rename persisted');
  record('actual App folder rename preserves descendants');
  await page.reload(); await page.getByTestId('vscode-mode').waitFor({ timeout: 60000 });
  assert.deepEqual((await storedPaths()).sort(), ['index.html', 'lib/keep.js', 'lib/other.js']);
  record('reload retains authoritative project paths');
  await page.goto(`${base}/app/projects/codex-static/editor`);
  await page.locator('.monaco-editor').first().waitFor({ timeout: 60000 });
  await poll(async () => {
    for (const frame of page.frames()) {
      if (frame !== page.mainFrame() && await frame.evaluate(() => document.body?.innerText.includes('STATIC_CODEX_MARKER')).catch(() => false)) return true;
    }
    return false;
  }, 'static HTML live preview');
  record('normal HTML/CSS/JS editor renders its saved project and live preview');
} catch (error) {
  results.push({ name: 'browser acceptance', status: 'FAIL', error: error.stack });
  console.error(error); process.exitCode = 1;
} finally {
  await context?.close(); await browser?.close(); child.kill();
  await fs.writeFile(`reports/${evidenceName}.json`, JSON.stringify(results, null, 2));
}
