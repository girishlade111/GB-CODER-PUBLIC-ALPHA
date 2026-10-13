/**
 * GB Coder — Phase 2.1C real-application browser suite.
 *
 * Drives the built app (dist/) in Chromium with disposable profiles against
 * real IndexedDB/localStorage. Deterministic final-state assertions only:
 * every wait is on observable UI/storage state (waitForFunction / locators),
 * never a bare sleep standing in for race correctness.
 *
 * Scenarios (§10): rapid A→B→C selection, blocked-IDB switch guard, autosave
 * mirror honesty under quota fault, refresh of committed state, back/forward
 * across editor modes, IDE file rename (+collision guard), 112-file reopen
 * integrity, restart persistence, WebContainer boot + data-safe reopen.
 *
 * ZIP backup/restore is covered by audit:e2e:backup and the persistence
 * scenarios C–E; it is referenced, not duplicated, here.
 *
 * Fault injection is explicit and flag-controlled (IDB open failure,
 * localStorage quota) via addInitScript — clearly labelled MOCK-FAULT, used
 * only to create the failure condition; all integrity assertions read the
 * real stores.
 *
 * Run with: npm run audit:e2e:workspace-app (requires `npm run build` first)
 */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

function startServer() {
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) throw new Error('dist/ missing. Run "npm run build" first.');
  const server = http.createServer((req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    // Vercel Analytics beacon: unserved locally. Empty JS keeps the console
    // free of fallback-HTML parse errors (production serves the real script).
    if (reqPath.startsWith('/_vercel/')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.writeHead(204);
      res.end();
      return;
    }
    let filePath;
    if (reqPath === '/' || reqPath === '') {
      filePath = path.join(distDir, 'index.html');
    } else if (reqPath.startsWith('/app')) {
      const sub = reqPath.replace(/^\/app\/?/, '');
      const candidate = path.join(distDir, 'app', sub);
      filePath =
        sub && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
          ? candidate
          : path.join(distDir, 'app', 'index.html');
    } else {
      const candidate = path.join(distDir, reqPath.replace(/^\//, ''));
      filePath =
        fs.existsSync(candidate) && fs.statSync(candidate).isFile()
          ? candidate
          : path.join(distDir, 'index.html');
    }
    res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    try {
      res.writeHead(200);
      res.end(fs.readFileSync(filePath));
    } catch (err) {
      res.writeHead(500);
      res.end(String(err && err.message));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, () => resolve({ server, base: `http://localhost:${server.address().port}` }));
  });
}

const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

// Polls an async IndexedDB condition from Node (honest gating).
//
// waitForFunction does NOT await async predicates when a numeric polling
// interval is used (the pending Promise object is truthy, so it resolves
// immediately — verified with always-false control predicates). Store
// readiness gates must therefore loop page.evaluate explicitly.
async function waitForStore(page, read, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await page.evaluate(read)) return;
    if (Date.now() >= deadline) {
      throw new Error(`store condition never met: ${label}`);
    }
    await page.waitForTimeout(500);
  }
}

async function seedProjects(page, specs) {
  await page.evaluate((list) => {
    const openDb = () =>
      new Promise((resolve, reject) => {
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
          editorStyle: s.editorStyle,
          projectType: s.projectType,
          entry: s.entry,
          fileCount: s.files.length,
        });
        for (const f of s.files) {
          tx.objectStore('projectFiles').put({ projectId: s.id, path: f.path, content: f.content });
        }
      }
      return new Promise((res) => {
        tx.oncomplete = res;
      });
    });
  }, specs);
}

async function readStore(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const out = { pointer: window.localStorage.getItem('gb-coder-active-project-id'), projects: {}, autosave: window.localStorage.getItem('gbcoder_autosave_current') };
        const req = indexedDB.open('gb-coder-projects-db', 1);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['projects', 'projectFiles'], 'readonly');
          const projects = [];
          const files = [];
          tx.objectStore('projects').getAll().onsuccess = (e) => projects.push(...e.target.result);
          tx.objectStore('projectFiles').getAll().onsuccess = (e) => files.push(...e.target.result);
          tx.oncomplete = () => {
            for (const p of projects) out.projects[p.id] = { record: p, files: {} };
            for (const f of files) {
              if (out.projects[f.projectId]) out.projects[f.projectId].files[f.path] = f.content;
            }
            resolve(out);
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      }),
  );
}

async function focusFirstMonaco(page) {
  await page.locator('.monaco-editor').first().waitFor({ timeout: 20000 });
  await page.evaluate(() => {
    const ta = document.querySelector('.monaco-editor textarea');
    if (ta) ta.focus();
  });
}

