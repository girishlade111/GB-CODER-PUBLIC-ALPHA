import React from 'react';
import gbcoderLogo from '../assets/gbcoder-logo.png';

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
      {/* GB Coder App Logo Mark */}
      <img
        src={gbcoderLogo}
        alt="GB Coder Logo"
        width={size}
        height={size}
        className="shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(180,83,9,0.25)] rounded"
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />

      {/* Brand Wordmark & IDE Badge */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans">
            LadeStack
            <span className="text-slate-400 font-normal">/</span>
            <span className="font-medium text-slate-200">{subtitle}</span>
          </span>
          <span className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            IDE
          </span>
        </div>
      )}
    </div>
  );
};

export default LadeStackLogo;
