/**
 * GitHub Pull Request Modal for GB Coder.
 *
 * Capabilities:
 * - List open and closed pull requests
 * - Create a new pull request with title, description, head and base branch
 * - Inspect pull request details and changed files count
 * - Direct link to open pull request on GitHub
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Explicit user confirmation on creation (no automatic PR generation)
 * - Token-based accessible UI
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  GitPullRequest as GitPullRequestIcon,
  GitBranch,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  listPullRequests,
  createPullRequest,
} from '../../services/git/gitPullRequestService';
import type { GitPullRequest } from '../../types/git';

interface GitPullRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoFullName: string;
  token: string;
  currentBranch: string;
  branches: string[];
}

export const GitPullRequestModal: React.FC<GitPullRequestModalProps> = ({
  isOpen,
  onClose,
  repoFullName,
  token,
  currentBranch,
  branches,
}) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [filterState, setFilterState] = useState<'open' | 'closed'>('open');

  // List state
  const [pullRequests, setPullRequests] = useState<GitPullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Create PR form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [headBranch, setHeadBranch] = useState(currentBranch);
  const [baseBranch, setBaseBranch] = useState(branches.includes('main') ? 'main' : branches[0] || 'main');
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdPR, setCreatedPR] = useState<GitPullRequest | null>(null);

  // Load PRs when modal opens or filter changes
  useEffect(() => {
    if (!isOpen || !repoFullName || !token) return;

    let cancelled = false;
    const loadPRs = async () => {
      setIsLoading(true);
      setListError(null);
      try {
        const prs = await listPullRequests(repoFullName, token, filterState);
        if (!cancelled) setPullRequests(prs);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = (err as Error)?.message || 'Failed to load pull requests.';
          setListError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPRs();
    return () => {
      cancelled = true;
    };
  }, [isOpen, repoFullName, token, filterState]);

  // Keep headBranch in sync with currentBranch
  useEffect(() => {
    if (currentBranch) setHeadBranch(currentBranch);
  }, [currentBranch]);

  if (!isOpen) return null;

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setCreateError('Please enter a pull request title.');
      return;
    }
    if (headBranch === baseBranch) {
      setCreateError('Source and target branch cannot be the same.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const pr = await createPullRequest(repoFullName, token, {
        title: title.trim(),
        body: body.trim(),
        head: headBranch,
        base: baseBranch,
        draft: isDraft,
      });

      setCreatedPR(pr);
      setTitle('');
      setBody('');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to create pull request.';
      setCreateError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-pr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs select-none"
    >
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
          <div className="flex items-center gap-2">
            <GitPullRequestIcon className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <h2 id="git-pr-modal-title" className="text-sm font-semibold text-[var(--foreground)]">
              Pull Requests — {repoFullName}
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

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)]/60 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTab('list');
                setCreatedPR(null);
              }}
              className={`border-b-2 py-2 text-xs font-medium transition-colors ${
                tab === 'list'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Browse Pull Requests
            </button>
            <button
              onClick={() => {
                setTab('create');
                setCreatedPR(null);
              }}
              className={`border-b-2 py-2 text-xs font-medium transition-colors ${
                tab === 'create'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              New Pull Request
            </button>
          </div>

          {tab === 'list' && (
            <div className="flex items-center gap-2 py-1">
              <button
                onClick={() => setFilterState('open')}
                className={`rounded px-2 py-1 text-[11px] font-medium ${
                  filterState === 'open'
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterState('closed')}
                className={`rounded px-2 py-1 text-[11px] font-medium ${
                  filterState === 'closed'
                    ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                Closed
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'list' ? (
            <div>
              {isLoading ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-[var(--muted-foreground)]">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  <span className="text-xs">Loading pull requests...</span>
                </div>
              ) : listError ? (
                <div className="rounded border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>Error loading pull requests</span>
                  </div>
                  <p className="mt-1">{listError}</p>
                </div>
              ) : pullRequests.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-[var(--muted-foreground)]">
                  <GitPullRequestIcon className="h-8 w-8 text-[var(--muted-foreground)]/40" />
                  <p className="text-xs">No {filterState} pull requests found for this repository.</p>
                  <button
                    onClick={() => setTab('create')}
                    className="mt-2 flex items-center gap-1.5 rounded bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Pull Request
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-start justify-between rounded border border-[var(--border)] bg-[var(--sidebar)] p-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--foreground)]">#{pr.number}</span>
                          <span className="font-medium text-[var(--foreground)]">{pr.title}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                              pr.state === 'open'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {pr.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                          <span>by {pr.user.login}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <GitBranch className="h-3 w-3" />
                            {pr.headBranch} → {pr.baseBranch}
                          </span>
                        </div>
                      </div>

                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-white/5"
                      >
                        <span>View on GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {createdPR ? (
                <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Pull Request Created Successfully</span>
                  </div>
                  <p className="mt-1">
                    PR #{createdPR.number}: {createdPR.title}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={createdPR.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setCreatedPR(null);
                        setTab('list');
                      }}
                      className="rounded border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Back to PR List
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreatePR} className="space-y-4">
                  {createError && (
                    <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                      {createError}
                    </div>
                  )}

                  {/* Branch Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                        Source Branch (head)
                      </label>
                      <input
                        type="text"
                        value={headBranch}
                        onChange={(e) => setHeadBranch(e.target.value)}
                        placeholder="feature-branch"
                        className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                        Target Branch (base)
                      </label>
                      <input
                        type="text"
                        value={baseBranch}
                        onChange={(e) => setBaseBranch(e.target.value)}
                        placeholder="main"
                        className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Concise summary of changes"
                      className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                      Description (optional)
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={4}
                      placeholder="Describe what changed and why..."
                      className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden resize-none"
                    />
                  </div>

                  {/* Draft Checkbox */}
                  <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDraft}
                      onChange={(e) => setIsDraft(e.target.checked)}
                      className="rounded border-[var(--border)] bg-[var(--sidebar)] text-[var(--primary)]"
                    />
                    <span>Create as draft pull request</span>
                  </label>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setTab('list')}
                      className="rounded border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 rounded bg-[var(--primary)] px-4 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>Create Pull Request</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
