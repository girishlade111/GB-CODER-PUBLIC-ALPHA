import {WebContainer} from '@webcontainer/api';
import {
  requireThat,
  sha,
  artifactKey,
  sameOwner,
  CAPS_BINARY,
  cloneBinary,
  validateBinaryArtifact,
  restoreBinaryChoice,
  verifyBinary,
  BinaryMemoryStore,
  observed,
  resolveExecutableTarget,
  validatePermissionRepairPath
} from './policy.mjs';

const DIAG_SCRIPT = `
const fs = require('fs');
const path = require('path');
function inspect(p) {
  try {
    const lstat = fs.lstatSync(p);
    let target = null, stat = null, statError = null;
    if (lstat.isSymbolicLink()) {
      target = fs.readlinkSync(p);
      try {
        stat = fs.statSync(p);
      } catch (e) {
        statError = e.message;
      }
    } else {
      stat = lstat;
    }
    return {
      exists: true,
      path: p,
      isSymbolicLink: lstat.isSymbolicLink(),
      isFile: lstat.isFile(),
      lstatModeOctal: (lstat.mode & 0o777).toString(8),
      target,
      statModeOctal: stat ? (stat.mode & 0o777).toString(8) : null,
      statIsFile: stat ? stat.isFile() : null,
      isExecutable: stat ? Boolean(stat.mode & 0o111) : false,
      statError
    };
  } catch (e) {
    return { exists: false, path: p, error: e.message };
  }
}
const symlinkInfo = inspect('node_modules/.bin/vite');
const targetPath = symlinkInfo.target
  ? path.posix.normalize(path.posix.join(path.posix.dirname('node_modules/.bin/vite'), symlinkInfo.target))
  : 'node_modules/vite/bin/vite.js';
const targetInfo = inspect(targetPath);
console.log(JSON.stringify({ symlinkInfo, targetInfo, targetPath }));
`;

const fixtures = await (await fetch('/fixtures.json')).json();
const binaryStore = new BinaryMemoryStore();
const allInstances = new WeakSet();
let active = null, current = null, bootCount = 0, instanceCount = 0, retiredCount = 0, aborted = false;
const flags = ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0'];
const state = {
  api: '1.6.4',
  format: 'binary',
  samples: [],
  events: [],
  memoryCoverage: 'performance.memory.usedJSHeapSize with precise-memory flag: page JS heap only; excludes worker/Wasm/native memory; sampled checkpoints, not a guaranteed peak'
};

function memory(sample, label) {
  const n = performance.memory?.usedJSHeapSize;
  sample.memory.push({at: Date.now(), label, pageJsHeapBytes: Number.isFinite(n) ? n : null});
  return n;
}

function owned(owner) {
  requireThat(!aborted && sameOwner(owner, current) && active === owner.instance, 'Owner retired during asynchronous operation');
}

function sourceTree(files) {
  const root = {};
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/');
    let node = root;
    for (const p of parts.slice(0, -1)) node = (node[p] ??= {directory: {}}).directory;
    node[parts.at(-1)] = {file: {contents}};
  }
  return root;
}

async function command(wc, owner, sample, label, program, args = [], wait = true) {
  owned(owner);
  const record = {label, program, args, invokedAt: Date.now(), output: ''};
  sample.processes.push(record);
  const process = await wc.spawn(program, args, {
    env: {
      npm_config_userconfig: wc.workdir + '/.empty-user.npmrc',
      npm_config_globalconfig: wc.workdir + '/.empty-global.npmrc'
    }
  });
  const read = (async () => {
    const reader = process.output.getReader();
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        const text = typeof value === 'string' ? value : new TextDecoder().decode(value);
        record.output = (record.output + text).slice(-65536);
      }
    } catch (e) {
      record.readError = String(e);
    }
  })();
  const exit = process.exit.then(code => {
    record.exitCode = code;
    record.exitAt = Date.now();
    state.events.push({type: 'process_exit', sample: sample.index, label, code, at: Date.now()});
    return code;
  }, error => {
    record.exitRejected = String(error);
    record.exitAt = Date.now();
    state.events.push({type: 'process_exit_rejected', sample: sample.index, label, error: String(error), at: Date.now(), retired: !sameOwner(owner, current)});
    return null;
  });
  owned(owner);
  if (!wait) return {process, record, read, exit};
  const code = await exit;
  await read;
  owned(owner);
  record.durationMs = Date.now() - record.invokedAt;
  requireThat(code === 0, label + ' exit ' + String(code) + ' ' + (record.exitRejected || record.output.slice(-1500)));
  return record;
}

