/**
 * Unit tests for FileSyncCoordinator.
 * Tests debouncing, FIFO ordering, scope isolation, and flush operations.
 *
 * Run with: node scripts/test-file-sync-coordinator.mjs
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bundle fileSyncCoordinator with esbuild to test directly in Node
const outdir = mkdtempSync(join(tmpdir(), 'gb-sync-test-'));
const outfile = join(outdir, 'sync-bundle.mjs');

await build({
  stdin: {
    contents: `export { FileSyncCoordinator } from './src/services/webcontainer/fileSyncCoordinator.ts';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile,
  logLevel: 'error',
});

const { FileSyncCoordinator } = await import(pathToFileURL(outfile).href);

describe('FileSyncCoordinator', () => {
  test('coalesces multiple edits within debounce window into a single write', async () => {
    const written = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (path, content) => {
        written.push({ path, content, time: Date.now() });
      },
      rawDelete: async () => {},
    });

    coordinator.queueSync('src/App.tsx', 'version 1');
    coordinator.queueSync('src/App.tsx', 'version 2');
    coordinator.queueSync('src/App.tsx', 'version 3');

    assert.equal(written.length, 0, 'No write should happen immediately');

    // Wait for debounce window (50ms + margin)
    await new Promise((r) => setTimeout(r, 80));

    assert.equal(written.length, 1, 'Only one write should occur');
    assert.equal(written[0].content, 'version 3', 'Latest content wins');
  });

  test('executes in-order and does not overlap writes for the same path', async () => {
    const writeLog = [];
    let activeWrites = 0;
    let maxConcurrentSamePath = 0;

    const coordinator = new FileSyncCoordinator({
      debounceMs: 20,
      rawWrite: async (path, content) => {
        activeWrites++;
        maxConcurrentSamePath = Math.max(maxConcurrentSamePath, activeWrites);
        // Simulate async delay
        await new Promise((r) => setTimeout(r, 40));
        writeLog.push(content);
        activeWrites--;
      },
      rawDelete: async () => {},
    });

    coordinator.queueSync('index.html', 'A');
    await new Promise((r) => setTimeout(r, 25)); // trigger first write
    coordinator.queueSync('index.html', 'B'); // queue second write while first is in-flight

    await coordinator.flush();

    assert.equal(maxConcurrentSamePath, 1, 'Writes for same path must never overlap');
    assert.deepEqual(writeLog, ['A', 'B'], 'Writes execute sequentially in order');
  });

  test('flush immediately writes all pending debounced content', async () => {
    const written = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 500, // long debounce
      rawWrite: async (path, content) => {
        written.push({ path, content });
      },
      rawDelete: async () => {},
    });

    coordinator.queueSync('file1.ts', 'content 1');
    coordinator.queueSync('file2.ts', 'content 2');

    assert.equal(written.length, 0);

    // Immediate flush before 500ms timeout
    await coordinator.flush();

    assert.equal(written.length, 2);
    assert.equal(coordinator.hasPendingWrites(), false);
  });

  test('project scope switch cancels previous project pending writes', async () => {
    const written = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (path, content) => {
        written.push({ path, content });
      },
      rawDelete: async () => {},
    });

    coordinator.setScope('project-1');
    coordinator.queueSync('App.tsx', 'Project 1 edit', 'project-1');

    // Switch project scope to project-2 before debounce expires
    coordinator.setScope('project-2');

    await new Promise((r) => setTimeout(r, 80));

    assert.equal(written.length, 0, 'Project 1 write must be discarded on project switch');
  });

  test('handleRename migrates pending writes to new path', async () => {
    const written = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (path, content) => {
        written.push({ path, content });
      },
      rawDelete: async () => {},
    });

    coordinator.queueSync('old-name.ts', 'my code');
    coordinator.handleRename('old-name.ts', 'new-name.ts');

    await coordinator.flush();

    assert.equal(written.length, 1);
    assert.equal(written[0].path, 'new-name.ts');
    assert.equal(written[0].content, 'my code');
  });

  test('handleDelete cancels pending writes for deleted file', async () => {
    const written = [];
    const deleted = [];
    const coordinator = new FileSyncCoordinator({
      debounceMs: 50,
      rawWrite: async (path, content) => {
        written.push({ path, content });
      },
      rawDelete: async (path) => {
        deleted.push(path);
      },
    });

    coordinator.queueSync('temp.ts', 'should not be written');
    await coordinator.handleDelete('temp.ts');

    await new Promise((r) => setTimeout(r, 80));

    assert.equal(written.length, 0, 'Pending write was cancelled');
    assert.deepEqual(deleted, ['temp.ts'], 'File was deleted');
  });
});
