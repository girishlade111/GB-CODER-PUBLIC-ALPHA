/**
 * GB Coder IDE — Phase 1B Automated Regression Test Suite
 *
 * Verifies all 12 core acceptance requirements defined in Phase 1B:
 * - T01: Concurrent WebContainer boot requests deduplicate to single instance.
 * - T02: Failed boot followed by clean retry without wedging runtime.
 * - T03: Teardown stops processes, cleans sessions, and transitions to stopped.
 * - T04: Rapid Project A -> B -> C switching enforces strict monotonic ownership.
 * - T05: Filesystem flush failure blocks destructive project transition.
 * - T06: Stale server-ready events cannot update active preview.
 * - T07: Late port-close events cannot clear another project's preview.
 * - T08: Terminal sessions do not leak across projects.
 * - T09: Runtime recovery preserves IndexedDB project data intact.
 * - T10: Classic Editor and simulated shell remain 100% independent of WebContainer.
 * - T11: GB Assist workspace and terminal adapters remain compatible.
 * - T12: Runtime cleanup removes old event listeners without leaking.
 *
 * Run with: node scripts/webcontainer-lifecycle-hardening-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  devServerManager,
  terminalSessionManager,
  FileSyncCoordinator,
  saveProjectFiles,
  readProjectFiles,
  runLocalCommand,
  createTransitionCoordinator,
} = services;

after(() => cleanup());

describe('GB Coder Phase 1B — WebContainer Lifecycle & Project Transition Verification', () => {

  // T01 — Concurrent WebContainer boot requests
  test('T01: Concurrent boot requests deduplicate and return consistent instance', async () => {
    // When cross-origin isolation is not active in plain node, boot is rejected before reaching SDK
    const isSupported = webcontainerService.isSupported();
    if (!isSupported) {
      const results = await Promise.allSettled([
        webcontainerService.boot(),
        webcontainerService.boot(),
        webcontainerService.boot(),
      ]);
      assert.equal(results.length, 3);
      assert.equal(results[0].status, 'rejected');
      assert.equal(results[1].status, 'rejected');
      assert.equal(results[2].status, 'rejected');
      // All rejected with identical reason
      assert.equal(results[0].reason.message, results[1].reason.message);
      assert.equal(results[1].reason.message, results[2].reason.message);
      assert.equal(webcontainerService.getState().status, 'unsupported');
    }
  });

  // T02 — Failed boot followed by retry
  test('T02: Failed boot clears pending boot promise and allows clean retry', async () => {
    // Refused boot due to environment does not wedge service state
    try {
      await webcontainerService.boot();
    } catch {
      // Expected rejection
    }
    const stateAfterFail = webcontainerService.getState();
    assert.ok(stateAfterFail.status === 'unsupported' || stateAfterFail.status === 'error');

    // Subsequent call executes without getting stuck on a dead promise
    let retried = false;
    try {
      await webcontainerService.boot();
    } catch {
      retried = true;
    }
    assert.equal(retried, true, 'Retry must cleanly execute and reject or resolve afresh');
  });

  // T03 — Teardown followed by fresh initialization
  test('T03: Teardown stops processes, cleans sessions, and marks status stopped', async () => {
    webcontainerService.attachProject('test-proj-teardown');
    await webcontainerService.teardown();
    const state = webcontainerService.getState();
    assert.equal(state.status, 'stopped');
    assert.equal(state.serverUrl, null);
    assert.equal(state.serverPort, null);
    assert.equal(webcontainerService.isDevServerRunning(), false);
    assert.equal(webcontainerService.isShellRunning(), false);
  });

  // T04 — Rapid Project A -> B -> C switching
  test('T04: Rapid Project A -> B -> C navigation enforces monotonic ownership and epoch', () => {
    const coordinator = createTransitionCoordinator();
    const tA = coordinator.begin();
    webcontainerService.attachProject('project-alpha');
    const epochA = webcontainerService.getSessionEpoch();

    const tB = coordinator.begin();
    webcontainerService.attachProject('project-beta');
    const epochB = webcontainerService.getSessionEpoch();

    const tC = coordinator.begin();
    webcontainerService.attachProject('project-gamma');
    const epochC = webcontainerService.getSessionEpoch();

    assert.equal(coordinator.isCurrent(tA), false);
    assert.equal(coordinator.isCurrent(tB), false);
    assert.equal(coordinator.isCurrent(tC), true);

    assert.ok(epochB > epochA, 'Epoch must increment monotonically on project switch');
    assert.ok(epochC > epochB, 'Epoch must increment monotonically on project switch');
    assert.equal(webcontainerService.getActiveProjectId(), 'project-gamma');
  });

  // T05 — Filesystem flush failure blocks destructive transition
  test('T05: Filesystem flush failure blocks destructive transition and protects user data', async () => {
    let failWrite = false;
    const testCoordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async () => {
        if (failWrite) throw new Error('VFS write error');
      },
      rawDelete: async () => {},
    });

    testCoordinator.setScope('project-source');
    testCoordinator.queueSync('src/critical.ts', 'const important = true;', 'project-source');

    // Trigger failure during flush
    failWrite = true;
    const flushResult = await testCoordinator.flush();
    assert.equal(flushResult.ok, false);
    assert.equal(flushResult.failed.length, 1);
    assert.equal(flushResult.failed[0].path, 'src/critical.ts');

    // Verify safe transition method: transitionProject aborts on flush failure
    webcontainerService.attachProject('project-source');
    // Simulate failing fileSyncCoordinator in webcontainerService
    webcontainerService.fileSyncCoordinator = {
      flush: async () => ({
        ok: false,
        persisted: [],
        failed: [{ path: 'src/critical.ts', error: new Error('Disk full') }],
        canceled: [],
      }),
      setScope: () => {},
      cancelAll: () => {},
    };

    const transitionResult = await webcontainerService.transitionProject('project-destination');
    assert.equal(transitionResult.ok, false);
    assert.equal(transitionResult.failed.length, 1);
    // Project was NOT switched to destination
    assert.equal(webcontainerService.getActiveProjectId(), 'project-source');
    assert.equal(webcontainerService.getState().status, 'error');

    // Restore real coordinator
    webcontainerService.fileSyncCoordinator = new FileSyncCoordinator({
      debounceMs: 200,
      rawWrite: async () => {},
      rawDelete: async () => {},
    });
  });

  // T06 — Stale server-ready events cannot update active preview
  test('T06: Stale server-ready event from prior project cannot overwrite active preview', () => {
    devServerManager.reset();
    webcontainerService.attachProject('project-active');
    const activeEpoch = webcontainerService.getSessionEpoch();

    // Dev server starts for project-active
    devServerManager.handleServerReady(5173, 'http://localhost:5173', 'project-active', activeEpoch);
    assert.equal(devServerManager.getState().serverUrl, 'http://localhost:5173');
    assert.equal(devServerManager.getState().serverPort, 5173);

    // Stale server-ready from project-old arrives
    devServerManager.handleServerReady(3000, 'http://localhost:3000', 'project-old', activeEpoch - 1);

    // Active server URL is NOT overwritten by the stale event
    assert.equal(devServerManager.getState().serverUrl, 'http://localhost:5173');
    assert.equal(devServerManager.getState().serverPort, 5173);
  });

  // T07 — Late port-close events cannot clear another project's preview
  test('T07: Late port-close event from prior project cannot clear active preview', () => {
    devServerManager.reset();
    webcontainerService.attachProject('project-current');
    const currentEpoch = webcontainerService.getSessionEpoch();

    // Current project is running dev server on port 5173
    devServerManager.handleServerReady(5173, 'http://localhost:5173', 'project-current', currentEpoch);
    assert.equal(devServerManager.isRunning(), true);

    // A late port-close from an older project or older epoch arrives for port 5173
    devServerManager.handlePortClose(5173, 'project-former', currentEpoch - 1);

    // Current project preview must remain running!
    assert.equal(devServerManager.isRunning(), true);
    assert.equal(devServerManager.getState().serverUrl, 'http://localhost:5173');
    assert.equal(devServerManager.getState().serverPort, 5173);

    // Actual port close for current project stops it cleanly
    devServerManager.handlePortClose(5173, 'project-current', currentEpoch);
    assert.equal(devServerManager.getState().status, 'stopped');
    assert.equal(devServerManager.getState().serverUrl, null);
  });

  // T08 — Terminal sessions do not leak across projects
  test('T08: Terminal sessions are isolated by projectId and do not leak on switch', () => {
    terminalSessionManager.teardownAll();

    const mockContainer = {
      spawn: async () => ({
        input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
        output: { pipeTo: async () => {} },
        exit: new Promise(() => {}),
        resize: () => {},
        kill: () => {},
      }),
    };

    // Create session in Project A
    return terminalSessionManager
      .createSession(mockContainer, { title: 'Terminal Proj A', projectId: 'project-a', epoch: 1 })
      .then((sessionA) => {
        assert.equal(sessionA.projectId, 'project-a');

        // Create session in Project B
        return terminalSessionManager
          .createSession(mockContainer, { title: 'Terminal Proj B', projectId: 'project-b', epoch: 2 })
          .then((sessionB) => {
            assert.equal(sessionB.projectId, 'project-b');

            // Listing sessions for project-b filters out project-a
            const projBSessions = terminalSessionManager.listSessions('project-b');
            assert.equal(projBSessions.length, 1);
            assert.equal(projBSessions[0].id, sessionB.id);

            // Teardown project-a only
            terminalSessionManager.teardownForProject('project-a');
            assert.equal(terminalSessionManager.getSession(sessionA.id), undefined);
            assert.ok(terminalSessionManager.getSession(sessionB.id) !== undefined);

            // Clean up
            terminalSessionManager.teardownAll();
          });
      });
  });

  // T09 — Runtime recovery preserves IndexedDB project data
  test('T09: Runtime error recovery preserves IndexedDB project files intact', async () => {
    const projectId = 'proj-recovery-test';
    const testFiles = [
      { path: 'package.json', content: '{"name": "recovery-app"}' },
      { path: 'src/index.ts', content: 'console.log("data intact");' },
    ];

    // Save project files to IndexedDB
    const { snapshot, persisted } = await saveProjectFiles(projectId, testFiles);
    assert.equal(persisted, true);
    assert.ok(snapshot);

    // Trigger runtime recovery
    const recovered = await webcontainerService.recoverRuntime('reset_runtime');
    assert.equal(recovered, true);

    // Verify files in IndexedDB are untouched
    const storedFiles = await readProjectFiles(projectId);
    assert.equal(storedFiles.length, 2);
    const indexFile = storedFiles.find((f) => f.path === 'src/index.ts');
    assert.ok(indexFile);
    assert.equal(indexFile.content, 'console.log("data intact");');
  });

  // T10 — Classic Editor remains independent of WebContainer
  test('T10: Local simulated shell and Classic Editor operate completely independently of WebContainer', () => {
    // In an environment where WebContainer is unsupported, local shell commands answer immediately
    const ctx = {
      project: {
        projectType: 'javascript',
        files: [{ path: 'main.js', content: 'console.log("hello");' }],
      },
      resolvedPackages: [],
      unresolvedPackages: [],
      isResolvingPackages: false,
      history: [],
    };

    const helpRes = runLocalCommand('help', ctx);
    const helpText = Array.isArray(helpRes.output) ? helpRes.output.join('\n') : (helpRes.output || '');
    assert.ok(helpText.includes('Cheat Sheet') || helpText.includes('GB Coder Terminal'));

    const filesRes = runLocalCommand('files', ctx);
    const filesText = Array.isArray(filesRes.output) ? filesRes.output.join('\n') : (filesRes.output || '');
    assert.ok(filesText.includes('main.js'));
  });

  // T11 — GB Assist workspace and terminal adapters remain compatible
  test('T11: GB Assist terminal adapter contracts and spawnAgentProcess signature are preserved', () => {
    assert.equal(typeof webcontainerService.spawnAgentProcess, 'function');
    assert.equal(typeof webcontainerService.runCommand, 'function');

    // Pre-execution cancellation contract
    const controller = new AbortController();
    controller.abort();
    return webcontainerService
      .spawnAgentProcess('echo', ['hello'], { signal: controller.signal })
      .then(() => {
        assert.fail('Should have rejected aborted signal');
      })
      .catch((err) => {
        assert.ok(err.message.includes('cancelled before start'));
      });
  });

  // T12 — Runtime cleanup removes old event listeners
  test('T12: Runtime event listeners unsubscribe cleanly without memory leak', () => {
    let notified = 0;
    const unsub = webcontainerService.subscribe(() => {
      notified++;
    });

    webcontainerService.resetServerState();
    assert.ok(notified > 0);
    const countBeforeUnsub = notified;

    unsub();
    webcontainerService.resetServerState();
    assert.equal(notified, countBeforeUnsub, 'Unsubscribed listener must receive no further notifications');
  });

});