async function exactSource(wc, fixture) {
  for (const [path, text] of Object.entries(fixture.files)) {
    requireThat(await wc.fs.readFile(path, 'utf8') === text, 'Source changed: ' + path);
  }
  const other = fixture.project === 'A' ? 'vue' : 'react';
  try {
    await wc.fs.readFile('project-' + other + '.txt');
    throw Error('Cross-project source present');
  } catch (e) {
    requireThat(String(e).includes('ENOENT'), 'Unexpected cross-project path result: ' + e);
  }
}

async function retire() {
  if (!active) return;
  const wc = active;
  const old = current;
  current = null;
  active = null;
  state.events.push({type: 'retire', sample: old?.epoch, at: Date.now()});
  retiredCount++;
  wc.teardown();
  const iframe = document.querySelector('iframe');
  if (iframe) {
    iframe.src = 'about:blank';
    iframe.removeAttribute('src');
  }
  if (state.samples.length) {
    memory(state.samples.at(-1), 'after-cleanup');
  }
}

async function begin(specOrIndex) {
  const spec = typeof specOrIndex === 'object' && specOrIndex !== null
    ? specOrIndex
    : { index: specOrIndex, kind: 'react', role: specOrIndex === 0 ? 'producer' : 'control', label: `boot-${specOrIndex + 1}` };
  const { index, kind = 'react', role = 'producer', label = `obs-${index + 1}` } = spec;

  requireThat(index === state.samples.length && index < 18 && !aborted, 'Invalid observation sequence: index ' + index + ', length ' + state.samples.length);
  await retire();

  const fixture = fixtures[kind];
  requireThat(fixture, 'Unknown fixture kind: ' + kind);

  const sample = {
    index: index + 1,
    label,
    kind,
    project: fixture.project,
    incarnation: fixture.incarnation,
    role,
    start: Date.now(),
    status: 'RUNNING',
    phase: 'boot',
    processes: [],
    memory: [],
    proof: false
  };
  state.samples.push(sample);

  try {
    memory(sample, 'before-boot');
    const bootAt = performance.now();
    bootCount++;
    const wc = await WebContainer.boot({coep: 'require-corp', workdirName: 'gb-b4-4-' + kind + '-' + label.toLowerCase()});
    requireThat(!allInstances.has(wc), 'Runtime reused');
    allInstances.add(wc);
    instanceCount++;
    active = wc;

    const owner = {
      project: fixture.project,
      incarnation: fixture.incarnation,
      epoch: index + 1,
      generation: index + 1,
      instance: wc
    };
    current = owner;
    sample.owner = {
      project: owner.project,
      incarnation: owner.incarnation,
      epoch: owner.epoch,
      generation: owner.generation,
      runtimeId: instanceCount
    };
    sample.bootMs = performance.now() - bootAt;
    sample.freshInstance = true;
    requireThat(retiredCount === index, 'Prior runtime not retired: retired ' + retiredCount + ', expected ' + index);

    const mountAt = performance.now();
    await wc.mount(sourceTree(fixture.files));
    owned(owner);
    sample.mountMs = performance.now() - mountAt;
    await exactSource(wc, fixture);
    memory(sample, 'after-boot-and-mount');

    sample.phase = 'compatibility';
    const versions = await command(wc, owner, sample, 'node-compatibility', 'node', [
      '-e',
      'console.log(JSON.stringify({versions:process.versions,platform:process.platform,arch:process.arch,workdir:process.cwd()}))'
    ]);
    const npm = await command(wc, owner, sample, 'npm-version', 'npm', ['--version']);
    const node = JSON.parse(versions.output.trim());
    const compatibility = {
      versions: node.versions,
      platform: node.platform,
      arch: node.arch,
      npm: npm.output.trim(),
      api: '1.6.4'
    };
    sample.compatibility = compatibility;
    sample.workdir = node.workdir;

    requireThat(await sha(await wc.fs.readFile('package.json')) === fixture.manifestSha, 'Manifest digest mismatch');
    requireThat(await sha(await wc.fs.readFile('package-lock.json')) === fixture.lockSha, 'Lock digest mismatch');
    requireThat(await sha(await wc.fs.readFile('.npmrc')) === fixture.configSha, 'Effective npmrc mismatch');

    const key = await artifactKey({
      project: fixture.project,
      incarnation: fixture.incarnation,
      manifestSha: fixture.manifestSha,
      lockSha: fixture.lockSha,
      configSha: fixture.configSha,
      flags,
      runtime: compatibility,
      api: '1.6.4',
      policy: 2,
      format: 'binary'
    });
    sample.key = key;

    if (role === 'producer') {
      sample.phase = 'install';
      const install = await command(wc, owner, sample, 'clean-install', 'npm', flags);
      sample.installMs = install.durationMs;
      sample.installExit = install.exitCode;
      requireThat(sample.processes.every(p => p.exitCode === 0), 'Process still active before capture');
      await exactSource(wc, fixture);
      requireThat(await sha(await wc.fs.readFile('package-lock.json')) === fixture.lockSha, 'Install modified root lock');

      const bytes = Uint8Array.from({length: 1024}, (_, i) => i % 256);
      await wc.fs.writeFile('node_modules/.b4-4-byte-probe.bin', bytes);
      const probeSha = await sha(bytes);
      sample.probeSha256 = probeSha;

      await command(wc, owner, sample, 'internal-symlink-probe', 'node', [
        '-e',
        "require('fs').symlinkSync('.b4-4-byte-probe.bin','node_modules/.b4-4-internal-link')"
      ]);

      await wc.fs.writeFile('node_modules/.b4-4-diag.cjs', DIAG_SCRIPT);

      sample.phase = 'producer-permission-diagnostics';
      const producerDiag = await command(wc, owner, sample, 'producer-permission-diagnostics', 'node', [
        'node_modules/.b4-4-diag.cjs'
      ]);
      sample.producerDiagnostics = JSON.parse(producerDiag.output.trim());
      requireThat(sample.producerDiagnostics.symlinkInfo.exists, 'Producer .bin/vite missing');
      requireThat(sample.producerDiagnostics.targetInfo.exists, 'Producer target file missing');
      requireThat(sample.producerDiagnostics.targetInfo.isExecutable, 'Producer target file not executable');

      sample.phase = 'capture';
      const before = memory(sample, 'capture-before');
      const at = performance.now();

      const captured = await observed((async () => {
        const exportAt = performance.now();
        const binaryPayload = await wc.export('node_modules', {format: 'binary'});
        owned(owner);
        sample.exportMs = performance.now() - exportAt;
        memory(sample, 'after-export');

        const hashAt = performance.now();
        const validation = await validateBinaryArtifact(binaryPayload, CAPS_BINARY);
        sample.hashingMs = performance.now() - hashAt;
        sample.binaryByteLength = validation.byteLength;
        sample.binarySha256 = validation.sha256;

        return {
          payload: binaryPayload,
          sha256: validation.sha256,
          byteLength: validation.byteLength,
          probeSha256: probeSha,
          key,
          project: fixture.project,
          incarnation: fixture.incarnation,
          createdAt: Date.now(),
          producer: sample.owner
        };
      })(), 10000, 'binary-capture');

      owned(owner);
      sample.captureMs = performance.now() - at;
      memory(sample, 'capture-after');
      requireThat(sample.captureMs <= 10000, 'Capture elapsed-time ceiling');
      const after = performance.memory?.usedJSHeapSize;
      sample.captureJsHeapDelta = Number.isFinite(before) && Number.isFinite(after) ? after - before : null;
      requireThat(sample.captureJsHeapDelta === null || sample.captureJsHeapDelta <= 128 * 1024 * 1024, 'Measured page JS heap admission ceiling');

      owned(owner);
      binaryStore.publish(captured, owner, current);
      sample.status = 'PRODUCER_SUCCESS';
      sample.phase = 'producer-complete';
      return {status: 'PRODUCER_SUCCESS', index: sample.index, label, sample};
    } else if (role === 'control') {
      sample.phase = 'verify-empty';
      try {
        await wc.fs.readdir('node_modules');
        throw Error('Control dependency destination not fresh');
      } catch (e) {
        requireThat(String(e).includes('ENOENT'), 'Nonempty control destination');
      }

      sample.phase = 'install';
      const before = memory(sample, 'install-before');
      const install = await command(wc, owner, sample, 'clean-install', 'npm', flags);
      sample.installMs = install.durationMs;
      sample.installExit = install.exitCode;
      memory(sample, 'install-after');
      requireThat(sample.processes.every(p => p.exitCode === 0), 'Process still active before dev server');
      await exactSource(wc, fixture);
      requireThat(await sha(await wc.fs.readFile('package-lock.json')) === fixture.lockSha, 'Install modified root lock');

      sample.phase = 'server';
      let readyResolve;
      const ready = new Promise(r => (readyResolve = r));
      wc.on('server-ready', (port, url) => {
        if (!sameOwner(owner, current)) {
          state.events.push({type: 'stale_server_ignored', sample: sample.index, at: Date.now()});
          return;
        }
        if (port === 5173) {
          sample.serverReadyAt = Date.now();
          sample.serverUrl = url;
          readyResolve(url);
        }
      });

      const dev = await command(wc, owner, sample, 'dev-server', 'npm', ['run', 'dev'], false);
      sample.devInvokedAt = dev.record.invokedAt;

      const url = await observed(ready, Math.max(1, sample.start + 240000 - Date.now()), 'server-ready');
      owned(owner);
      sample.serverReadyMs = sample.serverReadyAt - sample.devInvokedAt;
      requireThat(dev.record.exitCode === undefined && !dev.record.exitRejected, 'Dev server exited before DOM');
      document.querySelector('iframe').src = url;
      sample.phase = 'awaiting-real-dom';
      return {status: 'AWAITING_DOM', marker: fixture.marker, index: sample.index, label};
    } else if (role === 'candidate') {
      sample.phase = 'restore';
      const record = binaryStore.take(fixture.project);
      requireThat(record, 'Missing binary artifact for project ' + fixture.project);

      // Strict 10-minute TTL check
      const age = Date.now() - record.createdAt;
      sample.artifactAgeMs = age;
      requireThat(age >= 0 && age <= 600000, 'ARTIFACT_EXPIRED: age ' + age + 'ms > 600000ms');

      const choice = restoreBinaryChoice(record, key, owner, Date.now(), CAPS_BINARY);
      requireThat(choice.path === 'restore', 'Binary artifact ineligible: ' + choice.reason);

      const before = memory(sample, 'restore-before');
      const at = performance.now();

      await observed((async () => {
        const preAt = performance.now();
        await verifyBinary(record, key, owner);
        owned(owner);
        sample.preRestoreValidationMs = performance.now() - preAt;

        try {
          await wc.fs.readdir('node_modules');
          throw Error('Consumer dependency destination not fresh');
        } catch (e) {
          requireThat(String(e).includes('ENOENT'), 'Nonempty consumer destination');
        }

        await wc.fs.mkdir('node_modules');
        owned(owner);

        const cloneAt = performance.now();
        const payloadCopy = cloneBinary(record.payload);
        sample.cloneMs = performance.now() - cloneAt;

        const mountAt = performance.now();
        await wc.mount(payloadCopy, {mountPoint: 'node_modules'});
        owned(owner);
        sample.binaryMountMs = performance.now() - mountAt;
        memory(sample, 'after-mount');

        const validateAt = performance.now();
        const nmEntries = await wc.fs.readdir('node_modules');
        requireThat(nmEntries.length > 0, 'Restored node_modules is empty');
        sample.restoredTopLevelCount = nmEntries.length;

        // Check binary probe byte equality
        const restoredProbe = await wc.fs.readFile('node_modules/.b4-4-byte-probe.bin');
        requireThat(await sha(restoredProbe) === record.probeSha256, 'Restored binary probe mismatch');

        // Check symlink probe read
        const linkProbe = await wc.fs.readFile('node_modules/.b4-4-internal-link');
        requireThat(await sha(linkProbe) === record.probeSha256, 'Restored internal symlink read mismatch');

        // Check package metadata
        const frameworkPkgName = fixture.project === 'A' ? 'react' : 'vue';
        const frameworkPkg = JSON.parse(await wc.fs.readFile('node_modules/' + frameworkPkgName + '/package.json', 'utf8'));
        requireThat(frameworkPkg.name === frameworkPkgName, frameworkPkgName + ' package metadata missing');
        const vitePkg = JSON.parse(await wc.fs.readFile('node_modules/vite/package.json', 'utf8'));
        requireThat(vitePkg.name === 'vite', 'Vite package metadata missing');

        await exactSource(wc, fixture);
        owned(owner);
        sample.postRestoreValidationMs = performance.now() - validateAt;
      })(), 15000, 'restore-validation');

      owned(owner);
      sample.restoreMs = performance.now() - at;
      memory(sample, 'restore-after');
      requireThat(sample.restoreMs <= 15000, 'Restore elapsed-time ceiling');

      sample.phase = 'consumer-pre-correction-diagnostics';
      try {
        await wc.fs.readFile('node_modules/.b4-4-diag.cjs');
      } catch {
        await wc.fs.writeFile('node_modules/.b4-4-diag.cjs', DIAG_SCRIPT);
      }
      const consumerDiag = await command(wc, owner, sample, 'consumer-pre-correction-diagnostics', 'node', [
        'node_modules/.b4-4-diag.cjs'
      ]);
      sample.consumerDiagnosticsBefore = JSON.parse(consumerDiag.output.trim());

      const executableLost = !sample.consumerDiagnosticsBefore?.targetInfo?.isExecutable;
      sample.permissionDifferences = {
        consumerTargetModeBefore: sample.consumerDiagnosticsBefore?.targetInfo?.statModeOctal,
        executableLost
      };

      if (executableLost) {
        sample.phase = 'permission-correction';
        const rawTarget = sample.consumerDiagnosticsBefore.symlinkInfo.target || '../vite/bin/vite.js';
        const verifiedTarget = resolveExecutableTarget('node_modules/.bin/vite', rawTarget);
        validatePermissionRepairPath(verifiedTarget);
        sample.verifiedTarget = verifiedTarget;

        const chmodStart = performance.now();
        let chmodMethod = 'none';
        try {
          const cliResult = await command(wc, owner, sample, 'test-chmod-cli', 'chmod', ['+x', verifiedTarget]);
          chmodMethod = 'chmod-cli';
          sample.chmodCliExit = cliResult.exitCode;
        } catch (cliErr) {
          sample.chmodCliError = String(cliErr);
          await command(wc, owner, sample, 'chmod-node-api', 'node', [
            '-e',
            `require('fs').chmodSync(${JSON.stringify(verifiedTarget)}, 0o755)`
          ]);
          chmodMethod = 'node-chmodSync';
        }
        sample.chmodMethod = chmodMethod;
        sample.chmodDurationMs = performance.now() - chmodStart;

        const postDiag = await command(wc, owner, sample, 'consumer-post-correction-diagnostics', 'node', [
          'node_modules/.b4-4-diag.cjs'
        ]);
        sample.consumerDiagnosticsAfter = JSON.parse(postDiag.output.trim());
        requireThat(sample.consumerDiagnosticsAfter.targetInfo.isExecutable, 'Executable permission correction failed to restore execute bit');
        await exactSource(wc, fixture);
        owned(owner);
      } else {
        sample.chmodDurationMs = 0;
      }

      sample.restoreTotalOverheadMs = (sample.preRestoreValidationMs || 0) + (sample.cloneMs || 0) + (sample.binaryMountMs || 0) + (sample.postRestoreValidationMs || 0) + (sample.chmodDurationMs || 0);

      sample.phase = 'server';
      let readyResolve;
      const ready = new Promise(r => (readyResolve = r));
      wc.on('server-ready', (port, url) => {
        if (!sameOwner(owner, current)) {
          state.events.push({type: 'stale_server_ignored', sample: sample.index, at: Date.now()});
          return;
        }
        if (port === 5173) {
          sample.serverReadyAt = Date.now();
          sample.serverUrl = url;
          readyResolve(url);
        }
      });

      const dev = await command(wc, owner, sample, 'dev-server', 'npm', ['run', 'dev'], false);
      sample.devInvokedAt = dev.record.invokedAt;

      const url = await observed(ready, Math.max(1, sample.start + 240000 - Date.now()), 'server-ready');
      owned(owner);
      sample.serverReadyMs = sample.serverReadyAt - sample.devInvokedAt;
      requireThat(dev.record.exitCode === undefined && !dev.record.exitRejected, 'Dev server exited before DOM');
      document.querySelector('iframe').src = url;
      sample.phase = 'awaiting-real-dom';
      return {status: 'AWAITING_DOM', marker: fixture.marker, index: sample.index, label};
    } else {
      throw Error('Unknown observation role: ' + role);
    }
  } catch (error) {
    sample.status = 'FAIL';
    sample.error = String(error);
    sample.failurePhase = sample.phase;
    if (sample.role === 'candidate') binaryStore.quarantine(sample.project);
    throw error;
  }
}

