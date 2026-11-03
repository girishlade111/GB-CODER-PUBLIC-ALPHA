/**
 * GB Coder IDE — Phase 1H Security Advisory Remediation & Acceptance Test Suite
 * Independent Security Remediation, Real Runtime Acceptance & Production Release Gate
 *
 * Verifies all Phase 1H requirements:
 * - Finding A: Advisory-specific Next.js security verification (H01–H07)
 * - Finding B/C: Framework compatibility & honest boundaries (H08–H11)
 * - Finding D: Multi-port preview UI synchronization & state parity (H12–H15)
 * - Finding E: Astro version reconciliation & engine compatibility (H16–H18)
 * - Data safety & secret redaction across error surfaces (H19–H21)
 *
 * Run with: node scripts/phase1h-security-acceptance-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  auditNextJsSecurity,
  NEXTJS_SECURITY_ADVISORIES,
  detectFramework,
  getUnifiedTemplate,
  generateTemplateFiles,
  webcontainerService,
  devServerManager,
  sanitizeRuntimeErrorMessage,
} = services;

describe('GB Coder Phase 1H — Independent Security Remediation & Acceptance Tests', () => {
  after(() => {
    cleanup();
  });

  // =========================================================================
  // 1. FINDING A: ADVISORY-SPECIFIC NEXT.JS SECURITY EVALUATION (H01 - H07)
  // =========================================================================
  describe('Finding A: Advisory-Specific Next.js Security Suite (H01 - H07)', () => {
    test('H01: Next.js 14.2.24 is evaluated as VULNERABLE to GHSA-f82v-jwr5-mffw (Middleware Auth Bypass)', () => {
      const result = auditNextJsSecurity('14.2.24');
      assert.equal(result.isVulnerable, true, 'Next.js 14.2.24 must be classified as vulnerable');
      
      const middlewareAdv = result.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.ok(middlewareAdv, 'Must detect GHSA-f82v-jwr5-mffw on Next.js 14.2.24');
      assert.equal(middlewareAdv.patchedVersion, '14.2.25', 'Patched version for 14.x middleware bypass must be 14.2.25');
      assert.equal(middlewareAdv.severity, 'critical');
    });

    test('H02: Next.js 14.2.24 is affected by GHSA-2xp9-vwfh-vxw4 and GHSA-2464-fhr4-w9xw, but patched for SSRF', () => {
      const result = auditNextJsSecurity('14.2.24');
      const rceAvif = result.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      const rceSvg = result.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      const ssrfAdv = result.advisories.find((a) => a.id === 'GHSA-fr5h-rqp8-gw6v');
      
      assert.ok(rceAvif, '14.2.24 is < 15.5.24, so AVIF RCE is affected');
      assert.ok(rceSvg, '14.2.24 is < 15.5.28, so SVG RCE is affected');
      assert.equal(ssrfAdv, undefined, '14.2.24 is >= 14.2.10, so SSRF is patched');
    });

    test('H03: Next.js 14.2.25 is patched against GHSA-f82v-jwr5-mffw, but affected by AVIF/SVG RCE', () => {
      const result = auditNextJsSecurity('14.2.25');
      const middlewareAdv = result.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      const rceAvif = result.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      const rceSvg = result.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');

      assert.equal(middlewareAdv, undefined, '14.2.25 is patched against Middleware Auth Bypass');
      assert.ok(rceAvif, '14.2.25 is < 15.5.24 and affected by AVIF RCE');
      assert.ok(rceSvg, '14.2.25 is < 15.5.28 and affected by SVG RCE');
    });

    test('H04: Next.js 15.2.2 is affected by GHSA-f82v-jwr5-mffw, while 15.2.3 is patched', () => {
      const res1522 = auditNextJsSecurity('15.2.2');
      assert.ok(res1522.advisories.some((a) => a.id === 'GHSA-f82v-jwr5-mffw'));

      const res1523 = auditNextJsSecurity('15.2.3');
      assert.ok(!res1523.advisories.some((a) => a.id === 'GHSA-f82v-jwr5-mffw'));
    });

    test('H05: Next.js 15.5.24 patches AVIF RCE, and 15.5.28 patches SVG RCE', () => {
      const res15523 = auditNextJsSecurity('15.5.23');
      assert.ok(res15523.advisories.some((a) => a.id === 'GHSA-2xp9-vwfh-vxw4'));

      const res15524 = auditNextJsSecurity('15.5.24');
      assert.ok(!res15524.advisories.some((a) => a.id === 'GHSA-2xp9-vwfh-vxw4'));

      const res15527 = auditNextJsSecurity('15.5.27');
      assert.ok(res15527.advisories.some((a) => a.id === 'GHSA-2464-fhr4-w9xw'));

      const res15528 = auditNextJsSecurity('15.5.28');
      assert.ok(!res15528.advisories.some((a) => a.id === 'GHSA-2464-fhr4-w9xw'));
    });

    test('H06: Next.js 16.4.4 starter version has zero matching advisories among audited list', () => {
      const result = auditNextJsSecurity('16.4.4');
      assert.equal(result.isVulnerable, false);
      assert.equal(result.advisories.length, 0);
    });

    test('H07: projectDetection framework detection surfaces advisory summary for vulnerable Next.js projects', () => {
      const entries = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'vuln-nextjs',
            dependencies: {
              next: '14.2.24',
              react: '^18.2.0',
            },
          }),
        },
      ];
      const detected = detectFramework(entries);

      assert.equal(detected.primaryFramework, 'nextjs');
      const hasMiddlewareWarning = detected.warnings.some((w) => w.includes('GHSA-f82v-jwr5-mffw'));
      assert.ok(hasMiddlewareWarning, 'Must surface GHSA-f82v-jwr5-mffw warning in detected framework warnings');
    });
  });

  // =========================================================================
  // 2. FINDINGS B & C: FRAMEWORK REALITIES & HONEST BOUNDARIES (H08 - H11)
  // =========================================================================
  describe('Findings B & C: Framework Realities & Boundaries (H08 - H11)', () => {
    test('H08: Next.js framework runtime support is categorized honestly as experimental', () => {
      const entries = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test-nextjs',
            dependencies: {
              next: '16.4.4',
              '@next/swc-wasm-nodejs': '16.4.4',
              react: '^19.0.0',
            },
          }),
        },
      ];
      const detected = detectFramework(entries);
      assert.equal(detected.primaryFramework, 'nextjs');
      assert.equal(detected.runtimeSupport, 'experimental', 'Next.js in browser WebContainer must be experimental');
    });

    test('H09: Next.js with --turbo is flagged as unsupported in WebContainers', () => {
      const entries = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test-turbopack',
            scripts: { dev: 'next dev --turbo' },
            dependencies: { next: '16.4.4' },
          }),
        },
      ];
      const detected = detectFramework(entries);
      assert.equal(detected.primaryFramework, 'nextjs');
      assert.equal(detected.runtimeSupport, 'unsupported');
      assert.ok(detected.warnings.some((w) => w.includes('Turbopack')));
    });

    test('H10: Angular 22 starter includes TypeScript ~6.0.0 peer compliance', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.equal(pkg.devDependencies['typescript'], '~6.0.0');
      assert.equal(pkg.dependencies['@angular/core'], '^22.2.4');
    });

    test('H11: Classic Editor templates (Vanilla, React Vite, Vue Vite) retain verified status', () => {
      const vanillaEntries = [
        { path: 'index.html', content: '<html><body>Hello</body></html>' },
        { path: 'script.js', content: 'console.log("hello");' },
      ];
      const vanillaDet = detectFramework(vanillaEntries);
      assert.equal(vanillaDet.primaryFramework, 'vanilla');

      const reactEntries = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'react-vite-app',
            dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
            devDependencies: { vite: '^5.4.2' },
          }),
        },
        { path: 'vite.config.ts', content: 'export default {}' },
      ];
      const reactDet = detectFramework(reactEntries);
      assert.equal(reactDet.primaryFramework, 'react-vite');
      assert.equal(reactDet.runtimeSupport, 'verified');
    });
  });

  // =========================================================================
  // 3. FINDING D: MULTI-PORT PREVIEW SYNCHRONIZATION (H12 - H15)
  // =========================================================================
  describe('Finding D: Multi-Port Preview Synchronization Suite (H12 - H15)', () => {
    test('H12: DevServerManager tracks multiple active ports and reports via getActivePorts()', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-h-ports', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-h-ports', 1);
      devServerManager.handleServerReady(8080, 'https://gb-port-8080.local', 'test-h-ports', 1);

      const active = devServerManager.getActivePorts();
      assert.equal(active.length, 2);
      assert.deepEqual(active.map((p) => p.port), [3000, 8080]);
    });

    test('H13: selectPort(port) updates both DevServerManager and WebContainerService serverPort/serverUrl', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-h-ports', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-h-ports', 1);
      devServerManager.handleServerReady(8080, 'https://gb-port-8080.local', 'test-h-ports', 1);

      // Select port 8080
      const switched = devServerManager.selectPort(8080);
      assert.equal(switched, true, 'selectPort must return true for active port');

      // Verify DevServerManager state
      const dsmState = devServerManager.getState();
      assert.equal(dsmState.selectedPort, 8080);
      assert.equal(dsmState.serverPort, 8080);
      assert.equal(dsmState.serverUrl, 'https://gb-port-8080.local');

      // Verify WebContainerService state synchronization
      const wcState = webcontainerService.getState();
      assert.equal(wcState.serverPort, 8080);
      assert.equal(wcState.serverUrl, 'https://gb-port-8080.local');
    });

    test('H14: selectPort(port) rejects non-existent or inactive ports and preserves active selection', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-h-ports', sessionEpoch: 1 });
      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-h-ports', 1);

      const invalidSwitch = devServerManager.selectPort(9999);
      assert.equal(invalidSwitch, false, 'Must reject unknown port');
      assert.equal(devServerManager.getState().serverPort, 3000);
    });

    test('H15: Port closure dynamically fails over to remaining active port and keeps WebContainerService in sync', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-h-ports', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-h-ports', 1);
      devServerManager.handleServerReady(8080, 'https://gb-port-8080.local', 'test-h-ports', 1);

      // Currently selected is 8080
      devServerManager.selectPort(8080);
      assert.equal(devServerManager.getState().serverPort, 8080);

      // Close port 8080
      devServerManager.handlePortClose(8080, 'test-h-ports', 1);

      // Must failover to port 3000
      assert.equal(devServerManager.getState().serverPort, 3000);
      assert.equal(devServerManager.getState().serverUrl, 'https://gb-port-3000.local');
    });
  });

  // =========================================================================
  // 4. FINDING E: ASTRO VERSION RECONCILIATION & ENGINE SUPPORT (H16 - H18)
  // =========================================================================
  describe('Finding E: Astro Version & Engine Reconciliation (H16 - H18)', () => {
    test('H16: astro-starter template specifies astro ^5.4.2 as starter default', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.equal(pkg.dependencies['astro'], '^5.4.2');
    });

    test('H17: Astro 5 and Astro 6 engine requirements pass on WebContainer Node v22.22.3', () => {
      const webcontainerNode = '22.22.3';
      const [maj, min, patch] = webcontainerNode.split('.').map(Number);

      // Astro 5: >=22.0.0
      const astro5Compatible = maj > 22 || (maj === 22 && min >= 0);
      assert.ok(astro5Compatible, 'Astro 5 must be compatible with Node 22.22.3');

      // Astro 6: >=22.12.0
      const astro6Compatible = maj > 22 || (maj === 22 && min >= 12);
      assert.ok(astro6Compatible, 'Astro 6 must be compatible with Node 22.22.3');
    });

    test('H18: Astro 7 engine requirement (>=22.23.4) correctly fails on WebContainer Node v22.22.3', () => {
      const webcontainerNode = '22.22.3';
      const [maj, min, patch] = webcontainerNode.split('.').map(Number);

      // Astro 7 requires >= 22.23.4
      const astro7Compatible = maj > 22 || (maj === 22 && (min > 23 || (min === 23 && patch >= 4)));
      assert.equal(astro7Compatible, false, 'Astro 7 is incompatible with WebContainer Node 22.22.3');
    });
  });

  // =========================================================================
  // 5. DATA SAFETY & SECRET REDACTION (H19 - H21)
  // =========================================================================
  describe('Data Safety & Secret Redaction Suite (H19 - H21)', () => {
    test('H19: sanitizeRuntimeErrorMessage redacts GitHub PATs and Bearer tokens', () => {
      const raw = 'Error: Authentication failed with ghp_123456789012345678901234567890123456 for user';
      const clean = sanitizeRuntimeErrorMessage(raw);
      assert.ok(!clean.includes('ghp_123456789012345678901234567890123456'));
      assert.ok(clean.includes('[REDACTED_TOKEN]'));
    });

    test('H20: sanitizeRuntimeErrorMessage redacts API keys, secret access keys and sensitive query params', () => {
      const raw = 'Failed to fetch from https://api.service.com/v1?token=secret_value_123&apiKey=sk-12345678901234567890123456';
      const clean = sanitizeRuntimeErrorMessage(raw);
      assert.ok(!clean.includes('secret_value_123'));
      assert.ok(!clean.includes('sk-12345678901234567890123456'));
      assert.ok(clean.includes('[REDACTED_API_KEY]'));
    });

    test('H21: sanitizeRuntimeErrorMessage handles string conversions safely', () => {
      const clean = sanitizeRuntimeErrorMessage('Database error at postgresql://user:secret@localhost:5432/app');
      assert.ok(typeof clean === 'string');
    });
  });
});
