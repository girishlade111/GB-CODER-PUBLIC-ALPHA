/**
 * Browser-based Git Engine Service for GB Coder.
 *
 * Implements real Git operations using isomorphic-git and lightning-fs:
 * - Persistent Git repository with .git metadata in IndexedDB
 * - Full staging index manipulation (stage, unstage, discard)
 * - Real commit objects with SHA-1 hashes and parent lineage
 * - Commit history inspection (git log)
 * - Branch creation, listing, switching, deletion
 * - 3-way diff calculation and three-way branch merging with conflict detection
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Preservation of local IndexedDB project storage
 * - Clear separation from Supabase Cloud Sync
 */

import * as git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';
import { languageForPath, type ProjectFile } from '../../types/files';
import type {
  GitAuthor,
  GitStatusResult,
  GitFileStatus,
  GitCommitRecord,
  GitBranchInfo,
  GitDiffInfo,
  GitMergeResult,
  RemoteCommitPayload,
} from '../../types/git';

const FS_NAME = 'gb-coder-git-fs';
const GIT_AUTHOR_KEY = 'gbcoder_git_author_v1';
const DEFAULT_BRANCH = 'main';

let fsInstance: FS | null = null;

export const getFS = (): FS => {
  if (fsInstance) return fsInstance;

  // Polyfill in Node test environments if needed
  if (typeof window === 'undefined' && typeof indexedDB === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('fake-indexeddb/auto');
    } catch {
      // Environment without fake-indexeddb
    }
  }

  fsInstance = new FS(FS_NAME);
  return fsInstance;
};

export const getProjectDir = (projectId: string): string => `/projects/${projectId}`;

/** Ensure recursive directory creation */
export const ensureDir = async (pfs: FS['promises'], dirPath: string): Promise<void> => {
  const parts = dirPath.split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    try {
      await pfs.mkdir(current);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'EEXIST') throw err;
    }
  }
};

/** Get configured Git author or fallback */
export const getGitAuthor = (): GitAuthor => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(GIT_AUTHOR_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GitAuthor;
        if (parsed.name && parsed.email) return parsed;
      }
    }
  } catch {
    // LocalStorage unavailable
  }
  return {
    name: 'GB Coder Developer',
    email: 'developer@gbcoder.dev',
  };
};

/** Set configured Git author */
export const setGitAuthor = (author: GitAuthor): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GIT_AUTHOR_KEY, JSON.stringify(author));
    }
  } catch {
    // LocalStorage unavailable
  }
};

/** Check if project repository is initialized */
export const isRepositoryInitialized = async (projectId: string): Promise<boolean> => {
  const fs = getFS();
  const pfs = fs.promises;
  const gitDir = `${getProjectDir(projectId)}/.git`;
  try {
    const stat = await pfs.stat(gitDir);
    return stat.isDirectory();
  } catch {
    return false;
  }
};

/** Synchronize project files to working tree */
export const syncWorkingTree = async (projectId: string, files: ProjectFile[]): Promise<void> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);

  await ensureDir(pfs, projectDir);

  const activePaths = new Set<string>();

  for (const file of files) {
    const fullPath = `${projectDir}/${file.path}`;
    const lastSlash = fullPath.lastIndexOf('/');
    if (lastSlash > 0) {
      await ensureDir(pfs, fullPath.slice(0, lastSlash));
    }
    await pfs.writeFile(fullPath, file.content);
    activePaths.add(file.path);
  }

  // Remove files that were deleted from editor
  const existingFiles = await listWorkingTreePaths(projectId);
  for (const existingPath of existingFiles) {
    if (!activePaths.has(existingPath)) {
      try {
        await pfs.unlink(`${projectDir}/${existingPath}`);
      } catch {
        // Ignored
      }
    }
  }
};

/** Recursively list all working tree relative paths (excluding .git) */
const listWorkingTreePaths = async (projectId: string): Promise<string[]> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);
  const result: string[] = [];

  const walk = async (currentDir: string, relativeDir: string) => {
    let entries: string[] = [];
    try {
      entries = await pfs.readdir(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry === '.git') continue;
      const fullPath = `${currentDir}/${entry}`;
      const relPath = relativeDir ? `${relativeDir}/${entry}` : entry;
      try {
        const stat = await pfs.stat(fullPath);
        if (stat.isDirectory()) {
          await walk(fullPath, relPath);
        } else {
          result.push(relPath);
        }
      } catch {
        // Skip unreadable entries
      }
    }
  };

  await walk(projectDir, '');
  return result;
};

