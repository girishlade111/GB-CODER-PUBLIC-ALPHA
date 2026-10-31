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
      {/* Enterprise Minimalist Hairline Spinner */}
      <div className="w-5 h-5 rounded-full border-[1.5px] border-white/10 border-t-white animate-spin" />
      <span className="text-xs font-normal text-content-secondary tracking-tight">
        Loading {label}…
      </span>
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
