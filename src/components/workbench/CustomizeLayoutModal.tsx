import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  WorkbenchLayoutState,
  PrimarySidebarPosition,
  PanelAlignment,
} from '../../services/workbench/workbenchTypes';
import Codicon from '../ui/Codicon';

interface CustomizeLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutState: WorkbenchLayoutState;
  onUpdateLayout: (updater: (prev: WorkbenchLayoutState) => WorkbenchLayoutState) => void;
  onResetLayout: () => void;
}

/**
 * Authentic VS Code Layout Anchored Menu.
 * Replaces the oversized modal with a compact, anchored dropdown attached directly
 * under the title bar layout icon matching vscode.dev.
 */
export const CustomizeLayoutModal: React.FC<CustomizeLayoutModalProps> = ({
  isOpen,
  onClose,
  layoutState,
  onUpdateLayout,
  onResetLayout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMenuBarVisible = layoutState.menuBar?.visible ?? true;
  const isActivityBarVisible = layoutState.activityBar?.visible ?? true;
  const isPrimarySidebarVisible = layoutState.primarySidebar.visible;
  const isSecondarySidebarVisible = layoutState.secondarySidebar.visible;
  const isPanelVisible = layoutState.bottomPanel.visible;
  const isStatusBarVisible = layoutState.statusBar?.visible ?? true;
  const currentSidebarPos: PrimarySidebarPosition = layoutState.primarySidebarPosition ?? 'left';
  const currentPanelAlignment: PanelAlignment = layoutState.panelAlignment ?? 'center';
  const currentQuickInputPos = layoutState.quickInputPosition ?? 'top';

  const toggleVisibility = (
    key: 'menuBar' | 'activityBar' | 'primarySidebar' | 'secondarySidebar' | 'bottomPanel' | 'statusBar',
  ) => {
    onUpdateLayout((prev) => {
      switch (key) {
        case 'menuBar':
          return { ...prev, menuBar: { visible: !(prev.menuBar?.visible ?? true) } };
        case 'activityBar':
          return { ...prev, activityBar: { visible: !(prev.activityBar?.visible ?? true) } };
        case 'primarySidebar':
          return { ...prev, primarySidebar: { ...prev.primarySidebar, visible: !prev.primarySidebar.visible } };
        case 'secondarySidebar':
          return { ...prev, secondarySidebar: { ...prev.secondarySidebar, visible: !prev.secondarySidebar.visible } };
        case 'bottomPanel':
          return { ...prev, bottomPanel: { ...prev.bottomPanel, visible: !prev.bottomPanel.visible } };
        case 'statusBar':
          return { ...prev, statusBar: { visible: !(prev.statusBar?.visible ?? true) } };
        default:
          return prev;
      }
    });
  };

  const setSidebarPosition = (pos: PrimarySidebarPosition) => {
    onUpdateLayout((prev) => ({
      ...prev,
      primarySidebarPosition: pos,
    }));
  };

  const setPanelAlignment = (align: PanelAlignment) => {
    onUpdateLayout((prev) => ({
      ...prev,
      panelAlignment: align,
    }));
  };

  const setQuickInputPos = (pos: 'top' | 'center') => {
    onUpdateLayout((prev) => ({
      ...prev,
      quickInputPosition: pos,
    }));
  };

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex justify-center items-start pt-3 bg-black/40 select-none animate-in fade-in duration-75"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Customize Layout"
    >
      <div
        ref={menuRef}
        className="w-[520px] max-w-[95vw] rounded-[6px] border border-[#3c3c3c] bg-[#1f1f1f] text-[#cccccc] shadow-2xl overflow-hidden font-sans text-xs"
        onClick={(e) => e.stopPropagation()}
        data-testid="customize-layout-dialog"
      >
        {/* Header Bar */}
        <div className="flex h-9 items-center justify-between border-b border-[#2b2b2b] bg-[#252526] px-3">
          <span className="text-[13px] font-medium text-white mx-auto">Customize Layout</span>
          <div className="flex items-center gap-1 absolute right-2">
            <button
              type="button"
              onClick={() => {
                onResetLayout();
                onClose();
              }}
              title="Reset to Default Layout"
              className="flex h-6 w-6 items-center justify-center rounded text-[#858585] hover:text-white hover:bg-white/10 transition-colors"
            >
              <Codicon name="discard" className="text-[13px]" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#858585] hover:text-white hover:bg-white/10 transition-colors"
            >
              <Codicon name="close" className="text-[13px]" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-[75vh] overflow-y-auto p-1 space-y-0.5">
          {/* Menu Bar */}
          <div
            onClick={() => toggleVisibility('menuBar')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isMenuBarVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="menu" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Menu Bar</span>
            </div>
            <span className="text-[11px] text-[#858585] group-hover:text-white">Visibility</span>
          </div>

          {/* Activity Bar */}
          <div
            onClick={() => toggleVisibility('activityBar')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isActivityBarVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="layout-activitybar-left" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Activity Bar</span>
            </div>
          </div>

          {/* Primary Side Bar */}
          <div
            onClick={() => toggleVisibility('primarySidebar')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isPrimarySidebarVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="layout-sidebar-left" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Primary Side Bar</span>
            </div>
            <span className="text-[11px] font-mono text-[#858585] group-hover:text-white">Ctrl + B</span>
          </div>

          {/* Secondary Side Bar */}
          <div
            onClick={() => toggleVisibility('secondarySidebar')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isSecondarySidebarVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="layout-sidebar-right" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Secondary Side Bar</span>
            </div>
            <span className="text-[11px] font-mono text-[#858585] group-hover:text-white">Ctrl + Alt + B</span>
          </div>

          {/* Panel */}
          <div
            onClick={() => toggleVisibility('bottomPanel')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isPanelVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="layout-panel" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Panel</span>
            </div>
            <span className="text-[11px] font-mono text-[#858585] group-hover:text-white">Ctrl + J</span>
          </div>

          {/* Status Bar */}
          <div
            onClick={() => toggleVisibility('statusBar')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{isStatusBarVisible ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <Codicon name="layout-statusbar" className="text-[14px] text-[#75beff]" />
              <span className="text-white">Status Bar</span>
            </div>
          </div>

          <div className="my-1 border-t border-[#2b2b2b]" />

          {/* Primary Side Bar Position */}
          <div
            onClick={() => setSidebarPosition('left')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentSidebarPos === 'left' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Left</span>
            </div>
            <span className="text-[11px] text-[#858585] group-hover:text-white">Primary Side Bar Position</span>
          </div>
          <div
            onClick={() => setSidebarPosition('right')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentSidebarPos === 'right' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Right</span>
            </div>
          </div>

          <div className="my-1 border-t border-[#2b2b2b]" />

          {/* Panel Alignment */}
          <div
            onClick={() => setPanelAlignment('left')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentPanelAlignment === 'left' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Left</span>
            </div>
            <span className="text-[11px] text-[#858585] group-hover:text-white">Panel Alignment</span>
          </div>
          <div
            onClick={() => setPanelAlignment('right')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentPanelAlignment === 'right' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Right</span>
            </div>
          </div>
          <div
            onClick={() => setPanelAlignment('center')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentPanelAlignment === 'center' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Center</span>
            </div>
          </div>
          <div
            onClick={() => setPanelAlignment('justify')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentPanelAlignment === 'justify' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Justify</span>
            </div>
          </div>

          <div className="my-1 border-t border-[#2b2b2b]" />

          {/* Quick Input Position */}
          <div
            onClick={() => setQuickInputPos('top')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentQuickInputPos === 'top' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Top</span>
            </div>
            <span className="text-[11px] text-[#858585] group-hover:text-white">Quick Input Position</span>
          </div>
          <div
            onClick={() => setQuickInputPos('center')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-[2px] cursor-pointer hover:bg-[#04395e] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 flex items-center justify-center">{currentQuickInputPos === 'center' ? <Codicon name="check" className="text-[12px] text-[#0078d4] group-hover:text-white" /> : null}</span>
              <span className="text-white">Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default CustomizeLayoutModal;
