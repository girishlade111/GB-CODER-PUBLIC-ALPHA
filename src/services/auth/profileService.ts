/**
 * User Profile Service for GB Coder.
 *
 * Interacts with public.profiles table in Supabase.
 * Respects Row Level Security (RLS) constraints:
 * - Users can only select and mutate their own profile records (auth.uid() = id).
 * - GitHub provider metadata is mapped into profile fields.
 * - Profile creation is idempotent: duplicate insertions are handled safely.
 * - Column INSERT and UPDATE privileges are strictly limited to user-editable fields
 *   (display_name, avatar_url).
 * - Provider metadata (github_username, email) and timestamps (created_at, updated_at)
 *   are managed server-side by database triggers and cannot be forged by clients.
 * - Tracks persistence status (is_persistent, sync_error) so UI does not mask DB failures.
 */
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
  /** True when the profile row is verified in Supabase PostgreSQL; false when using in-memory fallback. */
  is_persistent?: boolean;
  /** Human-readable explanation if database sync/persistence encountered an error. */
  sync_error?: string | null;
}

/**
 * Maps Supabase User and OAuth metadata into a normalized profile structure.
 */
export const mapUserToProfileFields = (user: User): Omit<UserProfile, 'created_at' | 'updated_at'> => {
  const metadata = user.user_metadata || {};

  const github_username =
    (metadata.user_name as string | undefined)?.trim() ||
    (metadata.preferred_username as string | undefined)?.trim() ||
    null;

  const display_name =
    (metadata.full_name as string | undefined)?.trim() ||
    (metadata.name as string | undefined)?.trim() ||
    github_username ||
    (user.email ? user.email.split('@')[0] : 'GB Coder User');

  const avatar_url =
    (metadata.avatar_url as string | undefined)?.trim() ||
    (metadata.picture as string | undefined)?.trim() ||
    null;

  const email = user.email?.trim() || null;

  return {
    id: user.id,
    display_name,
    avatar_url,
    github_username,
    email,
    is_persistent: false,
    sync_error: null,
  };
};

/**
 * Fetches the user profile from public.profiles table for the given user ID.
 */
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const client = getSupabaseClient();
  if (!client || !userId) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('id, display_name, avatar_url, github_username, email, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[ProfileService] getProfile notice:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      ...(data as UserProfile),
      is_persistent: true,
      sync_error: null,
    };
  } catch (err) {
    console.warn('[ProfileService] getProfile exception:', err);
    return null;
  }
};

/**
 * Idempotently fetches an existing profile or creates one if it does not yet exist.
 * Fallbacks to an in-memory profile if database is unreachable so that the user's
 * session remains usable without interruption, while honestly reporting is_persistent: false.
 *
 * Security constraint: Only inserts user-editable columns (id, display_name, avatar_url).
 * Provider identity (github_username, email) and timestamps are set by database triggers.
 */
export const getOrCreateProfile = async (user: User): Promise<UserProfile> => {
  const fallback: UserProfile = {
    ...mapUserToProfileFields(user),
    is_persistent: false,
    sync_error: null,
  };

  const client = getSupabaseClient();
  if (!client) {
    return {
      ...fallback,
      sync_error: 'Supabase client is not configured',
    };
  }

  try {
    // 1. Try to read existing verified profile from database
    const existing = await getProfile(user.id);
    if (existing) {
      return existing;
    }

    // 2. Insert new profile record idempotently with safe client columns only
    const newRecord: { id: string; display_name: string | null; avatar_url: string | null } = {
      id: user.id,
      display_name: fallback.display_name,
      avatar_url: fallback.avatar_url,
    };

    const { data, error } = await client
      .from('profiles')
      .upsert(newRecord, { onConflict: 'id', ignoreDuplicates: true })
      .select('id, display_name, avatar_url, github_username, email, created_at, updated_at')
      .single();

    if (error) {
      // If concurrent insert occurred or upsert returned empty, attempt one final read
      const retryExisting = await getProfile(user.id);
      if (retryExisting) {
        return retryExisting;
      }
      console.warn('[ProfileService] upsert notice (using in-memory fallback):', error.message);
      return {
        ...fallback,
        is_persistent: false,
        sync_error: error.message,
      };
    }

    if (data) {
      return {
        ...(data as UserProfile),
        is_persistent: true,
        sync_error: null,
      };
    }

    return fallback;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[ProfileService] getOrCreateProfile exception (using in-memory fallback):', errorMsg);
    return {
      ...fallback,
      is_persistent: false,
      sync_error: errorMsg,
    };
  }
};

/**
 * Actively repairs a missing profile in public.profiles using server-side RPC
 * (repair_my_profile) or direct insert, ensuring accurate database persistence.
 */
export const repairProfile = async (user: User): Promise<UserProfile> => {
  const fallback: UserProfile = {
    ...mapUserToProfileFields(user),
    is_persistent: false,
    sync_error: null,
  };

  const client = getSupabaseClient();
  if (!client) {
    return { ...fallback, sync_error: 'Supabase client is not configured' };
  }

  try {
    // 1. First check if it already exists
    const existing = await getProfile(user.id);
    if (existing) {
      return existing;
    }

    // 2. Try the SECURITY DEFINER repair_my_profile RPC
    if (typeof (client as unknown as { rpc?: unknown }).rpc === 'function') {
      try {
        const { data: rpcData, error: rpcError } = await client.rpc('repair_my_profile');
        if (!rpcError && rpcData) {
          return {
            ...(rpcData as UserProfile),
            is_persistent: true,
            sync_error: null,
          };
        }
      } catch {
        // RPC might not exist on older DB revisions; proceed to direct insert
      }
    }

    // 3. Fall back to standard getOrCreateProfile upsert
    return await getOrCreateProfile(user);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ...fallback,
      is_persistent: false,
      sync_error: errorMsg,
    };
  }
};

export interface UpdateProfileInput {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Updates editable profile fields for the authenticated user.
 * Strictly restricts mutations to display_name and avatar_url.
 * updated_at timestamp is managed exclusively by the database trigger.
 */
export const updateProfile = async (
  userId: string,
  updates: UpdateProfileInput,
): Promise<{ profile: UserProfile | null; error: string | null }> => {
  const client = getSupabaseClient();
  if (!client || !userId) {
    return { profile: null, error: 'Database client or user ID unavailable' };
  }

  const payload: Record<string, string | null> = {};

  if (typeof updates.display_name === 'string') {
    payload.display_name = updates.display_name.trim();
  }
  if (typeof updates.avatar_url === 'string') {
    payload.avatar_url = updates.avatar_url.trim();
  }

  if (Object.keys(payload).length === 0) {
    const current = await getProfile(userId);
    return { profile: current, error: null };
  }

  try {
    const { data, error } = await client
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('id, display_name, avatar_url, github_username, email, created_at, updated_at')
      .single();

    if (error) {
      return { profile: null, error: error.message };
    }

    return {
      profile: {
        ...(data as UserProfile),
        is_persistent: true,
        sync_error: null,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user profile';
    return { profile: null, error: message };
  }
};
