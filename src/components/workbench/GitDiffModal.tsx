/**
 * Git Diff Modal for GB Coder.
 *
 * Displays line-by-line colored diffs comparing:
 * - Staged index vs HEAD commit
 * - Working tree changes vs Index/HEAD
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - High contrast accessible line highlights
 * - Intent-based token styling
 */

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, GitCommit, FileCode } from 'lucide-react';
import { diffLines, type Change } from 'diff';
import type { GitDiffInfo } from '../../types/git';

interface GitDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffInfo: GitDiffInfo | null;
}

export const GitDiffModal: React.FC<GitDiffModalProps> = ({ isOpen, onClose, diffInfo }) => {
  const changes = useMemo<Change[]>(() => {
    if (!diffInfo) return [];
    try {
      return diffLines(diffInfo.oldContent || '', diffInfo.newContent || '');
    } catch {
      return [];
    }
  }, [diffInfo]);

  if (!isOpen || !diffInfo) return null;

  const fileName = diffInfo.path.split('/').pop() || diffInfo.path;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-diff-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-100"
    >
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
          <div className="flex items-center gap-2 truncate">
            <GitCommit className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <h2 id="git-diff-modal-title" className="text-sm font-semibold text-[var(--foreground)] truncate">
              {fileName}
            </h2>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                diffInfo.staged
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {diffInfo.staged ? 'Staged Diff (Index vs HEAD)' : 'Working Tree Diff (Unstaged)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Close Diff"
            aria-label="Close Diff"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Path breadcrumb */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--sidebar)]/50 px-4 py-1.5 text-xs text-[var(--muted-foreground)]">
          <FileCode className="h-3.5 w-3.5" />
          <span className="font-mono">{diffInfo.path}</span>
        </div>

        {/* Diff content view */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-2 font-mono text-xs leading-relaxed">
          {changes.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)] italic">
              No content differences detected.
            </div>
          ) : (
            <div className="space-y-0.5">
              {changes.map((change, idx) => {
                const lines = change.value.replace(/\n$/, '').split('\n');
                const isAdded = change.added;
                const isRemoved = change.removed;

                return (
                  <div key={idx}>
                    {lines.map((line, lineIdx) => (
                      <div
                        key={lineIdx}
                        className={`flex items-start px-2 py-0.5 ${
                          isAdded
                            ? 'bg-emerald-950/40 text-emerald-300'
                            : isRemoved
                            ? 'bg-rose-950/40 text-rose-300'
                            : 'text-neutral-300'
                        }`}
                      >
                        <span className="w-6 shrink-0 select-none text-right pr-2 text-neutral-500 text-[10px]">
                          {isAdded ? '+' : isRemoved ? '-' : ' '}
                        </span>
                        <pre className="flex-1 whitespace-pre-wrap break-all font-mono">{line}</pre>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-2 text-xs text-[var(--muted-foreground)]">
          <span>Comparing file version</span>
          <button
            onClick={onClose}
            className="rounded bg-[var(--sidebar-accent)] px-3 py-1 font-medium text-[var(--foreground)] hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

