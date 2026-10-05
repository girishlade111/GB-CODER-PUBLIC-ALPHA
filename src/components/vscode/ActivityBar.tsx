import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  Package,
  Radio,
  TerminalSquare,
  Settings,
  User,
  RotateCcw,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

export type ActivityTab = 'explorer' | 'search' | 'git' | 'packages' | 'ports';

interface ActivityBarProps {
  activeTab: ActivityTab;
  onChangeTab: (tab: ActivityTab) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  dirtyCount?: number;
  serverRunning?: boolean;
  onOpenSettings?: () => void;
  onResetContainer?: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onChangeTab,
  isTerminalOpen,
  onToggleTerminal,
  dirtyCount = 0,
  serverRunning = false,
  onOpenSettings,
  onResetContainer,
}) => {
  return (
    <aside
      className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-[#262636] bg-[#181824] py-2 select-none z-10"
      data-testid="vscode-activity-bar"
    >
      {/* Top Group: Primary navigation panels */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Explorer */}
        <Tooltip label="Explorer (Ctrl+Shift+E)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('explorer')}
            aria-label="Explorer"
            aria-pressed={activeTab === 'explorer'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              activeTab === 'explorer'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'explorer' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Files className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Search */}
        <Tooltip label="Search (Ctrl+Shift+F)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('search')}
            aria-label="Search"
            aria-pressed={activeTab === 'search'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              activeTab === 'search'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'search' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Search className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Source Control (Git) */}
        <Tooltip label="Source Control" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('git')}
            aria-label="Source Control"
            aria-pressed={activeTab === 'git'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              activeTab === 'git'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'git' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <GitBranch className="h-5 w-5" />
            {dirtyCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#007acc] px-1 text-[9px] font-bold text-white leading-none shadow">
                {dirtyCount > 99 ? '99+' : dirtyCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* NPM Package Manager */}
        <Tooltip label="Package Manager (NPM)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('packages')}
            aria-label="Package Manager"
            aria-pressed={activeTab === 'packages'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              activeTab === 'packages'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'packages' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Package className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Ports / Live Dev Server */}
        <Tooltip label="Ports & Live Dev Server" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('ports')}
            aria-label="Ports"
            aria-pressed={activeTab === 'ports'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              activeTab === 'ports'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'ports' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Radio className="h-5 w-5" />
            {serverRunning && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#181824] animate-pulse" />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Bottom Group: Terminal, Profile, Settings */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Terminal Toggle */}
        <Tooltip label="Terminal (Ctrl+`)" side="right">
          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Toggle Terminal"
            aria-pressed={isTerminalOpen}
            className={`relative flex h-10 w-full items-center justify-center transition-colors ${
              isTerminalOpen
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isTerminalOpen && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-cyan-400 rounded-r" />
            )}
            <TerminalSquare className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Clear Cache / Restart Container */}
        {onResetContainer && (
          <Tooltip label="Restart Container / Clear Cache" side="right">
            <button
              type="button"
              onClick={onResetContainer}
              aria-label="Restart Container"
              className="flex h-9 w-full items-center justify-center text-slate-500 transition-colors hover:text-amber-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </Tooltip>
        )}

        {/* User Account */}
        <Tooltip label="Accounts" side="right">
          <button
            type="button"
            aria-label="Accounts"
            className="flex h-9 w-full items-center justify-center text-slate-400 transition-colors hover:text-slate-200"
          >
            <User className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip label="Settings" side="right">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="flex h-9 w-full items-center justify-center text-slate-400 transition-colors hover:text-slate-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};

export default ActivityBar;
