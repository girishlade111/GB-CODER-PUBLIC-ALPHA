import React, { useRef, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { monacoThemeFor, defineGbCoderTheme } from '../utils/monacoTheme';
import { useTheme } from '../hooks/useTheme';
import { inlineCopilotService } from '../services/inlineCopilotService';
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
  const { isDark } = useTheme();

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
  //
  // The inline AI provider is registered here for the same reason, and because
  // `beforeMount` runs before the editor instance exists — registering on
  // `onMount` would leave a window where the editor accepts keystrokes with no
  // provider behind it. Registration is global to `monaco.languages` and
  // idempotent, so this one call covers every editor surface in the app,
  // including the multi-file and VS Code panes.
  const handleEditorWillMount = (monaco: Monaco) => {
    defineGbCoderTheme(monaco);
    inlineCopilotService.register(monaco);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    internalEditorRef.current = editor;
    if (editorRef) {
      editorRef.current = editor;
    }

    // Lets the copilot provider read selection state, which lives on the editor
    // rather than the text model.
    inlineCopilotService.attachEditor(editor);

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

  // Keep a mounted editor in sync when the user flips light/dark.
  useEffect(() => {
    const monaco = (window as any)?.monaco;
    if (monaco && internalEditorRef.current) {
      monaco.editor.setTheme(monacoThemeFor(isDark));
    }
  }, [isDark]);

  return (
    /* code-window-card: DESIGN.md puts the editor on the dark product surface.
       Monaco paints its own background, so this wrapper only carries the
       product-navy fill behind it plus the hairline the window is framed by. */
    <div className="w-full h-full border border-stroke-dark rounded-lg overflow-hidden bg-product">
      <Editor
        height={height}
        language={getLanguageForMonaco(language)}
        value={value}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        theme={monacoThemeFor(isDark)}
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
