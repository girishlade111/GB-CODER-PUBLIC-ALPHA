/**
 * Authentication Service for GB Coder.
 *
 * Implements GitHub OAuth sign-in via Supabase Auth, PKCE code exchange,
 * session lifecycle management, and safe return-path verification.
 *
 * Security Constraints:
 * - Scopes restricted to minimal identity permissions ('read:user user:email').
 *   Never request 'repo', 'workflow', 'admin:org', or write permissions.
 * - PKCE flow enforced.
 * - Open-redirect protection: return-paths strictly validated against approved /app/* routes.
 * - React StrictMode / remount protection: duplicate code exchange attempts are deduplicated.
 * - Local-First Preservation: Sign-out NEVER clears IndexedDB databases, project files,
 *   or separately configured GitHub Personal Access Tokens (PAT).
 */
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

export const RETURN_PATH_STORAGE_KEY = 'gbcoder_auth_return_path_v1';
export const DEFAULT_APP_RETURN_PATH = '/app';
export const AUTH_CALLBACK_PATH = '/app/auth/callback';

/** Minimal OAuth scopes for identity authentication only. */
export const GITHUB_OAUTH_SCOPES = 'read:user user:email';

/** In-flight and completed code exchange tracking to prevent duplicate PKCE exchange in StrictMode. */
const activeCodeExchanges = new Map<string, Promise<{ session: Session | null; error: string | null }>>();
const completedCodes = new Set<string>();

/**
 * Validates and sanitizes a return path to prevent Open Redirect vulnerabilities.
 * Only relative paths starting with '/app' are permitted.
 * Traversal segments ('..'), protocol-relative URLs ('//'), or external schemes are rejected.
 */
export const sanitizeReturnPath = (rawPath?: string | null): string => {
  if (!rawPath || typeof rawPath !== 'string') {
    return DEFAULT_APP_RETURN_PATH;
  }

  const trimmed = rawPath.trim();

  // Reject empty string or protocol-relative URLs
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('\\\\')) {
    return DEFAULT_APP_RETURN_PATH;
  }

  // Reject URLs containing protocol schemes (e.g. https:, javascript:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return DEFAULT_APP_RETURN_PATH;
  }

  // Reject paths containing directory traversal segments
  if (trimmed.includes('..') || trimmed.includes('\\')) {
    return DEFAULT_APP_RETURN_PATH;
  }

  // Require path to start with /app
  if (!trimmed.startsWith('/app')) {
    return DEFAULT_APP_RETURN_PATH;
  }

  return trimmed;
};

/**
 * Determines the OAuth callback URL for redirecting from Supabase back to GB Coder.
 */
export const getAuthCallbackUrl = (returnPath?: string, baseOrigin?: string): string => {
  const origin =
    baseOrigin ||
    (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://code.ladestack.in');

  const callbackUrl = new URL(AUTH_CALLBACK_PATH, origin);

  const safeReturn = sanitizeReturnPath(returnPath);
  if (safeReturn && safeReturn !== DEFAULT_APP_RETURN_PATH) {
    callbackUrl.searchParams.set('returnTo', safeReturn);
  }

  if (typeof window === 'undefined' && !baseOrigin) {
    return `${callbackUrl.pathname}${callbackUrl.search}`;
  }

  return callbackUrl.toString();
};

export interface SignInOptions {
  returnPath?: string;
  redirectTo?: string;
}

/**
 * Initiates GitHub OAuth sign-in using PKCE flow.
 */
export const signInWithGitHub = async (options?: SignInOptions): Promise<{ error: string | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: 'Supabase authentication is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const returnPath = sanitizeReturnPath(options?.returnPath);

  // Store return path in sessionStorage for retrieval post-redirect
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(RETURN_PATH_STORAGE_KEY, returnPath);
    } catch {
      // Storage unavailable in restricted iframe/private mode; URL query param will serve as fallback
    }
  }

  const callbackUrl = options?.redirectTo || getAuthCallbackUrl(returnPath);

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl,
        scopes: GITHUB_OAUTH_SCOPES,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected failure initiating GitHub sign-in';
    return { error: message };
  }
};

/**
 * Reads and clears the stored return path from sessionStorage.
 */
export const consumeStoredReturnPath = (): string => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return DEFAULT_APP_RETURN_PATH;
  }

  try {
    const stored = window.sessionStorage.getItem(RETURN_PATH_STORAGE_KEY);
    window.sessionStorage.removeItem(RETURN_PATH_STORAGE_KEY);
    return sanitizeReturnPath(stored);
  } catch {
    return DEFAULT_APP_RETURN_PATH;
  }
};

export interface CallbackExchangeResult {
  session: Session | null;
  error: string | null;
  returnPath: string;
}

/**
 * Exchanges PKCE authorization code for a Supabase session.
 * Deduplicates concurrent or re-mounted calls for the same code.
 */
export const exchangeCallbackCode = async (code: string, fallbackReturnPath?: string): Promise<CallbackExchangeResult> => {
  const sanitizedCode = code.trim();
  const returnPath = sanitizeReturnPath(fallbackReturnPath || consumeStoredReturnPath());

  if (!sanitizedCode) {
    return {
      session: null,
      error: 'Authorization code missing in callback request.',
      returnPath,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      session: null,
      error: 'Supabase authentication is not configured.',
      returnPath,
    };
  }

  // Prevent re-exchange if this code was already processed in this runtime
  if (completedCodes.has(sanitizedCode)) {
    const sessionRes = await client.auth.getSession();
    return {
      session: sessionRes.data.session,
      error: null,
      returnPath,
    };
  }

  // Deduplicate in-flight exchange (e.g. React 18 StrictMode double-mount)
  let pendingPromise = activeCodeExchanges.get(sanitizedCode);

  if (!pendingPromise) {
    pendingPromise = (async () => {
      try {
        const { data, error } = await client.auth.exchangeCodeForSession(sanitizedCode);
        if (error) {
          return { session: null, error: error.message };
        }
        completedCodes.add(sanitizedCode);
        return { session: data.session, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to exchange authorization code for session';
        return { session: null, error: message };
      } finally {
        activeCodeExchanges.delete(sanitizedCode);
      }
    })();

    activeCodeExchanges.set(sanitizedCode, pendingPromise);
  }

  const result = await pendingPromise;
  return {
    ...result,
    returnPath,
  };
};

/**
 * Retrieves the current authenticated session.
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  } catch {
    return null;
  }
};

/**
 * Retrieves the current authenticated user.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
};

/**
 * Signs the user out of GB Coder's Supabase session.
 *
 * CRITICAL LOCAL-FIRST GUARANTEE:
 * Does NOT clear IndexedDB databases, does NOT delete project records or files,
 * and does NOT clear separately stored PAT credentials.
 */
export const signOutUser = async (): Promise<{ error: string | null }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { error: null };
  }

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-out operation failed';
    return { error: message };
  }
};

export type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

/**
 * Subscribes to Supabase authentication state changes.
 * Returns an unsubscribe callback for clean component unmounting.
 */
export const subscribeToAuthState = (callback: AuthStateChangeCallback): (() => void) => {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(callback);

  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Helper to reset in-memory code exchange tracking (for testing purposes).
 */
export const _resetCodeExchangeState = (): void => {
  activeCodeExchanges.clear();
  completedCodes.clear();
};
