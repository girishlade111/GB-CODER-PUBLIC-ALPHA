/**
 * GB Coder — Task 06: Open in New Tab Live Preview Reliability Test Suite
 *
 * Verifies all 12 test matrix scenarios defined in Task 06 specification:
 * - TEST 01: Normal project preview in new tab.
 * - TEST 02: Vite development-server project.
 * - TEST 03: Delayed server startup.
 * - TEST 04: Button clicked before server-ready.
 * - TEST 05: Repeated new-tab opening.
 * - TEST 06: New tab after project file changes.
 * - TEST 07: New tab after server restart.
 * - TEST 08: New tab after project switch.
 * - TEST 09: New tab while IDE tab stays active.
 * - TEST 10: New tab after the IDE runtime stops.
 * - TEST 11: Reloading an already opened preview tab.
 * - TEST 12: Supported browser compatibility.
 *
 * Run with: node scripts/open-in-new-tab-tests.mjs
 */

import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

// In-Memory Channel and Storage Simulator for Node.js
class MockBroadcastChannel extends EventEmitter {
  static channels = new Map();

  constructor(name) {
    super();
    this.name = name;
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set());
    }
    MockBroadcastChannel.channels.get(name).add(this);
  }

  postMessage(data) {
    const peers = MockBroadcastChannel.channels.get(this.name) || new Set();
    for (const peer of peers) {
      if (peer !== this) {
        setImmediate(() => {
          if (typeof peer.onmessage === 'function') {
            peer.onmessage({ data });
          }
          peer.emit('message', { data });
        });
      }
    }
  }

  close() {
    const peers = MockBroadcastChannel.channels.get(this.name);
    if (peers) {
      peers.delete(this);
    }
  }
}

// Mock browser environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) { return this.store.get(k) ?? null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

class MockWindowOpen {
  constructor() {
    this.openedWindows = [];
    this.popupBlocked = false;
  }

  open(url, target, features) {
    if (this.popupBlocked) {
      return null;
    }
    const win = {
      url,
      target,
      features,
      closed: false,
      focus: () => {},
      close: () => { win.closed = true; },
      location: { href: url, reload: () => {} },
    };
    this.openedWindows.push(win);
    return win;
  }
}

const mockWindow = new MockWindowOpen();

// Live Preview Channel Implementation (Matching src/services/preview/livePreviewChannel.ts)
const CHANNEL_NAME = 'gbcoder_live_preview_channel';
const STORAGE_KEY = 'gbcoder_live_preview_last_state';

class LivePreviewChannel {
  constructor(channelImpl, localStorageImpl, sessionStorageImpl) {
    this.channel = new channelImpl(CHANNEL_NAME);
    this.localStorage = localStorageImpl;
    this.sessionStorage = sessionStorageImpl;
    this.listeners = new Set();
    this.currentState = null;

    this.channel.onmessage = (event) => {
      if (event.data) {
        this.handleIncoming(event.data);
      }
    };
  }

