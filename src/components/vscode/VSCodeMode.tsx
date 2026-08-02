import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Box,
  FilePlus,
  FolderPlus,
  Info,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Mic,
  MonitorPlay,
  Package,
  Plug,
  Plus,
  RefreshCw,
  Server,
  TerminalSquare,
  X,
} from 'lucide-react';
import FileTreeView from './FileTreeView';
import TerminalTab from '../Console/TerminalTab';
import SandboxPanel from '../sandbox/SandboxPanel';
import Tooltip from '../ui/Tooltip';
import { GB_CODER_MONACO_THEME, defineGbCoderTheme } from '../../utils/monacoTheme';
import { MultiFileProject } from '../../types/files';
import { sandboxSession } from '../../services/sandbox/sandboxSession';
import { carriesFiles, collectTransfer } from '../../utils/dropTransfer';
import {
  readViewState,
  reconcileViewState,
  writeViewState,
} from '../../services/vscodeWorkspaceStore';

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

const subscribeSandbox = (onChange: () => void) => sandboxSession.subscribe(onChange);
const getSandboxSnapshot = () => sandboxSession.getState();

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
  const base = path.split('/').pop() ?? '';
  if (/^dockerfile$/i.test(base)) return 'dockerfile';
  if (/^makefile$/i.test(base)) return 'makefile';
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

type RightTab = 'preview' | 'sandbox';

