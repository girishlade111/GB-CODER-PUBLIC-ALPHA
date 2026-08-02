import { useEffect } from 'react';

export interface AppShortcutHandlers {
  /** Ctrl/Cmd+Shift+E */
  onOpenExport?: () => void;
  /** Ctrl/Cmd+Shift+I */
  onOpenImport?: () => void;
  /** Ctrl/Cmd+Shift+S */
  onQuickScreenshot?: () => void;
  /** Ctrl/Cmd+S */
  onSave?: () => void;
}

/**
 * Global keyboard shortcuts.
 *
 * This is the app's first real key handler — every entry in the shortcuts help
 * dialog was previously either a Monaco built-in or aspirational, so no chord
 * was actually claimed at the app level.
 *
 * Deliberately narrow: only Ctrl/Cmd+Shift combinations, and never while the
 * user is typing in an input, textarea or the code editor, so nothing is
 * stolen from Monaco.
 */
export const useAppShortcuts = ({
  onOpenExport,
  onOpenImport,
  onQuickScreenshot,
  onSave,
}: AppShortcutHandlers): void => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier || event.altKey) return;

      const code = event.code;

      if (!event.shiftKey) {
        if (code === 'KeyS' && onSave) {
          event.preventDefault();
          event.stopPropagation();
          onSave();
        }
        return;
      }

      // `event.key` is unreliable with Shift across layouts; `code` is stable.
      if (code !== 'KeyE' && code !== 'KeyI' && code !== 'KeyS') return;

      const action =
        code === 'KeyE' ? onOpenExport : code === 'KeyI' ? onOpenImport : onQuickScreenshot;
      if (!action) return;

      event.preventDefault();
      // Some chords (Cmd+Shift+I opens devtools) also have browser meaning;
      // stopping propagation at least keeps the app from double-handling.
      event.stopPropagation();
      action();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenExport, onOpenImport, onQuickScreenshot, onSave]);
};

/** Rendered in the shortcuts help dialog. */
export const APP_SHORTCUTS: { keys: string; description: string }[] = [
  { keys: 'Ctrl/Cmd+S', description: 'Format and Save code' },
  { keys: 'Ctrl/Cmd+Shift+E', description: 'Open Export & Share' },
  { keys: 'Ctrl/Cmd+Shift+I', description: 'Open Import dialog' },
  { keys: 'Ctrl/Cmd+Shift+S', description: 'Save screenshot as PNG' },
];
