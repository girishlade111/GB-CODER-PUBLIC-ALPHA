/**
 * GitHub Pull Request Service for GB Coder.
 *
 * Implements real GitHub Pull Request API operations:
 * - List pull requests
 * - Create pull request with title, description, head, base
 * - Inspect pull request changed files
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Explicit user confirmation (no automatic PR creation or merging)
 * - Safe credential handling via credentialStore
 */

import type { GitPullRequest } from '../../types/git';

const GITHUB_API_BASE = 'https://api.github.com';

const requestHeaders = (token: string): HeadersInit => ({
  Accept: 'application/vnd.github.v3+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'GB-Coder-IDE',
});

/** List pull requests for a repository */
export const listPullRequests = async (
  repoFullName: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'open',
): Promise<GitPullRequest[]> => {
  const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls?state=${state}&per_page=30`;
  const response = await fetch(url, {
    method: 'GET',
    headers: requestHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('GitHub token expired or unauthorized.');
    if (response.status === 404) throw new Error(`Repository ${repoFullName} not found or inaccessible.`);
    throw new Error(`Failed to list pull requests: HTTP ${response.status}`);
  }

  interface GitHubRawPR {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    html_url: string;
    head: { ref: string };
    base: { ref: string };
    user: { login: string; avatar_url: string };
    created_at: string;
    updated_at: string;
  }

  const rawList = (await response.json()) as GitHubRawPR[];

  return rawList.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    htmlUrl: pr.html_url,
    headBranch: pr.head.ref,
    baseBranch: pr.base.ref,
    user: {
      login: pr.user?.login || 'unknown',
      avatarUrl: pr.user?.avatar_url || '',
    },
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
  }));
};

export interface CreatePullRequestOptions {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
}

/** Create a new pull request */
export const createPullRequest = async (
  repoFullName: string,
  token: string,
  options: CreatePullRequestOptions,
): Promise<GitPullRequest> => {
  const cleanTitle = options.title.trim();
  if (!cleanTitle) throw new Error('Pull request title must not be empty.');
  if (!options.head) throw new Error('Source branch (head) must be specified.');
  if (!options.base) throw new Error('Target branch (base) must be specified.');

  const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...requestHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: cleanTitle,
      body: options.body || '',
      head: options.head,
      base: options.base,
      draft: !!options.draft,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { message?: string })?.message || `HTTP ${response.status}`;
    throw new Error(`Failed to create pull request: ${message}`);
  }

  interface GitHubCreatedPR {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    html_url: string;
    head: { ref: string };
    base: { ref: string };
    user: { login: string; avatar_url: string };
    created_at: string;
    updated_at: string;
  }

  const created = (await response.json()) as GitHubCreatedPR;

  return {
    id: created.id,
    number: created.number,
    title: created.title,
    body: created.body,
    state: created.state,
    htmlUrl: created.html_url,
    headBranch: created.head.ref,
    baseBranch: created.base.ref,
    user: {
      login: created.user?.login || 'unknown',
      avatarUrl: created.user?.avatar_url || '',
    },
    createdAt: created.created_at,
    updatedAt: created.updated_at,
  };
};

export interface PullRequestFileInfo {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

/** Retrieve changed files for a pull request */
export const getPullRequestFiles = async (
  repoFullName: string,
  token: string,
  pullNumber: number,
): Promise<PullRequestFileInfo[]> => {
  const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls/${pullNumber}/files`;
  const response = await fetch(url, {
    method: 'GET',
    headers: requestHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Failed to inspect PR files: HTTP ${response.status}`);
  }

  interface RawPRFile {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }

  const rawFiles = (await response.json()) as RawPRFile[];
  return rawFiles.map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
  }));
};

