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
  onOpenQuickOpen,
  onOpenSettings,
  onOpenProjects,
  onExit,
  webcontainerState,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header
      className="flex h-9 shrink-0 items-center justify-between border-b border-[#343945] bg-[#181A20] px-2.5 text-xs text-[#E5E9F1] select-none z-20"
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

        <div className="hidden md:flex items-center gap-0.5 ml-1 text-[#697487]">
          <button
            type="button"
            className="rounded p-0.5 hover:text-[#E5E9F1] hover:bg-white/5 transition-colors"
            title="Navigate back"
            aria-label="Back"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded p-0.5 hover:text-[#E5E9F1] hover:bg-white/5 transition-colors"
            title="Navigate forward"
            aria-label="Forward"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Project Breadcrumb */}
        <div className="hidden sm:flex items-center text-[11px] text-[#9AA4B5] font-mono ml-1 truncate max-w-[200px]">
          <span className="text-[#697487]">gb-coder /</span>
          <span className="text-[#E5E9F1] font-medium ml-1 truncate">{projectName}</span>
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
        className="flex items-center gap-2 rounded border border-[#343945] bg-[#20232B] px-2.5 py-1 text-[11px] text-[#9AA4B5] shadow-inner hover:border-[#6366F1]/50 hover:text-[#E5E9F1] transition-all cursor-pointer w-64 md:w-80 justify-between select-none"
        title="Quick Open / Search Files (Ctrl+P / Ctrl+Shift+P)"
        aria-label="Quick Open / Command Search"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="h-3 w-3 text-[#697487] shrink-0" />
          <span className="truncate font-mono text-[11px]">
            {projectName} — Search files (Ctrl+P)
          </span>
        </div>
        <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-1 py-0.2 text-[9px] text-[#697487] font-mono">
          Ctrl+P
        </kbd>
      </div>

      {/* Right: Controls, Layout Toggles & Status */}
      <div className="flex items-center gap-1.5">
        {/* WebContainer Status Badge */}
        {webcontainerState.isSupported && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#20232B] border border-[#343945] px-2 py-0.5 text-[10px]">
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
              className="flex items-center gap-1 rounded bg-[#20232B] hover:bg-[#262A33] px-2 py-1 text-[11px] text-[#9AA4B5] hover:text-[#E5E9F1] border border-[#343945] transition-colors"
              aria-label="Layout Presets"
              data-testid="workbench-preset-button"
            >
              <Layout className="h-3 w-3 text-[#697487]" />
              <span className="hidden xl:inline text-[10px] font-medium">
                {PRESET_LABELS[layoutState.currentPreset]?.label || 'Preset'}
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-[#697487]" />
            </button>
          </Tooltip>

          {showPresetsMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-52 rounded-md border border-[#343945] bg-[#20232B] p-1 shadow-xl z-50 text-left"
              data-testid="workbench-presets-menu"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#697487]">
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
                        ? 'bg-[#6366F1]/20 text-[#E5E9F1]'
                        : 'text-[#9AA4B5] hover:bg-white/5 hover:text-[#E5E9F1]'
                    }`}
                    data-testid={`preset-option-${preset.toLowerCase()}`}
                  >
                    <div>
                      <div className="font-medium text-[11px] flex items-center gap-1">
                        {info.label}
                        {isSelected && <Check className="h-3 w-3 text-[#6366F1]" />}
                      </div>
                      <div className="text-[9px] text-[#697487] leading-tight">{info.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Layout Panel Toggles */}
        <div className="flex items-center rounded bg-[#20232B] border border-[#343945] p-0.5">
          <Tooltip label="Toggle Primary Sidebar (Ctrl+B)" side="bottom">
            <button
              type="button"
              onClick={onTogglePrimarySidebar}
              aria-label="Toggle Primary Sidebar"
              aria-pressed={layoutState.primarySidebar.visible}
              data-testid="toggle-primary-sidebar-btn"
              className={`rounded p-1 transition-colors ${
                layoutState.primarySidebar.visible
                  ? 'text-[#6366F1] bg-white/5'
                  : 'text-[#697487] hover:text-[#E5E9F1]'
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
                  ? 'text-[#6366F1] bg-white/5'
                  : 'text-[#697487] hover:text-[#E5E9F1]'
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
                  ? 'text-[#6366F1] bg-white/5'
                  : 'text-[#697487] hover:text-[#E5E9F1]'
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
            className="rounded p-1 text-[#9AA4B5] hover:text-[#E5E9F1] hover:bg-white/5 transition-colors"
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
            className="rounded p-1 text-[#9AA4B5] hover:text-[#E5E9F1] hover:bg-white/5 transition-colors"
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
              className="rounded p-1 text-[#9AA4B5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
