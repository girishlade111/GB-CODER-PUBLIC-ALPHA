import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, Loader2, RefreshCw, Terminal, Trash2, X } from 'lucide-react';
import { CONSOLE_BRIDGE_CHANNEL, type SerializedValue } from '../services/consoleBridge';
import { MOBILE_PREVIEW_POLL_MS, fetchPreviewState } from '../services/mobilePreviewService';

/**
 * The standalone page a phone lands on after scanning the QR code.
 *
 * Served at `/mpreview/:id`. The app's own router dispatches on
 * `window.location.pathname`, so this route is matched in `App.tsx` and rendered
 * before any editor chrome — see the `/preview/:id` share page for the same
 * pattern.
 *
 * ## What this page deliberately does not do
 *
 * It does not re-assemble the document. The editor sends the fully built
 * srcdoc, so there is exactly one assembly of a preview in the codebase and the
 * phone cannot drift from the desktop. Everything the desktop preview does —
 * external libraries, JSX runtime, import maps, custom injections — is already
 * in the string this renders.
 */

interface MobileStandalonePreviewProps {
  sessionId: string;
}

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface MobileLogEntry {
  id: number;
  level: ConsoleLevel;
  text: string;
  timestamp: number;
}

/** Matches the desktop feed's cap so a runaway loop cannot exhaust phone memory. */
const LOG_LIMIT = 200;

const LEVEL_STYLES: Record<ConsoleLevel, string> = {
  log: 'text-content-secondary',
  info: 'text-teal',
  warn: 'text-warning',
  error: 'text-danger',
  debug: 'text-content-muted',
};

/**
 * Renders one bridged argument as text.
 *
 * The desktop has `ConsoleValueTree` for interactive inspection; a phone gets a
 * flat string, because the point here is reading an error message in the hand
 * rather than exploring an object in it.
 */
const formatValue = (value: SerializedValue): string => {
  switch (value.kind) {
    case 'string':
      return value.truncated ? `${value.value}…` : value.value;
    case 'number':
    case 'bigint':
      return value.value;
    case 'boolean':
      return String(value.value);
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'symbol':
      return value.value;
    case 'function':
      return `[Function ${value.name}]`;
    case 'date':
      return value.value;
    case 'regexp':
      return value.value;
    case 'node':
      return value.preview;
    case 'error':
      return `${value.name}: ${value.message}`;
    case 'array':
      return `Array(${value.length})`;
    case 'object':
      return value.ctor;
    case 'collection':
      return `${value.ctor}(${value.size})`;
    case 'circular':
      return '[Circular]';
    case 'max-depth':
    case 'unserializable':
      return value.preview;
    default:
      return '[unknown]';
  }
};

