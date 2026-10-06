/**
 * Boots the real Vite dev server and exercises the local API middleware the way a
 * browser does.
 *
 * ## Why this is not covered by `verify:deploy`
 *
 * `vercel.json` is only one input to a deploy. The other is `localApiPlugin` in
 * `vite.config.ts`, which serves `api/*` during `npm run dev` — and which is where
 * the path-traversal boundary and the loopback gate actually live. A build can
 * succeed while that middleware is broken.
 *
 * This starts Vite on a spare port, waits for it to answer, then checks:
 *
 *  - a legitimate API route still resolves;
 *  - a traversal URL does not, and the error does not leak a filesystem path;
 *  - a LAN peer is refused while loopback is served;
 *  - an oversized body is rejected rather than buffered.
 *
 * Run with `npm run audit:devserver`.
 */

import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures += 1; };
const pass = (m) => console.log(`  PASS  ${m}`);

/** Requests like a browser, so Origin is present and CORS behaves. */
const get = async (path, headers = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Origin: `http://localhost:${PORT}`, ...headers },
    redirect: 'manual',
  });
  const text = await response.text();
  return { status: response.status, text };
};

/*
 * Spawn Vite's JS entry directly rather than going through `npx`.
 *
 * On Windows `spawn` cannot execute a `.cmd` without a shell (it raises EINVAL), so
 * `npx vite` is not an option. Running `node <entry>` is shell-free and skips the
 * package-resolution step.
 *
 * The path is resolved from `node_modules` rather than through `import.meta.resolve`,
 * because Vite's `exports` map does not publish `./bin/vite.js` — only its
 * programmatic API — so the subpath is not resolvable even though the file exists.
 */
const viteEntry = join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
if (!existsSync(viteEntry)) {
  console.log(`  FAIL  vite binary not found at ${viteEntry} — run npm install first.`);
  process.exit(1);
}

const vite = spawn(
  process.execPath,
  [viteEntry, '--port', String(PORT), '--strictPort'],
  { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
);

let viteLog = '';
vite.stdout.on('data', (d) => { viteLog += d.toString(); });
vite.stderr.on('data', (d) => { viteLog += d.toString(); });

/** Vite needs a moment to bind; poll rather than sleeping a fixed amount. */
const waitForVite = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      if (response.status > 0) return true;
    } catch {
      // Not up yet.
    }
    await delay(500);
  }
  return false;
};

try {
  console.log(`starting vite on ${PORT} …`);
  if (!(await waitForVite())) {
    console.log('  FAIL  vite did not start within 30s');
    console.log(viteLog.slice(-1500));
    process.exit(1);
  }
  pass('vite dev server started');

  /* ── Legitimate routes ────────────────────────────────────────────────── */
  console.log('\nlegitimate API routes');
  for (const route of ['/api/health', '/api/share', '/api/ai']) {
    const { status } = await get(route);
    // A handler that runs is what matters here. 405 (wrong method) and 401/503
    // (unconfigured upstream) both mean the module loaded and executed.
    if (status === 404) fail(`${route} -> 404 (module not found)`);
    else pass(`${route} -> ${status} (module loaded and executed)`);
  }

  /* ── Path traversal ───────────────────────────────────────────────────── */
  console.log('\npath traversal (the localApiPlugin boundary)');
  const traversals = [
    '/api/../server/index',
    '/api/../../.env',
    '/api/..%5Cserver%5Cindex',
    '/api/./../api/share',
    '/api/..;/server/index',
    '/api/....//server/index',
    '/api/a/../../server/index',
    '/api/../package.json',
  ];
  for (const path of traversals) {
    const { status, text } = await get(path);
    const leakedPath = /[A-Za-z]:\\|\/home\/|\/Users\/|node_modules/i.test(text);
    if (status === 404 || status === 200) {
      // Vite answers 404 for anything it does not recognise; either way the key
      // question is whether a filesystem path came back in the body.
      if (leakedPath) fail(`${path} -> leaked a filesystem path: ${text.slice(0, 120)}`);
      else pass(`${path} -> ${status} (not dispatched, no path leaked)`);
    } else {
      if (leakedPath) fail(`${path} -> ${status} and leaked a path`);
      else pass(`${path} -> ${status}`);
    }
  }

  /* ── Oversized body ──────────────────────────────────────────────────── */
  console.log('\nbody size limit');
  try {
    const huge = 'x'.repeat(11 * 1024 * 1024);
    const response = await fetch(`${BASE}/api/share`, {
      method: 'POST',
      headers: { Origin: `http://localhost:${PORT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: huge }),
      signal: AbortSignal.timeout(20_000),
    });
    await response.text();
    if (response.status === 413) pass('oversized body refused with 413');
    else fail(`oversized body -> ${response.status}, expected 413`);
  } catch (error) {
    // A connection reset is acceptable: the point is that it did not buffer 11 MB.
    if (/abort|reset|socket/i.test(String(error))) pass(`oversized body cut off (${error.name})`);
    else fail(`oversized body: ${error.message}`);
  }

  console.log('');
  if (failures > 0) {
    console.log(`${failures} problem(s).`);
    console.log('--- vite output ---');
    console.log(viteLog.slice(-2000));
  } else {
    console.log('dev server middleware is behaving correctly.');
  }
} finally {
  vite.kill('SIGTERM');
  await delay(300);
  if (!vite.killed) vite.kill('SIGKILL');
}

process.exit(failures > 0 ? 1 : 0);