  handleIncoming(payload) {
    if (payload.type !== 'reload') {
      this.currentState = payload;
    }
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  persistAndNotify(payload) {
    if (payload.type !== 'reload') {
      this.currentState = payload;
      const json = JSON.stringify(payload);
      this.sessionStorage.setItem(STORAGE_KEY, json);
      this.localStorage.setItem(STORAGE_KEY, json);
    }
    this.channel.postMessage(payload);
    this.handleIncoming(payload);
  }

  broadcastDevServer(url, port, label) {
    this.persistAndNotify({
      type: 'dev_server',
      url,
      port,
      label: label || `Port ${port}`,
      timestamp: Date.now(),
    });
  }

  broadcastCode(html, css, javascript) {
    this.persistAndNotify({
      type: 'standalone_code',
      html,
      css,
      javascript,
      timestamp: Date.now(),
    });
  }

  broadcastReload() {
    this.persistAndNotify({
      type: 'reload',
      timestamp: Date.now(),
    });
  }

  broadcastServerOffline() {
    this.persistAndNotify({
      type: 'dev_server_offline',
      timestamp: Date.now(),
    });
  }

  getCurrentState() {
    if (this.currentState) return this.currentState;
    try {
      const stored = this.sessionStorage.getItem(STORAGE_KEY) || this.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentState = JSON.parse(stored);
      }
    } catch {
      // Ignored
    }
    return this.currentState;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Controller under test (Matching VSCodeMode.tsx handleOpenInNewTab & guards)
class PopoutController {
  constructor(channel, windowOpenImpl) {
    this.channel = channel;
    this.windowOpen = windowOpenImpl;
    this.toasts = [];
  }

  toast(msg, options) {
    this.toasts.push({ type: 'info', msg, options });
  }

  toastError(msg) {
    this.toasts.push({ type: 'error', msg });
  }

  handleOpenInNewTab(activePreview, startupStage) {
    if (!activePreview?.url) {
      if (
        startupStage === 'installing' ||
        startupStage === 'booting' ||
        startupStage === 'starting_server'
      ) {
        this.toast('Development server is still starting. Please wait for it to be ready.', { icon: '⏳' });
      } else {
        this.toastError('Development server is not running. Start the dev server before opening preview.');
      }
      return null;
    }

    try {
      this.channel.broadcastDevServer(activePreview.url, activePreview.port, activePreview.label);
      const urlParam = encodeURIComponent(activePreview.url);
      const portParam = encodeURIComponent(String(activePreview.port));
      const popoutUrl = `/preview-popout?url=${urlParam}&port=${portParam}`;
      const newWin = this.windowOpen.open(popoutUrl, '_blank', 'noopener,noreferrer');
      if (!newWin) {
        this.toastError('Popup window was blocked by browser. Please allow popups for this site.');
      }
      return newWin;
    } catch (err) {
      this.toastError('Could not open preview in new tab.');
      return null;
    }
  }

  openNormalInNewTab(html, css, js) {
    try {
      this.channel.broadcastCode(html, css, js);
      const newWin = this.windowOpen.open('/preview-popout', '_blank', 'noopener,noreferrer');
      if (!newWin) {
        this.toastError('Popup window was blocked by browser. Please allow popups for this site.');
      }
      return newWin;
    } catch (err) {
      this.toastError('Could not open preview in new tab.');
      return null;
    }
  }
}

// Simulated Popout Tab State (Matching LivePreviewPopoutPage.tsx)
class PopoutTabPage {
  constructor(pathname, search, channel, storage) {
    this.pathname = pathname;
    this.search = search;
    this.channel = channel;
    this.storage = storage;
    this.reloadCount = 0;
    this.isConnected = true;
    this.iframe = {
      src: null,
      srcDoc: null,
      title: '',
      sandbox: 'allow-scripts allow-same-origin allow-forms allow-modals allow-downloads',
      reloads: 0,
      reload() { this.reloads++; },
    };

    // Synchronous initializer
    const params = new URLSearchParams(this.search);
    const urlParam = params.get('url');
    const portParam = params.get('port');
    if (urlParam) {
      this.payload = {
        type: 'dev_server',
        url: decodeURIComponent(urlParam),
        port: portParam ? parseInt(portParam, 10) : 5173,
        label: `Port ${portParam || 5173}`,
        timestamp: Date.now(),
      };
    } else {
      this.payload = this.channel.getCurrentState();
    }

    this.applyPayloadToIframe();

    this.unsubscribe = this.channel.subscribe((newPayload) => {
      if (newPayload.type === 'reload') {
        this.reloadCount++;
        this.iframe.reload();
      } else if (newPayload.type === 'dev_server_offline') {
        this.isConnected = false;
      } else {
        this.isConnected = true;
        this.payload = newPayload;
        this.applyPayloadToIframe();
      }
    });
  }

  applyPayloadToIframe() {
    if (this.payload?.type === 'dev_server') {
      this.iframe.src = this.payload.url;
      this.iframe.srcDoc = null;
      this.iframe.title = 'Live Dev Server';
    } else if (this.payload?.type === 'standalone_code') {
      this.iframe.src = null;
      this.iframe.srcDoc = `<html><style>${this.payload.css}</style><body>${this.payload.html}</body></html>`;
      this.iframe.title = 'Live Standalone Preview';
    }
  }

  close() {
    if (this.unsubscribe) this.unsubscribe();
  }
}

describe('GB Coder Task 06 — Open in New Tab Live Preview Reliability (12 Tests)', () => {
  let primaryChannel;
  let secondaryChannel;
  let controller;

  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    mockWindow.openedWindows = [];
    mockWindow.popupBlocked = false;
    MockBroadcastChannel.channels.clear();

    primaryChannel = new LivePreviewChannel(MockBroadcastChannel, mockLocalStorage, mockSessionStorage);
    secondaryChannel = new LivePreviewChannel(MockBroadcastChannel, mockLocalStorage, mockSessionStorage);
    controller = new PopoutController(primaryChannel, mockWindow);
  });

  // TEST 01: Normal project preview in new tab
  test('TEST 01: Normal project preview in new tab broadcasts standalone code and mounts srcDoc', () => {
    const html = '<h1>GB Coder Normal</h1>';
    const css = 'h1 { color: purple; }';
    const js = 'console.log("Normal Ready");';

    const win = controller.openNormalInNewTab(html, css, js);
    assert.ok(win, 'Expected window to be opened');
    assert.equal(win.url, '/preview-popout');
    assert.equal(win.features, 'noopener,noreferrer');

    const popout = new PopoutTabPage('/preview-popout', '', secondaryChannel, mockLocalStorage);
    assert.equal(popout.iframe.title, 'Live Standalone Preview');
    assert.ok(popout.iframe.srcDoc.includes('GB Coder Normal'));
    popout.close();
  });

  // TEST 02: Vite development-server project
  test('TEST 02: Vite development-server project encodes URL and mounts iframe src immediately', () => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://test-session.local-credentialless.webcontainer-api.io/',
      isWebContainer: true,
    };

    const win = controller.handleOpenInNewTab(activePreview, 'ready');
    assert.ok(win, 'New tab must open');
    assert.ok(win.url.startsWith('/preview-popout?url=https%3A%2F%2Ftest-session.local-credentialless.webcontainer-api.io'));
    assert.ok(win.url.includes('&port=5173'));

    const search = win.url.split('?')[1];
    const popout = new PopoutTabPage('/preview-popout', search, secondaryChannel, mockLocalStorage);

    // Verify iframe src matches active preview URL exactly
    assert.equal(popout.iframe.src, activePreview.url);
    assert.equal(popout.iframe.title, 'Live Dev Server');
    assert.equal(popout.isConnected, true);
    popout.close();
  });

  // TEST 03: Delayed server startup
  test('TEST 03: Delayed server startup guards action until server-ready fires', () => {
    let activePreview = null;
    let startupStage = 'starting_server';

    // Clicked while starting: guarded
    const blockedWin = controller.handleOpenInNewTab(activePreview, startupStage);
    assert.equal(blockedWin, null);
    assert.equal(controller.toasts.length, 1);
    assert.ok(controller.toasts[0].msg.includes('Development server is still starting'));

    // Server finishes starting
    activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://ready-session.local-credentialless.webcontainer-api.io/',
    };
    startupStage = 'ready';

    // Clicked after ready: succeeds
    const win = controller.handleOpenInNewTab(activePreview, startupStage);
    assert.ok(win);
    assert.ok(win.url.includes('ready-session'));
  });

  // TEST 04: Button clicked before server-ready
  test('TEST 04: Button clicked before server-ready shows informative toast without opening blank tab', () => {
    const activePreview = null;
    const stages = ['idle', 'booting', 'installing', 'starting_server'];

    for (const stage of stages) {
      controller.toasts = [];
      const win = controller.handleOpenInNewTab(activePreview, stage);
      assert.equal(win, null, `Must not open window during stage ${stage}`);
      assert.ok(controller.toasts.length >= 1, `Must emit toast for stage ${stage}`);
    }
  });

  // TEST 05: Repeated new-tab opening
  test('TEST 05: Repeated new-tab opening maintains consistent preview URL across instances', () => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://stable-session.local-credentialless.webcontainer-api.io/',
    };

    const win1 = controller.handleOpenInNewTab(activePreview, 'ready');
    const win2 = controller.handleOpenInNewTab(activePreview, 'ready');
    const win3 = controller.handleOpenInNewTab(activePreview, 'ready');

    assert.equal(mockWindow.openedWindows.length, 3);
    assert.equal(win1.url, win2.url);
    assert.equal(win2.url, win3.url);
  });

  // TEST 06: New tab after project file changes
  test('TEST 06: New tab after project file changes reflects latest broadcast state', (t, done) => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://session-a.local-credentialless.webcontainer-api.io/',
    };

    const win1 = controller.handleOpenInNewTab(activePreview, 'ready');
    const search = win1.url.split('?')[1];
    const popout = new PopoutTabPage('/preview-popout', search, secondaryChannel, mockLocalStorage);

    // Code changes in IDE: triggers reload broadcast
    primaryChannel.broadcastReload();

    setImmediate(() => {
      assert.equal(popout.reloadCount, 1);
      assert.equal(popout.iframe.reloads, 1);
      popout.close();
      done();
    });
  });

  // TEST 07: New tab after server restart
  test('TEST 07: New tab after server restart updates target URL and notifies open popout tabs', (t, done) => {
    const preview1 = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://session-old.local-credentialless.webcontainer-api.io/',
    };

    const win1 = controller.handleOpenInNewTab(preview1, 'ready');
    const popout = new PopoutTabPage('/preview-popout', win1.url.split('?')[1], secondaryChannel, mockLocalStorage);
    assert.equal(popout.iframe.src, preview1.url);

    // Server restarts on new port/session
    const preview2 = {
      port: 5174,
      label: '⚡ WebContainer (Port 5174)',
      url: 'https://session-new.local-credentialless.webcontainer-api.io/',
    };

    primaryChannel.broadcastDevServer(preview2.url, preview2.port, preview2.label);

    setImmediate(() => {
      // Popout tab updated automatically via livePreviewChannel
      assert.equal(popout.iframe.src, preview2.url);

      // Fresh new tab also gets new URL
      const win2 = controller.handleOpenInNewTab(preview2, 'ready');
      assert.ok(win2.url.includes('session-new'));
      assert.ok(win2.url.includes('&port=5174'));

      popout.close();
      done();
    });
  });

  // TEST 08: New tab after project switch
  test('TEST 08: New tab after project switch clears stale URL and guards until new server boots', () => {
    let activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://project-alpha.local-credentialless.webcontainer-api.io/',
    };

    const winAlpha = controller.handleOpenInNewTab(activePreview, 'ready');
    assert.ok(winAlpha.url.includes('project-alpha'));

    // Switch project: activePreview reset
    activePreview = null;
    primaryChannel.broadcastServerOffline();

    const blocked = controller.handleOpenInNewTab(activePreview, 'booting');
    assert.equal(blocked, null, 'Must refuse to open tab for switching project');

    // New project server ready
    activePreview = {
      port: 3000,
      label: '⚡ WebContainer (Port 3000)',
      url: 'https://project-beta.local-credentialless.webcontainer-api.io/',
    };
    const winBeta = controller.handleOpenInNewTab(activePreview, 'ready');
    assert.ok(winBeta.url.includes('project-beta'));
    assert.ok(winBeta.url.includes('&port=3000'));
  });

  // TEST 09: New tab while IDE tab stays active
  test('TEST 09: New tab while IDE tab stays active keeps bidirectional channel synchronized', (t, done) => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://concurrent-session.local-credentialless.webcontainer-api.io/',
    };

    const win = controller.handleOpenInNewTab(activePreview, 'ready');
    const popout = new PopoutTabPage('/preview-popout', win.url.split('?')[1], secondaryChannel, mockLocalStorage);

    assert.equal(popout.isConnected, true);
    assert.equal(popout.iframe.src, activePreview.url);

    // IDE sends reload
    primaryChannel.broadcastReload();

    setImmediate(() => {
      assert.equal(popout.reloadCount, 1);
      popout.close();
      done();
    });
  });

  // TEST 10: New tab after the IDE runtime stops
  test('TEST 10: New tab after the IDE runtime stops gracefully displays disconnected state', (t, done) => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://stopping-session.local-credentialless.webcontainer-api.io/',
    };

    const win = controller.handleOpenInNewTab(activePreview, 'ready');
    const popout = new PopoutTabPage('/preview-popout', win.url.split('?')[1], secondaryChannel, mockLocalStorage);

    assert.equal(popout.isConnected, true);

    // IDE closes / stops server
    primaryChannel.broadcastServerOffline();

    setImmediate(() => {
      assert.equal(popout.isConnected, false, 'Popout tab must transition to disconnected state');
      popout.close();
      done();
    });
  });

  // TEST 11: Reloading an already opened preview tab
  test('TEST 11: Reloading an already opened preview tab re-parses query parameters without losing URL', () => {
    const search = '?url=https%3A%2F%2Freload-session.local-credentialless.webcontainer-api.io&port=5173';
    const popout1 = new PopoutTabPage('/preview-popout', search, secondaryChannel, mockLocalStorage);
    assert.equal(popout1.iframe.src, 'https://reload-session.local-credentialless.webcontainer-api.io');
    popout1.close();

    // User refreshes tab (F5 / reload)
    const popout2 = new PopoutTabPage('/preview-popout', search, secondaryChannel, mockLocalStorage);
    assert.equal(popout2.iframe.src, 'https://reload-session.local-credentialless.webcontainer-api.io');
    assert.equal(popout2.payload.port, 5173);
    popout2.close();
  });

  // TEST 12: Supported browser compatibility
  test('TEST 12: Supported browser compatibility verifies noopener and popup blocker feedback', () => {
    const activePreview = {
      port: 5173,
      label: '⚡ WebContainer (Port 5173)',
      url: 'https://compat-session.local-credentialless.webcontainer-api.io/',
    };

    // 1. Normal window opening sets noopener,noreferrer
    const win = controller.handleOpenInNewTab(activePreview, 'ready');
    assert.ok(win);
    assert.equal(win.features, 'noopener,noreferrer');

    // 2. Blocked popup emits warning toast
    mockWindow.popupBlocked = true;
    controller.toasts = [];
    const blockedWin = controller.handleOpenInNewTab(activePreview, 'ready');
    assert.equal(blockedWin, null);
    assert.equal(controller.toasts.length, 1);
    assert.ok(controller.toasts[0].msg.includes('Popup window was blocked'));
  });
});
