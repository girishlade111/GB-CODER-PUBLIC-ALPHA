import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import Codicon from '../ui/Codicon';
import toast from 'react-hot-toast';
import { ProjectFile } from '../../types/files';

/** Pixels of indent per nesting level. Shared by rows and their guide lines. */
const INDENT_PX = 12;

export interface FileTreeViewHandle {
  startNewFile: (folderPath?: string) => void;
  startNewFolder: (folderPath?: string) => void;
  collapseAll: () => void;
  expandAll: () => void;
}

export interface FileTreeViewProps {
  files: ProjectFile[];
  activePath: string | null;
  dirtyPaths: Set<string> | string[];
  onOpen: (path: string) => void;
  /** Opens the target file directly into the secondary split editor pane */
  onOpenToSide?: (path: string) => void;
  onCreateFile?: (path: string, content?: string) => boolean | void;
  onCreateFolder?: (path: string) => boolean | void;
  onRename?: (oldPath: string, newPath: string) => boolean | void | Promise<boolean | void>;
  onDelete?: (path: string) => boolean | void | Promise<boolean | void>;
  onDuplicate?: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode | null;
}

interface InlineDraftState {
  type: 'file' | 'folder';
  targetFolder: string; // '' for root, or 'src', etc.
}

/** Groups flat paths into a nested structure, filtering hidden .gitkeep placeholders. */
const buildTree = (files: ProjectFile[]): TreeNode[] => {
  const root: TreeNode = { name: '', path: '', isDirectory: true, children: [] };

  for (const file of files) {
    if (file.path.endsWith('/.gitkeep')) {
      const dirPath = file.path.slice(0, -'/.gitkeep'.length);
      const segments = dirPath.split('/').filter(Boolean);
      let cursor = root;
      segments.forEach((segment, index) => {
        const path = segments.slice(0, index + 1).join('/');
        let next = cursor.children.find((child) => child.name === segment);
        if (!next) {
          next = { name: segment, path, isDirectory: true, children: [] };
          cursor.children.push(next);
        }
        cursor = next;
      });
      continue;
    }

    const segments = file.path.split('/').filter(Boolean);
    let cursor = root;

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;
      const path = segments.slice(0, index + 1).join('/');
      let next = cursor.children.find((child) => child.name === segment);

      if (!next) {
        next = { name: segment, path, isDirectory: !isLeaf, children: [] };
        cursor.children.push(next);
      }
      cursor = next;
    });
  }

  // Folders before files, each alphabetical
  const sort = (nodes: TreeNode[]): TreeNode[] => {
    nodes.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => sort(node.children));
    return nodes;
  };

  return sort(root.children);
};

/**
 * Returns authentic VS Code Codicon glyph and color for a given file extension.
 */
const getFileCodicon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <Codicon name="file-code" className="text-[13px] text-[#3794ff] shrink-0" />;
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <Codicon name="file-code" className="text-[13px] text-[#cca700] shrink-0" />;
    case 'json':
    case 'jsonc':
      return <Codicon name="json" className="text-[13px] text-[#cca700] shrink-0" />;
    case 'html':
    case 'htm':
      return <Codicon name="browser" className="text-[13px] text-[#e37933] shrink-0" />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <Codicon name="symbol-color" className="text-[13px] text-[#4ec9b0] shrink-0" />;
    case 'md':
    case 'markdown':
    case 'mdx':
      return <Codicon name="markdown" className="text-[13px] text-[#75beff] shrink-0" />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <Codicon name="file-media" className="text-[13px] text-[#b180d7] shrink-0" />;
    default:
      return <Codicon name="file" className="text-[13px] text-[#cccccc] shrink-0" />;
  }
};

/** Clamps context menu position within viewport bounds */
const getClampedMenuPos = (x: number, y: number, menuWidth = 200, menuHeight = 240) => {
  if (typeof window === 'undefined') return { x, y };
  const maxX = window.innerWidth - menuWidth - 10;
  const maxY = window.innerHeight - menuHeight - 10;
  return {
    x: Math.max(10, Math.min(x, maxX)),
    y: Math.max(10, Math.min(y, maxY)),
  };
};

interface RowProps {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  dirty: Set<string>;
  expanded: Set<string>;
  renamingPath: string | null;
  draft: InlineDraftState | null;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  onOpenToSide?: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onCommitRename: (oldPath: string, newName: string) => void;
  onCancelRename: () => void;
  onCommitDraft: (name: string) => void;
  onCancelDraft: () => void;
}

