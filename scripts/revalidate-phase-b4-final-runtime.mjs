import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { createPreviewServer } from './preview-combined.mjs';
import { observeRuntime } from './helpers/b4-runtime-observer.mjs';
import { seedProjects, REACT_PKG, REACT_VITE_CONFIG, REACT_INDEX, reactMain,
  VUE_PKG, VUE_VITE_CONFIG, VUE_INDEX, VUE_MAIN, vueApp } from './helpers/b4-fixtures.mjs';

// A distinct, exclusive ledger prevents rerunning or replacing this campaign.
const evidencePath = 'reports/b4-final-runtime-revalidation.json';
const base = 'http://127.0.0.1:42996';
const expectedHead = '546e74c084387d007b0312b9fbd69a9f6a6b55f1';
const expectedSourceTree = '9aa028bae95c4617696c80ce69ba31dbd225d4cb17b1856db47396b98087a6de';
const expectedDistTree = '1b59033702e1c23b0fc746c1c55631312a57eba87fe49ca4eaef99d15e9ebdb5';
const savedIdentity = JSON.parse(await fs.readFile('reports/b4-final-source-artifact.json', 'utf8'));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
async function filesIn(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const path = dir + '/' + entry.name;
    assert.equal(entry.isSymbolicLink(), false, 'Unexpected symlink: ' + path);
    if (entry.isDirectory()) result.push(...await filesIn(path));
    else if (entry.isFile()) result.push({ path, sha256: sha(await fs.readFile(path)) });
  }
  return result.sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
const treeHash = entries => sha(entries.map(e => e.path + '\0' + e.sha256 + '\n').join(''));
async function identity() {
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), expectedHead);
  const src = await filesIn('src'), dist = await filesIn('dist');
  assert.equal(treeHash(src), expectedSourceTree, 'Source tree changed');
  assert.equal(treeHash(dist), expectedDistTree, 'Build artifact changed');
  for (const file of [...savedIdentity.sourceHashes, ...savedIdentity.jsHashes]) {
    assert.equal(sha(await fs.readFile(file.path)), file.sha256, 'Hash mismatch: ' + file.path);
  }
  const manifestSha256 = sha(await fs.readFile('dist/build-manifest.json'));
  assert.equal(manifestSha256, savedIdentity.manifestSha256);
  return { at: Date.now(), head: expectedHead, sourceTreeSha256: treeHash(src), sourceFileCount: src.length,
    distTreeSha256: treeHash(dist), distFileCount: dist.length, manifestSha256,
    sourceHashes: savedIdentity.sourceHashes, checkedJs: savedIdentity.jsHashes.length };
}
const specs = [
  { id: 'b4-a', name: 'B4 React A', editorStyle: 'vscode', projectType: 'react', files: [
    { path: 'package.json', content: REACT_PKG }, { path: 'vite.config.js', content: REACT_VITE_CONFIG },
    { path: 'index.html', content: REACT_INDEX }, { path: 'src/main.jsx', content: reactMain('B4_REACT_A') }] },
  { id: 'b4-b', name: 'B4 Vue B', editorStyle: 'vscode', projectType: 'vue', files: [
    { path: 'package.json', content: VUE_PKG }, { path: 'vite.config.js', content: VUE_VITE_CONFIG },
    { path: 'index.html', content: VUE_INDEX }, { path: 'src/main.js', content: VUE_MAIN },
    { path: 'src/App.vue', content: vueApp('B4_VUE_B') }, { path: 'src/style.css', content: '' }] },
];
const asset = savedIdentity.jsHashes.find(e => /\/webcontainerService-/.test(e.path));
assert.ok(asset, 'Compiled production service module is required');
const serviceUrl = base + asset.path.replace(/^dist/, '');
const initialIdentity = await identity();
const ledger = await fs.open(evidencePath, 'wx');
await ledger.close();
const evidence = { authorization: { maxStarts: 7, perStartMs: 240000, totalObservationMs: 2100000,
  sequences: [['A'], ['A'], ['B'], ['B'], ['A', 'B', 'A']], maxReconnectControls: 1,
  stopAtFirstFailure: true, localOrigin: base }, startedAt: Date.now(), status: 'PREPARING',
  identity: initialIdentity, artifactChecks: [], samples: [], controls: [],
  gitStatusBefore: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }),
  fixtureSha256: sha(await fs.readFile('scripts/helpers/b4-fixtures.mjs')) };
