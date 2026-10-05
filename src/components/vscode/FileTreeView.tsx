import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Atom,
  Braces,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Columns,
  Copy,
  File,
  FileCode,
  FilePlus,
  FileText,
  FileType,
  Folder,
  FolderArchive,
  FolderOpen,
  FolderPlus,
  Globe,
  Palette,
  Pencil,
  Trash2,
  Triangle,
} from 'lucide-react';
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
  onCreateFile?: (path: string, content?: string) => void;
  onCreateFolder?: (path: string) => void;
  onRename?: (oldPath: string, newPath: string) => void;
  onDelete?: (path: string) => void;
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
      // Empty folder placeholder: ensure the folder hierarchy exists in the tree
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

  // Folders before files, each alphabetical — standard IDE convention.
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

const ICON_CLASS = 'h-3.5 w-3.5 flex-shrink-0';

const iconFor = (name: string) => {
  const ext = (name.split('.').pop() ?? '').toLowerCase();

  switch (ext) {
    case 'html':
    case 'htm':
      return <Globe className={`${ICON_CLASS} text-accent`} />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <Palette className={`${ICON_CLASS} text-content-on-dark-soft`} />;
    case 'js':
    case 'mjs':
    case 'cjs':
      return <FileCode className={`${ICON_CLASS} text-content-on-dark-soft`} />;
    case 'jsx':
    case 'tsx':
      return <Atom className={`${ICON_CLASS} text-cyan-400`} />;
    case 'ts':
      return <FileType className={`${ICON_CLASS} text-blue-400`} />;
    case 'vue':
      return <Triangle className={`${ICON_CLASS} text-teal`} />;
    case 'json':
    case 'jsonc':
      return <Braces className={`${ICON_CLASS} text-amber-400`} />;
    case 'md':
    case 'mdx':
    case 'txt':
      return <FileText className={`${ICON_CLASS} text-vsc-textMuted`} />;
    default:
      return <File className={`${ICON_CLASS} text-vsc-textMuted`} />;
  }
};