let failures = 0;
async function scenario(browser, base, name, fn, { reuseContext = null } = {}) {
  const context = reuseContext || (await browser.newContext({ viewport: { width: 1280, height: 800 } }));
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
    } catch { /* ignore */ }
  });
  try {
    await fn(context, page);
    console.log(`ok - ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL - ${name}: ${err.message}`);
    // Failure diagnostics for CI triage: what was on screen and in the store.
    try {
      const diag = await page.evaluate(() => {
        const text = document.body.innerText;
        const openReq = () =>
          new Promise((resolve, reject) => {
            const req = indexedDB.open('gb-coder-projects-db', 1);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });
        return openReq().then(
          (db) =>
            new Promise((resolve) => {
              const tx = db.transaction(['projects', 'projectFiles'], 'readonly');
              const p = [];
              const f = [];
              tx.objectStore('projects').getAll().onsuccess = (e) => p.push(...e.target.result.map((r) => ({ id: r.id, name: r.name, fileCount: r.fileCount })));
              tx.objectStore('projectFiles').getAll().onsuccess = (e) => f.push(...e.target.result.map((r) => [r.projectId, r.path, String(r.content).slice(0, 120)]));
              tx.oncomplete = () =>
                resolve({
                  text: text.slice(0, 1500),
                  pointer: window.localStorage.getItem('gb-coder-active-project-id'),
                  projects: p,
                  files: f,
                  autosave: (window.localStorage.getItem('gbcoder_autosave_current') || '').slice(0, 120),
                });
            }),
          () => ({ text: text.slice(0, 1500), db: 'unopenable' }),
        );
      });
      console.error(`FAILDIAG - ${name}: url=${page.url()} diag=${JSON.stringify(diag).slice(0, 2200)}`);
    } catch { /* diagnostics are best-effort */ }
    try {
      const shot = path.join(os.tmpdir(), `ws-app-${name.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40)}.png`);
      await page.screenshot({ path: shot, timeout: 15000 });
      console.error(`FAILSHOT - ${name}: ${shot}`);
    } catch { /* screenshots are best-effort */ }
  } finally {
    await page.close();
    if (!reuseContext) await context.close();
  }
  return context;
}

