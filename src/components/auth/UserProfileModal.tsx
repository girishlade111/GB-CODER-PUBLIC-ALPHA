/**
 * User Profile & Account Settings Modal for GB Coder.
 *
 * Displays authenticated user information, identity details, device storage
 * explanation, and allows updating the profile display name.
 */
import React, { useState, useEffect } from 'react';
import { X, User, Github, Mail, HardDrive, Shield, Check, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import toast from 'react-hot-toast';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayNameInput(profile.display_name);
    } else if (user?.user_metadata?.full_name) {
      setDisplayNameInput(user.user_metadata.full_name as string);
    }
  }, [profile, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({ display_name: displayNameInput.trim() });
      if (res.error) {
        toast.error(`Update notice: ${res.error}`);
      } else {
        toast.success('Profile updated');
        onClose();
      }
    } catch {
      toast.error('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const username = profile?.github_username || (user?.user_metadata?.user_name as string) || 'github-user';
  const avatarUrl = profile?.avatar_url || (user?.user_metadata?.avatar_url as string);
  const email = profile?.email || user?.email;
  const createdAtFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : user?.created_at
      ? new Date(user.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Active session';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      data-testid="user-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-stroke-subtle bg-surface-base shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke-subtle px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <h2 id="profile-modal-title" className="text-sm font-semibold text-content-primary">
              Account & Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="rounded-lg p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Identity Card */}
          <div className="flex items-center gap-4 rounded-xl border border-stroke-subtle bg-surface-canvas p-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="h-14 w-14 rounded-full border border-stroke object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg font-bold text-lg">
                {username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-content-primary truncate">
                  {profile?.display_name || username}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-base px-2 py-0.5 text-[10px] font-mono font-medium text-content-secondary border border-stroke-soft">
                  <Github className="h-3 w-3" />
                  @{username}
                </span>
              </div>
              {email && (
                <div className="mt-1 flex items-center gap-1 text-xs text-content-secondary truncate">
                  <Mail className="h-3 w-3 text-content-muted" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              <div className="mt-1 flex items-center gap-1 text-[11px] text-content-muted">
                <Calendar className="h-3 w-3" />
                <span>Joined {createdAtFormatted}</span>
              </div>
            </div>
          </div>

          {/* Edit Display Name Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="display-name-input"
                className="block text-xs font-semibold text-content-secondary mb-1.5"
              >
                Display Name
              </label>
              <input
                id="display-name-input"
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="Your preferred name"
                className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas px-3.5 py-2 text-xs text-content-primary outline-none focus:border-accent transition-colors"
              />
              <p className="mt-1 text-[11px] text-content-muted">
                Displayed in the workspace header and account menu.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stroke-subtle px-4 py-2 text-xs font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Local Storage & Data Privacy Callout */}
          <div className="rounded-xl border border-stroke-subtle bg-surface-canvas p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-content-primary">
              <HardDrive className="h-4 w-4 text-accent" />
              <span>Projects stored on this device</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-content-secondary">
              GB Coder operates local-first. Your files and workspaces are saved in this browser profile using
              IndexedDB. Signing in with GitHub authenticates your user identity without uploading your local code
              to external cloud storage.
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-content-muted pt-1">
              <Shield className="h-3.5 w-3.5 text-success" />
              <span>Row Level Security (RLS) protects your profile records in the database.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