const TreeRow: React.FC<RowProps> = ({
  node,
  depth,
  activePath,
  dirty,
  expanded,
  renamingPath,
  draft,
  onToggle,
  onOpen,
  onOpenToSide,
  onContextMenu,
  onCommitRename,
  onCancelRename,
  onCommitDraft,
  onCancelDraft,
}) => {
  const isOpen = expanded.has(node.path);
  const isActive = activePath === node.path;
  const isRenaming = renamingPath === node.path;
  const [renameVal, setRenameVal] = useState(node.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setRenameVal(node.name);
      requestAnimationFrame(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus();
          const dotIdx = node.name.lastIndexOf('.');
          if (dotIdx > 0 && !node.isDirectory) {
            renameInputRef.current.setSelectionRange(0, dotIdx);
          } else {
            renameInputRef.current.select();
          }
        }
      });
    }
  }, [isRenaming, node.name, node.isDirectory]);

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommitRename(node.path, renameVal);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelRename();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => (node.isDirectory ? onToggle(node.path) : onOpen(node.path))}
        onContextMenu={(e) => onContextMenu(e, node)}
        data-testid={node.isDirectory ? 'tree-folder' : 'tree-file'}
        data-path={node.path}
        title={node.path}
        className={`group relative flex h-[22px] w-full items-center gap-1.5 pr-2 text-left text-[12px] select-none cursor-pointer font-sans transition-colors ${
          isActive
            ? 'bg-[#04395e] text-white font-normal'
            : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * INDENT_PX + 6}px` }}
      >
        {/* Indentation guide lines */}
        {Array.from({ length: depth }, (_, level) => (
          <span
            key={level}
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-[#3c3c3c]/50"
            style={{ left: `${level * INDENT_PX + 11}px` }}
          />
        ))}

        {node.isDirectory ? (
          <>
            <span className="flex items-center justify-center w-4 h-4 shrink-0 text-[#858585]">
              <Codicon
                name="chevron-right"
                className={`text-[12px] transition-transform duration-100 ${
                  isOpen ? 'rotate-90 text-[#cccccc]' : ''
                }`}
              />
            </span>
            <span className="flex items-center justify-center w-4 h-4 shrink-0 text-[#dcb67a]">
              <Codicon name={isOpen ? 'folder-opened' : 'folder'} className="text-[13px]" />
            </span>
          </>
        ) : (
          <>
            <span className="w-4 shrink-0" />
            <span className="flex items-center justify-center w-4 h-4 shrink-0">
              {getFileCodicon(node.name)}
            </span>
          </>
        )}

        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={() => onCommitRename(node.path, renameVal)}
            onClick={(e) => e.stopPropagation()}
            className="h-[20px] flex-1 min-w-0 bg-[#1f1f1f] text-white px-1.5 text-[12px] rounded-[2px] border border-[#0078d4] outline-none"
          />
        ) : (
          <span className="truncate flex-1 leading-[22px]">{node.name}</span>
        )}

        {!node.isDirectory && !isRenaming && (
          <span className="ml-auto flex items-center gap-1">
            {onOpenToSide && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenToSide(node.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-[2px] hover:bg-white/10 text-[#858585] hover:text-white transition-opacity"
                title="Open to the Side (Split Editor)"
              >
                <Codicon name="split-horizontal" className="text-[12px]" />
              </span>
            )}
            {dirty.has(node.path) && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                title="Unsaved changes"
              />
            )}
          </span>
        )}
      </div>

      {/* Children of expanded folder */}
      {node.isDirectory && isOpen && (
        <>
          {draft && draft.targetFolder === node.path && (
            <InlineDraftInput
              type={draft.type}
              depth={depth + 1}
              onCommit={onCommitDraft}
              onCancel={onCancelDraft}
            />
          )}

          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              dirty={dirty}
              expanded={expanded}
              renamingPath={renamingPath}
              draft={draft}
              onToggle={onToggle}
              onOpen={onOpen}
              onOpenToSide={onOpenToSide}
              onContextMenu={onContextMenu}
              onCommitRename={onCommitRename}
              onCancelRename={onCancelRename}
              onCommitDraft={onCommitDraft}
              onCancelDraft={onCancelDraft}
            />
          ))}
        </>
      )}
    </>
  );
};

interface InlineDraftInputProps {
  type: 'file' | 'folder';
  depth: number;
  onCommit: (name: string) => void;
  onCancel: () => void;
}

