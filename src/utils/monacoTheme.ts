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
      { token: '', foreground: 'e8e8e8', background: '0d0d0d' },
      { token: 'comment', foreground: '5c5c5c', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'e07856' },
      { token: 'string', foreground: '3ecf5e' },
      { token: 'number', foreground: 'e07856' },
      { token: 'type', foreground: '8a8a8a' },
      { token: 'tag', foreground: 'e07856' },
      { token: 'attribute.name', foreground: 'e8e8e8' },
      { token: 'attribute.value', foreground: '3ecf5e' },
    ],
    colors: {
      'editor.background': '#0d0d0d',
      'editor.foreground': '#e8e8e8',
      'editorLineNumber.foreground': '#5c5c5c',
      'editorLineNumber.activeForeground': '#8a8a8a',
      'editor.lineHighlightBackground': '#161616',
      'editor.selectionBackground': '#e0785633',
      'editor.inactiveSelectionBackground': '#e078561a',
      'editorCursor.foreground': '#e07856',
      'editorIndentGuide.background': '#1c1c1c',
      'editorIndentGuide.activeBackground': '#2a2a2a',
      'editorWidget.background': '#161616',
      'editorWidget.border': '#2a2a2a',
      'editorSuggestWidget.background': '#161616',
      'editorSuggestWidget.border': '#2a2a2a',
      'editorSuggestWidget.selectedBackground': '#1c1c1c',
      'editorGutter.background': '#0d0d0d',
      'scrollbarSlider.background': '#2a2a2a80',
      'scrollbarSlider.hoverBackground': '#3a3a3a99',
      'scrollbarSlider.activeBackground': '#3a3a3acc',
    },
  });
};
