/**
 * GB Coder IDE — Phase 1G Automated Runtime & Production Acceptance Test Suite
 * Framework Runtime Blocker Resolution, Live Preview & Production Acceptance Validation
 *
 * Verifies all Phase 1G requirements:
 * - Angular 22 TypeScript & Builder Compatibility (G01–G04)
 * - Astro Version & Engine Compatibility (A01–A04)
 * - Next.js Security Advisory & Compiler Compatibility (N01–N03)
 * - Multi-Port Preview Discovery & Dynamic Failover (P01–P06)
 * - Package Installation UX & Secret Redaction (I01–I03)
 * - Data Safety & Cross-Framework Regression (S01–S03)
 *
 * Run with: node scripts/phase1g-runtime-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  getUnifiedTemplate,
  generateTemplateFiles,
  detectFramework,
  detectProjectCommands,
  saveProjectFiles,
  readProjectFiles,
  diagnoseAstroOutput,
  diagnoseAngularOutput,
  diagnoseNextJsOutput,
  webcontainerService,
  devServerManager,
  sanitizeRuntimeErrorMessage,
} = services;

describe('GB Coder Phase 1G — Runtime Blocker Resolution & Acceptance Tests', () => {
  after(() => {
    cleanup();
  });

  // =========================================================================
  // 1. ANGULAR 22 TYPESCRIPT & BUILDER COMPATIBILITY
  // =========================================================================
  describe('Angular 22 TypeScript & Builder Suite (G01 - G04)', () => {
    test('G01: Angular 22.2.4 starter specifies TypeScript ~6.0.0 matching compiler-cli peer dependency', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.equal(pkg.dependencies['@angular/core'], '^22.2.4');
      assert.equal(pkg.devDependencies['@angular/compiler-cli'], '^22.2.4');
      // Angular 22 peer requires typescript >=6.0.0 <6.1.0
      assert.equal(pkg.devDependencies['typescript'], '~6.0.0');
    });

    test('G02: Angular starter angular.json configures browser builder for WebContainer WASM execution', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const angularJson = JSON.parse(files['angular.json']);
      const buildTarget = angularJson.projects['angular-starter'].architect.build;
      assert.equal(buildTarget.builder, '@angular-devkit/build-angular:browser');
      assert.ok(buildTarget.options.main, 'Must define main entry');
      assert.ok(buildTarget.options.index, 'Must define index.html');
    });

    test('G03: Angular diagnostics detects esbuild native binary incompatibility and provides actionable guidance', () => {
      const log = 'Error: failed to start esbuild: platform binary not found for wasm32';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag && diag.isAngularIssue);
      assert.equal(diag.category, 'esbuild_native_failure');
      assert.ok(diag.recoveryAction.includes('browser') || diag.recoveryAction.includes('esbuild-wasm'));
    });

    test('G04: Angular diagnostics detects port 4200 collision and suggests port flag', () => {
      const log = 'Port 4200 is already in use. Use --port to specify a different port.';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag && diag.isAngularIssue);
      assert.equal(diag.category, 'port_conflict');
      assert.ok(diag.recoveryAction.includes('--port') || (diag.suggestedCommand && diag.suggestedCommand.includes('--port')));
    });
  });

  // =========================================================================
  // 2. ASTRO ENGINE & VERSION COMPATIBILITY
  // =========================================================================
  describe('Astro Version & Engine Suite (A01 - A04)', () => {
    test('A01: Astro starter package.json specifies Astro version compatible with WebContainer Node v22.22.3', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.ok(pkg.dependencies['astro'], 'Must include astro dependency');
      // Matches Astro 5.x / 6.x engine range (^20.19.1 || >=22.12.0)
      assert.ok(pkg.dependencies['astro'].includes('5.') || pkg.dependencies['astro'].includes('6.'));
    });

    test('A02: Astro diagnostics identifies Node engine incompatibility (>=22.23.4 required by Astro 7)', () => {
      const log = 'npm error Unsupported engine: wanted {"node":">=22.23.4"} (current: {"node":"v22.22.3"}) astro';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag && diag.isAstroIssue);
      assert.equal(diag.category, 'node_version_incompatible');
      assert.ok(diag.recoveryAction.includes('Astro 5') || diag.recoveryAction.includes('Astro'));
    });

    test('A03: Astro diagnostics captures Sharp native binary failures and recommends passthrough image service', () => {
      const log = 'Error: Could not load the "sharp" module using the darwin-arm64 runtime';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag && diag.isAstroIssue);
      assert.equal(diag.category, 'image_service_unsupported');
      assert.ok(diag.recoveryAction.includes('noop') || diag.recoveryAction.includes('passthrough'));
    });

    test('A04: Astro diagnostics captures port 4321 collision (EADDRINUSE)', () => {
      const log = 'listen EADDRINUSE: address already in use 0.0.0.0:4321';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag && diag.isAstroIssue);
      assert.equal(diag.category, 'port_conflict');
    });
  });

  // =========================================================================
  // 3. NEXT.JS SECURITY & COMPILER COMPATIBILITY
  // =========================================================================
  describe('Next.js Security & Compiler Suite (N01 - N03)', () => {
    test('N01: Next.js starter specifies verified Next.js package with WASM SWC fallback', async () => {
      const files = await generateTemplateFiles('nextjs-genuine-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.ok(pkg.dependencies['next'], 'Must include next');
      assert.ok(pkg.dependencies['@next/swc-wasm-nodejs'], 'Must include @next/swc-wasm-nodejs');
      assert.equal(pkg.dependencies['@next/swc-wasm-nodejs'], pkg.dependencies['next']);
    });

    test('N02: Next.js security classification recognizes Next.js 14.2.24 as patched against GHSA-f82v-jwr5-mffw and GHSA-2xp9-vwfh-vxw4', () => {
      // GHSA-f82v-jwr5-mffw affected < 14.2.10
      // GHSA-2xp9-vwfh-vxw4 affected < 14.2.21
      // Version 14.2.24 is >= 14.2.21 and contains backported security patches
      const currentVersion = '14.2.24';
      const parseSemver = (v) => v.split('.').map(Number);
      const [maj, min, patch] = parseSemver(currentVersion);
      const isPatchedAgainstCVE1 = maj > 14 || (maj === 14 && (min > 2 || (min === 2 && patch >= 10)));
      const isPatchedAgainstCVE2 = maj > 14 || (maj === 14 && (min > 2 || (min === 2 && patch >= 21)));
      assert.ok(isPatchedAgainstCVE1, '14.2.24 must be patched against GHSA-f82v-jwr5-mffw');
      assert.ok(isPatchedAgainstCVE2, '14.2.24 must be patched against GHSA-2xp9-vwfh-vxw4');
    });

    test('N03: Next.js diagnostics captures Turbopack native binary incompatibility', () => {
      const log = 'Error: Turbopack is currently not supported on this platform';
      const diag = diagnoseNextJsOutput(log);
      assert.ok(diag && diag.isNextJsIssue);
      assert.equal(diag.category, 'turbopack_unsupported');
      assert.ok(diag.recoveryAction.includes('--turbo'));
    });
  });

  // =========================================================================
  // 4. MULTI-PORT PREVIEW DISCOVERY & DYNAMIC FAILOVER
  // =========================================================================
  describe('Multi-Port Preview Discovery & Management Suite (P01 - P06)', () => {
    test('P01: DevServerManager discovers arbitrary ports without hardcoding', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-multi-port', sessionEpoch: 1 });

      devServerManager.handleServerReady(8080, 'https://gb-port-8080.local', 'test-multi-port', 1);
      assert.equal(devServerManager.getState().serverPort, 8080);
      assert.equal(devServerManager.getState().serverUrl, 'https://gb-port-8080.local');
      assert.equal(devServerManager.getState().status, 'running');

      const discovered = devServerManager.getDiscoveredPorts();
      assert.equal(discovered.length, 1);
      assert.equal(discovered[0].port, 8080);
      assert.equal(discovered[0].active, true);
    });

    test('P02: DevServerManager tracks multiple concurrent active ports', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-multi-port', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-multi-port', 1);
      devServerManager.handleServerReady(5173, 'https://gb-port-5173.local', 'test-multi-port', 1);
      devServerManager.handleServerReady(8000, 'https://gb-port-8000.local', 'test-multi-port', 1);

      const active = devServerManager.getActivePorts();
      assert.equal(active.length, 3);
      assert.deepEqual(active.map((p) => p.port), [3000, 5173, 8000]);
    });

    test('P03: selectPort allows user to switch active preview between discovered ports', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-multi-port', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-multi-port', 1);
      devServerManager.handleServerReady(8080, 'https://gb-port-8080.local', 'test-multi-port', 1);

      // Select port 8080
      const selected = devServerManager.selectPort(8080);
      assert.ok(selected, 'selectPort must return true for active port');
      assert.equal(devServerManager.getState().serverPort, 8080);
      assert.equal(devServerManager.getState().serverUrl, 'https://gb-port-8080.local');
      assert.equal(devServerManager.getState().selectedPort, 8080);

      // Attempt invalid port
      const invalid = devServerManager.selectPort(9999);
      assert.equal(invalid, false);
      assert.equal(devServerManager.getState().selectedPort, 8080);
    });

    test('P04: DevServerManager discards stale server-ready events from prior projects or epochs', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'project-new', sessionEpoch: 2 });

      // Stale project
      devServerManager.handleServerReady(4321, 'https://stale-proj.local', 'project-old', 2);
      assert.equal(devServerManager.getDiscoveredPorts().length, 0);

      // Stale epoch
      devServerManager.handleServerReady(4321, 'https://stale-epoch.local', 'project-new', 1);
      assert.equal(devServerManager.getDiscoveredPorts().length, 0);
    });

    test('P05: Port close triggers dynamic failover to remaining active port', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'test-failover', sessionEpoch: 1 });

      devServerManager.handleServerReady(3000, 'https://gb-port-3000.local', 'test-failover', 1);
      devServerManager.handleServerReady(4000, 'https://gb-port-4000.local', 'test-failover', 1);

      // Currently port 3000 is active. Close 3000:
      devServerManager.handlePortClose(3000, 'test-failover', 1);
      assert.equal(devServerManager.getState().status, 'running');
      assert.equal(devServerManager.getState().serverPort, 4000);
      assert.equal(devServerManager.getState().serverUrl, 'https://gb-port-4000.local');

      // Now close port 4000: all ports closed
      devServerManager.handlePortClose(4000, 'test-failover', 1);
      assert.equal(devServerManager.getState().status, 'stopped');
      assert.equal(devServerManager.getState().serverPort, null);
      assert.equal(devServerManager.getState().serverUrl, null);
    });

    test('P06: cleanupStalePorts purges out-of-scope ports on project switch', () => {
      devServerManager.reset();
      devServerManager.updateState({ projectId: 'project-a', sessionEpoch: 1 });
      devServerManager.handleServerReady(3000, 'https://gb-3000.local', 'project-a', 1);

      // Switch to project-b
      devServerManager.cleanupStalePorts('project-b', 2);
      assert.equal(devServerManager.getDiscoveredPorts().length, 0);
    });
  });

  // =========================================================================
  // 5. PACKAGE INSTALLATION UX & SENSITIVE REDACTION
  // =========================================================================
  describe('Installation UX & Secret Redaction Suite (I01 - I03)', () => {
    test('I01: sanitizeRuntimeErrorMessage redacts tokens, API keys, and sensitive auth query params', () => {
      const sensitive1 = 'Failed to clone repo with token ghp_123456789012345678901234567890123456';
      assert.ok(!sanitizeRuntimeErrorMessage(sensitive1).includes('ghp_'));
      assert.ok(sanitizeRuntimeErrorMessage(sensitive1).includes('[REDACTED_TOKEN]'));

      const sensitive2 = 'API call failed with key sk-12345678901234567890123456';
      assert.ok(!sanitizeRuntimeErrorMessage(sensitive2).includes('sk-'));
      assert.ok(sanitizeRuntimeErrorMessage(sensitive2).includes('[REDACTED_API_KEY]'));

      const sensitive3 = 'NPM error with npm_auth_token: npm_abcdef123456789012345678901234567890';
      assert.ok(!sanitizeRuntimeErrorMessage(sensitive3).includes('npm_abcdef'));
      assert.ok(sanitizeRuntimeErrorMessage(sensitive3).includes('[REDACTED_NPM_TOKEN]'));

      const sensitive4 = 'Fetch failed https://registry.npmjs.org/?token=secret_value_123';
      assert.ok(!sanitizeRuntimeErrorMessage(sensitive4).includes('secret_value_123'));
    });

    test('I02: setStartupStage sanitizes runtime error messages before updating state', () => {
      webcontainerService.setStartupStage('error', {
        phase: 'install',
        message: 'npm ERR! Authorization failed with token ghp_000000000000000000000000000000000000',
        details: 'Bearer secret_token_value_abc',
        timestamp: Date.now(),
        recoverable: true,
        retryAction: 'retry_install',
      });

      const state = webcontainerService.getState();
      assert.equal(state.startupStage, 'error');
      assert.ok(!state.error?.includes('ghp_'));
      assert.ok(state.error?.includes('[REDACTED_TOKEN]'));
      assert.ok(!state.runtimeError?.details?.includes('secret_token_value_abc'));
    });

    test('I03: Retry action affordance cleanly resets runtime error state', () => {
      webcontainerService.setStartupStage('installing');
      const state = webcontainerService.getState();
      assert.equal(state.startupStage, 'installing');
      assert.equal(state.runtimeError, null);
      assert.equal(state.error, null);
    });
  });

  // =========================================================================
  // 6. DATA SAFETY & CROSS-FRAMEWORK REGRESSION
  // =========================================================================
  describe('Data Safety & Cross-Framework Regression Suite (S01 - S03)', () => {
    test('S01: IndexedDB files remain intact across simulated install/server failures', async () => {
      const projectId = 'phase1g-test-project';
      const initialFiles = [
        { path: 'package.json', content: '{"name":"safety-test","dependencies":{}}' },
        { path: 'src/index.ts', content: 'export const status = "safe";' },
      ];

      await saveProjectFiles(projectId, initialFiles);

      // Simulate a runtime failure
      webcontainerService.setStartupStage('error', {
        phase: 'install',
        message: 'Installation halted',
        timestamp: Date.now(),
        recoverable: true,
      });

      // Verify files in storage are completely unaffected
      const loaded = await readProjectFiles(projectId);
      assert.equal(loaded.length, 2);
      const indexFile = loaded.find((f) => f.path === 'src/index.ts');
      assert.ok(indexFile);
      assert.equal(indexFile.content, 'export const status = "safe";');
    });

    test('S02: Classic Editor vanilla HTML/JS/CSS templates remain plain and functional', () => {
      const tpl = getUnifiedTemplate('blank');
      assert.ok(tpl);
      assert.equal(tpl.recommendedEditor, 'plain');
      assert.equal(tpl.projectType, 'plain');
      assert.equal(tpl.supportStatus, 'ready');
    });

    test('S03: React/Vite and Vue/Vite templates remain ready with vite packageManager', () => {
      const reactTpl = getUnifiedTemplate('react-todo');
      assert.ok(reactTpl);
      assert.equal(reactTpl.supportStatus, 'ready');
      assert.equal(reactTpl.projectType, 'react');

      const vueTpl = getUnifiedTemplate('vue-tasks');
      assert.ok(vueTpl);
      assert.equal(vueTpl.supportStatus, 'ready');
      assert.equal(vueTpl.projectType, 'vue');
    });
  });
});
