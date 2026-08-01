/**
 * Drag-and-drop wiring for imports.
 *
 * This hook is the *only* import-related code in the initial bundle, and it is
 * deliberately tiny: it tracks drag state and, on drop, collects the browser's
 * transfer items. Everything that understands those items — JSZip, archive
 * traversal, project detection — is fetched with a dynamic `import()` at the
 * moment of the first drop.
 *
 * ## Why the listeners are on `window`
 *
 * These used to be React props spread onto the editor view's root element. That
 * had two failure modes, both of which shipped:
 *
 *  1. Any child that called `stopPropagation()` on `drop` silently swallowed the
 *     import. The editor panels do exactly that, and they cover most of the
 *     screen, so the most natural place to drop a project was the one place that
 *     could not accept one.
 *  2. Views that render their own tree — VS Code mode, every routed legal page —
 *     never had the props at all, so dragging a project in did nothing.
 *
 * Listening on `window` fixes both: there is one drop target, it is the whole
 * window, and it exists in every view. Panels that want to claim a single file
 * for themselves still can, by calling `stopPropagation()` — but only when they
 * genuinely handle the drop (see `EditorPanel`).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImportPlan } from '../services/import/importEngine';
import { carriesFiles, collectTransfer } from '../utils/dropTransfer';
import { loadChunk } from '../utils/loadChunk';

export interface ImportDropState {
  /** True while a drag carrying files is over the window. */
  isDragging: boolean;
  /** True while the import chunk is being fetched or a plan is being built. */
  isPreparing: boolean;
  /**
   * The single import entry point. Used by the drop handler, the Import
   * dialog's file and folder pickers, and its URL field, so that detection runs
   * identically no matter how the files arrived.
   */
  importFiles: (files: File[]) => Promise<void>;
}

interface UseImportDropOptions {
  onPlan: (plan: ImportPlan) => void;
  onError: (message: string) => void;
  /** Disables the drop target, e.g. while the review modal owns the screen. */
  disabled?: boolean;
}

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

  /** Loads the engine and builds a plan. The only dynamic import here. */
  const process = useCallback(
    async (input: {
      files?: File[];
      entries?: unknown[];
      handles?: Promise<unknown>[];
      unreadableDirectories?: string[];
    }) => {
      setIsPreparing(true);
      try {
        /*
         * Routed through `loadChunk` because this is the single chunk every
         * import path depends on. When a deploy invalidated it, the raw dynamic
         * import failed with "Failed to fetch dynamically imported module" and
         * took drag-and-drop, Choose files, Choose folder and URL import down
         * together, with an error that pointed at nothing the user could act on.
         */
        const engine = await loadChunk(
          () => import('../services/import/importEngine'),
          'The import engine',
        );
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

  /*
   * The listeners are attached once and read the latest `disabled`/`process`
   * through refs. Re-subscribing on every render would drop a drag that was
   * already in progress.
   */
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const processRef = useRef(process);
  processRef.current = process;

  useEffect(() => {
    const stopDragging = () => {
      dragDepth.current = 0;
      setIsDragging(false);
    };

    const onDragEnter = (event: DragEvent) => {
      if (disabledRef.current || !carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (disabledRef.current || !carriesFiles(event.dataTransfer)) return;
      /*
       * preventDefault has to run on EVERY dragover, not just the first one.
       * The browser re-evaluates whether the element under the cursor is a valid
       * drop target on each event, so skipping even one reverts to the default
       * action and no `drop` is ever fired.
       */
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      /*
       * Recovers the overlay if `dragenter` was missed — it can be swallowed by
       * a child, or fire before this listener attached on a fast drag.
       */
      if (dragDepth.current === 0) {
        dragDepth.current = 1;
        setIsDragging(true);
      }
    };

    const onDragLeave = (event: DragEvent) => {
      if (disabledRef.current) return;
      // Leaving the window entirely reports a null relatedTarget.
      if (!event.relatedTarget) {
        stopDragging();
        return;
      }
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    };

    const onDrop = (event: DragEvent) => {
      stopDragging();
      if (disabledRef.current) return;
      if (!carriesFiles(event.dataTransfer)) return;

      // Stops the browser navigating away to the dropped file.
      event.preventDefault();

      const { entries, files, handles, unreadableDirectories } = collectTransfer(
        event.dataTransfer,
      );
      /*
       * `unreadableDirectories` counts as something to report: a folder we could
       * not open must produce an explanation, not a silent no-op.
       */
      if (
        entries.length === 0 &&
        files.length === 0 &&
        handles.length === 0 &&
        unreadableDirectories.length === 0
      ) {
        return;
      }
      void processRef.current({ entries, files, handles, unreadableDirectories });
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    // A drag that ends outside the window never fires drop; reset defensively.
    window.addEventListener('dragend', stopDragging);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragend', stopDragging);
    };
  }, []);

  const importFiles = useCallback((files: File[]) => process({ files }), [process]);

  return { isDragging, isPreparing, importFiles };
};
