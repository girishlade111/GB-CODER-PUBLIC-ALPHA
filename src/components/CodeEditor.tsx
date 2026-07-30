import React, { useRef, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { EditorLanguage, JSEditorMode } from '../types';

interface CodeEditorProps {
  language: EditorLanguage;
  value: string;
  onChange: (value: string) => void;
  height?: string;
  onMount?: (editor: any, monaco: any) => void;
  readOnly?: boolean;
  editorRef?: React.MutableRefObject<any>;
  onSelectionChange?: (editor: any) => void;
  fontFamily?: string;
  fontSize?: number;
  jsEditorMode?: JSEditorMode;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  height = '300px',
  onMount,
  readOnly = false,
  editorRef,
  onSelectionChange,
  fontFamily = 'JetBrains Mono, Monaco, Consolas, monospace',
  fontSize = 14,
  jsEditorMode = 'javascript',
}) => {
  const internalEditorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const getLanguageForMonaco = (lang: EditorLanguage): string => {
    switch (lang) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
        return jsEditorMode === 'typescript' || jsEditorMode === 'tsx'
          ? 'typescript'
          : 'javascript';
      default:
        return 'plaintext';
    }
  };

  /**
   * Registers a Monaco theme that matches the app palette. The stock `vs-dark`
   * theme paints a #1e1e1e canvas, which reads as a lighter mismatched slab
   * against the #111111 panels.
   */
  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('gb-coder-dark', {
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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    internalEditorRef.current = editor;
    if (editorRef) {
      editorRef.current = editor;
    }

    if (onSelectionChange) {
      editor.onDidChangeCursorSelection(() => {
        onSelectionChange(editor);
      });
    }

    // Call parent onMount if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  // Imperatively update Monaco options when fontFamily / fontSize / readOnly change
  useEffect(() => {
    if (internalEditorRef.current) {
      internalEditorRef.current.updateOptions({
        fontSize,
        fontFamily,
        readOnly,
      });
    }
  }, [fontSize, fontFamily, readOnly]);

  return (
    <div className="w-full h-full border border-stroke-subtle rounded-md overflow-hidden">
      <Editor
        height={height}
        language={getLanguageForMonaco(language)}
        value={value}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        theme="gb-coder-dark"
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          fontFamily: fontFamily,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          readOnly,
        }}
      />
    </div>
  );
};

export default React.memo(CodeEditor);
