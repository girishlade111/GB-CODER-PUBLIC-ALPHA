import React, { useEffect, useMemo, useRef } from 'react';
import { AlertCircle, AlertTriangle, Bug, ChevronRight, Info, Terminal } from 'lucide-react';
import ConsoleValueTree from './ConsoleValueTree';
import { editorNavigator } from '../../services/editorNavigator';
import { matchesConsoleMessage } from '../../utils/consoleFilter';
import type {
  ConsoleLevelFilter,
  ConsoleMessage,
  ResolvedStackFrame,
} from '../../types/consoleFeed';

interface ConsoleTabProps {
  messages: ConsoleMessage[];
  filter: ConsoleLevelFilter;
  searchQuery?: string;
  isRegex?: boolean;
  isCaseSensitive?: boolean;
  onClearSearch?: () => void;
}

/** HH:MM:SS.mmm, as specified. `toLocaleTimeString` drops milliseconds. */
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const pad = (value: number, width = 2) => String(value).padStart(width, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
    date.getMilliseconds(),
    3,
  )}`;
};

const LEVEL_ICON: Record<ConsoleMessage['level'], React.ReactNode> = {
  error: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  info: <Info className="w-3.5 h-3.5 text-sky-400" />,
  debug: <Bug className="w-3.5 h-3.5 text-violet-400" />,
  log: <ChevronRight className="w-3.5 h-3.5 text-content-on-dark-soft" />,
};

/** Row tint, matching devtools' error/warning banding. */
const LEVEL_ROW: Record<ConsoleMessage['level'], string> = {
  error: 'bg-danger/10 border-l-2 border-danger',
  warn: 'bg-amber-500/10 border-l-2 border-amber-500/70',
  info: 'border-l-2 border-transparent',
  debug: 'border-l-2 border-transparent',
  log: 'border-l-2 border-transparent',
};

/**
 * One stack frame. Frames that resolved to a user file are buttons that jump to
 * the exact line; frames from libraries, bundles or the injected bridge render
 * as inert text rather than as a link that would navigate somewhere misleading.
 */
const StackFrameRow: React.FC<{ resolved: ResolvedStackFrame }> = ({ resolved }) => {
  const { frame, location } = resolved;
  const label = frame.fn ? `${frame.fn} (${frame.file}:${frame.line}:${frame.column})` : `${frame.file}:${frame.line}:${frame.column}`;

  if (!location) {
    return <div className="text-[11px] text-content-on-dark-soft font-mono pl-5 truncate">at {label}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => void editorNavigator.reveal(location)}
      title={`Jump to ${location.file}:${location.line}:${location.column}`}
      className="block w-full text-left text-[11px] font-mono pl-5 text-sky-400/80 hover:text-sky-300 hover:underline truncate"
    >
      at {frame.fn ? `${frame.fn} ` : ''}
      <span className="text-sky-300">
        {location.file}:{location.line}:{location.column}
      </span>
    </button>
  );
};

const ConsoleTab: React.FC<ConsoleTabProps> = ({
  messages,
  filter,
  searchQuery = '',
  isRegex = false,
  isCaseSensitive = false,
  onClearSearch,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  /** True while the user is scrolled to the bottom, so autoscroll can pause. */
  const pinnedToBottom = useRef(true);

  const visible = useMemo(() => {
    let result = filter === 'all' ? messages : messages.filter((message) => message.level === filter);
    if (searchQuery && searchQuery.trim()) {
      result = result.filter((message) =>
        matchesConsoleMessage(message, searchQuery, { isRegex, isCaseSensitive }),
      );
    }
    return result;
  }, [messages, filter, searchQuery, isRegex, isCaseSensitive]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    pinnedToBottom.current = distance < 32;
  };

  /*
   * Follow the newest entry, like a real console. The old panel set
   * `scrollTop = 0` while rendering oldest-first, so it scrolled away from new
   * output instead of towards it.
   */
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !pinnedToBottom.current) return;
    element.scrollTop = element.scrollHeight;
  }, [visible.length]);

  if (visible.length === 0) {
    const hasSearch = Boolean(searchQuery && searchQuery.trim());
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 text-content-on-dark-soft">
        <Terminal className="w-6 h-6 mb-2 opacity-50" />
        <p className="text-sm">
          {messages.length === 0 ? (
            'No console output yet.'
          ) : hasSearch ? (
            <>
              No logs matching pattern{' '}
              <span className="font-mono text-accent bg-product-active px-1.5 py-0.5 rounded text-xs">
                "{searchQuery}"
              </span>
            </>
          ) : (
            `No ${filter} messages. ${messages.length} hidden by the filter.`
          )}
        </p>
        {messages.length === 0 ? (
          <p className="text-xs mt-1 text-content-on-dark-soft">
            Calls to console.log, warn, error and info from the Live Preview appear here.
          </p>
        ) : hasSearch ? (
          <div className="mt-2 flex flex-col items-center gap-1.5">
            <span className="text-xs text-content-on-dark-soft">
              {messages.length} log{messages.length === 1 ? '' : 's'} hidden by active filters
            </span>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="mt-1 px-2.5 py-1 text-xs rounded border border-stroke-dark bg-product-hover text-accent hover:bg-product-active transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto font-mono text-xs bg-product text-content-on-dark"
      data-testid="console-feed"
    >
      {visible.map((message) => (
        <div
          key={message.id}
          data-testid="console-row"
          data-level={message.level}
          className={`flex items-start gap-2 px-2 py-1 border-b border-stroke-dark ${LEVEL_ROW[message.level]}`}
          style={{ paddingLeft: `${8 + message.groupDepth * 14}px` }}
        >
          <span className="text-[10px] tabular-nums text-content-on-dark-soft mt-0.5 flex-shrink-0">
            {formatTimestamp(message.timestamp)}
          </span>
          <span className="mt-0.5 flex-shrink-0">{LEVEL_ICON[message.level]}</span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5 break-words">
              {/* Each argument keeps its own type and expandability. */}
              {message.args.map((arg, index) => (
                <ConsoleValueTree key={index} value={arg} />
              ))}
              {message.origin === 'build' && (
                <span className="text-[10px] uppercase tracking-wide text-content-on-dark-soft border border-stroke-dark-strong rounded px-1">
                  build
                </span>
              )}
            </div>

            {message.stack.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {message.stack.map((resolved, index) => (
                  <StackFrameRow key={index} resolved={resolved} />
                ))}
              </div>
            )}
          </div>

          {message.count > 1 && (
            <span
              className="flex-shrink-0 text-[10px] font-bold bg-product-active text-content-on-dark rounded-full px-1.5 py-0.5"
              title={`${message.count} identical messages`}
            >
              {message.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConsoleTab;
