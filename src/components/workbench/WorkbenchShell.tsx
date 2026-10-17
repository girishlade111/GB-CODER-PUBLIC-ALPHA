import React from 'react';
import {
  WorkbenchLayoutState,
  LayoutPresetId,
  ViewId,
  ContainerId,
} from '../../services/workbench/workbenchTypes';
import { getViewsForContainer } from '../../services/workbench/workbenchViewRegistry';
import { WorkbenchTitleBar } from './WorkbenchTitleBar';
import { WorkbenchActivityBar } from './WorkbenchActivityBar';
import { WorkbenchPrimarySidebar } from './WorkbenchPrimarySidebar';
import { WorkbenchSecondarySidebar } from './WorkbenchSecondarySidebar';
import { WorkbenchBottomPanel } from './WorkbenchBottomPanel';
import { WorkbenchStatusBar } from './WorkbenchStatusBar';
import { WorkbenchEditorArea } from './WorkbenchEditorArea';
import './workbenchTheme.css';

interface WorkbenchShellProps {
  projectName: string;
  layout: WorkbenchLayoutState;
  onUpdateLayout: (updater: (prev: WorkbenchLayoutState) => WorkbenchLayoutState) => void;
  onApplyPreset: (preset: LayoutPresetId) => void;
  onResetLayout: () => void;
  onOpenSettings: () => void;
  onOpenProjects?: () => void;
  onExit?: () => void;
  onOpenQuickOpen: () => void;
  onOpenCommandPalette: () => void;
  renderViewContent: (viewId: ViewId, containerId: ContainerId) => React.ReactNode;
  editorAreaProps: React.ComponentProps<typeof WorkbenchEditorArea>;
  webcontainerState: {
    isSupported: boolean;
    startupStage: string;
    serverPort: number | null;
    serverUrl?: string | null;
    runtimeError?: { message: string } | null;
  };
  dirtyCount?: number;
  isCodeAssistGenerating?: boolean;
  diagnostics?: { errorCount: number; warningCount: number };
  onOpenSnapshots?: () => void;
  onOpenVoiceCommands?: () => void;
  onOpenCodeRabbit?: () => void;
  onResetContainer?: () => void;
  onNewTerminal?: () => void;
  onToggleSplitTerminal?: () => void;
  cursor?: { line: number; column: number };
  activeLanguage?: string | null;
}

