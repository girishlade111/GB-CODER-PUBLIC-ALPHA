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
  Settings as SettingsIcon,
  Upload,
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
  onOpenAIChat,
  onOpenVoiceCommands,
  onOpenStatistics,
  onOpenInjection,
  onOpenSettings,
  canDockPanels = true,
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
        onClick={item.disabled ? undefined : item.onClick}
        disabled={item.disabled}
        aria-pressed={item.isActive}
        /*
          Accent left border marks the active item, per the design tokens. The
          border is always present but transparent when inactive, so the label
          never shifts horizontally on selection.
        */
        className={`flex w-full items-center rounded-md border-l-2 text-sm font-medium transition-colors ${
          isExpanded ? 'gap-3 pl-2.5 pr-3 py-2' : 'justify-center px-2 py-2'
        } ${
          item.disabled
            ? 'cursor-not-allowed border-transparent text-content-muted opacity-50'
            : item.isActive
              ? 'border-accent bg-accent-subtle text-content-primary'
              : 'border-transparent text-content-secondary hover:border-accent/40 hover:bg-white/5 hover:text-content-primary'
        }`}
      >
        <span className="flex shrink-0 items-center justify-center">{item.icon}</span>
        {isExpanded && <span className="truncate">{item.label}</span>}
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
      className={`sticky top-14 flex shrink-0 flex-col self-start overflow-y-auto border-r border-stroke-subtle bg-surface-base transition-[width] duration-200 ease-out sm:top-16 ${
        isExpanded ? 'w-52' : 'w-[52px]'
      }`}
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <nav className="flex-1 p-2">
        {sections.map((section, index) => (
          <div key={section.id} className={index > 0 ? 'mt-3' : undefined}>
            {isExpanded ? (
              <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-content-muted">
                {section.label}
              </h2>
            ) : (
              // Collapsed: a rule stands in for the group heading.
              index > 0 && <div className="mx-2 mb-2 border-t border-stroke-subtle" />
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
            className="mt-1 flex w-full items-center gap-3 rounded-md border-l-2 border-transparent pl-2.5 pr-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5 shrink-0" />
            <span className="truncate">Collapse</span>
          </button>
        ) : (
          <Tooltip label="Expand sidebar" side="right">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="mt-1 flex w-full items-center justify-center rounded-md px-2 py-2 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
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
