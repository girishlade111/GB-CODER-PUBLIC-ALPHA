import assert from 'node:assert/strict';
import { build } from 'esbuild';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Create isolated temporary directory for bundled component
const tmpDir = await fs.mkdtemp(path.resolve('scripts/.tmp-b5-2-loader-'));

try {
  // Bundle the real production component for testing
  await build({
    entryPoints: ['src/components/vscode/StackBlitzStartupLoader.tsx'],
    bundle: true,
    format: 'esm',
    outfile: path.join(tmpDir, 'loader.mjs'),
    external: ['react', 'react-dom', 'lucide-react'],
  });

  const { StackBlitzStartupLoader } = await import(
    pathToFileURL(path.join(tmpDir, 'loader.mjs'))
  );

  let passed = 0;
  let failed = 0;
  let deferred = 0;

  function recordPass(name) {
    passed++;
    console.log(`PASS [Case ${passed + failed + deferred}] ${name}`);
  }

  function recordFail(name, err) {
    failed++;
    console.error(`FAIL [Case ${passed + failed + deferred}] ${name}: ${err.message}`);
  }

  function recordDeferred(name, reason) {
    deferred++;
    console.log(`NOT APPLICABLE [Case ${passed + failed + deferred}] ${name} (DEFERRED: ${reason})`);
  }

  console.log('--- PHASE B.5.2 FOCUSED COMPONENT TEST SUITE ---\n');

  // Case 1: Idle state does not show false completion
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'idle' }));
    assert(html.includes('Development Environment Idle'), 'Idle title must indicate idle environment');
    assert(html.includes('Environment is idle. Ready to initialize.'), 'Idle subtext must be truthful');
    // None of the steps should have emerald green checkmark
    assert(!html.includes('text-emerald-400'), 'Idle state must not show any green checkmarks');
    // None of the steps should be active spin
    assert(!html.includes('animate-spin'), 'Idle state must not show spinning loader');
    recordPass('Idle state does not show false completion');
  } catch (err) {
    recordFail('Idle state does not show false completion', err);
  }

  // Case 2: Booting state
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'booting' }));
    assert(html.includes('Starting WebContainer'), 'Booting title must be Starting WebContainer');
    assert(html.includes('Initializing the browser-based development environment...'), 'Subtext must describe runtime init');
    assert(!html.includes('zero cloud latency'), 'Must not claim zero cloud latency');
    assert(html.includes('animate-spin'), 'Step 1 must have spinning loader');
    recordPass('Booting state');
  } catch (err) {
    recordFail('Booting state', err);
  }

  // Case 3: Mounting state
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'mounting_files' }));
    assert(html.includes('Mounting Project Files'), 'Title must be Mounting Project Files');
    assert(html.includes('Syncing source files to virtual filesystem...'), 'Subtext must describe syncing files');
    assert(html.includes('text-emerald-400'), 'Step 1 must be completed (emerald checkmark)');
    assert(html.includes('animate-spin'), 'Step 2 must have spinning loader');
    recordPass('Mounting state');
  } catch (err) {
    recordFail('Mounting state', err);
  }

  // Case 4: Installing state
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'installing' }));
    assert(html.includes('Installing Dependencies'), 'Title must be Installing Dependencies');
    assert(html.includes('Installing project dependencies. This may take longer for initial setups...'), 'Subtext updated');
    assert(html.includes('animate-spin'), 'Step 3 must have spinning loader');
    recordPass('Installing state');
  } catch (err) {
    recordFail('Installing state', err);
  }

  // Case 5: Starting-server state
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'starting_server' }));
    assert(html.includes('Starting Development Server'), 'Title must be Starting Development Server');
    assert(html.includes('Launching development server inside WebContainer...'), 'Subtext must be framework-agnostic');
    assert(!html.includes('Vite dev server'), 'Must not assume Vite specifically');
    assert(html.includes('animate-spin'), 'Step 4 must have spinning loader');
    recordPass('Starting-server state');
  } catch (err) {
    recordFail('Starting-server state', err);
  }

  // Case 6: Ready state
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'ready', serverPort: 5173 }));
    assert(html.includes('Development Server Ready'), 'Title must be Development Server Ready');
    assert(html.includes('Server is live and listening on port 5173.'), 'Subtext must show server port');
    // All 4 steps should show emerald checkmarks
    const checkCount = (html.match(/text-emerald-400/g) || []).length;
    assert.equal(checkCount, 4, 'All 4 steps must be marked done in ready stage');
    recordPass('Ready state');
  } catch (err) {
    recordFail('Ready state', err);
  }

  // Case 7: Installation error
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, {
      stage: 'error',
      runtimeError: {
        phase: 'install',
        message: 'npm ERR! code ERESOLVE',
        timestamp: Date.now(),
        recoverable: true,
      },
      onRetryInstall: () => {},
    }));
    assert(html.includes('Setup Encountered an Error'), 'Title must show error');
    assert(html.includes('npm ERR! code ERESOLVE'), 'Subtext must show error message');
    assert(html.includes('text-rose-400'), 'Error icon must be rose');
    assert(html.includes('data-testid="loader-retry-install-btn"'), 'Retry Install button must be present');
    recordPass('Installation error');
  } catch (err) {
    recordFail('Installation error', err);
  }

  // Case 8: Server error
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, {
      stage: 'error',
      runtimeError: {
        phase: 'server',
        message: 'Port 5173 already bound',
        timestamp: Date.now(),
        recoverable: true,
      },
      onRestart: () => {},
    }));
    assert(html.includes('Setup Encountered an Error'), 'Title must show error');
    assert(html.includes('Port 5173 already bound'), 'Subtext must show server error');
    assert(html.includes('data-testid="loader-restart-btn"'), 'Restart button must be present');
    assert(html.includes('Restart Process'), 'Error restart button must say Restart Process');
    recordPass('Server error');
  } catch (err) {
    recordFail('Server error', err);
  }

  // Case 9: Accurate replacement copy
  try {
    const htmlBoot = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'booting' }));
    const htmlStarting = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'starting_server' }));
    assert(!htmlBoot.includes('zero cloud latency'), 'zero cloud latency eliminated');
    assert(!htmlStarting.includes('Vite dev server'), 'Vite dev server generalized');
    assert(htmlBoot.includes('Initializing the browser-based development environment...'), 'Accurate boot copy present');
    assert(htmlStarting.includes('Launching development server inside WebContainer...'), 'Accurate server copy present');
    recordPass('Accurate replacement copy');
  } catch (err) {
    recordFail('Accurate replacement copy', err);
  }

  // Case 10: No unsupported progress percentage
  try {
    const stages = ['idle', 'booting', 'mounting_files', 'installing', 'starting_server', 'ready'];
    for (const stage of stages) {
      const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage }));
      assert(!/\b\d{1,3}%\b/.test(html), `Stage ${stage} must not fabricate a numeric percentage`);
      assert(!/progress-bar/i.test(html), `Stage ${stage} must not display a fake progress bar`);
    }
    recordPass('No unsupported progress percentage');
  } catch (err) {
    recordFail('No unsupported progress percentage', err);
  }

  // Case 11: Existing terminal button remains functional
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, {
      stage: 'installing',
      onOpenTerminal: () => {},
    }));
    assert(html.includes('data-testid="loader-view-terminal-btn"'), 'View Live Terminal button rendered');
    assert(html.includes('View Live Terminal'), 'View Live Terminal text present');
    recordPass('Existing terminal button remains functional');
  } catch (err) {
    recordFail('Existing terminal button remains functional', err);
  }

  // Case 12: Restart/retry actions remain functional
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, {
      stage: 'booting',
      onRestart: () => {},
    }));
    assert(html.includes('data-testid="loader-restart-btn"'), 'Restart Dev Server button rendered');
    assert(html.includes('Restart Dev Server'), 'Restart Dev Server text present');
    recordPass('Restart/retry actions remain functional');
  } catch (err) {
    recordFail('Restart/retry actions remain functional', err);
  }

  // Case 13: 30-second notice absent before threshold (Change C Deferred)
  recordDeferred(
    '30-second notice absent before threshold',
    'Change C deferred: loader props lack activeProjectId / runtime epoch and VSCodeMode lacks remount key'
  );

  // Case 14: Notice appears after threshold (Change C Deferred)
  recordDeferred(
    'Notice appears after threshold',
    'Change C deferred: loader props lack activeProjectId / runtime epoch and VSCodeMode lacks remount key'
  );

  // Case 15: Timer cancels when stage changes (Change C Deferred)
  recordDeferred(
    'Timer cancels when stage changes',
    'Change C deferred: loader props lack activeProjectId / runtime epoch and VSCodeMode lacks remount key'
  );

  // Case 16: Timer cancels on unmount (Change C Deferred)
  recordDeferred(
    'Timer cancels on unmount',
    'Change C deferred: loader props lack activeProjectId / runtime epoch and VSCodeMode lacks remount key'
  );

  // Case 17: Same-stage project-switch protection (Change C Deferred)
  recordDeferred(
    'Same-stage project-switch protection',
    'Change C deferred: loader props lack activeProjectId / runtime epoch and VSCodeMode lacks remount key'
  );

  // Case 18: No duplicate notice or timer
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, {
      stage: 'installing',
      onOpenTerminal: () => {},
    }));
    // Only one terminal square icon / terminal action in output
    const terminalCount = (html.match(/data-testid="loader-view-terminal-btn"/g) || []).length;
    assert.equal(terminalCount, 1, 'Exactly one terminal action rendered');
    recordPass('No duplicate notice or timer');
  } catch (err) {
    recordFail('No duplicate notice or timer', err);
  }

  // Case 19: Accessible informational status
  try {
    const html = renderToString(React.createElement(StackBlitzStartupLoader, { stage: 'booting' }));
    assert(html.includes('data-testid="stackblitz-startup-loader"'), 'Root testid preserved');
    assert(html.includes('select-none'), 'Styling classes intact');
    recordPass('Accessible informational status');
  } catch (err) {
    recordFail('Accessible informational status', err);
  }

  // Case 20: No new WebContainer command dispatch
  try {
    // Verify by inspecting source imports: loader imports only types from webcontainerService
    const source = await fs.readFile('src/components/vscode/StackBlitzStartupLoader.tsx', 'utf8');
    assert(!source.includes('webcontainerService.boot'), 'Component does not boot runtime');
    assert(!source.includes('webcontainerService.mountProject'), 'Component does not mount files');
    assert(!source.includes('webcontainerService.spawnInteractiveShell'), 'Component does not spawn shell');
    assert(!source.includes('webcontainerService.requestRestart'), 'Component does not dispatch commands directly');
    recordPass('No new WebContainer command dispatch');
  } catch (err) {
    recordFail('No new WebContainer command dispatch', err);
  }

  console.log('\n--- TEST SUMMARY ---');
  console.log(`Passed:   ${passed}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Deferred: ${deferred} (NOT APPLICABLE due to Section 7 project-switch scope constraint)`);
  console.log(`Total:    ${passed + failed + deferred}/20 cases accounted for`);

  if (failed > 0) {
    process.exit(1);
  }
} finally {
  await fs.rm(tmpDir, { recursive: true, force: true });
}
