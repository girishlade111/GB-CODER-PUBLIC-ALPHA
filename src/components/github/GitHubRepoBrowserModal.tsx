/**
 * GitHub Repository Browser & Importer Modal for GB Coder.
 *
 * Capabilities:
 * - Scoped GitHub authentication using personal access tokens (stored via AES-GCM in credentialStore).
 * - Live browsing and filtering of authorized public and private GitHub repositories.
 * - Dynamic branch inspection via the GitHub Git Data API.
 * - Selective import destination: Local IndexedDB Project or Private Supabase Cloud Project.
 * - Immediate workspace launch into the Advanced IDE (Monaco + WebContainer).
 *
 * Adheres strictly to the UX/UI design doctrine:
 * - Zero emoji anywhere.
 * - High-contrast Lucide icons.
 * - Intent-based token styling.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Github,
  Search,
  Lock,
  GitBranch,
  HardDrive,
  Cloud,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  FolderDown,
  RotateCcw,
} from 'lucide-react';
import {
  listRepos,
  listBranches,
  pullFiles,
  fetchViewer,
  parseRepoInput,
  GitHubRepo,
  GitHubUser,
} from '../../services/githubSyncService';
import {
  readCredential,
  saveCredential,
  forgetCredential,
  describeCredential,
  isEncryptionAvailable,
} from '../../services/credentialStore';
import { createProject, EditorStyle } from '../../services/projects/projectDatabase';
import { createCloudProject } from '../../services/projects/cloudProjectService';
import { inferProjectType, inferEntry } from '../../services/projectImportService';
import { useAuth } from '../../features/auth/useAuth';
import toast from 'react-hot-toast';

const GITHUB_TOKEN_ID = 'github';
const TOKEN_CREATION_URL =
  'https://github.com/settings/tokens/new?scopes=repo&description=GB%20Coder%20IDE';

export interface GitHubRepoBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (projectId: string, editorStyle: EditorStyle) => void;
}

export const GitHubRepoBrowserModal: React.FC<GitHubRepoBrowserModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { user: authUser } = useAuth();

  // Token management state
  const [token, setToken] = useState('');
  const [revealToken, setRevealToken] = useState(false);
  const [rememberToken, setRememberToken] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [viewer, setViewer] = useState<GitHubUser | null>(null);

  // Repositories state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  // Selection & Import state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [importDestination, setImportDestination] = useState<'local' | 'cloud'>(
    authUser ? 'cloud' : 'local',
  );
  const [selectedEditorStyle, setSelectedEditorStyle] = useState<EditorStyle>('vscode');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusText, setImportStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load stored token on mount
  useEffect(() => {
    if (!isOpen) return;

    const storedMeta = describeCredential(GITHUB_TOKEN_ID);
    setRememberToken(storedMeta?.sessionOnly === false);

    let cancelled = false;

    const loadExistingToken = async () => {
      const stored = await readCredential(GITHUB_TOKEN_ID);
      if (stored && !cancelled) {
        setToken(stored);
        setIsVerifyingToken(true);
        try {
          const [userRecord, reposList] = await Promise.all([
            fetchViewer(stored),
            listRepos(stored),
          ]);
          if (!cancelled) {
            setViewer(userRecord);
            setRepos(reposList);
          }
        } catch (err) {
          if (!cancelled) {
            console.warn('[GitHubRepoBrowser] Token verification notice:', err);
            setErrorMessage('Saved GitHub token could not be verified. Please re-enter.');
          }
        } finally {
          if (!cancelled) setIsVerifyingToken(false);
        }
      }
    };

    void loadExistingToken();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Connect token manually
  const handleConnectToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) {
      setErrorMessage('Please enter a GitHub Personal Access Token.');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingToken(true);
    try {
      const [userRecord, reposList] = await Promise.all([
        fetchViewer(cleanToken),
        listRepos(cleanToken),
      ]);
      await saveCredential(GITHUB_TOKEN_ID, cleanToken, rememberToken);
      setViewer(userRecord);
      setRepos(reposList);
      toast.success(`Connected as @${userRecord.login}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired GitHub token.';
      setErrorMessage(message);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // Disconnect token
  const handleDisconnect = () => {
    forgetCredential(GITHUB_TOKEN_ID);
    setToken('');
    setViewer(null);
    setRepos([]);
    setSelectedRepo(null);
    setBranches([]);
    setSelectedBranch('');
    toast.success('GitHub token removed.');
  };

  // When a repository is selected, fetch its branches
  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch || 'main');
    setBranches([repo.defaultBranch || 'main']);
    setIsLoadingBranches(true);

    try {
      const parsed = parseRepoInput(repo.fullName);
      if (parsed) {
        const branchList = await listBranches(token.trim(), parsed.owner, parsed.repo);
        if (branchList.length > 0) {
          setBranches(branchList);
          if (!branchList.includes(repo.defaultBranch)) {
            setSelectedBranch(branchList[0]);
          }
        }
      }
    } catch (err) {
      console.warn('[GitHubRepoBrowser] Branch fetch notice:', err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Filter repositories
  const filteredRepos = useMemo(() => {
    let result = [...repos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.fullName.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)),
      );
    }

    if (filterType === 'public') {
      result = result.filter((r) => !r.private);
    } else if (filterType === 'private') {
      result = result.filter((r) => r.private);
    }

    return result;
  }, [repos, searchQuery, filterType]);

  // Execute Import
  const handleImport = async () => {
    if (!selectedRepo) return;
    const cleanToken = token.trim();
    if (!cleanToken) {
      setErrorMessage('GitHub token required.');
      return;
    }

    const parsed = parseRepoInput(selectedRepo.fullName);
    if (!parsed) {
      setErrorMessage('Invalid repository identifier.');
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setImportStatusText(`Fetching source tree from ${selectedRepo.fullName} (${selectedBranch})...`);

    try {
      const pullResult = await pullFiles({
        token: cleanToken,
        ref: parsed,
        branch: selectedBranch,
      });

      if (pullResult.files.length === 0) {
        throw new Error('No compatible text files found in the specified branch.');
      }

      setImportStatusText(`Imported ${pullResult.files.length} files. Creating project workspace...`);

      const paths = pullResult.files.map((f) => f.path);
      const projectType = inferProjectType(paths);
      const entry = inferEntry(paths, projectType) || 'index.html';

      // 1. Create local project record in IndexedDB
      const localRecord = await createProject({
        name: selectedRepo.name,
        editorStyle: selectedEditorStyle,
        projectType,
        entry,
        files: pullResult.files,
      });

      if (!localRecord) {
        throw new Error('Failed to initialize local IndexedDB workspace.');
      }

      // 2. Optionally create Supabase Cloud Project
      if (importDestination === 'cloud' && authUser) {
        setImportStatusText('Saving project to Supabase Cloud Projects...');
        try {
          await createCloudProject({
            name: selectedRepo.name,
            description: selectedRepo.description || `Imported from ${selectedRepo.fullName} (${selectedBranch})`,
            project_type: projectType,
            editor_style: selectedEditorStyle,
            source_provider: 'github',
            source_repo_full_name: selectedRepo.fullName,
            source_repo_id: selectedRepo.id,
            source_branch: selectedBranch,
            entry,
            files: pullResult.files,
          });
          toast.success(`Imported and backed up to Supabase Cloud: ${selectedRepo.name}`);
        } catch (cloudErr) {
          console.warn('[GitHubRepoBrowser] Cloud backup notice:', cloudErr);
          toast.error('Project created locally; cloud backup encountered an issue.');
        }
      } else {
        toast.success(`Imported repository: ${selectedRepo.name}`);
      }

      window.dispatchEvent(new CustomEvent('gb-coder:projects-updated'));
      onImportSuccess?.(localRecord.id, selectedEditorStyle);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Repository import failed.';
      setErrorMessage(message);
    } finally {
      setIsImporting(false);
      setImportStatusText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repo-browser-title"
      data-testid="github-repo-browser-modal"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-stroke-subtle bg-surface-base shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <Github className="h-5 w-5 text-accent" />
            <div>
              <h2 id="repo-browser-title" className="text-sm font-semibold text-content-primary">
                Import from GitHub
              </h2>
              <p className="text-[11px] text-content-secondary">
                Select a repository and branch to import into the GB Coder workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            aria-label="Close repository browser"
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Token Authentication Section */}
          {!viewer ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-stroke-subtle bg-surface-canvas p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-content-primary">
                  <Github className="h-4 w-4 text-accent" />
                  <span>GitHub Repository Authorization</span>
                </div>
                <p className="text-content-secondary leading-relaxed text-[11.5px]">
                  Sign-in gives basic identity. To browse repositories, read source trees, or import
                  private code, supply a GitHub Personal Access Token (classic with{' '}
                  <code className="font-mono text-accent">repo</code> scope, or fine-grained with Contents
                  read access).
                </p>
                <a
                  href={TOKEN_CREATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline pt-1"
                >
                  Generate a Personal Access Token on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <form onSubmit={handleConnectToken} className="space-y-3">
                <div>
                  <label
                    htmlFor="github-browser-token-input"
                    className="block text-xs font-semibold text-content-secondary mb-1.5"
                  >
                    Personal Access Token
                  </label>
                  <div className="relative">
                    <input
                      id="github-browser-token-input"
                      type={revealToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_... or github_pat_..."
                      data-testid="github-token-input"
                      className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas pl-3.5 pr-10 py-2 text-xs text-content-primary outline-none focus:border-accent font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealToken(!revealToken)}
                      aria-label={revealToken ? 'Hide token' : 'Show token'}
                      className="absolute right-3 top-2.5 text-content-muted hover:text-content-primary"
                    >
                      {revealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-content-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberToken}
                    onChange={(e) => setRememberToken(e.target.checked)}
                    className="rounded border-stroke-subtle accent-accent"
                  />
                  <span>
                    Remember securely on this device (
                    {isEncryptionAvailable() ? 'AES-GCM encrypted' : 'Local storage'})
                  </span>
                </label>

                {errorMessage && (
                  <div
                    className="flex items-center gap-2 rounded-xl bg-danger-subtle border border-danger/20 p-3 text-xs text-danger"
                    data-testid="github-token-error"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingToken || !token.trim()}
                  data-testid="github-connect-btn"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isVerifyingToken ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <span>Connect GitHub Account</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account Ribbon */}
              <div className="flex items-center justify-between rounded-xl border border-stroke-subtle bg-surface-canvas p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={viewer.avatarUrl}
                    alt={viewer.login}
                    className="h-8 w-8 rounded-full border border-stroke"
                  />
                  <div>
                    <div className="text-xs font-semibold text-content-primary">
                      {viewer.name || viewer.login}
                    </div>
                    <div className="text-[11px] font-mono text-content-muted">@{viewer.login}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="rounded-lg border border-stroke-subtle px-2.5 py-1 text-[11px] font-medium text-content-muted hover:text-danger hover:border-danger/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-content-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repositories..."
                    aria-label="Search repositories"
                    className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas pl-8 pr-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center rounded-xl border border-stroke-subtle bg-surface-canvas p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-surface-raised text-content-primary shadow-sm'
                        : 'text-content-muted hover:text-content-primary'
                    }`}
                  >
                    All ({repos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('public')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filterType === 'public'
                        ? 'bg-surface-raised text-content-primary shadow-sm'
                        : 'text-content-muted hover:text-content-primary'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('private')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filterType === 'private'
                        ? 'bg-surface-raised text-content-primary shadow-sm'
                        : 'text-content-muted hover:text-content-primary'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Repositories List */}
              <div
                className="rounded-xl border border-stroke-subtle bg-surface-canvas overflow-hidden max-h-52 overflow-y-auto divide-y divide-stroke-subtle"
                data-testid="github-repo-list"
              >
                {isLoadingRepos ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-content-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span>Loading repositories...</span>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-content-muted">
                    No repositories match current search criteria.
                  </div>
                ) : (
                  filteredRepos.map((r) => {
                    const isSelected = selectedRepo?.id === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => void handleSelectRepo(r)}
                        data-testid={`github-repo-item-${r.name}`}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-accent-subtle/40 border-l-2 border-accent'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-content-primary truncate">
                              {r.fullName}
                            </span>
                            {r.private ? (
                              <span className="inline-flex items-center gap-1 rounded bg-surface-raised px-1.5 py-0.2 text-[10px] text-content-muted border border-stroke-subtle">
                                <Lock className="h-2.5 w-2.5" />
                                Private
                              </span>
                            ) : (
                              <span className="rounded bg-surface-raised px-1.5 py-0.2 text-[10px] text-content-muted border border-stroke-subtle">
                                Public
                              </span>
                            )}
                          </div>
                          {r.description && (
                            <p className="text-[11px] text-content-muted truncate mt-0.5">
                              {r.description}
                            </p>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected Repo Configuration */}
              {selectedRepo && (
                <div className="rounded-xl border border-stroke-subtle bg-surface-canvas p-4 space-y-3 animate-fade-in">
                  <div className="text-xs font-semibold text-content-primary">
                    Import Options for {selectedRepo.name}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Branch Selection */}
                    <div>
                      <label
                        htmlFor="github-branch-select"
                        className="block text-[11px] font-semibold text-content-secondary mb-1"
                      >
                        Branch
                      </label>
                      <div className="relative">
                        <select
                          id="github-branch-select"
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          disabled={isLoadingBranches || isImporting}
                          className="w-full rounded-xl border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
                        >
                          {branches.map((b) => (
                            <option key={b} value={b}>
                              {b} {b === selectedRepo.defaultBranch ? '(default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Editor Style */}
                    <div>
                      <label
                        htmlFor="github-editor-style-select"
                        className="block text-[11px] font-semibold text-content-secondary mb-1"
                      >
                        Editor Style
                      </label>
                      <select
                        id="github-editor-style-select"
                        value={selectedEditorStyle}
                        onChange={(e) => setSelectedEditorStyle(e.target.value as EditorStyle)}
                        disabled={isImporting}
                        className="w-full rounded-xl border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
                      >
                        <option value="vscode">Advanced IDE (WebContainer + Monaco)</option>
                        <option value="plain">Static Editor</option>
                      </select>
                    </div>
                  </div>

                  {/* Destination Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1.5">
                      Storage Destination
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                          importDestination === 'local'
                            ? 'border-accent bg-accent-subtle/20'
                            : 'border-stroke-subtle bg-surface-base hover:bg-surface-hover'
                        }`}
                      >
                        <input
                          type="radio"
                          name="destination"
                          value="local"
                          checked={importDestination === 'local'}
                          onChange={() => setImportDestination('local')}
                          className="mt-0.5 accent-accent"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-content-primary text-[11.5px]">
                            <HardDrive className="h-3.5 w-3.5 text-accent" />
                            <span>Local Project Only</span>
                          </div>
                          <div className="text-[10.5px] text-content-muted mt-0.5">
                            Stores files exclusively in this browser&apos;s IndexedDB profile.
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                          !authUser
                            ? 'opacity-50 cursor-not-allowed border-stroke-subtle bg-surface-base'
                            : importDestination === 'cloud'
                              ? 'border-accent bg-accent-subtle/20'
                              : 'border-stroke-subtle bg-surface-base hover:bg-surface-hover'
                        }`}
                      >
                        <input
                          type="radio"
                          name="destination"
                          value="cloud"
                          disabled={!authUser}
                          checked={importDestination === 'cloud'}
                          onChange={() => setImportDestination('cloud')}
                          className="mt-0.5 accent-accent"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-content-primary text-[11.5px]">
                            <Cloud className="h-3.5 w-3.5 text-accent" />
                            <span>Private Cloud Project</span>
                          </div>
                          <div className="text-[10.5px] text-content-muted mt-0.5">
                            {authUser
                              ? 'Backs up to private Supabase storage under your account.'
                              : 'Requires GitHub sign-in to enable cloud storage.'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-danger-subtle border border-danger/20 p-3 text-xs text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isImporting && (
                <div className="flex items-center gap-2.5 rounded-xl border border-accent/20 bg-accent-subtle/20 p-3 text-xs text-content-primary">
                  <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
                  <span>{importStatusText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {viewer && (
          <div className="flex items-center justify-between border-t border-stroke-subtle px-6 py-4 shrink-0 bg-surface-canvas">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !selectedRepo}
              data-testid="github-import-confirm-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-md"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FolderDown className="h-3.5 w-3.5" />
                  <span>Import Repository</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoBrowserModal;
