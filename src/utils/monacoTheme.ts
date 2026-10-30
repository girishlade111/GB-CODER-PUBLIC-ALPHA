import type { Monaco } from '@monaco-editor/react';
import './monacoWorkers';

export const GB_CODER_MONACO_THEME = 'gb-coder-product';
export const GB_CODER_MONACO_THEME_LIGHT = 'gb-coder-product-light';

/**
 * Registers the OKLCH Design System Monaco editor themes (Dark & Light).
 * Grounded in pure pitch black (#000000) and pure crisp white (#ffffff),
 * with chart-1 amber and chart-2 indigo accents matching the OKLCH token spec.
 */
export const defineGbCoderTheme = (monaco: Monaco): void => {
  // ── Dark Mode Theme (Default / Pro IDE) ──
  monaco.editor.defineTheme(GB_CODER_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'ffffff', background: '000000' },
      { token: 'comment', foreground: '727272', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'string', foreground: 'fbbf24' },
      { token: 'number', foreground: '818cf8' },
      { token: 'type', foreground: 'e5e7eb' },
      { token: 'tag', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'attribute.name', foreground: 'adadad' },
      { token: 'attribute.value', foreground: 'fbbf24' },
      { token: 'function', foreground: 'ffffff' },
      { token: 'variable', foreground: 'ffffff' },
      { token: 'delimiter', foreground: '8a8a8a' },
      { token: 'operator', foreground: '8a8a8a' },
      { token: 'regexp', foreground: 'fbbf24' },
      { token: 'constant', foreground: '818cf8' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#ffffff',
      'editorLineNumber.foreground': '#484848',
      'editorLineNumber.activeForeground': '#ffffff',
      'editor.lineHighlightBackground': '#121212',
      'editor.selectionBackground': '#ffffff2b',
      'editor.inactiveSelectionBackground': '#ffffff14',
      'editor.selectionHighlightBackground': '#ffffff1c',
      'editorCursor.foreground': '#ffffff',
      'editorIndentGuide.background1': '#1c1c1c',
      'editorIndentGuide.activeBackground1': '#383838',
      'editorWidget.background': '#141414',
      'editorWidget.border': '#383838',
      'editorSuggestWidget.background': '#141414',
      'editorSuggestWidget.border': '#383838',
      'editorSuggestWidget.selectedBackground': '#242424',
      'editorHoverWidget.background': '#141414',
      'editorHoverWidget.border': '#383838',
      'editorGhostText.foreground': '#727272',
      'editorInlineSuggest.background': '#000000',
      'editorGhostText.beforeBackground': '#1c1c1c',
      'editorGutter.background': '#000000',
      'editorGutter.modifiedBackground': '#ffffff40',
      'minimap.background': '#000000',
      'scrollbarSlider.background': '#ffffff14',
      'scrollbarSlider.hoverBackground': '#ffffff2b',
      'scrollbarSlider.activeBackground': '#ffffff40',
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
