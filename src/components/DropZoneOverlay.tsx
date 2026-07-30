import React from 'react';
import { FileArchive, FolderOpen, Loader2, Upload } from 'lucide-react';

/**
 * Full-window drop affordance.
 *
 * Part of the core bundle on purpose: the drop zone has to be visible the
 * instant a user drags something in, before any import code has been fetched.
 * It is presentation only — a few icons and text, no import logic — and the
 * chunk that can actually read the drop is requested when the drop happens.
 */

interface DropZoneOverlayProps {
  isDragging: boolean;
  /** True once a drop has landed and the import chunk is loading. */
  isPreparing: boolean;
}

const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ isDragging, isPreparing }) => {
  if (!isDragging && !isPreparing) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm animate-fade-in"
      // Pointer events stay off so the drag continues to reach the real target.
      style={{ pointerEvents: 'none' }}
      data-testid="drop-overlay"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border-2 border-dashed border-accent/70 bg-surface-raised/95 px-10 py-8 text-center shadow-2xl">
        {isPreparing ? (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-accent" />
            <p className="text-base font-semibold text-content-primary">Reading your project…</p>
            <p className="mt-1 text-xs text-content-muted">
              Loading the importer and scanning files
            </p>
          </>
        ) : (
          <>
            <Upload className="mx-auto mb-3 h-8 w-8 text-accent" />
            <p className="text-base font-semibold text-content-primary">Drop to import</p>
            <div className="mt-3 flex items-center justify-center gap-5 text-xs text-content-secondary">
              <span className="flex items-center gap-1.5">
                <FileArchive className="h-4 w-4" />
                .zip archive
              </span>
              <span className="flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4" />
                folder
              </span>
              <span className="flex items-center gap-1.5">
                <Upload className="h-4 w-4" />
                single files
              </span>
            </div>
            <p className="mt-3 text-[11px] text-content-muted">
              node_modules, .git, dist and build folders are skipped automatically
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DropZoneOverlay;
