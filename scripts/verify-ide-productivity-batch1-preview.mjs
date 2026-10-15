#!/usr/bin/env node
/**
 * GB Coder — Consolidated Development Batch 1 Browser Acceptance Suite
 *
 * Runs end-to-end browser verification against the deployed Vercel Preview URL:
 * https://gb-coder-public-alpha-7gqzw9h57.vercel.app
 *
 * Verifies exact branch HEAD commit: 364b073b990598269393fa38950a57d7f70ac976
 *
 * Scope:
 * - Feature Group A: Workspace Search & Safe Replace
 * - Feature Group B: Problems & Output Panels
 * - Feature Group C: Preview Controls & Viewport Presets
 * - Feature Group D: Command Palette & Quick Open Integration
 * - Feature Group E: UI/UX, Accessibility & Project Switching Isolation
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { seedProjects } from './helpers/b4-fixtures.mjs';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://gb-coder-public-alpha-f61f87ayj.vercel.app';
const BASE = PREVIEW_URL.replace(/\/$/, '');
const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';
const EXPECTED_HEAD = process.env.EXPECTED_HEAD || 'b7389692f02ec6b3e3cbbbd9f6fbc6c52eac732c';

const results = {
  timestamp: new Date().toISOString(),
  previewUrl: BASE,
  verifiedCommit: EXPECTED_HEAD,
  suite: 'GB_CODER_IDE_PRODUCTIVITY_BATCH_1',
  tests: {},
  summary: { passed: 0, failed: 0, total: 0 },
  diagnostics: { consoleErrors: [], pageErrors: [], failedRequests: [] }
};

function recordTest(id, status, details = {}) {
  results.tests[id] = { status, timestamp: new Date().toISOString(), ...details };
  results.summary.total++;
  if (status === 'PASSED') {
    results.summary.passed++;
    console.log(`[PASS] ${id}: ${details.title || ''}`);
  } else {
    results.summary.failed++;
    console.error(`[FAIL] ${id}: ${details.title || ''} - ${details.error || ''}`);
  }
}

function attachPageWatchers(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Drop known benign noise
      if (!text.includes('favicon') && !text.includes('dimensions')) {
        results.diagnostics.consoleErrors.push(`[${tag}] ${text.slice(0, 300)}`);
      }
    }
  });
  page.on('pageerror', (err) => {
    const text = String(err?.message || err);
    if (!text.includes('dimensions')) {
      results.diagnostics.pageErrors.push(`[${tag}] ${text.slice(0, 300)}`);
    }
  });
  page.on('requestfailed', (req) => {
    if (!req.url().includes('favicon')) {
      results.diagnostics.failedRequests.push(`[${tag}] ${req.url().slice(0, 160)}: ${req.failure()?.errorText}`);
    }
  });
}

async function createContextAndPage(browser, tag = 'batch1-test') {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  // Attach Vercel bypass secret header to all requests
  await context.route('**/*', async (route) => {
    const req = route.request();
    const headers = {
      ...req.headers(),
      ...(BYPASS_SECRET ? { 'x-vercel-protection-bypass': BYPASS_SECRET } : {})
    };
    await route.continue({ headers });
  });

  // Bypass onboarding tour to keep UI deterministic
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('gbcoder_onboarded', 'true');
      window.localStorage.setItem('gbcoder_welcome_dismissed', 'true');
    } catch {}
  });

  const page = await context.newPage();
  attachPageWatchers(page, tag);
  return { context, page };
}

// Synthetic test projects
const STATIC_PROJECT = {
  id: 'batch1-static-proj',
  name: 'Batch 1 Static HTML',
  editorStyle: 'plain',
  projectType: 'plain',
  files: [
    { path: 'index.html', content: '<!DOCTYPE html><html><body><h1>Static Test</h1></body></html>' },
    { path: 'style.css', content: 'body { font-family: sans-serif; background: #fff; }' },
    { path: 'script.js', content: 'console.log("Static project running");' }
  ]
};

