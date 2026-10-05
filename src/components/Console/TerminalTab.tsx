import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Play, RotateCcw, Trash2 } from 'lucide-react';
import { MultiFileProject } from '../../types/files';
import {
  ANSI,
  LocalShellContext,
  ShellPackage,
  ShellPackageError,
  runLocalCommand,
} from '../../services/localShell';
import {
  SandboxTerminalSession,
  SandboxTerminalStatus,
  sandboxTerminal,
} from '../../services/sandboxTerminal';
import {
  webcontainerService,
  WebContainerStatus,
} from '../../services/webcontainer/webcontainerService';

export type TerminalExecutionMode = 'webcontainer' | 'sandbox' | 'local';

interface TerminalTabProps {
  project: MultiFileProject;
  resolvedPackages: ShellPackage[];
  unresolvedPackages: ShellPackageError[];
  isResolvingPackages: boolean;
  /** Terminal is only mounted/fitted while its tab is visible. */
  isActive: boolean;
}

const PROMPT = `${ANSI.brightGreen}gb${ANSI.reset}${ANSI.gray}:${ANSI.reset}${ANSI.brightCyan}~${ANSI.reset}${ANSI.gray}$${ANSI.reset} `;

const FONT_SIZE = 13;
const FONT_FAMILY = 'JetBrains Mono, Menlo, Consolas, "Courier New", monospace';

