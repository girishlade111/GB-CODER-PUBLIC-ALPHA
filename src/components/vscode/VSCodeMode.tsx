import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Editor from '@monaco-editor/react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  LogOut,
  Plug,
  RefreshCw,
  Server,
  TerminalSquare,
  X,
} from 'lucide-react';
import FileTreeView from './FileTreeView';
import TerminalTab from '../Console/TerminalTab';
import SandboxPanel from '../sandbox/SandboxPanel';
import { GB_CODER_MONACO_THEME, defineGbCoderTheme } from '../../utils/monacoTheme';
import { MultiFileProject } from '../../types/files';
import { sandboxSession } from '../../services/sandbox/sandboxSession';

/**
 * VS Code style editor mode for full-stack projects.
 *
 * Used *only* for a confirmed full-stack import. Plain, React and Vue projects
 * keep their existing multi-panel editors untouched — this is an additional mode,
 * not a replacement.
 *
 * The layout is the familiar three columns: explorer, one editable file with a
 * tab strip, and a right-hand panel. The right panel cannot show a local iframe:
 * a project with a server half has nothing meaningful to execute client-side, so
 * it asks for a sandbox instead of rendering something misleading.
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
   * this mode is now reachable both ways.
   */
  entryReason?: 'detected' | 'manual';
}

const subscribeSandbox = (onChange: () => void) => sandboxSession.subscribe(onChange);
const getSandboxSnapshot = () => sandboxSession.getState();

/** Most recently opened files, newest last, as VS Code orders its tabs. */
const MAX_TABS = 12;

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

