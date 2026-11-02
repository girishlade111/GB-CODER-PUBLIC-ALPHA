import React from 'react';

export interface GBAssistIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

/**
 * GB Assist Icon: Enterprise generative AI code generator, code assist, and website builder mark.
 * Minimalist geometric fusion of code chevrons (< >), generative intelligence prism (◇), and compiler axis.
 * Zero stars or sparkles. Crisp at 20px in Activity Bar and 56px in View Panel.
 */
export const GBAssistIcon: React.FC<GBAssistIconProps> = ({
  size = 20,
  className = '',
  strokeWidth = 1.5,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Left Code Chevron */}
      <path d="M5.5 7.5L1.5 12L5.5 16.5" />
      {/* Right Code Chevron */}
      <path d="M18.5 7.5L22.5 12L18.5 16.5" />
      {/* Central Generative Intelligence Diamond */}
      <path d="M12 3L16.5 12L12 21L7.5 12Z" />
      {/* Generative Compiler Axis / Slash */}
      <path d="M13.5 8L10.5 16" />
    </svg>
  );
};

export default GBAssistIcon;

