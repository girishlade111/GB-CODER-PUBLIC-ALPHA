/**
 * Universal User Account Menu & Sign-In Trigger for GB Coder.
 *
 * Integrates into NavigationBar (Classic Editor), ProjectDashboard header,
 * and WorkbenchTitleBar (VS Code Mode).
 *
 * Features:
 * - Guest mode: "Sign in with GitHub" button with minimal OAuth permissions.
 * - Authenticated mode: User avatar, account dropdown, profile modal trigger,
 *   device storage semantics, and sign-out.
 * - Accessibility: Keyboard navigation, click outside, ESC key dismiss, ARIA states.
 * - Design System: Zero emoji, pure Lucide icons, strict contrast, no external slop.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Github,
  User,
  LogOut,
  HardDrive,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import UserProfileModal from './UserProfileModal';
import toast from 'react-hot-toast';

export interface UserAccountMenuProps {
  compact?: boolean;
  returnPath?: string;
  className?: string;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  compact = false,
  returnPath,
  className = '',
}) => {
  const {
    status,
    user,
    profile,
    isConfigured,
    isProfilePersistent,
    repairProfile,
    signInWithGitHub,
    signOut,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSignIn = async () => {
    const path = returnPath || (typeof window !== 'undefined' ? window.location.pathname : '/app');
    const res = await signInWithGitHub(path);
    if (res.error) {
      toast.error(res.error);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    const res = await signOut();
    if (res.error) {
      toast.error(`Sign out notice: ${res.error}`);
    } else {
      toast.success('Signed out. Local projects remain saved on this device.');
    }
  };

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      await repairProfile();
      toast.success('Profile synchronization refreshed.');
    } catch {
      toast.error('Unable to refresh profile sync.');
    } finally {
      setIsRepairing(false);
    }
  };

  // 1. Initializing / Authenticating state
  if (status === 'initializing' || status === 'authenticating') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          disabled
          aria-label="Loading authentication status"
          className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs font-medium text-content-muted opacity-75 cursor-wait"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {!compact && <span>{status === 'authenticating' ? 'Signing in...' : 'Checking auth...'}</span>}
        </button>
      </div>
    );
  }

  // 2. Guest Mode: Render "Sign in with GitHub"
  if (status === 'guest' || !user) {
    return (
      <div className={`relative ${className}`} data-testid="guest-auth-container">
        <button
          type="button"
          onClick={handleSignIn}
          title={isConfigured ? 'Sign in with GitHub' : 'Sign in (Supabase configuration pending)'}
          aria-label="Sign in with GitHub"
          data-testid="github-signin-btn"
          className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs font-medium text-content-primary transition-colors hover:bg-surface-hover hover:border-stroke focus:outline-none focus:ring-1 focus:ring-accent active:bg-surface-strong"
        >
          <Github className="h-3.5 w-3.5 text-content-secondary shrink-0" />
          {!compact && <span>Sign in with GitHub</span>}
        </button>
      </div>
    );
  }

  // 3. Authenticated State: User Avatar & Dropdown Menu
  const username = profile?.github_username || (user.user_metadata?.user_name as string) || 'github-user';
  const displayName = profile?.display_name || (user.user_metadata?.full_name as string) || username;
  const avatarUrl = profile?.avatar_url || (user.user_metadata?.avatar_url as string);
  const email = profile?.email || user.email;

  return (
    <div className={`relative ${className}`} ref={menuRef} data-testid="user-account-menu">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Account menu for ${displayName}`}
        data-testid="account-dropdown-trigger"
        className="inline-flex items-center gap-1.5 rounded-xl border border-stroke-subtle bg-surface-base px-2 py-1 text-xs font-medium text-content-primary transition-colors hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="h-5 w-5 rounded-full border border-stroke object-cover shrink-0"
          />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg shrink-0">
            {username.slice(0, 1).toUpperCase()}
          </div>
        )}

        {!compact && (
          <span className="max-w-[120px] truncate text-xs font-medium text-content-primary">
            {displayName}
          </span>
        )}

        <ChevronDown className={`h-3 w-3 text-content-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          data-testid="account-dropdown-panel"
          className="absolute right-0 mt-1.5 w-72 origin-top-right rounded-2xl border border-stroke bg-surface-base p-2 shadow-2xl z-50 animate-slide-down text-left"
        >
          {/* User Overview */}
          <div className="rounded-xl border border-stroke-soft bg-surface-canvas p-3 mb-1">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-10 w-10 rounded-full border border-stroke object-cover shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-fg shrink-0">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-content-primary truncate">{displayName}</div>
                <div className="text-[11px] font-mono text-content-muted truncate">@{username}</div>
                {email && <div className="text-[10px] text-content-muted truncate">{email}</div>}
              </div>
            </div>

            {/* Profile DB Sync State */}
            <div className="mt-2.5 pt-2 border-t border-stroke-subtle flex items-center justify-between text-[11px]">
              {isProfilePersistent ? (
                <span className="inline-flex items-center gap-1.5 text-success font-medium" data-testid="profile-synced-badge">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Profile Synced</span>
                </span>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium truncate" data-testid="profile-local-badge" title="Database profile row missing; local session active">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Local Only / Pending Sync</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRepair}
                    disabled={isRepairing}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRepairing ? 'animate-spin' : ''}`} />
                    Sync DB
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Local-First Storage Notice */}
          <div className="px-3 py-2 text-[11px] text-content-secondary border-b border-stroke-soft mb-1 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-content-primary">
              <HardDrive className="h-3.5 w-3.5 text-accent" />
              <span>Projects stored on this device</span>
            </div>
            <p className="text-[10.5px] text-content-muted leading-tight">
              Files remain in your browser IndexedDB database. Authentication does not upload your code.
            </p>
          </div>

          {/* Menu Actions */}
          <div className="space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              data-testid="account-profile-btn"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-hover transition-colors"
            >
              <User className="h-4 w-4 text-content-secondary" />
              <span>Account & Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              data-testid="account-signout-btn"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-danger hover:bg-danger-subtle transition-colors"
            >
              <LogOut className="h-4 w-4 text-danger" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default UserAccountMenu;
