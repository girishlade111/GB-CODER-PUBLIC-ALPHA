import React from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** The visible tooltip text. Also used as the accessible label. */
  label: string;
  /** Optional keyboard shortcut rendered as a dim suffix. */
  shortcut?: string;
  side?: TooltipSide;
  /**
   * Classes for the wrapper element. Use this to carry responsive visibility
   * (e.g. `hidden sm:inline-flex`) so a hidden trigger does not leave the
   * wrapper occupying a flex gap.
   */
  className?: string;
  children: React.ReactElement;
}

const SIDE_CLASSES: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Styled tooltip for icon-only controls.
 *
 * Applies the same "label on hover" affordance the code selection toolbar uses,
 * but with product styling instead of the browser's native tooltip. The child's
 * `title` is removed so the native tooltip does not appear alongside this one,
 * and its text is promoted to `aria-label` when the child has none, keeping the
 * control announced to screen readers.
 *
 * Purely presentational — it never intercepts clicks or alters child behaviour.
 */
const Tooltip: React.FC<TooltipProps> = ({
  label,
  shortcut,
  side = 'bottom',
  className = 'inline-flex',
  children,
}) => {
  const childProps = children.props as Record<string, unknown>;

  const child = React.cloneElement(children, {
    // Drop the native tooltip; this component renders the visible label.
    title: undefined,
    'aria-label': (childProps['aria-label'] as string | undefined) ?? label,
  } as Partial<typeof childProps>);

  return (
    <span className={`group relative ${className}`}>
      {child}
      <span
        role="tooltip"
        aria-hidden="true"
        className={`pointer-events-none absolute z-[60] flex items-center gap-2 whitespace-nowrap rounded-md border border-stroke-subtle bg-surface-overlay px-2 py-1 text-xs font-medium text-content-primary opacity-0 shadow-elevated transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${SIDE_CLASSES[side]}`}
      >
        {label}
        {shortcut && (
          <kbd className="rounded-sm border border-stroke-subtle bg-surface-canvas px-1 font-mono text-[10px] text-content-muted">
            {shortcut}
          </kbd>
        )}
      </span>
    </span>
  );
};

export default Tooltip;