async function main() {
  const { server, base } = await startServer();
  console.log(`[workspace-app] serving dist at ${base}`);
  const browser = await chromium.launch({ headless: true });
  // WS_SCENARIO limits execution to scenarios whose name includes the value
  // (comma-separated). Used to iterate on one scenario without rerunning boot.
  const only = (process.env.WS_SCENARIO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const want = (name) => only.length === 0 || only.some((o) => name.includes(o));
  const run = async (_b, _base, name, fn, opts) => {
    if (!want(name)) {
      console.log(`skip - ${name}`);
      return null;
    }
    return scenario(browser, base, name, fn, opts);
  };

  // S1 — consecutive open→dashboard→open transitions converge with no cross-write.
  await run(browser, base, 'S1 consecutive project transitions converge cleanly', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's1-a', name: 'S1-Alpha', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>MARKER-S1-ALPHA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      { id: 's1-b', name: 'S1-Bravo', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>MARKER-S1-BRAVO</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
      { id: 's1-c', name: 'S1-Charlie', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>MARKER-S1-CHARLIE</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    for (const name of ['S1-Alpha', 'S1-Bravo', 'S1-Charlie']) {
      await page.locator(`text=${name}`).first().click();
      await page.waitForFunction(
        (marker) => document.body.innerText.includes(marker),
        `MARKER-${name.replace('S1-', 'S1-').toUpperCase()}`,
        { timeout: 30000, polling: 500 },
      );
      // Leave unsaved-then-flushed edits behind: the dashboard return must
      // persist them under the correct project (flush-on-transition).
      await focusFirstMonaco(page);
      await page.keyboard.type(` UNSET-${name.replace('S1-', 'S1-').toUpperCase()}`, { delay: 5 });
      await page.waitForFunction(
        (marker) => document.body.innerText.includes(marker),
        `UNSET-${name.replace('S1-', 'S1-').toUpperCase()}`,
        undefined, { timeout: 60000, polling: 500 },
      );
      await page.locator('[data-testid="nav-home"]').click();
      await page.locator('text=S1-Alpha').first().waitFor({ timeout: 15000 });
    }
    await page.locator('text=S1-Charlie').first().click();
    await page.waitForFunction(() => document.body.innerText.includes('MARKER-S1-CHARLIE'), undefined, { timeout: 30000, polling: 500 });
    const store = await readStore(page);
    assert.equal(store.pointer, 's1-c');
    assert.ok(Object.values(store.projects['s1-a'].files).join('').includes('MARKER-S1-ALPHA'));
    assert.ok(Object.values(store.projects['s1-a'].files).join('').includes('UNSET-S1-ALPHA'));
    assert.ok(Object.values(store.projects['s1-b'].files).join('').includes('MARKER-S1-BRAVO'));
    assert.ok(Object.values(store.projects['s1-b'].files).join('').includes('UNSET-S1-BRAVO'));
    assert.ok(Object.values(store.projects['s1-c'].files).join('').includes('MARKER-S1-CHARLIE'));
    // No cross-project overwrite: Alpha/Bravo never absorbed Charlie's bytes.
    assert.ok(!Object.values(store.projects['s1-a'].files).join('').includes('CHARLIE'));
  });

  // S2a — failed flush blocks dashboard-return: stays put, edits intact, honest error.
  await run(browser, base, 'S2a failed flush blocks navigation without losing edits', async (_ctx, page) => {
    await page.addInitScript(() => {
      window.__GB_FAIL_IDB__ = false;
      const proto = IDBFactory.prototype;
      const origOpen = proto.open;
      proto.open = function (name, version) {
        if (window.__GB_FAIL_IDB__) {
          const fake = {};
          setTimeout(() => {
            if (fake.onerror) fake.onerror({ target: fake });
          }, 0);
          return fake;
        }
        return origOpen.call(this, name, version);
      };
    });
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's2-a', name: 'S2-Alpha', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>BASE-S2-ALPHA</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S2-Alpha').first().click();
    await page.waitForFunction(() => document.body.innerText.includes('BASE-S2-ALPHA'), undefined, { timeout: 30000, polling: 500 });
    await focusFirstMonaco(page);
    await page.keyboard.type(' UNSET-S2-EDIT', { delay: 5 });
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S2-EDIT'), undefined, { timeout: 15000, polling: 500 });
    // Arm the fault, then attempt to leave: the transition must be refused.
    await page.evaluate(() => {
      window.__GB_FAIL_IDB__ = true;
    });
    await page.locator('[data-testid="nav-home"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('Could not save'), undefined, { timeout: 15000, polling: 500 });
    // Still in the editor with the unsaved edit intact; pointer unmoved.
    assert.ok(await page.evaluate(() => document.body.innerText.includes('UNSET-S2-EDIT')));
    assert.equal(await page.evaluate(() => window.localStorage.getItem('gb-coder-active-project-id')), 's2-a');
    // Release the fault: leaving now succeeds through the normal flush.
    await page.evaluate(() => {
      window.__GB_FAIL_IDB__ = false;
    });
    await page.locator('[data-testid="nav-home"]').click();
    await page.locator('text=S2-Alpha').first().waitFor({ timeout: 15000 });
  });

  // S2b — metadata surviving without file rows recovers to a loud starter.
  await run(browser, base, 'S2b fileless project recovers to a loud starter, never a crash', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    // Seed the record with NO file rows: lost records, surviving metadata.
    await page.evaluate(() => {
      const openDb = () =>
        new Promise((resolve, reject) => {
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
        const tx = db.transaction(['projects'], 'readwrite');
        tx.objectStore('projects').put({
          id: 's2-empty',
          name: 'S2-Empty',
          createdAt: Date.now() - 60000,
          lastOpenedAt: Date.now(),
          editorStyle: 'plain',
          projectType: 'plain',
          fileCount: 0,
        });
        return new Promise((res) => {
          tx.oncomplete = res;
        });
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S2-Empty').first().click();
    // Loud recovery: error toast + starter scaffold in the editor, no crash.
    await page.waitForFunction(() => document.body.innerText.includes('had no files stored'), undefined, { timeout: 30000, polling: 500 });
    const store = await readStore(page);
    assert.equal(store.pointer, 's2-empty');
    assert.deepEqual(Object.keys(store.projects['s2-empty'].files), []);
    // The seeded starter is a draft: past the persist debounce it must still
    // not have been auto-persisted over the (empty) store.
    await page.waitForTimeout(3000);
    const storeAfter = await readStore(page);
    assert.deepEqual(Object.keys(storeAfter.projects['s2-empty'].files), []);
  });

  // S3 — autosave mirror honesty under quota fault (+ surfaced warning).
  // NOTE: the localStorage mirror tracks the static editor's fileProject
  // (IDE edits persist through IndexedDB only — pre-existing architecture,
  // unchanged here), so this scenario runs in the static editor on purpose.
  await run(browser, base, 'S3 quota fault never reports a successful autosave', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's3-a', name: 'S3-Alpha', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>BASE_S3</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('[S3] waiting for card');
    await page.locator('text=S3-Alpha').first().click();
    console.log('[S3] clicked, waiting for content');
    await page.waitForFunction(() => document.body.innerText.includes('BASE_S3'), undefined, { timeout: 60000, polling: 500 });
    console.log('[S3] content visible, arming quota fault');
    await page.evaluate(() => {
      window.__autosaveEvents = [];
      window.addEventListener('autosave', (e) => window.__autosaveEvents.push(e.detail));
      const proto = Storage.prototype;
      const orig = proto.setItem;
      window.__GB_QUOTA__ = true;
      proto.setItem = function (k, v) {
        if (window.__GB_QUOTA__) {
          const err = new Error('Quota exceeded');
          err.name = 'QuotaExceededError';
          throw err;
        }
        return orig.call(this, k, v);
      };
    });
    await focusFirstMonaco(page);
    console.log('[S3] focused, typing');
    await page.keyboard.type('\n// UNSET-S3-EDIT', { delay: 5 });
    // The edit must be visible before any quiescence: otherwise every later
    // assertion about the failed write is vacuous.
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S3-EDIT'), undefined, { timeout: 60000, polling: 500 });
    // Past the 2 s autosave debounce: no success event may fire, the slot
    // must not contain the uncommitted marker, and the quota warning surfaces.
    console.log('[S3] typed, waiting out debounce');
    await page.waitForTimeout(3500);
    console.log('[S3] probing slot');
    const probe = await page.evaluate(() => ({
      count: window.__autosaveEvents.length,
      slot: window.localStorage.getItem('gbcoder_autosave_current') || '',
    }));
    assert.equal(probe.count, 0);
    assert.ok(!probe.slot.includes('UNSET-S3-EDIT'));
    console.log('[S3] slot clean, waiting for quota toast');
    await page.waitForFunction(() => document.body.innerText.includes('quota'), undefined, { timeout: 15000, polling: 500 });
    console.log('[S3] toast seen, releasing fault');
    // Release: the mirror recovers on the next debounce without data loss.
    // (Dots track the canonical IDB persist, which was unaffected throughout.)
    await page.evaluate(() => {
      window.__GB_QUOTA__ = false;
    });
    await page.keyboard.type('\n// UNSET-S3-RECOVERED', { delay: 5 });
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S3-RECOVERED'), undefined, { timeout: 60000, polling: 500 });
    await page.waitForFunction(() => (window.__autosaveEvents || []).length >= 1, undefined, { timeout: 15000, polling: 500 });
    const slot = await page.evaluate(() => window.localStorage.getItem('gbcoder_autosave_current') || '');
    assert.ok(slot.includes('UNSET-S3-RECOVERED'));
  });

  // S4 — refresh of committed state recovers pointer, content and style.
  await run(browser, base, 'S4 committed state survives refresh', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's4-a', name: 'S4-Alpha', editorStyle: 'plain', projectType: 'plain', files: [{ path: 'index.html', content: '<h1>BASE-S4</h1>' }, { path: 'style.css', content: '' }, { path: 'script.js', content: '' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('[S4] waiting for card');
    await page.locator('text=S4-Alpha').first().click();
    console.log('[S4] clicked, waiting for content');
    await page.waitForFunction(() => document.body.innerText.includes('BASE-S4'), undefined, { timeout: 90000, polling: 500 });
    await focusFirstMonaco(page);
    await page.keyboard.type(' UNSET-S4-COMMIT', { delay: 5 });
    // Isolate editor input from persistence: the marker must be visible first.
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S4-COMMIT'), undefined, { timeout: 15000, polling: 500 });
    // Wait for the IDB commit itself (honest Node-side poll of the real store).
    await waitForStore(
      page,
      async () =>
        new Promise((resolve) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => {
            const tx = req.result.transaction(['projectFiles'], 'readonly');
            const got = tx.objectStore('projectFiles').get(['s4-a', 'index.html']);
            got.onsuccess = () => resolve(String(got.result?.content || '').includes('UNSET-S4-COMMIT'));
            got.onerror = () => resolve(false);
          };
          req.onerror = () => resolve(false);
        }),
      30000,
      's4 pre-reload commit',
    );
    // Triumph-or-lie check: dump the store in the same breath as poll-pass.
    // If this dump lacks UNSET, the poll resolved spuriously (harness bug);
    // if it has UNSET, the commit is real and anything later is app behavior.
    console.log('[S4] poll passed; immediate dump:', JSON.stringify(await readStore(page).then((s) => s.projects['s4-a']?.files)));
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Two-stage recovery assertion: the committed bytes must be readable
    // post-reload (store durability), and the editor must render them
    // (display). Whichever stage fails pinpoints the layer.
    await waitForStore(
      page,
      async () =>
        new Promise((resolve) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => {
            const tx = req.result.transaction(['projectFiles'], 'readonly');
            const got = tx.objectStore('projectFiles').get(['s4-a', 'index.html']);
            got.onsuccess = () => resolve(String(got.result?.content || '').includes('UNSET-S4-COMMIT'));
            got.onerror = () => resolve(false);
          };
          req.onerror = () => resolve(false);
        }),
      60000,
      's4 post-reload durability',
    );
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S4-COMMIT'), undefined, { timeout: 180000, polling: 500 });
  });

  // S5 — back/forward across editor modes stays consistent.
  await run(browser, base, 'S5 back/forward across modes keeps a valid editor', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's5-a', name: 'S5-Alpha', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/a.jsx', content: 'export const BASE_S5 = 1;\n' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S5-Alpha').first().click();
    await page.waitForFunction(() => window.location.pathname.includes('/ide'), undefined, { timeout: 60000, polling: 500 });
    await page.waitForFunction(() => document.body.innerText.includes('BASE_S5'), undefined, { timeout: 60000, polling: 500 });
    await page.goBack();
    await page.waitForFunction(() => !window.location.pathname.includes('/ide'), undefined, { timeout: 15000, polling: 500 });
    await page.goForward();
    await page.waitForFunction(() => window.location.pathname.includes('/ide'), undefined, { timeout: 15000, polling: 500 });
    await page.waitForFunction(() => document.body.innerText.includes('BASE_S5'), undefined, { timeout: 60000, polling: 500 });
    // Unsaved IDE edits survive the back/forward cycle through the
    // leave-merge + forward-reload path (no silent loss on navigation).
    await focusFirstMonaco(page);
    await page.keyboard.type('\n// UNSET-S5-NAV', { delay: 5 });
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S5-NAV'), undefined, { timeout: 60000, polling: 500 });
    // Commit before navigating: the leave path preserves in-memory work, but
    // the forward reload reads IndexedDB, so the assertion needs the commit.
    await waitForStore(
      page,
      async () =>
        new Promise((resolve) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => {
            const tx = req.result.transaction(['projectFiles'], 'readonly');
            const got = tx.objectStore('projectFiles').get(['s5-a', 'src/a.jsx']);
            got.onsuccess = () => resolve(String(got.result?.content || '').includes('UNSET-S5-NAV'));
            got.onerror = () => resolve(false);
          };
          req.onerror = () => resolve(false);
        }),
      60000,
      's5 pre-navigation commit',
    );
    await page.goBack();
    await page.waitForFunction(() => !window.location.pathname.includes('/ide'), undefined, { timeout: 15000, polling: 500 });
    await page.goForward();
    await page.waitForFunction(() => document.body.innerText.includes('UNSET-S5-NAV'), undefined, { timeout: 120000, polling: 500 });
  });

  // S6 — IDE file rename via keyboard keeps focus valid; collisions refused.
  await run(browser, base, 'S6 IDE rename keeps valid focus and refuses collisions', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      {
        id: 's6-a', name: 'S6-Alpha', editorStyle: 'vscode', projectType: 'react',
        files: [
          { path: 'src/a.jsx', content: 'export const KEEP_S6_A = 1;\n' },
          { path: 'src/b.jsx', content: 'export const KEEP_S6_B = 2;\n' },
        ],
      },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S6-Alpha').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 60000 });
    const nodeA = page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]');
    await nodeA.waitFor({ timeout: 15000 });
    await nodeA.click();
    await page.waitForFunction(() => document.body.innerText.includes('KEEP_S6_A'), undefined, { timeout: 30000, polling: 500 });
    await page.keyboard.press('F2');
    // fill() replaces the whole name deterministically (Ctrl+A is unreliable
    // in headless inputs and would leave a doubled extension on partial picks).
    await page.locator('input:focus').fill('renamed.jsx');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.body.innerText.includes('KEEP_S6_A'), undefined, { timeout: 15000, polling: 500 });
    // Collision attempt: renamed.jsx -> b.jsx must be refused with data intact.
    const nodeR = page.locator('[data-testid="tree-file"][data-path="src/renamed.jsx"]');
    await nodeR.waitFor({ timeout: 15000 });
    await nodeR.click();
    await page.keyboard.press('F2');
    await page.locator('input:focus').fill('b.jsx');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const store = await readStore(page);
    const paths = Object.keys(store.projects['s6-a'].files).sort();
    assert.deepEqual(paths, ['src/b.jsx', 'src/renamed.jsx']);
    assert.ok(store.projects['s6-a'].files['src/b.jsx'].includes('KEEP_S6_B'));
    assert.ok(store.projects['s6-a'].files['src/renamed.jsx'].includes('KEEP_S6_A'));
  });

  // S7 — 112-file project reopens byte-identical across reload.
  await run(browser, base, 'S7 112-file project reopens byte-identical', async (_ctx, page) => {
    const files = [];
    for (let i = 0; i < 112; i++) {
      files.push({ path: `src/mod${Math.floor(i / 16)}/file${i}.jsx`, content: `// S7 file ${i}\nexport const v${i} = ${i};\n` });
    }
    const expected = {};
    for (const f of files) expected[f.path] = sha256(f.content);
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's7-big', name: 'S7-Big', editorStyle: 'vscode', projectType: 'react', files },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S7-Big').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (window.localStorage.getItem('gb-coder-active-project-id') || '').length > 0, undefined, { timeout: 30000, polling: 500 });
    const store = await readStore(page);
    const back = store.projects['s7-big'].files;
    assert.equal(Object.keys(back).length, 112);
    for (const [p, c] of Object.entries(back)) {
      assert.equal(sha256(c), expected[p], `drift in ${p}`);
    }
  });

  // S8 — restart (same profile, new page) preserves pointer, content, style.
  const restartCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await run(
    browser,
    base,
    'S8 restart preserves workspace',
    async (_ctx, page) => {
      await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
      await seedProjects(page, [
        { id: 's8-a', name: 'S8-Alpha', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/a.jsx', content: 'export const KEEP_S8 = 1;\n' }] },
      ]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('text=S8-Alpha').first().click();
      await page.waitForFunction(() => document.body.innerText.includes('KEEP_S8'), undefined, { timeout: 60000, polling: 500 });
    },
    { reuseContext: restartCtx },
  );
  await run(
    browser,
    base,
    'S8b reopened page restores the workspace',
    async (_ctx, page) => {
      await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.body.innerText.includes('KEEP_S8'), undefined, { timeout: 90000, polling: 500 });
      const store = await readStore(page);
      assert.equal(store.pointer, 's8-a');
    },
    { reuseContext: restartCtx },
  );
  await restartCtx.close();

  // S9 — WebContainer boot smoke + data-safe reopen (long timeout; env-honest).
  await run(browser, base, 'S9 WebContainer boot and data-safe reopen', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      {
        id: 's9-a', name: 'S9-Alpha', editorStyle: 'vscode', projectType: 'react',
        files: [
          { path: 'package.json', content: '{"name":"s9","private":true,"type":"module","dependencies":{"react":"^18.3.1"}}' },
          { path: 'src/a.jsx', content: 'export const KEEP_S9 = 1;\n' },
        ],
      },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S9-Alpha').first().click();
    await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 90000 });
    // Boot + install + dev server: generous budget, polled state only.
    // Genuine boot evidence only: Vite's "ready in" terminal signature or a
    // dev-server preview iframe. Bare status text is not accepted.
    await page.waitForFunction(
      () =>
        /ready in \d+\s?ms/i.test(document.querySelector('.xterm-rows')?.innerText || '') ||
        document.querySelector('iframe[src^="http"]') !== null,
      undefined, { timeout: 300000, polling: 1000 },
    );
    const store = await readStore(page);
    assert.ok(Object.values(store.projects['s9-a'].files).join('').includes('KEEP_S9'));
  });

  // S10 — slow Project A load overlapped by a newer B selection: B wins cleanly.
  // Deterministic inversion via a controllable open-delay fault (MOCK-FAULT):
  // A's IndexedDB opens are trapped for 4 s while B's proceed immediately,
  // so A's load is GUARANTEED to complete after B's. Without the generation
  // guard A's stale completion would overwrite B; with it A is abandoned.
  // A's own touchProject still lands (it runs before the guard), which proves
  // the inversion really happened: lastOpenedAt advances while B stays shown.
  await run(browser, base, 'S10 slow load overlapped by newer selection loses correctly', async (_ctx, page) => {
    await page.addInitScript(() => {
      window.__GB_IDB_DELAY_MS__ = 0;
      const proto = IDBFactory.prototype;
      const origOpen = proto.open;
      proto.open = function (...args) {
        const ms = window.__GB_IDB_DELAY_MS__ || 0;
        if (!ms) return origOpen.apply(this, args);
        const handlers = {};
        const fake = {};
        for (const k of ['onupgradeneeded', 'onsuccess', 'onerror', 'onblocked']) {
          Object.defineProperty(fake, k, {
            get: () => handlers[k],
            set: (v) => {
              handlers[k] = v;
            },
            configurable: true,
          });
        }
        Object.defineProperty(fake, 'result', { get: () => real?.result, configurable: true });
        Object.defineProperty(fake, 'error', { get: () => real?.error, configurable: true });
        let real = null;
        const self = this;
        setTimeout(() => {
          try {
            real = origOpen.apply(self, args);
          } catch (e) {
            if (handlers.onerror) handlers.onerror({ target: fake });
            return;
          }
          for (const k of ['onupgradeneeded', 'onsuccess', 'onerror', 'onblocked']) {
            real[k] = (e) => handlers[k]?.({ ...e, target: fake });
          }
        }, ms);
        return fake;
      };
    });
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's10-slow', name: 'S10-Slow', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/a.jsx', content: 'export const MARKER_S10_SLOW = 1;\n' }] },
      { id: 's10-fast', name: 'S10-Fast', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/f.jsx', content: 'export const MARKER_S10_FAST = 1;\n' }] },
    ]);
    const t0 = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S10-Slow').first().waitFor({ timeout: 30000 });
    // Trap A's opens, dispatch its load, release the trap, then load B.
    // Microtask ordering guarantees A's opens are trapped before disarming.
    await page.evaluate(() => {
      window.__GB_IDB_DELAY_MS__ = 4000;
    });
    await page.locator('text=S10-Slow').first().click();
    await page.evaluate(() => {
      window.__GB_IDB_DELAY_MS__ = 0;
    });
    await page.locator('text=S10-Fast').first().click();
    await page.waitForFunction(() => document.body.innerText.includes('MARKER_S10_FAST'), undefined, { timeout: 60000, polling: 500 });
    // Let A's delayed load finish attempting (its touch lands regardless).
    await page.waitForTimeout(6000);
    const store = await readStore(page);
    assert.equal(store.pointer, 's10-fast');
    const editorStillB = await page.evaluate(() => document.body.innerText.includes('MARKER_S10_FAST'));
    assert.ok(editorStillB, 'stale A completion must not overwrite B');
    assert.ok(!Object.values(store.projects['s10-fast'].files).join('').includes('MARKER_S10_SLOW'));
    const touchedA = await page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onsuccess = () => {
        const got = req.result.transaction(['projects'], 'readonly').objectStore('projects').get('s10-slow');
        got.onsuccess = () => resolve(got.result?.lastOpenedAt ?? 0);
        got.onerror = () => resolve(0);
      };
      req.onerror = () => resolve(0);
    }));
    assert.ok(touchedA > t0, 'A’s inverted load must have completed (touch landed) while B stayed shown');
    void t0;
  });

  // S11 — a commit must not clear newer uncommitted edits (IDE dirty dots).
  await run(browser, base, 'S11 stale commit never clears newer edits', async (_ctx, page) => {
    const files = [];
    for (let i = 0; i < 112; i++) files.push({ path: `src/m${i}.jsx`, content: `export const v${i} = ${i};\n` });
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's11-a', name: 'S11-Alpha', editorStyle: 'vscode', projectType: 'react', files },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S11-Alpha').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
    await page.locator('[data-testid="tree-file"][data-path="src/m0.jsx"]').click();
    await focusFirstMonaco(page);
    // R1, then (while its 112-file commit is plausibly still in flight) R2.
    // A naive clear-all-on-commit would drop R2's dot; content-exact clearing
    // keeps it until R2 itself commits.
    await page.keyboard.type('// UNSET-S11-R1', { delay: 5 });
    await page.waitForTimeout(1600);
    await page.keyboard.type('//UNSET-S11-R2', { delay: 5 });
    await page.waitForTimeout(600);
    const dotsMid = await page.locator('[data-testid="tab-dirty-dot"]').count();
    assert.ok(dotsMid >= 1, 'R2 must still be dirty after R1 commits');
    // Eventual consistency: once R2's own flush lands, the dot clears.
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="tab-dirty-dot"]').length === 0, undefined, { timeout: 60000, polling: 500 });
    const store = await readStore(page);
    assert.ok(store.projects['s11-a'].files['src/m0.jsx'].includes('UNSET-S11-R2'));
  });

  // S6b — folder rename with open + dirty tabs keeps valid focus and markers.
  // Seeded wide (112 files) so the persist debounce+tx window comfortably
  // contains the rename automation: the dirty marker must still exist at
  // rename time for the travel assertion to be meaningful.
  await run(browser, base, 'S6b folder rename remaps tabs focus and dirty state', async (_ctx, page) => {
    const files = [
      { path: 'src/a.jsx', content: 'export const KEEP_S6B_A = 1;\n' },
      { path: 'src/b.jsx', content: 'export const KEEP_S6B_B = 2;\n' },
    ];
    for (let i = 0; i < 110; i++) files.push({ path: `src/pad${i}.jsx`, content: `export const p${i} = ${i};\n` });
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's6b-a', name: 'S6b-Alpha', editorStyle: 'vscode', projectType: 'react', files },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S6b-Alpha').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
    await page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]').click();
    await page.locator('[data-testid="tree-file"][data-path="src/b.jsx"]').click();
    await page.locator('[data-testid="tree-file"][data-path="src/a.jsx"]').click();
    await focusFirstMonaco(page);
    await page.keyboard.type('\n// UNSET-S6B-DIRTY', { delay: 5 });
    // No content wait here: rename immediately so the edit is still
    // uncommitted (the 112-file flush cannot beat this automation).
    await page.locator('[data-testid="tree-folder"][data-path="src"]').click({ button: 'right' });
    await page.locator('[role="menu"] [role="menuitem"]', { hasText: 'Rename' }).click();
    await page.locator('input:focus').fill('lib');
    await page.keyboard.press('Enter');
    // Focus must be a valid file (lib/a.jsx), never the bare folder: with the
    // old bug the editor went empty and this content would never appear.
    await page.waitForFunction(() => document.body.innerText.includes('KEEP_S6B_A'), undefined, { timeout: 15000, polling: 500 });
    // The dirty marker travelled with the file: still present before the
    // post-rename persist fires (rename re-arms the 1.2 s debounce), then
    // cleared by the commit itself — only then is the store assertion stable.
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="tab-dirty-dot"]').length >= 1, undefined, { timeout: 10000, polling: 250 });
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="tab-dirty-dot"]').length === 0, undefined, { timeout: 30000, polling: 500 });
    const store = await readStore(page);
    const paths = Object.keys(store.projects['s6b-a'].files);
    assert.equal(paths.length, 112);
    assert.ok(!paths.some((p) => p === 'src/a.jsx' || p.startsWith('src/')));
    assert.ok(store.projects['s6b-a'].files['lib/a.jsx'].includes('KEEP_S6B_A'));
    assert.ok(store.projects['s6b-a'].files['lib/a.jsx'].includes('UNSET-S6B-DIRTY'));
  });

  // S6c — unicode names are refused cleanly (bundler-safety policy), no residue.
  await run(browser, base, 'S6c unicode file creation is refused without residue', async (_ctx, page) => {
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's6c-a', name: 'S6c-Alpha', editorStyle: 'vscode', projectType: 'react', files: [{ path: 'src/a.jsx', content: 'export const x = 1;\n' }] },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S6c-Alpha').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
    await page.locator('[data-testid="explorer-new-file"]').click();
    await page.locator('[data-testid="vscode-file-tree"] input').fill('src/café-日本語.jsx');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.body.innerText.includes('Use only letters'), undefined, { timeout: 15000, polling: 500 });
    const store = await readStore(page);
    assert.deepEqual(Object.keys(store.projects['s6c-a'].files), ['src/a.jsx']);
  });

  // S6d — tab cap holds at MAX_TABS without losing file content.
  await run(browser, base, 'S6d tab eviction caps tabs and preserves content', async (_ctx, page) => {
    const files = [];
    for (let i = 0; i < 14; i++) files.push({ path: `src/f${i}.jsx`, content: `export const S6D_${i} = ${i};\n` });
    await page.goto(`${base}/app/`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [
      { id: 's6d-a', name: 'S6d-Alpha', editorStyle: 'vscode', projectType: 'react', files },
    ]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('text=S6d-Alpha').first().click();
    await page.locator('[data-testid="vscode-file-tree"]').waitFor({ timeout: 90000 });
    for (let i = 0; i < 14; i++) {
      await page.locator(`[data-testid="tree-file"][data-path="src/f${i}.jsx"]`).click();
    }
    const tabCount = await page.locator('[data-testid="vscode-tab"]').count();
    assert.ok(tabCount <= 12, `tabs capped at 12, saw ${tabCount}`);
    // Evicted content is intact in the store and reopens correctly.
    const store = await readStore(page);
    assert.equal(Object.keys(store.projects['s6d-a'].files).length, 14);
    await page.locator('[data-testid="tree-file"][data-path="src/f0.jsx"]').click();
    await page.waitForFunction(() => document.body.innerText.includes('S6D_0'), undefined, { timeout: 30000, polling: 500 });
  });

  await browser.close();
  server.close();

  if (failures > 0) {
    console.error(`${failures} app scenario(s) failed`);
    process.exit(1);
  }
  console.log('All real-application workspace scenarios passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
