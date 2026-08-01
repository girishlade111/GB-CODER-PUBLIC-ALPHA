import React, { useMemo, useState } from 'react';
import {
  Atom,
  Braces,
  ChevronDown,
  ChevronRight,
  File,
  FileCode,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  Globe,
  Palette,
  Triangle,
} from 'lucide-react';
import { ProjectFile } from '../../types/files';

/**
 * VS Code style explorer: a real folder hierarchy, collapsible at every level.
 *
 * Built from the flat `ProjectFile[]` the project model uses, because the editor
 * stores paths rather than a tree. Folders are derived, sorted folders-first, and
 * expansion state is local so collapsing a folder does not disturb open tabs.
 */

interface FileTreeViewProps {
  files: ProjectFile[];
  activePath: string | null;
  dirtyPaths: Set<string> | string[];
  onOpen: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

/** Pixels of indent per nesting level. Shared by rows and their guide lines. */
const INDENT_PX = 12;

/** Groups flat paths into a nested structure. */
const buildTree = (files: ProjectFile[]): TreeNode[] => {
  const root: TreeNode = { name: '', path: '', isDirectory: true, children: [] };

  for (const file of files) {
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

  // Folders before files, each alphabetical — the explorer convention.
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
 * File icon per extension.
 *
 * Every supported type gets a distinguishable glyph *and* colour rather than one
 * generic "code file" icon, because scanning a tree by shape is much faster than
 * reading every filename. Shapes are chosen to hint at the technology without
 * reproducing any project's logo: a globe for markup, a palette for stylesheets,
 * braces for data, an atom for component files, a triangle for Vue.
 */
const ICON_CLASS = 'h-3.5 w-3.5 flex-shrink-0';

const iconFor = (name: string) => {
  const ext = (name.split('.').pop() ?? '').toLowerCase();

  switch (ext) {
    case 'html':
    case 'htm':
      return <Globe className={`${ICON_CLASS} text-orange-400`} />;
    case 'css':
      return <Palette className={`${ICON_CLASS} text-sky-400`} />;
    case 'scss':
    case 'sass':
    case 'less':
      return <Palette className={`${ICON_CLASS} text-pink-400`} />;
    case 'js':
    case 'mjs':
    case 'cjs':
      return <FileCode className={`${ICON_CLASS} text-yellow-400`} />;
    case 'jsx':
      return <Atom className={`${ICON_CLASS} text-cyan-400`} />;
    case 'ts':
      return <FileType className={`${ICON_CLASS} text-blue-400`} />;
    case 'tsx':
      return <Atom className={`${ICON_CLASS} text-blue-400`} />;
    case 'vue':
      return <Triangle className={`${ICON_CLASS} text-emerald-400`} />;
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

interface RowProps {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  dirty: Set<string>;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
}

const TreeRow: React.FC<RowProps> = ({
  node,
  depth,
  activePath,
  dirty,
  expanded,
  onToggle,
  onOpen,
}) => {
  const isOpen = expanded.has(node.path);
  const isActive = activePath === node.path;

  return (
    <>
      <button
        type="button"
        onClick={() => (node.isDirectory ? onToggle(node.path) : onOpen(node.path))}
        data-testid={node.isDirectory ? 'tree-folder' : 'tree-file'}
        data-path={node.path}
        title={node.path}
        className={`relative flex w-full items-center gap-1 py-[3px] pr-2 text-left text-xs transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-vsc-text hover:bg-white/[0.06] hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * INDENT_PX + 6}px` }}
      >
        {/*
         * Indentation guides.
         *
         * One hairline per ancestor level, drawn absolutely so they cannot affect
         * layout or the row's hit area. Without them, deep trees are very hard to
         * read — which level a row belongs to becomes guesswork.
         */}
        {Array.from({ length: depth }, (_, level) => (
          <span
            key={level}
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-vsc-indent/60"
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
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-sky-300/80" />
            ) : (
              <Folder className="h-3.5 w-3.5 flex-shrink-0 text-sky-300/70" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            {iconFor(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
        {!node.isDirectory && dirty.has(node.path) && (
          <span
            className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-vsc-text"
            title="Unsaved changes"
          />
        )}
      </button>

      {node.isDirectory &&
        isOpen &&
        node.children.map((child) => (
          <TreeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            activePath={activePath}
            dirty={dirty}
            expanded={expanded}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        ))}
    </>
  );
};

const FileTreeView: React.FC<FileTreeViewProps> = ({ files, activePath, dirtyPaths, onOpen }) => {
  const tree = useMemo(() => buildTree(files), [files]);
  const dirty = useMemo(
    () => (dirtyPaths instanceof Set ? dirtyPaths : new Set(dirtyPaths)),
    [dirtyPaths],
  );

  /*
   * Top-level folders start open, and any folder on the path to the active file
   * is opened too, so revealing a nested file does not land on a collapsed tree.
   */
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    tree.filter((node) => node.isDirectory).forEach((node) => initial.add(node.path));
    if (activePath) {
      const segments = activePath.split('/');
      for (let i = 1; i < segments.length; i += 1) initial.add(segments.slice(0, i).join('/'));
    }
    return initial;
  });

  const toggle = (path: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  if (files.length === 0) {
    return <p className="px-3 py-4 text-xs text-content-muted">No files in this project.</p>;
  }

  return (
    <div className="py-1" data-testid="vscode-file-tree">
      {tree.map((node) => (
        <TreeRow
          key={node.path}
          node={node}
          depth={0}
          activePath={activePath}
          dirty={dirty}
          expanded={expanded}
          onToggle={toggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default FileTreeView;
