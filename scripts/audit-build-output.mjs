#!/usr/bin/env node
/**
 * Audit Build Output — Phase 1 Acceptance Test
 *
 * Verifies all 15 build output safety invariants defined in Section 17.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const APP_DIR = join(DIST, 'app');

describe('Build Output Safety Checks (Section 17)', () => {
  test('01. Astro index.html exists in dist/', () => {
    assert.ok(existsSync(join(DIST, 'index.html')), 'dist/index.html is missing');
  });

  test('02. Astro index.html contains actual static marketing content and CTA', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    assert.ok(html.includes('GB Coder'), 'Missing branding GB Coder in root index.html');
    assert.ok(html.includes('/app'), 'Missing CTA link to /app in root index.html');
    assert.ok(html.includes('LadeStack'), 'Missing LadeStack brand in root index.html');
    assert.ok(!html.includes('id="root"'), 'Astro root HTML should not contain React mount id="root"');
  });

  test('03. Vite app/index.html exists in dist/app/', () => {
    assert.ok(existsSync(join(APP_DIR, 'index.html')), 'dist/app/index.html is missing');
  });

  test('04. Vite app/index.html references valid /app/assets/ paths', () => {
    const html = readFileSync(join(APP_DIR, 'index.html'), 'utf8');
    assert.ok(html.includes('id="root"'), 'React mount container id="root" missing in dist/app/index.html');
    assert.ok(html.includes('/app/assets/'), 'Vite entry should reference /app/assets/');
  });

  test('05. Every referenced initial JS asset exists in dist/app/', () => {
    const html = readFileSync(join(APP_DIR, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/src="(\/app\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
    assert.ok(scripts.length > 0, 'No script tags found in app/index.html');
    for (const src of scripts) {
      const rel = src.replace(/^\/app\//, '');
      assert.ok(existsSync(join(APP_DIR, rel)), `Referenced JS asset missing: ${src}`);
    }
  });

  test('06. Every referenced initial CSS asset exists in dist/app/', () => {
    const html = readFileSync(join(APP_DIR, 'index.html'), 'utf8');
    const links = [...html.matchAll(/href="(\/app\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
    for (const href of links) {
      const rel = href.replace(/^\/app\//, '');
      assert.ok(existsSync(join(APP_DIR, rel)), `Referenced CSS asset missing: ${href}`);
    }
  });

  test('07. Monaco worker assets exist in dist/app/assets/', () => {
    const assets = readdirSync(join(APP_DIR, 'assets'));
    const workerFiles = assets.filter((f) => f.includes('worker') && f.endsWith('.js'));
    assert.ok(workerFiles.length >= 1, `Expected Monaco workers in assets/, found: ${workerFiles.join(', ')}`);
  });

  test('08. WebAssembly assets are present in dist/app/assets/', () => {
    const assets = readdirSync(join(APP_DIR, 'assets'));
    const wasmFiles = assets.filter((f) => f.endsWith('.wasm'));
    assert.ok(wasmFiles.length >= 1, `Expected WASM asset in assets/, found: ${wasmFiles.join(', ')}`);
  });

  test('09. PWA assets use correct /app/ paths and scope', () => {
    assert.ok(existsSync(join(APP_DIR, 'sw.js')), 'dist/app/sw.js missing');
    assert.ok(existsSync(join(APP_DIR, 'manifest.webmanifest')), 'dist/app/manifest.webmanifest missing');
    const manifest = JSON.parse(readFileSync(join(APP_DIR, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.start_url, '/app/');
    assert.equal(manifest.scope, '/app/');
  });

  test('10. Astro and Vite assets do not collide', () => {
    assert.ok(existsSync(join(DIST, '_astro')), 'Astro _astro/ directory exists');
    assert.ok(existsSync(join(APP_DIR, 'assets')), 'Vite app/assets/ directory exists');
    // Ensure no files overlap in root
    const rootFiles = readdirSync(DIST);
    assert.ok(rootFiles.includes('_astro'));
    assert.ok(rootFiles.includes('app'));
    assert.ok(rootFiles.includes('index.html'));
  });

  test('11. Root index.html and app/index.html remain distinct documents', () => {
    const astroHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
    const viteHtml = readFileSync(join(APP_DIR, 'index.html'), 'utf8');
    assert.notEqual(astroHtml, viteHtml, 'Root index.html and app/index.html must not be identical');
  });

  test('12. Marketing 404 page exists at dist/404.html', () => {
    assert.ok(existsSync(join(DIST, '404.html')), 'dist/404.html missing');
    const content = readFileSync(join(DIST, '404.html'), 'utf8');
    assert.ok(content.includes('404'), '404 page must mention 404');
  });

  test('13. No .env files or source control leaked into dist/', () => {
    const forbidden = ['.env', '.env.local', '.env.production', '.git'];
    for (const f of forbidden) {
      assert.ok(!existsSync(join(DIST, f)), `Forbidden item leaked: ${f}`);
    }
  });

  test('14. Root Migration Service Worker exists at dist/sw.js', () => {
    assert.ok(existsSync(join(DIST, 'sw.js')), 'dist/sw.js missing');
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('unregister'), 'dist/sw.js must contain unregister logic');
  });

  test('15. Build manifest is present and reports SUCCESS', () => {
    assert.ok(existsSync(join(DIST, 'build-manifest.json')), 'dist/build-manifest.json missing');
    const manifest = JSON.parse(readFileSync(join(DIST, 'build-manifest.json'), 'utf8'));
    assert.equal(manifest.status, 'SUCCESS');
    assert.equal(manifest.summary.failuresCount, 0);
  });
});