const VSCodeMode: React.FC<VSCodeModeProps> = ({
  project,
  onChangeFile,
  onExit,
  fontFamily,
  fontSize,
  entryReason = 'detected',
}) => {
  const sandbox = useSyncExternalStore(subscribeSandbox, getSandboxSnapshot, getSandboxSnapshot);

  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(new Set());
  const [rightTab, setRightTab] = useState<'preview' | 'sandbox'>('sandbox');
  const [showBanner, setShowBanner] = useState(true);
  /*
   * VS Code mode replaces the standard console panel, so the Terminal has to be
   * reachable from here — otherwise the sandbox shell built for this feature
   * would have no entry point in the only mode that can use it.
   */
  const [showTerminal, setShowTerminal] = useState(false);

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

  const activePreview = sandbox.previews.find((preview) => preview.port === sandbox.activePort);
  /*
   * Both halves matter: a confirmed-live process with no exposed port has nothing
   * to show, and an exposed port whose process has since died would load an error.
   */
  const devServerReady = sandbox.devServerRunning && sandbox.previews.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="vscode-mode">
      {/* Entry banner */}
      {showBanner && (
        <div
          className="flex items-start gap-2.5 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2"
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

      <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        {/* Explorer */}
        <aside className="flex w-56 min-w-[12rem] flex-col overflow-hidden border-r border-stroke-subtle bg-surface-base">
          <div className="flex items-center justify-between border-b border-stroke-subtle px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
              Explorer
            </span>
            <span className="text-[10px] text-content-muted">{project.files.length}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <FileTreeView
              files={project.files}
              activePath={activePath}
              dirtyPaths={dirtyPaths}
              onOpen={openFile}
            />
          </div>

          {/*
           * Dev Server shortcut.
           *
           * Lives here rather than in AppSidebar because AppSidebar is not
           * rendered in this mode at all (App returns VSCodeMode early for a
           * full-stack project), and the brief asks for this control to appear
           * only in VS Code / full-stack mode.
           *
           * Stays disabled until the backend has *confirmed* a live process and
           * at least one reachable port, so it never routes the user to an iframe
           * that cannot load.
           */}
          <div className="border-t border-stroke-subtle">
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
                  ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                  : 'cursor-not-allowed text-content-muted opacity-50'
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
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-content-muted">
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
                          ? 'bg-accent/20 text-content-primary'
                          : 'text-content-muted hover:bg-white/5 hover:text-content-primary'
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
            className="flex items-center gap-1.5 border-t border-stroke-subtle px-2.5 py-2 text-[11px] text-content-secondary hover:bg-white/5 hover:text-content-primary"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit VS Code mode
          </button>
        </aside>

        {/* Editor column: one file at a time, with tabs */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex items-stretch overflow-x-auto border-b border-stroke-subtle bg-surface-raised"
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
                  className={`group flex cursor-pointer items-center gap-1.5 border-r border-stroke-subtle px-3 py-1.5 text-xs ${
                    isActive
                      ? 'bg-surface-base text-content-primary'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                  title={path}
                >
                  <span className="max-w-[12rem] truncate">{name}</span>
                  {dirtyPaths.has(path) && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-content-secondary"
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

          <div className="min-h-0 flex-1">
            {activeFile ? (
              <Editor
                /* Keyed by path: one Monaco model per file, so undo history and
                   cursor position survive tab switching. */
                path={activeFile.path}
                language={monacoLanguageForPath(activeFile.path)}
                value={activeFile.content}
                onChange={handleChange}
                beforeMount={defineGbCoderTheme}
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
            ) : (
              <div className="grid h-full place-items-center text-xs text-content-muted">
                Select a file from the explorer.
              </div>
            )}
          </div>
        </main>

        {/* Right panel */}
        <aside className="flex w-[26rem] min-w-[20rem] flex-col overflow-hidden border-l border-stroke-subtle bg-surface-base">
          <div className="flex border-b border-stroke-subtle bg-surface-raised" role="tablist">
            {(['preview', 'sandbox'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={rightTab === tab}
                onClick={() => setRightTab(tab)}
                data-testid={`vscode-right-tab-${tab}`}
                className={`px-3 py-2 text-xs font-medium capitalize ${
                  rightTab === tab
                    ? 'border-b-2 border-accent text-content-primary'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                {tab === 'preview' ? 'Live Preview' : 'Sandbox'}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {rightTab === 'sandbox' ? (
              <SandboxPanel files={project.files} />
            ) : activePreview ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-stroke-subtle px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-content-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {activePreview.label}
                  </span>
                  <button
                    onClick={() => void sandboxSession.pollLogs()}
                    className="text-content-muted hover:text-content-primary"
                    aria-label="Refresh"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                {/* Sandbox-served preview: a real URL, not a local execution. */}
                <iframe
                  src={activePreview.url}
                  title="Sandbox preview"
                  className="flex-1 border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            ) : (
              <div
                className="grid h-full place-items-center px-6 text-center"
                data-testid="connect-sandbox-prompt"
              >
                <div>
                  <Plug className="mx-auto mb-3 h-7 w-7 text-content-muted" />
                  <p className="text-sm font-semibold text-content-primary">
                    Connect Sandbox to Preview
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-content-muted">
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

      {/* Bottom terminal panel, as in VS Code. */}
      <div
        className={`flex flex-col border-t border-stroke-subtle bg-surface-base ${
          showTerminal ? 'h-64' : ''
        }`}
      >
        <button
          onClick={() => setShowTerminal((value) => !value)}
          data-testid="vscode-terminal-toggle"
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-content-secondary hover:bg-white/5"
        >
          <TerminalSquare className="h-3.5 w-3.5" />
          Terminal
          {sandbox.sandboxId && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              sandbox
            </span>
          )}
          <span className="ml-auto">
            {showTerminal ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </span>
        </button>
        {showTerminal && (
          <div className="min-h-0 flex-1">
            {/* The same Terminal component as the standard console panel: it
                switches itself to Sandbox Mode once a connector is registered. */}
            <TerminalTab
              project={project}
              resolvedPackages={[]}
              unresolvedPackages={[]}
              isResolvingPackages={false}
              isActive={showTerminal}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default VSCodeMode;
