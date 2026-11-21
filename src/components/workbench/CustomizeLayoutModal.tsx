import React, { useEffect, useRef } from 'react';
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

  return (
    <div
      ref={menuRef}
      className="fixed right-3 top-[38px] z-50 w-64 rounded-[4px] border border-[var(--vscode-menu-border,#3c3c3c)] bg-[var(--vscode-menu-background,#252526)] text-[var(--vscode-menu-foreground,#cccccc)] shadow-2xl py-1 text-xs select-none font-sans animate-in fade-in duration-100"
      data-testid="customize-layout-dialog"
      role="menu"
      aria-label="Customize Layout"
    >
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--vscode-tab-inactiveForeground,rgba(255,255,255,0.4))]">
        Visibility
      </div>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isMenuBarVisible}
        onClick={() => toggleVisibility('menuBar')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isMenuBarVisible ? '✓' : ''}</span>
          <span>Menu Bar</span>
        </span>
      </button>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isActivityBarVisible}
        onClick={() => toggleVisibility('activityBar')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isActivityBarVisible ? '✓' : ''}</span>
          <span>Activity Bar</span>
        </span>
      </button>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isPrimarySidebarVisible}
        onClick={() => toggleVisibility('primarySidebar')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isPrimarySidebarVisible ? '✓' : ''}</span>
          <span>Primary Side Bar</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+B</span>
      </button>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isSecondarySidebarVisible}
        onClick={() => toggleVisibility('secondarySidebar')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isSecondarySidebarVisible ? '✓' : ''}</span>
          <span>Secondary Side Bar</span>
        </span>
      </button>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isPanelVisible}
        onClick={() => toggleVisibility('bottomPanel')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isPanelVisible ? '✓' : ''}</span>
          <span>Panel</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+J</span>
      </button>

      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isStatusBarVisible}
        onClick={() => toggleVisibility('statusBar')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{isStatusBarVisible ? '✓' : ''}</span>
          <span>Status Bar</span>
        </span>
      </button>

      <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />

      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--vscode-tab-inactiveForeground,rgba(255,255,255,0.4))]">
        Side Bar Position
      </div>

      <button
        type="button"
        role="menuitemradio"
        aria-checked={currentSidebarPos === 'left'}
        onClick={() => setSidebarPosition('left')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{currentSidebarPos === 'left' ? '•' : ''}</span>
          <span>Left</span>
        </span>
      </button>

      <button
        type="button"
        role="menuitemradio"
        aria-checked={currentSidebarPos === 'right'}
        onClick={() => setSidebarPosition('right')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{currentSidebarPos === 'right' ? '•' : ''}</span>
          <span>Right</span>
        </span>
      </button>

      <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />

      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--vscode-tab-inactiveForeground,rgba(255,255,255,0.4))]">
        Panel Alignment
      </div>

      <button
        type="button"
        role="menuitemradio"
        aria-checked={currentPanelAlignment === 'center'}
        onClick={() => setPanelAlignment('center')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{currentPanelAlignment === 'center' ? '•' : ''}</span>
          <span>Center</span>
        </span>
      </button>

      <button
        type="button"
        role="menuitemradio"
        aria-checked={currentPanelAlignment === 'justify'}
        onClick={() => setPanelAlignment('justify')}
        className="flex w-full items-center justify-between px-3 py-1 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="w-3.5 text-center">{currentPanelAlignment === 'justify' ? '•' : ''}</span>
          <span>Justify</span>
        </span>
      </button>

      <div className="my-1 border-t border-[var(--vscode-menu-separatorBackground,#3c3c3c)]" />

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onResetLayout();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1 text-red-400 hover:bg-[var(--vscode-menu-selectionBackground,#04395e)] hover:text-white transition-colors cursor-pointer"
      >
        <Codicon name="discard" className="text-xs" />
        <span>Reset to Default Layout</span>
      </button>
    </div>
  );
};

export default CustomizeLayoutModal;
