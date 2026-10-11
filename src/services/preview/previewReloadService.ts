/**
 * GB Coder — Preview Reload Service
 *
 * Provides a resilient, non-destructive reload protocol for WebContainer
 * and isolated preview iframes.
 *
 * Primary invariants:
 * 1. NEVER destroys or unmounts the <iframe> element in the DOM (no React key churning).
 * 2. Uses WebContainer's postMessage reload protocol first (LOCALSERVICE_RELOAD_WINDOW).
 * 3. Gracefully falls back to browser navigation via iframe.src if the preview window
 *    does not acknowledge or is hung.
 * 4. Strictly prevents overlapping concurrent reload operations (debounced in-flight lock).
 * 5. NEVER restarts the WebContainer dev server, spawns new processes, or calls npm install.
 */

export interface PreviewReloadOptions {
  /** The current development server URL (e.g. https://...local-credentialless.webcontainer-api.io/) */
  serverUrl?: string;
  /** Timeout in ms to wait for the WebContainer preview client to acknowledge in-window reload (default: 350ms) */
  timeoutMs?: number;
}

export interface PreviewReloadResult {
  success: boolean;
  method: 'postMessage' | 'navigation' | 'skipped';
  error?: string;
  durationMs: number;
}

export interface PreviewReloadStats {
  totalReloads: number;
  postMessageSuccesses: number;
  navigationFallbacks: number;
  skippedConcurrent: number;
  serverRestartCount: number;
  npmInstallCount: number;
}

class PreviewReloadService {
  private activeReloads = new WeakSet<HTMLIFrameElement>();
  private isGlobalReloadInFlight = false;
  private stats: PreviewReloadStats = {
    totalReloads: 0,
    postMessageSuccesses: 0,
    navigationFallbacks: 0,
    skippedConcurrent: 0,
    serverRestartCount: 0,
    npmInstallCount: 0,
  };

  /**
   * Returns telemetry stats for audit assertions.
   */
  public getStats(): Readonly<PreviewReloadStats> {
    return { ...this.stats };
  }

  /**
   * Resets telemetry stats for testing.
   */
  public resetStats(): void {
    this.stats = {
      totalReloads: 0,
      postMessageSuccesses: 0,
      navigationFallbacks: 0,
      skippedConcurrent: 0,
      serverRestartCount: 0,
      npmInstallCount: 0,
    };
  }

  /**
   * Checks whether a reload is currently in progress.
   */
  public isReloading(iframe?: HTMLIFrameElement | null): boolean {
    if (!iframe) return this.isGlobalReloadInFlight;
    return this.activeReloads.has(iframe) || this.isGlobalReloadInFlight;
  }

  /**
   * Reliably reloads the given preview iframe without destroying the DOM element.
   */
  public async reloadPreview(
    iframe: HTMLIFrameElement | null,
    options: PreviewReloadOptions = {},
  ): Promise<PreviewReloadResult> {
    const startTime = performance.now();

    if (!iframe) {
      return {
        success: false,
        method: 'skipped',
        error: 'No preview iframe reference provided',
        durationMs: 0,
      };
    }

    // Concurrency protection: ignore rapid duplicate clicks while a reload is active
    if (this.activeReloads.has(iframe) || this.isGlobalReloadInFlight) {
      this.stats.skippedConcurrent++;
      return {
        success: false,
        method: 'skipped',
        error: 'A preview reload is already in flight',
        durationMs: performance.now() - startTime,
      };
    }

    this.activeReloads.add(iframe);
    this.isGlobalReloadInFlight = true;
    this.stats.totalReloads++;

    const timeoutMs = options.timeoutMs ?? 350;
    const targetUrl = options.serverUrl || iframe.src;

    try {
      // Tier 1: Try WebContainer in-window reload protocol via MessageChannel postMessage
      const postMessageSuccess = await this.attemptPostMessageReload(iframe, timeoutMs);

      if (postMessageSuccess) {
        this.stats.postMessageSuccesses++;
        return {
          success: true,
          method: 'postMessage',
          durationMs: performance.now() - startTime,
        };
      }

      // Tier 2: Graceful fallback to safe navigation reload
      await this.performNavigationReload(iframe, targetUrl);
      this.stats.navigationFallbacks++;
      return {
        success: true,
        method: 'navigation',
        durationMs: performance.now() - startTime,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        method: 'skipped',
        error: errorMsg,
        durationMs: performance.now() - startTime,
      };
    } finally {
      this.activeReloads.delete(iframe);
      // Keep a small buffer (50ms) to prevent debounce flutter
      setTimeout(() => {
        this.isGlobalReloadInFlight = false;
      }, 50);
    }
  }

  /**
   * Attempts to reload via WebContainer's LOCALSERVICE_RELOAD_WINDOW MessageChannel.
   * Standard browser behavior requires port2.start() when using addEventListener.
   */
  private attemptPostMessageReload(
    iframe: HTMLIFrameElement,
    timeoutMs: number,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!iframe.contentWindow) {
        resolve(false);
        return;
      }

      let timer: ReturnType<typeof setTimeout> | null = null;
      let port1: MessagePort | null = null;
      let port2: MessagePort | null = null;

      try {
        const channel = new MessageChannel();
        port1 = channel.port1;
        port2 = channel.port2;
      } catch {
        resolve(false);
        return;
      }

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (port2) {
          try {
            port2.onmessage = null;
            port2.close();
          } catch {
            // Ignored
          }
        }
      };

      timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);

      // Handle response from WebContainer preview client
      port2.onmessage = (event) => {
        const data = event.data;
        if (data && typeof data === 'object' && data.type === 'LOCALSERVICE_WINDOW_RELOADED') {
          cleanup();
          resolve(true);
        }
      };

      // Explicitly start port2 to ensure message delivery across all browsers
      try {
        port2.start();
      } catch {
        // Ignored in runtimes where port2 starts automatically
      }

      // Post message to the iframe
      try {
        iframe.contentWindow.postMessage(
          {
            type: 'LOCALSERVICE_RELOAD_WINDOW',
            callback: port1,
          },
          '*',
          [port1],
        );
      } catch {
        cleanup();
        resolve(false);
      }
    });
  }

  /**
   * Safe browser navigation reload: re-assigns the iframe src without DOM destruction.
   */
  private performNavigationReload(
    iframe: HTMLIFrameElement,
    targetUrl: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;
      const onDone = () => {
        if (!resolved) {
          resolved = true;
          iframe.removeEventListener('load', onDone);
          resolve();
        }
      };

      // Listen for the load event on the existing iframe element
      iframe.addEventListener('load', onDone, { once: true });

      // Safety timeout: resolve even if iframe load event is suppressed by cross-origin security
      setTimeout(onDone, 500);

      // Trigger navigation reload on the stable DOM element
      try {
        if (targetUrl) {
          iframe.src = targetUrl;
        } else {
          const currentSrc = iframe.src;
          iframe.src = currentSrc;
        }
      } catch {
        onDone();
      }
    });
  }
}

export const previewReloadService = new PreviewReloadService();
