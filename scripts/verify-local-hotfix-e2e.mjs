import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = 'http://localhost:4178';

async function seedProjects(page, list) {
  return page.evaluate((specs) => {
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
      for (const s of specs) {
        tx.objectStore('projects').put({
          id: s.id, name: s.name, createdAt: now - 60000, lastOpenedAt: now,
          editorStyle: s.editorStyle, projectType: s.projectType, entry: s.entry,
          fileCount: s.files.length,
        });
        for (const f of s.files) {
          tx.objectStore('projectFiles').put({ projectId: s.id, path: f.path, content: f.content });
        }
      }
      return new Promise((res) => { tx.oncomplete = res; });
    });
  }, list);
}

async function readStore(page) {
  return page.evaluate(() =>
    new Promise((resolve, reject) => {
      const out = { pointer: window.localStorage.getItem('gb-coder-active-project-id'), projects: {} };
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

async function run() {
  console.log('--- Phase 2.1E: End-to-End Local WebContainer Automation Verification ---');
  console.log(`Connecting to local preview server at ${BASE}...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[WebContainer]') || text.includes('VITE') || text.includes('Server ready')) {
      console.log(`[BROWSER_CONSOLE] ${text}`);
    }
  });

  // Step 1: Preflight check on /app/
  await page.goto(`${BASE}/app/`, { waitUntil: 'domcontentloaded' });
  const coi = await page.evaluate(() => ({
    coi: window.crossOriginIsolated,
    sab: typeof SharedArrayBuffer !== 'undefined',
  }));
  console.log(`Security Isolation: crossOriginIsolated=${coi.coi}, SharedArrayBuffer=${coi.sab}`);
  assert.ok(coi.coi, 'crossOriginIsolated must be true');
  assert.ok(coi.sab, 'SharedArrayBuffer must be available');

  // Step 2: Seed synthetic npm project
  const pkg = {
    name: 'lp-wc',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
    devDependencies: { vite: '^5.4.11', '@vitejs/plugin-react': '^4.3.2' },
  };

  await seedProjects(page, [
    {
      id: 'lp-w',
      name: 'LP-Wc',
      editorStyle: 'vscode',
      projectType: 'react',
      files: [
        { path: 'package.json', content: JSON.stringify(pkg, null, 2) },
        { path: 'vite.config.js', content: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n" },
        { path: 'index.html', content: '<!doctype html>\n<html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n' },
        { path: 'src/main.jsx', content: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\n\ncreateRoot(document.getElementById('root')).render(<h1>LP-WC-RENDER-v1</h1>);\n" },
      ],
    },
  ]);
  console.log('Seeded project LP-Wc into IndexedDB.');

  // Step 3: Reload and open project
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('text=LP-Wc').first().click();
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 60000 });
  console.log('VSCode mode mounted successfully.');

  // Step 4: Verify automatic shell readiness & npm install
  console.log('Waiting for npm install output in terminal (strictly automated, zero user typing)...');
  const startTime = Date.now();
  await page.waitForFunction(
    () => /added \d+ packages|up to date|already up to date|audit complete|found \d+ vulnerabilities/i.test(document.querySelector('.xterm-rows')?.innerText || ''),
    undefined,
    { timeout: 300000, polling: 1000 },
  );
  const installDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ npm install executed and finished in ${installDuration}s!`);

  // Step 5: Verify automatic dev server startup
  console.log('Waiting for Vite dev server readiness in terminal...');
  await page.waitForFunction(
    () => /ready in \d+\s?ms/i.test(document.querySelector('.xterm-rows')?.innerText || ''),
    undefined,
    { timeout: 180000, polling: 1000 },
  );
  console.log('✅ Dev server ready output observed!');

  // Step 6: Verify preview iframe renders v1 content
  console.log('Checking preview iframe URL...');
  let previewUrl = '';
  const deadline = Date.now() + 60000;
  while (!previewUrl && Date.now() < deadline) {
    previewUrl = await page.evaluate(() => document.querySelector('iframe[src^="http"]')?.getAttribute('src') || '');
    if (!previewUrl) await page.waitForTimeout(1000);
  }
  assert.ok(previewUrl, 'Preview iframe with http URL must be rendered');
  console.log(`Preview iframe URL: ${previewUrl}`);

  // Verify preview iframe in Playwright
  console.log('Waiting for preview iframe to load...');
  const frameLocator = page.frameLocator('iframe[src*="webcontainer-api.io"], iframe[src*="5173"]');
  const h1 = frameLocator.locator('h1');
  await h1.waitFor({ timeout: 60000 });
  const h1Text = await h1.innerText();
  console.log(`Rendered heading in preview iframe: "${h1Text}"`);
  assert.ok(h1Text.includes('LP-WC-RENDER-v1'), 'Dev server must render LP-WC-RENDER-v1');
  console.log('✅ Live preview iframe successfully rendered LP-WC-RENDER-v1!');

  // Step 7: Monaco source edit & preview update
  console.log('Editing src/main.jsx in Monaco editor...');
  await page.locator('[data-testid="tree-file"][data-path="src/main.jsx"]').click();
  await page.locator('.monaco-editor').first().waitFor({ timeout: 15000 });
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type("import React from 'react';\nimport { createRoot } from 'react-dom/client';\n\ncreateRoot(document.getElementById('root')).render(<h1>LP-WC-RENDER-v2</h1>);\n", { delay: 5 });

  console.log('Waiting for dev server to serve updated LP-WC-RENDER-v2 in preview iframe...');
  await frameLocator.locator('text=LP-WC-RENDER-v2').waitFor({ timeout: 60000 });
  const updatedH1 = await h1.innerText();
  console.log(`Updated heading in preview iframe: "${updatedH1}"`);
  assert.ok(updatedH1.includes('LP-WC-RENDER-v2'), 'Preview must update with LP-WC-RENDER-v2');
  console.log('✅ Live preview served updated content LP-WC-RENDER-v2!');

  // Step 8: Verify persistence in IndexedDB
  await page.waitForTimeout(2000);
  const store = await readStore(page);
  assert.ok(store.projects['lp-w'].files['src/main.jsx'].includes('LP-WC-RENDER-v2'), 'IndexedDB must persist v2 edit');
  console.log('✅ IndexedDB persisted LP-WC-RENDER-v2 successfully!');

  // Print final terminal snapshot
  const termSnapshot = await page.evaluate(() => (document.querySelector('.xterm-rows')?.innerText || '').slice(-600));
  console.log('--- Terminal Tail Snapshot ---');
  console.log(termSnapshot.trim());
  console.log('------------------------------');

  await browser.close();
  console.log('\n🎉 ALL PHASE 2.1E END-TO-END VALIDATION CHECKS PASSED PERFECTLY!');
}

run().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
