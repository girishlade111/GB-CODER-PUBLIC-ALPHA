/**
 * Interactive Monaco Diff Preview Modal for AI Edit Proposals.
 *
 * Provides a side-by-side Monaco diff inspection using LocalDiffEditor,
 * allowing users to review proposed code modifications before applying or rejecting them.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProposedFileEdit } from '../../services/ai/types';
import { LocalDiffEditor } from '../LocalMonacoEditor';

interface AiMonacoDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: ProposedFileEdit[];
  initialFileIndex?: number;
  onApplyProposal: (editId: string) => void;
  onRejectProposal: (editId: string) => void;
  onApplyAll?: () => void;
}

export const AiMonacoDiffModal: React.FC<AiMonacoDiffModalProps> = ({
  isOpen,
  onClose,
  proposals,
  initialFileIndex = 0,
  onApplyProposal,
  onRejectProposal,
  onApplyAll,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialFileIndex);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(Math.min(initialFileIndex, Math.max(0, proposals.length - 1)));
    }
  }, [isOpen, initialFileIndex, proposals.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || proposals.length === 0) return null;

  const currentEdit = proposals[selectedIndex] || proposals[0];

  const getLanguageForPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
      case 'mjs':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const isApplied = currentEdit.status === 'applied';
  const isRejected = currentEdit.status === 'rejected';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review AI Proposed Edits"
      data-testid="ai-diff-modal"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 text-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
          <div className="flex items-center gap-3">
            <FileCode className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Review Proposed Changes
            </h2>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              {proposals.length} file{proposals.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onApplyAll && proposals.some((p) => p.status === 'pending') && (
              <button
                type="button"
                onClick={() => {
                  onApplyAll();
                  onClose();
                }}
                data-testid="diff-apply-all-btn"
                className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition-colors"
              >
                Apply All Changes
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              data-testid="close-diff-modal-btn"
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-File Tab Bar (if multiple files) */}
        {proposals.length > 1 && (
          <div className="flex border-b border-[var(--border)] bg-[var(--sidebar)] px-3 pt-1.5 gap-1 overflow-x-auto">
            {proposals.map((edit, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={edit.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-mono transition-colors border-t border-x ${
                    isSelected
                      ? 'bg-[var(--sidebar)] text-white border-[var(--border)] border-b-transparent -mb-px'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{edit.path}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+{edit.addedLines}</span>
                  <span className="text-[10px] text-red-400 font-bold">-{edit.removedLines}</span>
                  {edit.status === 'applied' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-Header: Active File Details & Actions */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-100">{currentEdit.path}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
              currentEdit.action === 'create'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {currentEdit.action === 'create' ? 'New File' : 'Modified'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              <span className="text-emerald-400">+{currentEdit.addedLines}</span> / <span className="text-red-400">-{currentEdit.removedLines}</span> lines
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isApplied ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <Check className="h-3.5 w-3.5" /> Applied to Workspace
              </span>
            ) : isRejected ? (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <AlertCircle className="h-3.5 w-3.5" /> Rejected
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onRejectProposal(currentEdit.id)}
                  data-testid="diff-reject-file-btn"
                  className="rounded border border-white/10 hover:bg-white/5 px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApplyProposal(currentEdit.id)}
                  data-testid="diff-apply-file-btn"
                  className="flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 font-semibold text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Apply File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Monaco Diff Viewer Area */}
        <div className="relative min-h-0 flex-1 bg-[var(--background)]">
          <LocalDiffEditor
            original={currentEdit.originalContent}
            modified={currentEdit.newContent}
            language={getLanguageForPath(currentEdit.path)}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};