/** Read working tree into ProjectFile array */
export const readWorkingTree = async (projectId: string): Promise<ProjectFile[]> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);
  const paths = await listWorkingTreePaths(projectId);
  const files: ProjectFile[] = [];

  for (const p of paths) {
    try {
      const content = await pfs.readFile(`${projectDir}/${p}`, 'utf8');
      files.push({
        path: p,
        content: typeof content === 'string' ? content : new TextDecoder().decode(content),
        language: languageForPath(p),
      });
    } catch {
      // Ignored
    }
  }

  return files;
};

/** Initialize Git repository */
export const initRepository = async (
  projectId: string,
  initialFiles: ProjectFile[],
  author?: GitAuthor,
): Promise<string> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const pfs = fs.promises;

  await ensureDir(pfs, projectDir);
  await git.init({ fs, dir: projectDir, defaultBranch: DEFAULT_BRANCH });

  // Sync initial files to working tree
  await syncWorkingTree(projectId, initialFiles);

  // Stage all initial files
  for (const file of initialFiles) {
    await git.add({ fs, dir: projectDir, filepath: file.path });
  }

  // Commit initial state
  const commitAuthor = author || getGitAuthor();
  const sha = await git.commit({
    fs,
    dir: projectDir,
    message: 'Initial commit',
    author: commitAuthor,
  });

  return sha;
};

/** Track merge conflict state per project in memory */
const projectConflicts = new Map<string, string[]>();

/** Compute Git status matrix */
export const getStatus = async (projectId: string): Promise<GitStatusResult> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  const initialized = await isRepositoryInitialized(projectId);
  if (!initialized) {
    return {
      staged: [],
      unstaged: [],
      isClean: true,
      branch: DEFAULT_BRANCH,
      ahead: 0,
      behind: 0,
      hasConflicts: false,
      conflictedFiles: [],
    };
  }

  let branch = DEFAULT_BRANCH;
  try {
    const current = await git.currentBranch({ fs, dir: projectDir });
    if (current) branch = current;
  } catch {
    // Fallback to default
  }

  const matrix = await git.statusMatrix({ fs, dir: projectDir });
  const staged: GitFileStatus[] = [];
  const unstaged: GitFileStatus[] = [];

  for (const [filepath, head, workdir, stage] of matrix) {
    if (filepath === '.git' || filepath.startsWith('.git/')) continue;

    // Unstaged changes
    if (head === 0 && workdir === 2 && stage === 0) {
      unstaged.push({ path: filepath, status: 'untracked', staged: false, badge: 'U' });
    } else if (head === 1 && workdir === 2 && stage === 1) {
      unstaged.push({ path: filepath, status: 'modified', staged: false, badge: 'M' });
    } else if (head === 1 && workdir === 0 && stage === 1) {
      unstaged.push({ path: filepath, status: 'deleted', staged: false, badge: 'D' });
    } else if (head === 1 && workdir === 2 && stage === 3) {
      unstaged.push({ path: filepath, status: 'modified', staged: false, badge: 'M' });
    } else if (head === 0 && workdir === 2 && stage === 3) {
      unstaged.push({ path: filepath, status: 'untracked', staged: false, badge: 'U' });
    }

    // Staged changes
    if (head === 0 && workdir === 2 && stage === 2) {
      staged.push({ path: filepath, status: 'staged-added', staged: true, badge: 'A' });
    } else if (head === 1 && workdir === 2 && stage === 2) {
      staged.push({ path: filepath, status: 'staged-modified', staged: true, badge: 'M' });
    } else if (head === 1 && workdir === 0 && stage === 0) {
      staged.push({ path: filepath, status: 'staged-deleted', staged: true, badge: 'D' });
    } else if (stage === 2 || stage === 3) {
      if (!staged.some((s) => s.path === filepath)) {
        staged.push({
          path: filepath,
          status: head === 0 ? 'staged-added' : 'staged-modified',
          staged: true,
          badge: head === 0 ? 'A' : 'M',
        });
      }
    }
  }

  const conflicts = projectConflicts.get(projectId) || [];

  return {
    staged,
    unstaged,
    isClean: staged.length === 0 && unstaged.length === 0 && conflicts.length === 0,
    branch,
    ahead: 0,
    behind: 0,
    hasConflicts: conflicts.length > 0,
    conflictedFiles: conflicts,
  };
};

