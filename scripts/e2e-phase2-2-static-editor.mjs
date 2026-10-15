import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const tag = process.argv.find((arg) => arg.startsWith('--evidence='))?.split('=')[1] ?? 'final';
if (!/^[a-z0-9-]+$/.test(tag)) throw new Error('Invalid evidence name');
const base = 'http://127.0.0.1:42991';
const evidence = { results: [], console: [], pageErrors: [], failedRequests: [], responses: [] };
const server = spawn(process.execPath, ['scripts/preview-combined.mjs', '--port=42991'], { stdio: 'ignore' });
let browser, context, page;
async function poll(fn, description, ms = 30000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await fn().catch(() => false)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timeout: ${description}`);
}
function pass(name, detail) { evidence.results.push({ name, status: 'PASS', detail }); console.log(`PASS ${name}`); }
async function savedFiles(id) {
  return page.evaluate((projectId) => new Promise((resolve, reject) => {
    const request = indexedDB.open('gb-coder-projects-db', 1);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('projectFiles');
      const get = tx.objectStore('projectFiles').getAll();
      get.onsuccess = () => resolve(Object.fromEntries(get.result.filter((file) => file.projectId === projectId).map((file) => [file.path, file.content])));
      get.onerror = () => reject(get.error); tx.oncomplete = () => db.close();
    }; request.onerror = () => reject(request.error);
  }), id);
}
async function createProject(name, style, template) {
  await page.getByTestId('dashboard-new-project').click();
  await page.getByTestId('new-project-name').fill(name);
  await page.getByTestId(`new-project-style-${style}`).click();
  await page.getByTestId(`new-project-template-${template}`).click();
  await page.getByTestId('new-project-create').click();
}
try {
  await poll(async () => (await fetch(`${base}/api/health`)).ok, 'combined preview startup');
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  if (process.argv.includes('--block-monaco-cdn')) {
    await context.route(/https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@/, (route) => route.abort('failed'));
  }
  await context.addInitScript(() => localStorage.setItem('gbcoder_onboarded', 'true'));
  page = await context.newPage();
  page.on('console', (message) => evidence.console.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', (error) => evidence.pageErrors.push({ message: error.message, stack: error.stack }));
  page.on('requestfailed', (request) => evidence.failedRequests.push({ url: request.url(), type: request.resourceType(), error: request.failure()?.errorText }));
  page.on('response', (response) => {
    const type = response.request().resourceType();
    if (['document', 'script', 'stylesheet', 'fetch', 'xhr', 'other'].includes(type)) {
      evidence.responses.push({ url: response.url(), status: response.status(), type,
        mime: response.headers()['content-type'], fromServiceWorker: response.fromServiceWorker() });
    }
  });
  await page.goto(`${base}/app/projects`);
  await page.getByTestId('project-dashboard').waitFor();
  pass('dashboard opens');
  await createProject('Closure static acceptance', 'plain', 'blank');
  await page.waitForURL(/\/app\/projects\/[^/]+\/editor/);
  const projectUrl = page.url(), id = new URL(projectUrl).pathname.split('/')[3];
  evidence.projectId = id;
  pass('new Static Editor project created through UI', { id });
  await page.locator('[data-testid="code-column"] .monaco-editor').first().waitFor({ timeout: 60000 });
  await poll(async () => await page.locator('[data-testid="code-column"] .monaco-editor').count() === 3, 'three real Monaco instances');
  pass('HTML CSS and JavaScript Monaco instances mounted');
  const html = '<!doctype html><html><body><h1 id="closure">STATIC_HTML_EXACT</h1></body></html>';
  const css = '#closure { color: rgb(12, 34, 56); }';
  const js = 'document.querySelector("#closure").textContent = "STATIC_JS_EXECUTED";';
  for (const [index, language, source] of [[0, 'html', html], [1, 'css', css], [2, 'javascript', js]]) {
    const input = page.locator('[data-testid="code-column"] .monaco-editor').nth(index).locator('textarea.inputarea');
    await page.evaluate((source) => navigator.clipboard.writeText(source), source);
    await input.focus(); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.press('ControlOrMeta+V');
    const path = ['index.html', 'style.css', 'script.js'][index];
    await poll(async () => (await savedFiles(id))[path] === source, `real ${language} keyboard input reaches project storage`);
    pass(`${language} accepts keyboard input and exact source`);
  }
  await poll(async () => {
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const matches = await frame.evaluate(() => {
        const node = document.querySelector('#closure');
        return node?.textContent === 'STATIC_JS_EXECUTED' && getComputedStyle(node).color === 'rgb(12, 34, 56)';
      }).catch(() => false);
      if (matches) return true;
    }
    return false;
  }, 'HTML CSS and JS execute in live preview');
  pass('real live preview reflects HTML CSS and JavaScript');
  const expected = { 'index.html': html, 'style.css': css, 'script.js': js };
  evidence.expectedSources = expected;
  await poll(async () => {
    const files = await savedFiles(id);
    return Object.keys(files).length === 3 && Object.entries(expected).every(([path, content]) => files[path] === content);
  }, 'exact IndexedDB sources');
  assert.deepEqual(await savedFiles(id), expected);
  pass('all three exact sources saved to IndexedDB');
  await page.screenshot({ path: `reports/closure-static-${tag}-working.png`, fullPage: true });
  await page.reload(); await page.locator('.monaco-editor').first().waitFor({ timeout: 60000 });
  assert.deepEqual(await savedFiles(id), expected); pass('reload retains exact sources');
  await page.goto(`${base}/app/projects`); await page.getByTestId('project-dashboard').waitFor();
  await page.getByTestId('dashboard-project-item').filter({ hasText: 'Closure static acceptance' }).getByTestId('dashboard-open-project').click();
  await page.locator('.monaco-editor').first().waitFor({ timeout: 60000 });
  assert.deepEqual(await savedFiles(id), expected); pass('dashboard reopen retains edits');
  await page.goto(`${base}/app/projects`); await page.getByTestId('project-dashboard').waitFor();
  await createProject('Closure advanced isolation', 'vscode', 'empty');
  await page.getByTestId('vscode-mode').waitFor({ timeout: 60000 });
  await page.goto(projectUrl); await page.locator('.monaco-editor').first().waitFor({ timeout: 60000 });
  assert.deepEqual(await savedFiles(id), expected); pass('Advanced IDE switch preserves Static Editor data');
  evidence.workerStats = await page.evaluate(() => window.__gbCoderWorkerStats);
  assert.ok(evidence.workerStats.html > 0 && evidence.workerStats.css > 0 && evidence.workerStats.typescript > 0);
  assert.equal(evidence.failedRequests.some((request) => /monaco|\.worker/.test(request.url)), false, 'editor and workers must load successfully');
  assert.equal(evidence.responses.some((response) => /cdn\.jsdelivr\.net\/npm\/monaco-editor@/.test(response.url)), false, 'Monaco bootstrap must be same-origin');
  assert.equal(evidence.pageErrors.some((error) => /Could not find source file|monaco|\.worker/.test(error.message + error.stack)), false, 'Monaco worker errors must not occur');
  pass('Monaco workers execute', evidence.workerStats);
} catch (error) {
  evidence.results.push({ name: 'Static Editor acceptance', status: 'FAIL', error: error.stack });
  console.error(error); process.exitCode = 1;
  if (page) {
    evidence.savedFiles = evidence.projectId ? await savedFiles(evidence.projectId).catch(() => null) : null;
    await page.screenshot({ path: `reports/closure-static-${tag}-failure.png`, fullPage: true }).catch(() => {});
    evidence.bodyText = await page.locator('body').innerText().catch(() => '');
  }
} finally {
  if (page) evidence.serviceWorker = await page.evaluate(async () => ({ controller: navigator.serviceWorker.controller?.scriptURL,
    registrations: (await navigator.serviceWorker.getRegistrations()).map((registration) => registration.scope) })).catch(() => null);
  await context?.close(); await browser?.close(); server.kill();
  await fs.writeFile(`reports/closure-static-${tag}.json`, JSON.stringify(evidence, null, 2));
  console.log(`${evidence.results.filter((result) => result.status === 'PASS').length} passed; ${evidence.results.filter((result) => result.status === 'FAIL').length} failed`);
}
