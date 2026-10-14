#!/usr/bin/env node
/**
 * GB Coder — Stage R1 canonical routing & deep-link journeys (Playwright).
 *
 * Real Chromium against the local unified build (scripts/preview-combined.mjs
 * over dist/). Disposable contexts, synthetic RT-* data only.
 *
 * Part 1 (node:http, no browser): ROUTE-01..05, 26-headers, 28, invalid-path 404.
 * Part 2 (browser): ROUTE-06..24, 26-isolation, 27, 29, 30 (+ ROUTE-25 backup).
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import JSZip from 'jszip';

const PORT = 4192;
// NOTE: preview-combined binds 127.0.0.1 only; `localhost` may resolve to
// ::1 and refuse. node:http (not undici fetch) for all static probing.
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

function httpGet(path) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', (e) => resolve({ status: -1, headers: {}, body: String(e.message) }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: -1, headers: {}, body: 'timeout' }); });
  });
}

async function healthOk() {
  const r = await httpGet('/api/health');
  return r.status === 200;
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

async function projectIds(page) {
  return page.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('gb-coder-projects-db', 1);
    r.onsuccess = () => {
      const g = r.result.transaction(['projects'], 'readonly').objectStore('projects').getAll();
      g.onsuccess = () => res(g.result.map((p) => p.id).sort());
      g.onerror = () => res([]);
    };
    r.onerror = () => res([]);
  }));
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

async function termText(page) {
  return page.evaluate(() => document.querySelector('.xterm-rows')?.innerText || '');
}

async function newPage(browser, acceptDownloads) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: !!acceptDownloads });
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

const browser = await chromium.launch({ headless: true });
const server = await startServer();
try {
  // ---------- Part 1: static Astro + headers (no browser) ----------
  {
    try {
      const home = await httpGet('/');
      assert.equal(home.status, 200, 'homepage 200');
      assert.ok(home.body.includes('GB Coder'), 'branding');
      const ctas = [...home.body.matchAll(/href="(\/app[^"]*)"/g)].map((m) => m[1]);
      assert.ok(ctas.length >= 2, 'app CTAs present');
      assert.ok(ctas.every((h) => h === '/app/projects' || h.startsWith('/app/projects#') || h.startsWith('/app/projects?')), `CTAs target /app/projects, got ${ctas.join(',')}`);
      record('ROUTE-01/17', 'PASS', `homepage 200, ${ctas.length} CTAs all -> /app/projects`);
    } catch (e) { failures.push(`ROUTE-01/17: ${e.message}`); record('ROUTE-01/17', 'FAIL', String(e.message).slice(0, 200)); }
  }
  {
    const pages = [
      ['ROUTE-02', '/about', 'About GB Coder'],
      ['ROUTE-03', '/privacy-policy', 'Privacy Policy'],
      ['ROUTE-04', '/terms-and-conditions', 'Terms &amp; Conditions'],
      ['ROUTE-05', '/contact', 'girishlade111@gmail.com'],
    ];
    for (const [id, path, marker] of pages) {
      try {
        const r = await httpGet(path);
        assert.equal(r.status, 200, `${path} 200`);
        assert.ok(r.body.includes('<title>'), 'has title');
        assert.ok(r.body.includes(marker), `marker present: ${marker.slice(0, 30)}`);
        assert.ok(r.body.includes(`rel="canonical" href="https://code.ladestack.in${path}"`), 'canonical metadata');
        assert.ok(!r.body.includes('monaco-editor') && !r.body.includes('@webcontainer/api'), 'no IDE runtime leak');
        if (id === 'ROUTE-05') assert.ok(!/<form[\s>]/.test(r.body), 'contact page has no form (by design)');
        record(id, 'PASS', `${path} direct URL ok`);
      } catch (e) { failures.push(`${id}: ${e.message}`); record(id, 'FAIL', String(e.message).slice(0, 200)); }
    }
  }
  {
    try {
      const bad = await httpGet('/definitely-not-a-page');
      assert.equal(bad.status, 404, 'unknown marketing path 404s');
      assert.ok(!bad.body.includes('id="root"'), '404 does not render the editor shell');
      record('ROUTE-404', 'PASS', 'invalid marketing path 404s without editor');
    } catch (e) { failures.push(`ROUTE-404: ${e.message}`); record('ROUTE-404', 'FAIL', String(e.message).slice(0, 200)); }
  }
  {
    try {
      const deep = await httpGet('/app/projects/abc123/ide');
      assert.equal(deep.status, 200, 'nested route serves shell');
      assert.ok(deep.body.includes('id="root"'), 'React shell served');
      assert.equal(deep.headers['cross-origin-opener-policy'], 'same-origin', 'COOP on nested route');
      assert.equal(deep.headers['cross-origin-embedder-policy'], 'require-corp', 'COEP on nested route');
      const sw = await httpGet('/app/sw.js');
      assert.equal(sw.status, 200, 'sw.js 200');
      assert.ok(sw.body.length > 1000, 'sw substantial');
      const asset = await httpGet('/favicon.ico');
      assert.ok([200, 404].includes(asset.status), 'favicon route sane');
      record('ROUTE-26/28', 'PASS', 'nested shell + isolation headers + assets resolve');
    } catch (e) { failures.push(`ROUTE-26/28: ${e.message}`); record('ROUTE-26/28', 'FAIL', String(e.message).slice(0, 200)); }
  }

  // ---------- Part 2: browser journeys ----------
  // ROUTE-06/07/16: dashboard entries never auto-open
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'rt-dash', name: 'RT-Dash', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>RTDASH</h1>' }] }]);
      await page.evaluate(() => window.localStorage.setItem('gb-coder-active-project-id', 'rt-dash'));
      for (const url of [`${APP}/`, `${APP}/projects`]) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
        assert.equal(await page.locator('.monaco-editor').count(), 0, `no auto-open at ${url}`);
      }
      record('ROUTE-06/07/16', 'PASS', '/app + /app/projects dashboard-first with pointer set');
    } catch (e) { failures.push(`ROUTE-06/07/16: ${e.message}`); record('ROUTE-06/07/16', 'FAIL', String(e.message).slice(0, 200)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-08: /new shows creation UI, creates nothing on open/refresh
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(`${APP}/projects/new`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="new-project-modal"]').waitFor({ timeout: 15000 });
      const before = await projectIds(page);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="new-project-modal"]').waitFor({ timeout: 15000 });
      const after = await projectIds(page);
      assert.deepEqual(after, before, 'refreshing /new creates nothing');
      await page.locator('[data-testid="new-project-cancel"]').click();
      await page.waitForURL(/\/app\/projects\/?$/, { timeout: 15000 });
      record('ROUTE-08', 'PASS', '/new shows creation UI; open+refresh create nothing; cancel canonicalizes');
    } catch (e) { failures.push(`ROUTE-08: ${e.message}`); record('ROUTE-08', 'FAIL', String(e.message).slice(0, 200)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-09/10: dashboard opens land on canonical project URLs
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'rt-plain', name: 'RT-Plain', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTPLAIN</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'rt-ide', name: 'RT-IDE', editorStyle: 'vscode', projectType: 'react',
          files: [{ path: 'src/main.jsx', content: 'RTIDE\n' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=RT-Plain').first().click();
      await page.waitForURL(/\/app\/projects\/rt-plain\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTPLAIN'), undefined, { timeout: 60000, polling: 500 });
      record('ROUTE-09', 'PASS', 'static open -> /app/projects/:id/editor');
      await page.locator('[data-testid="nav-home"]').click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('text=RT-IDE').first().click();
      await page.waitForURL(/\/app\/projects\/rt-ide\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      record('ROUTE-10', 'PASS', 'advanced open -> /app/projects/:id/ide');
    } catch (e) { failures.push(`ROUTE-09/10: ${e.message}`); record('ROUTE-09/10', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-11/12/29/30: deep link, refresh, back/forward, id stability, no duplication
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'rt-deep', name: 'RT-Deep', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTDEEP-V1</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'rt-deep2', name: 'RT-Deep2', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTDEEP2</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      const idsBefore = await projectIds(page);
      // Hard deep link with NO pointer set: URL alone must resolve.
      await page.evaluate(() => window.localStorage.removeItem('gb-coder-active-project-id'));
      await page.goto(`${APP}/projects/rt-deep/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTDEEP-V1'), undefined, { timeout: 60000, polling: 500 });
      const ptr = await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id'));
      assert.equal(ptr, 'rt-deep', 'deep link persists selection');
      // Hard refresh on the nested route.
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTDEEP-V1'), undefined, { timeout: 60000, polling: 500 });
      assert.ok(page.url().includes('/app/projects/rt-deep/editor'), 'URL still canonical after refresh');
      record('ROUTE-11', 'PASS', 'deep link + hard refresh preserve editor + selection');
      // Back to dashboard, forward back, then cross-project deep link.
      await page.locator('[data-testid="nav-home"]').click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.goBack();
      await page.waitForFunction(() => document.body.innerText.includes('RTDEEP-V1'), undefined, { timeout: 60000, polling: 500 });
      await page.goForward();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.goto(`${APP}/projects/rt-deep2/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTDEEP2'), undefined, { timeout: 60000, polling: 500 });
      const ptr2 = await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id'));
      assert.equal(ptr2, 'rt-deep2', 'id follows the URL, not the old project');
      const idsAfter = await projectIds(page);
      assert.deepEqual(idsAfter, idsBefore, 'no duplication across refresh/back/forward');
      record('ROUTE-12/29/30', 'PASS', 'back/forward correct; ids stable; zero duplication');
    } catch (e) { failures.push(`ROUTE-11/12/29/30: ${e.message}`); record('ROUTE-11/12/29/30', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-13/14: invalid + cross-profile deep links recover safely
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'rt-real', name: 'RT-Real', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>RTREAL</h1>' }] }]);
      await page.goto(`${APP}/projects/no-such-project-xyz/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });
      const body = await page.evaluate(() => document.body.innerText);
      assert.ok(!body.includes('RTREAL'), 'never shows another project');
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'never an editor');
      assert.deepEqual(await projectIds(page), ['rt-real'], 'no records created');
      await page.locator('[data-testid="unavailable-dashboard"]').click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      record('ROUTE-13', 'PASS', 'invalid id -> safe recovery, nothing created');
    } catch (e) { failures.push(`ROUTE-13: ${e.message}`); record('ROUTE-13', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }
  {
    // Clean profile: valid-looking id, zero local records.
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(`${APP}/projects/abc123/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });
      const body = await page.evaluate(() => document.body.innerText);
      assert.ok(/not available on this device/i.test(body), 'cross-device limitation stated');
      assert.deepEqual(await projectIds(page), [], 'clean profile gains nothing');
      await page.locator('[data-testid="unavailable-import"]').click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      record('ROUTE-14', 'PASS', 'clean-profile deep link states the limit, offers import, creates nothing');
    } catch (e) { failures.push(`ROUTE-14: ${e.message}`); record('ROUTE-14', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-15: legacy routes keep working
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'rt-leg', name: 'RT-Leg', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>RTLEG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }]);
      await page.evaluate(() => window.localStorage.setItem('gb-coder-active-project-id', 'rt-leg'));
      await page.goto(`${APP}/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTLEG'), undefined, { timeout: 60000, polling: 500 });
      assert.ok(page.url().includes('/app/projects/rt-leg/editor'), `legacy canonicalized, got ${page.url()}`);
      // No pointer: legacy editor falls back to dashboard.
      await page.evaluate(() => window.localStorage.removeItem('gb-coder-active-project-id'));
      await page.goto(`${APP}/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      // No pointer: legacy IDE stays a valid idle shell.
      await page.goto(`${BASE}/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('[data-testid="vscode-empty-state"]').waitFor({ timeout: 30000 });
      record('ROUTE-15', 'PASS', 'legacy editor/ide canonicalize or degrade gracefully');
    } catch (e) { failures.push(`ROUTE-15: ${e.message}`); record('ROUTE-15', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-18/19/20: empty IDE reload, fresh-start draft URL, restore identity
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-empty"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('RT-Empty');
      await page.locator('[data-testid="new-project-create"]').click();
      await page.waitForURL(/\/app\/projects\/.+\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="vscode-empty-state"]').waitFor({ timeout: 30000 });
      const emptyUrl = page.url();
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-empty-state"]').waitFor({ timeout: 60000 });
      assert.equal(await page.locator('[data-testid="tree-file"]').count(), 0, 'still zero files');
      assert.equal(page.url(), emptyUrl, 'empty URL stable across reload');
      record('ROUTE-18', 'PASS', 'empty IDE remains empty with a stable URL');
    } catch (e) { failures.push(`ROUTE-18: ${e.message}`); record('ROUTE-18', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'rt-a', name: 'RT-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTA-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'rt-b', name: 'RT-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTB-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.evaluate(() => {
        window.localStorage.setItem('gb-coder-active-project-id', 'rt-a');
        window.localStorage.setItem('gbcoder_autosave_current', JSON.stringify({
          project: { projectType: 'plain', files: [
            { path: 'index.html', content: '<h1>RTA-DRAFT</h1>', language: 'html' },
            { path: 'style.css', content: '', language: 'css' },
            { path: 'script.js', content: '', language: 'javascript' },
          ] },
          openPaths: [], activePath: null, externalLibraries: [],
          settings: { autoSaveEnabled: true }, lastModified: new Date().toISOString(),
        }));
      });
      await page.goto(`${APP}/projects/rt-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /restore session/i }).click();
      await page.waitForFunction(() => document.body.innerText.includes('RTA-DRAFT'), undefined, { timeout: 30000, polling: 500 });
      assert.ok(page.url().includes('/app/projects/rt-a/editor'), 'restore keeps project A URL');
      record('ROUTE-20', 'PASS', 'restore recovers project A under its own URL');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /start fresh/i }).click();
      await page.waitForTimeout(3000);
      assert.ok(/\/app\/projects\/.+\/editor/.test(page.url()), `fresh draft has canonical URL, got ${page.url()}`);
      assert.ok(!page.url().includes('rt-a'), 'draft is not associated with project A');
      const bFiles = await idbFiles(page, 'rt-b');
      assert.ok((bFiles['index.html'] || '').includes('RTB-ORIG'), 'project B untouched');
      record('ROUTE-19', 'PASS', 'fresh start gets its own canonical draft URL; others intact');
    } catch (e) { failures.push(`ROUTE-19/20: ${e.message}`); record('ROUTE-19/20', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-21/22/23/24: idle vs startup on canonical URLs + hot reload
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'rt-nonpm', name: 'RT-NoNpm', editorStyle: 'vscode', projectType: 'react',
          files: [{ path: 'src/a.jsx', content: 'export const K=1;\n' }] },
        { id: 'rt-npm', name: 'RT-Npm', editorStyle: 'vscode', projectType: 'react',
          files: [{ path: 'package.json', content: '{"name":"rtnpm","private":true,"type":"module","dependencies":{"react":"^18.3.1"}}' }, { path: 'src/a.jsx', content: 'export const K=1;\n' }] },
        { id: 'rt-hot', name: 'RT-Hot', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTHOT-V1</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.goto(`${APP}/projects/rt-nonpm/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      let sawInstall = false;
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install/.test(await termText(page))) { sawInstall = true; break; }
      }
      assert.equal(sawInstall, false, 'manifest-less canonical URL stays idle');
      record('ROUTE-21', 'PASS', 'no npm startup without eligible loaded project');
      await page.goto(`${APP}/projects/rt-npm/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      // Budget matches the baseline suite: under machine load the WebContainer
      // boot (large asset fetch) can take well over a minute before dispatch.
      let dispatched = false;
      for (let i = 0; i < 40; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install/.test(await termText(page))) { dispatched = true; break; }
      }
      assert.ok(dispatched, 'explicit npm URL triggers startup with zero typing');
      record('ROUTE-22/23', 'PASS', 'loaded npm project starts; shell-readiness race stays fixed');
      await page.goto(`${APP}/projects/rt-hot/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTHOT-V1'), undefined, { timeout: 60000, polling: 500 });
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => { const ta = document.querySelector('.monaco-editor textarea'); if (ta) ta.focus(); });
      await page.keyboard.type('RTHOT-V2', { delay: 5 });
      await previewHas(page, 'RTHOT-V2');
      record('ROUTE-24', 'PASS', 'static hot reload works on canonical URL');
    } catch (e) { failures.push(`ROUTE-21/22/23/24: ${e.message}`); record('ROUTE-21/22/23/24', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-25: backup export -> clean-profile restore preserves IDs + files
  {
    const { ctx, page } = await newPage(browser, true);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'rt-zip', name: 'RT-Zip', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>RTZIP</h1>' }, { path: 'style.css', content: '' }] }]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 20000 });
      await page.locator('[data-testid="dashboard-backup"]').click();
      await page.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 8000 });
      const fs = await import('node:fs');
      const os = await import('node:os');
      const path = await import('node:path');
      const zipPath = path.join(os.tmpdir(), 'r1-route25.zip');
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 20000 }),
        page.locator('[data-testid="btn-export-backup"]').click(),
      ]);
      await download.saveAs(zipPath);
      const zip = await JSZip.loadAsync(fs.readFileSync(zipPath));
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
      assert.ok(names.some((n) => n.includes('rt-zip') && n.endsWith('index.html')), `zip holds rt-zip files (${names.length} entries)`);
      const htmlContent = await zip.file(names.find((n) => n.includes('rt-zip') && n.endsWith('index.html'))).async('string');
      assert.ok(htmlContent.includes('RTZIP'), 'exported bytes intact');
      await page.close(); await ctx.close();
      // Clean profile restore.
      const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page2 = await ctx2.newPage();
      await page2.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.deepEqual(await projectIds(page2), [], 'restore profile starts empty');
      await page2.locator('[data-testid="dashboard-restore"]').click();
      await page2.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 8000 });
      await page2.locator('[data-testid="input-restore-file"]').setInputFiles(zipPath);
      await page2.locator('[data-testid="btn-confirm-restore"]').waitFor({ timeout: 15000 });
      await page2.locator('[data-testid="btn-confirm-restore"]').click();
      await page2.locator('[data-testid="dashboard-project-list"]').waitFor({ timeout: 15000 });
      assert.deepEqual(await projectIds(page2), ['rt-zip'], 'project ID preserved through backup cycle');
      assert.ok(((await idbFiles(page2, 'rt-zip'))['index.html'] || '').includes('RTZIP'), 'file bytes preserved');
      try { fs.unlinkSync(zipPath); } catch {}
      await page2.close(); await ctx2.close();
      record('ROUTE-25', 'PASS', 'backup/restore preserves IDs + files');
    } catch (e) { failures.push(`ROUTE-25: ${e.message}`); record('ROUTE-25', 'FAIL', String(e.message).slice(0, 250)); }
  }

  // LEGAL-01/02/03: in-app legal navigation uses canonical Astro pages; Back preserves work
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'rt-leg-a', name: 'RT-LegA', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTLEGA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'rt-leg-b', name: 'RT-LegB', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTLEGB</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.goto(`${APP}/projects/rt-leg-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTLEGA'), undefined, { timeout: 60000, polling: 500 });
      // Footer legal links point at canonical Astro destinations (not in-app views).
      const footerHrefs = await page.locator('footer a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
      for (const [text, href] of [['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy-policy'], ['Terms', '/terms-and-conditions']]) {
        assert.ok(footerHrefs.includes(href), `footer links ${text} -> ${href}`);
      }
      await page.locator('footer a[href="/about"]').click();
      await page.waitForURL(/\/about\/?$/, { timeout: 30000 });
      await page.waitForFunction(() => document.title.includes('About GB Coder'), undefined, { timeout: 30000, polling: 500 });
      assert.equal(await page.locator('#root').count(), 0, 'Astro HTML owns the document (no React root)');
      record('LEGAL-01', 'PASS', 'footer About -> canonical /about (Astro-owned)');
      // Back returns to the exact editor screen with the project intact.
      await page.goBack();
      await page.waitForURL(/\/app\/projects\/rt-leg-a\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('RTLEGA'), undefined, { timeout: 60000, polling: 500 });
      const aFiles = await idbFiles(page, 'rt-leg-a');
      assert.ok((aFiles['index.html'] || '').includes('RTLEGA'), 'project A intact after legal detour + Back');
      record('LEGAL-02', 'PASS', 'Back from Astro page restores editor screen + project, zero data loss');
      // Same-profile second tab deep link loads the other project (no mixing).
      const page2 = await ctx.newPage();
      await page2.goto(`${APP}/projects/rt-leg-b/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page2.waitForFunction(() => document.body.innerText.includes('RTLEGB'), undefined, { timeout: 60000, polling: 500 });
      assert.ok(!(await page2.evaluate(() => document.body.innerText)).includes('RTLEGA'), 'second tab shows its own project');
      await page2.close();
      record('LEGAL-03', 'PASS', 'same-profile second-tab deep link loads the correct project');
    } catch (e) { failures.push(`LEGAL: ${e.message}`); record('LEGAL', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }

  // ROUTE-27: service worker on nested routes
  {
    const { ctx, page } = await newPage(browser);
    try {
      await page.goto(`${APP}/projects`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      let reg = null;
      const end = Date.now() + 60000;
      for (;;) {
        reg = await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r ? { scope: r.scope, active: !!r.active, state: r.active?.state } : null));
        if (reg && reg.active) break;
        if (Date.now() >= end) break;
        await page.waitForTimeout(2000);
      }
      assert.ok(reg && reg.active, `sw active (${JSON.stringify(reg)})`);
      assert.ok(reg.scope.includes('/app'), 'scope under /app');
      record('ROUTE-27', 'PASS', `sw ${reg.state} scoped /app on nested entry`);
    } catch (e) { failures.push(`ROUTE-27: ${e.message}`); record('ROUTE-27', 'FAIL', String(e.message).slice(0, 250)); }
    finally { await page.close(); await ctx.close(); }
  }
} catch (e) {
  record('FATAL', 'FAIL', String(e.message).slice(0, 300));
} finally {
  await browser.close();
  if (server) server.kill();
}

console.log(`\nROUTE SUMMARY: ${order.length} checks, ${failures.length} failing`);
process.exit(failures.length ? 1 : 0);
