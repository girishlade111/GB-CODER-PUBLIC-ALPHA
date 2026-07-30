import type { Monaco } from '@monaco-editor/react';

export const GB_CODER_MONACO_THEME = 'gb-coder-dark';

/**
 * Registers a Monaco theme that matches the app palette.
 *
 * The stock `vs-dark` theme paints a #1e1e1e canvas, which reads as a lighter
 * mismatched slab against the #111111 editor panels.
 *
 * Shared by every editor surface (the plain-mode panels and the multi-file
 * pane) so whichever mounts first, the theme exists.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e4e4e7', background: '0a0a0a' },
      { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c4b5fd' },
      { token: 'string', foreground: '86efac' },
      { token: 'number', foreground: 'fdba74' },
      { token: 'type', foreground: '7dd3fc' },
      { token: 'tag', foreground: 'f0abfc' },
      { token: 'attribute.name', foreground: 'fcd34d' },
      { token: 'attribute.value', foreground: '86efac' },
    ],
    colors: {
      'editor.background': '#0a0a0a',
      'editor.foreground': '#e4e4e7',
      'editorLineNumber.foreground': '#3f3f46',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editor.lineHighlightBackground': '#18181b',
      'editor.selectionBackground': '#7c3aed40',
      'editor.inactiveSelectionBackground': '#7c3aed26',
      'editorCursor.foreground': '#7c3aed',
      'editorIndentGuide.background': '#1f1f23',
      'editorIndentGuide.activeBackground': '#3f3f46',
      'editorWidget.background': '#18181b',
      'editorWidget.border': '#27272a',
      'editorSuggestWidget.background': '#18181b',
      'editorSuggestWidget.border': '#27272a',
      'editorSuggestWidget.selectedBackground': '#27272a',
      'editorGutter.background': '#0a0a0a',
      'scrollbarSlider.background': '#3f3f4680',
      'scrollbarSlider.hoverBackground': '#52525b99',
      'scrollbarSlider.activeBackground': '#52525bcc',
    },
  });
};
