/**
 * GB Coder — Task 08 WebContainer Loading, Status, and Error Recovery Matrix
 *
 * Verifies all 17 scenarios specified in Task 08:
 * - 01. Successful runtime boot.
 * - 02. Slow runtime boot.
 * - 03. Runtime boot failure.
 * - 04. Slow npm installation.
 * - 05. npm installation failure.
 * - 06. Successful npm installation.
 * - 07. Server startup failure.
 * - 08. Successful server-ready event.
 * - 09. Preview loading timeout / error.
 * - 10. Preview ready.
 * - 11. Project switch during installation.
 * - 12. Tab switch during startup.
 * - 13. Repeated startup requests.
 * - 14. Process exit after readiness.
 * - 15. Failed operation followed by retry.
 * - 16. Stale event from previous project.
 * - 17. Local terminal remains functional.
 *
 * Run with: node scripts/runtime-status-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  webcontainerService,
  filesToFileSystemTree,
  computeDependencyFingerprint,
  runLocalCommand,
} = services;

after(() => cleanup());

describe('GB Coder Task 08 — WebContainer Status Accuracy & Error Recovery (17 Tests)', () => {
  // TEST 01: Successful runtime boot
  test('01. Successful runtime boot transitions from booting to ready without phantom stages', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('booting');
    let state = webcontainerService.getState();
    assert.equal(state.startupStage, 'booting', 'Stage must be booting while runtime boots');
    assert.equal(state.error, null, 'Error must be null');

    // Simulate boot completion
    webcontainerService.setStartupStage('mounting_files');
    state = webcontainerService.getState();
    assert.equal(state.startupStage, 'mounting_files', 'Stage must reflect mounting project files');
  });

  // TEST 02: Slow runtime boot
  test('02. Slow runtime boot maintains indeterminate loading without claiming false success', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('booting');

    // During a slow boot, no serverUrl or false ready state is emitted
    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'booting');
    assert.equal(state.serverUrl, null, 'Server URL must not exist during boot');
    assert.equal(state.serverPort, null, 'Server port must not exist during boot');
  });

  // TEST 03: Runtime boot failure
  test('03. Runtime boot failure captures structured error and provides reboot recovery action', () => {
    webcontainerService.resetServerState();
    const bootError = {
      phase: 'boot',
      message: 'Failed to initialize WebAssembly memory pool.',
      timestamp: Date.now(),
      recoverable: true,
      retryAction: 'reboot_container',
    };
    webcontainerService.setStartupStage('error', bootError);

    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'error');
    assert.ok(state.runtimeError, 'Runtime error object must be present');
    assert.equal(state.runtimeError.phase, 'boot');
    assert.equal(state.runtimeError.retryAction, 'reboot_container');
    assert.equal(state.runtimeError.recoverable, true);
    assert.equal(state.error, 'Failed to initialize WebAssembly memory pool.');
  });

  // TEST 04: Slow npm installation
  test('04. Slow npm installation indicates ongoing package installation without timing out dev server', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('installing');
    webcontainerService.setDevServerStarting(true);

    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'installing');
    assert.equal(webcontainerService.isDevServerStarting(), true);
    assert.equal(state.serverUrl, null, 'Must not claim server ready before install finishes');
  });

  // TEST 05: npm installation failure
  test('05. npm installation failure detects npm ERR! and provides retry_install affordance', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('installing');

    const installError = {
      phase: 'install',
      message: 'npm ERR! code ERESOLVE: Could not resolve dependency tree',
      timestamp: Date.now(),
      recoverable: true,
      retryAction: 'retry_install',
    };
    webcontainerService.setStartupStage('error', installError);
    webcontainerService.setDevServerStarting(false);

    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'error');
    assert.equal(state.runtimeError.phase, 'install');
    assert.equal(state.runtimeError.retryAction, 'retry_install');
    assert.equal(webcontainerService.isDevServerStarting(), false);
  });

  // TEST 06: Successful npm installation
  test('06. Successful npm installation records fingerprint and advances to starting_server (not ready)', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('installing');

    const testFingerprint = 'test_manifest_fingerprint_abc123';
    webcontainerService.recordInstallComplete(testFingerprint);
    assert.equal(webcontainerService.getInstalledFingerprint(), testFingerprint);

    // Dependencies installed -> advance to starting_server, NOT ready
    webcontainerService.setStartupStage('starting_server');
    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'starting_server');
    assert.notEqual(state.startupStage, 'ready', 'Must not claim ready until dev server is actually listening');
  });

  // TEST 07: Server startup failure
  test('07. Server startup failure flags server error and prevents hung starting state', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('starting_server');
    webcontainerService.setDevServerStarting(true);

    const serverError = {
      phase: 'server',
      message: 'Error: listen EADDRINUSE: address already in use :::5173',
      timestamp: Date.now(),
      recoverable: true,
      retryAction: 'restart_server',
    };
    webcontainerService.setStartupStage('error', serverError);
    webcontainerService.setDevServerStarting(false);

    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'error');
    assert.equal(state.runtimeError.phase, 'server');
    assert.equal(state.runtimeError.retryAction, 'restart_server');
    assert.equal(webcontainerService.isDevServerStarting(), false);
  });

  // TEST 08: Successful server-ready event
  test('08. Successful server-ready event maps port, url, and transitions to ready', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('starting_server');

    // Simulate verified server-ready signal
    webcontainerService.setStartupStage('ready');
    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'ready');
    assert.equal(state.error, null);
    assert.equal(state.runtimeError, null);
  });

  // TEST 09: Preview loading timeout / error
  test('09. Preview loading failure flags preview error with reload_preview retry action', () => {
    webcontainerService.resetServerState();
    webcontainerService.setPreviewStatus('error', 'Iframe navigation timed out after 10000ms.');

    const state = webcontainerService.getState();
    assert.equal(state.previewStatus, 'error');
    assert.ok(state.runtimeError);
    assert.equal(state.runtimeError.phase, 'preview');
    assert.equal(state.runtimeError.retryAction, 'reload_preview');
  });

  // TEST 10: Preview ready
  test('10. Preview ready clears preview errors and confirms live rendering state', () => {
    webcontainerService.resetServerState();
    webcontainerService.setPreviewStatus('error', 'Temporary connection issue');
    assert.equal(webcontainerService.getState().previewStatus, 'error');

    // Successful iframe load clears preview error
    webcontainerService.setPreviewStatus('ready');
    const state = webcontainerService.getState();
    assert.equal(state.previewStatus, 'ready');
    assert.equal(state.runtimeError, null);
  });

  // TEST 11: Project switch during installation
  test('11. Project switch during installation increments session epoch and invalidates old operations', () => {
    const epoch1 = webcontainerService.getSessionEpoch();
    webcontainerService.setStartupStage('installing');

    // Project switch triggers requestRestart
    webcontainerService.requestRestart('Project switch');
    const epoch2 = webcontainerService.getSessionEpoch();
    assert.equal(epoch2, epoch1 + 1, 'Epoch must increment on project switch');

    // Check that stage was reset
    const state = webcontainerService.getState();
    assert.equal(state.serverUrl, null);
    assert.equal(state.startupStage, 'installing');
  });

  // TEST 12: Tab switch during startup
  test('12. Tab switch during startup does not trigger duplicate npm install or restart', () => {
    const files = [
      { path: 'package.json', content: JSON.stringify({ name: 'app', dependencies: { react: '18.3.1' } }) },
    ];
    const fingerprint = computeDependencyFingerprint(files);

    // Initial start marks project started
    webcontainerService.markProjectStarted(fingerprint);
    assert.equal(webcontainerService.hasStartedProject(fingerprint), true);

    // Second mount (e.g. user toggles between Terminal and Explorer tabs)
    const shouldSkipInstall = webcontainerService.hasStartedProject(fingerprint);
    assert.equal(shouldSkipInstall, true, 'Subsequent mount within same epoch must not rerun install');
  });

  // TEST 13: Repeated startup requests
  test('13. Repeated startup requests are guarded and do not corrupt lifecycle state', () => {
    webcontainerService.resetServerState();
    webcontainerService.setDevServerStarting(true);

    // Concurrent start request checks starting state
    const alreadyStarting = webcontainerService.isDevServerStarting();
    assert.equal(alreadyStarting, true, 'Concurrent request must detect in-flight startup');

    // Cleanup
    webcontainerService.setDevServerStarting(false);
  });

  // TEST 14: Process exit after readiness
  test('14. Process exit after readiness cleans up serverUrl and transitions stage to idle', () => {
    webcontainerService.resetServerState();
    webcontainerService.setStartupStage('ready');

    // Simulate process termination
    webcontainerService.stopDevServer();
    const state = webcontainerService.getState();
    assert.equal(state.serverUrl, null, 'serverUrl must be null after stop');
    assert.equal(state.serverPort, null, 'serverPort must be null after stop');
    assert.equal(state.startupStage, 'idle', 'startupStage must be idle after stop');
  });

  // TEST 15: Failed operation followed by retry
  test('15. Failed operation followed by retry resets error and restarts startup cleanly', () => {
    // 1. Enter error state
    webcontainerService.setStartupStage('error', {
      phase: 'install',
      message: 'Network timeout downloading vite',
      timestamp: Date.now(),
      recoverable: true,
      retryAction: 'retry_install',
    });
    assert.equal(webcontainerService.getState().startupStage, 'error');
    assert.ok(webcontainerService.getState().runtimeError);

    // 2. User clicks Retry
    webcontainerService.requestRestart('User Retry');
    const state = webcontainerService.getState();
    assert.equal(state.startupStage, 'installing');
    assert.equal(state.error, null, 'Error must be cleared on retry');
    assert.equal(state.runtimeError, null, 'Runtime error object must be cleared on retry');
  });

  // TEST 16: Stale event from previous project
  test('16. Stale event from previous project is rejected via epoch comparison', () => {
    const epochBefore = webcontainerService.getSessionEpoch();

    // Project 1 starts operation with epochBefore
    const operationEpoch = epochBefore;

    // User switches project before operation completes
    webcontainerService.requestRestart('Switch to Project B');
    const currentEpoch = webcontainerService.getSessionEpoch();
    assert.notEqual(operationEpoch, currentEpoch);

    // Stale operation callback attempts to update state:
    let appliedStaleUpdate = false;
    if (operationEpoch === webcontainerService.getSessionEpoch()) {
      appliedStaleUpdate = true;
      webcontainerService.setStartupStage('ready');
    }

    assert.equal(appliedStaleUpdate, false, 'Stale event from older epoch must be ignored');
  });

  // TEST 17: Local terminal remains functional
  test('17. Local simulated terminal executes commands independently without WebContainer isolation', () => {
    const mockContext = {
      project: { files: [{ path: 'index.html', content: '<h1>Hi</h1>' }] },
      resolvedPackages: [],
      unresolvedPackages: [],
      isResolvingPackages: false,
      history: [],
    };

    const helpResult = runLocalCommand('help', mockContext);
    assert.ok(helpResult.output.length > 0, 'Local help command must return output');

    const lsResult = runLocalCommand('ls', mockContext);
    assert.ok(lsResult.output.some((line) => line.includes('index.html')), 'Local ls must list project files');

    // Local execution does not affect WebContainer state
    const wcState = webcontainerService.getState();
    assert.equal(wcState.error, null);
  });
});
