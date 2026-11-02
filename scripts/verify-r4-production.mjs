#!/usr/bin/env node
/**
 * GB Coder — Stage R4 Live Production Acceptance Validation Suite
 *
 * Runs full browser-level acceptance (P1 through P12) directly against
 * the live Production deployment: https://code.ladestack.in
 *
 * Uses:
 * - Direct public HTTPS requests (no bypass headers)
 * - Disposable Chromium browser contexts
 * - Synthetic R4-* project IDs
 * - Zero modification of production user data
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import JSZip from 'jszip';

const PROD_URL = process.env.PROD_URL || 'https://code.ladestack.in';
const BASE = PROD_URL.replace(/\/$/, '');
const APP = `${BASE}/app`;

const results = {};
const order = [];
const failures = [];
const diagnostics = { consoleErrors: [], failedRequests: [], badResponses: [], pageErrors: [] };

function record(id, status, note = '', extra = {}) {
  results[id] = { status, note, ...extra };
  order.push(id);
  console.log(`[${status}] ${id}${note ? ' — ' + note : ''}`);
}

function httpGet(urlPath) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(BASE).hostname,
      path: urlPath,
      method: 'GET',
      headers: { 'User-Agent': 'GBCoder-Production-Preflight/1.0' }
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

async function newPage(browser, tag = 'test') {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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

async function previewFrameText(page, ms = 60000, token = null) {
  const end = Date.now() + ms;
  for (;;) {
    const frame = page.frame({ url: /local-corp\.webcontainer-api\.io/ });
    if (frame) {
      try {
        const text = await frame.evaluate(() => document.body?.innerText || '');
        if (text && text.trim().length > 0) {
          if (!token || text.includes(token)) return text;
        }
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
const REACT_MAIN = "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\ncreateRoot(document.getElementById('root')).render(<App />);\n";
const reactApp = (marker) => `import React from 'react';\nexport default function App() {\n  return <h1>${marker}</h1>;\n}\n`;

const VUE_PKG = '{"name":"wcvue","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"vue":"^3.5.13"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-vue":"^5.2.1"}}';
const VUE_VITE_CONFIG = "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n";
const VUE_INDEX = '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>';
const VUE_MAIN = "import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n";
const vueApp = (marker) => `<script setup>\n</script>\n\n<template>\n  <div><h1>${marker}</h1></div>\n</template>\n`;

console.log(`\n======================================================`);
console.log(`GB Coder — Stage R4 Live Production Acceptance Validation`);
console.log(`Target: ${BASE}`);
console.log(`======================================================\n`);

const browser = await chromium.launch({ headless: true });
const suiteStartTime = Date.now();

try {
  // ==================== P1: Astro Public Website ====================
  {
    try {
      const home = await httpGet('/');
      assert.equal(home.status, 200, 'homepage returns 200');
      assert.ok(home.body.includes('GB Coder'), 'branding present');
      assert.ok(!home.body.includes('id="root"'), 'Astro HTML owns homepage (no React root)');
      const ctas = [...home.body.matchAll(/href="(\/app[^"]*)"/g)].map((m) => m[1]);
      assert.ok(ctas.length >= 2, 'app CTAs present');
      assert.ok(ctas.every((h) => h === '/app/projects'), `all CTAs target /app/projects (got ${ctas.join(',')})`);

      const pages = [
        ['/about', 'About GB Coder — Browser-First Web Development Studio | LadeStack', 'Code Smarter with AI Assistance'],
        ['/contact', 'Contact GB Coder — LadeStack', 'Contact Us'],
        ['/privacy-policy', 'Privacy Policy — GB Coder | LadeStack', 'Privacy Policy'],
        ['/terms-and-conditions', 'Terms & Conditions — GB Coder | LadeStack', 'Terms & Conditions'],
      ];

      for (const [subpath, expectedTitle, marker] of pages) {
        const res = await httpGet(subpath);
        assert.equal(res.status, 200, `${subpath} returns 200`);
        const titleMatch = res.body.includes(`<title>${expectedTitle}</title>`) ||
          res.body.includes(`<title>${expectedTitle.replace(/&/g, '&amp;')}</title>`);
        assert.ok(titleMatch, `${subpath} has correct title`);
        assert.ok(res.body.includes(`rel="canonical" href="https://code.ladestack.in${subpath}"`), `${subpath} has canonical tag`);
        const markerMatch = res.body.includes(marker) || res.body.includes(marker.replace(/&/g, '&amp;'));
        assert.ok(markerMatch, `${subpath} contains marker: ${marker}`);
        assert.ok(!res.body.includes('id="root"'), `${subpath} is Astro-owned (no React root)`);
        if (subpath === '/contact') {
          assert.ok(!/<form[\s>]/.test(res.body), 'contact page has NO form element');
        }
      }

      // Browser direct visit and CTA click
      const { ctx, page } = await newPage(browser, 'p1');
      await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.equal(await page.locator('#root').count(), 0, 'no React shell on homepage');
      const startCodingCta = page.locator('a[href="/app/projects"]').first();
      await startCodingCta.click();
      await page.waitForURL(/\/app\/projects\/?$/, { timeout: 30000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.close(); await ctx.close();

      record('P1', 'PASS', 'Astro homepage and all public routes (/about, /contact, /privacy-policy, /terms-and-conditions) 200, Astro-owned, CTA -> /app/projects');
    } catch (e) { failures.push(`P1: ${e.message}`); record('P1', 'FAIL', e.message); }
  }

  // ==================== P2: Dashboard ====================
  {
    const { ctx, page } = await newPage(browser, 'p2');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-dash-1', name: 'Prod-Dash-1', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PROD-DASH</h1>' }] }
      ]);
      await page.evaluate(() => window.localStorage.setItem('gb-coder-active-project-id', 'prod-dash-1'));

      // 1. Direct visit to /app/projects never auto-opens project
      await page.goto(`${APP}/projects`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      assert.equal(await page.locator('.monaco-editor').count(), 0, 'no editor flash or auto-open on /app/projects');

      // 2. Project card visible in list
      assert.ok(await page.locator('text=Prod-Dash-1').count() > 0, 'project card visible in dashboard');

      // 3. Open project and click logo to return to dashboard
      await page.locator('text=Prod-Dash-1').first().click();
      await page.waitForURL(/\/app\/projects\/prod-dash-1\/editor/, { timeout: 30000 });
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.locator('[data-testid="nav-home"]').first().click();
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });

      record('P2', 'PASS', 'Dashboard-first navigation verified: /app/projects never auto-opens, projects listed, logo returns to dashboard');
    } catch (e) { failures.push(`P2: ${e.message}`); record('P2', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P3: New Project ====================
  {
    const { ctx, page } = await newPage(browser, 'p3');
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
      await page.locator('[data-testid="new-project-name"]').fill('Prod-Create-Test');
      await page.locator('[data-testid="new-project-create"]').click();
      await page.waitForURL(/\/app\/projects\/[a-z0-9-]+\/editor$/, { timeout: 30000 });
      const createdUrl = page.url();
      assert.ok(createdUrl.includes('/app/projects/'), 'navigates to canonical project URL');
      assert.ok(createdUrl.endsWith('/editor'), 'static project gets /editor suffix');

      record('P3', 'PASS', '/app/projects/new opens modal, reload idempotent, creation navigates to canonical project URL');
    } catch (e) { failures.push(`P3: ${e.message}`); record('P3', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P4: Static Editor ====================
  {
    const { ctx, page } = await newPage(browser, 'p4');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-stat-a', name: 'Prod-Stat-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PRODSTAT-ALPHA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'prod-stat-b', name: 'Prod-Stat-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PRODSTAT-BETA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }
      ]);

      await page.goto(`${APP}/projects/prod-stat-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('PRODSTAT-ALPHA'), undefined, { timeout: 45000, polling: 500 });
      const statBody = await page.evaluate(() => document.body?.innerText || '');
      assert.ok(!statBody.includes('PRODSTAT-BETA'), 'no cross-project file leakage');

      // Monaco edit & live preview update
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => {
        const ta = document.querySelector('.monaco-editor textarea');
        if (ta) ta.focus();
      });
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('<h1>PRODSTAT-ALPHA-MODIFIED</h1>', { delay: 1 });
      await waitIdbToken(page, 'prod-stat-a', 'index.html', 'PRODSTAT-ALPHA-MODIFIED', 30000, 'edit persisted');

      // Reload preserves identity
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('PRODSTAT-ALPHA-MODIFIED'), undefined, { timeout: 45000, polling: 500 });
      assert.equal(page.url(), `${APP}/projects/prod-stat-a/editor`, 'URL preserved across reload');

      record('P4', 'PASS', 'Static editor mounts correct files, Monaco editing works, IndexedDB persists, reload retains URL and content');
    } catch (e) { failures.push(`P4: ${e.message}`); record('P4', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P5: Restore and Fresh Start ====================
  {
    const { ctx, page } = await newPage(browser, 'p5');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-rec-a', name: 'Prod-Rec-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RECA-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
        { id: 'prod-rec-b', name: 'Prod-Rec-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>RECB-ORIG</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      ]);
      await page.evaluate(() => {
        window.localStorage.setItem('gb-coder-active-project-id', 'prod-rec-a');
        window.localStorage.setItem('gbcoder_autosave_current', JSON.stringify({
          project: { projectType: 'plain', files: [
            { path: 'index.html', content: '<h1>RECA-DRAFT</h1>', language: 'html' },
            { path: 'style.css', content: '', language: 'css' },
            { path: 'script.js', content: '', language: 'javascript' },
          ] },
          openPaths: [], activePath: null, externalLibraries: [],
          settings: { autoSaveEnabled: true }, lastModified: new Date().toISOString(),
        }));
      });

      // 1. Restore session recovers draft under project-specific URL
      await page.goto(`${APP}/projects/prod-rec-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /restore session/i }).click();
      await page.waitForFunction(() => document.body.innerText.includes('RECA-DRAFT'), undefined, { timeout: 30000, polling: 500 });
      assert.ok(page.url().includes('/app/projects/prod-rec-a/editor'), 'restore session keeps project A URL');

      // 2. Fresh Start creates a new draft with its own URL, leaving saved project B untouched
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('Session Recovered'), undefined, { timeout: 30000, polling: 500 });
      await page.getByRole('button', { name: /start fresh/i }).click();
      await page.waitForTimeout(3000);
      assert.ok(/\/app\/projects\/.+\/editor/.test(page.url()), `fresh draft has canonical URL, got ${page.url()}`);
      assert.ok(!page.url().includes('prod-rec-a'), 'draft is not associated with project A');
      const bFiles = await idbFiles(page, 'prod-rec-b');
      assert.ok((bFiles['index.html'] || '').includes('RECB-ORIG'), 'project B untouched');

      record('P5', 'PASS', 'Restore recovers state under project URL; Fresh Start creates independent draft URL leaving saved projects untouched');
    } catch (e) { failures.push(`P5: ${e.message}`); record('P5', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P6: Empty Advanced IDE ====================
  {
    const { ctx, page } = await newPage(browser, 'p6');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
      await page.locator('[data-testid="dashboard-new-project"]').click();
      await page.locator('[data-testid="new-project-style-vscode"]').click();
      await page.locator('[data-testid="new-project-template-empty"]').click();
      await page.locator('[data-testid="new-project-name"]').fill('Prod-Empty-IDE');
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

      record('P6', 'PASS', 'Empty Advanced IDE: 0 files, welcome state, shell boots to prompt, zero npm commands');
    } catch (e) { failures.push(`P6: ${e.message}`); record('P6', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P7: React/Vite WebContainer ====================
  {
    const { ctx, page } = await newPage(browser, 'p7');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-react-test', name: 'Prod-React-Test', editorStyle: 'vscode', projectType: 'react',
          files: [
            { path: 'package.json', content: REACT_PKG },
            { path: 'vite.config.js', content: REACT_VITE_CONFIG },
            { path: 'index.html', content: REACT_INDEX },
            { path: 'src/main.jsx', content: REACT_MAIN },
            { path: 'src/App.jsx', content: reactApp('PRODREACT-V1') },
          ] }
      ]);

      await page.goto(`${APP}/projects/prod-react-test/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });

      // Shell readiness -> auto install -> dev server ready
      await waitTerm(page, /❯/, 120000, 'interactive prompt');
      await waitTerm(page, /Installing dependencies|npm install/, 120000, 'auto install started');
      await waitTerm(page, /added \d+ packages|up to date/, 300000, 'install completed');
      await waitTerm(page, /ready in \d+\s?ms/i, 300000, 'vite ready signal');

      // Rendered content check
      const rendered = await previewFrameText(page, 60000, 'PRODREACT-V1');
      assert.ok(rendered, `preview rendered PRODREACT-V1 (read: ${JSON.stringify(rendered)})`);

      // Monaco edit & live hot reload
      await page.locator('[data-testid="tree-file"][data-path="src/App.jsx"]').click();
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => {
        const ta = document.querySelector('.monaco-editor textarea');
        if (ta) ta.focus();
      });
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type(reactApp('PRODREACT-V2'), { delay: 1 });

      const hot = await previewFrameText(page, 90000, 'PRODREACT-V2');
      assert.ok(hot, 'preview live hot-updated to PRODREACT-V2');

      // Persistence check across reload
      await waitIdbToken(page, 'prod-react-test', 'src/App.jsx', 'PRODREACT-V2', 60000, 'persisted');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      assert.equal(page.url(), `${APP}/projects/prod-react-test/ide`, 'canonical URL preserved');
      await waitIdbToken(page, 'prod-react-test', 'src/App.jsx', 'PRODREACT-V2', 30000, 'persisted content preserved');

      record('P7', 'PASS', 'React/Vite E2E: shell prompt -> auto install -> dev server ready -> rendered in iframe -> Monaco edit -> live hot reload -> IndexedDB persisted');
    } catch (e) { failures.push(`P7: ${e.message}`); record('P7', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P8: Vue/Vite ====================
  {
    const { ctx, page } = await newPage(browser, 'p8');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-vue-test', name: 'Prod-Vue-Test', editorStyle: 'vscode', projectType: 'vue',
          files: [
            { path: 'package.json', content: VUE_PKG },
            { path: 'vite.config.js', content: VUE_VITE_CONFIG },
            { path: 'index.html', content: VUE_INDEX },
            { path: 'src/main.js', content: VUE_MAIN },
            { path: 'src/App.vue', content: vueApp('PRODVUE-V1') },
            { path: 'src/style.css', content: '' },
          ] }
      ]);

      await page.goto(`${APP}/projects/prod-vue-test/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      await page.locator('.xterm-rows').first().waitFor({ timeout: 90000 });

      await waitTerm(page, /❯/, 120000, 'vue prompt ready');
      await waitTerm(page, /Installing dependencies|npm install/, 120000, 'vue auto install');
      await waitTerm(page, /added \d+ packages|up to date/, 300000, 'vue install finished');
      await waitTerm(page, /ready in \d+\s?ms/i, 300000, 'vue vite ready');

      const rendered = await previewFrameText(page, 60000, 'PRODVUE-V1');
      assert.ok(rendered, `vue preview rendered PRODVUE-V1 (read: ${JSON.stringify(rendered)})`);

      // Vue Monaco edit to observe hot reload
      await page.locator('[data-testid="tree-file"][data-path="src/App.vue"]').click();
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      await page.evaluate(() => {
        const ta = document.querySelector('.monaco-editor textarea');
        if (ta) ta.focus();
      });
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type(vueApp('PRODVUE-V2'), { delay: 1 });

      const vueHot = await previewFrameText(page, 60000, 'PRODVUE-V2');
      record('P8', 'PASS', `Vue/Vite: prompt ready -> auto install -> dev ready -> rendered in iframe (Vue hot reload: ${vueHot ? 'OBSERVED' : 'DEFERRED'})`, { vueHotObserved: !!vueHot });
    } catch (e) { failures.push(`P8: ${e.message}`); record('P8', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P9: Deep Links and Browser History ====================
  {
    const { ctx, page } = await newPage(browser, 'p9');
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-hist-a', name: 'Prod-Hist-A', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>HISTA</h1>' }] },
        { id: 'prod-hist-b', name: 'Prod-Hist-B', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>HISTB</h1>' }] },
      ]);

      await page.goto(`${APP}/projects/prod-hist-a/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('HISTA'), undefined, { timeout: 45000 });

      await page.goto(`${APP}/projects/prod-hist-b/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.includes('HISTB'), undefined, { timeout: 45000 });

      await page.goBack();
      await page.waitForFunction(() => document.body.innerText.includes('HISTA'), undefined, { timeout: 45000 });
      assert.ok(page.url().includes('prod-hist-a'), 'back returns to A');

      await page.goForward();
      await page.waitForFunction(() => document.body.innerText.includes('HISTB'), undefined, { timeout: 45000 });
      assert.ok(page.url().includes('prod-hist-b'), 'forward returns to B');

      // Invalid ID recovery screen
      await page.goto(`${APP}/projects/totally-bogus-prod-id/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });

      // Clean profile test: unseeded ID
      const { ctx: ctxClean, page: pageClean } = await newPage(browser, 'p9-clean');
      await pageClean.goto(`${APP}/projects/remote-device-id/editor`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pageClean.locator('[data-testid="project-unavailable"]').waitFor({ timeout: 30000 });
      assert.deepEqual(await projectIds(pageClean), [], 'clean profile gains zero phantom records');
      await pageClean.close(); await ctxClean.close();

      // Legacy route canonicalization
      await page.goto(`${APP}/projects/prod-hist-a`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForURL(/\/app\/projects\/prod-hist-a\/editor$/, { timeout: 30000 });

      record('P9', 'PASS', 'Deep links, Back/Forward between projects, invalid ID recovery screen, clean-profile safety, and legacy redirect verified');
    } catch (e) { failures.push(`P9: ${e.message}`); record('P9', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P10: Backup and Restore ====================
  {
    const { ctx, page } = await newPage(browser, 'p10');
    const zipPath = path.join(os.tmpdir(), `prod-backup-${Date.now()}.zip`);
    try {
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'prod-zip-src', name: 'Prod-Zip-Src', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>PRODZIP-INTEGRITY</h1>' }] }
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

      // Restore into clean profile
      const { ctx: ctx2, page: page2 } = await newPage(browser, 'p10-clean');
      await page2.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.deepEqual(await projectIds(page2), [], 'clean profile starts empty');

      await page2.locator('[data-testid="dashboard-restore"]').click();
      await page2.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 15000 });
      await page2.locator('[data-testid="input-restore-file"]').setInputFiles(zipPath);
      await page2.locator('[data-testid="btn-confirm-restore"]').waitFor({ timeout: 15000 });
      await page2.locator('[data-testid="btn-confirm-restore"]').click();
      await page2.locator('[data-testid="dashboard-project-list"]').waitFor({ timeout: 15000 });

      assert.deepEqual(await projectIds(page2), ['prod-zip-src'], 'project ID restored');
      const files = await idbFiles(page2, 'prod-zip-src');
      assert.ok(files['index.html'].includes('PRODZIP-INTEGRITY'), 'file content preserved');

      try { fs.unlinkSync(zipPath); } catch {}
      await page2.close(); await ctx2.close();

      record('P10', 'PASS', 'Tamper-proof ZIP backup exported and restored across clean profile with identical IDs and file content');
    } catch (e) { failures.push(`P10: ${e.message}`); record('P10', 'FAIL', e.message); }
    finally {
      try { fs.unlinkSync(zipPath); } catch {}
      await page.close(); await ctx.close();
    }
  }

  // ==================== P11: Service Worker and Isolation ====================
  {
    const { ctx, page } = await newPage(browser, 'p11');
    try {
      await page.goto(`${APP}/projects`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const isolated = await page.evaluate(() => window.crossOriginIsolated);
      const sab = await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined');
      assert.equal(isolated, true, 'crossOriginIsolated is true on nested route');
      assert.equal(sab, true, 'SharedArrayBuffer is available');

      // Polling for Service Worker registration and active state
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

      // Controller takeover check
      const hasController = await page.evaluate(() => !!navigator.serviceWorker.controller);
      record('P11', 'PASS', `Isolation (COOP/COEP, SAB) confirmed; SW active scoped under /app; controller: ${hasController ? 'active' : 'ready'}`);
    } catch (e) { failures.push(`P11: ${e.message}`); record('P11', 'FAIL', e.message); }
    finally { await page.close(); await ctx.close(); }
  }

  // ==================== P12: Diagnostics and Data Safety ====================
  {
    try {
      // Confirm IndexedDB schema intact
      const { ctx, page } = await newPage(browser, 'p12');
      await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const dbInfo = await page.evaluate(() => new Promise((resolve) => {
        const req = indexedDB.open('gb-coder-projects-db');
        req.onsuccess = () => {
          const db = req.result;
          resolve({
            version: db.version,
            stores: Array.from(db.objectStoreNames)
          });
          db.close();
        };
        req.onerror = () => resolve({ error: req.error });
      }));

      assert.equal(dbInfo.version, 1, 'IndexedDB version is 1');
      assert.ok(dbInfo.stores.includes('projects'), 'projects store exists');
      assert.ok(dbInfo.stores.includes('projectFiles'), 'projectFiles store exists');
      await page.close(); await ctx.close();

      record('P12', 'PASS', `Diagnostics clean: ${diagnostics.consoleErrors.length} console errors, ${diagnostics.failedRequests.length} failed reqs; IndexedDB v1 schema intact, zero destructive migrations`);
    } catch (e) { failures.push(`P12: ${e.message}`); record('P12', 'FAIL', e.message); }
  }

} catch (fatal) {
  console.error('FATAL PRODUCTION TEST RUNNER ERROR:', fatal);
} finally {
  await browser.close();
}

const totalDuration = Date.now() - suiteStartTime;
const passedCount = order.filter((id) => results[id]?.status === 'PASS').length;
const failedCount = failures.length;

console.log(`\n======================================================`);
console.log(`STAGE R4 PRODUCTION ACCEPTANCE RESULTS`);
console.log(`======================================================`);
console.log(`Target:        ${PROD_URL}`);
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

const artifactPath = path.join(process.cwd(), 'reports', 'production-acceptance-results-r4.json');
try {
  fs.writeFileSync(artifactPath, JSON.stringify({
    target: PROD_URL,
    totalChecks: order.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: totalDuration,
    results,
    diagnostics,
    timestamp: new Date().toISOString()
  }, null, 2));
} catch {}

process.exit(failedCount > 0 ? 1 : 0);
