/**
 * GB CODER: REAL PROCESS CANCELLATION ACCEPTANCE TEST
 *
 * Verifies real WebContainer process lifecycle cancellation in a real Chromium browser:
 * 1. Approved long-running command starts in a disposable project.
 * 2. Observable repeated side effects occur (heartbeat file written periodically).
 * 3. Process termination is requested (Stop Agent / process.kill signal).
 * 4. WebContainer process termination is confirmed via process.exit.
 * 5. Side effects strictly cease (file stops updating).
 * 6. Unrelated terminals and dev environment remain functional.
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4195;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(Boolean(res.statusCode && res.statusCode < 500));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('GB CODER: REAL PROCESS CANCELLATION ACCEPTANCE HARNESS');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('================================================================\n');

  let serverProcess = null;
  const running = await isServerRunning(BASE_URL);
  if (!running) {
    console.log(`Starting preview server on port ${PORT}...`);
    serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${PORT}`], {
      stdio: 'inherit',
    });
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (await isServerRunning(BASE_URL)) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!ready) {
      throw new Error(`Preview server failed to start on ${BASE_URL} within 10 seconds.`);
    }
    console.log(`Preview server started successfully on ${BASE_URL}.`);
  } else {
    console.log(`Reusing active preview server at ${BASE_URL}.`);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('gbcoder_onboarded', 'true');
      } catch {}
    });

    const page = await context.newPage();
    page.on('console', (msg) => {
      const text = msg.text();
      if (!text.includes('404') && !text.includes('preload') && !text.includes('favicon')) {
        console.log(`  [BROWSER ${msg.type().toUpperCase()}] ${text}`);
      }
    });
    page.on('pageerror', (err) => console.log('  [BROWSER PAGEERROR]', err.message));

    const testId = `cancellation-bench-${Date.now().toString(36)}`;

    // 1. Visit IDE to initialize DB schema
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

    // 2. Seed disposable test project with a worker script that writes periodic heartbeats
    const workerScript = `
const fs = require('fs');
let ticks = 0;
fs.writeFileSync('heartbeat.txt', 'started:0\\n');
const interval = setInterval(() => {
  ticks++;
  fs.writeFileSync('heartbeat.txt', 'tick:' + ticks + '\\n');
}, 100);

process.on('SIGINT', () => {
  clearInterval(interval);
  process.exit(130);
});

process.on('SIGTERM', () => {
  clearInterval(interval);
  process.exit(143);
});
`;

    await page.evaluate(
      ({ id, worker }) => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
            const pStore = tx.objectStore('projects');
            const fStore = tx.objectStore('projectFiles');

            pStore.put({
              id,
              name: 'Real Process Cancellation Benchmark',
              createdAt: Date.now(),
              lastOpenedAt: Date.now(),
              editorStyle: 'vscode',
              projectType: 'react',
              fileCount: 3,
            });

            fStore.put({
              projectId: id,
              path: 'package.json',
              content: JSON.stringify({ name: 'cancellation-benchmark', version: '1.0.0', dependencies: {} }, null, 2),
              language: 'json',
            });

            fStore.put({
              projectId: id,
              path: 'src/App.tsx',
              content: 'export function App() { return <div>Cancellation Test</div>; }',
              language: 'typescript',
            });

            fStore.put({
              projectId: id,
              path: 'worker.js',
              content: worker,
              language: 'javascript',
            });

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        });
      },
      { id: testId, worker: workerScript }
    );

    console.log('[Step 1] Navigating to disposable project IDE...');
    await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 35000 });
    console.log('✔ PASS: IDE mounted and WebContainer ready.');

    // 3. Verify WebContainer instance is available in browser context
    const hasWebContainer = await page.evaluate(() => {
      return Boolean(window.__GBCODER_WEBCONTAINER_INSTANCE__);
    });
    assert.ok(hasWebContainer, 'WebContainer instance must be attached to runtime global');
    console.log('✔ PASS: WebContainer runtime confirmed active.');

    // 4. Start long-running worker process inside WebContainer
    console.log('\n[Step 2] Spawning long-running worker process (node worker.js)...');
    await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const proc = await container.spawn('node', ['worker.js']);
      window.__TEST_WORKER_PROC__ = proc;
      window.__TEST_EXIT_PROMISE__ = proc.exit;
    });

    // 5. Observe repeated side effects occurring
    console.log('[Step 3] Monitoring observable repeated side effects in WebContainer filesystem...');
    let initialTick = -1;
    let laterTick = -1;

    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(150);
      const content = await page.evaluate(async () => {
        try {
          const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
          return await container.fs.readFile('heartbeat.txt', 'utf8');
        } catch {
          return '';
        }
      });

      if (content.startsWith('tick:')) {
        const val = parseInt(content.replace('tick:', '').trim(), 10);
        if (initialTick === -1) {
          initialTick = val;
        } else if (val > initialTick) {
          laterTick = val;
          break;
        }
      }
    }

    assert.ok(initialTick >= 0, `Initial tick must be observed, got: ${initialTick}`);
    assert.ok(laterTick > initialTick, `Later tick (${laterTick}) must exceed initial tick (${initialTick})`);
    console.log(`✔ PASS: Observable repeated side effects confirmed: tick progressed from ${initialTick} to ${laterTick}.`);

    // 6. Stop/Terminate the process via process.kill()
    console.log('\n[Step 4] Initiating process termination (kill signal)...');
    const terminationResult = await page.evaluate(async () => {
      const proc = window.__TEST_WORKER_PROC__;
      const exitPromise = window.__TEST_EXIT_PROMISE__;
      const killStart = performance.now();

      proc.kill();

      const exitCode = await Promise.race([
        exitPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);

      const killDurationMs = Math.round(performance.now() - killStart);
      return {
        exitCode,
        killDurationMs,
        confirmed: exitCode !== null,
      };
    });

    console.log(`  Process termination result: confirmed=${terminationResult.confirmed}, exitCode=${terminationResult.exitCode}, duration=${terminationResult.killDurationMs}ms`);
    assert.ok(terminationResult.confirmed, 'Process exit must be confirmed within safety timeout');
    console.log('✔ PASS: WebContainer process termination confirmed.');

    // 7. Verify side effects strictly cease
    console.log('\n[Step 5] Verifying side effects strictly cease after termination...');
    const tickImmediatelyAfterKill = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const content = await container.fs.readFile('heartbeat.txt', 'utf8');
      return parseInt(content.replace('tick:', '').trim(), 10);
    });

    // Wait an additional 500ms (5 ticks worth)
    await page.waitForTimeout(500);

    const tickAfterQuietPeriod = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const content = await container.fs.readFile('heartbeat.txt', 'utf8');
      return parseInt(content.replace('tick:', '').trim(), 10);
    });

    console.log(`  Tick at termination: ${tickImmediatelyAfterKill}, Tick after 500ms quiet period: ${tickAfterQuietPeriod}`);
    assert.equal(
      tickAfterQuietPeriod,
      tickImmediatelyAfterKill,
      'Side effects must cease: heartbeat tick must not advance after confirmed process termination'
    );
    console.log('✔ PASS: Side effects ceased completely. Zero subsequent writes occurred.');

    // 8. Verify unrelated terminals remain functional
    console.log('\n[Step 6] Verifying unrelated terminals and WebContainer remain functional...');
    const unrelatedTestResult = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const echoProc = await container.spawn('node', ['-e', 'console.log("unrelated terminal ok");']);
      let output = '';
      echoProc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            output += chunk;
          },
        })
      );
      const exit = await echoProc.exit;
      return { exit, output: output.trim() };
    });

    assert.equal(unrelatedTestResult.exit, 0, 'Unrelated process must exit with code 0');
    assert.equal(unrelatedTestResult.output, 'unrelated terminal ok', 'Unrelated process must produce expected output');
    console.log('✔ PASS: Unrelated terminal processes execute and exit cleanly without interference.');

    console.log('\n================================================================');
    console.log('REAL PROCESS CANCELLATION ACCEPTANCE: ALL CHECKS PASSED (PASS)');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error('\nCancellation Acceptance failed:', err);
  process.exit(1);
});
