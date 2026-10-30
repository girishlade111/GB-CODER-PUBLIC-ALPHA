import React from 'react';
import {
  Activity,
  Code2,
  Files,
  FolderInput,
  History,
  Layers,
  LayoutTemplate,
  Mic,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  TerminalSquare,
  X,
} from 'lucide-react';
import Tooltip from './ui/Tooltip';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppSidebarProps {
  /**
   * Leaves the current project and returns to the dashboard.
   *
   * Pending edits are flushed by the caller before navigating, so this is not a
   * "discard" action.
   */
  onOpenProjects: () => void;
  onToggleFiles: () => void;
  isFilesOpen: boolean;
  onToggleDependencies: () => void;
  isDependenciesOpen: boolean;
  onOpenTemplates: () => void;
  onOpenImport: () => void;
  /**
   * Switches the current project into VS Code mode by hand.
   *
   * That mode is entered automatically for a detected full-stack import, but it
   * is also the only place the Sandbox and Terminal panels live — so without a
   * manual way in, a plain, React or Vue project could never reach them.
   */
  onOpenVSCodeMode: () => void;
  onOpenVoiceCommands: () => void;
  onOpenStatistics: () => void;
  onOpenInjection: () => void;
  onOpenSettings: () => void;
  onOpenSnapshots: () => void;
  /**
   * False on narrow viewports, where the docked side panels (file explorer,
   * dependencies) have no room. Modal-based entries stay available at all sizes.
   */
  canDockPanels?: boolean;
  /**
   * Drawer state, only meaningful at ≤1024px where the rail becomes an
   * off-canvas drawer. Ignored by the desktop styling entirely.
   */
  isDrawerOpen?: boolean;
  /** Dismisses the drawer — backdrop tap, close button, or item selection. */
  onCloseDrawer?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Renders as the selected entry, e.g. while its panel is open. */
  isActive?: boolean;
  disabled?: boolean;
  /** Shown instead of the label in the tooltip when disabled. */
  disabledReason?: string;
}


/**
 * Left rail navigation — the single entry point for every editor feature.
 *
 * Features previously duplicated as top-bar icons live here now, grouped by
 * purpose. Note that Statistics and Code Injection sit under "Tools" rather than
 * "AI": neither is AI-powered (injection is manual CSS/JS), so filing them under
 * AI would misrepresent what they do.
 */
