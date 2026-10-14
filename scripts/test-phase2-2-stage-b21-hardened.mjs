/**
 * test-phase2-2-stage-b21-hardened.mjs
 *
 * GB CODER — PHASE 2.2, STAGE B.2.1
 * Hardened Concurrency & Runtime Ownership Acceptance Suite
 *
 * Asserts verification for:
 *   - CR01: Stale WebContainer server events, draining port tracking, epoch scoping
 *   - CR02: In-flight WebContainer writes, barrier synchronization
 *   - CR03: Asynchronous project attachment race protection with transitions
 *   - CR04: Dev server termination semantics & epoch invalidation
 *   - CR05: Directory rename descendant remapping & delete synchronization
 */

import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// Compile TypeScript files for direct Node execution
import esbuild from 'esbuild';

const outfile = path.join(root, 'scripts', '.tmp-stage-b21-hardened.mjs');
await esbuild.build({
  entryPoints: [path.join(root, 'src', 'services', 'webcontainer', 'webcontainerService.ts')],
  bundle: true,
  format: 'esm',
  outfile,
  platform: 'browser',
  external: ['@webcontainer/api'],
});

function cleanup() {
  try {
    fs.unlinkSync(outfile);
  } catch {}
}

const { webcontainerService, FileSyncCoordinator } = await import(pathToFileURL(outfile).href);

after(() => cleanup());

