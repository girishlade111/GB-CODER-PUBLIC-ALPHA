import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

// Direct module imports
import { detectProjectCommands } from '../src/services/webcontainer/projectCommandDetection.ts';
import { TerminalSessionManager } from '../src/services/webcontainer/terminalSessionManager.ts';
import { WebContainerWatcher, PathClassification } from '../src/services/webcontainer/webcontainerWatcher.ts';
import { DevServerManager } from '../src/services/webcontainer/devServerManager.ts';
import { previewReloadService } from '../src/services/preview/previewReloadService.ts';
import { editorConflictService } from '../src/services/editor/editorConflictService.ts';

const TEST_PORT = 4188;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

describe('GB Coder Phase 1 — WebContainer Runtime & Terminal Reliability Matrix', () => {
  let serverProcess;
  let browser;

  before(async () => {
    // Start preview server to test real browser environment
    serverProcess = spawn('node', ['scripts/preview-combined.mjs', `--port=${TEST_PORT}`], {
      stdio: 'pipe',
    });

    for (let i = 0; i < 40; i++) {
      try {
        await new Promise((resolve, reject) => {
          http.get(BASE_URL, (res) => (res.statusCode ? resolve(true) : reject())).on('error', reject);
        });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--enable-features=SharedArrayBuffer', '--no-sandbox'],
    });
  });

  after(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  });

  /* ------------------------------------------------------------------------
   * 1. Project Command Detection Invariants
   * ------------------------------------------------------------------------ */
  describe('1. Project Command Detection (Sub-Phase 1.3)', () => {
    test('1.1 Detects npm package.json dev script', () => {
      const files = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test-app',
            scripts: { dev: 'vite', build: 'vite build' },
          }),
        },
      ];
      const res = detectProjectCommands(files);
      assert.equal(res.isStaticProject, false);
      assert.equal(res.packageManager, 'npm');
      assert.equal(res.devCommand, 'npm run dev');
      assert.ok(res.installCommand.includes('npm install'));
    });

    test('1.2 Detects pnpm via pnpm-lock.yaml', () => {
      const files = [
        { path: 'package.json', content: JSON.stringify({ scripts: { start: 'next start' } }) },
        { path: 'pnpm-lock.yaml', content: 'lockfileVersion: 5.4' },
      ];
      const res = detectProjectCommands(files);
      assert.equal(res.packageManager, 'pnpm');
      assert.equal(res.devCommand, 'pnpm start');
      assert.equal(res.installCommand, 'pnpm install');
    });

    test('1.3 Identifies static project without package.json', () => {
      const files = [
        { path: 'index.html', content: '<h1>Hello</h1>' },
        { path: 'style.css', content: 'body { color: red; }' },
      ];
      const res = detectProjectCommands(files);
      assert.equal(res.isStaticProject, true);
      assert.equal(res.hasManifest, false);
    });
  });

  /* ------------------------------------------------------------------------
   * 2. Multi-Terminal Session Manager Invariants
   * ------------------------------------------------------------------------ */
  describe('2. Multi-Terminal Session Management (Sub-Phase 1.4)', () => {
    test('2.1 Initial state has no sessions and null active session', () => {
      const mgr = new TerminalSessionManager();
      assert.equal(mgr.listSessions().length, 0);
      assert.equal(mgr.getActiveSessionId(), null);
    });

    test('2.2 Mock container creates independent sessions with unique IDs', async () => {
      const mgr = new TerminalSessionManager();
      const mockContainer = {
        spawn: async () => ({
          input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
          output: new ReadableStream({ start() {} }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer, { title: 'Server' });
      const s2 = await mgr.createSession(mockContainer, { title: 'Tests' });

      assert.notEqual(s1.id, s2.id);
      assert.equal(mgr.listSessions().length, 2);
      assert.equal(mgr.getSession(s1.id)?.title, 'Server');
      assert.equal(mgr.getSession(s2.id)?.title, 'Tests');
    });

    test('2.3 Split session assignment and clearing', async () => {
      const mgr = new TerminalSessionManager();
      const mockContainer = {
        spawn: async () => ({
          input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
          output: new ReadableStream({ start() {} }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer);
      const s2 = await mgr.createSession(mockContainer);

      mgr.setActiveSessionId(s1.id);
      mgr.setSplitSessionId(s2.id);

      assert.equal(mgr.getActiveSessionId(), s1.id);
      assert.equal(mgr.getSplitSessionId(), s2.id);

      mgr.setSplitSessionId(null);
      assert.equal(mgr.getSplitSessionId(), null);
    });

    test('2.4 Closing active session safely promotes fallback session', async () => {
      const mgr = new TerminalSessionManager();
      const mockContainer = {
        spawn: async () => ({
          input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
          output: new ReadableStream({ start() {} }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer, { title: 'Terminal 1' });
      const s2 = await mgr.createSession(mockContainer, { title: 'Terminal 2' });

      mgr.setActiveSessionId(s1.id);
      mgr.closeSession(s1.id);

      assert.equal(mgr.listSessions().length, 1);
      assert.equal(mgr.getActiveSessionId(), s2.id);
    });

    test('2.5 Writing to session dispatches through writer', async () => {
      const mgr = new TerminalSessionManager();
      let writtenChunk = '';
      const mockContainer = {
        spawn: async () => ({
          input: {
            getWriter: () => ({
              write: async (c) => {
                writtenChunk = c;
              },
              releaseLock: () => {},
            }),
          },
          output: new ReadableStream({ start() {} }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s = await mgr.createSession(mockContainer);
      mgr.writeToSession(s.id, 'ls -la\n');

      assert.equal(writtenChunk, 'ls -la\n');
    });

    test('2.6 Output buffer stores terminal history for reconnect replay', async () => {
      const mgr = new TerminalSessionManager();
      let streamController;
      const mockContainer = {
        spawn: async () => ({
          input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
          output: new ReadableStream({
            start(controller) {
              streamController = controller;
            },
          }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const session = await mgr.createSession(mockContainer);
      streamController.enqueue('Build completed in 400ms\n');
      await new Promise((r) => setTimeout(r, 20));

      assert.equal(session.outputBuffer.join(''), 'Build completed in 400ms\n');
    });
  });

  /* ------------------------------------------------------------------------
   * 3. WebContainer Filesystem Watcher & Classification (P0 Data Loss Prevention)
   * ------------------------------------------------------------------------ */
  describe('3. Filesystem Watcher & Classification (P0 Data Loss Prevention)', () => {
    test('3.1 Ignores noise directories (node_modules, .git, dist, .cache)', () => {
      const watcher = new WebContainerWatcher();
      assert.equal(watcher['isIgnored']('node_modules/react/index.js'), true);
      assert.equal(watcher['isIgnored']('.git/HEAD'), true);
      assert.equal(watcher['isIgnored']('dist/bundle.js'), true);
      assert.equal(watcher['isIgnored']('.cache/turbo.json'), true);
      assert.equal(watcher['isIgnored']('src/App.tsx'), false);
      assert.equal(watcher['isIgnored']('package.json'), false);
    });

    test('3.2 Echo suppression via markInternallySynced', () => {
      const watcher = new WebContainerWatcher();
      watcher.markInternallySynced('src/components/Header.tsx');
      assert.equal(watcher.isPathInternallySynced('src/components/Header.tsx'), true);
      assert.equal(watcher.isPathInternallySynced('src/components/Footer.tsx'), false);
    });

    test('3.3 PathClassification: Regular file returns REGULAR_FILE', async () => {
      const watcher = new WebContainerWatcher();
      const mockContainer = {
        fs: {
          readFile: async (p) => 'file content',
          readdir: async () => [],
        },
      };

      const result = await watcher.classifyPath(mockContainer, 'src/index.ts', ['src/index.ts']);
      assert.equal(result.classification, PathClassification.REGULAR_FILE);
      assert.equal(result.content, 'file content');
    });

    test('3.4 PathClassification: EISDIR on readFile is classified as DIRECTORY (never deletion)', async () => {
      const watcher = new WebContainerWatcher();
      const mockContainer = {
        fs: {
          readFile: async () => {
            const err = new Error('EISDIR: illegal operation on a directory, read');
            err.code = 'EISDIR';
            throw err;
          },
          readdir: async () => ['App.tsx', 'index.ts'],
        },
      };

      const result = await watcher.classifyPath(mockContainer, 'src', ['src/App.tsx', 'src/index.ts']);
      assert.equal(result.classification, PathClassification.DIRECTORY, 'EISDIR must classify as DIRECTORY');
    });

    test('3.5 Directory event does NOT trigger onFileDelete or delete child files', async () => {
      const watcher = new WebContainerWatcher();
      let deleteFired = false;
      let deletedPath = '';
      let dirCreatedFired = false;

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async (p) => {
            if (p === 'src') {
              const err = new Error('EISDIR: read on directory');
              err.code = 'EISDIR';
              throw err;
            }
            return 'file-content';
          },
          readdir: async (p) => {
            if (p === 'src') return ['App.tsx', 'main.tsx'];
            throw new Error('ENOTDIR');
          },
        },
      };

      watcher.start(mockContainer, {
        projectId: 'test-proj',
        getKnownFiles: () => ['src/App.tsx', 'src/main.tsx'],
        onFileCreate: () => {},
        onFileChange: () => {},
        onFileDelete: (path) => {
          deleteFired = true;
          deletedPath = path;
        },
        onDirectoryCreate: () => {
          dirCreatedFired = true;
        },
      });

      watcher.handleRawFSEvent('change', 'src');

      // Wait for debounce flush
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(deleteFired, false, 'Directory event on "src" must NEVER fire onFileDelete!');
      assert.equal(deletedPath, '');
      assert.equal(dirCreatedFired, true, 'Directory event must trigger onDirectoryCreate');
      watcher.stop();
    });

    test('3.6 Transient I/O read error fails safe to TRANSIENT_ERROR without deletion', async () => {
      const watcher = new WebContainerWatcher();
      let deleteFired = false;

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async () => {
            const err = new Error('EBUSY: resource busy or locked');
            err.code = 'EBUSY';
            throw err;
          },
          readdir: async () => {
            const err = new Error('EBUSY');
            err.code = 'EBUSY';
            throw err;
          },
        },
      };

      watcher.start(mockContainer, {
        projectId: 'test-proj',
        getKnownFiles: () => ['src/busy.ts'],
        onFileCreate: () => {},
        onFileChange: () => {},
        onFileDelete: () => {
          deleteFired = true;
        },
      });

      watcher.handleRawFSEvent('change', 'src/busy.ts');
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(deleteFired, false, 'Transient EBUSY error must FAIL SAFE and NOT delete file');
      watcher.stop();
    });

    test('3.7 Confirmed file deletion correctly classifies and calls onFileDelete', async () => {
      const watcher = new WebContainerWatcher();
      let deletedPath = '';

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async () => {
            const err = new Error('ENOENT: no such file or directory');
            err.code = 'ENOENT';
            throw err;
          },
          readdir: async () => {
            const err = new Error('ENOENT: not a directory');
            err.code = 'ENOENT';
            throw err;
          },
        },
      };

      watcher.start(mockContainer, {
        projectId: 'test-proj',
        getKnownFiles: () => ['src/removed.ts'],
        onFileCreate: () => {},
        onFileChange: () => {},
        onFileDelete: (path) => {
          deletedPath = path;
        },
      });

      watcher.handleRawFSEvent('rename', 'src/removed.ts');
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(deletedPath, 'src/removed.ts', 'Confirmed deleted file must trigger onFileDelete');
      watcher.stop();
    });

    test('3.8 Watcher stop cancels pending timer and discards events', async () => {
      const watcher = new WebContainerWatcher();
      let changeFired = false;

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async () => 'content',
          readdir: async () => [],
        },
      };

      watcher.start(mockContainer, {
        onFileCreate: () => {},
        onFileChange: () => {
          changeFired = true;
        },
        onFileDelete: () => {},
      });

      watcher.handleRawFSEvent('change', 'src/test.ts');
      watcher.stop();

      await new Promise((r) => setTimeout(r, 350));
      assert.equal(changeFired, false, 'Stopped watcher must not execute pending events');
    });
  });

  /* ------------------------------------------------------------------------
   * 4. Monaco Dirty Buffer Protection & Conflict Resolution (P1)
   * ------------------------------------------------------------------------ */
  describe('4. Monaco Dirty Buffer Protection & Conflict Resolution (P1)', () => {
    test('4.1 Dirty Monaco buffer + terminal edit triggers conflict registration and protects Monaco buffer', async () => {
      editorConflictService.clearProjectConflicts('proj-1');
      const watcher = new WebContainerWatcher();
      let conflictFired = false;
      let onFileChangeFired = false;

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async () => 'external terminal version',
          readdir: async () => [],
        },
      };

      watcher.start(mockContainer, {
        projectId: 'proj-1',
        getKnownFiles: () => ['src/dirty.ts'],
        isEditorDirty: (path) => path === 'src/dirty.ts',
        getEditorContent: (path) => (path === 'src/dirty.ts' ? 'unsaved editor edits' : undefined),
        onFileCreate: () => {},
        onFileChange: () => {
          onFileChangeFired = true;
        },
        onFileDelete: () => {},
        onFileConflict: (conflict) => {
          conflictFired = true;
          assert.equal(conflict.path, 'src/dirty.ts');
          assert.equal(conflict.monacoContent, 'unsaved editor edits');
          assert.equal(conflict.externalContent, 'external terminal version');
        },
      });

      watcher.handleRawFSEvent('change', 'src/dirty.ts');
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(conflictFired, true, 'Conflict callback must be triggered for dirty buffer');
      assert.equal(onFileChangeFired, false, 'External change must NOT silently overwrite dirty Monaco buffer');

      const savedConflict = editorConflictService.getConflict('proj-1', 'src/dirty.ts');
      assert.ok(savedConflict, 'Conflict must be registered in editorConflictService');
      assert.equal(savedConflict.monacoContent, 'unsaved editor edits');
      assert.equal(savedConflict.externalContent, 'external terminal version');

      watcher.stop();
    });

    test('4.2 Identical external content does not register a false conflict', async () => {
      editorConflictService.clearProjectConflicts('proj-1');
      const watcher = new WebContainerWatcher();
      let conflictFired = false;

      const mockContainer = {
        fs: {
          watch: () => ({ close: () => {} }),
          readFile: async () => 'same content in both places',
          readdir: async () => [],
        },
      };

      watcher.start(mockContainer, {
        projectId: 'proj-1',
        getKnownFiles: () => ['src/same.ts'],
        isEditorDirty: () => true,
        getEditorContent: () => 'same content in both places',
        onFileCreate: () => {},
        onFileChange: () => {},
        onFileDelete: () => {},
        onFileConflict: () => {
          conflictFired = true;
        },
      });

      watcher.handleRawFSEvent('change', 'src/same.ts');
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(conflictFired, false, 'Identical content must not trigger false conflict');
      assert.equal(editorConflictService.hasConflict('proj-1', 'src/same.ts'), false);

      watcher.stop();
    });

    test('4.3 Resolving conflict via keep_mine updates status and clears active conflict', () => {
      editorConflictService.registerConflict({
        projectId: 'proj-res',
        path: 'src/file.ts',
        monacoContent: 'my code',
        externalContent: 'disk code',
      });

      assert.equal(editorConflictService.hasConflict('proj-res', 'src/file.ts'), true);

      const resolved = editorConflictService.resolveConflict('proj-res', 'src/file.ts', 'keep_mine');
      assert.equal(resolved?.status, 'resolved_keep_mine');
      assert.equal(editorConflictService.hasConflict('proj-res', 'src/file.ts'), false);
    });

    test('4.4 Resolving conflict via use_external updates status and clears active conflict', () => {
      editorConflictService.registerConflict({
        projectId: 'proj-res2',
        path: 'src/file2.ts',
        monacoContent: 'my code',
        externalContent: 'disk code',
      });

      assert.equal(editorConflictService.hasConflict('proj-res2', 'src/file2.ts'), true);

      const resolved = editorConflictService.resolveConflict('proj-res2', 'src/file2.ts', 'use_external');
      assert.equal(resolved?.status, 'resolved_use_external');
      assert.equal(editorConflictService.hasConflict('proj-res2', 'src/file2.ts'), false);
    });
  });

  /* ------------------------------------------------------------------------
   * 5. Dev Server Process Management & Verified Stop Lifecycle (P2)
   * ------------------------------------------------------------------------ */
  describe('5. Dev Server Process Management (Sub-Phase 1.6 & P2 Lifecycle)', () => {
    test('5.1 Initial state is idle with no running server', () => {
      const dev = new DevServerManager();
      assert.equal(dev.getState().status, 'idle');
      assert.equal(dev.isRunning(), false);
      assert.equal(dev.getState().serverUrl, null);
    });

    test('5.2 Receiving server-ready updates status to running', () => {
      const dev = new DevServerManager();
      dev.handleServerReady(3000, 'https://test-3000.webcontainer-api.io/');
      assert.equal(dev.isRunning(), true);
      assert.equal(dev.getState().serverPort, 3000);
      assert.equal(dev.getState().serverUrl, 'https://test-3000.webcontainer-api.io/');
    });

    test('5.3 Duplicate start prevention when server is running', async () => {
      const dev = new DevServerManager();
      dev.handleServerReady(3000, 'https://test-3000.webcontainer-api.io/');

      const res = await dev.start('npm run dev');
      assert.equal(res, false, 'Duplicate start must be rejected while server is running');
    });

    test('5.4 Stop transitions to stopping and awaits confirmed port closure', async () => {
      const dev = new DevServerManager();
      dev.handleServerReady(3000, 'https://test-3000.webcontainer-api.io/');

      // Trigger stop asynchronously
      const stopPromise = dev.stop(1000);
      assert.equal(dev.getState().status, 'stopping', 'State must immediately reflect stopping');
      assert.equal(dev.isStopping(), true);

      // Simulate port close event from runtime
      setTimeout(() => {
        dev.handlePortClose(3000);
      }, 50);

      const stopped = await stopPromise;
      assert.equal(stopped, true, 'Stop must succeed upon confirmed port closure');
      assert.equal(dev.getState().status, 'stopped');
      assert.equal(dev.isRunning(), false);
      assert.equal(dev.getState().serverUrl, null);
      assert.equal(dev.getState().serverPort, null);
    });

    test('5.5 Server timeout during stop does not falsely mark port free', async () => {
      const dev = new DevServerManager();
      dev.handleServerReady(4000, 'https://test-4000.webcontainer-api.io/');

      // Trigger stop with very short timeout without port close
      const stopped = await dev.stop(50);
      assert.equal(stopped, false, 'Unconfirmed stop must return false');
      assert.equal(dev.getState().status, 'error', 'Unconfirmed stop must set error status');
      assert.ok(dev.getState().error?.includes('4000'), 'Error message must identify unclosed port');
    });
  });

  /* ------------------------------------------------------------------------
   * 6. Live Preview Reliability Invariants
   * ------------------------------------------------------------------------ */
  describe('6. Live Preview Reload (Sub-Phase 1.7)', () => {
    test('6.1 Reload preview never restarts dev server or triggers npm install', async () => {
      previewReloadService.resetStats();

      // Mock iframe
      const mockIframe = {
        contentWindow: {
          postMessage: () => {},
        },
        src: 'https://test.webcontainer.io/',
      };

      await previewReloadService.reloadPreview(mockIframe, {
        serverUrl: 'https://test.webcontainer.io/',
        timeoutMs: 50,
      });

      const stats = previewReloadService.getStats();
      assert.equal(stats.serverRestartCount, 0, 'Dev server restart count must strictly remain 0');
      assert.equal(stats.npmInstallCount, 0, 'npm install count must strictly remain 0');
      assert.equal(stats.totalReloads, 1);
    });
  });

  /* ------------------------------------------------------------------------
   * 7. Real Chromium Browser Verification
   * ------------------------------------------------------------------------ */
  describe('7. Chromium Browser End-to-End Runtime Validation', () => {
    test('7.1 crossOriginIsolated is true on /app/ide', async () => {
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

      const isIsolated = await page.evaluate(() => window.crossOriginIsolated);
      assert.equal(isIsolated, true, 'Window must be crossOriginIsolated for WebContainer support');
      await page.close();
    });

    test('7.2 Advanced IDE loads with Docked Bottom Panel and Terminal Tab', async () => {
      const page = await browser.newPage();

      // Seed an active project into IndexedDB and localStorage
      await page.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        return new Promise((resolve) => {
          const req = indexedDB.open('gb-coder-projects-db', 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('projects')) {
              const p = db.createObjectStore('projects', { keyPath: 'id' });
              p.createIndex('lastOpenedAt', 'lastOpenedAt');
            }
            if (!db.objectStoreNames.contains('projectFiles')) {
              const f = db.createObjectStore('projectFiles', { keyPath: ['projectId', 'path'] });
              f.createIndex('projectId', 'projectId');
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(['projects', 'projectFiles'], 'readwrite');
            tx.objectStore('projects').put({
              id: 'proj-ide-phase1',
              name: 'Phase 1 E2E Project',
              projectType: 'react',
              editorStyle: 'vscode',
              createdAt: Date.now(),
              lastOpenedAt: Date.now(),
              fileCount: 2,
              entry: 'src/App.tsx',
            });
            tx.objectStore('projectFiles').put({
              projectId: 'proj-ide-phase1',
              path: 'package.json',
              content: JSON.stringify({ name: 'phase1-app', scripts: { dev: 'vite' } }),
            });
            tx.objectStore('projectFiles').put({
              projectId: 'proj-ide-phase1',
              path: 'src/App.tsx',
              content: 'export default function App() { return <h1>GB Coder Live</h1>; }',
            });
            tx.oncomplete = () => {
              localStorage.setItem('gb-coder-active-project-id', 'proj-ide-phase1');
              db.close();
              resolve(true);
            };
          };
        });
      });

      // Navigate to /app/ide
      await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

      // Wait for IDE container
      await page.waitForSelector('[data-testid="vscode-mode"]', { timeout: 15000 });
      const topbar = await page.$('[data-testid="vscode-topbar"]');
      assert.ok(topbar, 'VS Code topbar must be rendered');

      // Check for bottom panel or terminal toggle
      const terminalBtn = await page.$('button[aria-label*="terminal" i], button:has-text("TERMINAL")');
      assert.ok(terminalBtn || (await page.$('[data-testid="vscode-docked-bottom-panel"]')), 'Terminal access must exist');

      await page.close();
    });

    test('7.3 StackBlitz Startup Loader displays Runtime Environment Ready when idle', async () => {
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('[data-testid="stackblitz-startup-loader"]', { timeout: 15000 });
      const text = await page.evaluate(() => document.body.innerText);

      assert.ok(
        text.includes('Ready') || text.includes('Idle') || text.includes('WebContainer'),
        'StackBlitz Startup Loader must show readiness or idle state',
      );

      // Verify action buttons exist
      const startBtn = await page.$('[data-testid="loader-start-server-btn"]');
      assert.ok(startBtn, 'Start Dev Server button must be rendered on the loader');

      await page.close();
    });
  });
});
