import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Layout,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Share2,
  Settings,
  LogOut,
  Loader2,
  Check,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../ui/Tooltip';
import LadeStackLogo from '../LadeStackLogo';
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
}

const PRESET_LABELS: Record<LayoutPresetId, { label: string; desc: string }> = {
  DEFAULT: { label: 'Default', desc: 'Standard 4-pane developer workbench' },
  FOCUS: { label: 'Focus', desc: 'Maximized editor area, sidebars hidden' },
  PREVIEW_FOCUSED: { label: 'Preview Focused', desc: 'Expanded live preview and editor' },
  AI_WORKFLOW: { label: 'AI Workflow', desc: 'Prominent GB Assist and editor' },
  TERMINAL_FOCUSED: { label: 'Terminal Focused', desc: 'Expanded terminal panel' },
};

export const WorkbenchTitleBar: React.FC<WorkbenchTitleBarProps> = ({
  projectName,
  layoutState,
  onTogglePrimarySidebar,
  onToggleSecondarySidebar,
  onToggleBottomPanel,
  onApplyPreset,
  onOpenCustomizeLayout,
  onOpenQuickOpen,
  onOpenSettings,
  onOpenProjects,
  onExit,
  webcontainerState,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header
      className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-2.5 text-xs text-[var(--foreground)] select-none z-20"
      data-testid="vscode-topbar"
    >
      {/* Left: Branding & Navigation */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onOpenProjects}
          title="Return to Project Dashboard"
          role="button"
          tabIndex={0}
        >
          <LadeStackLogo size={18} subtitle="IDE" />
        </div>

        <div className="hidden md:flex items-center gap-0.5 ml-1 text-[var(--muted-foreground)]">
          <button
            type="button"
            className="rounded p-0.5 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            title="Navigate back"
            aria-label="Back"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded p-0.5 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            title="Navigate forward"
            aria-label="Forward"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Project Breadcrumb */}
        <div className="hidden sm:flex items-center text-[11px] text-[var(--muted-foreground)] font-mono ml-1 truncate max-w-[200px]">
          <span className="text-[var(--muted-foreground)]">gb-coder /</span>
          <span className="text-[var(--foreground)] font-medium ml-1 truncate">{projectName}</span>
        </div>
      </div>

      {/* Center: Command Search / Quick Open */}
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
        className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--sidebar)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)] shadow-inner hover:border-[var(--ring)] hover:text-[var(--foreground)] transition-all cursor-pointer w-64 md:w-80 justify-between select-none"
        title="Quick Open / Search Files (Ctrl+P / Ctrl+Shift+P)"
        aria-label="Quick Open / Command Search"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
          <span className="truncate font-mono text-[11px]">
            {projectName} — Search files (Ctrl+P)
          </span>
        </div>
        <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-1 py-0.2 text-[9px] text-[var(--muted-foreground)] font-mono">
          Ctrl+P
        </kbd>
      </div>

      {/* Right: Controls, Layout Toggles & Status */}
      <div className="flex items-center gap-1.5">
        {/* WebContainer Status Badge */}
        {webcontainerState.isSupported && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[var(--sidebar)] border border-[var(--border)] px-2 py-0.5 text-[10px]">
            {webcontainerState.serverUrl ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">
                  {webcontainerState.serverPort ? `Port ${webcontainerState.serverPort}` : 'Ready'}
                </span>
              </>
            ) : webcontainerState.startupStage === 'booting' ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin text-indigo-400" />
                <span className="text-indigo-300">Booting Runtime</span>
              </>
            ) : webcontainerState.startupStage === 'installing' ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" />
                <span className="text-cyan-300">Installing Deps</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">WebContainer Ready</span>
              </>
            )}
          </div>
        )}

        {/* Layout Preset Selector */}
        <div className="relative">
          <Tooltip label="Layout Presets" side="bottom">
            <button
              type="button"
              onClick={() => setShowPresetsMenu((prev) => !prev)}
              className="flex items-center gap-1 rounded bg-[var(--sidebar)] hover:bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
              aria-label="Layout Presets"
              data-testid="workbench-preset-button"
            >
              <Layout className="h-3 w-3 text-[var(--muted-foreground)]" />
              <span className="hidden xl:inline text-[10px] font-medium">
                {PRESET_LABELS[layoutState.currentPreset]?.label || 'Preset'}
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-[var(--muted-foreground)]" />
            </button>
          </Tooltip>

          {showPresetsMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-52 rounded-md border border-[var(--border)] bg-[var(--sidebar)] p-1 shadow-xl z-50 text-left"
              data-testid="workbench-presets-menu"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Workbench Presets
              </div>
              {(Object.keys(PRESET_LABELS) as LayoutPresetId[]).map((preset) => {
                const info = PRESET_LABELS[preset];
                const isSelected = layoutState.currentPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onApplyPreset(preset);
                      setShowPresetsMenu(false);
                      toast.success(`Applied ${info.label} layout preset`);
                    }}
                    className={`flex w-full items-start justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)] hover:bg-white/5 hover:text-[var(--foreground)]'
                    }`}
                    data-testid={`preset-option-${preset.toLowerCase()}`}
                  >
                    <div>
                      <div className="font-medium text-[11px] flex items-center gap-1">
                        {info.label}
                        {isSelected && <Check className="h-3 w-3 text-[var(--primary)]" />}
                      </div>
                      <div className="text-[9px] text-[var(--muted-foreground)] leading-tight">{info.desc}</div>
                    </div>
                  </button>
                );
              })}
              {onOpenCustomizeLayout && (
                <div className="mt-1 border-t border-[var(--border)] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPresetsMenu(false);
                      onOpenCustomizeLayout();
                    }}
                    className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs text-sky-400 hover:bg-white/5 transition-colors font-medium"
                    data-testid="preset-customize-layout-option"
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
                      <line x1="5.5" y1="2" x2="5.5" y2="14" />
                      <line x1="5.5" y1="6" x2="14.5" y2="6" />
                    </svg>
                    <span>Customize Layout...</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Layout Panel Toggles */}
        <div className="flex items-center rounded bg-[var(--sidebar)] border border-[var(--border)] p-0.5">
          {onOpenCustomizeLayout && (
            <Tooltip label="Customize Layout" side="bottom">
              <button
                type="button"
                onClick={onOpenCustomizeLayout}
                aria-label="Customize Layout"
                data-testid="customize-layout-btn"
                className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
                  <line x1="5.5" y1="2" x2="5.5" y2="14" />
                  <line x1="5.5" y1="6" x2="14.5" y2="6" />
                </svg>
              </button>
            </Tooltip>
          )}
          <Tooltip label="Toggle Primary Sidebar (Ctrl+B)" side="bottom">
            <button
              type="button"
              onClick={onTogglePrimarySidebar}
              aria-label="Toggle Primary Sidebar"
              aria-pressed={layoutState.primarySidebar.visible}
              data-testid="toggle-primary-sidebar-btn"
              className={`rounded p-1 transition-colors ${
                layoutState.primarySidebar.visible
                  ? 'text-[var(--primary)] bg-white/5'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <PanelLeft className="h-3 w-3" />
            </button>
          </Tooltip>

          <Tooltip label="Toggle Bottom Panel (Ctrl+J)" side="bottom">
            <button
              type="button"
              onClick={onToggleBottomPanel}
              aria-label="Toggle Bottom Panel"
              aria-pressed={layoutState.bottomPanel.visible}
              data-testid="toggle-bottom-panel-btn"
              className={`rounded p-1 transition-colors ${
                layoutState.bottomPanel.visible
                  ? 'text-[var(--primary)] bg-white/5'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <PanelBottom className="h-3 w-3" />
            </button>
          </Tooltip>

          <Tooltip label="Toggle Secondary Sidebar" side="bottom">
            <button
              type="button"
              onClick={onToggleSecondarySidebar}
              aria-label="Toggle Secondary Sidebar"
              aria-pressed={layoutState.secondarySidebar.visible}
              data-testid="toggle-secondary-sidebar-btn"
              className={`rounded p-1 transition-colors ${
                layoutState.secondarySidebar.visible
                  ? 'text-[var(--primary)] bg-white/5'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <PanelRight className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>

        {/* Share Button */}
        <Tooltip label="Share Project Link" side="bottom">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(window.location.href);
              toast.success('Workspace URL copied to clipboard!');
            }}
            className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            aria-label="Share Project"
            data-testid="workbench-share-btn"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip label="Workbench Settings" side="bottom">
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            aria-label="Workbench Settings"
            data-testid="workbench-settings-btn"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        {/* Exit Button */}
        {onExit && (
          <Tooltip label="Exit Advanced IDE" side="bottom">
            <button
              type="button"
              onClick={onExit}
              className="rounded p-1 text-[var(--muted-foreground)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              aria-label="Exit Mode"
              data-testid="workbench-exit-btn"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};
