import React, { useState, useCallback } from 'react';
import { ChevronDown, Copy, Lock, Unlock, Wand2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import CopyToast from './ui/CopyToast';
import { EditorLanguage } from '../types';
import { useEditorActions } from '../hooks/useEditorActions';

interface EditorPanelProps {
  title: string;
  language: EditorLanguage;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  onFormat?: () => void;
  isFormatLoading?: boolean;
  editorRef?: React.MutableRefObject<any>;
  onSelectionChange?: (editor: any) => void;
  fontFamily?: string;
  fontSize?: number;
}

const ACCEPTED_EXTENSIONS: Record<EditorLanguage, string[]> = {
  html: ['.html', '.htm'],
  css: ['.css'],
  javascript: ['.js'],
};

const DROP_ERROR_MESSAGES: Record<EditorLanguage, string> = {
  html: 'Only HTML files (.html) can be dropped here.',
  css: 'Only CSS files (.css) are allowed in this section.',
  javascript: 'Only JavaScript files (.js) are allowed here.',
};

const EditorPanel: React.FC<EditorPanelProps> = ({
  title,
  language,
  value,
  onChange,
  icon,
  onFormat,
  isFormatLoading = false,
  editorRef,
  onSelectionChange,
  fontFamily,
  fontSize,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const {
    isLocked,
    toggleLock,
    handleCopy,
    showCopyToast,
    copyToastMessage,
    closeCopyToast,
    handleFormat,
    canFormat,
    fileName,
  } = useEditorActions({
    value,
    language,
    onFormat,
    isFormatLoading,
  });

  const hasContent = value.trim().length > 0;

  const isValidFile = useCallback((filename: string): boolean => {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    return ACCEPTED_EXTENSIONS[language].includes(ext);
  }, [language]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setDropError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!isValidFile(file.name)) {
      setDropError(DROP_ERROR_MESSAGES[language]);
      setTimeout(() => setDropError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content !== undefined) {
        onChange(content);
      }
    };
    reader.readAsText(file);
  }, [isValidFile, language, onChange]);

  return (
    <div
      className={`bg-dark-gray border rounded-lg overflow-hidden w-full transition-colors ${
        isDragOver
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-gray-700'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="bg-matte-black px-4 py-3 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-dark-gray transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Left side: Icon, Title, File Label, Language Badge */}
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-bright-white">{title}</h3>
          <span className="text-xs text-gray-500 font-mono">{fileName}</span>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded uppercase">
            {language}
          </span>
        </div>

        {/* Right side: Action Buttons + Collapse Icon */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Format Button */}
          {onFormat && (
            <button
              onClick={handleFormat}
              disabled={!canFormat}
              className="p-1.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-purple-400 hover:text-purple-300 rounded transition-all duration-200"
              title={`Format ${language.toUpperCase()} code (Prettier)`}
            >
              <Wand2 className={`w-4 h-4 ${isFormatLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!hasContent}
            className="p-1.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-400 hover:text-bright-white rounded transition-all duration-200"
            title="Copy code to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Lock/Unlock Button */}
          <button
            onClick={toggleLock}
            className={`p-1.5 hover:bg-gray-700 rounded transition-all duration-200 ${isLocked ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-bright-white'
              }`}
            title={isLocked ? 'Unlock editor (make editable)' : 'Lock editor (read-only)'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Collapse Icon */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ml-1 ${isCollapsed ? 'rotate-180' : ''
              }`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="relative">
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-900/40 border-2 border-dashed border-blue-400 rounded pointer-events-none">
              <p className="text-blue-300 font-medium text-sm">
                Drop {ACCEPTED_EXTENSIONS[language].join(', ')} file here
              </p>
            </div>
          )}

          <div className="p-4">
            <CodeEditor
              language={language}
              value={value}
              onChange={onChange}
              height="300px"
              readOnly={isLocked}
              editorRef={editorRef}
              onSelectionChange={onSelectionChange}
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          </div>

        </div>
      )}

      {/* Drop error message */}
      {dropError && (
        <div className="px-4 py-2 bg-red-900/60 border-t border-red-700 text-red-300 text-xs">
          {dropError}
        </div>
      )}

      {/* Copy Toast */}
      {showCopyToast && (
        <CopyToast
          message={copyToastMessage}
          type={copyToastMessage.includes('Failed') ? 'error' : 'success'}
          onClose={closeCopyToast}
        />
      )}
    </div>
  );
};

export default React.memo(EditorPanel);
