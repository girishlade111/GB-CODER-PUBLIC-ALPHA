import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { createPreviewServer } from './preview-combined.mjs';
import { observeRuntime } from './helpers/b4-runtime-observer.mjs';
import {
  seedProjects,
  REACT_PKG,
  REACT_VITE_CONFIG,
  REACT_INDEX,
  reactMain,
  VUE_PKG,
  VUE_VITE_CONFIG,
  VUE_INDEX,
  VUE_MAIN,
  vueApp,
} from './helpers/b4-fixtures.mjs';
const variant = process.argv
  .find((a) => a.startsWith('--variant='))
  ?.split('=')[1];
if (!['baseline', 'candidate'].includes(variant))
  throw Error('Specify baseline or candidate');
const budgetFile = 'reports/b4-measurement-budget.json';
let budget = await fs
  .readFile(budgetFile, 'utf8')
  .then(JSON.parse)
  .catch(() => ({ samples: [], controls: [] }));
if (budget.samples.some((s) => s.variant === variant))
  throw Error(
    'Variant already started: failed observations cannot be discarded or repeated',
  );
const server = createPreviewServer();
await new Promise((r) => server.listen(42996, '127.0.0.1', r));
const base = 'http://127.0.0.1:42996',
  browser = await chromium.launch({ headless: true });
