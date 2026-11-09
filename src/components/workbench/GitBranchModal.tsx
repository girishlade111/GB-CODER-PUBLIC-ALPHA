/**
 * Git Branch Management Modal for GB Coder.
 *
 * Capabilities:
 * - List all local branches with current indicator
 * - Create new branches
 * - Switch to an existing branch
 * - Merge selected branch into current branch
 * - Safely delete non-current branches
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Safe branch deletion guards
 * - Intent-based token styling
 */

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Check,
  Plus,
  Trash2,
  GitMerge,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { GitBranchInfo } from '../../types/git';

interface GitBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: GitBranchInfo[];
  currentBranch: string;
  onCreateBranch: (branchName: string) => Promise<void>;
  onSwitchBranch: (branchName: string) => Promise<void>;
  onDeleteBranch: (branchName: string) => Promise<void>;
  onMergeBranch: (branchName: string) => Promise<void>;
}

export const GitBranchModal: React.FC<GitBranchModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentBranch,
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
  onMergeBranch,
}) => {
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyBranch, setBusyBranch] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newBranchName.trim();
    if (!clean) return;

    setIsCreating(true);
    setActionError(null);
    try {
      await onCreateBranch(clean);
      setNewBranchName('');
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Failed to create branch.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitch = async (name: string) => {
    if (name === currentBranch) return;
    setBusyBranch(name);
    setActionError(null);
    try {
      await onSwitchBranch(name);
      onClose();
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Failed to switch branch.');
    } finally {
      setBusyBranch(null);
    }
  };

  const handleDelete = async (name: string) => {
    if (name === currentBranch || name === 'main') return;
    const confirmed = window.confirm(`Are you sure you want to delete branch '${name}'?`);
    if (!confirmed) return;

    setBusyBranch(name);
    setActionError(null);
    try {
      await onDeleteBranch(name);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Failed to delete branch.');
    } finally {
      setBusyBranch(null);
    }
  };

  const handleMerge = async (name: string) => {
    if (name === currentBranch) return;
    const confirmed = window.confirm(
      `Merge branch '${name}' into current branch '${currentBranch}'?`,
    );
    if (!confirmed) return;

    setBusyBranch(name);
    setActionError(null);
    try {
      await onMergeBranch(name);
      onClose();
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Failed to merge branch.');
    } finally {
      setBusyBranch(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-branches-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs select-none"
    >
      <div className="flex h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <h2 id="git-branches-modal-title" className="text-sm font-semibold text-[var(--foreground)]">
              Manage Branches
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Create Branch Bar */}
        <div className="border-b border-[var(--border)] bg-[var(--sidebar)]/50 p-4">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="New branch name (e.g. feature/login)"
              className="flex-1 rounded border border-[var(--border)] bg-[var(--sidebar)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              disabled={isCreating || !newBranchName.trim()}
              className="flex items-center gap-1.5 rounded bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>Create</span>
            </button>
          </form>
        </div>

        {/* Error notification */}
        {actionError && (
          <div className="flex items-center gap-2 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">{actionError}</span>
          </div>
        )}

        {/* Branch List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {branches.map((b) => {
            const isCurrent = b.name === currentBranch;
            const isBusy = busyBranch === b.name;

            return (
              <div
                key={b.name}
                className={`flex items-center justify-between rounded border p-2.5 text-xs transition-colors ${
                  isCurrent
                    ? 'border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--foreground)]'
                    : 'border-[var(--border)] bg-[var(--sidebar)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <GitBranch
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isCurrent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    }`}
                  />
                  <span className="font-mono font-medium truncate">{b.name}</span>
                  {isCurrent && (
                    <span className="rounded bg-[var(--primary)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                      current
                    </span>
                  )}
                  {b.commitSha && (
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)] opacity-70">
                      {b.commitSha.slice(0, 7)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCurrent && (
                    <>
                      <button
                        onClick={() => handleSwitch(b.name)}
                        disabled={isBusy}
                        className="rounded bg-[var(--sidebar-accent)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-white/10 disabled:opacity-50"
                        title={`Switch to ${b.name}`}
                      >
                        {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Switch'}
                      </button>

                      <button
                        onClick={() => handleMerge(b.name)}
                        disabled={isBusy}
                        className="rounded border border-[var(--border)] p-1 text-[var(--muted-foreground)] hover:bg-white/5 hover:text-[var(--foreground)] disabled:opacity-50"
                        title={`Merge ${b.name} into ${currentBranch}`}
                        aria-label={`Merge ${b.name} into ${currentBranch}`}
                      >
                        <GitMerge className="h-3.5 w-3.5" />
                      </button>

                      {b.name !== 'main' && (
                        <button
                          onClick={() => handleDelete(b.name)}
                          disabled={isBusy}
                          className="rounded border border-rose-500/20 p-1 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                          title={`Delete branch ${b.name}`}
                          aria-label={`Delete branch ${b.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                  {isCurrent && <Check className="h-4 w-4 text-[var(--primary)]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-2 text-xs text-[var(--muted-foreground)]">
          <span>{branches.length} local branches</span>
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
};
