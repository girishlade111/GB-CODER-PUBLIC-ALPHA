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
      {/* code-window-card: a diff is product chrome, so the whole modal takes
          the dark product surface rather than a light card with a dark patch. */}
      <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border bg-product border-stroke-dark">
        
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-product-soft border-stroke-dark">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg text-content-on-dark">{title}</h2>
            <div className="text-xs px-2 py-1 rounded-md font-medium bg-product-active text-content-on-dark-soft">
              {files.length} file{files.length !== 1 ? 's' : ''} changed
              <span className="ml-2 text-success">+{totalStats.added}</span>
              <span className="ml-1 text-red-300">-{totalStats.removed}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-product-hover transition-colors text-content-on-dark-soft hover:text-content-on-dark"
            title="Reject All (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for Multi-File */}
          {isMultiFile && (
            <div className="w-64 flex-shrink-0 border-r flex flex-col overflow-y-auto border-stroke-dark bg-product-soft">
              <div className="quiet-section-label px-4 py-3">
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
                          ? 'bg-accent-subtle text-accent'
                          : 'text-content-on-dark-soft hover:bg-product-hover hover:text-content-on-dark'
                      }`}
                    >
                      <FileCode className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{file.path}</span>
                      {isApplied && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diff View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-product">
            <div className="px-4 py-2 border-b flex items-center justify-between border-stroke-dark bg-product-soft">
               <span className="text-sm font-mono text-content-on-dark">
                 {currentFile.path}
               </span>
               <div className="flex items-center gap-2">
                 <button
                   onClick={handleCopy}
                   className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-product-hover text-content-on-dark-soft"
                   title="Copy Suggestion"
                 >
                   <Copy className="w-3.5 h-3.5" />
                   Copy
                 </button>
                 {isMultiFile && onApplyFile && !appliedFiles.has(currentFile.path) && (
                   <button
                     onClick={handleApplyCurrentFile}
                     className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent-subtle text-accent hover:bg-accent/20 rounded transition-colors"
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
                useDarkTheme
                compareMethod={DiffMethod.WORDS}
                leftTitle="Current Code"
                rightTitle="AI Suggestion"
                styles={{
                  variables: {
                                        dark: {
                      diffViewerBackground: '#181715',
                      diffViewerColor: '#faf9f5',
                      addedBackground: 'rgba(93, 184, 72, 0.18)',
                      addedColor: '#faf9f5',
                      removedBackground: 'rgba(198, 69, 69, 0.18)',
                      removedColor: '#faf9f5',
                      wordAddedBackground: 'rgba(93, 184, 72, 0.36)',
                      wordRemovedBackground: 'rgba(198, 69, 69, 0.36)',
                      addedGutterBackground: 'rgba(93, 184, 72, 0.18)',
                      removedGutterBackground: 'rgba(198, 69, 69, 0.18)',
                      gutterBackground: '#181715',
                      gutterBackgroundDark: '#181715',
                      highlightBackground: '#1f1e1b',
                      highlightGutterBackground: '#1f1e1b',
                      codeFoldGutterBackground: '#181715',
                      codeFoldBackground: '#181715',
                      emptyLineBackground: '#181715',
                      gutterColor: '#6c6a64',
                      addedGutterColor: '#6c6a64',
                      removedGutterColor: '#6c6a64',
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
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-product-soft border-stroke-dark">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-product-hover text-content-on-dark-soft"
          >
            Reject All
          </button>
          <button
            onClick={onApplyAll}
            className="quiet-btn-accent h-9 text-[13px]"
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
