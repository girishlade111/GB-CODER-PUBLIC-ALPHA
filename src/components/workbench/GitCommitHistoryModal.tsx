/**
 * Git Commit History Modal for GB Coder.
 *
 * Displays full commit ancestry and details:
 * - Commit SHA-1 hashes
 * - Commit messages
 * - Author names and emails
 * - Dates and parent lineage
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - High-contrast accessible layout
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X, GitCommit, User, Calendar, GitBranch } from 'lucide-react';
import type { GitCommitRecord } from '../../types/git';

interface GitCommitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: string;
  commits: GitCommitRecord[];
}

export const GitCommitHistoryModal: React.FC<GitCommitHistoryModalProps> = ({
  isOpen,
  onClose,
  branch,
  commits,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-history-modal-title"
      data-testid="git-history-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-100"
    >
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <h2 id="git-history-modal-title" className="text-sm font-semibold text-[var(--foreground)]">
              Git Commit History
            </h2>
            <span className="flex items-center gap-1 rounded bg-[var(--sidebar-accent)] px-2 py-0.5 text-[11px] font-mono text-[var(--muted-foreground)]">
              <GitBranch className="h-3 w-3" />
              {branch}
            </span>
          </div>

          <button
            data-testid="git-history-modal-close"
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commit List */}
        <div className="flex-1 overflow-y-auto p-4">
          {commits.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-[var(--muted-foreground)] italic">
              No commits found in this branch history.
            </div>
          ) : (
            <div className="relative space-y-4 pl-4 before:absolute before:bottom-2 before:top-2 before:left-6 before:w-0.5 before:bg-[var(--border)]">
              {commits.map((commit) => (
                <div key={commit.sha} data-testid="git-commit-item" className="relative flex items-start gap-4">
                  <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] ring-4 ring-[var(--background)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary-foreground)]" />
                  </div>

                  <div className="flex-1 rounded border border-[var(--border)] bg-[var(--sidebar)] p-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{commit.message}</h3>
                      <span
                        data-testid="git-commit-sha"
                        className="font-mono text-[11px] text-[var(--muted-foreground)] bg-black/30 px-1.5 py-0.5 rounded"
                      >
                        {commit.shortSha}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{commit.author.name}</span>
                        <span className="text-[10px] opacity-70">&lt;{commit.author.email}&gt;</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(commit.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {commit.parentShas.length > 0 && (
                      <div className="mt-2 text-[10px] text-[var(--muted-foreground)] font-mono">
                        <span>Parents: {commit.parentShas.map((s) => s.slice(0, 7)).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-2 text-xs text-[var(--muted-foreground)]">
          <span>{commits.length} commits in history</span>
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
