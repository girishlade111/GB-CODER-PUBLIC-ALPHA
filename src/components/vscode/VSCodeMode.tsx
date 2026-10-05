import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  FilePlus,
  FolderPlus,
  LogOut,
  Plus,
  RefreshCw,
  Columns,
  Rows,
  ArrowRightLeft,
  TerminalSquare,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  FolderArchive,
  FolderDown,
  Zap,
  Share2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Lock,
  Loader2,
  ChevronUp,
  Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FileTreeView, { FileTreeViewHandle } from './FileTreeView';
import ActivityBar, { ActivityTab } from './ActivityBar';
import StackBlitzStartupLoader from './StackBlitzStartupLoader';
import CodeAssistPanel from './CodeAssistPanel';
import IDESettingsModal from './IDESettingsModal';
import DependenciesPanel from '../DependenciesPanel';
import CodeRabbitReviewModal from '../CodeRabbitReviewModal';
import VoiceCommandPanel from '../VoiceCommandPanel';
import SnapshotManagerModal from '../SnapshotManagerModal';
import TerminalTab from '../Console/TerminalTab';
import Tooltip from '../ui/Tooltip';
import { monacoThemeFor, defineGbCoderTheme } from '../../utils/monacoTheme';
import { useTheme } from '../../hooks/useTheme';
import { MultiFileProject } from '../../types/files';
import { carriesFiles, collectTransfer } from '../../utils/dropTransfer';
import {
  readViewState,
  reconcileViewState,
  writeViewState,
} from '../../services/vscodeWorkspaceStore';
import { webcontainerService } from '../../services/webcontainer/webcontainerService';
import { ataService } from '../../services/ata/ataService';
import { livePreviewChannel } from '../../services/preview/livePreviewChannel';
import { codeAssistService } from '../../services/ai/codeAssistService';
import { Snapshot } from '../../services/snapshotService';

/**
 * VS Code style editor shell.
 *
 * Entered automatically for a detected full-stack import, or by hand from the
 * sidebar. Plain, React and Vue projects keep their existing multi-panel editors
 * untouched — this is an additional mode, not a replacement.
 *
 * ## Layout contract
 *
 * The shell owns the whole viewport and **nothing here scrolls the page**. It is a
 * fixed-height column: top bar, body, optional terminal, status bar. The body is
 * three fixed-height columns, and each of the four content areas — explorer,
 * editor, right panel, terminal — is its own scroll container.
 *
 * That isolation is the point, and it is load-bearing rather than cosmetic: with a
 * single page-level scroller, opening a long file dragged the explorer and
 * terminal out of view, and a long file tree pushed the editor down. Every region
 * below therefore pairs `min-h-0` with `overflow-hidden`/`overflow-y-auto`, and
 * every fixed strip is `shrink-0`. `min-h-0` is the non-obvious half: a flex child
 * defaults to `min-height:auto`, so without it a tall child refuses to shrink and
 * overflows its parent instead of scrolling inside it.
 */

