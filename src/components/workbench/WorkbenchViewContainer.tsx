import React, { useState } from 'react';
import {
  MoreHorizontal,
  X,
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { ContainerId, ViewId } from '../../services/workbench/workbenchTypes';
import {
  WORKBENCH_VIEWS,
  getViewDefinition,
  isViewAllowedInContainer,
} from '../../services/workbench/workbenchViewRegistry';

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

const CONTAINER_NAMES: Record<ContainerId, string> = {
  primary_sidebar: 'Primary Sidebar (Left)',
  secondary_sidebar: 'Secondary Sidebar (Right)',
  bottom_panel: 'Bottom Panel',
  editor_group: 'Editor Area',
};

export const WorkbenchViewContainer: React.FC<WorkbenchViewContainerProps> = ({
  containerId,
  containerTitle,
  activeViewId,
  availableViews,
  onSelectView,
  onMoveView,
  onClose,
  extraHeaderActions,
  children,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const activeDef = getViewDefinition(activeViewId);

  // Other valid containers where this view can move
  const targetContainers = activeDef.allowedContainers.filter((c) => c !== containerId);

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#20232B] text-xs">
      {/* Container Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#343945] px-2.5 select-none bg-[#20232B]">
        {/* Title or Tab Switcher */}
        <div className="flex items-center gap-1.5 min-w-0">
          {availableViews.length > 1 ? (
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {availableViews.map((vid) => {
                const def = getViewDefinition(vid);
                const isSelected = vid === activeViewId;
                return (
                  <button
                    key={vid}
                    type="button"
                    onClick={() => onSelectView(vid)}
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? 'text-[#E5E9F1] bg-white/10'
                        : 'text-[#697487] hover:text-[#9AA4B5] hover:bg-white/5'
                    }`}
                  >
                    {def.title}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#9AA4B5] truncate">
              {activeDef.title || containerTitle}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {extraHeaderActions}

          {/* Move View Menu */}
          {targetContainers.length > 0 && (
            <div className="relative">
              <Tooltip label="Move view to another panel" side="bottom">
                <button
                  type="button"
                  onClick={() => setShowMoveMenu((prev) => !prev)}
                  className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
                  aria-label="Move view"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                </button>
              </Tooltip>

              {showMoveMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 rounded-md border border-[#343945] bg-[#262A33] p-1 shadow-xl z-50 text-left"
                  data-testid="move-view-menu"
                >
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#697487]">
                    Move {activeDef.title} To...
                  </div>
                  {targetContainers.map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => {
                        onMoveView(activeViewId, target);
                        setShowMoveMenu(false);
                      }}
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] text-[#9AA4B5] hover:bg-white/10 hover:text-[#E5E9F1] transition-colors"
                    >
                      <ArrowRightLeft className="h-3 w-3 text-[#6366F1]" />
                      <span>{CONTAINER_NAMES[target]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Close / Collapse Button */}
          {onClose && (
            <Tooltip label="Hide Panel" side="bottom">
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
                aria-label="Hide Panel"
              >
                <X className="h-3 w-3" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Container Content Body */}
      <div className="min-h-0 flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
