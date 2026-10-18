import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const dir = 'scripts/.tmp-b4-4', origin = 'http://127.0.0.1:42997', output = 'reports/b4-4-stage2-2-results.json';
const git = (...args) => execFileSync('git', args, {encoding: 'utf8'}).trim();

assert.equal(git('rev-parse', 'HEAD'), '30804ea3e3f94814b46b7a9934fb477f91354615');
assert.equal(git('status', '--porcelain', '--untracked-files=no'), '');
assert.equal(JSON.parse(await fs.readFile('node_modules/@webcontainer/api/package.json')).version, '1.6.4');
assert.equal(JSON.parse(await fs.readFile('reports/b4-4-stage0.json')).failed, 0);

const sourcePaths = [
  'policy.mjs',
  'browser.mjs',
  'run.mjs',
  'fixtures.json',
  'test-stage1-1.mjs',
  'test-stage1-2.mjs',
  'test-stage1-2-1.mjs',
  'test-stage1-2-2.mjs',
  'test-stage2-vue.mjs',
  'test-stage2-2-benchmark.mjs',
  'react/package.json',
  'react/package-lock.json',
  'vue/package.json',
  'vue/package-lock.json'
];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const identity = await Promise.all(sourcePaths.map(async p => ({path: dir + '/' + p, sha256: sha(await fs.readFile(dir + '/' + p))})));

await build({entryPoints: [dir + '/browser.mjs'], outfile: dir + '/bundle.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022'});

const ledger = await fs.open(output, 'w');
await ledger.close();

const sequence = [
  // React block (9 boots): 1 Producer, then C -> R -> R -> C -> R -> C -> C -> R
  { index: 0, block: 'react', kind: 'react', role: 'producer',  label: 'P-React',  expectedMarker: 'B44_REACT_A' },
  { index: 1, block: 'react', kind: 'react', role: 'control',   label: 'C1-React', expectedMarker: 'B44_REACT_A' },
  { index: 2, block: 'react', kind: 'react', role: 'candidate', label: 'R1-React', expectedMarker: 'B44_REACT_A' },
  { index: 3, block: 'react', kind: 'react', role: 'candidate', label: 'R2-React', expectedMarker: 'B44_REACT_A' },
  { index: 4, block: 'react', kind: 'react', role: 'control',   label: 'C2-React', expectedMarker: 'B44_REACT_A' },
  { index: 5, block: 'react', kind: 'react', role: 'candidate', label: 'R3-React', expectedMarker: 'B44_REACT_A' },
  { index: 6, block: 'react', kind: 'react', role: 'control',   label: 'C3-React', expectedMarker: 'B44_REACT_A' },
  { index: 7, block: 'react', kind: 'react', role: 'control',   label: 'C4-React', expectedMarker: 'B44_REACT_A' },
  { index: 8, block: 'react', kind: 'react', role: 'candidate', label: 'R4-React', expectedMarker: 'B44_REACT_A' },

  // Vue block (9 boots): 1 Producer, then R -> C -> C -> R -> C -> R -> R -> C
  { index: 9,  block: 'vue', kind: 'vue', role: 'producer',  label: 'P-Vue',  expectedMarker: 'B44_VUE_B' },
  { index: 10, block: 'vue', kind: 'vue', role: 'candidate', label: 'R1-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 11, block: 'vue', kind: 'vue', role: 'control',   label: 'C1-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 12, block: 'vue', kind: 'vue', role: 'control',   label: 'C2-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 13, block: 'vue', kind: 'vue', role: 'candidate', label: 'R2-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 14, block: 'vue', kind: 'vue', role: 'control',   label: 'C3-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 15, block: 'vue', kind: 'vue', role: 'candidate', label: 'R3-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 16, block: 'vue', kind: 'vue', role: 'candidate', label: 'R4-Vue', expectedMarker: 'B44_VUE_B' },
  { index: 17, block: 'vue', kind: 'vue', role: 'control',   label: 'C4-Vue', expectedMarker: 'B44_VUE_B' }
];