const save = () => fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2));
await save();

// Read the compiled application's own singleton; observation does not replace
// startup commands, readiness handlers, storage, or process architecture.
async function attachServiceObserver(page) {
  await page.evaluate(async url => {
    const { webcontainerService: service } = await import(url);
    const d = { snapshots: [], runtimeEvents: [], runtimeCount: 0 };
    const ids = new WeakMap();
    const id = runtime => {
      if (!runtime) return null;
      if (!ids.has(runtime)) {
        const value = ++d.runtimeCount;
        ids.set(runtime, value);
        d.runtimeEvents.push({ type: 'assigned', id: value, at: Date.now() });
        const teardown = runtime.teardown.bind(runtime);
        runtime.teardown = (...args) => {
          d.runtimeEvents.push({ type: 'teardown', id: value, at: Date.now() });
          return teardown(...args);
        };
      }
      return ids.get(runtime);
    };
    function snapshot() {
      const owner = service.captureStartupOwner(), state = service.getState(), op = service.automaticStartup;
      return { at: Date.now(), projectId: owner.projectId, epoch: owner.epoch, generation: owner.generation,
        runtimeId: id(owner.instance), hasRuntime: Boolean(owner.instance),
        ownsGlobalRuntime: Boolean(owner.instance && owner.instance === globalThis.__GBCODER_WEBCONTAINER_INSTANCE__),
        stage: state.startupStage, status: state.status, previewStatus: state.previewStatus,
        busy: service.isAutomaticStartupBusy(), installedProof: Boolean(service.getInstalledFingerprint()),
        shellExists: Boolean(service.shellProcess),
        operation: op ? { dispatched: op.dispatched, needsInstall: op.needsInstall,
          completionObserved: op.completionObserved, currentOwner: service.isStartupOwner(op.owner) } : null };
    }
    function observe() {
      const next = snapshot(), prior = d.snapshots.at(-1);
      if (!prior || JSON.stringify({ ...prior, at: 0 }) !== JSON.stringify({ ...next, at: 0 })) {
        d.snapshots.push(next);
        if (d.snapshots.length > 2000) d.snapshots.shift();
      }
    }
    service.subscribe(observe);
    setInterval(observe, 250);
    observe();
    globalThis.__b4Final = { service, diagnostic: d, snapshot, previousRuntime: null };
  }, serviceUrl);
}
async function snapshot(page) {
  return page.evaluate(() => {
    const f = globalThis.__b4Final;
    return { state: f.snapshot(), diagnostics: f.service.getStartupDiagnostics(),
      runtime: globalThis.__runtimeDiagnostic, ownership: f.diagnostic };
  });
}
async function preserve(page, sample, network, consoleErrors, pageErrors) {
  sample.captureStartedAt = Date.now();
  try { Object.assign(sample, await snapshot(page)); }
  catch (error) { sample.captureError = error.message; }
  sample.terminal = await page.locator('.xterm-rows').first().innerText({ timeout: 1000 }).catch(() => '');
  sample.network = network.filter(e => e.at >= sample.start);
  sample.consoleErrors = consoleErrors.filter(e => e.at >= sample.start);
  sample.pageErrors = pageErrors.filter(e => e.at >= sample.start);
  sample.captureCompletedAt = Date.now();
  await save();
}
async function verifyCorrectness(page, spec) {
  return page.evaluate(async ({ spec, other }) => {
    const f = globalThis.__b4Final, service = f.service, owner = service.captureStartupOwner();
    if (!owner.instance) throw Error('Missing owned runtime after real DOM readiness');
    if (owner.projectId !== spec.id || !service.isStartupOwner(owner)) throw Error('Wrong startup owner');
    if (owner.instance !== globalThis.__GBCODER_WEBCONTAINER_INSTANCE__) throw Error('Runtime/global owner mismatch');
    const hadPrevious = Boolean(f.previousRuntime);
    if (f.previousRuntime && owner.instance === f.previousRuntime) throw Error('Project switch reused previous runtime');
    const digest = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
      .map(n => n.toString(16).padStart(2, '0')).join('');
    const files = [];
    for (const file of spec.files) {
      const actual = await owner.instance.fs.readFile(file.path, 'utf8');
      const actualSha256 = await digest(actual), expectedSha256 = await digest(file.content);
      if (actualSha256 !== expectedSha256) throw Error('Wrong virtual source content: ' + file.path);
      files.push({ path: file.path, sha256: actualSha256 });
    }
    const absent = [];
    for (const file of other.files.filter(file => !spec.files.some(current => current.path === file.path))) {
      try { await owner.instance.fs.readFile(file.path); throw Error('Cross-project file present: ' + file.path); }
      catch (error) {
        if (!String(error).includes('ENOENT')) throw error;
        absent.push(file.path);
      }
    }
    const check = await service.needsDependencyInstall(spec.files, undefined, spec.projectType);
    if (check.needsInstall || !service.getInstalledFingerprint()) throw Error('Owned install proof missing after successful startup');
    if (service.isAutomaticStartupBusy()) throw Error('Automatic operation still busy after successful startup');
    const privacy = JSON.stringify(service.getStartupDiagnostics());
    if (privacy.includes(JSON.stringify(spec.id)) || privacy.includes('B4_REACT_A') || privacy.includes('B4_VUE_B') || privacy.includes('npm install'))
      throw Error('Source/project identifier or terminal command disclosed in stored diagnostics');
    const attemptKeys = ['id','scope','epoch','generation','startedAt','state','events'];
    const eventKeys = ['phase','outcome','at','durationMs','code','reason','exitCode'];
    const records = service.getStartupDiagnostics();
    for (const record of records) {
      if (Object.keys(record).some(key => !attemptKeys.includes(key))) throw Error('Unexpected diagnostic attempt field');
      for (const event of record.events) {
        if (Object.keys(event).some(key => !eventKeys.includes(key))) throw Error('Unexpected diagnostic event field');
        if ('exitCode' in event && event.phase !== 'shell') throw Error('Fabricated non-shell numeric exit');
      }
    }
    if (records.length > 5 || new TextEncoder().encode(privacy).length > 262144) throw Error('Diagnostic retention exceeded');
    const stored = await new Promise((resolve, reject) => {
      const request = indexedDB.open('gb-coder-projects-db', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result, transaction = db.transaction('projectFiles', 'readonly');
        const get = transaction.objectStore('projectFiles').getAll();
        get.onsuccess = () => resolve(get.result.filter(file => file.projectId === spec.id));
        get.onerror = () => reject(get.error);
        transaction.oncomplete = () => db.close();
      };
    });
    for (const file of spec.files) {
      if (stored.find(current => current.path === file.path)?.content !== file.content)
        throw Error('Authoritative synthetic source changed: ' + file.path);
    }
    const sameGeneration = !f.previousOwner || owner.generation > f.previousOwner.generation;
    if (!sameGeneration) throw Error('Runtime generation did not advance across project switch');
    f.previousRuntime = owner.instance;
    f.previousOwner = { projectId: owner.projectId, epoch: owner.epoch, generation: owner.generation };
    return { owner: f.previousOwner, sourceHashes: files, otherProjectPathsAbsent: absent,
      installedProof: true, subsequentInstallRequired: check.needsInstall,
      diagnosticAllowlist: true, authoritativeSourcesExact: true,
      previousRuntimeDifferent: hadPrevious ? true : null, generationAdvanced: hadPrevious ? true : null };
  }, { spec, other: specs.find(other => other.id !== spec.id) });
}
async function reconnect(page) {
  return page.evaluate(async () => {
    const f = globalThis.__b4Final, service = f.service, before = service.captureStartupOwner();
    if (!service.shellProcess || service.isAutomaticStartupBusy()) throw Error('No confirmed existing shell for reconnect');
    const process = service.shellProcess, events = globalThis.__runtimeDiagnostic.events;
    const beforeSpawns = events.filter(e => e.type === 'process_spawn_invoked').length;
    const installs = () => events.filter(e => e.type === 'shell_input' && e.text.includes('npm install')).length;
    const beforeInstalls = installs();
    const first = await service.spawnInteractiveShell({ cols: 100, rows: 30, onData() {} });
    first.disconnect();
    const second = await service.spawnInteractiveShell({ cols: 100, rows: 30, onData() {} });
    second.write('\r'); // Benign input forwarding while Vite owns the foreground.
    await new Promise(resolve => setTimeout(resolve, 300));
    second.disconnect();
    const after = service.captureStartupOwner();
    const result = { sameProject: before.projectId === after.projectId, sameEpoch: before.epoch === after.epoch,
      sameGeneration: before.generation === after.generation, sameRuntime: before.instance === after.instance,
      sameShell: process === service.shellProcess,
      noNewSpawn: beforeSpawns === events.filter(e => e.type === 'process_spawn_invoked').length,
      noNewInstall: beforeInstalls === installs(),
      manualInputForwarded: events.some(e => e.type === 'shell_input' && e.text === '\r'),
      installedProofPreserved: Boolean(service.getInstalledFingerprint()) };
    if (Object.values(result).some(value => value !== true)) throw Error('Reconnect assertion failed: ' + JSON.stringify(result));
    return result;
  });
}