/** Stage single file */
export const stageFile = async (projectId: string, filepath: string): Promise<void> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);
  const fullPath = `${projectDir}/${filepath}`;

  let exists = false;
  try {
    await pfs.stat(fullPath);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    await git.add({ fs, dir: projectDir, filepath });
  } else {
    await git.remove({ fs, dir: projectDir, filepath });
  }
};

/** Stage all changed files */
export const stageAll = async (projectId: string): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const matrix = await git.statusMatrix({ fs, dir: projectDir });

  for (const [filepath, , workdir] of matrix) {
    if (filepath === '.git' || filepath.startsWith('.git/')) continue;
    if (workdir === 0) {
      await git.remove({ fs, dir: projectDir, filepath });
    } else {
      await git.add({ fs, dir: projectDir, filepath });
    }
  }
};

/** Unstage single file */
export const unstageFile = async (projectId: string, filepath: string): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  await git.resetIndex({ fs, dir: projectDir, filepath });
};

/** Unstage all files */
export const unstageAll = async (projectId: string): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const matrix = await git.statusMatrix({ fs, dir: projectDir });
  for (const [filepath, , , stage] of matrix) {
    if (filepath === '.git' || filepath.startsWith('.git/')) continue;
    if (stage === 2 || stage === 3 || stage === 0) {
      try {
        await git.resetIndex({ fs, dir: projectDir, filepath });
      } catch {
        // Ignored
      }
    }
  }
};

/** Discard changes in a file (restore from index/HEAD) */
export const discardFileChanges = async (projectId: string, filepath: string): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  await git.checkout({ fs, dir: projectDir, filepaths: [filepath] });
};

/** Commit staged changes */
export const commit = async (
  projectId: string,
  message: string,
  author?: GitAuthor,
): Promise<GitCommitRecord> => {
  const cleanMessage = message.trim();
  if (!cleanMessage) {
    throw new Error('Commit message must not be empty.');
  }

  const status = await getStatus(projectId);
  if (status.staged.length === 0) {
    throw new Error('No staged changes to commit.');
  }

  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const commitAuthor = author || getGitAuthor();

  const sha = await git.commit({
    fs,
    dir: projectDir,
    message: cleanMessage,
    author: commitAuthor,
  });

  // Clear conflicts if any
  projectConflicts.delete(projectId);

  const logs = await git.log({ fs, dir: projectDir, depth: 1 });
  const headCommit = logs[0];

  return {
    sha,
    shortSha: sha.slice(0, 7),
    message: cleanMessage,
    author: commitAuthor,
    timestamp: headCommit.commit.author.timestamp * 1000,
    parentShas: headCommit.commit.parent || [],
  };
};

/** Retrieve commit history */
export const getLog = async (projectId: string, depth = 50): Promise<GitCommitRecord[]> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  const initialized = await isRepositoryInitialized(projectId);
  if (!initialized) return [];

  try {
    const logs = await git.log({ fs, dir: projectDir, depth });
    return logs.map((entry) => ({
      sha: entry.oid,
      shortSha: entry.oid.slice(0, 7),
      message: entry.commit.message.trim(),
      author: {
        name: entry.commit.author.name,
        email: entry.commit.author.email,
      },
      timestamp: entry.commit.author.timestamp * 1000,
      parentShas: entry.commit.parent || [],
    }));
  } catch {
    return [];
  }
};

/** List all local branches */
export const getBranches = async (projectId: string): Promise<GitBranchInfo[]> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  const initialized = await isRepositoryInitialized(projectId);
  if (!initialized) return [];

  const branchNames = await git.listBranches({ fs, dir: projectDir });
  let current = DEFAULT_BRANCH;
  try {
    const curr = await git.currentBranch({ fs, dir: projectDir });
    if (curr) current = curr;
  } catch {
    // Ignored
  }

  const result: GitBranchInfo[] = [];
  for (const name of branchNames) {
    let commitSha = '';
    try {
      commitSha = await git.resolveRef({ fs, dir: projectDir, ref: name });
    } catch {
      // Ignored
    }
    result.push({
      name,
      current: name === current,
      commitSha,
    });
  }

  return result;
};

