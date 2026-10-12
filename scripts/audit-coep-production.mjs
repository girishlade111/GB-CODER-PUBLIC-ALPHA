import { chromium } from 'playwright';

const LOCAL_URL = 'http://localhost:4175';
const PROD_URL = 'https://code.ladestack.in';

async function auditEnvironment(baseUrl, label) {
  console.log(`\n============================================================`);
  console.log(`AUDITING ${label}: ${baseUrl}`);
  console.log(`============================================================`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const resources = [];
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on('requestfailed', req => {
    resources.push({
      url: req.url(),
      resourceType: req.resourceType(),
      status: 'FAILED',
      error: req.failure()?.errorText || 'Unknown failure',
      headers: {},
      classification: classifyFailure(req.failure()?.errorText, req.url()),
    });
  });

  page.on('response', res => {
    const headers = res.headers();
    resources.push({
      url: res.url(),
      resourceType: res.request().resourceType(),
      status: res.status(),
      headers: {
        corp: headers['cross-origin-resource-policy'] || null,
        coep: headers['cross-origin-embedder-policy'] || null,
        coop: headers['cross-origin-opener-policy'] || null,
        cors: headers['access-control-allow-origin'] || null,
      },
      classification: res.status() >= 400 ? 'HTTP_ERROR' : 'LOADED_SUCCESSFULLY',
    });
  });

  function classifyFailure(errorText, url) {
    const err = (errorText || '').toLowerCase();
    if (err.includes('blocked by response') || err.includes('corp') || err.includes('coep')) {
      return 'BLOCKED_BY_COEP_CORP';
    }
    if (err.includes('cors') || err.includes('cross-origin')) {
      return 'BLOCKED_BY_CORS';
    }
    if (err.includes('csp') || err.includes('content security policy')) {
      return 'BLOCKED_BY_CSP';
    }
    if (err.includes('net::err_aborted') && url.includes('_vercel/insights')) {
      return 'UNRELATED_FAILURE (Local environment lacks Vercel Insights endpoint)';
    }
    if (err.includes('net::err_name_not_resolved') || err.includes('net::err_connection')) {
      return 'NETWORK_FAILURE';
    }
    return `FAILED (${errorText})`;
  }

  // 1. Visit /
  console.log(`[1] Navigating to ${baseUrl}/ ...`);
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // If New Project button is visible, click it to mount Normal Mode editor
  const newProjBtn = page.locator('button', { hasText: 'New Project' }).first();
  if (await newProjBtn.isVisible()) {
    console.log('[2] Opening Normal Mode project editor...');
    await newProjBtn.click();
    await page.waitForTimeout(500);
    const createBtn = page.locator('button', { hasText: 'Create project' }).first();
    await createBtn.click();
    await page.waitForSelector('.monaco-editor', { timeout: 15000 });
    await page.waitForTimeout(3000);
  }

  // 2. Visit /ide
  console.log(`[3] Navigating to ${baseUrl}/ide ...`);
  await page.goto(`${baseUrl}/ide`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 3. Evaluate Cross-Origin Isolation & Security State
  const isolationState = await page.evaluate(() => {
    return {
      crossOriginIsolated: window.crossOriginIsolated,
      isSecureContext: window.isSecureContext,
      sabAvailable: typeof SharedArrayBuffer !== 'undefined',
      coepParent: document.featurePolicy?.allowsFeature?.('cross-origin-isolated') ?? 'unknown',
    };
  });

  console.log(`[4] Isolation State:`, isolationState);

  // Summarize Resource Audit
  console.log(`\n--- RESOURCE AUDIT SUMMARY (${resources.length} requests) ---`);
  const grouped = {};
  for (const r of resources) {
    grouped[r.classification] = grouped[r.classification] || [];
    grouped[r.classification].push(r);
  }

  for (const [cls, list] of Object.entries(grouped)) {
    console.log(`\n[${cls}] - ${list.length} resource(s):`);
    list.slice(0, 10).forEach(item => {
      console.log(`  - [${item.resourceType}] ${item.status} ${item.url}`);
      if (item.headers?.corp) console.log(`      CORP: ${item.headers.corp}`);
      if (item.headers?.cors) console.log(`      CORS: ${item.headers.cors}`);
    });
    if (list.length > 10) console.log(`  ... and ${list.length - 10} more`);
  }

  console.log(`\n--- CONSOLE WARNINGS & ERRORS (${consoleMessages.length} total) ---`);
  const issues = consoleMessages.filter(m => m.type === 'error' || m.type === 'warning');
  issues.forEach(m => console.log(`  [${m.type.toUpperCase()}] ${m.text}`));

  await browser.close();

  return { isolationState, resources, issues };
}

async function main() {
  const localAudit = await auditEnvironment(LOCAL_URL, 'LOCAL PREVIEW');
  // Attempt prod audit if online
  try {
    const prodAudit = await auditEnvironment(PROD_URL, 'PRODUCTION DEPLOYMENT');
  } catch (err) {
    console.log(`\n[Note] Production audit skipped or offline: ${err.message}`);
  }
}

main().catch(console.error);
