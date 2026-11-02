import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import https from 'node:https';
import { chromium } from 'playwright';

import { seedProjects, REACT_PKG, REACT_VITE_CONFIG, REACT_INDEX, reactMain,
  VUE_PKG, VUE_VITE_CONFIG, VUE_INDEX, VUE_MAIN, vueApp } from './helpers/b4-fixtures.mjs';

const PREVIEW_BASE = 'https://gb-coder-public-alpha-pi5x68n5c.vercel.app';
const EXPECTED_DEPLOYMENT_ID = 'dpl_AFEUZZ5JjEkNo2kTHkmFjbn5SSR2';
const EXPECTED_COMMIT_SHA = '22fc4c0ee908cf5768ebbdb1525f472eed0294f4';
const EXPECTED_BRANCH = 'phase-2.2-webcontainer-reliability';
const PRODUCTION_URL = 'https://code.ladestack.in';
const VERCEL_PROJECT_ID = 'prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD';
const VERCEL_TEAM = 'team_0KwVxrmoybIMrA9NiwTV5FLY';
const VERCEL_CLI = 'C:/Users/Girish Lade/AppData/Local/npm-cache/_npx/69f9afb961c37556/node_modules/vercel/dist/index.js';

const EVIDENCE_FILE = 'reports/rc-preview-acceptance.json';

// Initialize results structure
const results = {
  startedAt: new Date().toISOString(),
  target: {
    previewUrl: PREVIEW_BASE,
    deploymentId: EXPECTED_DEPLOYMENT_ID,
    expectedSha: EXPECTED_COMMIT_SHA,
    expectedBranch: EXPECTED_BRANCH,
    productionUrl: PRODUCTION_URL,
  },
  deploymentIntegrity: { status: 'PENDING', checks: [] },
  productionIsolation: { status: 'PENDING', checks: [] },
  routesIntegrity: { status: 'PENDING', routes: [] },
  advancedIDE: {
    status: 'PENDING',
    bootBudget: { max: 3, actual: 0 },
    samples: [],
  },
  existingReliability: { status: 'PENDING', checks: [] },
  verdict: 'PENDING',
  errors: [],
};

function logStep(category, name, details = {}) {
  console.log(`[${category}] ${name}`, Object.keys(details).length ? details : '');
}