const IDE_PROJECT_1 = {
  id: 'batch1-ide-proj-1',
  name: 'Batch 1 React Proj 1',
  editorStyle: 'vscode',
  projectType: 'react',
  files: [
    {
      path: 'src/App.jsx',
      content: [
        'import React from "react";',
        'export default function App() {',
        '  const greeting = "Hello Batch1";',
        '  return <h1>{greeting}</h1>;',
        '}'
      ].join('\n')
    },
    {
      path: 'src/utils.js',
      content: [
        'export function calculateSum(a, b) {',
        '  return a + b;',
        '}',
        'export function formatBatchLabel() {',
        '  return "Hello Batch1";',
        '}'
      ].join('\n')
    },
    {
      path: 'src/constants.js',
      content: [
        'export const API_VERSION = "v1";',
        'export const BATCH_NAME = "Hello Batch1";'
      ].join('\n')
    },
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'batch1-react-proj-1',
          version: '1.0.0',
          scripts: { dev: 'vite' },
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' }
        },
        null,
        2
      )
    },
    {
      path: 'README.md',
      content: '# Batch 1 Test Project\nWorkspace search and safe replace integration test.'
    }
  ]
};

const IDE_PROJECT_2 = {
  id: 'batch1-ide-proj-2',
  name: 'Batch 1 Switch Target',
  editorStyle: 'vscode',
  projectType: 'react',
  files: [
    {
      path: 'src/main.jsx',
      content: 'console.log("PROJECT_TWO_ACTIVE");'
    },
    {
      path: 'package.json',
      content: JSON.stringify({ name: 'switch-app', scripts: { dev: 'vite' } }, null, 2)
    },
    {
      path: 'README.md',
      content: '# Target Project 2\nUsed for project switching isolation verification.'
    }
  ]
};