const evidence = {
  scope: 'Phase B.4.4 Stage 2.2 controlled binary dependency restoration performance benchmark; 18 boots, React + Vue counterbalanced; no product integration',
  head: git('rev-parse', 'HEAD'),
  branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
  identity,
  apiVersion: '1.6.4',
  bundleSha256: sha(await fs.readFile(dir + '/bundle.js')),
  status: 'PREPARING',
  startedAt: Date.now(),
  budget: {
    maxBoots: 18,
    maxCampaigns: 1,
    perObservationMs: 240000,
    campaignMs: 3600000,
    captureMs: 10000,
    restoreValidationMs: 15000,
    retries: 0
  },
  sequence,
  observations: [],
  metrics: null,
  criteriaEvaluation: null,
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  httpErrors: [],
  progress: [],
  events: [],
  bootCount: 0
};

const save = () => fs.writeFile(output, JSON.stringify(evidence, null, 2));
await save();

const html = '<!doctype html><title>B4.4 Stage 2.2 Performance Benchmark</title><iframe style="width:900px;height:400px"></iframe><script type="module" src="/bundle.js"></script>';
let server, browser, context, page, watch;

async function capture() {
  if (page) {
    try {
      evidence.browser = await page.evaluate(() => globalThis.__b44?.summary());
      evidence.bootCount = evidence.browser?.bootCount || 0;
    } catch (e) {
      evidence.captureError = e.message;
    }
  }
  await save();
}

