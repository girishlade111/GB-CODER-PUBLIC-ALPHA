import React from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { FileCode2, Loader2 } from 'lucide-react';
import EditorTabs from './EditorTabs';
import { FileWorkspace } from '../hooks/useFileWorkspace';
import { ProjectType, monacoLanguageFor } from '../types/files';
import { GB_CODER_MONACO_THEME, defineGbCoderTheme } from '../utils/monacoTheme';
import { BundleError, formatBundleError } from '../services/bundlerService';

interface MultiFileEditorProps {
  projectType: ProjectType;
  workspace: FileWorkspace;
  fontFamily: string;
  fontSize: number;
  buildStatus: 'idle' | 'building' | 'error' | 'ready';
  buildErrors: BundleError[];
  /** Wired to the AI selection toolbar, same as the plain-mode panels. */
  onSelectionChange?: (editor: unknown, path: string) => void;
}

const STATUS_LABEL: Record<MultiFileEditorProps['buildStatus'], string> = {
  idle: '',
  building: 'Building…',
  error: 'Build failed',
  ready: 'Ready',
};

/**
 * The editor surface for multi-file React/Vue projects: a tab strip plus a
 * single Monaco instance.
 *
 * `path` is passed to Monaco, which keeps one model per file. That preserves
 * per-file undo history, cursor position and scroll offset when switching tabs —
 * a plain value swap would reset all three.
 */
const MultiFileEditor: React.FC<MultiFileEditorProps> = ({
  projectType,
  workspace,
  fontFamily,
  fontSize,
  buildStatus,
  buildErrors,
  onSelectionChange,
}) => {
  const { activeFile } = workspace;

  const handleWillMount = (monaco: Monaco) => defineGbCoderTheme(monaco);

  const handleMount = (editor: unknown) => {
    if (!onSelectionChange || !activeFile) return;
    const instance = editor as { onDidChangeCursorSelection: (cb: () => void) => void };
    instance.onDidChangeCursorSelection(() => onSelectionChange(editor, activeFile.path));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-base">
      <EditorTabs
        openPaths={workspace.openPaths}
        activePath={workspace.activePath}
        dirtyPaths={workspace.dirtyPaths}
        onSelect={workspace.setActivePath}
        onClose={workspace.closeFile}
      />

      <div className="min-h-0 flex-1">
        {activeFile ? (
          <Editor
            /* Per-file model: keyed by path so each file keeps its own state. */
            path={activeFile.path}
            language={monacoLanguageFor(activeFile.language)}
            value={activeFile.content}
            onChange={(value) => workspace.updateFileContent(activeFile.path, value ?? '')}
            beforeMount={handleWillMount}
            onMount={handleMount}
            theme={GB_CODER_MONACO_THEME}
            loading={
              <div className="flex h-full items-center justify-center gap-2 text-sm text-content-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading editor…
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize,
              fontFamily,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-lg border border-stroke-subtle bg-surface-raised p-3">
              <FileCode2 className="h-6 w-6 text-content-muted" />
            </div>
            <p className="text-sm font-medium text-content-secondary">No file open</p>
            <p className="text-xs text-content-muted">
              Pick a file from the explorer to start editing.
            </p>
          </div>
        )}
      </div>

      {/* Build status strip. Full error text still goes to the Console tab. */}
      {projectType !== 'plain' && buildStatus !== 'idle' && (
        <div className="flex items-center gap-2 border-t border-stroke-subtle bg-surface-raised px-3 py-1.5 text-[11px]">
          {buildStatus === 'building' && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
          <span
            className={
              buildStatus === 'error'
                ? 'text-red-300'
                : buildStatus === 'building'
                  ? 'text-content-secondary'
                  : 'text-emerald-300'
            }
          >
            {STATUS_LABEL[buildStatus]}
          </span>
          {buildStatus === 'error' && buildErrors[0] && (
            <span className="truncate text-content-muted" title={buildErrors.map(formatBundleError).join('\n')}>
              {formatBundleError(buildErrors[0])}
            </span>
          )}
          {buildStatus === 'error' && buildErrors.length > 1 && (
            <span className="shrink-0 text-content-muted">+{buildErrors.length - 1} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(MultiFileEditor);
