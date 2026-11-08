/**
 * OAuth PKCE Callback Handler Screen for GB Coder.
 *
 * Mounted at /app/auth/callback.
 * Processes the authorization code returned by Supabase Auth, executes
 * exchangeCodeForSession, clears sensitive query parameters, and redirects
 * to the verified safe return-path.
 */
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  exchangeCallbackCode,
  getCurrentSession,
  sanitizeReturnPath,
  signInWithGitHub,
  subscribeToAuthState,
  RETURN_PATH_STORAGE_KEY,
} from '../../services/auth/authService';
import { navigateReplace, PROJECTS_ROUTE } from '../../utils/appRoutes';
import LadeStackLogo from '../LadeStackLogo';

export interface AuthCallbackProps {
  onSuccess?: (returnPath: string) => void;
  onFailure?: (errorMessage: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onFailure }) => {
  const [phase, setPhase] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<string>(PROJECTS_ROUTE);

  useEffect(() => {
    let isCancelled = false;

    const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    const searchParams = url?.searchParams;
    const hashParams = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.hash.replace(/^#/, ''))
      : null;

    const storedReturn =
      typeof window !== 'undefined' && window.sessionStorage
        ? window.sessionStorage.getItem(RETURN_PATH_STORAGE_KEY)
        : null;
    const returnToParam = searchParams?.get('returnTo') || hashParams?.get('returnTo') || storedReturn;
    const safeReturn = sanitizeReturnPath(returnToParam);
    setReturnTarget(safeReturn);

    // Subscribe to auth state updates to recover seamlessly if a delayed PKCE exchange completes
    const unsubscribe = subscribeToAuthState((event, newSession) => {
      if (isCancelled) return;
      if (event === 'SIGNED_IN' && newSession?.user) {
        setPhase('success');
        onSuccess?.(safeReturn);
        setTimeout(() => {
          if (!isCancelled) {
            navigateReplace(safeReturn);
          }
        }, 150);
      }
    });

    const processCallback = async () => {
      if (typeof window === 'undefined') return;

      const errorParam = searchParams?.get('error') || hashParams?.get('error');
      const errorDesc =
        searchParams?.get('error_description') ||
        hashParams?.get('error_description') ||
        searchParams?.get('error_code');

      if (errorParam) {
        const friendlyMessage =
          errorDesc ||
          (errorParam === 'access_denied'
            ? 'Sign in was cancelled or access was denied by GitHub.'
            : `Authentication provider returned: ${errorParam}`);

        if (!isCancelled) {
          setErrorMessage(friendlyMessage);
          setPhase('error');
          onFailure?.(friendlyMessage);
        }
        return;
      }

      const code = searchParams?.get('code') || hashParams?.get('code');

      if (!code) {
        // If there's no code, check if the user already has an active session
        try {
          const current = await getCurrentSession();
          if (current?.user && !isCancelled) {
            setPhase('success');
            onSuccess?.(safeReturn);
            setTimeout(() => {
              if (!isCancelled) {
                navigateReplace(safeReturn);
              }
            }, 100);
            return;
          }
        } catch {
          // Fall through to error
        }

        const msg = 'No authorization code detected in callback URL.';
        if (!isCancelled) {
          setErrorMessage(msg);
          setPhase('error');
          onFailure?.(msg);
        }
        return;
      }

      try {
        const result = await exchangeCallbackCode(code, returnToParam || undefined);
        if (isCancelled) return;

        if (result.error) {
          setErrorMessage(result.error);
          setPhase('error');
          onFailure?.(result.error);
          return;
        }

        setPhase('success');
        const targetPath = sanitizeReturnPath(result.returnPath);
        onSuccess?.(targetPath);

        // Allow microtask tick for state updates, then redirect
        setTimeout(() => {
          if (!isCancelled) {
            navigateReplace(targetPath);
          }
        }, 150);
      } catch (err) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Unexpected failure during code exchange';
          setErrorMessage(msg);
          setPhase('error');
          onFailure?.(msg);
        }
      }
    };

    void processCallback();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [onSuccess, onFailure]);

  const handleRetrySignIn = async () => {
    setPhase('exchanging');
    setErrorMessage(null);
    const result = await signInWithGitHub({ returnPath: returnTarget });
    if (result.error) {
      setErrorMessage(result.error);
      setPhase('error');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-canvas p-4 text-content-primary"
      data-testid="auth-callback-screen"
    >
      <div className="w-full max-w-md rounded-2xl border border-stroke-subtle bg-surface-base p-6 shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          <LadeStackLogo size={32} subtitle="GB Coder" />
        </div>

        {phase === 'exchanging' && (
          <div className="py-8 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
            <h2 className="text-base font-semibold text-content-primary">
              Signing in with GitHub...
            </h2>
            <p className="text-xs text-content-secondary max-w-xs mx-auto">
              Completing secure PKCE verification and establishing your session.
            </p>
          </div>
        )}

        {phase === 'success' && (
          <div className="py-8 space-y-4">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <h2 className="text-base font-semibold text-content-primary">
              Authenticated Successfully
            </h2>
            <p className="text-xs text-content-secondary">
              Redirecting you back to your workspace...
            </p>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-content-primary">
              Authentication Notice
            </h2>
            <p className="text-xs text-content-secondary rounded-lg bg-surface-canvas p-3 border border-stroke-soft font-mono break-words text-left">
              {errorMessage || 'Unable to complete sign-in.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRetrySignIn}
                data-testid="auth-error-retry-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Try Signing In Again
              </button>
              <button
                type="button"
                onClick={() => navigateReplace(PROJECTS_ROUTE)}
                data-testid="auth-error-return-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stroke-subtle bg-surface-panel px-4 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
