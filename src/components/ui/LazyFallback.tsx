import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading state shown while a lazy feature chunk is fetched.
 *
 * Intentionally tiny and dependency-free so it stays in the core bundle — a
 * fallback that had to be downloaded before it could be shown would defeat its
 * own purpose. Chunks are small enough that this is usually a single frame; the
 * spinner is delayed slightly so a fast fetch does not produce a visible flash.
 */

interface LazyFallbackProps {
  /** Feature name, e.g. "Import". Used in the accessible label. */
  label?: string;
  /** `panel` fills its container; `overlay` centres over a dimmed backdrop. */
  variant?: 'panel' | 'overlay' | 'inline';
}

const LazyFallback: React.FC<LazyFallbackProps> = ({ label = 'feature', variant = 'panel' }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
      {/*
        Fades in rather than starting at opacity-0: the fade-in keyframes do not
        use a forwards fill, so a persistent `opacity-0` base class would leave
        the spinner invisible once the animation finished.
      */}
      <Loader2 className="w-5 h-5 animate-spin text-accent" />
      <span className="text-xs text-content-muted">Loading {label}…</span>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
        <div className="rounded-xl border border-stroke-subtle bg-surface-raised px-6 py-5 shadow-vscode-modal">
          {spinner}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return <div className="flex items-center justify-center py-3">{spinner}</div>;
  }

  return (
    <div className="grid h-full min-h-[8rem] w-full place-items-center rounded-lg border border-stroke-subtle bg-surface-base">
      {spinner}
    </div>
  );
};

export default LazyFallback;
