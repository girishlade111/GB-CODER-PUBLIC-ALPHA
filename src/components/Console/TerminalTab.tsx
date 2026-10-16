import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Play, Square, RotateCcw, Trash2, HelpCircle, Plus, Columns, X, TerminalSquare } from 'lucide-react';
import { MultiFileProject } from '../../types/files';
import {
  ANSI,
  LocalShellContext,
  ShellPackage,
  ShellPackageError,
  runLocalCommand,
} from '../../services/localShell';
import {
  webcontainerService,
  type StartupOwner,
} from '../../services/webcontainer/webcontainerService';
import {
  terminalSessionManager,
  type TerminalSessionSummary,
} from '../../services/webcontainer/terminalSessionManager';
import { devServerManager } from '../../services/webcontainer/devServerManager';
import {
  describeWebContainerUnavailableReason,
  getWebContainerUnavailableReason,
} from '../../services/webcontainer/webcontainerSupport';

export type TerminalExecutionMode = 'webcontainer' | 'local';

interface TerminalTabProps {
  project: MultiFileProject;
  resolvedPackages: ShellPackage[];
  unresolvedPackages: ShellPackageError[];
  isResolvingPackages: boolean;
  /** Terminal is only mounted/fitted while its tab is visible. */
  isActive: boolean;
  autoStartProject?: boolean;
  projectId?: string;
}

const PROMPT = `${ANSI.brightGreen}gb${ANSI.reset}${ANSI.gray}:${ANSI.reset}${ANSI.brightCyan}~${ANSI.reset}${ANSI.gray}$${ANSI.reset} `;
const FONT_SIZE = 13;
const FONT_FAMILY = 'JetBrains Mono, Menlo, Consolas, "Courier New", monospace';

