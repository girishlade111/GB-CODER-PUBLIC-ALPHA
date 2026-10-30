import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  X,
  Eye,
  Maximize2,
  Minimize2,
  ArrowUp,
  CircleDot,
  Check,
} from 'lucide-react';
import {
  WorkbenchLayoutState,
  PrimarySidebarPosition,
  PanelAlignment,
  QuickInputPosition,
} from '../../services/workbench/workbenchTypes';
import toast from 'react-hot-toast';

interface CustomizeLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutState: WorkbenchLayoutState;
  onUpdateLayout: (updater: (prev: WorkbenchLayoutState) => WorkbenchLayoutState) => void;
  onResetLayout: () => void;
}

/**
 * Precision schematic wireframe icon matching VS Code & Google Antigravity IDE layout items.
 */
const WireframeIcon: React.FC<{
  type:
    | 'menubar'
    | 'activitybar'
    | 'secondaryActivitybar'
    | 'primarySidebar'
    | 'secondarySidebar'
    | 'panel'
    | 'statusbar'
    | 'pos-left'
    | 'pos-right'
    | 'align-left'
    | 'align-right'
    | 'align-center'
    | 'align-justify'
    | 'input-top'
    | 'input-center'
    | 'fullscreen'
    | 'zen'
    | 'centered';
  active?: boolean;
}> = ({ type, active = false }) => {
  if (type === 'input-top') {
    return <ArrowUp className="h-4 w-4 text-[var(--foreground)]" strokeWidth={1.5} />;
  }
  if (type === 'input-center') {
    return <CircleDot className="h-4 w-4 text-[var(--foreground)]" strokeWidth={1.5} />;
  }
  if (type === 'fullscreen') {
    return <Maximize2 className="h-4 w-4 text-[var(--foreground)]" strokeWidth={1.5} />;
  }
  if (type === 'zen') {
    return (
      <svg className="h-4 w-4 text-[var(--foreground)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="3" fill={active ? 'currentColor' : 'none'} />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4 text-[var(--foreground)] shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Base Window Frame */}
      <rect x="1.5" y="2" width="13" height="12" rx="1.5" stroke="currentColor" />

      {/* Menu Bar */}
      {type === 'menubar' && (
        <rect
          x="1.5"
          y="2"
          width="13"
          height="3"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Activity Bar */}
      {type === 'activitybar' && (
        <rect
          x="1.5"
          y="2"
          width="2.5"
          height="12"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Secondary Activity Bar */}
      {type === 'secondaryActivitybar' && (
        <rect
          x="12"
          y="2"
          width="2.5"
          height="12"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Primary Side Bar */}
      {type === 'primarySidebar' && (
        <rect
          x="1.5"
          y="2"
          width="4.5"
          height="12"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Secondary Side Bar */}
      {type === 'secondarySidebar' && (
        <rect
          x="10"
          y="2"
          width="4.5"
          height="12"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Bottom Panel */}
      {type === 'panel' && (
        <rect
          x="1.5"
          y="9"
          width="13"
          height="5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Status Bar */}
      {type === 'statusbar' && (
        <rect
          x="1.5"
          y="11.5"
          width="13"
          height="2.5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
      )}

      {/* Primary Sidebar Pos: Left */}
      {type === 'pos-left' && (
        <rect x="1.5" y="2" width="5" height="12" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Primary Sidebar Pos: Right */}
      {type === 'pos-right' && (
        <rect x="9.5" y="2" width="5" height="12" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Panel Alignment: Left */}
      {type === 'align-left' && (
        <rect x="1.5" y="8" width="6" height="6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Panel Alignment: Right */}
      {type === 'align-right' && (
        <rect x="8.5" y="8" width="6" height="6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Panel Alignment: Center */}
      {type === 'align-center' && (
        <rect x="4.5" y="8" width="7" height="6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Panel Alignment: Justify */}
      {type === 'align-justify' && (
        <rect x="1.5" y="8" width="13" height="6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}

      {/* Centered Layout */}
      {type === 'centered' && (
        <rect x="4.5" y="2" width="7" height="12" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      )}
    </svg>
  );
};

export const CustomizeLayoutModal: React.FC<CustomizeLayoutModalProps> = ({
  isOpen,
  onClose,
  layoutState,
  onUpdateLayout,
  onResetLayout,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation & closing
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle Visibility helpers
  const isMenuBarVisible = layoutState.menuBar?.visible ?? true;
  const isActivityBarVisible = layoutState.activityBar?.visible ?? true;
  const isSecondaryActivityBarVisible = layoutState.secondaryActivityBar?.visible ?? false;
  const isPrimarySidebarVisible = layoutState.primarySidebar.visible;
  const isSecondarySidebarVisible = layoutState.secondarySidebar.visible;
  const isPanelVisible = layoutState.bottomPanel.visible;
  const isStatusBarVisible = layoutState.statusBar?.visible ?? true;

  const currentSidebarPos: PrimarySidebarPosition = layoutState.primarySidebarPosition ?? 'left';
  const currentPanelAlignment: PanelAlignment = layoutState.panelAlignment ?? 'center';
  const currentQuickInputPos: QuickInputPosition = layoutState.quickInputPosition ?? 'center';
  const isZenMode = Boolean(layoutState.modes?.zenMode);
  const isCenteredLayout = Boolean(layoutState.modes?.centeredLayout);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleZenMode = () => {
    onUpdateLayout((prev) => {
      const willBeZen = !prev.modes?.zenMode;
      if (willBeZen) {
        toast('Entered Zen Mode (Press Ctrl+K Z to exit)', { icon: '🧘' });
        return {
          ...prev,
          activityBar: { visible: false },
          primarySidebar: { ...prev.primarySidebar, visible: false },
          secondarySidebar: { ...prev.secondarySidebar, visible: false },
          bottomPanel: { ...prev.bottomPanel, visible: false },
          statusBar: { visible: false },
          modes: {
            zenMode: true,
            centeredLayout: true,
          },
        };
      } else {
        toast('Exited Zen Mode', { icon: '✨' });
        return {
          ...prev,
          activityBar: { visible: true },
          primarySidebar: { ...prev.primarySidebar, visible: true },
          secondarySidebar: { ...prev.secondarySidebar, visible: true },
          bottomPanel: { ...prev.bottomPanel, visible: true },
          statusBar: { visible: true },
          modes: {
            zenMode: false,
            centeredLayout: false,
          },
        };
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Customize Layout"
      data-testid="customize-layout-dialog"
    >
      <div
        className="w-full max-w-[640px] rounded-lg border border-[var(--border)] bg-[#1e1e1e] text-[var(--foreground)] shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex h-10 items-center justify-between border-b border-[var(--border)] bg-[#181818] px-4">
          <span className="text-xs font-medium text-slate-300">Customize Layout</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetLayout();
                toast.success('Layout reset to default');
              }}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset Layout"
              aria-label="Reset Layout"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Items List */}
        <div className="max-h-[75vh] overflow-y-auto py-1 text-xs">
          {/* ──── Section: Visibility ──── */}
          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                menuBar: { visible: !isMenuBarVisible },
              }));
            }}
            className="group flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="menubar" active={isMenuBarVisible} />
              <span className="text-slate-200">Menu Bar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#007acc] text-[11px] font-medium">
              <Eye className="h-3.5 w-3.5" />
              <span>Visibility</span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                activityBar: { visible: !isActivityBarVisible },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="activitybar" active={isActivityBarVisible} />
              <span className="text-slate-200">Activity Bar</span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                secondaryActivityBar: { visible: !isSecondaryActivityBarVisible },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="secondaryActivitybar" active={isSecondaryActivityBarVisible} />
              <span className="text-slate-200">Secondary Activity Bar</span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                primarySidebar: {
                  ...p.primarySidebar,
                  visible: !isPrimarySidebarVisible,
                },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="primarySidebar" active={isPrimarySidebarVisible} />
              <span className="text-slate-200">Primary Side Bar</span>
            </div>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              Ctrl + B
            </kbd>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                secondarySidebar: {
                  ...p.secondarySidebar,
                  visible: !isSecondarySidebarVisible,
                },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="secondarySidebar" active={isSecondarySidebarVisible} />
              <span className="text-slate-200">Secondary Side Bar</span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                bottomPanel: {
                  ...p.bottomPanel,
                  visible: !isPanelVisible,
                },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="panel" active={isPanelVisible} />
              <span className="text-slate-200">Panel</span>
            </div>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              Ctrl + J
            </kbd>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                statusBar: { visible: !isStatusBarVisible },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="statusbar" active={isStatusBarVisible} />
              <span className="text-slate-200">Status Bar</span>
            </div>
          </div>

          <div className="border-t border-[var(--border)] my-1" />

          {/* ──── Section: Primary Side Bar Position ──── */}
          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, primarySidebarPosition: 'left' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="pos-left" active={currentSidebarPos === 'left'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Left {currentSidebarPos === 'left' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
            <span className="text-[#007acc] text-[11px] font-medium">Primary Side Bar Position</span>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, primarySidebarPosition: 'right' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="pos-right" active={currentSidebarPos === 'right'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Right {currentSidebarPos === 'right' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--border)] my-1" />

          {/* ──── Section: Panel Alignment ──── */}
          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, panelAlignment: 'left' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="align-left" active={currentPanelAlignment === 'left'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Left {currentPanelAlignment === 'left' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
            <span className="text-[#007acc] text-[11px] font-medium">Panel Alignment</span>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, panelAlignment: 'right' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="align-right" active={currentPanelAlignment === 'right'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Right {currentPanelAlignment === 'right' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, panelAlignment: 'center' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="align-center" active={currentPanelAlignment === 'center'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Center {currentPanelAlignment === 'center' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, panelAlignment: 'justify' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="align-justify" active={currentPanelAlignment === 'justify'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Justify {currentPanelAlignment === 'justify' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--border)] my-1" />

          {/* ──── Section: Quick Input Position ──── */}
          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, quickInputPosition: 'top' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="input-top" active={currentQuickInputPos === 'top'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Top {currentQuickInputPos === 'top' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
            <span className="text-[#007acc] text-[11px] font-medium">Quick Input Position</span>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({ ...p, quickInputPosition: 'center' }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="input-center" active={currentQuickInputPos === 'center'} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Center {currentQuickInputPos === 'center' && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--border)] my-1" />

          {/* ──── Section: Modes ──── */}
          <div
            onClick={toggleFullScreen}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="fullscreen" active={isFullscreen} />
              <span className="text-slate-200">Full Screen</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#007acc] text-[11px] font-medium">Modes</span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                F11
              </kbd>
            </div>
          </div>

          <div
            onClick={toggleZenMode}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="zen" active={isZenMode} />
              <span className="text-slate-200">Zen Mode</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                Ctrl
              </kbd>
              <span className="text-slate-500 text-[10px]">+</span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                K
              </kbd>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono ml-1">
                Z
              </kbd>
            </div>
          </div>

          <div
            onClick={() => {
              onUpdateLayout((p) => ({
                ...p,
                modes: {
                  ...p.modes,
                  zenMode: Boolean(p.modes?.zenMode),
                  centeredLayout: !isCenteredLayout,
                },
              }));
            }}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <WireframeIcon type="centered" active={isCenteredLayout} />
              <span className="text-slate-200 flex items-center gap-1.5">
                Centered Layout {isCenteredLayout && <Check className="h-3 w-3 text-sky-400" />}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeLayoutModal;