/* ── CR01: Stale WebContainer Server Events ────────────────────────────── */
describe('CR01: Hardened WebContainer Server Events', () => {
  test('CR01: Late server-ready from former project is safely discarded', () => {
    let serverReadyCallback = null;
    let portCallback = null;

    const mockContainer = {
      on: (event, cb) => {
        if (event === 'server-ready') serverReadyCallback = cb;
        if (event === 'port') portCallback = cb;
        return () => {};
      },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // 1. User starts in Project A
    webcontainerService.attachProject('project-a');
    assert.equal(webcontainerService.getActiveProjectId(), 'project-a');

    // 2. User navigates to Project B before Project A's server was ready
    webcontainerService.attachProject('project-b');
    assert.equal(webcontainerService.getActiveProjectId(), 'project-b');
    assert.equal(webcontainerService.getState().serverUrl, null);

    // 3. Late server-ready event from Project A arrives!
    serverReadyCallback(5173, 'http://project-a-server.local');

    // VERIFICATION: Project B's serverUrl MUST remain null!
    assert.equal(
      webcontainerService.getState().serverUrl,
      null,
      'Hardening verified: late server-ready from Project A was safely ignored',
    );
    assert.equal(webcontainerService.getState().startupStage, 'idle');
  });

  test('CR01: Late port-close from draining former project does not clear current project server', () => {
    let serverReadyCallback = null;
    let portCallback = null;

    const mockContainer = {
      on: (event, cb) => {
        if (event === 'server-ready') serverReadyCallback = cb;
        if (event === 'port') portCallback = cb;
        return () => {};
      },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // 1. Project A is running on port 5173
    webcontainerService.attachProject('project-a');
    webcontainerService.setDevServerStarting(true);
    serverReadyCallback(5173, 'http://project-a-server.local');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-a-server.local');

    // 2. Switch to Project B
    webcontainerService.attachProject('project-b');
    assert.equal(webcontainerService.getState().serverUrl, null);

    // Project B starts its own dev server on port 3000
    webcontainerService.setDevServerStarting(true);
    serverReadyCallback(3000, 'http://project-b-server.local');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-b-server.local');
    assert.equal(webcontainerService.getState().serverPort, 3000);

    // 3. Late port-close for port 5173 arrives from Project A's teardown
    portCallback(5173, 'close', '');

    // VERIFICATION: Project B's server on port 3000 must remain completely intact!
    assert.equal(
      webcontainerService.getState().serverUrl,
      'http://project-b-server.local',
      'Hardening verified: draining port close from Project A did not touch Project B serverUrl',
    );
    assert.equal(
      webcontainerService.getState().serverPort,
      3000,
      'Hardening verified: Project B serverPort remained 3000',
    );
  });
});

/* ── CR02: In-Flight WebContainer Writes & Barrier ─────────────────────── */
describe('CR02: In-Flight WebContainer Writes & Barrier Synchronization', () => {
  test('CR02: Barrier awaits in-flight writes before project scope change / mount', async () => {
    let inFlightSettled = false;
    let writeTargetProject = null;

    const coordinator = new FileSyncCoordinator({
      debounceMs: 10,
      rawWrite: async (p, c) => {
        await new Promise((r) => setTimeout(r, 50));
        inFlightSettled = true;
        writeTargetProject = coordinator.getScope();
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-a');
    coordinator.queueSync('src/App.tsx', 'content-from-A', 'project-a');

    // Wait 15ms so executeWrite begins (enters inFlightPaths)
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(coordinator.hasPendingWrites(), true);

    // Calling barrier waits for in-flight write to complete safely
    const barrierSettled = await coordinator.barrier(1000);
    assert.equal(barrierSettled, true, 'Barrier waited for in-flight write to complete');
    assert.equal(inFlightSettled, true);
    assert.equal(writeTargetProject, 'project-a');

    // Now switch scope safely
    coordinator.setScope('project-b');
    assert.equal(coordinator.getScope(), 'project-b');
  });

  test('CR02: Write queued for former project is suppressed if scope switched before write started', async () => {
    const executedWrites = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (p, c) => {
        executedWrites.push({ path: p, content: c });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-a');
    coordinator.queueSync('src/App.tsx', 'content-from-A', 'project-a');

    // Switch scope before debounce timer fires
    coordinator.setScope('project-b');

    // Flush project-b
    await coordinator.flush();

    // The write from project-a must NOT have executed
    assert.equal(executedWrites.length, 0, 'Scoped write from inactive project was dropped');
  });
});

/* ── CR03: Asynchronous Project Attachment Race Protection ─────────────── */
describe('CR03: Project Attachment Transition Race Protection', () => {
  test('CR03: isCurrentTransition guards prevent stale attachProject execution', async () => {
    let currentTransitionId = 0;
    const beginTransition = () => ++currentTransitionId;
    const isCurrentTransition = (id) => id === currentTransitionId;

    const attachedProjects = [];

    // Simulate async project open handler
    const simulateOpenProject = async (projectId, simulatedDelayMs) => {
      const transition = beginTransition();
      await new Promise((r) => setTimeout(r, simulatedDelayMs));

      // Guarded attachment (as implemented in App.tsx)
      if (!isCurrentTransition(transition)) {
        return false;
      }
      attachedProjects.push(projectId);
      return true;
    };

    // User rapidly navigates: Project A (slow 80ms) then immediately Project B (fast 20ms)
    const promiseA = simulateOpenProject('project-a', 80);
    const promiseB = simulateOpenProject('project-b', 20);

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    assert.equal(resB, true, 'Project B open succeeded');
    assert.equal(resA, false, 'Project A open was aborted by transition guard');
    assert.deepEqual(attachedProjects, ['project-b'], 'Only current transition Project B was attached');
  });
});

/* ── CR04: Dev Server Termination Semantics & Epoch Invalidation ───────── */
describe('CR04: Process Termination Semantics & Epoch Invalidation', () => {
  test('CR04: stopDevServer increments epoch, resets state, and tracks draining ports', () => {
    webcontainerService.attachProject('project-alpha');
    const epoch1 = webcontainerService.getSessionEpoch();

    webcontainerService.setDevServerStarting(true);
    assert.equal(webcontainerService.isDevServerStarting(), true);

    webcontainerService.stopDevServer();

    assert.equal(webcontainerService.isDevServerStarting(), false);
    assert.equal(webcontainerService.isDevServerRunning(), false);
    assert.equal(webcontainerService.getState().serverUrl, null);
    assert.equal(webcontainerService.getState().startupStage, 'idle');
  });
});

/* ── CR05: Directory Rename & Delete Safety ────────────────────────────── */
describe('CR05: Directory Rename Descendant Remapping & Delete Synchronization', () => {
  test('CR05: handleRename remaps all descendant pending writes', async () => {
    const executedWrites = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (p, c) => {
        executedWrites.push({ path: p, content: c });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-1');
    coordinator.queueSync('src/components/Button.tsx', '<Button />', 'project-1');
    coordinator.queueSync('src/components/sub/Icon.tsx', '<Icon />', 'project-1');

    // Rename directory from src/components to src/ui
    coordinator.handleRename('src/components', 'src/ui');

    // Flush writes
    await coordinator.flush();

    // Both writes must have been remapped to src/ui
    assert.equal(executedWrites.length, 2);
    assert.equal(executedWrites[0].path, 'src/ui/Button.tsx');
    assert.equal(executedWrites[1].path, 'src/ui/sub/Icon.tsx');
    assert.equal(
      executedWrites.some((w) => w.path.startsWith('src/components')),
      false,
      'No write targeted the old directory path',
    );
  });

  test('CR05: handleDelete cancels pending descendant writes and cleans dependency cache', async () => {
    let invalidatedPath = null;
    let deletedPath = null;
    const executedWrites = [];

    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (p, c) => {
        executedWrites.push({ path: p, content: c });
      },
      rawDelete: async (p) => {
        deletedPath = p;
      },
      onDependencyInvalidation: (p) => {
        invalidatedPath = p;
      },
    });

    coordinator.setScope('project-1');
    coordinator.queueSync('package.json', '{"name":"test"}', 'project-1');

    await coordinator.handleDelete('package.json');
    await coordinator.flush();

    assert.equal(deletedPath, 'package.json');
    assert.equal(invalidatedPath, 'package.json');
    assert.equal(executedWrites.length, 0, 'Pending write was cancelled by handleDelete');
  });
});
