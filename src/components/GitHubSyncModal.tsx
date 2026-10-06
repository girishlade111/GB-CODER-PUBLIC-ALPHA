import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FolderGit2,
  Github,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  buildPushableFiles,
  commitFiles,
  createRepository,
  fetchViewer,
  listBranches,
  listRepos,
  parseRepoInput,
  pullFiles,
  readRateLimitStatus,
  GitHubSyncError,
  type GitHubCommitResult,
  type GitHubRepo,
  type GitHubSyncResult,
  type GitHubUser,
  type PullResult,
} from '../services/githubSyncService';
import { describeCredential, forgetCredential, isEncryptionAvailable, readCredential, saveCredential } from '../services/credentialStore';
import { byteLength, formatBytes } from '../services/projectArchiveService';
import type { MultiFileProject } from '../types/files';
import type { ExternalLibrary } from '../services/externalLibraryService';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MultiFileProject;
  projectName?: string;
  externalLibraries?: ExternalLibrary[];
  resolvedVersions?: Record<string, string>;
  includeInjections?: boolean;
  /**
   * Hands pulled files to the app's existing import pipeline as `File` objects.
   *
   * Reusing it means a pull lands in the same review-and-apply flow as a ZIP drop
   * or a URL import, rather than a second, worse version of it.
   */
  onImportFiles: (files: File[]) => Promise<void>;
}

type TabId = 'push' | 'create' | 'pull';

const TOKEN_ID = 'github';
const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=GB%20Coder';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'push', label: 'Push', icon: <ArrowUpFromLine className="h-4 w-4" /> },
  { id: 'create', label: 'New repo', icon: <Plus className="h-4 w-4" /> },
  { id: 'pull', label: 'Pull', icon: <ArrowDownToLine className="h-4 w-4" /> },
];

const fieldClass =
  'w-full rounded-md border border-stroke-subtle bg-surface-canvas px-3 py-2 text-sm text-content-primary placeholder:text-content-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

const segmentBase =
  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

/**
 * Loads a repo's branches and picks the one a sync should land on.
 *
 * Factored out because the push and pull tabs need the same
 * resolve-then-select behaviour, and the two setter pairs are the only thing that
 * differs.
 */
const branchLoader = (
  setList: React.Dispatch<React.SetStateAction<string[]>>,
  setBranch: React.Dispatch<React.SetStateAction<string>>,
) => (value: string, options: string[]) => {
  setList(options);
  setBranch(value);
};

