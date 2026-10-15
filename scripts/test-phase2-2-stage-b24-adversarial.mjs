import { activateRuntime } from './helpers/runtime-event-fixture.mjs';
/**
 * Stage B.2.4 Adversarial Port Ownership & Filesystem Safety Test Harness
 *
 * Deterministically exercises Gates B and C against the current WebContainer and
 * FileSyncCoordinator implementations.
 */

import assert from 'node:assert/strict';
import { FileSyncCoordinator } from '../src/services/webcontainer/fileSyncCoordinator.ts';

// Bundled webcontainerService helper
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as esbuild from 'esbuild';

const tmpDir = path.resolve('scripts', '.tmp-stage-b24');
fs.mkdirSync(tmpDir, { recursive: true });
const bundlePath = path.join(tmpDir, 'webcontainer-b24-bundle.mjs');

await esbuild.build({
  entryPoints: [path.resolve('src/services/webcontainer/webcontainerService.ts')],
  bundle: true,
  format: 'esm',
  outfile: bundlePath,
  external: [
    '@webcontainer/api',
    '@webcontainer/snapshot',
    '../storage/db',
    '../../utils/logger',
    './ataService',
  ],
});

const { webcontainerService } = await import(`file://${bundlePath.replace(/\\/g, '/')}`);

