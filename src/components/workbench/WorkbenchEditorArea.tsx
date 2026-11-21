import React, { useRef, useState, useEffect } from 'react';
import Codicon from '../ui/Codicon';
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
  onEditorMount: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: any) => void;
  onSplitEditorMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: any) => void;
  monacoLanguageForPath: (path: string) => string;
  isDark?: boolean;
  isCenteredLayout?: boolean;
  monacoOptions?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
}

/**
 * Returns the authentic VS Code Codicon glyph and color for a given file extension.
 */
const getFileCodicon = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <Codicon name="file-code" className="text-[13px] text-[#3794ff]" />;
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <Codicon name="file-code" className="text-[13px] text-[#cca700]" />;
    case 'json':
      return <Codicon name="json" className="text-[13px] text-[#cca700]" />;
    case 'html':
    case 'htm':
      return <Codicon name="browser" className="text-[13px] text-[#e37933]" />;
    case 'css':
    case 'scss':
    case 'less':
      return <Codicon name="symbol-color" className="text-[13px] text-[#4ec9b0]" />;
    case 'md':
    case 'markdown':
      return <Codicon name="markdown" className="text-[13px] text-[#75beff]" />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <Codicon name="file-media" className="text-[13px] text-[#b180d7]" />;
    default:
      return <Codicon name="file" className="text-[13px] text-[#cccccc]" />;
  }
};

