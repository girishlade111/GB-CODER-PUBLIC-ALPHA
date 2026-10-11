/**
 * Regression tests for the WebContainer production availability fix.
 *
 * ## What this covers (and what it honestly cannot)
 *
 * Runnable here in plain Node, using the real bundled modules via
 * `audit-harness.mjs` (same idiom as `audit-run-tests.mjs` — no Jest, no
 * Vitest, no Playwright, no new dependency):
 *
 * - `vercel.json` carries COOP `same-origin` + COEP `require-corp` and the
 *   pattern covers the `/ide` document route, while the pre-existing
 *   functions/rewrites configuration is preserved.
 * - `getWebContainerUnavailableReason()` / `describe…()` return the specific
 *   reason for each failure mode (the logic behind the disabled-but-visible
 *   WebContainer pill).
 * - The real `webcontainerService` mirrors `window.crossOriginIsolated`,
 *   refuses `boot()` before ever reaching the SDK when unsupported, and stays
 *   usable after that refusal.
 * - The local simulated shell answers commands with isolation disabled, i.e.
 *   Normal Mode / Local fallback never depends on the WebContainer runtime.
 * - `filesToFileSystemTree()` synthesises the `package.json` + `.npmrc` that
 *   `npm install` / `npm run dev` require once the runtime boots.
 *
 * Deliberately NOT asserted here (they need a real browser + the StackBlitz
 * runtime, and faking them with mocks would prove nothing):
 *
 * - React rendering of the pill (visible when supported / disabled with a
 *   reason when not), mode switching, xterm mounting.
 * - An actual `WebContainer.boot()`, `npm install`, `npm run dev`,
 *   `server-ready` → preview-URL flow, and duplicate-boot prevention.
 * - Live served response headers (use
 *   `node scripts/verify-deploy-config.mjs --live-url=https://<host>/ide`).
 *
 * Run with `npm run audit:webcontainer`.
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  filesToFileSystemTree,
  getWebContainerUnavailableReason,
  describeWebContainerUnavailableReason,
  runLocalCommand,
} = services;

after(() => cleanup());

/* ── vercel.json isolation headers (prompt TEST 10 + TEST 11) ──────────── */

describe('vercel.json isolation headers', () => {
  const raw = readFileSync('vercel.json', 'utf8');
  const config = JSON.parse(raw);

  test('parses as strict JSON', () => {
    assert.ok(config && typeof config === 'object');
  });

  test('a headers rule sets COOP: same-origin', () => {
    const rules = config.headers ?? [];
    assert.ok(
      rules.some((r) =>
        (r.headers ?? []).some(
          (h) => h.key === 'Cross-Origin-Opener-Policy' && h.value === 'same-origin',
        ),
      ),
      'no rule sets Cross-Origin-Opener-Policy: same-origin',
    );
  });

  test('a headers rule sets COEP: require-corp', () => {
    const rules = config.headers ?? [];
    assert.ok(
      rules.some((r) =>
        (r.headers ?? []).some(
          (h) => h.key === 'Cross-Origin-Embedder-Policy' && h.value === 'require-corp',
        ),
      ),
      'no rule sets Cross-Origin-Embedder-Policy: require-corp',
    );
  });

  test('a qualifying rule covers the Advanced IDE document route (/ide)', () => {
    const sourceMatches = (source, path) => {
      const pattern = `^${source.replace(/:[A-Za-z0-9_]+[?*]?/g, '[^/]+?')}$`;
      return new RegExp(pattern).test(path);
    };
    const qualifying = (config.headers ?? []).filter(
      (r) =>
        (r.headers ?? []).some(
          (h) => h.key === 'Cross-Origin-Opener-Policy' && h.value === 'same-origin',
        ) &&
        (r.headers ?? []).some(
          (h) => h.key === 'Cross-Origin-Embedder-Policy' && h.value === 'require-corp',
        ),
    );
    assert.ok(
      qualifying.some((r) => sourceMatches(r.source, '/ide') || sourceMatches(r.source, '/')),
      'no qualifying headers rule covers /ide',
    );
  });

  test('pre-existing deployment configuration is preserved', () => {
    assert.equal(config.framework, 'vite');
    assert.equal(config.buildCommand, 'npm run build');
    assert.equal(config.outputDirectory, 'dist');
    assert.ok(config.functions?.['api/ai.js'], 'api/ai.js function entry missing');
    assert.ok(Array.isArray(config.rewrites) && config.rewrites.length > 0);
    const last = config.rewrites[config.rewrites.length - 1];
    assert.equal(last.source, '/(.*)');
    assert.equal(last.destination, '/index.html');
  });
});

/* ── unavailability reasoning (prompt TEST 2 + TEST 4) ─────────────────── */

