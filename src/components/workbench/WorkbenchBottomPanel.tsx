import React, { useRef } from 'react';
import Tooltip from '../ui/Tooltip';
import Codicon from '../ui/Codicon';
import { ViewId, ContainerId } from '../../services/workbench/workbenchTypes';
import { getViewDefinition } from '../../services/workbench/workbenchViewRegistry';

interface WorkbenchBottomPanelProps {
  height: number;
  visible: boolean;
  isMaximized: boolean;
  activeViewId: ViewId;
  availableViews: ViewId[];
  onSelectView: (viewId: ViewId) => void;
  onMoveView?: (viewId: ViewId, targetContainer: ContainerId) => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  onResize: (newHeight: number) => void;
  renderViewContent: (viewId: ViewId) => React.ReactNode;
  panelAlignment?: 'left' | 'right' | 'center' | 'justify';
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
  onMoveView: _onMoveView,
  onToggleMaximize,
  onClose,
  onResize,
  renderViewContent,
  panelAlignment = 'left',
  diagnostics = { errorCount: 0, warningCount: 0 },
  onNewTerminal,
  onToggleSplitTerminal,
  onClearTerminal: _onClearTerminal,
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

  const effectiveHeight = isMaximized ? 'calc(100% - 35px)' : `${height}px`;

  const alignmentClass =
    !isMaximized && panelAlignment === 'center'
      ? 'w-full max-w-[85%] mx-auto border-x border-[#2b2b2b]'
      : !isMaximized && panelAlignment === 'left'
      ? 'w-full max-w-[75%] mr-auto border-r border-[#2b2b2b]'
      : !isMaximized && panelAlignment === 'right'
      ? 'w-full max-w-[75%] ml-auto border-l border-[#2b2b2b]'
      : 'w-full';

  return (
    <div
      role="region"
      aria-label="Bottom Panel"
      style={{ height: effectiveHeight }}
      className={`relative flex shrink-0 flex-col overflow-hidden border-t border-[#2b2b2b] bg-[#1f1f1f] text-xs select-none z-10 ${alignmentClass} ${
        isMaximized ? 'absolute inset-x-0 bottom-6 top-9 z-30 w-full max-w-full' : ''
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
          className="absolute left-0 right-0 top-0 h-1 cursor-row-resize hover:bg-[#0078d4] active:bg-[#0078d4] transition-colors z-20"
          data-testid="bottom-panel-resizer"
        />
      )}

      {/* VS Code Panel Tab Strip (35px height, underline active indicator) */}
      <div className="flex h-[35px] shrink-0 items-stretch justify-between border-b border-[#2b2b2b] bg-[#181818] px-2">
        <div className="flex items-stretch gap-1 overflow-x-auto">
          {availableViews.map((vid) => {
            const def = getViewDefinition(vid);
            const isSelected = vid === activeViewId;
            return (
              <button
                key={vid}
                type="button"
                onClick={() => onSelectView(vid)}
                className={`group flex items-center gap-1.5 px-3 border-b-2 text-[11px] tracking-normal transition-colors ${
                  isSelected
                    ? 'border-[#0078d4] text-[#ffffff] font-medium'
                    : 'border-transparent text-[#999999] hover:text-[#cccccc]'
                }`}
                data-testid={`bottom-tab-${vid}`}
              >
                {vid === 'terminal' && <Codicon name="terminal" className="text-[13px]" />}
                {vid === 'problems' && (
                  <Codicon
                    name="error"
                    className={`text-[13px] ${
                      diagnostics.errorCount > 0 ? 'text-[#f14c4c]' : diagnostics.warningCount > 0 ? 'text-[#cca700]' : 'text-[#999999]'
                    }`}
                  />
                )}
                {vid === 'output' && <Codicon name="output" className="text-[13px]" />}
                {vid === 'ports' && <Codicon name="radio-tower" className="text-[13px]" />}
                <span className="uppercase text-[11px]">{def.title}</span>
                {vid === 'problems' && (diagnostics.errorCount > 0 || diagnostics.warningCount > 0) && (
                  <span className="flex items-center gap-1 text-[10px] ml-1">
                    {diagnostics.errorCount > 0 && (
                      <span className="text-[#f14c4c] font-semibold">{diagnostics.errorCount}</span>
                    )}
                    {diagnostics.warningCount > 0 && (
                      <span className="text-[#cca700] font-semibold">{diagnostics.warningCount}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Action Controls with official Codicons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Specific Terminal Actions */}
          {activeViewId === 'terminal' && (
            <>
              {onNewTerminal && (
                <Tooltip label="New Terminal (Ctrl+Shift+`)" side="top">
                  <button
                    type="button"
                    onClick={onNewTerminal}
                    className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#cccccc] hover:bg-white/10 transition-colors"
                    aria-label="New Terminal"
                    data-testid="terminal-new-btn"
                  >
                    <Codicon name="plus" className="text-[13px]" />
                  </button>
                </Tooltip>
              )}

              {onToggleSplitTerminal && (
                <Tooltip label="Split Terminal (Ctrl+\)" side="top">
                  <button
                    type="button"
                    onClick={onToggleSplitTerminal}
                    className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#cccccc] hover:bg-white/10 transition-colors"
                    aria-label="Split Terminal"
                    data-testid="terminal-split-btn"
                  >
                    <Codicon name="split-horizontal" className="text-[13px]" />
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
              className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#cccccc] hover:bg-white/10 transition-colors"
              aria-label={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
              data-testid="bottom-panel-maximize-btn"
            >
              <Codicon name={isMaximized ? 'chevron-down' : 'chevron-up'} className="text-[14px]" />
            </button>
          </Tooltip>

          {/* Close Panel */}
          <Tooltip label="Close Panel (Ctrl+J)" side="top">
            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#cccccc] hover:bg-white/10 transition-colors"
              aria-label="Close Panel"
              data-testid="bottom-panel-close-btn"
            >
              <Codicon name="close" className="text-[13px]" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Panel Content Body */}
      <div className="min-h-0 flex-1 overflow-hidden relative bg-[#1f1f1f]">
        {renderViewContent(activeViewId)}
      </div>
    </div>
  );
};
