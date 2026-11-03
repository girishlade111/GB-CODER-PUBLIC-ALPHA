/**
 * Supabase Client Initialization and Configuration for GB Coder.
 *
 * Provides a hardened singleton client instance for Supabase Authentication
 * and PostgreSQL database interactions.
 *
 * Security Constraints:
 * - Public/publishable key only. Never expose SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.
 * - Graceful fallback when configuration is absent or invalid (Guest Mode continues).
 * - PKCE authentication flow enforced.
 * - Single client instance across application runtime.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
  isConfigured: boolean;
}

let cachedClient: SupabaseClient | null = null;
let mockClientOverride: SupabaseClient | null = null;

const PLACEHOLDER_PREFIXES = ['your_', 'placeholder', 'dummy', 'change_me', '<'];

/**
 * Validates whether a configuration string is a genuine value rather than an
 * unreplaced placeholder or empty string.
 */
export const isValidConfigValue = (val: unknown): val is string => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return !PLACEHOLDER_PREFIXES.some((prefix) => lower.startsWith(prefix));
};

/**
 * Validates whether a URL is a syntactically valid HTTP/HTTPS endpoint.
 */
export const isValidHttpUrl = (val: unknown): boolean => {
  if (!isValidConfigValue(val)) return false;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Reads public client configuration from Vite environment variables.
 * Supports both VITE_SUPABASE_ANON_KEY and VITE_SUPABASE_PUBLISHABLE_KEY.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const env: Record<string, string | undefined> =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as unknown as Record<string, string | undefined>)
      : {};

  const url = env.VITE_SUPABASE_URL?.trim() || null;
  const anonKey =
    env.VITE_SUPABASE_ANON_KEY?.trim() ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    null;

  const isConfigured = isValidHttpUrl(url) && isValidConfigValue(anonKey);

  return {
    url: isConfigured ? url : null,
    anonKey: isConfigured ? anonKey : null,
    isConfigured,
  };
};

/**
 * True when valid Supabase URL and public anon/publishable key are present.
 */
export const isSupabaseConfigured = (): boolean => {
  if (mockClientOverride) return true;
  return getSupabaseConfig().isConfigured;
};

/**
 * Returns the singleton Supabase client instance, or null if configuration is absent.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (mockClientOverride) {
    return mockClientOverride;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'gbcoder_supabase_auth_v1',
    },
  });

  return cachedClient;
};

/**
 * Test helper: injects a mock SupabaseClient or null to reset.
 * Strictly for automated testing; never used in production.
 */
export const _setMockSupabaseClient = (client: SupabaseClient | null): void => {
  mockClientOverride = client;
};

/**
 * Reset cached singleton instance (useful during testing or runtime config reload).
 */
export const _resetSupabaseClient = (): void => {
  cachedClient = null;
  mockClientOverride = null;
};
