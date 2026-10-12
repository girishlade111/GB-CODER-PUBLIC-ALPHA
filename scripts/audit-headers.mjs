#!/usr/bin/env node
/**
 * Audit Security Headers — Phase 1 Acceptance Test
 *
 * Verifies that Cross-Origin-Opener-Policy: same-origin and
 * Cross-Origin-Embedder-Policy: require-corp headers are configured
 * and served correctly for WebContainer runtime execution.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { readFileSync } from 'node:fs';

const TEST_PORT = 4189;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverProcess;

const fetchHeaders = (path) =>
  new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}${path}`, (res) => {
        res.resume();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
        });
      })
      .on('error', reject);
  });

before(async () => {
  serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${TEST_PORT}`], {
    stdio: 'pipe',
  });

  let attempts = 0;
  while (attempts < 30) {
    try {
      await fetchHeaders('/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
      attempts++;
    }
  }
  throw new Error('Preview server failed to start within 6 seconds');
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('COOP / COEP Security Header Invariants (Section 21)', () => {
  test('01. vercel.json defines COOP: same-origin rule', () => {
    const raw = readFileSync('vercel.json', 'utf8');
    const config = JSON.parse(raw);
    const rules = config.headers ?? [];
    const hasCoop = rules.some((r) =>
      (r.headers ?? []).some((h) => h.key === 'Cross-Origin-Opener-Policy' && h.value === 'same-origin'),
    );
    assert.ok(hasCoop, 'Missing Cross-Origin-Opener-Policy: same-origin in vercel.json');
  });

  test('02. vercel.json defines COEP: require-corp rule', () => {
    const raw = readFileSync('vercel.json', 'utf8');
    const config = JSON.parse(raw);
    const rules = config.headers ?? [];
    const hasCoep = rules.some((r) =>
      (r.headers ?? []).some((h) => h.key === 'Cross-Origin-Embedder-Policy' && h.value === 'require-corp'),
    );
    assert.ok(hasCoep, 'Missing Cross-Origin-Embedder-Policy: require-corp in vercel.json');
  });

  test('03. Served response on /app delivers COOP: same-origin', async () => {
    const res = await fetchHeaders('/app');
    assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
  });

  test('04. Served response on /app delivers COEP: require-corp', async () => {
    const res = await fetchHeaders('/app');
    assert.equal(res.headers['cross-origin-embedder-policy'], 'require-corp');
  });

  test('05. Served response on /app/ide delivers COOP & COEP', async () => {
    const res = await fetchHeaders('/app/ide');
    assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
    assert.equal(res.headers['cross-origin-embedder-policy'], 'require-corp');
  });

  test('06. Served response on legacy /ide delivers COOP & COEP', async () => {
    const res = await fetchHeaders('/ide');
    assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
    assert.equal(res.headers['cross-origin-embedder-policy'], 'require-corp');
  });

  test('07. Served response on /preview-popout delivers COOP & COEP', async () => {
    const res = await fetchHeaders('/preview-popout');
    assert.equal(res.headers['cross-origin-opener-policy'], 'same-origin');
    assert.equal(res.headers['cross-origin-embedder-policy'], 'require-corp');
  });
});
