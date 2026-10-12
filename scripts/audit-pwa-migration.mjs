#!/usr/bin/env node
/**
 * Audit PWA & Service Worker Migration — Phase 1 Acceptance Test
 *
 * Verifies that the legacy root Service Worker is safely retired,
 * the new IDE PWA is scoped strictly to '/app/', returning users
 * cannot be permanently trapped in a cached shell, and user IndexedDB
 * storage is preserved without modification.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const APP_DIR = join(DIST, 'app');

describe('Service Worker & PWA Migration Invariants (Section 23, 24, 25)', () => {
  test('01. Root Migration Service Worker exists at dist/sw.js', () => {
    assert.ok(existsSync(join(DIST, 'sw.js')), 'dist/sw.js missing');
  });

  test('02. Root Migration Worker implements skipWaiting and clients.claim', () => {
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('skipWaiting'), 'Must invoke skipWaiting() to activate immediately');
    assert.ok(content.includes('claim'), 'Must invoke clients.claim() to control clients');
  });

  test('03. Root Migration Worker implements self-unregistration', () => {
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('self.registration.unregister'), 'Must unregister root service worker');
  });

  test('04. Root Migration Worker targets workbox cache deletion without wiping IndexedDB', () => {
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('workbox-precache'), 'Must clean up legacy workbox precache');
    assert.ok(!content.includes('indexedDB.deleteDatabase'), 'Must NEVER clear IndexedDB in SW migration');
  });

  test('05. Root Migration Worker fetch handler does not intercept requests', () => {
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('fetch'), 'Fetch event listener present');
    assert.ok(!content.includes('respondWith'), 'Must not call respondWith() to prevent trapping requests');
  });

  test('06. New IDE Service Worker exists at dist/app/sw.js', () => {
    assert.ok(existsSync(join(APP_DIR, 'sw.js')), 'dist/app/sw.js missing');
    const content = readFileSync(join(APP_DIR, 'sw.js'), 'utf8');
    assert.ok(content.length > 500, 'IDE Service Worker must contain Workbox runtime');
  });

  test('07. IDE PWA manifest scopes to /app/', () => {
    assert.ok(existsSync(join(APP_DIR, 'manifest.webmanifest')), 'dist/app/manifest.webmanifest missing');
    const manifest = JSON.parse(readFileSync(join(APP_DIR, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.scope, '/app/');
    assert.equal(manifest.start_url, '/app/');
  });

  test('08. Astro marketing HTML includes inline cleanup guard for root Service Worker', () => {
    const astroHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
    assert.ok(astroHtml.includes('navigator.serviceWorker.getRegistrations'), 'Cleanup guard present in HTML head');
    assert.ok(astroHtml.includes('scopePath === \'/\''), 'Targets root scope registrations');
    assert.ok(astroHtml.includes('reg.unregister()'), 'Unregisters legacy root worker');
  });

  test('09. IndexedDB database identifiers are preserved in source code', () => {
    const dbSource = readFileSync('src/services/projects/projectDatabase.ts', 'utf8');
    assert.ok(dbSource.includes('gb-coder-projects-db'), 'Primary projects DB identifier preserved');

    const wsSource = readFileSync('src/services/vscodeWorkspaceStore.ts', 'utf8');
    assert.ok(wsSource.includes('gb-coder-workspace'), 'Workspace DB identifier preserved');
  });

  test('10. Backup schema and format version remain intact', () => {
    const backupTypesSource = readFileSync('src/services/backup/backupTypes.ts', 'utf8');
    assert.ok(backupTypesSource.includes('BACKUP_FORMAT_NAME = \'gb-coder-backup\''), 'Format name preserved');
    assert.ok(backupTypesSource.includes('BACKUP_FORMAT_VERSION = 1'), 'Format version 1 preserved');
  });

  test('11. Root Migration Worker notifies clients with absolute origin URL before unregistering', () => {
    const content = readFileSync(join(DIST, 'sw.js'), 'utf8');
    assert.ok(content.includes('includeUncontrolled: true'), 'Must include uncontrolled window clients');
    assert.ok(content.includes("new URL('/', self.location.href)"), 'Must resolve absolute URL for client.navigate()');
    const matchAllIdx = content.indexOf('self.clients.matchAll');
    const unregisterIdx = content.indexOf('self.registration.unregister');
    assert.ok(matchAllIdx !== -1 && unregisterIdx !== -1 && matchAllIdx < unregisterIdx, 'Must match and notify clients before self-unregistration');
  });
});