async function finish(specOrIndex) {
  const index = typeof specOrIndex === 'object' && specOrIndex !== null ? specOrIndex.index : specOrIndex;
  const sample = state.samples[index];
  requireThat(sample, 'Sample not found at index ' + index);
  const fixture = fixtures[sample.kind];
  const owner = current;
  owned(owner);
  requireThat(owner.project === sample.project && owner.epoch === sample.owner.epoch && owner.generation === sample.owner.generation, 'Finish owner mismatch');

  if (sample.role === 'producer') {
    sample.status = 'PASS';
    sample.phase = 'producer-complete';
    sample.totalMs = Date.now() - sample.start;
    return summary();
  }

  requireThat(sample.phase === 'awaiting-real-dom' && sample.serverReadyAt, 'No genuine ready event');
  sample.domVerifiedAt = Date.now();
  sample.realDomMs = sample.domVerifiedAt - sample.start;
  sample.totalMs = sample.domVerifiedAt - sample.start;
  sample.proof = {
    project: current.project,
    epoch: current.epoch,
    generation: current.generation,
    runtimeId: sample.owner.runtimeId,
    role: sample.role,
    source: sample.role === 'candidate' ? 'validated-binary-restore-and-real-dom' : 'clean-install-and-real-dom'
  };
  sample.status = 'PASS';
  sample.phase = 'ready';
  memory(sample, 'ready');

  sample.installDispatchCount = sample.processes.filter(p => p.label === 'clean-install').length;
  if (sample.role === 'candidate') {
    requireThat(sample.installDispatchCount === 0, 'Unexpected npm install ran in candidate');
  } else if (sample.role === 'control') {
    requireThat(sample.installDispatchCount === 1, 'Control clean-install did not run');
  }

  return summary();
}

function summary() {
  return structuredClone({
    ...state,
    bootCount,
    retainedBinaryArtifact: binaryStore.record
      ? {
          project: binaryStore.record.project,
          key: binaryStore.record.key,
          sha256: binaryStore.record.sha256,
          byteLength: binaryStore.record.byteLength,
          createdAt: binaryStore.record.createdAt
        }
      : null,
    runtimeInstances: instanceCount,
    retiredRuntimeCount: retiredCount
  });
}

function clearStore() {
  binaryStore.clear();
  state.events.push({type: 'store_cleared', at: Date.now()});
  return {cleared: true, record: binaryStore.record};
}

async function abort() {
  aborted = true;
  await retire();
  binaryStore.clear();
  await new Promise(r => setTimeout(r, 200));
  return summary();
}

globalThis.__b44 = {begin, finish, summary, abort, clearStore, retire};
