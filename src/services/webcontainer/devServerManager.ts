import { terminalSessionManager } from './terminalSessionManager';
import { webcontainerService } from './webcontainerService';

export type DevServerStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface DiscoveredPort {
  port: number;
  url: string;
  projectId?: string | null;
  sessionEpoch?: number;
  discoveredAt: number;
  active: boolean;
}

export interface DevServerState {
  status: DevServerStatus;
  serverUrl: string | null;
  serverPort: number | null;
  command: string | null;
  logs: string[];
  error: string | null;
  startedAt: number | null;
  projectId?: string | null;
  sessionEpoch?: number;
  ports: DiscoveredPort[];
  selectedPort: number | null;
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
    projectId: null,
    sessionEpoch: 0,
    ports: [],
    selectedPort: null,
  };

  private listeners = new Set<() => void>();
  private devSessionId: string | null = null;
  private pendingStopPromise: Promise<boolean> | null = null;
  private portCloseListeners = new Set<(port: number) => void>();

  public getState(): DevServerState {
    return this.state;
  }

  public getDiscoveredPorts(): DiscoveredPort[] {
    return [...this.state.ports];
  }

  public getActivePorts(): DiscoveredPort[] {
    return this.state.ports.filter((p) => p.active);
  }

  public selectPort(port: number): boolean {
    const target = this.state.ports.find((p) => p.port === port && p.active);
    if (!target) {
      return false;
    }
    this.updateState({
      selectedPort: target.port,
      serverPort: target.port,
      serverUrl: target.url,
    });
    try {
      webcontainerService.updateState({
        serverPort: target.port,
        serverUrl: target.url,
      });
    } catch {
      // Ignore in mock or isolated test environments
    }
    return true;
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
  public async start(
    command = 'npm run dev',
    customSessionId?: string,
    targetProjectId?: string | null,
    targetEpoch?: number,
  ): Promise<boolean> {
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

    const boundProject = targetProjectId !== undefined ? targetProjectId : webcontainerService.getActiveProjectId();
    const boundEpoch = targetEpoch !== undefined ? targetEpoch : webcontainerService.getSessionEpoch();

    let sessionId = customSessionId;
    if (!sessionId) {
      // Find or create a terminal session for the dev server (reuse active Terminal 1)
      let session = this.devSessionId ? terminalSessionManager.getSession(this.devSessionId) : undefined;
      if (!session) {
        const activeId = terminalSessionManager.getActiveSessionId();
        if (activeId) {
          session = terminalSessionManager.getSession(activeId);
        }
      }
      if (!session) {
        session = await terminalSessionManager.createSession(container, {
          title: 'Terminal 1',
          projectId: boundProject,
          epoch: boundEpoch,
        });
        terminalSessionManager.setActiveSessionId(session.id);
      }
      sessionId = session.id;
    }

    this.devSessionId = sessionId;

    this.updateState({
      status: 'starting',
      command,
      startedAt: Date.now(),
      error: null,
      projectId: boundProject,
      sessionEpoch: boundEpoch,
    });

    webcontainerService.setDevServerStarting(true, boundEpoch, boundProject ?? undefined);

    // Send command to the session with carriage return for reliable jsh PTY execution
    const cmdPayload = command.endsWith('\r') ? command : `${command.trim()}\r`;
    const dispatched = terminalSessionManager.writeToSession(sessionId, cmdPayload);
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
        const markedPorts = this.state.ports.map((p) => ({ ...p, active: false }));
        this.updateState({
          status: 'stopped',
          serverUrl: null,
          serverPort: null,
          selectedPort: null,
          ports: markedPorts,
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
        const markedPorts = this.state.ports.map((p) => ({ ...p, active: false }));
        this.updateState({
          status: 'stopped',
          serverUrl: null,
          serverPort: null,
          selectedPort: null,
          ports: markedPorts,
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
  public handleServerReady(
    port: number,
    url: string,
    eventProjectId?: string | null,
    eventEpoch?: number,
  ): void {
    // Stale event guards:
    if (
      eventProjectId !== undefined &&
      eventProjectId !== null &&
      this.state.projectId !== null &&
      eventProjectId !== this.state.projectId
    ) {
      console.warn(
        `[DevServerManager] Discarded stale server-ready from project "${eventProjectId}" (active is "${this.state.projectId}")`,
      );
      return;
    }

    if (
      eventEpoch !== undefined &&
      this.state.sessionEpoch !== undefined &&
      this.state.sessionEpoch !== 0 &&
      eventEpoch !== this.state.sessionEpoch
    ) {
      console.warn(
        `[DevServerManager] Discarded server-ready from stale epoch ${eventEpoch} (current is ${this.state.sessionEpoch})`,
      );
      return;
    }

    const boundProject = eventProjectId ?? this.state.projectId;
    const boundEpoch = eventEpoch ?? this.state.sessionEpoch;

    // Filter out ports belonging to older projects or epochs
    const currentPorts = this.state.ports.filter((p) => {
      if (boundProject && p.projectId && p.projectId !== boundProject) return false;
      if (boundEpoch && p.sessionEpoch && p.sessionEpoch !== boundEpoch) return false;
      return true;
    });

    const newPortEntry: DiscoveredPort = {
      port,
      url,
      projectId: boundProject,
      sessionEpoch: boundEpoch,
      discoveredAt: Date.now(),
      active: true,
    };

    const existingIndex = currentPorts.findIndex((p) => p.port === port);
    if (existingIndex >= 0) {
      currentPorts[existingIndex] = newPortEntry;
    } else {
      currentPorts.push(newPortEntry);
    }

    // Determine selected port: keep current selected if still active, otherwise default to incoming port
    const currentSelected = this.state.selectedPort;
    const isCurrentStillActive =
      currentSelected !== null && currentPorts.some((p) => p.port === currentSelected && p.active);
    const selectedPort = isCurrentStillActive ? currentSelected : port;
    const activeEntry = currentPorts.find((p) => p.port === selectedPort) || newPortEntry;

    this.updateState({
      status: 'running',
      serverPort: activeEntry.port,
      serverUrl: activeEntry.url,
      selectedPort: activeEntry.port,
      ports: currentPorts,
      error: null,
      projectId: boundProject,
      sessionEpoch: boundEpoch,
    });
    webcontainerService.setDevServerStarting(false);
  }

  /**
   * Called when a port closes.
   */
  public handlePortClose(
    port: number,
    eventProjectId?: string | null,
    eventEpoch?: number,
  ): void {
    this.portCloseListeners.forEach((l) => {
      try {
        l(port);
      } catch {
        // Ignored
      }
    });

    // Guard against late port close clearing a different project's preview
    if (
      eventProjectId !== undefined &&
      eventProjectId !== null &&
      this.state.projectId !== null &&
      eventProjectId !== this.state.projectId
    ) {
      console.log(
        `[DevServerManager] Discarded late port-close on port ${port} from project "${eventProjectId}" (active is "${this.state.projectId}")`,
      );
      return;
    }

    if (
      eventEpoch !== undefined &&
      this.state.sessionEpoch !== undefined &&
      this.state.sessionEpoch !== 0 &&
      eventEpoch !== this.state.sessionEpoch
    ) {
      console.log(
        `[DevServerManager] Discarded late port-close on port ${port} from epoch ${eventEpoch} (current is ${this.state.sessionEpoch})`,
      );
      return;
    }

    // Mark the closing port as inactive in ports array
    const updatedPorts = this.state.ports.map((p) =>
      p.port === port ? { ...p, active: false } : p,
    );
    const remainingActive = updatedPorts.filter((p) => p.active);

    if (remainingActive.length === 0) {
      this.updateState({
        status: 'stopped',
        serverUrl: null,
        serverPort: null,
        selectedPort: null,
        ports: updatedPorts,
      });
    } else {
      // If the closed port was active/selected, failover to another active port
      if (this.state.serverPort === port || this.state.selectedPort === port) {
        const nextActive = remainingActive[remainingActive.length - 1];
        this.updateState({
          serverPort: nextActive.port,
          serverUrl: nextActive.url,
          selectedPort: nextActive.port,
          ports: updatedPorts,
        });
      } else {
        this.updateState({
          ports: updatedPorts,
        });
      }
    }
  }

  public cleanupStalePorts(currentProjectId?: string | null, currentEpoch?: number): void {
    const filtered = this.state.ports.filter((p) => {
      if (currentProjectId && p.projectId && p.projectId !== currentProjectId) return false;
      if (currentEpoch && p.sessionEpoch && p.sessionEpoch !== currentEpoch) return false;
      return true;
    });
    if (filtered.length !== this.state.ports.length) {
      this.updateState({ ports: filtered });
    }
  }

  public reset(): void {
    this.state = {
      status: 'idle',
      serverUrl: null,
      serverPort: null,
      command: null,
      logs: [],
      error: null,
      startedAt: null,
      projectId: null,
      sessionEpoch: 0,
      ports: [],
      selectedPort: null,
    };
    this.devSessionId = null;
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Ignored
      }
    });
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

  public updateState(patch: Partial<DevServerState>): void {
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
