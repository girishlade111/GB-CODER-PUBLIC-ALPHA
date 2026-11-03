/**
 * User Profile Service for GB Coder.
 *
 * Interacts with public.profiles table in Supabase.
 * Respects Row Level Security (RLS) constraints:
 * - Users can only select and mutate their own profile records (auth.uid() = id).
 * - GitHub provider metadata is mapped into profile fields.
 * - Profile creation is idempotent: duplicate insertions are handled safely.
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

    return (data as UserProfile) || null;
  } catch (err) {
    console.warn('[ProfileService] getProfile exception:', err);
    return null;
  }
};

/**
 * Idempotently fetches an existing profile or creates one if it does not yet exist.
 * Fallbacks to an in-memory profile if database is unreachable so that the user's
 * session remains usable without interruption.
 */
export const getOrCreateProfile = async (user: User): Promise<UserProfile> => {
  const fallback = mapUserToProfileFields(user) as UserProfile;

  const client = getSupabaseClient();
  if (!client) {
    return fallback;
  }

  try {
    // 1. Try to read existing profile
    const existing = await getProfile(user.id);
    if (existing) {
      return existing;
    }

    // 2. Insert new profile record
    const newRecord = {
      id: user.id,
      display_name: fallback.display_name,
      avatar_url: fallback.avatar_url,
      github_username: fallback.github_username,
      email: fallback.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('profiles')
      .upsert(newRecord, { onConflict: 'id' })
      .select('id, display_name, avatar_url, github_username, email, created_at, updated_at')
      .single();

    if (error) {
      console.warn('[ProfileService] upsert notice (using in-memory fallback):', error.message);
      return fallback;
    }

    return (data as UserProfile) || fallback;
  } catch (err) {
    console.warn('[ProfileService] getOrCreateProfile exception (using in-memory fallback):', err);
    return fallback;
  }
};

export interface UpdateProfileInput {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Updates editable profile fields for the authenticated user.
 */
export const updateProfile = async (
  userId: string,
  updates: UpdateProfileInput,
): Promise<{ profile: UserProfile | null; error: string | null }> => {
  const client = getSupabaseClient();
  if (!client || !userId) {
    return { profile: null, error: 'Database client or user ID unavailable' };
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof updates.display_name === 'string') {
    payload.display_name = updates.display_name.trim();
  }
  if (typeof updates.avatar_url === 'string') {
    payload.avatar_url = updates.avatar_url.trim();
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

    return { profile: data as UserProfile, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user profile';
    return { profile: null, error: message };
  }
};
