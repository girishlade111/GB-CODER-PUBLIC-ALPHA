/**
 * GB Coder IDE — Phase 1H.1 Security Advisory Accuracy & Controlled Release Gate
 * Dedicated Security Boundary & Release Verification Suite
 *
 * Verifies all Phase 1H.1 requirements:
 * - Issue A: Middleware Auth Bypass (GHSA-f82v-jwr5-mffw / CVE-2025-29927) boundaries
 * - Issue B: AVIF Image Optimization RCE (GHSA-2xp9-vwfh-vxw4) boundaries
 * - Issue C: SVG Image Optimization RCE (GHSA-2464-fhr4-w9xw) boundaries
 * - Issue D: Non-universal security statements, Server Actions SSRF (GHSA-fr5h-rqp8-gw6v)
 * - Version range safety: Caret, Tilde, Open-ended, Wildcard, Prerelease, Invalid
 * - Lockfile resolved version vs declared range
 *
 * Usage: node scripts/phase1h1-security-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  auditNextJsSecurity,
  NEXTJS_SECURITY_ADVISORIES,
  parseSemver,
  compareSemver,
  parseRange,
  detectFramework,
  getUnifiedTemplate,
  generateTemplateFiles,
} = services;

describe('GB Coder Phase 1H.1 — Security Advisory Accuracy & Release Gate Tests', () => {
  after(() => {
    cleanup();
  });

  // =========================================================================
  // 1. ISSUE A: MIDDLEWARE AUTHORIZATION BYPASS (GHSA-f82v-jwr5-mffw)
  // =========================================================================
  describe('Issue A: Middleware Authorization Bypass (GHSA-f82v-jwr5-mffw)', () => {
    test('14.2.24 -> AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('14.2.24');
      assert.equal(res.isVulnerable, true);
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.ok(match, 'Must match GHSA-f82v-jwr5-mffw');
      assert.equal(match.patchedVersion, '14.2.25');
    });

    test('14.2.25 -> NOT AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('14.2.25');
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.equal(match, undefined, '14.2.25 must be clean of middleware bypass');
    });

    test('15.2.2 -> AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('15.2.2');
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.ok(match, '15.2.2 must be affected by middleware bypass');
      assert.equal(match.patchedVersion, '15.2.3');
    });

    test('15.2.3 -> NOT AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('15.2.3');
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.equal(match, undefined, '15.2.3 must be clean of middleware bypass');
    });

    test('13.5.8 -> AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('13.5.8');
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.ok(match, '13.5.8 must be affected by middleware bypass');
      assert.equal(match.patchedVersion, '13.5.9');
    });

    test('13.5.9 -> NOT AFFECTED by GHSA-f82v-jwr5-mffw', () => {
      const res = auditNextJsSecurity('13.5.9');
      const match = res.advisories.find((a) => a.id === 'GHSA-f82v-jwr5-mffw');
      assert.equal(match, undefined, '13.5.9 must be clean of middleware bypass');
    });
  });

  // =========================================================================
  // 2. ISSUE B: AVIF IMAGE OPTIMIZATION RCE (GHSA-2xp9-vwfh-vxw4)
  // =========================================================================
  describe('Issue B: AVIF Image Optimization RCE (GHSA-2xp9-vwfh-vxw4)', () => {
    test('14.2.25 -> AFFECTED by GHSA-2xp9-vwfh-vxw4 (affected range >=10.0.0 <15.5.24)', () => {
      const res = auditNextJsSecurity('14.2.25');
      const match = res.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      assert.ok(match, '14.2.25 must be affected by AVIF RCE');
      assert.equal(match.patchedVersion, '15.5.24');
    });

    test('15.5.23 -> AFFECTED by GHSA-2xp9-vwfh-vxw4', () => {
      const res = auditNextJsSecurity('15.5.23');
      const match = res.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      assert.ok(match, '15.5.23 must be affected by AVIF RCE');
    });

    test('15.5.24 -> NOT AFFECTED by GHSA-2xp9-vwfh-vxw4', () => {
      const res = auditNextJsSecurity('15.5.24');
      const match = res.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      assert.equal(match, undefined, '15.5.24 must be clean of AVIF RCE');
    });

    test('16.3.2 -> AFFECTED by GHSA-2xp9-vwfh-vxw4 (affected range >=16.0.0 <16.3.3)', () => {
      const res = auditNextJsSecurity('16.3.2');
      const match = res.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      assert.ok(match, '16.3.2 must be affected by AVIF RCE');
      assert.equal(match.patchedVersion, '16.3.3');
    });

    test('16.3.3 -> NOT AFFECTED by GHSA-2xp9-vwfh-vxw4', () => {
      const res = auditNextJsSecurity('16.3.3');
      const match = res.advisories.find((a) => a.id === 'GHSA-2xp9-vwfh-vxw4');
      assert.equal(match, undefined, '16.3.3 must be clean of AVIF RCE');
    });
  });

  // =========================================================================
  // 3. ISSUE C: SVG IMAGE OPTIMIZATION RCE (GHSA-2464-fhr4-w9xw)
  // =========================================================================
  describe('Issue C: SVG Image Optimization RCE (GHSA-2464-fhr4-w9xw)', () => {
    test('15.5.27 -> AFFECTED by GHSA-2464-fhr4-w9xw (affected range >=10.0.0 <15.5.28)', () => {
      const res = auditNextJsSecurity('15.5.27');
      const match = res.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      assert.ok(match, '15.5.27 must be affected by SVG RCE');
      assert.equal(match.patchedVersion, '15.5.28');
    });

    test('15.5.28 -> NOT AFFECTED by GHSA-2464-fhr4-w9xw', () => {
      const res = auditNextJsSecurity('15.5.28');
      const match = res.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      assert.equal(match, undefined, '15.5.28 must be clean of SVG RCE');
    });

    test('16.4.0 -> AFFECTED by GHSA-2464-fhr4-w9xw (affected range >=16.0.0 <16.4.1)', () => {
      const res = auditNextJsSecurity('16.4.0');
      const match = res.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      assert.ok(match, '16.4.0 must be affected by SVG RCE');
      assert.equal(match.patchedVersion, '16.4.1');
    });

    test('16.4.1 -> NOT AFFECTED by GHSA-2464-fhr4-w9xw', () => {
      const res = auditNextJsSecurity('16.4.1');
      const match = res.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      assert.equal(match, undefined, '16.4.1 must be clean of SVG RCE');
    });
  });

  // =========================================================================
  // 4. ISSUE D: NON-UNIVERSAL STATEMENTS & STARTER ASSESSMENT
  // =========================================================================
  describe('Issue D: Non-Universal Security Statements & Starter Verification', () => {
    test('Next.js 16.4.4 starter is unaffected by all audited critical advisories', () => {
      const res = auditNextJsSecurity('16.4.4');
      assert.equal(res.isVulnerable, false);
      assert.equal(res.hasPotentialVulnerabilities, false);
      assert.equal(res.advisories.length, 0);
      assert.ok(res.summary.includes('has no known matching advisories among audited security advisories'));
      assert.ok(!res.summary.includes('vulnerability-free'), 'Must not claim universally vulnerability-free');
    });

    test('Server Actions SSRF (GHSA-fr5h-rqp8-gw6v) correctly flags 14.2.9 and clears 14.2.10', () => {
      const res1429 = auditNextJsSecurity('14.2.9');
      assert.ok(res1429.advisories.some((a) => a.id === 'GHSA-fr5h-rqp8-gw6v'));

      const res14210 = auditNextJsSecurity('14.2.10');
      assert.ok(!res14210.advisories.some((a) => a.id === 'GHSA-fr5h-rqp8-gw6v'));
    });

    test('Multiple advisories affecting one version: 14.2.24 has 3 critical advisories', () => {
      const res = auditNextJsSecurity('14.2.24');
      assert.equal(res.isVulnerable, true);
      const ids = res.advisories.map((a) => a.id);
      assert.ok(ids.includes('GHSA-f82v-jwr5-mffw'), 'Must include Middleware Auth Bypass');
      assert.ok(ids.includes('GHSA-2xp9-vwfh-vxw4'), 'Must include AVIF RCE');
      assert.ok(ids.includes('GHSA-2464-fhr4-w9xw'), 'Must include SVG RCE');
    });
  });

  // =========================================================================
  // 5. VERSION RANGE SAFETY (Caret, Tilde, Open-ended, Prerelease, Lockfile)
  // =========================================================================
  describe('Version Range Safety & Resolved Lockfile Parity', () => {
    test('Caret range ^16.4.1 does not allow any affected versions in audited advisories', () => {
      const res = auditNextJsSecurity('^16.4.1');
      assert.equal(res.isVulnerable, false);
      assert.equal(res.hasPotentialVulnerabilities, false);
    });

    test('Caret range ^16.4.0 potentially allows vulnerable 16.4.0 (SVG RCE)', () => {
      const res = auditNextJsSecurity('^16.4.0');
      assert.equal(res.hasPotentialVulnerabilities, true);
      const match = res.advisories.find((a) => a.id === 'GHSA-2464-fhr4-w9xw');
      assert.ok(match, 'Must identify potential match for SVG RCE');
      assert.equal(match.matchType, 'potential');
    });

    test('Tilde range ~15.5.28 is clean of all audited advisories', () => {
      const res = auditNextJsSecurity('~15.5.28');
      assert.equal(res.isVulnerable, false);
      assert.equal(res.hasPotentialVulnerabilities, false);
    });

    test('Tilde range ~15.5.20 is definitely within affected ranges for AVIF and SVG RCE', () => {
      const res = auditNextJsSecurity('~15.5.20');
      assert.ok(res.isVulnerable || res.hasPotentialVulnerabilities);
    });

    test('Open-ended range >=15.0.0 <16.0.0 identifies potential/definitive matches', () => {
      const res = auditNextJsSecurity('>=15.0.0 <16.0.0');
      assert.ok(res.advisories.length > 0);
    });

    test('Prerelease version 15.0.0-canary.135 is parsed safely', () => {
      const parsed = parseSemver('15.0.0-canary.135');
      assert.equal(parsed.major, 15);
      assert.equal(parsed.minor, 0);
      assert.equal(parsed.patch, 0);
      assert.equal(parsed.prerelease, 'canary.135');
    });

    test('Unknown or invalid version strings are handled gracefully without crash', () => {
      const resEmpty = auditNextJsSecurity('');
      assert.equal(resEmpty.isVulnerable, false);

      const resInvalid = auditNextJsSecurity('invalid-semver-string');
      assert.equal(resInvalid.isVulnerable, false);

      const resGit = auditNextJsSecurity('git+https://github.com/vercel/next.js.git#canary');
      assert.equal(resGit.isVulnerable, false);
    });

    test('Resolved lockfile version takes precedence over declared range', () => {
      // Declared range allows vulnerable versions, but lockfile resolves to safe 16.4.4
      const resSafeLock = auditNextJsSecurity('^16.4.0', '16.4.4');
      assert.equal(resSafeLock.isVulnerable, false);
      assert.equal(resSafeLock.hasPotentialVulnerabilities, false);
      assert.equal(resSafeLock.resolvedVersion, '16.4.4');

      // Declared range ^16.4.0, but lockfile resolves to vulnerable 16.4.0
      const resVulnLock = auditNextJsSecurity('^16.4.0', '16.4.0');
      assert.equal(resVulnLock.isVulnerable, true);
      assert.ok(resVulnLock.advisories.some((a) => a.id === 'GHSA-2464-fhr4-w9xw'));
    });

    test('detectFramework inspects package-lock.json when present to audit resolved version', () => {
      const entries = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'lockfile-project',
            dependencies: { next: '^16.4.0', react: '^19.0.0' },
          }),
        },
        {
          path: 'package-lock.json',
          content: JSON.stringify({
            packages: {
              'node_modules/next': { version: '16.4.4' },
            },
          }),
        },
      ];
      const detected = detectFramework(entries);
      assert.equal(detected.primaryFramework, 'nextjs');
      // Because lockfile resolved to safe 16.4.4, no vulnerable warning is pushed
      const hasVulnWarning = detected.warnings.some((w) => w.includes('published security advisories'));
      assert.equal(hasVulnWarning, false, 'Safe resolved version from lockfile must not push vulnerability warning');
    });
  });
});
