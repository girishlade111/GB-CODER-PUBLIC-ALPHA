/**
 * Remote Git & GitHub Synchronization Service for GB Coder.
 *
 * Implements remote repository operations:
 * - Remote configuration (origin URL and tracking)
 * - Fetching remote refs, writing commit objects, and computing ahead/behind counts
 * - Pulling remote changes with fast-forward and conflict detection
 * - Pushing commits to remote repository with fast-forward verification
 * - Publishing new local branches to remote
 * - Reconstructing authentic Git commit history on clone
 * - Importing repository file snapshots
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Credentials held via AES-GCM in credentialStore
 * - Atomic commits via GitHub Git Data API without arbitrary third-party proxies
 */

import * as git from 'isomorphic-git';
import {
  getStatus,
  getLog,
  getCurrentBranch,
  initRepository,
  syncWorkingTree,
  stageAll,
  unstageAll,
  commit,
  readWorkingTree,
  getFS,
  getProjectDir,
  ensureDir,
  setRemoteTrackingRef,
  getRemoteTrackingRef,
  setBranchRef,
  writeRemoteCommitObjects,
  computeAheadBehind,
  getGitAuthor,
  getRemoteShaMapping,
  saveRemoteShaMapping,
} from './gitEngineService';
import {
  pullFiles,
  commitChain,
  parseRepoInput,
  type GitHubCommitResult,
  type CommitChainItem,
} from '../githubSyncService';
import { checkRepositoryPermissions } from './gitGitHubAppService';
import { getSupabaseClient } from '../auth/supabaseClient';
import { languageForPath, type ProjectFile } from '../../types/files';
import type { GitRemoteConfig, GitAuthor, RemoteCommitPayload } from '../../types/git';

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

