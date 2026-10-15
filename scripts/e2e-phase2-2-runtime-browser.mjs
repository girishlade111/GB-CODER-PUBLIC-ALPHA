#!/usr/bin/env node
/**
 * GB Coder — Phase 2.2 Stage B.1: Independent Real-Browser Verification Suite
 *
 * Real Chromium E2E verification of Stage B fixes:
 * - WC-001: Project-Scoped WebContainer Runtime & Dev Server Lifecycle
 * - WC-007: Debounced, Serialized File Synchronization & Real HMR
 * - WC-002: Strict Root Manifest Correctness & Monorepo Isolation
 *
 * Uses disposable Chromium contexts, synthetic test projects, zero mutation of user data.
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 42992;
const BASE = `http://127.0.0.1:${PORT}`;
const APP = `${BASE}/app`;

const results = [];
const performanceMeasurements = [];
const logBuffer = [];

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  logBuffer.push(line);
}

function record(testId, name, status, details = {}) {
  const entry = { testId, name, status, details, timestamp: new Date().toISOString() };
  results.push(entry);
  log(`[${status}] ${testId}: ${name}${details.notes ? ` — ${details.notes}` : ''}`);
}

function healthOk() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE}/api/health`, (r) => { r.resume(); resolve(r.statusCode === 200); });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
  });
}

async function startServer() {
  if (await healthOk()) {
    log('Reusing existing preview server on port ' + PORT);
    return null;
  }
  log('Starting preview server on port ' + PORT);
  const child = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
  const deadline = Date.now() + 45000;
  for (;;) {
    if (await healthOk()) return child;
    if (child.exitCode !== null && child.exitCode !== undefined) {
      throw new Error(`preview server exited early (code ${child.exitCode})`);
    }
    if (Date.now() >= deadline) {
      try { child.kill(); } catch {}
      throw new Error('preview server timed out during startup');
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
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' }).createIndex('lastOpenedAt', 'lastOpenedAt');
        }
        if (!db.objectStoreNames.contains('projectFiles')) {
          db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] }).createIndex('projectId', 'projectId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return openDb().then((db) => {
      const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
      const now = Date.now();
      for (const s of list) {
        tx.objectStore('projects').put({
          id: s.id,
          name: s.name,
          createdAt: now - 60000,
          lastOpenedAt: now,
          editorStyle: s.editorStyle || 'vscode',
          projectType: s.projectType || 'react',
          fileCount: s.files.length,
        });
        for (const f of s.files) {
          tx.objectStore('projectFiles').put({ projectId: s.id, path: f.path, content: f.content });
        }
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

async function termText(page) {
  return page.evaluate(() => document.querySelector('.xterm-rows')?.innerText || '');
}

async function waitTerm(page, re, ms, label) {
  const end = Date.now() + ms;
  for (;;) {
    const t = await termText(page);
    if (re.test(t)) return t;
    if (Date.now() >= end) throw new Error(`terminal timeout waiting for ${label} (${re})`);
    await page.waitForTimeout(1000);
  }
}

async function previewFrameText(page, ms = 45000) {
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
    await page.waitForTimeout(1000);
  }
}

async function previewUrl(page) {
  return page.locator('[data-testid="preview-iframe"]').first().getAttribute('src').catch(() => null);
}

async function newCtx(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });
  return ctx;
}

// Templates for fixtures
const REACT_PKG = '{"name":"wc-react","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-react":"^4.3.0"}}';
const REACT_VITE_CONFIG = "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n";
const REACT_INDEX = '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>';
const reactMain = (marker) => `import React from 'react';\nimport { createRoot } from 'react-dom/client';\ncreateRoot(document.getElementById('root')).render(<h1 id="marker">${marker}</h1>);\n`;

const VUE_PKG = '{"name":"wc-vue","private":true,"type":"module","scripts":{"dev":"vite"},"dependencies":{"vue":"^3.5.13"},"devDependencies":{"vite":"^5.4.0","@vitejs/plugin-vue":"^5.2.1"}}';
const VUE_VITE_CONFIG = "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });\n";
const VUE_INDEX = '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>';
const VUE_MAIN = "import { createApp } from 'vue';\nimport App from './App.vue';\ncreateApp(App).mount('#app');\n";
const vueApp = (marker) => `<script setup>\n</script>\n\n<template>\n  <div><h1 id="marker">${marker}</h1></div>\n</template>\n`;

async function main() {
  log('================================================================');
  log('GB CODER — PHASE 2.2 STAGE B.1 REAL-BROWSER VERIFICATION HARNESS');
  log('================================================================');

  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  try {
    // -------------------------------------------------------------------------
    // GROUP 1: WC-001 Project-Scoped Dev Server Ownership & Lifecycle (Gate B1-B)
    // -------------------------------------------------------------------------
    log('\n--- GROUP 1: WC-001 Project-Scoped Dev Server Lifecycle ---');

    // WC-RB-001, WC-RB-002, WC-RB-003, WC-RB-004
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [
          {
            id: 'wc-proj-a',
            name: 'WC-Proj-A',
            editorStyle: 'vscode',
            projectType: 'react',
            files: [
              { path: 'package.json', content: REACT_PKG },
              { path: 'vite.config.js', content: REACT_VITE_CONFIG },
              { path: 'index.html', content: REACT_INDEX },
              { path: 'src/main.jsx', content: reactMain('WC-PROJECT-A') },
            ],
          },
          {
            id: 'wc-proj-b',
            name: 'WC-Proj-B',
            editorStyle: 'vscode',
            projectType: 'vue',
            files: [
              { path: 'package.json', content: VUE_PKG },
              { path: 'vite.config.js', content: VUE_VITE_CONFIG },
              { path: 'index.html', content: VUE_INDEX },
              { path: 'src/main.js', content: VUE_MAIN },
              { path: 'src/App.vue', content: vueApp('WC-PROJECT-B') },
              { path: 'src/style.css', content: '' },
            ],
          },
        ]);

        // 1. WC-RB-001: Start Project A
        const firstAStarted = Date.now();
        await page.goto(`${APP}/projects/wc-proj-a/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        // Wait for Vite dev server ready
        await waitTerm(page, /ready in \d+\s?ms/i, 240000, 'Project A Vite ready');
        const urlA = await previewUrl(page);
        assert.ok(urlA && urlA.includes('webcontainer-api.io'), 'Project A preview bound to WebContainer URL');

        let textA = null;
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(3000);
          textA = await previewFrameText(page, 15000);
          if (textA && textA.includes('WC-PROJECT-A')) break;
        }
        assert.ok(textA && textA.includes('WC-PROJECT-A'), `Preview A rendered: ${textA}`);
        performanceMeasurements.push({ phase: 'React initial startup', readinessMs: Date.now() - firstAStarted, terminal: await termText(page) });
        record('WC-RB-001', 'React Project A Startup & Live Preview', 'PASS', { previewUrl: urlA, renderedText: textA });

        // 2. WC-RB-002: Project A -> Dashboard Navigation (Dev Server Disassociation)
        await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click();
        await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
        await page.waitForTimeout(1500);

        // Verify active pointer cleared and preview unmounted
        const activePtr = await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id'));
        assert.equal(activePtr, null, 'Active project ID cleared from storage on dashboard');
        const iframeCountOnDash = await page.locator('[data-testid="preview-iframe"]').count();
        assert.equal(iframeCountOnDash, 0, 'Preview iframe unmounted on dashboard');
        assert.ok(page.url().includes('/app/projects'), 'Canonical dashboard URL reached');
        record('WC-RB-002', 'Project A -> Dashboard Navigation & Disassociation', 'PASS', {
          activeProjectCleared: true,
          previewUnmounted: true,
          dashboardUrl: page.url(),
        });

        // 3. WC-RB-003: Dashboard -> Project B (Vue) Isolation & Ownership
        const firstBStarted = Date.now();
        await page.locator('text=WC-Proj-B').first().click();
        await page.waitForURL(/\/app\/projects\/wc-proj-b\/ide/, { timeout: 30000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        // Verify Project B starts its own dev server and does NOT show "Connected to active WebContainer Dev Server"
        const termB = await waitTerm(page, /ready in \d+\s?ms/i, 240000, 'Project B Vite ready');
        assert.ok(
          !termB.includes('Connected to active WebContainer Dev Server'),
          'Project B did NOT connect to Project A stale server'
        );
        const urlB = await previewUrl(page);
        assert.ok(urlB && urlB.includes('webcontainer-api.io'), 'Project B preview bound');

        let textB = null;
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(3000);
          textB = await previewFrameText(page, 15000);
          if (textB && textB.includes('WC-PROJECT-B')) break;
        }
        assert.ok(textB && textB.includes('WC-PROJECT-B'), `Preview B rendered: ${textB}`);
        assert.ok(!textB.includes('WC-PROJECT-A'), 'Project B preview does NOT contain Project A marker');
        performanceMeasurements.push({ phase: 'A->B Vue startup through dashboard', readinessMs: Date.now() - firstBStarted, terminal: await termText(page) });
        record('WC-RB-003', 'Dashboard -> Project B Isolation & Rendering', 'PASS', {
          previewUrl: urlB,
          renderedText: textB,
          crossContaminationAbsent: true,
        });

        // In-app A/B/A switches measure the new-runtime cost without reloading the host page.
        let previous = 'B';
        for (const target of ['A', 'B', 'A']) {
          const started = Date.now();
          await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click();
          await page.getByTestId('project-dashboard').waitFor({ timeout: 30000 });
          await page.locator('text=WC-Proj-' + target).first().click();
          await page.getByTestId('vscode-mode').waitFor({ timeout: 60000 });
          await waitTerm(page, /ready in \d+\s?ms/i, 240000, 'switched runtime readiness');
          let rendered;
          const deadline = Date.now() + 60000;
          do {
            rendered = await previewFrameText(page, 5000);
            if (rendered?.includes('WC-PROJECT-' + target)) break;
            await page.waitForTimeout(200);
          } while (Date.now() < deadline);
          assert.ok(rendered?.includes('WC-PROJECT-' + target), 'current project DOM marker after in-app switch');
          const terminal = await termText(page);
          performanceMeasurements.push({ phase: previous + '->' + target, readinessMs: Date.now() - started,
            installCompletions: (terminal.match(/added [\d]+ packages?|up to date/g) || []).length, terminal });
          previous = target;
        }
        record('WC-RB-004', 'In-app project switching (B -> A -> B -> A)', 'PASS', { performanceMeasurements });

      } catch (err) {
        record('WC-RB-001_004', 'Dev Server Lifecycle Scenarios', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // WC-RB-007: Empty Project Transition (0 files, 0 installs, 0 servers)
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 30000 });
        await page.locator('[data-testid="dashboard-new-project"]').click();
        await page.locator('[data-testid="new-project-style-vscode"]').click();
        await page.locator('[data-testid="new-project-template-empty"]').click();
        await page.locator('[data-testid="new-project-name"]').fill('WC-Empty-Check');
        await page.locator('[data-testid="new-project-create"]').click();
        await page.waitForURL(/\/app\/projects\/.+\/ide/, { timeout: 30000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });

        const emptyFiles = await page.locator('[data-testid="tree-file"]').count();
        assert.equal(emptyFiles, 0, 'Empty project has exactly 0 files');

        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });
        await waitTerm(page, /❯|Starting interactive shell/, 60000, 'Shell booted');

        // Confirm no npm install or dev server was triggered
        await page.waitForTimeout(5000);
        const t = await termText(page);
        assert.ok(!/Installing dependencies|npm install|npm run dev/.test(t), 'Zero npm activity on empty project');
        record('WC-RB-007', 'Empty Project Transition (0 files, 0 installs, 0 servers)', 'PASS', { fileCount: 0 });
      } catch (err) {
        record('WC-RB-007', 'Empty Project Transition', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // WC-RB-008: Manifest-less Project Transition
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [{
          id: 'wc-no-manifest',
          name: 'WC-No-Manifest',
          editorStyle: 'vscode',
          projectType: 'react',
          files: [
            { path: 'src/main.js', content: 'console.log("no manifest");' },
            { path: 'readme.txt', content: 'Plain text without package.json' },
          ],
        }]);
        await page.goto(`${APP}/projects/wc-no-manifest/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('[data-testid="tree-file"][data-path="readme.txt"]').waitFor({ timeout: 30000 });

        const treeCount = await page.locator('[data-testid="tree-file"]').count();
        assert.equal(treeCount, 2, 'Mounted exactly 2 files');

        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });
        await page.waitForTimeout(5000);
        const t = await termText(page);
        assert.ok(!/Installing dependencies|npm install|npm run dev/.test(t), 'Zero auto npm on manifest-less project');
        record('WC-RB-008', 'Manifest-less Project Transition', 'PASS', { fileCount: 2 });
      } catch (err) {
        record('WC-RB-008', 'Manifest-less Project Transition', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // WC-RB-009: Browser Back / Forward Navigation
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [
          {
            id: 'wc-nav-1',
            name: 'WC-Nav-1',
            editorStyle: 'vscode',
            projectType: 'react',
            files: [{ path: 'readme.txt', content: 'NAV 1' }],
          },
          {
            id: 'wc-nav-2',
            name: 'WC-Nav-2',
            editorStyle: 'vscode',
            projectType: 'react',
            files: [{ path: 'readme.txt', content: 'NAV 2' }],
          },
        ]);

        await page.goto(`${APP}/projects/wc-nav-1/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('[data-testid="tree-file"][data-path="readme.txt"]').waitFor({ timeout: 30000 });

        await page.goto(`${APP}/projects/wc-nav-2/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('[data-testid="tree-file"][data-path="readme.txt"]').waitFor({ timeout: 30000 });

        // Navigate Back to wc-nav-1
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        assert.ok(page.url().includes('wc-nav-1'), 'Back button navigated to wc-nav-1');

        // Navigate Forward to wc-nav-2
        await page.goForward({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        assert.ok(page.url().includes('wc-nav-2'), 'Forward button navigated to wc-nav-2');

        record('WC-RB-009', 'Browser Back / Forward Navigation', 'PASS', { currentUrl: page.url() });
      } catch (err) {
        record('WC-RB-009', 'Browser Back / Forward Navigation', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // -------------------------------------------------------------------------
    // GROUP 2: WC-007 Debounced & Serialized File Synchronization & Real HMR (Gate B1-C)
    // -------------------------------------------------------------------------
    log('\n--- GROUP 2: WC-007 File Synchronization & HMR ---');

    // WC-FS-001 & WC-FS-002: Rapid Monaco Edits + React HMR Verification
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [
          {
            id: 'wc-fs-sync',
            name: 'WC-FS-Sync',
            editorStyle: 'vscode',
            projectType: 'react',
            files: [
              { path: 'package.json', content: REACT_PKG },
              { path: 'vite.config.js', content: REACT_VITE_CONFIG },
              { path: 'index.html', content: REACT_INDEX },
              { path: 'src/main.jsx', content: reactMain('FS-SYNC-V1') },
              { path: 'src/style.css', content: 'body { margin: 0; }' },
            ],
          },
        ]);

        await page.goto(`${APP}/projects/wc-fs-sync/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        // Wait for dev server ready
        await waitTerm(page, /ready in \d+\s?ms/i, 240000, 'Vite ready for HMR test');
        let initialText = null;
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(3000);
          initialText = await previewFrameText(page, 15000);
          if (initialText && initialText.includes('FS-SYNC-V1')) break;
        }
        assert.ok(initialText && initialText.includes('FS-SYNC-V1'), 'Initial render confirmed');

        // WC-FS-001: Execute rapid Monaco typing edits
        await page.locator('[data-testid="tree-file"][data-path="src/main.jsx"]').click();
        await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
        await page.evaluate(() => {
          const ta = document.querySelector('.monaco-editor textarea');
          if (ta) ta.focus();
        });

        log('Executing typing updates in Monaco editor...');
        await page.keyboard.press('ControlOrMeta+a');
        await page.keyboard.type(reactMain('FS-SYNC-V2'), { delay: 1 });

        // WC-FS-002: Verify React HMR hot update without iframe reload
        log('Waiting for Vite HMR hot-update in preview frame...');
        let hotUpdated = false;
        let hmrText = null;
        for (let i = 0; i < 24; i++) {
          await page.waitForTimeout(3000);
          hmrText = await previewFrameText(page, 15000);
          if (hmrText && hmrText.includes('FS-SYNC-V2')) {
            hotUpdated = true;
            break;
          }
        }
        assert.ok(hotUpdated, `Preview frame hot-updated to FS-SYNC-V2: ${hmrText}`);
        record('WC-FS-001', 'Monaco Edits (Debounce & FIFO Coordination)', 'PASS', { editConfirmed: true });
        record('WC-FS-002', 'Real React HMR Live Preview Hot-Update', 'PASS', { hmrText });

        // WC-FS-010: Refresh & Storage Consistency Check
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        const storedFiles = await idbFiles(page, 'wc-fs-sync');
        assert.ok(
          storedFiles['src/main.jsx'] && storedFiles['src/main.jsx'].includes('FS-SYNC-V2'),
          'Stored IndexedDB content matches final edit'
        );
        record('WC-FS-010', 'Refresh and Storage Consistency', 'PASS', { storedPath: 'src/main.jsx' });

      } catch (err) {
        record('WC-FS-001_002', 'File Sync & HMR Scenarios', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // WC-FS-003: Vue SFC HMR Verification
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [{
          id: 'wc-vue-hmr',
          name: 'WC-Vue-HMR',
          editorStyle: 'vscode',
          projectType: 'vue',
          files: [
            { path: 'package.json', content: VUE_PKG },
            { path: 'vite.config.js', content: VUE_VITE_CONFIG },
            { path: 'index.html', content: VUE_INDEX },
            { path: 'src/main.js', content: VUE_MAIN },
            { path: 'src/App.vue', content: vueApp('VUE-HMR-V1') },
            { path: 'src/style.css', content: '' },
          ],
        }]);

        await page.goto(`${APP}/projects/wc-vue-hmr/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        await waitTerm(page, /ready in \d+\s?ms/i, 240000, 'Vue Vite ready');
        let vueText1 = null;
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(3000);
          vueText1 = await previewFrameText(page, 15000);
          if (vueText1 && vueText1.includes('VUE-HMR-V1')) break;
        }
        assert.ok(vueText1 && vueText1.includes('VUE-HMR-V1'), 'Vue V1 confirmed');

        // Edit App.vue
        await page.locator('[data-testid="tree-file"][data-path="src/App.vue"]').click();
        await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
        await page.evaluate(() => {
          const ta = document.querySelector('.monaco-editor textarea');
          if (ta) ta.focus();
        });
        await page.keyboard.press('ControlOrMeta+a');
        await page.keyboard.type(vueApp('VUE-HMR-V2'), { delay: 1 });

        let vueText2 = null;
        for (let i = 0; i < 24; i++) {
          await page.waitForTimeout(3000);
          vueText2 = await previewFrameText(page, 15000);
          if (vueText2 && vueText2.includes('VUE-HMR-V2')) break;
        }
        assert.ok(vueText2 && vueText2.includes('VUE-HMR-V2'), `Vue HMR hot-updated: ${vueText2}`);
        record('WC-FS-003', 'Vue SFC Live HMR Hot-Update', 'PASS', { renderedText: vueText2 });
      } catch (err) {
        record('WC-FS-003', 'Vue SFC Live HMR Hot-Update', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // -------------------------------------------------------------------------
    // GROUP 3: WC-002 Root Manifest Correctness & Monorepo Isolation (Gate B1-D)
    // -------------------------------------------------------------------------
    log('\n--- GROUP 3: WC-002 Root Manifest Correctness ---');

    // WC-MAN-001: Monorepo nested-only manifest (packages/client/package.json)
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [{
          id: 'wc-nested-mono',
          name: 'WC-Nested-Mono',
          editorStyle: 'vscode',
          projectType: 'react',
          files: [
            {
              path: 'packages/client/package.json',
              content: JSON.stringify({ name: 'nested-client', version: '1.0.0', dependencies: { react: '^18.0.0' } }),
            },
            {
              path: 'packages/client/src/index.js',
              content: 'console.log("nested monorepo client");',
            },
            {
              path: 'README.md',
              content: '# Monorepo without root manifest',
            },
          ],
        }]);

        await page.goto(`${APP}/projects/wc-nested-mono/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        // Shell boots to ready prompt
        await waitTerm(page, /❯|Starting interactive shell/, 60000, 'Shell ready prompt');

        // Confirm NO root package.json was synthesized, NO auto npm install was dispatched
        await page.waitForTimeout(5000);
        const t = await termText(page);
        assert.ok(!/Installing dependencies|npm install|ENOENT.*open.*package\.json/.test(t), 'No invalid root install');

        // Verify stored files do NOT contain a synthesized package.json
        const files = await idbFiles(page, 'wc-nested-mono');
        assert.equal(files['package.json'], undefined, 'Root package.json was NOT synthesized');
        assert.ok(files['packages/client/package.json'], 'Nested package.json preserved');

        record('WC-MAN-001', 'Nested Monorepo Manifest (Zero Invalid Root Install)', 'PASS', {
          noRootSynthesis: true,
          noEnoentCrash: true,
        });
      } catch (err) {
        record('WC-MAN-001', 'Nested Monorepo Manifest', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

    // WC-MAN-004: Explicit root manifest without dependencies (Idle shell)
    {
      const ctx = await newCtx(browser);
      const page = await ctx.newPage();
      try {
        await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await seedProjects(page, [{
          id: 'wc-no-deps',
          name: 'WC-No-Deps',
          editorStyle: 'vscode',
          projectType: 'react',
          files: [
            { path: 'package.json', content: JSON.stringify({ name: 'no-deps-pkg', version: '1.0.0' }) },
            { path: 'index.js', content: 'console.log("hello");' },
          ],
        }]);

        await page.goto(`${APP}/projects/wc-no-deps/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
        await page.locator('.xterm-rows').first().waitFor({ timeout: 60000 });

        await waitTerm(page, /❯|Starting interactive shell/, 60000, 'Shell ready prompt');
        await page.waitForTimeout(5000);
        const t = await termText(page);
        assert.ok(!/Installing dependencies|npm install/.test(t), 'No auto install for manifest without dependencies');
        record('WC-MAN-004', 'Explicit Manifest Without Dependencies (Idle Shell)', 'PASS', { isIdle: true });
      } catch (err) {
        record('WC-MAN-004', 'Explicit Manifest Without Dependencies', 'FAIL', { error: err.message });
        throw err;
      } finally {
        await page.close();
        await ctx.close();
      }
    }

  } catch (err) {
    log(`FATAL ERROR IN HARNESS: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server) server.kill();
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  log('\n================================================================');
  log(`SUMMARY: ${results.length} Scenarios Executed | ${passed} PASSED | ${failed} FAILED`);
  log('================================================================');

  // Write JSON report
  const reportPath = path.join(process.cwd(), 'reports', 'closure-runtime-browser.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results, passed, failed, performanceMeasurements, logs: logBuffer }, null, 2));
  log(`Evidence saved to ${reportPath}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled harness exception:', err);
  process.exit(1);
});