function median(arr) {
  if (!arr || !arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

try {
  server = http.createServer(async (req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cache-Control', 'no-store');
    const pathname = new URL(req.url, origin).pathname;
    if (pathname === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }
    if (pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    const allow = {
      '/bundle.js': ['bundle.js', 'application/javascript'],
      '/fixtures.json': ['fixtures.json', 'application/json']
    };
    if (!allow[pathname]) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', allow[pathname][1]);
    res.end(await fs.readFile(path.join(dir, allow[pathname][0])));
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(42997, '127.0.0.1', resolve);
  });

  browser = await chromium.launch({headless: true, args: ['--enable-precise-memory-info']});
  evidence.browserVersion = browser.version();
  context = await browser.newContext({viewport: {width: 1200, height: 800}});
  page = await context.newPage();

  page.on('console', m => {
    if (m.type() === 'error') evidence.consoleErrors.push({at: Date.now(), text: m.text(), location: m.location()});
  });
  page.on('pageerror', e => evidence.pageErrors.push({at: Date.now(), message: e.message, stack: e.stack}));
  context.on('requestfailed', r => evidence.failedRequests.push({at: Date.now(), url: r.url(), error: r.failure()?.errorText}));
  context.on('response', r => {
    if (r.status() >= 400) evidence.httpErrors.push({at: Date.now(), url: r.url(), status: r.status()});
  });

  await page.goto(origin, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => Boolean(globalThis.__b44), {timeout: 30000});
  assert.equal(await page.evaluate(() => crossOriginIsolated), true);

  evidence.status = 'RUNNING';
  evidence.campaignStartedAt = Date.now();
  await save();

  let polling = false;
  watch = setInterval(async () => {
    if (polling) return;
    polling = true;
    try {
      const s = await page.evaluate(() => {
        const x = globalThis.__b44.summary();
        const a = x.samples.at(-1);
        return {bootCount: x.bootCount, index: a?.index, label: a?.label, phase: a?.phase, elapsedMs: a ? Date.now() - a.start : 0};
      });
      evidence.progress.push({at: Date.now(), ...s});
      evidence.bootCount = s.bootCount;
      await save();
    } catch {
    } finally {
      polling = false;
    }
  }, 5000);

  // Execute all 18 boots in sequence
  for (let i = 0; i < sequence.length; i++) {
    const obs = sequence[i];

    // Block transition: Clear store between React and Vue blocks
    if (i === 9) {
      console.log('Transitioning to Vue block: clearing BinaryMemoryStore');
      const clearRes = await page.evaluate(() => globalThis.__b44.clearStore());
      evidence.events.push({ type: 'block_transition', to: 'vue', clearRes, at: Date.now() });
      await capture();
    }

    const obsRecord = {
      index: i + 1,
      block: obs.block,
      kind: obs.kind,
      role: obs.role,
      label: obs.label,
      expectedMarker: obs.expectedMarker,
      start: Date.now(),
      status: 'RUNNING'
    };
    evidence.observations.push(obsRecord);
    await save();

    console.log(`[${i + 1}/18] Boot started: ${obs.label} (${obs.role}, ${obs.kind})`);

    const deadline = obsRecord.start + 240000;
    let timer;
    const pending = page.evaluate(s => globalThis.__b44.begin(s), {
      index: i,
      kind: obs.kind,
      role: obs.role,
      label: obs.label
    });

    const result = await Promise.race([
      pending,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Error(`240-second observation deadline exceeded for ${obs.label}`)), 240000);
      })
    ]).finally(() => clearTimeout(timer));

    if (obs.role === 'producer') {
      assert.equal(result.status, 'PRODUCER_SUCCESS');
      await page.evaluate(s => globalThis.__b44.finish(s), { index: i });
      obsRecord.status = 'PASS';
      obsRecord.completedAt = Date.now();
      obsRecord.elapsedMs = obsRecord.completedAt - obsRecord.start;
      await capture();
      console.log(`[${i + 1}/18] ${obs.label} Producer PASS in ${obsRecord.elapsedMs}ms`);
    } else {
      assert.equal(result.status, 'AWAITING_DOM');

      let dom = false;
      while (Date.now() < deadline) {
        if (evidence.pageErrors.length) throw Error('Uncaught browser page error: ' + evidence.pageErrors.at(-1).message);
        const cur = await page.evaluate(() => {
          const s = globalThis.__b44.summary();
          return s.samples.at(-1);
        });
        if (cur?.processes?.some(p => p.label === 'dev-server' && (p.exitCode !== undefined || p.exitRejected))) {
          throw Error(`Dev process exited before real DOM in ${obs.label}`);
        }
        for (const frame of page.frames()) {
          if (frame !== page.mainFrame()) {
            const text = await frame.locator('#marker').textContent({
              timeout: Math.min(150, Math.max(1, deadline - Date.now()))
            }).catch(() => null);
            if (text === obs.expectedMarker) {
              dom = true;
              break;
            }
          }
        }
        if (dom) break;
        await page.waitForTimeout(Math.min(100, Math.max(1, deadline - Date.now())));
      }

      if (!dom) throw Error(`Correct real Preview DOM absent before deadline in ${obs.label}`);
      obsRecord.realDomMs = Date.now() - obsRecord.start;
      obsRecord.marker = obs.expectedMarker;

      await page.evaluate(s => globalThis.__b44.finish(s), { index: i });
      assert.equal(evidence.pageErrors.length, 0);

      obsRecord.status = 'PASS';
      obsRecord.completedAt = Date.now();
      obsRecord.elapsedMs = obsRecord.completedAt - obsRecord.start;
      await capture();
      console.log(`[${i + 1}/18] ${obs.label} (${obs.role}) PASS in ${obsRecord.elapsedMs}ms (Real DOM in ${obsRecord.realDomMs}ms)`);
    }
  }

  // Retrieve full browser summary
  await capture();
  const samples = evidence.browser?.samples || [];

  // Group metrics by framework and role
  const reactProducer = samples.find(s => s.kind === 'react' && s.role === 'producer');
  const reactControls = samples.filter(s => s.kind === 'react' && s.role === 'control');
  const reactCandidates = samples.filter(s => s.kind === 'react' && s.role === 'candidate');

  const vueProducer = samples.find(s => s.kind === 'vue' && s.role === 'producer');
  const vueControls = samples.filter(s => s.kind === 'vue' && s.role === 'control');
  const vueCandidates = samples.filter(s => s.kind === 'vue' && s.role === 'candidate');

  const reactControlDomTimes = reactControls.map(s => s.realDomMs);
  const reactCandidateDomTimes = reactCandidates.map(s => s.realDomMs);
  const vueControlDomTimes = vueControls.map(s => s.realDomMs);
  const vueCandidateDomTimes = vueCandidates.map(s => s.realDomMs);

  const reactControlMedian = median(reactControlDomTimes);
  const reactCandidateMedian = median(reactCandidateDomTimes);
  const reactAbsDiff = reactControlMedian - reactCandidateMedian;
  const reactRelDiff = reactControlMedian > 0 ? (reactAbsDiff / reactControlMedian) * 100 : 0;
  const reactCaptureMs = reactProducer?.captureMs || 0;
  const reactBreakEven = reactAbsDiff > 0 ? reactCaptureMs / reactAbsDiff : Infinity;

  const vueControlMedian = median(vueControlDomTimes);
  const vueCandidateMedian = median(vueCandidateDomTimes);
  const vueAbsDiff = vueControlMedian - vueCandidateMedian;
  const vueRelDiff = vueControlMedian > 0 ? (vueAbsDiff / vueControlMedian) * 100 : 0;
  const vueCaptureMs = vueProducer?.captureMs || 0;
  const vueBreakEven = vueAbsDiff > 0 ? vueCaptureMs / vueAbsDiff : Infinity;

  const metrics = {
    react: {
      producer: {
        bootMs: reactProducer?.bootMs,
        installMs: reactProducer?.installMs,
        exportMs: reactProducer?.exportMs,
        hashingMs: reactProducer?.hashingMs,
        captureMs: reactCaptureMs,
        byteLength: reactProducer?.binaryByteLength,
        sha256: reactProducer?.binarySha256
      },
      controlDomTimes: reactControlDomTimes,
      candidateDomTimes: reactCandidateDomTimes,
      controlMedianDomMs: reactControlMedian,
      candidateMedianDomMs: reactCandidateMedian,
      absDiffMs: reactAbsDiff,
      relDiffPct: reactRelDiff,
      breakEvenRestores: reactBreakEven
    },
    vue: {
      producer: {
        bootMs: vueProducer?.bootMs,
        installMs: vueProducer?.installMs,
        exportMs: vueProducer?.exportMs,
        hashingMs: vueProducer?.hashingMs,
        captureMs: vueCaptureMs,
        byteLength: vueProducer?.binaryByteLength,
        sha256: vueProducer?.binarySha256
      },
      controlDomTimes: vueControlDomTimes,
      candidateDomTimes: vueCandidateDomTimes,
      controlMedianDomMs: vueControlMedian,
      candidateMedianDomMs: vueCandidateMedian,
      absDiffMs: vueAbsDiff,
      relDiffPct: vueRelDiff,
      breakEvenRestores: vueBreakEven
    }
  };
  evidence.metrics = metrics;

  // Evaluate predeclared success criteria
  const allBootsPass = evidence.observations.length === 18 && evidence.observations.every(o => o.status === 'PASS');
  const zeroCandidateInstalls = samples.filter(s => s.role === 'candidate').every(s => s.installDispatchCount === 0);
  const allControlInstalls = samples.filter(s => s.role === 'control').every(s => s.installDispatchCount === 1);
  const domMarkersMatch = evidence.observations.filter(o => o.role !== 'producer').every(o => o.marker === o.expectedMarker);
  const reactRelPass = reactRelDiff >= 20.0;
  const reactAbsPass = reactAbsDiff >= 3000;
  const reactBreakEvenPass = reactBreakEven <= 1.0;
  const vueRelPass = vueRelDiff >= 20.0;
  const vueAbsPass = vueAbsDiff >= 3000;
  const vueBreakEvenPass = vueBreakEven <= 1.0;
  const captureOverheadPass = reactCaptureMs <= 10000 && vueCaptureMs <= 10000;
  const zeroCrossPollution = Boolean(vueProducer && reactProducer && reactProducer.project !== vueProducer.project);

  const criteriaEvaluation = {
    all18BootsPass: { value: allBootsPass, required: true, status: allBootsPass ? 'PASS' : 'FAIL' },
    zeroCandidateInstalls: { value: zeroCandidateInstalls, required: true, status: zeroCandidateInstalls ? 'PASS' : 'FAIL' },
    allControlInstalls: { value: allControlInstalls, required: true, status: allControlInstalls ? 'PASS' : 'FAIL' },
    domMarkersMatch: { value: domMarkersMatch, required: true, status: domMarkersMatch ? 'PASS' : 'FAIL' },
    captureOverheadCeiling: { value: { reactCaptureMs, vueCaptureMs }, required: '<= 10000ms', status: captureOverheadPass ? 'PASS' : 'FAIL' },
    reactRelativeImprovement: { value: reactRelDiff, required: '>= 20.0%', status: reactRelPass ? 'PASS' : 'FAIL' },
    reactAbsoluteImprovement: { value: reactAbsDiff, required: '>= 3000ms', status: reactAbsPass ? 'PASS' : 'FAIL' },
    reactBreakEvenRestores: { value: reactBreakEven, required: '<= 1.0 restores', status: reactBreakEvenPass ? 'PASS' : 'FAIL' },
    vueRelativeImprovement: { value: vueRelDiff, required: '>= 20.0%', status: vueRelPass ? 'PASS' : 'FAIL' },
    vueAbsoluteImprovement: { value: vueAbsDiff, required: '>= 3000ms', status: vueAbsPass ? 'PASS' : 'FAIL' },
    vueBreakEvenRestores: { value: vueBreakEven, required: '<= 1.0 restores', status: vueBreakEvenPass ? 'PASS' : 'FAIL' },
    zeroCrossPollution: { value: zeroCrossPollution, required: true, status: zeroCrossPollution ? 'PASS' : 'FAIL' }
  };
  evidence.criteriaEvaluation = criteriaEvaluation;

  const allPassed = Object.values(criteriaEvaluation).every(c => c.status === 'PASS');
  evidence.status = allPassed ? 'B4_4_STAGE_2_2_BENCHMARK_PASS' : 'B4_4_STAGE_2_2_BENCHMARK_FAIL';
} catch (error) {
  evidence.status = 'B4_4_STAGE_2_2_BENCHMARK_FAIL';
  evidence.error = error.message;
  const last = evidence.observations.at(-1);
  if (last?.status === 'RUNNING') {
    last.status = 'FAIL';
    last.error = error.message;
    last.elapsedMs = Date.now() - last.start;
  }
  process.exitCode = 1;
  console.error('STOP: ' + error.message);
} finally {
  if (watch) clearInterval(watch);
  await capture();
  if (page) {
    try {
      evidence.cleanup = await page.evaluate(() => globalThis.__b44?.abort());
    } catch (e) {
      evidence.cleanupError = e.message;
    }
  }
  await context?.close().catch(e => evidence.cleanupError = e.message);
  await browser?.close().catch(e => evidence.cleanupError = e.message);
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  evidence.completedAt = Date.now();
  evidence.unexecutedObservations = 18 - evidence.observations.length;
  evidence.trackedStatusAfter = git('status', '--porcelain', '--untracked-files=no');
  evidence.headAfter = git('rev-parse', 'HEAD');
  await save();
  console.log(JSON.stringify({
    status: evidence.status,
    boots: evidence.bootCount,
    criteriaEvaluation: evidence.criteriaEvaluation,
    metrics: evidence.metrics
  }, null, 2));
}
