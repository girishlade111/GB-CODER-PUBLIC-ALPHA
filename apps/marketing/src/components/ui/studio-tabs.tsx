// Adapted from Aceternity UI "Tabs" (MIT, Manu Arora): the tab row, the
// shared-element active indicator and the single-panel content switch are kept.
// The perspective/stack motion is replaced by a reduced-motion aware reveal, and
// React Aria (Apache-2.0, Adobe) supplies the real selection, roving focus and
// keyboard behaviour instead of hand-rolled tab state.
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import { clsx } from "clsx";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface StudioTabItem {
  id: string;
  title: string;
  panel: ReactNode;
}

interface IndicatorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StudioTabsProps {
  items: StudioTabItem[];
  /** Accessible name for the tab list, e.g. "Choose an example". */
  label: string;
  /** Rendered at the start of the toolbar, before the tab list. */
  leading?: ReactNode;
  /** Rendered at the end of the toolbar, after the tab list. */
  trailing?: ReactNode;
  /** Rendered below the panels, e.g. a workspace status bar. */
  footer?: ReactNode;
  className?: string;
}

export function StudioTabs({
  items,
  label,
  leading,
  trailing,
  footer,
  className,
}: StudioTabsProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState(items[0]?.id);
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null);

  const measure = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const selected = shell.querySelector<HTMLElement>(
      '[role="tab"][data-selected]',
    );
    if (!selected) {
      setIndicator(null);
      return;
    }
    const next = {
      x: selected.offsetLeft,
      y: selected.offsetTop,
      width: selected.offsetWidth,
      height: selected.offsetHeight,
    };
    setIndicator((current) =>
      current &&
      current.x === next.x &&
      current.y === next.y &&
      current.width === next.width &&
      current.height === next.height
        ? current
        : next,
    );
  }, []);

  // Measure after the selection commit so the indicator lands on the new tab.
  useLayoutEffect(measure, [measure, selectedKey]);

  // Keep the indicator correct when the toolbar reflows or the webfont loads.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <AriaTabs
      className={clsx("studio-tabs", className)}
      onSelectionChange={(key) => setSelectedKey(String(key))}
    >
      <div className="studio-toolbar">
        {leading}
        <div
          ref={shellRef}
          className={clsx("studio-tab-shell", {
            "has-indicator": indicator !== null,
          })}
        >
          <AriaTabList className="studio-tablist" aria-label={label}>
            {items.map((item) => (
              <AriaTab key={item.id} id={item.id} className="studio-tab">
                {item.title}
              </AriaTab>
            ))}
          </AriaTabList>
          <span
            className="studio-tab-indicator"
            aria-hidden="true"
            style={
              indicator
                ? {
                    width: `${indicator.width}px`,
                    height: `${indicator.height}px`,
                    transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
                  }
                : undefined
            }
          />
        </div>
        {trailing}
      </div>

      {items.map((item) => (
        <AriaTabPanel key={item.id} id={item.id} className="studio-tabpanel">
          {item.panel}
        </AriaTabPanel>
      ))}

      {footer}
    </AriaTabs>
  );
}
