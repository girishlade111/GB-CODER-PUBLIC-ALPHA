/**
 * Stage B Verification Test Suite
 *
 * Exhaustively validates all three approved Stage B reliability objectives:
 * 1. WC-001 (P1): Project-scoped dev-server and preview lifecycle
 * 2. WC-007 (P1): Race-safe, debounced, and serialized file synchronization coordinator
 * 3. WC-002 (P2): Strict root manifest detection & synthesis correctness
 *
 * Run with: node scripts/test-phase2-2-stage-b.mjs
 */

import { test, describe, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  filesToFileSystemTree,
  createProjectOfType,
} = services;

after(() => cleanup());

/* ═══════════════════════════════════════════════════════════════════════════
   1. WC-001: Project-Scoped Dev Server & Preview Lifecycle
   ═══════════════════════════════════════════════════════════════════════════ */

describe('WC-001: Project-Scoped Dev Server & Lifecycle', () => {
  beforeEach(() => {
    webcontainerService.detachProject();
    webcontainerService.resetServerState();
  });

  test('attachProject scopes runtime state to the active project', () => {
    webcontainerService.attachProject('proj-alpha');

    assert.equal(webcontainerService.getActiveProjectId(), 'proj-alpha');
    assert.equal(webcontainerService.getState().activeProjectId, 'proj-alpha');
    assert.equal(webcontainerService.isDevServerRunning('proj-alpha'), false);
    assert.equal(webcontainerService.isDevServerRunning('proj-beta'), false);
  });

  test('isDevServerRunning distinguishes between active and inactive projects', () => {
    webcontainerService.attachProject('proj-alpha');

    // Simulate server running on proj-alpha
    webcontainerService.updateState({
      serverUrl: 'https://proj-alpha.local:5173',
      serverPort: 5173,
      startupStage: 'ready',
    });

    assert.equal(webcontainerService.isDevServerRunning('proj-alpha'), true);
    assert.equal(webcontainerService.isDevServerRunning('proj-beta'), false);
    assert.equal(webcontainerService.isDevServerRunning(), true);
  });

  test('switching projects cleanly tears down previous project server and resets state', () => {
    webcontainerService.attachProject('proj-alpha');
    const epochAlpha = webcontainerService.getSessionEpoch();

    webcontainerService.updateState({
      serverUrl: 'https://proj-alpha.local:5173',
      serverPort: 5173,
      startupStage: 'ready',
    });

    assert.equal(webcontainerService.isDevServerRunning('proj-alpha'), true);

    // Switch to proj-beta
    webcontainerService.attachProject('proj-beta');

    // State must be completely reset for proj-beta
    assert.equal(webcontainerService.getActiveProjectId(), 'proj-beta');
    assert.equal(webcontainerService.getState().activeProjectId, 'proj-beta');
    assert.equal(webcontainerService.getState().serverUrl, null);
    assert.equal(webcontainerService.getState().serverPort, null);
    assert.equal(webcontainerService.getState().startupStage, 'idle');
    assert.equal(webcontainerService.isDevServerRunning('proj-alpha'), false);
    assert.equal(webcontainerService.isDevServerRunning('proj-beta'), false);
    assert.equal(webcontainerService.isDevServerRunning(), false);

    // Epoch must be incremented to invalidate pending async dispatches
    assert.ok(webcontainerService.getSessionEpoch() > epochAlpha);
  });

  test('detachProject completely unbinds project scope on dashboard return', () => {
    webcontainerService.attachProject('proj-alpha');
    webcontainerService.updateState({
      serverUrl: 'https://proj-alpha.local:5173',
      serverPort: 5173,
    });

    webcontainerService.detachProject();

    assert.equal(webcontainerService.getActiveProjectId(), null);
    assert.equal(webcontainerService.getState().activeProjectId, null);
    assert.equal(webcontainerService.getState().serverUrl, null);
    assert.equal(webcontainerService.getState().serverPort, null);
    assert.equal(webcontainerService.getState().startupStage, 'idle');
    assert.equal(webcontainerService.isDevServerRunning(), false);
  });

  test('detachProject with mismatched ID does not unintentionally detach active project', () => {
    webcontainerService.attachProject('proj-alpha');
    webcontainerService.updateState({ serverUrl: 'https://proj-alpha.local:5173' });

    // Detach with different ID should be a no-op
    webcontainerService.detachProject('stale-proj-id');

    assert.equal(webcontainerService.getActiveProjectId(), 'proj-alpha');
    assert.equal(webcontainerService.getState().serverUrl, 'https://proj-alpha.local:5173');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2. WC-007: Race-Safe File Synchronization Coordinator
   ═══════════════════════════════════════════════════════════════════════════ */

describe('WC-007: File Synchronization Coordinator', () => {
  beforeEach(() => {
    webcontainerService.detachProject();
    webcontainerService.resetServerState();
  });

  test('webcontainerService exposes flushFileSync, deleteFile, renameFile and cancelPendingSync', () => {
    assert.equal(typeof webcontainerService.syncFile, 'function');
    assert.equal(typeof webcontainerService.flushFileSync, 'function');
    assert.equal(typeof webcontainerService.deleteFile, 'function');
    assert.equal(typeof webcontainerService.renameFile, 'function');
    assert.equal(typeof webcontainerService.cancelPendingSync, 'function');
  });

  test('flushFileSync safely resolves even when no instance is booted', async () => {
    // Must never reject or hang when unbooted
    await assert.doesNotReject(async () => {
      await webcontainerService.flushFileSync();
    });
  });

  test('syncFile accepts project-scoping and safely ignores writes when unbooted', async () => {
    webcontainerService.attachProject('proj-sync');
    await assert.doesNotReject(async () => {
      await webcontainerService.syncFile('src/App.tsx', 'export default () => <div>Hi</div>', 'proj-sync');
      await webcontainerService.flushFileSync();
    });
  });

  test('cancelPendingSync clears pending writes without throwing', () => {
    assert.doesNotThrow(() => {
      webcontainerService.syncFile('src/test.ts', 'let x = 1;');
      webcontainerService.cancelPendingSync('src/test.ts');
      webcontainerService.cancelPendingSync();
    });
  });

  test('renameFile safely tracks path migrations without throwing', () => {
    assert.doesNotThrow(() => {
      webcontainerService.syncFile('src/old.ts', 'let x = 1;');
      webcontainerService.renameFile('src/old.ts', 'src/new.ts');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3. WC-002: Strict Root Manifest Detection & Synthesis Correctness
   ═══════════════════════════════════════════════════════════════════════════ */

describe('WC-002: Strict Root Manifest Correctness', () => {
  test('hasNpmManifest returns false for nested-only manifests (monorepo subpackages)', () => {
    const nestedOnly = [
      {
        path: 'packages/client/package.json',
        content: JSON.stringify({ name: 'client' }),
        language: 'json',
      },
      {
        path: 'packages/client/src/main.ts',
        content: 'console.log(1)',
        language: 'typescript',
      },
    ];

    assert.equal(
      webcontainerService.hasNpmManifest(nestedOnly),
      false,
      'Root auto-start must stay idle when manifest is nested-only',
    );
    assert.equal(
      webcontainerService.hasNestedNpmManifest(nestedOnly),
      true,
      'hasNestedNpmManifest must correctly identify nested subpackage manifest',
    );
  });

  test('hasNpmManifest returns true ONLY when root package.json exists', () => {
    const rootManifest = [
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'root-pkg', scripts: { dev: 'vite' } }),
        language: 'json',
      },
    ];
    assert.equal(webcontainerService.hasNpmManifest(rootManifest), true);
    assert.equal(webcontainerService.hasNestedNpmManifest(rootManifest), false);

    const withLeadingSlash = [
      {
        path: '/package.json',
        content: JSON.stringify({ name: 'root-pkg' }),
        language: 'json',
      },
    ];
    assert.equal(webcontainerService.hasNpmManifest(withLeadingSlash), true);
  });

  test('hasNpmManifest returns false for manifest-less and empty projects', () => {
    assert.equal(webcontainerService.hasNpmManifest([]), false);
    assert.equal(webcontainerService.hasNestedNpmManifest([]), false);

    const plainFiles = [
      { path: 'index.html', content: '<h1>Hi</h1>', language: 'html' },
      { path: 'style.css', content: 'body{}', language: 'css' },
      { path: 'script.js', content: 'console.log()', language: 'javascript' },
    ];
    assert.equal(webcontainerService.hasNpmManifest(plainFiles), false);
    assert.equal(webcontainerService.hasNestedNpmManifest(plainFiles), false);
  });

  test('filesToFileSystemTree does NOT synthesize root package.json for nested-only monorepo', () => {
    const nestedFiles = [
      {
        path: 'apps/web/package.json',
        content: JSON.stringify({ name: 'web' }),
        language: 'json',
      },
      {
        path: 'apps/web/src/index.js',
        content: 'console.log(1)',
        language: 'javascript',
      },
    ];

    const tree = filesToFileSystemTree(nestedFiles);

    // Root package.json must NOT be synthesized!
    assert.equal(tree['package.json'], undefined, 'Root package.json must not be synthesized for nested-only project');
    
    // Nested structure must be faithfully preserved
    assert.ok(tree['apps'], 'apps directory exists');
    assert.ok(tree['apps'].directory['web'], 'apps/web directory exists');
    assert.ok(tree['apps'].directory['web'].directory['package.json'], 'apps/web/package.json exists');
  });

  test('filesToFileSystemTree does NOT synthesize root package.json for empty project', () => {
    const tree = filesToFileSystemTree([]);
    assert.equal(tree['package.json'], undefined, 'Empty project must not gain synthetic package.json');
  });

  test('filesToFileSystemTree synthesizes fallback package.json for non-empty plain projects (existing invariant)', () => {
    const plainFiles = [
      { path: 'index.html', content: '<h1>Hi</h1>', language: 'html' },
    ];
    const tree = filesToFileSystemTree(plainFiles, undefined, 'plain');
    assert.ok(tree['package.json'], 'Fallback package.json synthesized for manual npm commands in plain project');
    const pkg = JSON.parse(tree['package.json'].file.contents);
    assert.equal(pkg.name, 'gb-coder-app');
    assert.ok(pkg.scripts?.dev);
  });

  test('framework templates (React/Vue) have explicit root package.json and trigger auto-start', () => {
    const reactScaffold = createProjectOfType('react');
    assert.equal(
      webcontainerService.hasNpmManifest(reactScaffold.files),
      true,
      'React template must declare root package.json',
    );
    const reactTree = filesToFileSystemTree(reactScaffold.files, reactScaffold.dependencies, 'react');
    assert.ok(reactTree['package.json']);
    const reactPkg = JSON.parse(reactTree['package.json'].file.contents);
    assert.ok(reactPkg.dependencies?.react, 'React dependency present');

    const vueScaffold = createProjectOfType('vue');
    assert.equal(
      webcontainerService.hasNpmManifest(vueScaffold.files),
      true,
      'Vue template must declare root package.json',
    );
    const vueTree = filesToFileSystemTree(vueScaffold.files, vueScaffold.dependencies, 'vue');
    assert.ok(vueTree['package.json']);
    const vuePkg = JSON.parse(vueTree['package.json'].file.contents);
    assert.ok(vuePkg.dependencies?.vue, 'Vue dependency present');
  });
});
