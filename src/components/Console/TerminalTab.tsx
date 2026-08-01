import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import 'xterm/css/xterm.css';
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

interface TerminalTabProps {
  project: MultiFileProject;
  resolvedPackages: ShellPackage[];
  unresolvedPackages: ShellPackageError[];
  isResolvingPackages: boolean;
  /** Terminal is only mounted/fitted while its tab is visible. */
  isActive: boolean;
}

const PROMPT = `${ANSI.brightGreen}gb${ANSI.reset}${ANSI.gray}:${ANSI.reset}${ANSI.brightCyan}~${ANSI.reset}${ANSI.gray}$${ANSI.reset} `;

/** Character cell measurement, used to fit the grid to the container. */
const measureCell = (element: HTMLElement, fontSize: number, fontFamily: string) => {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-size:${fontSize}px;font-family:${fontFamily}`;
  probe.textContent = 'W'.repeat(100);
  element.appendChild(probe);
  const width = probe.getBoundingClientRect().width / 100;
  probe.textContent = 'W';
  const height = probe.getBoundingClientRect().height;
  element.removeChild(probe);
  return { width: width || 8, height: (height || 16) * 1.2 };
};

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

  /** Current input line and cursor offset within it. */
  const lineRef = useRef('');
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  /** -1 means "editing a fresh line", otherwise an index into history. */
  const historyIndexRef = useRef(-1);

  const sessionRef = useRef<SandboxTerminalSession | null>(null);
  const [sandboxAvailable, setSandboxAvailable] = useState(sandboxTerminal.isAvailable());
  /** Flipped once xterm has mounted, so the sandbox attach effect can re-run. */
  const [termReady, setTermReady] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState<SandboxTerminalStatus>('idle');

  /*
   * Shell inputs are read through a ref so the xterm key handler is installed
   * once. Re-attaching it whenever the project changed would drop keystrokes
   * mid-command.
   */
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

  const isSandboxMode = sandboxAvailable && sandboxStatus === 'connected';

  const writePrompt = useCallback((term: XTerm) => {
    term.write(`\r\n${PROMPT}`);
  }, []);

  /** Redraws the current input line in place, honouring the cursor position. */
  const redrawLine = useCallback((term: XTerm) => {
    // \x1b[2K clears the row; \r returns to column 0.
    term.write(`\r\x1b[2K${PROMPT}${lineRef.current}`);
    const back = lineRef.current.length - cursorRef.current;
    if (back > 0) term.write(`\x1b[${back}D`);
  }, []);

  const submitLocal = useCallback(
    (term: XTerm, input: string) => {
      const trimmed = input.trim();
      term.write('\r\n');

      if (trimmed.length > 0) {
        // Avoid consecutive duplicates, as bash does with ignoredups.
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
        // `clear()` leaves the cursor on a fresh row; no leading newline.
        term.write(`\x1b[2K\r${PROMPT}`);
        return;
      }

      for (const line of result.output) term.write(`${line}\r\n`);
      term.write(PROMPT);
    },
    [],
  );

  /** Creates the terminal once, then wires input handling. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || termRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      convertEol: false,
      scrollback: 2000,
      // Matches the VS Code integrated terminal palette.
      theme: {
        background: '#0a0a0a',
        foreground: '#e4e4e7',
        cursor: '#a78bfa',
        selectionBackground: '#334155',
        black: '#18181b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e4e4e7',
        brightBlack: '#71717a',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde68a',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#fafafa',
      },
    });

    term.open(host);
    termRef.current = term;
    /*
     * State, not just the ref: the sandbox attach effect below needs to re-run
     * once the terminal exists, and assigning to a ref does not re-render.
     */
    setTermReady(true);

    term.write(
      [
        `${ANSI.bold}GB Coder Terminal${ANSI.reset} ${ANSI.gray}— Local Mode${ANSI.reset}`,
        `${ANSI.gray}Type ${ANSI.brightCyan}help${ANSI.reset}${ANSI.gray} to see what this mode can do.${ANSI.reset}`,
        '',
      ].join('\r\n'),
    );
    term.write(PROMPT);

    const disposable = term.onData((data: string) => {
      // Sandbox mode is a pass-through: the remote PTY owns line editing.
      const session = sessionRef.current;
      if (session && session.getStatus() === 'connected') {
        session.write(data);
        return;
      }

      // Ctrl+C — abandon the current line.
      if (data === '\u0003') {
        term.write('^C');
        lineRef.current = '';
        cursorRef.current = 0;
        historyIndexRef.current = -1;
        writePrompt(term);
        return;
      }

      // Ctrl+L — clear, matching shell convention.
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
          // Backspace, respecting cursor position.
          if (cursorRef.current === 0) return;
          lineRef.current =
            lineRef.current.slice(0, cursorRef.current - 1) +
            lineRef.current.slice(cursorRef.current);
          cursorRef.current -= 1;
          redrawLine(term);
          return;
        }
        case '\u001b[A': {
          // Up: walk backwards through history.
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
          // Down: forwards, ending on an empty fresh line.
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

      /*
       * Printable input, including multi-character chunks from a paste. Control
       * sequences are filtered out so a stray escape cannot corrupt the line.
       */
      // Filtered by code point rather than a control-character regex.
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

      // Appending at the end is the common case and avoids a full redraw.
      if (cursorRef.current === lineRef.current.length) term.write(printable);
      else redrawLine(term);
    });

    return () => {
      disposable.dispose();
      term.dispose();
      termRef.current = null;
      setTermReady(false);
    };
  }, [redrawLine, submitLocal, writePrompt]);

  /** Fits the grid to the container, and mirrors the size to a live PTY. */
  const fit = useCallback(() => {
    const host = hostRef.current;
    const term = termRef.current;
    if (!host || !term) return;

    const { width: cellWidth, height: cellHeight } = measureCell(host, FONT_SIZE, FONT_FAMILY);
    // Leave room for the scrollbar so the last column is never clipped.
    const cols = Math.max(20, Math.floor((host.clientWidth - 18) / cellWidth));
    const rows = Math.max(4, Math.floor(host.clientHeight / cellHeight));

    if (cols === term.cols && rows === term.rows) return;
    term.resize(cols, rows);
    sessionRef.current?.resize(cols, rows);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(host);
    return () => observer.disconnect();
  }, [fit]);

  // A hidden container reports zero size, so refit when the tab becomes visible.
  useEffect(() => {
    if (!isActive) return;
    const frame = requestAnimationFrame(() => {
      fit();
      termRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive, fit]);

  // Track sandbox availability so the header reflects reality.
  useEffect(() => sandboxTerminal.subscribe(setSandboxAvailable), []);

  /**
   * Attaches to the sandbox command runner once both halves exist.
   *
   * Depends on `termReady` as well as `sandboxAvailable`, because either can
   * become true second. Previously this only re-ran on `sandboxAvailable`, so
   * opening the Terminal *after* a sandbox was already connected left it stuck in
   * Local mode: the effect ran once with no terminal yet and never ran again.
   */
  useEffect(() => {
    const term = termRef.current;
    if (!sandboxAvailable || !termReady || !term) return;

    const session = sandboxTerminal.connect({ cols: term.cols, rows: term.rows });
    if (!session) return;

    sessionRef.current = session;
    setSandboxStatus(session.getStatus());

    const offData = session.onData((chunk) => term.write(chunk));
    const offStatus = session.onStatusChange((status, detail) => {
      setSandboxStatus(status);
      if (status === 'connected') {
        term.write(`\r\n${ANSI.brightGreen}● Connected to sandbox${ANSI.reset}\r\n`);
      } else if (status === 'error' || status === 'closed') {
        term.write(
          `\r\n${ANSI.yellow}● Sandbox session ${status}${detail ? `: ${detail}` : ''}. Back to Local Mode.${ANSI.reset}\r\n${PROMPT}`,
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
  }, [sandboxAvailable, termReady]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a0a0a]">
      {/* Mode header with a status dot: green when a sandbox is live, grey otherwise. */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-stroke-subtle bg-surface-raised flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSandboxMode
                ? 'bg-emerald-500'
                : sandboxStatus === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-gray-500'
            }`}
            aria-hidden="true"
          />
          <span
            className="text-xs font-medium text-content-secondary"
            data-testid="terminal-mode"
          >
            {isSandboxMode
              ? 'Connected: Sandbox'
              : sandboxStatus === 'connecting'
                ? 'Connecting to sandbox…'
                : 'Local'}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-content-muted">
          {/*
            Not "Real shell": commands run one-per-HTTP-request against the
            sandbox, so there is no persistent TTY. Interactive programs and
            long-lived foreground processes will not behave as they would in a
            terminal, and the label should not imply otherwise.
          */}
          {isSandboxMode ? 'Sandbox · command runner' : 'Simulated shell'}
        </span>
      </div>

      {/* xterm needs a concretely sized parent to measure against. */}
      <div ref={hostRef} className="flex-1 min-h-0 overflow-hidden px-2 py-1" />
    </div>
  );
};

export default TerminalTab;