interface TabContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  groupId: string;
  path: string;
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
  onCloseOtherTabs,
  onSplitEditor,
  onCloseSplit,
  onMoveTabToOtherGroup,
  onSplitResize,
  onFileChange,
  onEditorMount,
  onSplitEditorMount,
  monacoLanguageForPath,
  isDark = true,
  isCenteredLayout = false,
  monacoOptions,
}) => {
  const isSplitDraggingRef = useRef(false);
  const dirtySet = Array.isArray(dirtyPaths) ? new Set(dirtyPaths) : dirtyPaths;

  // Tab right-click context menu state
  const [tabContextMenu, setTabContextMenu] = useState<TabContextMenuState | null>(null);

  useEffect(() => {
    if (!tabContextMenu) return;
    const handleOutside = () => setTabContextMenu(null);
    window.addEventListener('click', handleOutside);
    window.addEventListener('contextmenu', handleOutside);
    return () => {
      window.removeEventListener('click', handleOutside);
      window.removeEventListener('contextmenu', handleOutside);
    };
  }, [tabContextMenu]);

  const handleTabContextMenu = (e: React.MouseEvent, groupId: string, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTabContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      groupId,
      path,
    });
  };

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

  /**
   * Breadcrumbs bar (22px height, subtle VS Code dark background #1f1f1f, Codicon arrows)
   */
  const renderBreadcrumb = (path: string | null) => {
    if (!path) return null;
    const segments = path.split('/');
    return (
      <div
        className="flex h-[22px] shrink-0 items-center gap-1 border-b border-[#2b2b2b] bg-[#1f1f1f] px-3 text-[11px] text-[#858585] select-none font-sans"
        data-testid="editor-breadcrumb"
      >
        <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <Codicon name="folder" className="text-[12px] text-[#858585]" />
          <span>workspace</span>
        </span>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <React.Fragment key={index}>
              <Codicon name="chevron-right" className="text-[9px] text-[#6e7681]" />
              <span
                className={`flex items-center gap-1 transition-colors ${
                  isLast
                    ? 'text-[#cccccc] font-normal'
                    : 'hover:text-[#ffffff] cursor-pointer'
                }`}
              >
                {isLast && getFileCodicon(path)}
                <span>{segment}</span>
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
        className="flex items-center justify-between border-b border-amber-600/40 bg-amber-950/70 px-3 py-1.5 text-xs text-amber-200 z-10 shrink-0 select-none"
        data-testid="conflict-banner"
      >
        <div className="flex items-center gap-2">
          <Codicon name="warning" className="text-amber-400 text-sm shrink-0" />
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
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#1f1f1f]"
        data-testid={testId}
      >
        {/* VS Code Tabbar (35px height, #181818 inactive background, #1f1f1f active background) */}
        <div
          className="flex h-[35px] shrink-0 items-stretch justify-between border-b border-[#2b2b2b] bg-[#181818] select-none"
          data-testid={isSecondary ? 'vscode-split-tabbar-container' : 'vscode-tabbar-container'}
        >
          {/* Tabs List */}
          <div
            className="flex min-w-0 flex-1 items-stretch overflow-x-auto scrollbar-none"
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
                  onContextMenu={(e) => handleTabContextMenu(e, group.id, path)}
                  className={`group relative flex min-w-0 cursor-pointer items-center gap-2 border-r border-[#2b2b2b] border-t-2 px-3 text-[12px] select-none transition-colors ${
                    isActive
                      ? 'border-t-[#0078d4] bg-[#1f1f1f] text-[#ffffff] font-normal'
                      : 'border-t-transparent bg-[#181818] text-[rgba(255,255,255,0.5)] hover:bg-white/5 hover:text-[rgba(255,255,255,0.85)]'
                  }`}
                  title={path}
                >
                  <span className="shrink-0 flex items-center justify-center">
                    {getFileCodicon(path)}
                  </span>
                  <span className="max-w-[12rem] truncate">{name}</span>

                  {/* Dirty Dot / Close Cross: in VS Code, unsaved dot is replaced by close icon on hover */}
                  <div className="ml-1 flex items-center justify-center w-4 h-4">
                    {isDirty ? (
                      <>
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-white group-hover:hidden"
                          data-testid="tab-dirty-dot"
                          title="Unsaved changes"
                        />
                        <button
                          type="button"
                          onClick={(event) => onCloseTab(group.id, path, event)}
                          aria-label={`Close ${name}`}
                          data-testid={isSecondary ? 'vscode-split-tab-close' : 'vscode-tab-close'}
                          className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-[2px] hover:bg-white/10 text-[#999999] hover:text-white"
                        >
                          <Codicon name="close" className="text-[12px]" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => onCloseTab(group.id, path, event)}
                        aria-label={`Close ${name}`}
                        data-testid={isSecondary ? 'vscode-split-tab-close' : 'vscode-tab-close'}
                        className="opacity-0 group-hover:opacity-100 flex h-4 w-4 items-center justify-center rounded-[2px] transition-opacity hover:bg-white/10 text-[#999999] hover:text-white"
                      >
                        <Codicon name="close" className="text-[12px]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group Action Controls with official Codicons */}
          <div className="flex shrink-0 items-center px-1 border-l border-[#2b2b2b] bg-[#181818] gap-0.5">
            {layout.mode === 'split' && group.activePath && (
              <Tooltip label="Move Tab to Other Group" side="bottom">
                <button
                  type="button"
                  onClick={() => onMoveTabToOtherGroup(group.activePath!, group.id)}
                  className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Move Tab to Other Group"
                >
                  <Codicon name="arrow-swap" className="text-[13px]" />
                </button>
              </Tooltip>
            )}

            {layout.mode === 'single' ? (
              <Tooltip label="Split Editor Right (Side-by-Side)" side="bottom">
                <button
                  type="button"
                  onClick={() => onSplitEditor('vertical')}
                  className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Split Editor Right"
                >
                  <Codicon name="split-horizontal" className="text-[13px]" />
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
                    className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Codicon
                      name={layout.splitDirection === 'vertical' ? 'split-vertical' : 'split-horizontal'}
                      className="text-[13px]"
                    />
                  </button>
                </Tooltip>

                {isSecondary && (
                  <Tooltip label="Close Split Pane" side="bottom">
                    <button
                      type="button"
                      onClick={onCloseSplit}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Codicon name="close" className="text-[13px]" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}

            <Tooltip label="More Actions..." side="bottom">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:bg-white/10 hover:text-white transition-colors"
                aria-label="More Actions"
              >
                <Codicon name="ellipsis" className="text-[13px]" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Breadcrumbs Bar (22px) */}
        {renderBreadcrumb(group.activePath)}

        {/* Conflict Banner */}
        {renderConflictBanner(group.activePath)}

        {/* Monaco Editor Container */}
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden relative bg-[#1f1f1f]"
          data-testid={isSecondary ? 'vscode-editor-scroll-secondary' : 'vscode-editor-scroll'}
        >
          {activeFile ? (
            isDiffMode && activeConflict && activeConflict.path === activeFile.path ? (
              <LocalDiffEditor
                original={activeConflict.externalContent}
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
            /* Authentic VS Code Empty Workspace with Watermark & Keyboard Hints */
            <div className="relative flex h-full w-full flex-col items-center justify-center select-none bg-[#1f1f1f] text-xs text-[#999999] overflow-hidden p-6 font-sans">
              {/* VS Code Large Center Watermark SVG */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
                <svg
                  className="h-64 w-64 text-white"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M185.3 252.7c4.6 2.3 10.1 2 14.4-.7l48-30c4.9-3.1 7.9-8.5 7.9-14.3V48.3c0-5.8-3-11.2-7.9-14.3l-48-30c-4.3-2.7-9.8-3-14.4-.7-4.6 2.3-7.5 7-7.5 12.1v23.2L78.4 121.2 31.7 85.3c-3.7-2.9-8.7-3.3-12.8-1.2-4.1 2.1-6.7 6.3-6.7 10.9v66c0 4.6 2.6 8.8 6.7 10.9 4.1 2.1 9.1 1.7 12.8-1.2l46.7-35.9 99.4 82.6v23.2c0 5.1 2.9 9.8 7.5 12.1zM193.6 63.8l38.4-24v176.4l-38.4-24V63.8zM40.2 113.8l32.2 24.8-32.2 24.8v-49.6zm63.4 33.6l74.4 61.8V46.8l-74.4 61.8-35.6-27.4 35.6 66.2z" />
                </svg>
              </div>

              {/* Centered Keyboard Shortcuts matching vscode.dev */}
              <div className="relative z-10 flex flex-col items-center gap-3 max-w-sm text-left">
                <div className="flex items-center justify-between w-72 text-xs text-[#cccccc] py-1 border-b border-[#2b2b2b]/50">
                  <span className="flex items-center gap-2">
                    <Codicon name="menu" className="text-sm text-[#9cdcfe]" />
                    <span>Show All Commands</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#999999]">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Shift</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">P</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between w-72 text-xs text-[#cccccc] py-1 border-b border-[#2b2b2b]/50">
                  <span className="flex items-center gap-2">
                    <Codicon name="go-to-file" className="text-sm text-[#4ec9b0]" />
                    <span>Go to File</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#999999]">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">P</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between w-72 text-xs text-[#cccccc] py-1 border-b border-[#2b2b2b]/50">
                  <span className="flex items-center gap-2">
                    <Codicon name="comment-discussion" className="text-sm text-[#0078d4]" />
                    <span>Open Chat</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#999999]">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Alt</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">I</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between w-72 text-xs text-[#cccccc] py-1 border-b border-[#2b2b2b]/50">
                  <span className="flex items-center gap-2">
                    <Codicon name="terminal" className="text-sm text-[#cca700]" />
                    <span>Toggle Terminal</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#999999]">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">`</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between w-72 text-xs text-[#cccccc] py-1 border-b border-[#2b2b2b]/50">
                  <span className="flex items-center gap-2">
                    <Codicon name="layout-sidebar-left" className="text-sm text-[#75beff]" />
                    <span>Toggle Primary Side Bar</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#999999]">
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c]">B</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const group1 = layout.groups[0];
  const group2 = layout.groups[1];

  return (
    <>
      {layout.mode === 'split' && group2 ? (
        <main
          role="region"
          aria-label="Editor"
          className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${
            layout.splitDirection === 'vertical' ? 'flex-row' : 'flex-col'
          } ${isCenteredLayout ? 'max-w-5xl mx-auto w-full border-x border-[#2b2b2b]' : ''}`}
          data-testid="vscode-editor-panes"
        >
          {/* Primary Pane */}
          <div
            style={{
              [layout.splitDirection === 'vertical' ? 'width' : 'height']: `${layout.splitRatio}%`,
            }}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden"
          >
            {renderGroup(group1, false, 'vscode-pane-primary')}
          </div>

          {/* Modern Split Divider Handle with smooth sash grip */}
          <div
            role="separator"
            aria-orientation={layout.splitDirection}
            onPointerDown={handleSplitResizeDown}
            className={`group shrink-0 bg-transparent hover:bg-white/5 active:bg-[#0078d4]/20 transition-colors z-10 flex items-center justify-center select-none ${
              layout.splitDirection === 'vertical' ? 'w-2 cursor-col-resize h-full' : 'h-2 cursor-row-resize w-full'
            }`}
            title="Drag to resize editor panes"
          >
            <div
              className={`rounded-full bg-[#3c3c3c] group-hover:bg-[#0078d4] transition-colors ${
                layout.splitDirection === 'vertical' ? 'h-8 w-1' : 'w-8 h-1'
              }`}
            />
          </div>

          {/* Secondary Pane */}
          <div
            style={{
              [layout.splitDirection === 'vertical' ? 'width' : 'height']: `${100 - layout.splitRatio}%`,
            }}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden"
          >
            {renderGroup(group2, true, 'vscode-pane-secondary')}
          </div>
        </main>
      ) : (
        <main
          role="region"
          aria-label="Editor"
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#1f1f1f] ${
            isCenteredLayout ? 'max-w-5xl mx-auto w-full border-x border-[#2b2b2b]' : ''
          }`}
        >
          {renderGroup(group1, false, 'vscode-pane-single')}
        </main>
      )}

      {/* Tab Right-Click Context Menu */}
      {tabContextMenu && tabContextMenu.visible && (
        <div
          style={{ top: tabContextMenu.y, left: tabContextMenu.x }}
          className="fixed z-[999999] w-48 rounded-[4px] border border-[#3c3c3c] bg-[#252526] text-[#cccccc] shadow-2xl py-1 text-xs select-none font-sans animate-in fade-in duration-75"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              onCloseTab(tabContextMenu.groupId, tabContextMenu.path);
              setTabContextMenu(null);
            }}
          >
            <span>Close</span>
            <span className="text-[10px] text-[#858585] font-mono">Ctrl+W</span>
          </button>
          {onCloseOtherTabs && (
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-1 hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
              onClick={() => {
                onCloseOtherTabs(tabContextMenu.groupId, tabContextMenu.path);
                setTabContextMenu(null);
              }}
            >
              <span>Close Others</span>
            </button>
          )}
          <div className="my-1 border-t border-[#3c3c3c]" />
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-1 hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              onSplitEditor('vertical');
              setTabContextMenu(null);
            }}
          >
            <span>Split Right</span>
            <span className="text-[10px] text-[#858585] font-mono">Ctrl+\</span>
          </button>
        </div>
      )}
    </>
  );
};

export default WorkbenchEditorArea;
