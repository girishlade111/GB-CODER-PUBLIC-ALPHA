import React from 'react';

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
    <div className="flex flex-col items-center gap-3 select-none" role="status" aria-live="polite">
      {/* Modern Orbital Spinner Core */}
      <div className="relative flex items-center justify-center w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white/60 animate-spin" />
        <div
          className="absolute inset-1 rounded-full border border-dashed border-white/20 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '4s' }}
        />
        <div className="w-6 h-6 rounded-md bg-surface-overlay/90 border border-white/20 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <svg
            className="w-3.5 h-3.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium text-content-primary tracking-wide">
          Loading {label}…
        </span>
        <div className="w-20 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent w-full animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-xl border border-stroke-subtle bg-surface-raised px-8 py-6 shadow-vscode-modal">
          {spinner}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return <div className="flex items-center justify-center py-4">{spinner}</div>;
  }

  return (
    <div className="grid h-full min-h-[8rem] w-full place-items-center rounded-lg border border-stroke-subtle bg-surface-base">
      {spinner}
    </div>
  );
};

export default LazyFallback;
