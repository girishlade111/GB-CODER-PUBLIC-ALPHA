import React, { useState, useEffect } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { X, Check, Copy, ChevronRight, FileCode, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';

export interface DiffFile {
  path: string;
  original: string;
  suggested: string;
  language?: string;
}

export interface AiDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAll: () => void;
  onApplyFile?: (path: string) => void;
  files: DiffFile[];
  title?: string;
}

const AiDiffModal: React.FC<AiDiffModalProps> = ({
  isOpen,
  onClose,
  onApplyAll,
  onApplyFile,
  files,
  title = 'Review Changes',
}) => {
  const { isDark } = useTheme();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [appliedFiles, setAppliedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && files.length > 0) {
      setSelectedFilePath(files[0].path);
      setAppliedFiles(new Set());
    }
  }, [isOpen, files]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        onApplyAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onApplyAll]);

  if (!isOpen || files.length === 0) return null;

  const isMultiFile = files.length > 1;
  const currentFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.suggested);
    toast.success('Suggested code copied to clipboard');
  };

  const handleApplyCurrentFile = () => {
    if (onApplyFile) {
      onApplyFile(currentFile.path);
      setAppliedFiles((prev) => new Set(prev).add(currentFile.path));
    }
  };

  const calculateStats = (oldCode: string, newCode: string) => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const added = newLines.length - oldLines.length;
    return {
      added: added > 0 ? added : 0,
      removed: added < 0 ? Math.abs(added) : 0,
    };
  };

  const totalStats = files.reduce(
    (acc, f) => {
      const stats = calculateStats(f.original, f.suggested);
      return { added: acc.added + stats.added, removed: acc.removed + stats.removed };
    },
    { added: 0, removed: 0 }
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className={`w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border ${isDark ? 'bg-surface-base border-stroke-strong' : 'bg-white border-gray-200'}`}>
        
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <h2 className={`font-semibold text-lg ${isDark ? 'text-content-primary' : 'text-gray-900'}`}>{title}</h2>
            <div className={`text-xs px-2 py-1 rounded-md font-medium ${isDark ? 'bg-surface-overlay text-content-secondary' : 'bg-gray-200 text-gray-700'}`}>
              {files.length} file{files.length !== 1 ? 's' : ''} changed
              <span className="ml-2 text-green-500">+{totalStats.added}</span>
              <span className="ml-1 text-red-500">-{totalStats.removed}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${isDark ? 'text-content-muted hover:text-content-primary' : 'text-gray-500 hover:text-gray-900'}`}
            title="Reject All (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for Multi-File */}
          {isMultiFile && (
            <div className={`w-64 flex-shrink-0 border-r flex flex-col overflow-y-auto ${isDark ? 'border-stroke-subtle bg-surface-raised/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-content-muted' : 'text-gray-500'}`}>
                Modified Files
              </div>
              <div className="flex-1">
                {files.map((file) => {
                  const isSelected = selectedFilePath === file.path;
                  const isApplied = appliedFiles.has(file.path);
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`w-full px-4 py-2 flex items-center gap-2 text-left transition-colors ${
                        isSelected
                          ? isDark ? 'bg-accent/20 text-accent-hover' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'text-content-secondary hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FileCode className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{file.path}</span>
                      {isApplied && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diff View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1e1e1e]">
            <div className={`px-4 py-2 border-b flex items-center justify-between ${isDark ? 'border-stroke-subtle bg-[#1e1e1e]' : 'border-gray-200 bg-gray-50'}`}>
               <span className={`text-sm font-mono ${isDark ? 'text-content-primary' : 'text-gray-700'}`}>
                 {currentFile.path}
               </span>
               <div className="flex items-center gap-2">
                 <button
                   onClick={handleCopy}
                   className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${isDark ? 'hover:bg-white/10 text-content-secondary' : 'hover:bg-gray-200 text-gray-600'}`}
                   title="Copy Suggestion"
                 >
                   <Copy className="w-3.5 h-3.5" />
                   Copy
                 </button>
                 {isMultiFile && onApplyFile && !appliedFiles.has(currentFile.path) && (
                   <button
                     onClick={handleApplyCurrentFile}
                     className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                   >
                     <Check className="w-3.5 h-3.5" />
                     Apply This File
                   </button>
                 )}
               </div>
            </div>
            <div className="flex-1 overflow-auto">
              <ReactDiffViewer
                oldValue={currentFile.original}
                newValue={currentFile.suggested}
                splitView={true}
                useDarkTheme={isDark}
                compareMethod={DiffMethod.WORDS}
                leftTitle="Current Code"
                rightTitle="AI Suggestion"
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: '#1e1e1e',
                      diffViewerColor: '#d4d4d4',
                      addedBackground: 'rgba(46, 160, 67, 0.2)',
                      addedColor: '#d4d4d4',
                      removedBackground: 'rgba(248, 81, 73, 0.2)',
                      removedColor: '#d4d4d4',
                      wordAddedBackground: 'rgba(46, 160, 67, 0.4)',
                      wordRemovedBackground: 'rgba(248, 81, 73, 0.4)',
                      addedGutterBackground: 'rgba(46, 160, 67, 0.2)',
                      removedGutterBackground: 'rgba(248, 81, 73, 0.2)',
                      gutterBackground: '#1e1e1e',
                      gutterBackgroundDark: '#1e1e1e',
                      highlightBackground: '#2a2a2a',
                      highlightGutterBackground: '#2a2a2a',
                      codeFoldGutterBackground: '#1e1e1e',
                      codeFoldBackground: '#1e1e1e',
                      emptyLineBackground: '#1e1e1e',
                      gutterColor: '#858585',
                      addedGutterColor: '#858585',
                      removedGutterColor: '#858585',
                    }
                  },
                  line: {
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'hover:bg-white/5 text-content-secondary' : 'hover:bg-gray-200 text-gray-700'}`}
          >
            Reject All
          </button>
          <button
            onClick={onApplyAll}
            className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover hover:brightness-110 text-white rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2"
            title="Apply All Changes (Ctrl+Enter)"
          >
            <Check className="w-4 h-4" />
            Apply All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiDiffModal;