const InlineDraftInput: React.FC<InlineDraftInputProps> = ({
  type,
  depth,
  onCommit,
  onCancel,
}) => {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(val);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      style={{ paddingLeft: `${depth * INDENT_PX + 6}px` }}
      className="flex h-[22px] w-full items-center gap-1.5 pr-2 text-[12px] bg-[#2a2d2e]"
    >
      <span className="w-4 shrink-0" />
      <span className="flex items-center justify-center w-4 h-4 shrink-0">
        {type === 'folder' ? (
          <Codicon name="folder" className="text-[13px] text-[#dcb67a]" />
        ) : (
          <Codicon name="file" className="text-[13px] text-[#cccccc]" />
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={val}
        placeholder={type === 'folder' ? 'folder name' : 'file.ext'}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(val)}
        className="h-[20px] flex-1 min-w-0 bg-[#1f1f1f] text-white px-1.5 text-[12px] rounded-[2px] border border-[#0078d4] outline-none"
      />
    </div>
  );
};

export const FileTreeView = forwardRef<FileTreeViewHandle, FileTreeViewProps>(
  (
    {
      files,
      activePath,
      dirtyPaths,
      onOpen,
      onOpenToSide,
      onCreateFile,
      onCreateFolder,
      onRename,
      onDelete,
      onDuplicate,
    },
    ref,
  ) => {
    const tree = useMemo(() => buildTree(files), [files]);
    const dirty = useMemo(
      () => (dirtyPaths instanceof Set ? dirtyPaths : new Set(dirtyPaths)),
      [dirtyPaths],
    );

    const [expanded, setExpanded] = useState<Set<string>>(() => {
      const initial = new Set<string>();
      tree.filter((node) => node.isDirectory).forEach((node) => initial.add(node.path));
      if (activePath) {
        const segments = activePath.split('/');
        for (let i = 1; i < segments.length; i += 1) initial.add(segments.slice(0, i).join('/'));
      }
      return initial;
    });

    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [draft, setDraft] = useState<InlineDraftState | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null);

    const toggle = (path: string) =>
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });

    // Imperative handle for top toolbar buttons
    useImperativeHandle(
      ref,
      () => ({
        startNewFile: (folderPath = '') => {
          setRenamingPath(null);
          setDraft({ type: 'file', targetFolder: folderPath });
          if (folderPath) setExpanded((prev) => new Set([...prev, folderPath]));
        },
        startNewFolder: (folderPath = '') => {
          setRenamingPath(null);
          setDraft({ type: 'folder', targetFolder: folderPath });
          if (folderPath) setExpanded((prev) => new Set([...prev, folderPath]));
        },
        collapseAll: () => {
          setExpanded(new Set());
        },
        expandAll: () => {
          const allFolders = new Set<string>();
          const collect = (nodes: TreeNode[]) => {
            nodes.forEach((n) => {
              if (n.isDirectory) {
                allFolders.add(n.path);
                collect(n.children);
              }
            });
          };
          collect(tree);
          setExpanded(allFolders);
        },
      }),
      [tree],
    );

    // Dismiss context menu on outside interaction or Escape
    useEffect(() => {
      if (!contextMenu) return;
      const dismiss = () => setContextMenu(null);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setContextMenu(null);
      };
      window.addEventListener('click', dismiss);
      window.addEventListener('contextmenu', dismiss);
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('click', dismiss);
        window.removeEventListener('contextmenu', dismiss);
        window.removeEventListener('keydown', onKeyDown);
      };
    }, [contextMenu]);

    // Handle global keyboard shortcuts (F2 rename, Del delete)
    useEffect(() => {
      const handleGlobalKey = (e: KeyboardEvent) => {
        if (renamingPath || draft) return;
        if (!activePath) return;

        if (e.key === 'F2') {
          e.preventDefault();
          setRenamingPath(activePath);
        } else if (e.key === 'Delete' && (e.target as HTMLElement).tagName !== 'INPUT') {
          const activeNode = files.find((f) => f.path === activePath);
          if (activeNode) {
            e.preventDefault();
            setDeleteTarget({
              name: activePath.split('/').pop() || activePath,
              path: activePath,
              isDirectory: false,
              children: [],
            });
          }
        }
      };
      window.addEventListener('keydown', handleGlobalKey);
      return () => window.removeEventListener('keydown', handleGlobalKey);
    }, [activePath, renamingPath, draft, files]);

    const handleRowContextMenu = (e: React.MouseEvent, node: TreeNode) => {
      e.preventDefault();
      e.stopPropagation();
      const clamped = getClampedMenuPos(e.clientX, e.clientY);
      setContextMenu({
        x: clamped.x,
        y: clamped.y,
        node,
      });
    };

    const handleContainerContextMenu = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-path]')) return;
      e.preventDefault();
      const clamped = getClampedMenuPos(e.clientX, e.clientY);
      setContextMenu({
        x: clamped.x,
        y: clamped.y,
        node: null,
      });
    };

    // Commit Draft File/Folder Creation
    const handleCommitDraft = (name: string) => {
      const trimmed = name.trim();
      if (!draft || !trimmed) {
        setDraft(null);
        return;
      }

      if (/[\\:*?"<>|]/.test(trimmed)) {
        toast.error('File name contains invalid characters');
        return;
      }

      const fullPath = draft.targetFolder ? `${draft.targetFolder}/${trimmed}` : trimmed;

      if (files.some((f) => f.path === fullPath)) {
        toast.error(`A file named "${trimmed}" already exists`);
        return;
      }

      if (draft.type === 'folder') {
        if (onCreateFolder?.(fullPath) === false) return;
        setExpanded((prev) => new Set([...prev, fullPath]));
        toast.success(`Created folder ${trimmed}`);
      } else {
        if (onCreateFile?.(fullPath, '') === false) return;
        onOpen(fullPath);
        toast.success(`Created ${trimmed}`);
      }
      setDraft(null);
    };

    // Commit Rename
    const handleCommitRename = async (oldPath: string, newName: string) => {
      const trimmed = newName.trim();
      setRenamingPath(null);
      if (!trimmed) return;

      const segments = oldPath.split('/');
      const currentName = segments[segments.length - 1];
      if (currentName === trimmed) return;

      if (/[\\:*?"<>|]/.test(trimmed)) {
        toast.error('Name contains invalid characters');
        return;
      }

      segments[segments.length - 1] = trimmed;
      const newPath = segments.join('/');

      if (files.some((f) => f.path === newPath)) {
        toast.error(`An item named "${trimmed}" already exists`);
        return;
      }

      try {
        const res = await onRename?.(oldPath, newPath);
        if (res === false) return;
        toast.success(`Renamed to ${trimmed}`);
      } catch (err) {
        console.error('[FileTreeView] Rename rejected:', err);
      }
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
      if (!deleteTarget) return;
      try {
        const result = await onDelete?.(deleteTarget.path);
        if (result === false) return;
        toast.success(`Deleted ${deleteTarget.name}`);
        setDeleteTarget(null);
      } catch (err) {
        console.error('[FileTreeView] Delete rejected:', err);
      }
    };

    const copyToClipboard = async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    };

    return (
      <div
        className="py-0.5 min-h-[120px] select-none"
        data-testid="vscode-file-tree"
        onContextMenu={handleContainerContextMenu}
      >
        {/* Root-level draft input if creating at the top */}
        {draft && draft.targetFolder === '' && (
          <InlineDraftInput
            type={draft.type}
            depth={0}
            onCommit={handleCommitDraft}
            onCancel={() => setDraft(null)}
          />
        )}

        {files.length === 0 && !draft ? (
          <div className="px-3 py-6 text-center text-xs text-[#858585]">
            <p>No files in this project.</p>
            <button
              onClick={() => setDraft({ type: 'file', targetFolder: '' })}
              className="mt-2 text-[#3794ff] hover:underline inline-flex items-center gap-1 font-normal cursor-pointer"
            >
              <Codicon name="new-file" className="text-[13px]" />
              Create new file
            </button>
          </div>
        ) : (
          tree.map((node) => (
            <TreeRow
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              dirty={dirty}
              expanded={expanded}
              renamingPath={renamingPath}
              draft={draft}
              onToggle={toggle}
              onOpen={onOpen}
              onOpenToSide={onOpenToSide}
              onContextMenu={handleRowContextMenu}
              onCommitRename={handleCommitRename}
              onCancelRename={() => setRenamingPath(null)}
              onCommitDraft={handleCommitDraft}
              onCancelDraft={() => setDraft(null)}
            />
          ))
        )}

        {/* ── Authentic VS Code Right-Click Context Menu ── */}
        {contextMenu &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed z-[99999] min-w-[190px] overflow-hidden rounded-[4px] border border-[#3c3c3c] bg-[#252526] py-1 shadow-2xl text-[12px] text-[#cccccc] font-sans select-none"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.node ? (
                contextMenu.node.isDirectory ? (
                  /* Folder context menu */
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        const path = contextMenu.node!.path;
                        setContextMenu(null);
                        setDraft({ type: 'file', targetFolder: path });
                        setExpanded((prev) => new Set([...prev, path]));
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="new-file" className="text-[13px] text-[#3794ff]" />
                      <span>New File...</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        const path = contextMenu.node!.path;
                        setContextMenu(null);
                        setDraft({ type: 'folder', targetFolder: path });
                        setExpanded((prev) => new Set([...prev, path]));
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="new-folder" className="text-[13px] text-[#dcb67a]" />
                      <span>New Folder...</span>
                    </button>
                    <div className="my-1 border-t border-[#3c3c3c]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setRenamingPath(contextMenu.node!.path);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Codicon name="edit" className="text-[13px]" />
                        <span>Rename</span>
                      </span>
                      <span className="text-[10px] text-[#858585] font-mono">F2</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDeleteTarget(contextMenu.node);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Codicon name="trash" className="text-[13px] text-[#f14c4c]" />
                        <span>Delete Folder</span>
                      </span>
                      <span className="text-[10px] text-[#858585] font-mono">Del</span>
                    </button>
                    <div className="my-1 border-t border-[#3c3c3c]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        void copyToClipboard(contextMenu.node!.path, 'Folder path');
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="copy" className="text-[13px]" />
                      <span>Copy Path</span>
                    </button>
                  </>
                ) : (
                  /* File context menu */
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpen(contextMenu.node!.path);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="file" className="text-[13px]" />
                      <span>Open</span>
                    </button>
                    {onOpenToSide && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onOpenToSide(contextMenu.node!.path);
                          setContextMenu(null);
                        }}
                        className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Codicon name="split-horizontal" className="text-[13px]" />
                          <span>Open to the Side</span>
                        </span>
                        <span className="text-[10px] text-[#858585] font-mono">Ctrl+\</span>
                      </button>
                    )}
                    <div className="my-1 border-t border-[#3c3c3c]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setRenamingPath(contextMenu.node!.path);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Codicon name="edit" className="text-[13px]" />
                        <span>Rename</span>
                      </span>
                      <span className="text-[10px] text-[#858585] font-mono">F2</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onDuplicate?.(contextMenu.node!.path);
                        setContextMenu(null);
                        toast.success(`Duplicated ${contextMenu.node!.name}`);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="files" className="text-[13px]" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDeleteTarget(contextMenu.node);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Codicon name="trash" className="text-[13px] text-[#f14c4c]" />
                        <span>Delete</span>
                      </span>
                      <span className="text-[10px] text-[#858585] font-mono">Del</span>
                    </button>
                    <div className="my-1 border-t border-[#3c3c3c]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        void copyToClipboard(contextMenu.node!.path, 'Path');
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="copy" className="text-[13px]" />
                      <span>Copy Path</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        void copyToClipboard(contextMenu.node!.name, 'File name');
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                    >
                      <Codicon name="file-code" className="text-[13px]" />
                      <span>Copy File Name</span>
                    </button>
                  </>
                )
              ) : (
                /* Empty explorer background menu */
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setContextMenu(null);
                      setDraft({ type: 'file', targetFolder: '' });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                  >
                    <Codicon name="new-file" className="text-[13px] text-[#3794ff]" />
                    <span>New File...</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setContextMenu(null);
                      setDraft({ type: 'folder', targetFolder: '' });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                  >
                    <Codicon name="new-folder" className="text-[13px] text-[#dcb67a]" />
                    <span>New Folder...</span>
                  </button>
                  <div className="my-1 border-t border-[#3c3c3c]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setExpanded(new Set());
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-[#04395e] hover:text-white transition-colors cursor-pointer"
                  >
                    <Codicon name="collapse-all" className="text-[13px]" />
                    <span>Collapse All Folders</span>
                  </button>
                </>
              )}
            </div>,
            document.body,
          )}

        {/* ── Authentic Delete Confirmation Dialog Portalled to Body ── */}
        {deleteTarget &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => setDeleteTarget(null)}
            >
              <div
                className="w-full max-w-sm rounded-[4px] border border-[#3c3c3c] bg-[#252526] p-4 shadow-2xl text-[#cccccc] font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 text-[#f14c4c] mb-2 font-medium text-[13px]">
                  <Codicon name="warning" className="text-[16px]" />
                  <span>Delete {deleteTarget.isDirectory ? 'Folder' : 'File'}</span>
                </div>
                <p className="text-[12px] text-[#858585] leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-white">'{deleteTarget.name}'</span>?
                  {deleteTarget.isDirectory && (
                    <span className="block mt-1 text-[#f14c4c] text-[11px]">
                      This action will delete the folder and all its contents.
                    </span>
                  )}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-[2px] px-3 py-1 text-[12px] text-[#cccccc] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="rounded-[2px] bg-[#e51400] hover:bg-[#b81000] px-3 py-1 text-[12px] font-medium text-white transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

FileTreeView.displayName = 'FileTreeView';

export default FileTreeView;