let browser, server, currentContext;
try {
  server = createPreviewServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(42996, '127.0.0.1', resolve); });
  browser = await chromium.launch({ headless: true });
  evidence.browserVersion = browser.version();
  evidence.status = 'RUNNING';
  await save();
  for (const sequence of evidence.authorization.sequences) {
    currentContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await currentContext.addInitScript(observeRuntime);
    const page = await currentContext.newPage();
    const network = [], consoleErrors = [], pageErrors = [];
    page.on('requestfailed', request => network.push({ at: Date.now(), kind: 'failed', url: request.url(),
      resourceType: request.resourceType(), error: request.failure()?.errorText }));
    page.on('response', response => {
      if (/staticblitz|webcontainer-api/.test(response.url()) || response.status() >= 400)
        network.push({ at: Date.now(), kind: 'response', url: response.url(), status: response.status() });
    });
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ at: Date.now(), text: message.text().slice(0, 4096) }); });
    page.on('pageerror', error => pageErrors.push({ at: Date.now(), message: error.message.slice(0, 4096) }));
    await page.goto(base + '/app/projects', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByTestId('project-dashboard').waitFor();
    await seedProjects(page, specs);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('project-dashboard').waitFor();
    await attachServiceObserver(page);
    for (let position = 0; position < sequence.length; position++) {
      assert.ok(evidence.samples.length < 7);
      assert.ok(evidence.samples.reduce((sum, s) => sum + (s.durationMs || 0), 0) < 2100000);
      evidence.artifactChecks.push(await identity());
      const target = sequence[position], spec = specs[target === 'A' ? 0 : 1];
      const sample = { index: evidence.samples.length + 1, target, projectId: spec.id,
        workflow: sequence.length === 1 ? 'fresh-' + target : 'A-B-A-' + position,
        start: Date.now(), status: 'RUNNING', deadlineMs: 240000 };
      evidence.samples.push(sample);
      await save();
      console.log(`sample ${sample.index} ${sample.workflow} started`);
      try {
        const deadline = sample.start + 240000;
        if (position > 0) {
          await page.locator('[data-testid="vscode-topbar"] .cursor-pointer').first().click({ timeout: 10000 });
          await page.getByTestId('project-dashboard').waitFor({ timeout: 10000 });
        }
        await page.getByText(spec.name, { exact: true }).click({ timeout: 10000 });
        const marker = target === 'A' ? 'B4_REACT_A' : 'B4_VUE_B';
        let rendered = false;
        while (Date.now() < deadline) {
          const state = await page.evaluate(() => {
            const f = globalThis.__b4Final;
            return { state: f.snapshot(), attempt: f.service.getStartupDiagnostics().at(-1) };
          });
          if (state.state.stage === 'error' || ['failed','timed_out','unknown'].includes(state.attempt?.state)) {
            sample.failureKind = 'application_startup_error';
            throw Error('Startup failure observed: ' + JSON.stringify(state));
          }
          for (const frame of page.frames()) {
            if (!frame.url().includes('webcontainer-api.io')) continue;
            const remaining = deadline - Date.now();
            if (remaining <= 0) break;
            if (await frame.locator('#marker').textContent({ timeout: Math.min(150, remaining) }).catch(() => null) === marker) {
              rendered = true;
              break;
            }
          }
          if (rendered) break;
          await page.waitForTimeout(Math.min(150, Math.max(1, deadline - Date.now())));
        }
        sample.durationMs = Date.now() - sample.start;
        if (!rendered) { sample.failureKind = 'observation_timeout'; throw Error('Real Preview DOM absent at 240-second deadline'); }
        sample.domMarker = marker;
        sample.correctness = await verifyCorrectness(page, spec);
        sample.status = 'PASS';
      } catch (error) {
        sample.status = 'FAIL';
        sample.error = error.message;
        sample.durationMs ??= Date.now() - sample.start;
        evidence.status = 'STOPPED_FIRST_FAILURE';
        process.exitCode = 1;
      }
      await preserve(page, sample, network, consoleErrors, pageErrors);
      evidence.artifactChecks.push(await identity());
      console.log(`sample ${sample.index} ${sample.status} ${sample.durationMs}ms`);
      if (sample.status !== 'PASS') throw Error('Campaign stopped at first required startup failure');
    }
    if (sequence.length === 3) {
      const control = { index: 1, start: Date.now(), status: 'RUNNING' };
      evidence.controls.push(control);
      try { control.assertions = await reconnect(page); control.status = 'PASS'; }
      catch (error) { control.status = 'FAIL'; control.error = error.message; process.exitCode = 1; }
      control.durationMs = Date.now() - control.start;
      control.evidence = await snapshot(page);
      await save();
      console.log('same-runtime reconnect ' + control.status);
      if (control.status !== 'PASS') throw Error('Reconnect correctness control failed');
    }
    await currentContext.close();
    currentContext = null;
  }
  evidence.status = 'COMPLETED';
} catch (error) {
  evidence.error = error.message;
  if (evidence.status !== 'STOPPED_FIRST_FAILURE') evidence.status = 'BLOCKED';
  process.exitCode = 1;
} finally {
  evidence.captureBeforeCleanupAt = Date.now();
  await save();
  await currentContext?.close().catch(error => { evidence.cleanupError = error.message; });
  await browser?.close().catch(error => { evidence.cleanupError = error.message; });
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  try { evidence.finalIdentity = await identity(); }
  catch (error) { evidence.identityError = error.message; evidence.status = 'BLOCKED'; process.exitCode = 1; }
  evidence.completedAt = Date.now();
  evidence.totalObservationMs = evidence.samples.reduce((sum, sample) => sum + (sample.durationMs || 0), 0);
  evidence.unexecutedStartupObservations = 7 - evidence.samples.length;
  evidence.gitStatusAfter = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  await save();
  console.log(`Campaign ${evidence.status}; ${evidence.samples.length}/7 observations; ${evidence.totalObservationMs}ms observed.`);
}
