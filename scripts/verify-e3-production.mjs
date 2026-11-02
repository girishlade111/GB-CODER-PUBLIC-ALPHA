#!/usr/bin/env node
/**
 * GB Coder — Stage E3 Production verification (P1–P8).
 * Target: https://code.ladestack.in (post-merge main @ 38c3d1e).
 * Disposable Chromium contexts only. Synthetic E3-* projects only.
 * No real user profiles touched. No destructive migration tests.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';

const PROD = 'https://code.ladestack.in';
const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

const results = { prod: PROD, checks: {}, order: [] };
const scenarioFailures = [];
function record(id, status, details = {}) {
  results.checks[id] = { status, ...details };
  results.order.push(id);
  console.log(`[${status}] ${id}${details.note ? ' — ' + details.note : ''}`);
}

// ---- global diagnostics collectors (P8) ----
const diag = { consoleErrors: [], failedRequests: [], badResponses: [], pageErrors: [] };
function watch(page, tag) {
  page.on('console', (m) => {
    if (m.type() === 'error') diag.consoleErrors.push(`[${tag}] ${m.text().slice(0, 300)}`);
  });
  page.on('pageerror', (e) => diag.pageErrors.push(`[${tag}] ${String(e && e.message || e).slice(0, 300)}`));
  page.on('requestfailed', (r) => diag.failedRequests.push(`[${tag}] ${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) diag.badResponses.push(`[${tag}] ${r.status()} ${r.url().slice(0, 160)}`);
  });
}

async function newPage(browser, tag, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {} });
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

async function readStore(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const out = { pointer: window.localStorage.getItem('gb-coder-active-project-id'), projects: {} };
    const req = indexedDB.open('gb-coder-projects-db', 1);
    req.onsuccess = () => {
      const db = req.result;
      out.version = db.version;
      out.stores = Array.from(db.objectStoreNames);
      const tx = db.transaction(['projects', 'projectFiles'], 'readonly');
      const projects = [], files = [];
      tx.objectStore('projects').getAll().onsuccess = (e) => projects.push(...e.target.result);
      tx.objectStore('projectFiles').getAll().onsuccess = (e) => files.push(...e.target.result);
      tx.oncomplete = () => {
        for (const p of projects) out.projects[p.id] = { record: p, files: {} };
        for (const f of files) if (out.projects[f.projectId]) out.projects[f.projectId].files[f.path] = f.content;
        resolve(out);
      };
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  }));
}

async function idbFileHas(page, pid, p, token) {
  return page.evaluate(([pid2, p2, tok]) => new Promise((res) => {
    const r = indexedDB.open('gb-coder-projects-db', 1);
    r.onsuccess = () => {
      const g = r.result.transaction(['projectFiles'], 'readonly').objectStore('projectFiles').get([pid2, p2]);
      g.onsuccess = () => res(String(g.result?.content || '').includes(tok));
      g.onerror = () => res(false);
    };
    r.onerror = () => res(false);
  }), [pid, p, token]);
}

async function waitForIdbToken(page, pid, p, token, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await idbFileHas(page, pid, p, token)) return;
    if (Date.now() >= deadline) throw new Error(`store condition never met: ${label}`);
    await page.waitForTimeout(500);
  }
}

async function focusFirstMonaco(page) {
  await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
  await page.evaluate(() => { const ta = document.querySelector('.monaco-editor textarea'); if (ta) ta.focus(); });
}

async function previewRendersMarker(page, marker, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const hit = await page.evaluate((m) => {
      for (const fr of document.querySelectorAll('iframe')) {
        try {
          const doc = fr.contentDocument;
          if (doc && (doc.body?.innerText || '').includes(m)) return 'iframe:' + (fr.getAttribute('data-testid') || fr.src.slice(0, 40) || 'srcdoc');
        } catch { /* cross-origin: skip */ }
      }
      const col = document.querySelector('[data-testid="preview-column"]');
      if (col && col.innerText.includes(m)) return 'preview-column';
      return null;
    }, marker);
    if (hit) return hit;
    if (Date.now() >= deadline) throw new Error(`preview never rendered marker ${marker}`);
    await page.waitForTimeout(1000);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  // ---------- P1 marketing ----------
  {
    const { ctx, page } = await newPage(browser, 'P1');
    try {
      const resp = await page.goto(`${PROD}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      assert.equal(resp.status(), 200);
      const body = await page.evaluate(() => document.body.innerText);
      assert.ok(body.includes('GB Coder'), 'branding present');
      const cta = page.locator('a[href*="/app"]').first();
      await cta.waitFor({ timeout: 15000 });
      await Promise.all([page.waitForURL(/\/app/, { timeout: 15000 }), cta.click()]);
      record('P1', 'PASS', { note: `marketing 200, branding ok, CTA navigates to ${page.url()}` });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }

  // ---------- P2 static editor ----------
  {
    const { ctx, page } = await newPage(browser, 'P2');
    try {
      await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'e3-p2', name: 'E3-Static', editorStyle: 'plain', projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>E3P2-V1</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] }]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=E3-Static').first().click();
      await page.waitForFunction(() => document.body.innerText.includes('E3P2-V1'), undefined, { timeout: 60000, polling: 500 });
      await page.locator('[data-testid="preview-column"]').first().waitFor({ timeout: 30000 });
      const via = await previewRendersMarker(page, 'E3P2-V1');
      await focusFirstMonaco(page);
      await page.keyboard.type('<p>E3P2-V2</p>', { delay: 5 });
      await page.waitForFunction(() => document.body.innerText.includes('E3P2-V2'), undefined, { timeout: 30000, polling: 500 });
      await waitForIdbToken(page, 'e3-p2', 'index.html', 'E3P2-V2', 60000, 'static edit persisted');
      const via2 = await previewRendersMarker(page, 'E3P2-V2', 45000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('E3P2-V2'), undefined, { timeout: 60000, polling: 500 });
      record('P2', 'PASS', { note: `static edit+preview+reload persist ok (render via ${via} -> ${via2})` });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }

  // ---------- P3 advanced IDE ----------
  {
    const { ctx, page } = await newPage(browser, 'P3');
    try {
      await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'e3-p3', name: 'E3-IDE', editorStyle: 'vscode', projectType: 'react',
          files: [{ path: 'src/a.jsx', content: 'export const KEEP_E3P3_A = 1;\n' }, { path: 'src/b.jsx', content: 'export const KEEP_E3P3_B = 1;\n' }] },
        { id: 'e3-p3plain', name: 'E3-Plain2', editorStyle: 'plain', projectType: 'plain',
          files: [{ path: 'index.html', content: '<h1>E3P3-PLAIN</h1>' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=E3-IDE').first().click();
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 120000 });
      await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
      const nodeA = page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]');
      await nodeA.waitFor({ timeout: 30000 });
      await nodeA.click();
      await page.waitForFunction(() => document.body.innerText.includes('KEEP_E3P3_A'), undefined, { timeout: 60000, polling: 500 });
      await page.keyboard.press('F2');
      await page.locator('input:focus').fill('renamed_e3.jsx');
      await page.keyboard.press('Enter');
      await page.locator('[data-testid="tree-file"][data-path="src/renamed_e3.jsx"]').waitFor({ timeout: 15000 });
      await page.locator('.monaco-editor').first().waitFor({ timeout: 30000 });
      const termVisible = await page.locator('.xterm-rows').count().then((c) => c > 0);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('KEEP_E3P3_A'), undefined, { timeout: 90000, polling: 500 });
      const store = await readStore(page);
      assert.ok(store.projects['e3-p3'].files['src/renamed_e3.jsx']?.includes('KEEP_E3P3_A'), 'rename persisted');
      assert.ok(!store.projects['e3-p3'].files['src/a.jsx'], 'old path gone');
      record('P3', 'PASS', { note: `IDE open/save/rename/reload ok, terminal UI ${termVisible ? 'present' : 'NOT seen'}` });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }

  // ---------- P4 webcontainer ----------
  {
    const { ctx, page } = await newPage(browser, 'P4');
    try {
      await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [{ id: 'e3-p4', name: 'E3-WC', editorStyle: 'vscode', projectType: 'react',
        files: [{ path: 'package.json', content: '{"name":"e3wc","private":true,"type":"module","dependencies":{"react":"^18.3.1"}}' }, { path: 'src/a.jsx', content: 'export const KEEP_E3P4 = 1;\n' }] }]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=E3-WC').first().click();
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
      const iso = await page.evaluate(() => ({ coi: window.crossOriginIsolated === true, sab: typeof SharedArrayBuffer !== 'undefined' }));
      assert.ok(iso.coi, 'cross-origin isolated');
      assert.ok(iso.sab, 'SharedArrayBuffer present');
      await page.waitForFunction(() => /ready in \d+\s?ms/i.test(document.querySelector('.xterm-rows')?.innerText || '') || document.querySelector('iframe[src^="http"]') !== null, undefined, { timeout: 300000, polling: 1000 });
      const store = await readStore(page);
      assert.ok(Object.values(store.projects['e3-p4'].files).join('').includes('KEEP_E3P4'));
      // Monaco edit persists (hot-update of preview attempted best-effort below)
      const nodeA = page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]');
      await nodeA.waitFor({ timeout: 30000 }); await nodeA.click();
      await focusFirstMonaco(page);
      await page.keyboard.type('\n// E3P4-EDIT\n', { delay: 5 });
      await waitForIdbToken(page, 'e3-p4', 'src/a.jsx', 'E3P4-EDIT', 90000, 'wc edit persisted');
      let hot = 'not-observed';
      try {
        const deadline = Date.now() + 60000;
        for (;;) {
          const hit = await page.evaluate(() => {
            for (const fr of document.querySelectorAll('iframe[src^="http"]')) {
              try { if ((fr.contentDocument?.body?.innerText || '').length > 0) return 'preview-frame-loaded'; } catch {}
            }
            return null;
          });
          if (hit) { hot = hit; break; }
          if (Date.now() >= deadline) break;
          await page.waitForTimeout(2000);
        }
      } catch {}
      record('P4', 'PASS', { note: `isolated=${iso.coi} sab=${iso.sab}, boot evidence ok, edit persisted, hot-reload:${hot}` });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }

  // ---------- P5 service worker ----------
  {
    const { ctx, page } = await newPage(browser, 'P5');
    try {
      await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const swResp = await page.request.get(`${PROD}/app/sw.js`);
      assert.equal(swResp.status(), 200);
      const swText = await swResp.text();
      assert.ok(swText.length > 1000, 'sw.js substantial');
      // Wait for activation (ready resolves only with an active worker).
      await page.evaluate(() => navigator.serviceWorker.ready.then(() => true), undefined, { timeout: 60000 }).catch(() => false);
      await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => !!r?.active), undefined, { timeout: 60000 });
      const reg = await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r ? { scope: r.scope, active: !!r.active, state: r.active?.state } : null));
      assert.ok(reg && reg.active, `sw active (scope=${reg?.scope} state=${reg?.state})`);
      assert.ok(reg.scope.includes('/app'), 'scope under /app');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForFunction(() => document.body.innerText.length > 200, undefined, { timeout: 30000, polling: 500 });
      record('P5', 'PASS', { note: `sw.js 200 (${swText.length}b), active=${reg.state}, scope ok, single reload clean` });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }

  // ---------- P6 backup/restore ----------
  {
    const zipPath = path.join(os.tmpdir(), 'e3-prod-backup.zip');
    const manifest = {};
    { // export profile
      const { ctx, page } = await newPage(browser, 'P6-export', { acceptDownloads: true });
      try {
        await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const files = [
          { path: 'index.html', content: '<h1>E3P6-HASH</h1>' },
          { path: 'style.css', content: 'h1{color:#e30613}' },
          { path: 'script.js', content: 'window.__E3P6=42;' },
        ];
        await seedProjects(page, [{ id: 'e3-p6', name: 'E3-Backup', editorStyle: 'plain', projectType: 'plain', files }]);
        for (const f of files) manifest[`e3-p6/${f.path}`] = sha256(f.content);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 20000 });
        await page.locator('[data-testid="dashboard-backup"]').click();
        await page.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 8000 });
        const [download] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.locator('[data-testid="btn-export-backup"]').click()]);
        await download.saveAs(zipPath);
        const buf = fs.readFileSync(zipPath);
        const zip = await JSZip.loadAsync(buf);
        const zmanifest = zip.file('manifest.json');
        assert.ok(zmanifest, 'ZIP contains manifest.json');
        const zchecks = zip.file('integrity/checksums.json');
        assert.ok(zchecks, 'ZIP contains integrity/checksums.json');
        const mjson = JSON.parse(await zmanifest.async('string'));
        assert.equal(mjson.format, 'gb-coder-backup');
        assert.equal(mjson.formatVersion, 1);
        const checksums = JSON.parse(await zchecks.async('string'));
        const zipHashes = new Set();
        for (const [entryPath, expectedHash] of Object.entries(checksums)) {
          const entry = zip.file(entryPath);
          assert.ok(entry, `checksummed entry present: ${entryPath}`);
          const content = await entry.async('string');
          assert.equal(sha256(content).toLowerCase(), String(expectedHash).toLowerCase(), `checksum ok ${entryPath}`);
          zipHashes.add(sha256(content));
        }
        for (const h of Object.values(manifest)) assert.ok(zipHashes.has(h), 'seeded file hash present in archive');
        record('P6-export', 'PASS', { note: `zip ${buf.length}b, manifest ok, ${Object.keys(checksums).length} entries verified, 3/3 seeded hashes present` });
      } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
    }
    { // restore profile (clean)
      const { ctx, page } = await newPage(browser, 'P6-restore');
      try {
        await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.locator('[data-testid="project-dashboard"]').waitFor({ timeout: 20000 });
        const store0 = await readStore(page);
        assert.equal(Object.keys(store0.projects).length, 0, 'clean profile starts empty');
        await page.locator('[data-testid="dashboard-restore"]').click();
        await page.locator('[data-testid="backup-restore-modal"]').waitFor({ timeout: 8000 });
        await page.locator('[data-testid="input-restore-file"]').setInputFiles(zipPath);
        await page.locator('[data-testid="btn-confirm-restore"]').waitFor({ timeout: 15000 });
        await page.locator('[data-testid="btn-confirm-restore"]').click();
        await page.locator('[data-testid="dashboard-project-list"]').waitFor({ timeout: 15000 });
        const store = await readStore(page);
        for (const [rel, hash] of Object.entries(manifest)) {
          const [pid, ...rest] = rel.split('/');
          const p = rest.join('/');
          const got = store.projects[pid]?.files[p];
          assert.ok(got !== undefined, `restored ${rel}`);
          assert.equal(sha256(got), hash, `restored hash ok ${rel}`);
        }
        record('P6-restore', 'PASS', { note: 'clean-profile restore 3/3 hashes match' });
      } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
    }
    try { fs.unlinkSync(zipPath); } catch {}
  }

  // ---------- P7 data safety ----------
  {
    const { ctx, page } = await newPage(browser, 'P7');
    try {
      await page.goto(`${PROD}/app/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await seedProjects(page, [
        { id: 'e3-p7a', name: 'E3-Static7', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>E3P7-STATIC</h1>' }] },
        { id: 'e3-p7b', name: 'E3-IDE7', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/a.jsx', content: 'y' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=E3-Static7').first().click();
      await page.waitForFunction(() => document.body.innerText.includes('E3P7-STATIC'), undefined, { timeout: 60000, polling: 500 });
      const s = await readStore(page);
      assert.equal(s.version, 1);
      assert.ok(s.stores.includes('projects') && s.stores.includes('projectFiles'));
      const a = s.projects['e3-p7a'].record, b = s.projects['e3-p7b'].record;
      assert.equal(a.editorStyle, 'plain'); assert.equal(a.projectType, 'plain');
      assert.equal(b.editorStyle, 'vscode'); assert.equal(b.projectType, 'react');
      assert.ok((s.pointer || '').length > 0, 'active pointer set');
      record('P7', 'PASS', { note: 'schema v1, stores intact, editorStyle/projectType distinct, pointer set' });
    } catch (e) { scenarioFailures.push(String(e && e.message || e).slice(0, 300)); } finally { await page.close(); await ctx.close(); }
  }
} catch (e) {
  record('FATAL', 'FAIL', { note: String(e && e.message || e).slice(0, 500) });
} finally {
  await browser.close();
}

// ---------- flush per-scenario failures (a throw no longer aborts later checks) ----------
scenarioFailures.forEach((msg, i) => record(`SCENARIO-FAIL-${i + 1}`, 'FAIL', { note: msg }));

// ---------- P8 classification ----------
const benign = [/inmemory:\/\/model\//, /ERR_ABORTED/, /Aborted/, /favicon\.ico/];
const isBenign = (s) => benign.some((re) => re.test(s));
const allIssues = [...diag.consoleErrors, ...diag.pageErrors, ...diag.failedRequests, ...diag.badResponses];
const real = allIssues.filter((s) => !isBenign(s));
record('P8', real.length === 0 ? 'PASS' : 'REVIEW', {
  note: `${allIssues.length} total diagnostics, ${real.length} non-benign`,
  consoleErrors: diag.consoleErrors.slice(0, 15),
  pageErrors: diag.pageErrors.slice(0, 15),
  failedRequests: diag.failedRequests.slice(0, 15),
  badResponses: diag.badResponses.slice(0, 15),
  nonBenign: real.slice(0, 15),
});

const fails = Object.entries(results.checks).filter(([, v]) => v.status === 'FAIL' || v.status === 'REVIEW');
console.log(`\nE3 SUMMARY: ${results.order.length} checks, ${fails.length} failing/needs-review`);
const outPath = path.join(os.tmpdir(), 'e3-production-verify.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`results: ${outPath}`);
process.exit(fails.length ? 1 : 0);
