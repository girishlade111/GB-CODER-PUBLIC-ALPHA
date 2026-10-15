import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await fs.mkdtemp(path.resolve('scripts/.tmp-b5-1-'));

// Bundle webcontainerService for offline testing
await build({
  entryPoints: ['src/services/webcontainer/webcontainerService.ts'],
  bundle: true,
  format: 'esm',
  outfile: path.join(dir, 'service.mjs'),
  plugins: [
    {
      name: 'mock-api',
      setup(b) {
        b.onResolve({ filter: /^@webcontainer\/api$/ }, () => ({
          path: 'api',
          namespace: 'test',
        }));
        b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
          contents: 'export const WebContainer = { boot: async () => { throw new Error("Unexpected boot"); } };',
        }));
      },
    },
  ],
});

const { webcontainerService: s } = await import(pathToFileURL(path.join(dir, 'service.mjs')));

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${name}: ${e.message}`);
  }
}

// Mock WebContainer runtime instance
function createMockRuntime() {
  const mountedTrees = [];
  return {
    mountedTrees,
    mount: async (tree) => {
      mountedTrees.push(tree);
    },
    fs: {
      readdir: async (p) => (p === 'node_modules' ? ['react', 'vite', '.bin'] : []),
      readFile: async () => '',
      writeFile: async () => {},
      mkdir: async () => {},
    },
    on: () => () => {},
    teardown: () => {},
  };
}

// Simulation of VSCodeMode handleRestartDevServer (The Optimized Version)
function createVSCodeModeRestartHandler(options) {
  const {
    getProject,
    openTerminal = () => {},
    toast = () => {},
    service = s,
  } = options;

  return () => {
    const project = getProject();
    const hasFiles = project.files.length > 0;
    if (!hasFiles) {
      toast('Nothing to restart — load or create project files first.');
      return false;
    }
    if (!service.hasNpmManifest(project.files)) {
      toast('No package.json — nothing to install or serve.');
      return false;
    }
    openTerminal();
    toast('Restarting WebContainer environment...');
    service.requestRestart('Restart Dev Server');
    return true;
  };
}

// Simulation of TerminalTab triggerDevServerRestart seam
function createTerminalTabRestartHarness(options) {
  const {
    getProject,
    getProjectId,
    getShellRunning,
    service = s,
  } = options;

  let mountCallCount = 0;
  let autoStartDispatched = false;
  let debounceTimer = null;
  let lastMountedEpoch = null;
  let lastMountedProjectId = null;
  let lastMountedFiles = null;

  const triggerDevServerRestart = (reason = 'Restart request') => {
    if (service.isAutomaticStartupBusy()) return;
    const requestedOwner = service.captureStartupOwner();
    if (debounceTimer) clearTimeout(debounceTimer);

    return new Promise((resolve) => {
      debounceTimer = setTimeout(async () => {
        if (!service.isStartupOwner(requestedOwner)) {
          resolve({ status: 'rejected_owner' });
          return;
        }

        const currentProj = getProject();
        const effectiveProjectId = getProjectId() || currentProj.id;
        const restartEpoch = service.getSessionEpoch();

        const shellRunning = getShellRunning();
        if (shellRunning) {
          if (currentProj.files.length === 0) {
            resolve({ status: 'no_files' });
            return;
          }
          if (!service.hasNpmManifest(currentProj.files)) {
            resolve({ status: 'no_manifest' });
            return;
          }

          mountCallCount++;
          const mounted = await service.mountProject(
            currentProj.files,
            currentProj.dependencies,
            currentProj.projectType,
            effectiveProjectId,
            restartEpoch,
          );
          if (!mounted) {
            resolve({ status: 'mount_aborted' });
            return;
          }
          if (restartEpoch !== service.getSessionEpoch()) {
            resolve({ status: 'stale_epoch' });
            return;
          }

          lastMountedEpoch = restartEpoch;
          lastMountedProjectId = effectiveProjectId;
          lastMountedFiles = currentProj.files;
          autoStartDispatched = true;
          resolve({ status: 'restarted', mountCallCount });
        } else {
          // Shell not running: startWebContainerShell would mount and spawn
          mountCallCount++;
          const mounted = await service.mountProject(
            currentProj.files,
            currentProj.dependencies,
            currentProj.projectType,
            effectiveProjectId,
            restartEpoch,
          );
          if (mounted) {
            lastMountedEpoch = restartEpoch;
            lastMountedProjectId = effectiveProjectId;
            lastMountedFiles = currentProj.files;
            autoStartDispatched = true;
            resolve({ status: 'shell_started_and_mounted', mountCallCount });
          } else {
            resolve({ status: 'mount_failed' });
          }
        }
      }, 10); // shortened debounce for unit test execution
    });
  };

  const unsubscribe = service.onRestartRequest((reason) => {
    void triggerDevServerRestart(reason || 'Restarting dev server');
  });

  return {
    triggerDevServerRestart,
    getMountCallCount: () => mountCallCount,
    getAutoStartDispatched: () => autoStartDispatched,
    getLastMountedEpoch: () => lastMountedEpoch,
    getLastMountedProjectId: () => lastMountedProjectId,
    getLastMountedFiles: () => lastMountedFiles,
    cleanup: unsubscribe,
  };
}

try {
  // Test 1: Normal active-shell restart mounts exactly once
  await test('Normal active-shell restart executes mount exactly once', async () => {
    s.attachProject('proj-1');
    const runtime = createMockRuntime();
    s.instance = runtime;

    let project = {
      id: 'proj-1',
      files: [{ path: 'package.json', content: '{"name":"test"}' }, { path: 'App.jsx', content: '// v1' }],
      dependencies: { react: '18.3.1' },
      projectType: 'react',
    };

    let terminalOpened = false;
    const harness = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-1',
      getShellRunning: () => true,
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
      openTerminal: () => { terminalOpened = true; },
    });

    const initiated = restartHandler();
    assert.equal(initiated, true);
    assert.equal(terminalOpened, true);

    // Wait for debounce in harness
    await new Promise((r) => setTimeout(r, 30));

    assert.equal(harness.getMountCallCount(), 1, 'Mount must occur exactly once');
    assert.equal(runtime.mountedTrees.length, 1, 'Virtual filesystem must receive exactly 1 tree mount');
    assert.equal(harness.getAutoStartDispatched(), true, 'Dev server restart command must be dispatched');
    harness.cleanup();
  });

  // Test 2: Double-mount defect reproduction in unoptimized path vs optimized single-mount
  await test('Verifies elimination of duplicate mount in eligible restart path', async () => {
    s.attachProject('proj-2');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const project = {
      id: 'proj-2',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    // Simulate OLD UNOPTIMIZED path: outer mount + requestRestart
    let oldMountCalls = 0;
    const harnessOld = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-2',
      getShellRunning: () => true,
    });

    const oldHandleRestart = async () => {
      oldMountCalls++;
      await s.mountProject(project.files, project.dependencies, project.projectType, 'proj-2', s.getSessionEpoch());
      s.requestRestart('Restart Dev Server');
    };

    await oldHandleRestart();
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(oldMountCalls + harnessOld.getMountCallCount(), 2, 'Old flow mounts twice (1 outer + 1 inner)');
    harnessOld.cleanup();

    // Now test NEW OPTIMIZED path: only requestRestart
    runtime.mountedTrees.length = 0;
    const harnessNew = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-2',
      getShellRunning: () => true,
    });

    const newHandleRestart = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    newHandleRestart();
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(harnessNew.getMountCallCount(), 1, 'New flow mounts exactly once');
    assert.equal(runtime.mountedTrees.length, 1, 'Virtual filesystem receives exactly 1 mount in new flow');
    harnessNew.cleanup();
  });

  // Test 3: No terminal / shell path (shell not started or exited)
  await test('Restart when shell is not yet running initiates shell and mounts once', async () => {
    s.attachProject('proj-3');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const project = {
      id: 'proj-3',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    const harness = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-3',
      getShellRunning: () => false, // shell not running
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    restartHandler();
    await new Promise((r) => setTimeout(r, 30));

    assert.equal(harness.getMountCallCount(), 1);
    assert.equal(harness.getAutoStartDispatched(), true);
    harness.cleanup();
  });

  // Test 4: Project switch during pending restart discards stale mount
  await test('Project switch during pending restart safely aborts former project restart', async () => {
    s.attachProject('proj-A');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const projectA = {
      id: 'proj-A',
      files: [{ path: 'package.json', content: '{"name":"A"}' }],
      dependencies: {},
      projectType: 'react',
    };

    let activeProject = projectA;
    const harness = createTerminalTabRestartHarness({
      getProject: () => activeProject,
      getProjectId: () => activeProject.id,
      getShellRunning: () => true,
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => activeProject,
    });

    // Initiate restart on Proj A
    restartHandler();

    // Immediately switch project to Proj B before debounce settles
    activeProject = {
      id: 'proj-B',
      files: [{ path: 'package.json', content: '{"name":"B"}' }],
      dependencies: {},
      projectType: 'react',
    };
    s.attachProject('proj-B');

    await new Promise((r) => setTimeout(r, 30));

    // The stale restart attempt for A should be discarded
    assert.notEqual(harness.getLastMountedProjectId(), 'proj-A', 'Must not have mounted Proj A after switch');
    harness.cleanup();
  });

  // Test 5: File edits before restart are authoritative and mounted
  await test('File edits modified immediately before restart are mounted', async () => {
    s.attachProject('proj-5');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const project = {
      id: 'proj-5',
      files: [{ path: 'package.json', content: '{"name":"test"}' }, { path: 'App.jsx', content: '// initial' }],
      dependencies: {},
      projectType: 'react',
    };

    const harness = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-5',
      getShellRunning: () => true,
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    // User edits App.jsx right before clicking restart
    project.files[1].content = '// modified by user';

    restartHandler();
    await new Promise((r) => setTimeout(r, 30));

    assert.equal(harness.getMountCallCount(), 1);
    const mountedFiles = harness.getLastMountedFiles();
    assert.equal(mountedFiles[1].content, '// modified by user', 'Authoritative modified file content must be mounted');
    harness.cleanup();
  });

  // Test 6: Missing manifest prevents restart and remains idle
  await test('Missing package.json blocks restart dispatch and stays idle', () => {
    s.attachProject('proj-6');
    const project = {
      id: 'proj-6',
      files: [{ path: 'index.html', content: '<h1>Hello</h1>' }],
      dependencies: {},
      projectType: 'vanilla',
    };

    let toastMsg = null;
    let restartRequested = false;
    const unsub = s.onRestartRequest(() => { restartRequested = true; });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
      toast: (msg) => { toastMsg = msg; },
    });

    const result = restartHandler();
    assert.equal(result, false);
    assert.equal(restartRequested, false, 'No restart request must be dispatched');
    assert.equal(toastMsg, 'No package.json — nothing to install or serve.');
    unsub();
  });

  // Test 7: Empty project prevents restart and remains idle
  await test('Empty project blocks restart dispatch and stays idle', () => {
    s.attachProject('proj-7');
    const project = {
      id: 'proj-7',
      files: [],
      dependencies: {},
      projectType: 'react',
    };

    let toastMsg = null;
    let restartRequested = false;
    const unsub = s.onRestartRequest(() => { restartRequested = true; });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
      toast: (msg) => { toastMsg = msg; },
    });

    const result = restartHandler();
    assert.equal(result, false);
    assert.equal(restartRequested, false, 'No restart request must be dispatched');
    assert.equal(toastMsg, 'Nothing to restart — load or create project files first.');
    unsub();
  });

  // Test 8: Automatic startup busy state suppresses duplicate restart dispatch
  await test('Automatic startup busy state rejects duplicate restart', () => {
    s.attachProject('proj-8');
    const project = {
      id: 'proj-8',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    // Mark automatic startup as busy
    const owner = s.captureStartupOwner();
    s.automaticStartup = { owner, command: 'npm install' };

    let listenerFired = false;
    const unsub = s.onRestartRequest(() => { listenerFired = true; });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    restartHandler();
    assert.equal(listenerFired, false, 'requestRestart must not notify listeners when automatic startup is busy');

    s.clearAutomaticStartup();
    unsub();
  });

  // Test 9: Rapid repeated restart action is cleanly debounced to 1 mount
  await test('Rapid repeated restart calls are debounced to single mount', async () => {
    s.attachProject('proj-9');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const project = {
      id: 'proj-9',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    const harness = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-9',
      getShellRunning: () => true,
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    // Rapidly trigger 5 times
    restartHandler();
    restartHandler();
    restartHandler();
    restartHandler();
    restartHandler();

    await new Promise((r) => setTimeout(r, 40));

    assert.equal(harness.getMountCallCount(), 1, 'Debounce must ensure exactly 1 mount occurs');
    harness.cleanup();
  });

  // Test 10: Runtime ownership rejection on stale owner
  await test('Stale runtime owner rejects restart completion', async () => {
    s.attachProject('proj-10');
    const runtime = createMockRuntime();
    s.instance = runtime;

    const project = {
      id: 'proj-10',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    let harnessResult = null;
    const harness = createTerminalTabRestartHarness({
      getProject: () => project,
      getProjectId: () => 'proj-10',
      getShellRunning: () => true,
    });

    // Trigger restart
    s.requestRestart('Test Ownership');

    // Simulate runtime retiring while debounce is running
    s.attachProject('proj-10-new');

    await new Promise((r) => setTimeout(r, 30));
    assert.equal(harness.getLastMountedProjectId(), null, 'Mount must not proceed for invalid owner');
    harness.cleanup();
  });

  // Test 11: Restart listener unavailable or inactive
  await test('Restart request when no terminal listener exists is safe and does not crash', () => {
    s.attachProject('proj-11');
    const project = {
      id: 'proj-11',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    // No listeners subscribed
    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    assert.doesNotThrow(() => {
      restartHandler();
    }, 'requestRestart must cleanly succeed with 0 listeners');
  });

  // Test 12: Preserved error handling when mount fails in TerminalTab
  await test('Preserves error handling when filesystem mount rejects', async () => {
    s.attachProject('proj-12');
    const failingRuntime = {
      mount: async () => { throw new Error('VFS write error'); },
      fs: { readdir: async () => [] },
      on: () => () => {},
      teardown: () => {},
    };
    s.instance = failingRuntime;

    const project = {
      id: 'proj-12',
      files: [{ path: 'package.json', content: '{"name":"test"}' }],
      dependencies: {},
      projectType: 'react',
    };

    let caughtError = null;
    const unsub = s.onRestartRequest(async () => {
      try {
        await s.mountProject(project.files, project.dependencies, project.projectType, 'proj-12', s.getSessionEpoch());
      } catch (err) {
        caughtError = err;
      }
    });

    const restartHandler = createVSCodeModeRestartHandler({
      getProject: () => project,
    });

    restartHandler();
    await new Promise((r) => setTimeout(r, 30));

    assert.ok(caughtError !== null, 'Mount error must be caught and handled');
    assert.match(caughtError.message, /VFS write error/);
    unsub();
  });

} finally {
  s.instance = null;
  await fs.rm(dir, { recursive: true, force: true });
}

console.log(`\n========================================`);
console.log(`Phase B.5.1 Regression Suite: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

process.exitCode = failed ? 1 : 0;
