import { WebContainer, WebContainerProcess } from '@webcontainer/api';

export type TerminalSessionStatus = 'running' | 'exited' | 'terminated';

export interface TerminalSessionSummary {
  id: string;
  title: string;
  createdAt: number;
  isPromptReady: boolean;
  projectId?: string | null;
  epoch?: number;
  status: TerminalSessionStatus;
  exitCode: number | null;
  cwd?: string;
}

export interface TerminalSession {
  id: string;
  title: string;
  process: WebContainerProcess;
  writer: WritableStreamDefaultWriter<string>;
  dataListeners: Set<(chunk: string) => void>;
  outputBuffer: string[];
  cols: number;
  rows: number;
  createdAt: number;
  isPromptReady: boolean;
  projectId?: string | null;
  epoch?: number;
  status: TerminalSessionStatus;
  exitCode: number | null;
  cwd: string;
  isDisposed: boolean;
}

const MAX_OUTPUT_BUFFER_CHUNKS = 2000;

export class TerminalSessionManager {
  private sessions = new Map<string, TerminalSession>();
  private activeSessionId: string | null = null;
  private splitSessionId: string | null = null;
  private listeners = new Set<() => void>();
  private nextSessionNumber = 1;
  private cachedSummaries: TerminalSessionSummary[] = [];

  public getActiveSessionId(): string | null {
    return this.activeSessionId;
  }

  public setActiveSessionId(id: string | null): void {
    if (this.activeSessionId !== id) {
      this.activeSessionId = id;
      this.notify();
    }
  }

  public getSplitSessionId(): string | null {
    return this.splitSessionId;
  }

  public setSplitSessionId(id: string | null): void {
    if (this.splitSessionId !== id) {
      this.splitSessionId = id;
      this.notify();
    }
  }

  public listSessions(projectId?: string): TerminalSessionSummary[] {
    if (projectId) {
      return this.cachedSummaries.filter(
        (s) => !s.projectId || s.projectId === projectId,
      );
    }
    return this.cachedSummaries;
  }

  public getSession(id: string): TerminalSession | undefined {
    return this.sessions.get(id);
  }

