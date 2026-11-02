import { chromium } from 'playwright';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://gb-coder-public-alp-git-fa5957-girishlade111-gmailcoms-projects.vercel.app';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

console.log('Testing Playwright navigation to:', PREVIEW_URL);

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {}
  });

  await ctx.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      ...(BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {})
    };
    await route.continue({ headers });
  });

  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('gbcoder_onboarded', 'true'); } catch {}
  });

  const page = await ctx.newPage();
  
  const res = await page.goto(`${PREVIEW_URL}/app/projects`, { waitUntil: 'networkidle', timeout: 45000 });
  console.log('HTTP Status:', res?.status());
  console.log('Title:', await page.title());
  
  const newProjCount = await page.locator('[data-testid="dashboard-new-project"], [data-testid="dashboard-empty-create"]').count();
  console.log('New Project button count:', newProjCount);
  
  const headerText = await page.locator('header').first().innerText().catch(() => '');
  console.log('Header text sample:', headerText.slice(0, 100));

} finally {
  await browser.close();
}
