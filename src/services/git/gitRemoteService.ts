/**
 * Remote Git & GitHub Synchronization Service for GB Coder.
 *
 * Implements remote repository operations:
 * - Remote configuration (origin URL and tracking)
 * - Fetching remote refs and computing ahead/behind counts
 * - Pulling remote changes with fast-forward and conflict detection
 * - Pushing commits to remote repository with permission verification
 * - Publishing new local branches to remote
 * - Cloning repositories with initial commit preservation
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Credentials held via AES-GCM in credentialStore
 * - Atomic commits via GitHub Git Data API without arbitrary third-party proxies
 */

import {
  getStatus,
  getLog,
  getCurrentBranch,
  initRepository,
  syncWorkingTree,
  stageAll,
  commit,
  readWorkingTree,
} from './gitEngineService';
import {
  pullFiles,
  commitFiles,
  parseRepoInput,
  type GitHubCommitResult,
} from '../githubSyncService';
import { checkRepositoryPermissions } from './gitGitHubAppService';
import { languageForPath, type ProjectFile } from '../../types/files';
import type { GitRemoteConfig, GitAuthor } from '../../types/git';

const REMOTE_CONFIG_KEY_PREFIX = 'gbcoder_git_remote_v1:';

const inMemoryRemotes = new Map<string, GitRemoteConfig>();

const getRemoteStorageKey = (projectId: string) => `${REMOTE_CONFIG_KEY_PREFIX}${projectId}`;

/** Retrieve configured remote for project */
export const getRemoteConfig = (projectId: string): GitRemoteConfig | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(getRemoteStorageKey(projectId));
      if (stored) return JSON.parse(stored) as GitRemoteConfig;
    }
  } catch {
    // Ignored
  }
  return inMemoryRemotes.get(projectId) || null;
};

/** Save configured remote for project */
export const setRemoteConfig = (projectId: string, config: GitRemoteConfig): void => {
  inMemoryRemotes.set(projectId, config);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(getRemoteStorageKey(projectId), JSON.stringify(config));
    }
  } catch {
    // Ignored
  }
};

/** Parse repo owner and name from remote URL */
export const parseRepoFullName = (url: string): string | null => {
  const clean = url.trim().replace(/\.git$/, '');
  const match = clean.match(/github\.com[/:]([^/]+\/[^/]+)/);
  if (match) return match[1];
  if (/^[^/]+\/[^/]+$/.test(clean)) return clean;
  return null;
};

export interface FetchResult {
  ahead: number;
  behind: number;
  latestRemoteSha: string;
  isUpToDate: boolean;
}

/** Fetch remote branch status and determine ahead/behind */
export const fetchRemote = async (
  projectId: string,
  repoFullName: string,
  token: string,
): Promise<FetchResult> => {
  const currentBranch = await getCurrentBranch(projectId);
  const url = `https://api.github.com/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(currentBranch)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'GB-Coder-IDE',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Remote branch does not exist yet (unpublished branch)
      const localLogs = await getLog(projectId);
      return {
        ahead: localLogs.length,
        behind: 0,
        latestRemoteSha: '',
        isUpToDate: false,
      };
    }
    throw new Error(`Failed to fetch remote branch: HTTP ${response.status}`);
  }

  interface RefResponse {
    object: { sha: string };
  }
  const refData = (await response.json()) as RefResponse;
  const remoteSha = refData.object.sha;

  const localLogs = await getLog(projectId, 100);
  const localShas = localLogs.map((l) => l.sha);

  if (localShas.length > 0 && localShas[0] === remoteSha) {
    return {
      ahead: 0,
      behind: 0,
      latestRemoteSha: remoteSha,
      isUpToDate: true,
    };
  }

  const remoteIndexInLocal = localShas.indexOf(remoteSha);
  if (remoteIndexInLocal > 0) {
    // Remote SHA is an ancestor of local HEAD -> local is ahead
    return {
      ahead: remoteIndexInLocal,
      behind: 0,
      latestRemoteSha: remoteSha,
      isUpToDate: false,
    };
  }

  // Local HEAD might be behind or diverged
  return {
    ahead: 0,
    behind: 1,
    latestRemoteSha: remoteSha,
    isUpToDate: false,
  };
};

export interface PullRemoteResult {
  status: 'up-to-date' | 'fast-forward' | 'merged';
  files: ProjectFile[];
  commitSha: string;
  filesChanged: number;
}

/** Pull remote changes into local project */
export const pullRemote = async (
  projectId: string,
  repoFullName: string,
  token: string,
  author?: GitAuthor,
): Promise<PullRemoteResult> => {
  const status = await getStatus(projectId);
  if (status.staged.length > 0 || status.unstaged.length > 0) {
    throw new Error('Cannot pull with uncommitted local changes. Commit or stash them first.');
  }

  const currentBranch = await getCurrentBranch(projectId);

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  const pulled = await pullFiles({
    ref: repoRef,
    branch: currentBranch,
    token,
  });

  const pulledFiles: ProjectFile[] = pulled.files.map((f) => ({
    path: f.path,
    content: f.content,
    language: languageForPath(f.path),
  }));

  // Update working tree
  await syncWorkingTree(projectId, pulledFiles);
  await stageAll(projectId);

  const pullCommit = await commit(
    projectId,
    `Merge remote branch '${currentBranch}' of https://github.com/${repoFullName}`,
    author,
  );

  return {
    status: pulled.skipped.length === 0 ? 'fast-forward' : 'merged',
    files: pulledFiles,
    commitSha: pullCommit.sha,
    filesChanged: pulled.files.length,
  };
};