  public getSessionsForProject(projectId: string): TerminalSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.projectId === projectId && !s.isDisposed,
    );
  }

  public async getOrCreateSession(
    container: WebContainer,
    options?: {
      title?: string;
      cols?: number;
      rows?: number;
      projectId?: string | null;
      epoch?: number;
    },
  ): Promise<TerminalSession> {
    if (this.activeSessionId) {
      const active = this.sessions.get(this.activeSessionId);
      if (
        active &&
        !active.isDisposed &&
        (!options?.projectId || active.projectId === options.projectId)
      ) {
        return active;
      }
    }
    const matching = Array.from(this.sessions.values()).find(
      (s) =>
        !s.isDisposed &&
        (!options?.projectId || s.projectId === options.projectId),
    );
    if (matching) {
      this.activeSessionId = matching.id;
      return matching;
    }
    return this.createSession(container, options);
  }

  public async createSession(
    container: WebContainer,
    options: {
      title?: string;
      cols?: number;
      rows?: number;
      projectId?: string | null;
      epoch?: number;
      cwd?: string;
      onData?: (data: string) => void;
    } = {},
  ): Promise<TerminalSession> {
    const id = `term-${Date.now()}-${this.nextSessionNumber++}`;
    const title = options.title || `Terminal ${this.sessions.size + 1}`;
    const cols = options.cols || 80;
    const rows = options.rows || 24;
    const projectId = options.projectId ?? null;
    const epoch = options.epoch ?? 0;
    const cwd = options.cwd || '/';

    const process = await container.spawn('jsh', {
      terminal: { cols, rows },
      cwd,
    });

    const writer = process.input.getWriter();
    const outputBuffer: string[] = [];
    const dataListeners = new Set<(chunk: string) => void>();

    if (options.onData) {
      dataListeners.add(options.onData);
    }

    const session: TerminalSession = {
      id,
      title,
      process,
      writer,
      dataListeners,
      outputBuffer,
      cols,
      rows,
      createdAt: Date.now(),
      isPromptReady: false,
      projectId,
      epoch,
      status: 'running',
      exitCode: null,
      cwd,
      isDisposed: false,
    };

    this.wireProcessStreams(session, process);

    this.sessions.set(id, session);
    if (!this.activeSessionId) {
      this.activeSessionId = id;
    }

    this.notify();
    return session;
  }

  /**
   * Wires a process's output and exit handlers to the terminal session.
   */
  private wireProcessStreams(session: TerminalSession, process: WebContainerProcess): void {
    // Pipe process output to buffer and active listeners
    void process.output
      .pipeTo(
        new WritableStream({
          write: (chunk: string) => {
            session.outputBuffer.push(chunk);
            if (session.outputBuffer.length > MAX_OUTPUT_BUFFER_CHUNKS) {
              session.outputBuffer.splice(
                0,
                session.outputBuffer.length - MAX_OUTPUT_BUFFER_CHUNKS,
              );
            }

            if (chunk.includes('❯') || /[$#❯]\s*$/.test(chunk)) {
              session.isPromptReady = true;
            }

            session.dataListeners.forEach((listener) => {
              try {
                listener(chunk);
              } catch {
                // Ignore listener error
              }
            });
          },
        }),
      )
      .catch(() => {});

    // Handle process exit
    void process.exit
      .then((exitCode) => {
        session.status = 'exited';
        session.exitCode = exitCode;
        this.notify();

        const exitNotice = `\r\n\x1b[90m[Process completed with exit code ${exitCode}]\x1b[0m\r\n`;
        session.outputBuffer.push(exitNotice);
        session.dataListeners.forEach((l) => {
          try {
            l(exitNotice);
          } catch {
            // Ignored
          }
        });
      })
      .catch(() => {
        session.status = 'exited';
        session.exitCode = 1;
        this.notify();
      });
  }

  /**
   * Restarts an existing terminal session by cleanly spawning a new shell process.
   */
  public async restartSession(
    id: string,
    container: WebContainer,
    options?: { cols?: number; rows?: number },
  ): Promise<TerminalSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;

    // Terminate existing process if still running
    try {
      session.writer.releaseLock();
      session.process.kill();
    } catch {
      // Ignored
    }

    const cols = options?.cols || session.cols || 80;
    const rows = options?.rows || session.rows || 24;

    const cwd = session.cwd || '/';

    const newProcess = await container.spawn('jsh', {
      terminal: { cols, rows },
      cwd,
    });

    session.process = newProcess;
    session.writer = newProcess.input.getWriter();
    session.cols = cols;
    session.rows = rows;
    session.status = 'running';
    session.exitCode = null;
    session.isPromptReady = false;
    session.isDisposed = false;

    const restartBanner = '\r\n\x1b[36m[Session restarted]\x1b[0m\r\n';
    session.outputBuffer.push(restartBanner);
    session.dataListeners.forEach((l) => {
      try {
        l(restartBanner);
      } catch {
        // Ignored
      }
    });

    this.wireProcessStreams(session, newProcess);
    this.notify();
    return session;
  }

  public writeToSession(id: string, data: string): boolean {
    const session = this.sessions.get(id);
    if (!session || session.status !== 'running' || session.isDisposed) {
      return false;
    }
    try {
      void session.writer.write(data);
      return true;
    } catch (err) {
      console.error(`[TerminalSessionManager] Write to ${id} failed:`, err);
      return false;
    }
  }

  public resizeSession(id: string, cols: number, rows: number): void {
    const session = this.sessions.get(id);
    if (!session || session.status !== 'running' || session.isDisposed) {
      return;
    }
    session.cols = cols;
    session.rows = rows;
    try {
      session.process.resize({ cols, rows });
    } catch {
      // Process may have already terminated
    }
  }

  public closeSession(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;

    session.status = 'terminated';
    session.isDisposed = true;

    try {
      session.writer.releaseLock();
      session.process.kill();
    } catch {
      // Ignored
    }

    session.dataListeners.clear();
    this.sessions.delete(id);

    if (this.splitSessionId === id) {
      this.splitSessionId = null;
    }

    if (this.activeSessionId === id) {
      const remaining = Array.from(this.sessions.keys());
      this.activeSessionId = remaining.length > 0 ? remaining[0] : null;
    }

    this.notify();
  }

  public renameSession(id: string, newTitle: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    session.title = newTitle.trim() || session.title;
    this.notify();
  }

  public clearSession(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    session.outputBuffer = [];
    if (session.status === 'running' && !session.isDisposed) {
      try {
        void session.writer.write('clear\r');
      } catch {
        // Ignored
      }
    }
  }

  public subscribeSession(id: string, onData: (chunk: string) => void): () => void {
    const session = this.sessions.get(id);
    if (!session) return () => {};

    session.dataListeners.add(onData);

    // Replay buffer
    for (const chunk of session.outputBuffer) {
      try {
        onData(chunk);
      } catch {
        // Ignored
      }
    }

    return () => {
      session.dataListeners.delete(onData);
    };
  }

  public teardownForProject(projectId: string): void {
    for (const [id, session] of Array.from(this.sessions.entries())) {
      if (session.projectId === projectId) {
        session.status = 'terminated';
        session.isDisposed = true;
        try {
          session.writer.releaseLock();
          session.process.kill();
        } catch {
          // Ignored
        }
        session.dataListeners.clear();
        this.sessions.delete(id);
        if (this.activeSessionId === id) this.activeSessionId = null;
        if (this.splitSessionId === id) this.splitSessionId = null;
      }
    }
    if (!this.activeSessionId) {
      const remaining = Array.from(this.sessions.keys());
      this.activeSessionId = remaining.length > 0 ? remaining[0] : null;
    }
    this.notify();
  }

  public teardownAll(): void {
    for (const session of this.sessions.values()) {
      session.status = 'terminated';
      session.isDisposed = true;
      try {
        session.writer.releaseLock();
        session.process.kill();
      } catch {
        // Ignored
      }
      session.dataListeners.clear();
    }
    this.sessions.clear();
    this.activeSessionId = null;
    this.splitSessionId = null;
    this.nextSessionNumber = 1;
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateCachedSummaries(): void {
    this.cachedSummaries = Array.from(this.sessions.values()).map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      isPromptReady: s.isPromptReady,
      projectId: s.projectId,
      epoch: s.epoch,
      status: s.status,
      exitCode: s.exitCode,
      cwd: s.cwd,
    }));
  }

  private notify(): void {
    this.updateCachedSummaries();
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Ignored
      }
    });
  }
}

export const terminalSessionManager = new TerminalSessionManager();
