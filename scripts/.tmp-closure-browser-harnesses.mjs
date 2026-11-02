import fs from 'node:fs';

let runtime = fs.readFileSync('scripts/e2e-stage-b1-browser-verification.mjs', 'utf8').replaceAll('\r\n', '\n');
runtime = runtime.replace('const PORT = 4191;', 'const PORT = 42992;')
  .replace('stage-b1-real-browser-evidence.json', 'closure-runtime-browser.json')
  .replace('const results = [];', 'const results = [];\nconst performanceMeasurements = [];');
const firstOpen = "        await page.goto(`${APP}/projects/wc-proj-a/ide`, { waitUntil: 'domcontentloaded', timeout: 45000 });";
runtime = runtime.replace(firstOpen, '        const firstAStarted = Date.now();\n' + firstOpen);
runtime = runtime.replace("        record('WC-RB-001',", "        performanceMeasurements.push({ phase: 'React initial startup', readinessMs: Date.now() - firstAStarted, terminal: await termText(page) });\n        record('WC-RB-001',");
runtime = runtime.replace("        await page.locator('text=WC-Proj-B').first().click();", "        const firstBStarted = Date.now();\n        await page.locator('text=WC-Proj-B').first().click();");
runtime = runtime.replace("        record('WC-RB-003',", "        performanceMeasurements.push({ phase: 'A->B Vue startup through dashboard', readinessMs: Date.now() - firstBStarted, terminal: await termText(page) });\n        record('WC-RB-003',");
const loopStart = runtime.indexOf('        // 4. WC-RB-004:');
const loopEnd = runtime.indexOf('      } catch (err) {', loopStart);
if (loopStart < 0 || loopEnd < 0) throw new Error('Missing browser switching block');
runtime = runtime.slice(0, loopStart) + `        // In-app A/B/A switches measure the new-runtime cost without reloading the host page.
        let previous = 'B';
        for (const target of ['A', 'B', 'A']) {
          const started = Date.now();
          await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click();
          await page.getByTestId('project-dashboard').waitFor({ timeout: 30000 });
          await page.locator('text=WC-Proj-' + target).first().click();
          await page.getByTestId('vscode-mode').waitFor({ timeout: 60000 });
          await waitTerm(page, /ready in \\d+\\s?ms/i, 240000, 'switched runtime readiness');
          let rendered;
          const deadline = Date.now() + 60000;
          do {
            rendered = await previewFrameText(page, 5000);
            if (rendered?.includes('WC-PROJECT-' + target)) break;
            await page.waitForTimeout(200);
          } while (Date.now() < deadline);
          assert.ok(rendered?.includes('WC-PROJECT-' + target), 'current project DOM marker after in-app switch');
          const terminal = await termText(page);
          performanceMeasurements.push({ phase: previous + '->' + target, readinessMs: Date.now() - started,
            installCompletions: (terminal.match(/added [\\d]+ packages?|up to date/g) || []).length, terminal });
          previous = target;
        }
        record('WC-RB-004', 'In-app project switching (B -> A -> B -> A)', 'PASS', { performanceMeasurements });

` + runtime.slice(loopEnd);
runtime = runtime.replace('results, passed, failed, logs: logBuffer', 'results, passed, failed, performanceMeasurements, logs: logBuffer');
fs.writeFileSync('scripts/e2e-phase2-2-runtime-browser.mjs', runtime);

let concurrency = fs.readFileSync('scripts/test-stage-b2-concurrency-closure.mjs', 'utf8');
concurrency = concurrency.replace('const PORT = 4191;', 'const PORT = 42993;')
  .replace('stage-b2-concurrency-evidence.json', 'closure-concurrency-browser.json');
fs.writeFileSync('scripts/e2e-phase2-2-concurrency.mjs', concurrency);