const TerminalTab: React.FC<TerminalTabProps> = ({
  project,
  resolvedPackages,
  unresolvedPackages,
  isResolvingPackages,
  isActive,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  /** Active execution mode */
  const [mode, setMode] = useState<TerminalExecutionMode>(() => {
    if (webcontainerService.isSupported()) return 'webcontainer';
    if (sandboxTerminal.isAvailable()) return 'sandbox';
    return 'local';
  });

  const [webcontainerStatus, setWebcontainerStatus] = useState<WebContainerStatus>(
    () => webcontainerService.getState().status,
  );
  const webcontainerShellRef = useRef<{
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
  } | null>(null);

  /** Current input line and cursor offset within it (Local mode only). */
  const lineRef = useRef('');
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const sessionRef = useRef<SandboxTerminalSession | null>(null);
  const [sandboxAvailable, setSandboxAvailable] = useState(sandboxTerminal.isAvailable());
  const [termReady, setTermReady] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState<SandboxTerminalStatus>('idle');

  const projectRef = useRef(project);
  projectRef.current = project;
  const isStartingShellRef = useRef(false);

  const contextRef = useRef<LocalShellContext>({
    project,
    resolvedPackages,
    unresolvedPackages,
    isResolvingPackages,
    history: [],
  });
  contextRef.current = {
    project,
    resolvedPackages,
    unresolvedPackages,
    isResolvingPackages,
    history: historyRef.current,
  };

  const isWebContainerSupported = webcontainerService.isSupported();

  const writePrompt = useCallback((term: XTerm) => {
    term.write(`\r\n${PROMPT}`);
  }, []);

  const redrawLine = useCallback((term: XTerm) => {
    term.write(`\r\x1b[2K${PROMPT}${lineRef.current}`);
    const back = lineRef.current.length - cursorRef.current;
    if (back > 0) term.write(`\x1b[${back}D`);
  }, []);

  const submitLocal = useCallback(
    (term: XTerm, input: string) => {
      const trimmed = input.trim();
      term.write('\r\n');

      if (trimmed.length > 0) {
        if (historyRef.current[historyRef.current.length - 1] !== trimmed) {
          historyRef.current = [...historyRef.current, trimmed].slice(-200);
        }
      }

      if (trimmed.length === 0) {
        term.write(PROMPT);
        return;
      }

      const result = runLocalCommand(trimmed, contextRef.current);

      if (result.clear) {
        term.clear();
        term.write(`\x1b[2K\r${PROMPT}`);
        return;
      }

      for (const line of result.output) term.write(`${line}\r\n`);
      term.write(PROMPT);
    },
    [],
  );

  /** Fits the grid to the container, and mirrors the size to live PTY sessions. */
  const fit = useCallback(() => {
    const term = termRef.current;
    const fitAddon = fitAddonRef.current;
    if (!term || !fitAddon || !hostRef.current) return;

    try {
      fitAddon.fit();
      sessionRef.current?.resize(term.cols, term.rows);
      webcontainerShellRef.current?.resize(term.cols, term.rows);
    } catch {
      // Fit error on zero dimension container is safe to ignore
    }
  }, []);

  /** Spawns or reconnects WebContainer interactive PTY shell */
  const startWebContainerShell = useCallback(async (forceRestart = false) => {
    const term = termRef.current;
    if (!term) return;

    if (isStartingShellRef.current) return;
    if (!forceRestart && webcontainerShellRef.current) {
      return;
    }

    isStartingShellRef.current = true;
    try {
      term.write(
        `\r\n${ANSI.brightGreen}⚡ Booting WebContainer (In-Browser Node.js runtime)...${ANSI.reset}\r\n`,
      );
      setWebcontainerStatus('booting');

      const currentProj = projectRef.current;

      // Mount project files into virtual filesystem with guaranteed package.json
      await webcontainerService.mountProject(
        currentProj.files,
        currentProj.dependencies,
        currentProj.projectType,
      );

      term.write(
        `${ANSI.gray}Files mounted into virtual filesystem. Starting interactive shell...${ANSI.reset}\r\n`,
      );

      // Spawn interactive shell
      const shell = await webcontainerService.spawnInteractiveShell({
        cols: term.cols || 80,
        rows: term.rows || 24,
        onData: (chunk) => {
          term.write(chunk);
        },
      });

      webcontainerShellRef.current = shell;
      setWebcontainerStatus('running');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      term.write(`\r\n${ANSI.red}✖ Failed to start WebContainer: ${msg}${ANSI.reset}\r\n`);
      setWebcontainerStatus('error');
    } finally {
      isStartingShellRef.current = false;
    }
  }, []);

  /** Creates the terminal once, then wires input handling. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || termRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      convertEol: false,
      scrollback: 3000,
      theme: {
        background: '#181715',
        foreground: '#faf9f5',
        cursor: '#cc785c',
        selectionBackground: '#3a3631',
        black: '#252320',
        red: '#c64545',
        green: '#5db872',
        yellow: '#d4a017',
        blue: '#8fa9c4',
        magenta: '#d09a7c',
        cyan: '#5db8a6',
        white: '#faf9f5',
        brightBlack: '#8e8b82',
        brightRed: '#e07070',
        brightGreen: '#7fcf92',
        brightYellow: '#e8b544',
        brightBlue: '#adc4d8',
        brightMagenta: '#e8b89c',
        brightCyan: '#8ad4c4',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    term.open(host);
    termRef.current = term;
    setTermReady(true);

    const disposable = term.onData((data: string) => {
      // 1. WebContainer Mode: pass raw data to in-browser PTY
      if (mode === 'webcontainer' && webcontainerShellRef.current) {
        webcontainerShellRef.current.write(data);
        return;
      }

      // 2. Sandbox Mode: pass raw data to remote sandbox PTY
      const session = sessionRef.current;
      if (mode === 'sandbox' && session && session.getStatus() === 'connected') {
        session.write(data);
        return;
      }

      // 3. Local Mode: simulated line editor
      if (data === '\u0003') {
        term.write('^C');
        lineRef.current = '';
        cursorRef.current = 0;
        historyIndexRef.current = -1;
        writePrompt(term);
        return;
      }

      if (data === '\u000c') {
        term.clear();
        term.write(`\x1b[2K\r${PROMPT}${lineRef.current}`);
        return;
      }

      switch (data) {
        case '\r': {
          const input = lineRef.current;
          lineRef.current = '';
          cursorRef.current = 0;
          historyIndexRef.current = -1;
          submitLocal(term, input);
          return;
        }
        case '\u007f': {
          if (cursorRef.current === 0) return;
          lineRef.current =
            lineRef.current.slice(0, cursorRef.current - 1) +
            lineRef.current.slice(cursorRef.current);
          cursorRef.current -= 1;
          redrawLine(term);
          return;
        }
        case '\u001b[A': {
          if (historyRef.current.length === 0) return;
          historyIndexRef.current =
            historyIndexRef.current === -1
              ? historyRef.current.length - 1
              : Math.max(0, historyIndexRef.current - 1);
          lineRef.current = historyRef.current[historyIndexRef.current] ?? '';
          cursorRef.current = lineRef.current.length;
          redrawLine(term);
          return;
        }
        case '\u001b[B': {
          if (historyIndexRef.current === -1) return;
          historyIndexRef.current += 1;
          if (historyIndexRef.current >= historyRef.current.length) {
            historyIndexRef.current = -1;
            lineRef.current = '';
          } else {
            lineRef.current = historyRef.current[historyIndexRef.current] ?? '';
          }
          cursorRef.current = lineRef.current.length;
          redrawLine(term);
          return;
        }
        case '\u001b[C': {
          if (cursorRef.current >= lineRef.current.length) return;
          cursorRef.current += 1;
          term.write('\x1b[C');
          return;
        }
        case '\u001b[D': {
          if (cursorRef.current === 0) return;
          cursorRef.current -= 1;
          term.write('\x1b[D');
          return;
        }
        default:
          break;
      }

      let printable = '';
      for (const character of data) {
        const code = character.codePointAt(0) ?? 0;
        if (code >= 0x20 && code !== 0x7f) printable += character;
      }
      if (!printable) return;

      lineRef.current =
        lineRef.current.slice(0, cursorRef.current) +
        printable +
        lineRef.current.slice(cursorRef.current);
      cursorRef.current += printable.length;

      if (cursorRef.current === lineRef.current.length) term.write(printable);
      else redrawLine(term);
    });

    return () => {
      disposable.dispose();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
      setTermReady(false);
    };
  }, [mode, redrawLine, submitLocal, writePrompt]);

  // Setup WebContainer subscription
  useEffect(() => {
    return webcontainerService.subscribe(() => {
      setWebcontainerStatus(webcontainerService.getState().status);
    });
  }, []);

  // Mode change effect: boot WebContainer or local prompt
  useEffect(() => {
    const term = termRef.current;
    if (!term || !termReady) return;

    if (mode === 'webcontainer') {
      if (webcontainerService.isSupported()) {
        void startWebContainerShell();
      } else {
        term.write(
          `\r\n${ANSI.yellow}⚠ WebContainers require Cross-Origin Isolation headers. Falling back to Local mode.${ANSI.reset}\r\n`,
        );
        setMode('local');
      }
    } else if (mode === 'local') {
      webcontainerShellRef.current?.kill();
      webcontainerShellRef.current = null;
      term.write(
        [
          '',
          `${ANSI.bold}GB Coder Terminal${ANSI.reset} ${ANSI.gray}— Local Simulated Shell${ANSI.reset}`,
          `${ANSI.gray}Type ${ANSI.brightCyan}help${ANSI.reset}${ANSI.gray} for available commands or switch to WebContainer.${ANSI.reset}`,
          '',
        ].join('\r\n'),
      );
      term.write(PROMPT);
    }
  }, [mode, termReady, startWebContainerShell]);

  // ResizeObserver for terminal fitting
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(host);
    return () => observer.disconnect();
  }, [fit]);

  // Refit when tab becomes active
  useEffect(() => {
    if (!isActive) return;
    const frame = requestAnimationFrame(() => {
      fit();
      termRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive, fit]);

  // Track sandbox availability
  useEffect(() => sandboxTerminal.subscribe(setSandboxAvailable), []);

  // Sandbox connection effect
  useEffect(() => {
    const term = termRef.current;
    if (mode !== 'sandbox' || !sandboxAvailable || !termReady || !term) return;

    const session = sandboxTerminal.connect({ cols: term.cols, rows: term.rows });
    if (!session) return;

    sessionRef.current = session;
    setSandboxStatus(session.getStatus());

    const offData = session.onData((chunk) => term.write(chunk));
    const offStatus = session.onStatusChange((status, detail) => {
      setSandboxStatus(status);
      if (status === 'connected') {
        term.write(`\r\n${ANSI.brightGreen}● Connected to Sandbox${ANSI.reset}\r\n`);
      } else if (status === 'error' || status === 'closed') {
        term.write(
          `\r\n${ANSI.yellow}● Sandbox session ${status}${detail ? `: ${detail}` : ''}.${ANSI.reset}\r\n`,
        );
      }
    });

    return () => {
      offData();
      offStatus();
      session.dispose();
      sessionRef.current = null;
      setSandboxStatus('idle');
    };
  }, [mode, sandboxAvailable, termReady]);

  // Helper to send shortcut commands
  const sendCommand = useCallback(
    (cmd: string) => {
      const term = termRef.current;
      if (!term) return;

      if (mode === 'webcontainer' && webcontainerShellRef.current) {
        webcontainerShellRef.current.write(`${cmd}\n`);
      } else if (mode === 'sandbox' && sessionRef.current) {
        sessionRef.current.write(`${cmd}\n`);
      } else {
        submitLocal(term, cmd);
      }
    },
    [mode, submitLocal],
  );

  const handleQuickNpmInstall = useCallback(async () => {
    if (mode === 'webcontainer') {
      const currentProj = projectRef.current;
      await webcontainerService.mountProject(
        currentProj.files,
        currentProj.dependencies,
        currentProj.projectType,
      );
      if (!webcontainerShellRef.current) {
        await startWebContainerShell();
      }
      sendCommand('npm install');
    } else {
      sendCommand('npm install');
    }
  }, [mode, startWebContainerShell, sendCommand]);

  const clearTerminal = () => {
    termRef.current?.clear();
    if (mode === 'local' && termRef.current) {
      termRef.current.write(`\x1b[2K\r${PROMPT}`);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-product">
      {/* Enhanced StackBlitz Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-stroke-dark bg-product-soft flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'webcontainer'
                  ? webcontainerStatus === 'running'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400 animate-pulse'
                  : mode === 'sandbox' && sandboxStatus === 'connected'
                    ? 'bg-teal-400'
                    : 'bg-gray-400'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-content-on-dark flex items-center gap-1">
              {mode === 'webcontainer' && '⚡ WebContainer (In-Browser)'}
              {mode === 'sandbox' && '☁️ Cloud Sandbox (E2B)'}
              {mode === 'local' && '💻 Local Simulated Shell'}
            </span>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-product border border-stroke-dark rounded-md p-0.5 text-[10px]">
            {isWebContainerSupported && (
              <button
                onClick={() => setMode('webcontainer')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  mode === 'webcontainer'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-content-on-dark-soft hover:text-white'
                }`}
                title="Zero-cost in-browser Node.js runtime powered by WebAssembly"
              >
                WebContainer
              </button>
            )}
            {sandboxAvailable && (
              <button
                onClick={() => setMode('sandbox')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  mode === 'sandbox'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-content-on-dark-soft hover:text-white'
                }`}
                title="E2B Cloud Sandbox for Python and containerized backends"
              >
                Cloud E2B
              </button>
            )}
            <button
              onClick={() => setMode('local')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                mode === 'local'
                  ? 'bg-neutral-700 text-white shadow-sm'
                  : 'text-content-on-dark-soft hover:text-white'
              }`}
              title="Built-in simulated lightweight shell"
            >
              Local
            </button>
          </div>
        </div>

        {/* Quick Dev Action Buttons */}
        <div className="flex items-center gap-1.5">
          {mode === 'webcontainer' && (
            <>
              <button
                onClick={() => void handleQuickNpmInstall()}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-product hover:bg-product-active text-content-on-dark border border-stroke-dark transition-colors"
                title="Run 'npm install' in WebContainer"
              >
                <Play className="h-2.5 w-2.5 text-emerald-400" />
                npm i
              </button>
              <button
                onClick={() => sendCommand('npm run dev')}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-accent/20 hover:bg-accent/30 text-accent-light border border-accent/30 transition-colors"
                title="Run 'npm run dev' to start live server"
              >
                <Play className="h-2.5 w-2.5 text-accent" />
                npm run dev
              </button>
              <button
                onClick={() => void startWebContainerShell(true)}
                className="p-1 rounded text-content-on-dark-soft hover:text-content-on-dark hover:bg-product"
                title="Restart WebContainer Shell"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </>
          )}

          <button
            onClick={clearTerminal}
            className="p-1 rounded text-content-on-dark-soft hover:text-content-on-dark hover:bg-product"
            title="Clear Terminal (Ctrl+L)"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* xterm Container */}
      <div ref={hostRef} className="flex-1 min-h-0 overflow-hidden px-2 py-1" />
    </div>
  );
};

export default TerminalTab;
