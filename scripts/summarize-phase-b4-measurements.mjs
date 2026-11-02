import fs from 'node:fs/promises';

const budget = JSON.parse(await fs.readFile('reports/b4-measurement-budget.json', 'utf8'));
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length ? (sorted[middle] + sorted[Math.floor((sorted.length - 1) / 2)]) / 2 : null;
};
const stats = values => ({
  n: values.length,
  medianMs: median(values),
  minMs: values.length ? Math.min(...values) : null,
  maxMs: values.length ? Math.max(...values) : null,
});
const clean = text => text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
const samples = budget.samples.map(sample => {
  const events = sample.runtime?.events.filter(event => event.at >= sample.start) || [];
  const output = sample.runtime?.output.filter(event => event.at >= sample.start) || [];
  const at = type => events.find(event => event.type === type)?.at;
  const elapsed = (end, start) => Number.isFinite(end) && Number.isFinite(start) ? end - start : null;
  const command = events.find(event => event.type === 'shell_input' && event.text.includes('npm install'))?.at;
  let text = '', install;
  for (const chunk of output) {
    text += chunk.text;
    if (!install && /(?:^|[\r\n])\s*(?:added\s+\d+\s+packages?\b|up to date\b)/i.test(clean(text))) install = chunk.at;
  }
  const vite = clean(text).match(/ready in\s+([\d.]+)\s*ms/i);
  return {
    index: sample.index, variant: sample.variant, workflow: sample.workflow, target: sample.target,
    status: sample.status, observationMs: sample.durationMs,
    documentMs: elapsed(at('document_loaded'), sample.start),
    bootMs: elapsed(at('boot_completed'), at('boot_promise_assigned')),
    publicMountMs: elapsed(at('mount_completed'), at('mount_invoked')),
    installHintMs: elapsed(install, command),
    viteReportedMs: vite ? Number(vite[1]) : null,
    serverReadyMs: elapsed(at('server_ready'), sample.start),
    serverToDomMs: sample.status === 'PASS' ? elapsed(sample.start + sample.durationMs, at('server_ready')) : null,
    domMs: sample.status === 'PASS' ? sample.durationMs : null,
    resetRequests: sample.failedRequests?.filter(request => request.error === 'net::ERR_CONNECTION_RESET') || [],
    hmr: sample.hmr || null,
  };
});
const groups = [];
for (const variant of ['baseline', 'candidate']) {
  for (const group of ['all', 'cold-A', 'cold-B', 'cycle']) {
    const selected = samples.filter(sample => sample.variant === variant && (group === 'all' || (group === 'cycle' ? sample.workflow.startsWith('cycle') : sample.workflow === group)));
    groups.push({
      variant, group, attempts: selected.length,
      passed: selected.filter(sample => sample.status === 'PASS').length,
      failed: selected.filter(sample => sample.status === 'FAIL').length,
      cancelled: selected.filter(sample => sample.status === 'CANCELLED').length,
      successfulDom: stats(selected.map(sample => sample.domMs).filter(value => value !== null)),
      observation: stats(selected.map(sample => sample.observationMs).filter(Number.isFinite)),
      boot: stats(selected.map(sample => sample.bootMs).filter(value => value !== null)),
      installHint: stats(selected.map(sample => sample.installHintMs).filter(value => value !== null)),
      viteReported: stats(selected.map(sample => sample.viteReportedMs).filter(value => value !== null)),
    });
  }
}
await fs.writeFile('reports/b4-measurement-summary.json', JSON.stringify({
  samples, groups, controls: budget.controls,
  totalObservationMs: samples.reduce((total, sample) => total + (sample.observationMs || 0), 0),
  limitations: ['Failures are retained; successful-DOM summaries exclude censored failures explicitly.', 'No p95, SLA or causal performance regression claim.', 'Panel visibility controls do not force a component remount; true shell reconnection is tested separately through the production service.'],
}, null, 2));
console.log(`${samples.length} observations summarized without rerunning any startup.`);
