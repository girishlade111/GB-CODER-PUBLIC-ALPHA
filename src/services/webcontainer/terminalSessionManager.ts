import { WebContainer, WebContainerProcess } from '@webcontainer/api';

export interface TerminalSessionSummary {
  id: string;
  title: string;
  createdAt: number;
  isPromptReady: boolean;
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
}

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

  public listSessions(): TerminalSessionSummary[] {
    return this.cachedSummaries;
  }

  public getSession(id: string): TerminalSession | undefined {
    return this.sessions.get(id);
  }

  public async getOrCreateSession(
    container: WebContainer,
    options?: { title?: string; cols?: number; rows?: number },
  ): Promise<TerminalSession> {
    if (this.activeSessionId) {
      const active = this.sessions.get(this.activeSessionId);
      if (active) return active;
    }
    const first = this.sessions.values().next().value;
    if (first) {
      this.activeSessionId = first.id;
      return first;
    }
    return this.createSession(container, options);
  }

  public async createSession(
    container: WebContainer,
    options: {
      title?: string;
      cols?: number;
      rows?: number;
      onData?: (data: string) => void;
    } = {},
  ): Promise<TerminalSession> {
    const id = `term-${Date.now()}-${this.nextSessionNumber++}`;
    const title = options.title || `Terminal ${this.sessions.size + 1}`;
    const cols = options.cols || 80;
    const rows = options.rows || 24;

    const process = await container.spawn('jsh', {
      terminal: { cols, rows },
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
    };

    // Pipe process output to buffer and active listeners
    void process.output.pipeTo(
      new WritableStream({
        write: (chunk: string) => {
          outputBuffer.push(chunk);
          if (outputBuffer.length > 500) {
            outputBuffer.shift();
          }

          if (chunk.includes('❯') || /[$#❯]\s*$/.test(chunk)) {
            session.isPromptReady = true;
          }

          dataListeners.forEach((listener) => {
            try {
              listener(chunk);
            } catch {
              // Ignore listener error
            }
          });
        },
      }),
    ).catch(() => {});

    // Handle process exit
    void process.exit.then((exitCode) => {
      console.log(`[TerminalSessionManager] Session ${id} exited with code ${exitCode}`);
      // Notify listeners of process exit
      const exitNotice = `\r\n\x1b[90m[Process completed with exit code ${exitCode}]\x1b[0m\r\n`;
      dataListeners.forEach((l) => {
        try {
          l(exitNotice);
        } catch {
          // Ignored
        }
      });
    }).catch(() => {});

    this.sessions.set(id, session);
    if (!this.activeSessionId) {
      this.activeSessionId = id;
    }

    this.notify();
    return session;
  }

  public writeToSession(id: string, data: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
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
    if (!session) return;
    session.cols = cols;
    session.rows = rows;
    try {
      session.process.resize({ cols, rows });
    } catch {
      // Ignored
    }
  }

  public closeSession(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;

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
    try {
      void session.writer.write('clear\r');
    } catch {
      // Ignored
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

  public teardownAll(): void {
    for (const session of this.sessions.values()) {
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
