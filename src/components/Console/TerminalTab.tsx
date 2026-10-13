import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Play, RotateCcw, Trash2, HelpCircle } from 'lucide-react';
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
  WebContainerStatus,
} from '../../services/webcontainer/webcontainerService';
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
  autoStartProject = true,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const hasAutoStartedRef = useRef(false);
  const pendingFingerprintRef = useRef<string | null>(null);
  const restartDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRestartReasonRef = useRef<string | null>(null);
  const isShellPromptReadyRef = useRef(false);
  const pendingAutoStartCmdRef = useRef<{
    cmd: string;
    epoch: number;
    termMessage?: string;
  } | null>(null);
  const shellPromptWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Active execution mode */
  const [mode, setMode] = useState<TerminalExecutionMode>(() => {
    if (webcontainerService.isSupported()) return 'webcontainer';
    return 'local';
  });

  const [wcState, setWcState] = useState(() => webcontainerService.getState());
  const webcontainerStatus = wcState.status;
  const webcontainerShellRef = useRef<{
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
    disconnect?: () => void;
  } | null>(null);

  /** Current input line and cursor offset within it (Local mode only). */
  const lineRef = useRef('');
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const [termReady, setTermReady] = useState(false);

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

  /**
   * Specific reason the WebContainer option is unavailable, if it is.
   *
   * The option stays rendered in all cases (see the mode-switch pill below):
   * a capability gap must never look like a missing feature. Deriving this
   * value never boots the runtime — boot happens only in the mode effect
   * when `mode === 'webcontainer'`, which is unreachable while unsupported
   * because the control is disabled and the initial mode falls back to
   * `'local'`.
   */
  const webContainerUnavailableReason = isWebContainerSupported
    ? null
    : getWebContainerUnavailableReason({
        crossOriginIsolated:
          typeof window !== 'undefined' && Boolean(window.crossOriginIsolated),
        isSecureContext:
          typeof window === 'undefined' ? true : Boolean(window.isSecureContext),
        sharedArrayBufferAvailable: typeof SharedArrayBuffer !== 'undefined',
        status: webcontainerStatus,
      });
  const webContainerUnavailableMessage = webContainerUnavailableReason
    ? describeWebContainerUnavailableReason(webContainerUnavailableReason)
    : null;

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
      webcontainerShellRef.current?.resize(term.cols, term.rows);
    } catch {
      // Fit error on zero dimension container is safe to ignore
    }
  }, []);

  /** Clears the shell prompt readiness watchdog timer. */
  const clearShellPromptWatchdog = useCallback(() => {
    if (shellPromptWatchdogRef.current) {
      clearTimeout(shellPromptWatchdogRef.current);
      shellPromptWatchdogRef.current = null;
    }
  }, []);

  /**
   * Dispatches a shell command once the interactive prompt (❯) is confirmed ready.
   * If the prompt has already appeared, dispatches immediately without delay.
   * Otherwise queues the command and arms a 15-second watchdog timer.
   */
  const dispatchWhenShellReady = useCallback(
    (cmd: string, epoch: number, termMessage?: string) => {
      const term = termRef.current;
      const shell = webcontainerShellRef.current;

      const isReady = isShellPromptReadyRef.current || webcontainerService.isShellReady();

      if (isReady && shell) {
        clearShellPromptWatchdog();
        pendingAutoStartCmdRef.current = null;
        if (termMessage && term) {
          term.write(termMessage);
        }
        webcontainerService.setDevServerStarting(true);
        isShellPromptReadyRef.current = false;
        shell.write(`${cmd}\n`);
        return;
      }

      // Queue command for dispatch upon prompt detection in onData
      pendingAutoStartCmdRef.current = { cmd, epoch, termMessage };
      clearShellPromptWatchdog();
      shellPromptWatchdogRef.current = setTimeout(() => {
        if (pendingAutoStartCmdRef.current && pendingAutoStartCmdRef.current.epoch === epoch) {
          console.warn('[WebContainer] Shell prompt readiness watchdog triggered after 15s');
          webcontainerService.setStartupStage('error', {
            phase: 'boot',
            message: 'Shell initialization timed out waiting for prompt',
            timestamp: Date.now(),
            recoverable: true,
            retryAction: 'reboot_container',
          });
          webcontainerService.setDevServerStarting(false);
          pendingAutoStartCmdRef.current = null;
        }
      }, 15000);
    },
    [clearShellPromptWatchdog],
  );

  /** Spawns or reconnects WebContainer interactive PTY shell */
  const startWebContainerShell = useCallback(async (forceRestart = false) => {
    const term = termRef.current;
    if (!term) return;

    if (isStartingShellRef.current) {
      if (forceRestart) {
        pendingRestartReasonRef.current = 'Forced restart request';
      }
      return;
    }
    if (!forceRestart && webcontainerShellRef.current) {
      return;
    }

    isStartingShellRef.current = true;
    try {
      term.write(
        `\r\n${ANSI.brightGreen}⚡ Booting WebContainer (In-Browser Node.js runtime)...${ANSI.reset}\r\n`,
      );
      webcontainerService.setStartupStage('booting');

      const currentProj = projectRef.current;

      // Mount project files into virtual filesystem if files exist
      if (currentProj.files.length > 0) {
        await webcontainerService.mountProject(
          currentProj.files,
          currentProj.dependencies,
          currentProj.projectType,
        );
        term.write(
          `${ANSI.gray}Files mounted into virtual filesystem. Starting interactive shell...${ANSI.reset}\r\n`,
        );
      } else {
        term.write(
          `${ANSI.gray}Starting interactive shell...${ANSI.reset}\r\n`,
        );
      }

      // Spawn or reconnect interactive shell
      const shell = await webcontainerService.spawnInteractiveShell({
        cols: term.cols || 80,
        rows: term.rows || 24,
        onData: (chunk) => {
          term.write(chunk);

          // 0. Shell prompt readiness detection (❯ prompt in jsh)
          if (chunk.includes('❯') || /[$#❯]\s*$/.test(chunk)) {
            isShellPromptReadyRef.current = true;
            clearShellPromptWatchdog();

            if (pendingAutoStartCmdRef.current) {
              const pending = pendingAutoStartCmdRef.current;
              pendingAutoStartCmdRef.current = null;

              if (pending.epoch === webcontainerService.getSessionEpoch()) {
                if (pending.termMessage) {
                  term.write(pending.termMessage);
                }
                webcontainerService.setDevServerStarting(true);
                isShellPromptReadyRef.current = false;
                const activeShell = webcontainerShellRef.current;
                if (activeShell) {
                  activeShell.write(`${pending.cmd}\n`);
                } else {
                  webcontainerService.writeToShell(`${pending.cmd}\n`);
                }
              }
            }
          }

          // 1. Package install success confirmation
          if (
            (chunk.includes('added ') && chunk.includes('package')) ||
            chunk.includes('up to date')
          ) {
            if (pendingFingerprintRef.current) {
              webcontainerService.recordInstallComplete(pendingFingerprintRef.current);
            }
            if (webcontainerService.getState().startupStage === 'installing') {
              webcontainerService.setStartupStage('starting_server');
            }
          }

          // 2. Dev server ready confirmation
          if (
            chunk.includes('VITE') ||
            chunk.includes('ready in') ||
            chunk.includes('Local:   http://') ||
            chunk.includes('Network: http://')
          ) {
            if (webcontainerService.getState().serverUrl) {
              webcontainerService.setStartupStage('ready');
            }
          }

          // 3. Process failure detection (npm ERR!, ERESOLVE, EADDRINUSE, etc.)
          const isInstallErr =
            chunk.includes('npm ERR!') ||
            chunk.includes('npm error:') ||
            chunk.includes('code ERESOLVE') ||
            chunk.includes('code ENOENT');

          const isServerErr =
            chunk.includes('EADDRINUSE') ||
            chunk.includes('address already in use') ||
            chunk.includes('failed to load config') ||
            (chunk.includes('Error: Cannot find module') &&
              (webcontainerService.getState().startupStage === 'starting_server' ||
                webcontainerService.isDevServerStarting()));

          if (isInstallErr && webcontainerService.getState().startupStage === 'installing') {
            webcontainerService.setDevServerStarting(false);
            webcontainerService.setStartupStage('error', {
              phase: 'install',
              message: 'npm install failed with error. Check terminal output for details.',
              timestamp: Date.now(),
              recoverable: true,
              retryAction: 'retry_install',
            });
          } else if (
            isServerErr &&
            (webcontainerService.getState().startupStage === 'starting_server' ||
              webcontainerService.isDevServerStarting())
          ) {
            webcontainerService.setDevServerStarting(false);
            webcontainerService.setStartupStage('error', {
              phase: 'server',
              message: 'Development server failed to start. Port may be in use or configuration is invalid.',
              timestamp: Date.now(),
              recoverable: true,
              retryAction: 'restart_server',
            });
          }
        },
        forceRestart,
      });

      webcontainerShellRef.current = shell;
      setWcState(webcontainerService.getState());

      // StackBlitz auto-start: install dependencies and boot dev server
      // Only auto-start when project files are populated
      const projToStart = projectRef.current;
      if (autoStartProject !== false && !hasAutoStartedRef.current && projToStart.files.length > 0) {
        hasAutoStartedRef.current = true;

        const fingerprint = webcontainerService.computeDependencyFingerprint(
          projToStart.files,
          projToStart.dependencies,
          projToStart.projectType,
        );
        pendingFingerprintRef.current = fingerprint;

        // Idempotency: verify if this project has already been started in this session epoch
        if (webcontainerService.hasStartedProject(fingerprint)) {
          return;
        }

        // Idempotency: verify if dev server is already running
        if (webcontainerService.isDevServerRunning()) {
          term.write(
            `\r\n${ANSI.brightGreen}⚡ Connected to active WebContainer Dev Server (${webcontainerService.getState().serverUrl ?? 'port ready'}).${ANSI.reset}\r\n`,
          );
          webcontainerService.markProjectStarted(fingerprint);
          return;
        }

        if (webcontainerService.isDevServerStarting()) {
          term.write(
            `\r\n${ANSI.brightYellow}⚡ Dev Server startup currently in progress...${ANSI.reset}\r\n`,
          );
          return;
        }

        webcontainerService.markProjectStarted(fingerprint);
        const startEpoch = webcontainerService.getSessionEpoch();

        const check = await webcontainerService.needsDependencyInstall(
          projToStart.files,
          projToStart.dependencies,
          projToStart.projectType,
        );

        if (startEpoch !== webcontainerService.getSessionEpoch()) return;

        if (check.needsInstall) {
          webcontainerService.setStartupStage('installing');
          dispatchWhenShellReady(
            'npm install --prefer-offline && npm run dev',
            startEpoch,
            `\r\n${ANSI.brightCyan}⚡ StackBlitz Auto-Start: Installing dependencies & starting dev server...${ANSI.reset}\r\n`,
          );
        } else {
          webcontainerService.setStartupStage('starting_server');
          dispatchWhenShellReady(
            'npm run dev',
            startEpoch,
            `\r\n${ANSI.brightGreen}⚡ Fast Start: Dependencies verified in container. Launching dev server directly...${ANSI.reset}\r\n`,
          );
        }
      }
    } catch (err) {
      clearShellPromptWatchdog();
      pendingAutoStartCmdRef.current = null;
      const msg = err instanceof Error ? err.message : String(err);
      term.write(`\r\n${ANSI.red}✖ Failed to start WebContainer: ${msg}${ANSI.reset}\r\n`);
      webcontainerService.setStartupStage('error', {
        phase: 'boot',
        message: msg,
        timestamp: Date.now(),
        recoverable: true,
        retryAction: 'reboot_container',
      });
      webcontainerService.setDevServerStarting(false);
    } finally {
      isStartingShellRef.current = false;
      if (pendingRestartReasonRef.current) {
        const pendingReason = pendingRestartReasonRef.current;
        pendingRestartReasonRef.current = null;
        triggerDevServerRestart(pendingReason);
      }
    }
  }, [autoStartProject, dispatchWhenShellReady, clearShellPromptWatchdog]);

  /** Triggers dev server restart and dependencies installation */
  const triggerDevServerRestart = useCallback(
    (reason = 'Restart request') => {
      if (restartDebounceTimerRef.current) {
        clearTimeout(restartDebounceTimerRef.current);
      }

      restartDebounceTimerRef.current = setTimeout(() => {
        const term = termRef.current;
        const shell = webcontainerShellRef.current;

        if (mode !== 'webcontainer') {
          if (webcontainerService.isSupported()) {
            setMode('webcontainer');
          }
        }

        const restartEpoch = webcontainerService.getSessionEpoch();

        if (shell) {
          // Send Ctrl+C to terminate any running process (e.g. Vite or node dev server)
          isShellPromptReadyRef.current = false;
          clearShellPromptWatchdog();
          pendingAutoStartCmdRef.current = null;
          shell.write('\x03\r');
          webcontainerService.setDevServerStarting(true);
          const currentProj = projectRef.current;

          void (async () => {
            try {
              // Ensure project files are mounted before checking dependencies or starting Vite
              if (currentProj.files.length > 0) {
                await webcontainerService.mountProject(
                  currentProj.files,
                  currentProj.dependencies,
                  currentProj.projectType,
                );
              }

              if (restartEpoch !== webcontainerService.getSessionEpoch()) return;

              const fingerprint = webcontainerService.computeDependencyFingerprint(
                currentProj.files,
                currentProj.dependencies,
                currentProj.projectType,
              );
              pendingFingerprintRef.current = fingerprint;
              webcontainerService.markProjectStarted(fingerprint);

              const check = await webcontainerService.needsDependencyInstall(
                currentProj.files,
                currentProj.dependencies,
                currentProj.projectType,
              );

              if (restartEpoch !== webcontainerService.getSessionEpoch()) return;

              if (check.needsInstall) {
                webcontainerService.setStartupStage('installing');
                dispatchWhenShellReady(
                  'npm install --prefer-offline && npm run dev',
                  restartEpoch,
                  term
                    ? `\r\n${ANSI.brightCyan}⚡ [${reason}]: Installing dependencies & starting dev server...${ANSI.reset}\r\n`
                    : undefined,
                );
              } else {
                webcontainerService.setStartupStage('starting_server');
                dispatchWhenShellReady(
                  'npm run dev',
                  restartEpoch,
                  term
                    ? `\r\n${ANSI.brightGreen}⚡ [${reason}]: Dependencies verified. Fast restarting dev server...${ANSI.reset}\r\n`
                    : undefined,
                );
              }
            } catch (err) {
              clearShellPromptWatchdog();
              pendingAutoStartCmdRef.current = null;
              const msg = err instanceof Error ? err.message : String(err);
              if (term) {
                term.write(`\r\n${ANSI.red}✖ Failed during restart: ${msg}${ANSI.reset}\r\n`);
              }
              webcontainerService.setStartupStage('error', {
                phase: 'server',
                message: msg,
                timestamp: Date.now(),
                recoverable: true,
                retryAction: 'restart_server',
              });
            }
          })();
        } else {
          if (isStartingShellRef.current) {
            pendingRestartReasonRef.current = reason || 'Pending restart';
          } else {
            hasAutoStartedRef.current = false;
            void startWebContainerShell(true);
          }
        }
      }, 150);
    },
    [mode, startWebContainerShell, dispatchWhenShellReady, clearShellPromptWatchdog],
  );

  // Auto-start when project files hydrate from IndexedDB if not already started
  useEffect(() => {
    if (project.files.length > 0 && !hasAutoStartedRef.current && webcontainerShellRef.current) {
      triggerDevServerRestart('Workspace files ready');
    }
  }, [project.files.length, triggerDevServerRestart]);

  // Subscribe to external restart requests (e.g. new local folder loaded or user restart)
  useEffect(() => {
    return webcontainerService.onRestartRequest((reason) => {
      triggerDevServerRestart(reason || 'Restarting dev server');
    });
  }, [triggerDevServerRestart]);

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

    term.open(host);
    termRef.current = term;
    setTermReady(true);

    const disposable = term.onData((data: string) => {
      // 1. WebContainer Mode: pass raw data to in-browser PTY
      if (mode === 'webcontainer' && webcontainerShellRef.current) {
        webcontainerShellRef.current.write(data);
        return;
      }

      // 2. Local Mode: simulated line editor
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
      webcontainerShellRef.current?.disconnect?.();
      webcontainerShellRef.current = null;
      if (restartDebounceTimerRef.current) {
        clearTimeout(restartDebounceTimerRef.current);
      }
      clearShellPromptWatchdog();
    };
  }, [mode, redrawLine, submitLocal, writePrompt, clearShellPromptWatchdog]);

  // Setup WebContainer subscription
  useEffect(() => {
    return webcontainerService.subscribe(() => {
      setWcState(webcontainerService.getState());
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
      webcontainerShellRef.current?.disconnect?.();
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

  // Helper to send shortcut commands
  const sendCommand = useCallback(
    (cmd: string) => {
      const term = termRef.current;
      if (!term) return;

      if (mode === 'webcontainer' && webcontainerShellRef.current) {
        webcontainerShellRef.current.write(`${cmd}\n`);
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
      const fingerprint = webcontainerService.computeDependencyFingerprint(
        currentProj.files,
        currentProj.dependencies,
        currentProj.projectType,
      );
      pendingFingerprintRef.current = fingerprint;
      sendCommand('npm install --prefer-offline --legacy-peer-deps');
    } else {
      sendCommand('npm install --prefer-offline --legacy-peer-deps');
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
                  ? wcState.startupStage === 'error'
                    ? 'bg-rose-500 animate-pulse'
                    : wcState.startupStage === 'ready'
                    ? 'bg-emerald-400 animate-pulse'
                    : wcState.startupStage === 'installing' || wcState.startupStage === 'mounting_files' || wcState.startupStage === 'booting'
                    ? 'bg-cyan-400 animate-pulse'
                    : wcState.startupStage === 'starting_server'
                    ? 'bg-amber-400 animate-pulse'
                    : webcontainerStatus === 'running'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400 animate-pulse'
                  : 'bg-gray-400'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-content-on-dark flex items-center gap-1">
              {mode === 'webcontainer' && (
                wcState.startupStage === 'error'
                  ? `✖ ${wcState.runtimeError?.phase === 'install' ? 'Install Failed' : wcState.runtimeError?.phase === 'server' ? 'Server Failed' : 'Runtime Error'}`
                  : wcState.startupStage === 'ready'
                  ? `⚡ Ready (:${wcState.serverPort ?? 5173})`
                  : wcState.startupStage === 'installing'
                  ? '⚡ Installing Dependencies...'
                  : wcState.startupStage === 'starting_server'
                  ? '⚡ Starting Dev Server...'
                  : wcState.startupStage === 'mounting_files'
                  ? '⚡ Mounting Files...'
                  : wcState.startupStage === 'booting'
                  ? '⚡ Booting Runtime...'
                  : '⚡ WebContainer'
              )}
              {mode === 'local' && '💻 Local Simulated Shell'}
            </span>
          </div>

          {/* Mode Switcher Pill — the WebContainer option stays visible even
              when unsupported so a capability gap never looks like a missing
              feature. Disabled state carries the specific reason as a tooltip
              and via aria; it cannot be activated while disabled. */}
          <div className="flex items-center bg-product border border-stroke-dark rounded-md p-0.5 text-[10px]">
            <button
              onClick={() => setMode('webcontainer')}
              disabled={!isWebContainerSupported}
              aria-disabled={!isWebContainerSupported}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                mode === 'webcontainer'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-content-on-dark-soft hover:text-white'
              }${isWebContainerSupported ? '' : ' opacity-50 cursor-not-allowed'}`}
              title={
                isWebContainerSupported
                  ? 'Zero-cost in-browser Node.js runtime powered by WebAssembly'
                  : (webContainerUnavailableMessage ?? 'WebContainer unavailable')
              }
            >
              WebContainer
            </button>
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
              {wcState.startupStage === 'error' && (
                <button
                  onClick={() => triggerDevServerRestart('Error Recovery Retry')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 transition-colors"
                  title={wcState.runtimeError?.message || 'Retry operation'}
                  data-testid="terminal-retry-error-btn"
                >
                  <RotateCcw className="h-2.5 w-2.5 text-rose-400" />
                  Retry
                </button>
              )}
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
                onClick={() => triggerDevServerRestart('Terminal Restart')}
                className="p-1 rounded text-content-on-dark-soft hover:text-content-on-dark hover:bg-product"
                title="Restart Environment & Dev Server"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </>
          )}

          <button
            onClick={() => sendCommand('help')}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-product hover:bg-product-active text-content-on-dark border border-stroke-dark transition-colors"
            title="Display commands help cheat sheet (Runs 'help' command)"
          >
            <HelpCircle className="h-2.5 w-2.5 text-cyan-400" />
            help
          </button>

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
