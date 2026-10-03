import type { Monaco } from '@monaco-editor/react';

export const GB_CODER_MONACO_DARK_THEME = 'gb-coder-dark';
export const GB_CODER_MONACO_LIGHT_THEME = 'gb-coder-light';
/** Back-compat alias — prefer the explicit DARK/LIGHT constants. */
export const GB_CODER_MONACO_THEME = GB_CODER_MONACO_DARK_THEME;

/**
 * Registers Monaco themes matching the app palette (DESIGN.md light default,
 * quiet dark under `.dark`).
 *
 * Light: warm cream canvas-soft #fafaf7 pane on #ffffff card, ink #26251e
 * text, Cursor Orange #f54e00 keywords, success green strings.
 * Dark: near-black #0d0d0d canvas preserved from the previous theme.
 *
 * Shared by every editor surface (plain-mode panels, multi-file pane, VS Code
 * mode) so whichever mounts first, both themes exist.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  monaco.editor.defineTheme(GB_CODER_MONACO_DARK_THEME, {
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

  monaco.editor.defineTheme(GB_CODER_MONACO_LIGHT_THEME, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '26251e', background: 'fafaf7' },
      { token: 'comment', foreground: '807d72', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'd04200' },
      { token: 'string', foreground: '1f8a65' },
      { token: 'number', foreground: 'c08532' },
      { token: 'type', foreground: '5a5852' },
      { token: 'tag', foreground: 'd04200' },
      { token: 'attribute.name', foreground: '26251e' },
      { token: 'attribute.value', foreground: '1f8a65' },
    ],
    colors: {
      'editor.background': '#fafaf7',
      'editor.foreground': '#26251e',
      'editorLineNumber.foreground': '#a09c92',
      'editorLineNumber.activeForeground': '#5a5852',
      'editor.lineHighlightBackground': '#efeee8',
      'editor.selectionBackground': '#f54e0026',
      'editor.inactiveSelectionBackground': '#f54e0014',
      'editorCursor.foreground': '#f54e00',
      'editorIndentGuide.background': '#efeee8',
      'editorIndentGuide.activeBackground': '#cfcdc4',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#e6e5e0',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#e6e5e0',
      'editorSuggestWidget.selectedBackground': '#efeee8',
      'editorGutter.background': '#fafaf7',
      'scrollbarSlider.background': '#e6e5e080',
      'scrollbarSlider.hoverBackground': '#cfcdc499',
      'scrollbarSlider.activeBackground': '#cfcdc4cc',
    },
  });
};

/** Picks the Monaco theme id for the current app theme. */
export const monacoThemeFor = (isDark: boolean): string =>
  isDark ? GB_CODER_MONACO_DARK_THEME : GB_CODER_MONACO_LIGHT_THEME;