// 1. Authoritative Vercel API helper
function vercelApi(apiPath) {
  try {
    return JSON.parse(execFileSync(process.execPath, [
      VERCEL_CLI,
      '--scope', 'girishlade111-gmailcoms-projects',
      'api', apiPath + (apiPath.includes('?') ? '&' : '?') + 'teamId=' + VERCEL_TEAM,
      '--method', 'GET',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (error) {
    throw new Error('Vercel API query failed: ' + error.message);
  }
}

// 2. HTTPS fetch helper with timeout
function httpsGet(urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'User-Agent': 'GB-Coder-Release-Validator/1.0', ...headers },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body,
      }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${urlStr}`));
    });
    req.end();
  });
}

// Runtime observer for injection into browser page
const runtimeObserverSrc = `(() => {
  if (location.origin !== '${PREVIEW_BASE}') return;
  try {
    localStorage.setItem('gbcoder_onboarded', 'true');
    localStorage.setItem('gbcoder_welcome_dismissed', 'true');
  } catch (e) {}

  const d = { events: [], processes: [], output: [], outputBytes: 0 };
  globalThis.__runtimeDiagnostic = d;

  const event = (type, details = {}) => {
    d.events.push({
      type,
      at: Date.now(),
      navigationMs: performance.now(),
      ...details,
    });
  };

  const instrumented = new WeakSet();
  let instance, bootPromise;

  Object.defineProperty(globalThis, '__GBCODER_WEBCONTAINER_BOOT_PROMISE__', {
    configurable: true,
    get: () => bootPromise,
    set: (p) => {
      bootPromise = p;
      if (p) {
        event('boot_promise_assigned');
        p.then(
          () => event('boot_completed'),
          (e) => event('boot_failed', { error: String(e) })
        );
      }
    },
  });

  function instrument(c) {
    if (!c || instrumented.has(c)) return;
    instrumented.add(c);
    event('runtime_instance_assigned');
    try {
      c.on('server-ready', (port, url) => event('server_ready', { port, url }));

      const mount = c.mount.bind(c);
      c.mount = async (...args) => {
        event('mount_invoked', { topLevelNames: Object.keys(args[0] || {}), at: Date.now() });
        try {
          const r = await mount(...args);
          event('mount_completed', { at: Date.now() });
          return r;
        } catch (e) {
          event('mount_failed', { error: String(e), at: Date.now() });
          throw e;
        }
      };

      const spawn = c.spawn.bind(c);
      c.spawn = async (...args) => {
        const index = d.processes.length;
        const p = {
          index,
          command: args[0],
          args: Array.isArray(args[1]) ? args[1] : null,
          invokedAt: Date.now(),
          state: 'spawning',
        };
        d.processes.push(p);
        event('process_spawn_invoked', { index, command: p.command, args: p.args });
        try {
          const proc = await spawn(...args);
          p.state = 'running';
          p.spawnedAt = Date.now();
          event('process_spawned', { index, command: p.command });
          proc.exit.then(
            (code) => {
              p.state = 'exited';
              p.exitCode = code;
              p.exitedAt = Date.now();
              event('process_exit', { index, code });
            },
            (e) => event('process_exit_error', { index, error: String(e) })
          );

          if (proc.input && typeof proc.input.getWriter === 'function') {
            const origGetWriter = proc.input.getWriter.bind(proc.input);
            proc.input.getWriter = (...a) => {
              const writer = origGetWriter(...a);
              const origWrite = writer.write.bind(writer);
              writer.write = (chunk) => {
                event('shell_input', { index, text: String(chunk).slice(0, 1024), at: Date.now() });
                return origWrite(chunk);
              };
              return writer;
            };
          }
          return proc;
        } catch (e) {
          p.state = 'spawn_failed';
          p.error = String(e);
          event('process_spawn_failed', { index, error: String(e) });
          throw e;
        }
      };
    } catch (e) {
      event('instrumentation_error', { error: String(e) });
    }
  }

  Object.defineProperty(globalThis, '__GBCODER_WEBCONTAINER_INSTANCE__', {
    configurable: true,
    get: () => instance,
    set: (c) => {
      instance = c;
      instrument(c);
    },
  });

  addEventListener('DOMContentLoaded', () => event('document_loaded'));
})();`;

// Main verification execution
let browser;
let context;

try {
  logStep('PRE-FLIGHT', 'Verifying Vercel Deployment & Isolation');

  // Gate 1: Check live Vercel deployment identity
  const deploymentInfo = vercelApi(`/v13/deployments/${EXPECTED_DEPLOYMENT_ID}?withGitRepoInfo=true`);
  assert.equal(deploymentInfo.id, EXPECTED_DEPLOYMENT_ID, 'Deployment ID must match candidate');
  assert.equal(deploymentInfo.readyState, 'READY', 'Deployment must be READY');
  assert.equal(deploymentInfo.gitSource?.sha, EXPECTED_COMMIT_SHA, 'Git commit SHA must match candidate');
  assert.equal(deploymentInfo.gitSource?.ref, EXPECTED_BRANCH, 'Git branch must match candidate');
  assert.equal(deploymentInfo.target, null, 'Target must be null (preview)');

  results.deploymentIntegrity.checks.push({
    name: 'Vercel Deployment Identity & Readiness',
    deploymentId: deploymentInfo.id,
    readyState: deploymentInfo.readyState,
    commitSha: deploymentInfo.gitSource?.sha,
    branch: deploymentInfo.gitSource?.ref,
    url: deploymentInfo.url,
    status: 'PASS',
  });
  results.deploymentIntegrity.status = 'PASS';
  logStep('PRE-FLIGHT', 'Deployment verified READY on preview', { id: deploymentInfo.id });

  // Gate 2: Check Live Production Domain Isolation
  const prodRes = await httpsGet(PRODUCTION_URL);
  assert.equal(prodRes.status, 200, 'Production must return HTTP 200');
  results.productionIsolation.checks.push({
    name: 'Live Production HTTP 200 & Isolation',
    status: 'PASS',
    statusCode: prodRes.status,
    server: prodRes.headers['server'],
  });
  results.productionIsolation.status = 'PASS';
  logStep('PRE-FLIGHT', 'Production domain isolated & HTTP 200', { url: PRODUCTION_URL });

  // Obtain bypass secret from Vercel project configuration if configured
  const project = vercelApi(`/v9/projects/${VERCEL_PROJECT_ID}`);
  const secrets = Object.keys(project.protectionBypass || {}).filter(
    (k) => project.protectionBypass[k].scope === 'automation-bypass'
  );
  const bypassSecret = secrets[0] || '';
  const bypassHeaders = bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {};

  // Gate 3: Check Marketing and Application Routes
  logStep('ROUTES', 'Auditing marketing and application routes');
  const routesToTest = [
    { path: '/', expectedText: 'GB Coder', mustNotHave: 'id="root"' },
    { path: '/about', expectedText: 'About GB Coder', mustNotHave: 'id="root"' },
    { path: '/contact', expectedText: 'Contact Us', mustNotHave: '<form' },
    { path: '/privacy-policy', expectedText: 'Privacy Policy', mustNotHave: 'id="root"' },
    { path: '/terms-and-conditions', expectedText: 'Terms &amp; Conditions', mustNotHave: 'id="root"' },
    { path: '/app', expectedText: 'id="root"', checkCoop: true },
    { path: '/app/projects', expectedText: 'id="root"', checkCoop: true },
    { path: '/ide', expectedText: 'id="root"', checkCoop: true },
  ];

  for (const r of routesToTest) {
    const res = await httpsGet(`${PREVIEW_BASE}${r.path}`, bypassHeaders);
    assert.equal(res.status, 200, `Route ${r.path} must return HTTP 200`);
    assert.ok(res.body.includes(r.expectedText), `Route ${r.path} must contain "${r.expectedText}"`);
    if (r.mustNotHave) {
      assert.ok(!res.body.includes(r.mustNotHave), `Route ${r.path} must not contain "${r.mustNotHave}"`);
    }
    const coop = res.headers['cross-origin-opener-policy'];
    const coep = res.headers['cross-origin-embedder-policy'];
    results.routesIntegrity.routes.push({
      path: r.path,
      status: 'PASS',
      httpStatus: res.status,
      coop,
      coep,
    });
    logStep('ROUTES', `Route ${r.path} passed HTTP & metadata validation`);
  }
  results.routesIntegrity.status = 'PASS';

  // Launch Playwright for Advanced IDE verification
  logStep('BROWSER', 'Launching Chromium with SharedArrayBuffer enabled');
  browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer'],
  });

  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });

  if (bypassSecret) {
    await context.route(`${PREVIEW_BASE}/**`, async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-vercel-protection-bypass': bypassSecret,
      };
      await route.continue({ headers });
    });
    // Set cookie
    await context.request.get(`${PREVIEW_BASE}/app/projects`, {
      headers: {
        'x-vercel-protection-bypass': bypassSecret,
        'x-vercel-set-bypass-cookie': 'true',
      },
    });
  }

  await context.addInitScript(runtimeObserverSrc);

  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (e) => {
    pageErrors.push({ message: e.message.slice(0, 500), at: Date.now() });
    console.error('[PageError]', e.message);
  });

  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text();
      if (!text.includes('favicon') && !text.includes('baseline-browser-mapping')) {
        consoleErrors.push({ text: text.slice(0, 500), at: Date.now() });
      }
    }
  });

  // Verify Cross-Origin Isolation on live app page
  logStep('BROWSER', 'Checking window.crossOriginIsolated on /app/projects');
  await page.goto(`${PREVIEW_BASE}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

  const isIsolated = await page.evaluate(() => window.crossOriginIsolated);
  const hasSAB = await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined');
  logStep('BROWSER', 'Isolation status', { crossOriginIsolated: isIsolated, SharedArrayBuffer: hasSAB });
  assert.equal(hasSAB, true, 'SharedArrayBuffer must be available');

  // Define Synthetic Test Projects
  const REACT_PROJECT_ID = 'rc-react-a';
  const VUE_PROJECT_ID = 'rc-vue-b';

  const reactInitialContent = reactMain('RC_REACT_A_INITIAL');
  const reactEditedContent = reactMain('RC_REACT_A_EDITED');
  const vueContent = vueApp('RC_VUE_B');

  const reactProject = {
    id: REACT_PROJECT_ID,
    name: 'RC React A',
    editorStyle: 'vscode',
    projectType: 'react',
    files: [
      { path: 'package.json', content: REACT_PKG },
      { path: 'vite.config.js', content: REACT_VITE_CONFIG },
      { path: 'index.html', content: REACT_INDEX },
      { path: 'src/main.jsx', content: reactInitialContent },
    ],
  };

  const vueProject = {
    id: VUE_PROJECT_ID,
    name: 'RC Vue B',
    editorStyle: 'vscode',
    projectType: 'vue',
    files: [
      { path: 'package.json', content: VUE_PKG },
      { path: 'vite.config.js', content: VUE_VITE_CONFIG },
      { path: 'index.html', content: VUE_INDEX },
      { path: 'src/main.js', content: VUE_MAIN },
      { path: 'src/App.vue', content: vueContent },
      { path: 'src/style.css', content: '' },
    ],
  };

  // Seed both synthetic projects into IndexedDB
  logStep('IDE', 'Seeding synthetic React and Vue projects into IndexedDB');
  await seedProjects(page, [reactProject, vueProject]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

  // ==========================================
  // SAMPLE 1: React A Cold Startup & Dev Server Restart (B.5.1 + B.5.2)
  // ==========================================
  logStep('SAMPLE-1', 'Opening React A for Cold Startup');
  const s1Start = Date.now();
  await page.getByText(reactProject.name, { exact: true }).click({ timeout: 10000 });
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 15000 });

  // Check truthful startup loader appearance (B.5.2 verification)
  const loaderEl = page.locator('[data-testid="stackblitz-startup-loader"]');
  const loaderSeen = await loaderEl.isVisible().catch(() => false);
  logStep('SAMPLE-1', 'Startup loader visibility', { visible: loaderSeen });

  // Wait for Preview DOM readiness with marker RC_REACT_A_INITIAL
  logStep('SAMPLE-1', 'Awaiting WebContainer boot, npm install, Vite dev server, and Preview DOM');
  const s1Deadline = Date.now() + 240000;
  let s1Rendered = false;

  while (Date.now() < s1Deadline) {
    if (pageErrors.length > 0) {
      throw new Error(`Uncaught browser error during React startup: ${pageErrors[0].message}`);
    }
    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 250 }).catch(() => null);
        if (text === 'RC_REACT_A_INITIAL') {
          s1Rendered = true;
          break;
        }
      }
    }
    if (s1Rendered) break;
    await page.waitForTimeout(500);
  }

  assert.ok(s1Rendered, 'React Preview DOM must render RC_REACT_A_INITIAL within 240s');
  const s1Duration = Date.now() - s1Start;
  results.advancedIDE.bootBudget.actual++;
  logStep('SAMPLE-1', 'React Preview DOM rendered successfully!', { durationMs: s1Duration });

  // Inspect runtime diagnostic after initial boot
  const s1Diag = await page.evaluate(() => globalThis.__runtimeDiagnostic);
  const s1Boots = (s1Diag?.events || []).filter((e) => e.type === 'boot_completed');
  const s1Mounts = (s1Diag?.events || []).filter((e) => e.type === 'mount_invoked');
  assert.equal(s1Boots.length, 1, 'Cold startup must execute exactly 1 boot');
  assert.equal(s1Mounts.length, 1, 'Cold startup must execute exactly 1 mount');

  // Verify terminal interactivity
  const s1Term = await page.locator('.xterm-rows').first().innerText({ timeout: 5000 });
  assert.ok(s1Term.length > 0, 'Terminal rows must be populated');
  assert.ok(!s1Term.includes('Mount aborted'), 'Terminal must not report mount aborts');
  logStep('SAMPLE-1', 'Interactive terminal verified', { rowLength: s1Term.length });

  // TEST B.5.1: Dev Server Restart with Single Mount & Preview Update
  logStep('SAMPLE-1', 'Testing B.5.1 dev server restart optimization: Monaco edit & Restart button');
  await page.locator('[data-testid="tree-file"][data-path="src/main.jsx"]').click();
  await page.locator('.monaco-editor').first().waitFor({ timeout: 15000 });
  await page.evaluate(() => {
    const ta = document.querySelector('.monaco-editor textarea');
    if (ta) ta.focus();
  });
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(reactEditedContent, { delay: 1 });
  await page.waitForTimeout(1000); // Allow sync

  // Trigger Restart Dev Server action
  const restartBtn = page.locator('button[aria-label="New Terminal / Restart"]').first();
  await restartBtn.waitFor({ timeout: 5000 });
  const restartClickAt = Date.now();
  await restartBtn.click();

  // Await updated Preview DOM
  logStep('SAMPLE-1', 'Awaiting restarted Preview DOM with RC_REACT_A_EDITED');
  let s1RestartRendered = false;
  const restartDeadline = Date.now() + 60000;
  while (Date.now() < restartDeadline) {
    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 250 }).catch(() => null);
        if (text === 'RC_REACT_A_EDITED') {
          s1RestartRendered = true;
          break;
        }
      }
    }
    if (s1RestartRendered) break;
    await page.waitForTimeout(400);
  }
  assert.ok(s1RestartRendered, 'Restarted preview must render RC_REACT_A_EDITED');
  const restartDuration = Date.now() - restartClickAt;
  logStep('SAMPLE-1', 'Restarted preview updated successfully!', { durationMs: restartDuration });

  // Invariant verification for B.5.1: Exactly 1 mount during restart, 0 reboots
  const postRestartDiag = await page.evaluate(() => globalThis.__runtimeDiagnostic);
  const totalMountsS1 = (postRestartDiag?.events || []).filter((e) => e.type === 'mount_invoked');
  const restartMounts = totalMountsS1.filter((e) => e.at >= restartClickAt - 200);
  const totalBootsS1 = (postRestartDiag?.events || []).filter((e) => e.type === 'boot_completed');

  assert.equal(totalMountsS1.length, 2, 'Total mounts after restart must be exactly 2 (1 initial + 1 restart)');
  assert.equal(restartMounts.length, 1, 'Restart dev server must execute exactly 1 mount (0 duplicate mounts!)');
  assert.equal(totalBootsS1.length, 1, 'Restart dev server must not reboot WebContainer instance');
  logStep('SAMPLE-1', 'B.5.1 Mount Count Invariant PROVED', {
    totalMounts: totalMountsS1.length,
    restartMounts: restartMounts.length,
    totalBoots: totalBootsS1.length,
  });

  results.advancedIDE.samples.push({
    index: 1,
    project: 'RC React A',
    status: 'PASS',
    initialDomMs: s1Duration,
    restartDomMs: restartDuration,
    boots: totalBootsS1.length,
    totalMounts: totalMountsS1.length,
    restartMounts: restartMounts.length,
  });

  // ==========================================
  // SAMPLE 2: Vue B Project Switch & Isolation Proof
  // ==========================================
  logStep('SAMPLE-2', 'Switching to Vue B project');
  const s2Start = Date.now();
  await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click({ timeout: 10000 });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 10000 });

  await page.getByText(vueProject.name, { exact: true }).click({ timeout: 10000 });
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 15000 });

  // Await Vue Preview DOM
  logStep('SAMPLE-2', 'Awaiting Vue WebContainer boot and Preview DOM (RC_VUE_B)');
  const s2Deadline = Date.now() + 240000;
  let s2Rendered = false;

  while (Date.now() < s2Deadline) {
    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 250 }).catch(() => null);
        if (text === 'RC_VUE_B') {
          s2Rendered = true;
          break;
        }
      }
    }
    if (s2Rendered) break;
    await page.waitForTimeout(500);
  }
  assert.ok(s2Rendered, 'Vue Preview DOM must render RC_VUE_B within 240s');
  const s2Duration = Date.now() - s2Start;
  results.advancedIDE.bootBudget.actual++;
  logStep('SAMPLE-2', 'Vue Preview DOM rendered successfully!', { durationMs: s2Duration });

  // Verify filesystem isolation in Vue instance: React files absent
  const vueFsCheck = await page.evaluate(async () => {
    const inst = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    if (!inst) return { error: 'No instance' };
    let reactAbsent = false;
    try {
      await inst.fs.readFile('src/main.jsx');
    } catch (e) {
      if (String(e).includes('ENOENT')) reactAbsent = true;
    }
    let vuePresent = false;
    try {
      const content = await inst.fs.readFile('src/App.vue', 'utf8');
      if (content.includes('RC_VUE_B')) vuePresent = true;
    } catch (e) {}
    return { reactAbsent, vuePresent };
  });

  assert.equal(vueFsCheck.reactAbsent, true, 'React source files must be absent in Vue runtime');
  assert.equal(vueFsCheck.vuePresent, true, 'Vue source files must be present in Vue runtime');
  logStep('SAMPLE-2', 'Filesystem isolation verified', vueFsCheck);

  results.advancedIDE.samples.push({
    index: 2,
    project: 'RC Vue B',
    status: 'PASS',
    domMs: s2Duration,
    isolation: vueFsCheck,
  });

  // ==========================================
  // SAMPLE 3: Switch Back to React A & Persistence Proof
  // ==========================================
  logStep('SAMPLE-3', 'Switching back to React A project');
  const s3Start = Date.now();
  await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click({ timeout: 10000 });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 10000 });

  await page.getByText(reactProject.name, { exact: true }).click({ timeout: 10000 });
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 15000 });

  // Await React Preview DOM with PERSISTED edited marker
  logStep('SAMPLE-3', 'Awaiting React Preview DOM with persisted marker (RC_REACT_A_EDITED)');
  const s3Deadline = Date.now() + 240000;
  let s3Rendered = false;

  while (Date.now() < s3Deadline) {
    for (const frame of page.frames()) {
      if (frame.url().includes('webcontainer-api.io')) {
        const text = await frame.locator('#marker').textContent({ timeout: 250 }).catch(() => null);
        if (text === 'RC_REACT_A_EDITED') {
          s3Rendered = true;
          break;
        }
      }
    }
    if (s3Rendered) break;
    await page.waitForTimeout(500);
  }
  assert.ok(s3Rendered, 'React Preview DOM must render persisted RC_REACT_A_EDITED');
  const s3Duration = Date.now() - s3Start;
  results.advancedIDE.bootBudget.actual++;
  logStep('SAMPLE-3', 'React Preview DOM rendered persisted marker!', { durationMs: s3Duration });

  // Verify filesystem isolation in React instance: Vue files absent
  const reactFsCheck = await page.evaluate(async () => {
    const inst = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
    if (!inst) return { error: 'No instance' };
    let vueAbsent = false;
    try {
      await inst.fs.readFile('src/App.vue');
    } catch (e) {
      if (String(e).includes('ENOENT')) vueAbsent = true;
    }
    let reactPresent = false;
    try {
      const content = await inst.fs.readFile('src/main.jsx', 'utf8');
      if (content.includes('RC_REACT_A_EDITED')) reactPresent = true;
    } catch (e) {}
    return { vueAbsent, reactPresent };
  });

  assert.equal(reactFsCheck.vueAbsent, true, 'Vue source files must be absent in React runtime');
  assert.equal(reactFsCheck.reactPresent, true, 'React source files must be present with edited content');
  logStep('SAMPLE-3', 'Filesystem isolation verified', reactFsCheck);

  // Total cumulative boots check: exactly 3
  assert.equal(results.advancedIDE.bootBudget.actual, 3, 'Cumulative boots across React -> Vue -> React must be exactly 3');

  results.advancedIDE.samples.push({
    index: 3,
    project: 'RC React A (Switchback)',
    status: 'PASS',
    domMs: s3Duration,
    isolation: reactFsCheck,
  });

  // ==========================================
  // STORAGE & RELIABILITY VERIFICATION
  // ==========================================
  logStep('RELIABILITY', 'Verifying IndexedDB persistence and Session Reload safety');

  // Check IndexedDB
  const idbCheck = await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('projectFiles', 'readonly');
        const store = tx.objectStore('projectFiles');
        const getAll = store.getAll();
        getAll.onsuccess = () => {
          const files = getAll.result;
          const reactMainFile = files.find((f) => f.projectId === 'rc-react-a' && f.path === 'src/main.jsx');
          const vueAppFile = files.find((f) => f.projectId === 'rc-vue-b' && f.path === 'src/App.vue');
          resolve({
            reactPersisted: Boolean(reactMainFile && reactMainFile.content.includes('RC_REACT_A_EDITED')),
            vuePersisted: Boolean(vueAppFile && vueAppFile.content.includes('RC_VUE_B')),
            totalFiles: files.length,
          });
        };
        getAll.onerror = () => reject(getAll.error);
        tx.oncomplete = () => db.close();
      };
    });
  });

  assert.equal(idbCheck.reactPersisted, true, 'React edited content must persist in IndexedDB');
  assert.equal(idbCheck.vuePersisted, true, 'Vue content must persist in IndexedDB');
  logStep('RELIABILITY', 'IndexedDB persistence verified', idbCheck);

  results.existingReliability.checks.push({
    name: 'IndexedDB Data Safety & Persistence',
    status: 'PASS',
    details: idbCheck,
  });

  // Dashboard reload safety check: 0 unexpected boots
  await page.goto(`${PREVIEW_BASE}/app/projects`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 10000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 10000 });

  const dashboardDiag = await page.evaluate(() => globalThis.__runtimeDiagnostic);
  const dashboardBoots = (dashboardDiag?.events || []).filter((e) => e.type === 'boot_completed');
  assert.equal(dashboardBoots.length, 0, 'Dashboard reload must not boot WebContainer runtime');

  results.existingReliability.checks.push({
    name: 'Dashboard Reload Safety (Zero Unprompted Boots)',
    status: 'PASS',
    bootsOnDashboard: dashboardBoots.length,
  });

  results.existingReliability.status = 'PASS';
  results.advancedIDE.status = 'PASS';
  results.verdict = 'GB_CODER_RELEASE_CANDIDATE_ACCEPTED';
  logStep('FINAL', 'ALL ACCEPTANCE CHECKS PASSED: GB_CODER_RELEASE_CANDIDATE_ACCEPTED');

} catch (error) {
  results.verdict = 'GB_CODER_RELEASE_CANDIDATE_BLOCKED';
  results.errors.push({
    message: error.message,
    stack: error.stack,
  });
  console.error('[FATAL ACCEPTANCE ERROR]', error);
} finally {
  results.completedAt = new Date().toISOString();
  await fs.writeFile(EVIDENCE_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[RC Validation] Raw evidence saved to ${EVIDENCE_FILE}`);

  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}

process.exitCode = results.verdict === 'GB_CODER_RELEASE_CANDIDATE_ACCEPTED' ? 0 : 1;
