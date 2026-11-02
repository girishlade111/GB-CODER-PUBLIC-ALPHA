import React from 'react';
import { ContainerId, ViewId } from '../../services/workbench/workbenchTypes';

interface WorkbenchViewContainerProps {
  containerId: ContainerId;
  containerTitle: string;
  activeViewId: ViewId;
  availableViews: ViewId[];
  onSelectView: (viewId: ViewId) => void;
  onMoveView: (viewId: ViewId, targetContainer: ContainerId) => void;
  onClose?: () => void;
  extraHeaderActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * GB Coder — Workbench View Container
 * Provides a clean, borderless container for docked panels.
 * Views render their own minimal VS Code / Antigravity IDE action headers directly,
 * eliminating redundant horizontal tab lists and text overflow.
 */
export const WorkbenchViewContainer: React.FC<WorkbenchViewContainerProps> = ({
  children,
}) => {
  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--sidebar)] text-xs">
      {children}
    </div>
  );
};
