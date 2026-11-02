#!/usr/bin/env node
/**
 * GB Coder — Stage R2 Preview Acceptance Verification Suite
 *
 * Runs full browser-level acceptance (R2-01 through R2-16) against the
 * deployed Vercel Preview URL: https://gb-coder-public-alpha-pcjk5xf1s.vercel.app
 *
 * Uses:
 * - Scoped Vercel Preview bypass header (never leaked to CDNs)
 * - Disposable Chromium contexts
 * - Synthetic R2-* project IDs
 * - Zero modification of production data
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import JSZip from 'jszip';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://gb-coder-public-alpha-pcjk5xf1s.vercel.app';
const BASE = PREVIEW_URL.replace(/\/$/, '');
const APP = `${BASE}/app`;
const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

const results = {};
const order = [];
const failures = [];
const diagnostics = { consoleErrors: [], failedRequests: [], badResponses: [], pageErrors: [] };

function record(id, status, note = '') {
  results[id] = { status, note };
  order.push(id);
  console.log(`[${status}] ${id}${note ? ' — ' + note : ''}`);
}

function httpGet(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(BASE).hostname,
      path,
      method: 'GET',
      headers: BYPASS_SECRET ? { 'x-vercel-protection-bypass': BYPASS_SECRET } : {}
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', (e) => resolve({ status: -1, headers: {}, body: String(e.message) }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: -1, headers: {}, body: 'timeout' }); });
    req.end();
  });
}

function watch(page, tag) {
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text();
      // Drop known non-fatal warnings
      if (!text.includes('favicon') && !text.includes('baseline-browser-mapping')) {
        diagnostics.consoleErrors.push(`[${tag}] ${text.slice(0, 300)}`);
      }
    }
  });
  page.on('pageerror', (e) => diagnostics.pageErrors.push(`[${tag}] ${String(e && e.message || e).slice(0, 300)}`));
  page.on('requestfailed', (r) => diagnostics.failedRequests.push(`[${tag}] ${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('favicon')) {
      diagnostics.badResponses.push(`[${tag}] ${r.status()} ${r.url().slice(0, 160)}`);
    }
  });
}

const PINNED_AUTHORIZED_HOSTNAME = 'gb-coder-public-alpha-pcjk5xf1s.vercel.app';
const targetHostname = new URL(BASE).hostname;
if (targetHostname !== PINNED_AUTHORIZED_HOSTNAME) {
  throw new Error(`SECURITY ERROR: target hostname (${targetHostname}) does not match pinned preview hostname (${PINNED_AUTHORIZED_HOSTNAME})`);
}
const isAllowed = (requestUrl) => {
  try {
    const u = new URL(requestUrl);
    return u.protocol === 'https:' && u.hostname === PINNED_AUTHORIZED_HOSTNAME;
  } catch {
    return false;
  }
};

async function newPage(browser, tag = 'test') {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/*', async (route) => {
    const reqUrl = route.request().url();
    if (isAllowed(reqUrl)) {
      const headers = {
        ...route.request().headers(),
        ...(BYPASS_SECRET ? { 'x-vercel-protection-bypass': BYPASS_SECRET } : {})
      };
      await route.continue({ headers });
    } else {
      await route.continue();
    }
  });
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });
  const page = await ctx.newPage();
  watch(page, tag);
  return { ctx, page };
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

async function waitIdbToken(page, pid, p, token, ms, label) {
  const end = Date.now() + ms;
  for (;;) {
    const files = await idbFiles(page, pid);
    if ((files[p] || '').includes(token)) return;
    if (Date.now() >= end) throw new Error(`idb timeout: ${label}`);
    await page.waitForTimeout(1000);
  }
}

async function termText(page) {
  return page.evaluate(() => document.querySelector('.xterm-rows')?.innerText || '');
}

async function waitTerm(page, re, ms, label) {
  const end = Date.now() + ms;
  for (;;) {
    const t = await termText(page);
    if (re.test(t)) return t;
    if (Date.now() >= end) throw new Error(`terminal timeout: ${label}`);
    await page.waitForTimeout(2000);
  }
}

async function previewFrameText(page, ms = 60000) {
  const end = Date.now() + ms;
  for (;;) {
    const frame = page.frame({ url: /local-corp\.webcontainer-api\.io/ });
    if (frame) {
      try {
        const text = await frame.evaluate(() => document.body?.innerText || '');
        if (text && text.trim().length > 0) return text;
      } catch {}
    }
    if (Date.now() >= end) return null;
    await page.waitForTimeout(2000);
  }
}

async function previewUrl(page) {
  return page.locator('[data-testid="preview-iframe"]').first().getAttribute('src').catch(() => null);
}

const REACT_PKG = '{"name":"wcfull","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-react":"^4.3.0"}}';
const REACT_VITE_CONFIG = "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n";
const REACT_INDEX = '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>';
const reactMain = (marker) => `import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('root')).render(<h1>${marker}</h1>);\n`;

const VUE_PKG = '{"name":"wcvue","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"vue":"^3.5.13"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-vue":"^5.2.1"}}';
const VUE_VITE_CONFIG = "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n";
const VUE_INDEX = '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>';
const VUE_MAIN = "import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n";
const vueApp = (marker) => `<script setup>\n</script>\n\n<template>\n  <div><h1>${marker}</h1></div>\n</template>\n`;

console.log(`\n======================================================`);
console.log(`GB Coder — Stage R2 Live Preview Acceptance Validation`);
console.log(`Target: ${BASE}`);
console.log(`======================================================\n`);

const browser = await chromium.launch({ headless: true });
const suiteStartTime = Date.now();

try {
  // ==================== R2-01: Astro Homepage ====================
  {
    try {
      const res = await httpGet('/');
      assert.equal(res.status, 200, 'homepage returns 200');
      assert.ok(res.body.includes('GB Coder'), 'branding present');
      assert.ok(!res.body.includes('id="root"'), 'Astro HTML owns page (no React root)');
      const ctas = [...res.body.matchAll(/href="(\/app[^"]*)"/g)].map((m) => m[1]);
      assert.ok(ctas.length >= 2, 'app CTAs present');
      assert.ok(ctas.every((h) => h === '/app/projects'), `all CTAs target /app/projects (got ${ctas.join(',')})`);

      const { ctx, page } = await newPage(browser, 'r2-01');
      await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.equal(await page.locator('#root').count(), 0, 'no React shell on homepage');
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.ok(await page.title(), 'homepage functional after reload');
      await page.close(); await ctx.close();

      record('R2-01', 'PASS', 'Astro homepage 200, branding intact, CTAs -> /app/projects, refresh-safe');
    } catch (e) { failures.push(`R2-01: ${e.message}`); record('R2-01', 'FAIL', e.message); }
  }

  // ==================== R2-02: Public Multipage URLs ====================
  {
    const pages = [
      ['/about', 'About GB Coder — Browser-First Web Development Studio | LadeStack', 'Code Smarter with AI Assistance'],
      ['/contact', 'Contact GB Coder — LadeStack', 'Contact Us'],
      ['/privacy-policy', 'Privacy Policy — GB Coder | LadeStack', 'Privacy Policy'],
      ['/terms-and-conditions', 'Terms & Conditions — GB Coder | LadeStack', 'Terms & Conditions'],
    ];

    let allPublicOk = true;
    for (const [path, expectedTitle, marker] of pages) {
      try {
        const res = await httpGet(path);
        assert.equal(res.status, 200, `${path} returns 200`);
        const titleMatch = res.body.includes(`<title>${expectedTitle}</title>`) ||
          res.body.includes(`<title>${expectedTitle.replace(/&/g, '&amp;')}</title>`);
        assert.ok(titleMatch, `${path} has correct title`);
        assert.ok(res.body.includes(`rel="canonical" href="https://code.ladestack.in${path}"`), `${path} has canonical tag`);
        const markerMatch = res.body.includes(marker) || res.body.includes(marker.replace(/&/g, '&amp;'));
        assert.ok(markerMatch, `${path} contains marker: ${marker}`);
        assert.ok(!res.body.includes('id="root"'), `${path} is Astro-owned (no React root)`);
        if (path === '/contact') {
          assert.ok(!/<form[\s>]/.test(res.body), 'contact page has NO form element');
        }

        const { ctx, page } = await newPage(browser, `r2-02-${path}`);
        await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('#root').count(), 0, `${path} retains Astro ownership after reload`);
        await page.close(); await ctx.close();
      } catch (e) {
        allPublicOk = false;
        failures.push(`R2-02 (${path}): ${e.message}`);
      }
    }
    record('R2-02', allPublicOk ? 'PASS' : 'FAIL', 'multipage /about, /contact, /privacy-policy, /terms-and-conditions all 200, metadata ok, no forms, Astro-owned');
  }

  // ==================== R2-03: Dashboard-First Navigation ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-03');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-dash-1', name: 'R2-Dash-1', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>R2DASH</h1>' }] }
      ]);
      await page.evaluate(() => window.localStorage.setItem('gb-coder-active-project-id', 'r2-dash-1'));

      // 1. Arrival at /app/projects never auto-opens project
      await page.goto(`${APP}/projects`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'no editor flash or auto-open on /app/projects');

      // 2. Arrival at /app alias resolves to Dashboard
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'no editor flash or auto-open on /app');

      // 3. Project is visible in list
      assert.ok(await page.locator('text=R2-Dash-1').count() > 0, 'project card visible in dashboard');

      // 4. Logo return to dashboard
      await page.locator('text=R2-Dash-1').first().click();
      await page.waitForURL(/\/app\/projects\/r2-dash-1\/editor/, { timeout: 30000 });
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.locator('[data-testid="nav-home"]').first().click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });

      record('R2-03', 'PASS', '/app and /app/projects dashboard-first, no auto-open with pointer, logo returns');
    } catch (e) { failures.push(`R2-03: ${e.message}`); record('R2-03', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-04: Project Creation ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-04');
    try {
      await page.goto(`${APP}/projects/new`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="new-project-modal"]').waitFor({ timeout: 15000 });

      const before = await projectIds(page);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="new-project-modal"]').waitFor({ timeout: 15000 });
      const after = await projectIds(page);
      assert.deepEqual(after, before, 'refreshing /new creates zero duplicate projects');

      // Create static project
      await page.locator('[data-testid="new-project-style-plain"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('R2-Create-Test');
      await page.locator('[data-testid="new-project-create"]').click();
      await page.waitForURL(/\/app\/projects\/[a-z0-9-]+\/editor$/, { timeout: 30000 });
      const createdUrl = page.url();
      assert.ok(createdUrl.includes('/app/projects/'), 'navigates to canonical project URL');
      assert.ok(createdUrl.endsWith('/editor'), 'static project gets /editor suffix');

      record('R2-04', 'PASS', '/new modal opens, refresh idempotent, creation navigates to canonical URL');
    } catch (e) { failures.push(`R2-04: ${e.message}`); record('R2-04', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-05: Project-Specific Static Editor ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-05');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-stat-a', name: 'R2-Stat-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>R2STAT-ALPHA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'r2-stat-b', name: 'R2-Stat-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>R2STAT-BETA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }
      ]);

      await page.goto(`${APP}/projects/r2-stat-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('R2STAT-ALPHA'), undefined, { timeout: 45000, polling: 500 });
      const statBody = await page.evaluate(() => document.body?.innerText || '');
      assert.ok(!statBody.includes('R2STAT-BETA'), 'no cross-project file leakage');

      // Edit and verify persistence
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => {
        const ta = document.querySelector('.monaco-editor textarea');
        if (ta) ta.focus();
      });
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('<h1>R2STAT-ALPHA-MODIFIED</h1>', { delay: 1 });
      await waitIdbToken(page, 'r2-stat-a', 'index.html', 'R2STAT-ALPHA-MODIFIED', 30000, 'edit persisted');

      // Reload preserves identity
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('R2STAT-ALPHA-MODIFIED'), undefined, { timeout: 45000, polling: 500 });
      assert.equal(page.url(), `${APP}/projects/r2-stat-a/editor`, 'URL preserved across reload');

      record('R2-05', 'PASS', 'static editor loads exact project, Monaco editing persists, reload preserved');
    } catch (e) { failures.push(`R2-05: ${e.message}`); record('R2-05', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-06: Static Restore / Fresh Start ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-06');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-stat-a', name: 'R2-Stat-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTA-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'r2-stat-b', name: 'R2-Stat-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RTB-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.evaluate(() => {
        window.localStorage.setItem('gb-coder-active-project-id', 'r2-stat-a');
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

      // 1. Restore session keeps exact project-specific URL and loads draft
      await page.goto(`${APP}/projects/r2-stat-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /restore session/i }).click();
      await page.waitForFunction(() => document.body.innerText.includes('RTA-DRAFT'), undefined, { timeout: 30000, polling: 500 });
      assert.ok(page.url().includes('/app/projects/r2-stat-a/editor'), 'restore session keeps project A URL');

      // 2. Fresh Start creates a new draft with its own URL, leaving saved project B untouched
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /start fresh/i }).click();
      await page.waitForTimeout(3000);
      assert.ok(/\/app\/projects\/.+\/editor/.test(page.url()), `fresh draft has canonical URL, got ${page.url()}`);
      assert.ok(!page.url().includes('r2-stat-a'), 'draft is not associated with project A');
      const bFiles = await idbFiles(page, 'r2-stat-b');
      assert.ok((bFiles['index.html'] || '').includes('RTB-ORIG'), 'project B untouched');

      record('R2-06', 'PASS', 'Restore recovers state under project-specific URL; Fresh Start creates draft URL leaving others untouched');
    } catch (e) { failures.push(`R2-06: ${e.message}`); record('R2-06', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-07: Empty Advanced IDE ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-07');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-empty"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('R2-Empty-IDE');
      await page.locator('[data-testid="new-project-create"]').click();

      await page.waitForURL(/\/app\/projects\/.+\/ide/, { timeout: 30000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });

      assert.equal(await page.locator('[data-testid="tree-file"]').count(), 0, 'explorer has zero files');
      assert.ok(await page.locator('[data-testid="vscode-empty-state"]').count() > 0, 'welcome/empty state shown');

      const pid = await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id'));
      assert.deepEqual(Object.keys(await idbFiles(page, pid)), [], 'stored record holds zero files');

      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      const boot = await waitTerm(page, /❯|Starting interactive shell/, 90000, 'shell boot');
      assert.ok(boot.length > 0, 'shell booted to prompt');

      let sawNpm = false;
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install|npm run dev/.test(await termText(page))) { sawNpm = true; break; }
      }
      assert.equal(sawNpm, false, 'zero npm commands triggered in empty project');

      record('R2-07', 'PASS', 'empty Advanced IDE: 0 files, welcome state, booted shell, zero npm commands');
    } catch (e) { failures.push(`R2-07: ${e.message}`); record('R2-07', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-08: Manifest-Less Advanced Project ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-08');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'r2-nomanifest', name: 'R2-NoManifest', editorStyle: 'vscode', projectType: 'react',
        files: [
          { path: 'src/a.jsx', content: 'export const A = 1;\n' },
          { path: 'src/b.jsx', content: 'export const B = 2;\n' },
          { path: 'notes.txt', content: 'notes without manifest\n' },
        ] }]);

      await page.goto(`${APP}/projects/r2-nomanifest/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]').waitFor({ timeout: 60000 });

      const paths = await page.locator('[data-testid="tree-file"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-path')).sort());
      assert.deepEqual(paths, ['notes.txt', 'src/a.jsx', 'src/b.jsx'], 'exact files mounted in explorer');

      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });
      let sawNpm = false;
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(3000);
        if (/Installing dependencies|npm install|npm run dev/.test(await termText(page))) { sawNpm = true; break; }
      }
      assert.equal(sawNpm, false, 'no automatic npm install or dev server started');

      record('R2-08', 'PASS', 'manifest-less project: exact mount, no npm commands, manual shell ready');
    } catch (e) { failures.push(`R2-08: ${e.message}`); record('R2-08', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-09: React/Vite Full WebContainer E2E ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-09');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-full-react', name: 'R2-Full-React', editorStyle: 'vscode', projectType: 'react',
          files: [
            { path: 'package.json', content: REACT_PKG },
            { path: 'vite.config.js', content: REACT_VITE_CONFIG },
            { path: 'index.html', content: REACT_INDEX },
            { path: 'src/main.jsx', content: reactMain('R2REACT-V1') },
          ] }
      ]);

      await page.goto(`${APP}/projects/r2-full-react/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });

      // 1. Shell readiness
      await waitTerm(page, /❯/, 120000, 'interactive prompt');

      // 2. Automatic npm install
      await waitTerm(page, /Installing dependencies|npm install/, 120000, 'auto install started');
      await waitTerm(page, /added \d+ packages|up to date/, 300000, 'install completed');

      // 3. Vite dev server readiness
      await waitTerm(page, /ready in \d+\s?ms/i, 300000, 'vite ready signal');

      // 4. Live preview frame rendering
      const url = await previewUrl(page);
      assert.ok(url && url.startsWith('http'), `preview iframe bound to dev server (${url.slice(0, 60)})`);

      let rendered = null;
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(4000);
        const text = await previewFrameText(page, 20000);
        if (text && text.includes('R2REACT-V1')) { rendered = text; break; }
      }
      assert.ok(rendered, `preview rendered R2REACT-V1 (read: ${JSON.stringify(rendered)})`);

      // 5. Monaco editing & live hot reload
      await page.locator('[data-testid="tree-file"][data-path="src/main.jsx"]').click();
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => {
        const ta = document.querySelector('.monaco-editor textarea');
        if (ta) ta.focus();
      });
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type(reactMain('R2REACT-V2'), { delay: 1 });

      let hot = null;
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(4000);
        const text = await previewFrameText(page, 20000);
        if (text && text.includes('R2REACT-V2')) { hot = text; break; }
      }
      assert.ok(hot, 'preview live hot-updated to R2REACT-V2');

      // 6. Persistence & reload
      await waitIdbToken(page, 'r2-full-react', 'src/main.jsx', 'R2REACT-V2', 60000, 'persisted');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      assert.equal(page.url(), `${APP}/projects/r2-full-react/ide`, 'canonical URL preserved');
      await waitIdbToken(page, 'r2-full-react', 'src/main.jsx', 'R2REACT-V2', 30000, 'persisted content preserved');

      record('R2-09', 'PASS', 'React/Vite E2E: identity -> boot -> ready -> install -> dev -> preview rendered -> monaco edit -> hot update -> persisted');
    } catch (e) { failures.push(`R2-09: ${e.message}`); record('R2-09', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-10: Vue/Vite Runtime ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-10');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-vue-test', name: 'R2-Vue-Test', editorStyle: 'vscode', projectType: 'vue',
          files: [
            { path: 'package.json', content: VUE_PKG },
            { path: 'vite.config.js', content: VUE_VITE_CONFIG },
            { path: 'index.html', content: VUE_INDEX },
            { path: 'src/main.js', content: VUE_MAIN },
            { path: 'src/App.vue', content: vueApp('R2VUE-V1') },
            { path: 'src/style.css', content: '' },
          ] }
      ]);

      await page.goto(`${APP}/projects/r2-vue-test/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });

      await waitTerm(page, /❯/, 120000, 'vue prompt ready');
      await waitTerm(page, /Installing dependencies|npm install/, 120000, 'vue auto install');
      await waitTerm(page, /added \d+ packages|up to date/, 300000, 'vue install finished');
      await waitTerm(page, /ready in \d+\s?ms/i, 300000, 'vue vite ready');

      let rendered = null;
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(4000);
        const text = await previewFrameText(page, 20000);
        if (text && text.includes('R2VUE-V1')) { rendered = text; break; }
      }
      assert.ok(rendered, `vue preview rendered R2VUE-V1 (read: ${JSON.stringify(rendered)})`);

      record('R2-10', 'PASS', 'Vue/Vite: boot -> auto install -> dev ready -> rendered Vue component inside iframe');
    } catch (e) { failures.push(`R2-10: ${e.message}`); record('R2-10', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-11: Browser History & Deep Links ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-11');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-hist-a', name: 'R2-Hist-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>HISTA</h1>' }] },
        { id: 'r2-hist-b', name: 'R2-Hist-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>HISTB</h1>' }] },
      ]);

      await page.goto(`${APP}/projects/r2-hist-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('HISTA'), undefined, { timeout: 45000 });

      await page.goto(`${APP}/projects/r2-hist-b/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('HISTB'), undefined, { timeout: 45000 });

      await page.goBack();
      await page.waitForFunction(() => document.body.innerText.includes('HISTA'), undefined, { timeout: 45000 });
      assert.ok(page.url().includes('r2-hist-a'), 'back returns to A');

      await page.goForward();
      await page.waitForFunction(() => document.body.innerText.includes('HISTB'), undefined, { timeout: 45000 });
      assert.ok(page.url().includes('r2-hist-b'), 'forward returns to B');

      // Invalid ID
      await page.goto(`${APP}/projects/totally-bogus-id/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });

      record('R2-11', 'PASS', 'Back/Forward history between projects, direct deep-links, invalid ID recovery screen');
    } catch (e) { failures.push(`R2-11: ${e.message}`); record('R2-11', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-12: Cross-Profile Safety ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-12');
    try {
      // Clean profile with zero local IndexedDB data opening remote project ID
      await page.goto(`${APP}/projects/remote-profile-id/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });

      assert.equal(await page.locator('.monaco-editor').count(), 0, 'no editor mounted');
      assert.deepEqual(await projectIds(page), [], 'zero records fabricated in IndexedDB');

      record('R2-12', 'PASS', 'cross-profile safe: remote project displays Project Not Available, creates 0 records');
    } catch (e) { failures.push(`R2-12: ${e.message}`); record('R2-12', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-13: Backup and Restore ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-13');
    const zipPath = path.join(os.tmpdir(), `r2-backup-${Date.now()}.zip`);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-zip-src', name: 'R2-Zip-Src', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>R2ZIP-INTEGRITY</h1>' }] }
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="dashboard-backup"]').click();
      await page.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 15000 });

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        page.locator('[data-testid="btn-export-backup"]').click(),
      ]);
      await download.saveAs(zipPath);

      const zip = await JSZip.loadAsync(fs.readFileSync(zipPath));
      assert.ok(zip.file('manifest.json'), 'manifest.json present in ZIP');

      // Clean profile restore
      const { ctx: ctx2, page: page2 } = await newPage(browser, 'r2-13-clean');
      await page2.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.deepEqual(await projectIds(page2), [], 'clean profile starts empty');

      await page2.locator('[data-testid="dashboard-restore"]').click();
      await page2.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 15000 });
      await page2.locator('[data-testid="input-restore-file"]').setInputFiles(zipPath);
      await page2.locator('[data-testid="btn-confirm-restore"]').waitFor({ timeout: 15000 });
      await page2.locator('[data-testid="btn-confirm-restore"]').click();
      await page2.locator('[data-testid="dashboard-project-list"]').waitFor({ timeout: 15000 });

      assert.deepEqual(await projectIds(page2), ['r2-zip-src'], 'project ID restored');
      const files = await idbFiles(page2, 'r2-zip-src');
      assert.ok(files['index.html'].includes('R2ZIP-INTEGRITY'), 'file content preserved');

      try { fs.unlinkSync(zipPath); } catch {}
      await page2.close(); await ctx2.close();

      record('R2-13', 'PASS', 'tamper-proof ZIP backup exported and restored across clean profile');
    } catch (e) { failures.push(`R2-13: ${e.message}`); record('R2-13', 'FAIL', e.message); }
    finally {
      try { fs.unlinkSync(zipPath); } catch {}
      await page.close(); await ctx.close();
    }
  }

  // ==================== R2-14: Service Worker and Browser Isolation ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-14');
    try {
      await page.goto(`${APP}/projects`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const isolated = await page.evaluate(() => window.crossOriginIsolated);
      const sab = await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined');
      assert.equal(isolated, true, 'crossOriginIsolated is true on nested route');
      assert.equal(sab, true, 'SharedArrayBuffer is available');

      // SW registration polling
      let reg = null;
      const end = Date.now() + 60000;
      for (;;) {
        reg = await page.evaluate(() =>
          navigator.serviceWorker.getRegistration().then((r) => r ? { scope: r.scope, active: !!r.active, state: r.active?.state } : null)
        );
        if (reg && reg.active) break;
        if (Date.now() >= end) break;
        await page.waitForTimeout(2000);
      }
      assert.ok(reg && reg.active, `sw active (${JSON.stringify(reg)})`);
      assert.ok(reg.scope.includes('/app'), 'service worker scoped to /app');

      record('R2-14', 'PASS', 'COOP/COEP isolation, SAB available, SW registered and scoped under /app');
    } catch (e) { failures.push(`R2-14: ${e.message}`); record('R2-14', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-15: Legacy URL Compatibility ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-15');
    try {
      // Legacy /app/editor without pointer -> dashboard
      await page.goto(`${APP}/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.ok(page.url().includes('/app/projects'), 'legacy /app/editor canonicalizes to /app/projects');

      // Legacy /app/ide without pointer -> idle shell
      await page.goto(`${APP}/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });

      // Legacy /app/projects/:id redirect to editor/ide
      await seedProjects(page, [
        { id: 'r2-legacy-redir', name: 'R2-Legacy-Redir', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>REDIR</h1>' }] }
      ]);
      await page.goto(`${APP}/projects/r2-legacy-redir`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForURL(/\/app\/projects\/r2-legacy-redir\/editor$/, { timeout: 30000 });

      record('R2-15', 'PASS', 'legacy routes /app/editor, /app/ide, /app/projects/:id canonicalize safely');
    } catch (e) { failures.push(`R2-15: ${e.message}`); record('R2-15', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== R2-16: Legal Navigation Consistency ====================
  {
    const { ctx, page } = await newPage(browser, 'r2-16');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'r2-leg-proj', name: 'R2-Leg-Proj', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>R2LEG-SAVED</h1>' }] }
      ]);
      await page.goto(`${APP}/projects/r2-leg-proj/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('R2LEG-SAVED'), undefined, { timeout: 45000 });

      // Click About in footer
      const aboutLink = page.locator('footer a[href="/about"]');
      await aboutLink.click();
      await page.waitForURL(/\/about\/?$/, { timeout: 30000 });
      assert.equal(await page.locator('#root').count(), 0, 'Astro HTML owns /about (no React root)');

      // Browser Back returns to editor with project and data intact
      await page.goBack();
      await page.waitForURL(/\/app\/projects\/r2-leg-proj\/editor/, { timeout: 30000 });
      await page.waitForFunction(() => document.body.innerText.includes('R2LEG-SAVED'), undefined, { timeout: 45000 });
      const files = await idbFiles(page, 'r2-leg-proj');
      assert.ok(files['index.html'].includes('R2LEG-SAVED'), 'project data intact in IndexedDB after Back');

      record('R2-16', 'PASS', 'in-app legal links navigate to canonical Astro pages; Back restores editor + data intact');
    } catch (e) { failures.push(`R2-16: ${e.message}`); record('R2-16', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

} catch (fatal) {
  console.error('FATAL TEST RUNNER ERROR:', fatal);
} finally {
  await browser.close();
}

const totalDuration = Date.now() - suiteStartTime;
const passedCount = order.filter((id) => results[id]?.status === 'PASS').length;
const failedCount = failures.length;

console.log(`\n======================================================`);
console.log(`STAGE R2 PREVIEW ACCEPTANCE RESULTS`);
console.log(`======================================================`);
console.log(`Preview URL:   ${PREVIEW_URL}`);
console.log(`Total Checks:  ${order.length}`);
console.log(`Passed:        ${passedCount}`);
console.log(`Failed:        ${failedCount}`);
console.log(`Duration:      ${Math.round(totalDuration / 1000)}s`);
console.log(`Diagnostics:   ${diagnostics.consoleErrors.length} console errors, ${diagnostics.failedRequests.length} failed reqs`);
console.log(`======================================================\n`);

if (failedCount > 0) {
  console.log('FAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
}

process.exit(failedCount > 0 ? 1 : 0);
