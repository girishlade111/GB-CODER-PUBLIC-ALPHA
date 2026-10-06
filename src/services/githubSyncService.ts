/**
 * GitHub two-way sync for the editor: push to an existing repository, create a
 * new one from the current project, and pull files back in.
 *
 * ## Why the Git Data API rather than the Contents API
 *
 * The obvious implementation is `PUT /repos/{owner}/{repo}/contents/{path}` per
 * file. That works, and it is the wrong shape here for two reasons:
 *
 *  - It commits per file, so a 12-file project produces 12 commits and 12 chances
 *    to fail partway through — leaving the repository in a state neither the user
 *    nor we asked for.
 *  - Committing a path you no longer hold in the editor does not delete it, so a
 *    two-way sync can never actually converge.
 *
 * The Git Data API (`git/blobs` → `git/trees` → `git/commits` → `git/refs`)
 * stages the whole change as one atomic commit built on a base tree, which is the
 * same primitive `git commit -a` uses. One commit per push, deletions included.
 *
 * ## Skipping unchanged files
 *
 * A commit that rewrites every file every time is noisy and, on a large project,
 * wasteful of the API's rate limit. Git identifies content by the SHA-1 of
 * `blob <length>\0<content>`, and that hash is computable locally with WebCrypto
 * — no request needed. Comparing against the target tree means an unchanged file
 * costs zero API calls and, when nothing changed at all, the push reports
 * "already up to date" instead of manufacturing an empty commit.
 *
 * ## Conflicts
 *
 * The ref update is sent with `force: false`, so a branch that moved while the
 * user was typing produces a 422 instead of silently discarding their colleague's
 * work. That surfaces as a `conflict` error the UI can explain.
 *
 * ## Credentials
 *
 * Tokens come from the caller and are persisted by `credentialStore`. All calls
 * go straight to `api.github.com`, which sends CORS headers for browser use, so
 * no server ever holds a user's token.
 */

import type { MultiFileProject } from '../types/files';
import { buildArchiveFiles, type ArchiveOptions } from './projectArchiveService';

const API_BASE = 'https://api.github.com';

/**
 * Pulls are one API call per file, against a 5,000/hour limit. These caps keep a
 * pathological repository from eating the budget and failing mid-import — GitHub
 * returns the skipped ones so the UI can be honest about what arrived.
 */
const MAX_PULL_FILES = 200;
const MAX_PULL_FILE_BYTES = 512 * 1024;

/**
 * Per-request deadline.
 *
 * GitHub is reliable, but a request that never resolves would leave the modal
 * spinning with a progress bar and no way out. Combined with the caller's cancel
 * signal, so the user can still abandon one deliberately.
 */
const REQUEST_TIMEOUT_MS = 60_000;

/** Directories never worth importing into an editor tab. */
const IGNORED_PULL_PREFIXES = ['node_modules/', 'dist/', 'build/', '.git/', '.next/', 'coverage/'];

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  /** `owner/name`, which is what the UI shows and what URLs are built from. */
  fullName: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  updatedAt: string;
  /**
   * Whether the token can push here.
   *
   * `/user/repos` includes repositories the user can only read — an org repo they
   * follow, a fork they cannot write to. Pushing to one fails deep inside the
   * commit sequence with a 403, so the UI marks them instead.
   */
  canPush: boolean;
}

export interface GitHubCommitResult {
  branch: string;
  /** The new commit, or the existing head when nothing changed. */
  commitSha: string;
  /** Permalink to the commit on github.com. */
  commitUrl: string;
  /** How many files the commit actually wrote. */
  filesChanged: number;
  /** True when every file already matched and no commit was created. */
  alreadyUpToDate: boolean;
}

export interface GitHubSyncResult {
  repo: GitHubRepo;
  commit: GitHubCommitResult;
}

/**
 * What went wrong, in a form the UI can react to.
 *
 * `kind` exists because the four interesting failures need four different
 * messages: a dead token needs re-entering it, a rate limit needs a wait, a
 * conflict needs a pull, and a 404 needs the repository checked. A single
 * "request failed" string would make all four look the same.
 */
