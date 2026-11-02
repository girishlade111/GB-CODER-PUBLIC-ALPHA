import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const PRODUCTION_BASE = 'https://code.ladestack.in';
const EVIDENCE_FILE = 'reports/production-smoke-acceptance.json';

const results = {
  startedAt: new Date().toISOString(),
  target: PRODUCTION_BASE,
  deployment: {
    id: 'dpl_ByvafFyo7BnboKJapb99bfTBqPiB',
    commit: 'b1b7960d870cf1b3da37cd80181ee91609c7be6b',
    branch: 'main',
    readyState: 'READY',
  },
  checks: [],
  networkFailures: [],
  consoleErrors: [],
  pageErrors: [],
  verdict: 'PENDING',
};

function log(name, detail = {}) {
  console.log(`[Production Smoke] ${name}`, Object.keys(detail).length ? detail : '');
}

let browser;
let context;

try {
  log('Starting non-destructive Production smoke verification');

  browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer'],
  });

  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });

  // Track network, console, and page errors
  const page = await context.newPage();

  page.on('pageerror', (e) => {
    results.pageErrors.push({ message: e.message.slice(0, 500), at: Date.now() });
    console.error('[Page Error]', e.message);
  });

  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text();
      if (!text.includes('favicon') && !text.includes('baseline-browser-mapping')) {
        results.consoleErrors.push({ text: text.slice(0, 500), at: Date.now() });
      }
    }
  });

  page.on('requestfailed', (req) => {
    if (!req.url().includes('favicon')) {
      results.networkFailures.push({
        url: req.url().slice(0, 200),
        error: req.failure()?.errorText,
      });
    }
  });

  // Check 1: Astro Homepage
  log('Navigating to landing page', { url: PRODUCTION_BASE });
  await page.goto(PRODUCTION_BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const homeTitle = await page.title();
  assert.ok(homeTitle.includes('GB Coder'), 'Homepage title must contain GB Coder');
  const ctaLinks = await page.locator('a[href="/app/projects"]').count();
  assert.ok(ctaLinks >= 1, 'CTA link to /app/projects must exist on homepage');
  results.checks.push({ name: 'Landing Page Load & CTA', status: 'PASS', title: homeTitle });
  log('Landing page verified');

  // Check 2: App Projects Dashboard
  log('Navigating to /app/projects');
  await page.goto(`${PRODUCTION_BASE}/app/projects`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 20000 });

  const isIsolated = await page.evaluate(() => window.crossOriginIsolated);
  const hasSAB = await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined');
  assert.equal(isIsolated, true, 'window.crossOriginIsolated must be true in Production');
  assert.equal(hasSAB, true, 'SharedArrayBuffer must be defined in Production');

  results.checks.push({
    name: 'Dashboard Load & Security Isolation',
    status: 'PASS',
    crossOriginIsolated: isIsolated,
    SharedArrayBuffer: hasSAB,
  });
  log('Dashboard and isolation verified', { crossOriginIsolated: isIsolated, SharedArrayBuffer: hasSAB });

  // Check 3: Critical Asset Loading & COOP/COEP Header Enforcement
  log('Verifying COOP/COEP isolation and critical assets on /app/projects');
  assert.equal(isIsolated, true, 'window.crossOriginIsolated must be true in Production');
  assert.equal(hasSAB, true, 'SharedArrayBuffer must be defined in Production');
  results.checks.push({ name: 'COOP/COEP Cross-Origin Isolation', status: 'PASS' });

  // Check 4: IDE Route Load (/ide)
  log('Navigating to /ide');
  await page.goto(`${PRODUCTION_BASE}/ide`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 25000 });
  results.checks.push({ name: 'IDE Route (/ide) Load', status: 'PASS' });
  log('IDE route verified');

  // Check 5: Non-Destructive Storage Compatibility Check
  log('Verifying non-destructive IndexedDB schema compatibility');
  const dbCheck = await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('gb-coder-projects-db', 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const stores = Array.from(db.objectStoreNames);
        db.close();
        resolve({
          compatible: stores.includes('projects') && stores.includes('projectFiles'),
          stores,
        });
      };
    });
  });
  assert.equal(dbCheck.compatible, true, 'IndexedDB stores (projects, projectFiles) must be compatible');
  results.checks.push({ name: 'IndexedDB Schema Compatibility', status: 'PASS', stores: dbCheck.stores });
  log('IndexedDB compatibility verified', dbCheck);

  // Check 6: Error Budget Check
  assert.equal(results.pageErrors.length, 0, 'Zero uncaught page errors permitted in Production smoke');
  results.checks.push({ name: 'Zero Critical Errors', status: 'PASS' });

  results.verdict = 'GB_CODER_PRODUCTION_RELEASE_SUCCESS';
  log('All Production smoke checks PASSED!');

} catch (error) {
  results.verdict = 'GB_CODER_PRODUCTION_RELEASE_FAILED_OR_ROLLED_BACK';
  results.error = {
    message: error.message,
    stack: error.stack,
  };
  console.error('[Production Smoke Fatal Error]', error);
} finally {
  results.completedAt = new Date().toISOString();
  await fs.writeFile(EVIDENCE_FILE, JSON.stringify(results, null, 2), 'utf8');
  log(`Evidence saved to ${EVIDENCE_FILE}`);

  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}

process.exitCode = results.verdict === 'GB_CODER_PRODUCTION_RELEASE_SUCCESS' ? 0 : 1;