const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  project,
  projectName = 'gb-coder-project',
  externalLibraries = [],
  resolvedVersions = {},
  includeInjections = true,
  onImportFiles,
}) => {
  const [tab, setTab] = useState<TabId>('push');
  const [token, setToken] = useState('');
  const [revealToken, setRevealToken] = useState(false);
  const [remember, setRemember] = useState(false);

  const [viewer, setViewer] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | null>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Push
  const [repoFullName, setRepoFullName] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update from GB Coder');
  const [deleteMissing, setDeleteMissing] = useState(false);
  const [pushResult, setPushResult] = useState<GitHubCommitResult | null>(null);

  // New repository
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [autoInit, setAutoInit] = useState(true);
  const [createResult, setCreateResult] = useState<GitHubSyncResult | null>(null);

  // Pull
  const [pullTarget, setPullTarget] = useState('');
  const [pullBranches, setPullBranches] = useState<string[]>([]);
  const [pullBranch, setPullBranch] = useState('');
  const [pullResult, setPullResult] = useState<PullResult | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const bundle = useMemo(
    () => buildPushableFiles(project, { projectName, externalLibraries, resolvedVersions, includeInjections }),
    [project, projectName, externalLibraries, resolvedVersions, includeInjections],
  );
  const bundleBytes = useMemo(
    () => bundle.reduce((total, file) => total + byteLength(file.content), 0),
    [bundle],
  );

  const storedToken = describeCredential(TOKEN_ID);

  const handleClose = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    onClose();
  }, [onClose]);

  // ─── Token lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setStatus(null);
    setPushResult(null);
    setCreateResult(null);
    setPullResult(null);
    setTab('push');
    setRemember(storedToken !== null);

    const controller = new AbortController();
    controllerRef.current = controller;

    /*
     * A token in storage is not proof the account is still reachable — it may
     * have been revoked, or belong to a different account than the one showing.
     * Verifying it on open means the account header is always current, and a dead
     * token surfaces here rather than on the user's first push.
     */
    void readCredential(TOKEN_ID).then(async (stored) => {
      if (!stored || controller.signal.aborted) return;
      setToken(stored);
      setRevealToken(false);
      try {
        const [user, available] = await Promise.all([fetchViewer(stored), listRepos(stored, controller.signal)]);
        if (controller.signal.aborted) return;
        setViewer(user);
        setRepos(available);
        setRateLimit(await readRateLimitStatus(stored));
      } catch (caught) {
        if (isAbort(caught) || controller.signal.aborted) return;
        setViewer(null);
        setError(caught instanceof Error ? caught.message : 'Could not verify that token.');
      }
    });

    return () => controller.abort();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  const handleConnect = useCallback(async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Paste a personal access token to continue.');
      return;
    }

    setBusy('connect');
    setError(null);
    setStatus({ message: 'Connecting to GitHub…', percent: 30 });

    try {
      const [user, available] = await Promise.all([fetchViewer(trimmed), listRepos(trimmed)]);
      await saveCredential(TOKEN_ID, trimmed, remember);
      setViewer(user);
      setRepos(available);
      setRateLimit(await readRateLimitStatus(trimmed));
      setStatus(null);
      toast.success(`Connected as ${user.login}.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not connect to GitHub.';
      setError(message);
      setStatus(null);
      toast.error(message, { duration: 6000 });
    } finally {
      setBusy(null);
    }
  }, [token, remember]);

  const handleDisconnect = useCallback(() => {
    forgetCredential(TOKEN_ID);
    setToken('');
    setViewer(null);
    setRepos([]);
    setRateLimit(null);
    setBranch('');
    setBranches([]);
    toast.success('Token forgotten.');
  }, []);

  /**
   * Reports a failure in one place so every action shows the same thing.
   *
   * The three interesting cases are given room to breathe rather than collapsed
   * into "failed": a rate limit that resets, a conflict that needs a pull, and an
   * auth problem that needs a new token all carry different instructions, and
   * each runs long enough that a 3-second toast would cut it off.
   */
  const reportFailure = useCallback((caught: unknown) => {
    if (isAbort(caught)) {
      toast('Cancelled.');
      return;
    }

    if (!(caught instanceof GitHubSyncError)) {
      toast.error(caught instanceof Error ? caught.message : 'Something went wrong.', { duration: 6000 });
      return;
    }

    // Rate limits and conflicts both need reading all the way through.
    const needsReading = caught.kind === 'rate-limit' || caught.kind === 'conflict';
    toast.error(caught.message, { duration: needsReading ? 10_000 : 6000 });
  }, []);

  // ─── Branch loading ─────────────────────────────────────────────────────────

  const loadBranchesFor = useCallback(
    async (fullName: string, apply: (value: string, options: string[]) => void, signal?: AbortSignal) => {
      const parsed = parseRepoInput(fullName);
      if (!parsed) {
        apply('', []);
        return;
      }
      try {
        const names = await listBranches(token.trim(), parsed, signal);
        if (signal?.aborted) return;
        // The default branch is what most pushes want, so it leads the list.
        const selected = repos.find((repo) => repo.fullName.toLowerCase() === fullName.toLowerCase());
        const preferred = selected && names.includes(selected.defaultBranch) ? selected.defaultBranch : names[0] ?? '';
        apply(preferred, names);
      } catch (caught) {
        if (isAbort(caught)) return;
        // A repo we cannot list branches for is usually one we cannot see; the
        // error surfaces when the action runs, with better wording for it.
        apply('', []);
      }
    },
    [token, repos],
  );

  const handleRepoChange = useCallback(
    (fullName: string) => {
      setRepoFullName(fullName);
      setPushResult(null);
      void loadBranchesFor(fullName, branchLoader(setBranches, setBranch));
    },
    [loadBranchesFor],
  );

  const handlePullTargetChange = useCallback(
    (value: string) => {
      setPullTarget(value);
      setPullResult(null);
      void loadBranchesFor(value, branchLoader(setPullBranches, setPullBranch));
    },
    [loadBranchesFor],
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handlePush = useCallback(async () => {
    const parsed = parseRepoInput(repoFullName);
    if (!parsed) {
      setError('Choose a repository to push to.');
      return;
    }
    if (!branch) {
      setError('Choose a branch to push to.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy('push');
    setError(null);
    setStatus({ message: 'Preparing…', percent: 5 });

    try {
      const commit = await commitFiles({
        token: token.trim(),
        ref: parsed,
        branch,
        message: commitMessage.trim() || 'Update from GB Coder',
        files: bundle,
        deleteMissing,
        signal: controller.signal,
        onProgress: (message, percent) => setStatus({ message, percent }),
      });

      setPushResult(commit);
      setStatus(null);
      toast.success(
        commit.alreadyUpToDate
          ? 'Already up to date — nothing to push.'
          : `Pushed ${commit.filesChanged} ${commit.filesChanged === 1 ? 'file' : 'files'} to ${branch}.`,
      );
    } catch (caught) {
      setStatus(null);
      reportFailure(caught);
    } finally {
      setBusy(null);
      controllerRef.current = null;
    }
  }, [repoFullName, branch, commitMessage, bundle, deleteMissing, token, reportFailure]);

  const handleCreate = useCallback(async () => {
    const name = newName.trim();
    if (!name) {
      setError('Give the repository a name.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy('create');
    setError(null);
    setStatus({ message: 'Creating the repository…', percent: 5 });

    try {
      const created = await createRepository({
        token: token.trim(),
        name,
        description: newDescription,
        private: isPrivate,
        // A repository with no commits has no branch to push onto, so this stays
        // on unless the user has a reason to turn it off.
        autoInit,
        files: bundle,
        commitMessage: commitMessage.trim() || 'Initial commit from GB Coder',
        signal: controller.signal,
        onProgress: (message, percent) => setStatus({ message, percent }),
      });

      setCreateResult(created);
      setStatus(null);
      // Selecting the new repo means a follow-up push needs no re-picking.
      setRepoFullName(created.repo.fullName);
      setBranch(created.repo.defaultBranch);
      toast.success(`Created ${created.repo.fullName}.`);
    } catch (caught) {
      setStatus(null);
      reportFailure(caught);
    } finally {
      setBusy(null);
      controllerRef.current = null;
    }
  }, [newName, newDescription, isPrivate, autoInit, commitMessage, bundle, token, reportFailure]);

  const handlePull = useCallback(async () => {
    const parsed = parseRepoInput(pullTarget);
    if (!parsed) {
      setError('Enter a repository as a URL or as owner/name.');
      return;
    }
    if (!pullBranch) {
      setError('Choose a branch to pull from.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy('pull');
    setError(null);
    setStatus({ message: 'Preparing…', percent: 5 });

    try {
      const pulled = await pullFiles({
        token: token.trim(),
        ref: parsed,
        branch: pullBranch,
        signal: controller.signal,
        onProgress: (message, percent) => setStatus({ message, percent }),
      });

      setPullResult(pulled);
      setStatus(null);

      if (pulled.files.length === 0) {
        toast.error('That branch has no files that can be imported.');
        return;
      }

      /*
       * Routed through the normal import pipeline rather than written straight into
       * project state, so a pull gets the same detection, review and undo
       * treatment as any other import.
       */
      await onImportFiles(
        pulled.files.map((file) => new File([file.content], file.path, { type: 'text/plain' })),
      );

      toast.success(`Pulled ${pulled.files.length} ${pulled.files.length === 1 ? 'file' : 'files'}.`);
      handleClose();
    } catch (caught) {
      setStatus(null);
      reportFailure(caught);
    } finally {
      setBusy(null);
      controllerRef.current = null;
    }
  }, [pullTarget, pullBranch, token, onImportFiles, reportFailure, handleClose]);

  if (!isOpen) return null;

  // ─── Connect ────────────────────────────────────────────────────────────────

  const renderConnect = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="github-token" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          Personal access token
        </label>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
          <input
            id="github-token"
            type={revealToken ? 'text' : 'password'}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !busy) void handleConnect();
            }}
            placeholder="ghp_… or github_pat_…"
            spellCheck={false}
            autoComplete="off"
            className={`${fieldClass} pl-9 pr-16 font-mono text-xs`}
          />
          <button
            type="button"
            onClick={() => setRevealToken((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
            aria-label={revealToken ? 'Hide token' : 'Show token'}
            title={revealToken ? 'Hide token' : 'Show token'}
          >
            {revealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <a
          href={TOKEN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-hover underline underline-offset-2 hover:opacity-80"
        >
          Create a token with the `repo` scope
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="mt-1 text-[11px] leading-relaxed text-content-muted">
          Classic tokens need <code className="font-mono">repo</code> selected. Fine-grained tokens need
          read/write on Contents. A token with no expiry is the least risky choice here.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="mt-0.5 accent-accent"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-content-primary">Remember on this device</span>
          <span className="mt-0.5 block text-xs text-content-muted">
            {isEncryptionAvailable()
              ? 'Stored encrypted so you are not asked again. Anything running on this page can still read it — a fine-grained token limited to one repo is safer.'
              : 'This page is not a secure context, so the token would be stored in plain text. It is safer to leave this off.'}
          </span>
        </span>
      </label>

      <div className="rounded-md border border-stroke-subtle bg-surface-overlay px-3 py-2.5">
        <p className="text-xs text-content-secondary">
          Publishing <span className="font-mono text-content-primary">{bundle.length}</span> files ·{' '}
          <span className="font-mono text-content-primary">{formatBytes(bundleBytes)}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger-subtle p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-xs leading-relaxed text-content-secondary">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-stroke-subtle pt-4">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md border border-stroke bg-surface-canvas px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleConnect()}
          disabled={busy === 'connect' || token.trim().length === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === 'connect' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
          Connect
        </button>
      </div>
    </div>
  );

  // ─── Shared progress / error block ───────────────────────────────────────────

  const renderActivity = () => (
    <>
      {status && (
        <div className="space-y-2 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-content-primary">{status.message}</p>
            <span className="font-mono text-[11px] text-content-muted">{status.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${status.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger-subtle p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-xs leading-relaxed text-content-secondary">{error}</p>
        </div>
      )}
    </>
  );

  // ─── Push ───────────────────────────────────────────────────────────────────

  const renderPush = () => {
    const writable = repos.filter((repo) => repo.canPush);
    const selected = repos.find((repo) => repo.fullName === repoFullName);

    return (
      <div className="space-y-4">
        {repos.length === 0 ? (
          <p className="rounded-md border border-stroke-subtle bg-surface-overlay p-3 text-xs leading-relaxed text-content-muted">
            No repositories available to this token. Create one with the <strong className="font-medium text-content-secondary">New repo</strong> tab.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="push-repo" className="text-xs font-medium uppercase tracking-wide text-content-muted">
                Repository
              </label>
              <select
                id="push-repo"
                value={repoFullName}
                onChange={(event) => handleRepoChange(event.target.value)}
                disabled={busy === 'push'}
                className={`mt-2 ${fieldClass}`}
              >
                <option value="">Select a repository…</option>
                {repos.map((repo) => (
                  <option key={repo.fullName} value={repo.fullName}>
                    {repo.fullName}
                    {repo.private ? ' (private)' : ''}
                    {repo.canPush ? '' : ' — read only'}
                  </option>
                ))}
              </select>
              {selected && !selected.canPush && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-warning">
                  <AlertCircle className="mt-px h-3 w-3 shrink-0" />
                  Your token has read access but not write, so pushing here will be rejected by GitHub.
                </p>
              )}
              {selected && selected.description && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-content-muted">{selected.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="push-branch" className="text-xs font-medium uppercase tracking-wide text-content-muted">
                Branch
              </label>
              <select
                id="push-branch"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                disabled={busy === 'push' || branches.length === 0}
                className={`mt-2 ${fieldClass}`}
              >
                {branches.length === 0 ? (
                  <option value="">No branches loaded</option>
                ) : (
                  branches.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </>
        )}

        <div>
          <label htmlFor="push-message" className="text-xs font-medium uppercase tracking-wide text-content-muted">
            Commit message
          </label>
          <input
            id="push-message"
            type="text"
            value={commitMessage}
            onChange={(event) => setCommitMessage(event.target.value)}
            disabled={busy === 'push'}
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        {/* The only destructive option in the dialog, so it is opt-in and explained. */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
          <input
            type="checkbox"
            checked={deleteMissing}
            onChange={(event) => setDeleteMissing(event.target.checked)}
            disabled={busy === 'push'}
            className="mt-0.5 accent-accent"
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm text-content-primary">
              <Trash2 className="h-3.5 w-3.5 text-danger" />
              Also delete repository files that are not in this project
            </span>
            <span className="mt-0.5 block text-xs text-content-muted">
              Off by default. Turning it on removes anything in the repository that the editor does not
              hold — including files you simply have not opened here.
            </span>
          </span>
        </label>

        {pushResult && (
          <div className="animate-scale-in rounded-md border border-success/30 bg-success-subtle p-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-content-primary">
                  {pushResult.alreadyUpToDate
                    ? 'Already up to date'
                    : `Pushed ${pushResult.filesChanged} ${pushResult.filesChanged === 1 ? 'file' : 'files'}`}
                </p>
                <a
                  href={pushResult.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-accent-hover underline underline-offset-2 hover:opacity-80"
                >
                  {pushResult.commitSha.slice(0, 7)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {renderActivity()}

        <button
          type="button"
          onClick={() => void handlePush()}
          disabled={busy === 'push' || !repoFullName || !branch || selected?.canPush === false}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === 'push' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
          Push {bundle.length} files to {branch || 'a branch'}
        </button>

        {writable.length === 0 && repos.length > 0 && (
          <p className="text-[11px] leading-relaxed text-content-muted">
            None of these repositories are writable with this token.
          </p>
        )}
      </div>
    );
  };

  // ─── Create ─────────────────────────────────────────────────────────────────

  const renderCreate = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="new-repo-name" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          Repository name
        </label>
        <input
          id="new-repo-name"
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="my-project"
          spellCheck={false}
          autoComplete="off"
          disabled={busy === 'create'}
          className={`mt-2 ${fieldClass} font-mono`}
        />
        {viewer && newName.trim() && (
          <p className="mt-1.5 font-mono text-[11px] text-content-muted">
            {viewer.login}/{newName.trim().replace(/\s+/g, '-').toLowerCase()}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="new-repo-description" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          Description <span className="normal-case text-content-faint">optional</span>
        </label>
        <input
          id="new-repo-description"
          type="text"
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
          disabled={busy === 'create'}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Visibility</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: false, label: 'Public', note: 'Anyone can read it' },
            { value: true, label: 'Private', note: 'Only you and collaborators' },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => setIsPrivate(option.value)}
              disabled={busy === 'create'}
              aria-pressed={isPrivate === option.value}
              className={`rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isPrivate === option.value
                  ? 'border-accent bg-accent-subtle'
                  : 'border-stroke-subtle bg-surface-overlay hover:border-stroke-strong'
              }`}
            >
              <span className="block text-sm font-medium text-content-primary">{option.label}</span>
              <span className="mt-0.5 block text-[11px] text-content-muted">{option.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="new-repo-message" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          First commit message
        </label>
        <input
          id="new-repo-message"
          type="text"
          value={commitMessage}
          onChange={(event) => setCommitMessage(event.target.value)}
          disabled={busy === 'create'}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
        <input
          type="checkbox"
          checked={autoInit}
          onChange={(event) => setAutoInit(event.target.checked)}
          disabled={busy === 'create'}
          className="mt-0.5 accent-accent"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-content-primary">Initialise with a README</span>
          <span className="mt-0.5 block text-xs text-content-muted">
            Recommended. A repository with no commits has no branch, so there is nothing for the
            project&apos;s first commit to attach to.
          </span>
        </span>
      </label>

      {createResult && (
        <div className="animate-scale-in rounded-md border border-success/30 bg-success-subtle p-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content-primary">Repository created</p>
              <a
                href={`https://github.com/${createResult.repo.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 flex items-center gap-1 break-all font-mono text-[11px] text-accent-hover underline underline-offset-2 hover:opacity-80"
              >
                {createResult.repo.fullName}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <p className="mt-1 text-[11px] text-content-muted">
                {createResult.commit.alreadyUpToDate
                  ? 'The project files are already committed.'
                  : `${createResult.commit.filesChanged} files committed to ${createResult.commit.branch}.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {renderActivity()}

      <button
        type="button"
        onClick={() => void handleCreate()}
        disabled={busy === 'create' || newName.trim().length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderGit2 className="h-4 w-4" />}
        Create and commit {bundle.length} files
      </button>
    </div>
  );

  // ─── Pull ───────────────────────────────────────────────────────────────────

  const renderPull = () => {
    const parsed = parseRepoInput(pullTarget);

    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="pull-target" className="text-xs font-medium uppercase tracking-wide text-content-muted">
            Repository
          </label>
          <input
            id="pull-target"
            type="text"
            value={pullTarget}
            onChange={(event) => handlePullTargetChange(event.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            spellCheck={false}
            autoComplete="off"
            disabled={busy === 'pull'}
            className={`mt-2 ${fieldClass} font-mono`}
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-content-muted">
            Accepts a URL, an <code className="font-mono">owner/repo</code> pair, or an SSH address.
            Files arrive in the normal import review, so nothing is replaced until you confirm it.
          </p>
        </div>

        <div>
          <label htmlFor="pull-branch" className="text-xs font-medium uppercase tracking-wide text-content-muted">
            Branch
          </label>
          <select
            id="pull-branch"
            value={pullBranch}
            onChange={(event) => setPullBranch(event.target.value)}
            disabled={busy === 'pull' || pullBranches.length === 0}
            className={`mt-2 ${fieldClass}`}
          >
            {pullBranches.length === 0 ? (
              <option value="">{parsed ? 'No branches loaded' : 'Enter a repository first'}</option>
            ) : (
              pullBranches.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>

        {repos.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Your repositories</p>
            <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">
              {repos.map((repo) => (
                <button
                  key={repo.fullName}
                  type="button"
                  onClick={() => handlePullTargetChange(repo.fullName)}
                  disabled={busy === 'pull'}
                  className="flex w-full items-center gap-2 rounded-md border border-stroke-subtle bg-surface-overlay px-3 py-2 text-left text-xs transition-colors hover:border-stroke-strong hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FolderGit2 className="h-3.5 w-3.5 shrink-0 text-content-muted" />
                  <span className="min-w-0 flex-1 truncate font-mono text-content-primary">{repo.fullName}</span>
                  <span className="shrink-0 font-mono text-[10px] text-content-faint">{repo.defaultBranch}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {pullResult?.truncated && (
          <div className="rounded-md border border-warning/30 bg-warning-subtle p-3 text-[11px] leading-relaxed text-content-secondary">
            Pulled the first {pullResult.files.length} files. {pullResult.skipped.length} more were left out
            because they are large or there are too many for one import — open them from GitHub directly if
            you need them.
          </div>
        )}

        {renderActivity()}

        <button
          type="button"
          onClick={() => void handlePull()}
          disabled={busy === 'pull' || !pullTarget.trim() || !pullBranch}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === 'pull' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
          Pull into this project
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-raised shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-stroke-subtle p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-md bg-accent-subtle p-2 text-accent-hover">
              <Github className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-lg font-medium text-content-primary">GitHub</h2>
              {viewer ? (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-content-muted">
                  <span className="font-mono">{viewer.login}</span>
                  {rateLimit && (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {rateLimit.remaining}/{rateLimit.limit} API calls left
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1 text-content-secondary underline underline-offset-2 hover:opacity-80"
                  >
                    <Lock className="h-3 w-3" />
                    Forget token
                  </button>
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-content-muted">
                  Push your project, create a repository, or import files back
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-2 text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            aria-label="Close GitHub dialog"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!viewer ? (
            renderConnect()
          ) : (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 rounded-lg bg-surface-overlay p-1">
                {TABS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setTab(entry.id)}
                    aria-pressed={tab === entry.id}
                    className={`${segmentBase} inline-flex items-center justify-center gap-1.5 ${
                      tab === entry.id
                        ? 'bg-surface-raised text-content-primary shadow-elevated'
                        : 'text-content-muted hover:text-content-primary'
                    }`}
                  >
                    {entry.icon}
                    {entry.label}
                  </button>
                ))}
              </div>

              {tab === 'push' && renderPush()}
              {tab === 'create' && renderCreate()}
              {tab === 'pull' && renderPull()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Loads a repo's branches and picks the one a sync should land on.
 *
 * Factored out because the push and pull tabs both need the same
 * resolve-then-select behaviour, and the setters are the only thing that differs.
 */
export default GitHubSyncModal;