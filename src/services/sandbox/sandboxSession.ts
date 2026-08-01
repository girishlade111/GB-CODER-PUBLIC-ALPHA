/**
 * Sandbox session — client half of the stateless E2B proxy.
 *
 * Lives in the lazily-loaded full-stack chunk, so none of this (nor the E2B
 * vocabulary it carries) reaches users who never open a full-stack project.
 *
 * Mirrors the store shape used elsewhere in the app (subscribe + getState, read
 * through `useSyncExternalStore`) so it behaves like the voice service rather
 * than inventing a third state pattern.
 *
 * The API key never leaves the browser except in the body of a request to our own
 * proxy, and is stored only in localStorage under `gbcoder_e2b_key`.
 */
import {
  SandboxTerminalSession,
  SandboxTerminalStatus,
  sandboxTerminal,
} from '../sandboxTerminal';

/** localStorage key holding the user's own E2B API key. */
export const E2B_KEY_STORAGE = 'gbcoder_e2b_key';

export type SandboxStatus =
  | 'idle'
  | 'creating'
  | 'installing'
  | 'ready'
  | 'starting'
  | 'running'
  | 'error'
  | 'closed';

export interface SandboxPreview {
  port: number;
  label: string;
  url: string;
}

export interface StartCandidate {
  id: string;
  kind: 'node' | 'python';
  label: string;
  command: string;
  port?: number;
}

export interface SandboxLogLine {
  stream: 'stdout' | 'stderr' | 'system';
  text: string;
  at: number;
}

export interface SandboxState {
  status: SandboxStatus;
  sandboxId: string | null;
  /** Steps reported by the proxy, so the UI can show install progress. */
  install: { label: string; command: string; exitCode: number | null; failed?: boolean }[];
  startCandidates: StartCandidate[];
  /** Command actually running, once started. */
  runningCommand: string | null;
  previews: SandboxPreview[];
  activePort: number | null;
  /**
   * True only once the backend has confirmed a dev-server process is actually
   * alive inside the sandbox (the `running` probe on /logs). Deliberately not
   * inferred from "a start command was issued": a command that crashes on boot
   * would otherwise leave the UI offering a live preview that cannot load.
   */
  devServerRunning: boolean;
  /** Ports the backend observed listening, as opposed to ones we guessed. */
  detectedPorts: number[];
  logs: SandboxLogLine[];
  error: string | null;
  packageManager: string | null;
  pythonTooling: string | null;
  isMixedStack: boolean;
  /** True while any request is in flight. */
  isBusy: boolean;
}

const MAX_LOG_LINES = 500;
/** Consecutive failed log polls tolerated before giving up. */
const MAX_POLL_FAILURES = 4;

const INITIAL: SandboxState = {
  status: 'idle',
  sandboxId: null,
  install: [],
  startCandidates: [],
  runningCommand: null,
  previews: [],
  activePort: null,
  devServerRunning: false,
  detectedPorts: [],
  logs: [],
  error: null,
  packageManager: null,
  pythonTooling: null,
  isMixedStack: false,
  isBusy: false,
};

export interface SandboxFile {
  path: string;
  content: string;
}

