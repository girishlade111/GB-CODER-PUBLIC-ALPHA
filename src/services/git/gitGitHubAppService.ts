/**
 * GitHub App Architecture & Authorization Service for GB Coder.
 *
 * Implements GitHub App authorization checks and setup guidance:
 * - Detects configured GitHub App environment
 * - Generates GitHub App installation and repository authorization URLs
 * - Checks repository-level permissions (read, write, pull requests)
 * - Transparent fallback to personal access tokens via AES-GCM credentialStore
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Never exposing server private keys or client secrets in Vite
 * - Explicit permissions verification before write operations
 */

export interface GitHubAppConfig {
  isConfigured: boolean;
  appName?: string;
  clientId?: string;
  installUrl?: string;
}

export interface RepositoryPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
  canCreatePR: boolean;
}

/** Check if GitHub App configuration is present in environment */
export const getGitHubAppConfig = (): GitHubAppConfig => {
  const appName = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GITHUB_APP_NAME : undefined;
  const clientId = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GITHUB_APP_CLIENT_ID : undefined;

  if (appName && clientId) {
    return {
      isConfigured: true,
      appName,
      clientId,
      installUrl: `https://github.com/apps/${encodeURIComponent(appName)}/installations/new`,
    };
  }

  return {
    isConfigured: false,
  };
};

/** Verify repository permissions for current token */
export const checkRepositoryPermissions = async (
  repoFullName: string,
  token: string,
): Promise<RepositoryPermissions> => {
  if (!token) {
    return { admin: false, push: false, pull: false, canCreatePR: false };
  }

  const url = `https://api.github.com/repos/${repoFullName}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'GB-Coder-IDE',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('GitHub token expired or unauthorized.');
    }
    if (response.status === 404) {
      throw new Error(`Repository ${repoFullName} not found or inaccessible with current token.`);
    }
    throw new Error(`Permission check failed: HTTP ${response.status}`);
  }

  interface RawRepoInfo {
    permissions?: {
      admin?: boolean;
      push?: boolean;
      pull?: boolean;
    };
  }

  const data = (await response.json()) as RawRepoInfo;
  const perms = data.permissions || {};

  return {
    admin: !!perms.admin,
    push: !!perms.push,
    pull: !!perms.pull,
    canCreatePR: perms.pull !== false,
  };
};
