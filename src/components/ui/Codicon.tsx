import React from 'react';

export interface CodiconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
  'aria-label'?: string;
}

/**
 * Official VS Code Codicon React wrapper.
 * Renders vector glyphs from @vscode/codicons matching vscode.dev.
 */
export const Codicon: React.FC<CodiconProps> = ({
  name,
  className = '',
  style,
  title,
  onClick,
  'aria-label': ariaLabel,
}) => {
  return (
    <span
      className={`codicon codicon-${name} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        ...style,
      }}
      title={title}
      onClick={onClick}
      aria-label={ariaLabel || title}
      aria-hidden={!ariaLabel && !title}
      role={onClick ? 'button' : undefined}
    />
  );
};

export default Codicon;
