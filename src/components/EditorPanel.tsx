import React, { useState, useCallback } from 'react';
import { ChevronDown, Copy, Lock, Unlock, Wand2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import CopyToast from './ui/CopyToast';
import { EditorLanguage, JSEditorMode } from '../types';
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
  jsEditorMode?: JSEditorMode;
  onJsEditorModeChange?: (mode: JSEditorMode) => void;
  /** Fired once Monaco has mounted, for navigation and validation wiring. */
  onEditorReady?: (editor: unknown, monaco: unknown) => void;
}

const ACCEPTED_EXTENSIONS: Record<EditorLanguage, string[]> = {
  html: ['.html', '.htm'],
  css: ['.css'],
  javascript: ['.js', '.ts', '.jsx', '.tsx'],
};

const DROP_ERROR_MESSAGES: Record<EditorLanguage, string> = {
  html: 'Only HTML files (.html) can be dropped here.',
  css: 'Only CSS files (.css) are allowed in this section.',
  javascript: 'Only JavaScript, TypeScript, JSX, or TSX files are allowed here.',
};

const JS_MODE_OPTIONS: Array<{ value: JSEditorMode; label: string; badge: string }> = [
  { value: 'javascript', label: 'JS', badge: 'JAVASCRIPT' },
  { value: 'typescript', label: 'TS', badge: 'TYPESCRIPT' },
  { value: 'jsx', label: 'JSX', badge: 'JSX' },
  { value: 'tsx', label: 'TSX', badge: 'TSX' },
];

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
  jsEditorMode = 'javascript',
  onJsEditorModeChange,
  onEditorReady,
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
  const isJavaScriptPanel = language === 'javascript';
  const languageBadge = isJavaScriptPanel
    ? JS_MODE_OPTIONS.find((option) => option.value === jsEditorMode)?.badge || 'JAVASCRIPT'
    : language;

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
      className={`bg-surface-base border rounded-lg overflow-hidden w-full transition-colors ${
        isDragOver
          ? 'border-accent ring-2 ring-accent/30'
          : 'border-stroke-subtle'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="bg-surface-raised px-4 py-2 border-b border-stroke-subtle flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors compact:min-h-[44px] compact:flex-wrap compact:gap-x-2 compact:gap-y-1"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Left side: Icon, Title, File Label, Language Badge */}
        <div className="flex items-center gap-2 compact:min-w-0">
          {icon}
          <h3 className="text-sm font-medium text-content-primary">{title}</h3>
          <span className="text-xs text-content-muted font-mono mobile:hidden">{fileName}</span>
          <span className="text-[10px] tracking-wider font-semibold bg-white/[0.07] text-content-secondary px-1.5 py-0.5 rounded-sm uppercase">
            {languageBadge}
          </span>
          {isJavaScriptPanel && onJsEditorModeChange && (
            <select
              value={jsEditorMode}
              onChange={(e) => onJsEditorModeChange(e.target.value as JSEditorMode)}
              onClick={(e) => e.stopPropagation()}
              className="h-6 bg-surface-overlay border border-stroke-strong text-content-primary text-[11px] font-semibold rounded-md px-2 py-0.5 hover:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              title="JavaScript editor language mode"
            >
              {JS_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right side: Action Buttons + Collapse Icon */}
        <div className="flex items-center gap-2 compact:shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Format Button */}
          {onFormat && (
            <button
              onClick={handleFormat}
              disabled={!canFormat}
              className="p-1.5 rounded-md compact:flex compact:min-h-[44px] compact:min-w-[44px] compact:items-center compact:justify-center hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed text-accent-hover hover:text-accent-hover transition-colors"
              title={`Format ${language.toUpperCase()} code (Prettier)`}
            >
              <Wand2 className={`w-4 h-4 ${isFormatLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!hasContent}
            className="p-1.5 rounded-md compact:flex compact:min-h-[44px] compact:min-w-[44px] compact:items-center compact:justify-center hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-content-secondary hover:text-content-primary transition-colors"
            title="Copy code to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Lock/Unlock Button */}
          <button
            onClick={toggleLock}
            className={`p-1.5 rounded-md compact:flex compact:min-h-[44px] compact:min-w-[44px] compact:items-center compact:justify-center hover:bg-white/5 transition-colors ${isLocked ? 'text-amber-300 bg-amber-500/10' : 'text-content-secondary hover:text-content-primary'
              }`}
            title={isLocked ? 'Unlock editor (make editable)' : 'Lock editor (read-only)'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Collapse Icon */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ml-1 compact:mr-1 compact:h-8 compact:w-8 compact:p-2 ${isCollapsed ? 'rotate-180' : ''
              }`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="relative">
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-accent-subtle border-2 border-dashed border-accent rounded-lg pointer-events-none">
              <p className="text-accent-hover font-medium text-sm">
                Drop {ACCEPTED_EXTENSIONS[language].join(', ')} file here
              </p>
            </div>
          )}

          <div className="p-3">
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
              jsEditorMode={jsEditorMode}
              onMount={onEditorReady}
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