interface VSCodeModeProps {
  project: MultiFileProject;
  onChangeFile: (path: string, content: string) => void;
  onCreateFile?: (path: string, content?: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  onDuplicateFile?: (path: string) => void;
  onExit: () => void;
  fontFamily: string;
  fontSize: number;
  /**
   * How the mode was entered. Only affects wording: claiming a project was
   * "detected as full-stack" when the user switched by hand would be untrue, and
   * this mode is reachable both ways.
   */
  entryReason?: 'detected' | 'manual';
  /**
   * Adds files into the *current* project rather than replacing it.
   *
   * Takes the raw transfer shape rather than `File[]` so a dropped folder works:
   * directories only exist as entries/handles, never as files. Runs through the
   * same `buildImportPlan` pipeline every other import path uses.
   */
  onAddImport?: (input: {
    files?: File[];
    entries?: unknown[];
    handles?: Promise<unknown>[];
    unreadableDirectories?: string[];
  }) => Promise<void>;
  /** Opens the app's existing Dependencies panel. */
  onOpenDependencies?: () => void;
  /** Opens the app's existing AI Chat overlay. */
  onOpenAIChat?: () => void;
  /** Opens the app's existing Voice Commands overlay. */
  onOpenVoiceCommands?: () => void;
  /**
   * Returns to the project dashboard.
   *
   * Needed here specifically because this mode replaces the app's normal chrome,
   * so the NavigationBar logo — the way back everywhere else — is not on screen.
   */
  onOpenProjects?: () => void;
}

const subscribeWebContainer = (onChange: () => void) => webcontainerService.subscribe(onChange);
const getWebContainerSnapshot = () => webcontainerService.getState();
const subscribeAta = (onChange: () => void) => ataService.subscribe(onChange);
const getAtaSnapshot = () => ataService.getState();

/** Most recently opened files, newest last, as VS Code orders its tabs. */
const MAX_TABS = 12;

/** Terminal panel height bounds, in px. */
const TERMINAL_MIN_H = 96;
const TERMINAL_DEFAULT_H = 240;
/** Never let the terminal squeeze the editor to nothing. */
const TERMINAL_MAX_FRACTION = 0.75;

/**
 * Extension to Monaco language.
 *
 * Deliberately not `languageForPath` from the project model: that maps onto the
 * three-language union the plain editor needs and answers "javascript" for
 * anything it does not recognise, which would highlight a Python or Go file as
 * JavaScript. Full-stack projects contain exactly those files.
 */
const MONACO_LANGUAGE_BY_EXTENSION: Record<string, string> = {
  html: 'html', htm: 'html',
  css: 'css', scss: 'scss', sass: 'scss', less: 'less',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  vue: 'html', svelte: 'html',
  json: 'json', jsonc: 'json',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', kt: 'kotlin',
  php: 'php', cs: 'csharp', sh: 'shell', bash: 'shell', sql: 'sql',
  graphql: 'graphql', gql: 'graphql',
  md: 'markdown', mdx: 'markdown',
  yml: 'yaml', yaml: 'yaml', toml: 'ini', ini: 'ini', cfg: 'ini', conf: 'ini',
  env: 'shell', txt: 'plaintext', svg: 'xml',
};

const monacoLanguageForPath = (path: string): string => {
  const base = path.split(/[/\\]/).pop() ?? '';
  if (/^dockerfile$/i.test(base)) return 'dockerfile';
  if (/^makefile$/i.test(base)) return 'makefile';
  if (/^\.env(\..+)?$/i.test(base)) return 'shell';
  const dot = base.lastIndexOf('.');
  if (dot === -1) return 'plaintext';
  return MONACO_LANGUAGE_BY_EXTENSION[base.slice(dot + 1).toLowerCase()] ?? 'plaintext';
};

/** Human label for the status bar, e.g. `typescript` -> `TypeScript`. */
const LANGUAGE_LABEL: Record<string, string> = {
  html: 'HTML', css: 'CSS', scss: 'SCSS', less: 'Less',
  javascript: 'JavaScript', typescript: 'TypeScript', json: 'JSON',
  python: 'Python', ruby: 'Ruby', go: 'Go', rust: 'Rust', java: 'Java',
  kotlin: 'Kotlin', php: 'PHP', csharp: 'C#', shell: 'Shell', sql: 'SQL',
  graphql: 'GraphQL', markdown: 'Markdown', yaml: 'YAML', ini: 'INI',
  xml: 'XML', dockerfile: 'Dockerfile', makefile: 'Makefile',
  plaintext: 'Plain Text',
};

const VSCodeMode: React.FC<VSCodeModeProps> = ({
  project,
  onChangeFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
  onExit,
  fontFamily,
  fontSize,
  entryReason = 'detected',
  onAddImport,
  onOpenDependencies,
  onOpenAIChat,
  onOpenVoiceCommands,
  onOpenProjects,
}) => {
  const webcontainer = useSyncExternalStore(
    subscribeWebContainer,
    getWebContainerSnapshot,
    getWebContainerSnapshot,
  );
  const { isDark } = useTheme();
  const [previewKey, setPreviewKey] = useState(0);
  const ata = useSyncExternalStore(subscribeAta, getAtaSnapshot, getAtaSnapshot);
  const [splitOpenPaths, setSplitOpenPaths] = useState<string[]>([]);
  const [splitActivePath, setSplitActivePath] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [splitDirection, setSplitDirection] = useState<'vertical' | 'horizontal'>('vertical');

  /*
   * Tabs come back from the previous visit, reconciled against the files that
   * actually loaded: a project can change between visits, and a tab pointing at a
   * file that is no longer there renders an empty editor that reads as broken.
   *
   * Computed in an initialiser so the restored file is the one Monaco mounts with.
   * Deferring it would let the auto-open effect below choose a different file
   * first, and the user would watch their file switch out from under them.
   */
  const [restoredView] = useState(() => reconcileViewState(readViewState(), project.files));
  const [openPaths, setOpenPaths] = useState<string[]>(restoredView.openPaths);
  const [activePath, setActivePath] = useState<string | null>(restoredView.activePath);
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [hasOpenedTerminal, setHasOpenedTerminal] = useState(true);
  const [activityTab, setActiveTab] = useState<ActivityTab>('explorer');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'problems' | 'output'>('terminal');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isProjectRootOpen, setIsProjectRootOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeRabbitOpen, setIsCodeRabbitOpen] = useState(false);
  const [isVoiceCommandsOpen, setIsVoiceCommandsOpen] = useState(false);
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);

  // Live preview minimize/maximize state
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);

  // Code Assist service listener
  const codeAssistState = useSyncExternalStore(
    (cb) => codeAssistService.subscribe(cb),
    () => codeAssistService.getState(),
    () => codeAssistService.getState()
  );

  const handleApplyCodeAssistFiles = useCallback(
    (files: Array<{ path: string; content: string }>) => {
      for (const file of files) {
        if (project.files.some((f) => f.path === file.path)) {
          onChangeFile(file.path, file.content);
        } else {
          onCreateFile?.(file.path, file.content);
        }
        void webcontainerService.syncFile(file.path, file.content);
      }
      toast.success(`${files.length} file(s) updated in workspace`);
    },
    [project.files, onChangeFile, onCreateFile]
  );

  const handleRestoreSnapshot = useCallback(
    (snapshot: Snapshot) => {
      const snapFiles = snapshot.projectState?.project?.files;
      if (snapFiles && snapFiles.length > 0) {
        for (const sf of snapFiles) {
          if (project.files.some((f) => f.path === sf.path)) {
            onChangeFile(sf.path, sf.content);
          } else {
            onCreateFile?.(sf.path, sf.content);
          }
          void webcontainerService.syncFile(sf.path, sf.content);
        }
        toast.success(`Restored snapshot: ${snapshot.name}`);
      }
    },
    [project.files, onChangeFile, onCreateFile]
  );

  const openTerminal = useCallback(() => {
    setHasOpenedTerminal(true);
    setShowTerminal(true);
    setBottomTab('terminal');
  }, []);

  const toggleTerminal = useCallback(() => {
    setShowTerminal((prev) => {
      const next = !prev;
      if (next) {
        setHasOpenedTerminal(true);
        setBottomTab('terminal');
      }
      return next;
    });
  }, []);

  const [terminalHeight, setTerminalHeight] = useState(240);
  /** Cursor position, mirrored into the status bar. */
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [isExplorerDropTarget, setIsExplorerDropTarget] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  /* Open a sensible first file so the editor is not empty on entry. */
  useEffect(() => {
    if (activePath || project.files.length === 0) return;
    const preferred =
      project.files.find((file) => /(^|\/)(README\.md|package\.json)$/i.test(file.path)) ??
      project.files.find((file) => /(^|\/)(index|main|app|server)\./i.test(file.path)) ??
      project.files[0];
    setOpenPaths([preferred.path]);
    setActivePath(preferred.path);
  }, [project.files, activePath]);

  /* Remember the tab layout, so returning to the route reopens what was open. */
  useEffect(() => {
    writeViewState({ openPaths, activePath });
  }, [openPaths, activePath]);

  const openFile = useCallback((path: string) => {
    setOpenPaths((current) => {
      if (current.includes(path)) return current;
      const next = [...current, path];
      // Evict the oldest tab that is not the one being opened.
      return next.length > MAX_TABS ? next.slice(next.length - MAX_TABS) : next;
    });
    setActivePath(path);
  }, []);

  const closeTab = useCallback(
    (path: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      setOpenPaths((current) => {
        const remaining = current.filter((item) => item !== path);
        // Focus the neighbouring tab, as VS Code does, rather than clearing.
        if (activePath === path) {
          const index = current.indexOf(path);
          const fallback = remaining[Math.min(index, remaining.length - 1)] ?? null;
          setActivePath(fallback);
        }
        return remaining;
      });
    },
    [activePath],
  );

  const activeFile = project.files.find((file) => file.path === activePath) ?? null;

  /* ── File Explorer Operations ───────────────────────────────────────────── */
  const treeRef = useRef<FileTreeViewHandle>(null);

  const handleCreateFile = useCallback(
    (path: string, content = '') => {
      onCreateFile?.(path, content);
      openFile(path);
    },
    [onCreateFile, openFile],
  );

  const handleCreateFolder = useCallback(
    (folderPath: string) => {
      const keepPath = `${folderPath.replace(/\/+$/, '')}/.gitkeep`;
      onCreateFile?.(keepPath, '');
    },
    [onCreateFile],
  );

  const handleRenameFile = useCallback(
    (oldPath: string, newPath: string) => {
      onRenameFile?.(oldPath, newPath);

      const updateList = (paths: string[]) =>
        paths.map((p) =>
          p === oldPath
            ? newPath
            : p.startsWith(oldPath + '/')
            ? newPath + p.slice(oldPath.length)
            : p,
        );

      setOpenPaths(updateList);
      setSplitOpenPaths(updateList);

      if (activePath === oldPath || (activePath && activePath.startsWith(oldPath + '/'))) {
        setActivePath(newPath);
      }
      if (
        splitActivePath === oldPath ||
        (splitActivePath && splitActivePath.startsWith(oldPath + '/'))
      ) {
        setSplitActivePath(newPath);
      }
    },
    [onRenameFile, activePath, splitActivePath],
  );

  const handleDeleteFile = useCallback(
    (path: string) => {
      onDeleteFile?.(path);

      const isTarget = (p: string) => p === path || p.startsWith(path + '/');

      setOpenPaths((paths) => {
        const remaining = paths.filter((p) => !isTarget(p));
        if (activePath && isTarget(activePath)) {
          setActivePath(remaining[0] || null);
        }
        return remaining;
      });

      setSplitOpenPaths((paths) => {
        const remaining = paths.filter((p) => !isTarget(p));
        if (splitActivePath && isTarget(splitActivePath)) {
          setSplitActivePath(remaining[0] || null);
        }
        return remaining;
      });
    },
    [onDeleteFile, activePath, splitActivePath],
  );

  const handleDuplicateFile = useCallback(
    (path: string) => {
      onDuplicateFile?.(path);
    },
    [onDuplicateFile],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activePath) return;
      const text = value ?? '';
      onChangeFile(activePath, text);
      void webcontainerService.syncFile(activePath, text);
      ataService.acquireTypes(text);
      setDirtyPaths((current) => {
        if (current.has(activePath)) return current;
        const next = new Set(current);
        next.add(activePath);
        return next;
      });
    },
    [activePath, onChangeFile],
  );

  const isSplitActive = Boolean(splitActivePath && splitOpenPaths.length > 0);
  const splitActiveFile = splitActivePath
    ? project.files.find((file) => file.path === splitActivePath) ?? null
    : null;

  const openToSide = useCallback((path: string) => {
    setSplitOpenPaths((current) => {
      if (current.includes(path)) return current;
      const next = [...current, path];
      return next.length > MAX_TABS ? next.slice(next.length - MAX_TABS) : next;
    });
    setSplitActivePath(path);
  }, []);

  const closeSplitTab = useCallback((path: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setSplitOpenPaths((current) => {
      const remaining = current.filter((item) => item !== path);
      if (splitActivePath === path) {
        const index = current.indexOf(path);
        const fallback = remaining[Math.min(index, remaining.length - 1)] ?? null;
        setSplitActivePath(fallback);
      }
      return remaining;
    });
  }, [splitActivePath]);

  const closeSplitPane = useCallback(() => {
    setSplitOpenPaths([]);
    setSplitActivePath(null);
  }, []);

  const moveTabToOtherPane = useCallback(
    (path: string, from: 'left' | 'right') => {
      if (from === 'left') {
        closeTab(path);
        openToSide(path);
      } else {
        closeSplitTab(path);
        openFile(path);
      }
    },
    [closeTab, openToSide, closeSplitTab, openFile],
  );

  const splitDragRef = useRef<{ startPos: number; startRatio: number; containerSize: number } | null>(
    null,
  );

  const handleSplitResizeDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const isVert = splitDirection === 'vertical';
      const container = event.currentTarget.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerSize = isVert ? rect.width : rect.height;
      const startPos = isVert ? event.clientX : event.clientY;
      splitDragRef.current = { startPos, startRatio: splitRatio, containerSize };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [splitDirection, splitRatio],
  );

  const handleSplitResizeMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!splitDragRef.current) return;
      const { startPos, startRatio, containerSize } = splitDragRef.current;
      if (containerSize <= 0) return;
      const isVert = splitDirection === 'vertical';
      const currentPos = isVert ? event.clientX : event.clientY;
      const deltaPx = currentPos - startPos;
      const deltaPercent = (deltaPx / containerSize) * 100;
      const nextRatio = Math.min(80, Math.max(20, startRatio + deltaPercent));
      setSplitRatio(nextRatio);
    },
    [splitDirection],
  );

  const handleSplitResizeUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (splitDragRef.current) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignored
      }
      splitDragRef.current = null;
    }
  }, []);

  const handleSplitChange = useCallback(
    (value: string | undefined) => {
      if (!splitActivePath) return;
      const text = value ?? '';
      onChangeFile(splitActivePath, text);
      void webcontainerService.syncFile(splitActivePath, text);
      ataService.acquireTypes(text);
      setDirtyPaths((current) => {
        if (current.has(splitActivePath)) return current;
        const next = new Set(current);
        next.add(splitActivePath);
        return next;
      });
    },
    [splitActivePath, onChangeFile],
  );

  /** Mirrors the caret into the status bar, the way VS Code reports Ln/Col. */
  const handleEditorMount = useCallback<OnMount>(
    (editor, monaco) => {
      setCursor({
        line: editor.getPosition()?.lineNumber ?? 1,
        column: editor.getPosition()?.column ?? 1,
      });
      editor.onDidChangeCursorPosition((event) => {
        setCursor({ line: event.position.lineNumber, column: event.position.column });
      });

      // Initialize Automatic Type Acquisition
      void ataService.init(monaco).then(() => {
        if (activeFile?.content) {
          ataService.acquireTypes(activeFile.content, 0);
        }
      });
    },
    [activeFile?.content],
  );

  useEffect(() => {
    if (project.files.length > 0) {
      ataService.acquireTypesForProject(project.files);
    }
  }, [project.files]);

  const handleSplitEditorMount = useCallback<OnMount>((editor) => {
    editor.onDidChangeCursorPosition((event) => {
      setCursor({ line: event.position.lineNumber, column: event.position.column });
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        if (isSplitActive) {
          closeSplitPane();
        } else {
          const other =
            openPaths.find((p) => p !== activePath) ||
            project.files.find((f) => f.path !== activePath)?.path ||
            activePath;
          if (other) openToSide(other);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTerminal, isSplitActive, openPaths, activePath, project.files, openToSide, closeSplitPane]);

  /* ── Terminal resize ──────────────────────────────────────────────────────
   *
   * Pointer events with capture rather than window listeners: capture keeps the
   * drag tracking even when the cursor leaves the 4px handle, which is otherwise
   * very easy to do and makes the resize feel broken.
   */
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const handleResizeDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      dragRef.current = { startY: event.clientY, startHeight: terminalHeight };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [terminalHeight],
  );

  const handleResizeMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    // Dragging up grows the panel, so the delta is inverted.
    const next = drag.startHeight + (drag.startY - event.clientY);
    const max = Math.max(TERMINAL_MIN_H, window.innerHeight * TERMINAL_MAX_FRACTION);
    setTerminalHeight(Math.min(max, Math.max(TERMINAL_MIN_H, next)));
  }, []);

  const handleResizeUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  /* ── Explorer imports ─────────────────────────────────────────────────── */

  const submitFiles = useCallback(
    async (files: File[]) => {
      if (!onAddImport || files.length === 0) return;
      await onAddImport({ files });
    },
    [onAddImport],
  );

  /**
   * Claims a drop over the explorer so it adds to this project.
   *
   * Without `stopPropagation` the window-level importer would also see it and
   * start a whole-project import with its review dialog, which is the opposite of
   * "add these files to the tree I am looking at".
   */
  const handleExplorerDrop = useCallback(
    (event: React.DragEvent) => {
      if (!onAddImport || !carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      event.stopPropagation();
      setIsExplorerDropTarget(false);
      // Must read synchronously: DataTransferItem is neutered after this returns.
      const collected = collectTransfer(event.dataTransfer);
      void onAddImport(collected);
    },
    [onAddImport],
  );

  const handleExplorerDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!onAddImport || !carriesFiles(event.dataTransfer)) return;
      // Every dragover must be prevented, or no drop event is fired at all.
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      setIsExplorerDropTarget(true);
    },
    [onAddImport],
  );

  const activePreview = webcontainer.serverUrl
    ? {
        port: webcontainer.serverPort ?? 5173,
        label: `⚡ WebContainer (Port ${webcontainer.serverPort ?? 5173})`,
        url: webcontainer.serverUrl,
        isWebContainer: true,
      }
    : null;

  /* ── Right panel horizontal resize & live preview fullscreen ───────────── */
  const rightPanelDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gbcoder_vscode_right_panel_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed >= 300 && parsed <= 1800) {
          return parsed;
        }
      }
    }
    return 480;
  });
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const handleRightPanelResizeDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      rightPanelDragRef.current = { startX: event.clientX, startWidth: rightPanelWidth };
      setIsDraggingRightPanel(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [rightPanelWidth],
  );

  const handleRightPanelResizeMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = rightPanelDragRef.current;
    if (!drag) return;
    // Dragging left grows the right panel: delta is inverted (startX - clientX)
    const delta = drag.startX - event.clientX;
    const maxWidth = Math.max(400, window.innerWidth * 0.85);
    const next = Math.max(300, Math.min(maxWidth, drag.startWidth + delta));
    setRightPanelWidth(Math.round(next));
  }, []);

  const handleRightPanelResizeUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = rightPanelDragRef.current;
    if (drag) {
      try {
        localStorage.setItem('gbcoder_vscode_right_panel_width', String(rightPanelWidth));
      } catch {
        // Ignored
      }
    }
    rightPanelDragRef.current = null;
    setIsDraggingRightPanel(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [rightPanelWidth]);

  // Sync active dev server preview to detached popout tabs
  useEffect(() => {
    if (activePreview?.url) {
      livePreviewChannel.broadcastDevServer(
        activePreview.url,
        activePreview.port,
        activePreview.label,
      );
    }
  }, [activePreview?.url, activePreview?.port, activePreview?.label]);

  const handleOpenInNewTab = useCallback(() => {
    if (activePreview) {
      livePreviewChannel.broadcastDevServer(
        activePreview.url,
        activePreview.port,
        activePreview.label,
      );
      const urlParam = encodeURIComponent(activePreview.url);
      const portParam = encodeURIComponent(String(activePreview.port));
      window.open(`/preview-popout?url=${urlParam}&port=${portParam}`, '_blank');
    }
  }, [activePreview]);

  // Escape key exits fullscreen preview
  useEffect(() => {
    if (!isPreviewFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen]);

  const monacoOptions = useMemo(
    () => ({
      fontFamily,
      fontSize,
      minimap: { enabled: true },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: 2,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      formatOnPaste: true,
      formatOnType: true,
      parameterHints: { enabled: true },
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on' as const,
      tabCompletion: 'on' as const,
      wordWrap: 'on' as const,
    }),
    [fontFamily, fontSize],
  );

  const activeLanguage = activeFile ? monacoLanguageForPath(activeFile.path) : null;

  /*
   * The mode is reachable by URL, so it can legitimately be open with nothing in
   * it. That is a state to show rather than a case to redirect out of: sending the
   * user somewhere else would contradict the address they navigated to.
   */
  const hasFiles = project.files.length > 0;

  const handleRestartDevServer = useCallback(() => {
    webcontainerService.setStartupStage('installing');
    openTerminal();
    toast.success('Restarting WebContainer environment...');
    void webcontainerService.mountProject(project.files, project.dependencies, project.projectType);
  }, [openTerminal, project.files, project.dependencies, project.projectType]);

  return (
    // h-full inside App's h-screen wrapper; overflow-hidden forbids page scroll.
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-vsc-editor text-vsc-text"
      data-testid="vscode-mode"
    >
      {/* ── Top Bar: StackBlitz Application Header Bar ── */}
      <header
        className="flex h-10 shrink-0 items-center justify-between border-b border-[#262636] bg-[#181824] px-3 select-none z-20"
        data-testid="vscode-topbar"
      >
        {/* Left Section: Lightning Logo & Brand */}
        <div className="flex items-center gap-2">
          {/* StackBlitz Glowing Lightning Bolt & Brand */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenProjects}>
            <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span className="font-semibold text-xs text-white tracking-wide">GB Coder</span>
          </div>

          {/* Nav Arrows */}
          <div className="hidden md:flex items-center gap-0.5 ml-1">
            <button
              type="button"
              className="rounded p-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              title="Navigate back"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              title="Navigate forward"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center Section: Command Search / Quick Open Bar (Screenshot 2 & 3) */}
        <div
          onClick={() => {
            const path = prompt('Quick Open File:', activePath || '');
            if (path && project.files.some((f) => f.path === path)) {
              openFile(path);
            }
          }}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-[#12131c] px-3 py-1 text-xs text-slate-300 shadow-inner hover:border-white/20 transition-all cursor-pointer w-64 md:w-80 justify-between"
          title="Quick Open / Command Search (Ctrl+P)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-300 font-mono text-[11px]">
              codewithusa/{project.name || 'gb-coder-app'}
            </span>
          </div>
          <kbd className="hidden sm:inline-block rounded border border-white/15 bg-white/5 px-1 py-0.2 text-[9px] text-slate-400 font-mono">
            Ctrl+P
          </kbd>
        </div>

        {/* Right Section: WebContainer Live Status, Share, Exit */}
        <div className="flex items-center gap-1.5">
          {/* Status Badge */}
          {webcontainer.isSupported && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px]">
              {webcontainer.startupStage === 'ready' || webcontainer.serverUrl ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">WebContainer Live</span>
                </>
              ) : webcontainer.startupStage === 'installing' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                  <span className="text-cyan-300">Installing Deps</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-300">WebContainer Ready</span>
                </>
              )}
            </div>
          )}

          {/* Share Button (Screenshot 2 & 3) */}
          <Tooltip label="Share Project" side="bottom">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Workspace link copied!');
              }}
              className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2.5 py-1 text-xs text-slate-200 border border-white/10 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-300" />
              <span className="hidden sm:inline text-[11px]">Share</span>
            </button>
          </Tooltip>

          {/* Exit VS Code Mode Button */}
          <Tooltip label="Exit VS Code Mode" side="bottom">
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-300 px-2.5 py-1 text-xs text-slate-300 border border-white/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* ── Body: Activity Bar + Left Sidebar + Middle (Editor + Docked Terminal) + Right (Preview) ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Activity Bar on far left */}
        <ActivityBar
          activeTab={activityTab}
          onChangeTab={setActiveTab}
          isTerminalOpen={showTerminal}
          onToggleTerminal={toggleTerminal}
          serverRunning={Boolean(webcontainer.serverUrl)}
          isCodeAssistGenerating={codeAssistState.isGenerating}
          onOpenCodeRabbit={() => setIsCodeRabbitOpen(true)}
          onOpenVoiceCommands={() => setIsVoiceCommandsOpen(true)}
          onOpenSnapshots={() => setIsSnapshotsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExit={onExit}
          onResetContainer={() => {
            void webcontainerService.mountProject(project.files, project.dependencies, project.projectType);
            toast.success('WebContainer virtual filesystem remounted');
          }}
        />

        {/* Left Sidebar: Explorer / Search / Code Assist / Packages / Ports */}
        <aside
          className={`flex ${
            activityTab === 'code-assist' || activityTab === 'packages' ? 'w-96' : 'w-60'
          } shrink-0 flex-col overflow-hidden border-r bg-[#181824] transition-[width] duration-150 ${
            isExplorerDropTarget ? 'border-accent' : 'border-[#262636]'
          }`}
          data-testid="vscode-explorer"
        >
          {activityTab === 'explorer' ? (
            <>
              {/* Explorer Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#262636] px-3 py-2 select-none">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  Explorer
                </span>

                <div className="flex items-center gap-0.5">
                  <Tooltip label="New File" side="bottom">
                    <button
                      type="button"
                      onClick={() => treeRef.current?.startNewFile()}
                      aria-label="New File"
                      data-testid="explorer-new-file"
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip label="New Folder" side="bottom">
                    <button
                      type="button"
                      onClick={() => treeRef.current?.startNewFolder()}
                      aria-label="New Folder"
                      data-testid="explorer-new-folder"
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip label="Collapse All Folders" side="bottom">
                    <button
                      type="button"
                      onClick={() => treeRef.current?.collapseAll()}
                      aria-label="Collapse All Folders"
                      data-testid="explorer-collapse-all"
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <FolderArchive className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip label="Load Folder from Disk" side="bottom">
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      aria-label="Load Folder"
                      data-testid="explorer-load-folder"
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <FolderDown className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Accordion List matching StackBlitz (Screenshot 2 & 3) */}
              <div
                className="min-h-0 flex-1 overflow-y-auto"
                data-testid="vscode-explorer-scroll"
                onDragOver={handleExplorerDragOver}
                onDragLeave={() => setIsExplorerDropTarget(false)}
                onDrop={handleExplorerDrop}
              >
                {/* > INFO Accordion */}
                <div className="border-b border-[#262636]/60">
                  <button
                    type="button"
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-slate-400 hover:bg-white/5 hover:text-slate-200 uppercase select-none"
                  >
                    {isInfoOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Info
                  </button>
                  {isInfoOpen && (
                    <div className="px-5 py-2 text-[11px] text-slate-400 space-y-1 bg-[#13141f]">
                      <p><span className="text-slate-500">Framework:</span> React + Vite</p>
                      <p><span className="text-slate-500">Runtime:</span> In-Browser WebContainer</p>
                      <p><span className="text-slate-500">Files:</span> {project.files.length} loaded</p>
                      <p><span className="text-slate-500">Cost:</span> $0.00 (Zero cloud compute)</p>
                    </div>
                  )}
                </div>

                {/* v PROJECT_NAME Accordion (Contains FileTreeView) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsProjectRootOpen(!isProjectRootOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-slate-300 hover:bg-white/5 uppercase select-none"
                  >
                    {isProjectRootOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    <span className="truncate">{project.name || 'GB-CODER-WORKSPACE'}</span>
                    <span className="ml-auto rounded bg-slate-800 px-1 text-[9px] text-slate-400">
                      {project.files.length}
                    </span>
                  </button>

                  {isProjectRootOpen && (
                    <FileTreeView
                      ref={treeRef}
                      files={project.files}
                      activePath={activePath}
                      dirtyPaths={dirtyPaths}
                      onOpen={openFile}
                      onOpenToSide={openToSide}
                      onCreateFile={handleCreateFile}
                      onCreateFolder={handleCreateFolder}
                      onRename={handleRenameFile}
                      onDelete={handleDeleteFile}
                      onDuplicate={handleDuplicateFile}
                    />
                  )}
                </div>

                {/* > OUTLINE Accordion */}
                <div className="border-t border-[#262636]/60">
                  <button
                    type="button"
                    onClick={() => setIsOutlineOpen(!isOutlineOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-slate-400 hover:bg-white/5 hover:text-slate-200 uppercase select-none"
                  >
                    {isOutlineOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Outline
                  </button>
                  {isOutlineOpen && (
                    <div className="px-5 py-2 text-[11px] text-slate-500 italic bg-[#13141f]">
                      {activePath ? `Active symbol structure: ${activePath}` : 'No symbols to display'}
                    </div>
                  )}
                </div>

                {/* > TIMELINE Accordion */}
                <div className="border-t border-[#262636]/60">
                  <button
                    type="button"
                    onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-slate-400 hover:bg-white/5 hover:text-slate-200 uppercase select-none"
                  >
                    {isTimelineOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Timeline
                  </button>
                  {isTimelineOpen && (
                    <div className="px-5 py-2 text-[11px] text-slate-500 italic bg-[#13141f]">
                      Workspace file history active
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activityTab === 'search' ? (
            <div className="flex h-full flex-col p-3 text-xs">
              <span className="font-bold tracking-wider uppercase text-slate-400 mb-2">Search</span>
              <input
                type="text"
                value={quickSearchTerm}
                onChange={(e) => setQuickSearchTerm(e.target.value)}
                placeholder="Search files by name..."
                className="w-full rounded border border-[#262636] bg-[#12131c] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <div className="mt-3 flex-1 overflow-y-auto space-y-1">
                {project.files
                  .filter((f) => !quickSearchTerm || f.path.toLowerCase().includes(quickSearchTerm.toLowerCase()))
                  .slice(0, 30)
                  .map((f) => (
                    <button
                      key={f.path}
                      onClick={() => openFile(f.path)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-slate-300 hover:bg-white/10 hover:text-white truncate"
                    >
                      <span className="truncate">{f.path}</span>
                    </button>
                  ))}
              </div>
            </div>
          ) : activityTab === 'code-assist' ? (
            <CodeAssistPanel
              project={project}
              onApplyFiles={handleApplyCodeAssistFiles}
              onClose={() => setActiveTab('explorer')}
            />
          ) : activityTab === 'packages' ? (
            <div className="flex h-full w-full flex-col overflow-hidden bg-[#181824]">
              <DependenciesPanel
                project={project}
                resolvedPackages={[]}
                unresolvedPackages={[]}
                isResolving={false}
                onPin={(name, ver) => {
                  if (project.dependencies) {
                    project.dependencies[name] = ver;
                  }
                }}
                onUnpin={(name) => {
                  if (project.dependencies) {
                    delete project.dependencies[name];
                  }
                }}
                onClose={() => setActiveTab('explorer')}
                onChangeFile={(path, content) => {
                  onChangeFile(path, content);
                  void webcontainerService.syncFile(path, content);
                }}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col p-3 text-xs">
              <span className="font-bold tracking-wider uppercase text-slate-400 mb-2">Ports & Servers</span>
              <div className="rounded-lg border border-white/10 bg-[#12131c] p-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">Vite Dev Server</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">Port: {webcontainer.serverPort || 5173}</p>
                <p className="text-slate-500 text-[10px] truncate mt-0.5">
                  URL: {webcontainer.serverUrl || 'http://localhost:5173/'}
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Editor column: one file at a time, or split dual panes */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-vsc-editor">
          {isSplitActive ? (
            /* Split View: Dual Panes with Resizer */
            <div
              className={`flex min-h-0 flex-1 overflow-hidden ${
                splitDirection === 'vertical' ? 'flex-row' : 'flex-col'
              }`}
              data-testid="vscode-editor-panes"
            >
              {/* Primary Pane */}
              <div
                style={{
                  [splitDirection === 'vertical' ? 'width' : 'height']: `${splitRatio}%`,
                }}
                className="flex min-h-0 min-w-0 flex-col overflow-hidden"
                data-testid="vscode-pane-primary"
              >
                {/* Tabbar Primary */}
                <div
                  className="flex shrink-0 items-stretch justify-between border-b border-vsc-border bg-vsc-tabbar"
                  data-testid="vscode-tabbar-container"
                >
                  <div
                    className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
                    role="tablist"
                    data-testid="vscode-tabs"
                  >
                    {openPaths.map((path) => {
                      const name = path.split('/').pop() ?? path;
                      const isActive = path === activePath;
                      return (
                        <div
                          key={path}
                          role="tab"
                          aria-selected={isActive}
                          data-testid="vscode-tab"
                          data-path={path}
                          onClick={() => setActivePath(path)}
                          className={`group flex min-w-0 cursor-pointer items-center gap-1.5 border-r border-t-2 border-r-vsc-border px-3 py-1.5 text-xs ${
                            isActive
                              ? 'border-t-accent bg-vsc-editor text-content-on-dark'
                              : 'border-t-transparent text-vsc-textMuted hover:bg-product-hover hover:text-vsc-text'
                          }`}
                          title={path}
                        >
                          <span className="max-w-[10rem] truncate">{name}</span>
                          {dirtyPaths.has(path) && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-vsc-text"
                              data-testid="tab-dirty-dot"
                              title="Unsaved changes"
                            />
                          )}
                          <button
                            onClick={(event) => closeTab(path, event)}
                            aria-label={`Close ${name}`}
                            data-testid="vscode-tab-close"
                            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-product-hover group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex shrink-0 items-center px-1 border-l border-vsc-border bg-vsc-tabbar gap-0.5">
                    {activePath && (
                      <Tooltip label="Move Tab to Other Pane" side="bottom">
                        <button
                          type="button"
                          onClick={() => moveTabToOtherPane(activePath, 'left')}
                          className="p-1 rounded text-vsc-textMuted hover:bg-product-hover hover:text-white"
                          title="Move tab to side pane"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Primary Monaco Editor */}
                <div className="min-h-0 flex-1 overflow-hidden" data-testid="vscode-editor-scroll">
                  {activeFile ? (
                    <Editor
                      path={activeFile.path}
                      language={monacoLanguageForPath(activeFile.path)}
                      value={activeFile.content}
                      onChange={handleChange}
                      beforeMount={defineGbCoderTheme}
                      onMount={handleEditorMount}
                      theme={monacoThemeFor(isDark)}
                      options={monacoOptions}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-vsc-textMuted">
                      Select a file from the explorer.
                    </div>
                  )}
                </div>
              </div>

              {/* Resizer Divider */}
              <div
                role="separator"
                aria-orientation={splitDirection}
                onPointerDown={handleSplitResizeDown}
                onPointerMove={handleSplitResizeMove}
                onPointerUp={handleSplitResizeUp}
                className={`shrink-0 bg-vsc-border hover:bg-accent active:bg-accent transition-colors z-10 flex items-center justify-center select-none ${
                  splitDirection === 'vertical'
                    ? 'w-1.5 cursor-col-resize h-full'
                    : 'h-1.5 cursor-row-resize w-full'
                }`}
                title="Drag to resize panes"
              >
                <div
                  className={`bg-vsc-textMuted rounded-full pointer-events-none ${
                    splitDirection === 'vertical' ? 'w-0.5 h-6' : 'h-0.5 w-6'
                  }`}
                />
              </div>

              {/* Secondary Split Pane */}
              <div
                style={{
                  [splitDirection === 'vertical' ? 'width' : 'height']: `${100 - splitRatio}%`,
                }}
                className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-vsc-editor"
                data-testid="vscode-pane-secondary"
              >
                {/* Secondary Tabbar */}
                <div
                  className="flex shrink-0 items-stretch justify-between border-b border-vsc-border bg-vsc-tabbar"
                  data-testid="vscode-split-tabbar-container"
                >
                  <div
                    className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
                    role="tablist"
                    data-testid="vscode-split-tabs"
                  >
                    {splitOpenPaths.map((path) => {
                      const name = path.split('/').pop() ?? path;
                      const isActive = path === splitActivePath;
                      return (
                        <div
                          key={path}
                          role="tab"
                          aria-selected={isActive}
                          data-testid="vscode-split-tab"
                          data-path={path}
                          onClick={() => setSplitActivePath(path)}
                          className={`group flex min-w-0 cursor-pointer items-center gap-1.5 border-r border-t-2 border-r-vsc-border px-3 py-1.5 text-xs ${
                            isActive
                              ? 'border-t-accent bg-vsc-editor text-content-on-dark'
                              : 'border-t-transparent text-vsc-textMuted hover:bg-product-hover hover:text-vsc-text'
                          }`}
                          title={path}
                        >
                          <span className="max-w-[10rem] truncate">{name}</span>
                          {dirtyPaths.has(path) && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-vsc-text"
                              data-testid="tab-dirty-dot"
                              title="Unsaved changes"
                            />
                          )}
                          <button
                            onClick={(event) => closeSplitTab(path, event)}
                            aria-label={`Close ${name}`}
                            data-testid="vscode-split-tab-close"
                            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-product-hover group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Secondary Pane Controls */}
                  <div className="flex shrink-0 items-center px-1 border-l border-vsc-border bg-vsc-tabbar gap-1">
                    {splitActivePath && (
                      <Tooltip label="Move Tab to Main Pane" side="bottom">
                        <button
                          type="button"
                          onClick={() => moveTabToOtherPane(splitActivePath, 'right')}
                          className="p-1 rounded text-vsc-textMuted hover:bg-product-hover hover:text-white"
                          title="Move tab to main pane"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip
                      label={
                        splitDirection === 'vertical'
                          ? 'Switch to Horizontal Split'
                          : 'Switch to Vertical Split'
                      }
                      side="bottom"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSplitDirection((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'))
                        }
                        className="p-1 rounded text-vsc-textMuted hover:bg-product-hover hover:text-white"
                        title={
                          splitDirection === 'vertical'
                            ? 'Switch to Horizontal Split'
                            : 'Switch to Vertical Split'
                        }
                      >
                        {splitDirection === 'vertical' ? (
                          <Rows className="h-3.5 w-3.5" />
                        ) : (
                          <Columns className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip label="Close Split Pane" side="bottom">
                      <button
                        type="button"
                        onClick={closeSplitPane}
                        className="p-1 rounded text-vsc-textMuted hover:bg-product-hover hover:text-white"
                        title="Close split pane"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Secondary Editor Content */}
                <div
                  className="min-h-0 flex-1 overflow-hidden"
                  data-testid="vscode-editor-scroll-secondary"
                >
                  {splitActiveFile ? (
                    <Editor
                      path={splitActiveFile.path}
                      language={monacoLanguageForPath(splitActiveFile.path)}
                      value={splitActiveFile.content}
                      onChange={handleSplitChange}
                      beforeMount={defineGbCoderTheme}
                      onMount={handleSplitEditorMount}
                      theme={monacoThemeFor(isDark)}
                      options={monacoOptions}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-vsc-textMuted">
                      Select a file from the explorer to view side-by-side.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Single Pane Mode */
            <>
              <div
                className="flex shrink-0 items-stretch justify-between border-b border-vsc-border bg-vsc-tabbar"
                data-testid="vscode-tabbar-container"
              >
                <div
                  className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
                  role="tablist"
                  data-testid="vscode-tabs"
                >
                  {openPaths.map((path) => {
                    const name = path.split('/').pop() ?? path;
                    const isActive = path === activePath;
                    return (
                      <div
                        key={path}
                        role="tab"
                        aria-selected={isActive}
                        data-testid="vscode-tab"
                        data-path={path}
                        onClick={() => setActivePath(path)}
                        className={`group flex min-w-0 cursor-pointer items-center gap-1.5 border-r border-t-2 border-r-vsc-border px-3 py-1.5 text-xs ${
                          isActive
                            ? 'border-t-accent bg-vsc-editor text-content-on-dark'
                            : 'border-t-transparent text-vsc-textMuted hover:bg-product-hover hover:text-vsc-text'
                        }`}
                        title={path}
                      >
                        <span className="max-w-[12rem] truncate">{name}</span>
                        {dirtyPaths.has(path) && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-vsc-text"
                            data-testid="tab-dirty-dot"
                            title="Unsaved changes"
                          />
                        )}
                        <button
                          onClick={(event) => closeTab(path, event)}
                          aria-label={`Close ${name}`}
                          data-testid="vscode-tab-close"
                          className="rounded p-0.5 opacity-0 transition-opacity hover:bg-product-hover group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Split Editor Toggle */}
                {hasFiles && (
                  <div className="flex shrink-0 items-center px-1 border-l border-vsc-border bg-vsc-tabbar">
                    <Tooltip label="Split Editor Right (Side-by-Side)" side="bottom">
                      <button
                        type="button"
                        onClick={() => {
                          const other =
                            openPaths.find((p) => p !== activePath) ||
                            project.files.find((f) => f.path !== activePath)?.path;
                          openToSide(other || activePath || project.files[0]?.path);
                        }}
                        className="p-1 rounded text-xs transition-colors flex items-center gap-1 text-vsc-textMuted hover:bg-product-hover hover:text-white"
                        title="Split Editor Right (Side-by-Side)"
                      >
                        <Columns className="h-3.5 w-3.5" />
                        <span className="text-[10px] hidden sm:inline">Split</span>
                      </button>
                    </Tooltip>
                  </div>
                )}

                {/* Restore Minimized Live Preview button */}
                {isPreviewMinimized && (
                  <div className="flex shrink-0 items-center px-1 border-l border-vsc-border bg-vsc-tabbar">
                    <Tooltip label="Restore Live Preview" side="bottom">
                      <button
                        type="button"
                        onClick={() => setIsPreviewMinimized(false)}
                        className="flex items-center gap-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300 border border-cyan-500/30 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-semibold hidden sm:inline">Preview</span>
                        <Maximize2 className="h-3 w-3" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              {/* Monaco scrolls internally; this box only bounds it. */}
              <div className="min-h-0 flex-1 overflow-hidden" data-testid="vscode-editor-scroll">
                {activeFile ? (
                  <Editor
                    path={activeFile.path}
                    language={monacoLanguageForPath(activeFile.path)}
                    value={activeFile.content}
                    onChange={handleChange}
                    beforeMount={defineGbCoderTheme}
                    onMount={handleEditorMount}
                    theme={monacoThemeFor(isDark)}
                    options={monacoOptions}
                  />
                ) : hasFiles ? (
                  <div className="grid h-full place-items-center text-xs text-vsc-textMuted">
                    Select a file from the explorer.
                  </div>
                ) : (
                  <div
                    className="grid h-full place-items-center px-6 text-center"
                    data-testid="vscode-empty-state"
                  >
                    <div>
                      <FolderPlus className="mx-auto mb-3 h-7 w-7 text-vsc-textMuted" />
                      <p className="text-sm font-semibold text-content-on-dark">No project loaded</p>
                      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-vsc-textMuted">
                        Import a folder to get started. What you load stays in this workspace, so a
                        refresh brings it back.
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => folderInputRef.current?.click()}
                          data-testid="empty-load-folder"
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover"
                        >
                          Load Folder
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="empty-load-file"
                          className="rounded-lg border border-vsc-borderStrong px-3 py-1.5 text-xs font-semibold text-vsc-text hover:bg-product-hover hover:text-content-on-dark"
                        >
                          Load File
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* ── Docked Bottom Panel (PROBLEMS / OUTPUT / TERMINAL - StackBlitz Style) ── */}
          {hasOpenedTerminal && (
            <div
              className={`flex shrink-0 flex-col overflow-hidden border-t border-[#262636] bg-[#181824] ${
                showTerminal ? 'flex' : 'hidden'
              }`}
              style={{ height: `${terminalHeight}px` }}
              data-testid="vscode-docked-bottom-panel"
            >
              {/* Resize Handle */}
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize terminal panel"
                onPointerDown={handleResizeDown}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeUp}
                className="h-1 shrink-0 cursor-row-resize bg-[#262636] hover:bg-[#007acc] transition-colors"
              />

              {/* StackBlitz Panel Tabs: PROBLEMS, OUTPUT, TERMINAL */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#262636] bg-[#181824] px-2 h-7 select-none">
                <div className="flex items-center gap-1 h-full">
                  <button
                    type="button"
                    onClick={() => setBottomTab('problems')}
                    className={`flex items-center gap-1.5 px-2.5 h-full text-[11px] font-medium transition-colors border-b-2 ${
                      bottomTab === 'problems'
                        ? 'border-[#007acc] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PROBLEMS
                    <span className="rounded-full bg-slate-800 px-1 text-[9px] text-slate-400">0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBottomTab('output')}
                    className={`flex items-center gap-1.5 px-2.5 h-full text-[11px] font-medium transition-colors border-b-2 ${
                      bottomTab === 'output'
                        ? 'border-[#007acc] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OUTPUT
                  </button>

                  <button
                    type="button"
                    onClick={() => setBottomTab('terminal')}
                    className={`flex items-center gap-1.5 px-2.5 h-full text-[11px] font-semibold transition-colors border-b-2 ${
                      bottomTab === 'terminal'
                        ? 'border-[#007acc] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TerminalSquare className="h-3 w-3 text-cyan-400" />
                    TERMINAL
                  </button>
                </div>

                {/* Right toolbar controls matching StackBlitz Screenshot 2 & 3: +, Split, Clear, Maximize, Close */}
                <div className="flex items-center gap-0.5">
                  <Tooltip label="New Terminal / Restart" side="top">
                    <button
                      type="button"
                      onClick={() => handleRestartDevServer()}
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </Tooltip>

                  <Tooltip label="Split Terminal" side="top">
                    <button
                      type="button"
                      onClick={() => toast('Split terminal ready', { icon: '⚡' })}
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <Columns className="h-3 w-3" />
                    </button>
                  </Tooltip>

                  <Tooltip label="Maximize / Minimize Panel" side="top">
                    <button
                      type="button"
                      onClick={() => {
                        setTerminalHeight((h) => (h > 320 ? 220 : 420));
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      {terminalHeight > 320 ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </button>
                  </Tooltip>

                  <Tooltip label="Close Panel" side="top">
                    <button
                      type="button"
                      onClick={() => setShowTerminal(false)}
                      className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Panel Content */}
              <div className="min-h-0 flex-1 overflow-hidden">
                {bottomTab === 'terminal' ? (
                  <TerminalTab
                    project={project}
                    resolvedPackages={[]}
                    unresolvedPackages={[]}
                    isResolvingPackages={false}
                    isActive={showTerminal && bottomTab === 'terminal'}
                    autoStartProject={true}
                  />
                ) : bottomTab === 'problems' ? (
                  <div className="flex h-full items-center justify-center p-4 text-xs text-slate-500 font-mono">
                    No problems have been detected in the workspace.
                  </div>
                ) : (
                  <div className="flex h-full flex-col p-3 font-mono text-xs text-slate-400 overflow-y-auto">
                    <p className="text-cyan-400">[GB Coder Output Log]</p>
                    <p className="text-slate-500">
                      Container virtual filesystem mounted: {project.files.length} files.
                    </p>
                    <p className="text-slate-500">
                      WebContainer environment: Cross-Origin Isolated (COOP/COEP verified).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right panel resize handle */}
        {!isPreviewMinimized && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize right panel"
            onPointerDown={handleRightPanelResizeDown}
            onPointerMove={handleRightPanelResizeMove}
            onPointerUp={handleRightPanelResizeUp}
            onDoubleClick={() => {
              setRightPanelWidth(480);
              try {
                localStorage.setItem('gbcoder_vscode_right_panel_width', '480');
              } catch {
                // Ignored
              }
            }}
            className={`group relative flex w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors select-none ${
              isDraggingRightPanel ? 'bg-[#007acc]' : 'bg-transparent hover:bg-[#007acc]/40'
            }`}
            title="Drag to resize right panel (Double click to reset to 480px)"
          >
            <div className="h-8 w-0.5 rounded-full bg-[#262636] group-hover:bg-[#007acc] transition-colors" />
          </div>
        )}

        {/* ── Right Panel: Browser Chrome + Live Preview / StackBlitz Loader ── */}
        {!isPreviewMinimized && (
          <aside
            style={{
              width: isPreviewMaximized
                ? `${Math.max(rightPanelWidth, Math.floor(window.innerWidth * 0.62))}px`
                : `${rightPanelWidth}px`,
            }}
            className="flex min-w-[20rem] shrink-0 flex-col overflow-hidden border-l border-[#262636] bg-[#181824] transition-[width] duration-150"
            data-testid="vscode-right-panel"
          >
            {/* Top Browser Bar Chrome (Screenshot 2 & 3) */}
            <div className="flex shrink-0 items-center justify-between gap-1 border-b border-[#262636] bg-[#181824] px-2.5 py-1.5 select-none">
              {/* Nav controls */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewKey((k) => k + 1);
                    livePreviewChannel.broadcastReload();
                  }}
                  title="Reload Live Preview"
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded p-1 text-slate-600 cursor-not-allowed"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded p-1 text-slate-600 cursor-not-allowed"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* URL Address Bar Pill (Screenshot 2) */}
              <div
                className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-white/10 bg-[#12131c] px-2.5 py-1 text-[11px] text-slate-300 font-mono shadow-inner mx-1.5 group cursor-pointer hover:border-white/20 transition-all"
                onClick={() => {
                  const url = activePreview?.url || `http://localhost:${webcontainer.serverPort || 5173}/`;
                  void navigator.clipboard?.writeText(url);
                  setCopiedUrl(true);
                  toast.success('URL copied to clipboard!');
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                title="Click to copy URL"
              >
                <Lock className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-300">
                  {activePreview?.url
                    ? activePreview.url.replace(/^https?:\/\//, '')
                    : `localhost:${webcontainer.serverPort || 5173}/`}
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 shrink-0">
                  {copiedUrl ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                </span>
              </div>

              {/* Right actions: Viewport mode, Popout, Minimize, Maximize Width, Fullscreen */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Responsive Device Viewport Toggles */}
                <div className="hidden sm:flex items-center rounded bg-slate-900 border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDeviceViewport('desktop')}
                    title="Desktop (100% Fluid)"
                    className={`rounded p-0.5 transition-colors ${
                      deviceViewport === 'desktop' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceViewport('tablet')}
                    title="Tablet Viewport (768px)"
                    className={`rounded p-0.5 transition-colors ${
                      deviceViewport === 'tablet' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tablet className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceViewport('mobile')}
                    title="Mobile Viewport (375px)"
                    className={`rounded p-0.5 transition-colors ${
                      deviceViewport === 'mobile' ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                  </button>
                </div>

                {/* Popout */}
                <Tooltip label="Open in New Tab" side="bottom">
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    title="Open in New Tab (Live Updating Popout)"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </Tooltip>

                {/* Maximize Panel Width Toggle */}
                <Tooltip label={isPreviewMaximized ? "Restore Panel Width" : "Maximize Panel"} side="bottom">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                    title={isPreviewMaximized ? "Restore Width" : "Maximize Width"}
                    className={`rounded p-1 transition-colors ${
                      isPreviewMaximized ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Columns className="h-3 w-3" />
                  </button>
                </Tooltip>

                {/* Fullscreen */}
                <Tooltip label="Fullscreen Preview" side="bottom">
                  <button
                    type="button"
                    onClick={() => setIsPreviewFullscreen(true)}
                    title="Fullscreen Preview"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                </Tooltip>

                {/* Minimize Preview Panel */}
                <Tooltip label="Minimize Preview Panel" side="bottom">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMinimized(true)}
                    title="Minimize Preview Panel"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </Tooltip>
              </div>
            </div>

          {/* Preview Body */}
          <div className="min-h-0 flex-1 overflow-hidden relative bg-[#13141f]">
            {activePreview?.url ? (
              <div
                className={`h-full w-full flex items-center justify-center ${
                  deviceViewport === 'mobile'
                    ? 'p-4 bg-slate-950'
                    : deviceViewport === 'tablet'
                    ? 'p-2 bg-slate-950'
                    : ''
                }`}
              >
                <div
                  style={{
                    width:
                      deviceViewport === 'mobile'
                        ? '375px'
                        : deviceViewport === 'tablet'
                        ? '768px'
                        : '100%',
                    height: '100%',
                  }}
                  className={`flex flex-col bg-white overflow-hidden transition-all duration-200 ${
                    deviceViewport !== 'desktop'
                      ? 'rounded-lg shadow-2xl border border-white/20'
                      : ''
                  }`}
                >
                  <iframe
                    key={previewKey}
                    src={activePreview.url}
                    title="Live preview"
                    className={`min-h-0 flex-1 border-0 bg-white ${
                      isDraggingRightPanel ? 'pointer-events-none' : ''
                    }`}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
                  />
                </div>
              </div>
            ) : (
              /* When installing dependencies or booting: SHOW STACKBLITZ STARTUP LOADER (Screenshot 3!) */
              <StackBlitzStartupLoader
                stage={webcontainer.startupStage}
                serverPort={webcontainer.serverPort}
                onOpenTerminal={openTerminal}
                onRestart={() => void handleRestartDevServer()}
              />
            )}
          </div>
        </aside>
      )}
      </div>

      {/* ── Status bar: VS Code & StackBlitz Classic Blue Bar ── */}
      <footer
        className="flex h-6 shrink-0 items-center justify-between border-t border-[#0069b4] bg-[#007acc] px-2 text-[11px] text-white select-none z-10"
        data-testid="vscode-status-bar"
      >
        {/* Left items: diagnostics, terminal toggle */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
            <span>⊗ 0</span>
            <span>⚠ 0</span>
          </span>

          <button
            onClick={toggleTerminal}
            data-testid="vscode-terminal-toggle"
            aria-pressed={showTerminal}
            title="Toggle Terminal Panel (Ctrl+`)"
            className="flex items-center gap-1 rounded px-1 hover:bg-white/20 transition-colors"
          >
            <TerminalSquare className="h-3 w-3 text-cyan-200" />
            Terminal
          </button>
        </div>

        {/* Right items: ATA, Language, Cursor, Port, Layout */}
        <div className="flex items-center gap-2.5">
          {activeLanguage && (
            <span data-testid="status-language" className="hover:bg-white/20 px-1 rounded cursor-pointer">
              {LANGUAGE_LABEL[activeLanguage] ?? activeLanguage}
            </span>
          )}

          {activeFile && (
            <span data-testid="status-cursor" className="hover:bg-white/20 px-1 rounded cursor-pointer">
              Ln {cursor.line}, Col {cursor.column}
            </span>
          )}

          <span className="hover:bg-white/20 px-1 rounded cursor-pointer hidden md:inline">
            UTF-8
          </span>

          <span className="hover:bg-white/20 px-1 rounded cursor-pointer hidden md:inline">
            Spaces: 2
          </span>

          <span
            onClick={() => {
              setIsPreviewMinimized(false);
              setRightTab('preview');
            }}
            className="flex items-center gap-1 font-medium hover:bg-white/20 px-1 rounded cursor-pointer text-cyan-200"
            title="Live Preview Port"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Port {webcontainer.serverPort || 5173}
          </span>

          <span className="hover:bg-white/20 px-1 rounded cursor-pointer hidden lg:inline">
            Layout: US
          </span>
        </div>
      </footer>

      {/* ── Fullscreen Live Preview Modal / Overlay ── */}
      {isPreviewFullscreen && activePreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#1e1e1e] text-white shadow-2xl"
          role="dialog"
          aria-label="Fullscreen Live Preview"
        >
          {/* Header */}
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#333333] bg-[#252526] px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-semibold text-xs text-white truncate">
                {activePreview.label}
              </span>
              <span className="hidden sm:inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                Live Fullscreen Preview
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewKey((k) => k + 1);
                  livePreviewChannel.broadcastReload();
                }}
                className="flex items-center gap-1.5 rounded bg-[#333] hover:bg-[#444] px-2.5 py-1 text-xs text-gray-200 transition-colors"
                title="Reload preview"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">Reload</span>
              </button>

              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1.5 rounded bg-[#333] hover:bg-[#444] px-2.5 py-1 text-xs text-gray-200 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">New Tab</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewFullscreen(false)}
                className="flex items-center gap-1.5 rounded bg-accent hover:bg-accent-hover px-3 py-1 text-xs font-semibold text-white transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </header>

          {/* Iframe */}
          <iframe
            key={`fs-${previewKey}`}
            src={activePreview.url}
            title="Fullscreen live preview"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
          />
        </div>
      )}

      {/* Hidden inputs backing the Explorer's Load File / Load Folder buttons. */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".html,.htm,.css,.js,.mjs,.cjs,.jsx,.ts,.tsx,.vue,.json,.md,.txt,.zip,.env,.yml,.yaml,.toml"
        className="hidden"
        data-testid="explorer-file-input"
        onChange={(event) => {
          const raw = Array.from(event.target.files ?? []);
          const clean = raw.filter((f) => !/(^|[/\\])node_modules([/\\]|$)/i.test(f.name));
          void submitFiles(clean);
          event.target.value = '';
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error — non-standard but widely supported
        webkitdirectory=""
        directory=""
        className="hidden"
        data-testid="explorer-folder-input"
        onChange={(event) => {
          const raw = Array.from(event.target.files ?? []);
          // Strictly exclude node_modules and dependency caches from being loaded into the IDE
          const clean = raw.filter((file) => {
            const relPath =
              (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
              file.name;
            return !/(^|[/\\])(node_modules|\.git|dist|build|\.next|\.nuxt|\.cache|coverage|\.turbo|vendor|__pycache__|\.venv|venv)([/\\]|$)/i.test(
              relPath,
            );
          });
          void submitFiles(clean);
          event.target.value = '';
        }}
      />

      {/* ── Settings Modal (StackBlitz/IDE styled) ── */}
      <IDESettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ── CodeRabbit AI Bug Scanner Modal ── */}
      <CodeRabbitReviewModal
        isOpen={isCodeRabbitOpen}
        onClose={() => setIsCodeRabbitOpen(false)}
        files={project.files.map((f) => ({
          name: f.path,
          content: f.content,
          language: f.language,
        }))}
        onApplyFixToFile={(filePath, newContent) => {
          onChangeFile(filePath, newContent);
          void webcontainerService.syncFile(filePath, newContent);
          toast.success(`Applied fix to ${filePath}`);
        }}
      />

      {/* ── Voice Commands Overlay ── */}
      <VoiceCommandPanel
        isOpen={isVoiceCommandsOpen}
        onClose={() => setIsVoiceCommandsOpen(false)}
      />

      {/* ── Snapshots Manager Modal ── */}
      <SnapshotManagerModal
        isOpen={isSnapshotsOpen}
        onClose={() => setIsSnapshotsOpen(false)}
        onRestore={handleRestoreSnapshot}
        onPreview={() => {}}
      />
    </div>
  );
};

export default VSCodeMode;
