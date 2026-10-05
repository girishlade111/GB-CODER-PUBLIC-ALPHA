/**
 * Live Preview Channel Service.
 *
 * Bridges the GB Coder IDE editor window and detached / popout preview windows
 * via the browser-native `BroadcastChannel` API and storage fallbacks.
 *
 * Enables real-time, zero-cloud-cost live synchronization:
 * - WebContainer in-browser dev servers (Vite HMR over WebSocket + port updates)
 * - Standard multi-file HTML/CSS/JS compilations
 * - Remote sandbox dev servers
 */

export interface DevServerPreviewState {
  type: 'dev_server';
  url: string;
  port: number;
  label?: string;
  timestamp: number;
}

export interface StandaloneCodePreviewState {
  type: 'standalone_code';
  html: string;
  css: string;
  javascript: string;
  timestamp: number;
}

export type LivePreviewPayload =
  | DevServerPreviewState
  | StandaloneCodePreviewState
  | { type: 'reload'; timestamp: number };

const CHANNEL_NAME = 'gbcoder_live_preview_channel';
const STORAGE_KEY = 'gbcoder_live_preview_last_state';

class LivePreviewChannel {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<(payload: LivePreviewPayload) => void>();
  private currentState: LivePreviewPayload | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Restore last known state from storage so new tabs hydrate instantly
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.currentState = JSON.parse(stored);
        }
      } catch {
        // Ignored
      }

      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<LivePreviewPayload>) => {
            if (event.data) {
              this.handleIncoming(event.data);
            }
          };
        } catch (err) {
          console.warn('[LivePreviewChannel] BroadcastChannel init error:', err);
        }
      }

      // Fallback cross-tab listener using storage event
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            this.handleIncoming(parsed);
          } catch {
            // Ignored
          }
        }
      });
    }
  }

  private handleIncoming(payload: LivePreviewPayload) {
    if (payload.type !== 'reload') {
      this.currentState = payload;
    }
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[LivePreviewChannel] Listener error:', err);
      }
    });
  }

  private persistAndNotify(payload: LivePreviewPayload) {
    if (payload.type !== 'reload') {
      this.currentState = payload;
      try {
        const json = JSON.stringify(payload);
        sessionStorage.setItem(STORAGE_KEY, json);
        localStorage.setItem(STORAGE_KEY, json);
      } catch {
        // Ignored
      }
    }

    try {
      this.channel?.postMessage(payload);
    } catch (err) {
      console.warn('[LivePreviewChannel] PostMessage error:', err);
    }

    // Also notify local listeners in the current tab
    this.handleIncoming(payload);
  }

  /**
   * Broadcasts an active dev server URL (e.g. WebContainer Vite server).
   */
  public broadcastDevServer(url: string, port: number, label?: string): void {
    this.persistAndNotify({
      type: 'dev_server',
      url,
      port,
      label: label || `Port ${port}`,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcasts compiled standalone code (for standard HTML/CSS/JS preview).
   */
  public broadcastCode(html: string, css: string, javascript: string): void {
    this.persistAndNotify({
      type: 'standalone_code',
      html,
      css,
      javascript,
      timestamp: Date.now(),
    });
  }

  /**
   * Triggers a hard reload across all preview windows.
   */
  public broadcastReload(): void {
    this.persistAndNotify({
      type: 'reload',
      timestamp: Date.now(),
    });
  }

  /**
   * Returns the current cached preview state for immediate hydration.
   */
  public getCurrentState(): LivePreviewPayload | null {
    if (this.currentState) return this.currentState;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentState = JSON.parse(stored);
      }
    } catch {
      // Ignored
    }
    return this.currentState;
  }

  /**
   * Subscribes to live preview payload events.
   */
  public subscribe(listener: (payload: LivePreviewPayload) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const livePreviewChannel = new LivePreviewChannel();
