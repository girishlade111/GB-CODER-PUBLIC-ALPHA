import React from 'react';
import {
  Files,
  Search,
  Package,
  Radio,
  TerminalSquare,
  Settings,
  RotateCcw,
  Sparkles,
  Bug,
  Mic,
  Database,
  LogOut,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

export type ActivityTab = 'explorer' | 'search' | 'code-assist' | 'packages' | 'ports';

interface ActivityBarProps {
  activeTab: ActivityTab;
  onChangeTab: (tab: ActivityTab) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  serverRunning?: boolean;
  isCodeAssistGenerating?: boolean;
  onOpenCodeRabbit?: () => void;
  onOpenVoiceCommands?: () => void;
  onOpenSnapshots?: () => void;
  onOpenSettings?: () => void;
  onResetContainer?: () => void;
  onExit?: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onChangeTab,
  isTerminalOpen,
  onToggleTerminal,
  serverRunning = false,
  isCodeAssistGenerating = false,
  onOpenCodeRabbit,
  onOpenVoiceCommands,
  onOpenSnapshots,
  onOpenSettings,
  onResetContainer,
  onExit,
}) => {
  return (
    <aside
      className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-[#262636] bg-[#181824] py-2 select-none z-10"
      data-testid="vscode-activity-bar"
    >
      {/* Top Group: Primary Navigation Panels & Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Explorer */}
        <Tooltip label="Explorer (Ctrl+Shift+E)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('explorer')}
            aria-label="Explorer"
            aria-pressed={activeTab === 'explorer'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              activeTab === 'explorer'
                ? 'text-white bg-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              activeTab === 'search'
                ? 'text-white bg-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activeTab === 'search' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Search className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Code Assist (AI Assistant & Builder) */}
        <Tooltip label="Code Assist (Build With AI)" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('code-assist')}
            aria-label="Code Assist"
            aria-pressed={activeTab === 'code-assist'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              activeTab === 'code-assist'
                ? 'text-white bg-white/10'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            {activeTab === 'code-assist' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Sparkles className="h-5 w-5 text-cyan-400" />
            {isCodeAssistGenerating && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#181824] animate-ping" />
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
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              activeTab === 'packages'
                ? 'text-white bg-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activeTab === 'packages' && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#007acc] rounded-r" />
            )}
            <Package className="h-5 w-5 text-amber-400" />
          </button>
        </Tooltip>

        {/* Ports / Live Dev Server */}
        <Tooltip label="Ports & Live Dev Server" side="right">
          <button
            type="button"
            onClick={() => onChangeTab('ports')}
            aria-label="Ports"
            aria-pressed={activeTab === 'ports'}
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              activeTab === 'ports'
                ? 'text-white bg-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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

        {/* CodeRabbit AI Bug Scanner */}
        {onOpenCodeRabbit && (
          <Tooltip label="CodeRabbit AI Bug Scanner" side="right">
            <button
              type="button"
              onClick={onOpenCodeRabbit}
              aria-label="CodeRabbit AI Bug Scanner"
              className="relative flex h-10 w-full items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors rounded-sm"
            >
              <Bug className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        {/* Snapshots */}
        {onOpenSnapshots && (
          <Tooltip label="Snapshot Manager" side="right">
            <button
              type="button"
              onClick={onOpenSnapshots}
              aria-label="Snapshot Manager"
              className="relative flex h-10 w-full items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors rounded-sm"
            >
              <Database className="h-5 w-5" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Bottom Group: Terminal, Voice, Settings, Exit */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Terminal Toggle */}
        <Tooltip label="Terminal (Ctrl+`)" side="right">
          <button
            type="button"
            onClick={onToggleTerminal}
            aria-label="Toggle Terminal"
            aria-pressed={isTerminalOpen}
            className={`relative flex h-10 w-full items-center justify-center transition-colors rounded-sm ${
              isTerminalOpen
                ? 'text-cyan-400 bg-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {isTerminalOpen && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-cyan-400 rounded-r" />
            )}
            <TerminalSquare className="h-5 w-5" />
          </button>
        </Tooltip>

        {/* Voice Commands */}
        {onOpenVoiceCommands && (
          <Tooltip label="Voice Commands" side="right">
            <button
              type="button"
              onClick={onOpenVoiceCommands}
              aria-label="Voice Commands"
              className="flex h-10 w-full items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors rounded-sm"
            >
              <Mic className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        {/* Restart Container / Remount */}
        {onResetContainer && (
          <Tooltip label="Restart Container / Clear Cache" side="right">
            <button
              type="button"
              onClick={onResetContainer}
              aria-label="Restart Container"
              className="flex h-9 w-full items-center justify-center text-slate-500 transition-colors hover:text-amber-400 hover:bg-white/5 rounded-sm"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </Tooltip>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <Tooltip label="Settings" side="right">
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Settings"
              className="flex h-10 w-full items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors rounded-sm"
            >
              <Settings className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        {/* Exit VS Code / IDE Mode */}
        {onExit && (
          <Tooltip label="Exit VS CODE / Return to Standard Editor" side="right">
            <button
              type="button"
              onClick={onExit}
              aria-label="Exit VS CODE Mode"
              className="flex h-10 w-full items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-sm mt-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default ActivityBar;
