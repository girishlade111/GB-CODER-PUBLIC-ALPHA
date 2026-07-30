/**
 * Drag-and-drop wiring for imports.
 *
 * This hook is the *only* import-related code in the initial bundle, and it is
 * deliberately tiny: it tracks drag state and, on drop, collects the browser's
 * transfer items. Everything that understands those items — JSZip, archive
 * traversal, project detection — is fetched with a dynamic `import()` at the
 * moment of the first drop.
 *
 * The synchronous collection step cannot be deferred. `DataTransferItem` objects
 * are invalidated as soon as the drop event handler returns, so
 * `webkitGetAsEntry()` has to be called before any `await`. The resulting
 * `FileSystemEntry` objects *do* survive, so they are handed to the lazy chunk
 * for traversal.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImportPlan } from '../services/import/importEngine';

export interface ImportDropState {
  /** True while a drag carrying files is over the window. */
  isDragging: boolean;
  /** True while the import chunk is being fetched or a plan is being built. */
  isPreparing: boolean;
  /** Handlers to spread onto a drop target. */
  dropHandlers: {
    onDragEnter: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent) => void;
  };
  /** Opens the OS picker; used by the sidebar Import button. */
  importFiles: (files: File[]) => Promise<void>;
}

interface UseImportDropOptions {
  onPlan: (plan: ImportPlan) => void;
  onError: (message: string) => void;
  /** Disables the drop target, e.g. while a modal owns the screen. */
  disabled?: boolean;
}

/** True when a drag actually carries files rather than selected text. */
const carriesFiles = (event: React.DragEvent): boolean => {
  const types = event.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes('Files');
};

export const useImportDrop = ({
  onPlan,
  onError,
  disabled = false,
}: UseImportDropOptions): ImportDropState => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  /*
   * dragenter/dragleave fire for every child element crossed, so a boolean flag
   * flickers. Counting enters and leaves is what makes the overlay stable.
   */
  const dragDepth = useRef(0);

  // A drag that ends outside the window never fires drop; reset defensively.
  useEffect(() => {
    const reset = () => {
      dragDepth.current = 0;
      setIsDragging(false);
    };
    window.addEventListener('dragend', reset);
    window.addEventListener('drop', reset);
    return () => {
      window.removeEventListener('dragend', reset);
      window.removeEventListener('drop', reset);
    };
  }, []);

  /** Loads the engine and builds a plan. The only dynamic import here. */
  const process = useCallback(
    async (input: { files?: File[]; entries?: unknown[] }) => {
      setIsPreparing(true);
      try {
        const engine = await import('../services/import/importEngine');
        const plan = await engine.buildImportPlan(input);
        onPlan(plan);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'That import could not be read.');
      } finally {
        setIsPreparing(false);
      }
    },
    [onPlan, onError],
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !carriesFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    },
    [disabled],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !carriesFiles(event)) return;
      // Without preventDefault the browser navigates to the dropped file.
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    () => {
      if (disabled) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    },
    [disabled],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);

      const transfer = event.dataTransfer;
      if (!transfer) return;

      /*
       * Collected synchronously, before the handler yields. `items` is preferred
       * because it exposes directory entries; `files` alone cannot represent a
       * dropped folder.
       */
      const entries: unknown[] = [];
      const files: File[] = [];

      if (transfer.items && transfer.items.length > 0) {
        for (const item of Array.from(transfer.items)) {
          if (item.kind !== 'file') continue;
          const asEntry = item.webkitGetAsEntry?.();
          if (asEntry) entries.push(asEntry);
          else {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      } else if (transfer.files) {
        files.push(...Array.from(transfer.files));
      }

      if (entries.length === 0 && files.length === 0) return;
      void process({ entries, files });
    },
    [disabled, process],
  );

  const importFiles = useCallback((files: File[]) => process({ files }), [process]);

  return {
    isDragging,
    isPreparing,
    dropHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
    importFiles,
  };
};