function patchXTermDimensions(term: XTerm): void {
  try {
    const core = (term as unknown as {
      _core?: {
        viewport?: {
          _refreshAnimationFrame?: number | null;
          _innerRefresh?: () => void;
          syncScrollArea?: () => void;
        };
        _renderService?: {
          dimensions?: unknown;
          _renderer?: { value?: { dimensions?: unknown } };
        };
      };
    })._core;

    if (core?._renderService) {
      const renderService = core._renderService;
      Object.defineProperty(renderService, 'dimensions', {
        get() {
          return (
            this._renderer?.value?.dimensions ?? {
              css: { cell: { width: 9, height: 17 }, canvas: { width: 0, height: 0 } },
              device: { cell: { width: 9, height: 17 }, canvas: { width: 0, height: 0 } },
            }
          );
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    // Non-fatal safety guard
  }
}

const disposedTerminals = new WeakSet<XTerm>();

/**
 * Hardened xterm disposal.
 * Guarantees idempotent disposal, cancels pending animation frames, and
 * prevents unhandled exceptions during rapid tab switching or container resizing.
 */
function safeDisposeTerminal(term: XTerm | null): void {
  if (!term || disposedTerminals.has(term)) return;
  disposedTerminals.add(term);

  try {
    const core = (term as unknown as {
      _core?: {
        viewport?: {
          _refreshAnimationFrame?: number | null;
          _innerRefresh?: () => void;
          syncScrollArea?: () => void;
        };
      };
    })._core;

    if (core?.viewport) {
      if (core.viewport._refreshAnimationFrame) {
        window.cancelAnimationFrame(core.viewport._refreshAnimationFrame);
        core.viewport._refreshAnimationFrame = null;
      }
      core.viewport._innerRefresh = () => {};
      core.viewport.syncScrollArea = () => {};
    }
  } catch {
    // Non-fatal cleanup guard
  }

  try {
    term.dispose();
  } catch {
    // Non-fatal disposal guard
  }
}

const TerminalTab: React.FC<TerminalTabProps> = ({
  project,
  resolvedPackages,
  unresolvedPackages,
  isResolvingPackages,
  isActive,
  projectId,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const splitHostRef = useRef<HTMLDivElement>(null);
  const splitTermRef = useRef<XTerm | null>(null);
  const splitFitAddonRef = useRef<FitAddon | null>(null);

  /** Active execution mode */
  const [mode, setMode] = useState<TerminalExecutionMode>(() => {
    if (webcontainerService.isSupported()) return 'webcontainer';
    return 'local';
  });

  const [wcState, setWcState] = useState(() => webcontainerService.getState());
  const devServerState = useSyncExternalStore(
    (cb) => devServerManager.subscribe(cb),
    () => devServerManager.getState(),
    () => devServerManager.getState(),
  );

  const sessions = useSyncExternalStore(
    (cb) => terminalSessionManager.subscribe(cb),
    () => terminalSessionManager.listSessions(),
    () => terminalSessionManager.listSessions(),
  );

  const activeSessionId = terminalSessionManager.getActiveSessionId();
  const splitSessionId = terminalSessionManager.getSplitSessionId();

  /** Current input line and cursor offset within it (Local mode only). */
  const lineRef = useRef('');
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const [termReady, setTermReady] = useState(false);
  const projectRef = useRef(project);
  projectRef.current = project;
  const isStartingShellRef = useRef(false);

  const isWebContainerSupported = webcontainerService.isSupported();
  const webContainerUnavailableReason = isWebContainerSupported
    ? null
    : getWebContainerUnavailableReason(wcState.status);
  const webContainerUnavailableMessage = isWebContainerSupported
    ? null
    : describeWebContainerUnavailableReason(webContainerUnavailableReason);

  const fit = useCallback(() => {
    try {
      if (hostRef.current && hostRef.current.clientWidth > 0 && hostRef.current.clientHeight > 0) {
        fitAddonRef.current?.fit();
      }
      if (splitHostRef.current && splitHostRef.current.clientWidth > 0 && splitHostRef.current.clientHeight > 0) {
        splitFitAddonRef.current?.fit();
      }
    } catch {
      // Ignore fit before render
    }
  }, []);

  const redrawLine = useCallback((term: XTerm) => {
    term.write(`\r\x1b[K${PROMPT}${lineRef.current}`);
    const offset = lineRef.current.length - cursorRef.current;
    if (offset > 0) term.write(`\x1b[${offset}D`);
  }, []);

  const writePrompt = useCallback((term: XTerm) => {
    term.write(PROMPT);
  }, []);

  const submitLocal = useCallback(
    (term: XTerm, input: string) => {
      const trimmed = input.trim();
      term.write('\r\n');
      if (trimmed) {
        historyRef.current.push(trimmed);
        const ctx: LocalShellContext = {
          project: projectRef.current,
          resolvedPackages,
          unresolvedPackages,
          isResolvingPackages,
          history: historyRef.current,
        };
        const result = runLocalCommand(trimmed, ctx);
        if (result.output) {
          term.write(`${result.output}\r\n`);
        }
      }
      writePrompt(term);
    },
    [resolvedPackages, unresolvedPackages, isResolvingPackages, writePrompt],
  );

  // Setup WebContainer subscription
  useEffect(() => {
    return webcontainerService.subscribe(() => {
      setWcState(webcontainerService.getState());
    });
  }, []);

  // Attach project scope to webcontainerService
  useEffect(() => {
    const effectiveId = projectId || (project as unknown as { id?: string }).id;
    if (effectiveId) {
      webcontainerService.attachProject(effectiveId);
    }
  }, [projectId, (project as unknown as { id?: string }).id]);

  /** Spawns or connects initial WebContainer interactive PTY shell without auto-running commands */
  const initWebContainerSession = useCallback(async () => {
    if (!isWebContainerSupported || isStartingShellRef.current) return;
    isStartingShellRef.current = true;

    try {
      const container = await webcontainerService.boot();
      const currentProj = projectRef.current;
      const effectiveProjectId = projectId || (currentProj as unknown as { id?: string }).id;

      if (effectiveProjectId) {
        webcontainerService.attachProject(effectiveProjectId);
      }

      if (currentProj.files.length > 0) {
        await webcontainerService.mountProject(
          currentProj.files,
          currentProj.dependencies,
          currentProj.projectType,
          effectiveProjectId,
          webcontainerService.getSessionEpoch(),
        );
      }

      // Check if session already exists
      let session = terminalSessionManager.getSession(terminalSessionManager.getActiveSessionId() || '');
      if (!session) {
        session = await terminalSessionManager.createSession(container, {
          title: 'Terminal 1',
          cols: termRef.current?.cols || 80,
          rows: termRef.current?.rows || 24,
        });
      }

      terminalSessionManager.setActiveSessionId(session.id);
      webcontainerService.setStartupStage('runtime_ready');
    } catch (err) {
      console.error('[TerminalTab] Session init failed:', err);
    } finally {
      isStartingShellRef.current = false;
    }
  }, [isWebContainerSupported, projectId]);

  // Stable data handler ref to avoid tearing down xterm on render
  const onDataHandlerRef = useRef<(data: string) => void>();
  useEffect(() => {
    onDataHandlerRef.current = (data: string) => {
      if (mode === 'webcontainer') {
        const activeId = terminalSessionManager.getActiveSessionId();
        if (activeId) {
          terminalSessionManager.writeToSession(activeId, data);
        }
        return;
      }

      // Local Mode handling
      const term = termRef.current;
      if (!term) return;

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
    };
  }, [mode, redrawLine, submitLocal, writePrompt]);

  // Primary XTerm setup: only opens when component is active and mounted
  useEffect(() => {
    const host = hostRef.current;
    if (!host || termRef.current || !isActive) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      convertEol: false,
      scrollback: 3000,
      theme: {
        background: '#0c0d14',
        foreground: '#f8fafc',
        cursor: '#818cf8',
        selectionBackground: 'rgba(99, 102, 241, 0.35)',
        black: '#13151f',
        red: '#f43f5e',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#6366f1',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#64748b',
        brightRed: '#fb7185',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#a5b4fc',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    try {
      term.open(host);
      patchXTermDimensions(term);
      termRef.current = term;
      setTermReady(true);
    } catch (err) {
      console.warn('[TerminalTab] term.open deferred:', err);
      safeDisposeTerminal(term);
      return;
    }

    const disposable = term.onData((data: string) => {
      onDataHandlerRef.current?.(data);
    });

    // Replay active session output if available
    const activeId = terminalSessionManager.getActiveSessionId();
    if (activeId) {
      const session = terminalSessionManager.getSession(activeId);
      if (session && session.outputBuffer.length > 0) {
        term.write(session.outputBuffer.join(''));
      }
    }

    return () => {
      disposable.dispose();
      safeDisposeTerminal(term);
      termRef.current = null;
      fitAddonRef.current = null;
      setTermReady(false);
    };
  }, [isActive]);

  // Connect active WebContainer session to primary term
  useEffect(() => {
    const term = termRef.current;
    if (!term || mode !== 'webcontainer' || !activeSessionId || !isActive) return;

    term.clear();
    const session = terminalSessionManager.getSession(activeSessionId);
    if (session && session.outputBuffer.length > 0) {
      term.write(session.outputBuffer.join(''));
    }
    const unsub = terminalSessionManager.subscribeSession(activeSessionId, (chunk) => {
      term.write(chunk);
    });

    if (fitAddonRef.current) {
      requestAnimationFrame(() => {
        try {
          if (hostRef.current && hostRef.current.clientWidth > 0) {
            fitAddonRef.current?.fit();
            terminalSessionManager.resizeSession(activeSessionId, term.cols, term.rows);
          }
        } catch {
          // Ignored
        }
      });
    }

    return () => {
      unsub();
    };
  }, [mode, activeSessionId, isActive]);

  // Split XTerm setup when splitSessionId is set and panel is active
  useEffect(() => {
    const splitHost = splitHostRef.current;
    if (!splitHost || !splitSessionId || splitTermRef.current || !isActive) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      convertEol: false,
      scrollback: 3000,
      theme: {
        background: '#090a0f',
        foreground: '#f8fafc',
        cursor: '#818cf8',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    splitFitAddonRef.current = fitAddon;

    try {
      term.open(splitHost);
      patchXTermDimensions(term);
      splitTermRef.current = term;
    } catch (err) {
      console.warn('[TerminalTab] split term.open deferred:', err);
      safeDisposeTerminal(term);
      return;
    }

    const session = terminalSessionManager.getSession(splitSessionId);
    if (session && session.outputBuffer.length > 0) {
      term.write(session.outputBuffer.join(''));
    }

    const unsubData = terminalSessionManager.subscribeSession(splitSessionId, (chunk) => {
      term.write(chunk);
    });

    const disposable = term.onData((data) => {
      terminalSessionManager.writeToSession(splitSessionId, data);
    });

    requestAnimationFrame(() => {
      try {
        if (splitHostRef.current && splitHostRef.current.clientWidth > 0) {
          fitAddon.fit();
          terminalSessionManager.resizeSession(splitSessionId, term.cols, term.rows);
        }
      } catch {
        // Ignored
      }
    });

    return () => {
      unsubData();
      disposable.dispose();
      safeDisposeTerminal(term);
      splitTermRef.current = null;
      splitFitAddonRef.current = null;
    };
  }, [splitSessionId, isActive]);

  // Mode change effect: boot WebContainer or local prompt
  useEffect(() => {
    const term = termRef.current;
    if (!term || !termReady) return;

    if (mode === 'webcontainer') {
      if (webcontainerService.isSupported()) {
        void initWebContainerSession();
      } else {
        term.write(
          `\r\n${ANSI.yellow}⚠ WebContainers require Cross-Origin Isolation headers. Falling back to Local mode.${ANSI.reset}\r\n`,
        );
        setMode('local');
      }
    } else if (mode === 'local') {
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
  }, [mode, termReady, initWebContainerSession]);

  // Refit when tab becomes active
  useEffect(() => {
    if (!isActive) return;
    const frame = requestAnimationFrame(() => {
      fit();
      termRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive, fit]);

  // Helper to send shortcut commands
  const sendCommand = useCallback(
    (cmd: string) => {
      if (mode === 'webcontainer') {
        const id = activeSessionId || terminalSessionManager.getActiveSessionId();
        if (id) {
          terminalSessionManager.writeToSession(id, `${cmd}\n`);
        }
      } else {
        const term = termRef.current;
        if (term) submitLocal(term, cmd);
      }
    },
    [mode, activeSessionId, submitLocal],
  );

  const handleNewTerminal = async () => {
    try {
      const container = await webcontainerService.boot();
      const newSession = await terminalSessionManager.createSession(container, {
        cols: termRef.current?.cols || 80,
        rows: termRef.current?.rows || 24,
      });
      terminalSessionManager.setActiveSessionId(newSession.id);
    } catch (err) {
      console.error('[TerminalTab] Failed to create terminal session:', err);
    }
  };

  const handleToggleSplit = async () => {
    if (splitSessionId) {
      terminalSessionManager.setSplitSessionId(null);
    } else {
      try {
        const container = await webcontainerService.boot();
        const otherSessions = sessions.filter((s) => s.id !== activeSessionId);
        if (otherSessions.length > 0) {
          terminalSessionManager.setSplitSessionId(otherSessions[0].id);
        } else {
          const split = await terminalSessionManager.createSession(container, {
            title: `Terminal ${sessions.length + 1} (Split)`,
          });
          terminalSessionManager.setSplitSessionId(split.id);
        }
      } catch (err) {
        console.error('[TerminalTab] Failed to toggle split terminal:', err);
      }
    }
    requestAnimationFrame(fit);
  };

  const clearTerminal = () => {
    if (activeSessionId) {
      terminalSessionManager.clearSession(activeSessionId);
    }
    termRef.current?.clear();
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0d0f17] text-slate-300">
      {/* Multi-Terminal Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e2235] bg-[#090a0f] flex-shrink-0 select-none">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          {/* Mode Badge */}
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'webcontainer'
                  ? devServerState.status === 'running'
                    ? 'bg-emerald-400 animate-pulse'
                    : devServerState.status === 'starting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-cyan-400'
                  : 'bg-slate-400'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-white flex items-center gap-1">
              {mode === 'webcontainer' ? 'WebContainer' : 'Local Shell'}
            </span>
          </div>

          {/* Session Tabs */}
          {mode === 'webcontainer' && (
            <div className="flex items-center gap-1 min-w-0">
              {sessions.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => terminalSessionManager.setActiveSessionId(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors shrink-0 ${
                    activeSessionId === s.id
                      ? 'bg-[#1e2235] text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                  data-testid={`terminal-session-tab-${s.id}`}
                >
                  <TerminalSquare className="h-3 w-3 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{s.title || `Terminal ${idx + 1}`}</span>
                  {sessions.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        terminalSessionManager.closeSession(s.id);
                      }}
                      className="ml-0.5 hover:text-rose-400 rounded p-0.5"
                      title="Close terminal session"
                    >
                      <X className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => void handleNewTerminal()}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Create New Terminal Session (+)"
                data-testid="terminal-new-session-btn"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => void handleToggleSplit()}
                className={`p-1 rounded transition-colors ${
                  splitSessionId
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={splitSessionId ? 'Close Split View' : 'Split Terminal Side-by-Side'}
                data-testid="terminal-split-view-btn"
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Dev Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {mode === 'webcontainer' && (
            <>
              <button
                onClick={() => sendCommand('npm install --prefer-offline')}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#161926] hover:bg-[#222638] text-slate-200 border border-[#2a2f45] transition-colors"
                title="Run 'npm install' in active terminal"
                data-testid="terminal-quick-install-btn"
              >
                <Play className="h-2.5 w-2.5 text-emerald-400" />
                npm install
              </button>

              {devServerState.status === 'running' ? (
                <button
                  onClick={() => void devServerManager.stop()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors"
                  title="Stop Development Server"
                  data-testid="terminal-stop-server-btn"
                >
                  <Square className="h-2.5 w-2.5 text-rose-400" />
                  Stop Server
                </button>
              ) : (
                <button
                  onClick={() => void devServerManager.start('npm run dev', activeSessionId || undefined)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 transition-colors"
                  title="Run 'npm run dev' to start development server"
                  data-testid="terminal-start-server-btn"
                >
                  <Play className="h-2.5 w-2.5 text-cyan-400" />
                  npm run dev
                </button>
              )}
            </>
          )}

          <button
            onClick={() => sendCommand('help')}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#161926] hover:bg-[#222638] text-slate-300 border border-[#2a2f45] transition-colors"
            title="Display commands help cheat sheet"
          >
            <HelpCircle className="h-2.5 w-2.5 text-cyan-400" />
            help
          </button>

          <button
            onClick={clearTerminal}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear Terminal (Ctrl+L)"
            data-testid="terminal-clear-btn"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport(s) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Primary Terminal */}
        <div
          ref={hostRef}
          className={`h-full min-h-0 overflow-hidden px-2 py-1 ${
            splitSessionId ? 'w-1/2 border-r border-[#1e2235]' : 'w-full'
          }`}
          data-testid="terminal-primary-viewport"
        />

        {/* Split Terminal Pane */}
        {splitSessionId && (
          <div
            ref={splitHostRef}
            className="w-1/2 h-full min-h-0 overflow-hidden px-2 py-1 bg-[#090a0f]"
            data-testid="terminal-split-viewport"
          />
        )}
      </div>
    </div>
  );
};

export default TerminalTab;
