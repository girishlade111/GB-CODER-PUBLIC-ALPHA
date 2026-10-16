import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  FolderTree,
  Info,
  Layers,
  PanelsTopLeft,
  Code2,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { formatBytes } from '../services/projectArchiveService';
import type { ImportPlan } from '../services/import/importEngine';
import type { DetectedProjectKind } from '../services/import/projectDetection';
import type { EditorStyle } from '../services/projects/projectDatabase';

/**
 * Confirmation and configuration step for an import.
 *
 * Lazy-loaded alongside the import engine. Displays:
 * 1. Source name & file counts
 * 2. Original and retained byte sizes
 * 3. Detected framework & reasoning signals
 * 4. Recommended editor style (Static Editor vs Advanced IDE)
 * 5. Destination choice (New Project vs Overwrite Active Editor)
 * 6. Searchable file tree preview
 * 7. Skipped folders and warnings
 * 8. Explicit confirmation before creating or overwriting
 */

export interface ImportConfirmationPayload {
  kind: DetectedProjectKind;
  editorStyle: EditorStyle;
  isNewProject: boolean;
  projectName: string;
}

interface ImportReviewModalProps {
  plan: ImportPlan;
  onCancel: () => void;
  /** Applies the import using either the structured payload or legacy kind. */
  onConfirm: (payload: ImportConfirmationPayload | DetectedProjectKind) => void;
  hasActiveProject?: boolean;
}

const KIND_LABEL: Record<DetectedProjectKind, string> = {
  simple: 'Static HTML/CSS/JS',
  react: 'React project',
  vue: 'Vue project',
  fullstack: 'Full-stack project',
};

const OVERRIDE_KINDS: DetectedProjectKind[] = ['simple', 'react', 'vue', 'fullstack'];

const sanitizeImportName = (rawName: string): string => {
  const withoutZip = rawName.replace(/\.zip$/i, '');
  const trimmed = withoutZip.trim();
  return trimmed || 'Imported Project';
};