const MobileStandalonePreview: React.FC<MobileStandalonePreviewProps> = ({ sessionId }) => {
  /*
   * Named `previewDocument`, not `document`: the shadowed global is needed by the
   * effect that strips the host page's own margins, and shadowing it here would
   * make that effect read a string.
   */
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<MobileLogEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nextLogId = useRef(0);
  /**
   * The document currently mounted in the iframe, and the version last seen.
   *
   * Both live in refs rather than state because the poll loop must run once per
   * session. Holding either in state would tear the loop down and rebuild it on
   * every tick, which restarts the timer and makes the interval drift.
   */
  const renderedDocument = useRef<string | null>(null);
  const knownVersion = useRef<number | null>(null);

  /* ── Poll for updates ──────────────────────────────────────────────────
   * `fetchPreviewState` omits the document when `?since=` already matches, so an
   * idle session costs one ~40 byte request per tick. Polling rather than SSE
   * because a serverless deployment cannot hold a stream open on the same
   * instance the editor writes to — see mobilePreviewService for the full note.
   */
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        const state = await fetchPreviewState(sessionId, knownVersion.current);
        if (cancelled) return;

        knownVersion.current = state.version;
        setError(null);

        if (state.changed && typeof state.document === 'string') {
          /*
           * The editor republishes on renders that do not change the preview at
           * all, and `version` advances every time. Comparing the string is what
           * stops the phone from reloading under the user's thumb whenever they
           * open a panel on the desktop.
           */
          if (state.document !== renderedDocument.current) {
            renderedDocument.current = state.document;
            setPreviewDocument(state.document);
            // A fresh document resets output the way a browser navigation does.
            setLogs([]);
          }
        }
      } catch (requestError: unknown) {
        if (cancelled) return;
        setError(
          requestError instanceof Error ? requestError.message : 'Lost connection to the editor.',
        );
      } finally {
        if (!cancelled) timer = setTimeout(tick, MOBILE_PREVIEW_POLL_MS);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      knownVersion.current = null;
    };
  }, [sessionId]);

  /* ── Floating console ────────────────────────────────────────────────────
   * The injected bridge posts to `window.parent`, which on this page is this
   * page — the same channel the desktop uses, so mobile-only instrumentation
   * would be a second implementation of something that already works.
   */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as
        | { channel?: string; kind?: string; level?: ConsoleLevel; args?: SerializedValue[] }
        | undefined;
      if (!data || data.channel !== CONSOLE_BRIDGE_CHANNEL || data.kind !== 'console') return;

      const level = data.level ?? 'log';
      nextLogId.current += 1;
      const entry: MobileLogEntry = {
        id: nextLogId.current,
        level,
        text: (data.args ?? []).map(formatValue).join(' ') || '(empty)',
        timestamp: Date.now(),
      };

      setLogs((current) => {
        const next = [...current, entry];
        return next.length > LOG_LIMIT ? next.slice(next.length - LOG_LIMIT) : next;
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /* Jump to the newest line when the console is open. */
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (consoleOpen) logEndRef.current?.scrollIntoView({ block: 'end' });
  }, [logs, consoleOpen]);

  /**
   * Forces a fresh document.
   *
   * Re-assigning an identical `srcDoc` does not reload a frame, so a `null` gap
   * is put in between. The commit that writes `null` and the one that writes the
   * string back are separate, which is what the browser needs to see.
   */
  const reload = useCallback(() => {
    setLogs([]);
    setPreviewDocument(null);
    requestAnimationFrame(() => setPreviewDocument(renderedDocument.current));
  }, []);

  useEffect(() => {
    document.documentElement.style.overscrollBehavior = 'none';
    const previous = document.body.style.margin;
    document.body.style.margin = '0';
    return () => {
      document.body.style.margin = previous;
    };
  }, []);

  if (error && previewDocument === null) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center gap-4 bg-product px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" />
        <h1 className="font-sans text-lg font-medium text-content-on-dark">Preview unavailable</h1>
        <p className="max-w-xs text-sm text-content-on-dark-soft">{error}</p>
        <p className="max-w-xs text-xs text-content-muted">
          Sessions close after 30 minutes of inactivity. Open Test on Mobile in the editor to start a
          new one.
        </p>
      </div>
    );
  }

  if (previewDocument === null) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center gap-3 bg-product">
        <Loader2 className="h-6 w-6 animate-spin text-content-on-dark-soft" />
        <p className="text-sm text-content-on-dark-soft">Connecting to the editor…</p>
      </div>
    );
  }

  const errorCount = logs.filter((entry) => entry.level === 'error').length;
  const warnCount = logs.filter((entry) => entry.level === 'warn').length;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-white">
      <iframe
        ref={iframeRef}
        title="Mobile Live Preview"
        srcDoc={previewDocument}
        /*
         * Same trust model as the desktop preview: user-authored code is
         * expected to run, so scripts and same-origin are both granted and the
         * isolation is the frame itself. No credentials live on this origin.
         */
        sandbox="allow-scripts allow-same-origin"
        className="block h-screen w-screen border-0"
      />

      {/* Floating debugger */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2147483647] flex flex-col items-end gap-2 p-3">
        {consoleOpen && (
          <div className="pointer-events-auto flex max-h-[45vh] w-full flex-col overflow-hidden rounded-lg border border-white/15 bg-black/85 backdrop-blur-md sm:max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/90">
                <Terminal className="h-3.5 w-3.5" />
                Console
                <span className="text-white/50">({logs.length})</span>
              </span>
              <div className="flex items-center gap-1">
                {errorCount > 0 && (
                  <span className="text-[11px] font-medium text-danger">{errorCount} errors</span>
                )}
                {warnCount > 0 && (
                  <span className="text-[11px] font-medium text-warning">{warnCount} warnings</span>
                )}
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  title="Clear console"
                  aria-label="Clear console"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleOpen(false)}
                  className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  title="Close console"
                  aria-label="Close console"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <p className="text-white/40">No output yet.</p>
              ) : (
                logs.map((entry) => (
                  <div key={entry.id} className="flex gap-2 py-0.5">
                    <span className="shrink-0 text-white/30">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span className={`break-all ${LEVEL_STYLES[entry.level]}`}>{entry.text}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-2">
          {error && (
            <span className="rounded-full border border-warning/40 bg-black/80 px-2.5 py-1 text-[11px] text-warning backdrop-blur-md">
              Reconnecting…
            </span>
          )}
          <button
            type="button"
            onClick={reload}
            className="rounded-full border border-white/15 bg-black/75 p-2.5 text-white/90 backdrop-blur-md transition-colors hover:bg-black/90"
            title="Reload preview"
            aria-label="Reload preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConsoleOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 py-2.5 text-[11px] font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-black/90"
            title="Toggle mobile console"
          >
            <Terminal className="h-4 w-4" />
            <span className="tabular-nums">{logs.length}</span>
            {errorCount > 0 && <span className="text-danger">{errorCount}</span>}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${consoleOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileStandalonePreview;
