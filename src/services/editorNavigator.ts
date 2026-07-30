/**
 * Editor navigation registry — "jump to line:column and highlight it".
 *
 * Needed because nothing in the app could previously move the cursor
 * programmatically: there was no `revealLine`, no decorations, and no marker
 * code anywhere, and in multi-file mode the Monaco instance was discarded on
 * mount instead of being retained.
 *
 * Both the Console (stack frames) and the Validator (problem rows) navigate
 * through this single seam, so the two features cannot drift apart.
 */

/**
 * Structural subset of Monaco's editor we depend on. Typing it here rather than
 * importing monaco keeps this module free of the 3 MB editor bundle -- it is
 * imported by panels that must stay lightweight.
 */
interface MonacoEditorLike {
  revealLineInCenterIfOutsideViewport?: (line: number) => void;
  revealLineInCenter?: (line: number) => void;
  setPosition: (position: { lineNumber: number; column: number }) => void;
  focus: () => void;
  getDomNode?: () => HTMLElement | null;
  getModel?: () => { getLineCount?: () => number; getLineMaxColumn?: (line: number) => number } | null;
  createDecorationsCollection?: (decorations: unknown[]) => { clear: () => void };
  deltaDecorations?: (oldIds: string[], decorations: unknown[]) => string[];
}

/**
 * Editor target key. Plain projects use the three fixed editors; multi-file
 * projects use the file path.
 */
export type EditorKey = 'html' | 'css' | 'javascript' | (string & {});

export interface NavigationTarget {
  file: EditorKey;
  line: number;
  /** 1-based. Defaults to the start of the line. */
  column?: number;
}

/**
 * Called before navigating, so the host can make the target editor visible --
 * opening a file tab in multi-file mode, or expanding a collapsed panel in
 * plain mode. Returning a promise lets the caller await the mount.
 */
export type ActivationHandler = (file: EditorKey) => void | Promise<void>;

/** How long the jump highlight stays on screen. */
const HIGHLIGHT_DURATION_MS = 1600;

/** CSS class applied to the highlighted line. Defined in index.css. */
export const JUMP_HIGHLIGHT_CLASS = 'gb-jump-highlight';

class EditorNavigator {
  private readonly editors = new Map<EditorKey, MonacoEditorLike>();
  private activationHandler: ActivationHandler | null = null;
  private clearHighlight: (() => void) | null = null;
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  /** Called from each editor's `onMount`. */
  public register(key: EditorKey, editor: MonacoEditorLike): void {
    this.editors.set(key, editor);
  }

  public unregister(key: EditorKey): void {
    this.editors.delete(key);
  }

  /** Drops every registration, e.g. when the editor surface is swapped out. */
  public reset(): void {
    this.editors.clear();
  }

  public has(key: EditorKey): boolean {
    return this.editors.has(key);
  }

  public setActivationHandler(handler: ActivationHandler | null): void {
    this.activationHandler = handler;
  }

  /**
   * Reveals and highlights a location.
   *
   * @returns true when an editor was found and moved. Callers use this to avoid
   *          claiming success -- a stack frame pointing into a bundle has
   *          nowhere to go, and silently doing nothing would be worse than
   *          reporting it.
   */
  public async reveal(target: NavigationTarget): Promise<boolean> {
    const { file, line } = target;
    if (!Number.isFinite(line) || line < 1) return false;

    // Let the host switch tabs / expand panels first, then wait a frame for the
    // editor to mount before looking it up again.
    if (this.activationHandler) {
      await this.activationHandler(file);
      if (!this.editors.has(file)) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }

    const editor = this.editors.get(file);
    if (!editor) return false;

    try {
      return this.revealIn(editor, target);
    } catch {
      /*
       * A disposed editor throws on every call. Drop it and report failure
       * rather than surfacing an exception from a click on a log line.
       */
      this.editors.delete(file);
      return false;
    }
  }

  private revealIn(editor: MonacoEditorLike, target: NavigationTarget): boolean {
    const { line } = target;

    // Clamp to the model so a stale diagnostic cannot throw or scroll to a
    // line that no longer exists after an edit.
    const model = editor.getModel?.();
    const lineCount = model?.getLineCount?.() ?? line;
    const safeLine = Math.min(Math.max(1, line), Math.max(1, lineCount));
    const maxColumn = model?.getLineMaxColumn?.(safeLine) ?? Number.MAX_SAFE_INTEGER;
    const safeColumn = Math.min(Math.max(1, target.column ?? 1), maxColumn);

    if (editor.revealLineInCenter) editor.revealLineInCenter(safeLine);
    else editor.revealLineInCenterIfOutsideViewport?.(safeLine);

    editor.setPosition({ lineNumber: safeLine, column: safeColumn });
    editor.focus();

    // Bring the editor itself into view: in plain mode the three panels are
    // stacked in a scrolling column, so revealing the line is not enough.
    editor.getDomNode?.()?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    this.applyHighlight(editor, safeLine);
    return true;
  }

  /** Transient full-line highlight, cleared on a timer or by the next jump. */
  private applyHighlight(editor: MonacoEditorLike, line: number): void {
    this.clearHighlight?.();
    if (this.highlightTimer !== null) clearTimeout(this.highlightTimer);

    const decoration = {
      range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: JUMP_HIGHLIGHT_CLASS,
        // Keeps the jump visible in the overview ruler while it lasts.
        overviewRuler: { color: '#7c3aed', position: 4 },
      },
    };

    if (editor.createDecorationsCollection) {
      const collection = editor.createDecorationsCollection([decoration]);
      this.clearHighlight = () => collection.clear();
    } else if (editor.deltaDecorations) {
      const ids = editor.deltaDecorations([], [decoration]);
      this.clearHighlight = () => editor.deltaDecorations?.(ids, []);
    } else {
      this.clearHighlight = null;
      return;
    }

    this.highlightTimer = setTimeout(() => {
      this.clearHighlight?.();
      this.clearHighlight = null;
      this.highlightTimer = null;
    }, HIGHLIGHT_DURATION_MS);
  }
}

export const editorNavigator = new EditorNavigator();