const ImportReviewModal: React.FC<ImportReviewModalProps> = ({
  plan,
  onCancel,
  onConfirm,
  hasActiveProject = false,
}) => {
  const { isDark } = useTheme();
  const [kind, setKind] = useState<DetectedProjectKind>(plan.detection.kind);
  const [projectName, setProjectName] = useState(() => sanitizeImportName(plan.sourceName));
  const [isNewProject, setIsNewProject] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [showAllFiles, setShowAllFiles] = useState(false);

  // Recommended editor: React/Vue/Full-stack -> vscode; Simple -> plain
  const defaultEditorForKind = (k: DetectedProjectKind): EditorStyle =>
    k === 'simple' ? 'plain' : 'vscode';

  const [editorStyle, setEditorStyle] = useState<EditorStyle>(() =>
    defaultEditorForKind(plan.detection.kind),
  );

  // Update editor recommendation when kind is overridden
  const handleKindChange = (newKind: DetectedProjectKind) => {
    setKind(newKind);
    setEditorStyle(defaultEditorForKind(newKind));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const isFullStack = kind === 'fullstack';
  const files = plan.result.files;

  // Filtered file preview
  const filteredFiles = useMemo(() => {
    if (!fileSearchQuery.trim()) return files;
    const q = fileSearchQuery.toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, fileSearchQuery]);

  const visibleFiles = showAllFiles ? filteredFiles : filteredFiles.slice(0, 15);

  const skippedSummary = useMemo(
    () =>
      plan.skipped
        .map((group) => `${group.name} (${group.entries} file${group.entries === 1 ? '' : 's'})`)
        .join(', '),
    [plan.skipped],
  );

  const hasEnvFiles = useMemo(() => {
    return files.some((f) => {
      const base = f.path.split('/').pop()?.toLowerCase() ?? '';
      return base === '.env' || base.startsWith('.env.');
    });
  }, [files]);

  const surface = isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200';

  const handleConfirmClick = () => {
    // Deliver structured payload with fallback to kind for legacy callers
    const payload: ImportConfirmationPayload = {
      kind,
      editorStyle: isFullStack ? 'vscode' : editorStyle,
      isNewProject,
      projectName: projectName.trim() || sanitizeImportName(plan.sourceName),
    };

    onConfirm(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-review-title"
      data-testid="import-review"
    >
      <div
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl my-6 ${surface}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stroke-subtle px-6 py-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-accent/15 p-2.5 text-accent">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="import-review-title"
                className="font-sans text-base font-semibold text-content-primary"
              >
                Review Import
              </h2>
              <p className="mt-0.5 text-xs text-content-muted">
                {plan.sourceName} · {files.length} file{files.length === 1 ? '' : 's'} ready
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors"
            aria-label="Cancel import"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* File size & Summary Metric Card */}
          <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-stroke-subtle bg-surface-base p-3 text-xs">
            <div>
              <span className="block text-[11px] text-content-muted">Source Size</span>
              <span className="font-semibold text-content-primary">
                {formatBytes(plan.sourceBytes)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-content-muted">Imported Code</span>
              <span className="font-semibold text-content-primary">
                {formatBytes(plan.totalBytes)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-content-muted">Total Files</span>
              <span className="font-semibold text-content-primary" data-testid="import-file-count">
                {files.length}
              </span>
            </div>
          </div>

          {/* Project Name and Destination Options */}
          <div className="rounded-xl border border-stroke-subtle bg-surface-base p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="import-project-name" className="text-xs font-semibold text-content-primary">
                Project Name
              </label>
              {hasActiveProject && (
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-content-secondary">
                    <input
                      type="radio"
                      name="import-destination"
                      checked={isNewProject}
                      onChange={() => setIsNewProject(true)}
                      className="accent-accent"
                    />
                    New Project
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-content-secondary">
                    <input
                      type="radio"
                      name="import-destination"
                      checked={!isNewProject}
                      onChange={() => setIsNewProject(false)}
                      className="accent-accent"
                    />
                    Current Editor
                  </label>
                </div>
              )}
            </div>

            {isNewProject && (
              <input
                id="import-project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="import-project-name-input"
                className="w-full rounded-lg border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
                placeholder="Name for this project..."
              />
            )}

            {!isNewProject && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Warning: Loading into current editor will replace open files. Choose &quot;New Project&quot;
                  to preserve your active project.
                </span>
              </div>
            )}
          </div>

          {/* Detection + Reasoning */}
          <div className="rounded-xl border border-stroke-subtle bg-surface-base p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <span className="text-xs text-content-secondary">Detected as:</span>
                <span
                  className="text-xs font-bold text-content-primary"
                  data-testid="detected-kind"
                >
                  {KIND_LABEL[plan.detection.kind]}
                </span>
                <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] uppercase tracking-wide text-content-muted border border-stroke-subtle">
                  {plan.detection.confidence} confidence
                </span>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-content-secondary">
                Override?
                <select
                  value={kind}
                  onChange={(event) => handleKindChange(event.target.value as DetectedProjectKind)}
                  data-testid="kind-override"
                  className="rounded-lg border border-stroke-subtle bg-surface-base px-2 py-1 text-xs text-content-primary outline-none focus:border-accent"
                >
                  {OVERRIDE_KINDS.map((option) => (
                    <option key={option} value={option}>
                      {KIND_LABEL[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Signals / Evidence */}
            <ul className="mt-3 space-y-1.5 border-t border-stroke-subtle pt-2.5">
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
              <p className="mt-2.5 rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs text-sky-300 border border-sky-500/20">
                Overriding to <strong>{KIND_LABEL[kind]}</strong>.
              </p>
            )}
          </div>

          {/* Editor Recommendation Selection */}
          <div className="rounded-xl border border-stroke-subtle bg-surface-base p-4">
            <span className="block text-xs font-semibold text-content-primary mb-2">
              Recommended Editor
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditorStyle('plain')}
                disabled={isFullStack || kind === 'react' || kind === 'vue'}
                data-testid="import-editor-plain"
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  editorStyle === 'plain'
                    ? 'border-accent bg-accent-subtle/30 text-content-primary ring-1 ring-accent'
                    : isFullStack || kind === 'react' || kind === 'vue'
                      ? 'border-stroke-subtle opacity-40 cursor-not-allowed bg-surface-base text-content-muted'
                      : 'border-stroke-subtle bg-surface-base text-content-secondary hover:bg-surface-hover'
                }`}
              >
                <Code2 className="h-4 w-4 shrink-0 text-accent" />
                <div>
                  <span className="font-medium block">Static Editor</span>
                  <span className="text-[10px] text-content-muted">HTML/CSS/JS panels</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditorStyle('vscode')}
                data-testid="import-editor-vscode"
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  editorStyle === 'vscode'
                    ? 'border-accent bg-accent-subtle/30 text-content-primary ring-1 ring-accent'
                    : 'border-stroke-subtle bg-surface-base text-content-secondary hover:bg-surface-hover'
                }`}
              >
                <PanelsTopLeft className="h-4 w-4 shrink-0 text-accent" />
                <div>
                  <span className="font-medium block">Advanced IDE</span>
                  <span className="text-[10px] text-content-muted">File tree, tabs, terminal</span>
                </div>
              </button>
            </div>
          </div>

          {/* Full-stack Notice */}
          {isFullStack && (
            <div
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              data-testid="fullstack-notice"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                <div className="text-xs text-amber-100">
                  <p className="text-sm font-semibold">Full-stack project detected</p>
                  <p className="mt-1 opacity-90 leading-relaxed text-[11px]">
                    This project contains backend server code or container manifests. Client files
                    render in the browser, but server routes cannot execute natively without a backend
                    sandbox.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Environment variables reassurance */}
          {hasEnvFiles && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                Environment configuration file detected (.env). Its contents stay strictly in your
                browser&apos;s local storage and are never transmitted to external services.
              </span>
            </div>
          )}

          {/* Skipped folders */}
          {plan.skipped.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-stroke-subtle bg-surface-base p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <p className="text-xs text-content-secondary">
                <span className="font-medium text-content-primary">Skipped dependencies/caches:</span>{' '}
                {skippedSummary}.
              </p>
            </div>
          )}

          {/* Warnings */}
          {plan.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
              <p className="mb-1.5 text-xs font-semibold text-amber-300">
                {plan.warnings.length} notice{plan.warnings.length === 1 ? '' : 's'}
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

          {/* File list preview */}
          {files.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary">
                  <FolderTree className="h-4 w-4 text-content-muted" />
                  <span>Files to import ({files.length})</span>
                </div>
                {files.length > 10 && (
                  <div className="relative">
                    <Search className="absolute left-2 top-1.5 h-3 w-3 text-content-muted" />
                    <input
                      type="text"
                      placeholder="Filter files..."
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      className="rounded-lg border border-stroke-subtle bg-surface-base pl-6 pr-2 py-1 text-[11px] text-content-primary outline-none focus:border-accent"
                    />
                  </div>
                )}
              </div>
              <ul className="max-h-40 overflow-y-auto rounded-xl border border-stroke-subtle bg-surface-base p-2.5 font-mono text-[11px] space-y-0.5">
                {visibleFiles.map((file) => (
                  <li key={file.path} className="truncate text-content-secondary py-0.5">
                    {file.path}
                  </li>
                ))}
              </ul>
              {filteredFiles.length > visibleFiles.length && (
                <button
                  type="button"
                  onClick={() => setShowAllFiles(true)}
                  className="mt-1 text-[11px] text-accent hover:underline"
                >
                  Show {filteredFiles.length - visibleFiles.length} more files
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-stroke-subtle px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            data-testid="import-cancel"
            className="rounded-xl border border-stroke-subtle px-3.5 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={files.length === 0}
            data-testid="confirm-import"
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors shadow-md ${
              files.length === 0
                ? 'cursor-not-allowed bg-surface-hover text-content-muted'
                : 'bg-accent text-accent-fg hover:bg-accent-hover'
            }`}
          >
            {isNewProject
              ? `Create "${projectName.trim() || 'Project'}"`
              : 'Overwrite & Load into Editor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportReviewModal;
