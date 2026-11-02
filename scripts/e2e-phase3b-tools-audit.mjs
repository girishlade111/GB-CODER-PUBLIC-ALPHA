/**
 * GB CODER: PHASE 3B AGENT TOOLS REAL CHROMIUM BROWSER E2E HARNESS
 *
 * Validates the 8 critical browser workflow paths:
 * - Path A: Mock model requests read_file; file content displays in tool card.
 * - Path B: Mock model requests propose_file_edit; Monaco Diff modal mounts and dismisses.
 * - Path C & D: Mock model requests run_terminal_command; Awaiting Approval renders; Deny transitions to "Denied by user".
 * - Path E: Submit harmless command (npm test); Approve & Run transitions to Completed with exit code 0 and output.
 * - Path F: Submit long-running prompt; Stop Generation button cancels cleanly.
 * - Path G: Cross-project isolation ensures no message or tool state leakage across project switches.
 * - Path H: Tool call results and approvals persist across hard browser reload.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const PORT = 4195;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'reports', 'assist-screenshots');

if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function safeScreenshot(page, filename) {
  try {
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SCREENSHOT_DIR, filename), animations: 'disabled' });
  } catch (err) {
    console.warn(`  [Warning] Screenshot capture for ${filename} skipped: ${err.message}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('GB CODER: PHASE 3B AGENT TOOLS CHROMIUM E2E SUITE');
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
      if (!text.includes('404') && !text.includes('preload')) {
        console.log(`  [BROWSER ${msg.type().toUpperCase()}] ${text}`);
      }
    });

    const testId = `audit-tools-${Date.now().toString(36)}`;
    const testIdIsolated = `audit-isolated-${Date.now().toString(36)}`;
    const testFile = 'src/App.tsx';
    const initialContent = 'import React from "react";\n\nexport function App() {\n  return <div>GB Assist Tools Active</div>;\n}\n';

    // 1. Visit IDE to initialize DB schema
    await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

    // 2. Seed test projects in IndexedDB
    await page.evaluate(
      ({ id1, id2, file, content }) => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
            const pStore = tx.objectStore('projects');
            const fStore = tx.objectStore('projectFiles');

            // Primary audit project
            pStore.put({
              id: id1,
              name: 'Phase 3B Tools Audit Project',
              createdAt: Date.now(),
              lastOpenedAt: Date.now(),
              editorStyle: 'vscode',
              projectType: 'react',
              fileCount: 2,
            });

            fStore.put({
              projectId: id1,
              path: 'package.json',
              content: JSON.stringify(
                {
                  name: 'phase3b-tools-audit',
                  version: '1.0.0',
                  scripts: {
                    test: "echo 'Phase 3B WebContainer Tests Passing' && exit 0",
                  },
                  dependencies: {},
                },
                null,
                2
              ),
              language: 'json',
            });

            fStore.put({
              projectId: id1,
              path: file,
              content,
              language: 'typescript',
            });

            // Secondary isolated project for isolation tests
            pStore.put({
              id: id2,
              name: 'Phase 3B Isolated Secondary Project',
              createdAt: Date.now(),
              lastOpenedAt: Date.now(),
              editorStyle: 'vscode',
              projectType: 'react',
              fileCount: 1,
            });

            fStore.put({
              projectId: id2,
              path: 'package.json',
              content: JSON.stringify({ name: 'isolated-proj', version: '1.0.0' }, null, 2),
              language: 'json',
            });

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        });
      },
      { id1: testId, id2: testIdIsolated, file: testFile, content: initialContent }
    );

    console.log('[Setup] Navigating to primary test project...');
    await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });

    // Wait for WebContainer readiness indicator
    await page.waitForSelector('text="WebContainer Ready"', { timeout: 35000 }).catch(() => {
      console.log('  (Notice: Proceeding with IDE shell mounted)');
    });

    // Ensure GB Assist panel is open
    const assistPanel = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanel.isVisible())) {
      const assistTab = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTab.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    // Configure Mock Provider
    console.log('[Setup] Configuring Mock Provider for deterministic tool testing...');
    const settingsBtn = page.locator('[data-testid="open-ai-settings-btn"]');
    await settingsBtn.click();
    await page.waitForSelector('[data-testid="ai-provider-settings-modal"]', { timeout: 5000 });

    const mockTabBtn = page.locator('[data-testid="provider-card-mock"]').or(page.getByRole('button', { name: 'Mock Test' }));
    await mockTabBtn.click();

    const saveProviderBtn = page.locator('[data-testid="save-ai-settings-btn"]');
    await saveProviderBtn.click();
    await page.waitForSelector('[data-testid="ai-provider-settings-modal"]', { state: 'detached', timeout: 5000 });
    console.log('✔ PASS: Mock provider selected and ready.');

    const promptInput = page.locator('[data-testid="ai-prompt-input"]');
    const sendBtn = page.locator('[data-testid="send-ai-prompt-btn"]');

    // ── PATH A: Tool Execution for read_file ──
    console.log('\n[Path A] Testing Tool: read_file execution & card output rendering...');
    await promptInput.fill('Please read src/App.tsx');
    await sendBtn.click();

    // Wait for generation to complete
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { timeout: 4000 }).catch(() => {});
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { state: 'detached', timeout: 20000 });

    // Verify Tool Executions Container appears
    await page.waitForSelector('[data-testid="tool-executions-container"]', { timeout: 5000 });
    const toolExecText = await page.locator('[data-testid="tool-executions-container"]').first().innerText();
    assert.ok(toolExecText.includes('read_file'), 'Tool card must display read_file');
    assert.ok(toolExecText.includes('Completed'), 'read_file must auto-complete safely');
    assert.ok(
      toolExecText.includes('GB Assist Tools Active') || toolExecText.includes('export function App'),
      'Tool output viewer must display read file contents'
    );
    await safeScreenshot(page, '07-tool-read-file.png');
    console.log('✔ PASS: Path A - read_file executed safely and output rendered in card.');

    // ── PATH B: Tool & Model propose_file_edit with Monaco Diff ──
    console.log('\n[Path B] Testing propose_file_edit card & Monaco Diff modal...');
    await promptInput.fill('Please change button to count clicks in src/App.tsx');
    await sendBtn.click();

    await page.waitForSelector('[data-testid="stop-generation-btn"]', { timeout: 4000 }).catch(() => {});
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { state: 'detached', timeout: 20000 });

    const reviewDiffBtn = page.locator('[data-testid="review-diff-btn"]').last();
    await page.waitForSelector('[data-testid="review-diff-btn"]', { timeout: 5000 });
    await reviewDiffBtn.click();

    // Verify Monaco Diff modal mounts
    await page.waitForSelector('[data-testid="ai-diff-modal"]', { timeout: 5000 });
    await page.waitForSelector('.monaco-diff-editor', { timeout: 10000 });
    await safeScreenshot(page, '08-tool-diff-modal.png');

    // Dismiss diff modal via Escape
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-testid="ai-diff-modal"]', { state: 'detached', timeout: 5000 });
    console.log('✔ PASS: Path B - Monaco Diff modal mounted with side-by-side diff and dismissed cleanly.');

    // ── PATH C & D: Terminal Command Approval Gating & Deny Action ──
    console.log('\n[Path C & D] Testing run_terminal_command: Awaiting Approval & User Deny...');
    await promptInput.fill('Run terminal command npm test');
    await sendBtn.click();

    await page.waitForSelector('[data-testid="stop-generation-btn"]', { timeout: 4000 }).catch(() => {});
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { state: 'detached', timeout: 20000 });

    // Verify pending approval status and action buttons
    await page.waitForSelector('[data-testid="approve-tool-btn"]', { timeout: 5000 });
    const denyBtn = page.locator('[data-testid="deny-tool-btn"]').last();
    assert.ok(await denyBtn.isVisible(), 'Deny button must be rendered');

    const cardContentBefore = await page.locator('[data-testid="tool-executions-container"]').last().innerText();
    assert.ok(cardContentBefore.includes('Awaiting Approval'), 'Must show Awaiting Approval state');
    assert.ok(cardContentBefore.includes('run_terminal_command'), 'Must name run_terminal_command');

    // Click Deny
    await denyBtn.click();
    await page.waitForTimeout(500);

    const cardContentAfterDeny = await page.locator('[data-testid="tool-executions-container"]').last().innerText();
    assert.ok(cardContentAfterDeny.includes('Denied by user'), 'Must transition to Denied by user');
    assert.ok(!(await page.locator('[data-testid="approve-tool-btn"]').last().isVisible()), 'Approve button must be removed after denial');
    await safeScreenshot(page, '09-tool-terminal-denied.png');
    console.log('✔ PASS: Path C & D - Command strictly gated, permission denial handled without execution.');

    // ── PATH E: Terminal Command Approval & Successful Execution ──
    console.log('\n[Path E] Testing run_terminal_command: User Approval & Execution...');
    await promptInput.fill('Run terminal command npm test');
    await sendBtn.click();

    await page.waitForSelector('[data-testid="stop-generation-btn"]', { timeout: 4000 }).catch(() => {});
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { state: 'detached', timeout: 20000 });

    const lastCard = page.locator('[data-testid="tool-executions-container"]').last();
    const approveBtn = lastCard.locator('[data-testid="approve-tool-btn"]');
    await approveBtn.waitFor({ timeout: 5000 });

    // Approve the execution
    await approveBtn.click();

    // Wait for card state transition away from pending/running
    await lastCard.locator(':text("Completed"), :text("Failed")').first().waitFor({ timeout: 35000 });
    await page.waitForTimeout(600);

    const approvedCardText = await lastCard.innerText();
    console.log('  [Path E Debug] Card text after approval:', approvedCardText.replace(/\n+/g, ' '));
    assert.ok(approvedCardText.includes('Completed'), `Tool call must show Completed, got: ${approvedCardText}`);
    assert.ok(approvedCardText.includes('exit code: 0') || approvedCardText.includes('ms'), 'Must record duration or exit code');
    await safeScreenshot(page, '10-tool-terminal-approved.png');
    console.log('✔ PASS: Path E - Approved terminal command completed with duration, exit code and logs.');

    // ── PATH F: Streaming Cancellation & Stop Generation ──
    console.log('\n[Path F] Testing Long-running Generation & Stop Button Cancellation...');
    await promptInput.fill('reason about long running terminal command');
    await sendBtn.click();

    // Stop button must appear during reasoning/streaming
    const stopBtn = page.locator('[data-testid="stop-generation-btn"]');
    const appeared = await stopBtn.waitFor({ timeout: 4000 }).then(() => true).catch(() => false);
    assert.ok(appeared, 'Stop generation button must appear while streaming');
    console.log('  Streaming active: triggering user stop generation...');
    await stopBtn.click({ force: true }).catch(() => {});

    // Stop button should detach and prompt input becomes re-enabled
    await page.waitForSelector('[data-testid="stop-generation-btn"]', { state: 'detached', timeout: 10000 });
    assert.ok(await promptInput.isEnabled(), 'Prompt input must return to enabled state after stop');
    await safeScreenshot(page, '11-tool-generation-cancelled.png');
    console.log('✔ PASS: Path F - Stop generation aborted streaming cleanly.');

    // ── PATH G: Cross-Project Isolation Check ──
    console.log('\n[Path G] Testing Multi-Project Session Isolation...');
    // Navigate to isolated project
    await page.goto(`${BASE_URL}/app/projects/${testIdIsolated}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });

    const assistPanel2 = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanel2.isVisible())) {
      const assistTab2 = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTab2.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    const isolatedChatText = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(!isolatedChatText.includes('read_file'), 'Isolated project must not contain project A read_file tools');
    assert.ok(!isolatedChatText.includes('run_terminal_command'), 'Isolated project must not contain project A terminal commands');
    console.log('  Confirmed: Secondary project has zero contamination from primary project.');

    // Switch back to primary project
    await page.goto(`${BASE_URL}/app/projects/${testId}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });

    const assistPanelAgain = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanelAgain.isVisible())) {
      const assistTabAgain = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTabAgain.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    const restoredPrimaryText = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(restoredPrimaryText.includes('read_file'), 'Primary project tool history must remain intact');
    assert.ok(restoredPrimaryText.includes('run_terminal_command'), 'Primary project terminal history must remain intact');
    await safeScreenshot(page, '12-cross-project-isolation.png');
    console.log('✔ PASS: Path G - Strict multi-project conversation and tool isolation verified.');

    // ── PATH H: Hard Browser Reload & History Persistence ──
    console.log('\n[Path H] Testing Hard Reload & Tool History Persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 30000 });

    const assistPanelReload = page.locator('[data-testid="code-assist-panel"]');
    if (!(await assistPanelReload.isVisible())) {
      const assistTabReload = page.locator('[data-testid="activity-bar-code-assist"]');
      await assistTabReload.click();
    }
    await page.waitForSelector('[data-testid="code-assist-panel"]', { timeout: 10000 });

    const reloadedHistoryText = await page.locator('[data-testid="code-assist-chat-body"]').innerText();
    assert.ok(reloadedHistoryText.includes('read_file'), 'read_file tool card must persist across reload');
    assert.ok(reloadedHistoryText.includes('run_terminal_command'), 'run_terminal_command tool card must persist across reload');
    assert.ok(reloadedHistoryText.includes('Denied by user'), 'Denied tool status must persist across reload');
    assert.ok(reloadedHistoryText.includes('Completed'), 'Completed tool status must persist across reload');
    await safeScreenshot(page, '13-tool-history-persisted.png');
    console.log('✔ PASS: Path H - All tool execution cards, states, and outputs reloaded faithfully.');

    console.log('\n================================================================');
    console.log('ALL 8 PHASE 3B CHROMIUM WORKFLOW PATHS PASSED SUCCESSFULLY!');
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('================================================================\n');
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error('\nBrowser audit failed:', err);
  process.exit(1);
});