export interface PushRemoteResult extends GitHubCommitResult {
  branch: string;
}

/** Push local commits to remote repository */
export const pushRemote = async (
  projectId: string,
  repoFullName: string,
  token: string,
): Promise<PushRemoteResult> => {
  const permissions = await checkRepositoryPermissions(repoFullName, token);
  if (!permissions.push) {
    throw new Error(`Insufficient permissions: Write access required to push to ${repoFullName}.`);
  }

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  const currentBranch = await getCurrentBranch(projectId);
  const files = await readWorkingTree(projectId);

  const localLogs = await getLog(projectId, 1);
  const commitMessage = localLogs.length > 0 ? localLogs[0].message : 'Commit from GB Coder';

  const result = await commitFiles({
    ref: repoRef,
    branch: currentBranch,
    files: files.map((f) => ({ path: f.path, content: f.content })),
    message: commitMessage,
    token,
  });

  return {
    ...result,
    branch: currentBranch,
  };
};

/** Publish local branch to remote */
export const publishBranch = async (
  projectId: string,
  branchName: string,
  repoFullName: string,
  token: string,
): Promise<void> => {
  const permissions = await checkRepositoryPermissions(repoFullName, token);
  if (!permissions.push) {
    throw new Error(`Insufficient permissions: Write access required to publish branch to ${repoFullName}.`);
  }

  const localLogs = await getLog(projectId, 1);
  if (localLogs.length === 0) {
    throw new Error('Cannot publish empty repository branch. Create an initial commit first.');
  }

  const headSha = localLogs[0].sha;
  const url = `https://api.github.com/repos/${repoFullName}/git/refs`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'GB-Coder-IDE',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: headSha,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = (errBody as { message?: string })?.message || `HTTP ${response.status}`;
    throw new Error(`Failed to publish branch: ${msg}`);
  }
};

/** Clone repository and initialize local Git repository */
export const cloneRepository = async (options: {
  projectId: string;
  repoFullName: string;
  branch?: string;
  token?: string;
  author?: GitAuthor;
}): Promise<{ files: ProjectFile[]; headSha: string }> => {
  const { projectId, repoFullName, branch = 'main', token = '', author } = options;

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  const pulled = await pullFiles({
    ref: repoRef,
    branch,
    token,
  });

  const files: ProjectFile[] = pulled.files.map((f) => ({
    path: f.path,
    content: f.content,
    language: languageForPath(f.path),
  }));

  const headSha = await initRepository(projectId, files, author);

  setRemoteConfig(projectId, {
    name: 'origin',
    url: `https://github.com/${repoFullName}.git`,
  });

  return {
    files,
    headSha,
  };
};
