import React from 'react';
import {
  Files,
  Search,
  Package,
  Sparkles,
  GitBranch,
  TerminalSquare,
  Settings,
  RotateCcw,
  Bug,
  Mic,
  Database,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
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
      className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-[var(--border)] bg-[var(--sidebar)] py-2 select-none z-10"
      data-testid="vscode-activity-bar"
    >
      {/* Top Group: Primary Views */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Explorer */}
        <Tooltip label="Explorer (Ctrl+Shift+E)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('explorer')}
            aria-label="Explorer"
            aria-pressed={isSidebarOpen && activeViewId === 'explorer'}
            data-testid="activity-bar-explorer"
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isSidebarOpen && activeViewId === 'explorer'
                ? 'text-[var(--foreground)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            {isSidebarOpen && activeViewId === 'explorer' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--primary)] rounded-r shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <Files className="h-5 w-5" />
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isSidebarOpen && activeViewId === 'search'
                ? 'text-[var(--foreground)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            {isSidebarOpen && activeViewId === 'search' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--primary)] rounded-r shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <Search className="h-5 w-5" />
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isSidebarOpen && activeViewId === 'source-control'
                ? 'text-[var(--foreground)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            {isSidebarOpen && activeViewId === 'source-control' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--primary)] rounded-r shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <GitBranch className="h-5 w-5" />
            {dirtyCount > 0 && (
              <span
                data-testid="source-control-badge"
                className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold text-white shadow-sm"
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isSidebarOpen && activeViewId === 'code-assist'
                ? 'text-[var(--foreground)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            {isSidebarOpen && activeViewId === 'code-assist' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--primary)] rounded-r shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <Sparkles
              className={`h-5 w-5 ${
                isCodeAssistGenerating ? 'text-[var(--primary)] animate-spin' : ''
              }`}
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isSidebarOpen && activeViewId === 'packages'
                ? 'text-[var(--foreground)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            {isSidebarOpen && activeViewId === 'packages' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--primary)] rounded-r shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            )}
            <Package className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      {/* Bottom Group: Tools, Terminal, Settings */}
      <div className="flex flex-col items-center gap-1 w-full border-t border-[var(--border)]/60 pt-2">
        {/* Toggle Terminal Panel */}
        <Tooltip label="Toggle Terminal (Ctrl+`)" side="right">
          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Terminal"
            aria-pressed={isTerminalOpen}
            data-testid="activity-bar-terminal"
            className={`flex h-9 w-full items-center justify-center rounded-sm transition-colors ${
              isTerminalOpen
                ? 'text-[var(--primary)] bg-white/10'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
            }`}
          >
            <TerminalSquare className="h-4 w-4" />
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
              className="flex h-9 w-full items-center justify-center rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              <Database className="h-4 w-4" />
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
              className="flex h-9 w-full items-center justify-center rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              <Mic className="h-4 w-4" />
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
              className="flex h-9 w-full items-center justify-center rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              <Bug className="h-4 w-4" />
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
              className="flex h-9 w-full items-center justify-center rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
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
            className="flex h-9 w-full items-center justify-center rounded-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
