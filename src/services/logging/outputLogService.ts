export type LogCategory = 'system' | 'runtime' | 'server' | 'build' | 'fs';
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface OutputLogEntry {
  id: string;
  timestamp: number;
  category: LogCategory;
  level: LogLevel;
  message: string;
  projectId?: string;
}

const MAX_LOG_ENTRIES = 500;

type OutputListener = () => void;

class OutputLogService {
  private logs: OutputLogEntry[] = [];
  private currentProjectId: string | null = null;
  private listeners = new Set<OutputListener>();
  private idCounter = 0;

  /**
   * Cleanses sensitive strings from log messages.
   */
  private sanitize(message: string): string {
    return message
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/ghp_[0-9A-Za-z]{36}/g, '[REDACTED_GH_TOKEN]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED_TOKEN]')
      .replace(/password\s*=\s*['"][^'"]+['"]/gi, 'password="[REDACTED]"');
  }

  setProjectId(projectId?: string | null): void {
    const id = projectId ?? null;
    if (this.currentProjectId !== id) {
      this.currentProjectId = id;
      this.logs = [];
      this.appendLog('system', 'info', `Switched workspace to project: ${id ?? 'unscoped'}`);
    }
  }

  appendLog(category: LogCategory, level: LogLevel, message: string): void {
    const sanitized = this.sanitize(message);
    const entry: OutputLogEntry = {
      id: `log-${Date.now()}-${++this.idCounter}`,
      timestamp: Date.now(),
      category,
      level,
      message: sanitized,
      projectId: this.currentProjectId ?? undefined,
    };

    this.logs.push(entry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(-MAX_LOG_ENTRIES);
    }

    this.notify();
  }

  clearLogs(): void {
    this.logs = [];
    this.appendLog('system', 'info', 'Output log cleared.');
  }

  getLogs(): OutputLogEntry[] {
    return this.logs;
  }

  subscribe(listener: OutputListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[OutputLogService] Listener error:', err);
      }
    }
  }

  formatAllForClipboard(): string {
    return this.logs
      .map((entry) => {
        const time = new Date(entry.timestamp).toISOString();
        return `[${time}] [${entry.category.toUpperCase()}] [${entry.level.toUpperCase()}] ${entry.message}`;
      })
      .join('\n');
  }
}

export const outputLogService = new OutputLogService();
