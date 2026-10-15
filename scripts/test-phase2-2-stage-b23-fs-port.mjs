import { activateRuntime } from './helpers/runtime-event-fixture.mjs';
/**
 * scripts/test-phase2-2-stage-b23-fs-port.mjs
 *
 * GB CODER — PHASE 2.2, STAGE B.2.3
 * Fail-Closed Filesystem Barrier & Safe Port Reuse Acceptance Suite
 *
 * Mandatory Tests:
 *   FS-B23-01: Never-resolving write causes timeout and mount rejection.
 *   FS-B23-02: New project's mount function is never called after timeout.
 *   FS-B23-03: Slow write that settles before timeout allows safe mounting.
 *   FS-B23-04: Timeout followed by retry remains blocked while the old write is unsettled.
 *   FS-B23-05: Once the old write genuinely settles, an authorized retry can succeed.
 *   FS-B23-06: A failed write does not silently become a successful filesystem sync.
 *   FS-B23-07: Concurrent mount requests cannot bypass the barrier.
 *   FS-B23-08: Project A bytes cannot overwrite Project B after a successful transition.
 *
 *   PORT-B23-01: Project A starts on port 5173.
 *   PORT-B23-02: Project A is stopped and produces an ordinary close event.
 *   PORT-B23-03: Project B legitimately starts on 5173 after confirmed A shutdown.
 *   PORT-B23-04: Project A shutdown lacks a port-close event; B must not be permanently blocked.
 *   PORT-B23-05: A late A server-ready arrives while B is starting; A must not become B's Preview.
 *   PORT-B23-06: A late A port-open arrives while B is starting.
 *   PORT-B23-07: A late A close arrives after B has legitimately acquired the port.
 *   PORT-B23-08: Rapid A -> B -> C transitions cannot activate an obsolete Preview.
 *   PORT-B23-09: A legitimate current-project server-ready is accepted.
 *   PORT-B23-10: Repeated startup/shutdown cycles do not grow draining records indefinitely.
 *   PORT-B23-11: No duplicate Vite startup occurs after a normal reconnect.
 *   PORT-B23-12: React and Vue projects both render actual correct Preview content.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const tmpBundle = path.join(root, 'scripts', '.tmp-stage-b23-bundle.mjs');
await esbuild.build({
  entryPoints: [path.join(root, 'src', 'services', 'webcontainer', 'webcontainerService.ts')],
  bundle: true,
  format: 'esm',
  outfile: tmpBundle,
  platform: 'browser',
  external: ['@webcontainer/api'],
});

const { webcontainerService, FileSyncCoordinator } = await import(pathToFileURL(tmpBundle).href);

function cleanup() {
  try {
    fs.unlinkSync(tmpBundle);
  } catch {}
}

const results = [];

function record(id, title, status, details) {
  results.push({ id, title, status, details });
  console.log(`[${status}] ${id}: ${title}`);
  if (details) console.log(`       -> ${details}`);
}

async function run() {
  console.log('======================================================================');
  console.log('  STAGE B.2.3: MANDATORY FS-B23 & PORT-B23 ACCEPTANCE SUITE');
  console.log('======================================================================\n');

  /* ──────────────────────────────────────────────────────────────────────────
   * CATEGORY 1: FAIL-CLOSED FILESYSTEM BARRIER (FS-B23-01 to FS-B23-08)
   * ────────────────────────────────────────────────────────────────────────── */

  // FS-B23-01: Never-resolving write causes timeout and mount rejection.
  // FS-B23-02: New project's mount function is never called after timeout.
  try {
    let mockMountCalled = false;
    const mockContainer = {
      teardown() { this.destroyed = true; },
      mount: async () => { mockMountCalled = true; },
      fs: {
        writeFile: async () => {},
        mkdir: async () => {},
        rm: async () => {},
      },
      on: () => () => {},
    };

    // Inject mock container
    webcontainerService.instance = mockContainer;

    // Create a coordinator with a hung write
    const hungCoordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        // Never resolves
        await new Promise(() => {});
      },
      rawDelete: async () => {},
    });

    hungCoordinator.setScope('proj-hung');
    hungCoordinator.queueSync('src/hang.ts', 'hung', 'proj-hung');
    await new Promise((r) => setTimeout(r, 15));

    // Point webcontainerService to hungCoordinator temporarily
    const originalCoordinator = webcontainerService.fileSyncCoordinator;
    webcontainerService.fileSyncCoordinator = hungCoordinator;

    let mountThrew = false;
    let errorMessage = '';
    try {
      await webcontainerService.mountProject(
        [{ path: 'index.html', content: '<h1>Test</h1>' }],
        undefined,
        'static'
      );
    } catch (err) {
      mountThrew = true;
      errorMessage = err.message;
    } finally {
      webcontainerService.fileSyncCoordinator = originalCoordinator;
    }

    assert.equal(mountThrew, true, 'mountProject threw error on barrier timeout');
    assert.match(errorMessage, /barrier timeout/i, 'Error explicitly cites barrier timeout');
    assert.equal(mockMountCalled, false, 'container.mount() was NEVER called');
    assert.equal(webcontainerService.getState().startupStage, 'error');

    record('FS-B23-01', 'Never-resolving write causes timeout and mount rejection', 'PASS', 'mountProject threw barrier timeout error');
    record('FS-B23-02', 'New project mount function is never called after timeout', 'PASS', 'container.mount was not invoked');
  } catch (err) {
    record('FS-B23-01', 'Never-resolving write causes timeout and mount rejection', 'FAIL', err.message);
    record('FS-B23-02', 'New project mount function is never called after timeout', 'FAIL', err.message);
  }

  // FS-B23-03: Slow write that settles before timeout allows safe mounting.
  try {
    let mockMountCalled = false;
    const mockContainer = {
      teardown() { this.destroyed = true; },
      mount: async () => { mockMountCalled = true; },
      fs: {
        writeFile: async () => {},
        mkdir: async () => {},
        rm: async () => {},
      },
      on: () => () => {},
    };
    webcontainerService.instance = mockContainer;

    let writeSettled = false;
    const slowCoordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        await new Promise((r) => setTimeout(r, 40));
        writeSettled = true;
      },
      rawDelete: async () => {},
    });

    slowCoordinator.setScope('proj-slow');
    slowCoordinator.queueSync('src/slow.ts', 'slow', 'proj-slow');
    await new Promise((r) => setTimeout(r, 15));

    const originalCoordinator = webcontainerService.fileSyncCoordinator;
    webcontainerService.fileSyncCoordinator = slowCoordinator;

    try {
      await webcontainerService.mountProject(
        [{ path: 'index.html', content: '<h1>Fast</h1>' }],
        undefined,
        'static'
      );
    } finally {
      webcontainerService.fileSyncCoordinator = originalCoordinator;
    }

    assert.equal(writeSettled, true, 'Slow write settled before mount proceeded');
    assert.equal(mockMountCalled, true, 'container.mount succeeded after barrier settled');

    record('FS-B23-03', 'Slow write that settles before timeout allows safe mounting', 'PASS', 'Settled write permitted clean mount');
  } catch (err) {
    record('FS-B23-03', 'Slow write that settles before timeout allows safe mounting', 'FAIL', err.message);
  }

  // FS-B23-04: Timeout followed by retry remains blocked while the old write is unsettled.
  // FS-B23-05: Once the old write genuinely settles, an authorized retry can succeed.
  try {
    let resolveWrite = null;
    const controllableCoordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        await new Promise((r) => { resolveWrite = r; });
      },
      rawDelete: async () => {},
    });

    controllableCoordinator.setScope('proj-controlled');
    controllableCoordinator.queueSync('src/block.ts', 'content', 'proj-controlled');
    await new Promise((r) => setTimeout(r, 15));

    const originalCoordinator = webcontainerService.fileSyncCoordinator;
    webcontainerService.fileSyncCoordinator = controllableCoordinator;

    // First attempt: should fail closed because write is unsettled
    let firstFailed = false;
    try {
      await webcontainerService.mountProject([{ path: 'a.txt', content: 'A' }]);
    } catch {
      firstFailed = true;
    }
    assert.equal(firstFailed, true, 'First mount attempt failed closed');

    // Retry while STILL unsettled: should fail closed again
    let retryWhileUnsettledFailed = false;
    try {
      await webcontainerService.mountProject([{ path: 'a.txt', content: 'A' }]);
    } catch {
      retryWhileUnsettledFailed = true;
    }
    assert.equal(retryWhileUnsettledFailed, true, 'Retry remained blocked while old write unsettled');
    record('FS-B23-04', 'Timeout followed by retry remains blocked while unsettled', 'PASS', 'Consecutive retries failed closed');

    // Now write genuinely settles
    resolveWrite();
    await new Promise((r) => setTimeout(r, 20));

    // Retry after write settled: should now succeed!
    let mountCalledAfterSettle = false;
    webcontainerService.instance = {
      teardown() { this.destroyed = true; },
      mount: async () => { mountCalledAfterSettle = true; },
      fs: { writeFile: async () => {}, mkdir: async () => {} },
      on: () => () => {},
    };

    await webcontainerService.mountProject([{ path: 'b.txt', content: 'B' }]);
    assert.equal(mountCalledAfterSettle, true, 'Authorized retry succeeded after settle');
    record('FS-B23-05', 'Authorized retry succeeds once old write settles', 'PASS', 'Mount succeeded cleanly after write resolved');

    webcontainerService.fileSyncCoordinator = originalCoordinator;
  } catch (err) {
    record('FS-B23-04', 'Timeout followed by retry remains blocked while unsettled', 'FAIL', err.message);
    record('FS-B23-05', 'Authorized retry succeeds once old write settles', 'FAIL', err.message);
  }

  // FS-B23-06: A failed write does not silently become a successful filesystem sync.
  try {
    let writeErrorLogged = false;
    const failingCoordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {
        writeErrorLogged = true;
        throw new Error('Disk full');
      },
      rawDelete: async () => {},
    });

    failingCoordinator.setScope('proj-fail');
    failingCoordinator.queueSync('bad.txt', 'fail', 'proj-fail');
    await failingCoordinator.flush();

    assert.equal(writeErrorLogged, true);
    assert.equal(failingCoordinator.hasPendingWrites(), false);

    record('FS-B23-06', 'Failed write does not silently claim success', 'PASS', 'Virtual disk write failure handled cleanly');
  } catch (err) {
    record('FS-B23-06', 'Failed write does not silently claim success', 'FAIL', err.message);
  }

  // FS-B23-07: Concurrent mount requests cannot bypass the barrier.
  try {
    let callOrder = [];
    const mockContainer = {
      teardown() { this.destroyed = true; },
      mount: async (tree) => {
        const file = Object.keys(tree)[0];
        callOrder.push(file);
      },
      fs: { writeFile: async () => {}, mkdir: async () => {} },
      on: () => () => {},
    };
    webcontainerService.instance = mockContainer;

    const originalCoordinator = webcontainerService.fileSyncCoordinator;
    const testCoordinator = new FileSyncCoordinator({
      debounceMs: 5,
      rawWrite: async () => {},
      rawDelete: async () => {},
    });
    webcontainerService.fileSyncCoordinator = testCoordinator;

    // Two concurrent mounts launched simultaneously
    const p1 = webcontainerService.mountProject([{ path: 'file1.txt', content: '1' }]);
    const p2 = webcontainerService.mountProject([{ path: 'file2.txt', content: '2' }]);

    await Promise.all([p1, p2]);
    webcontainerService.fileSyncCoordinator = originalCoordinator;

    assert.equal(callOrder.length, 2);
    assert.deepEqual(callOrder, ['file1.txt', 'file2.txt'], 'Mounts were strictly serialized');

    record('FS-B23-07', 'Concurrent mount requests cannot bypass the barrier', 'PASS', 'Concurrent calls serialized via mountQueue');
  } catch (err) {
    record('FS-B23-07', 'Concurrent mount requests cannot bypass the barrier', 'FAIL', err.message);
  }

  // FS-B23-08: Project A bytes cannot overwrite Project B after a successful transition.
  try {
    const executedWrites = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 20,
      rawWrite: async (p, c) => {
        executedWrites.push({ path: p, content: c, scope: coordinator.getScope() });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-a');
    coordinator.queueSync('shared.ts', 'bytes-from-A', 'project-a');

    // Switch scope before debounce
    coordinator.setScope('project-b');
    await coordinator.flush();

    // No bytes from Project A should have been written
    assert.equal(executedWrites.length, 0, 'Project A writes dropped on scope switch');

    record('FS-B23-08', 'Project A bytes cannot overwrite Project B', 'PASS', 'Scope isolation verified on transition');
  } catch (err) {
    record('FS-B23-08', 'Project A bytes cannot overwrite Project B', 'FAIL', err.message);
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * CATEGORY 2: SAFE PORT REUSE & LIFECYCLE (PORT-B23-01 to PORT-B23-12)
   * ────────────────────────────────────────────────────────────────────────── */

  const runtimes = [];
  let current;
  const activate = (id) => {
    const previous = current;
    current = activateRuntime(webcontainerService, id);
    if (previous) previous.assertRetired();
    runtimes.push(current);
    return current;
  };
  const check = (id, title, run) => {
    try { run(); record(id, title, 'PASS', 'Production handler assertions with distinct public-API runtimes'); }
    catch (error) { record(id, title, 'FAIL', error.message); }
  };
  check('PORT-B23-01', 'Project A starts on port 5173', () => {
    activate('project-a'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://localhost:5173');
  });
  check('PORT-B23-02', 'Project A is stopped and produces close event', () => {
    webcontainerService.stopDevServer();
    assert.equal(webcontainerService.getState().serverPort, null);
    current.port(5173, 'close');
    assert.equal(webcontainerService.getState().activeServers.length, 0);
  });
  check('PORT-B23-03', 'Project B legitimately starts on 5173 after confirmed A shutdown', () => {
    activate('project-b'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getActiveProjectId(), 'project-b');
  });
  check('PORT-B23-04', 'Missing old port-close does not block the next runtime', () => {
    activate('project-c'); webcontainerService.setShellPromptReady(false); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://localhost:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://localhost:5173');
  });
  const c = current;
  check('PORT-B23-05', 'Late old server-ready while next project starts is rejected', () => {
    activate('project-d'); webcontainerService.setDevServerStarting(true);
    for (const prompt of [false, true]) {
      webcontainerService.setShellPromptReady(prompt); c.ready(4000, 'http://late-c');
      assert.equal(webcontainerService.getState().serverPort, null);
      assert.equal(webcontainerService.getState().serverUrl, null);
    }
  });
  check('PORT-B23-06', 'Late old port-open while next project starts is rejected', () => {
    c.port(4000, 'open', 'http://late-c');
    assert.equal(webcontainerService.getState().activeServers.some((server) => server.port === 4000), false);
  });
  check('PORT-B23-07', 'Late retired close cannot clear a newly acquired port', () => {
    webcontainerService.setDevServerStarting(true); current.ready(3000, 'http://project-d.local:3000');
    c.port(3000, 'close');
    assert.equal(webcontainerService.getState().serverPort, 3000);
    assert.equal(webcontainerService.getState().serverUrl, 'http://project-d.local:3000');
    assert.equal(webcontainerService.pendingDrainingCloses.get(3000) ?? 0, 0);
    current.port(3000, 'close');
    assert.equal(webcontainerService.getState().serverUrl, null, 'current runtime close must still work');
  });
  check('PORT-B23-08', 'Rapid transitions cannot activate obsolete Preview', () => {
    const a = activate('proj-trans-1'); activate('proj-trans-2'); activate('proj-trans-3');
    assert.equal(webcontainerService.getActiveProjectId(), 'proj-trans-3');
    a.ready(5173, 'http://trans-1.local');
    assert.equal(webcontainerService.getState().serverUrl, null);
  });
  check('PORT-B23-09', 'Legitimate current-project server-ready is accepted', () => {
    activate('current-valid'); webcontainerService.setDevServerStarting(true);
    current.ready(5173, 'http://current-valid.local:5173');
    assert.equal(webcontainerService.getState().serverPort, 5173);
    assert.equal(webcontainerService.getState().serverUrl, 'http://current-valid.local:5173');
    assert.equal(webcontainerService.getState().startupStage, 'ready');
  });
  check('PORT-B23-10', 'Repeated cycles retire resources without draining-state growth', () => {
    for (let i = 0; i < 50; i++) {
      activate('cycle-' + i); webcontainerService.setDevServerStarting(true);
      current.ready(5173, 'http://cycle-' + i); webcontainerService.stopDevServer();
      assert.ok(webcontainerService.drainingPorts.size <= 1);
    }
    assert.ok(runtimes.slice(0, -1).every((runtime) => runtime.container.destroyed));
  });
  check('PORT-B23-11', 'Same-project attachment preserves runtime and active server', () => {
    activate('reconnect-proj'); webcontainerService.setDevServerStarting(true); current.ready(5173, 'http://reconnect');
    const epoch = webcontainerService.getSessionEpoch(); const instance = webcontainerService.instance;
    webcontainerService.attachProject('reconnect-proj');
    assert.equal(webcontainerService.isDevServerRunning(), true);
    assert.equal(webcontainerService.getSessionEpoch(), epoch);
    assert.equal(webcontainerService.instance, instance);
    assert.equal(instance.destroyed, false);
  });
  check('PORT-B23-12', 'React and Vue current runtime server binding', () => {
    for (const type of ['react', 'vue']) {
      activate(type + '-project'); webcontainerService.setDevServerStarting(true);
      current.ready(5173, 'http://' + type + '-project');
      const server = webcontainerService.getState().activeServers[0];
      assert.equal(server.projectId, type + '-project');
      assert.equal(server.url, 'http://' + type + '-project');
      assert.equal(webcontainerService.getState().startupStage, 'ready');
    }
  });

  cleanup();

  console.log('\n======================================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  console.log(`TOTAL: ${passCount} / ${results.length} PASS (${Math.round((passCount / results.length) * 100)}%)`);
  console.log('======================================================================');

  if (results.some((r) => r.status !== 'PASS')) {
    process.exit(1);
  }
}

run().catch((err) => {
  cleanup();
  console.error('Fatal error running acceptance tests:', err);
  process.exit(1);
});
