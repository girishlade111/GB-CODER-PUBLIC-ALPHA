import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  FolderTree,
  Info,
  Layers,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { formatBytes } from '../services/projectArchiveService';
import type { ImportPlan } from '../services/import/importEngine';
import type { DetectedProjectKind } from '../services/import/projectDetection';

/**
 * Confirmation step for an import.
 *
 * Lazy-loaded alongside the import engine. Shows what was detected and *why*,
 * lets the user correct a wrong guess, and reports what was skipped — a silent
 * import that guessed wrong is much harder to recover from than one that asked.
 */

interface ImportReviewModalProps {
  plan: ImportPlan;
  onCancel: () => void;
  /** Applies the import using the (possibly overridden) kind. */
  onConfirm: (kind: DetectedProjectKind) => void;
}

const KIND_LABEL: Record<DetectedProjectKind, string> = {
  simple: 'Static HTML/CSS/JS',
  react: 'React project',
  vue: 'Vue project',
  fullstack: 'Full-stack project',
};

/** Overridable targets. Full-stack is not offered: there is no mode for it yet. */
const OVERRIDE_KINDS: DetectedProjectKind[] = ['simple', 'react', 'vue'];

const ImportReviewModal: React.FC<ImportReviewModalProps> = ({ plan, onCancel, onConfirm }) => {
  const { isDark } = useTheme();
  const [kind, setKind] = useState<DetectedProjectKind>(plan.detection.kind);
  const [showAllFiles, setShowAllFiles] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const isFullStack = kind === 'fullstack';
  const files = plan.result.files;
  const visibleFiles = showAllFiles ? files : files.slice(0, 12);

  const skippedSummary = useMemo(
    () =>
      plan.skipped
        .map((group) => `${group.name} (${group.entries} file${group.entries === 1 ? '' : 's'})`)
        .join(', '),
    [plan.skipped],
  );

  const surface = isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${surface}`}
        role="dialog"
        aria-modal="true"
        aria-label="Review import"
        data-testid="import-review"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stroke-subtle px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-accent/15 p-2.5">
              <FileArchive className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-content-primary">Import project</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                {plan.sourceName} · {formatBytes(plan.sourceBytes)} · {files.length} file
                {files.length === 1 ? '' : 's'} ready
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-content-muted hover:bg-white/10 hover:text-content-primary"
            aria-label="Cancel import"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Detection + override */}
          <div className="rounded-xl border border-stroke-subtle bg-surface-base p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <span className="text-sm text-content-secondary">Detected as:</span>
                <span
                  className="text-sm font-semibold text-content-primary"
                  data-testid="detected-kind"
                >
                  {KIND_LABEL[plan.detection.kind]}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-content-muted">
                  {plan.detection.confidence} confidence
                </span>
              </div>

              <label className="flex items-center gap-2 text-xs text-content-secondary">
                Change?
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as DetectedProjectKind)}
                  data-testid="kind-override"
                  className={`rounded-lg border px-2 py-1 text-xs outline-none ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-content-primary'
                      : 'border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {/* The detected kind stays selectable even when full-stack. */}
                  {plan.detection.kind === 'fullstack' && (
                    <option value="fullstack">{KIND_LABEL.fullstack}</option>
                  )}
                  {OVERRIDE_KINDS.map((option) => (
                    <option key={option} value={option}>
                      {KIND_LABEL[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Why we guessed that. */}
            <ul className="mt-3 space-y-1.5">
              {plan.detection.signals.map((signal) => (
                <li key={signal.label} className="flex items-start gap-2 text-xs">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-content-muted" />
                  <span className="text-content-secondary">
                    <span className="font-medium text-content-primary">{signal.label}</span> —{' '}
                    {signal.detail}
                  </span>
                </li>
              ))}
            </ul>

            {kind !== plan.detection.kind && (
              <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
                Overriding to <strong>{KIND_LABEL[kind]}</strong>. The detection above will be
                ignored.
              </p>
            )}
          </div>

          {/* Full-stack: detect and inform only. */}
          {isFullStack && (
            <div
              className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              data-testid="fullstack-notice"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                <div className="text-xs text-amber-100">
                  <p className="text-sm font-semibold">Full-stack project detected</p>
                  <p className="mt-1 opacity-90">
                    Advanced mode is coming. This project has a server side that cannot run in the
                    browser preview, so it will not be opened yet.
                  </p>
                  <p className="mt-2 opacity-90">
                    If this is really a front-end project — for example React with a small local
                    mock server — change the type above and import it anyway.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Skipped folders */}
          {plan.skipped.length > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-stroke-subtle bg-surface-base p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <p className="text-xs text-content-secondary">
                <span className="font-medium text-content-primary">Skipped:</span> {skippedSummary}.
                Dependencies are reinstalled rather than imported.
              </p>
            </div>
          )}

          {/* Warnings */}
          {plan.warnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
              <p className="mb-1.5 text-xs font-medium text-amber-300">
                {plan.warnings.length} warning{plan.warnings.length === 1 ? '' : 's'}
              </p>
              <ul className="space-y-1">
                {plan.warnings.slice(0, 5).map((warning) => (
                  <li key={warning.file} className="truncate text-[11px] text-content-muted">
                    <span className="text-content-secondary">{warning.file}</span> — {warning.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* File preview */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-content-muted" />
                <span className="text-xs font-medium text-content-secondary">
                  Files to import ({files.length})
                </span>
              </div>
              <ul className="rounded-xl border border-stroke-subtle bg-surface-base p-2 font-mono text-[11px]">
                {visibleFiles.map((file) => (
                  <li key={file.path} className="truncate py-0.5 text-content-secondary">
                    {file.path}
                  </li>
                ))}
              </ul>
              {files.length > visibleFiles.length && (
                <button
                  onClick={() => setShowAllFiles(true)}
                  className="mt-1.5 text-[11px] text-accent hover:underline"
                >
                  Show {files.length - visibleFiles.length} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stroke-subtle px-5 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm text-content-secondary hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(kind)}
            disabled={isFullStack || files.length === 0}
            data-testid="confirm-import"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isFullStack || files.length === 0
                ? 'cursor-not-allowed bg-white/5 text-content-muted'
                : 'bg-accent text-accent-fg hover:bg-accent-hover'
            }`}
            title={
              isFullStack
                ? 'Change the project type above to import this as a front-end project'
                : undefined
            }
          >
            {isFullStack ? 'Cannot open yet' : `Import as ${KIND_LABEL[kind]}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportReviewModal;
