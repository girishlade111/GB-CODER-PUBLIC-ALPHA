import React, { useRef } from 'react';
import { ViewId, ContainerId } from '../../services/workbench/workbenchTypes';
import { WorkbenchViewContainer } from './WorkbenchViewContainer';

interface WorkbenchSecondarySidebarProps {
  width: number;
  visible: boolean;
  activeViewId: ViewId;
  availableViews: ViewId[];
  onSelectView: (viewId: ViewId) => void;
  onMoveView: (viewId: ViewId, targetContainer: ContainerId) => void;
  onClose: () => void;
  onResize: (newWidth: number) => void;
  renderViewContent: (viewId: ViewId) => React.ReactNode;
  extraHeaderActions?: React.ReactNode;
}

export const WorkbenchSecondarySidebar: React.FC<WorkbenchSecondarySidebarProps> = ({
  width,
  visible,
  activeViewId,
  availableViews,
  onSelectView,
  onMoveView,
  onClose,
  onResize,
  renderViewContent,
  extraHeaderActions,
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
      // Invert delta because resizing from left edge
      const deltaX = startX - moveEvent.clientX;
      const nextWidth = Math.min(800, Math.max(240, startWidth + deltaX));
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
      aria-label="Secondary Sidebar"
      style={{ width: `${width}px` }}
      className="relative flex shrink-0 flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--sidebar)] text-xs select-none z-10"
      data-testid="vscode-right-panel"
    >
      {/* Resize Handle (Left Border) */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize Secondary Sidebar"
        onPointerDown={handlePointerDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--primary)] active:bg-[var(--primary)] transition-colors z-20"
        data-testid="secondary-sidebar-resizer"
      />

      <WorkbenchViewContainer
        containerId="secondary_sidebar"
        containerTitle="Secondary Sidebar"
        activeViewId={activeViewId}
        availableViews={availableViews}
        onSelectView={onSelectView}
        onMoveView={onMoveView}
        onClose={onClose}
        extraHeaderActions={extraHeaderActions}
      >
        {renderViewContent(activeViewId)}
      </WorkbenchViewContainer>
    </aside>
  );
};
