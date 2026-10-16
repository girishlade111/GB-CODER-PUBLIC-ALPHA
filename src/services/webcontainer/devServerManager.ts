import { terminalSessionManager } from './terminalSessionManager';
import { webcontainerService } from './webcontainerService';

export type DevServerStatus = 'idle' | 'starting' | 'running' | 'error' | 'stopped';

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

  public getState(): DevServerState {
    return this.state;
  }

  public isRunning(): boolean {
    return this.state.status === 'running' && Boolean(this.state.serverUrl);
  }

  public isStarting(): boolean {
    return this.state.status === 'starting';
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
   * Stops the active development server process.
   */
  public async stop(): Promise<void> {
    if (this.devSessionId) {
      // Send Ctrl+C to terminate the process
      terminalSessionManager.writeToSession(this.devSessionId, '\x03\r');
    }
    webcontainerService.stopDevServer();
    this.updateState({
      status: 'stopped',
      serverUrl: null,
      serverPort: null,
      error: null,
    });
  }

  /**
   * Restarts the development server.
   */
  public async restart(command?: string): Promise<void> {
    await this.stop();
    await new Promise((r) => setTimeout(r, 600));
    await this.start(command || this.state.command || 'npm run dev');
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
    if (this.state.serverPort === port) {
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
