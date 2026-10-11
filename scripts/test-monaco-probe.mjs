import { chromium } from 'playwright';

async function run() {
  console.log('[PROBE] Launching Chromium against http://localhost:4175/ ...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
  });
  const page = await browser.newPage();

  const warnings = [];
  const errors = [];
  const networkWorkers = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'warning') warnings.push(text);
    if (msg.type() === 'error') errors.push(text);
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${text}`);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  page.on('request', req => {
    if (req.url().includes('worker') || req.resourceType() === 'worker') {
      networkWorkers.push({ url: req.url(), resourceType: req.resourceType() });
      console.log(`[WORKER REQUEST] ${req.resourceType()} ${req.url()}`);
    }
  });

  console.log('[PROBE] Navigating to http://localhost:4175/ ...');
  await page.goto('http://localhost:4175/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Click New Project button
  const newProjBtn = page.locator('button', { hasText: 'New Project' }).first();
  await newProjBtn.click();
  await page.waitForTimeout(500);

  // Submit modal
  const createSubmitBtn = page.locator('button', { hasText: 'Create project' }).first();
  await createSubmitBtn.click();

  console.log('[PROBE] Waiting for Monaco editors to mount...');
  await page.waitForSelector('.monaco-editor', { timeout: 15000 });
  console.log('[PROBE] Monaco editors mounted! Waiting for worker activity...');
  await page.waitForTimeout(3000);

  // Check MonacoEnvironment and worker stats
  const status = await page.evaluate(async () => {
    const win = window;
    const monacoEnv = win.MonacoEnvironment;

    const results = {
      hasMonaco: typeof win.monaco !== 'undefined',
      hasMonacoEnv: typeof monacoEnv !== 'undefined',
      hasGetWorker: typeof monacoEnv?.getWorker === 'function',
      workerCounts: win.__gbCoderWorkerStats || null,
      models: win.monaco?.editor?.getModels().map(m => ({ uri: m.uri.toString(), lang: m.getLanguageId() }))
    };

    // Trigger language validation / worker requests explicitly
    try {
      // 1. Trigger CSS diagnostics
      const cssModel = win.monaco.editor.getModels().find(m => m.getLanguageId() === 'css');
      if (cssModel) {
        cssModel.setValue('body { color: red; font-size: 16px; unknown-css-prop: invalid; }');
      }

      // 2. Trigger HTML diagnostics
      const htmlModel = win.monaco.editor.getModels().find(m => m.getLanguageId() === 'html');
      if (htmlModel) {
        htmlModel.setValue('<div class="test"><p>Hello <span>World</span></p></div>');
      }

      // 3. Trigger JS/TS diagnostics
      const jsModel = win.monaco.editor.getModels().find(m => m.getLanguageId() === 'javascript');
      if (jsModel) {
        jsModel.setValue('const x: number = 42; console.log(x);');
      }
    } catch (e) {
      results.evalError = e.message;
    }

    return results;
  });

  console.log('[PROBE] Monaco environment evaluation:\n', JSON.stringify(status, null, 2));

  // Wait 3 seconds for worker parsing
  await page.waitForTimeout(3000);

  // Check for fallback warning
  const fallbackWarning = warnings.find(w => w.includes('Could not create web worker') || w.includes('Falling back to loading web worker code'));
  console.log('\n--- VERIFICATION RESULTS ---');
  console.log('Worker requests observed:', networkWorkers.length);
  networkWorkers.forEach(w => console.log(' ->', w.url));
  console.log('Main thread fallback warning detected:', fallbackWarning ? 'YES (FAILED)' : 'NO (PASSED)');

  await browser.close();
}

run().catch(console.error);