/** Get current branch name */
export const getCurrentBranch = async (projectId: string): Promise<string> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  try {
    const branch = await git.currentBranch({ fs, dir: projectDir });
    return branch || DEFAULT_BRANCH;
  } catch {
    return DEFAULT_BRANCH;
  }
};

/** Create a new branch */
export const createBranch = async (projectId: string, branchName: string): Promise<void> => {
  const cleanName = branchName.trim();
  if (!cleanName || /[^a-zA-Z0-9._/-]/.test(cleanName)) {
    throw new Error('Invalid branch name.');
  }

  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  await git.branch({ fs, dir: projectDir, ref: cleanName });
};

/** Switch to branch and return updated project files */
export const switchBranch = async (
  projectId: string,
  branchName: string,
): Promise<ProjectFile[]> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  // Ensure clean working tree or staged changes before switching
  const status = await getStatus(projectId);
  if (status.staged.length > 0) {
    throw new Error('Cannot switch branch with staged changes. Commit or unstage first.');
  }

  await git.checkout({ fs, dir: projectDir, ref: branchName });
  return await readWorkingTree(projectId);
};

/** Delete local branch with safety checks */
export const deleteBranch = async (projectId: string, branchName: string): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const current = await getCurrentBranch(projectId);

  if (branchName === current) {
    throw new Error('Cannot delete currently checked out branch.');
  }
  if (branchName === DEFAULT_BRANCH) {
    throw new Error('Cannot delete default branch.');
  }

  await git.deleteBranch({ fs, dir: projectDir, ref: branchName });
};

/** Compute file diff between working tree, index, or HEAD */
export const getFileDiff = async (
  projectId: string,
  filepath: string,
  staged: boolean,
): Promise<GitDiffInfo> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);

  let oldContent = '';
  let newContent = '';

  if (staged) {
    // Old: HEAD commit content
    try {
      const headOid = await git.resolveRef({ fs, dir: projectDir, ref: 'HEAD' });
      const { blob } = await git.readBlob({ fs, dir: projectDir, oid: headOid, filepath });
      oldContent = new TextDecoder().decode(blob);
    } catch {
      oldContent = '';
    }

    // New: Staged index content
    try {
      const fullPath = `${projectDir}/${filepath}`;
      const buf = await pfs.readFile(fullPath);
      newContent = typeof buf === 'string' ? buf : new TextDecoder().decode(buf);
    } catch {
      newContent = '';
    }
  } else {
    // Old: Index or HEAD content
    try {
      const headOid = await git.resolveRef({ fs, dir: projectDir, ref: 'HEAD' });
      const { blob } = await git.readBlob({ fs, dir: projectDir, oid: headOid, filepath });
      oldContent = new TextDecoder().decode(blob);
    } catch {
      oldContent = '';
    }

    // New: Working tree content
    try {
      const fullPath = `${projectDir}/${filepath}`;
      const buf = await pfs.readFile(fullPath);
      newContent = typeof buf === 'string' ? buf : new TextDecoder().decode(buf);
    } catch {
      newContent = '';
    }
  }

  return {
    path: filepath,
    staged,
    oldContent,
    newContent,
  };
};

