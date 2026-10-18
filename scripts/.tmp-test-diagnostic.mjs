import { chromium } from 'playwright';
import { seedProjects } from './helpers/b4-fixtures.mjs';

const PREVIEW_URL = 'https://gb-coder-public-alpha-7gqzw9h57.vercel.app';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
        ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
        : {})
    };
    await route.continue({ headers });
  });

  await context.addInitScript(() => {
    localStorage.setItem('gbcoder_onboarded', 'true');
    localStorage.setItem('gbcoder_welcome_dismissed', 'true');
  });

  const page = await context.newPage();
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  console.log(`Navigating to dashboard at ${PREVIEW_URL}/app/projects...`);
  await page.goto(`${PREVIEW_URL}/app/projects`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

  const testProject = {
    id: 'test-b1-proj',
    name: 'B1 Test Synthetic',
    editorStyle: 'vscode',
    projectType: 'react',
    files: [
      { path: 'src/main.jsx', content: 'console.log("HELLO");' },
      { path: 'package.json', content: JSON.stringify({ name: 'test-app', scripts: { dev: 'vite' } }) }
    ]
  };

  await seedProjects(page, [testProject]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('project-dashboard').waitFor({ timeout: 15000 });

  console.log('Clicking project card...');
  await page.getByText(testProject.name, { exact: true }).click({ timeout: 10000 });

  console.log('Waiting for vscode-mode...');
  await page.locator('[data-testid="vscode-mode"]').waitFor({ timeout: 15000 });
  console.log('SUCCESS! [data-testid="vscode-mode"] is mounted!');

  const hasActivityBar = await page.$('[data-testid="vscode-activity-bar"]');
  console.log('Has Activity Bar:', !!hasActivityBar);

  const hasStatusBar = await page.$('[data-testid="vscode-status-bar"]');
  console.log('Has Status Bar:', !!hasStatusBar);

  await browser.close();
}

main().catch(console.error);
