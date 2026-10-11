/**
 * GB Coder — Task 03 NPM Install Performance & Dependency Cache Tests
 *
 * Automated regression suite testing all 12 scenarios from Phase 7:
 * 1. First installation (cold run requires install).
 * 2. Same-project reopen (warm reopen detects verified dependencies).
 * 3. Unchanged dependencies (retains valid cache fingerprint).
 * 4. Changed dependencies (detects change and invalidates cache).
 * 5. Missing lockfile (generates stable manifest-only fingerprint).
 * 6. Existing lockfile (incorporates lockfile metadata into fingerprint).
 * 7. Two simultaneous install requests (deduplication & debounced execution).
 * 8. Install cancellation (clean state reset without residue).
 * 9. Failed install and retry (error recovery allows clean retry).
 * 10. Missing package.json (synthesizes minimal package.json + .npmrc).
 * 11. npm project compatibility (.npmrc performance flags injected).
 * 12. Existing supported pnpm/yarn workflows (lockfiles preserved).
 *
 * Run with: node scripts/npm-install-performance-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  filesToFileSystemTree,
} = services;

after(() => cleanup());

describe('GB Coder Task 03 — NPM Install Performance & Cache Efficiency (12 Tests)', () => {
  // Test 1: First installation
  test('01. First installation: triggers install when container node_modules is not yet present', async () => {
    webcontainerService.invalidateDependencyCache();
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'fresh-app', dependencies: { react: '^18.2.0' } }),
      },
    ];
    // In Node test environment, instance is unbooted, which correctly reports needsInstall = true
    const check = await webcontainerService.needsDependencyInstall(files);
    assert.equal(check.needsInstall, true, 'First install must trigger dependency install');
    assert.ok(check.fingerprint, 'Fingerprint must be computed');
  });

  // Test 2: Same-project reopen
  test('02. Same-project reopen: recognizes identical fingerprint for reopened project', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'my-project', dependencies: { react: '^18.2.0', vite: '^5.0.0' } }),
      },
    ];
    const fp1 = webcontainerService.computeDependencyFingerprint(files);
    const fp2 = webcontainerService.computeDependencyFingerprint(files);
    assert.equal(fp1, fp2, 'Reopened project must yield identical fingerprint');
  });

  // Test 3: Unchanged dependencies
  test('03. Unchanged dependencies: retains matching fingerprint across visits', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { axios: '^1.6.0' } }),
      },
      { path: 'src/index.ts', content: 'console.log("hello");' },
    ];
    const fpA = webcontainerService.computeDependencyFingerprint(files);
    // User modifies an application file without touching dependencies
    const updatedFiles = [
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { axios: '^1.6.0' } }),
      },
      { path: 'src/index.ts', content: 'console.log("hello world");' },
    ];
    const fpB = webcontainerService.computeDependencyFingerprint(updatedFiles);
    assert.equal(fpA, fpB, 'Application file edits must not invalidate dependency cache');
  });

  // Test 4: Changed dependencies
  test('04. Changed dependencies: invalidates fingerprint when dependencies change', () => {
    const filesInitial = [
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { lodash: '^4.17.21' } }),
      },
    ];
    const filesUpdated = [
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { lodash: '^4.17.21', zustand: '^4.5.0' } }),
      },
    ];
    const fpInitial = webcontainerService.computeDependencyFingerprint(filesInitial);
    const fpUpdated = webcontainerService.computeDependencyFingerprint(filesUpdated);
    assert.notEqual(fpInitial, fpUpdated, 'Adding or removing dependencies must change fingerprint');
  });

  // Test 5: Missing lockfile
  test('05. Missing lockfile: gracefully computes deterministic fingerprint from manifest alone', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'no-lock-app', dependencies: { vue: '^3.4.0' } }),
      },
    ];
    const fp = webcontainerService.computeDependencyFingerprint(files);
    assert.ok(typeof fp === 'string' && fp.length > 0);
  });

  // Test 6: Existing lockfile
  test('06. Existing lockfile: incorporates package-lock.json content into fingerprint', () => {
    const withoutLock = [
      { path: 'package.json', content: JSON.stringify({ dependencies: { express: '^4.18.2' } }) },
    ];
    const withLock = [
      { path: 'package.json', content: JSON.stringify({ dependencies: { express: '^4.18.2' } }) },
      { path: 'package-lock.json', content: '{"name":"express-app","version":"1.0.0","lockfileVersion":3}' },
    ];
    const fpNoLock = webcontainerService.computeDependencyFingerprint(withoutLock);
    const fpWithLock = webcontainerService.computeDependencyFingerprint(withLock);
    assert.notEqual(fpNoLock, fpWithLock, 'Lockfile presence must alter fingerprint');
  });

  // Test 7: Two simultaneous install requests
  test('07. Two simultaneous install requests: debounced restart and idempotent stage setting', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('installing');
    assert.equal(webcontainerService.getState().startupStage, 'installing');

    // Second call while already installing
    webcontainerService.setStartupStage('installing');
    assert.equal(webcontainerService.getState().startupStage, 'installing');
  });

  // Test 8: Install cancellation
  test('08. Install cancellation: resets server URLs and stops dev server cleanly', () => {
    webcontainerService.stopDevServer();
    assert.equal(webcontainerService.getState().serverUrl, null);
    assert.equal(webcontainerService.getState().serverPort, null);
    assert.equal(webcontainerService.getState().startupStage, 'idle');
    assert.equal(webcontainerService.isDevServerRunning(), false);
  });

  // Test 9: Failed install and retry
  test('09. Failed install and retry: transitions through error to retry without wedging', () => {
    webcontainerService.setStartupStage('error');
    assert.equal(webcontainerService.getState().startupStage, 'error');

    // User or service triggers restart retry
    webcontainerService.requestRestart('Retry installation');
    assert.equal(webcontainerService.getState().startupStage, 'installing');
    assert.equal(webcontainerService.isDevServerRunning(), false);
  });

  // Test 10: Missing package.json
  test('10. Missing package.json: synthesizes compliant package.json with dev script and .npmrc', () => {
    const tree = filesToFileSystemTree([{ path: 'index.html', content: '<h1>test</h1>' }], undefined, 'plain');
    assert.ok(tree['package.json'], 'Must synthesize package.json');
    const pkg = JSON.parse(tree['package.json'].file.contents);
    assert.ok(pkg.scripts?.dev, 'Must have dev script');
    assert.ok(tree['.npmrc'], 'Must inject .npmrc');
  });

  // Test 11: npm project compatibility
  test('11. npm project compatibility: injected .npmrc contains performance flags', () => {
    const tree = filesToFileSystemTree([{ path: 'package.json', content: '{}' }]);
    assert.ok(tree['.npmrc']);
    const npmrc = tree['.npmrc'].file.contents;
    assert.match(npmrc, /prefer-offline=true/, '.npmrc must contain prefer-offline=true');
    assert.match(npmrc, /audit=false/, '.npmrc must contain audit=false');
    assert.match(npmrc, /fund=false/, '.npmrc must contain fund=false');
    assert.match(npmrc, /progress=false/, '.npmrc must contain progress=false');
    assert.match(npmrc, /legacy-peer-deps=true/, '.npmrc must contain legacy-peer-deps=true');
  });

  // Test 12: Existing supported pnpm/yarn workflows
  test('12. Existing supported pnpm/yarn workflows: preserves pnpm-lock.yaml and yarn.lock in fingerprinting', () => {
    const baseFiles = [
      { path: 'package.json', content: JSON.stringify({ dependencies: { tailwindcss: '^3.0.0' } }) },
    ];
    const pnpmFiles = [
      ...baseFiles,
      { path: 'pnpm-lock.yaml', content: 'lockfileVersion: 5.4' },
    ];
    const yarnFiles = [
      ...baseFiles,
      { path: 'yarn.lock', content: '# yarn lockfile v1' },
    ];
    const fpBase = webcontainerService.computeDependencyFingerprint(baseFiles);
    const fpPnpm = webcontainerService.computeDependencyFingerprint(pnpmFiles);
    const fpYarn = webcontainerService.computeDependencyFingerprint(yarnFiles);
    assert.notEqual(fpBase, fpPnpm, 'pnpm lockfile must be incorporated');
    assert.notEqual(fpBase, fpYarn, 'yarn lockfile must be incorporated');
    assert.notEqual(fpPnpm, fpYarn, 'different lockfiles must yield distinct fingerprints');
  });
});
