import type { Monaco } from '@monaco-editor/react';
import './monacoWorkers';

export const GB_CODER_MONACO_THEME = 'gb-coder-product';
export const GB_CODER_MONACO_THEME_LIGHT = 'gb-coder-product-light';

/**
 * Registers the authentic VS Code Dark Modern Monaco editor theme matching vscode.dev.
 * Soft #1f1f1f editor background, classic syntax colors (#569cd6, #ce9178, #dcdcaa, #4ec9b0, #6a9955),
 * and subtle #2b2b2b borders.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  // ── VS Code Dark Modern Theme (Default / vscode.dev Parity) ──
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'cccccc', background: '1f1f1f' },
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569cd6' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'tag', foreground: '569cd6' },
      { token: 'attribute.name', foreground: '9cdcfe' },
      { token: 'attribute.value', foreground: 'ce9178' },
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'variable', foreground: '9cdcfe' },
      { token: 'delimiter', foreground: 'd4d4d4' },
      { token: 'operator', foreground: 'd4d4d4' },
      { token: 'regexp', foreground: 'd16969' },
      { token: 'constant', foreground: '4fc1ff' },
    ],
    colors: {
      'editor.background': '#1f1f1f',
      'editor.foreground': '#cccccc',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#cccccc',
      'editor.lineHighlightBackground': '#ffffff0a',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editor.selectionHighlightBackground': '#add6ff26',
      'editorCursor.foreground': '#aeafad',
      'editorIndentGuide.background1': '#404040',
      'editorIndentGuide.activeBackground1': '#707070',
      'editorWidget.background': '#252526',
      'editorWidget.border': '#3c3c3c',
      'editorSuggestWidget.background': '#252526',
      'editorSuggestWidget.border': '#3c3c3c',
      'editorSuggestWidget.selectedBackground': '#04395e',
      'editorHoverWidget.background': '#252526',
      'editorHoverWidget.border': '#3c3c3c',
      'editorGhostText.foreground': '#6b7280',
      'editorInlineSuggest.background': '#1f1f1f',
      'editorGhostText.beforeBackground': '#252526',
      'editorGutter.background': '#1f1f1f',
      'editorGutter.modifiedBackground': '#0078d4',
      'minimap.background': '#1f1f1f',
      'scrollbarSlider.background': '#79797933',
      'scrollbarSlider.hoverBackground': '#64646466',
      'scrollbarSlider.activeBackground': '#bfbfbf66',
    },
  });

  // ── Light Mode Theme ──
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '000000', background: 'fcfcfc' },
      { token: 'comment', foreground: '767676', fontStyle: 'italic' },
      { token: 'keyword', foreground: '000000', fontStyle: 'bold' },
      { token: 'string', foreground: 'b45309' },
      { token: 'number', foreground: '4338ca' },
      { token: 'type', foreground: '374151' },
      { token: 'tag', foreground: '000000', fontStyle: 'bold' },
      { token: 'attribute.name', foreground: '4b5563' },
      { token: 'attribute.value', foreground: 'b45309' },
      { token: 'function', foreground: '000000' },
      { token: 'variable', foreground: '000000' },
      { token: 'delimiter', foreground: '6b7280' },
      { token: 'operator', foreground: '6b7280' },
      { token: 'regexp', foreground: 'b45309' },
      { token: 'constant', foreground: '4338ca' },
    ],
    colors: {
      'editor.background': '#fcfcfc',
      'editor.foreground': '#000000',
      'editorLineNumber.foreground': '#a3a3a3',
      'editorLineNumber.activeForeground': '#000000',
      'editor.lineHighlightBackground': '#f4f4f4',
      'editor.selectionBackground': '#0000001a',
      'editor.inactiveSelectionBackground': '#0000000d',
      'editor.selectionHighlightBackground': '#00000012',
      'editorCursor.foreground': '#000000',
      'editorIndentGuide.background1': '#e5e5e5',
      'editorIndentGuide.activeBackground1': '#a3a3a3',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#e5e5e5',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#e5e5e5',
      'editorSuggestWidget.selectedBackground': '#f0f0f0',
      'editorHoverWidget.background': '#ffffff',
      'editorHoverWidget.border': '#e5e5e5',
      'editorGhostText.foreground': '#767676',
      'editorInlineSuggest.background': '#fcfcfc',
      'editorGhostText.beforeBackground': '#f0f0f0',
      'editorGutter.background': '#fcfcfc',
      'editorGutter.modifiedBackground': '#00000040',
      'minimap.background': '#fcfcfc',
      'scrollbarSlider.background': '#00000014',
      'scrollbarSlider.hoverBackground': '#00000024',
      'scrollbarSlider.activeBackground': '#00000038',
    },
  });
};

export const monacoThemeFor = (isDark = true): string => {
  return isDark ? GB_CODER_MONACO_THEME : GB_CODER_MONACO_THEME_LIGHT;
};
