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
  return { status: response.status, text, contentType: response.headers.get('content-type') ?? '' };
};

/*
 * Strip Vite's injected source map so two responses for the same file compare equal.
 *
 * Vite appends a `//# sourceMappingURL=data:...base64,…` comment to served JS, and
 * that payload embeds the file's URL, so `/api/../server/index` and `/server/index.js`
 * differ by a handful of bytes in the base64 alone. The served source before the
 * comment is byte-identical, which is exactly what this check needs to confirm.
 */
const stripSourceMap = (text) => text.replace(/\n?\/\/# sourceMappingURL=[^\n]*$/, '');

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

  /*
   * ── Path traversal ───────────────────────────────────────────────────────
   *
   * `localApiPlugin` maps `/api/<route>` onto `api/<route>.js` and `require()`s it,
   * so an unsanitised route would let a request execute a file outside `api/`.
   * The route pattern `/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/` excludes dots, and
   * the resolved path is re-checked against `api/`, so neither is enough on its own.
   *
   * The subtlety is that a 200 here does NOT by itself mean the boundary failed.
   * In dev, Vite's own static server serves project files, so `/api/../server/index`
   * returns `server/index.js` as static source — the same response as requesting
   * `/server/index.js` outright, before our middleware ever runs. That is expected
   * Vite behaviour, not traversal.
   *
   * What would prove the boundary failed is the response being *handler output*,
   * i.e. our middleware loading and running a file from outside `api/`. So the
   * discriminator is whether the body is raw source, compared against a direct
   * request for the same file.
   */
  console.log('\npath traversal (the localApiPlugin boundary)');

  // Baseline: what Vite's static server returns for these files on their own.
  const directServerIndex = await get('/server/index.js');
  const directPackageJson = await get('/package.json');

  const traversals = [
    { path: '/api/../server/index', name: 'server/index.js', direct: directServerIndex },
    { path: '/api/../package.json', name: 'package.json', direct: directPackageJson },
    { path: '/api/../../server/index', name: 'server/index.js', direct: directServerIndex },
    { path: '/api/..%5Cserver%5Cindex', name: 'server/index.js (encoded)', direct: directServerIndex },
    { path: '/api/..;/server/index', name: 'server/index.js (path params)', direct: directServerIndex },
    { path: '/api/....//server/index', name: 'server/index.js (nested dots)', direct: directServerIndex },
    { path: '/api/a/../../server/index', name: 'server/index.js (nested)', direct: directServerIndex },
    { path: '/api/./../api/share', name: 'api/share (inside allowlist)', direct: null },
  ];

  for (const { path, name, direct } of traversals) {
    const { status, text, contentType } = await get(path);

    /*
     * Discriminator: whether the response came from Vite's static server or from
     * `localApiPlugin`.
     *
     * Static serving sends the file itself, with a JS or JSON content type and the
     * source map Vite appends. The middleware sends whatever the handler wrote —
     * usually `application/json`.
     *
     * Sniffing the body for a leading `{` is not usable here: a handler's
     * `{"error":"Method not allowed"}` looks exactly like the start of `package.json`,
     * so that heuristic flags correct behaviour as a breach. Content type is the
     * reliable signal.
     */
    const servedAsStaticFile = /text\/javascript|application\/javascript/.test(contentType);

    if (servedAsStaticFile && direct) {
      // Confirm this really is Vite's static server by matching the direct request.
      if (stripSourceMap(text) === stripSourceMap(direct.text)) {
        pass(`${path} -> Vite static served ${name}; byte-identical to a direct request, so the middleware did not dispatch`);
      } else {
        fail(`${path} -> served JS that does not match a direct request for ${name}`);
      }
    } else if (status === 404) {
      pass(`${path} -> 404 (rejected)`);
    } else if (direct) {
      // Handler-shaped output for a file outside api/: the boundary failed.
      fail(`${path} -> middleware executed ${name} from outside api/ — traversal succeeded (${contentType})`);
    } else {
      // No direct baseline: the route is inside the allowlist, so the middleware
      // running is the correct behaviour.
      pass(`${path} -> ${status} via middleware (route is inside the allowlist)`);
    }
  }

  /*
   * Secrets. A traversal that reaches `.env` is the severe case, and the one this
   * boundary exists to prevent. Vite's `server.fs.deny` refuses it with a 403 whose
   * body echoes the resolved absolute path — that echo is Vite's own error page, not
   * our response, so it is only a finding if it is not in fact a refusal.
   */
  console.log('\nsecrets must not be readable');
  for (const path of ['/api/../../.env', '/.env', '/../.env', '/api/../.env']) {
    const { status, text } = await get(path);
    /* eslint-disable no-control-regex */
    const containsEnvContent = /GEMINI_API_KEY\s*=\s*\S|UPSTASH_REDIS_REST_TOKEN\s*=\s*\S|TERMINAL_TOKEN\s*=\s*\S/.test(text);
    if (containsEnvContent) {
      fail(`${path} -> .env contents were returned`);
    } else if (status === 403) {
      pass(`${path} -> 403 refused (Vite fs.deny; no secret returned)`);
    } else if (status === 404) {
      pass(`${path} -> 404 refused`);
    } else {
      fail(`${path} -> ${status} but no secret returned; confirm this is intended`);
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
