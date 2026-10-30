import React, { useState, useEffect } from 'react';
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
import { CustomizeLayoutModal } from './CustomizeLayoutModal';
import { createDefaultWorkbenchLayout } from '../../services/workbench/workbenchLayoutStore';
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
  // Viewport width tracking for responsive behavior
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1440;
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Separate persistent user layout state from temporary responsive overrides
  const [responsiveSecondaryOverride, setResponsiveSecondaryOverride] = useState<boolean | null>(null);
  const [responsivePrimaryOverride, setResponsivePrimaryOverride] = useState<boolean | null>(null);
  const [isCustomizeLayoutOpen, setIsCustomizeLayoutOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsCustomizeLayoutOpen(true);
    window.addEventListener('workbench:customize-layout', handleOpen);
    return () => window.removeEventListener('workbench:customize-layout', handleOpen);
  }, []);

  // Restore desktop layout when viewport expands (> 900px for secondary, > 640px for primary)
  useEffect(() => {
    if (viewportWidth > 900) {
      setResponsiveSecondaryOverride(null);
    }
    if (viewportWidth > 640) {
      setResponsivePrimaryOverride(null);
    }
  }, [viewportWidth]);

  // Determine effective visibility without mutating persisted preferences
  const effectiveSecondaryVisible = viewportWidth <= 900
    ? (responsiveSecondaryOverride !== null ? responsiveSecondaryOverride : false)
    : layout.secondarySidebar.visible;

  const effectivePrimaryVisible = viewportWidth <= 640
    ? (responsivePrimaryOverride !== null ? responsivePrimaryOverride : false)
    : layout.primarySidebar.visible;

  // Toggle helpers
  const handleTogglePrimarySidebar = () => {
    if (viewportWidth <= 640) {
      setResponsivePrimaryOverride(!effectivePrimaryVisible);
    } else {
      onUpdateLayout((prev) => ({
        ...prev,
        primarySidebar: {
          ...prev.primarySidebar,
          visible: !prev.primarySidebar.visible,
        },
      }));
    }
  };

  const handleToggleSecondarySidebar = () => {
    if (viewportWidth <= 900) {
      setResponsiveSecondaryOverride(!effectiveSecondaryVisible);
    } else {
      onUpdateLayout((prev) => ({
        ...prev,
        secondarySidebar: {
          ...prev.secondarySidebar,
          visible: !prev.secondarySidebar.visible,
        },
      }));
    }
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
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans"
      data-testid="vscode-mode"
    >
      {/* ── Title Bar ── */}
      {layout.menuBar?.visible !== false ? (
        <WorkbenchTitleBar
          projectName={projectName}
          layoutState={{
            ...layout,
            primarySidebar: {
              ...layout.primarySidebar,
              visible: effectivePrimaryVisible,
            },
            secondarySidebar: {
              ...layout.secondarySidebar,
              visible: effectiveSecondaryVisible,
            },
          }}
          onTogglePrimarySidebar={handleTogglePrimarySidebar}
          onToggleSecondarySidebar={handleToggleSecondarySidebar}
          onToggleBottomPanel={handleToggleBottomPanel}
          onApplyPreset={onApplyPreset}
          onOpenCustomizeLayout={() => setIsCustomizeLayoutOpen(true)}
          onOpenQuickOpen={onOpenQuickOpen}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenSettings={onOpenSettings}
          onOpenProjects={onOpenProjects}
          onExit={onExit}
          webcontainerState={webcontainerState}
        />
      ) : (
        <div
          className="group relative h-1.5 w-full bg-transparent hover:h-9 hover:bg-[var(--background)] transition-all z-20 overflow-hidden shrink-0"
          title="Hover to reveal Menu Bar"
        >
          <div className="hidden group-hover:block w-full h-full">
            <WorkbenchTitleBar
              projectName={projectName}
              layoutState={{
                ...layout,
                primarySidebar: {
                  ...layout.primarySidebar,
                  visible: effectivePrimaryVisible,
                },
                secondarySidebar: {
                  ...layout.secondarySidebar,
                  visible: effectiveSecondaryVisible,
                },
              }}
              onTogglePrimarySidebar={handleTogglePrimarySidebar}
              onToggleSecondarySidebar={handleToggleSecondarySidebar}
              onToggleBottomPanel={handleToggleBottomPanel}
              onApplyPreset={onApplyPreset}
              onOpenCustomizeLayout={() => setIsCustomizeLayoutOpen(true)}
              onOpenQuickOpen={onOpenQuickOpen}
              onOpenCommandPalette={onOpenCommandPalette}
              onOpenSettings={onOpenSettings}
              onOpenProjects={onOpenProjects}
              onExit={onExit}
              webcontainerState={webcontainerState}
            />
          </div>
        </div>
      )}

      {/* ── Main Workbench Body ── */}
      <div className={`flex min-h-0 flex-1 overflow-hidden relative ${
        layout.primarySidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Fixed Activity Bar */}
        {layout.activityBar?.visible !== false && (
        <WorkbenchActivityBar
          activeViewId={layout.primarySidebar.activeViewId}
          isSidebarOpen={effectivePrimaryVisible}
          onSelectView={(vid) => {
            if (viewportWidth < 640) {
              if (effectivePrimaryVisible && layout.primarySidebar.activeViewId === vid) {
                setResponsivePrimaryOverride(false);
              } else {
                setResponsivePrimaryOverride(true);
                onUpdateLayout((prev) => ({
                  ...prev,
                  primarySidebar: { ...prev.primarySidebar, activeViewId: vid },
                }));
              }
              return;
            }

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
        )}

        {/* Primary Sidebar (Left) */}
        <WorkbenchPrimarySidebar
          width={layout.primarySidebar.width}
          visible={effectivePrimaryVisible}
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
            if (viewportWidth < 640) {
              setResponsivePrimaryOverride(false);
            } else {
              onUpdateLayout((prev) => ({
                ...prev,
                primarySidebar: { ...prev.primarySidebar, visible: false },
              }));
            }
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
          {/* Editor Area */}
          <WorkbenchEditorArea
            {...editorAreaProps}
            isCenteredLayout={Boolean(layout.modes?.centeredLayout)}
          />

          {/* Bottom Panel */}
          <WorkbenchBottomPanel
            panelAlignment={layout.panelAlignment ?? 'center'}
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
          visible={effectiveSecondaryVisible}
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
            if (viewportWidth < 900) {
              setResponsiveSecondaryOverride(false);
            } else {
              onUpdateLayout((prev) => ({
                ...prev,
                secondarySidebar: { ...prev.secondarySidebar, visible: false },
              }));
            }
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
      {layout.statusBar?.visible !== false && (
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
      )}

      {/* ── Customize Layout Modal ── */}
      <CustomizeLayoutModal
        isOpen={isCustomizeLayoutOpen}
        onClose={() => setIsCustomizeLayoutOpen(false)}
        layoutState={layout}
        onUpdateLayout={onUpdateLayout}
        onResetLayout={() => {
          onUpdateLayout(() => createDefaultWorkbenchLayout());
        }}
      />
    </div>
  );
};
