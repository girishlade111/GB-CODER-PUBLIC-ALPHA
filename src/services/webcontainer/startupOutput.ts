import type { StartupCode } from './startupDiagnostics';
/** Bounded streaming hints. These never claim a numeric npm exit status. */
export class StartupOutputParser {
  private buffer = '';
  private completed = false;
  private failed = false;
  push(chunk: string): {
    installComplete: boolean;
    installError?: StartupCode;
  } {
    this.buffer = (this.buffer + chunk).slice(-8192);
    // ANSI control sequences are intentionally removed before interpreting text.
    // eslint-disable-next-line no-control-regex
    const text = this.buffer.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
    if (
      !this.failed &&
      /npm\s+(?:ERR!|error\b)|\bcode\s+(?:ERESOLVE|ENOENT|ECONNRESET|ENOTFOUND|ETIMEDOUT)\b/i.test(
        text,
      )
    ) {
      this.failed = true;
      const code = text.match(
        /\b(ECONNRESET|ENOTFOUND|ETIMEDOUT|ERESOLVE|ENOENT|EADDRINUSE)\b/,
      )?.[1] as StartupCode | undefined;
      return { installComplete: false, installError: code || 'UNKNOWN' };
    }
    if (
      !this.completed &&
      !this.failed &&
      /(?:^|[\r\n])\s*(?:added\s+\d+\s+packages?\b|up to date\b)/i.test(text)
    ) {
      this.completed = true;
      return { installComplete: true };
    }
    return { installComplete: false };
  }
}