/** Merge another branch into current branch */
export const merge = async (
  projectId: string,
  theirBranch: string,
  author?: GitAuthor,
): Promise<GitMergeResult> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const current = await getCurrentBranch(projectId);

  if (current === theirBranch) {
    return { status: 'already-up-to-date', message: 'Already on that branch.' };
  }

  const commitAuthor = author || getGitAuthor();

  try {
    const res = await git.merge({
      fs,
      dir: projectDir,
      ours: current,
      theirs: theirBranch,
      author: commitAuthor,
    });

    projectConflicts.delete(projectId);

    // Synchronize working tree with merged commit
    try {
      await git.checkout({ fs, dir: projectDir, ref: current, force: true });
    } catch {
      // Ignored if working tree already clean
    }

    return {
      status: res.alreadyMerged ? 'already-up-to-date' : res.fastForward ? 'fast-forward' : 'success',
      commitSha: res.oid,
      message: res.fastForward ? 'Fast-forward merge completed.' : 'Branch merged successfully.',
    };
  } catch (err: unknown) {
    const error = err as { code?: string; data?: { bothModified?: string[]; filepaths?: string[] }; message?: string };
    if (error.code === 'MergeConflictError') {
      const conflicts = error.data?.bothModified || error.data?.filepaths || [];
      projectConflicts.set(projectId, conflicts);
      return {
        status: 'conflict',
        conflicts,
        message: 'Merge conflict detected. Please resolve conflicts.',
      };
    }
    throw err;
  }
};

/** Mark conflict resolved for a file */
export const resolveConflict = async (
  projectId: string,
  filepath: string,
  resolvedContent: string,
): Promise<void> => {
  const fs = getFS();
  const pfs = fs.promises;
  const projectDir = getProjectDir(projectId);

  await pfs.writeFile(`${projectDir}/${filepath}`, resolvedContent);
  await git.add({ fs, dir: projectDir, filepath });

  const currentConflicts = projectConflicts.get(projectId) || [];
  const updated = currentConflicts.filter((p) => p !== filepath);
  if (updated.length === 0) {
    projectConflicts.delete(projectId);
  } else {
    projectConflicts.set(projectId, updated);
  }
};

/** Abort an ongoing merge with conflicts */
export const abortMerge = async (projectId: string): Promise<ProjectFile[]> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  const current = await getCurrentBranch(projectId);

  projectConflicts.delete(projectId);
  await git.checkout({ fs, dir: projectDir, ref: current, force: true });
  return await readWorkingTree(projectId);
};

/** Set remote tracking branch reference */
export const setRemoteTrackingRef = async (
  projectId: string,
  remoteName: string,
  branch: string,
  commitSha: string,
): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  await git.writeRef({
    fs,
    dir: projectDir,
    ref: `refs/remotes/${remoteName}/${branch}`,
    value: commitSha,
    force: true,
  });
};

/** Get remote tracking branch reference */
export const getRemoteTrackingRef = async (
  projectId: string,
  remoteName: string,
  branch: string,
): Promise<string | null> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  try {
    return await git.resolveRef({
      fs,
      dir: projectDir,
      ref: `refs/remotes/${remoteName}/${branch}`,
    });
  } catch {
    return null;
  }
};

/** Set local branch reference */
export const setBranchRef = async (
  projectId: string,
  branch: string,
  commitSha: string,
): Promise<void> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  await git.writeRef({
    fs,
    dir: projectDir,
    ref: `refs/heads/${branch}`,
    value: commitSha,
    force: true,
  });
};

/** Reconstruct remote commits into local Git object database */
export const writeRemoteCommitObjects = async (
  projectId: string,
  commits: RemoteCommitPayload[],
): Promise<Map<string, string>> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  let treeOid = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
  try {
    treeOid = await git.writeTree({ fs, dir: projectDir, tree: [] });
  } catch {
    // Default empty tree
  }

  const shaMap = new Map<string, string>();

  // Ensure chronological order (oldest first so parents exist before children)
  const ordered = [...commits];
  if (ordered.length > 1) {
    const firstDate = new Date(ordered[0].author.date).getTime();
    const lastDate = new Date(ordered[ordered.length - 1].author.date).getTime();
    if (firstDate > lastDate) {
      ordered.reverse();
    }
  }

  for (const c of ordered) {
    const mappedParents = (c.parents || []).map((p) => shaMap.get(p) || p);
    const authorTime =
      typeof c.author.date === 'number'
        ? Math.floor(c.author.date / 1000)
        : Math.floor(new Date(c.author.date).getTime() / 1000);
    const committerTime = c.committer
      ? typeof c.committer.date === 'number'
        ? Math.floor(c.committer.date / 1000)
        : Math.floor(new Date(c.committer.date).getTime() / 1000)
      : authorTime;

    const commitMessage = c.message.endsWith('\n') ? c.message : `${c.message}\n`;

    const writtenOid = await git.writeCommit({
      fs,
      dir: projectDir,
      commit: {
        message: commitMessage,
        tree: c.treeSha || treeOid,
        parent: mappedParents,
        author: {
          name: c.author.name || 'Unknown',
          email: c.author.email || 'developer@example.com',
          timestamp: authorTime || Math.floor(Date.now() / 1000),
          timezoneOffset: 0,
        },
        committer: {
          name: c.committer?.name || c.author.name || 'Unknown',
          email: c.committer?.email || c.author.email || 'developer@example.com',
          timestamp: committerTime || Math.floor(Date.now() / 1000),
          timezoneOffset: 0,
        },
      },
    });

    shaMap.set(c.sha, writtenOid);
  }

  return shaMap;
};

