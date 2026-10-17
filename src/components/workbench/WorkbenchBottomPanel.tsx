import React, { useRef } from 'react';
import {
  TerminalSquare,
  AlertTriangle,
  FileText,
  Radio,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Columns,
  Trash2,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { ViewId, ContainerId } from '../../services/workbench/workbenchTypes';
import { getViewDefinition } from '../../services/workbench/workbenchViewRegistry';

interface WorkbenchBottomPanelProps {
  height: number;
  visible: boolean;
  isMaximized: boolean;
  activeViewId: ViewId;
  availableViews: ViewId[];
  onSelectView: (viewId: ViewId) => void;
  onMoveView: (viewId: ViewId, targetContainer: ContainerId) => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onResize: (newHeight: number) => void;
  renderViewContent: (viewId: ViewId) => React.ReactNode;
  diagnostics?: { errorCount: number; warningCount: number };
  onNewTerminal?: () => void;
  onToggleSplitTerminal?: () => void;
  onClearTerminal?: () => void;
}

export const WorkbenchBottomPanel: React.FC<WorkbenchBottomPanelProps> = ({
  height,
  visible,
  isMaximized,
  activeViewId,
  availableViews,
  onSelectView,
  onMoveView,
  onToggleMaximize,
  onClose,
  onResize,
  renderViewContent,
  diagnostics = { errorCount: 0, warningCount: 0 },
  onNewTerminal,
  onToggleSplitTerminal,
  onClearTerminal,
}) => {
  const isDraggingRef = useRef(false);

  if (!visible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const startHeight = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startY - moveEvent.clientY;
      const maxHeight = typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.75) : 600;
      const nextHeight = Math.min(maxHeight, Math.max(96, startHeight + deltaY));
      onResize(nextHeight);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const effectiveHeight = isMaximized ? 'calc(100% - 36px)' : `${height}px`;

  return (
    <div
      role="region"
      aria-label="Bottom Panel"
      style={{ height: effectiveHeight }}
      className={`relative flex shrink-0 flex-col overflow-hidden border-t border-[#343945] bg-[#181A20] text-xs select-none z-10 ${
        isMaximized ? 'absolute inset-x-0 bottom-6 top-9 z-30' : ''
      }`}
      data-testid="vscode-terminal-dock"
    >
      {/* Top Resize Handle */}
      {!isMaximized && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize Bottom Panel"
          onPointerDown={handlePointerDown}
          className="absolute left-0 right-0 top-0 h-1 cursor-row-resize hover:bg-[#6366F1] active:bg-[#6366F1] transition-colors z-20"
          data-testid="bottom-panel-resizer"
        />
      )}

      {/* Panel Header Tabs */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#343945] bg-[#20232B] px-2.5">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {availableViews.map((vid) => {
            const def = getViewDefinition(vid);
            const isSelected = vid === activeViewId;
            return (
              <button
                key={vid}
                type="button"
                onClick={() => onSelectView(vid)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  isSelected
                    ? 'text-[#E5E9F1] bg-white/10'
                    : 'text-[#697487] hover:text-[#9AA4B5] hover:bg-white/5'
                }`}
                data-testid={`bottom-tab-${vid}`}
              >
                {vid === 'terminal' && <TerminalSquare className="h-3 w-3" />}
                {vid === 'problems' && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                {vid === 'output' && <FileText className="h-3 w-3" />}
                {vid === 'ports' && <Radio className="h-3 w-3 text-emerald-400" />}
                <span>{def.title}</span>

                {vid === 'problems' && (
                  <span className="flex items-center gap-1 text-[10px] ml-1">
                    <span className="text-rose-400 font-bold">{diagnostics.errorCount}</span>
                    <span className="text-amber-400 font-bold">{diagnostics.warningCount}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Specific Terminal Actions */}
          {activeViewId === 'terminal' && (
            <>
              {onNewTerminal && (
                <Tooltip label="New Terminal" side="top">
                  <button
                    type="button"
                    onClick={onNewTerminal}
                    className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
                    aria-label="New Terminal"
                    data-testid="terminal-new-btn"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </Tooltip>
              )}

              {onToggleSplitTerminal && (
                <Tooltip label="Split Terminal" side="top">
                  <button
                    type="button"
                    onClick={onToggleSplitTerminal}
                    className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
                    aria-label="Split Terminal"
                    data-testid="terminal-split-btn"
                  >
                    <Columns className="h-3 w-3" />
                  </button>
                </Tooltip>
              )}
            </>
          )}

          {/* Maximize / Restore Toggle */}
          <Tooltip label={isMaximized ? 'Restore Panel Size' : 'Maximize Panel Size'} side="top">
            <button
              type="button"
              onClick={onToggleMaximize}
              className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
              aria-label={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
              data-testid="bottom-panel-maximize-btn"
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </Tooltip>

          {/* Close Panel */}
          <Tooltip label="Close Panel" side="top">
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
              aria-label="Close Panel"
              data-testid="bottom-panel-close-btn"
            >
              <X className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Panel Content Body */}
      <div className="min-h-0 flex-1 overflow-hidden relative bg-[#181A20]">
        {renderViewContent(activeViewId)}
      </div>
    </div>
  );
};
