import type { ConsoleMessage } from '../types/consoleFeed';
import type { SerializedValue, SerializedEntry } from '../services/consoleBridge';

/**
 * Extracts a searchable plain-text representation from a serialized console value.
 */
export function serializedValueToSearchText(value: SerializedValue): string {
  if (!value) return '';

  switch (value.kind) {
    case 'string':
    case 'number':
    case 'bigint':
    case 'date':
    case 'regexp':
      return String(value.value);
    case 'boolean':
      return value.value ? 'true' : 'false';
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'function':
      return `${value.isClass ? 'class' : 'function'} ${value.name || ''}`;
    case 'node':
    case 'max-depth':
    case 'unserializable':
      return value.preview || '';
    case 'error': {
      const stackText = (value.stack || [])
        .map(
          (frame) =>
            `${frame.fn || ''} ${frame.file || ''}:${frame.line || ''}:${frame.column || ''} ${frame.raw || ''}`,
        )
        .join(' ');
      return `${value.name || 'Error'}: ${value.message || ''} ${stackText}`;
    }
    case 'array':
      return (value.entries || [])
        .map((entry: SerializedEntry) => serializedValueToSearchText(entry.value))
        .join(' ');
    case 'object': {
      const entriesText = (value.entries || [])
        .map((entry: SerializedEntry) => `${entry.key}: ${serializedValueToSearchText(entry.value)}`)
        .join(' ');
      return `${value.ctor || 'Object'} ${entriesText}`;
    }
    case 'collection': {
      const entriesText = (value.entries || [])
        .map((entry: SerializedEntry) => `${entry.key} ${serializedValueToSearchText(entry.value)}`)
        .join(' ');
      return `${value.ctor} ${entriesText}`;
    }
    case 'circular':
      return '[Circular]';
    default:
      return '';
  }
}

/**
 * Flattens all inspectable parts of a ConsoleMessage into a single searchable string:
 * arguments, error names & messages, stack trace lines, origin, and log level.
 */
export function getConsoleMessageSearchText(message: ConsoleMessage): string {
  const argsText = (message.args || []).map(serializedValueToSearchText).join(' ');
  const stackText = (message.stack || [])
    .map(
      (s) =>
        `${s.frame.fn || ''} ${s.frame.file || ''}:${s.frame.line || ''}:${s.frame.column || ''} ${
          s.frame.raw || ''
        } ${s.location ? `${s.location.file}:${s.location.line}:${s.location.column}` : ''}`,
    )
    .join(' ');

  return `${message.level} ${message.origin} ${argsText} ${stackText}`.trim();
}

export interface SearchFilterOptions {
  isRegex?: boolean;
  isCaseSensitive?: boolean;
}

/**
 * Validates whether a regex query is syntactically correct.
 */
export function validateRegex(
  pattern: string,
  flags = 'i',
): { valid: boolean; error?: string } {
  try {
    new RegExp(pattern, flags);
    return { valid: true };
  } catch (err: unknown) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid regex' };
  }
}

/**
 * Tests whether a ConsoleMessage satisfies the given filter query.
 *
 * Supports:
 * 1. Explicit Regex Mode (via `isRegex` flag or slash notation `/pattern/flags`)
 * 2. Case-Sensitive or Case-Insensitive matching
 * 3. Multi-token text matching (space-separated terms where all must match)
 * 4. Exact phrase matching (quoted text like `"Network Error"`)
 */
export function matchesConsoleMessage(
  message: ConsoleMessage,
  query: string,
  options: SearchFilterOptions = {},
): boolean {
  if (!query || !query.trim()) return true;

  const rawQuery = query.trim();
  const text = getConsoleMessageSearchText(message);

  // 1. Slash notation regex detection: e.g. /TypeError/i or /fetch|xhr/
  const slashRegexMatch = rawQuery.match(/^\/(.+)\/([gimsuy]*)$/);
  if (slashRegexMatch) {
    try {
      const pattern = slashRegexMatch[1];
      const flags = slashRegexMatch[2] || (options.isCaseSensitive ? '' : 'i');
      const rx = new RegExp(pattern, flags);
      return rx.test(text);
    } catch {
      // Incomplete or invalid regex while typing - fall back to substring search
    }
  }

  // 2. Explicit Regex mode toggle
  if (options.isRegex) {
    try {
      const rx = new RegExp(rawQuery, options.isCaseSensitive ? '' : 'i');
      return rx.test(text);
    } catch {
      // If regex is not yet valid, treat as case-insensitive substring so typing isn't jarring
      const sourceText = options.isCaseSensitive ? text : text.toLowerCase();
      const targetQuery = options.isCaseSensitive ? rawQuery : rawQuery.toLowerCase();
      return sourceText.includes(targetQuery);
    }
  }

  // 3. Quoted exact phrase: e.g. "Cannot read properties"
  if (rawQuery.startsWith('"') && rawQuery.endsWith('"') && rawQuery.length > 1) {
    const exact = rawQuery.slice(1, -1);
    const sourceText = options.isCaseSensitive ? text : text.toLowerCase();
    const target = options.isCaseSensitive ? exact : exact.toLowerCase();
    return sourceText.includes(target);
  }

  // 4. Standard text pattern search (space-separated tokens, each must match)
  const sourceText = options.isCaseSensitive ? text : text.toLowerCase();
  const targetQuery = options.isCaseSensitive ? rawQuery : rawQuery.toLowerCase();
  const tokens = targetQuery.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return true;
  return tokens.every((token) => sourceText.includes(token));
}
