/**
 * End-to-end check of the QR mobile preview against the running dev server.
 *
 * Publishes a document the way PreviewPanel does, opens /mpreview/:id in a
 * phone-sized browser, and asserts the mobile page renders it, mirrors console
 * output, and picks up a republish. Creates its own session, so it needs no
 * arguments.
 */
import { chromium } from 'playwright';
import { buildConsoleBridgeScript } from './bridge.local.mjs';

const BASE = 'http://127.0.0.1:5199';

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

const publish = (document, id) =>
  fetch(`${BASE}/api/preview/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(id ? { id, document } : { document }),
  }).then((r) => r.json());

/**
 * Builds a document shaped like the one PreviewPanel publishes: user markup,
 * the real console bridge (so the mobile console has something to listen to),
 * then the user's own script. Approximating the bridge here would test the
 * approximation rather than the integration.
 */
const doc = (marker, runId) =>
  `<!DOCTYPE html><html><head><style>body{font-family:sans-serif}</style></head>` +
  `<body><h1 id="marker">${marker}</h1>` +
  `<script>${buildConsoleBridgeScript(runId)}</` +
  `script>` +
  `<script>console.log('user-log-1');console.warn('user-warn-1');console.error('user-error-1');</` +
  `script></body></html>`;

const state = await publish(doc('FIRST', 'run-1'));
check('publish returns a 32-char session id', /^[A-Za-z0-9_-]{32}$/.test(state.id));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}/mpreview/${state.id}`, { waitUntil: 'networkidle' });

const frame = () => page.frameLocator('iframe[title="Mobile Live Preview"]');

await frame().locator('#marker').waitFor({ timeout: 20000 });
check(
  'mobile page renders published document',
  (await frame().locator('#marker').textContent()) === 'FIRST',
);

const consoleBtn = page.locator('button[title="Toggle mobile console"]');
await consoleBtn.click();
await page.locator('text=user-log-1').waitFor({ timeout: 15000 });
check('console shows user log', true);
check('console shows user warning', await page.locator('text=user-warn-1').isVisible());
check('console shows user error', await page.locator('text=user-error-1').isVisible());
check('FAB badge shows the error count', (await consoleBtn.textContent()).includes('1'));
check(
  'no editor chrome leaked into the phone page',
  (await page.locator('text=Live Preview').count()) === 0,
);

// Republish with no reload: the poll loop must pick it up on its own.
await publish(doc('SECOND'), state.id);
let pickedUp = false;
try {
  await frame().locator('text=SECOND').waitFor({ timeout: 15000 });
  pickedUp = true;
} catch {
  pickedUp = false;
}
check('republished document syncs to device', pickedUp);

// Reload button re-runs the current document.
await page.locator('button[title="Reload preview"]').click();
let reloaded = false;
try {
  await frame().locator('#marker').waitFor({ timeout: 10000 });
  reloaded = true;
} catch {
  reloaded = false;
}
check('reload button re-mounts the document', reloaded);

// Expired session shows an explanation, not a blank screen.
await fetch(`${BASE}/api/preview/sync?id=${state.id}`, { method: 'DELETE' });
const gone = await context.newPage();
await gone.goto(`${BASE}/mpreview/${state.id}`, { waitUntil: 'networkidle' });
await gone.locator('text=Preview unavailable').waitFor({ timeout: 15000 });
check('expired session shows an explanatory state', true);

await browser.close();

console.log(`\n${failures.length === 0 ? 'ALL PASS' : `FAILURES: ${failures.join(', ')}`}`);
if (pageErrors.length) console.log(`page errors: ${pageErrors.join(' | ')}`);
process.exit(failures.length === 0 ? 0 : 1);
