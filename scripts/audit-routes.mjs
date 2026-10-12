#!/usr/bin/env node
/**
 * Audit Routes — Phase 1 Acceptance Test
 *
 * Boots the combined preview server and executes real HTTP requests to verify
 * all 11 routing scenarios defined in Section 35.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';

const TEST_PORT = 4188;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverProcess;

const fetchRoute = (path) =>
  new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () =>
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          }),
        );
      })
      .on('error', reject);
  });

before(async () => {
  serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${TEST_PORT}`], {
    stdio: 'pipe',
  });

  // Wait for server ready
  let attempts = 0;
  while (attempts < 30) {
    try {
      await fetchRoute('/');
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

describe('Local Routing Scenarios (Section 35)', () => {
  test('01. GET / returns Astro marketing HTML', async () => {
    const res = await fetchRoute('/');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('GB Coder'));
    assert.ok(res.body.includes('Start Coding'));
    assert.ok(!res.body.includes('id="root"'));
  });

  test('02. GET /app returns React application HTML', async () => {
    const res = await fetchRoute('/app');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
    assert.ok(res.body.includes('/app/assets/'));
  });

  test('03. GET /app/ returns React application HTML', async () => {
    const res = await fetchRoute('/app/');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('04. GET /app/ide returns React application HTML', async () => {
    const res = await fetchRoute('/app/ide');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('05. GET /ide returns React application HTML (legacy route compatibility)', async () => {
    const res = await fetchRoute('/ide');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('06. GET /preview-popout returns React application HTML', async () => {
    const res = await fetchRoute('/preview-popout');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('07. GET /preview/test-fixture-id returns React application HTML', async () => {
    const res = await fetchRoute('/preview/test-fixture-id');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('08. GET /mpreview/test-fixture-id returns React application HTML', async () => {
    const res = await fetchRoute('/mpreview/test-fixture-id');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });

  test('09. GET /api/health responds with API health status', async () => {
    const res = await fetchRoute('/api/health');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('application/json'));
    const data = JSON.parse(res.body);
    assert.ok(data.status === 'ok' || data.healthy || data.status);
  });

  test('10. GET /nonexistent-marketing-page returns marketing 404', async () => {
    const res = await fetchRoute('/nonexistent-marketing-page');
    assert.equal(res.statusCode, 404);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('404'));
  });

  test('11. GET /app/nonexistent-client-route returns IDE SPA fallback', async () => {
    const res = await fetchRoute('/app/nonexistent-client-route');
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('id="root"'));
  });
});