/** Clamps context menu position within viewport bounds */
const getClampedMenuPos = (x: number, y: number, menuWidth = 190, menuHeight = 240) => {
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
        className={`group relative flex w-full items-center gap-1 py-[3px] pr-2 text-left text-xs transition-colors select-none cursor-pointer ${
          isActive
            ? 'bg-product-active text-content-on-dark font-medium'
            : 'text-vsc-text hover:bg-product-hover hover:text-content-on-dark'
        }`}
        style={{ paddingLeft: `${depth * INDENT_PX + 6}px` }}
      >
        {/* Indentation guide lines */}
        {Array.from({ length: depth }, (_, level) => (
          <span
            key={level}
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-vsc-indent"
            style={{ left: `${level * INDENT_PX + 11}px` }}
          />
        ))}

        {node.isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-3 w-3 flex-shrink-0 text-vsc-textMuted" />
            ) : (
              <ChevronRight className="h-3 w-3 flex-shrink-0 text-vsc-textMuted" />
            )}
            {isOpen ? (
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
            ) : (
              <Folder className="h-3.5 w-3.5 flex-shrink-0 text-amber-400/90" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            {iconFor(node.name)}
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
            className="flex-1 min-w-0 bg-[#252526] text-white px-1 py-0.5 text-xs rounded border border-accent outline-none shadow-sm"
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
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
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-product-active text-vsc-textMuted hover:text-content-on-dark transition-opacity"
                title="Open to the Side (Split Editor)"
              >
                <Columns className="h-3 w-3" />
              </span>
            )}
            {dirty.has(node.path) && (
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-vsc-text"
                title="Unsaved changes"
              />
            )}
          </span>
        )}
      </div>

      {/* Children of expanded folder */}
      {node.isDirectory && isOpen && (
        <>
          {/* Inline draft input when creating inside this folder */}
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
      className="flex w-full items-center gap-1.5 py-[3px] pr-2 text-xs bg-product-hover/40"
    >
      <span className="w-3 flex-shrink-0" />
      {type === 'folder' ? (
        <Folder className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
      ) : (
        <File className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={val}
        placeholder={type === 'folder' ? 'folder name' : 'file.ext'}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(val)}
        className="flex-1 min-w-0 bg-[#252526] text-white px-1.5 py-0.5 text-xs rounded border border-accent outline-none shadow-sm"
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

      // Disallow invalid characters
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
        onCreateFolder?.(fullPath);
        setExpanded((prev) => new Set([...prev, fullPath]));
        toast.success(`Created folder ${trimmed}`);
      } else {
        onCreateFile?.(fullPath, '');
        onOpen(fullPath);
        toast.success(`Created ${trimmed}`);
      }
      setDraft(null);
    };

    // Commit Rename
    const handleCommitRename = (oldPath: string, newName: string) => {
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

      onRename?.(oldPath, newPath);
      toast.success(`Renamed to ${trimmed}`);
    };

    // Confirm Delete
    const handleConfirmDelete = () => {
      if (!deleteTarget) return;
      onDelete?.(deleteTarget.path);
      toast.success(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
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
        className="py-1 min-h-[120px]"
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
          <div className="px-3 py-6 text-center text-xs text-vsc-textMuted">
            <p>No files in this project.</p>
            <button
              onClick={() => setDraft({ type: 'file', targetFolder: '' })}
              className="mt-2 text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FilePlus className="h-3 w-3" />
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

        {/* ── Right-Click Context Menu ── */}
        {contextMenu && (
          <div
            className="fixed z-[100] min-w-[170px] overflow-hidden rounded-md border border-[#3e3e42] bg-[#252526] py-1 shadow-2xl text-xs text-[#cccccc]"
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
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <FilePlus className="h-3.5 w-3.5 text-accent" />
                    New File...
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
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                    New Folder...
                  </button>
                  <div className="my-1 border-t border-[#3e3e42]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setRenamingPath(contextMenu.node!.path);
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </span>
                    <span className="text-[10px] text-vsc-textMuted font-mono">F2</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDeleteTarget(contextMenu.node);
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Folder
                    </span>
                    <span className="text-[10px] text-red-400/80 font-mono">Del</span>
                  </button>
                  <div className="my-1 border-t border-[#3e3e42]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void copyToClipboard(contextMenu.node!.path, 'Folder path');
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Copy Path
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
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <File className="h-3.5 w-3.5" />
                    Open
                  </button>
                  {onOpenToSide && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpenToSide(contextMenu.node!.path);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Columns className="h-3.5 w-3.5" />
                        Open to the Side
                      </span>
                      <span className="text-[10px] text-vsc-textMuted font-mono">Ctrl+\</span>
                    </button>
                  )}
                  <div className="my-1 border-t border-[#3e3e42]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setRenamingPath(contextMenu.node!.path);
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </span>
                    <span className="text-[10px] text-vsc-textMuted font-mono">F2</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDuplicate?.(contextMenu.node!.path);
                      setContextMenu(null);
                      toast.success(`Duplicated ${contextMenu.node!.name}`);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDeleteTarget(contextMenu.node);
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </span>
                    <span className="text-[10px] text-red-400/80 font-mono">Del</span>
                  </button>
                  <div className="my-1 border-t border-[#3e3e42]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void copyToClipboard(contextMenu.node!.path, 'Path');
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Copy Path
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void copyToClipboard(contextMenu.node!.name, 'File name');
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    Copy File Name
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
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                >
                  <FilePlus className="h-3.5 w-3.5 text-accent" />
                  New File...
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setContextMenu(null);
                    setDraft({ type: 'folder', targetFolder: '' });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                  New Folder...
                </button>
                <div className="my-1 border-t border-[#3e3e42]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setExpanded(new Set());
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#094771] hover:text-white transition-colors"
                >
                  <FolderArchive className="h-3.5 w-3.5" />
                  Collapse All Folders
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Delete Confirmation Dialog ── */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="w-full max-w-sm rounded-lg border border-[#3e3e42] bg-[#1e1e1e] p-4 shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 text-red-400 mb-2 font-semibold text-sm">
                <Trash2 className="h-4 w-4" />
                Delete {deleteTarget.isDirectory ? 'Folder' : 'File'}
              </div>
              <p className="text-xs text-[#b8b5ad] leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-white">'{deleteTarget.name}'</span>?
                {deleteTarget.isDirectory && (
                  <span className="block mt-1 text-red-400 text-[11px]">
                    This action will delete the folder and all its contents.
                  </span>
                )}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-[#b8b5ad] hover:bg-[#2d2d30] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

FileTreeView.displayName = 'FileTreeView';

export default FileTreeView;
