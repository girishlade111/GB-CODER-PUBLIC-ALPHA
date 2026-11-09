/**
 * Git Author Identity Configuration Modal for GB Coder.
 *
 * Configures the author identity used in commits:
 * - Author Name
 * - Author Email
 *
 * Adheres strictly to:
 * - Zero emoji rule
 * - Immediate validation
 */

import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertCircle } from 'lucide-react';
import { getGitAuthor, setGitAuthor } from '../../services/git/gitEngineService';
import type { GitAuthor } from '../../types/git';

interface GitAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (author: GitAuthor) => void;
}

export const GitAuthorModal: React.FC<GitAuthorModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const author = getGitAuthor();
    setName(author.name);
    setEmail(author.email);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Author name must not be empty.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const newAuthor: GitAuthor = { name: cleanName, email: cleanEmail };
    setGitAuthor(newAuthor);
    if (onSaved) onSaved(newAuthor);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-author-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs select-none"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <h2 id="git-author-modal-title" className="text-sm font-semibold text-[var(--foreground)]">
              Git Author Identity
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]"
            title="Close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
              Author Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
              Author Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className="w-full rounded border border-[var(--border)] bg-[var(--sidebar)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Identity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
