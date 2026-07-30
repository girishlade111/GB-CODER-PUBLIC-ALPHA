import React, { useRef, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { GB_CODER_MONACO_THEME, defineGbCoderTheme } from '../utils/monacoTheme';
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

  // Theme registration is shared with the multi-file editor pane so whichever
  // surface mounts first, the theme is defined.
  const handleEditorWillMount = (monaco: Monaco) => {
    defineGbCoderTheme(monaco);
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
        theme={GB_CODER_MONACO_THEME}
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
