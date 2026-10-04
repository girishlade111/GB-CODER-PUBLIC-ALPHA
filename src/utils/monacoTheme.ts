import type { Monaco } from '@monaco-editor/react';

export const GB_CODER_MONACO_THEME = 'gb-coder-product';

/**
 * Registers the single DESIGN.md Monaco theme.
 *
 * DESIGN.md puts the product's own chrome — code editors above all — on the
 * dark warm-navy product surface rather than on the cream canvas. The editor is
 * the one surface in the app a user stares at for an hour, so it takes the
 * navy; everything around it stays cream.
 *
 * Syntax colours are drawn from the documented palette only: coral for
 * keywords and tags, teal for strings, amber for numbers and functions, the
 * muted tone for comments. No hue appears here that isn't in DESIGN.md.
 *
 * There is no light variant — the system defines one surface for code, so
 * there is no theme switching to do.
 *
 * Shared by every editor surface (plain-mode panels, multi-file pane, VS Code
 * mode) so whichever mounts first, the theme exists.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'faf9f5', background: '181715' },
      { token: 'comment', foreground: '6f6b63', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cc785c' },
      { token: 'string', foreground: '5db8a6' },
      { token: 'number', foreground: 'e8a55a' },
      { token: 'type', foreground: 'e8c9b4' },
      { token: 'tag', foreground: 'cc785c' },
      { token: 'attribute.name', foreground: 'e8c9b4' },
      { token: 'attribute.value', foreground: '5db8a6' },
      { token: 'function', foreground: 'e8a55a' },
      { token: 'variable', foreground: 'faf9f5' },
      { token: 'delimiter', foreground: 'a09d96' },
      { token: 'operator', foreground: 'a09d96' },
      { token: 'regexp', foreground: '5db8a6' },
      { token: 'constant', foreground: 'e8a55a' },
    ],
    colors: {
      'editor.background': '#181715',
      'editor.foreground': '#faf9f5',
      'editorLineNumber.foreground': '#5c5952',
      'editorLineNumber.activeForeground': '#a09d96',
      'editor.lineHighlightBackground': '#1f1e1b',
      'editor.selectionBackground': '#cc785c3d',
      'editor.inactiveSelectionBackground': '#cc785c1f',
      'editor.selectionHighlightBackground': '#cc785c26',
      'editorCursor.foreground': '#cc785c',
      'editorIndentGuide.background1': '#2a2825',
      'editorIndentGuide.activeBackground1': '#4a4640',
      'editorWidget.background': '#252320',
      'editorWidget.border': '#3a3631',
      'editorSuggestWidget.background': '#252320',
      'editorSuggestWidget.border': '#3a3631',
      'editorSuggestWidget.selectedBackground': '#1f1e1b',
      'editorHoverWidget.background': '#252320',
      'editorHoverWidget.border': '#3a3631',
      'editorGutter.background': '#181715',
      'editorGutter.modifiedBackground': '#cc785c66',
      'minimap.background': '#181715',
      'scrollbarSlider.background': '#faf9f514',
      'scrollbarSlider.hoverBackground': '#faf9f52e',
      'scrollbarSlider.activeBackground': '#faf9f545',
    },
  });
};

export const monacoThemeFor = (_isDark?: boolean): string => {
  void _isDark;
  return GB_CODER_MONACO_THEME;
};