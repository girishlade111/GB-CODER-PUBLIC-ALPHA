import React, { useRef } from 'react';
import { ViewId, ContainerId } from '../../services/workbench/workbenchTypes';
import { WorkbenchViewContainer } from './WorkbenchViewContainer';

interface WorkbenchPrimarySidebarProps {
  width: number;
  visible: boolean;
  activeViewId: ViewId;
  availableViews: ViewId[];
  onSelectView: (viewId: ViewId) => void;
  onMoveView: (viewId: ViewId, targetContainer: ContainerId) => void;
  onClose: () => void;
  onResize: (newWidth: number) => void;
  renderViewContent: (viewId: ViewId) => React.ReactNode;
}

export const WorkbenchPrimarySidebar: React.FC<WorkbenchPrimarySidebarProps> = ({
  width,
  visible,
  activeViewId,
  availableViews,
  onSelectView,
  onMoveView,
  onClose,
  onResize,
  renderViewContent,
}) => {
  const isDraggingRef = useRef(false);

  if (!visible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.min(600, Math.max(180, startWidth + deltaX));
      onResize(nextWidth);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <aside
      role="region"
      aria-label="Primary Sidebar"
      style={{ width: `${width}px` }}
      className="group relative flex h-full shrink-0 flex-col overflow-hidden rounded-lg border border-[#2b2b2b] bg-[#181818] text-xs select-none shadow-sm z-10"
      data-testid="vscode-explorer"
    >
      <WorkbenchViewContainer
        containerId="primary_sidebar"
        containerTitle="Primary Sidebar"
        activeViewId={activeViewId}
        availableViews={availableViews}
        onSelectView={onSelectView}
        onMoveView={onMoveView}
        onClose={onClose}
      >
        {renderViewContent(activeViewId)}
      </WorkbenchViewContainer>

      {/* Modern VS Code Smooth Sash Resizer with Centered Pill Grip */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize Primary Sidebar"
        onPointerDown={handlePointerDown}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#0078d4]/30 active:bg-[#0078d4] transition-colors z-20 flex items-center justify-center select-none"
        data-testid="primary-sidebar-resizer"
        title="Drag to resize Primary Sidebar"
      >
        <div className="h-6 w-0.5 rounded-full bg-[#3c3c3c] group-hover:bg-[#0078d4] transition-colors" />
      </div>
    </aside>
  );
};