/** Reads the stored key. Returns '' when absent. */
export const readStoredKey = (): string => {
  try {
    return window.localStorage.getItem(E2B_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
};

export const storeKey = (key: string): void => {
  try {
    if (key) window.localStorage.setItem(E2B_KEY_STORAGE, key);
    else window.localStorage.removeItem(E2B_KEY_STORAGE);
  } catch {
    // Private browsing: the session still works, it just will not be remembered.
  }
};

class SandboxSession {
  private state: SandboxState = INITIAL;
  private readonly listeners = new Set<(state: SandboxState) => void>();
  /** Byte offset into the dev-server log file, for incremental polling. */
  private logOffset = 0;
  private pollFailures = 0;
  private logTimer: ReturnType<typeof setInterval> | null = null;
  private logPath: string | null = null;
  /** Files last uploaded, so Restart can rebuild without asking again. */
  private lastFiles: SandboxFile[] = [];

  public getState = (): SandboxState => this.state;

  public subscribe = (listener: (state: SandboxState) => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(partial: Partial<SandboxState>) {
    // New object per update: `useSyncExternalStore` compares by reference.
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  private appendLogs(lines: SandboxLogLine[]) {
    if (lines.length === 0) return;
    const next = [...this.state.logs, ...lines];
    this.setState({ logs: next.length > MAX_LOG_LINES ? next.slice(-MAX_LOG_LINES) : next });
  }

  private log(stream: SandboxLogLine['stream'], text: string) {
    this.appendLogs([{ stream, text, at: Date.now() }]);
  }

  /** POSTs to the proxy, always including the key from local storage. */
  private async post<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
    const apiKey = readStoredKey();
    if (!apiKey) throw new Error('Add your E2B API key first.');

    const response = await fetch(`/api/sandbox/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, e2bApiKey: apiKey }),
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      throw new Error(`The sandbox proxy returned an unreadable response (${response.status}).`);
    }

    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error)
          : `Sandbox request failed (${response.status}).`;
      throw new Error(message);
    }

    return data as T;
  }

  /**
   * Provisions a sandbox: uploads files and installs dependencies.
   *
   * Does not start anything — `start()` is a separate step because the proxy
   * returns candidates for the user to choose between.
   */
  public async create(files: SandboxFile[]): Promise<void> {
    if (this.state.isBusy) return;
    this.lastFiles = files;
    this.setState({
      status: 'creating',
      isBusy: true,
      error: null,
      logs: [],
      previews: [],
      activePort: null,
      runningCommand: null,
    });
    this.log('system', 'Creating sandbox…');

    try {
      const result = await this.post<{
        sandboxId: string;
        install: SandboxState['install'];
        startCandidates: StartCandidate[];
        packageManager: string | null;
        pythonTooling: string | null;
        isMixedStack: boolean;
        logs: SandboxLogLine[];
      }>('create', { files, detectedStack: 'fullstack' });

      this.appendLogs(result.logs ?? []);
      this.setState({
        status: 'ready',
        sandboxId: result.sandboxId,
        install: result.install ?? [],
        startCandidates: result.startCandidates ?? [],
        packageManager: result.packageManager,
        pythonTooling: result.pythonTooling,
        isMixedStack: Boolean(result.isMixedStack),
        isBusy: false,
      });

      // The terminal can attach as soon as the sandbox exists.
      this.attachTerminal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sandbox creation failed.';
      this.log('stderr', message);
      this.setState({ status: 'error', error: message, isBusy: false });
    }
  }

  /** Runs a chosen start command and collects preview URLs. */
  public async start(command: string): Promise<void> {
    if (!this.state.sandboxId || this.state.isBusy) return;
    this.setState({ status: 'starting', isBusy: true, error: null });
    this.log('system', `Starting: ${command}`);

    try {
      const result = await this.post<{
        previews: SandboxPreview[];
        /** Ports the backend observed listening, as opposed to ones we guessed. */
        detectedPorts?: number[];
        logPath: string;
        logs: SandboxLogLine[];
      }>('start', {
        sandboxId: this.state.sandboxId,
        command,
        ports: this.state.startCandidates.map((candidate) => candidate.port).filter(Boolean),
        startCandidates: this.state.startCandidates,
      });

      this.appendLogs(result.logs ?? []);
      this.logPath = result.logPath ?? null;
      this.logOffset = 0;

      const previews = result.previews ?? [];
      this.setState({
        status: 'running',
        runningCommand: command,
        previews,
        // Default to the first preview; the UI offers a selector when several.
        activePort: previews[0]?.port ?? null,
        detectedPorts: result.detectedPorts ?? [],
        /*
         * A port that is already listening is the strongest signal available at
         * this point. If nothing bound yet the log poll will flip this as soon as
         * the process appears, so a slow-booting server still enables the toggle.
         */
        devServerRunning: previews.length > 0,
        isBusy: false,
      });

      this.startLogPolling();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start the project.';
      this.log('stderr', message);
      this.setState({ status: 'error', error: message, isBusy: false });
    }
  }

  public selectPort(port: number): void {
    if (!this.state.previews.some((preview) => preview.port === port)) return;
    this.setState({ activePort: port });
  }

  /**
   * Polls for new dev-server output.
   *
   * Polling rather than streaming: the proxy runs as serverless functions, which
   * have no persistent connection to stream over. `/start` redirects output to a
   * file and this reads forward from the last byte offset.
   */
  private startLogPolling(): void {
    this.stopLogPolling();
    this.pollFailures = 0;
    this.logTimer = setInterval(() => {
      void this.pollLogs();
    }, 2500);
  }

  private stopLogPolling(): void {
    if (this.logTimer !== null) {
      clearInterval(this.logTimer);
      this.logTimer = null;
    }
  }

  public async pollLogs(): Promise<void> {
    if (!this.state.sandboxId || !this.logPath) return;
    try {
      const result = await this.post<{
        chunk: string;
        offset: number;
        truncated: boolean;
        /** Liveness probe from the backend; drives the Dev Server toggle. */
        running?: boolean;
      }>('logs', {
        sandboxId: this.state.sandboxId,
        logPath: this.logPath,
        offset: this.logOffset,
      });

      if (result.truncated) this.log('system', 'Log file was rotated; continuing from the start.');
      this.logOffset = result.offset ?? this.logOffset;
      this.pollFailures = 0;

      /*
       * Reconcile liveness. Without this the UI keeps offering a dev-server
       * preview after the process has died, which is the confusing case: the
       * iframe just fails to load with no explanation.
       */
      if (typeof result.running === 'boolean' && result.running !== this.state.devServerRunning) {
        if (!result.running) this.log('system', 'Dev server process is no longer running.');
        this.setState({ devServerRunning: result.running });
      }

      if (result.chunk) {
        const lines = result.chunk
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .map((line) => ({ stream: 'stdout' as const, text: line, at: Date.now() }));
        this.appendLogs(lines);
      }
    } catch {
      /*
       * One failed poll is not worth surfacing — the next tick usually succeeds,
       * and an error line every 2.5s would be worse than silence. But giving up
       * after a single failure (the previous behaviour) meant one transient blip
       * silently froze the log pane for the rest of the session, so allow a few.
       */
      this.pollFailures += 1;
      if (this.pollFailures >= MAX_POLL_FAILURES) {
        this.log('system', 'Stopped polling logs after repeated failures. Restart the sandbox to resume.');
        this.setState({ devServerRunning: false });
        this.stopLogPolling();
      }
    }
  }

  /** Runs one command; used by the terminal. */
  public async exec(command: string, cwd: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    cwd: string;
  }> {
    if (!this.state.sandboxId) throw new Error('No sandbox is connected.');
    return this.post('exec', { sandboxId: this.state.sandboxId, command, cwd });
  }

  /** Closes the sandbox and detaches the terminal. */
  public async close(): Promise<void> {
    this.stopLogPolling();
    const id = this.state.sandboxId;
    sandboxTerminal.setConnector(null);

    if (!id) {
      this.setState({ ...INITIAL, status: 'closed' });
      return;
    }

    this.setState({ isBusy: true });
    try {
      await this.post('close', { sandboxId: id });
      this.log('system', 'Sandbox closed.');
    } catch (error) {
      // Report but still reset: a sandbox we cannot reach is not usable anyway.
      this.log('stderr', error instanceof Error ? error.message : 'Close failed.');
    } finally {
      this.setState({ ...INITIAL, status: 'closed', logs: this.state.logs, isBusy: false });
    }
  }

  /** Closes and re-creates from the same files. */
  public async restart(): Promise<void> {
    const files = this.lastFiles;
    await this.close();
    if (files.length === 0) {
      this.setState({ status: 'error', error: 'Nothing to restart — no files were uploaded.' });
      return;
    }
    await this.create(files);
  }

  /* ── Terminal transport ─────────────────────────────────────────────────
   *
   * Adapts the HTTP exec endpoint onto the connector seam the Terminal tab was
   * built against. It is NOT a PTY: Vercel serverless cannot hold a WebSocket or
   * a live process, so this does its own line editing and sends whole commands.
   * The header and the greeting say so, rather than letting the user discover it
   * when an interactive prompt hangs.
   */
  private attachTerminal(): void {
    sandboxTerminal.setConnector(() => this.createTerminalSession());
  }

  private createTerminalSession(): SandboxTerminalSession {
    const dataListeners = new Set<(chunk: string) => void>();
    const statusListeners = new Set<(status: SandboxTerminalStatus, detail?: string) => void>();
    let status: SandboxTerminalStatus = 'connected';
    let line = '';
    let cwd = '/home/user/project';
    let busy = false;
    const history: string[] = [];
    let historyIndex = -1;

    const emit = (chunk: string) => dataListeners.forEach((listener) => listener(chunk));
    const prompt = () => emit(`\r\n\x1b[36m${cwd.replace('/home/user', '~')}\x1b[0m$ `);

    // Greeting states the transport's limits up front.
    setTimeout(() => {
      emit('\x1b[92mConnected to E2B sandbox.\x1b[0m\r\n');
      emit(
        '\x1b[90mCommands run one at a time over HTTPS, so interactive programs\r\n' +
          '(vim, top, prompts) are not supported. Everything else — npm, pip,\r\n' +
          'python, git, ls — works normally.\x1b[0m\r\n',
      );
      prompt();
    }, 0);

    const submit = async (input: string) => {
      const command = input.trim();
      emit('\r\n');
      if (!command) {
        prompt();
        return;
      }

      if (history[history.length - 1] !== command) history.push(command);
      historyIndex = -1;

      if (command === 'clear') {
        emit('\x1b[2J\x1b[H');
        prompt();
        return;
      }

      busy = true;
      try {
        const result = await this.exec(command, cwd);
        cwd = result.cwd || cwd;
        if (result.stdout) emit(result.stdout.replace(/\n/g, '\r\n'));
        if (result.stderr) emit(`\x1b[91m${result.stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
        if (result.exitCode !== 0 && !result.stderr) {
          emit(`\x1b[90mexit ${result.exitCode}\x1b[0m`);
        }
      } catch (error) {
        emit(`\x1b[91m${error instanceof Error ? error.message : 'Command failed.'}\x1b[0m`);
      } finally {
        busy = false;
        prompt();
      }
    };

    return {
      write: (data: string) => {
        // Keystrokes are handled here because there is no remote line discipline.
        if (busy) return;

        if (data === '\r') {
          const input = line;
          line = '';
          void submit(input);
          return;
        }
        if (data === '\u007f') {
          if (line.length === 0) return;
          line = line.slice(0, -1);
          emit('\b \b');
          return;
        }
        if (data === '\u0003') {
          line = '';
          emit('^C');
          prompt();
          return;
        }
        if (data === '\u001b[A' || data === '\u001b[B') {
          if (history.length === 0) return;
          if (data === '\u001b[A') {
            historyIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          } else {
            if (historyIndex === -1) return;
            historyIndex += 1;
            if (historyIndex >= history.length) historyIndex = -1;
          }
          const recalled = historyIndex === -1 ? '' : history[historyIndex];
          // Clear the line and redraw.
          emit(`\r\x1b[2K\x1b[36m${cwd.replace('/home/user', '~')}\x1b[0m$ ${recalled}`);
          line = recalled;
          return;
        }

        let printable = '';
        for (const character of data) {
          const code = character.codePointAt(0) ?? 0;
          if (code >= 0x20 && code !== 0x7f) printable += character;
        }
        if (!printable) return;
        line += printable;
        emit(printable);
      },
      // No remote TTY to resize; accepted so the interface stays satisfied.
      resize: () => undefined,
      onData: (listener) => {
        dataListeners.add(listener);
        return () => dataListeners.delete(listener);
      },
      onStatusChange: (listener) => {
        statusListeners.add(listener);
        return () => statusListeners.delete(listener);
      },
      getStatus: () => status,
      dispose: () => {
        status = 'closed';
        statusListeners.forEach((listener) => listener('closed'));
        dataListeners.clear();
        statusListeners.clear();
      },
    };
  }
}

export const sandboxSession = new SandboxSession();
