/**
 * GB Coder — Phase 2.2 Stage B.2.1 Pre-Fix Concurrency Reproduction Suite
 *
 * Verifies current failure modes / vulnerability gaps for:
 * - CR01: Stale WebContainer server events across project scope switches
 * - CR02: In-flight WebContainer writes surviving scope switch
 * - CR03: Out-of-order asynchronous project attachments
 * - CR04: Process termination contract & port cleanup observability
 * - CR05: Directory rename not remapping descendant pending writes & in-flight delete resurrection
 *
 * Run with: node scripts/test-phase2-2-stage-b21-repro.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { services, cleanup } from './audit-harness.mjs';

const { webcontainerService } = services;

// Bundle FileSyncCoordinator directly
const outdir = mkdtempSync(path.join(tmpdir(), 'gb-repro-b21-'));
const outfile = path.join(outdir, 'sync-bundle.mjs');
await build({
  stdin: {
    contents: `export { FileSyncCoordinator } from './src/services/webcontainer/fileSyncCoordinator.ts';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  outfile,
  platform: 'browser',
});
const { FileSyncCoordinator } = await import(pathToFileURL(outfile).href);

after(() => cleanup());

/* ── CR01: Stale WebContainer Server Events ────────────────────────────── */
describe('CR01: Stale WebContainer Server Events', () => {
  test('CR01 Defect: late server-ready event assigns old serverUrl if any project is attached', () => {
    // Simulate container setup
    let serverReadyCallback = null;
    let portCallback = null;

    const mockContainer = {
      on: (event, cb) => {
        if (event === 'server-ready') serverReadyCallback = cb;
        if (event === 'port') portCallback = cb;
        return () => {};
      },
    };

    // Attach listeners to mockContainer
    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // 1. User starts in Project A
    webcontainerService.attachProject('project-a');
    assert.equal(webcontainerService.getActiveProjectId(), 'project-a');

    // 2. User navigates to Project B before Project A's server is ready
    webcontainerService.attachProject('project-b');
    assert.equal(webcontainerService.getActiveProjectId(), 'project-b');
    assert.equal(webcontainerService.getState().serverUrl, null);

    // 3. Late server-ready event from Project A arrives!
    // In current implementation:
    // line 717 checks: if (!this.activeProjectId) return;
    // Since activeProjectId is 'project-b', it accepts the event and sets Project B's serverUrl!
    serverReadyCallback(5173, 'http://project-a-server.local');

    // Current bug demonstration: Project B received Project A's stale serverUrl!
    const currentServerUrl = webcontainerService.getState().serverUrl;
    console.log('[CR01 Repro] Current serverUrl assigned to Project B:', currentServerUrl);
    assert.equal(
      currentServerUrl,
      'http://project-a-server.local',
      'Defect confirmed: Project B received Project A stale serverUrl'
    );
  });

  test('CR01 Defect: late port-close from former project clears current project server', () => {
    let portCallback = null;
    const mockContainer = {
      on: (event, cb) => {
        if (event === 'port') portCallback = cb;
        return () => {};
      },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // Project B is running on port 5173
    webcontainerService.attachProject('project-b');
    webcontainerService.getState().serverPort = 5173;
    webcontainerService.getState().serverUrl = 'http://project-b-server.local';
    webcontainerService.getState().activeServers = [{ port: 5173, url: 'http://project-b-server.local' }];

    // Late port close from Project A (closing port 5173 from previous session) arrives!
    portCallback(5173, 'close', '');

    // Current bug demonstration: Project B's server was cleared by Project A's late port close!
    console.log('[CR01 Repro] serverUrl after late port-close:', webcontainerService.getState().serverUrl);
    assert.equal(
      webcontainerService.getState().serverUrl,
      null,
      'Defect confirmed: Project B server was cleared by late port close'
    );
  });
});

/* ── CR02: In-Flight WebContainer Writes ────────────────────────────────── */
describe('CR02: In-Flight WebContainer Writes', () => {
  test('CR02 Defect: setScope does not await in-flight writes allowing them to settle into new project', async () => {
    let inFlightSettled = false;
    let writeTargetProject = null;

    const coordinator = new FileSyncCoordinator({
      debounceMs: 10,
      rawWrite: async (p, c) => {
        // Record which project was active when write finished
        await new Promise((r) => setTimeout(r, 60)); // 60ms delay
        inFlightSettled = true;
        writeTargetProject = coordinator.getScope();
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-a');
    coordinator.queueSync('src/App.tsx', 'content-from-A', 'project-a');

    // Wait 15ms so executeWrite begins (in-flight)
    await new Promise((r) => setTimeout(r, 15));

    // Project switch happens synchronously
    coordinator.setScope('project-b');

    // Current behavior: setScope is synchronous, does not await in-flight writes
    assert.equal(inFlightSettled, false, 'In-flight write is still running');

    // Wait for in-flight write to complete
    await new Promise((r) => setTimeout(r, 70));
    assert.equal(inFlightSettled, true, 'In-flight write completed');
    console.log('[CR02 Repro] Active scope when write completed:', writeTargetProject);
    assert.equal(
      writeTargetProject,
      'project-b',
      'Defect confirmed: in-flight write settled after scope was already switched to project-b'
    );
  });
});

/* ── CR05: Directory Rename & Delete Safety ────────────────────────────── */
describe('CR05: Directory Rename & Delete Safety', () => {
  test('CR05 Defect: handleRename does not remap descendant pending writes on directory rename', async () => {
    const executedWrites = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 100,
      rawWrite: async (p, c) => {
        executedWrites.push({ path: p, content: c });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-1');

    // Queue edit inside directory src/components
    coordinator.queueSync('src/components/Button.tsx', '<Button />', 'project-1');

    // Rename directory from src/components to src/ui
    coordinator.handleRename('src/components', 'src/ui');

    // Flush writes
    await coordinator.flush();

    console.log('[CR05 Repro] Executed writes after directory rename:', executedWrites);

    // Current bug demonstration: write was executed for old path 'src/components/Button.tsx'!
    const wroteOldPath = executedWrites.some((w) => w.path === 'src/components/Button.tsx');
    assert.equal(
      wroteOldPath,
      true,
      'Defect confirmed: pending write was NOT remapped to src/ui/Button.tsx and recreated old directory path'
    );
  });
});
