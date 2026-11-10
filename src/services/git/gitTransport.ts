/**
 * Git Transport Interface and Implementations for GB Coder Phase 5.
 *
 * Supports two distinct transport strategies:
 * 1. PERSONAL_ACCESS_TOKEN: Direct client-to-GitHub REST calls using client-held PAT.
 * 2. GITHUB_APP: Server-mediated requests through Supabase Edge Function git proxy.
 *
 * Zero emoji rule strictly enforced.
 */

import { getSupabaseClient } from '../auth/supabaseClient';
import { readCredential } from '../credentialStore';
import { getGitHubAppStatus } from './gitGitHubAppService';

export type GitTransportMode = 'GITHUB_APP' | 'PERSONAL_ACCESS_TOKEN' | 'NONE';

export interface GitHubApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export interface GitTransport {
  mode: GitTransportMode;
  request<T = unknown>(
    path: string,
    options?: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
  ): Promise<T>;
}

/**
 * Personal Access Token Direct Client Transport
 * Makes direct requests to api.github.com using user-supplied PAT.
 */
export class PatTransport implements GitTransport {
  readonly mode: GitTransportMode = 'PERSONAL_ACCESS_TOKEN';
  private token: string;

  constructor(token: string) {
    this.token = token.trim();
  }

  async request<T = unknown>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {},
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, signal } = options;
    const url = path.startsWith('https://') ? path : `https://api.github.com${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'GB-Coder-IDE',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      cache: 'no-store',
      signal: signal || AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `GitHub request failed (${res.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.message) errMsg = `${errMsg}: ${parsed.message}`;
      } catch {
        if (errText) errMsg = `${errMsg}: ${errText}`;
      }
      const error = new Error(errMsg);
      (error as unknown as { status: number }).status = res.status;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }
}

/**
 * GitHub App Server-Mediated Transport
 * Proxies requests through Supabase Edge Function to prevent token exposure in client.
 */
export class GitHubAppTransport implements GitTransport {
  readonly mode: GitTransportMode = 'GITHUB_APP';
  private proxyBaseUrl: string;

  constructor(proxyBaseUrl?: string) {
    const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
    this.proxyBaseUrl = proxyBaseUrl || `${supabaseUrl}/functions/v1/github-app-git-proxy`;
  }

  async request<T = unknown>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {},
  ): Promise<T> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized for GitHub App transport');
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated with Supabase. Please sign in.');
    }

    const { method = 'GET', body, headers = {}, signal } = options;

    // Clean leading host if path is absolute URL
    let relativePath = path;
    if (path.startsWith('https://api.github.com')) {
      relativePath = path.replace('https://api.github.com', '');
    }

    const proxyUrl = new URL(this.proxyBaseUrl);
    proxyUrl.searchParams.set('path', relativePath);

    const res = await fetch(proxyUrl.toString(), {
      method,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${session.access_token}`,
        'User-Agent': 'GB-Coder-IDE',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      cache: 'no-store',
      signal: signal || AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `GitHub App proxy request failed (${res.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.message) errMsg = `${errMsg}: ${parsed.message}`;
        else if (parsed.error) errMsg = `${errMsg}: ${parsed.error}`;
      } catch {
        if (errText) errMsg = `${errMsg}: ${errText}`;
      }
      const error = new Error(errMsg);
      (error as unknown as { status: number }).status = res.status;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }
}

/**
 * Factory resolving the active Git transport for a project or general operation.
 * Prioritizes active GitHub App connection when available, with explicit PAT fallback.
 */
export const resolveGitTransport = async (
  options?: {
    explicitToken?: string;
    preferPat?: boolean;
  },
): Promise<GitTransport> => {
  // 1. Explicit token supplied (e.g. from dialog or specific config)
  if (options?.explicitToken) {
    return new PatTransport(options.explicitToken);
  }

  // 2. If user did not explicitly prefer PAT, check if GitHub App is connected
  if (!options?.preferPat) {
    try {
      const appStatus = await getGitHubAppStatus();
      if (appStatus.isConnected && !appStatus.isExpired) {
        return new GitHubAppTransport();
      }
    } catch {
      // Ignore app status check error and fallback to PAT
    }
  }

  // 3. Fallback to stored PAT in credential store
  const storedPat = await readCredential('github');
  if (storedPat) {
    return new PatTransport(storedPat);
  }

  throw new Error('No GitHub credentials available. Connect via GitHub App or provide a Personal Access Token.');
};

/**
 * Synchronous transport factory for direct instantiation with given options.
 */
export const createGitTransport = (options?: { token?: string }): GitTransport => {
  if (options?.token) {
    return new PatTransport(options.token);
  }
  return new GitHubAppTransport();
};
