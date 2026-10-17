import React, { useRef } from 'react';
import {
  X,
  Columns,
  Rows,
  ArrowRightLeft,
  AlertTriangle,
  FolderTree,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import type * as monacoEditor from 'monaco-editor';
import Editor, { LocalDiffEditor } from '../LocalMonacoEditor';
import Tooltip from '../ui/Tooltip';
import { EditorLayoutState, EditorGroupState } from '../../services/workbench/workbenchTypes';
import { ProjectFile } from '../../types/files';
import { ExternalFileConflict } from '../../services/editor/editorConflictService';
import { monacoThemeFor, defineGbCoderTheme } from '../../utils/monacoTheme';

interface WorkbenchEditorAreaProps {
  layout: EditorLayoutState;
  files: ProjectFile[];
  dirtyPaths: Set<string> | string[];
  activeConflict: ExternalFileConflict | null;
  isDiffMode: boolean;
  onToggleDiffMode: () => void;
  onResolveKeepMine: (conflict: ExternalFileConflict) => void;
  onResolveUseExternal: (conflict: ExternalFileConflict) => void;
  onSelectTab: (groupId: string, path: string) => void;
  onCloseTab: (groupId: string, path: string, event?: React.MouseEvent) => void;
  onCloseOtherTabs?: (groupId: string, path: string) => void;
  onSplitEditor: (direction: 'vertical' | 'horizontal') => void;
  onCloseSplit: () => void;
  onMoveTabToOtherGroup: (path: string, fromGroupId: string) => void;
  onSplitResize: (newRatio: number) => void;
  onFileChange: (path: string, content: string) => void;
  onEditorMount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
  onSplitEditorMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
  monacoLanguageForPath: (path: string) => string;
  isDark?: boolean;
  monacoOptions?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
}

export const WorkbenchEditorArea: React.FC<WorkbenchEditorAreaProps> = ({
  layout,
  files,
  dirtyPaths,
  activeConflict,
  isDiffMode,
  onToggleDiffMode,
  onResolveKeepMine,
  onResolveUseExternal,
  onSelectTab,
  onCloseTab,
  onSplitEditor,
  onCloseSplit,
  onMoveTabToOtherGroup,
  onSplitResize,
  onFileChange,
  onEditorMount,
  onSplitEditorMount,
  monacoLanguageForPath,
  isDark = true,
  monacoOptions,
}) => {
  const isSplitDraggingRef = useRef(false);
  const dirtySet = Array.isArray(dirtyPaths) ? new Set(dirtyPaths) : dirtyPaths;

  const handleSplitResizeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isSplitDraggingRef.current = true;
    const isVertical = layout.splitDirection === 'vertical';
    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isSplitDraggingRef.current) return;
      const currentPos = isVertical ? moveEvent.clientX - rect.left : moveEvent.clientY - rect.top;
      const totalSize = isVertical ? rect.width : rect.height;
      const ratio = Math.min(80, Math.max(20, Math.round((currentPos / totalSize) * 100)));
      onSplitResize(ratio);
    };

    const handlePointerUp = () => {
      isSplitDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const renderBreadcrumb = (path: string | null) => {
    if (!path) return null;
    const segments = path.split('/');
    return (
      <div
        className="flex h-6 shrink-0 items-center gap-1 border-b border-[#343945] bg-[#181A20] px-3 text-[11px] text-[#697487] select-none"
        data-testid="editor-breadcrumb"
      >
        <FolderTree className="h-3 w-3 text-[#697487]" />
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-2.5 w-2.5 text-[#697487]" />}
              <span
                className={
                  isLast ? 'text-[#E5E9F1] font-medium flex items-center gap-1' : 'hover:text-[#9AA4B5] cursor-pointer'
                }
              >
                {isLast && <FileCode className="h-3 w-3 text-[#6366F1]" />}
                {segment}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderConflictBanner = (path: string | null) => {
    if (!activeConflict || activeConflict.path !== path) return null;
    return (
      <div
        className="flex items-center justify-between border-b border-amber-600/40 bg-amber-950/70 px-3 py-1.5 text-xs text-amber-200 z-10 shrink-0"
        data-testid="conflict-banner"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>
              {activeConflict.status === 'recovery_required'
                ? 'Resolution incomplete / recovery needed'
                : activeConflict.conflictType === 'directory_deleted'
                ? 'Directory deleted externally'
                : activeConflict.conflictType === 'file_deleted'
                ? 'File deleted externally'
                : 'File changed externally'}
            </strong>{' '}
            while you have unsaved edits in{' '}
            <code className="rounded bg-black/40 px-1 py-0.5">{activeConflict.path}</code>
            {activeConflict.status === 'recovery_required' && (
              <span className="ml-1.5 rounded bg-red-950 px-1.5 py-0.5 text-[10px] font-semibold text-red-300 border border-red-800/50">
                Retry Required
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDiffMode}
            className="rounded bg-amber-900/60 px-2 py-0.5 hover:bg-amber-800 text-amber-100 transition-colors"
            data-testid="conflict-compare-btn"
          >
            {isDiffMode ? 'Close Diff' : 'Compare Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              const msg =
                activeConflict.conflictType === 'directory_deleted' ||
                activeConflict.conflictType === 'file_deleted'
                  ? 'Restore this file on disk with your editor changes?'
                  : 'Keep your editor changes and overwrite the external terminal version?';
              if (window.confirm(msg)) {
                onResolveKeepMine(activeConflict);
              }
            }}
            className="rounded bg-amber-600 px-2 py-0.5 font-medium text-white hover:bg-amber-500 transition-colors"
            data-testid="conflict-keep-mine-btn"
          >
            {activeConflict.status === 'recovery_required'
              ? 'Retry Keep Mine'
              : activeConflict.conflictType === 'directory_deleted' ||
                activeConflict.conflictType === 'file_deleted'
              ? 'Restore File'
              : 'Keep My Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              const msg =
                activeConflict.conflictType === 'directory_deleted' ||
                activeConflict.conflictType === 'file_deleted'
                  ? 'Accept external deletion and remove local unsaved buffer?'
                  : 'Discard your unsaved editor changes and load external version?';
              if (window.confirm(msg)) {
                onResolveUseExternal(activeConflict);
              }
            }}
            className="rounded bg-black/40 px-2 py-0.5 text-amber-300 hover:bg-black/60 transition-colors border border-amber-600/30"
            data-testid="conflict-use-external-btn"
          >
            {activeConflict.status === 'recovery_required'
              ? 'Retry External'
              : activeConflict.conflictType === 'directory_deleted' ||
                activeConflict.conflictType === 'file_deleted'
              ? 'Accept Deletion'
              : 'Use External Version'}
          </button>
        </div>
      </div>
    );
  };

  const renderGroup = (
    group: EditorGroupState,
    isSecondary: boolean,
    testId: string
  ) => {
    const activeFile = files.find((f) => f.path === group.activePath) || null;

    return (
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#181A20]"
        data-testid={testId}
      >
        {/* Tabbar */}
        <div
          className="flex h-9 shrink-0 items-stretch justify-between border-b border-[#343945] bg-[#20232B]"
          data-testid={isSecondary ? 'vscode-split-tabbar-container' : 'vscode-tabbar-container'}
        >
          {/* Tabs */}
          <div
            className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
            role="tablist"
            data-testid={isSecondary ? 'vscode-split-tabs' : 'vscode-tabs'}
          >
            {group.openPaths.map((path) => {
              const name = path.split('/').pop() ?? path;
              const isActive = path === group.activePath;
              const isDirty = dirtySet.has(path);
              return (
                <div
                  key={path}
                  role="tab"
                  aria-selected={isActive}
                  data-testid={isSecondary ? 'vscode-split-tab' : 'vscode-tab'}
                  data-path={path}
                  onClick={() => onSelectTab(group.id, path)}
                  className={`group flex min-w-0 cursor-pointer items-center gap-1.5 border-r border-[#343945] border-t-2 px-3 py-1 text-xs select-none ${
                    isActive
                      ? 'border-t-[#6366F1] bg-[#181A20] text-[#E5E9F1] font-medium'
                      : 'border-t-transparent text-[#9AA4B5] hover:bg-white/5 hover:text-[#E5E9F1]'
                  }`}
                  title={path}
                >
                  <span className="max-w-[12rem] truncate">{name}</span>
                  {isDirty && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E5E9F1]"
                      data-testid="tab-dirty-dot"
                      title="Unsaved changes"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(event) => onCloseTab(group.id, path, event)}
                    aria-label={`Close ${name}`}
                    data-testid={isSecondary ? 'vscode-split-tab-close' : 'vscode-tab-close'}
                    className="rounded p-0.5 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 text-[#697487] hover:text-[#E5E9F1]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Group Controls */}
          <div className="flex shrink-0 items-center px-1.5 border-l border-[#343945] bg-[#20232B] gap-1">
            {layout.mode === 'split' && group.activePath && (
              <Tooltip label="Move Tab to Other Group" side="bottom">
                <button
                  type="button"
                  onClick={() => onMoveTabToOtherGroup(group.activePath!, group.id)}
                  className="p-1 rounded text-[#697487] hover:bg-white/10 hover:text-[#E5E9F1] transition-colors"
                  aria-label="Move Tab to Other Group"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}

            {layout.mode === 'single' ? (
              <Tooltip label="Split Editor Right (Side-by-Side)" side="bottom">
                <button
                  type="button"
                  onClick={() => onSplitEditor('vertical')}
                  className="p-1 rounded text-xs transition-colors flex items-center gap-1 text-[#697487] hover:bg-white/10 hover:text-[#E5E9F1]"
                  aria-label="Split Editor Right"
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span className="text-[10px] hidden sm:inline">Split</span>
                </button>
              </Tooltip>
            ) : (
              <>
                <Tooltip
                  label={
                    layout.splitDirection === 'vertical'
                      ? 'Switch to Horizontal Split'
                      : 'Switch to Vertical Split'
                  }
                  side="bottom"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSplitEditor(layout.splitDirection === 'vertical' ? 'horizontal' : 'vertical')
                    }
                    className="p-1 rounded text-[#697487] hover:bg-white/10 hover:text-[#E5E9F1] transition-colors"
                  >
                    {layout.splitDirection === 'vertical' ? (
                      <Rows className="h-3.5 w-3.5" />
                    ) : (
                      <Columns className="h-3.5 w-3.5" />
                    )}
                  </button>
                </Tooltip>

                {isSecondary && (
                  <Tooltip label="Close Split Pane" side="bottom">
                    <button
                      type="button"
                      onClick={onCloseSplit}
                      className="p-1 rounded text-[#697487] hover:bg-white/10 hover:text-[#E5E9F1] transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {renderBreadcrumb(group.activePath)}

        {/* Conflict Banner */}
        {renderConflictBanner(group.activePath)}

        {/* Monaco Editor Container */}
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden relative bg-[#181A20]"
          data-testid={isSecondary ? 'vscode-editor-scroll-secondary' : 'vscode-editor-scroll'}
        >
          {activeFile ? (
            isDiffMode && activeConflict && activeConflict.path === activeFile.path ? (
              <LocalDiffEditor
                original={activeConflict.diskContent}
                modified={activeFile.content}
                language={monacoLanguageForPath(activeFile.path)}
                theme={monacoThemeFor(isDark)}
                options={{
                  ...monacoOptions,
                  readOnly: false,
                  renderSideBySide: true,
                }}
              />
            ) : (
              <Editor
                path={activeFile.path}
                language={monacoLanguageForPath(activeFile.path)}
                value={activeFile.content}
                onChange={(val) => onFileChange(activeFile.path, val ?? '')}
                beforeMount={defineGbCoderTheme}
                onMount={isSecondary ? onSplitEditorMount : onEditorMount}
                theme={monacoThemeFor(isDark)}
                options={monacoOptions}
              />
            )
          ) : (
            <div className="grid h-full place-items-center text-xs text-[#697487] select-none">
              Select a file from the explorer to begin editing.
            </div>
          )}
        </div>
      </div>
    );
  };

  const group1 = layout.groups[0];
  const group2 = layout.groups[1];

  if (layout.mode === 'split' && group2) {
    const isVertical = layout.splitDirection === 'vertical';
    return (
      <main
        role="region"
        aria-label="Editor"
        className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${
          isVertical ? 'flex-row' : 'flex-col'
        }`}
        data-testid="vscode-editor-panes"
      >
        {/* Primary Pane */}
        <div
          style={{
            [isVertical ? 'width' : 'height']: `${layout.splitRatio}%`,
          }}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          {renderGroup(group1, false, 'vscode-pane-primary')}
        </div>

        {/* Split Divider Handle */}
        <div
          role="separator"
          aria-orientation={layout.splitDirection}
          onPointerDown={handleSplitResizeDown}
          className={`shrink-0 bg-[#343945] hover:bg-[#6366F1] active:bg-[#6366F1] transition-colors z-10 flex items-center justify-center select-none ${
            isVertical ? 'w-1 cursor-col-resize h-full' : 'h-1 cursor-row-resize w-full'
          }`}
          title="Drag to resize editor panes"
        />

        {/* Secondary Pane */}
        <div
          style={{
            [isVertical ? 'width' : 'height']: `${100 - layout.splitRatio}%`,
          }}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        >
          {renderGroup(group2, true, 'vscode-pane-secondary')}
        </div>
      </main>
    );
  }

  // Single Pane Mode
  return (
    <main
      role="region"
      aria-label="Editor"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#181A20]"
    >
      {renderGroup(group1, false, 'vscode-pane-single')}
    </main>
  );
};
