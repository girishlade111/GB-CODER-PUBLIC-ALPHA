import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

// Direct module imports
import { detectProjectCommands } from '../src/services/webcontainer/projectCommandDetection.ts';
import { TerminalSessionManager } from '../src/services/webcontainer/terminalSessionManager.ts';
import { WebContainerWatcher } from '../src/services/webcontainer/webcontainerWatcher.ts';
import { DevServerManager } from '../src/services/webcontainer/devServerManager.ts';
import { previewReloadService } from '../src/services/preview/previewReloadService.ts';

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
      assert.equal(mgr.getSplitSessionId(), null);
    });

    test('2.2 Mock container creates independent sessions with unique IDs', async () => {
      const mgr = new TerminalSessionManager();
      const mockContainer = {
        spawn: async (cmd, opts) => ({
          input: {
            getWriter: () => ({
              write: async () => {},
              releaseLock: () => {},
            }),
          },
          output: new ReadableStream({
            start(controller) {
              controller.enqueue('prompt$ ');
            },
          }),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer, { title: 'Terminal 1' });
      const s2 = await mgr.createSession(mockContainer, { title: 'Terminal 2' });

      assert.notEqual(s1.id, s2.id);
      assert.equal(mgr.listSessions().length, 2);
      assert.equal(mgr.getActiveSessionId(), s1.id); // First session remains active
    });

    test('2.3 Split session assignment and clearing', async () => {
      const mgr = new TerminalSessionManager();
      const mockContainer = {
        spawn: async () => ({
          input: { getWriter: () => ({ write: async () => {}, releaseLock: () => {} }) },
          output: new ReadableStream(),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer, { title: 'Left' });
      const s2 = await mgr.createSession(mockContainer, { title: 'Right' });

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
          output: new ReadableStream(),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer, { title: 'First' });
      const s2 = await mgr.createSession(mockContainer, { title: 'Second' });

      mgr.setActiveSessionId(s2.id);
      mgr.closeSession(s2.id);

      assert.equal(mgr.listSessions().length, 1);
      assert.equal(mgr.getActiveSessionId(), s1.id);
    });

    test('2.5 Writing to session dispatches through writer', async () => {
      const mgr = new TerminalSessionManager();
      let writtenChunk = '';
      const mockContainer = {
        spawn: async () => ({
          input: {
            getWriter: () => ({
              write: async (chunk) => {
                writtenChunk += chunk;
              },
              releaseLock: () => {},
            }),
          },
          output: new ReadableStream(),
          kill: () => {},
          exit: Promise.resolve(0),
        }),
      };

      const s1 = await mgr.createSession(mockContainer);
      const ok = mgr.writeToSession(s1.id, 'ls -la\n');
      assert.equal(ok, true);
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
   * 3. WebContainer Filesystem Watcher Invariants
   * ------------------------------------------------------------------------ */
  describe('3. Filesystem Watcher & Sync (Sub-Phase 1.5)', () => {
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

    test('3.3 Dirty editor buffer protection', async () => {
      const watcher = new WebContainerWatcher();
      let changeFired = false;

      const mockContainer = {
        fs: {
          watch: (dir, opts, cb) => ({ close: () => {} }),
          readFile: async (path, enc) => 'external content',
        },
      };

      watcher.start(mockContainer, {
        onFileCreate: () => {},
        onFileChange: () => {
          changeFired = true;
        },
        onFileDelete: () => {},
        isEditorDirty: (path) => path === 'src/dirtyFile.ts',
      });

      watcher['handleRawFSEvent']('change', 'src/dirtyFile.ts');

      // Wait for debounce window (250ms + margin)
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(changeFired, false, 'Dirty editor file must NOT be overwritten by external watcher');
      watcher.stop();
    });
  });

  /* ------------------------------------------------------------------------
   * 4. Dev Server Process Manager Invariants
   * ------------------------------------------------------------------------ */
  describe('4. Dev Server Process Management (Sub-Phase 1.6)', () => {
    test('4.1 Initial state is idle with no running server', () => {
      const dev = new DevServerManager();
      assert.equal(dev.getState().status, 'idle');
      assert.equal(dev.isRunning(), false);
      assert.equal(dev.getState().serverUrl, null);
    });

    test('4.2 Receiving server-ready updates status to running', () => {
      const dev = new DevServerManager();
      dev.handleServerReady(3000, 'https://test-3000.webcontainer-api.io/');
      assert.equal(dev.isRunning(), true);
      assert.equal(dev.getState().serverPort, 3000);
      assert.equal(dev.getState().serverUrl, 'https://test-3000.webcontainer-api.io/');
    });

    test('4.3 Port close marks server stopped', () => {
      const dev = new DevServerManager();
      dev.handleServerReady(5173, 'https://test-5173.webcontainer-api.io/');
      assert.equal(dev.isRunning(), true);

      dev.handlePortClose(5173);
      assert.equal(dev.isRunning(), false);
      assert.equal(dev.getState().status, 'stopped');
    });

    test('4.4 Duplicate start prevention when server is running', async () => {
      const dev = new DevServerManager();
      dev.handleServerReady(3000, 'https://test-3000.webcontainer-api.io/');

      const res = await dev.start('npm run dev');
      assert.equal(res, false, 'Duplicate start must be rejected while server is running');
    });
  });

  /* ------------------------------------------------------------------------
   * 5. Live Preview Reliability Invariants
   * ------------------------------------------------------------------------ */
  describe('5. Live Preview Reload (Sub-Phase 1.7)', () => {
    test('5.1 Reload preview never restarts dev server or triggers npm install', async () => {
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
   * 6. Real Chromium Browser Verification
   * ------------------------------------------------------------------------ */
  describe('6. Chromium Browser End-to-End Runtime Validation', () => {
    test('6.1 crossOriginIsolated is true on /app/ide', async () => {
      const page = await browser.newPage();
      await page.goto(`${BASE_URL}/app/ide`, { waitUntil: 'domcontentloaded' });

      const isIsolated = await page.evaluate(() => window.crossOriginIsolated);
      assert.equal(isIsolated, true, 'Window must be crossOriginIsolated for WebContainer support');
      await page.close();
    });

    test('6.2 Advanced IDE loads with Docked Bottom Panel and Terminal Tab', async () => {
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

    test('6.3 StackBlitz Startup Loader displays Runtime Environment Ready when idle', async () => {
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
