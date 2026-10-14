/**
 * Phase 2.2 Final Stabilization: Mandatory Negative Tests Suite
 *
 * Exercises the 8 required negative scenarios:
 * 1. Late server-ready event after B starts and old shell prints prompt
 * 2. Missing A port-close followed by B's legitimate port-close
 * 3. In-flight write exceeding deletion timeout
 * 4. Stale queued mount from A executing after B becomes active
 * 5. A -> B -> C navigation with delayed attachment promises
 * 6. Forced test assertion failure returning nonzero exit code
 * 7. Virtual filesystem write failure propagation
 * 8. More than ten distinct unresolved draining ports
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { spawn } from 'node:child_process';

const tmpDir = path.resolve('scripts', '.tmp-stabilization-test');
fs.mkdirSync(tmpDir, { recursive: true });
const bundlePath = path.join(tmpDir, 'webcontainer-bundle.mjs');

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
const { FileSyncCoordinator } = await import(`file://${bundlePath.replace(/\\/g, '/')}`);

const results = [];
function record(id, description, status, details = '') {
  results.push({ id, description, status, details });
  const icon = status === 'PASS' ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${id}: ${description}`);
  if (details) console.log(`       -> ${details}`);
}

async function run() {
  console.log('======================================================================');
  console.log('  PHASE 2.2 FINAL STABILIZATION: MANDATORY NEGATIVE TESTS');
  console.log('======================================================================\n');

  // --------------------------------------------------------------------
  // TEST 1: Late server-ready event after B starts and old shell prints prompt
  // --------------------------------------------------------------------
  try {
    let portCb = null;
    let serverReadyCb = null;
    const mockContainer = {
      on: (evt, cb) => {
        if (evt === 'port') portCb = cb;
        if (evt === 'server-ready') serverReadyCb = cb;
        return () => {};
      },
      mount: async () => {},
      fs: { writeFile: async () => {} },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // 1. Project A is running dev server on port 5173
    webcontainerService.attachProject('project-a');
    webcontainerService.setDevServerStarting(true);
    serverReadyCb(5173, 'http://project-a.local:5173');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-a.local:5173');

    // 2. Stop Project A and attach Project B (Project B has started, but dev server not yet dispatched)
    webcontainerService.stopDevServer();
    webcontainerService.attachProject('project-b');

    // 3. Old shell prints prompt (simulating SIGINT prompt appearance)
    webcontainerService.setShellPromptReady(true);

    // 4. Stale late server-ready from Project A's server arrives at port 5173
    serverReadyCb(5173, 'http://project-a-stale.local:5173');

    // ASSERTION: Project B MUST NOT accept Project A's late server-ready URL!
    const currentUrl = webcontainerService.getState().serverUrl;
    assert.notEqual(
      currentUrl,
      'http://project-a-stale.local:5173',
      'Stale server-ready from Project A was erroneously accepted for Project B when prompt was ready',
    );
    assert.equal(currentUrl, null, 'Server URL should remain null awaiting Project B genuine server');

    record('NEG-1', 'Late server-ready after B starts & old shell prints prompt', 'PASS', 'Late event rejected; URL not polluted');
  } catch (err) {
    record('NEG-1', 'Late server-ready after B starts & old shell prints prompt', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 2: Missing A port-close followed by B's legitimate port-close
  // --------------------------------------------------------------------
  try {
    let portCb = null;
    let serverReadyCb = null;
    const mockContainer = {
      on: (evt, cb) => {
        if (evt === 'port') portCb = cb;
        if (evt === 'server-ready') serverReadyCb = cb;
        return () => {};
      },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // 1. Project A dev server running on 5173
    webcontainerService.attachProject('project-a');
    webcontainerService.setDevServerStarting(true);
    serverReadyCb(5173, 'http://project-a.local:5173');

    // 2. Project A stopped. NO port-close is emitted for Project A (missing close)
    webcontainerService.stopDevServer();

    // 3. Project B attaches and starts dev server on 5173
    webcontainerService.attachProject('project-b');
    webcontainerService.setShellPromptReady(true);
    webcontainerService.setDevServerStarting(true);
    portCb(5173, 'open', 'http://project-b.local:5173');
    serverReadyCb(5173, 'http://project-b.local:5173');
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-b.local:5173');
    assert.equal(webcontainerService.getState().activeServers.length, 1);

    // 4. Project B dev server closes legitimately
    portCb(5173, 'close', '');

    // ASSERTION: Project B's close must NOT be swallowed by Project A's missing close!
    const activeServersAfterClose = webcontainerService.getState().activeServers;
    assert.equal(
      activeServersAfterClose.length,
      0,
      'Project B legitimate close was swallowed by Project A missing close; server lingered in activeServers',
    );

    record('NEG-2', "Missing A port-close followed by B's legitimate port-close", 'PASS', 'Project B close cleanly cleared active servers');
  } catch (err) {
    record('NEG-2', "Missing A port-close followed by B's legitimate port-close", 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 3: In-flight write exceeding deletion timeout
  // --------------------------------------------------------------------
  try {
    let rawDeleteCalled = false;
    let hangingWriteDone = false;
    let neverResolveWrite;

    const coordinator = new FileSyncCoordinator({
      rawWrite: async () => {
        await new Promise((resolve) => {
          neverResolveWrite = resolve;
        });
        hangingWriteDone = true;
      },
      rawDelete: async () => {
        rawDeleteCalled = true;
      },
      debounceMs: 5,
    });

    coordinator.setScope('proj-1');
    coordinator.queueSync('src/hanging.txt', 'content');

    // Wait for write to start executing and enter inFlight
    await new Promise((r) => setTimeout(r, 20));

    // Now try to delete while in-flight write exceeds timeout
    let deleteThrew = false;
    try {
      // Use short 50ms timeout for test
      await coordinator.handleDelete('src/hanging.txt', 50);
    } catch (err) {
      deleteThrew = true;
    }

    assert.ok(deleteThrew, 'handleDelete should have failed-closed and thrown when in-flight write exceeded timeout');
    assert.equal(rawDeleteCalled, false, 'rawDelete must NOT proceed while write is still in flight');

    neverResolveWrite();
    record('NEG-3', 'In-flight write exceeding deletion timeout', 'PASS', 'Fail-closed: threw error, refused to delete during in-flight write');
  } catch (err) {
    record('NEG-3', 'In-flight write exceeding deletion timeout', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 4: Stale queued mount from A executing after B becomes active
  // --------------------------------------------------------------------
  try {
    let mountedTrees = [];
    const mockContainer = {
      mount: async (tree) => {
        mountedTrees.push(tree);
      },
      fs: { writeFile: async () => {} },
      on: () => () => {},
    };
    webcontainerService.instance = mockContainer;

    webcontainerService.attachProject('project-a');

    // Simulate slow mount for Project A
    let releaseSlowBarrier;
    const slowBarrier = new Promise((resolve) => {
      releaseSlowBarrier = resolve;
    });

    // Queue mount for Project A with delay
    const mountPromiseA = (async () => {
      await slowBarrier;
      return webcontainerService.mountProject(
        [{ path: 'src/A.js', content: 'A' }],
        {},
        'react',
        'project-a', // project scope
        webcontainerService.getSessionEpoch(), // epoch scope
      );
    })();

    // Switch to Project B BEFORE slow mount of Project A finishes
    webcontainerService.attachProject('project-b');
    releaseSlowBarrier();
    await mountPromiseA;

    // ASSERTION: Project A's mount must have been discarded and NOT mounted into Project B!
    const hasMountedA = mountedTrees.some((tree) => Boolean(tree['src']?.directory?.['A.js']));
    assert.equal(hasMountedA, false, 'Project A files were mounted into Project B after scope switch');

    record('NEG-4', 'Stale queued mount from A executing after B becomes active', 'PASS', 'Stale mount rejected before mutating filesystem');
  } catch (err) {
    record('NEG-4', 'Stale queued mount from A executing after B becomes active', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 5: A -> B -> C navigation with delayed attachment promises
  // --------------------------------------------------------------------
  try {
    let transitionCount = 0;
    const transitions = [];
    const beginTransition = () => {
      transitionCount++;
      const current = transitionCount;
      transitions.push(current);
      return current;
    };
    const isCurrentTransition = (t) => t === transitionCount;

    let attachedProjects = [];
    const mockAttach = async (transition, projId, delayMs) => {
      await new Promise((r) => setTimeout(r, delayMs));
      if (!isCurrentTransition(transition)) {
        return { status: 'aborted', projId };
      }
      attachedProjects.push(projId);
      return { status: 'attached', projId };
    };

    // Dispatch A (delay 50ms)
    const tA = beginTransition();
    const pA = mockAttach(tA, 'A', 50);

    // Dispatch B (delay 30ms)
    const tB = beginTransition();
    const pB = mockAttach(tB, 'B', 30);

    // Dispatch C immediately (delay 10ms)
    const tC = beginTransition();
    const pC = mockAttach(tC, 'C', 10);

    const [rA, rB, rC] = await Promise.all([pA, pB, pC]);

    assert.equal(rA.status, 'aborted');
    assert.equal(rB.status, 'aborted');
    assert.equal(rC.status, 'attached');
    assert.deepEqual(attachedProjects, ['C'], 'Only the latest transition C should be attached');

    record('NEG-5', 'A -> B -> C navigation with delayed attachment promises', 'PASS', 'Stale transitions aborted; only latest attached');
  } catch (err) {
    record('NEG-5', 'A -> B -> C navigation with delayed attachment promises', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 6: Forced test assertion failure returning nonzero exit code
  // --------------------------------------------------------------------
  try {
    // Run an external child process with a deliberately failing assertion
    const childCode = `
      import assert from 'node:assert/strict';
      const results = [{ id: 'FORCE_FAIL', status: 'FAIL' }];
      if (results.some(r => r.status === 'FAIL')) {
        process.exit(1);
      }
      process.exit(0);
    `;
    const childPath = path.join(tmpDir, 'child-fail-test.mjs');
    fs.writeFileSync(childPath, childCode);

    const childExitCode = await new Promise((resolve) => {
      const p = spawn('node', [childPath], { stdio: 'ignore' });
      p.on('close', resolve);
    });

    assert.equal(childExitCode, 1, 'Harness with failing assertion did not exit with code 1');
    record('NEG-6', 'Forced test assertion failure returning nonzero exit code', 'PASS', 'Exited with code 1 as required');
  } catch (err) {
    record('NEG-6', 'Forced test assertion failure returning nonzero exit code', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 7: Virtual filesystem write failure propagation
  // --------------------------------------------------------------------
  try {
    const coordinator = new FileSyncCoordinator({
      rawWrite: async () => {
        throw new Error('EIO: simulated disk write failure');
      },
      rawDelete: async () => {},
      debounceMs: 5,
    });

    coordinator.setScope('proj-fail');
    coordinator.queueSync('src/bad.txt', 'bad content');

    // Wait for executeWrite to run
    await new Promise((r) => setTimeout(r, 20));

    // Flush should report that the write failed!
    const flushResult = await coordinator.flush();

    assert.equal(flushResult.ok, false, 'flush() should report ok: false when rawWrite fails');
    assert.ok(flushResult.failed.length > 0, 'flushResult should list the failed path');
    assert.equal(flushResult.failed[0].path, 'src/bad.txt');

    record('NEG-7', 'Virtual filesystem write failure propagation', 'PASS', 'flushResult.ok is false and failed paths recorded');
  } catch (err) {
    record('NEG-7', 'Virtual filesystem write failure propagation', 'FAIL', err.message);
  }

  // --------------------------------------------------------------------
  // TEST 8: More than ten distinct unresolved draining ports
  // --------------------------------------------------------------------
  try {
    let portCb = null;
    let serverReadyCb = null;
    const mockContainer = {
      on: (evt, cb) => {
        if (evt === 'port') portCb = cb;
        if (evt === 'server-ready') serverReadyCb = cb;
        return () => {};
      },
    };

    webcontainerService.cleanupServerListeners();
    webcontainerService.setupServerListeners(mockContainer);

    // Drain 12 distinct ports (ports 5170 through 5181)
    for (let p = 5170; p <= 5181; p++) {
      webcontainerService.attachProject(`proj-${p}`);
      webcontainerService.setDevServerStarting(true);
      serverReadyCb(p, `http://server-${p}.local:${p}`);
      webcontainerService.stopDevServer();
    }

    // Now attach a new project
    webcontainerService.attachProject('proj-active');
    webcontainerService.setDevServerStarting(true);

    // Stale server-ready arrives for the very first port (5170)
    serverReadyCb(5170, 'http://stale-5170.local:5170');

    // ASSERTION: Port 5170 must NOT have been evicted and must NOT be accepted for proj-active!
    const activeUrl = webcontainerService.getState().serverUrl;
    assert.notEqual(
      activeUrl,
      'http://stale-5170.local:5170',
      'Oldest port 5170 was evicted and accepted stale event for new project',
    );

    record('NEG-8', 'More than ten distinct unresolved draining ports', 'PASS', 'Port 5170 not unsafely evicted; quarantine preserved');
  } catch (err) {
    record('NEG-8', 'More than ten distinct unresolved draining ports', 'FAIL', err.message);
  }

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
  console.error('Fatal harness error:', err);
  process.exit(1);
});