const AppSidebar: React.FC<AppSidebarProps> = ({
  onOpenProjects,
  onToggleFiles,
  isFilesOpen,
  onToggleDependencies,
  isDependenciesOpen,
  onOpenTemplates,
  onOpenImport,
  onOpenVSCodeMode,
  onOpenVoiceCommands,
  onOpenStatistics,
  onOpenInjection,
  onOpenSettings,
  onOpenSnapshots,
  canDockPanels = true,
  isDrawerOpen = false,
  onCloseDrawer,
}) => {
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>('gb-coder-sidebar-expanded', false);

  const panelsUnavailable = 'Needs a wider window';

  const items: SidebarItem[] = [
    {
      /*
       * First in the rail: it is the way *out* of the current project, and
       * burying the exit under the tools that belong to it reads as a
       * dead end.
       */
      id: 'projects',
      label: 'All Projects',
      icon: <Layers className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenProjects,
    },
    {
      id: 'files',
      label: 'Files',
      icon: <Files className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onToggleFiles,
      isActive: isFilesOpen,
      disabled: !canDockPanels,
      disabledReason: panelsUnavailable,
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      icon: <Package className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onToggleDependencies,
      isActive: isDependenciesOpen,
      disabled: !canDockPanels,
      disabledReason: panelsUnavailable,
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <LayoutTemplate className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenTemplates,
    },
    {
      id: 'import',
      label: 'Import',
      icon: <FolderInput className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenImport,
    },
    {
      id: 'voice',
      label: 'Voice Commands',
      icon: <Mic className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenVoiceCommands,
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <Activity className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenStatistics,
    },
    {
      id: 'injection',
      label: 'Code Injection',
      icon: <Code2 className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenInjection,
    },
    {
      id: 'snapshots',
      label: 'Snapshots',
      icon: <History className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenSnapshots,
    },
    {
      id: 'vscode-mode',
      label: 'VS Code Mode & Sandbox',
      icon: <TerminalSquare className="h-[18px] w-[18px]" strokeWidth={1.5} />,
      onClick: onOpenVSCodeMode,
    },
  ];

  const renderItem = (item: SidebarItem) => {
    const tooltipLabel = item.disabled
      ? `${item.label} — ${item.disabledReason ?? 'unavailable'}`
      : item.label;

    const button = (
      <button
        type="button"
        title={!isExpanded || item.disabled ? tooltipLabel : undefined}
        onClick={
          item.disabled
            ? undefined
            : () => {
                item.onClick?.();
                // Closes the mobile drawer after a selection. On desktop the
                // drawer is already closed, so this is a no-op.
                onCloseDrawer?.();
              }
        }
        disabled={item.disabled}
        aria-pressed={item.isActive}
        className={`group relative flex items-center transition-colors compact:min-h-[44px] ${
          isExpanded
            ? 'w-full gap-3 rounded-md px-3 py-2 text-xs font-medium'
            : 'h-9 w-9 justify-center rounded-md compact:w-full compact:justify-start compact:gap-3 compact:px-3 compact:text-xs compact:font-medium'
        } ${
          item.disabled
            ? 'cursor-not-allowed text-[var(--muted-foreground)] opacity-40'
            : item.isActive
              ? 'bg-[var(--sidebar-accent)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)]/50 hover:text-[var(--foreground)]'
        }`}
      >
        {item.isActive && (
          <span
            className="absolute -left-1.5 top-1.5 bottom-1.5 w-[2px] rounded-r-sm bg-[var(--foreground)] compact:left-0"
            aria-hidden="true"
          />
        )}
        <span className="flex shrink-0 items-center justify-center">{item.icon}</span>
        {/*
          Always rendered, then hidden with CSS when the desktop rail is
          collapsed. `display: none` is visually identical to not rendering it,
          and it lets the same markup show labels inside the mobile drawer.
        */}
        <span className={`truncate ${isExpanded ? '' : 'hidden compact:inline'}`}>{item.label}</span>
      </button>
    );

    return (
      <li key={item.id} className={!isExpanded ? 'flex justify-center compact:block' : undefined}>
        {button}
      </li>
    );
  };

  return (
    <aside
      aria-label="Primary navigation"
      /*
        Sticky + viewport-height so the rail stays visible while the editor
        column scrolls. Without this the aside stretches to the full document
        height and its items scroll out of view.

        Rendered at every breakpoint: it is now the only route to these
        features, so hiding it on small screens would make them unreachable.
      */
      className={`sticky top-14 flex h-[calc(100vh-4rem)] shrink-0 flex-col self-start overflow-y-auto overflow-x-hidden border-r border-[var(--border)] bg-[var(--sidebar)] transition-[width] duration-200 ease-out sm:top-16 ${
        isExpanded ? 'w-52' : 'w-12'
      } compact:fixed compact:bottom-0 compact:left-0 compact:z-40 compact:h-auto compact:w-[min(18rem,82vw)] compact:shadow-elevated-lg compact:transition-transform ${
        isDrawerOpen ? 'compact:translate-x-0' : 'compact:-translate-x-full'
      }`}
    >
      {/*
        Drawer-only header. `display: none` above 1024px, so the desktop rail is
        byte-for-byte what it was.
      */}
      <div className="hidden items-center justify-between border-b border-[var(--border)] px-3 py-2 compact:flex">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Menu
        </span>
        <button
          type="button"
          onClick={onCloseDrawer}
          aria-label="Close navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex-1 px-1.5 py-2">
        <ul className="flex flex-col gap-1">{items.map(renderItem)}</ul>
      </nav>

      <div className="border-t border-[var(--border)] px-1.5 py-2">
        <ul className="flex flex-col gap-1">
          {renderItem({
            id: 'settings',
            label: 'Settings',
            icon: <SettingsIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />,
            onClick: onOpenSettings,
          })}
        </ul>

        {isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            /* Rail width is fixed inside the drawer, so the rail collapse
               control is hidden there — the drawer closes instead. */
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)] compact:hidden"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
            <span className="truncate">Collapse</span>
          </button>
        ) : (
          <div className="flex justify-center compact:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              title="Expand sidebar"
              className="mt-1 flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default React.memo(AppSidebar);
