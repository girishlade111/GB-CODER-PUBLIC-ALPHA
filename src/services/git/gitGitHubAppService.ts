/**
 * GitHub App Architecture & Authorization Service for GB Coder Phase 5.
 *
 * Implements:
 * - Detects configured GitHub App environment
 * - Initiates PKCE-S256 OAuth authorization via Supabase Edge Function
 * - Checks connection status and token expiration
 * - Lists authorized repositories via serverless Git proxy
 * - Refreshes expiring access tokens via refresh token rotation
 * - Disconnects GitHub App authorization and revokes grants
 * - Verifies repository-level permissions
 * - Transparent fallback to personal access tokens via AES-GCM credentialStore
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Never exposing server private keys or client secrets in Vite
 * - Explicit permissions verification before write operations
 */

import { getSupabaseClient } from '../auth/supabaseClient';

export interface GitHubAppConfig {
  isConfigured: boolean;
  appName?: string;
  clientId?: string;
  installUrl?: string;
}

export interface GitHubAppStatus {
  isConnected: boolean;
  githubUserId?: number;
  githubUsername?: string;
  tokenExpiresAt?: string;
  isExpired?: boolean;
  scope?: string;
  installationId?: number;
  reason?: string;
}

export interface RepositoryPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
  canCreatePR: boolean;
}

export interface GitHubRepositoryItem {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  description: string | null;
  permissions?: RepositoryPermissions;
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

/** Get Edge Function auth URL */
const getAuthFunctionUrl = (): string => {
  const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
  return `${supabaseUrl}/functions/v1/github-app-auth`;
};

/** Get Edge Function Git proxy URL */
const getGitProxyUrl = (): string => {
  const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
  return `${supabaseUrl}/functions/v1/github-app-git-proxy`;
};

/**
 * Check if the currently authenticated Supabase user has an active GitHub App connection.
 */
export const getGitHubAppStatus = async (): Promise<GitHubAppStatus> => {
  const client = getSupabaseClient();
  if (!client) {
    return { isConnected: false, reason: 'unconfigured' };
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) {
    return { isConnected: false, reason: 'unauthenticated' };
  }

  try {
    const res = await fetch(`${getAuthFunctionUrl()}?action=status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { isConnected: false, reason: `HTTP_${res.status}` };
    }

    const data = (await res.json()) as GitHubAppStatus;
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isConnected: false, reason: message };
  }
};

/**
 * Initiates the GitHub App OAuth flow via the edge backend.
 * Returns the GitHub authorization URL to redirect to.
 */
export const startGitHubAppAuth = async (returnPath = '/app'): Promise<string> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to GB Coder before connecting a GitHub App.');
  }

  const res = await fetch(`${getAuthFunctionUrl()}?action=start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnPath }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to start GitHub App authorization (${res.status})`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
};

/**
 * Disconnects the GitHub App connection for the authenticated user.
 */
export const disconnectGitHubApp = async (): Promise<void> => {
  const client = getSupabaseClient();
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) return;

  const res = await fetch(`${getAuthFunctionUrl()}?action=disconnect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to disconnect GitHub App (${res.status})`);
  }
};

/**
 * Refreshes an expiring GitHub App access token.
 */
export const refreshGitHubAppToken = async (): Promise<{ success: boolean; tokenExpiresAt?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User not authenticated with Supabase.');
  }

  const res = await fetch(`${getAuthFunctionUrl()}?action=refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to refresh GitHub App token (${res.status})`);
  }

  return (await res.json()) as { success: boolean; tokenExpiresAt?: string };
};

/**
 * Lists repositories authorized for the current user via the GitHub App proxy.
 */
export const listAuthorizedRepositories = async (): Promise<GitHubRepositoryItem[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) return [];

  const proxyUrl = new URL(getGitProxyUrl());
  proxyUrl.searchParams.set('path', '/user/repos?per_page=100&sort=updated');

  const res = await fetch(proxyUrl.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    return [];
  }

  interface RawRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    html_url: string;
    description: string | null;
    permissions?: {
      admin?: boolean;
      push?: boolean;
      pull?: boolean;
    };
  }

  const repos = (await res.json()) as RawRepo[];
  return repos.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    private: r.private,
    defaultBranch: r.default_branch || 'main',
    htmlUrl: r.html_url,
    description: r.description,
    permissions: {
      admin: !!r.permissions?.admin,
      push: !!r.permissions?.push,
      pull: !!r.permissions?.pull,
      canCreatePR: r.permissions?.pull !== false,
    },
  }));
};

/** Verify repository permissions for current token or transport */
export const checkRepositoryPermissions = async (
  repoFullName: string,
  token?: string,
): Promise<RepositoryPermissions> => {
  // If token is provided, verify directly against GitHub API (PAT mode)
  if (token) {
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
  }

  // Otherwise verify via GitHub App Git proxy
  const client = getSupabaseClient();
  if (!client) {
    return { admin: false, push: false, pull: false, canCreatePR: false };
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) {
    return { admin: false, push: false, pull: false, canCreatePR: false };
  }

  const proxyUrl = new URL(getGitProxyUrl());
  proxyUrl.searchParams.set('path', `/repos/${repoFullName}`);

  const response = await fetch(proxyUrl.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('GitHub App authorization expired or unauthorized.');
    }
    if (response.status === 404) {
      throw new Error(`Repository ${repoFullName} not found or inaccessible via GitHub App.`);
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
