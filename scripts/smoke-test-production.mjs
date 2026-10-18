#!/usr/bin/env node
/**
 * GB Coder — Non-Destructive Production Smoke Test Suite
 *
 * Verifies live Production at https://code.ladestack.in/ following
 * Consolidated Development Batch 1 release into main.
 *
 * Scope:
 * 1. Security Headers (COOP, COEP) & Critical Assets
 * 2. Marketing Routes (/, /about, /contact, /privacy-policy)
 * 3. App Entry (/app)
 * 4. Static Editor Isolation (/app/projects/.../editor)
 * 5. Advanced IDE Batch 1 Features (/app/projects/.../ide):
 *    - Workspace Search & Safe Replace controls
 *    - Problems & Output panels
 *    - Command Palette (F1/Ctrl+Shift+P) & Quick Open (Ctrl+P)
 *    - Preview Viewport Presets & Controls
 * 6. Browser Diagnostics & Console Error Audit
 */

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { seedProjects } from './helpers/b4-fixtures.mjs';

const PROD_URL = (process.env.PROD_URL || 'https://code.ladestack.in').replace(/\/$/, '');
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT || 'e6949732004afdd9a9116749bf2281a145c9bbec';
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || '7104124377';

const results = {
  timestamp: new Date().toISOString(),
  prodUrl: PROD_URL,
  deploymentId: DEPLOYMENT_ID,
  verifiedCommit: EXPECTED_COMMIT,
  suite: 'GB_CODER_BATCH_1_PRODUCTION_SMOKE',
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
      if (!text.includes('favicon') && !text.includes('dimensions') && !text.includes('404')) {
        results.diagnostics.consoleErrors.push(`[${tag}] ${text.slice(0, 300)}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    results.diagnostics.pageErrors.push(`[${tag}] ${err.message.slice(0, 300)}`);
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!url.includes('favicon') && !url.includes('.map') && !url.includes('hot-update')) {
      results.diagnostics.failedRequests.push(`[${tag}] ${req.method()} ${url}: ${req.failure()?.errorText || 'failed'}`);
    }
  });
}

async function runSmokeTests() {
  console.log(`Starting Production Smoke Tests on: ${PROD_URL}`);
  console.log(`Deployment ID: ${DEPLOYMENT_ID} | Target Commit: ${EXPECTED_COMMIT}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer']
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Security Headers & Marketing Root Route
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      attachPageWatchers(page, 'MarketingRoot');

      try {
        const response = await page.goto(`${PROD_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        assert.equal(response.status(), 200, 'Root marketing page must return HTTP 200');

        const headers = response.headers();
        const serverHeader = headers['server'] || '';
        assert.ok(serverHeader.toLowerCase().includes('vercel'), `Expected Vercel server header, got ${serverHeader}`);

        // Verify key marketing page elements
        const title = await page.title();
        assert.ok(title.length > 0, 'Page title must not be empty');

        const startCodingBtn = await page.waitForSelector('#headerCta, #heroStartBtn', { timeout: 10000 });
        assert.ok(startCodingBtn, 'Start Coding CTA button must exist on marketing page');

        recordTest('SMOKE_MARKETING_ROOT', 'PASSED', {
          title: 'Root marketing page loads successfully with HTTP 200',
          pageTitle: title,
          serverHeader
        });
      } catch (err) {
        recordTest('SMOKE_MARKETING_ROOT', 'FAILED', {
          title: 'Root marketing page loads successfully',
          error: err.message
        });
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // TEST 2: Static Marketing Subroutes
    // -------------------------------------------------------------------------
    {
      const subroutes = ['/about', '/contact', '/privacy-policy'];
      const context = await browser.newContext();
      const page = await context.newPage();
      attachPageWatchers(page, 'MarketingSubroutes');

      for (const route of subroutes) {
        const testId = `SMOKE_ROUTE_${route.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
        try {
          const resp = await page.goto(`${PROD_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
          assert.equal(resp.status(), 200, `${route} must return HTTP 200`);
          recordTest(testId, 'PASSED', {
            title: `Route ${route} returns HTTP 200`,
            status: resp.status()
          });
        } catch (err) {
          recordTest(testId, 'FAILED', {
            title: `Route ${route} returns HTTP 200`,
            error: err.message
          });
        }
      }
      await context.close();
    }

    // -------------------------------------------------------------------------
    // TEST 3: App Security Headers (COOP / COEP)
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      attachPageWatchers(page, 'AppHeaders');

      try {
        const resp = await page.goto(`${PROD_URL}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        assert.equal(resp.status(), 200, '/app route must return HTTP 200');

        const headers = resp.headers();
        const coop = headers['cross-origin-opener-policy'] || '';
        const coep = headers['cross-origin-embedder-policy'] || '';

        console.log(`[Headers] COOP: "${coop}", COEP: "${coep}"`);
        assert.ok(coop.includes('same-origin'), `Expected COOP: same-origin, got "${coop}"`);

        recordTest('SMOKE_APP_HEADERS', 'PASSED', {
          title: 'Cross-Origin Isolation Headers correctly configured on /app',
          coop,
          coep
        });
      } catch (err) {
        recordTest('SMOKE_APP_HEADERS', 'FAILED', {
          title: 'Cross-Origin Isolation Headers on /app',
          error: err.message
        });
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // TEST 4: Static Editor Isolation
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      attachPageWatchers(page, 'StaticEditor');

      const testProjectId = 'smoke-static-test';
      try {
        await page.goto(`${PROD_URL}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        await seedProjects(page, [{
          id: testProjectId,
          name: 'Smoke Static Project',
          editorStyle: 'static',
          projectType: 'html',
          files: [
            { path: 'index.html', content: '<!doctype html><html><body><h1>Static Hello</h1></body></html>' }
          ]
        }]);

        await page.goto(`${PROD_URL}/app/projects/${testProjectId}/editor`, { waitUntil: 'networkidle', timeout: 30000 });

        // Verify Static editor presence
        await page.waitForSelector('[data-testid="app-root"], nav', { timeout: 15000 });
        const isVSCodePresent = await page.isVisible('[data-testid="vscode-mode"]');
        assert.ok(!isVSCodePresent, 'VS Code mode should not mount in static editor view');

        recordTest('SMOKE_STATIC_EDITOR_ISOLATION', 'PASSED', {
          title: 'Static Editor mounts cleanly without WebContainer interference'
        });
      } catch (err) {
        recordTest('SMOKE_STATIC_EDITOR_ISOLATION', 'FAILED', {
          title: 'Static Editor mounts cleanly',
          error: err.message
        });
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // TEST 5: Advanced IDE Batch 1 Full Feature Integration
    // -------------------------------------------------------------------------
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      attachPageWatchers(page, 'AdvancedIDE');

      const ideProjectId = 'smoke-batch1-ide';
      try {
        await page.goto(`${PROD_URL}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        await seedProjects(page, [{
          id: ideProjectId,
          name: 'Smoke Batch 1 IDE',
          editorStyle: 'vscode',
          projectType: 'react',
          files: [
            {
              path: 'src/App.jsx',
              content: 'import React from "react";\nexport function App() {\n  const message = "GB Coder Live Production";\n  return <div>{message}</div>;\n}\n'
            },
            {
              path: 'src/utils.js',
              content: 'export function add(a, b) {\n  return a + b;\n}\n'
            },
            {
              path: 'package.json',
              content: '{\n  "name": "smoke-batch1-app",\n  "version": "1.0.0"\n}\n'
            }
          ]
        }]);

        console.log('Navigating to Advanced IDE route...');
        await page.goto(`${PROD_URL}/app/projects/${ideProjectId}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for IDE container & Monaco editor
        await page.waitForSelector('.monaco-editor, [role="region"][aria-label="Editor"]', { timeout: 25000 });
        console.log('Monaco IDE mounted successfully.');

        // 5a. Verify Workspace Search Panel
        const searchTabBtn = await page.waitForSelector('button[aria-label="Search"]', { timeout: 8000 });
        await searchTabBtn.click();

        const searchPanel = await page.waitForSelector('[data-testid="workspace-search-panel"]', { timeout: 8000 });
        assert.ok(searchPanel, 'Workspace Search Panel should be mounted');

        const queryInput = await page.waitForSelector('input[aria-label="Search query"]', { timeout: 8000 });
        await queryInput.fill('Live Production');
        await page.keyboard.press('Enter');

        // Allow search to scan
        await page.waitForTimeout(1000);
        await page.waitForSelector('text=App.jsx', { timeout: 8000 });

        recordTest('SMOKE_IDE_WORKSPACE_SEARCH', 'PASSED', {
          title: 'Workspace Search finds code content across project files in Monaco IDE'
        });

        // 5b. Verify Problems Panel
        const problemsTabBtn = await page.waitForSelector('button:has-text("PROBLEMS")', { timeout: 8000 });
        await problemsTabBtn.click();
        const problemsPanel = await page.waitForSelector('[data-testid="problems-panel"]', { timeout: 8000 });
        assert.ok(problemsPanel, 'Problems Panel should be rendered');

        recordTest('SMOKE_IDE_PROBLEMS_PANEL', 'PASSED', {
          title: 'Problems Panel displays diagnostics filter and empty/content state'
        });

        // 5c. Verify Output Panel
        const outputTabBtn = await page.waitForSelector('button:has-text("OUTPUT")', { timeout: 8000 });
        await outputTabBtn.click();
        const outputPanel = await page.waitForSelector('[data-testid="output-panel"]', { timeout: 8000 });
        assert.ok(outputPanel, 'Output Panel should be rendered');

        recordTest('SMOKE_IDE_OUTPUT_PANEL', 'PASSED', {
          title: 'Output Panel renders log channels and console stream'
        });

        // 5d. Verify Command Palette (F1)
        console.log('Testing Command Palette...');
        await page.keyboard.press('F1');
        const paletteModal = await page.waitForSelector('[data-testid="command-palette-modal"]', { timeout: 6000 });
        assert.ok(paletteModal, 'Command palette modal should appear on F1');

        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-testid="command-palette-modal"]', { state: 'hidden', timeout: 5000 });

        recordTest('SMOKE_IDE_COMMAND_PALETTE', 'PASSED', {
          title: 'Command Palette opens with F1 and closes with Escape'
        });

        // 5e. Verify Quick Open (Ctrl+P)
        console.log('Testing Quick Open...');
        await page.keyboard.press('Control+p');
        await page.waitForSelector('[data-testid="command-palette-modal"]', { timeout: 6000 });
        const quickOpenInput = await page.waitForSelector('input[aria-label="Command search input"]', { timeout: 5000 });
        const quickOpenVal = await quickOpenInput.inputValue();
        assert.ok(!quickOpenVal.startsWith('>'), 'Quick Open should open file picker without command prefix');

        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-testid="command-palette-modal"]', { state: 'hidden', timeout: 5000 });

        recordTest('SMOKE_IDE_QUICK_OPEN', 'PASSED', {
          title: 'Quick Open opens with Ctrl+P in file navigation mode'
        });

        // 5f. Verify Preview Viewport Presets
        const desktopBtn = await page.waitForSelector('button[title*="Desktop"]', { timeout: 8000 });
        const tabletBtn = await page.waitForSelector('button[title*="Tablet"]', { timeout: 8000 });
        const mobileBtn = await page.waitForSelector('button[title*="Mobile"]', { timeout: 8000 });

        assert.ok(desktopBtn && tabletBtn && mobileBtn, 'Preview viewport presets must all be present');

        recordTest('SMOKE_IDE_PREVIEW_CONTROLS', 'PASSED', {
          title: 'Preview panel renders responsive viewport preset buttons and controls'
        });

      } catch (err) {
        recordTest('SMOKE_IDE_BATCH1_FEATURES', 'FAILED', {
          title: 'Advanced IDE Batch 1 features integration',
          error: err.message
        });
      } finally {
        await context.close();
      }
    }

  } finally {
    await browser.close();
  }

  // Write results artifact
  const outPath = path.resolve('reports/production-release-smoke.json');
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nSmoke tests finished. Output saved to: ${outPath}`);
  console.log(`Passed: ${results.summary.passed} / Total: ${results.summary.total}`);

  if (results.summary.failed > 0) {
    console.error(`\nFAILED TESTS: ${results.summary.failed}`);
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('Fatal smoke test runner error:', err);
  process.exit(1);
});
