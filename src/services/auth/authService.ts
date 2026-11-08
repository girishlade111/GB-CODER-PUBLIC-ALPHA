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
 *
 * Requirements:
 * - Uses the active origin from which login was initiated (window.location.origin).
 * - Stable canonical endpoint (/app/auth/callback) without dynamic query parameters,
 *   guaranteeing exact match against Supabase Auth Redirect URLs allowlist.
 * - Return path is preserved through sessionStorage.
 */
export const getAuthCallbackUrl = (baseOriginOrReturnPath?: string, legacyOrigin?: string): string => {
  let origin = 'https://code.ladestack.in';

  if (typeof window !== 'undefined' && window.location?.origin) {
    origin = window.location.origin;
  }

  if (baseOriginOrReturnPath) {
    if (baseOriginOrReturnPath.startsWith('http://') || baseOriginOrReturnPath.startsWith('https://')) {
      try {
        origin = new URL(baseOriginOrReturnPath).origin;
      } catch {
        // Keep active origin
      }
    } else if (legacyOrigin && (legacyOrigin.startsWith('http://') || legacyOrigin.startsWith('https://'))) {
      try {
        origin = new URL(legacyOrigin).origin;
      } catch {
        // Keep active origin
      }
    }
  }

  const callbackUrl = new URL(AUTH_CALLBACK_PATH, origin);
  return callbackUrl.toString();
};

export interface SignInOptions {
  returnPath?: string;
  redirectTo?: string;
  skipBrowserRedirect?: boolean;
}

/**
 * Initiates GitHub OAuth sign-in using PKCE flow.
 */
export const signInWithGitHub = async (
  options?: SignInOptions
): Promise<{ error: string | null; url?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error:
        'Supabase authentication is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).',
    };
  }

  const returnPath = sanitizeReturnPath(options?.returnPath);

  // Store return path in sessionStorage for retrieval post-redirect
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(RETURN_PATH_STORAGE_KEY, returnPath);
    } catch {
      // Storage unavailable in restricted iframe/private mode
    }
  }

  // Stable callback URL on current origin (localhost in dev, code.ladestack.in in prod)
  const callbackUrl = options?.redirectTo || getAuthCallbackUrl();

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl,
        scopes: GITHUB_OAUTH_SCOPES,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.url) {
      // Pre-flight diagnostic verification on generated OAuth URL
      try {
        const parsedAuthUrl = new URL(data.url);
        const actualRedirectTo = parsedAuthUrl.searchParams.get('redirect_to');
        if (actualRedirectTo) {
          const parsedRedirect = new URL(actualRedirectTo);
          const currentOrigin =
            typeof window !== 'undefined' && window.location?.origin
              ? window.location.origin
              : null;
          if (currentOrigin && parsedRedirect.origin !== currentOrigin) {
            console.warn(
              `[Auth] Warning: OAuth redirect_to origin (${parsedRedirect.origin}) does not match current origin (${currentOrigin})`
            );
          }
        }
      } catch {
        // Safe diagnostics parsing; never leak codes or secrets
      }

      // Navigate to GitHub OAuth provider unless skipBrowserRedirect requested
      if (typeof window !== 'undefined' && !options?.skipBrowserRedirect && window.location) {
        window.location.assign(data.url);
      }

      return { error: null, url: data.url };
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

/**
 * Removes sensitive authentication query and hash parameters from the browser URL
 * using window.history.replaceState to prevent credentials lingering in browser
 * history, logs, or subsequent reloads.
 */
export const cleanCallbackUrlParams = (): void => {
  if (typeof window !== 'undefined' && window.history && window.location) {
    try {
      const url = new URL(window.location.href);
      const paramsToRemove = ['code', 'error', 'error_description', 'error_code', 'state', 'returnTo'];
      let changed = false;
      for (const param of paramsToRemove) {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          changed = true;
        }
      }
      if (window.location.hash) {
        url.hash = '';
        changed = true;
      }
      if (changed) {
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch {
      // Storage/history unavailable in restricted contexts
    }
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
 *
 * Hardened Phase 2.1 Behaviors:
 * - Application-Owned PKCE Exchange (detectSessionInUrl: false in client)
 * - Removes sensitive params from address bar immediately
 * - Deduplicates in-flight executions across React StrictMode remounts
 * - Recovers session if code was already exchanged by prior attempt
 * - Enforces 15-second exchange timeout guard against hung network connections
 */
export const exchangeCallbackCode = async (
  code: string,
  fallbackReturnPath?: string,
  timeoutMs: number = 15000,
): Promise<CallbackExchangeResult> => {
  const sanitizedCode = code.trim();
  const returnPath = sanitizeReturnPath(fallbackReturnPath || consumeStoredReturnPath());

  // Clean URL parameters immediately upon consumption
  cleanCallbackUrlParams();

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
      let isTimedOut = false;
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

      const exchangePromise = (async () => {
        try {
          const { data, error } = await client.auth.exchangeCodeForSession(sanitizedCode);
          if (isTimedOut) {
            console.warn('[AuthService] In-flight authorization code exchange completed after timeout');
            return {
              session: null,
              error: 'Authorization code exchange timed out waiting for server response. Please try signing in again.',
            };
          }

          if (error) {
            // Check if code was already exchanged by an asynchronous attempt
            const lower = error.message.toLowerCase();
            if (
              lower.includes('already been used') ||
              lower.includes('expired') ||
              lower.includes('invalid_grant')
            ) {
              const current = await client.auth.getSession();
              if (current.data.session) {
                completedCodes.add(sanitizedCode);
                return { session: current.data.session, error: null };
              }
              return {
                session: null,
                error: 'The authorization link has expired or has already been used. Please sign in again.',
              };
            }
            return { session: null, error: error.message };
          }
          completedCodes.add(sanitizedCode);
          return { session: data.session, error: null };
        } catch (err) {
          if (isTimedOut) {
            return {
              session: null,
              error: 'Authorization code exchange timed out waiting for server response.',
            };
          }
          const message = err instanceof Error ? err.message : 'Failed to exchange authorization code for session';
          return { session: null, error: message };
        }
      })();

      const timeoutPromise = new Promise<{ session: null; error: string }>((resolve) => {
        timeoutHandle = setTimeout(() => {
          isTimedOut = true;
          resolve({
            session: null,
            error: 'Authorization code exchange timed out after 15 seconds. Please check your connection and try again.',
          });
        }, timeoutMs);
      });

      try {
        const raceResult = await Promise.race([exchangePromise, timeoutPromise]);
        return raceResult;
      } finally {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
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
