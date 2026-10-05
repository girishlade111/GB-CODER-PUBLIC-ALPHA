/**
 * Exercises the desktop side: create a project, open the preview toolbar's QR
 * button, and assert the modal renders a QR encoding a URL that resolves to a
 * working preview on a phone-sized viewport.
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5199';

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// The app opens on a projects screen; create a plain project to reach the editor.
await page.locator('button:has-text("New Project")').first().click();
await page.locator('input').first().fill('qr-e2e-project');
await page.locator('button:has-text("Create project")').click();
await page.waitForTimeout(4000);

const qrButton = page.locator('button[aria-label="Test on Mobile via QR Code"]');
await qrButton.waitFor({ timeout: 30000 });
check('QR toolbar button exists in the preview header', true);

await qrButton.click();
await page.locator('text=Test on Mobile').first().waitFor({ timeout: 20000 });
check('modal opens', true);

await page.waitForSelector('svg[shape-rendering="crispEdges"]', { timeout: 20000 });
check('QR code renders as SVG', true);

await page.locator('text=Sync Active').waitFor({ timeout: 20000 });
check('status pill reports Sync Active', true);

const url = (await page.locator('code').first().textContent())?.trim() ?? '';
check('modal shows an active URL', url.length > 0, url);
check('URL points at /mpreview/<id>', /\/mpreview\/[A-Za-z0-9_-]{32}$/.test(url));

check(
  'Local Wi-Fi mode is offered on a LAN dev server',
  !(await page.locator('button:has-text("Local Wi-Fi")').isDisabled()),
);
check(
  'address picker appears when several adapters exist',
  (await page.locator('#lan-address-select').count()) === 1,
);

// Clipboard needs a secure context; over plain http it must degrade, not crash.
await page.locator('button[title="Copy URL"]').click();
await page.waitForTimeout(600);
check('copy button does not crash the modal', (await page.locator('text=Test on Mobile').count()) > 0);

// Follow the encoded URL as a phone would, rewriting the host to loopback.
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const phonePage = await phone.newPage();
await phonePage.goto(url.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: 'networkidle' });
const frame = phonePage.frameLocator('iframe[title="Mobile Live Preview"]');
let phoneOk = false;
try {
  await frame.locator('body').first().waitFor({ timeout: 25000 });
  phoneOk = true;
} catch {
  phoneOk = false;
}
check('encoded URL resolves to a working preview', phoneOk);

// Auto-refresh toggle round-trips.
const toggle = page.locator('input[type="checkbox"]');
await toggle.uncheck();
check('auto-refresh can be turned off', !(await toggle.isChecked()));
await toggle.check();
check('auto-refresh can be turned back on', await toggle.isChecked());

// Ending the session revokes the phone's access immediately.
const sessionId = url.split('/mpreview/')[1];
await page.locator('button:has-text("End session")').click();
await page.waitForTimeout(600);
const after = await fetch(`${BASE}/api/preview/sync?id=${sessionId}`);
check('End session revokes the session', after.status === 404, `HTTP ${after.status}`);

// Closing the modal leaves nothing behind.
await page.locator('button[aria-label="Close mobile preview"]').click();
await page.waitForTimeout(400);
check('modal closes', (await page.locator('text=Scan with your phone camera').count()) === 0);

await browser.close();
console.log(`\n${failures.length === 0 ? 'ALL PASS' : `FAILURES: ${failures.join(', ')}`}`);
if (pageErrors.length) console.log(`page errors: ${pageErrors.join(' | ')}`);
process.exit(failures.length === 0 ? 0 : 1);
