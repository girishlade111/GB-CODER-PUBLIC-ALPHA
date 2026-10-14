#!/usr/bin/env node
/**
 * GB Coder — Post-E3 project-flow editor-lifecycle journeys (Playwright).
 *
 * Real Chromium against the local unified build (scripts/preview-combined.mjs
 * over dist/). Disposable contexts, synthetic PF-* projects only.
 *
 *  NAV-01..06  landing -> dashboard-first, correct-editor open, back/forward
 *  ST-01..05   static restore vs fresh start (real Monaco + IndexedDB)
 *  IDE-01..04  truly-empty IDE, exact tree, template-once, idle no-npm
 *  WC-01/02/04/06/07 idle lifecycle, switch cancellation, live preview
 *  WC-03       explicit npm project triggers install + dev server + preview
 *  DATA-01     pre-existing IndexedDB records survive the journeys
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 4191;
// NOTE: preview-combined binds 127.0.0.1 only; `localhost` may resolve to
// ::1 and refuse. Every other suite in this repo uses 127.0.0.1 too.
const BASE = `http://127.0.0.1:${PORT}`;
const APP = `${BASE}/app`;

const results = {};
const order = [];
const failures = [];
function record(id, status, note = '') {
  results[id] = { status, note };
  order.push(id);
  console.log(`[${status}] ${id}${note ? ' — ' + note : ''}`);
}

async function healthOk() {
  // node:http, not global fetch: matches every other suite in this repo and
  // avoids environment-specific undici behavior on local ports.
  return new Promise((resolve) => {
    const req = http.get(`${BASE}/api/health`, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
  });
}

async function startServer() {
  if (await healthOk()) {
    console.log('reusing already-running preview server');
    return null;
  }
  const child = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
  const deadline = Date.now() + 45000;
  for (;;) {
    if (await healthOk()) return child;
    if (child.exitCode !== null && child.exitCode !== 1) throw new Error(`preview server exited early (code ${child.exitCode})`);
    // Exit 1 is typically EADDRINUSE against an already-booting server on the
    // same port: keep polling it rather than failing the whole run.
    if (Date.now() >= deadline) {
      try { child.kill(); } catch {}
      throw new Error('preview server never came up');
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function seedProjects(page, specs) {
  await page.evaluate((list) => {
    const openDb = () => new Promise((resolve, reject) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
        if (!db.objectStoreNames.contains('projectFiles')) db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return openDb().then((db) => {
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      for (const s of list) {
        tx.objectStore('projects').put({ id: s.id, name: s.name, createdAt: now - 60000, lastOpenedAt: now, editorStyle: s.editorStyle, projectType: s.projectType, fileCount: s.files.length });
        for (const f of s.files) tx.objectStore('projectFiles').put({ projectId: s.id, path: f.path, content: f.content });
      }
      return new Promise((res) => { tx.oncomplete = res; });
    });
  }, specs);
}

async function idbFiles(page, pid) {
  return page.evaluate((id) => new Promise((res) => {
    const out = {};
    const r = indexedDB.open('gb-coder-projects-db', 1);
    r.onsuccess = () => {
      const tx = r.result.transaction(['projectFiles'], 'readonly');
      const g = tx.objectStore('projectFiles').getAll();
      g.onsuccess = () => {
        for (const f of g.result) if (f.projectId === id) out[f.path] = f.content;
        res(out);
      };
      g.onerror = () => res(out);
    };
    r.onerror = () => res(out);
  }), pid);
}

async function waitIdbToken(page, pid, p, token, ms, label) {
  const end = Date.now() + ms;
  for (;;) {
    const files = await idbFiles(page, pid);
    if ((files[p] || '').includes(token)) return;
    if (Date.now() >= end) throw new Error(`idb timeout: ${label}`);
    await page.waitForTimeout(750);
  }
}

async function previewHas(page, marker, ms = 45000) {
  const end = Date.now() + ms;
  for (;;) {
    const hit = await page.evaluate((m) => {
      for (const fr of document.querySelectorAll('iframe')) {
        try { const d = fr.contentDocument; if (d && (d.body?.innerText || '').includes(m)) return true; } catch {}
      }
      const col = document.querySelector('[data-testid="preview-column"]');
      if (col && col.innerText.includes(m)) return true;
      return false;
    }, marker);
    if (hit) return;
    if (Date.now() >= end) throw new Error(`preview timeout: ${marker}`);
    await page.waitForTimeout(1000);
  }
}

async function monacoValues(page) {
  return page.evaluate(() => {
    try {
      const api = window.monaco?.editor;
      if (!api) return null;
      return api.getModels().map((m) => { try { return m.getValue(); } catch { return null; } });
    } catch { return null; }
  });
}

async function termText(page) {
  return page.evaluate(() => document.querySelector('.xterm-rows')?.innerText || '');
}

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  // Onboarding flag only. Recovery autosaves are seeded per-scenario via
  // evaluate: init scripts re-run on every navigation and would resurrect
  // snapshots that later reloads must not see again.
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

const browser = await chromium.launch({ headless: true });
const server = await startServer();
try {
  // ---------- NAV-01/02/03: landing CTAs all land on the dashboard ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const body = await page.evaluate(() => document.body.innerText);
      assert.ok(body.includes('GB Coder'), 'branding present');
      const hrefs = await page.locator('a[href^="/app"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
      assert.ok(hrefs.length >= 2, `landing has app CTAs (found ${hrefs.length})`);
      for (const h of hrefs) assert.ok(h === '/app' || h.startsWith('/app#') || h.startsWith('/app?'), `CTA targets dashboard entry, got ${h}`);
      await Promise.all([
        page.waitForURL(/\/app/, { timeout: 15000 }),
        page.locator('#heroStartBtn').click(),
      ]);
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'no editor auto-opened');
      record('NAV-01', 'PASS', `Start Coding -> dashboard, ${hrefs.length} CTAs all target /app`);
    } catch (e) { failures.push(`NAV-01: ${e.message}`); record('NAV-01', 'FAIL', String(e.message).slice(0, 200)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- NAV: pointer present but dashboard entry never auto-opens ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'pf-nav', name: 'PF-Nav', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>PFNAV</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }]);
      await page.evaluate(() => window.localStorage.setItem('gb-coder-active-project-id', 'pf-nav'));
      await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'pointer ignored on dashboard entry');
      await page.locator('text=PF-Nav').first().waitFor({ timeout: 15000 });
      record('NAV-03', 'PASS', 'dashboard first despite stored pointer; recent card listed');
    } catch (e) { failures.push(`NAV-03: ${e.message}`); record('NAV-03', 'FAIL', String(e.message).slice(0, 200)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- NAV-04 + NAV-06: correct editor open, back/forward ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'pf-plain', name: 'PF-Plain', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PFPLAIN-V1</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'pf-ide', name: 'PF-IDE', editorStyle: 'vscode', projectType: 'react',
          files: [{ path: 'src/main.jsx', content: 'PFIDE-TREE\n' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=PF-Plain').first().click();
      await page.waitForURL(/\/app\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('PFPLAIN-V1'), undefined, { timeout: 60000, polling: 500 });
      assert.equal(await page.locator('[data-testid="vscode-mode"]').count(), 0, 'plain opens static, not IDE');
      record('NAV-04a', 'PASS', 'plain project -> /app/editor static editor');

      await page.goBack();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      record('NAV-06a', 'PASS', 'Back from editor -> dashboard');
      await page.goForward();
      await page.waitForURL(/\/app\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('PFPLAIN-V1'), undefined, { timeout: 60000, polling: 500 });
      record('NAV-06b', 'PASS', 'Forward -> editor reopens with content');

      await page.locator('[data-testid="nav-home"]').click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('text=PF-IDE').first().click();
      await page.waitForURL(/\/app\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      record('NAV-04b', 'PASS', 'vscode project -> /app/ide advanced IDE');
    } catch (e) { failures.push(`NAV-04/06: ${e.message}`); record('NAV-04/06', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- NAV-05: new-project options ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-modal"]').waitFor({ timeout: 10000 });
      await page.locator('[data-testid="new-project-style-plain"]').waitFor({ timeout: 8000 });
      await page.locator('[data-testid="new-project-template-starter"]').waitFor({ timeout: 8000 });
      await page.locator('[data-testid="new-project-template-blank"]').waitFor({ timeout: 8000 });
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-empty"]').waitFor({ timeout: 8000 });
      await page.locator('[data-testid="new-project-template-react"]').waitFor({ timeout: 8000 });
      await page.locator('[data-testid="new-project-template-vue"]').waitFor({ timeout: 8000 });
      assert.equal(await page.locator('[data-testid="new-project-template-starter"]').count(), 0, 'starter hidden for IDE');
      record('NAV-05', 'PASS', 'static starter/blank + IDE empty/react/vue offered');
    } catch (e) { failures.push(`NAV-05: ${e.message}`); record('NAV-05', 'FAIL', String(e.message).slice(0, 200)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- ST-01..05: restore vs fresh start ----------
  //
  // NOTE: the recovery autosave is seeded via evaluate (storage write), NOT
  // via addInitScript: init scripts re-run on every navigation and would
  // resurrect the very snapshot Fresh Start is meant to leave behind.
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'pf-st', name: 'PF-Static', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>ST-ORIGINAL</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }]);
      await page.evaluate(() => {
        window.localStorage.setItem('gb-coder-active-project-id', 'pf-st');
        window.localStorage.setItem('gbcoder_autosave_current', JSON.stringify({
          project: { projectType: 'plain', files: [
            { path: 'index.html', content: '<h1>ST-OLD-RESTORE</h1>', language: 'html' },
            { path: 'style.css', content: '.st-old{color:red}', language: 'css' },
            { path: 'script.js', content: 'window.__STOLD=7;', language: 'javascript' },
          ] },
          openPaths: ['index.html'], activePath: 'index.html', externalLibraries: [],
          settings: { autoSaveEnabled: true }, lastModified: new Date().toISOString(),
        }));
      });
      await page.goto(`${APP}/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('ST-ORIGINAL'), undefined, { timeout: 60000, polling: 500 });
      // Recovery prompt from the seeded autosave slot.
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /restore session/i }).click();
      await page.waitForFunction(() => document.body.innerText.includes('ST-OLD-RESTORE'), undefined, { timeout: 30000, polling: 500 });
      const vals = await monacoValues(page);
      if (vals) {
        const joined = vals.join('\n');
        assert.ok(joined.includes('ST-OLD-RESTORE'), 'monaco html restored');
        assert.ok(joined.includes('.st-old'), 'monaco css restored');
        assert.ok(joined.includes('__STOLD'), 'monaco js restored');
      }
      await previewHas(page, 'ST-OLD-RESTORE');
      record('ST-01', 'PASS', 'restore recovers exact html/css/js + preview');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /start fresh/i }).click();
      await page.waitForTimeout(2500);
      const vals2 = await monacoValues(page);
      if (vals2) assert.ok(vals2.every((v) => v === ''), `fresh buffers genuinely empty (got ${JSON.stringify(vals2).slice(0, 120)})`);
      const bodyAfter = await page.evaluate(() => document.body.innerText);
      assert.ok(!bodyAfter.includes('ST-OLD-RESTORE'), 'no old code in editor');
      const stored = await idbFiles(page, 'pf-st');
      assert.ok((stored['index.html'] || '').includes('ST-ORIGINAL'), 'saved project untouched by fresh start');
      record('ST-02/03', 'PASS', 'fresh start blank; saved project intact');

      // Stale callbacks must not rehydrate: wait past debounce/autosave, reload,
      // then observe for a full boot window — the recovery prompt must never
      // appear (the post-fresh autosave holds no recoverable content).
      await page.waitForTimeout(4000);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.length > 100, undefined, { timeout: 60000, polling: 500 });
      let phantom = false;
      for (let i = 0; i < 12; i++) {
        await page.waitForTimeout(2500);
        const b = await page.evaluate(() => document.body.innerText);
        if (b.includes('ST-OLD-RESTORE') || b.includes('Session Recovered')) { phantom = true; break; }
      }
      assert.ok(!phantom, 'blank survives reload, no phantom recovery');
      const vals3 = await monacoValues(page);
      if (vals3) assert.ok(vals3.every((v) => v === ''), 'blank after reload');
      record('ST-04/05', 'PASS', 'no stale rehydration; blank after rerender+reload');
    } catch (e) { failures.push(`ST: ${e.message}`); record('ST', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- IDE-01 + WC-01/02: empty IDE stays empty and idle ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-empty"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('PF-Empty-IDE');
      await page.locator('[data-testid="new-project-create"]').click();
      await page.waitForURL(/\/app\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('[data-testid="vscode-empty-state"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('[data-testid="tree-file"]').count(), 0, 'zero default files');
      const treeText = await page.locator('[data-testid="vscode-file-tree"]').evaluateAll(
        (els) => els.map((e) => e.innerText).join('\n'),
      ).catch(() => '');
      assert.ok(!/index\.html|package\.json/.test(treeText), 'no synthetic starter files');
      record('IDE-01', 'PASS', 'empty IDE: zero files, welcome state');

      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      let sawInstall = false;
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(3000);
        const t = await termText(page);
        if (/Installing dependencies|npm install|npm run dev/.test(t)) { sawInstall = true; break; }
      }
      assert.equal(sawInstall, false, 'no automatic npm work without a project');
      const idleBody = await page.evaluate(() => document.body.innerText);
      assert.ok(!idleBody.includes('Installing Dependencies'), 'no indefinite installing spinner');
      record('WC-01/02', 'PASS', 'container boots to shell; zero npm commands idle');
    } catch (e) { failures.push(`IDE-01/WC-01: ${e.message}`); record('IDE-01/WC-01', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- IDE-02 + WC-04: exact tree, no package.json => stays idle ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'pf-tree', name: 'PF-Tree', editorStyle: 'vscode', projectType: 'react',
        files: [
          { path: 'src/main.jsx', content: 'PF-TREE-KEEP\n' },
          { path: 'src/App.jsx', content: 'export default 1\n' },
          { path: 'notes.txt', content: 'plain notes, no npm here\n' },
        ] }]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=PF-Tree').first().click();
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('[data-testid="tree-file"][data-path="src/main.jsx"]').waitFor({ timeout: 30000 });
      const paths = await page.locator('[data-testid="tree-file"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-path')).sort());
      assert.deepEqual(paths, ['notes.txt', 'src/App.jsx', 'src/main.jsx']);
      record('IDE-02', 'PASS', 'exact file tree preserved, no injected starters');

      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      let sawInstall = false;
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install/.test(await termText(page))) { sawInstall = true; break; }
      }
      assert.equal(sawInstall, false, 'no package.json => no install/dev');
      record('WC-04', 'PASS', 'non-npm project stays idle');
    } catch (e) { failures.push(`IDE-02/WC-04: ${e.message}`); record('IDE-02/WC-04', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- IDE-03: explicit react template creates only intended files ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-react"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('PF-React-Tpl');
      await page.locator('[data-testid="new-project-create"]').click();
      await page.waitForURL(/\/app\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="tree-file"][data-path="package.json"]').waitFor({ timeout: 60000 });
      const paths = await page.locator('[data-testid="tree-file"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-path')).sort());
      assert.deepEqual(paths, ['App.jsx', 'index.css', 'main.jsx', 'package.json']);
      const pid = await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id'));
      const stored = await idbFiles(page, pid);
      assert.deepEqual(Object.keys(stored).sort(), ['App.jsx', 'index.css', 'main.jsx', 'package.json']);
      record('IDE-03', 'PASS', 'react template generated once with intended files');
    } catch (e) { failures.push(`IDE-03: ${e.message}`); record('IDE-03', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- WC-06 + WC-07 + DATA-01: switch cancels stale work; preview live; control intact ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'pf-ctrl', name: 'PF-Control', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PFCTRL-INTACT</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'pf-npm', name: 'PF-Npm', editorStyle: 'vscode', projectType: 'react',
          files: [
            { path: 'package.json', content: '{"name":"pfnpm","private":true,"type":"module","dependencies":{"react":"^18.3.1"}}' },
            { path: 'src/a.jsx', content: 'export const KEEP_PFNPM = 1;\n' },
          ] },
        { id: 'pf-live', name: 'PF-Live', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PFLIVE-V1</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=PF-Npm').first().click();
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      // Explicit project load triggers startup dispatch (bounded: dispatch, not full ready).
      let dispatched = false;
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install/.test(await termText(page))) { dispatched = true; break; }
      }
      assert.ok(dispatched, 'explicit npm project triggers startup');
      record('WC-03a', 'PASS', 'explicit npm project triggers install dispatch');

      // Switch away mid-startup: stale work must not corrupt either side.
      await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('text=PF-Live').first().click();
      await page.waitForURL(/\/app\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('PFLIVE-V1'), undefined, { timeout: 60000, polling: 500 });
      record('WC-06', 'PASS', 'project switch away from starting IDE lands cleanly');

      // Monaco edit -> live preview on the loaded project.
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => { const ta = document.querySelector('.monaco-editor textarea'); if (ta) ta.focus(); });
      await page.keyboard.type('PFLIVE-V2', { delay: 5 });
      await previewHas(page, 'PFLIVE-V2');
      await waitIdbToken(page, 'pf-live', 'index.html', 'PFLIVE-V2', 60000, 'live edit persisted');
      record('WC-07', 'PASS', 'monaco edit updates live preview + persists');

      const ctrl = await idbFiles(page, 'pf-ctrl');
      assert.ok((ctrl['index.html'] || '').includes('PFCTRL-INTACT'), 'control record byte-intact');
      record('DATA-01', 'PASS', 'pre-existing project untouched by journeys');
    } catch (e) { failures.push(`WC/DATA: ${e.message}`); record('WC/DATA', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ---------- WC-03 full: npm install to dev-server ready + rendered preview ----------
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'pf-full', name: 'PF-Full', editorStyle: 'vscode', projectType: 'react',
        files: [
          { path: 'package.json', content: '{"name":"pffull","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-react":"^4.3.0"}}' },
          { path: 'vite.config.js', content: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n" },
          { path: 'index.html', content: '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>' },
          { path: 'src/main.jsx', content: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('root')).render(<h1>PFFULL-V1</h1>);\n" },
        ] }]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=PF-Full').first().click();
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.waitForFunction(
        () => /ready in \d+\s?ms/i.test(document.querySelector('.xterm-rows')?.innerText || ''),
        undefined, { timeout: 300000, polling: 2000 },
      );
      // Dev server is up. Rendered-content proof inside the cross-origin
      // preview frame is unreadable by design (SOP), so wiring is verified
      // instead: the address bar carries the live container URL and the
      // preview iframe is bound to it.
      await page.waitForFunction(
        () => document.body.innerText.includes('local-corp.webcontainer-api.io'),
        undefined, { timeout: 90000, polling: 2000 },
      );
      const frameSrc = await page.locator('[data-testid="preview-iframe"]').first().getAttribute('src').catch(() => null);
      assert.ok(frameSrc && frameSrc.startsWith('http'), `preview iframe bound to dev server (${(frameSrc || '').slice(0, 60)})`);
      const termErrs = await termText(page);
      assert.ok(!/npm ERR!|EADDRINUSE|Cannot find module/.test(termErrs), 'no install/serve errors in terminal');
      await waitIdbToken(page, 'pf-full', 'src/main.jsx', 'PFFULL-V1', 30000, 'full project intact');
      record('WC-03', 'PASS', 'install -> dev ready -> preview wired to live URL');
    } catch (e) { failures.push(`WC-03: ${e.message}`); record('WC-03', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }
} catch (e) {
  record('FATAL', 'FAIL', String(e.message).slice(0, 300));
} finally {
  await browser.close();
  if (server) server.kill();
}

console.log(`\nE2E SUMMARY: ${order.length} checks, ${failures.length} failing`);
process.exit(failures.length ? 1 : 0);
