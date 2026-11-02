import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
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
  /** When true, disables tooltip rendering and hover triggers. */
  disabled?: boolean;
  children: React.ReactElement;
}

let lastTooltipDismissTime = 0;

/**
 * Styled portal tooltip for icon-only and interactive controls.
 *
 * Renders into document.body to avoid z-index stacking issues, ancestor overflow
 * clipping, and internal scrollbars.
 */
const Tooltip: React.FC<TooltipProps> = ({
  label,
  shortcut,
  side = 'bottom',
  className = 'inline-flex',
  disabled = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const offset = 8;
    let top = 0;
    let left = 0;

    switch (side) {
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
      default:
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
    }

    if (typeof window !== 'undefined') {
      top = Math.max(8, Math.min(top, window.innerHeight - 8));
      left = Math.max(8, Math.min(left, window.innerWidth - 8));
    }

    setCoords({ top, left });
  }, [side]);

  const show = useCallback(() => {
    if (disabled || !label) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const now = Date.now();
    const wasRecentlyActive = now - lastTooltipDismissTime < 300;
    const delay = wasRecentlyActive ? 0 : 75;

    if (delay === 0) {
      updatePosition();
      setIsOpen(true);
    } else {
      timerRef.current = window.setTimeout(() => {
        updatePosition();
        setIsOpen(true);
      }, delay);
    }
  }, [disabled, label, updatePosition]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(false);
    lastTooltipDismissTime = Date.now();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleDismiss = () => hide();
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [isOpen, hide]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const childProps = children.props as Record<string, unknown>;

  const child = React.cloneElement(children, {
    title: undefined,
    'aria-label': (childProps['aria-label'] as string | undefined) ?? label,
  } as Partial<typeof childProps>);

  const getTransform = () => {
    switch (side) {
      case 'right':
        return 'translateY(-50%)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
      default:
        return 'translateX(-50%)';
    }
  };

  return (
    <span
      ref={triggerRef}
      className={`group relative ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {child}
      {isOpen &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: getTransform(),
              zIndex: 99999,
            }}
            className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--border)] bg-[#18181b] px-2.5 py-1 text-xs font-medium text-white shadow-xl select-none"
          >
            <span>{label}</span>
            {shortcut && (
              <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1 font-mono text-[10px] text-neutral-300">
                {shortcut}
              </kbd>
            )}
          </div>,
          document.body
        )}
    </span>
  );
};

export default Tooltip;
