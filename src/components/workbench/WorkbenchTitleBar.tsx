import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../ui/Tooltip';
import UserAccountMenu from '../auth/UserAccountMenu';
import Codicon from '../ui/Codicon';
import { LayoutPresetId, WorkbenchLayoutState } from '../../services/workbench/workbenchTypes';

interface WorkbenchTitleBarProps {
  projectName: string;
  layoutState: WorkbenchLayoutState;
  onTogglePrimarySidebar: () => void;
  onToggleSecondarySidebar: () => void;
  onToggleBottomPanel: () => void;
  onApplyPreset: (preset: LayoutPresetId) => void;
  onOpenCustomizeLayout?: () => void;
  onOpenQuickOpen: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenProjects?: () => void;
  onExit?: () => void;
  webcontainerState: {
    isSupported: boolean;
    startupStage: string;
    serverPort: number | null;
    serverUrl?: string | null;
  };
  onCloudSync?: () => void;
  isCloudSyncing?: boolean;
  cloudRevision?: number | null;
}

type MenuKey = 'File' | 'Edit' | 'Selection' | 'View' | 'Go' | 'Run' | 'Terminal' | 'Help';

export const WorkbenchTitleBar: React.FC<WorkbenchTitleBarProps> = ({
  projectName,
  layoutState,
  onTogglePrimarySidebar,
  onToggleSecondarySidebar,
  onToggleBottomPanel,
  onApplyPreset,
  onOpenCustomizeLayout,
  onOpenQuickOpen,
  onOpenCommandPalette,
  onOpenSettings,
  onOpenProjects,
  onExit,
  webcontainerState,
  onCloudSync,
  isCloudSyncing,
  cloudRevision,
}) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close top menu when clicking outside
  useEffect(() => {
    if (!activeMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleMenuClick = (menu: MenuKey) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleMenuHover = (menu: MenuKey) => {
    if (activeMenu !== null) {
      setActiveMenu(menu);
    }
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <header
      className="flex h-[35px] shrink-0 items-center justify-between border-b border-[var(--vscode-titleBar-border,#2b2b2b)] bg-[var(--vscode-titleBar-activeBackground,#181818)] px-2 text-xs text-[var(--vscode-titleBar-activeForeground,#cccccc)] select-none z-30 font-sans"
      data-testid="vscode-topbar"
    >
      {/* ── Left: VS Code Brand & Classic Menu Bar ── */}
      <div className="flex items-center gap-1 min-w-0" ref={menuBarRef}>
        {/* VS Code Official Vector Logo */}
        <div
          onClick={onOpenProjects}
          title="Return to Projects Dashboard"
          role="button"
          tabIndex={0}
          className="flex items-center justify-center p-1 rounded-[2px] hover:bg-white/10 text-[#0078d4] hover:text-[#0078d4] transition-colors cursor-pointer mr-0.5"
        >
          <Codicon name="vscode" className="text-base text-[#0078d4]" />
        </div>

        {/* Desktop/Web Menubar */}
        <nav className="flex items-center text-xs relative">
          {(['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'] as MenuKey[]).map(
            (menu) => {
              const isOpen = activeMenu === menu;
              return (
                <div key={menu} className="relative">
                  <button
                    type="button"
                    onClick={() => handleMenuClick(menu)}
                    onMouseEnter={() => handleMenuHover(menu)}
                    className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer text-xs ${
                      isOpen
                        ? 'bg-[var(--vscode-menu-selectionBackground,#04395e)] text-white'
                        : 'text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {menu}
                  </button>

                  {/* Dropdown Menu Popup */}
                  {isOpen && (
                    <div
                      className="absolute left-0 top-full mt-0.5 min-w-[220px] rounded-[4px] border border-[var(--vscode-menu-border,#3c3c3c)] bg-[var(--vscode-menu-background,#252526)] text-[var(--vscode-menu-foreground,#cccccc)] shadow-2xl py-1 text-xs z-50 animate-in fade-in duration-75"
                      role="menu"
                    >
                      {menu === 'File' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onOpenQuickOpen();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Open File...</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+P</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              toast.success('Workspace saved');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Save</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+S</span>
                          </button>
                          <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onOpenProjects?.();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Open Project Dashboard</span>
                          </button>
                          {onExit && (
                            <button
                              type="button"
                              onClick={() => {
                                closeMenu();
                                onExit();
                              }}
                              className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                            >
                              <span>Close Workspace</span>
                            </button>
                          )}
                        </>
                      )}

                      {menu === 'Edit' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              document.execCommand?.('undo');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Undo</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+Z</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              document.execCommand?.('redo');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Redo</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+Y</span>
                          </button>
                        </>
                      )}

                      {menu === 'Selection' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              document.execCommand?.('selectAll');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Select All</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+A</span>
                          </button>
                        </>
                      )}

                      {menu === 'View' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onOpenCommandPalette();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Command Palette...</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+Shift+P</span>
                          </button>
                          <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onTogglePrimarySidebar();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Primary Side Bar</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+B</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onToggleBottomPanel();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Panel</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+J</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onToggleSecondarySidebar();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Secondary Side Bar</span>
                          </button>
                          <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onApplyPreset('DEFAULT');
                              toast.success('Applied Default layout preset');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Reset to Default Preset</span>
                          </button>
                        </>
                      )}

                      {menu === 'Go' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onOpenQuickOpen();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Go to File...</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+P</span>
                          </button>
                        </>
                      )}

                      {menu === 'Run' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              toast('Running development server...', { icon: '▶' });
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Start Dev Server</span>
                            <span className="text-[10px] opacity-60 font-mono">F5</span>
                          </button>
                        </>
                      )}

                      {menu === 'Terminal' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onToggleBottomPanel();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Toggle Terminal</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+`</span>
                          </button>
                        </>
                      )}

                      {menu === 'Help' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              onOpenSettings();
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Settings</span>
                            <span className="text-[10px] opacity-60 font-mono">Ctrl+,</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu();
                              window.open('https://code.visualstudio.com/docs', '_blank');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors"
                          >
                            <span>Documentation</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </nav>
      </div>

      {/* ── Center: Official VS Code Command Center ── */}
      <div
        onClick={onOpenQuickOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenQuickOpen();
          }
        }}
        className="flex items-center justify-between px-3 h-[22px] w-64 md:w-96 max-w-[500px] rounded-[4px] border border-[var(--vscode-commandCenter-border,rgba(255,255,255,0.12))] bg-[var(--vscode-commandCenter-background,rgba(255,255,255,0.05))] hover:bg-[var(--vscode-commandCenter-activeBackground,rgba(255,255,255,0.08))] text-xs text-[var(--vscode-commandCenter-foreground,#cccccc)] transition-all cursor-pointer shadow-inner select-none"
        title="Quick Open / Search Files (Ctrl+P / Ctrl+Shift+P)"
        aria-label="Quick Open / Command Search"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Codicon name="search" className="text-xs opacity-60 shrink-0" />
          <span className="truncate text-[11px] font-sans">
            {projectName} — Search files (Ctrl+P)
          </span>
        </div>
        <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] text-neutral-400 font-mono rounded bg-white/5 border border-white/10">
          Ctrl+P
        </kbd>
      </div>

      {/* ── Right: Controls, WebContainer Status & Layout Toggles ── */}
      <div className="flex items-center gap-1">
        {/* WebContainer Status (Subtle VS Code badge) */}
        {webcontainerState.isSupported && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-[#cccccc]">
            {webcontainerState.serverUrl ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-mono text-[11px]">
                  {webcontainerState.serverPort ? `:${webcontainerState.serverPort}` : 'Online'}
                </span>
              </>
            ) : webcontainerState.startupStage === 'booting' || webcontainerState.startupStage === 'installing' ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" />
                <span className="text-cyan-400 text-[11px]">Syncing</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                <span className="text-neutral-400 text-[11px]">WebContainer</span>
              </>
            )}
          </div>
        )}

        {/* Cloud Sync Button */}
        {onCloudSync && (
          <Tooltip
            label={
              cloudRevision !== null && cloudRevision !== undefined
                ? `Save to Cloud (Rev ${cloudRevision})`
                : 'Save to Cloud'
            }
            side="bottom"
          >
            <button
              type="button"
              onClick={onCloudSync}
              disabled={isCloudSyncing}
              aria-label="Save to Cloud"
              className="p-1 rounded-[2px] text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:bg-white/10 hover:text-white transition-colors"
            >
              {isCloudSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0078d4]" />
              ) : (
                <Cloud className="h-3.5 w-3.5" />
              )}
            </button>
          </Tooltip>
        )}

        {/* Layout Panel Toggles with Authentic Codicons */}
        <div className="flex items-center border border-[var(--vscode-commandCenter-border,rgba(255,255,255,0.1))] rounded-[3px] bg-white/[0.03] p-0.5">
          <Tooltip label="Toggle Primary Side Bar (Ctrl+B)" side="bottom">
            <button
              type="button"
              onClick={onTogglePrimarySidebar}
              aria-label="Toggle Primary Side Bar"
              aria-pressed={layoutState.primarySidebar.visible}
              className={`p-1 rounded-[2px] transition-colors ${
                layoutState.primarySidebar.visible
                  ? 'text-white bg-white/10'
                  : 'text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Codicon name="layout-sidebar-left" className="text-sm" />
            </button>
          </Tooltip>

          <Tooltip label="Toggle Panel (Ctrl+J)" side="bottom">
            <button
              type="button"
              onClick={onToggleBottomPanel}
              aria-label="Toggle Panel"
              aria-pressed={layoutState.bottomPanel.visible}
              className={`p-1 rounded-[2px] transition-colors ${
                layoutState.bottomPanel.visible
                  ? 'text-white bg-white/10'
                  : 'text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Codicon name="layout-panel" className="text-sm" />
            </button>
          </Tooltip>

          <Tooltip label="Toggle Secondary Side Bar" side="bottom">
            <button
              type="button"
              onClick={onToggleSecondarySidebar}
              aria-label="Toggle Secondary Side Bar"
              aria-pressed={layoutState.secondarySidebar.visible}
              className={`p-1 rounded-[2px] transition-colors ${
                layoutState.secondarySidebar.visible
                  ? 'text-white bg-white/10'
                  : 'text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Codicon name="layout-sidebar-right" className="text-sm" />
            </button>
          </Tooltip>

          {onOpenCustomizeLayout && (
            <Tooltip label="Customize Layout..." side="bottom">
              <button
                type="button"
                onClick={onOpenCustomizeLayout}
                aria-label="Customize Layout"
                className="p-1 rounded-[2px] text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:text-white hover:bg-white/5 transition-colors"
              >
                <Codicon name="layout" className="text-sm" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* User Account Menu */}
        <UserAccountMenu compact={true} />

        {/* Settings Gear */}
        <Tooltip label="Settings (Ctrl+,)" side="bottom">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded-[2px] text-[var(--vscode-titleBar-activeForeground,#cccccc)] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <Codicon name="settings-gear" className="text-sm" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default WorkbenchTitleBar;