describe('webcontainer unavailability reasoning', () => {
  const base = {
    crossOriginIsolated: true,
    isSecureContext: true,
    sharedArrayBufferAvailable: true,
    status: 'idle',
  };

  test('available environment yields no reason', () => {
    assert.equal(getWebContainerUnavailableReason(base), null);
  });

  test('missing isolation yields the production failure reason', () => {
    const reason = getWebContainerUnavailableReason({ ...base, crossOriginIsolated: false });
    assert.equal(reason, 'cross-origin-isolation-missing');
    const message = describeWebContainerUnavailableReason(reason);
    assert.match(message, /cross-origin isolation/);
  });

  test('insecure context is reported distinctly from missing headers', () => {
    const reason = getWebContainerUnavailableReason({
      ...base,
      isSecureContext: false,
      crossOriginIsolated: false,
    });
    assert.equal(reason, 'insecure-context');
    assert.match(describeWebContainerUnavailableReason(reason), /HTTPS|secure context/);
  });

  test('missing SharedArrayBuffer is reported as an unsupported browser', () => {
    const reason = getWebContainerUnavailableReason({
      ...base,
      sharedArrayBufferAvailable: false,
    });
    assert.equal(reason, 'unsupported-browser');
  });

  test('a failed boot is reported as initialization failure, not a header problem', () => {
    const reason = getWebContainerUnavailableReason({ ...base, status: 'error' });
    assert.equal(reason, 'initialization-failed');
    assert.match(describeWebContainerUnavailableReason(reason), /failed to initialize/);
  });

  test('every reason has a concise, non-empty, secret-free message', () => {
    const reasons = [
      'cross-origin-isolation-missing',
      'insecure-context',
      'unsupported-browser',
      'initialization-failed',
      'unknown',
    ];
    for (const reason of reasons) {
      const message = describeWebContainerUnavailableReason(reason);
      assert.ok(message.length > 0 && message.length < 200, `bad message for ${reason}`);
      assert.match(message, /^WebContainer /);
    }
  });
});

/* ── service guard behaviour (prompt TEST 5 + TEST 6 + TEST 7) ─────────── */

describe('webcontainerService support guard', () => {
  const win = globalThis.window;
  const restore = () => {
    delete win.crossOriginIsolated;
  };
  restore();

  test('isSupported() mirrors window.crossOriginIsolated', () => {
    win.crossOriginIsolated = false;
    assert.equal(webcontainerService.isSupported(), false);
    win.crossOriginIsolated = true;
    assert.equal(webcontainerService.isSupported(), true);
    restore();
    assert.equal(webcontainerService.isSupported(), false);
  });

  test('boot() is refused before the SDK when unsupported', async () => {
    restore();
    await assert.rejects(
      () => webcontainerService.boot(),
      /Cross-Origin Isolation is not active/,
    );
    const state = webcontainerService.getState();
    assert.equal(state.status, 'unsupported');
    assert.equal(state.isSupported, false);
    assert.match(state.error ?? '', /COOP\/COEP/);
  });

  test('concurrent boots while unsupported all hit the guard identically', async () => {
    restore();
    const results = await Promise.allSettled([
      webcontainerService.boot(),
      webcontainerService.boot(),
    ]);
    for (const r of results) {
      assert.equal(r.status, 'rejected');
      assert.match(String(r.reason?.message ?? r.reason), /Cross-Origin Isolation is not active/);
    }
  });

  test('a refused boot does not wedge the service', async () => {
    restore();
    await assert.rejects(() => webcontainerService.boot());
    // The service must stay observable and answer support queries afterwards.
    assert.equal(webcontainerService.isSupported(), false);
    assert.ok(webcontainerService.getState());
    const unsub = webcontainerService.subscribe(() => {});
    assert.equal(typeof unsub, 'function');
    unsub();
  });
});

/* ── local fallback independence (prompt TEST 3 + TEST 12) ─────────────── */

describe('local simulated shell without isolation', () => {
  test('answers commands while cross-origin isolation is disabled', () => {
    delete globalThis.window.crossOriginIsolated;
    assert.equal(webcontainerService.isSupported(), false);
    const context = {
      project: {
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>hi</h1>', language: 'html' }],
      },
      resolvedPackages: [],
      unresolvedPackages: [],
      isResolvingPackages: false,
      history: [],
    };
    const result = runLocalCommand('help', context);
    assert.ok(Array.isArray(result.output) && result.output.length > 0);
  });
});

/* ── mount prerequisites for npm execution ─────────────────────────────── */

describe('filesToFileSystemTree', () => {
  test('synthesises package.json and .npmrc when absent', () => {
    const tree = filesToFileSystemTree(
      [{ path: 'index.html', content: '<h1>hi</h1>' }],
      undefined,
      'plain',
    );
    assert.ok(tree['package.json'], 'package.json missing');
    const pkg = JSON.parse(tree['package.json'].file.contents);
    assert.ok(pkg.scripts?.dev, 'dev script missing — npm run dev would fail');
    assert.ok(tree['.npmrc'], '.npmrc missing');
    assert.match(tree['.npmrc'].file.contents, /legacy-peer-deps/);
  });
});
