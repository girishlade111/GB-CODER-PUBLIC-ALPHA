/**
 * Git Source Control Panel for GB Coder.
 *
 * Implements a real, functional VS Code-like Git source control system:
 * - Local Git repository engine (isomorphic-git + lightning-fs)
 * - Real staging & unstaging of files
 * - Atomic commits with real SHA-1 hashes and commit log history
 * - Branch creation, switching, deletion, and 3-way merging
 * - Conflict detection and resolution
 * - Remote Git operations (Fetch, Pull, Push) with GitHub
 * - GitHub Pull Request creation and inspection
 * - Visual line-by-line diff inspector
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Preservation of local IndexedDB project storage and Supabase Cloud Sync
 * - Dark workbench aesthetic with high-contrast Lucide icons
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest as GitPullRequestIcon,
  RefreshCw,
  Plus,
  Minus,
  Check,
  RotateCcw,
  FileCode,
  FilePlus,
  FileX,
  FileDiff,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Cloud,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { ProjectFile } from '../../types/files';
import type {
  GitStatusResult,
  GitCommitRecord,
  GitBranchInfo,
  GitDiffInfo,
  GitAuthor,
  GitRemoteConfig,
} from '../../types/git';
import {
  isRepositoryInitialized,
  initRepository,
  syncWorkingTree,
  getStatus,
  stageFile,
  stageAll,
  unstageFile,
  unstageAll,
  discardFileChanges,
  commit,
  getLog,
  getBranches,
  createBranch,
  switchBranch,
  deleteBranch,
  getFileDiff,
  merge,
  abortMerge,
  getGitAuthor,
} from '../../services/git/gitEngineService';
import {
  getRemoteConfig,
  setRemoteConfig,
  fetchRemote,
  pullRemote,
  pushRemote,
  parseRepoFullName,
} from '../../services/git/gitRemoteService';
import { readCredential, saveCredential } from '../../services/credentialStore';
import { GitDiffModal } from './GitDiffModal';
import { GitBranchModal } from './GitBranchModal';
import { GitCommitHistoryModal } from './GitCommitHistoryModal';
import { GitAuthorModal } from './GitAuthorModal';
import { GitPullRequestModal } from './GitPullRequestModal';
import toast from 'react-hot-toast';

export interface GitSourceControlPanelProps {
  projectId?: string;
  files: ProjectFile[];
  dirtyPaths?: Set<string> | string[];
  activePath: string | null;
  onOpenFile: (path: string) => void;
  onFilesChanged?: (newFiles: ProjectFile[]) => void;
  onFlushEditor?: () => Promise<void>;
}

export const GitSourceControlPanel: React.FC<GitSourceControlPanelProps> = ({
  projectId = 'default-project',
  files,
  dirtyPaths: _dirtyPaths,
  activePath,
  onOpenFile,
  onFilesChanged,
  onFlushEditor,
}) => {
  // Repository state
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [status, setStatus] = useState<GitStatusResult>({
    staged: [],
    unstaged: [],
    isClean: true,
    branch: 'main',
    ahead: 0,
    behind: 0,
    hasConflicts: false,
    conflictedFiles: [],
  });

  // UI state
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const [currentAuthor, setCurrentAuthor] = useState<GitAuthor>(getGitAuthor());

  // Accordion toggles
  const [stagedExpanded, setStagedExpanded] = useState(true);
  const [unstagedExpanded, setUnstagedExpanded] = useState(true);

  // Modals state
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [activeDiff, setActiveDiff] = useState<GitDiffInfo | null>(null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchList, setBranchList] = useState<GitBranchInfo[]>([]);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [commitHistory, setCommitHistory] = useState<GitCommitRecord[]>([]);

  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [prModalOpen, setPrModalOpen] = useState(false);

  // Remote config
  const [remoteConfig, setRemoteConfigState] = useState<GitRemoteConfig | null>(() => getRemoteConfig(projectId));
  const repoFullName = useMemo(() => {
    return remoteConfig ? parseRepoFullName(remoteConfig.url) : null;
  }, [remoteConfig]);

  // Load and refresh Git status
  const refreshStatus = useCallback(async (checkRemote = false) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      const initialized = await isRepositoryInitialized(projectId);
      setIsInitialized(initialized);
      const activeRemote = getRemoteConfig(projectId);
      setRemoteConfigState(activeRemote);
      const activeRepoFullName = activeRemote ? parseRepoFullName(activeRemote.url) : null;

      if (!initialized) {
        setStatus({
          staged: [],
          unstaged: [],
          isClean: true,
          branch: 'main',
          ahead: 0,
          behind: 0,
          hasConflicts: false,
          conflictedFiles: [],
        });
        return;
      }

      // Sync working tree with latest project files
      await syncWorkingTree(projectId, files);
      const gitStatus = await getStatus(projectId);
      setStatus(gitStatus);

      // Check remote ahead/behind if configured and explicitly requested
      if (checkRemote) {
        console.error('[DEBUG-SC] checkRemote is true, activeRemote:', activeRemote?.url, 'activeRepoFullName:', activeRepoFullName);
        if (activeRemote && activeRepoFullName) {
          const token = await readCredential('github');
          console.error('[DEBUG-SC] readCredential token exists:', Boolean(token));
          if (token) {
            try {
              const fetchRes = await fetchRemote(projectId, activeRepoFullName, token);
              console.error('[DEBUG-SC] fetchRes:', JSON.stringify(fetchRes));
              setStatus((prev) => ({
                ...prev,
                ahead: fetchRes.ahead,
                behind: fetchRes.behind,
              }));
            } catch (err) {
              console.error('[DEBUG-SC] fetchRemote threw:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('[GitSourceControl] Failed to refresh status:', err);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [projectId, files, remoteConfig, repoFullName]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__gitDebug = {
        projectId,
        refreshStatus,
        fetchRemote: async () => {
          const activeRemote = getRemoteConfig(projectId);
          const activeRepoFullName = activeRemote ? parseRepoFullName(activeRemote.url) : null;
          const token = await readCredential('github');
          if (!activeRepoFullName || !token) {
            return { error: 'Missing remote or token', activeRepoFullName, hasToken: Boolean(token) };
          }
          return await fetchRemote(projectId, activeRepoFullName, token);
        },
        getStatus: () => getStatus(projectId),
      };
    }
  }, [projectId, refreshStatus]);

  // Initialize repository
  const handleInitializeRepo = async () => {
    setIsRefreshing(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      await initRepository(projectId, files, currentAuthor);
      toast.success('Git repository initialized successfully.');
      await refreshStatus();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to initialize Git repository.';
      toast.error(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Stage single file
  const handleStageFile = async (filepath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (onFlushEditor) await onFlushEditor();
      await stageFile(projectId, filepath);
      await refreshStatus();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to stage file.');
    }
  };

  // Stage all
  const handleStageAll = async () => {
    try {
      if (onFlushEditor) await onFlushEditor();
      await stageAll(projectId);
      await refreshStatus();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to stage all changes.');
    }
  };

  // Unstage single file
  const handleUnstageFile = async (filepath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unstageFile(projectId, filepath);
      await refreshStatus();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to unstage file.');
    }
  };

  // Unstage all
  const handleUnstageAll = async () => {
    try {
      await unstageAll(projectId);
      await refreshStatus();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to unstage all changes.');
    }
  };

  // Discard file changes
  const handleDiscardChanges = async (filepath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Discard unsaved changes to '${filepath}'?`);
    if (!confirmed) return;

    try {
      await discardFileChanges(projectId, filepath);
      await refreshStatus();
      toast.success(`Discarded changes to ${filepath}.`);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to discard changes.');
    }
  };

  // Open Diff Modal
  const handleOpenDiff = async (filepath: string, staged: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const diff = await getFileDiff(projectId, filepath, staged);
      setActiveDiff(diff);
      setDiffModalOpen(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to generate diff.');
    }
  };

  // Commit
  const handleCommit = async () => {
    const cleanMessage = commitMessage.trim();
    if (!cleanMessage) {
      toast.error('Please enter a commit message.');
      return;
    }

    if (status.staged.length === 0) {
      // Prompt to stage all and commit
      const autoStage = window.confirm(
        'There are no staged changes to commit. Would you like to stage all changes and commit directly?',
      );
      if (!autoStage) return;
      await stageAll(projectId);
    }

    setIsCommitting(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      const newCommit = await commit(projectId, cleanMessage, currentAuthor);
      setCommitMessage('');
      toast.success(`Committed [${newCommit.shortSha}]: ${newCommit.message}`);
      await refreshStatus();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Commit failed.');
    } finally {
      setIsCommitting(false);
    }
  };

  // Handle Ctrl+Enter in commit input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleCommit();
    }
  };

  // Open Branches Modal
  const handleOpenBranches = async () => {
    setBranchModalOpen(true);
    try {
      const branches = await getBranches(projectId);
      setBranchList(branches);
    } catch {
      toast.error('Failed to load branches.');
    }
  };

  // Create branch
  const handleCreateBranch = async (name: string) => {
    console.log('[GitSourceControl] handleCreateBranch called with:', name);
    if (onFlushEditor) {
      await Promise.race([
        onFlushEditor(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }
    await createBranch(projectId, name);
    const updatedFiles = await switchBranch(projectId, name);
    toast.success(`Created and switched to branch '${name}'.`);
    setStatus((prev) => ({ ...prev, branch: name }));
    if (onFilesChanged) onFilesChanged(updatedFiles);
    setBranchModalOpen(false);
    await refreshStatus();
  };

  // Switch branch
  const handleSwitchBranch = async (name: string) => {
    if (onFlushEditor) await onFlushEditor();
    const updatedFiles = await switchBranch(projectId, name);
    toast.success(`Switched to branch '${name}'.`);
    setStatus((prev) => ({ ...prev, branch: name }));
    if (onFilesChanged) onFilesChanged(updatedFiles);
    await refreshStatus();
  };

  // Delete branch
  const handleDeleteBranch = async (name: string) => {
    await deleteBranch(projectId, name);
    toast.success(`Branch '${name}' deleted.`);
    const updated = await getBranches(projectId);
    setBranchList(updated);
  };

  // Merge branch
  const handleMergeBranch = async (name: string) => {
    if (onFlushEditor) await onFlushEditor();
    const res = await merge(projectId, name, currentAuthor);
    if (res.status === 'conflict') {
      toast.error('Merge conflict detected. Please resolve conflicting files.');
    } else {
      toast.success(res.message || 'Branch merged successfully.');
    }
    await refreshStatus();
  };

  // Abort merge
  const handleAbortMerge = async () => {
    const updated = await abortMerge(projectId);
    toast.success('Merge aborted. Working tree restored.');
    if (onFilesChanged) onFilesChanged(updated);
    await refreshStatus();
  };

  // Open History Modal
  const handleOpenHistory = async () => {
    setHistoryModalOpen(true);
    try {
      const logs = await getLog(projectId);
      setCommitHistory(logs);
    } catch {
      toast.error('Failed to load commit history.');
    }
  };

  // Open Pull Request Modal
  const handleOpenPRModal = async () => {
    const token = await readCredential('github');
    if (!token) {
      toast.error('Please connect a GitHub token to manage Pull Requests.');
      return;
    }
    if (!repoFullName) {
      toast.error('Configure a remote GitHub repository to manage Pull Requests.');
      return;
    }
    setPrModalOpen(true);
  };

  // Push to remote
  const handlePush = async () => {
    if (!repoFullName) {
      toast.error('Remote origin not configured.');
      return;
    }
    let token = await readCredential('github');
    if (!token) {
      const tokenInput = window.prompt('Please enter your GitHub access token:');
      if (tokenInput && tokenInput.trim()) {
        await saveCredential('github', tokenInput.trim(), true);
        token = tokenInput.trim();
      } else {
        toast.error('Please configure your GitHub access token first.');
        return;
      }
    }

    setIsSyncing(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      const res = await pushRemote(projectId, repoFullName, token);
      if (res.alreadyUpToDate) {
        toast.success('Remote repository is already up to date.');
      } else {
        toast.success(`Pushed to ${repoFullName} (${res.commitSha.slice(0, 7)})`);
      }
      await refreshStatus(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to push changes.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull from remote
  const handlePull = async () => {
    if (!repoFullName) {
      toast.error('Remote origin not configured.');
      return;
    }
    let token = await readCredential('github');
    if (!token) {
      const tokenInput = window.prompt('Please enter your GitHub access token:');
      if (tokenInput && tokenInput.trim()) {
        await saveCredential('github', tokenInput.trim(), true);
        token = tokenInput.trim();
      } else {
        toast.error('Please configure your GitHub access token first.');
        return;
      }
    }

    setIsSyncing(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      const res = await pullRemote(projectId, repoFullName, token, currentAuthor);
      toast.success(`Pulled ${res.filesChanged} files from ${repoFullName}.`);
      if (onFilesChanged) onFilesChanged(res.files);
      await refreshStatus(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to pull changes.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Configure Remote URL prompt
  const handleConfigureRemote = async () => {
    const currentUrl = remoteConfig?.url || '';
    const input = window.prompt(
      'Enter GitHub repository URL (e.g. https://github.com/owner/repo.git or owner/repo):',
      currentUrl,
    );
    if (!input || !input.trim()) return;

    const parsed = parseRepoFullName(input);
    if (!parsed) {
      toast.error('Invalid repository format. Expected owner/repo.');
      return;
    }

    const newConfig = {
      name: 'origin',
      url: `https://github.com/${parsed}.git`,
    };
    setRemoteConfig(projectId, newConfig);
    setRemoteConfigState(newConfig);
    toast.success(`Configured remote origin to ${parsed}.`);

    const existingToken = await readCredential('github');
    if (!existingToken) {
      const tokenInput = window.prompt('Enter GitHub Personal Access Token:');
      if (tokenInput && tokenInput.trim()) {
        await saveCredential('github', tokenInput.trim(), true);
        toast.success('GitHub token saved securely.');
      }
    }

    void refreshStatus();
  };

  return (
    <div
      data-testid="git-source-control-panel"
      className="flex h-full w-full flex-col overflow-hidden bg-[var(--sidebar)] text-xs select-none"
    >
      {/* Top Header Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3 py-2 bg-[var(--sidebar)]">
        <div className="flex items-center gap-1.5 truncate">
          <GitBranch className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
          <span className="font-bold tracking-wider uppercase text-[var(--foreground)] text-[11px] truncate">
            Source Control
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Refresh Button */}
          <button
            data-testid="git-refresh-btn"
            onClick={() => void refreshStatus(true)}
            disabled={isRefreshing}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)] disabled:opacity-50"
            title="Refresh Git Status"
            aria-label="Refresh Git Status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* History Button */}
          <button
            data-testid="git-history-btn"
            onClick={() => void handleOpenHistory()}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="View Commit History"
            aria-label="View Commit History"
          >
            <GitCommit className="h-3.5 w-3.5" />
          </button>

          {/* Pull Request Button */}
          <button
            data-testid="git-pr-btn"
            onClick={() => void handleOpenPRModal()}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Pull Requests"
            aria-label="Pull Requests"
          >
            <GitPullRequestIcon className="h-3.5 w-3.5" />
          </button>

          {/* Branch Switcher Pill */}
          <button
            data-testid="git-branch-switcher-btn"
            onClick={() => void handleOpenBranches()}
            className="flex items-center gap-1 rounded bg-[var(--sidebar-accent)] px-2 py-0.5 text-[10px] font-mono text-[var(--foreground)] hover:bg-white/10"
            title={`Current branch: ${status.branch} (Click to switch)`}
          >
            <span data-testid="git-branch-name" className="truncate max-w-[80px]">{status.branch}</span>
            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isInitialized ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-[var(--muted-foreground)]">
          <GitBranch className="h-10 w-10 text-[var(--muted-foreground)]/40 mb-3" />
          <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
            No Git Repository Initialized
          </h3>
          <p className="text-xs mb-4 max-w-xs text-[var(--muted-foreground)] leading-relaxed">
            Initialize a local Git repository to start tracking changes, creating commits, and syncing with GitHub.
          </p>
          <button
            data-testid="git-init-btn"
            onClick={() => void handleInitializeRepo()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] shadow-xs hover:opacity-90 disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Initialize Repository</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Conflict Alert Banner */}
          {status.hasConflicts && (
            <div className="border-b border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Merge Conflict in Progress</span>
                </div>
                <button
                  onClick={() => void handleAbortMerge()}
                  className="rounded border border-rose-500/30 bg-rose-950/40 px-2 py-0.5 text-[10px] font-medium hover:bg-rose-900/50"
                >
                  Abort Merge
                </button>
              </div>
              <p className="mt-1 text-[11px] text-rose-300/80">
                Conflicted files: {status.conflictedFiles.join(', ')}
              </p>
            </div>
          )}

          {/* Commit Input Area */}
          <div className="border-b border-[var(--border)] p-3 space-y-2 bg-[var(--sidebar)]/50">
            <div className="relative">
              <textarea
                data-testid="git-commit-input"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Commit message (Ctrl+Enter to commit)"
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:border-[var(--primary)] focus:outline-hidden resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Author badge */}
              <button
                onClick={() => setAuthorModalOpen(true)}
                className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                title={`Author: ${currentAuthor.name} <${currentAuthor.email}> (Click to edit)`}
              >
                <User className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{currentAuthor.name}</span>
              </button>

              {/* Commit Button */}
              <button
                data-testid="git-commit-btn"
                onClick={() => void handleCommit()}
                disabled={isCommitting || !commitMessage.trim()}
                className="flex items-center gap-1.5 rounded bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 shadow-xs"
              >
                {isCommitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Commit</span>
              </button>
            </div>
          </div>

          {/* STAGED CHANGES Section */}
          <div className="border-b border-[var(--border)]">
            <div
              data-testid="git-staged-header"
              onClick={() => setStagedExpanded(!stagedExpanded)}
              className="flex cursor-pointer items-center justify-between px-3 py-1.5 bg-[var(--sidebar)] hover:bg-white/5 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                {stagedExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>Staged Changes</span>
                <span data-testid="git-staged-count" className="rounded bg-[var(--sidebar-accent)] px-1.5 py-0.2 text-[10px] font-mono">
                  {status.staged.length}
                </span>
              </div>

              {status.staged.length > 0 && (
                <button
                  data-testid="git-unstage-all-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleUnstageAll();
                  }}
                  className="rounded p-0.5 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  title="Unstage All Changes"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {stagedExpanded && (
              <div className="p-1 space-y-0.5">
                {status.staged.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-[var(--muted-foreground)] italic">
                    No staged changes.
                  </div>
                ) : (
                  status.staged.map((file) => {
                    const name = file.path.split('/').pop() || file.path;
                    const folder = file.path.slice(0, file.path.lastIndexOf('/'));
                    const isActive = file.path === activePath;

                    return (
                      <div
                        key={file.path}
                        onClick={() => onOpenFile(file.path)}
                        className={`group flex cursor-pointer items-center justify-between rounded px-2 py-1 transition-colors ${
                          isActive
                            ? 'bg-[var(--primary)]/20 text-[var(--foreground)]'
                            : 'text-[var(--muted-foreground)] hover:bg-white/5 hover:text-[var(--foreground)]'
                        }`}
                        title={file.path}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {file.badge === 'A' ? (
                            <FilePlus className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : file.badge === 'D' ? (
                            <FileX className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <FileCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-[11px]">{name}</span>
                          {folder && (
                            <span className="truncate text-[10px] text-[var(--muted-foreground)] opacity-70">
                              {folder}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Diff Inspector */}
                          <button
                            onClick={(e) => void handleOpenDiff(file.path, true, e)}
                            className="hidden group-hover:inline-flex rounded p-1 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            title="Inspect Staged Diff"
                          >
                            <FileDiff className="h-3 w-3" />
                          </button>

                          {/* Unstage Button */}
                          <button
                            data-testid={`git-unstage-file-${file.path}`}
                            onClick={(e) => void handleUnstageFile(file.path, e)}
                            className="hidden group-hover:inline-flex rounded p-1 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            title="Unstage Changes"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span
                            className={`font-mono text-[10px] font-bold w-4 text-center ${
                              file.badge === 'A'
                                ? 'text-emerald-400'
                                : file.badge === 'D'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {file.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* CHANGES (Unstaged) Section */}
          <div className="border-b border-[var(--border)]">
            <div
              data-testid="git-unstaged-header"
              onClick={() => setUnstagedExpanded(!unstagedExpanded)}
              className="flex cursor-pointer items-center justify-between px-3 py-1.5 bg-[var(--sidebar)] hover:bg-white/5 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                {unstagedExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>Changes</span>
                <span data-testid="git-unstaged-count" className="rounded bg-[var(--sidebar-accent)] px-1.5 py-0.2 text-[10px] font-mono">
                  {status.unstaged.length}
                </span>
              </div>

              {status.unstaged.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    data-testid="git-stage-all-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleStageAll();
                    }}
                    className="rounded p-0.5 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    title="Stage All Changes"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {unstagedExpanded && (
              <div className="p-1 space-y-0.5">
                {status.unstaged.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-[var(--muted-foreground)] italic">
                    Working tree clean.
                  </div>
                ) : (
                  status.unstaged.map((file) => {
                    const name = file.path.split('/').pop() || file.path;
                    const folder = file.path.slice(0, file.path.lastIndexOf('/'));
                    const isActive = file.path === activePath;

                    return (
                      <div
                        key={file.path}
                        onClick={() => onOpenFile(file.path)}
                        className={`group flex cursor-pointer items-center justify-between rounded px-2 py-1 transition-colors ${
                          isActive
                            ? 'bg-[var(--primary)]/20 text-[var(--foreground)]'
                            : 'text-[var(--muted-foreground)] hover:bg-white/5 hover:text-[var(--foreground)]'
                        }`}
                        title={file.path}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {file.badge === 'U' ? (
                            <FilePlus className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : file.badge === 'D' ? (
                            <FileX className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <FileCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-[11px]">{name}</span>
                          {folder && (
                            <span className="truncate text-[10px] text-[var(--muted-foreground)] opacity-70">
                              {folder}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Discard changes */}
                          <button
                            onClick={(e) => void handleDiscardChanges(file.path, e)}
                            className="hidden group-hover:inline-flex rounded p-1 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-rose-400"
                            title="Discard File Changes"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>

                          {/* Diff Inspector */}
                          <button
                            onClick={(e) => void handleOpenDiff(file.path, false, e)}
                            className="hidden group-hover:inline-flex rounded p-1 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            title="Inspect Working Tree Diff"
                          >
                            <FileDiff className="h-3 w-3" />
                          </button>

                          {/* Stage Button */}
                          <button
                            data-testid={`git-stage-file-${file.path}`}
                            onClick={(e) => void handleStageFile(file.path, e)}
                            className="hidden group-hover:inline-flex rounded p-1 hover:bg-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            title="Stage Changes"
                          >
                            <Plus className="h-3 w-3" />
                          </button>

                          <span
                            className={`font-mono text-[10px] font-bold w-4 text-center ${
                              file.badge === 'U'
                                ? 'text-emerald-400'
                                : file.badge === 'D'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {file.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Remote Synchronize Bar */}
      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--sidebar)] p-2.5">
        {remoteConfig ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span data-testid="git-remote-name" className="truncate font-medium text-[var(--foreground)]">
                {repoFullName || remoteConfig.name}
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--muted-foreground)]">
                <span data-testid="git-ahead-count" className="flex items-center gap-0.5" title="Commits ahead of remote">
                  <ArrowUp className="h-3 w-3 text-emerald-400" />
                  {status.ahead}
                </span>
                <span data-testid="git-behind-count" className="flex items-center gap-0.5" title="Commits behind remote">
                  <ArrowDown className="h-3 w-3 text-amber-400" />
                  {status.behind}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                data-testid="git-pull-btn"
                onClick={() => void handlePull()}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-1 rounded border border-[var(--border)] bg-[var(--background)] py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-white/5 disabled:opacity-50"
              >
                <ArrowDown className="h-3 w-3" />
                <span>Pull</span>
              </button>

              <button
                data-testid="git-push-btn"
                onClick={() => void handlePush()}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-1 rounded bg-[var(--primary)] py-1 text-[11px] font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                <span>Push</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            data-testid="git-connect-remote-btn"
            onClick={handleConfigureRemote}
            className="w-full flex items-center justify-center gap-1.5 rounded border border-[var(--border)] bg-[var(--sidebar-accent)] py-1.5 text-[11px] font-medium text-[var(--foreground)] hover:bg-white/10"
          >
            <Cloud className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Connect GitHub Remote</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <GitDiffModal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        diffInfo={activeDiff}
      />

      <GitBranchModal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        branches={branchList}
        currentBranch={status.branch}
        onCreateBranch={handleCreateBranch}
        onSwitchBranch={handleSwitchBranch}
        onDeleteBranch={handleDeleteBranch}
        onMergeBranch={handleMergeBranch}
      />

      <GitCommitHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        branch={status.branch}
        commits={commitHistory}
      />

      <GitAuthorModal
        isOpen={authorModalOpen}
        onClose={() => setAuthorModalOpen(false)}
        onSaved={(author) => {
          setCurrentAuthor(author);
          toast.success('Author identity updated.');
        }}
      />

      {repoFullName && (
        <GitPullRequestModal
          isOpen={prModalOpen}
          onClose={() => setPrModalOpen(false)}
          repoFullName={repoFullName}
          token=""
          currentBranch={status.branch}
          branches={branchList.map((b) => b.name)}
        />
      )}
    </div>
  );
};