export const WorkbenchShell: React.FC<WorkbenchShellProps> = ({
  projectName,
  layout,
  onUpdateLayout,
  onApplyPreset,
  onOpenSettings,
  onOpenProjects,
  onExit,
  onOpenQuickOpen,
  onOpenCommandPalette,
  renderViewContent,
  editorAreaProps,
  webcontainerState,
  dirtyCount = 0,
  isCodeAssistGenerating = false,
  diagnostics = { errorCount: 0, warningCount: 0 },
  onOpenSnapshots,
  onOpenVoiceCommands,
  onOpenCodeRabbit,
  onResetContainer,
  onNewTerminal,
  onToggleSplitTerminal,
  cursor,
  activeLanguage,
}) => {
  // Toggle helpers
  const handleTogglePrimarySidebar = () => {
    onUpdateLayout((prev) => ({
      ...prev,
      primarySidebar: {
        ...prev.primarySidebar,
        visible: !prev.primarySidebar.visible,
      },
    }));
  };

  const handleToggleSecondarySidebar = () => {
    onUpdateLayout((prev) => ({
      ...prev,
      secondarySidebar: {
        ...prev.secondarySidebar,
        visible: !prev.secondarySidebar.visible,
      },
    }));
  };

  const handleToggleBottomPanel = () => {
    onUpdateLayout((prev) => ({
      ...prev,
      bottomPanel: {
        ...prev.bottomPanel,
        visible: !prev.bottomPanel.visible,
      },
    }));
  };

  // Move view between containers
  const handleMoveView = (viewId: ViewId, targetContainer: ContainerId) => {
    onUpdateLayout((prev) => {
      const nextViewLocations = { ...prev.viewLocations, [viewId]: targetContainer };

      // Ensure target container is visible and has viewId active
      const nextState: WorkbenchLayoutState = {
        ...prev,
        viewLocations: nextViewLocations,
      };

      if (targetContainer === 'primary_sidebar') {
        nextState.primarySidebar = {
          ...prev.primarySidebar,
          visible: true,
          activeViewId: viewId,
        };
      } else if (targetContainer === 'secondary_sidebar') {
        nextState.secondarySidebar = {
          ...prev.secondarySidebar,
          visible: true,
          activeViewId: viewId,
        };
      } else if (targetContainer === 'bottom_panel') {
        nextState.bottomPanel = {
          ...prev.bottomPanel,
          visible: true,
          activeViewId: viewId,
        };
      }

      return nextState;
    });
  };

  // Available views per container
  const primaryViews = getViewsForContainer('primary_sidebar', layout.viewLocations);
  const secondaryViews = getViewsForContainer('secondary_sidebar', layout.viewLocations);
  const bottomViews = getViewsForContainer('bottom_panel', layout.viewLocations);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[#181A20] text-[#E5E9F1]"
      data-testid="vscode-mode"
    >
      {/* ── Title Bar ── */}
      <WorkbenchTitleBar
        projectName={projectName}
        layoutState={layout}
        onTogglePrimarySidebar={handleTogglePrimarySidebar}
        onToggleSecondarySidebar={handleToggleSecondarySidebar}
        onToggleBottomPanel={handleToggleBottomPanel}
        onApplyPreset={onApplyPreset}
        onOpenQuickOpen={onOpenQuickOpen}
        onOpenCommandPalette={onOpenCommandPalette}
        onOpenSettings={onOpenSettings}
        onOpenProjects={onOpenProjects}
        onExit={onExit}
        webcontainerState={webcontainerState}
      />

      {/* ── Main Workbench Body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden relative">
        {/* Fixed Activity Bar */}
        <WorkbenchActivityBar
          activeViewId={layout.primarySidebar.activeViewId}
          isSidebarOpen={layout.primarySidebar.visible}
          onSelectView={(vid) => {
            onUpdateLayout((prev) => {
              // If already visible and clicked again, toggle visibility
              if (prev.primarySidebar.visible && prev.primarySidebar.activeViewId === vid) {
                return {
                  ...prev,
                  primarySidebar: {
                    ...prev.primarySidebar,
                    visible: false,
                  },
                };
              }
              return {
                ...prev,
                primarySidebar: {
                  ...prev.primarySidebar,
                  visible: true,
                  activeViewId: vid,
                },
              };
            });
          }}
          onToggleTerminal={handleToggleBottomPanel}
          isTerminalOpen={layout.bottomPanel.visible}
          dirtyCount={dirtyCount}
          isCodeAssistGenerating={isCodeAssistGenerating}
          onOpenSettings={onOpenSettings}
          onOpenSnapshots={onOpenSnapshots}
          onOpenVoiceCommands={onOpenVoiceCommands}
          onOpenCodeRabbit={onOpenCodeRabbit}
          onResetContainer={onResetContainer}
        />

        {/* Primary Sidebar (Left) */}
        <WorkbenchPrimarySidebar
          width={layout.primarySidebar.width}
          visible={layout.primarySidebar.visible}
          activeViewId={layout.primarySidebar.activeViewId}
          availableViews={primaryViews}
          onSelectView={(vid) => {
            onUpdateLayout((prev) => ({
              ...prev,
              primarySidebar: { ...prev.primarySidebar, activeViewId: vid },
            }));
          }}
          onMoveView={handleMoveView}
          onClose={() => {
            onUpdateLayout((prev) => ({
              ...prev,
              primarySidebar: { ...prev.primarySidebar, visible: false },
            }));
          }}
          onResize={(newWidth) => {
            onUpdateLayout((prev) => ({
              ...prev,
              primarySidebar: { ...prev.primarySidebar, width: newWidth },
            }));
          }}
          renderViewContent={(vid) => renderViewContent(vid, 'primary_sidebar')}
        />

        {/* Center: Editor Area + Docked Bottom Panel */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#181A20]">
          {/* Editor Area */}
          <WorkbenchEditorArea {...editorAreaProps} />

          {/* Bottom Panel */}
          <WorkbenchBottomPanel
            height={layout.bottomPanel.height}
            visible={layout.bottomPanel.visible}
            isMaximized={layout.bottomPanel.isMaximized}
            activeViewId={layout.bottomPanel.activeViewId}
            availableViews={bottomViews}
            onSelectView={(vid) => {
              onUpdateLayout((prev) => ({
                ...prev,
                bottomPanel: { ...prev.bottomPanel, activeViewId: vid },
              }));
            }}
            onMoveView={handleMoveView}
            onToggleMaximize={() => {
              onUpdateLayout((prev) => ({
                ...prev,
                bottomPanel: { ...prev.bottomPanel, isMaximized: !prev.bottomPanel.isMaximized },
              }));
            }}
            onClose={() => {
              onUpdateLayout((prev) => ({
                ...prev,
                bottomPanel: { ...prev.bottomPanel, visible: false },
              }));
            }}
            onResize={(newHeight) => {
              onUpdateLayout((prev) => ({
                ...prev,
                bottomPanel: { ...prev.bottomPanel, height: newHeight },
              }));
            }}
            renderViewContent={(vid) => renderViewContent(vid, 'bottom_panel')}
            diagnostics={diagnostics}
            onNewTerminal={onNewTerminal}
            onToggleSplitTerminal={onToggleSplitTerminal}
          />
        </div>

        {/* Secondary Sidebar (Right) */}
        <WorkbenchSecondarySidebar
          width={layout.secondarySidebar.width}
          visible={layout.secondarySidebar.visible}
          activeViewId={layout.secondarySidebar.activeViewId}
          availableViews={secondaryViews}
          onSelectView={(vid) => {
            onUpdateLayout((prev) => ({
              ...prev,
              secondarySidebar: { ...prev.secondarySidebar, activeViewId: vid },
            }));
          }}
          onMoveView={handleMoveView}
          onClose={() => {
            onUpdateLayout((prev) => ({
              ...prev,
              secondarySidebar: { ...prev.secondarySidebar, visible: false },
            }));
          }}
          onResize={(newWidth) => {
            onUpdateLayout((prev) => ({
              ...prev,
              secondarySidebar: { ...prev.secondarySidebar, width: newWidth },
            }));
          }}
          renderViewContent={(vid) => renderViewContent(vid, 'secondary_sidebar')}
        />
      </div>

      {/* ── Status Bar ── */}
      <WorkbenchStatusBar
        isTerminalOpen={layout.bottomPanel.visible}
        onToggleTerminal={handleToggleBottomPanel}
        onOpenProblems={() => {
          onUpdateLayout((prev) => ({
            ...prev,
            bottomPanel: { ...prev.bottomPanel, visible: true, activeViewId: 'problems' },
          }));
        }}
        diagnostics={diagnostics}
        activeLanguage={activeLanguage}
        cursor={cursor}
        dirtyCount={dirtyCount}
        currentPreset={layout.currentPreset}
        webcontainerState={webcontainerState}
      />
    </div>
  );
};
