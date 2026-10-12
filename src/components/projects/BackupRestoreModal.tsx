import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  FileCheck2,
  FolderArchive,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import type { ProjectRecord } from '../../services/projects/projectDatabase';
import { exportAllProjects } from '../../services/backup/backupExportService';
import {
  analyzeBackupArchive,
  executeRestorePlan,
} from '../../services/backup/backupRestoreService';
import type {
  BackupExportResult,
  RestoreAnalysis,
  RestoreExecutionResult,
} from '../../services/backup/backupTypes';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectRecord[];
  onRestored?: () => void;
  initialTab?: 'backup' | 'restore';
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  projects,
  onRestored,
  initialTab = 'backup',
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>(initialTab);

  // Backup State
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState('');
  const [exportPercent, setExportPercent] = useState(0);
  const [exportResult, setExportResult] = useState<BackupExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Restore State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RestoreAnalysis | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreWorkspace, setRestoreWorkspace] = useState(false);
  const [restorePreferences, setRestorePreferences] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreExecutionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setExportResult(null);
    setExportError(null);
    setAnalysis(null);
    setRestoreError(null);
    setRestoreResult(null);
  }, [initialTab, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting && !isRestoring) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, isRestoring, onClose]);

  if (!isOpen) return null;

  // Handle Backup Export
  const handleStartExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);
    try {
      const result = await exportAllProjects({
        onProgress: (stage, percent) => {
          setExportStage(stage);
          setExportPercent(percent);
        },
        download: true,
      });
      setExportResult(result);
    } catch (err) {
      setExportError((err as Error).message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Restore Archive Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setRestoreError(null);
    setAnalysis(null);
    setRestoreResult(null);

    try {
      const parsedAnalysis = await analyzeBackupArchive(file);
      setAnalysis(parsedAnalysis);
      setRestoreWorkspace(false);
      setRestorePreferences(false);
    } catch (err) {
      setRestoreError((err as Error).message || 'Failed to read or validate archive.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Confirm Restore
  const handleConfirmRestore = async () => {
    if (!analysis) return;
    setIsRestoring(true);
    setRestoreError(null);

    try {
      const result = await executeRestorePlan(analysis, {
        restoreWorkspace,
        restorePreferences,
      });
      setRestoreResult(result);
      if (result.success && onRestored) {
        onRestored();
      }
    } catch (err) {
      setRestoreError((err as Error).message || 'Restoration failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      data-testid="backup-restore-modal"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-xl border border-stroke-subtle bg-surface-base shadow-2xl text-content-primary overflow-hidden transition-all my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-6 py-4 bg-surface-canvas">
          <div className="flex items-center gap-2.5">
            <Archive className="h-5 w-5 text-accent" />
            <h2 id="backup-modal-title" className="text-lg font-semibold tracking-tight">
              Project Data Protection & Recovery
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting || isRestoring}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stroke-subtle bg-surface-base px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            data-testid="tab-backup"
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'backup'
                ? 'border-accent text-accent'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Download className="h-4 w-4" />
            Backup All Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            data-testid="tab-restore"
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'restore'
                ? 'border-accent text-accent'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Upload className="h-4 w-4" />
            Restore Backup
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-content-primary">
                      Browser-Local Data Protection
                    </h3>
                    <p className="mt-1 text-xs text-content-secondary leading-relaxed">
                      All GB Coder projects are stored directly in this browser&apos;s IndexedDB.
                      Exporting creates a versioned, portable <code className="text-accent">.zip</code> archive
                      containing every project, all source files, metadata, and SHA-256 integrity checksums.
                      No external server or cloud account required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Local Storage Summary */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3.5">
                  <span className="text-xs text-content-muted">Stored Projects</span>
                  <p className="text-xl font-semibold mt-0.5 text-content-primary">
                    {projects.length}
                  </p>
                </div>
                <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3.5">
                  <span className="text-xs text-content-muted">Security & Integrity</span>
                  <p className="text-sm font-medium mt-1 text-emerald-400 flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4" />
                    SHA-256 Verified
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              {isExporting && (
                <div className="space-y-2 rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center justify-between text-xs text-content-secondary">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                      {exportStage || 'Generating archive…'}
                    </span>
                    <span className="font-mono">{exportPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-canvas">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${exportPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Export Success */}
              {exportResult && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold">Backup downloaded successfully!</p>
                      <p className="text-xs text-emerald-400/80 mt-0.5">
                        {exportResult.filename} ({formatBytes(exportResult.sizeBytes)} • {exportResult.projectCount} projects • {exportResult.fileCount} files)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Error */}
              {exportError && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-medium">{exportError}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="rounded-lg border border-stroke-subtle px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleStartExport}
                  disabled={isExporting}
                  data-testid="btn-export-backup"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export All Projects (.zip)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="space-y-5">
              {/* If no analysis yet, show upload area */}
              {!analysis && !restoreResult && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stroke-subtle bg-surface-canvas p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-surface-hover/40 transition-colors"
                  >
                    <FolderArchive className="h-10 w-10 text-content-muted mb-3" />
                    <p className="text-sm font-semibold text-content-primary">
                      Select or drop a GB Coder backup archive
                    </p>
                    <p className="text-xs text-content-secondary mt-1">
                      Accepts <code className="text-accent">gb-coder-backup-*.zip</code>
                    </p>
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-stroke-subtle bg-surface-base px-3.5 py-2 text-xs font-medium text-content-primary hover:bg-surface-hover transition-colors"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                          Validating archive…
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          Browse File
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={handleFileChange}
                      data-testid="input-restore-file"
                    />
                  </div>

                  <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3 text-xs text-content-secondary leading-relaxed">
                    <span className="font-semibold text-content-primary">Safe Restore Guarantee: </span>
                    Restoration is non-destructive. If an imported project ID already exists, GB Coder automatically creates a safe separate copy with a <code>(Restored)</code> suffix so your current work is never overwritten.
                  </div>
                </div>
              )}

              {/* Analysis / Restore Plan Preview */}
              {analysis && !restoreResult && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3">
                      <span className="text-content-muted">Projects</span>
                      <p className="text-base font-semibold text-content-primary mt-0.5">
                        {analysis.plan.projects.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3">
                      <span className="text-content-muted">Total Files</span>
                      <p className="text-base font-semibold text-content-primary mt-0.5">
                        {analysis.plan.totalFilesToRestore}
                      </p>
                    </div>
                    <div className="rounded-lg border border-stroke-subtle bg-surface-canvas p-3">
                      <span className="text-content-muted">ID Collisions</span>
                      <p className={`text-base font-semibold mt-0.5 ${
                        analysis.plan.conflictsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {analysis.plan.conflictsCount > 0 ? `${analysis.plan.conflictsCount} (Safe Copy)` : '0 (Clean)'}
                      </p>
                    </div>
                  </div>

                  {/* Conflict Notice if any */}
                  {analysis.plan.conflictsCount > 0 && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-semibold">Safe Conflict Resolution: </span>
                        {analysis.plan.conflictsCount} project(s) match existing local IDs. They will be restored as safe duplicate copies to avoid overwriting your current work.
                      </div>
                    </div>
                  )}

                  {/* Project List */}
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-stroke-subtle bg-surface-canvas divide-y divide-stroke-subtle">
                    {analysis.plan.projects.map((p) => (
                      <div key={p.originalId} className="flex items-center justify-between p-2.5 text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-medium text-content-primary truncate">
                            {p.targetName}
                          </p>
                          <p className="text-[11px] text-content-muted">
                            {p.fileCount} files • {p.projectType} • {p.editorStyle === 'vscode' ? 'VS Code' : 'Plain'}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            p.conflict
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {p.conflict ? 'Copy (Conflict)' : 'New'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Optional Restorations */}
                  <div className="space-y-2 pt-1">
                    {analysis.plan.hasWorkspace && (
                      <label className="flex items-center gap-2 text-xs text-content-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreWorkspace}
                          onChange={(e) => setRestoreWorkspace(e.target.checked)}
                          className="rounded border-stroke-subtle text-accent focus:ring-accent"
                        />
                        <span>Restore VS Code workspace state</span>
                      </label>
                    )}
                    {analysis.plan.hasPreferences && (
                      <label className="flex items-center gap-2 text-xs text-content-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restorePreferences}
                          onChange={(e) => setRestorePreferences(e.target.checked)}
                          className="rounded border-stroke-subtle text-accent focus:ring-accent"
                        />
                        <span>Restore user settings and editor preferences</span>
                      </label>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAnalysis(null)}
                      disabled={isRestoring}
                      data-testid="btn-cancel-restore"
                      className="rounded-lg border border-stroke-subtle px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
                    >
                      Choose Different Archive
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      disabled={isRestoring}
                      data-testid="btn-confirm-restore"
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Restoring Projects…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Confirm & Restore Projects
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Restore Result Card */}
              {restoreResult && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
                    <h3 className="text-base font-semibold">Restore Completed Successfully!</h3>
                    <p className="text-xs text-emerald-400/80 mt-1">
                      Restored {restoreResult.restoredProjectCount} project(s) and {restoreResult.restoredFileCount} files to your browser storage.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                      Done & View Projects
                    </button>
                  </div>
                </div>
              )}

              {/* Restore Error Banner */}
              {restoreError && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-medium">{restoreError}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreModal;