const VSCodeMode: React.FC<VSCodeModeProps> = ({
  project,
  onChangeFile,
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
  const sandbox = useSyncExternalStore(subscribeSandbox, getSandboxSnapshot, getSandboxSnapshot);

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
  const [rightTab, setRightTab] = useState<RightTab>('sandbox');
  const [showBanner, setShowBanner] = useState(true);
  /*
   * VS Code mode replaces the standard console panel, so the Terminal has to be
   * reachable from here — otherwise the sandbox shell built for this feature
   * would have no entry point in the only mode that can use it.
   */
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(TERMINAL_DEFAULT_H);
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

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activePath) return;
      onChangeFile(activePath, value ?? '');
      setDirtyPaths((current) => {
        if (current.has(activePath)) return current;
        const next = new Set(current);
        next.add(activePath);
        return next;
      });
    },
    [activePath, onChangeFile],
  );

  /** Mirrors the caret into the status bar, the way VS Code reports Ln/Col. */
  const handleEditorMount = useCallback<OnMount>((editor) => {
    setCursor({
      line: editor.getPosition()?.lineNumber ?? 1,
      column: editor.getPosition()?.column ?? 1,
    });
    editor.onDidChangeCursorPosition((event) => {
      setCursor({ line: event.position.lineNumber, column: event.position.column });
    });
  }, []);

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

  const activePreview = sandbox.previews.find((preview) => preview.port === sandbox.activePort);
  /*
   * Both halves matter: a confirmed-live process with no exposed port has nothing
   * to show, and an exposed port whose process has since died would load an error.
   */
  const devServerReady = sandbox.devServerRunning && sandbox.previews.length > 0;

  const activeLanguage = activeFile ? monacoLanguageForPath(activeFile.path) : null;

  /*
   * The mode is reachable by URL, so it can legitimately be open with nothing in
   * it. That is a state to show rather than a case to redirect out of: sending the
   * user somewhere else would contradict the address they navigated to.
   */
  const hasFiles = project.files.length > 0;

  /** Top-bar entries. Icon-only by design, so each one carries a tooltip. */
  const topBarActions = [
    {
      id: 'preview',
      label: 'Live Preview',
      icon: <MonitorPlay className="h-4 w-4" />,
      onClick: () => setRightTab('preview'),
      isActive: rightTab === 'preview',
    },
    {
      id: 'sandbox',
      label: 'Sandbox',
      icon: <Box className="h-4 w-4" />,
      onClick: () => setRightTab('sandbox'),
      isActive: rightTab === 'sandbox',
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      icon: <Package className="h-4 w-4" />,
      onClick: onOpenDependencies,
      isActive: false,
    },
    {
      id: 'ai-chat',
      label: 'AI Chat',
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: onOpenAIChat,
      isActive: false,
    },
    {
      id: 'voice',
      label: 'Voice Commands',
      icon: <Mic className="h-4 w-4" />,
      onClick: onOpenVoiceCommands,
      isActive: false,
    },
  ];

  return (
    // h-full inside App's h-screen wrapper; overflow-hidden forbids page scroll.
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-vsc-editor text-vsc-text"
      data-testid="vscode-mode"
    >
      {/* ── Top bar: icon-only, replaces the app's normal chrome ── */}
      <header
        className="flex h-9 shrink-0 items-center gap-1 border-b border-vsc-border bg-vsc-panel px-2"
        data-testid="vscode-topbar"
      >
        {/* Same role the app's logo plays elsewhere: the way back to the
            dashboard. A plain label when there is nowhere to go back to. */}
        {onOpenProjects ? (
          <Tooltip label="All Projects" side="bottom">
            <button
              type="button"
              onClick={onOpenProjects}
              data-testid="vscode-all-projects"
              aria-label="All Projects"
              className="mr-1 flex items-center gap-1.5 rounded px-1 py-0.5 text-[11px] font-semibold tracking-wide text-vsc-textMuted transition-colors hover:bg-white/10 hover:text-white"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              GB Coder
            </button>
          </Tooltip>
        ) : (
          <span className="mr-1 select-none text-[11px] font-semibold tracking-wide text-vsc-textMuted">
            GB Coder
          </span>
        )}

        <div className="flex items-center gap-0.5">
          {topBarActions.map((action) => (
            <Tooltip key={action.id} label={action.label} side="bottom">
              <button
                type="button"
                onClick={action.onClick}
                disabled={!action.onClick}
                aria-label={action.label}
                aria-pressed={action.isActive}
                data-testid={`vscode-nav-${action.id}`}
                className={`rounded p-1.5 transition-colors ${
                  action.isActive
                    ? 'bg-white/10 text-white'
                    : action.onClick
                      ? 'text-vsc-textMuted hover:bg-white/[0.08] hover:text-white'
                      : 'cursor-not-allowed text-vsc-textMuted/40'
                }`}
              >
                {action.icon}
              </button>
            </Tooltip>
          ))}
        </div>

        <span className="ml-auto truncate text-[11px] text-vsc-textMuted" title={activePath ?? ''}>
          {activePath ?? 'No file open'}
        </span>
      </header>

      {/* Entry banner. Suppressed with no files: there is no project to describe
          as detected, and the empty state below says what to do instead. */}
      {showBanner && hasFiles && (
        <div
          className="flex shrink-0 items-start gap-2.5 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2"
          data-testid="vscode-banner"
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
          <p className="flex-1 text-xs text-amber-100">
            {entryReason === 'manual'
              ? 'VS Code mode — connect a Sandbox to run this project.'
              : 'Full-stack project detected — connect a Sandbox to run this project.'}
          </p>
          <button
            onClick={() => setRightTab('sandbox')}
            className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-100 hover:bg-amber-500/30"
          >
            Open Sandbox
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-amber-200/70 hover:text-amber-100"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Body: three independently scrolling columns ── */}
      <div className="flex min-h-0 flex-1">
        {/* Explorer */}
        <aside
          className={`flex w-60 shrink-0 flex-col overflow-hidden border-r bg-vsc-sidebar ${
            isExplorerDropTarget ? 'border-accent' : 'border-vsc-border'
          }`}
          data-testid="vscode-explorer"
        >
          <div className="flex shrink-0 items-center gap-1 border-b border-vsc-border px-2 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-vsc-textMuted">
              Explorer
            </span>
            <span className="rounded bg-white/10 px-1 text-[9px] text-vsc-textMuted">
              {project.files.length}
            </span>

            <div className="ml-auto flex items-center gap-0.5">
              <Tooltip label="Load File" side="bottom">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Load File"
                  data-testid="explorer-load-file"
                  className="rounded p-1 text-vsc-textMuted hover:bg-white/10 hover:text-white"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="Load Folder" side="bottom">
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  aria-label="Load Folder"
                  data-testid="explorer-load-folder"
                  className="rounded p-1 text-vsc-textMuted hover:bg-white/10 hover:text-white"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/*
            Own scroll container. A long tree scrolls here and nowhere else — it
            cannot push the editor down or move the terminal.
          */}
          <div
            className="min-h-0 flex-1 overflow-y-auto"
            data-testid="vscode-explorer-scroll"
            onDragOver={handleExplorerDragOver}
            onDragLeave={() => setIsExplorerDropTarget(false)}
            onDrop={handleExplorerDrop}
          >
            <FileTreeView
              files={project.files}
              activePath={activePath}
              dirtyPaths={dirtyPaths}
              onOpen={openFile}
            />
            {isExplorerDropTarget && (
              <p className="px-3 py-2 text-[11px] text-accent">Drop to add to this project…</p>
            )}
          </div>

          {/*
           * Dev Server shortcut.
           *
           * Lives here rather than in AppSidebar because AppSidebar is not
           * rendered in this mode at all. Stays disabled until the backend has
           * *confirmed* a live process and at least one reachable port, so it
           * never routes the user to an iframe that cannot load.
           */}
          <div className="shrink-0 border-t border-vsc-border">
            <button
              onClick={() => setRightTab('preview')}
              disabled={!devServerReady}
              data-testid="dev-server-toggle"
              aria-disabled={!devServerReady}
              title={
                devServerReady
                  ? `Show the live preview served from port ${sandbox.activePort}.`
                  : 'Connect a sandbox and start your dev server first.'
              }
              className={`flex w-full items-center gap-1.5 px-2.5 py-2 text-left text-[11px] ${
                devServerReady
                  ? 'text-vsc-text hover:bg-white/[0.06] hover:text-white'
                  : 'cursor-not-allowed text-vsc-textMuted opacity-50'
              }`}
            >
              <Server className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">Dev Server</span>
              {devServerReady && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  title="Running"
                />
              )}
            </button>

            {/* Only worth showing when there is an actual choice to make. */}
            {devServerReady && sandbox.previews.length > 1 && (
              <div className="px-2.5 pb-2" data-testid="dev-server-ports">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-vsc-textMuted">
                  Ports
                </span>
                <div className="flex flex-wrap gap-1">
                  {sandbox.previews.map((preview) => (
                    <button
                      key={preview.port}
                      onClick={() => {
                        sandboxSession.selectPort(preview.port);
                        setRightTab('preview');
                      }}
                      data-testid={`dev-server-port-${preview.port}`}
                      aria-pressed={preview.port === sandbox.activePort}
                      title={preview.url}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        preview.port === sandbox.activePort
                          ? 'bg-accent/25 text-white'
                          : 'text-vsc-textMuted hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {preview.port}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onExit}
            data-testid="exit-vscode-mode"
            title="Return to the standard editor. File contents are kept."
            className="flex shrink-0 items-center gap-1.5 border-t border-vsc-border px-2.5 py-2 text-[11px] text-vsc-text hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit VS Code mode
          </button>
        </aside>

        {/* Editor column: one file at a time, with tabs */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-vsc-editor">
          <div
            className="flex shrink-0 items-stretch overflow-x-auto border-b border-vsc-border bg-vsc-tabbar"
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
                  /*
                   * Active tabs carry a coloured top border and the editor's own
                   * background, so the tab reads as physically continuous with the
                   * surface below it. Inactive tabs keep a transparent top border
                   * so switching does not shift anything by a pixel.
                   */
                  className={`group flex min-w-0 cursor-pointer items-center gap-1.5 border-r border-t-2 border-r-vsc-border px-3 py-1.5 text-xs ${
                    isActive
                      ? 'border-t-accent bg-vsc-editor text-white'
                      : 'border-t-transparent text-vsc-textMuted hover:bg-white/[0.04] hover:text-vsc-text'
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
                    className="rounded p-0.5 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Monaco scrolls internally; this box only bounds it. */}
          <div className="min-h-0 flex-1 overflow-hidden" data-testid="vscode-editor-scroll">
            {activeFile ? (
              <Editor
                /* Keyed by path: one Monaco model per file, so undo history and
                   cursor position survive tab switching. */
                path={activeFile.path}
                language={monacoLanguageForPath(activeFile.path)}
                value={activeFile.content}
                onChange={handleChange}
                beforeMount={defineGbCoderTheme}
                onMount={handleEditorMount}
                theme={GB_CODER_MONACO_THEME}
                options={{
                  fontFamily,
                  fontSize,
                  minimap: { enabled: true },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                }}
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
                  <p className="text-sm font-semibold text-white">No project loaded</p>
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
                      className="rounded-lg border border-vsc-borderStrong px-3 py-1.5 text-xs font-semibold text-vsc-text hover:bg-white/[0.06] hover:text-white"
                    >
                      Load File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right panel */}
        <aside
          className="flex w-[26rem] min-w-[18rem] shrink-0 flex-col overflow-hidden border-l border-vsc-border bg-vsc-sidebar"
          data-testid="vscode-right-panel"
        >
          <div
            className="flex shrink-0 border-b border-vsc-border bg-vsc-tabbar"
            role="tablist"
          >
            {(['preview', 'sandbox'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={rightTab === tab}
                onClick={() => setRightTab(tab)}
                data-testid={`vscode-right-tab-${tab}`}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium ${
                  rightTab === tab
                    ? 'border-b-2 border-accent text-white'
                    : 'border-b-2 border-transparent text-vsc-textMuted hover:text-white'
                }`}
              >
                {tab === 'preview' ? (
                  <MonitorPlay className="h-3.5 w-3.5" />
                ) : (
                  <Box className="h-3.5 w-3.5" />
                )}
                {tab === 'preview' ? 'Live Preview' : 'Sandbox'}
              </button>
            ))}
          </div>

          {/* Own scroll container. */}
          <div
            className="min-h-0 flex-1 overflow-y-auto"
            data-testid="vscode-right-panel-scroll"
          >
            {rightTab === 'sandbox' ? (
              <SandboxPanel files={project.files} />
            ) : activePreview ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-vsc-border px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-vsc-text">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {activePreview.label}
                  </span>
                  <button
                    onClick={() => void sandboxSession.pollLogs()}
                    className="text-vsc-textMuted hover:text-white"
                    aria-label="Refresh"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                {/* Sandbox-served preview: a real URL, not a local execution. */}
                <iframe
                  src={activePreview.url}
                  title="Sandbox preview"
                  className="min-h-0 flex-1 border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : (
              <div
                className="grid h-full place-items-center px-6 text-center"
                data-testid="connect-sandbox-prompt"
              >
                <div>
                  <Plug className="mx-auto mb-3 h-7 w-7 text-vsc-textMuted" />
                  <p className="text-sm font-semibold text-white">Connect Sandbox to Preview</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-vsc-textMuted">
                    This project has a server side, so it cannot run in the browser. Start a sandbox
                    to build and serve it, then the preview appears here.
                  </p>
                  <button
                    onClick={() => setRightTab('sandbox')}
                    className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover"
                  >
                    Open Sandbox panel
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Terminal panel: resizable, own scroll ── */}
      {showTerminal && (
        <>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize terminal panel"
            data-testid="terminal-resize-handle"
            onPointerDown={handleResizeDown}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeUp}
            onPointerCancel={handleResizeUp}
            className="h-1 shrink-0 cursor-row-resize bg-vsc-border transition-colors hover:bg-accent"
          />
          <div
            className="flex shrink-0 flex-col overflow-hidden bg-vsc-panel"
            style={{ height: `${terminalHeight}px` }}
            data-testid="vscode-terminal-panel"
          >
            {/* Terminal chrome: tab-style header, as VS Code presents its panel. */}
            <div className="flex shrink-0 items-center gap-1 border-b border-vsc-border px-2">
              <div
                className="flex items-center gap-1.5 border-b-2 border-accent px-1.5 py-1.5 text-[11px] text-white"
                role="tab"
                aria-selected
              >
                <TerminalSquare className="h-3.5 w-3.5" />
                Terminal
              </div>

              {/*
                Disabled deliberately. The sandbox transport is a single session,
                so offering a working "+" would create a tab that cannot run
                anything. Shown rather than hidden so the limit is legible.
              */}
              <Tooltip label="One sandbox session at a time" side="bottom">
                <button
                  type="button"
                  disabled
                  aria-label="New terminal"
                  data-testid="terminal-new"
                  className="ml-1 cursor-not-allowed rounded p-1 text-vsc-textMuted/40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </Tooltip>

              <button
                onClick={() => setShowTerminal(false)}
                aria-label="Close panel"
                className="ml-auto rounded p-1 text-vsc-textMuted hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden" data-testid="vscode-terminal-scroll">
              {/* The same Terminal component as the standard console panel: it
                  switches itself to Sandbox Mode once a connector is registered,
                  and shows Local Mode until then. */}
              <TerminalTab
                project={project}
                resolvedPackages={[]}
                unresolvedPackages={[]}
                isResolvingPackages={false}
                isActive={showTerminal}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Status bar ── */}
      <footer
        className="flex h-6 shrink-0 items-center gap-3 border-t border-vsc-border bg-vsc-panel px-2 text-[11px] text-vsc-textMuted"
        data-testid="vscode-status-bar"
      >
        <button
          onClick={() => setShowTerminal((value) => !value)}
          data-testid="vscode-terminal-toggle"
          aria-pressed={showTerminal}
          className="flex items-center gap-1 rounded px-1 hover:bg-white/10 hover:text-white"
        >
          <TerminalSquare className="h-3 w-3" />
          Terminal
        </button>

        {activeLanguage && (
          <span data-testid="status-language">
            {LANGUAGE_LABEL[activeLanguage] ?? activeLanguage}
          </span>
        )}

        {activeFile && (
          <span data-testid="status-cursor">
            Ln {cursor.line}, Col {cursor.column}
          </span>
        )}

        <span className="ml-auto flex items-center gap-1.5" data-testid="status-sandbox">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              sandbox.sandboxId ? 'bg-emerald-400' : 'bg-vsc-textMuted'
            }`}
          />
          {sandbox.sandboxId ? 'Connected: Sandbox' : 'Local Mode'}
        </span>
      </footer>

      {/* Hidden inputs backing the Explorer's Load File / Load Folder buttons. */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".html,.htm,.css,.js,.mjs,.cjs,.jsx,.ts,.tsx,.vue,.json,.md,.txt,.zip"
        className="hidden"
        data-testid="explorer-file-input"
        onChange={(event) => {
          void submitFiles(Array.from(event.target.files ?? []));
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
          void submitFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default VSCodeMode;
