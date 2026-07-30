import React from 'react';
import {
  FolderTree,
  LayoutTemplate,
  Sparkles,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Tooltip from './ui/Tooltip';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppSidebarProps {
  onToggleFiles: () => void;
  isFilesOpen: boolean;
  onOpenTemplates: () => void;
  onOpenAITools: () => void;
  onOpenSettings: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Renders as the selected entry, e.g. while its panel is open. */
  isActive?: boolean;
}

/**
 * Left rail navigation. Icon-only by default and expandable to show labels.
 *
 * Files toggles the project file explorer; the remaining entries open existing
 * panels.
 */
const AppSidebar: React.FC<AppSidebarProps> = ({
  onToggleFiles,
  isFilesOpen,
  onOpenTemplates,
  onOpenAITools,
  onOpenSettings,
}) => {
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>('gb-coder-sidebar-expanded', false);

  const items: SidebarItem[] = [
    {
      id: 'files',
      label: 'Files',
      icon: <FolderTree className="h-5 w-5" />,
      onClick: onToggleFiles,
      isActive: isFilesOpen,
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <LayoutTemplate className="h-5 w-5" />,
      onClick: onOpenTemplates,
    },
    {
      id: 'ai-tools',
      label: 'AI Tools',
      icon: <Sparkles className="h-5 w-5" />,
      onClick: onOpenAITools,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="h-5 w-5" />,
      onClick: onOpenSettings,
    },
  ];

  const renderItem = (item: SidebarItem) => {
    const button = (
      <button
        type="button"
        onClick={item.onClick}
        aria-pressed={item.isActive}
        className={`flex w-full items-center rounded-md text-sm font-medium transition-colors ${
          isExpanded ? 'gap-3 px-3 py-2' : 'justify-center px-2 py-2'
        } ${
          item.isActive
            ? 'bg-white/[0.07] text-content-primary'
            : 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
        }`}
      >
        <span className="flex shrink-0 items-center justify-center">{item.icon}</span>
        {isExpanded && <span className="truncate">{item.label}</span>}
      </button>
    );

    // Collapsed rail relies on tooltips for labelling.
    if (!isExpanded) {
      return (
        <li key={item.id}>
          <Tooltip label={item.label} side="right">
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
      */
      className={`sticky top-14 hidden shrink-0 flex-col self-start overflow-y-auto border-r border-stroke-subtle bg-surface-base transition-[width] duration-200 ease-out sm:top-16 lg:flex ${
        isExpanded ? 'w-52' : 'w-[52px]'
      }`}
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <nav className="flex-1 p-2">
        <ul className="flex flex-col gap-1">{items.map(renderItem)}</ul>
      </nav>

      <div className="border-t border-stroke-subtle p-2">
        {isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
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
              className="flex w-full items-center justify-center rounded-md px-2 py-2 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
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
