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
      className="relative flex shrink-0 flex-col overflow-hidden border-r border-[#343945] bg-[#20232B] text-xs select-none z-10"
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

      {/* Resize Handle (Right Border) */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize Primary Sidebar"
        onPointerDown={handlePointerDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#6366F1] active:bg-[#6366F1] transition-colors z-20"
        data-testid="primary-sidebar-resizer"
      />
    </aside>
  );
};