async function save() {
  await fs.writeFile(budgetFile, JSON.stringify(budget, null, 2));
}
const specs = [
  {
    id: 'b4-a',
    name: 'B4 React A',
    editorStyle: 'vscode',
    projectType: 'react',
    files: [
      { path: 'package.json', content: REACT_PKG },
      { path: 'vite.config.js', content: REACT_VITE_CONFIG },
      { path: 'index.html', content: REACT_INDEX },
      { path: 'src/main.jsx', content: reactMain('B4_REACT_A') },
    ],
  },
  {
    id: 'b4-b',
    name: 'B4 Vue B',
    editorStyle: 'vscode',
    projectType: 'vue',
    files: [
      { path: 'package.json', content: VUE_PKG },
      { path: 'vite.config.js', content: VUE_VITE_CONFIG },
      { path: 'index.html', content: VUE_INDEX },
      { path: 'src/main.js', content: VUE_MAIN },
      { path: 'src/App.vue', content: vueApp('B4_VUE_B') },
      { path: 'src/style.css', content: '' },
    ],
  },
];
try {
  for (const sequence of [
    ['A'],
    ['A'],
    ['B'],
    ['B'],
    ['A', 'B', 'A'],
    ['A', 'B', 'A'],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.addInitScript(observeRuntime);
    const page = await context.newPage();
    const requests = [];
    page.on('requestfailed', (r) =>
      requests.push({
        at: Date.now(),
        url: r.url(),
        error: r.failure()?.errorText,
      }),
    );
    try {
      await page.goto(base + '/app/projects');
      await page.getByTestId('project-dashboard').waitFor();
      await seedProjects(page, specs);
      for (let pos = 0; pos < sequence.length; pos++) {
        if (
          budget.samples.length >= 20 ||
          budget.samples.reduce((n, s) => n + (s.durationMs || 0), 0) >= 4800000
        )
          throw Error('Approved measurement budget exhausted');
        const target = sequence[pos],
          id = target === 'A' ? 'b4-a' : 'b4-b',
          marker = target === 'A' ? 'B4_REACT_A' : 'B4_VUE_B';
        const sample = {
          variant,
          index: budget.samples.length + 1,
          workflow:
            sequence.length === 1
              ? 'cold-' + target
              : 'cycle-' + sequence.join('') + '-' + pos,
          target,
          start: Date.now(),
          status: 'RUNNING',
        };
        budget.samples.push(sample);
        await save();
        console.log(
          `${variant} sample ${sample.index} ${sample.workflow} started`,
        );
        try {
          if (pos === 0)
            await page.goto(`${base}/app/projects/${id}/ide`, {
              waitUntil: 'domcontentloaded',
            });
          else {
            await page
              .locator('[data-testid="vscode-topbar"] .cursor-pointer')
              .first()
              .click();
            await page.getByTestId('project-dashboard').waitFor();
            await page
              .getByText(target === 'A' ? 'B4 React A' : 'B4 Vue B', {
                exact: true,
              })
              .click();
          }
          const deadline = sample.start + 240000;
          let rendered = false;
          while (Date.now() < deadline) {
            for (const frame of page.frames()) {
              if (!frame.url().includes('webcontainer-api.io')) continue;
              if (
                (await frame
                  .locator('#marker')
                  .textContent({ timeout: 200 })
                  .catch(() => null)) === marker
              ) {
                rendered = true;
                break;
              }
            }
            if (rendered) break;
            await page.waitForTimeout(250);
          }
          sample.status = rendered ? 'PASS' : 'FAIL';
          sample.domMarker = rendered ? marker : null;
        } catch (e) {
          sample.status = 'FAIL';
          sample.error = e.message;
        } finally {
          sample.durationMs = Date.now() - sample.start;
          sample.diagnostics = await page.evaluate(() => sessionStorage.getItem('gbcoder.startup.diagnostics.v1')).catch(() => null);
          sample.runtime = await page
            .evaluate(() => globalThis.__runtimeDiagnostic)
            .catch(() => null);
          sample.terminal = await page
            .locator('.xterm-rows')
            .first()
            .innerText({ timeout: 1000 })
            .catch(() => '');
          sample.failedRequests = requests.filter((r) => r.at >= sample.start);
          await save();
          console.log(
            `${variant} sample ${sample.index} ${sample.status} ${sample.durationMs}ms`,
          );
        }
        // Focused editor/HMR regression after timing is captured; no extra startup.
        if (variant === 'candidate' && sequence.length === 1 &&
            !budget.samples.some(s => s !== sample && s.variant === variant && s.target === target) && sample.status === 'PASS') {
          sample.hmr = { status: 'RUNNING' };
          try {
            const file = target === 'A' ? 'src/main.jsx' : 'src/App.vue';
            const marker = target === 'A' ? 'B4_REACT_HMR' : 'B4_VUE_HMR';
            await page.locator(`[data-testid="tree-file"][data-path="${file}"]`).click();
            await page.locator('.monaco-editor textarea').first().focus();
            await page.keyboard.press('ControlOrMeta+a');
            await page.keyboard.type(target === 'A' ? reactMain(marker) : vueApp(marker), { delay: 1 });
            const deadline = Date.now() + 30000;
            while (Date.now() < deadline) {
              for (const frame of page.frames()) {
                if (frame.url().includes('webcontainer-api.io') && await frame.locator('#marker').textContent({timeout:200}).catch(()=>null) === marker) sample.hmr.status = 'PASS';
              }
              if (sample.hmr.status === 'PASS') break;
              await page.waitForTimeout(250);
            }
            if (sample.hmr.status !== 'PASS') throw Error('Edited Monaco source did not reach real Preview DOM');
            sample.hmr.marker = marker;
          } catch (e) { sample.hmr = {status:'FAIL', error:e.message}; process.exitCode = 1; }
          await save();
          console.log(`${variant} ${target} editor/HMR regression ${sample.hmr.status}`);
        }
        if (sample.status !== 'PASS') {
          process.exitCode = 1;
          break;
        }
      }
      if (sequence.length === 3 && budget.samples.at(-1).status === 'PASS') {
        const before = await page.evaluate(() => {
          globalThis.__b4Control = globalThis.__GBCODER_WEBCONTAINER_INSTANCE__;
          return globalThis.__runtimeDiagnostic.events.filter(
            (e) => e.type === 'shell_input' && e.text.includes('npm install'),
          ).length;
        });
        const control = {
          variant,
          index: budget.controls.length + 1,
          start: Date.now(),
        };
        budget.controls.push(control);
        try {
          await page.getByTestId('vscode-terminal-toggle').click();
          await page.getByTestId('vscode-terminal-toggle').click();
          await page.waitForTimeout(1500);
          const state = await page.evaluate(() => ({
            same:
              globalThis.__b4Control ===
              globalThis.__GBCODER_WEBCONTAINER_INSTANCE__,
            installs: globalThis.__runtimeDiagnostic.events.filter(
              (e) => e.type === 'shell_input' && e.text.includes('npm install'),
            ).length,
          }));
          control.status =
            state.same && state.installs === before ? 'PASS' : 'FAIL';
          control.state = state;
        } catch (e) {
          control.status = 'FAIL';
          control.error = e.message;
        }
        control.durationMs = Date.now() - control.start;
        await save();
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await save();
}
