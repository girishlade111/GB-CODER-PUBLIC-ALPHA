import { terminalSessionManager } from './terminalSessionManager';
import { webcontainerService } from './webcontainerService';

export type DevServerStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface DevServerState {
  status: DevServerStatus;
  serverUrl: string | null;
  serverPort: number | null;
  command: string | null;
  logs: string[];
  error: string | null;
  startedAt: number | null;
}

export class DevServerManager {
  private state: DevServerState = {
    status: 'idle',
    serverUrl: null,
    serverPort: null,
    command: null,
    logs: [],
    error: null,
    startedAt: null,
  };

  private listeners = new Set<() => void>();
  private devSessionId: string | null = null;
  private pendingStopPromise: Promise<boolean> | null = null;
  private portCloseListeners = new Set<(port: number) => void>();

  public getState(): DevServerState {
    return this.state;
  }

  public isRunning(): boolean {
    return this.state.status === 'running' && Boolean(this.state.serverUrl);
  }

  public isStarting(): boolean {
    return this.state.status === 'starting';
  }

  public isStopping(): boolean {
    return this.state.status === 'stopping';
  }

  /**
   * Starts the development server explicitly.
   * Prevents duplicate launches if a server is already starting or running.
   */
  public async start(command = 'npm run dev', customSessionId?: string): Promise<boolean> {
    if (this.state.status === 'running' || this.state.status === 'starting') {
      console.warn('[DevServerManager] Dev server is already active or starting. Ignoring duplicate start.');
      return false;
    }

    if (this.state.status === 'stopping') {
      console.warn('[DevServerManager] Dev server is currently stopping. Waiting before start.');
      await this.stop();
    }

    const container = await webcontainerService.boot();
    if (!container) {
      this.updateState({
        status: 'error',
        error: 'WebContainer is not ready. Please wait for runtime boot.',
      });
      return false;
    }

    let sessionId = customSessionId;
    if (!sessionId) {
      // Find or create a terminal session for the dev server
      let session = terminalSessionManager.getSession(this.devSessionId || '');
      if (!session) {
        session = await terminalSessionManager.createSession(container, {
          title: 'Dev Server',
        });
      }
      sessionId = session.id;
    }

    this.devSessionId = sessionId;

    this.updateState({
      status: 'starting',
      command,
      startedAt: Date.now(),
      error: null,
    });

    webcontainerService.setDevServerStarting(true);

    // Send command to the session
    const dispatched = terminalSessionManager.writeToSession(sessionId, `${command}\n`);
    if (!dispatched) {
      this.updateState({
        status: 'error',
        error: `Failed to write start command to terminal session ${sessionId}`,
      });
      webcontainerService.setDevServerStarting(false);
      return false;
    }

    return true;
  }

  /**
   * Stops the active development server process with verified lifecycle confirmation.
   * Transitions to 'stopping', awaits port closure or prompt confirmation, and
   * transitions to 'stopped' only when shutdown is verified.
   */
  public async stop(timeoutMs = 3000): Promise<boolean> {
    if (this.state.status === 'stopped' || this.state.status === 'idle') {
      return true;
    }

    if (this.pendingStopPromise) {
      return this.pendingStopPromise;
    }

    this.pendingStopPromise = (async () => {
      this.updateState({ status: 'stopping' });

      const targetSessionId = this.devSessionId;
      const targetPort = this.state.serverPort;

      // Send Ctrl+C to terminate the process
      if (targetSessionId) {
        terminalSessionManager.writeToSession(targetSessionId, '\x03\r');
      }
      webcontainerService.stopDevServer();

      // If no port was active, stopping is immediate
      if (!targetPort) {
        this.updateState({
          status: 'stopped',
          serverUrl: null,
          serverPort: null,
          error: null,
        });
        return true;
      }

      // Await actual port closure confirmation within bounded timeout
      let portClosed = false;
      const portPromise = new Promise<void>((resolve) => {
        const handler = (closedPort: number) => {
          if (closedPort === targetPort) {
            portClosed = true;
            this.portCloseListeners.delete(handler);
            resolve();
          }
        };
        this.portCloseListeners.add(handler);
      });

      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(resolve, timeoutMs);
      });

      await Promise.race([portPromise, timeoutPromise]);

      if (portClosed || this.state.serverPort === null) {
        this.updateState({
          status: 'stopped',
          serverUrl: null,
          serverPort: null,
          error: null,
        });
        return true;
      }

      // Port did not close within timeout; record warning and do not falsely mark stopped
      console.warn(`[DevServerManager] Port ${targetPort} did not confirm closure within ${timeoutMs}ms.`);
      this.updateState({
        status: 'error',
        error: `Dev server on port ${targetPort} did not terminate within timeout. Port may still be in use.`,
      });
      return false;
    })().finally(() => {
      this.pendingStopPromise = null;
    });

    return this.pendingStopPromise;
  }

  /**
   * Restarts the development server safely by awaiting confirmed stop first.
   */
  public async restart(command?: string): Promise<boolean> {
    const stopped = await this.stop();
    if (!stopped) {
      console.warn('[DevServerManager] Server did not stop cleanly before restart; attempting fresh launch.');
    }
    await new Promise((r) => setTimeout(r, 200));
    return this.start(command || this.state.command || 'npm run dev');
  }

  /**
   * Called when WebContainer notifies of server-ready event.
   */
  public handleServerReady(port: number, url: string): void {
    this.updateState({
      status: 'running',
      serverPort: port,
      serverUrl: url,
      error: null,
    });
    webcontainerService.setDevServerStarting(false);
  }

  /**
   * Called when a port closes.
   */
  public handlePortClose(port: number): void {
    this.portCloseListeners.forEach((l) => {
      try {
        l(port);
      } catch {
        // Ignored
      }
    });

    if (this.state.serverPort === port || this.state.serverPort === null) {
      this.updateState({
        status: 'stopped',
        serverUrl: null,
        serverPort: null,
      });
    }
  }

  public recordLog(log: string): void {
    const updated = [...this.state.logs, log];
    if (updated.length > 500) updated.shift();
    this.updateState({ logs: updated });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateState(patch: Partial<DevServerState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Ignored
      }
    });
  }
}

export const devServerManager = new DevServerManager();