export type GitHubErrorKind =
  | 'auth'
  | 'rate-limit'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'network'
  | 'unknown';

export class GitHubSyncError extends Error {
  readonly kind: GitHubErrorKind;
  readonly status: number;
  readonly retryable: boolean;
  /** Seconds until the rate limit resets, when GitHub told us. */
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    options: {
      kind: GitHubErrorKind;
      status?: number;
      retryable?: boolean;
      retryAfterSeconds?: number;
    },
  ) {
    super(message);
    this.name = 'GitHubSyncError';
    this.kind = options.kind;
    this.status = options.status ?? 0;
    this.retryable = options.retryable ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

// ─── Encoding helpers ─────────────────────────────────────────────────────────

/** UTF-8 text to base64, which is the encoding GitHub's Git Data API requires. */
const toBase64 = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const CHUNK = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK));
  }
  return btoa(binary);
};

const fromBase64 = (value: string): string => {
  const binary = atob(value.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
};

/**
 * The SHA-1 Git would give this file's blob.
 *
 * `blob <byte-length>\0` followed by the content — the header's length is in
 * bytes, not characters, which is why this encodes first.
 */
const gitBlobSha = async (content: string): Promise<string> => {
  const body = new TextEncoder().encode(content);
  const header = new TextEncoder().encode(`blob ${body.length}\0`);
  const full = new Uint8Array(header.length + body.length);
  full.set(header, 0);
  full.set(body, header.length);

  const digest = await crypto.subtle.digest('SHA-1', full as BufferSource);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

// ─── Request plumbing ─────────────────────────────────────────────────────────

interface RateLimitState {
  remaining?: number;
  /** Epoch seconds at which the window resets. */
  resetAt?: number;
}

/** Reads GitHub's rate-limit headers off a response, when present. */
const readRateLimit = (response: Response): RateLimitState => {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');
  return {
    remaining: remaining === null ? undefined : Number(remaining),
    resetAt: reset === null ? undefined : Number(reset),
  };
};

const AUTH_HELP =
  'Check the token has the `repo` scope, and that it has not expired or been revoked.';

/**
 * Classifies a failed response into something actionable.
 *
 * 401 is a bad token; 403 is either a scope problem or an exhausted rate limit,
 * distinguished by the headers GitHub sets; 404 is a repo or branch that is not
 * there (or is private and the token cannot see it).
 *
 * 422 is deliberately *not* treated as a merge conflict here. It is GitHub's
 * generic validation status: `POST /user/repos` returns it for a name that is
 * already taken, which is a name problem and not a concurrent-push problem. Only
 * `updateRef` knows its 422 means "not a fast forward", so only it converts one —
 * see `updateRef`.
 *
 * GitHub's own `message` is included where present, because it is specific
 * ("name already exists on this account", "No commit found for SHA") and far more
 * useful than the bare status.
 */
const toSyncError = async (response: Response, context: string): Promise<GitHubSyncError> => {
  const { remaining, resetAt } = readRateLimit(response);
  const retryAfterSeconds = resetAt ? Math.max(0, resetAt - Math.floor(Date.now() / 1000)) : undefined;
  const detail = await readErrorMessage(response);
  const suffix = detail ? ` (${detail})` : '';

  if (response.status === 401) {
    return new GitHubSyncError(`GitHub rejected that token. ${AUTH_HELP}${suffix}`, {
      kind: 'auth',
      status: 401,
      retryable: false,
    });
  }
  if (response.status === 403 && remaining === 0) {
    const wait = retryAfterSeconds ? ` Try again in about ${Math.ceil(retryAfterSeconds / 60)} minute(s).` : '';
    return new GitHubSyncError(`GitHub's API rate limit is exhausted.${wait}`, {
      kind: 'rate-limit',
      status: 403,
      retryable: true,
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    });
  }
  if (response.status === 403) {
    return new GitHubSyncError(`That token is not permitted to ${context}. ${AUTH_HELP}${suffix}`, {
      kind: 'auth',
      status: 403,
      retryable: false,
    });
  }
  if (response.status === 404) {
    return new GitHubSyncError(
      `Not found while trying to ${context}. Check the repository name, the branch, and that the token can see a private repository.${suffix}`,
      { kind: 'not-found', status: 404, retryable: false },
    );
  }
  if (response.status === 409) {
    return new GitHubSyncError(
      `The branch moved while you were editing, so GitHub refused the update. Pull the latest changes, then push again — nothing was overwritten.${suffix}`,
      { kind: 'conflict', status: 409, retryable: false },
    );
  }
  if (response.status >= 500) {
    return new GitHubSyncError('GitHub is having trouble right now. This is usually temporary — try again.', {
      kind: 'unknown',
      status: response.status,
      retryable: true,
    });
  }

  return new GitHubSyncError(`Could not ${context} (${response.status}).${suffix}`, {
    kind: 'validation',
    status: response.status,
    retryable: false,
  });
};

/**
 * Pulls GitHub's `message` out of an error body.
 *
 * GitHub answers with `{ message, documentation_url, errors? }` and the message is
 * the actionable part. The body can only be read once, so this is called before any
 * other use of the response.
 */
const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.clone().json()) as { message?: unknown };
    if (typeof body?.message !== 'string') return '';
    // Cap it: these can be long, and they end up in a toast.
    return body.message.slice(0, 200);
  } catch {
    return '';
  }
};

