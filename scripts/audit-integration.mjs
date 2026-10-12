#!/usr/bin/env node
/**
 * Master Integration Audit Runner for GB Coder — Phase 1 POC
 *
 * Runs all Phase 1 integration verification suites:
 * 1. Build Output Audit (audit-build-output.mjs)
 * 2. Routing Audit (audit-routes.mjs)
 * 3. Security Headers Audit (audit-headers.mjs)
 * 4. PWA Migration Audit (audit-pwa-migration.mjs)
 */

import { execSync } from 'node:child_process';

console.log('======================================================================');
console.log('GB CODER — PHASE 1 INTEGRATION & VERIFICATION AUDIT SUITE');
console.log('======================================================================\n');

const suites = [
  { name: 'Build Output Safety Checks', script: 'node scripts/audit-build-output.mjs' },
  { name: 'Local & Deployment Route Invariants', script: 'node scripts/audit-routes.mjs' },
  { name: 'COOP / COEP Security Headers', script: 'node scripts/audit-headers.mjs' },
  { name: 'Service Worker & Storage Migration', script: 'node scripts/audit-pwa-migration.mjs' },
];

let failedCount = 0;
const results = [];

for (const suite of suites) {
  console.log(`▶ Running ${suite.name}...`);
  try {
    execSync(suite.script, { stdio: 'inherit' });
    results.push({ name: suite.name, status: 'PASS' });
    console.log(`✔ ${suite.name} PASSED\n`);
  } catch (err) {
    results.push({ name: suite.name, status: 'FAIL' });
    failedCount++;
    console.error(`✖ ${suite.name} FAILED\n`);
  }
}

console.log('======================================================================');
console.log('INTEGRATION AUDIT SUMMARY:');
console.log('======================================================================');
for (const r of results) {
  console.log(`  ${r.status === 'PASS' ? '✅' : '❌'} ${r.name.padEnd(42)} ${r.status}`);
}
console.log('======================================================================');

if (failedCount > 0) {
  console.error(`\n❌ ${failedCount} suite(s) failed.`);
  process.exit(1);
} else {
  console.log('\n🚀 ALL PHASE 1 INTEGRATION AUDIT SUITES PASSED SUCCESSFULLY!');
}
