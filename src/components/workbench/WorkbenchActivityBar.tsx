import React, { useState, useRef, useEffect } from 'react';
import Tooltip from '../ui/Tooltip';
import Codicon from '../ui/Codicon';
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
  onResetContainer?: () => void;
  onOpenCommandPalette?: () => void;
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
  onResetContainer,
  onOpenCommandPalette,
}) => {
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const manageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isManageMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (manageMenuRef.current && !manageMenuRef.current.contains(e.target as Node)) {
        setIsManageMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsManageMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isManageMenuOpen]);
  return (
    <aside
      className="flex w-[48px] shrink-0 flex-col items-center justify-between border-r border-[var(--vscode-activityBar-border,#2b2b2b)] bg-[var(--vscode-activityBar-background,#181818)] py-0 select-none z-20"
      data-testid="vscode-activity-bar"
      role="navigation"
      aria-label="Activity Bar"
    >
      {/* ── Top Group: Primary Views & Tools ── */}
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
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            {isSidebarOpen && activeViewId === 'explorer' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activityBar-activeBorder,#ffffff)]" />
            )}
            <Codicon name="files" className="text-xl" />
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
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            {isSidebarOpen && activeViewId === 'search' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activityBar-activeBorder,#ffffff)]" />
            )}
            <Codicon name="search" className="text-xl" />
          </button>
        </Tooltip>

        {/* Source Control / Git */}
        <Tooltip label="Source Control (Ctrl+Shift+G)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('source-control')}
            aria-label="Source Control"
            aria-pressed={isSidebarOpen && activeViewId === 'source-control'}
            data-testid="activity-bar-source-control"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'source-control'
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            {isSidebarOpen && activeViewId === 'source-control' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activityBar-activeBorder,#ffffff)]" />
            )}
            <Codicon name="source-control" className="text-xl" />
            {dirtyCount > 0 && (
              <span
                data-testid="source-control-badge"
                className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--vscode-activityBarBadge-background,#0078d4)] px-1 text-[9px] font-bold text-[var(--vscode-activityBarBadge-foreground,#ffffff)] shadow-sm"
              >
                {dirtyCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* GB Assist (AI Agent) */}
        <Tooltip label="GB Assist (AI Coding Agent)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('code-assist')}
            aria-label="GB Assist"
            aria-pressed={isSidebarOpen && activeViewId === 'code-assist'}
            data-testid="activity-bar-code-assist"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'code-assist'
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            {isSidebarOpen && activeViewId === 'code-assist' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activityBar-activeBorder,#ffffff)]" />
            )}
            <Codicon
              name="sparkle"
              className={`text-xl ${isCodeAssistGenerating ? 'text-[#0078d4] animate-pulse' : ''}`}
            />
          </button>
        </Tooltip>

        {/* Extensions / Package Manager */}
        <Tooltip label="Extensions & Packages (Ctrl+Shift+X)" side="right">
          <button
            type="button"
            onClick={() => onSelectView('packages')}
            aria-label="Package Manager"
            aria-pressed={isSidebarOpen && activeViewId === 'packages'}
            data-testid="activity-bar-packages"
            className={`group relative flex h-12 w-12 items-center justify-center transition-colors cursor-pointer ${
              isSidebarOpen && activeViewId === 'packages'
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            {isSidebarOpen && activeViewId === 'packages' && (
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activityBar-activeBorder,#ffffff)]" />
            )}
            <Codicon name="extensions" className="text-xl" />
          </button>
        </Tooltip>
      </div>

      {/* ── Bottom Group: Terminal, Tools & Settings ── */}
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
                ? 'text-[var(--vscode-activityBar-foreground,#ffffff)]'
                : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
            }`}
          >
            <Codicon name="terminal" className="text-xl" />
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
              className="flex h-10 w-12 items-center justify-center text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white transition-colors cursor-pointer"
            >
              <Codicon name="history" className="text-xl" />
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
              className="flex h-10 w-12 items-center justify-center text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white transition-colors cursor-pointer"
            >
              <Codicon name="mic" className="text-xl" />
            </button>
          </Tooltip>
        )}

        {/* Remount Virtual Filesystem */}
        {onResetContainer && (
          <Tooltip label="Remount Virtual Filesystem" side="right">
            <button
              type="button"
              onClick={onResetContainer}
              aria-label="Remount Filesystem"
              data-testid="activity-bar-reset"
              className="flex h-10 w-12 items-center justify-center text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white transition-colors cursor-pointer"
            >
              <Codicon name="sync" className="text-xl" />
            </button>
          </Tooltip>
        )}

        {/* Manage (Gear) */}
        <div className="relative">
          <Tooltip label="Manage" side="right">
            <button
              type="button"
              onClick={() => setIsManageMenuOpen((prev) => !prev)}
              aria-label="Manage"
              aria-expanded={isManageMenuOpen}
              data-testid="activity-bar-settings"
              className={`flex h-11 w-12 items-center justify-center transition-colors cursor-pointer ${
                isManageMenuOpen
                  ? 'text-white bg-white/10'
                  : 'text-[var(--vscode-activityBar-inactiveForeground,rgba(255,255,255,0.4))] hover:text-white'
              }`}
            >
              <Codicon name="settings-gear" className="text-xl" />
            </button>
          </Tooltip>

          {/* Authentic VS Code Manage Popup Menu */}
          {isManageMenuOpen && (
            <div
              ref={manageMenuRef}
              className="fixed bottom-2 left-12 z-[99999] w-[230px] rounded-[6px] border border-[#3c3c3c] bg-[#1f1f1f] text-[#cccccc] shadow-2xl py-1 text-xs select-none font-sans animate-in fade-in duration-75"
              role="menu"
              aria-label="Manage Menu"
            >
              <div
                onClick={() => {
                  setIsManageMenuOpen(false);
                  if (onOpenCommandPalette) onOpenCommandPalette();
                  else window.dispatchEvent(new CustomEvent('workbench:open-command-palette'));
                }}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
              >
                <span>Command Palette...</span>
                <span className="text-[11px] font-mono text-[#858585] group-hover:text-white">Ctrl+Shift+P</span>
              </div>

              <div className="my-1 border-t border-[#2b2b2b]" />

              <div
                onClick={() => {
                  setIsManageMenuOpen(false);
                  onOpenSettings();
                }}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
              >
                <span>Settings</span>
                <span className="text-[11px] font-mono text-[#858585] group-hover:text-white">Ctrl+,</span>
              </div>

              <div
                onClick={() => {
                  setIsManageMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('workbench:customize-layout'));
                }}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
              >
                <span>Customize Layout...</span>
              </div>

              {onOpenVoiceCommands && (
                <div
                  onClick={() => {
                    setIsManageMenuOpen(false);
                    onOpenVoiceCommands();
                  }}
                  className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
                >
                  <span>Voice Commands</span>
                </div>
              )}

              {onOpenSnapshots && (
                <div
                  onClick={() => {
                    setIsManageMenuOpen(false);
                    onOpenSnapshots();
                  }}
                  className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
                >
                  <span>Snapshots & Backups</span>
                </div>
              )}

              {onResetContainer && (
                <div
                  onClick={() => {
                    setIsManageMenuOpen(false);
                    onResetContainer();
                  }}
                  className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors"
                >
                  <span>Remount Virtual Filesystem</span>
                </div>
              )}

              <div className="my-1 border-t border-[#2b2b2b]" />

              <div
                onClick={() => {
                  setIsManageMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('workbench:reset-layout'));
                }}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#04395e] hover:text-white cursor-pointer transition-colors text-rose-400"
              >
                <span>Reset to Default Layout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WorkbenchActivityBar;
