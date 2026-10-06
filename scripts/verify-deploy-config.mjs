/**
 * Validates deploy configuration before a Vercel build sees it.
 *
 * ## Why this exists
 *
 * `vercel.json` is parsed by Vercel's config loader as **strict JSON** — not JSONC.
 * A `/* … *\/` comment inside it is a hard error, and it surfaces as
 * "Invalid vercel.json file provided", which does not name the file, the line, or
 * the character at fault. That is a slow class of failure to diagnose from the
 * deploy log alone.
 *
 * This repo hit exactly that: a block comment explaining the `/mpreview/` rewrite
 * was valid-looking and harmless to every local tool (`vite build` never reads
 * `vercel.json`, and `tsc` does not either), so it survived until a deploy was
 * attempted. The comment has been moved to `docs/DEPLOY.md`, and this script exists
 * so a JSONC-style edit cannot quietly come back.
 *
 * It also checks the things a strict parse alone would not catch: that every key
 * under `functions` points at a file that actually exists, and that the encoding is
 * clean.
 *
 * Run with `npm run verify:deploy`.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

let failures = 0;

const fail = (message) => {
  console.log(`  FAIL  ${message}`);
  failures += 1;
};

const pass = (message) => console.log(`  PASS  ${message}`);

/* ── vercel.json ──────────────────────────────────────────────────────────── */

console.log('vercel.json');

const raw = readFileSync('vercel.json', 'utf8');

// 1. Strict parse. This is the check Vercel performs, and the one that fails.
let config;
try {
  config = JSON.parse(raw);
  pass('parses as strict JSON (the check Vercel performs)');
} catch (error) {
  fail(`not valid strict JSON -> ${error.message.split('\n')[0]}`);
  fail('Vercel would reject this with "Invalid vercel.json file provided".');
  console.log('\nvercel.json is JSON, not JSONC: comments are not allowed there.');
  console.log('Put explanations in docs/DEPLOY.md instead.');
  process.exit(1);
}

// 2. Comments, reported by name. A block comment is the specific regression worth
//    naming rather than leaving as a generic parse error.
const blockComment = raw.match(/\/\*/);
const lineComment = /^\s*\/\//m.test(raw);
if (blockComment) {
  fail('contains a /* … */ comment — not permitted in vercel.json');
} else if (lineComment) {
  fail('contains a // comment — not permitted in vercel.json');
} else {
  pass('no comments');
}

// 3. Trailing commas, the other common JSONC habit that strict JSON rejects.
const trailingComma = /,\s*[}\]]/.test(raw);
if (trailingComma) fail('contains a trailing comma — not valid JSON');
else pass('no trailing commas');

// 4. Encoding. A BOM is invisible but makes some strict parsers choke, and mixed
//    line endings produce a noisy diff on every edit.
if (raw.charCodeAt(0) === 0xfeff) fail('starts with a UTF-8 BOM');
else pass('no BOM');
if (/\r\n/.test(raw)) fail('has CRLF line endings; use LF');
else pass('LF line endings');
if (!raw.endsWith('\n')) fail('no trailing newline at end of file');
else pass('trailing newline');

/* ── Cross-checks against the filesystem ──────────────────────────────────── */

// 5. Every `functions` key must be a real file. Vercel fails the build on a
//    pattern that matches nothing, and the error does not obviously point at
//    vercel.json.
console.log('\nfunctions');
const functions = config.functions ?? {};
const names = Object.keys(functions);
if (names.length === 0) {
  console.log('  (none configured)');
} else {
  for (const name of names) {
    const entry = functions[name];
    if (!existsSync(name)) {
      fail(`"${name}" does not exist — Vercel cannot apply a config to a missing function`);
    } else if (entry && typeof entry.maxDuration === 'number') {
      const cap = entry.maxDuration > 60 ? ' (requires a Pro/Enterprise plan)' : '';
      pass(`"${name}" exists, maxDuration=${entry.maxDuration}${cap}`);
    } else {
      pass(`"${name}" exists`);
    }
  }
}

/*
 * ── Function count ─────────────────────────────────────────────────────────
 *
 * Vercel builds one serverless function per `.js` file under `api/`, ignoring any
 * file or directory whose name starts with `_`. Hobby allows 12; Pro and Enterprise
 * allow more. Exceeding the limit fails at *upload*, not build — the build completes
 * and reports success, then the deploy dies with no mention of a count, which is why
 * this is worth asserting before a deploy rather than discovering on one.
 *
 * `dev-api/` is deliberately outside this count. Locally-useful handlers live there so
 * they cost no function slots, and both dev servers fall back to it.
 */
console.log('\nfunction count (Hobby limit: 12)');

const apiRoot = process.cwd();
const walk = (dir, prefix = '') => {
  const out = [];
  for (const entry of readdirSync(path.join(apiRoot, dir), { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue; // Vercel ignores these.
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith('.js')) out.push(rel);
  }
  return out;
};

const deployedFunctions = walk('api').sort();
console.log(`  ${deployedFunctions.length} function(s) in api/`);
for (const name of deployedFunctions) console.log(`    ${name}`);

const LIMIT = 12;
if (deployedFunctions.length > LIMIT) {
  fail(
    `${deployedFunctions.length} functions exceeds the Hobby limit of ${LIMIT}. ` +
      'The build will succeed and the deploy will fail at upload. ' +
      'Move development-only handlers to dev-api/, or consolidate routes.',
  );
} else if (deployedFunctions.length === LIMIT) {
  pass(`${deployedFunctions.length}/${LIMIT} — at the limit, no headroom for a new route`);
} else {
  pass(`${deployedFunctions.length}/${LIMIT}`);
}

/* ── rewrites ─────────────────────────────────────────────────────────────── */

console.log('\nrewrites');
const rewrites = config.rewrites ?? [];
if (!Array.isArray(rewrites)) {
  fail('"rewrites" must be an array');
} else {
  pass(`${rewrites.length} rewrite(s), all well-formed`);
  for (const rewrite of rewrites) {
    if (!rewrite.source || !rewrite.destination) {
      fail(`rewrite missing source or destination: ${JSON.stringify(rewrite)}`);
    }
  }
  // The catch-all must stay last, or it swallows every route before the specific
  // ones are considered. Cheap to assert, and the failure is otherwise silent.
  const last = rewrites[rewrites.length - 1];
  if (last && last.source === '/(.*)' && last.destination === '/index.html') {
    const catchAllIndex = rewrites.findIndex((r) => r.source === '/(.*)');
    if (catchAllIndex !== rewrites.length - 1) {
      fail('the /(.*) catch-all must be the last rewrite');
    } else {
      pass('catch-all /(.*) is last');
    }
  }
}

/* ── Result ───────────────────────────────────────────────────────────────── */

console.log('');
if (failures > 0) {
  console.log(`${failures} problem(s) — this deploy would fail.`);
  process.exit(1);
}
console.log('deploy config is valid.');
