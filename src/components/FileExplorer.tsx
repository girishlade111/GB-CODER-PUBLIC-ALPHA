import React, { useEffect, useRef, useState } from 'react';
import { FilePlus2, Pencil, Trash2, X } from 'lucide-react';
import { ProjectFile, ProjectType, PROJECT_TYPE_LABEL } from '../types/files';
import { FileWorkspace } from '../hooks/useFileWorkspace';

interface FileExplorerProps {
  projectType: ProjectType;
  workspace: FileWorkspace;
  onClose: () => void;
}

/** Small colour cue per language, matching the editor panel icon colours. */
const LANGUAGE_COLOR: Record<string, string> = {
  html: 'text-orange-400',
  css: 'text-blue-400',
  javascript: 'text-yellow-400',
  typescript: 'text-sky-400',
  jsx: 'text-cyan-400',
  tsx: 'text-cyan-400',
  vue: 'text-emerald-400',
  json: 'text-amber-400',
};

interface ContextMenuState {
  path: string;
  x: number;
  y: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ projectType, workspace, onClose }) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draftPath, setDraftPath] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (draftPath !== null || renamingPath !== null) {
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [draftPath, renamingPath]);

  // Dismiss the context menu on any outside interaction or Escape.
  useEffect(() => {
    if (!contextMenu) return;
    const dismiss = () => setContextMenu(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', dismiss);
    window.addEventListener('contextmenu', dismiss);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', dismiss);
      window.removeEventListener('contextmenu', dismiss);
      window.removeEventListener('keydown', onKey);
    };
  }, [contextMenu]);

  const beginCreate = () => {
    setRenamingPath(null);
    setError(null);
    setDraftPath('');
    setDraftValue(projectType === 'vue' ? 'Component.vue' : 'Component.jsx');
  };

  const beginRename = (path: string) => {
    setDraftPath(null);
    setError(null);
    setRenamingPath(path);
    setDraftValue(path);
  };

  const cancelDraft = () => {
    setDraftPath(null);
    setRenamingPath(null);
    setError(null);
  };

  const commitDraft = () => {
    const value = draftValue.trim();
    if (!value) return cancelDraft();

    const result =
      renamingPath !== null
        ? workspace.renameFile(renamingPath, value)
        : workspace.createFile(value);

    if (!result.ok) {
      setError(result.error ?? 'Could not save that name.');
      return;
    }
    cancelDraft();
  };

  const handleDelete = (path: string) => {
    setContextMenu(null);
    const result = workspace.removeFile(path);
    if (!result.ok) setError(result.error ?? 'Could not delete that file.');
    else setError(null);
  };

  const renderDraftInput = () => (
    <li className="px-1 py-0.5">
      <input
        ref={inputRef}
        value={draftValue}
        onChange={(event) => {
          setDraftValue(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commitDraft();
          if (event.key === 'Escape') cancelDraft();
        }}
        onBlur={commitDraft}
        className="w-full rounded-sm border border-accent bg-surface-canvas px-2 py-1 font-mono text-xs text-content-primary outline-none"
        aria-label={renamingPath !== null ? 'New file name' : 'New file'}
      />
    </li>
  );

  const renderFile = (file: ProjectFile) => {
    if (renamingPath === file.path) return renderDraftInput();

    const isActive = workspace.activePath === file.path;
    const isDirty = workspace.dirtyPaths.has(file.path);

    return (
      <li key={file.path}>
        <button
          type="button"
          onClick={() => workspace.openFile(file.path)}
          onContextMenu={(event) => {
            event.preventDefault();
            if (!workspace.canModify(file.path)) return;
            setContextMenu({ path: file.path, x: event.clientX, y: event.clientY });
          }}
          className={`group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors ${
            isActive
              ? 'bg-white/[0.07] text-content-primary'
              : 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
          }`}
          title={file.path}
        >
          <span className={`shrink-0 text-[10px] font-bold ${LANGUAGE_COLOR[file.language] ?? 'text-content-muted'}`}>
            ●
          </span>
          <span className="truncate">{file.path}</span>
          {isDirty && (
            <span
              className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-content-secondary"
              title="Unsaved changes"
            />
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-stroke-subtle bg-surface-base">
      <div className="flex items-center justify-between border-b border-stroke-subtle px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-content-secondary">Files</h2>
          <p className="truncate text-[11px] text-content-muted">{PROJECT_TYPE_LABEL[projectType]}</p>
        </div>
        <div className="flex items-center gap-1">
          {projectType !== 'plain' && (
            <button
              type="button"
              onClick={beginCreate}
              className="rounded-md p-1.5 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
              title="New file"
              aria-label="New file"
            >
              <FilePlus2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
            title="Hide file explorer"
            aria-label="Hide file explorer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-1">
        {workspace.files.map(renderFile)}
        {draftPath !== null && renderDraftInput()}
      </ul>

      {error && (
        <p className="border-t border-stroke-subtle px-3 py-2 text-[11px] text-red-300">{error}</p>
      )}

      {projectType === 'plain' && (
        <p className="border-t border-stroke-subtle px-3 py-2 text-[11px] text-content-muted">
          Plain projects use these three files. Start a React or Vue project to add your own.
        </p>
      )}

      {/* Right-click menu */}
      {contextMenu && (
        <div
          className="fixed z-[70] min-w-[150px] overflow-hidden rounded-md border border-stroke-subtle bg-surface-overlay py-1 shadow-elevated"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              beginRename(contextMenu.path);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleDelete(contextMenu.path)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-300 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(FileExplorer);
