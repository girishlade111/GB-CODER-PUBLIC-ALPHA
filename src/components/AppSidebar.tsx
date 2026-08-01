import React from 'react';
import {
  BarChart3,
  FolderTree,
  LayoutTemplate,
  MessageSquare,
  Mic,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Settings as SettingsIcon,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import Tooltip from './ui/Tooltip';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppSidebarProps {
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
  onOpenAIChat: () => void;
  onOpenVoiceCommands: () => void;
  onOpenStatistics: () => void;
  onOpenInjection: () => void;
  onOpenSettings: () => void;
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

interface SidebarSection {
  id: string;
  /** Shown as a heading when the rail is expanded. */
  label: string;
  items: SidebarItem[];
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
  onToggleFiles,
  isFilesOpen,
  onToggleDependencies,
  isDependenciesOpen,
  onOpenTemplates,
  onOpenImport,
  onOpenVSCodeMode,
  onOpenAIChat,
  onOpenVoiceCommands,
  onOpenStatistics,
  onOpenInjection,
  onOpenSettings,
  canDockPanels = true,
  isDrawerOpen = false,
  onCloseDrawer,
}) => {
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>('gb-coder-sidebar-expanded', false);

  const panelsUnavailable = 'Needs a wider window';

  const sections: SidebarSection[] = [
    {
      id: 'project',
      label: 'Project',
      items: [
        {
          id: 'files',
          label: 'Files',
          icon: <FolderTree className="h-5 w-5" />,
          onClick: onToggleFiles,
          isActive: isFilesOpen,
          disabled: !canDockPanels,
          disabledReason: panelsUnavailable,
        },
        {
          id: 'dependencies',
          label: 'Dependencies',
          icon: <Package className="h-5 w-5" />,
          onClick: onToggleDependencies,
          isActive: isDependenciesOpen,
          disabled: !canDockPanels,
          disabledReason: panelsUnavailable,
        },
        {
          id: 'templates',
          label: 'Templates',
          icon: <LayoutTemplate className="h-5 w-5" />,
          onClick: onOpenTemplates,
        },
        {
          id: 'import',
          label: 'Import',
          icon: <Upload className="h-5 w-5" />,
          onClick: onOpenImport,
        },
        {
          id: 'vscode-mode',
          label: 'VS Code Mode & Sandbox',
          icon: <PanelsTopLeft className="h-5 w-5" />,
          onClick: onOpenVSCodeMode,
        },
      ],
    },
    {
      id: 'ai',
      label: 'AI',
      items: [
        {
          id: 'ai-chat',
          label: 'AI Chat',
          icon: <MessageSquare className="h-5 w-5" />,
          onClick: onOpenAIChat,
        },
        {
          id: 'voice',
          label: 'Voice Commands',
          icon: <Mic className="h-5 w-5" />,
          onClick: onOpenVoiceCommands,
        },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        {
          id: 'statistics',
          label: 'Statistics',
          icon: <BarChart3 className="h-5 w-5" />,
          onClick: onOpenStatistics,
        },
        {
          id: 'injection',
          label: 'Code Injection',
          icon: <Zap className="h-5 w-5" />,
          onClick: onOpenInjection,
        },
      ],
    },
  ];

  const renderItem = (item: SidebarItem) => {
    const button = (
      <button
        type="button"
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
        /*
          Accent left border marks the active item, per the design tokens. The
          border is always present but transparent when inactive, so the label
          never shifts horizontally on selection.

          The `compact:` overrides make the collapsed rail lay itself out like
          the expanded one inside the drawer — full-width rows with labels and a
          44px minimum touch target — without a second component.
        */
        className={`flex w-full items-center rounded-md border-l-2 text-sm font-medium transition-colors compact:min-h-[44px] ${
          isExpanded
            ? 'gap-3 pl-2.5 pr-3 py-2'
            : 'justify-center px-2 py-2 compact:justify-start compact:gap-3 compact:pl-2.5 compact:pr-3'
        } ${
          item.disabled
            ? 'cursor-not-allowed border-transparent text-content-muted opacity-50'
            : item.isActive
              ? 'border-accent bg-accent-subtle text-content-primary'
              : 'border-transparent text-content-secondary hover:border-accent/40 hover:bg-white/5 hover:text-content-primary'
        }`}
      >
        <span className="flex shrink-0 items-center justify-center">{item.icon}</span>
        {/*
          Always rendered, then hidden with CSS when the desktop rail is
          collapsed. `display: none` is visually identical to not rendering it,
          and it lets the same markup show labels inside the mobile drawer.
        */}
        <span className={`truncate ${isExpanded ? '' : 'hidden compact:inline'}`}>{item.label}</span>
      </button>
    );

    const tooltipLabel = item.disabled
      ? `${item.label} — ${item.disabledReason ?? 'unavailable'}`
      : item.label;

    // The collapsed rail has no visible labels, so tooltips carry them. When
    // expanded, only disabled items still need the extra explanation.
    if (!isExpanded || item.disabled) {
      return (
        <li key={item.id}>
          <Tooltip label={tooltipLabel} side="right">
            {button}
          </Tooltip>
        </li>
      );
    }

    return <li key={item.id}>{button}</li>;
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
      className={`sticky top-14 flex h-[calc(100vh-4rem)] shrink-0 flex-col self-start overflow-y-auto border-r border-stroke-subtle bg-surface-base transition-[width] duration-200 ease-out sm:top-16 ${
        isExpanded ? 'w-52' : 'w-[52px]'
      } compact:fixed compact:bottom-0 compact:left-0 compact:z-40 compact:h-auto compact:w-[min(18rem,82vw)] compact:shadow-elevated-lg compact:transition-transform ${
        isDrawerOpen ? 'compact:translate-x-0' : 'compact:-translate-x-full'
      }`}
    >
      {/*
        Drawer-only header. `display: none` above 1024px, so the desktop rail is
        byte-for-byte what it was.
      */}
      <div className="hidden items-center justify-between border-b border-stroke-subtle px-3 py-2 compact:flex">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">
          Menu
        </span>
        <button
          type="button"
          onClick={onCloseDrawer}
          aria-label="Close navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-md text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-2">
        {sections.map((section, index) => (
          <div key={section.id} className={index > 0 ? 'mt-3' : undefined}>
            <h2
              className={`mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-content-muted ${
                isExpanded ? '' : 'hidden compact:block'
              }`}
            >
              {section.label}
            </h2>
            {/* Collapsed desktop rail: a rule stands in for the group heading.
                The drawer shows the real heading instead. */}
            {!isExpanded && index > 0 && (
              <div className="mx-2 mb-2 border-t border-stroke-subtle compact:hidden" />
            )}
            <ul className="flex flex-col gap-1">{section.items.map(renderItem)}</ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-stroke-subtle p-2">
        <ul className="flex flex-col gap-1">
          {renderItem({
            id: 'settings',
            label: 'Settings',
            icon: <SettingsIcon className="h-5 w-5" />,
            onClick: onOpenSettings,
          })}
        </ul>

        {isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            /* Rail width is fixed inside the drawer, so the rail collapse
               control is hidden there — the drawer closes instead. */
            className="mt-1 flex w-full items-center gap-3 rounded-md border-l-2 border-transparent pl-2.5 pr-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary compact:hidden"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5 shrink-0" />
            <span className="truncate">Collapse</span>
          </button>
        ) : (
          <Tooltip label="Expand sidebar" side="right" className="inline-flex compact:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="mt-1 flex w-full items-center justify-center rounded-md px-2 py-2 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary compact:hidden"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default React.memo(AppSidebar);
