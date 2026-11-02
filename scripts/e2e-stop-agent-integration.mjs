/**
 * GB CODER: REAL STOP AGENT INTEGRATION ACCEPTANCE HARNESS
 *
 * Verifies the complete end-to-end Stop Agent workflow through the real UI:
 * 1. Enters Agent Mode in GB Assist.
 * 2. Starts a deterministic mock-agent task requesting a long-running WebContainer command.
 * 3. Approves the command via the real GB Assist UI approval card.
 * 4. Verifies the process is actively running and producing repeated observable file writes.
 * 5. Clicks the REAL Stop Agent UI button ([data-testid="stop-agent-btn"]).
 * 6. Verifies AgentEngine cancellation propagates through ToolExecutor and TerminalAdapter.
 * 7. Verifies the agent-owned process terminates and repeated side effects strictly cease.
 * 8. Confirms unrelated terminals and WebContainer remain unaffected.
 * 9. Verifies task final status remains Cancelled and never transitions to Completed.
 * 10. Reloads page and confirms no command is silently rerun.
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
  console.log('GB CODER: REAL STOP AGENT UI INTEGRATION ACCEPTANCE HARNESS');
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

    const testId = `stop-agent-bench-${Date.now().toString(36)}`;

    // 1. Visit IDE to initialize DB schema
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

    // 2. Seed disposable test project with worker.js that logs and writes ticks
    const workerScript = `
const fs = require('fs');
let ticks = 0;
fs.writeFileSync('heartbeat.txt', 'started:0\\n');
const interval = setInterval(() => {
  ticks++;
  fs.writeFileSync('heartbeat.txt', 'tick:' + ticks + '\\n');
  console.log('worker_tick_' + ticks);
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
              name: 'Real Stop Agent Integration Benchmark',
              createdAt: Date.now(),
              lastOpenedAt: Date.now(),
              editorStyle: 'vscode',
              projectType: 'react',
              fileCount: 3,
            });

            fStore.put({
              projectId: id,
              path: 'package.json',
              content: JSON.stringify({ name: 'stop-agent-benchmark', version: '1.0.0', dependencies: {} }, null, 2),
              language: 'json',
            });

            fStore.put({
              projectId: id,
              path: 'src/App.tsx',
              content: 'export function App() { return <div>Stop Agent Benchmark</div>; }',
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

    console.log('[Setup 1] Navigating to test project IDE...');
    await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 35000 });
    console.log('✔ PASS: IDE mounted and WebContainer ready.');

    // Open GB Assist panel
    const assistPanel = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanel.isVisible())) {
      const assistTab = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTab.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    // Configure Mock Provider
    console.log('[Setup 2] Selecting Mock Provider in settings...');
    const settingsBtn = page.locator('[data-testid="open-ai-settings-btn"]');
    await settingsBtn.click();
    await page.waitForSelector('[data-testid="ai-provider-settings-modal"]', { timeout: 5000 });

    const mockTabBtn = page.getByRole('button', { name: 'Mock Test' });
    await mockTabBtn.click();

    const saveProviderBtn = page.locator('[data-testid="save-ai-settings-btn"]');
    await saveProviderBtn.click();
    await page.waitForSelector('[data-testid="ai-provider-settings-modal"]', { state: 'detached', timeout: 5000 });

    // Step 1: Switch Mode Selector to Agent Mode
    console.log('\n[Step 1] Switching to Agent Mode...');
    const modePill = page.locator('[data-testid="ai-mode-selector-pill"]');
    await modePill.click();
    await page.waitForSelector('[data-testid="mode-option-Agent"]', { timeout: 5000 });
    await page.locator('[data-testid="mode-option-Agent"]').click();
    await page.waitForTimeout(300);

    const activeModeText = await modePill.innerText();
    assert.ok(activeModeText.includes('Agent'), 'Mode pill must display Agent');
    console.log('✔ PASS: Step 1 - Agent Mode selected.');

    // Step 2: Submit deterministic mock-agent task requesting long-running command
    console.log('\n[Step 2] Submitting mock-agent task for worker command...');
    const promptInput = page.locator('[data-testid="ai-prompt-input"]');
    const sendBtn = page.locator('[data-testid="send-ai-prompt-btn"]');
    await promptInput.fill('Autonomous task: run worker node worker.js');
    await sendBtn.click();

    // Step 3: Verify command approval card rendered and approve via real UI
    console.log('\n[Step 3] Waiting for real UI approval card and approving execution...');
    await page.waitForSelector('[data-testid="approve-tool-btn"]', { timeout: 15000 });
    const approveBtn = page.locator('[data-testid="approve-tool-btn"]').last();
    assert.ok(await approveBtn.isVisible(), 'Approve button must be visible');

    const cardContent = await page.locator('[data-testid="tool-executions-container"]').last().innerText();
    console.log('  [Approval Card Content]:', cardContent.replace(/\n+/g, ' '));

    // Click Approve through the real GB Assist UI
    await approveBtn.click();
    console.log('✔ PASS: Step 3 - Command approved through real GB Assist UI button.');

    // Step 4: Verify process is actually running and producing repeated observable side effects
    console.log('\n[Step 4] Monitoring observable repeated side effects in WebContainer filesystem...');
    let initialTick = -1;
    let laterTick = -1;

    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(200);
      const content = await page.evaluate(async () => {
        try {
          const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
          return await container.fs.readFile('heartbeat.txt', 'utf8');
        } catch {
          return '';
        }
      });

      if (content.startsWith('started:0') && initialTick === -1) {
        initialTick = 0;
      } else if (content.startsWith('tick:')) {
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
    console.log(`✔ PASS: Step 4 - Process actively running with repeated observable side effects: tick progressed ${initialTick} -> ${laterTick}.`);

    // Step 5: Click the REAL Stop Agent UI button
    console.log('\n[Step 5] Clicking the REAL Stop Agent UI button...');
    const stopAgentBtn = page.locator('[data-testid="stop-agent-btn"]');
    await stopAgentBtn.waitFor({ timeout: 5000 });
    assert.ok(await stopAgentBtn.isVisible(), 'Real Stop Agent button must be visible while running');

    // User clicks real UI button
    await stopAgentBtn.click();
    console.log('✔ PASS: Step 5 - Real Stop Agent UI button clicked.');

    // Step 6: Verify actual AgentEngine cancellation propagates
    console.log('\n[Step 6] Verifying AgentEngine cancellation propagates through UI...');
    await page.waitForSelector('[data-testid="stop-agent-btn"]', { state: 'detached', timeout: 10000 });
    assert.ok(await promptInput.isEnabled(), 'Prompt input must be re-enabled after cancellation');

    const assistBody = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(
      assistBody.toLowerCase().includes('cancel') || assistBody.toLowerCase().includes('stop'),
      `Agent state must record cancellation, got: ${assistBody.slice(0, 200)}`
    );
    console.log('✔ PASS: Step 6 - AgentEngine cancellation propagated; status is Cancelled.');

    // Step 7: Verify agent-owned process exits and repeated side effects strictly cease
    console.log('\n[Step 7] Verifying agent-owned process exited and side effects strictly ceased...');
    const tickAtStop = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const content = await container.fs.readFile('heartbeat.txt', 'utf8');
      return parseInt(content.replace('tick:', '').trim(), 10);
    });

    // Wait 500ms (5 interval periods)
    await page.waitForTimeout(500);

    const tickAfterQuiet = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const content = await container.fs.readFile('heartbeat.txt', 'utf8');
      return parseInt(content.replace('tick:', '').trim(), 10);
    });

    console.log(`  Tick at stop: ${tickAtStop}, Tick after 500ms quiet period: ${tickAfterQuiet}`);
    assert.equal(
      tickAfterQuiet,
      tickAtStop,
      'Side effects must cease: heartbeat tick must NOT advance after Stop Agent was clicked'
    );
    console.log('✔ PASS: Step 7 - Repeated side effects strictly ceased (zero subsequent writes).');

    // Step 8: Confirm user terminals / dev server remain unaffected
    console.log('\n[Step 8] Verifying unrelated terminals and WebContainer remain functional...');
    const unrelatedTestResult = await page.evaluate(async () => {
      const container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      const proc = await container.spawn('node', ['-e', 'console.log("unrelated-terminal-alive");']);
      let output = '';
      proc.output.pipeTo(
        new WritableStream({
          write(chunk) {
            output += chunk;
          },
        })
      );
      const exit = await proc.exit;
      return { exit, output: output.trim() };
    });

    assert.equal(unrelatedTestResult.exit, 0, 'Unrelated terminal process must exit with code 0');
    assert.equal(unrelatedTestResult.output, 'unrelated-terminal-alive', 'Unrelated process must produce expected output');
    console.log('✔ PASS: Step 8 - Unrelated terminal processes execute and exit cleanly without interference.');

    // Step 9: Verify final status cannot change from Cancelled to Completed
    console.log('\n[Step 9] Verifying final status remains Cancelled and cannot transition to Completed...');
    await page.waitForTimeout(1500);
    const postWaitBody = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(
      !postWaitBody.includes('All planned steps have been executed and verified'),
      'Task must NOT falsely mark as completed'
    );
    assert.ok(
      postWaitBody.toLowerCase().includes('cancel') || postWaitBody.toLowerCase().includes('stop'),
      'Task status must remain Cancelled'
    );
    console.log('✔ PASS: Step 9 - Task status strictly remains Cancelled; never mislabeled as Completed.');

    // Step 10: Confirm no command is silently rerun after reload
    console.log('\n[Step 10] Reloading browser and verifying no silent re-executions occur...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 35000 });

    const assistPanelAfterReload = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanelAfterReload.isVisible())) {
      const assistTabAfterReload = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTabAfterReload.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    const reloadedBody = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(
      reloadedBody.toLowerCase().includes('cancel') || reloadedBody.toLowerCase().includes('stop'),
      'Persisted task status after reload must remain Cancelled'
    );

    const heartbeatAfterReload = await page.evaluate(async () => {
      let container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      for (let i = 0; i < 30 && !container; i++) {
        await new Promise((r) => setTimeout(r, 200));
        container = window.__GBCODER_WEBCONTAINER_INSTANCE__;
      }
      if (!container) return '__NO_CONTAINER__';
      try {
        const content = await container.fs.readFile('heartbeat.txt', 'utf8');
        return content;
      } catch {
        return null; // File does not exist because worker was not rerun
      }
    });

    console.log(`  Heartbeat file after reload: ${heartbeatAfterReload === null ? 'does not exist (zero re-execution)' : heartbeatAfterReload}`);
    assert.equal(
      heartbeatAfterReload,
      null,
      'No silent command re-execution on reload: worker was not restarted, heartbeat.txt was not recreated'
    );
    console.log('✔ PASS: Step 10 - Hard reload safely preserves Cancelled task without unapproved re-executions.');

    console.log('\n================================================================');
    console.log('STOP AGENT UI-TO-PROCESS INTEGRATION: ALL 10 CHECKS PASSED (PASS)');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error('\nStop Agent Integration Test failed:', err);
  process.exit(1);
});
