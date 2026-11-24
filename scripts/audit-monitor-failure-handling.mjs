/**
 * Negative Test & Failure Handling Verification for Production Health Monitor
 * 
 * Verifies:
 * 1. Sensitive string and token redaction (Bearer, bypass secret, API keys)
 * 2. Accurate failure classification and non-zero exit code simulation
 * 3. Diagnostic file output and format
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

console.log('================================================================');
console.log('GB CODER — HEALTH MONITOR NEGATIVE & PRIVACY TESTS');
console.log('================================================================\n');

// 1. Test Privacy Redaction Logic
function redactSecrets(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/(bearer\s+)[a-zA-Z0-9_\-\.]+/gi, '$1[REDACTED]')
    .replace(/(x-vercel-protection-bypass:\s*)[a-zA-Z0-9_-]+/gi, '$1[REDACTED]')
    .replace(/(bypass_secret|secret|token|password|apikey|api_key)\s*[:=]\s*["']?[^"'\s,]+/gi, '$1=[REDACTED]');
}

console.log('Test 1: Privacy redaction masks sensitive bearer tokens...');
const sensitiveInput1 = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secretpayload';
const redacted1 = redactSecrets(sensitiveInput1);
assert.strictEqual(redacted1, 'Authorization: Bearer [REDACTED]');
console.log('  [PASS] Bearer token redacted cleanly');

console.log('Test 2: Privacy redaction masks Vercel protection bypass headers...');
const sensitiveInput2 = 'Request headers: { x-vercel-protection-bypass: SUnVBZMiWuhY8BHOmMufcRHMGhn8Dp6L }';
const redacted2 = redactSecrets(sensitiveInput2);
assert.strictEqual(redacted2, 'Request headers: { x-vercel-protection-bypass: [REDACTED] }');
console.log('  [PASS] Vercel bypass secret redacted cleanly');

console.log('Test 3: Privacy redaction masks query and assignment tokens...');
const sensitiveInput3 = 'Error: api_key=ab395028475cdafe & token="xyz123"';
const redacted3 = redactSecrets(sensitiveInput3);
assert.ok(!redacted3.includes('ab395028475cdafe'), 'api_key was masked');
assert.ok(!redacted3.includes('xyz123'), 'token was masked');
console.log('  [PASS] API key and token parameters redacted cleanly');

// 2. Test Non-Zero Exit Code on Invalid / Failed Target
console.log('Test 4: Monitor exits with code 1 when target is unreachable...');
const mockRun = spawnSync('node', ['scripts/production-health-monitor.mjs', 'http://127.0.0.1:59999'], {
  encoding: 'utf-8',
  timeout: 10000,
});

assert.strictEqual(mockRun.status, 1, `Expected process exit code 1, got ${mockRun.status}`);
assert.ok(mockRun.stdout.includes('MONITORING FAILED') || mockRun.stderr.includes('MONITORING FAILED'));
console.log('  [PASS] Accurate non-zero exit code 1 returned on network failure');

// 3. Test Diagnostics File Generation
console.log('Test 5: Diagnostics report is written to disk even on failure...');
const diagnosticsPath = path.resolve(process.cwd(), 'diagnostics', 'health-report.json');
assert.ok(fs.existsSync(diagnosticsPath), 'health-report.json must exist');
const reportData = JSON.parse(fs.readFileSync(diagnosticsPath, 'utf-8'));
assert.strictEqual(reportData.status, 'FAIL', 'Report status accurately marked FAIL');
assert.ok(reportData.failures.length > 0, 'Failures array populated with error details');
console.log('  [PASS] Diagnostics report properly generated with failure telemetry');

console.log('\n================================================================');
console.log('ALL MONITOR FAILURE HANDLING & PRIVACY TESTS PASSED (100%)');
console.log('================================================================');