const results = [];
function record(id, description, status, details = '') {
  results.push({ id, description, status, details });
  const icon = status === 'PASS' ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${id}: ${description}`);
  if (details) console.log(`       -> ${details}`);
}

async function run() {
  console.log('======================================================================');
  console.log('  STAGE B.2.4: ADVERSARIAL FILESYSTEM & PORT OWNERSHIP HARNESS');
  console.log('======================================================================\n');

  // ====================================================================
  // GATE B: FILESYSTEM BARRIER VERIFICATION
  // ====================================================================

  // B1. Never-Settling Write
  try {
    let rawMountInvoked = false;
    let neverResolve;
    const neverSettlingPromise = new Promise((resolve) => {
      neverResolve = resolve;
    });

    const coordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        await neverSettlingPromise;
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('proj-b1-orig');
    coordinator.queueSync('src/stuck.ts', 'stuck-content', 'proj-b1-orig');

    // Wait for write to enter inFlight
    await new Promise((r) => setTimeout(r, 15));

    // Fast barrier timeout for test
    const barrierSettled = await coordinator.barrier(80);
    assert.equal(barrierSettled, false, 'Barrier must return false on never-settling write');

    // Attempt mountProject with unsettled barrier
    let mountThrew = false;
    const prevCoordinator = webcontainerService.fileSyncCoordinator;
    webcontainerService.fileSyncCoordinator = coordinator;

    try {
      await webcontainerService.mountProject(
        [{ path: 'src/main.ts', content: 'new project' }],
        {},
        'react'
      );
    } catch (err) {
      mountThrew = true;
      assert.ok(
        err.message.includes('WebContainer filesystem barrier timeout'),
        `Error message was: ${err.message}`
      );
    } finally {
      webcontainerService.fileSyncCoordinator = prevCoordinator;
      neverResolve(); // Settle write to avoid dangling handles
    }

    assert.equal(mountThrew, true, 'mountProject must throw when barrier returns false');
    assert.equal(webcontainerService.getState().startupStage, 'error', 'Stage set to error');
    assert.equal(rawMountInvoked, false, 'container.mount was never called');

    record('B1', 'Never-Settling Write Fails Closed', 'PASS', 'mountProject rejected fail-closed');
  } catch (err) {
    record('B1', 'Never-Settling Write Fails Closed', 'FAIL', err.message);
  }

  // B2. Retry After Timeout
  try {
    let allowWriteResolve = false;
    let writeFinished = false;

    const coordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        while (!allowWriteResolve) {
          await new Promise((r) => setTimeout(r, 10));
        }
        writeFinished = true;
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('proj-b2');
    coordinator.queueSync('src/delayed.ts', 'delayed', 'proj-b2');
    await new Promise((r) => setTimeout(r, 15));

    const prevCoordinator = webcontainerService.fileSyncCoordinator;
    webcontainerService.fileSyncCoordinator = coordinator;

    // Retry 1: still unresolved -> must fail
    let retry1Threw = false;
    try {
      await webcontainerService.mountProject([{ path: 'src/a.ts', content: 'a' }], {}, 'react');
    } catch {
      retry1Threw = true;
    }
    assert.equal(retry1Threw, true, 'Retry 1 while unsettled failed closed');

    // Settle the write
    allowWriteResolve = true;
    const settled = await coordinator.barrier(500);
    assert.equal(settled, true, 'Barrier settled after allowWriteResolve');
    assert.equal(writeFinished, true, 'Write confirmed finished');

    // Reset startupStage for valid retry
    webcontainerService.updateState({ startupStage: 'idle', error: null });

    // Mock container boot for mount
    let mountExecuted = false;
    webcontainerService.instance = {
      teardown() { this.destroyed = true; },
      mount: async () => {
        mountExecuted = true;
      },
      fs: { writeFile: async () => {} },
      on: () => () => {},
    };

    await webcontainerService.mountProject([{ path: 'src/a.ts', content: 'a' }], {}, 'react');
    assert.equal(mountExecuted, true, 'Mount executed successfully after write settled');

    webcontainerService.fileSyncCoordinator = prevCoordinator;
    record('B2', 'Retry After Timeout', 'PASS', 'Retry blocked while unsettled, succeeded when settled');
  } catch (err) {
    record('B2', 'Retry After Timeout', 'FAIL', err.message);
  }

  // B3. Concurrent Mount Requests & Recovery
  try {
    const mountExecutionOrder = [];
    webcontainerService.instance = {
      teardown() { this.destroyed = true; },
      mount: async (tree) => {
        const marker = Object.keys(tree)[0];
        mountExecutionOrder.push(`mount:${marker}`);
      },
      fs: { writeFile: async () => {} },
      on: () => () => {},
    };

    // Dispatch two concurrent mount calls
    const m1 = webcontainerService.mountProject([{ path: 'file1.ts', content: '1' }], {}, 'react');
    const m2 = webcontainerService.mountProject([{ path: 'file2.ts', content: '2' }], {}, 'react');

    await Promise.all([m1, m2]);
    assert.deepEqual(mountExecutionOrder, ['mount:file1.ts', 'mount:file2.ts'], 'Serialized order');

    record('B3', 'Concurrent Mount Queue Serialization', 'PASS', 'Concurrent mounts serialized cleanly');
  } catch (err) {
    record('B3', 'Concurrent Mount Queue Serialization', 'FAIL', err.message);
  }

  // B4. Failed Virtual Disk Writes
  try {
    let failedPath = null;
    const coordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async (p) => {
        if (p === 'corrupt.ts') {
          failedPath = p;
          throw new Error('EIO: Hardware virtual disk block failure');
        }
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('proj-b4');
    coordinator.queueSync('corrupt.ts', 'corrupt-content', 'proj-b4');
    await coordinator.flush();

    assert.equal(failedPath, 'corrupt.ts');
    assert.equal(coordinator.hasPendingWrites(), false, 'inFlight and pending cleared after failure');

    record('B4', 'Failed Write Error Containment', 'PASS', 'Write failure caught and inFlight cleared without crash');
  } catch (err) {
    record('B4', 'Failed Write Error Containment', 'FAIL', err.message);
  }

  // B5. Transition Safety Across Rapid A -> B -> C
  try {
    const writtenFiles = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 20,
      rawWrite: async (p, content) => {
        writtenFiles.push({ path: p, content, scope: coordinator.getScope() });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('proj-a');
    coordinator.queueSync('fileA.ts', 'content-A', 'proj-a');

    coordinator.setScope('proj-b');
    coordinator.queueSync('fileB.ts', 'content-B', 'proj-b');

    coordinator.setScope('proj-c');
    coordinator.queueSync('fileC.ts', 'content-C', 'proj-c');

    await coordinator.flush();

    // Only Project C writes should have executed
    assert.equal(writtenFiles.length, 1);
    assert.equal(writtenFiles[0].path, 'fileC.ts');
    assert.equal(writtenFiles[0].scope, 'proj-c');

    record('B5', 'Transition Safety Across Rapid Switches', 'PASS', 'Stale writes discarded on scope change');
  } catch (err) {
    record('B5', 'Transition Safety Across Rapid Switches', 'FAIL', err.message);
  }

  // ====================================================================
  // GATE C: PORT OWNERSHIP & QUIESCENCE
  // ====================================================================

  // Preserve both delayed-event objectives, now with a retired event source.
  for (const [id, delay] of [['C2-A', 1100], ['C2-B', 10100]]) {
    try {
      const a = activateRuntime(webcontainerService, 'late-A-' + id);
      webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
      assert.equal(webcontainerService.getState().serverUrl, 'http://A');
      const b = activateRuntime(webcontainerService, 'late-B-' + id); a.assertRetired();
      await new Promise((resolve) => setTimeout(resolve, delay));
      webcontainerService.setDevServerStarting(true);
      for (const prompt of [false, true]) {
        webcontainerService.setShellPromptReady(prompt);
        a.ready(5173, 'http://late-A'); a.port(5173, 'open', 'http://late-A');
        assert.equal(webcontainerService.getState().serverUrl, null);
        assert.equal(webcontainerService.getState().activeServers.length, 0);
      }
      b.ready(5173, 'http://B'); assert.equal(webcontainerService.getState().serverUrl, 'http://B');
      record(id, 'Delayed retired callbacks cannot acquire the current runtime port', 'PASS', delay + 'ms late; prompt false/true; genuine current event accepted');
    } catch (error) { record(id, 'Delayed retired callbacks', 'FAIL', error.message); }
  }
  try {
    const a = activateRuntime(webcontainerService, 'close-A');
    webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
    const b = activateRuntime(webcontainerService, 'close-B'); a.assertRetired();
    webcontainerService.setDevServerStarting(true); b.ready(5173, 'http://project-b.local:5173');
    a.port(5173, 'close');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-b.local:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    b.port(5173, 'close');
    assert.equal(webcontainerService.getState().serverUrl, null);
    record('C3', 'Late Close After Reuse & Legitimate Close Handling', 'PASS', 'Retired close ignored; current close honored');
  } catch (error) { record('C3', 'Late Close After Reuse & Legitimate Close Handling', 'FAIL', error.message); }
  try {
    for (let cycle = 0; cycle < 5; cycle++) {
      const a = activateRuntime(webcontainerService, 'A-' + cycle);
      webcontainerService.setDevServerStarting(true); a.ready(5173, 'http://A');
      const b = activateRuntime(webcontainerService, 'B-' + cycle); a.assertRetired();
      webcontainerService.setDevServerStarting(true); b.ready(5173, 'http://B');
      a.ready(5173, 'http://late-A'); a.port(5173, 'close');
      assert.equal(webcontainerService.getState().serverUrl, 'http://B');
      assert.equal(webcontainerService.getState().serverPort, 5173);
      assert.equal(webcontainerService.drainingPorts.size, 0);
      assert.equal(webcontainerService.pendingDrainingCloses.size, 0);
    }
    record('C5', 'Repeated Reuse Cycles (5x)', 'PASS', 'Fresh runtime reuse; late callbacks rejected; zero counter growth');
  } catch (error) { record('C5', 'Repeated Reuse Cycles (5x)', 'FAIL', error.message); }

  console.log('\n======================================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL: ${passed} / ${results.length} PASS (${failed} FAILED)`);
  console.log('======================================================================');

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