/**
 * One authenticated GitHub request.
 *
 * Wrapped rather than inlined so no call site can forget the auth header, the API
 * version pin, or the error classification.
 */
const githubRequest = async <T>(
  token: string,
  path: string,
  init: RequestInit = {},
  context = 'reach GitHub',
): Promise<T> => {
  if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const relayAbort = () => controller.abort();
  init.signal?.addEventListener('abort', relayAbort, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        // Pinned so a future default change cannot silently alter response shapes.
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    // The caller cancelled; that is not a network failure.
    if (init.signal?.aborted) throw error;
    throw new GitHubSyncError('Could not reach GitHub. Check your connection and try again.', {
      kind: 'network',
      retryable: true,
    });
  } finally {
    window.clearTimeout(timer);
    init.signal?.removeEventListener('abort', relayAbort);
  }

  if (!response.ok) throw await toSyncError(response, context);

  // 204 and 201-with-no-body responses have nothing to parse.
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
};

// ─── URL parsing ──────────────────────────────────────────────────────────────

export interface RepoRef {
  owner: string;
  repo: string;
}

/**
 * Accepts the shapes a user actually pastes.
 *
 * Full URLs, `owner/repo`, the SSH form, and URLs with a `/tree/main/...` suffix
 * all reduce to the same owner and repo, because being strict about format here
 * would only produce "invalid input" for something the user got right.
 */
