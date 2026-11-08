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
  publishableKey: string | null;
  anonKey: string | null;
  isConfigured: boolean;
}

export const SUPABASE_AUTH_STORAGE_KEY = 'gbcoder_supabase_auth_v1';

/**
 * Default Supabase Auth client options enforced by GB Coder.
 *
 * Architecture Decision — Option B: Application-Owned PKCE Exchange:
 * - detectSessionInUrl is set to false to prevent the Supabase client from
 *   automatically intercepting and consuming the authorization code during
 *   initialization. This eliminates race conditions and double-exchange errors
 *   between the SDK and the /app/auth/callback handler.
 * - persistSession & autoRefreshToken remain true so authenticated sessions
 *   survive browser reloads and tokens rotate automatically.
 */
export const SUPABASE_AUTH_OPTIONS = {
  flowType: 'pkce' as const,
  detectSessionInUrl: false,
  persistSession: true,
  autoRefreshToken: true,
  storageKey: SUPABASE_AUTH_STORAGE_KEY,
};

let cachedClient: SupabaseClient | null = null;
let mockClientOverride: SupabaseClient | null = null;

const PLACEHOLDER_PREFIXES = ['your_', 'placeholder', 'dummy', 'change_me', '<'];

/**
 * Detects if a key appears to be a sensitive service_role or secret key.
 * Service role and secret keys bypass Row Level Security and must NEVER be exposed or used in the client.
 */
export const isServiceRoleOrSecretKey = (val: unknown): boolean => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.includes('service_role') ||
    lower.includes('secret') ||
    lower.startsWith('sb_secret') ||
    lower.startsWith('sbs_')
  ) {
    return true;
  }

  try {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson =
        typeof atob === 'function'
          ? atob(payloadBase64)
          : typeof Buffer !== 'undefined'
          ? Buffer.from(payloadBase64, 'base64').toString('utf8')
          : '';
      if (decodedJson) {
        const payload = JSON.parse(decodedJson);
        if (payload && (payload.role === 'service_role' || payload.role === 'supabase_admin')) {
          return true;
        }
      }
    }
  } catch {
    // Non-JWT string, ignored
  }

  return false;
};

/**
 * Validates whether a configuration string is a genuine value rather than an
 * unreplaced placeholder, service_role/secret key, or empty string.
 */
export const isValidConfigValue = (val: unknown): val is string => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (isServiceRoleOrSecretKey(trimmed)) return false;
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
 * Supports VITE_SUPABASE_URL and official modern VITE_SUPABASE_PUBLISHABLE_KEY.
 * Maintains backward compatibility with legacy VITE_SUPABASE_ANON_KEY.
 * Strictly prevents exposure of service_role or secret keys.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const env: Record<string, string | undefined> =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as unknown as Record<string, string | undefined>)
      : {};

  const url = env.VITE_SUPABASE_URL?.trim() || null;

  // Prefer official publishable key; fall back to anon key for backward compatibility
  const rawPublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || null;
  const rawAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim() || null;

  const resolvedKey =
    (isValidConfigValue(rawPublishableKey) ? rawPublishableKey : null) ||
    (isValidConfigValue(rawAnonKey) ? rawAnonKey : null) ||
    rawPublishableKey ||
    rawAnonKey ||
    null;

  const isConfigured = isValidHttpUrl(url) && isValidConfigValue(resolvedKey);

  return {
    url: isConfigured ? url : null,
    publishableKey: isConfigured ? resolvedKey : null,
    anonKey: isConfigured ? resolvedKey : null,
    isConfigured,
  };
};

/**
 * True when valid Supabase URL and public publishable/anon key are present.
 */
export const isSupabaseConfigured = (): boolean => {
  if (mockClientOverride) return true;
  return getSupabaseConfig().isConfigured;
};

/**
 * Returns the singleton Supabase client instance, or null if configuration is absent.
 * Uses the official Supabase publishable key with createClient().
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (mockClientOverride) {
    return mockClientOverride;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const { url, publishableKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured || !url || !publishableKey) {
    return null;
  }

  cachedClient = createClient(url, publishableKey, {
    auth: SUPABASE_AUTH_OPTIONS,
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
