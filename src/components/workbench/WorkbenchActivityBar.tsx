import React from 'react';
import {
  Files,
  Search,
  Package,
  GitBranch,
  TerminalSquare,
  Settings,
  RotateCcw,
  Bug,
  Mic,
  Database,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { GBAssistIcon } from '../icons/GBAssistIcon';
import { ViewId } from '../../services/workbench/workbenchTypes';

interface WorkbenchActivityBarProps {
  activeViewId: ViewId;
  isSidebarOpen: boolean;
  onSelectView: (viewId: ViewId) => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  dirtyCount?: number;
  isCodeAssistGenerating?: boolean;
  onOpenSettings: () => void;
  onOpenSnapshots?: () => void;
  onOpenVoiceCommands?: () => void;
  onOpenCodeRabbit?: () => void;
  onResetContainer?: () => void;
}

export const WorkbenchActivityBar: React.FC<WorkbenchActivityBarProps> = ({
  activeViewId,
  isSidebarOpen,
  onSelectView,
  onToggleTerminal,
  isTerminalOpen,
  dirtyCount = 0,
  isCodeAssistGenerating = false,
  onOpenSettings,
  onOpenSnapshots,
  onOpenVoiceCommands,
  onOpenCodeRabbit,
  onResetContainer,
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
            onClick={() => onSelectView('explorer')}
            aria-label="Explorer"
            aria-pressed={isSidebarOpen && activeViewId === 'explorer'}
            data-testid="activity-bar-explorer"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'explorer'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isSidebarOpen && activeViewId === 'explorer' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Files className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Search */}
        <Tooltip label="Search (Ctrl+Shift+F)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('search')}
            aria-label="Search"
            aria-pressed={isSidebarOpen && activeViewId === 'search'}
            data-testid="activity-bar-search"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'search'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isSidebarOpen && activeViewId === 'search' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Source Control / Modified Files */}
        <Tooltip label="Source Control" side="right">
          <button
            type="button"
            onClick={() => onSelectView('source-control')}
            aria-label="Source Control"
            aria-pressed={isSidebarOpen && activeViewId === 'source-control'}
            data-testid="activity-bar-source-control"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'source-control'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isSidebarOpen && activeViewId === 'source-control' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <GitBranch className="h-5 w-5" strokeWidth={1.5} />
            {dirtyCount > 0 && (
              <span
                data-testid="source-control-badge"
                className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold text-[var(--primary-foreground)] shadow-sm"
              >
                {dirtyCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* GB Assist (Code Assist AI) */}
        <Tooltip label="GB Assist (AI Assistant)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('code-assist')}
            aria-label="GB Assist"
            aria-pressed={isSidebarOpen && activeViewId === 'code-assist'}
            data-testid="activity-bar-code-assist"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'code-assist'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isSidebarOpen && activeViewId === 'code-assist' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <GBAssistIcon
              className={`h-5 w-5 ${
                isCodeAssistGenerating ? 'text-[var(--primary)] animate-pulse' : ''
              }`}
              strokeWidth={1.5}
            />
          </button>
        </Tooltip>

        {/* Packages / Dependencies */}
        <Tooltip label="Package Manager" side="right">
          <button
            type="button"
            onClick={() => onSelectView('packages')}
            aria-label="Package Manager"
            aria-pressed={isSidebarOpen && activeViewId === 'packages'}
            data-testid="activity-bar-packages"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'packages'
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isSidebarOpen && activeViewId === 'packages' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--foreground)]" />
            )}
            <Package className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>

      {/* Bottom Group: Tools, Terminal, Settings */}
      <div className="flex flex-col items-center w-full pb-1">
        {/* Toggle Terminal Panel */}
        <Tooltip label="Toggle Terminal (Ctrl+`)" side="right">
          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Terminal"
            aria-pressed={isTerminalOpen}
            data-testid="activity-bar-terminal"
            className={`relative flex h-11 w-12 items-center justify-center transition-colors cursor-pointer ${
              isTerminalOpen
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <TerminalSquare className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Snapshots */}
        {onOpenSnapshots && (
          <Tooltip label="Project Snapshots" side="right">
            <button
              type="button"
              onClick={onOpenSnapshots}
              aria-label="Snapshots"
              data-testid="activity-bar-snapshots"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Database className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* Voice Commands */}
        {onOpenVoiceCommands && (
          <Tooltip label="Voice Commands" side="right">
            <button
              type="button"
              onClick={onOpenVoiceCommands}
              aria-label="Voice Commands"
              data-testid="activity-bar-voice"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Mic className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* CodeRabbit Review */}
        {onOpenCodeRabbit && (
          <Tooltip label="Code Review (CodeRabbit)" side="right">
            <button
              type="button"
              onClick={onOpenCodeRabbit}
              aria-label="Code Review"
              data-testid="activity-bar-coderabbit"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Bug className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* Remount WebContainer */}
        {onResetContainer && (
          <Tooltip label="Remount Virtual Filesystem" side="right">
            <button
              type="button"
              onClick={onResetContainer}
              aria-label="Remount Filesystem"
              data-testid="activity-bar-reset"
              className="flex h-10 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}

        {/* Settings */}
        <Tooltip label="Settings" side="right">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            data-testid="activity-bar-settings"
            className="flex h-11 w-12 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
