import React from 'react';
import {
  Files,
  Search,
  Sparkles,
  GitBranch,
  Radio,
  Sliders,
  RotateCcw,
  LogOut,
  TerminalSquare,
  Package,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

export type ActivityBarTab =
  | 'explorer'
  | 'search'
  | 'code-assist'
  | 'dependencies'
  | 'source-control'
  | 'ports'
  | 'settings';

interface ActivityBarProps {
  activeTab: ActivityBarTab;
  onChangeTab: (tab: ActivityBarTab) => void;
  onOpenSettings: () => void;
  onResetContainer?: () => void;
  onExit?: () => void;
  isCodeAssistGenerating?: boolean;
  serverRunning?: boolean;
  dirtyCount?: number;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  onResetContainer,
  onExit,
  isCodeAssistGenerating = false,
  serverRunning = false,
  dirtyCount = 0,
  onToggleTerminal,
  isTerminalOpen = false,
}) => {
  return (
    <aside
      className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-[var(--border)] bg-[var(--sidebar)] py-0 select-none z-10"
      data-testid="vscode-activity-bar"
    >
      {/* Top Group: Primary Navigation Panels & Tools */}
      <div className="flex flex-col items-center w-full">
        {/* Explorer */}
        <Tooltip label="Explorer (Ctrl+Shift+E)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('explorer')}
            aria-label="Explorer"
            aria-pressed={activeTab === 'explorer'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'explorer'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'explorer' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Files className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Search */}
        <Tooltip label="Search (Ctrl+Shift+F)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('search')}
            aria-label="Search"
            aria-pressed={activeTab === 'search'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'search'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'search' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Code Assist (AI Assistant & Builder) */}
        <Tooltip label="Code Assist (Build With AI)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('code-assist')}
            aria-label="Code Assist"
            aria-pressed={activeTab === 'code-assist'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'code-assist'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'code-assist' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Sparkles className={`h-5 w-5 ${isCodeAssistGenerating ? 'animate-spin text-[var(--primary)]' : ''}`} strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Source Control */}
        <Tooltip label="Source Control" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('source-control')}
            aria-label="Source Control"
            aria-pressed={activeTab === 'source-control'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'source-control'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'source-control' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <GitBranch className="h-5 w-5" strokeWidth={1.5} />
            {dirtyCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold text-[var(--primary-foreground)] shadow-sm">
                {dirtyCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Dependencies / Package Manager */}
        <Tooltip label="Package Manager" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('dependencies')}
            aria-label="Dependencies"
            aria-pressed={activeTab === 'dependencies'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'dependencies'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'dependencies' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Package className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Ports & Dev Server */}
        <Tooltip label="Ports & Forwarding" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('ports')}
            aria-label="Ports"
            aria-pressed={activeTab === 'ports'}
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'ports'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {activeTab === 'ports' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Radio className={`h-5 w-5 ${serverRunning ? 'text-emerald-400' : ''}`} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>

      {/* Bottom Group: Tools & Utility Actions */}
      <div className="flex flex-col items-center w-full pb-1">
        {/* Toggle Terminal Panel */}
        {onToggleTerminal && (
          <Tooltip label="Toggle Terminal (Ctrl+`)" side="right">
            <button
              type="button"
              onClick={onToggleTerminal}
              aria-label="Toggle Terminal"
              aria-pressed={isTerminalOpen}
              className={`flex h-11 w-12 items-center justify-center transition-colors cursor-pointer ${
                isTerminalOpen
                  ? 'text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <TerminalSquare className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* Remount Virtual Filesystem */}
        {onResetContainer && (
          <Tooltip label="Remount Virtual Filesystem" side="right">
            <button
              type="button"
              onClick={onResetContainer}
              aria-label="Remount Virtual Filesystem"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* IDE Preferences & Hotkeys */}
        <Tooltip label="Settings & Preferences" side="right">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="flex h-11 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Sliders className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Exit Mode / Back to Standard */}
        {onExit && (
          <Tooltip label="Return to Standard Editor" side="right">
            <button
              type="button"
              onClick={onExit}
              aria-label="Exit VS Code Mode"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default ActivityBar;
