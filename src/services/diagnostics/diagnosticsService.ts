export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface DiagnosticItem {
  id: string;
  source: 'editor' | 'runtime' | 'build';
  severity: DiagnosticSeverity;
  message: string;
  path?: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  code?: string | number;
  projectId?: string;
}

export interface DiagnosticsState {
  items: DiagnosticItem[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
}

type DiagnosticsListener = () => void;

class DiagnosticsService {
  private editorDiagnostics: DiagnosticItem[] = [];
  private runtimeDiagnostics: DiagnosticItem[] = [];
  private currentProjectId: string | null = null;
  private listeners = new Set<DiagnosticsListener>();
  private cachedState: DiagnosticsState | null = null;

  /**
   * Scopes diagnostics to the given project ID.
   * If switched to a different project, stale diagnostics are cleared.
   */
  setProjectId(projectId?: string | null): void {
    const id = projectId ?? null;
    if (this.currentProjectId !== id) {
      this.currentProjectId = id;
      this.editorDiagnostics = [];
      this.runtimeDiagnostics = [];
      this.cachedState = null;
      this.notify();
    }
  }

  /**
   * Updates editor diagnostics from Monaco model markers.
   */
  setEditorMarkers(
    markers: Array<{
      resource?: { path?: string; toString?: () => string };
      severity: number;
      message: string;
      startLineNumber?: number;
      startColumn?: number;
      endLineNumber?: number;
      endColumn?: number;
      code?: string | { value: string };
      source?: string;
    }>,
    projectId?: string | null,
  ): void {
    if (projectId && this.currentProjectId && projectId !== this.currentProjectId) {
      return;
    }

    // Monaco MarkerSeverity:
    // Hint = 1, Info = 2, Warning = 4, Error = 8
    this.editorDiagnostics = markers.map((m, idx) => {
      let severity: DiagnosticSeverity = 'info';
      if (m.severity === 8) severity = 'error';
      else if (m.severity === 4) severity = 'warning';
      else if (m.severity === 2 || m.severity === 1) severity = 'info';

      const codeVal = typeof m.code === 'object' && m.code ? m.code.value : m.code;

      // Extract normalized relative path
      let filePath = m.resource?.path || m.resource?.toString?.() || '';
      if (filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }

      return {
        id: `editor-${filePath}-${m.startLineNumber}-${m.startColumn}-${idx}`,
        source: 'editor' as const,
        severity,
        message: m.message,
        path: filePath,
        line: m.startLineNumber ?? 1,
        column: m.startColumn ?? 1,
        endLine: m.endLineNumber,
        endColumn: m.endColumn,
        code: codeVal,
        projectId: this.currentProjectId ?? undefined,
      };
    });

    this.notify();
  }

  /**
   * Sets or clears a WebContainer runtime failure diagnostic.
   */
  setRuntimeError(
    error: { message: string; phase?: string; code?: string } | null,
    projectId?: string | null,
  ): void {
    if (projectId && this.currentProjectId && projectId !== this.currentProjectId) {
      return;
    }

    if (!error) {
      this.runtimeDiagnostics = [];
    } else {
      this.runtimeDiagnostics = [
        {
          id: `runtime-${error.phase || 'error'}-${Date.now()}`,
          source: 'runtime',
          severity: 'error',
          message: error.message,
          code: error.code || (error.phase ? `Phase: ${error.phase}` : undefined),
          projectId: this.currentProjectId ?? undefined,
        },
      ];
    }

    this.notify();
  }

  /**
   * Clears all diagnostics for the active project.
   */
  clearDiagnostics(): void {
    this.editorDiagnostics = [];
    this.runtimeDiagnostics = [];
    this.notify();
  }

  /**
   * Returns consolidated state.
   */
  getState(): DiagnosticsState {
    if (this.cachedState) {
      return this.cachedState;
    }

    const items = [...this.runtimeDiagnostics, ...this.editorDiagnostics];
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const item of items) {
      if (item.severity === 'error') errorCount++;
      else if (item.severity === 'warning') warningCount++;
      else infoCount++;
    }

    this.cachedState = {
      items,
      errorCount,
      warningCount,
      infoCount,
      totalCount: items.length,
    };
    return this.cachedState;
  }

  subscribe(listener: DiagnosticsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.cachedState = null;
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[DiagnosticsService] Listener error:', err);
      }
    }
  }

  /**
   * Formats a diagnostic for clipboard copy.
   */
  formatDiagnostic(diag: DiagnosticItem): string {
    const location = diag.path ? ` [${diag.path}${diag.line ? `:${diag.line}:${diag.column ?? 1}` : ''}]` : '';
    const code = diag.code ? ` (${diag.code})` : '';
    return `[${diag.severity.toUpperCase()}][${diag.source.toUpperCase()}]${location}${code} ${diag.message}`;
  }
}

export const diagnosticsService = new DiagnosticsService();
