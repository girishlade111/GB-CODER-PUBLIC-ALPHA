/**
 * Centralized Authentication Context & State Management for GB Coder.
 *
 * Coordinates session lifecycle, user profiles, guest mode continuity,
 * and authentication state changes.
 *
 * Hardened Phase 2.1 & 2.2 Behaviors:
 * - Purely synchronous onAuthStateChange handler (eliminates async/await deadlock risks).
 * - Race-condition and stale-profile prevention via request ID tokens.
 * - Profile fetching isolated into a dedicated lifecycle effect keyed strictly to userId
 *   (eliminates redundant PostgREST calls on token refresh or re-render).
 * - Immediate profile teardown on sign-out to prevent stale user profile leaks.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getCurrentSession,
  signInWithGitHub as authSignInWithGitHub,
  signOutUser as authSignOutUser,
  subscribeToAuthState,
} from '../../services/auth/authService';
import {
  getOrCreateProfile,
  updateProfile as apiUpdateProfile,
  UserProfile,
  UpdateProfileInput,
} from '../../services/auth/profileService';
import { isSupabaseConfigured } from '../../services/auth/supabaseClient';

export type AuthStatus =
  | 'initializing'
  | 'guest'
  | 'authenticating'
  | 'authenticated'
  | 'refreshing'
  | 'error'
  | 'temporarily_unavailable';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isConfigured: boolean;
  error: string | null;
  signInWithGitHub: (returnPath?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfileInput) => Promise<{ profile: UserProfile | null; error: string | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileRequestIdRef = useRef<number>(0);
  const userRef = useRef<User | null>(user);
  userRef.current = user;

  const configured = useMemo(() => isSupabaseConfigured(), []);
  const userId = user?.id;

  // Initialize session and restore authentication
  useEffect(() => {
    let isCancelled = false;

    if (!configured) {
      setStatus('guest');
      return;
    }

    const initAuth = async () => {
      try {
        const initialSession = await getCurrentSession();
        if (isCancelled) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          setStatus('authenticated');
        } else {
          setStatus('guest');
        }
      } catch (initErr) {
        if (!isCancelled) {
          console.warn('[AuthProvider] Auth session initialization failed (degraded to guest):', initErr);
          setStatus('guest');
        }
      }
    };

    void initAuth();

    // Subscribe to auth state updates.
    // CRITICAL: Callback is PURELY SYNCHRONOUS to prevent Supabase GoTrue lock deadlocks.
    const unsubscribe = subscribeToAuthState((event, newSession) => {
      if (isCancelled) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setStatus('authenticated');
          setError(null);
        } else {
          profileRequestIdRef.current += 1;
          setSession(null);
          setUser(null);
          setProfile(null);
          setStatus('guest');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        if (newSession) {
          setSession(newSession);
          if (newSession.user) {
            setUser(newSession.user);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        profileRequestIdRef.current += 1;
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus('guest');
        setError(null);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [configured]);

  // Dedicated effect for asynchronous user profile fetching with request token cancellation.
  // Keyed strictly to userId so token refreshes and shallow user clones do NOT re-trigger
  // redundant PostgREST queries.
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const currentUser = userRef.current;
    if (!currentUser) return;

    const currentReqId = ++profileRequestIdRef.current;
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        const userProfile = await getOrCreateProfile(currentUser);
        if (!isCancelled && profileRequestIdRef.current === currentReqId) {
          setProfile(userProfile);
        }
      } catch (profileErr) {
        if (!isCancelled && profileRequestIdRef.current === currentReqId) {
          console.warn('[AuthProvider] Profile load deferred:', profileErr);
        }
      }
    };

    void fetchProfile();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const signInWithGitHub = useCallback(
    async (returnPath?: string): Promise<{ error: string | null }> => {
      setError(null);
      if (!configured) {
        const msg = 'Authentication service is not configured. Please supply Supabase environment variables.';
        setError(msg);
        return { error: msg };
      }

      setStatus('authenticating');
      const result = await authSignInWithGitHub({ returnPath });

      if (result.error) {
        setError(result.error);
        setStatus(user ? 'authenticated' : 'guest');
        return { error: result.error };
      }

      return { error: null };
    },
    [configured, user],
  );

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    setError(null);
    profileRequestIdRef.current += 1;
    setSession(null);
    setUser(null);
    setProfile(null);
    setStatus('guest');

    try {
      const result = await authSignOutUser();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setError(msg);
      return { error: msg };
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    const currentReqId = ++profileRequestIdRef.current;
    try {
      const refreshed = await getOrCreateProfile(currentUser);
      if (profileRequestIdRef.current === currentReqId) {
        setProfile(refreshed);
      }
    } catch (err) {
      console.warn('[AuthProvider] Failed to refresh profile:', err);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateProfileInput): Promise<{ profile: UserProfile | null; error: string | null }> => {
      if (!user) {
        return { profile: null, error: 'Cannot update profile: not signed in' };
      }

      const result = await apiUpdateProfile(user.id, updates);
      if (result.profile) {
        setProfile(result.profile);
      }
      return result;
    },
    [user],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      session,
      isConfigured: configured,
      error,
      signInWithGitHub,
      signOut,
      refreshProfile,
      updateProfile,
      clearError,
    }),
    [
      status,
      user,
      profile,
      session,
      configured,
      error,
      signInWithGitHub,
      signOut,
      refreshProfile,
      updateProfile,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
