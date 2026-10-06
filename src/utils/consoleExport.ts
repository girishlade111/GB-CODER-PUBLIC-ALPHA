import type { ConsoleMessage } from '../types/consoleFeed';
import { serializedValueToSearchText } from './consoleFilter';
import { downloadSingleFile } from './downloadUtils';

export interface ConsoleExportMetadata {
  filter?: string;
  searchQuery?: string;
  totalCount?: number;
  baseName?: string;
}

/**
 * Formats console messages into clean, readable text format with timestamps and stack traces.
 */
export function formatMessagesAsText(
  messages: ConsoleMessage[],
  metadata?: ConsoleExportMetadata,
): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [
    '======================================================================',
    'GB CODER — CONSOLE LOGS EXPORT',
    `Exported At:   ${timestamp}`,
    `Total Logs:    ${messages.length}${
      metadata?.totalCount && metadata.totalCount !== messages.length
        ? ` (filtered from ${metadata.totalCount} total)`
        : ''
    }`,
  ];

  if (metadata?.filter && metadata.filter !== 'all') {
    lines.push(`Level Filter:  ${metadata.filter.toUpperCase()}`);
  }
  if (metadata?.searchQuery) {
    lines.push(`Search Query:  "${metadata.searchQuery}"`);
  }

  lines.push('======================================================================\n');

  if (messages.length === 0) {
    lines.push('(No console logs to display)');
    return lines.join('\n');
  }

  messages.forEach((msg) => {
    const time = new Date(msg.timestamp).toISOString();
    const level = msg.level.toUpperCase().padEnd(5, ' ');
    const origin = msg.origin ? `[${msg.origin}] ` : '';
    const repeat = msg.count > 1 ? ` (x${msg.count})` : '';

    const argsText = (msg.args || [])
      .map((arg) => {
        if (arg.kind === 'error') {
          return `${arg.name}: ${arg.message}`;
        }
        return serializedValueToSearchText(arg);
      })
      .join(' ');

    const indent = ' '.repeat(Math.min(msg.groupDepth * 2, 8));
    lines.push(`${indent}[${time}] [${level}] ${origin}${argsText}${repeat}`);

    if (msg.stack && msg.stack.length > 0) {
      msg.stack.forEach((frame) => {
        const fn = frame.frame.fn ? `${frame.frame.fn} ` : '';
        const loc = frame.location
          ? `${frame.location.file}:${frame.location.line}:${frame.location.column}`
          : `${frame.frame.file}:${frame.frame.line}:${frame.frame.column}`;
        lines.push(`${indent}    at ${fn}(${loc})`);
      });
    }
  });

  return lines.join('\n');
}

/**
 * Formats console messages into structured JSON format.
 */
export function formatMessagesAsJson(
  messages: ConsoleMessage[],
  metadata?: ConsoleExportMetadata,
): string {
  const exportData = {
    generator: 'GB Coder',
    exportedAt: new Date().toISOString(),
    totalExported: messages.length,
    totalAvailable: metadata?.totalCount ?? messages.length,
    activeFilter: metadata?.filter || 'all',
    activeSearchQuery: metadata?.searchQuery || '',
    logs: messages.map((msg) => ({
      id: msg.id,
      timestamp: msg.timestamp,
      isoTime: new Date(msg.timestamp).toISOString(),
      level: msg.level,
      origin: msg.origin,
      repeatCount: msg.count,
      groupDepth: msg.groupDepth,
      text: (msg.args || []).map((arg) => serializedValueToSearchText(arg)).join(' '),
      rawArgs: msg.args,
      stack: (msg.stack || []).map((s) => ({
        function: s.frame.fn,
        file: s.frame.file,
        line: s.frame.line,
        column: s.frame.column,
        raw: s.frame.raw,
        sourceLocation: s.location,
      })),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Triggers a download of console logs in the requested format (.txt or .json).
 */
export function exportConsoleLogs(
  messages: ConsoleMessage[],
  format: 'txt' | 'json',
  metadata?: ConsoleExportMetadata,
): void {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = metadata?.baseName || 'console-logs';

  if (format === 'json') {
    const jsonStr = formatMessagesAsJson(messages, metadata);
    const filename = `${base}-${dateStr}.json`;
    downloadSingleFile(jsonStr, filename, 'application/json');
  } else {
    const textStr = formatMessagesAsText(messages, metadata);
    const filename = `${base}-${dateStr}.txt`;
    downloadSingleFile(textStr, filename, 'text/plain');
  }
}