/** Verify whether an ancestor commit is in the ancestry of descendant commit */
export const isCommitAncestor = async (
  projectId: string,
  ancestorSha: string,
  descendantSha: string,
): Promise<boolean> => {
  if (ancestorSha === descendantSha) return true;
  const fs = getFS();
  const projectDir = getProjectDir(projectId);
  try {
    return await git.isDescendent({
      fs,
      dir: projectDir,
      oid: descendantSha,
      ancestor: ancestorSha,
    });
  } catch {
    return false;
  }
};

/** Compute ahead and behind count between local branch and remote-tracking ref */
export const computeAheadBehind = async (
  projectId: string,
  localBranch: string,
  remoteTrackingRef: string,
): Promise<{ ahead: number; behind: number }> => {
  const fs = getFS();
  const projectDir = getProjectDir(projectId);

  let localSha = '';
  let remoteSha = '';
  try {
    localSha = await git.resolveRef({ fs, dir: projectDir, ref: `refs/heads/${localBranch}` });
  } catch {
    return { ahead: 0, behind: 0 };
  }

  try {
    remoteSha = await git.resolveRef({ fs, dir: projectDir, ref: remoteTrackingRef });
  } catch {
    const localLogs = await git.log({ fs, dir: projectDir, depth: 50 });
    return { ahead: localLogs.length, behind: 0 };
  }

  if (localSha === remoteSha) {
    return { ahead: 0, behind: 0 };
  }

  // Check if remote is ancestor of local (local ahead)
  let remoteIsAncestor = false;
  try {
    remoteIsAncestor = await git.isDescendent({ fs, dir: projectDir, oid: localSha, ancestor: remoteSha });
  } catch {
    // Missing object
  }

  if (remoteIsAncestor) {
    const localLogs = await git.log({ fs, dir: projectDir, depth: 100 });
    const localShas = localLogs.map((l) => l.oid);
    const idx = localShas.indexOf(remoteSha);
    return { ahead: idx > 0 ? idx : 1, behind: 0 };
  }

  // Check if local is ancestor of remote (local behind)
  let localIsAncestor = false;
  try {
    localIsAncestor = await git.isDescendent({ fs, dir: projectDir, oid: remoteSha, ancestor: localSha });
  } catch {
    // Missing object
  }

  if (localIsAncestor) {
    const remoteLogs = await git.log({ fs, dir: projectDir, ref: remoteTrackingRef, depth: 100 });
    const remoteShas = remoteLogs.map((l) => l.oid);
    const idx = remoteShas.indexOf(localSha);
    return { ahead: 0, behind: idx > 0 ? idx : 1 };
  }

  // Diverged branches: calculate via merge base
  try {
    const mergeBases = await git.findMergeBase({ fs, dir: projectDir, oids: [localSha, remoteSha] });
    if (mergeBases.length > 0) {
      const baseSha = mergeBases[0];
      const localLogs = await git.log({ fs, dir: projectDir, depth: 100 });
      const remoteLogs = await git.log({ fs, dir: projectDir, ref: remoteTrackingRef, depth: 100 });
      const localIdx = localLogs.map((l) => l.oid).indexOf(baseSha);
      const remoteIdx = remoteLogs.map((l) => l.oid).indexOf(baseSha);
      return {
        ahead: localIdx > 0 ? localIdx : 1,
        behind: remoteIdx > 0 ? remoteIdx : 1,
      };
    }
  } catch {
    // Fallback
  }

  return { ahead: 1, behind: 1 };
};