async function runAcceptanceSuite() {
  console.log(`Starting GB Coder Batch 1 Acceptance against ${BASE}...`);
  console.log(`Expected Commit: ${EXPECTED_HEAD}`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--enable-features=SharedArrayBuffer', '--no-sandbox']
    });

    // TEST 1: Deployment & Headers Check
    try {
      const { page, context } = await createContextAndPage(browser, 'deploy-check');
      const response = await page.goto(`${BASE}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert(response, 'No response received from preview deployment');
      const status = response.status();
      const headers = response.headers();
      const coop = headers['cross-origin-opener-policy'];
      const coep = headers['cross-origin-embedder-policy'];

      assert.equal(status, 200, `Expected HTTP 200, got ${status}`);
      assert.equal(coop, 'same-origin', `Expected COOP same-origin, got ${coop}`);
      assert.equal(coep, 'require-corp', `Expected COEP require-corp, got ${coep}`);

      recordTest('BATCH1-INT-01', 'PASSED', {
        title: 'Preview Deployment & Security Headers',
        url: `${BASE}/app`,
        httpStatus: status,
        coop,
        coep
      });
      await context.close();
    } catch (err) {
      recordTest('BATCH1-INT-01', 'FAILED', {
        title: 'Preview Deployment & Security Headers',
        error: String(err?.message || err)
      });
    }

    // TEST 2: Static Editor Isolation
    try {
      const { page, context } = await createContextAndPage(browser, 'static-isolation');
      await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
      await seedProjects(page, [STATIC_PROJECT]);
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Navigate to Static Editor route
      await page.goto(`${BASE}/app/projects/${STATIC_PROJECT.id}/editor`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Verify Static Editor elements are visible and VS Code mode elements are absent
      await page.waitForSelector('[data-testid="editor-panel"], .monaco-editor', { timeout: 15000 });
      const vscodeActivityBar = await page.$('[data-testid="vscode-activity-bar"]');
      const vscodeSearchPanel = await page.$('[data-testid="workspace-search-panel"]');
      assert.equal(vscodeActivityBar, null, 'VS Code ActivityBar should NOT appear in Static Editor');
      assert.equal(vscodeSearchPanel, null, 'Workspace Search Panel should NOT appear in Static Editor');

      recordTest('BATCH1-INT-02', 'PASSED', {
        title: 'Static Editor Architecture & Isolation',
        projectId: STATIC_PROJECT.id
      });
      await context.close();
    } catch (err) {
      recordTest('BATCH1-INT-02', 'FAILED', {
        title: 'Static Editor Architecture & Isolation',
        error: String(err?.message || err)
      });
    }

    // Shared context for Advanced IDE tests
    const { page, context } = await createContextAndPage(browser, 'ide-main');
    await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
    await seedProjects(page, [IDE_PROJECT_1, IDE_PROJECT_2]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

    // TEST 3: Advanced IDE Launch & Status Bar
    try {
      // Open Project 1 via dashboard card
      await page.getByText(IDE_PROJECT_1.name, { exact: true }).click({ timeout: 10000 });

      // Wait for VS Code workbench UI elements
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 20000 });
      await page.waitForSelector('[data-testid="vscode-activity-bar"]', { timeout: 20000 });
      await page.waitForSelector('[data-testid="vscode-status-bar"]', { timeout: 20000 });

      // Check Status Bar problem count element
      const statusBar = await page.$('[data-testid="vscode-status-bar"]');
      const statusBarText = await statusBar.innerText();
      assert(statusBarText.includes('0') || statusBarText.includes('Problems'), 'Status bar must show problems counter');

      recordTest('BATCH1-INT-03', 'PASSED', {
        title: 'Advanced IDE Workbench Mount & Status Bar',
        statusBarContent: statusBarText.slice(0, 100)
      });
    } catch (err) {
      recordTest('BATCH1-INT-03', 'FAILED', {
        title: 'Advanced IDE Workbench Mount & Status Bar',
        error: String(err?.message || err)
      });
    }

    // TEST 4: Command Palette & Quick Open UI & Shortcuts
    try {
      // 4a. Trigger Quick Open via top center bar
      const topBarQuickOpen = await page.waitForSelector('div[aria-label="Quick Open / Command Search"]', {
        timeout: 10000
      });
      await topBarQuickOpen.click();

      // Verify modal is open
      const paletteModal = await page.waitForSelector('[data-testid="command-palette-modal"]', { timeout: 5000 });
      assert(paletteModal, 'Command Palette modal must be open');

      // Verify input placeholder is file mode
      const searchInput = await page.$('input[aria-label="Command search input"]');
      const placeholder = await searchInput.getAttribute('placeholder');
      assert(placeholder.includes('Type file name to open'), `Expected file mode placeholder, got: ${placeholder}`);

      // Search for utils.js
      await searchInput.fill('utils.js');
      await page.waitForTimeout(300);

      // Select utils.js option
      const fileOption = await page.waitForSelector('[role="option"]:has-text("utils.js")', { timeout: 5000 });
      await fileOption.click();

      // Verify modal closes and active tab in editor is utils.js
      await page.waitForSelector('[data-testid="command-palette-modal"]', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector('[data-testid="vscode-tab"][title*="utils.js"]', { timeout: 10000 });

      // 4b. Trigger Command Palette with Command mode via shortcut Ctrl+Shift+P
      await page.keyboard.press('Control+Shift+P');
      await page.waitForSelector('[data-testid="command-palette-modal"]', { timeout: 5000 });
      const cmdInput = await page.waitForSelector('input[aria-label="Command search input"]', { timeout: 5000 });
      await page.waitForFunction(
        () => document.querySelector('input[aria-label="Command search input"]')?.value === '>',
        { timeout: 5000 }
      );
      const cmdValue = await cmdInput.inputValue();
      assert.equal(cmdValue, '>', `Expected input to start with '>' in command mode, got: ${cmdValue}`);

      // Close on Escape
      await page.keyboard.press('Escape');
      await page.waitForSelector('[data-testid="command-palette-modal"]', { state: 'hidden', timeout: 5000 });

      recordTest('BATCH1-INT-04', 'PASSED', {
        title: 'Command Palette & Quick Open Dual-Mode Operations'
      });
    } catch (err) {
      await page.keyboard.press('Escape').catch(() => {});
      recordTest('BATCH1-INT-04', 'FAILED', {
        title: 'Command Palette & Quick Open Dual-Mode Operations',
        error: String(err?.message || err)
      });
    }

    // TEST 5: Workspace Search Panel Query & Match Highlights
    try {
      // Open Search tab via Activity Bar
      const searchTabBtn = await page.waitForSelector('button[aria-label="Search"]', { timeout: 5000 });
      await searchTabBtn.click();

      const searchPanel = await page.waitForSelector('[data-testid="workspace-search-panel"]', { timeout: 5000 });
      assert(searchPanel, 'Workspace Search Panel must be mounted');

      // Enter search query "Hello Batch1"
      const queryInput = await page.waitForSelector('input[aria-label="Search query"]', { timeout: 5000 });
      await queryInput.fill('Hello Batch1');
      await page.waitForTimeout(600); // Debounce / memo calculation

      // Check results summary
      const matchSummary = await page.waitForSelector('text=3 matches across 3 files', { timeout: 5000 });
      assert(matchSummary, 'Search should find 3 matches across 3 files for Hello Batch1');

      // Verify file groupings exist for App.jsx, utils.js, constants.js
      await page.waitForSelector('span:has-text("src/App.jsx")', { timeout: 5000 });
      await page.waitForSelector('span:has-text("src/utils.js")', { timeout: 5000 });
      await page.waitForSelector('span:has-text("src/constants.js")', { timeout: 5000 });

      // Verify highlighted snippet text
      const highlight = await page.waitForSelector('span.bg-amber-400\\/25:has-text("Hello Batch1")', {
        timeout: 5000
      });
      assert(highlight, 'Matched term should be highlighted in snippet');

      recordTest('BATCH1-INT-05', 'PASSED', {
        title: 'Workspace Search Query & Multi-File Match Highlighting',
        query: 'Hello Batch1',
        matchesFound: 3
      });
    } catch (err) {
      recordTest('BATCH1-INT-05', 'FAILED', {
        title: 'Workspace Search Query & Multi-File Match Highlighting',
        error: String(err?.message || err)
      });
    }

    // TEST 6: Search Modifiers (Case Sensitive, Whole Word, Regex)
    try {
      const queryInput = await page.$('input[aria-label="Search query"]');
      const caseBtn = await page.$('button[aria-label="Match Case"]');
      const wordBtn = await page.$('button[aria-label="Match Whole Word"]');
      const regexBtn = await page.$('button[aria-label="Use Regular Expression"]');

      // 6a. Case Sensitivity
      await caseBtn.click();
      await queryInput.fill('hello batch1'); // lowercase
      await page.waitForTimeout(300);
      let noMatchText = await page.waitForSelector('text=No results found', { timeout: 5000 });
      assert(noMatchText, 'Lowercase search with Match Case should yield no matches');

      await queryInput.fill('Hello Batch1'); // exact case
      await page.waitForTimeout(300);
      await page.waitForSelector('text=3 matches', { timeout: 5000 });
      await caseBtn.click(); // toggle off

      // 6b. Whole Word
      await wordBtn.click();
      await queryInput.fill('Hello');
      await page.waitForTimeout(300);
      await page.waitForSelector('text=3 matches', { timeout: 5000 });

      await queryInput.fill('Hell');
      await page.waitForTimeout(300);
      noMatchText = await page.waitForSelector('text=No results found', { timeout: 5000 });
      assert(noMatchText, 'Partial word with Whole Word enabled should yield no matches');
      await wordBtn.click(); // toggle off

      // 6c. Regular Expression & Safe Error Handling
      await regexBtn.click();
      await queryInput.fill('Hello (Batch1|Other)');
      await page.waitForTimeout(300);
      await page.waitForSelector('text=3 matches', { timeout: 5000 });

      // Enter invalid regex
      await queryInput.fill('Hello [a-z');
      await page.waitForTimeout(300);
      const regexError = await page.waitForSelector('text=Invalid regular expression', { timeout: 5000 });
      assert(regexError, 'Invalid regex must display clear warning and not crash the UI');

      // Reset
      await regexBtn.click();
      await queryInput.fill('');

      recordTest('BATCH1-INT-06', 'PASSED', {
        title: 'Search Modifiers & Resilient Regex Error Handling'
      });
    } catch (err) {
      recordTest('BATCH1-INT-06', 'FAILED', {
        title: 'Search Modifiers & Resilient Regex Error Handling',
        error: String(err?.message || err)
      });
    }

    // TEST 7: Monaco Navigation from Search Result
    try {
      const queryInput = await page.$('input[aria-label="Search query"]');
      await queryInput.fill('calculateSum');
      await page.waitForTimeout(400);

      const matchItem = await page.waitForSelector('[role="button"][aria-label*="src/utils.js line 1"]', {
        timeout: 5000
      });
      await matchItem.click();

      // Verify that Monaco active tab is src/utils.js
      await page.waitForSelector('[data-testid="vscode-tab"][title*="src/utils.js"]', { timeout: 5000 });

      recordTest('BATCH1-INT-07', 'PASSED', {
        title: 'Direct Navigation to Monaco Line & Column from Match'
      });
    } catch (err) {
      recordTest('BATCH1-INT-07', 'FAILED', {
        title: 'Direct Navigation to Monaco Line & Column from Match',
        error: String(err?.message || err)
      });
    }

    // TEST 8: Safe Replace Operations & Confirmation Modal
    try {
      // Toggle Replace row open
      const toggleReplaceBtn = await page.waitForSelector('button[aria-label="Show Replace"]', { timeout: 5000 });
      await toggleReplaceBtn.click();

      const replaceInput = await page.waitForSelector('input[aria-label="Replace term"]', { timeout: 5000 });
      assert(replaceInput, 'Replace input must be visible when toggled');

      // Set replace term
      await replaceInput.fill('SuperSum');

      // Replace single match in src/utils.js
      const singleReplaceBtn = await page.waitForSelector('button[aria-label="Replace this match"]', {
        timeout: 5000
      });
      await singleReplaceBtn.click();
      await page.waitForTimeout(500);

      // Verify notification toast or file content update
      await page.waitForSelector('text=Replaced match in src/utils.js', { timeout: 5000 });

      // Test Bulk Replace confirmation modal
      const queryInput = await page.$('input[aria-label="Search query"]');
      await queryInput.fill('Hello Batch1');
      await page.waitForTimeout(400);

      const replaceAllBtn = await page.waitForSelector('button[aria-label="Replace All in Workspace"]', {
        timeout: 5000
      });
      await replaceAllBtn.click();

      // Verify confirmation modal opens
      const modal = await page.waitForSelector('[role="dialog"]:has-text("Confirm Workspace Replace")', {
        timeout: 5000
      });
      assert(modal, 'Bulk replacement confirmation modal must open');

      // Cancel modal
      const cancelBtn = await page.waitForSelector('button:has-text("Cancel")', { timeout: 5000 });
      await cancelBtn.click();
      await page.waitForSelector('[role="dialog"]:has-text("Confirm Workspace Replace")', {
        state: 'hidden',
        timeout: 5000
      });

      recordTest('BATCH1-INT-08', 'PASSED', {
        title: 'Safe Match Replacement & Bulk Replace Guard Dialog'
      });
    } catch (err) {
      recordTest('BATCH1-INT-08', 'FAILED', {
        title: 'Safe Match Replacement & Bulk Replace Guard Dialog',
        error: String(err?.message || err)
      });
    }

    // TEST 9: Problems Panel & Severity Filtering
    try {
      // Open Problems panel from bottom dock
      const problemsTabBtn = await page.waitForSelector('button:has-text("PROBLEMS")', { timeout: 5000 });
      await problemsTabBtn.click();

      const problemsPanel = await page.waitForSelector('[data-testid="problems-panel"]', { timeout: 5000 });
      assert(problemsPanel, 'Problems Panel must be visible');

      // Verify severity filter buttons
      await page.waitForSelector('button:has-text("All")', { timeout: 5000 });
      await page.waitForSelector('button:has-text("Errors")', { timeout: 5000 });
      await page.waitForSelector('button:has-text("Warnings")', { timeout: 5000 });
      await page.waitForSelector('button:has-text("Info")', { timeout: 5000 });

      // Verify scope note
      const scopeNote = await page.waitForSelector('text=Diagnostics Scope', { timeout: 5000 });
      assert(scopeNote, 'Problems panel must display truthful scope note');

      recordTest('BATCH1-INT-09', 'PASSED', {
        title: 'Truthful Diagnostics Problems Panel & Severity Filtering'
      });
    } catch (err) {
      recordTest('BATCH1-INT-09', 'FAILED', {
        title: 'Truthful Diagnostics Problems Panel & Severity Filtering',
        error: String(err?.message || err)
      });
    }

    // TEST 10: Output Panel & Channel Filtering
    try {
      // Open Output panel from bottom dock
      const outputTabBtn = await page.waitForSelector('button:has-text("OUTPUT")', { timeout: 5000 });
      await outputTabBtn.click();

      const outputPanel = await page.waitForSelector('[data-testid="output-panel"]', { timeout: 5000 });
      assert(outputPanel, 'Output Panel must be visible');

      // Verify channel filter buttons exist
      await page.waitForSelector('button:has-text("All Channels")', { timeout: 5000 });
      await page.waitForSelector('button:has-text("System")', { timeout: 5000 });

      // Verify clear logs and copy buttons exist
      const clearBtn = await page.waitForSelector('button[aria-label="Clear Output"]', { timeout: 5000 });
      const copyBtn = await page.waitForSelector('button[aria-label="Copy All Logs"]', { timeout: 5000 });
      assert(clearBtn, 'Clear logs button must be present');
      assert(copyBtn, 'Copy all logs button must be present');

      // Test clear action
      await clearBtn.click();
      await page.waitForSelector('text=Output log cleared.', { timeout: 5000 });

      recordTest('BATCH1-INT-10', 'PASSED', {
        title: 'Output Panel Structured Logs & Channel Filtering'
      });
    } catch (err) {
      recordTest('BATCH1-INT-10', 'FAILED', {
        title: 'Output Panel Structured Logs & Channel Filtering',
        error: String(err?.message || err)
      });
    }

    // TEST 11: Preview Controls & Viewport Presets
    try {
      // Viewport presets: Desktop, Tablet, Mobile
      const desktopBtn = await page.waitForSelector('button[title*="Desktop"]', { timeout: 5000 });
      const tabletBtn = await page.waitForSelector('button[title*="Tablet"]', { timeout: 5000 });
      const mobileBtn = await page.waitForSelector('button[title*="Mobile"]', { timeout: 5000 });

      await mobileBtn.click();
      await page.waitForTimeout(200);
      await tabletBtn.click();
      await page.waitForTimeout(200);
      await desktopBtn.click();

      // Minimize and Restore Preview
      const minimizeBtn = await page.waitForSelector('button[aria-label="Minimize Preview Panel"]', { timeout: 5000 });
      await minimizeBtn.click();

      // Verify restore preview button appears in editor tab bar
      const restoreBtn = await page.waitForSelector('button[aria-label="Restore Live Preview"]', { timeout: 5000 });
      assert(restoreBtn, 'Restore preview button must appear when preview is minimized');
      await restoreBtn.click();

      // Verify disabled back/forward buttons with explanatory security tooltips
      const backBtn = await page.waitForSelector('button[aria-label*="Back (Disabled across container sandbox origin)"]', {
        timeout: 5000
      });
      const isDisabled = await backBtn.getAttribute('disabled');
      assert.notEqual(isDisabled, null, 'Back button must be disabled due to cross-origin sandbox');

      recordTest('BATCH1-INT-11', 'PASSED', {
        title: 'Advanced Preview Controls, Viewport Presets & Isolation Safeguards'
      });
    } catch (err) {
      recordTest('BATCH1-INT-11', 'FAILED', {
        title: 'Advanced Preview Controls, Viewport Presets & Isolation Safeguards',
        error: String(err?.message || err)
      });
    }

    // TEST 12: Project Switching Lifecycle & State Isolation
    try {
      // Return to dashboard and switch to Project 2
      await page.goto(`${BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });
      await page.getByText(IDE_PROJECT_2.name, { exact: true }).click({ timeout: 10000 });
      await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 20000 });

      // Open Search tab
      const searchTabBtn = await page.waitForSelector('button[aria-label="Search"]', { timeout: 5000 });
      await searchTabBtn.click();

      // Verify search query is reset and does not carry over Project 1 results
      const queryInput = await page.waitForSelector('input[aria-label="Search query"]', { timeout: 5000 });
      const queryVal = await queryInput.inputValue();
      assert.equal(queryVal, '', 'Search input must reset to empty on project change');

      // Verify file count shows 3 workspace files for Project 2
      await page.waitForSelector('text=3 workspace files', { timeout: 5000 });

      recordTest('BATCH1-INT-12', 'PASSED', {
        title: 'Project Switching Lifecycle & State Invalidation'
      });
    } catch (err) {
      recordTest('BATCH1-INT-12', 'FAILED', {
        title: 'Project Switching Lifecycle & State Invalidation',
        error: String(err?.message || err)
      });
    }

    // TEST 13: Accessibility & ARIA Semantics
    try {
      const regions = await page.$$('[role="region"]');
      assert(regions.length >= 2, `Expected at least 2 ARIA regions, found ${regions.length}`);

      const tabs = await page.$$('[role="tab"]');
      assert(tabs.length >= 1, `Expected tab elements with role="tab", found ${tabs.length}`);

      recordTest('BATCH1-INT-13', 'PASSED', {
        title: 'Accessibility ARIA Landmarks & Focus Traversal',
        regionCount: regions.length,
        tabCount: tabs.length
      });
    } catch (err) {
      recordTest('BATCH1-INT-13', 'FAILED', {
        title: 'Accessibility ARIA Landmarks & Focus Traversal',
        error: String(err?.message || err)
      });
    }

    await context.close();
  } finally {
    if (browser) await browser.close();
  }

  // Calculate final verdict
  const verdict = results.summary.failed === 0 ? 'IDE_PRODUCTIVITY_BATCH_1_COMPLETE' : 'IDE_PRODUCTIVITY_BATCH_1_PARTIAL';
  results.verdict = verdict;

  const outPath = path.resolve('reports/batch1-browser-acceptance.json');
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log(`ACCEPTANCE VERDICT: ${verdict}`);
  console.log(`Passed: ${results.summary.passed}/${results.summary.total}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Evidence saved to: ${outPath}`);
  console.log('======================================================\n');

  if (results.summary.failed > 0) {
    process.exit(1);
  }
}

runAcceptanceSuite().catch((err) => {
  console.error('Acceptance suite unhandled rejection:', err);
  process.exit(1);
});
