/**
 * GB Coder — Phase 2.1B real-browser IndexedDB integration tests (W05–W07).
 *
 * The node harness (audit-harness.mjs) proves service logic against a fake
 * IndexedDB; it cannot prove real transaction commit/abort behavior. This
 * suite bundles the REAL services with esbuild, serves them over localhost,
 * and executes assertions inside Chromium against REAL IndexedDB +
 * localStorage in a disposable browser profile with synthetic projects only.
 *
 * Covers:
 * - B-W05: delete clears gb-coder-active-project-id only on committed delete.
 * - B-W06: metadata patch allowlist + fileCount integrity in real IDB.
 * - B-W07: duplicate/delete races both orders + 112-file SHA-256 integrity.
 *
 * NOT covered here (classified NOT_RUN in the implementation report):
 * mid-transaction abort injection (no deterministic browser API to abort a
 * commit from outside; the null-settle path is covered by G05/W05b with the
 * unavailable-IDB fault). Real abort semantics belong to the IDB engine.
 *
 * Run with: npm run audit:e2e:workspace-reliability
 */

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'gb-ws-e2e-'));

await build({
  stdin: {
    contents: `
      export * from './src/services/projects/projectDatabase.ts';
      export * from './src/services/vscodeWorkspaceStore.ts';
      export * from './src/services/snapshotService.ts';
      export * from './src/types/files.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  outfile: path.join(outdir, 'ws-bundle.mjs'),
  logLevel: 'error',
});

const server = http.createServer((req, res) => {
  if (req.url === '/ws-bundle.mjs') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.writeHead(200);
    res.end(fs.readFileSync(path.join(outdir, 'ws-bundle.mjs')));
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.writeHead(200);
  res.end('<!doctype html><html><body>gb-ws-e2e</body></html>');
});

await new Promise((resolve) => server.listen(0, resolve));
const BASE = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ headless: true });
let failures = 0;

async function scenario(name, fn) {
  const context = await browser.newContext(); // disposable profile per scenario
  const page = await context.newPage();
  await page.goto(BASE);
  try {
    await page.evaluate(async (base) => {
      await import(`${base}/ws-bundle.mjs`);
    }, BASE);
    await fn(page);
    console.log(`ok - ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL - ${name}: ${err.message}`);
  } finally {
    await context.close();
  }
}

const sha256hex = async (page, text) =>
  page.evaluate(async (t) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }, text);

// B-W05: pointer cleared only after a committed delete of the pointed project.
await scenario('B-W05 delete clears active pointer in real IndexedDB', async (page) => {
  const result = await page.evaluate(async (base) => {
    const s = await import(`${base}/ws-bundle.mjs`);
    const a = await s.createProject({
      name: 'keep', projectType: 'plain', editorStyle: 'plain',
      files: [{ path: 'index.html', content: 'A' }],
    });
    const b = await s.createProject({
      name: 'drop', projectType: 'plain', editorStyle: 'plain',
      files: [{ path: 'index.html', content: 'B' }],
    });
    s.writeActiveProjectId(b.id);
    await s.deleteProject(b.id);
    const afterDeletePointer = s.readActiveProjectId();
    const gone = await s.getProject(b.id);
    const goneFiles = await s.readProjectFiles(b.id);
    // Inactive delete preserves the pointer.
    s.writeActiveProjectId(a.id);
    const c = await s.createProject({
      name: 'temp', projectType: 'plain', editorStyle: 'plain',
      files: [{ path: 'index.html', content: 'C' }],
    });
    await s.deleteProject(c.id);
    const preserved = s.readActiveProjectId();
    return {
      afterDeletePointer, gone: !!gone, goneFiles: goneFiles.length,
      preserved, expected: a.id,
    };
  }, BASE);
  assert.equal(result.afterDeletePointer, null);
  assert.equal(result.gone, false);
  assert.equal(result.goneFiles, 0);
  assert.equal(result.preserved, result.expected);
});

// B-W06: allowlist + fileCount integrity in real IndexedDB.
await scenario('B-W06 metadata allowlist holds in real IndexedDB', async (page) => {
  const result = await page.evaluate(async (base) => {
    const s = await import(`${base}/ws-bundle.mjs`);
    const p = await s.createProject({
      name: 'm', projectType: 'react', editorStyle: 'plain',
      files: [{ path: 'src/a.jsx', content: 'aaa' }],
    });
    const before = await s.getProject(p.id);
    const patched = await s.updateProject(p.id, { fileCount: 9999, name: 'm2', editorStyle: 'vscode' });
    const files = await s.readProjectFiles(p.id);
    return {
      fileCountBefore: before.fileCount,
      fileCountAfter: patched.fileCount,
      idSame: patched.id === p.id,
      name: patched.name,
      style: patched.editorStyle,
      storeCount: files.length,
    };
  }, BASE);
  assert.equal(result.fileCountAfter, result.fileCountBefore);
  assert.equal(result.idSame, true);
  assert.equal(result.name, 'm2');
  assert.equal(result.style, 'vscode');
  assert.equal(result.fileCountAfter, result.storeCount);
});

// B-W07: duplicate/delete races, both orders, in real IndexedDB.
await scenario('B-W07 duplicate/delete races stay consistent in real IndexedDB', async (page) => {
  const result = await page.evaluate(async (base) => {
    const s = await import(`${base}/ws-bundle.mjs`);
    const mk = (n) => s.createProject({
      name: n, projectType: 'react', editorStyle: 'vscode',
      files: [
        { path: 'src/a.jsx', content: 'aaa' },
        { path: 'src/b.jsx', content: 'bbb' },
      ],
    });
    // Order 1: duplicate first — complete copy survives, original gone.
    const p1 = await mk('race1');
    const [copy1] = await Promise.all([s.duplicateProject(p1.id), s.deleteProject(p1.id)]);
    const copy1Files = copy1 ? await s.readProjectFiles(copy1.id) : null;
    // Order 2: delete first — no copy at all.
    const p2 = await mk('race2');
    const [delDone, copy2] = await Promise.all([s.deleteProject(p2.id), s.duplicateProject(p2.id)]);
    // Ghost duplicate creates nothing.
    const ghost = await s.duplicateProject('no-such-id');
    const remaining = await s.listProjects();
    return {
      copy1Paths: copy1Files ? copy1Files.map((f) => [f.path, f.content]).sort() : null,
      copy1Style: copy1 ? copy1.editorStyle : null,
      copy2,
      ghost,
      remainingNames: remaining.map((r) => r.name).sort(),
    };
  }, BASE);
  assert.deepEqual(result.copy1Paths, [['src/a.jsx', 'aaa'], ['src/b.jsx', 'bbb']]);
  assert.equal(result.copy1Style, 'vscode');
  assert.equal(result.copy2, null);
  assert.equal(result.ghost, null);
  assert.ok(!result.remainingNames.includes('race2'));
});

// B-W07d: 112-file duplicate is byte-identical (hashes compared in Node).
await scenario('B-W07d 112-file duplicate integrity in real IndexedDB', async (page) => {
  const files = [];
  for (let i = 0; i < 112; i++) {
    const dir = `src/mod${Math.floor(i / 16)}`;
    const name = i % 17 === 0 ? `ünìcode-${i}.jsx` : `file${i}.jsx`;
    files.push({ path: `${dir}/${name}`, content: `// file ${i}\nexport const v${i} = ${i};\n` });
  }
  const expected = {};
  for (const f of files) expected[f.path] = await sha256hex(page, f.content);
  const result = await page.evaluate(async ({ base, seedFiles }) => {
    const s = await import(`${base}/ws-bundle.mjs`);
    const p = await s.createProject({
      name: 'big112', projectType: 'react', editorStyle: 'vscode', files: seedFiles,
    });
    const copy = await s.duplicateProject(p.id);
    const back = copy ? await s.readProjectFiles(copy.id) : [];
    return { fileCount: copy ? copy.fileCount : -1, files: back.map((f) => [f.path, f.content]) };
  }, { base: BASE, seedFiles: files });
  assert.equal(result.fileCount, 112);
  assert.equal(result.files.length, 112);
  for (const [p, c] of result.files) {
    assert.equal(await sha256hex(page, c), expected[p], `drift in ${p}`);
  }
});

await browser.close();
server.close();
fs.rmSync(outdir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`${failures} browser scenario(s) failed`);
  process.exit(1);
}
console.log('All real-browser workspace scenarios passed');