export const parseRepoInput = (input: string): RepoRef | null => {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  // git@github.com:owner/repo.git
  const ssh = /^git@[^:]+:([^/]+)\/([^/]+?)(?:\.git)?$/.exec(trimmed);
  if (ssh) return { owner: ssh[1], repo: ssh[2] };

  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\//i, '').replace(/^www\./i, '');
  // Drop any /tree/branch/path, query string, or fragment.
  const path = withoutProtocol.replace(/[?#].*$/, '').split('/').filter(Boolean);
  // github.com/owner/repo — the host is only skipped when it looks like one, so a
  // bare `owner/repo` is still understood.
  if (path.length >= 3 && path[0].includes('.')) {
    return { owner: path[1], repo: path[2].replace(/\.git$/, '') };
  }
  if (path.length === 2) return { owner: path[0], repo: path[1].replace(/\.git$/, '') };

  return null;
};

// ─── Reads ────────────────────────────────────────────────────────────────────

interface RawUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  /** Needed after creation, where the response is the only source of the owner. */
  owner: { login: string };
  private: boolean;
  default_branch: string;
  description: string | null;
  updated_at: string;
  /** Sent by `/user/repos`; absent on some responses, hence the optional. */
  permissions?: { push?: boolean; admin?: boolean; maintain?: boolean };
}

/** Unwraps the list shape and fills in `canPush` from the permissions block. */
const toRepo = (repo: RawRepo): GitHubRepo => ({
  id: repo.id,
  name: repo.name,
  fullName: repo.full_name,
  private: repo.private,
  defaultBranch: repo.default_branch,
  description: repo.description,
  updatedAt: repo.updated_at,
  // `maintain` and `admin` both imply write access, so any of the three counts.
  canPush: Boolean(repo.permissions?.push || repo.permissions?.maintain || repo.permissions?.admin),
});

/** Verifies a token and returns the account it belongs to. */
export const fetchViewer = async (token: string): Promise<GitHubUser> => {
  const user = await githubRequest<RawUser>(token, '/user', {}, 'identify your account');
  return { login: user.login, name: user.name, avatarUrl: user.avatar_url };
};

/**
 * Repositories the token can write to, newest first.
 *
 * `affiliation` is what makes push work: it includes repos owned by others the
 * user has been granted write access to, which is where most real work lives.
 */
export const listRepos = async (token: string, signal?: AbortSignal): Promise<GitHubRepo[]> => {
  const raw = await githubRequest<RawRepo[]>(
    token,
    '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
    { signal },
    'list your repositories',
  );

  return raw.map(toRepo);
};

/** Branch names, default branch first. */
export const listBranches = async (
  token: string,
  ref: RepoRef,
  signal?: AbortSignal,
): Promise<string[]> => {
  const raw = await githubRequest<Array<{ name: string }>>(
    token,
    `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/branches?per_page=100`,
    { signal },
    'list branches',
  );
  return raw.map((branch) => branch.name);
};

/** The account's remaining hourly API calls, when GitHub reports them. */
export const readRateLimitStatus = async (
  token: string,
): Promise<{ limit: number; remaining: number; resetAt: number } | null> => {
  try {
    const response = await fetch(`${API_BASE}/rate_limit`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { resources?: { core?: { limit: number; remaining: number; reset: number } } };
    const core = body.resources?.core;
    return core ? { limit: core.limit, remaining: core.remaining, resetAt: core.reset } : null;
  } catch {
    return null;
  }
};

// ─── Writes ───────────────────────────────────────────────────────────────────

interface RawRef {
  object: { sha: string };
}
interface RawCommit {
  sha: string;
  tree: { sha: string };
  html_url: string;
}
interface RawTree {
  sha: string;
  tree: Array<{ path: string; type: string; sha: string; size?: number }>;
}
interface RawBlob {
  /** Returned by `POST /git/blobs`; absent when reading one back by path. */
  sha?: string;
  content: string;
  encoding: string;
}

const repoPath = (ref: RepoRef): string =>
  `/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`;

/** One entry in a git tree. `sha: null` removes the path. */
type TreeEntry = { path: string; mode: string; type: string; sha: string | null };

/** Resolves the branch head and the tree it points at. */
interface BranchHead {
  headSha: string;
  baseTreeSha: string;
}

const readBranchHead = async (
  token: string,
  base: string,
  branch: string,
  signal?: AbortSignal,
): Promise<BranchHead> => {
  const headRef = await githubRequest<RawRef>(
    token,
    `${base}/git/ref/heads/${encodeURIComponent(branch)}`,
    { signal },
    'find the branch',
  );
  const headCommit = await githubRequest<RawCommit>(
    token,
    `${base}/git/commits/${headRef.object.sha}`,
    { signal },
    'read the latest commit',
  );
  return { headSha: headRef.object.sha, baseTreeSha: headCommit.tree.sha };
};

/** Walks a tree into a path → blob-sha map, for diffing against. */
const readTreePaths = async (
  token: string,
  base: string,
  treeSha: string,
  signal?: AbortSignal,
): Promise<Map<string, string>> => {
  const tree = await githubRequest<RawTree>(
    token,
    `${base}/git/trees/${treeSha}?recursive=1`,
    { signal },
    'read the repository tree',
  );
  return new Map(tree.tree.filter((entry) => entry.type === 'blob').map((entry) => [entry.path, entry.sha]));
};

/** Uploads each changed file as a blob and returns the tree entries for them. */
const uploadBlobs = async (
  token: string,
  base: string,
  files: { path: string; content: string }[],
  signal: AbortSignal | undefined,
  report: (message: string, percent: number) => void,
  from: number,
  span: number,
): Promise<TreeEntry[]> => {
  const entries: TreeEntry[] = [];
  let done = 0;

  for (const file of files) {
    report(`Uploading ${file.path}…`, from + Math.round((done / Math.max(files.length, 1)) * span));
    done += 1;

    const blob = await githubRequest<RawBlob>(
      token,
      `${base}/git/blobs`,
      { method: 'POST', body: JSON.stringify({ content: toBase64(file.content), encoding: 'base64' }), signal },
      `upload ${file.path}`,
    );
    if (!blob.sha) {
      throw new GitHubSyncError(`GitHub accepted ${file.path} but returned no hash for it.`, {
        kind: 'unknown',
        retryable: true,
      });
    }
    entries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  return entries;
};

/**
 * Writes a tree.
 *
 * `baseTree` is omitted only when creating a repository's very first commit,
 * where there is nothing to build on.
 */
const createTree = async (
  token: string,
  base: string,
  entries: TreeEntry[],
  baseTree: string | null,
  signal?: AbortSignal,
): Promise<string> => {
  const tree = await githubRequest<RawTree>(
    token,
    `${base}/git/trees`,
    {
      method: 'POST',
      body: JSON.stringify(baseTree ? { base_tree: baseTree, tree: entries } : { tree: entries }),
      signal,
    },
    'build the commit tree',
  );
  return tree.sha;
};

const createCommit = async (
  token: string,
  base: string,
  message: string,
  treeSha: string,
  parents: string[],
  signal?: AbortSignal,
): Promise<RawCommit> =>
  githubRequest<RawCommit>(
    token,
    `${base}/git/commits`,
    { method: 'POST', body: JSON.stringify({ message, tree: treeSha, parents }), signal },
    'create the commit',
  );

/**
 * Moves a branch to a commit.
 *
 * `force: false` is the whole reason this is safe: if someone pushed between our
 * read of the head and this write, GitHub rejects it rather than overwriting their
 * commit.
 *
 * A 422 here means "update is not a fast forward", which is a conflict and not the
 * generic validation failure the status usually carries — so it is translated here,
 * the one place that knows the difference. Without this, a user whose branch moved
 * would be told to pull and try again with no explanation of what happened.
 */
const updateRef = async (
  token: string,
  base: string,
  branch: string,
  sha: string,
  signal?: AbortSignal,
): Promise<void> => {
  try {
    await githubRequest<RawRef>(
      token,
      `${base}/git/refs/heads/${encodeURIComponent(branch)}`,
      { method: 'PATCH', body: JSON.stringify({ sha, force: false }), signal },
      'update the branch',
    );
  } catch (error) {
    if (error instanceof GitHubSyncError && (error.kind === 'validation' || error.kind === 'conflict')) {
      throw new GitHubSyncError(
        'The branch moved while you were editing, so GitHub refused the update. Pull the latest changes, then push again — nothing of yours or anyone else’s was overwritten.',
        { kind: 'conflict', status: error.status, retryable: false },
      );
    }
    throw error;
  }
};

export interface CommitFilesOptions {
  token: string;
  ref: RepoRef;
  branch: string;
  message: string;
  /**
   * Files to write, as absolute paths within the repository.
   *
   * Built from the export bundle so a push and a deploy put the same tree on the
   * remote — including the `package.json` and `vite.config.js` a framework
   * project needs to build on a real host.
   */
  files: { path: string; content: string }[];
  /**
   * Remove repository files that are not in `files`.
   *
   * Off by default: it is the only way this operation can destroy work, and
   * silently deleting a `src/` file the user simply has not opened in this tab
   * would be indefensible. Surfaced in the UI as an explicit opt-in.
   */
  deleteMissing?: boolean;
  onProgress?: (message: string, percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Writes the whole file set as one commit.
 *
 * Resolves with `alreadyUpToDate: true` and the existing head when nothing
 * differs, so a repeat push is a no-op rather than an empty commit.
 */
export const commitFiles = async (options: CommitFilesOptions): Promise<GitHubCommitResult> => {
  const { token, ref, branch, message, files, deleteMissing = false, onProgress, signal } = options;
  const report = onProgress ?? (() => {});
  const base = repoPath(ref);
  const commitBase = `https://github.com/${ref.owner}/${ref.repo}/commit`;

  report('Finding the latest commit…', 10);
  const { headSha, baseTreeSha } = await readBranchHead(token, base, branch, signal);

  report('Reading the current tree…', 18);
  const remotePaths = await readTreePaths(token, base, baseTreeSha, signal);

  /*
   * Hash locally and compare against the remote tree, so an unchanged file costs
   * no API call. `Promise.all` rather than a loop because the digests are
   * independent; a 200-file push is a few milliseconds of SHA-1.
   */
  const entries = await Promise.all(
    files.map(async (file) => ({ file, sha: await gitBlobSha(file.content) })),
  );
  const writes = entries.filter((entry) => remotePaths.get(entry.file.path) !== entry.sha);

  // A Set, so the deletion scan stays linear: a repository can hold thousands of
  // paths and this runs once per push.
  const localPaths = new Set(files.map((file) => file.path));
  const deletions = deleteMissing
    ? [...remotePaths.keys()].filter((path) => !localPaths.has(path))
    : [];

  if (writes.length === 0 && deletions.length === 0) {
    report('Already up to date.', 100);
    return {
      branch,
      commitSha: headSha,
      commitUrl: `${commitBase}/${headSha}`,
      filesChanged: 0,
      alreadyUpToDate: true,
    };
  }

  // 1. Blobs for changed content. Deleted paths need no blob — a null sha removes
  //    the entry from the new tree.
  const treeEntries = await uploadBlobs(
    token,
    base,
    writes.map((entry) => entry.file),
    signal,
    report,
    20,
    45,
  );
  for (const path of deletions) {
    treeEntries.push({ path, mode: '100644', type: 'blob', sha: null });
  }

  // 2. A tree based on the old one, so untouched paths are carried forward
  //    automatically rather than being re-sent.
  report('Building the commit tree…', 70);
  const treeSha = await createTree(token, base, treeEntries, baseTreeSha, signal);

  // 3. The commit, then the branch move.
  report('Creating the commit…', 82);
  const commit = await createCommit(token, base, message, treeSha, [headSha], signal);

  report('Updating the branch…', 92);
  await updateRef(token, base, branch, commit.sha, signal);

  report('Pushed.', 100);

  return {
    branch,
    commitSha: commit.sha,
    commitUrl: commit.html_url || `${commitBase}/${commit.sha}`,
    filesChanged: writes.length + deletions.length,
    alreadyUpToDate: false,
  };
};

export interface CreateRepoOptions {
  token: string;
  name: string;
  description?: string;
  private: boolean;
  /**
   * Seed the repository with a README so the very first branch push has a commit
   * to build on. Without it a brand-new repository has no default branch at all,
   * and `git/ref/heads/main` would 404.
   */
  autoInit: boolean;
  /** The project's files, committed as the initial push. */
  files: { path: string; content: string }[];
  commitMessage: string;
  onProgress?: (message: string, percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Creates a repository and pushes the project into it.
 *
 * `auto_init` defaults on for exactly the reason above: an empty repository has
 * no branch head, so there is nothing to attach the initial commit to.
 */
export const createRepository = async (options: CreateRepoOptions): Promise<GitHubSyncResult> => {
  const { token, name, description, private: isPrivate, autoInit, files, commitMessage, onProgress, signal } = options;
  const report = onProgress ?? (() => {});

  report('Creating the repository…', 8);
  const created = await githubRequest<RawRepo>(
    token,
    '/user/repos',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description?.trim() || undefined,
        private: isPrivate,
        auto_init: autoInit,
      }),
      signal,
    },
    'create the repository',
  );

  const repo = toRepo(created);
  const ref: RepoRef = { owner: created.owner.login, repo: created.name };
  const scaled = (message: string, percent: number): [string, number] => [
    message,
    15 + Math.round(percent * 0.85),
  ];

  /*
   * Two shapes of "first commit", because an empty repository has no branch to
   * push onto.
   *
   * With `auto_init`, GitHub has already made a seed commit, so the normal
   * build-on-head path applies and `deleteMissing` is safe: the only thing in the
   * repository is that README, which the project overwrites with its own.
   *
   * Without it there is no head at all, and asking for one returns 404. So the
   * first commit is created with no parents and no base tree, and the branch ref
   * is created to point at it.
   */
  let commit: GitHubCommitResult;

  if (autoInit) {
    commit = await commitFiles({
      token,
      ref,
      branch: created.default_branch,
      message: commitMessage,
      files,
      deleteMissing: true,
      onProgress: (message, percent) => report(...scaled(message, percent)),
      signal,
    });
  } else {
    const base = repoPath(ref);
    const treeEntries = await uploadBlobs(token, base, files, signal, report, 20, 55);
    const treeSha = await createTree(token, base, treeEntries, null, signal);
    const root = await createCommit(token, base, commitMessage, treeSha, [], signal);

    await githubRequest<RawRef>(
      token,
      `${base}/git/refs`,
      {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${created.default_branch}`, sha: root.sha }),
        signal,
      },
      'create the default branch',
    );

    commit = {
      branch: created.default_branch,
      commitSha: root.sha,
      commitUrl:
        root.html_url || `https://github.com/${ref.owner}/${ref.repo}/commit/${root.sha}`,
      filesChanged: files.length,
      alreadyUpToDate: false,
    };
  }

  return { repo, commit };
};

export interface PullResult {
  files: { path: string; content: string }[];
  /** Paths left behind because of the file-count or size cap. */
  skipped: string[];
  truncated: boolean;
}

/**
 * Reads a branch's text files back out of a repository.
 *
 * Only text files worth opening in an editor are returned: build output and
 * dependency directories are excluded, and anything past the size cap is reported
 * in `skipped` rather than silently dropped.
 */
export const pullFiles = async (options: {
  token: string;
  ref: RepoRef;
  branch: string;
  onProgress?: (message: string, percent: number) => void;
  signal?: AbortSignal;
}): Promise<PullResult> => {
  const { token, ref, branch, onProgress, signal } = options;
  const report = onProgress ?? (() => {});
  const base = repoPath(ref);

  report('Finding the latest commit…', 10);
  const { baseTreeSha } = await readBranchHead(token, base, branch, signal);

  report('Reading the repository tree…', 15);
  const tree = await githubRequest<RawTree>(
    token,
    `${base}/git/trees/${baseTreeSha}?recursive=1`,
    { signal },
    'read the repository tree',
  );

  const candidates = tree.tree.filter(
    (entry) =>
      entry.type === 'blob' &&
      !IGNORED_PULL_PREFIXES.some((prefix) => entry.path.startsWith(prefix)) &&
      (entry.size ?? 0) <= MAX_PULL_FILE_BYTES,
  );
  const wanted = candidates.slice(0, MAX_PULL_FILES);
  const skipped = candidates.slice(MAX_PULL_FILES).map((entry) => entry.path);

  const files = await Promise.all(
    wanted.map(async (entry, index) => {
      report(`Fetching ${entry.path}…`, 20 + Math.round((index / Math.max(wanted.length, 1)) * 75));
      const blob = await githubRequest<RawBlob>(token, `${base}/git/blobs/${entry.sha}`, { signal }, `fetch ${entry.path}`);
      // CRLF is normalised so a Windows-authored file does not show every line as
      // changed in the editor.
      return { path: entry.path, content: fromBase64(blob.content).replace(/\r\n/g, '\n') };
    }),
  );

  report('Pulled.', 100);

  return { files, skipped, truncated: skipped.length > 0 };
};

/**
 * The project's files as a pushable tree.
 *
 * Shares `buildArchiveFiles` with the export and deploy paths so a push, a
 * download and a deploy all put the identical directory on the remote.
 */
export const buildPushableFiles = (
  project: MultiFileProject,
  options: ArchiveOptions = {},
): { path: string; content: string }[] => buildArchiveFiles(project, options);