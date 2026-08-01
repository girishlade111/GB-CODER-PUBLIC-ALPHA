import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileArchive, FolderOpen, Link2, Loader2, Upload, X } from 'lucide-react';
import { ImportWarning, importFromUrl } from '../services/projectImportService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * The shared import entry point (`useImportDrop().importFiles`). Routing the
   * pickers and the URL field through the same function the drop handler uses is
   * what makes project detection — and therefore full-stack VS Code mode —
   * behave identically no matter how the files arrived.
   *
   * This replaced a second, older pipeline (`projectImportService.importFromFiles`)
   * that never called `detectProject`, which is why click-upload could import a
   * full-stack project and silently load it into the plain editors.
   */
  onFiles: (files: File[]) => Promise<void>;
  /** Drag state from the window-level handler, for the dashed box highlight. */
  isDragging?: boolean;
}

/**
 * Import dialog: drag-and-drop, a file/folder picker, .zip archives, and remote
 * URLs including GitHub Gists and blob links.
 *
 * The previous flow was a single hidden input with `webkitdirectory` always set,
 * which in Chrome forced folder-only selection and accepted just .html/.css/.js.
 */
const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onFiles, isDragging = false }) => {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ImportWarning[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setWarnings([]);
      setUrl('');
      setBusy(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /**
   * Hands files to the shared importer. The review dialog it opens is rendered by
   * App, so this dialog just needs to stop showing a spinner afterwards.
   */
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setBusy(true);
      setError(null);
      setWarnings([]);
      try {
        await onFiles(files);
      } catch (importError) {
        setError(importError instanceof Error ? importError.message : 'Import failed.');
      } finally {
        setBusy(false);
      }
    },
    [onFiles],
  );

  const handleUrlImport = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    setWarnings([]);
    try {
      /*
       * The importer engine reads File objects, not URLs, so the fetch still
       * goes through projectImportService — but its output is converted back into
       * Files and pushed through the shared path so a pasted URL gets the same
       * detection and review step as a drop.
       */
      const fetched = await importFromUrl(url);
      setWarnings(fetched.warnings);
      if (fetched.files.length === 0) {
        setError('No importable files were found at that URL.');
        return;
      }
      await onFiles(
        fetched.files.map((file) => new File([file.content], file.path, { type: 'text/plain' })),
      );
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Could not fetch that URL.');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-raised shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-stroke-subtle p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-accent-subtle p-2 text-accent-hover">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Import</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                Files, folders, .zip archives, or a URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
            aria-label="Close import"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          {/* Drop zone */}
          {/*
            No drop handlers of its own. The window-level handler already covers
            every pixel, and it is the only one that can read a dropped *folder*
            (`webkitGetAsEntry`) — this box used to read `dataTransfer.files`,
            which is always empty for a folder, so dropping one here did nothing.
            `isDragging` comes from that same handler purely to highlight the box.
          */}
          <div
            data-testid="import-dropzone"
            className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors ${
              isDragging
                ? 'border-accent bg-accent-subtle'
                : 'border-stroke-strong bg-surface-overlay'
            }`}
          >
            {busy ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <p className="text-sm text-content-secondary">Importing…</p>
              </>
            ) : (
              <>
                <FileArchive className="h-6 w-6 text-content-muted" />
                <p className="text-sm font-medium text-content-secondary">
                  Drop files, a folder or a .zip here
                </p>
                <p className="text-xs text-content-muted">
                  .html .css .js .jsx .ts .tsx .vue .json
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover"
                  >
                    Choose files
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-md border border-stroke-subtle px-3 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:text-content-primary"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Choose folder
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Separate inputs: one for files (incl. .zip), one for folders. A single
              input with webkitdirectory cannot do both. */}
          <input
            ref={fileInputRef}
            id="import-file-input"
            aria-label="Choose files to import"
            type="file"
            multiple
            accept=".html,.htm,.css,.js,.mjs,.cjs,.jsx,.ts,.tsx,.vue,.json,.md,.txt,.zip"
            className="hidden"
            onChange={(event) => {
              void handleFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <input
            ref={folderInputRef}
            id="import-folder-input"
            aria-label="Choose a folder to import"
            type="file"
            multiple
            /*
             * Both spellings, as bare (empty-string) attributes. `webkitdirectory`
             * is what Chromium and current Firefox honour; `directory` is the
             * older Gecko spelling and is harmless where it is not recognised.
             */
            // @ts-expect-error — non-standard but widely supported
            webkitdirectory=""
            directory=""
            className="hidden"
            onChange={(event) => {
              void handleFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />

          {/* URL / Gist import */}
          <div>
            <label htmlFor="import-url" className="mb-2 block text-xs font-medium uppercase tracking-wide text-content-muted">
              Import from URL
            </label>
            <div className="flex gap-1">
              <input
                id="import-url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleUrlImport();
                }}
                placeholder="https://gist.github.com/... or a raw file URL"
                className="min-w-0 flex-1 rounded-md border border-stroke-subtle bg-surface-overlay px-2 py-1.5 font-mono text-xs text-content-primary placeholder-content-muted outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={() => void handleUrlImport()}
                disabled={!url.trim() || busy}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-overlay disabled:text-content-muted"
              >
                <Link2 className="h-3.5 w-3.5" />
                Fetch
              </button>
            </div>
            <p className="mt-2 text-[11px] text-content-muted">
              GitHub Gist and blob links are converted to their raw form automatically. Other hosts
              must allow cross-origin requests.
            </p>
          </div>

          {error && (
            <p className="rounded-md border border-red-700/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {warnings.length > 0 && (
            <div className="rounded-md border border-amber-700/50 bg-amber-500/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                {warnings.length} file{warnings.length === 1 ? '' : 's'} skipped
              </p>
              <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">
                {warnings.slice(0, 12).map((warning) => (
                  <li key={warning.file} className="truncate font-mono text-[11px] text-amber-200/80">
                    {warning.file} — {warning.reason}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs font-medium text-amber-200 underline underline-offset-2"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
