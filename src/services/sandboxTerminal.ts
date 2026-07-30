/**
 * Sandbox terminal seam.
 *
 * The Terminal tab runs in Local Mode until something registers a connector
 * here. Wiring the actual sandbox (a real PTY proxied over a WebSocket) is a
 * separate piece of work, so this module defines the contract and nothing else.
 *
 * There is deliberately no default connector and no hard-coded URL. The old
 * terminal dialled `ws://localhost:3001` on mount and retried every three
 * seconds forever, which meant the shipped app showed a permanently failing
 * terminal to every user. Absent a registered connector, Local Mode is the
 * honest answer.
 */

export type SandboxTerminalStatus = 'idle' | 'connecting' | 'connected' | 'closed' | 'error';

export interface SandboxTerminalSession {
  /** Sends keystrokes to the remote PTY. */
  write: (data: string) => void;
  /** Informs the PTY of a viewport change. */
  resize: (cols: number, rows: number) => void;
  /** Subscribes to PTY output. Returns an unsubscribe function. */
  onData: (listener: (chunk: string) => void) => () => void;
  /** Subscribes to status changes. Returns an unsubscribe function. */
  onStatusChange: (listener: (status: SandboxTerminalStatus, detail?: string) => void) => () => void;
  /** Current status, for the header indicator. */
  getStatus: () => SandboxTerminalStatus;
  /** Tears the session down. */
  dispose: () => void;
}

export interface SandboxTerminalConnectOptions {
  cols: number;
  rows: number;
}

/** Opens a PTY session against the active sandbox. */
export type SandboxTerminalConnector = (
  options: SandboxTerminalConnectOptions,
) => SandboxTerminalSession;

type AvailabilityListener = (available: boolean) => void;

class SandboxTerminalRegistry {
  private connector: SandboxTerminalConnector | null = null;
  private readonly listeners = new Set<AvailabilityListener>();

  /**
   * Registers the sandbox transport. Passing `null` returns the terminal to
   * Local Mode, which is what should happen when a sandbox is torn down.
   */
  public setConnector(connector: SandboxTerminalConnector | null): void {
    if (this.connector === connector) return;
    this.connector = connector;
    this.listeners.forEach((listener) => listener(connector !== null));
  }

  public isAvailable(): boolean {
    return this.connector !== null;
  }

  public connect(options: SandboxTerminalConnectOptions): SandboxTerminalSession | null {
    return this.connector ? this.connector(options) : null;
  }

  /** Notifies subscribers when a sandbox attaches or detaches. */
  public subscribe(listener: AvailabilityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const sandboxTerminal = new SandboxTerminalRegistry();
