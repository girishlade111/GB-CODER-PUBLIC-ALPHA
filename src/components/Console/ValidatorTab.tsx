import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { editorNavigator } from '../../services/editorNavigator';
import type { IssueSeverity, ValidationSummary } from '../../services/validationService';

export type ValidatorFilter = 'all' | 'errors' | 'warnings';

interface ValidatorTabProps {
  summary: ValidationSummary;
  filter: ValidatorFilter;
  isValidating: boolean;
  /** False until an editor has mounted and handed Monaco to the service. */
  isReady: boolean;
}

const SEVERITY_ICON: Record<IssueSeverity, React.ReactNode> = {
  // Red circle / yellow triangle, per the brief and VS Code's Problems panel.
  error: <XCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info: <Info className="w-4 h-4 text-sky-400" />,
};

const ValidatorTab: React.FC<ValidatorTabProps> = ({ summary, filter, isValidating, isReady }) => {
  const visible = useMemo(() => {
    if (filter === 'errors') return summary.issues.filter((issue) => issue.severity === 'error');
    if (filter === 'warnings') return summary.issues.filter((issue) => issue.severity === 'warning');
    return summary.issues;
  }, [summary.issues, filter]);

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Waiting for the editor to initialise…
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        {summary.issues.length === 0 ? (
          <>
            <CheckCircle2 className="w-7 h-7 text-emerald-500/70 mb-2" />
            <p className="text-sm text-gray-400">No problems detected.</p>
            <p className="text-xs text-gray-600 mt-1">
              HTML, CSS and JavaScript are checked automatically as you type.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            No {filter === 'errors' ? 'errors' : 'warnings'}. {summary.issues.length} other issue
            {summary.issues.length === 1 ? '' : 's'} hidden by the filter.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-matte-black" data-testid="validator-list">
      {visible.map((issue) => (
        <button
          key={issue.id}
          type="button"
          data-testid="validator-row"
          data-severity={issue.severity}
          onClick={() =>
            void editorNavigator.reveal({
              file: issue.file,
              line: issue.line,
              column: issue.column,
            })
          }
          title={`${issue.fileLabel}:${issue.line}:${issue.column} — click to jump`}
          className="w-full text-left flex items-start gap-2.5 px-3 py-1.5 border-b border-gray-800/40 hover:bg-white/5 transition-colors"
        >
          <span className="mt-0.5 flex-shrink-0">{SEVERITY_ICON[issue.severity]}</span>

          <span className="flex-1 min-w-0">
            <span className="block text-sm text-gray-200 break-words">{issue.message}</span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] font-mono">
              <span className="text-gray-400">{issue.fileLabel}</span>
              <span className="text-gray-600">
                [{issue.line}:{issue.column}]
              </span>
              <span className="text-gray-500">{issue.rule}</span>
            </span>
          </span>
        </button>
      ))}

      {isValidating && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          Re-checking…
        </div>
      )}
    </div>
  );
};

export default ValidatorTab;
