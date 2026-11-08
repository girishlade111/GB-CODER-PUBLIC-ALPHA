/**
 * GitHub Repository Creator Modal for GB Coder.
 *
 * Allows authenticated users to create a new remote repository on GitHub
 * directly from the IDE with explicit user confirmation and zero silent side-effects.
 *
 * Adheres strictly to the UX/UI design doctrine:
 * - Zero emoji anywhere.
 * - Intent-based token styling.
 * - Explicit permissions and confirmed actions.
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  Lock,
  Globe,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createRepository,
  fetchViewer,
  GitHubUser,
} from '../../services/githubSyncService';
import {
  readCredential,
  saveCredential,
  describeCredential,
} from '../../services/credentialStore';
import { ProjectRecord, readProjectFiles } from '../../services/projects/projectDatabase';
import toast from 'react-hot-toast';

const GITHUB_TOKEN_ID = 'github';
const TOKEN_CREATION_URL =
  'https://github.com/settings/tokens/new?scopes=repo&description=GB%20Coder%20IDE';

export interface GitHubCreateRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectRecord | null;
  onSuccess?: (repoFullName: string, repoUrl: string) => void;
}

export const GitHubCreateRepoModal: React.FC<GitHubCreateRepoModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  // Token state
  const [token, setToken] = useState('');
  const [revealToken, setRevealToken] = useState(false);
  const [rememberToken, setRememberToken] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [viewer, setViewer] = useState<GitHubUser | null>(null);

  // Form state
  const [repoName, setRepoName] = useState(project?.name?.replace(/[^a-zA-Z0-9_-]/g, '-') || '');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushCurrentProject, setPushCurrentProject] = useState(Boolean(project));
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Execution state
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    fullName: string;
    url: string;
    commitUrl?: string;
  } | null>(null);

  // Load token on mount
  useEffect(() => {
    if (!isOpen) return;

    const storedMeta = describeCredential(GITHUB_TOKEN_ID);
    setRememberToken(storedMeta?.sessionOnly === false);

    let cancelled = false;

    const checkToken = async () => {
      const stored = await readCredential(GITHUB_TOKEN_ID);
      if (stored && !cancelled) {
        setToken(stored);
        setIsVerifyingToken(true);
        try {
          const userRecord = await fetchViewer(stored);
          if (!cancelled) setViewer(userRecord);
        } catch {
          // Token expired or invalid
        } finally {
          if (!cancelled) setIsVerifyingToken(false);
        }
      }
    };

    void checkToken();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleConnectToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = token.trim();
    if (!clean) {
      setErrorMessage('Please enter a GitHub Personal Access Token.');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingToken(true);
    try {
      const userRecord = await fetchViewer(clean);
      await saveCredential(GITHUB_TOKEN_ID, clean, rememberToken);
      setViewer(userRecord);
      toast.success(`Connected as @${userRecord.login}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid GitHub token.';
      setErrorMessage(msg);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = repoName.trim();
    if (!cleanName) {
      setErrorMessage('Repository name cannot be empty.');
      return;
    }
    if (!viewer) {
      setErrorMessage('GitHub authentication required.');
      return;
    }
    if (!hasConfirmed) {
      setErrorMessage('Please confirm repository creation before proceeding.');
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      let initialFiles: { path: string; content: string }[] = [];

      if (pushCurrentProject && project) {
        const files = await readProjectFiles(project.id);
        initialFiles = files.map((f) => ({ path: f.path, content: f.content }));
      }

      const result = await createRepository({
        token: token.trim(),
        name: cleanName,
        description: description.trim() || undefined,
        private: isPrivate,
        autoInit: initialFiles.length === 0,
        files: initialFiles,
        commitMessage: 'Initial commit from GB Coder',
      });

      const repoUrl = `https://github.com/${result.repo.fullName}`;
      setCreatedResult({
        fullName: result.repo.fullName,
        url: repoUrl,
        commitUrl: result.commit?.commitUrl,
      });

      toast.success(`Created GitHub repository ${result.repo.fullName}`);
      onSuccess?.(result.repo.fullName, repoUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create repository on GitHub.';
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-repo-title"
      data-testid="github-create-repo-modal"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-stroke-subtle bg-surface-base shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Github className="h-5 w-5 text-accent" />
            <h2 id="create-repo-title" className="text-sm font-semibold text-content-primary">
              Create GitHub Repository
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {createdResult ? (
            <div className="rounded-xl border border-success/30 bg-success-subtle/20 p-5 text-center space-y-3 animate-fade-in">
              <div className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-success/10 text-success">
                <Check className="h-5 w-5" />
              </div>
              <div className="font-semibold text-sm text-content-primary">
                Repository Created Successfully
              </div>
              <p className="text-xs text-content-secondary">
                Your new remote repository is ready on GitHub at{' '}
                <span className="font-mono text-content-primary">{createdResult.fullName}</span>.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <a
                  href={createdResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors shadow-sm"
                >
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : !viewer ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-stroke-subtle bg-surface-canvas p-3.5 text-xs text-content-secondary space-y-1.5">
                <div className="font-semibold text-content-primary flex items-center gap-1.5">
                  <Github className="h-4 w-4 text-accent" />
                  <span>Personal Access Token Required</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Creating repositories requires a token with the{' '}
                  <code className="font-mono text-accent">repo</code> scope.
                </p>
                <a
                  href={TOKEN_CREATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline pt-0.5"
                >
                  Generate Token on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <form onSubmit={handleConnectToken} className="space-y-3">
                <div>
                  <label
                    htmlFor="create-repo-token-input"
                    className="block text-xs font-semibold text-content-secondary mb-1"
                  >
                    Token
                  </label>
                  <div className="relative">
                    <input
                      id="create-repo-token-input"
                      type={revealToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_... or github_pat_..."
                      className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas pl-3.5 pr-10 py-2 text-xs text-content-primary outline-none focus:border-accent font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealToken(!revealToken)}
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
                  <span>Remember on this device</span>
                </label>

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-danger-subtle border border-danger/20 p-2.5 text-xs text-danger">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingToken || !token.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isVerifyingToken ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Authorize GitHub Access</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Account Identity */}
              <div className="flex items-center justify-between rounded-xl border border-stroke-subtle bg-surface-canvas px-3.5 py-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={viewer.avatarUrl}
                    alt={viewer.login}
                    className="h-6 w-6 rounded-full border border-stroke"
                  />
                  <span className="text-xs font-mono font-medium text-content-primary">
                    @{viewer.login}
                  </span>
                </div>
                <span className="text-[10px] text-content-muted">Owner account</span>
              </div>

              {/* Repository Name */}
              <div>
                <label
                  htmlFor="new-repo-name"
                  className="block text-xs font-semibold text-content-secondary mb-1"
                >
                  Repository Name
                </label>
                <div className="flex items-center rounded-xl border border-stroke-subtle bg-surface-canvas px-3 py-1.5 focus-within:border-accent">
                  <span className="text-xs font-mono text-content-muted">{viewer.login} / </span>
                  <input
                    id="new-repo-name"
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    data-testid="create-repo-name-input"
                    className="flex-1 bg-transparent text-xs text-content-primary font-mono outline-none pl-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="new-repo-desc"
                  className="block text-xs font-semibold text-content-secondary mb-1"
                >
                  Description (Optional)
                </label>
                <input
                  id="new-repo-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Built with GB Coder"
                  className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas px-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
                />
              </div>

              {/* Visibility Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`flex items-start gap-2 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                    !isPrivate
                      ? 'border-accent bg-accent-subtle/20'
                      : 'border-stroke-subtle bg-surface-canvas hover:bg-surface-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="repo-visibility"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="mt-0.5 accent-accent"
                  />
                  <div>
                    <div className="flex items-center gap-1 font-semibold text-content-primary">
                      <Globe className="h-3 w-3 text-accent" />
                      <span>Public</span>
                    </div>
                    <div className="text-[10.5px] text-content-muted mt-0.5 leading-tight">
                      Anyone on the internet can view this repository.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                    isPrivate
                      ? 'border-accent bg-accent-subtle/20'
                      : 'border-stroke-subtle bg-surface-canvas hover:bg-surface-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="repo-visibility"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="mt-0.5 accent-accent"
                  />
                  <div>
                    <div className="flex items-center gap-1 font-semibold text-content-primary">
                      <Lock className="h-3 w-3 text-accent" />
                      <span>Private</span>
                    </div>
                    <div className="text-[10.5px] text-content-muted mt-0.5 leading-tight">
                      You choose who can see and commit to this repository.
                    </div>
                  </div>
                </label>
              </div>

              {/* Initial Content */}
              {project && (
                <label className="flex items-center gap-2 text-xs text-content-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushCurrentProject}
                    onChange={(e) => setPushCurrentProject(e.target.checked)}
                    className="rounded border-stroke-subtle accent-accent"
                  />
                  <span>
                    Initialize repository with current workspace files (
                    <strong>{project.name}</strong>)
                  </span>
                </label>
              )}

              {/* Explicit Confirmation */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConfirmed}
                    onChange={(e) => setHasConfirmed(e.target.checked)}
                    className="mt-0.5 accent-accent"
                    data-testid="create-repo-confirm-checkbox"
                  />
                  <span className="text-[11.5px] text-content-primary leading-relaxed">
                    I confirm that I want to create this{' '}
                    <strong>{isPrivate ? 'private' : 'public'}</strong> repository on GitHub under{' '}
                    <strong>@{viewer.login}</strong>.
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-danger-subtle border border-danger/20 p-2.5 text-xs text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCreating}
                  className="rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !repoName.trim() || !hasConfirmed}
                  data-testid="create-repo-submit-btn"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-md"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Repository...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Repository</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubCreateRepoModal;
