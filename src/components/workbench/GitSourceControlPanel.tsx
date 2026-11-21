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
  ArrowUp,
  ArrowDown,
  Cloud,
  Loader2,
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
import {
  getGitHubAppStatus,
  startGitHubAppAuth,
  disconnectGitHubApp,
  type GitHubAppStatus,
} from '../../services/git/gitGitHubAppService';
import { readCredential, saveCredential } from '../../services/credentialStore';
import { GitDiffModal } from './GitDiffModal';
import { GitBranchModal } from './GitBranchModal';
import { GitCommitHistoryModal } from './GitCommitHistoryModal';
import { GitAuthorModal } from './GitAuthorModal';
import { GitPullRequestModal } from './GitPullRequestModal';
import Codicon from '../ui/Codicon';
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

  // GitHub App Phase 5 state
  const [githubAppStatus, setGithubAppStatus] = useState<GitHubAppStatus | null>(null);
  const [isConnectingApp, setIsConnectingApp] = useState(false);

  useEffect(() => {
    let mounted = true;
    getGitHubAppStatus()
      .then((st) => {
        if (mounted) setGithubAppStatus(st);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleConnectGitHubApp = async () => {
    setIsConnectingApp(true);
    try {
      const url = await startGitHubAppAuth(window.location.pathname);
      if (typeof window !== 'undefined' && window.location) {
        window.location.assign(url);
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to start GitHub App authorization.');
    } finally {
      setIsConnectingApp(false);
    }
  };

  const handleDisconnectGitHubApp = async () => {
    try {
      await disconnectGitHubApp();
      setGithubAppStatus({ isConnected: false });
      toast.success('Disconnected GitHub App.');
      await refreshStatus(true);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to disconnect GitHub App.');
    }
  };

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
    const isAppActive = Boolean(githubAppStatus?.isConnected && !githubAppStatus.isExpired);
    if (!token && !isAppActive) {
      const tokenInput = window.prompt('Please enter your GitHub access token:');
      if (tokenInput && tokenInput.trim()) {
        await saveCredential('github', tokenInput.trim(), true);
        token = tokenInput.trim();
      } else {
        toast.error('Please configure your GitHub access token or connect GitHub App.');
        return;
      }
    }

    setIsSyncing(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      const res = await pushRemote(projectId, repoFullName, token || undefined);
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
    const isAppActive = Boolean(githubAppStatus?.isConnected && !githubAppStatus.isExpired);
    if (!token && !isAppActive) {
      const tokenInput = window.prompt('Please enter your GitHub access token:');
      if (tokenInput && tokenInput.trim()) {
        await saveCredential('github', tokenInput.trim(), true);
        token = tokenInput.trim();
      } else {
        toast.error('Please configure your GitHub access token or connect GitHub App.');
        return;
      }
    }

    setIsSyncing(true);
    try {
      if (onFlushEditor) await onFlushEditor();
      const res = await pullRemote(projectId, repoFullName, token || undefined, currentAuthor);
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
      className="flex h-full w-full flex-col overflow-hidden bg-[#181818] text-[12px] text-[#cccccc] font-sans select-none"
    >
      {/* Top Header Bar (35px) */}
      <div className="flex h-[35px] shrink-0 items-center justify-between border-b border-[#2b2b2b] px-3 bg-[#181818]">
        <div className="flex items-center gap-1.5 truncate">
          <Codicon name="source-control" className="text-[13px] text-[#3794ff] shrink-0" />
          <span className="font-bold tracking-wider uppercase text-[#858585] text-[11px] truncate">
            Source Control
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Refresh Button */}
          <button
            data-testid="git-refresh-btn"
            onClick={() => void refreshStatus(true)}
            disabled={isRefreshing}
            className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#cccccc] hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            title="Refresh Git Status"
            aria-label="Refresh Git Status"
          >
            <Codicon name="refresh" className={`text-[13px] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* History Button */}
          <button
            data-testid="git-history-btn"
            onClick={() => void handleOpenHistory()}
            className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#cccccc] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="View Commit History"
            aria-label="View Commit History"
          >
            <Codicon name="history" className="text-[13px]" />
          </button>

          {/* Pull Request Button */}
          <button
            data-testid="git-pr-btn"
            onClick={() => void handleOpenPRModal()}
            className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#cccccc] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Pull Requests"
            aria-label="Pull Requests"
          >
            <Codicon name="git-pull-request" className="text-[13px]" />
          </button>

          {/* Branch Switcher Pill */}
          <button
            data-testid="git-branch-switcher-btn"
            onClick={() => void handleOpenBranches()}
            className="flex items-center gap-1 rounded-[2px] bg-[#2a2d2e] px-1.5 py-0.5 text-[10px] font-mono text-[#cccccc] hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title={`Current branch: ${status.branch} (Click to switch)`}
          >
            <Codicon name="git-branch" className="text-[11px] text-[#858585]" />
            <span data-testid="git-branch-name" className="truncate max-w-[80px]">{status.branch}</span>
            <Codicon name="chevron-down" className="text-[10px] text-[#858585]" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isInitialized ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-[#858585]">
          <Codicon name="source-control" className="text-4xl text-[#555555] mb-3" />
          <h3 className="font-medium text-sm text-[#cccccc] mb-1">
            No Git Repository Initialized
          </h3>
          <p className="text-xs mb-4 max-w-xs text-[#858585] leading-relaxed">
            Initialize a local Git repository to start tracking changes, creating commits, and syncing with GitHub.
          </p>
          <button
            data-testid="git-init-btn"
            onClick={() => void handleInitializeRepo()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-[2px] bg-[#0078d4] hover:bg-[#006cbd] px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isRefreshing ? (
              <Codicon name="loading" className="text-[14px] animate-spin" />
            ) : (
              <Codicon name="plus" className="text-[14px]" />
            )}
            <span>Initialize Repository</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Conflict Alert Banner */}
          {status.hasConflicts && (
            <div className="border-b border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Codicon name="warning" className="text-[14px] text-rose-400 shrink-0" />
                  <span>Merge Conflict in Progress</span>
                </div>
                <button
                  onClick={() => void handleAbortMerge()}
                  className="rounded-[2px] border border-rose-500/30 bg-rose-950/40 px-2 py-0.5 text-[10px] font-medium hover:bg-rose-900/50 cursor-pointer"
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
          <div className="border-b border-[#2b2b2b] p-2 space-y-1.5 bg-[#181818]">
            <div className="relative">
              <textarea
                data-testid="git-commit-input"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Commit message (Ctrl+Enter to commit)"
                className="w-full rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2 py-1.5 text-[12px] text-white placeholder-[#858585] focus:border-[#0078d4] outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Author badge */}
              <button
                onClick={() => setAuthorModalOpen(true)}
                className="flex items-center gap-1 text-[11px] text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                title={`Author: ${currentAuthor.name} <${currentAuthor.email}> (Click to edit)`}
              >
                <Codicon name="account" className="text-[12px]" />
                <span className="truncate max-w-[120px]">{currentAuthor.name}</span>
              </button>

              {/* Commit Button */}
              <button
                data-testid="git-commit-btn"
                onClick={() => void handleCommit()}
                disabled={isCommitting || !commitMessage.trim()}
                className="flex items-center gap-1.5 rounded-[2px] bg-[#0078d4] hover:bg-[#006cbd] px-3 py-1 text-[12px] font-medium text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isCommitting ? (
                  <Codicon name="loading" className="text-[13px] animate-spin" />
                ) : (
                  <Codicon name="check" className="text-[13px]" />
                )}
                <span>Commit</span>
              </button>
            </div>
          </div>

          {/* STAGED CHANGES Section */}
          <div className="border-b border-[#2b2b2b]">
            <div
              data-testid="git-staged-header"
              onClick={() => setStagedExpanded(!stagedExpanded)}
              className="flex h-[22px] cursor-pointer items-center justify-between px-2 bg-[#181818] hover:bg-[#2a2d2e] text-[11px] font-bold text-[#cccccc] uppercase tracking-wider select-none"
            >
              <div className="flex items-center gap-1.5">
                <Codicon
                  name="chevron-right"
                  className={`text-[12px] text-[#858585] transition-transform duration-100 ${
                    stagedExpanded ? 'rotate-90 text-[#cccccc]' : ''
                  }`}
                />
                <span>Staged Changes</span>
                <span data-testid="git-staged-count" className="rounded-[2px] bg-[#2a2d2e] px-1 text-[10px] font-mono text-[#858585]">
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
                  className="rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                  title="Unstage All Changes"
                >
                  <Codicon name="remove" className="text-[12px]" />
                </button>
              )}
            </div>

            {stagedExpanded && (
              <div className="py-0.5 space-y-px">
                {status.staged.length === 0 ? (
                  <div className="px-3 py-1.5 text-[11px] text-[#858585] italic">
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
                        className={`group flex h-[22px] cursor-pointer items-center justify-between px-2 transition-colors select-none ${
                          isActive
                            ? 'bg-[#04395e] text-white font-normal'
                            : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'
                        }`}
                        title={file.path}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Codicon
                            name={file.badge === 'D' ? 'trash' : file.badge === 'A' ? 'new-file' : 'file-code'}
                            className={`text-[13px] shrink-0 ${
                              file.badge === 'D' ? 'text-[#f14c4c]' : file.badge === 'A' ? 'text-[#73c991]' : 'text-[#cca700]'
                            }`}
                          />
                          <span className="truncate text-[12px]">{name}</span>
                          {folder && (
                            <span className="truncate text-[10px] text-[#858585]">
                              {folder}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Diff Inspector */}
                          <button
                            onClick={(e) => void handleOpenDiff(file.path, true, e)}
                            className="hidden group-hover:inline-flex rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                            title="Inspect Staged Diff"
                          >
                            <Codicon name="diff" className="text-[12px]" />
                          </button>

                          {/* Unstage Button */}
                          <button
                            data-testid={`git-unstage-file-${file.path}`}
                            onClick={(e) => void handleUnstageFile(file.path, e)}
                            className="hidden group-hover:inline-flex rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                            title="Unstage Changes"
                          >
                            <Codicon name="remove" className="text-[12px]" />
                          </button>

                          <span
                            className={`font-mono text-[10px] font-bold w-4 text-center ${
                              file.badge === 'A'
                                ? 'text-[#73c991]'
                                : file.badge === 'D'
                                ? 'text-[#f14c4c]'
                                : 'text-[#cca700]'
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
          <div className="border-b border-[#2b2b2b]">
            <div
              data-testid="git-unstaged-header"
              onClick={() => setUnstagedExpanded(!unstagedExpanded)}
              className="flex h-[22px] cursor-pointer items-center justify-between px-2 bg-[#181818] hover:bg-[#2a2d2e] text-[11px] font-bold text-[#cccccc] uppercase tracking-wider select-none"
            >
              <div className="flex items-center gap-1.5">
                <Codicon
                  name="chevron-right"
                  className={`text-[12px] text-[#858585] transition-transform duration-100 ${
                    unstagedExpanded ? 'rotate-90 text-[#cccccc]' : ''
                  }`}
                />
                <span>Changes</span>
                <span data-testid="git-unstaged-count" className="rounded-[2px] bg-[#2a2d2e] px-1 text-[10px] font-mono text-[#858585]">
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
                    className="rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                    title="Stage All Changes"
                  >
                    <Codicon name="plus" className="text-[12px]" />
                  </button>
                </div>
              )}
            </div>

            {unstagedExpanded && (
              <div className="py-0.5 space-y-px">
                {status.unstaged.length === 0 ? (
                  <div className="px-3 py-1.5 text-[11px] text-[#858585] italic">
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
                        className={`group flex h-[22px] cursor-pointer items-center justify-between px-2 transition-colors select-none ${
                          isActive
                            ? 'bg-[#04395e] text-white font-normal'
                            : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'
                        }`}
                        title={file.path}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Codicon
                            name={file.badge === 'D' ? 'trash' : file.badge === 'U' ? 'new-file' : 'file-code'}
                            className={`text-[13px] shrink-0 ${
                              file.badge === 'D' ? 'text-[#f14c4c]' : file.badge === 'U' ? 'text-[#73c991]' : 'text-[#cca700]'
                            }`}
                          />
                          <span className="truncate text-[12px]">{name}</span>
                          {folder && (
                            <span className="truncate text-[10px] text-[#858585]">
                              {folder}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Discard changes */}
                          <button
                            onClick={(e) => void handleDiscardChanges(file.path, e)}
                            className="hidden group-hover:inline-flex rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-[#f14c4c] cursor-pointer"
                            title="Discard File Changes"
                          >
                            <Codicon name="discard" className="text-[12px]" />
                          </button>

                          {/* Diff Inspector */}
                          <button
                            onClick={(e) => void handleOpenDiff(file.path, false, e)}
                            className="hidden group-hover:inline-flex rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                            title="Inspect Working Tree Diff"
                          >
                            <Codicon name="diff" className="text-[12px]" />
                          </button>

                          {/* Stage Button */}
                          <button
                            data-testid={`git-stage-file-${file.path}`}
                            onClick={(e) => void handleStageFile(file.path, e)}
                            className="hidden group-hover:inline-flex rounded-[2px] p-0.5 hover:bg-white/10 text-[#858585] hover:text-white cursor-pointer"
                            title="Stage Changes"
                          >
                            <Codicon name="plus" className="text-[12px]" />
                          </button>

                          <span
                            className={`font-mono text-[10px] font-bold w-4 text-center ${
                              file.badge === 'U'
                                ? 'text-[#73c991]'
                                : file.badge === 'D'
                                ? 'text-[#f14c4c]'
                                : 'text-[#cca700]'
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
      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--sidebar)] p-2.5 space-y-2">
        {/* GitHub App connection banner */}
        {githubAppStatus?.isConnected ? (
          <div data-testid="github-app-status-badge" className="flex items-center justify-between rounded bg-emerald-950/30 border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-300">
            <span className="truncate">GitHub App: @{githubAppStatus.githubUsername || 'connected'}</span>
            <button
              data-testid="github-app-disconnect-btn"
              onClick={() => void handleDisconnectGitHubApp()}
              className="text-[10px] text-[var(--muted-foreground)] hover:text-rose-400 ml-1.5"
              title="Disconnect GitHub App"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--muted-foreground)] px-0.5">
            <span>PAT-less access:</span>
            <button
              data-testid="github-app-connect-btn"
              onClick={() => void handleConnectGitHubApp()}
              disabled={isConnectingApp}
              className="text-[10px] font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              {isConnectingApp && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
              <span>Connect GitHub App</span>
            </button>
          </div>
        )}

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
