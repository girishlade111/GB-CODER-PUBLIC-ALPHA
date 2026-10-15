/**
 * Phase 2.2 Stage B Pre-Implementation Reproduction Tests.
 *
 * Verifies and documents current failure modes for:
 * - WC-001: Dev server lifecycle & project scoping
 * - WC-007: Monaco-to-WebContainer file sync race conditions & un-debounced writes
 * - WC-002: Root package.json detection vs nested-only manifest
 *
 * Run with: node scripts/test-phase2-2-repro.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  filesToFileSystemTree,
} = services;

after(() => cleanup());

/* ── WC-002: Root package.json detection vs nested-only manifest ────────── */

describe('WC-002 Pre-Fix Reproduction: Manifest Detection', () => {
  test('nested-only package.json incorrectly triggers hasNpmManifest (Current Bug)', () => {
    const nestedOnlyFiles = [
      {
        path: 'packages/client/package.json',
        content: JSON.stringify({ name: 'nested-client', version: '1.0.0' }),
      },
      {
        path: 'packages/client/src/index.ts',
        content: 'console.log("hello");',
      },
    ];

    // Current behavior: regex /(^|\/)package\.json$/i matches packages/client/package.json!
    // This causes hasNpmManifest to return true for root auto-start dispatch.
    const hasManifestCurrent = webcontainerService.hasNpmManifest(nestedOnlyFiles);
    
    // In current buggy code, this is TRUE, causing TerminalTab to run `npm install` at root!
    assert.equal(hasManifestCurrent, true, 'Pre-fix: hasNpmManifest matches nested manifest');

    // In current filesToFileSystemTree:
    const tree = filesToFileSystemTree(nestedOnlyFiles, undefined, 'plain');
    
    // Because hasPackageJson was true, root['package.json'] is NOT synthesized.
    // Nor is there a user root package.json!
    assert.equal(tree['package.json'], undefined, 'Root package.json does not exist in tree');
    
    // CONSEQUENCE: TerminalTab tries to run `npm install` at container root `/`,
    // which crashes with ENOENT because tree['package.json'] is missing!
  });

  test('root package.json correctly identified in root project', () => {
    const rootFiles = [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'root-app', version: '1.0.0' }),
      },
    ];
    assert.equal(webcontainerService.hasNpmManifest(rootFiles), true);
    const tree = filesToFileSystemTree(rootFiles);
    assert.ok(tree['package.json']);
  });
});

/* ── WC-001: Project Scoping & Dev Server State ─────────────────────────── */

describe('WC-001 Pre-Fix Reproduction: Dev Server Scoping', () => {
  test('webcontainerService has no concept of activeProjectId or project scoping', () => {
    webcontainerService.resetServerState();
    
    // webcontainerService is a tab singleton. Currently it has no activeProjectId property or scoping method.
    assert.equal(webcontainerService.activeProjectId, undefined);
    assert.equal(typeof webcontainerService.attachProject, 'undefined');
  });

  test('dev server state leaks across projects if not manually stopped', () => {
    webcontainerService.resetServerState();

    // Simulate Project A starting a dev server
    webcontainerService.updateState({
      serverUrl: 'https://project-a-dev.local:5173',
      serverPort: 5173,
      startupStage: 'ready',
    });
    // Internal flag in webcontainerService
    webcontainerService.isDevServerActive = true;

    assert.equal(webcontainerService.isDevServerRunning(), true);
    assert.equal(webcontainerService.getState().serverUrl, 'https://project-a-dev.local:5173');

    // In current App.tsx: handleReturnToDashboard does NOT reset server state.
    // If user returns to dashboard and opens Project B:
    // Project B checks webcontainerService.isDevServerRunning():
    const isRunningForProjectB = webcontainerService.isDevServerRunning();
    
    // Pre-fix: It returns TRUE! Project B will skip starting its own dev server
    // and falsely announce "Connected to active WebContainer Dev Server (project-a-dev.local:5173)"!
    assert.equal(isRunningForProjectB, true, 'Pre-fix: Dev server state leaks to Project B');
    
    // Clean up
    webcontainerService.resetServerState();
  });
});

/* ── WC-007: File Synchronization Coordination ─────────────────────────── */

describe('WC-007 Pre-Fix Reproduction: File Sync', () => {
  test('syncFile has no debounce or write queue in webcontainerService', () => {
    // webcontainerService.syncFile directly calls fs.writeFile without debouncing.
    // There is currently no sync coordinator or pending write tracker.
    assert.equal(typeof webcontainerService.flushFileSync, 'undefined');
    assert.equal(typeof webcontainerService.cancelPendingSync, 'undefined');
  });
});
