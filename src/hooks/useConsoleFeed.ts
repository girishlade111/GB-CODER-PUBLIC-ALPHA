/**
 * Owns the console message feed: append, cap, collapse repeats, and clear.
 *
 * Kept out of App.tsx so the buffer policy lives in one place and the counts
 * driving the tab badges are derived rather than recomputed ad hoc.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CONSOLE_FEED_LIMIT,
  ConsoleMessage,
  ConsoleMessageOrigin,
} from '../types/consoleFeed';
import type { ConsoleLevel, SerializedValue } from '../services/consoleBridge';

export interface ConsoleCounts {
  total: number;
  log: number;
  info: number;
  warn: number;
  error: number;
  debug: number;
}

export interface ConsoleFeed {
  messages: ConsoleMessage[];
  counts: ConsoleCounts;
  /** Appends a message, collapsing it into the previous one when identical. */
  append: (message: Omit<ConsoleMessage, 'id' | 'count'>) => void;
  /** Convenience for plain-text producers such as the bundler. */
  appendText: (level: ConsoleLevel, text: string, origin?: ConsoleMessageOrigin) => void;
  clear: () => void;
}

/**
 * Identity used for repeat collapsing. Compares level and the rendered shape of
 * the arguments; a tight loop logging the same line should read `x42`, not fill
 * the buffer and evict everything before it.
 */
const collapseKey = (level: string, args: SerializedValue[]): string => {
  let key = level;
  for (const arg of args) {
    key += '|' + arg.kind;
    if ('value' in arg) key += ':' + String(arg.value);
    else if (arg.kind === 'error') key += ':' + arg.name + ':' + arg.message;
    else if (arg.kind === 'object') key += ':' + arg.ctor + ':' + arg.entries.length;
    else if (arg.kind === 'array') key += ':' + arg.length;
  }
  return key;
};

export const useConsoleFeed = (): ConsoleFeed => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  /*
   * Monotonic counter for ids. The old feed used `Date.now().toString()`, so
   * two logs in the same millisecond produced duplicate React keys and the
   * second one silently failed to render.
   */
  const nextId = useRef(0);

  const append = useCallback((message: Omit<ConsoleMessage, 'id' | 'count'>) => {
    setMessages((current) => {
      const previous = current[current.length - 1];

      if (
        previous &&
        previous.groupDepth === message.groupDepth &&
        collapseKey(previous.level, previous.args) === collapseKey(message.level, message.args)
      ) {
        const collapsed = [...current];
        collapsed[collapsed.length - 1] = {
          ...previous,
          count: previous.count + 1,
          timestamp: message.timestamp,
        };
        return collapsed;
      }

      nextId.current += 1;
      const next = [...current, { ...message, id: `msg-${nextId.current}`, count: 1 }];

      // Drop the oldest entries once the cap is exceeded.
      return next.length > CONSOLE_FEED_LIMIT
        ? next.slice(next.length - CONSOLE_FEED_LIMIT)
        : next;
    });
  }, []);

  const appendText = useCallback(
    (level: ConsoleLevel, text: string, origin: ConsoleMessageOrigin = 'build') => {
      append({
        level,
        origin,
        args: [{ kind: 'string', value: text }],
        stack: [],
        timestamp: Date.now(),
        groupDepth: 0,
      });
    },
    [append],
  );

  const clear = useCallback(() => setMessages([]), []);

  const counts = useMemo<ConsoleCounts>(() => {
    const result: ConsoleCounts = { total: 0, log: 0, info: 0, warn: 0, error: 0, debug: 0 };
    for (const message of messages) {
      // A collapsed run of 42 identical errors is 42 problems, not one.
      result.total += message.count;
      result[message.level] += message.count;
    }
    return result;
  }, [messages]);

  return { messages, counts, append, appendText, clear };
};