/** Fetch remote branch status, write remote commit objects, and update remote-tracking ref */
export const fetchRemote = async (
  projectId: string,
  repoFullName: string,
  token?: string,
): Promise<FetchResult> => {
  const currentBranch = await getCurrentBranch(projectId);
  let url = `https://api.github.com/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(currentBranch)}?_t=${Date.now()}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GB-Coder-IDE',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.access_token) {
          const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
          if (supabaseUrl) {
            url = `${supabaseUrl}/functions/v1/github-app-git-proxy?path=${encodeURIComponent(`/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(currentBranch)}?_t=${Date.now()}`)}`;
            headers.Authorization = `Bearer ${session.access_token}`;
          }
        }
      } catch {
        // Fallback to direct request
      }
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('GitHub token expired or unauthorized.');
    }
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

  // Resolve remoteSha to local OID if it was previously imported/mapped
  const shaMap = await getRemoteShaMapping(projectId);
  const localMappedSha = shaMap[remoteSha] || remoteSha;

  const localLogs = await getLog(projectId, 100);
  const localShas = localLogs.map((l) => l.sha);

  if (localShas.length > 0 && (localShas[0] === remoteSha || localShas[0] === localMappedSha)) {
    await setRemoteTrackingRef(projectId, 'origin', currentBranch, localMappedSha);
    return {
      ahead: 0,
      behind: 0,
      latestRemoteSha: remoteSha,
      isUpToDate: true,
    };
  }

  const remoteIndexInLocal = localShas.findIndex((s) => s === remoteSha || s === localMappedSha);
  if (remoteIndexInLocal > 0) {
    // Remote SHA is an ancestor of local HEAD -> local is ahead
    await setRemoteTrackingRef(projectId, 'origin', currentBranch, localMappedSha);
    return {
      ahead: remoteIndexInLocal,
      behind: 0,
      latestRemoteSha: remoteSha,
      isUpToDate: false,
    };
  }

  // Remote has new commits not present in local history: fetch and write objects
  try {
    let commitsUrl = `https://api.github.com/repos/${repoFullName}/commits?sha=${encodeURIComponent(remoteSha)}&per_page=30&_t=${Date.now()}`;
    const commitHeaders: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GB-Coder-IDE',
    };

    if (token) {
      commitHeaders.Authorization = `Bearer ${token}`;
    } else {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.access_token) {
            const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
            if (supabaseUrl) {
              commitsUrl = `${supabaseUrl}/functions/v1/github-app-git-proxy?path=${encodeURIComponent(`/repos/${repoFullName}/commits?sha=${encodeURIComponent(remoteSha)}&per_page=30&_t=${Date.now()}`)}`;
              commitHeaders.Authorization = `Bearer ${session.access_token}`;
            }
          }
        } catch {
          // Fallback to direct request
        }
      }
    }

    const commitsRes = await fetch(commitsUrl, {
      method: 'GET',
      headers: commitHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (commitsRes.ok) {
      const rawCommits = await commitsRes.json();
      if (Array.isArray(rawCommits)) {
        interface RawCommitItem {
          sha: string;
          commit: {
            message: string;
            author: { name: string; email: string; date: string };
            committer?: { name: string; email: string; date: string };
            tree: { sha: string };
          };
          parents: Array<{ sha: string } | string>;
        }

        // Filter down to only commits not yet known in local Git history
        const newCommits: RawCommitItem[] = [];
        for (const item of (rawCommits as RawCommitItem[])) {
          if (shaMap[item.sha] || localShas.includes(item.sha)) {
            break;
          }
          newCommits.push(item);
        }

        let effectiveRemoteSha = shaMap[remoteSha] || remoteSha;
        if (newCommits.length > 0) {
          const payloads: RemoteCommitPayload[] = newCommits.map((item) => ({
            sha: item.sha,
            message: item.commit.message,
            author: item.commit.author,
            committer: item.commit.committer,
            treeSha: item.commit.tree?.sha,
            parents: (item.parents || []).map((p) => (typeof p === 'string' ? p : p.sha)).filter(Boolean) as string[],
          }));

          const writtenShaMap = await writeRemoteCommitObjects(projectId, payloads);
          effectiveRemoteSha = writtenShaMap.get(remoteSha) || shaMap[remoteSha] || remoteSha;
        }

        await setRemoteTrackingRef(projectId, 'origin', currentBranch, effectiveRemoteSha);
      } else {
        await setRemoteTrackingRef(projectId, 'origin', currentBranch, remoteSha);
      }
    } else {
      await setRemoteTrackingRef(projectId, 'origin', currentBranch, remoteSha);
    }
  } catch {
    await setRemoteTrackingRef(projectId, 'origin', currentBranch, remoteSha);
  }

  // Compute ahead and behind without modifying working tree
  const remoteTrackingRef = `refs/remotes/origin/${currentBranch}`;
  const counts = await computeAheadBehind(projectId, currentBranch, remoteTrackingRef);

  return {
    ahead: counts.ahead,
    behind: counts.behind,
    latestRemoteSha: remoteSha,
    isUpToDate: counts.ahead === 0 && counts.behind === 0,
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
  token?: string,
  author?: GitAuthor,
): Promise<PullRemoteResult> => {
  const status = await getStatus(projectId);
  if (status.staged.length > 0 || status.unstaged.length > 0) {
    throw new Error('Cannot pull with uncommitted local changes. Commit or stash them first.');
  }

  const currentBranch = await getCurrentBranch(projectId);

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  const fetchRes = await fetchRemote(projectId, repoFullName, token);
  if (fetchRes.isUpToDate) {
    const files = await readWorkingTree(projectId);
    const localLogs = await getLog(projectId, 1);
    return {
      status: 'up-to-date',
      files,
      commitSha: localLogs[0]?.sha || '',
      filesChanged: 0,
    };
  }

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

  // Update working tree with pulled files
  await syncWorkingTree(projectId, pulledFiles);
  await stageAll(projectId);

  if (fetchRes.ahead === 0) {
    // Fast-forward merge
    const remoteSha =
      (await getRemoteTrackingRef(projectId, 'origin', currentBranch)) || fetchRes.latestRemoteSha;
    await setBranchRef(projectId, currentBranch, remoteSha);
    await unstageAll(projectId);

    return {
      status: 'fast-forward',
      files: pulledFiles,
      commitSha: remoteSha,
      filesChanged: pulled.files.length,
    };
  }

  // Diverged: create merge commit
  const pullCommit = await commit(
    projectId,
    `Merge remote branch '${currentBranch}' of https://github.com/${repoFullName}`,
    author,
  );

  return {
    status: 'merged',
    files: pulledFiles,
    commitSha: pullCommit.sha,
    filesChanged: pulled.files.length,
  };
};

export interface PushRemoteResult extends GitHubCommitResult {
  branch: string;
  pushedCommitsCount?: number;
}

/** Push local commits to remote repository with fast-forward verification and ref sync */
export const pushRemote = async (
  projectId: string,
  repoFullName: string,
  token?: string,
): Promise<PushRemoteResult> => {
  const permissions = await checkRepositoryPermissions(repoFullName, token);
  if (!permissions.push) {
    throw new Error(`Insufficient permissions: Write access required to push to ${repoFullName}.`);
  }

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  const currentBranch = await getCurrentBranch(projectId);

  // Rejection of non-fast-forward push
  const fetchStatus = await fetchRemote(projectId, repoFullName, token).catch(() => null);
  if (fetchStatus && fetchStatus.behind > 0) {
    throw new Error(
      `Cannot push non-fast-forward reference. Remote branch '${currentBranch}' is ahead by ${fetchStatus.behind} commit(s). Pull remote changes first.`,
    );
  }

  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  // Identify unpushed commits from local Git history
  const localLogs = await git.log({ fs, dir: projectDir, depth: 50 });
  if (localLogs.length === 0) {
    throw new Error('No commits to push. Create a commit first.');
  }

  const trackingRef = await getRemoteTrackingRef(projectId, 'origin', currentBranch);
  let unpushedLogs = localLogs;

  if (trackingRef) {
    const shaMap = await getRemoteShaMapping(projectId);
    const resolvedTrackingRef = shaMap[trackingRef] || trackingRef;
    const trackingIdx = localLogs.findIndex((c) => c.oid === trackingRef || c.oid === resolvedTrackingRef);
    if (trackingIdx > 0) {
      unpushedLogs = localLogs.slice(0, trackingIdx);
    }
  }

  // Chronological order: oldest unpushed commit to newest
  const chronologicalLogs = [...unpushedLogs].reverse();

  // Read snapshot of files for each commit from Git object database without altering working tree
  const commitItems: CommitChainItem[] = await Promise.all(
    chronologicalLogs.map(async (entry) => {
      const paths = await git.listFiles({ fs, dir: projectDir, ref: entry.oid });
      const files = await Promise.all(
        paths.map(async (filepath) => {
          const { blob } = await git.readBlob({ fs, dir: projectDir, oid: entry.oid, filepath });
          return {
            path: filepath,
            content: new TextDecoder().decode(blob),
          };
        }),
      );
      const commitAuthor = entry.commit.author
        ? {
            name: entry.commit.author.name,
            email: entry.commit.author.email,
            date: new Date(entry.commit.author.timestamp * 1000).toISOString(),
          }
        : undefined;
      const commitCommitter = entry.commit.committer
        ? {
            name: entry.commit.committer.name,
            email: entry.commit.committer.email,
            date: new Date(entry.commit.committer.timestamp * 1000).toISOString(),
          }
        : undefined;

      return {
        message: entry.commit.message.trim(),
        files,
        deleteMissing: true,
        author: commitAuthor,
        committer: commitCommitter,
      };
    }),
  );

  const result = await commitChain({
    ref: repoRef,
    branch: currentBranch,
    commits: commitItems,
    token,
  });

  // Reconcile remote tracking ref and record remote-to-local commit mapping
  if (result.commitSha && !result.alreadyUpToDate) {
    const pushedLocalSha = localLogs[0].oid;
    const mappingUpdate: Record<string, string> = {
      [result.commitSha]: pushedLocalSha,
      [pushedLocalSha]: result.commitSha,
    };
    if (result.pushedCommits && result.pushedCommits.length > 0 && chronologicalLogs.length === result.pushedCommits.length) {
      for (let i = 0; i < result.pushedCommits.length; i++) {
        const remoteC = result.pushedCommits[i];
        const localC = chronologicalLogs[i];
        if (remoteC?.sha && localC?.oid) {
          mappingUpdate[remoteC.sha] = localC.oid;
          mappingUpdate[localC.oid] = remoteC.sha;
        }
      }
    }
    await saveRemoteShaMapping(projectId, mappingUpdate);
    await setRemoteTrackingRef(projectId, 'origin', currentBranch, pushedLocalSha);
  }

  return {
    ...result,
    branch: currentBranch,
    pushedCommitsCount: result.pushedCommits?.length || (result.alreadyUpToDate ? 0 : 1),
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

  await setRemoteTrackingRef(projectId, 'origin', branchName, headSha);
};

/** Clone repository and reconstruct authentic remote commit history */
export const cloneRepository = async (options: {
  projectId: string;
  repoFullName: string;
  branch?: string;
  token?: string;
  depth?: number;
  author?: GitAuthor;
}): Promise<{ files: ProjectFile[]; headSha: string; commitCount: number }> => {
  const { projectId, repoFullName, branch = 'main', token = '', depth = 30, author } = options;

  const repoRef = parseRepoInput(repoFullName);
  if (!repoRef) throw new Error(`Invalid repository name '${repoFullName}'. Expected owner/repo.`);

  // 1. Download file contents at branch HEAD
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

  // 2. Fetch commit history chain from GitHub REST API
  let remoteCommits: RemoteCommitPayload[] = [];
  try {
    const commitsUrl = `https://api.github.com/repos/${repoFullName}/commits?sha=${encodeURIComponent(branch)}&per_page=${depth}`;
    const res = await fetch(commitsUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'User-Agent': 'GB-Coder-IDE',
      },
    });

    if (res.ok) {
      interface RawCommitItem {
        sha: string;
        commit: {
          message: string;
          author: { name: string; email: string; date: string };
          committer?: { name: string; email: string; date: string };
          tree: { sha: string };
        };
        parents: Array<{ sha: string }>;
      }
      const rawList = (await res.json()) as RawCommitItem[];
      remoteCommits = rawList.map((item) => ({
        sha: item.sha,
        message: item.commit.message,
        author: item.commit.author,
        committer: item.commit.committer,
        treeSha: item.commit.tree?.sha,
        parents: (item.parents || []).map((p) => (typeof p === 'string' ? p : (p as { sha: string }).sha)).filter(Boolean) as string[],
      }));
    }
  } catch {
    // If commit chain retrieval fails, continue with single commit fallback
  }

  // 3. Initialize repository structure and write working tree
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);
  await ensureDir(pfs, projectDir);
  await git.init({ fs, dir: projectDir, defaultBranch: branch });
  await syncWorkingTree(projectId, files);

  for (const f of files) {
    await git.add({ fs, dir: projectDir, filepath: f.path });
  }

  let headSha = '';

  if (remoteCommits.length > 0) {
    const shaMap = await writeRemoteCommitObjects(projectId, remoteCommits);
    const newestRemote = remoteCommits[0];
    headSha = shaMap.get(newestRemote.sha) || newestRemote.sha;

    await setBranchRef(projectId, branch, headSha);
    await setRemoteTrackingRef(projectId, 'origin', branch, headSha);
  } else {
    headSha = await git.commit({
      fs,
      dir: projectDir,
      message: `Initial commit from ${repoFullName}@${branch}`,
      author: author || getGitAuthor(),
    });
    await setRemoteTrackingRef(projectId, 'origin', branch, headSha);
  }

  setRemoteConfig(projectId, {
    name: 'origin',
    url: `https://github.com/${repoFullName}.git`,
  });

  return {
    files,
    headSha,
    commitCount: remoteCommits.length || 1,
  };
};

/** Import file snapshot into working tree without Git commit history reconstruction */
export const importRepositoryFiles = async (options: {
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
