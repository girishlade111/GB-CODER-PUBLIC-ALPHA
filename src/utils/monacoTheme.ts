import type { Monaco } from '@monaco-editor/react';

export const GB_CODER_MONACO_THEME = 'gb-coder-light';

/**
 * Registers the single DESIGN.md Monaco theme — warm cream pane on a white
 * card, warm ink text, Cursor Orange keywords, success-green strings.
 *
 * DESIGN.md defines one visual system, so there is no dark variant to register
 * and no theme switching to do.
 *
 * Shared by every editor surface (plain-mode panels, multi-file pane, VS Code
 * mode) so whichever mounts first, the theme exists.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME, {
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

/** The Monaco theme id. Retained for call sites that passed `isDark` through. */
export const monacoThemeFor = (_isDark?: boolean): string => GB_CODER_MONACO_THEME;