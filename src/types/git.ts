/**
 * Git and GitHub data models and interfaces for GB Coder.
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Type-safe Git operations
 * - Separation between Git objects, local projects, and cloud sync
 */

export interface GitAuthor {
  name: string;
  email: string;
}

export type GitStatusBadge = 'M' | 'A' | 'D' | 'U' | 'C' | 'R';

export type GitFileStatusKind =
  | 'modified'
  | 'added'
  | 'deleted'
  | 'untracked'
  | 'staged-modified'
  | 'staged-added'
  | 'staged-deleted'
  | 'conflict';

export interface GitFileStatus {
  path: string;
  status: GitFileStatusKind;
  staged: boolean;
  badge: GitStatusBadge;
}

export interface GitStatusResult {
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  isClean: boolean;
  branch: string;
  ahead: number;
  behind: number;
  hasConflicts: boolean;
  conflictedFiles: string[];
}

export interface GitCommitRecord {
  sha: string;
  shortSha: string;
  message: string;
  author: GitAuthor;
  timestamp: number;
  parentShas: string[];
}

export interface GitBranchInfo {
  name: string;
  current: boolean;
  commitSha: string;
}

export interface GitRemoteConfig {
  name: string;
  url: string;
}

export interface GitMergeResult {
  status: 'success' | 'fast-forward' | 'conflict' | 'already-up-to-date';
  commitSha?: string;
  conflicts?: string[];
  message?: string;
}

export interface GitPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  htmlUrl: string;
  headBranch: string;
  baseBranch: string;
  user: {
    login: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GitDiffInfo {
  path: string;
  staged: boolean;
  oldContent: string;
  newContent: string;
}
