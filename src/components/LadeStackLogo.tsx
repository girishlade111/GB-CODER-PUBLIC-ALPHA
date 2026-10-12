import React from 'react';

interface LadeStackLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

export const LadeStackLogo: React.FC<LadeStackLogoProps> = ({
  className = '',
  size = 24,
  showText = true,
  subtitle = 'GB Coder',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* LadeStack Layered Core Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="url(#ladestack-grad)" />
        {/* Top Plate */}
        <path
          d="M7 11.5L16 6.5L25 11.5L16 16.5L7 11.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Mid Stack Layer */}
        <path
          d="M7 16L16 21L25 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        />
        {/* Bottom Base Layer */}
        <path
          d="M7 20.5L16 25.5L25 20.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.65"
        />
        <defs>
          <linearGradient id="ladestack-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.55" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand Wordmark & IDE Badge */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans">
            LadeStack
            <span className="text-slate-400 font-normal">/</span>
            <span className="font-medium text-slate-200">{subtitle}</span>
          </span>
          <span className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            IDE
          </span>
        </div>
      )}
    </div>
  );
};

export default LadeStackLogo;
