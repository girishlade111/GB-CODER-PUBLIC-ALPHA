import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { OnMount } from '@monaco-editor/react';
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
  AlertTriangle,
  GitBranch,
  Sliders,
  Sparkles,
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
import WorkspaceSearchPanel from './WorkspaceSearchPanel';
import ProblemsPanel from './ProblemsPanel';
import OutputPanel from './OutputPanel';
import CommandPalette from '../CommandPalette';
import type * as monacoEditor from 'monaco-editor';
import { diagnosticsService } from '../../services/diagnostics/diagnosticsService';
import { outputLogService } from '../../services/logging/outputLogService';
import Tooltip from '../ui/Tooltip';
import LadeStackLogo from '../LadeStackLogo';
import { monacoThemeFor, defineGbCoderTheme } from '../../utils/monacoTheme';
import {
  chooseEvictionTab,
  remapPath,
  validateWorkspaceFolder,
  validateWorkspacePath,
} from '../../utils/workspaceCoordination';
import { useTheme } from '../../hooks/useTheme';
import { MultiFileProject, ProjectFile } from '../../types/files';
import { carriesFiles, collectTransfer } from '../../utils/dropTransfer';
import {
  readViewState,
  reconcileViewState,
  writeViewState,
} from '../../services/vscodeWorkspaceStore';
import { webcontainerService, WebContainerWriteError } from '../../services/webcontainer/webcontainerService';
import { webcontainerWatcher } from '../../services/webcontainer/webcontainerWatcher';
import { terminalSessionManager } from '../../services/webcontainer/terminalSessionManager';
import { devServerManager } from '../../services/webcontainer/devServerManager';
import { ataService } from '../../services/ata/ataService';
import { livePreviewChannel } from '../../services/preview/livePreviewChannel';
import { previewReloadService } from '../../services/preview/previewReloadService';
import { codeAssistService } from '../../services/ai/codeAssistService';
import { Snapshot } from '../../services/snapshotService';
import { editorConflictService, type ExternalFileConflict } from '../../services/editor/editorConflictService';
import { saveProjectFiles } from '../../services/projects/projectDatabase';

// Phase 2 Workbench Architecture Imports
import { WorkbenchShell } from '../workbench/WorkbenchShell';
import { WorkbenchSettingsModal } from '../workbench/WorkbenchSettingsModal';
import { WorkbenchLivePreview } from '../workbench/WorkbenchLivePreview';
import { GitSourceControlPanel } from '../workbench/GitSourceControlPanel';
import {
  loadWorkbenchLayout,
  saveWorkbenchLayout,
  WORKBENCH_PRESETS,
  createDefaultWorkbenchLayout,
} from '../../services/workbench/workbenchLayoutStore';
import type {
  WorkbenchLayoutState,
  LayoutPresetId,
  ViewId,
  ContainerId,
  EditorLayoutState,
} from '../../services/workbench/workbenchTypes';

interface VSCodeModeProps {
  project: MultiFileProject;
  projectName?: string;
  onChangeFile: (path: string, content: string) => void;
  onCreateFile?: (path: string, content?: string) => boolean | void;
  onRenameFile?: (oldPath: string, newPath: string) => boolean | void;
  onDeleteFile?: (path: string) => boolean | void;
  onDuplicateFile?: (path: string) => void;
  onExit: () => void;
  fontFamily: string;
  fontSize: number;
  persistSignal?: { seq: number; projectId: string; files: ProjectFile[] } | null;
  activeProjectId?: string | null;
  entryReason?: 'detected' | 'manual';
  onAddImport?: (input: {
    files?: File[];
    entries?: unknown[];
    handles?: Promise<unknown>[];
    unreadableDirectories?: string[];
  }) => Promise<void>;
  onOpenDependencies?: () => void;
  onOpenAIChat?: () => void;
  onOpenVoiceCommands?: () => void;
  onOpenProjects?: () => void;
}

const subscribeWebContainer = (onChange: () => void) => webcontainerService.subscribe(onChange);
const getWebContainerSnapshot = () => webcontainerService.getState();

const MAX_TABS = 12;
const TERMINAL_MIN_H = 96;
const TERMINAL_DEFAULT_H = 240;
const TERMINAL_MAX_FRACTION = 0.75;

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

const VSCodeMode: React.FC<VSCodeModeProps> = ({
  project,
  projectName = 'gb-coder-project',
  onChangeFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onDuplicateFile,
  onExit,
  fontFamily,
  fontSize,
  persistSignal,
  activeProjectId,
  onAddImport,
  onOpenDependencies,
  onOpenAIChat,
  onOpenVoiceCommands,
  onOpenProjects,
}) => {
  const { isDark } = useTheme();

  const webcontainer = useSyncExternalStore(
    subscribeWebContainer,
    getWebContainerSnapshot,
    getWebContainerSnapshot,
  );

  const [isReloadingPreview, setIsReloadingPreview] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState<string | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);

  const [splitOpenPaths, setSplitOpenPaths] = useState<string[]>([]);
  const [splitActivePath, setSplitActivePath] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [splitDirection, setSplitDirection] = useState<'vertical' | 'horizontal'>('vertical');

  const [restoredView] = useState(() => reconcileViewState(readViewState(), project.files));
  const [openPaths, setOpenPaths] = useState<string[]>(restoredView.openPaths);
  const [activePath, setActivePath] = useState<string | null>(restoredView.activePath);
  const hasHydratedViewRef = useRef(project.files.length > 0 && restoredView.openPaths.length > 0);
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(new Set());

  // Phase 2 Workbench Layout State
  const [workbenchLayout, setWorkbenchLayout] = useState<WorkbenchLayoutState>(() => loadWorkbenchLayout());

  useEffect(() => {
    saveWorkbenchLayout(workbenchLayout);
  }, [workbenchLayout]);

  const activePathMirrorRef = useRef<string | null>(null);
  activePathMirrorRef.current = activePath;
  const splitActivePathMirrorRef = useRef<string | null>(null);
  splitActivePathMirrorRef.current = splitActivePath;
  const dirtyPathsMirrorRef = useRef<Set<string>>(dirtyPaths);
  dirtyPathsMirrorRef.current = dirtyPaths;
  const projectFilesMirrorRef = useRef<ProjectFile[]>(project.files);
  projectFilesMirrorRef.current = project.files;
  const onCreateFileRef = useRef(onCreateFile);
  onCreateFileRef.current = onCreateFile;
  const onChangeFileRef = useRef(onChangeFile);
  onChangeFileRef.current = onChangeFile;
  const onDeleteFileRef = useRef(onDeleteFile);
  onDeleteFileRef.current = onDeleteFile;
  const isExternalUpdateRef = useRef(false);
  const resolvingConflictsRef = useRef<Set<string>>(new Set());

  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isProjectRootOpen, setIsProjectRootOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const effectiveProjectId = activeProjectId || project.id || 'default-project';

  // Conflict tracking for active file
  const [, setConflictRevision] = useState(0);
  useEffect(() => {
    return editorConflictService.subscribe(() => {
      setConflictRevision((r) => r + 1);
    });
  }, []);

  const activeConflict = activePath
    ? editorConflictService.getConflict(effectiveProjectId, activePath)
    : undefined;
  const [isDiffMode, setIsDiffMode] = useState(false);
  useEffect(() => {
    setIsDiffMode(false);
  }, [activePath]);

  // Restore dirty status for any durable pending conflicts
  useEffect(() => {
    const conflicts = editorConflictService.listConflicts(effectiveProjectId);
    if (conflicts.length > 0) {
      setDirtyPaths((current) => {
        const next = new Set(current);
        for (const c of conflicts) {
          next.add(c.path);
        }
        return next;
      });
    }
  }, [effectiveProjectId]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeRabbitOpen, setIsCodeRabbitOpen] = useState(false);
  const [isVoiceCommandsOpen, setIsVoiceCommandsOpen] = useState(false);
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  // Command Palette & Quick Open state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'commands' | 'files'>('commands');

  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const splitEditorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monacoEditor | null>(null);

  const diagnostics = useSyncExternalStore(
    (cb) => diagnosticsService.subscribe(cb),
    () => diagnosticsService.getState(),
    () => diagnosticsService.getState(),
  );

  const codeAssistState = useSyncExternalStore(
    (cb) => codeAssistService.subscribe(cb),
    () => codeAssistService.getState(),
    () => codeAssistService.getState(),
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
    [project.files, onChangeFile, onCreateFile],
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
    [project.files, onChangeFile, onCreateFile],
  );

  const openTerminal = useCallback(() => {
    setWorkbenchLayout((prev) => ({
      ...prev,
      bottomPanel: {
        ...prev.bottomPanel,
        visible: true,
        activeViewId: 'terminal',
      },
    }));
  }, []);

  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [isExplorerDropTarget, setIsExplorerDropTarget] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  /* Reconcile open tabs and active file on page load */
  useEffect(() => {
    if (project.files.length === 0) return;

    if (!hasHydratedViewRef.current) {
      hasHydratedViewRef.current = true;
      const stored = readViewState();
      const reconciled = reconcileViewState(stored, project.files);
      if (reconciled.openPaths.length > 0 && reconciled.activePath) {
        setOpenPaths(reconciled.openPaths);
        setActivePath(reconciled.activePath);
        return;
      }
    }

    if (!activePath) {
      const preferred =
        project.files.find((file) => /(^|\/)(README\.md|package\.json)$/i.test(file.path)) ??
        project.files.find((file) => /(^|\/)(index|main|app|server)\./i.test(file.path)) ??
        project.files[0];
      if (preferred) {
        setOpenPaths([preferred.path]);
        setActivePath(preferred.path);
      }
    }
  }, [project.files, activePath]);

  /* Remember the tab layout */
  useEffect(() => {
    if (!hasHydratedViewRef.current || openPaths.length === 0) return;
    writeViewState({ openPaths, activePath });
  }, [openPaths, activePath]);

  // Synchronize tabs with workbench layout editor groups
  useEffect(() => {
    setWorkbenchLayout((prev) => {
      const isSplit = Boolean(splitActivePath && splitOpenPaths.length > 0);
      return {
        ...prev,
        editorLayout: {
          ...prev.editorLayout,
          mode: isSplit ? 'split' : 'single',
          splitDirection,
          splitRatio,
          groups: isSplit
            ? [
                { id: 'group-1', openPaths, activePath },
                { id: 'group-2', openPaths: splitOpenPaths, activePath: splitActivePath },
              ]
            : [{ id: 'group-1', openPaths, activePath }],
          activeGroupId: isSplit && splitActivePath ? 'group-2' : 'group-1',
        },
      };
    });
  }, [openPaths, activePath, splitOpenPaths, splitActivePath, splitDirection, splitRatio]);

  // Prune dirtyPaths when files are removed
  useEffect(() => {
    const known = new Set(project.files.map((file) => file.path));
    setDirtyPaths((current) => {
      let changed = false;
      const next = new Set<string>();
      for (const path of current) {
        if (known.has(path)) {
          next.add(path);
        } else {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [project.files]);

  // WebContainer boot & watcher
  useEffect(() => {
    let isCancelled = false;
    const effectiveProjectId = activeProjectId || project.id || 'default-project';

    const bootAndMount = async () => {
      try {
        webcontainerService.attachProject(effectiveProjectId);
        const container = await webcontainerService.boot();
        if (isCancelled) return;

        if (project.files.length > 0) {
          const filesToMount = project.files
            .filter((file) => {
              const conflict = editorConflictService.getConflict(effectiveProjectId, file.path);
              if (
                conflict &&
                (conflict.conflictType === 'file_deleted' ||
                  conflict.conflictType === 'directory_deleted')
              ) {
                return false;
              }
              return true;
            })
            .map((file) => {
              const conflict = editorConflictService.getConflict(effectiveProjectId, file.path);
              if (conflict && conflict.externalContent) {
                return { ...file, content: conflict.externalContent };
              }
              return file;
            });
          await webcontainerService.mountProject(
            filesToMount,
            project.dependencies,
            project.projectType,
            effectiveProjectId,
          );
        }

        if (isCancelled) return;

        webcontainerWatcher.start(container, {
          projectId: effectiveProjectId,
          getKnownFiles: () => projectFilesMirrorRef.current.map((f) => f.path),
          isEditorDirty: (filePath) => {
            const clean = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
            return dirtyPathsMirrorRef.current.has(clean) || dirtyPathsMirrorRef.current.has(filePath);
          },
          getEditorContent: (filePath) => {
            if (activePathMirrorRef.current === filePath && editorRef.current) {
              return editorRef.current.getValue();
            }
            return projectFilesMirrorRef.current.find((f) => f.path === filePath)?.content;
          },
          onFileCreate: (filePath, content) => {
            if (isCancelled) return;
            const existing = projectFilesMirrorRef.current.find((f) => f.path === filePath);
            if (!existing) {
              projectFilesMirrorRef.current = [
                ...projectFilesMirrorRef.current,
                { path: filePath, content, language: monacoLanguageForPath(filePath) },
              ];
              onCreateFileRef.current?.(filePath, content);
            } else {
              projectFilesMirrorRef.current = projectFilesMirrorRef.current.map((f) =>
                f.path === filePath ? { ...f, content } : f,
              );
              if (activePathMirrorRef.current === filePath && editorRef.current) {
                const model = editorRef.current.getModel();
                if (model && model.getValue() !== content) {
                  try {
                    isExternalUpdateRef.current = true;
                    const pos = editorRef.current.getPosition();
                    model.setValue(content);
                    if (pos) editorRef.current.setPosition(pos);
                  } finally {
                    setTimeout(() => {
                      isExternalUpdateRef.current = false;
                    }, 50);
                  }
                }
              }
              onChangeFileRef.current(filePath, content);
            }
          },
          onFileChange: (filePath, content) => {
            if (isCancelled) return;
            projectFilesMirrorRef.current = projectFilesMirrorRef.current.map((f) =>
              f.path === filePath ? { ...f, content } : f,
            );
            if (activePathMirrorRef.current === filePath && editorRef.current) {
              const model = editorRef.current.getModel();
              if (model && model.getValue() !== content) {
                try {
                  isExternalUpdateRef.current = true;
                  const pos = editorRef.current.getPosition();
                  model.setValue(content);
                  if (pos) editorRef.current.setPosition(pos);
                } finally {
                  setTimeout(() => {
                    isExternalUpdateRef.current = false;
                  }, 50);
                }
              }
            }
            onChangeFileRef.current(filePath, content);
          },
          onFileDelete: (filePath) => {
            if (isCancelled) return;
            projectFilesMirrorRef.current = projectFilesMirrorRef.current.filter((f) => f.path !== filePath);
            onDeleteFileRef.current?.(filePath);
          },
          onFileConflict: (conflict) => {
            if (isCancelled) return;
            toast(
              `External file conflict: ${conflict.path} modified in terminal while unsaved in editor.`,
              { icon: '⚠️', duration: 4000 },
            );
          },
        });
      } catch (err) {
        console.warn('[VSCodeMode] WebContainer auto-boot or workspace mount error:', err);
      }
    };

    void bootAndMount();

    return () => {
      isCancelled = true;
      webcontainerWatcher.stop();
      void webcontainerService.flushFileSync();
    };
  }, [activeProjectId]);

  const openFile = useCallback((path: string) => {
    setOpenPaths((current) => {
      if (current.includes(path)) return current;
      if (current.length < MAX_TABS) return [...current, path];
      const evict = chooseEvictionTab(
        current,
        activePathMirrorRef.current,
        dirtyPathsMirrorRef.current,
        MAX_TABS,
      );
      const next = evict ? current.filter((p) => p !== evict) : current.slice(1);
      return [...next, path];
    });
    setActivePath(path);
  }, []);

  const closeTab = useCallback(
    (path: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      setOpenPaths((current) => {
        const remaining = current.filter((item) => item !== path);
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

  const treeRef = useRef<FileTreeViewHandle>(null);
  const fileOperationProjectRef = useRef(activeProjectId);
  fileOperationProjectRef.current = activeProjectId;

  const handleCreateFile = useCallback(
    (path: string, content = '') => {
      const checked = validateWorkspacePath(
        path,
        project.projectType,
        project.files.map((f) => f.path),
      );
      if (!checked.valid) {
        toast.error(checked.error ?? 'Invalid file name.');
        return false;
      }
      if (onCreateFile?.(checked.path, content) === false) return false;
      openFile(checked.path);
      return true;
    },
    [onCreateFile, openFile, project.files, project.projectType],
  );

  const handleCreateFolder = useCallback(
    (folderPath: string) => {
      const keepPath = `${folderPath.replace(/\/+$/, '')}/.gitkeep`;
      return onCreateFile?.(keepPath, '') ?? true;
    },
    [onCreateFile],
  );

  const handleRenameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      const hasConflict = !project.files.some((f) => f.path === oldPath)
        ? editorConflictService.listConflicts(effectiveProjectId).some((c) => c.path.startsWith(`${oldPath}/`))
        : editorConflictService.hasConflict(effectiveProjectId, oldPath);
      if (hasConflict) {
        toast.error('Cannot rename: path has an unresolved external conflict. Please resolve the conflict first.', { duration: 4000 });
        return false;
      }

      const existing = project.files.map((f) => f.path);
      const isFolder = !project.files.some((f) => f.path === oldPath);
      const checked = isFolder
        ? validateWorkspaceFolder(newPath, existing, oldPath)
        : validateWorkspacePath(newPath, project.projectType, existing, oldPath);
      if (!checked.valid) {
        toast.error(checked.error ?? 'Invalid name.');
        return false;
      }
      const finalNew = checked.path;
      const operationEpoch = webcontainerService.getSessionEpoch();

      try {
        await webcontainerService.renameFile(oldPath, finalNew);
      } catch (err) {
        console.error('[VSCodeMode] Failed to rename file in WebContainer:', err);
        toast.error(`Failed to rename "${oldPath}". Virtual filesystem write failed.`);
        return false;
      }

      if (fileOperationProjectRef.current !== activeProjectId ||
          webcontainerService.getSessionEpoch() !== operationEpoch) return false;

      if (onRenameFile?.(oldPath, finalNew) === false) return false;

      const updateList = (paths: string[]) => paths.map((p) => remapPath(p, oldPath, finalNew));
      setOpenPaths(updateList);
      setSplitOpenPaths(updateList);
      setActivePath((current) => current === null ? current : remapPath(current, oldPath, finalNew));
      setSplitActivePath((current) => current === null ? current : remapPath(current, oldPath, finalNew));
      setDirtyPaths((current) => {
        const next = new Set<string>();
        for (const p of current) next.add(remapPath(p, oldPath, finalNew));
        return next;
      });
      return true;
    },
    [onRenameFile, project.files, project.projectType, activeProjectId, effectiveProjectId],
  );

  const handleDeleteFile = useCallback(
    async (path: string): Promise<boolean | void> => {
      const hasConflict = editorConflictService
        .listConflicts(effectiveProjectId)
        .some((c) => c.path === path || c.path.startsWith(`${path}/`));
      if (hasConflict) {
        toast.error('Cannot delete: path has an unresolved external conflict. Please resolve the conflict first.', { duration: 4000 });
        return false;
      }

      const operationEpoch = webcontainerService.getSessionEpoch();
      try {
        await webcontainerService.deleteFile(path);
      } catch (err) {
        console.error('[VSCodeMode] Failed to delete file in WebContainer:', err);
        toast.error(`Failed to delete "${path}". Virtual filesystem write failed.`);
        return false;
      }

      if (fileOperationProjectRef.current !== activeProjectId ||
          webcontainerService.getSessionEpoch() !== operationEpoch) return false;

      if (onDeleteFile?.(path) === false) return false;

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
      return true;
    },
    [onDeleteFile, activePath, splitActivePath, activeProjectId, effectiveProjectId],
  );

  const handleDuplicateFile = useCallback(
    (path: string) => {
      onDuplicateFile?.(path);
    },
    [onDuplicateFile],
  );

  const handleChange = useCallback(
    (path: string, text: string) => {
      if (isExternalUpdateRef.current) return;
      onChangeFile(path, text);
      if (!editorConflictService.hasConflict(effectiveProjectId, path)) {
        void webcontainerService.syncFile(path, text, activeProjectId ?? undefined);
      }
      ataService.acquireTypes(text);
      dirtyPathsMirrorRef.current.add(path);
      setDirtyPaths((current) => {
        if (current.has(path)) return current;
        const next = new Set(current);
        next.add(path);
        return next;
      });
    },
    [onChangeFile, activeProjectId, effectiveProjectId],
  );

  const handleResolveKeepMine = useCallback(
    async (conflict: ExternalFileConflict) => {
      const targetProjectId = conflict.projectId || effectiveProjectId;
      if (!targetProjectId) {
        toast.error('Cannot resolve conflict without an active project.');
        return;
      }

      const conflictKey = `${targetProjectId}:${conflict.path}`;
      if (resolvingConflictsRef.current.has(conflictKey)) {
        return;
      }

      resolvingConflictsRef.current.add(conflictKey);
      editorConflictService.setConflictStatus(targetProjectId, conflict.path, 'resolving');

      try {
        const activeConflict = editorConflictService.getConflict(targetProjectId, conflict.path);
        if (!activeConflict) {
          throw new Error('Conflict record is no longer active.');
        }

        let container = webcontainerService.getInstance();
        if (!container) {
          const pending = (
            globalThis as unknown as { __GBCODER_WEBCONTAINER_BOOT_PROMISE__?: Promise<unknown> }
          ).__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
          if (pending) {
            try {
              await pending;
              container = webcontainerService.getInstance();
            } catch {
              container = null;
            }
          }
        }
        if (!container) {
          throw new WebContainerWriteError(
            'RUNTIME_UNAVAILABLE',
            'Development runtime is unavailable. Please wait for WebContainer to be ready.',
            conflict.path,
            targetProjectId,
          );
        }

        webcontainerWatcher.markInternallySynced(conflict.path, conflict.monacoContent);
        await webcontainerService.writeFile(conflict.path, conflict.monacoContent, targetProjectId);

        const updatedFiles = projectFilesMirrorRef.current.map((f) =>
          f.path === conflict.path ? { ...f, content: conflict.monacoContent } : f,
        );
        projectFilesMirrorRef.current = updatedFiles;
        await saveProjectFiles(targetProjectId, updatedFiles);

        onChangeFile(conflict.path, conflict.monacoContent);
        await webcontainerService.syncFile(conflict.path, conflict.monacoContent, targetProjectId);
        await webcontainerService.flushFileSync();

        if (activePathMirrorRef.current === conflict.path && editorRef.current) {
          const model = editorRef.current.getModel();
          if (model && model.getValue() !== conflict.monacoContent) {
            try {
              isExternalUpdateRef.current = true;
              model.setValue(conflict.monacoContent);
            } finally {
              setTimeout(() => {
                isExternalUpdateRef.current = false;
              }, 50);
            }
          }
        }

        dirtyPathsMirrorRef.current.delete(conflict.path);
        setDirtyPaths((prev) => {
          const next = new Set(prev);
          next.delete(conflict.path);
          return next;
        });

        editorConflictService.resolveConflict(targetProjectId, conflict.path, 'keep_mine');
        setIsDiffMode(false);

        if (conflict.conflictType === 'file_deleted' || conflict.conflictType === 'directory_deleted') {
          toast.success(`Restored "${conflict.path}" to filesystem from editor buffer.`);
        } else {
          toast.success('Kept editor changes and updated terminal filesystem.');
        }
      } catch (err: unknown) {
        console.error('[VSCodeMode] Failed to resolve conflict (Keep Mine):', err);
        editorConflictService.setConflictStatus(
          targetProjectId,
          conflict.path,
          'recovery_required',
          (err as Error)?.message,
        );

        const isRuntimeUnavailable =
          err instanceof WebContainerWriteError && err.code === 'RUNTIME_UNAVAILABLE';
        if (isRuntimeUnavailable) {
          toast.error(
            'Cannot finish conflict resolution because the development runtime is unavailable. Your changes are preserved. Reconnect the runtime and retry.',
          );
        } else {
          toast.error(
            `Failed to save resolved changes: ${(err as Error)?.message || 'Storage error'}. Both versions remain preserved for recovery.`,
          );
        }
      } finally {
        resolvingConflictsRef.current.delete(conflictKey);
      }
    },
    [onChangeFile, effectiveProjectId],
  );

  const handleResolveUseExternal = useCallback(
    async (conflict: ExternalFileConflict) => {
      const targetProjectId = conflict.projectId || effectiveProjectId;
      if (!targetProjectId) {
        toast.error('Cannot resolve conflict without an active project.');
        return;
      }

      const conflictKey = `${targetProjectId}:${conflict.path}`;
      if (resolvingConflictsRef.current.has(conflictKey)) {
        return;
      }

      resolvingConflictsRef.current.add(conflictKey);
      editorConflictService.setConflictStatus(targetProjectId, conflict.path, 'resolving');

      try {
        const isDeletion =
          conflict.conflictType === 'file_deleted' ||
          conflict.conflictType === 'directory_deleted' ||
          conflict.externalContent === '';

        webcontainerWatcher.markInternallySynced(conflict.path, conflict.externalContent);

        if (isDeletion) {
          const updatedFiles = projectFilesMirrorRef.current.filter((f) => f.path !== conflict.path);
          projectFilesMirrorRef.current = updatedFiles;
          await saveProjectFiles(targetProjectId, updatedFiles);

          const container = webcontainerService.getInstance();
          if (container) {
            const cleanPath = conflict.path.replace(/\\/g, '/').replace(/^\/+/, '').trim();
            try {
              await container.fs.rm(cleanPath, { force: true });
            } catch {
              // already gone
            }
          }

          onDeleteFile?.(conflict.path);
          setOpenPaths((paths) => paths.filter((p) => p !== conflict.path));
          setSplitOpenPaths((paths) => paths.filter((p) => p !== conflict.path));
          setActivePath((current) => (current === conflict.path ? null : current));
          setSplitActivePath((current) => (current === conflict.path ? null : current));
          dirtyPathsMirrorRef.current.delete(conflict.path);
          setDirtyPaths((current) => {
            const next = new Set(current);
            next.delete(conflict.path);
            return next;
          });

          editorConflictService.resolveConflict(targetProjectId, conflict.path, 'use_external');
          setIsDiffMode(false);
          toast.success(`Removed "${conflict.path}" (accepted external deletion).`);
        } else {
          const updatedFiles = projectFilesMirrorRef.current.map((f) =>
            f.path === conflict.path ? { ...f, content: conflict.externalContent } : f,
          );
          projectFilesMirrorRef.current = updatedFiles;
          await saveProjectFiles(targetProjectId, updatedFiles);

          if (activePathMirrorRef.current === conflict.path && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model && model.getValue() !== conflict.externalContent) {
              try {
                isExternalUpdateRef.current = true;
                model.setValue(conflict.externalContent);
              } finally {
                setTimeout(() => {
                  isExternalUpdateRef.current = false;
                }, 50);
              }
            }
          }

          onChangeFile(conflict.path, conflict.externalContent);
          dirtyPathsMirrorRef.current.delete(conflict.path);
          setDirtyPaths((current) => {
            const next = new Set(current);
            next.delete(conflict.path);
            return next;
          });

          editorConflictService.resolveConflict(targetProjectId, conflict.path, 'use_external');
          setIsDiffMode(false);
          toast.success('Reverted to external filesystem version.');
        }
      } catch (err: unknown) {
        console.error('[VSCodeMode] Failed to resolve conflict (Use External):', err);
        editorConflictService.setConflictStatus(
          targetProjectId,
          conflict.path,
          'recovery_required',
          (err as Error)?.message,
        );
        toast.error(
          `Could not safely apply external changes: ${(err as Error)?.message || 'Storage error'}. Both versions remain preserved for recovery.`,
        );
      } finally {
        resolvingConflictsRef.current.delete(conflictKey);
      }
    },
    [onChangeFile, onDeleteFile, effectiveProjectId],
  );

  const isSplitActive = Boolean(splitActivePath && splitOpenPaths.length > 0);

  const openToSide = useCallback((path: string) => {
    setSplitOpenPaths((current) => {
      if (current.includes(path)) return current;
      if (current.length < MAX_TABS) return [...current, path];
      const evict = chooseEvictionTab(
        current,
        splitActivePathMirrorRef.current,
        dirtyPathsMirrorRef.current,
        MAX_TABS,
      );
      const next = evict ? current.filter((p) => p !== evict) : current.slice(1);
      return [...next, path];
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

  const handleEditorMount = useCallback<OnMount>(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      setCursor({
        line: editor.getPosition()?.lineNumber ?? 1,
        column: editor.getPosition()?.column ?? 1,
      });
      editor.onDidChangeCursorPosition((event) => {
        setCursor({ line: event.position.lineNumber, column: event.position.column });
      });

      const updateMarkers = () => {
        try {
          const markers = monaco.editor.getModelMarkers({});
          diagnosticsService.setEditorMarkers(markers, activeProjectId);
        } catch (err) {
          console.warn('[VSCodeMode] Marker update warning:', err);
        }
      };
      updateMarkers();
      monaco.editor.onDidChangeMarkers(updateMarkers);

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        const curPath = activePathMirrorRef.current;
        if (curPath && editorConflictService.hasConflict(effectiveProjectId, curPath)) {
          toast.error(
            'Cannot save: file has an unresolved external conflict. Please resolve the conflict first.',
            { duration: 4000 },
          );
          return;
        }
        if (curPath) {
          toast.success(`Saved ${curPath}`);
        }
      });

      void ataService.init(monaco).then(() => {
        if (activeFile?.content) {
          ataService.acquireTypes(activeFile.content, 0);
        }
      });
    },
    [activeFile?.content, activeProjectId, effectiveProjectId],
  );

  const handleSplitEditorMount = useCallback<OnMount>((editor) => {
    splitEditorRef.current = editor;
  }, []);

  const navigateToLocation = useCallback(
    (path: string, line?: number, column?: number) => {
      openFile(path);
      if (line !== undefined) {
        setTimeout(() => {
          if (editorRef.current) {
            const col = column ?? 1;
            editorRef.current.revealPositionInCenter({ lineNumber: line, column: col }, 0);
            editorRef.current.setPosition({ lineNumber: line, column: col });
            editorRef.current.focus();
          }
        }, 80);
      }
    },
    [openFile],
  );

  const openQuickOpen = useCallback(() => {
    setCommandPaletteMode('files');
    setIsCommandPaletteOpen(true);
  }, []);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteMode('commands');
    setIsCommandPaletteOpen(true);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focus is inside active inputs/textareas
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea';

      // Ctrl/Cmd + Shift + P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Ctrl/Cmd + P: Quick Open
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        openQuickOpen();
        return;
      }

      // Ctrl/Cmd + B: Toggle Primary Sidebar
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setWorkbenchLayout((prev) => ({
          ...prev,
          primarySidebar: { ...prev.primarySidebar, visible: !prev.primarySidebar.visible },
        }));
        return;
      }

      // Ctrl/Cmd + J: Toggle Bottom Panel
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setWorkbenchLayout((prev) => ({
          ...prev,
          bottomPanel: { ...prev.bottomPanel, visible: !prev.bottomPanel.visible },
        }));
        return;
      }

      // Ctrl/Cmd + `: Toggle Terminal in Bottom Panel
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setWorkbenchLayout((prev) => ({
          ...prev,
          bottomPanel: {
            ...prev.bottomPanel,
            visible: prev.bottomPanel.visible && prev.bottomPanel.activeViewId === 'terminal' ? false : true,
            activeViewId: 'terminal',
          },
        }));
        return;
      }

      // Ctrl/Cmd + Shift + E: Focus Explorer
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setWorkbenchLayout((prev) => ({
          ...prev,
          primarySidebar: { ...prev.primarySidebar, visible: true, activeViewId: 'explorer' },
        }));
        return;
      }

      // Ctrl/Cmd + Shift + F: Search
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setWorkbenchLayout((prev) => ({
          ...prev,
          primarySidebar: { ...prev.primarySidebar, visible: true, activeViewId: 'search' },
        }));
        return;
      }

      // Ctrl/Cmd + \: Split Editor
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
  }, [openCommandPalette, openQuickOpen, isSplitActive, openPaths, activePath, project.files, openToSide, closeSplitPane]);

  const submitFiles = useCallback(
    async (files: File[]) => {
      if (!onAddImport || files.length === 0) return;
      await onAddImport({ files });
    },
    [onAddImport],
  );

  const handleExplorerDrop = useCallback(
    (event: React.DragEvent) => {
      if (!onAddImport || !carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      event.stopPropagation();
      setIsExplorerDropTarget(false);
      const collected = collectTransfer(event.dataTransfer);
      void onAddImport(collected);
    },
    [onAddImport],
  );

  const handleExplorerDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!onAddImport || !carriesFiles(event.dataTransfer)) return;
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
      }
    : null;

  useEffect(() => {
    if (activePreview?.url) {
      livePreviewChannel.broadcastDevServer(activePreview.url, activePreview.port, activePreview.label);
    } else {
      livePreviewChannel.broadcastServerOffline();
    }
  }, [activePreview?.url, activePreview?.port, activePreview?.label]);

  const handleOpenInNewTab = useCallback(() => {
    if (!activePreview?.url) {
      if (
        webcontainer.startupStage === 'installing' ||
        webcontainer.startupStage === 'booting' ||
        webcontainer.startupStage === 'starting_server'
      ) {
        toast('Development server is still starting. Please wait for it to be ready.', { icon: '⏳' });
      } else {
        toast.error('Development server is not running. Start the dev server before opening preview.');
      }
      return;
    }

    try {
      livePreviewChannel.broadcastDevServer(activePreview.url, activePreview.port, activePreview.label);
      const urlParam = encodeURIComponent(activePreview.url);
      const portParam = encodeURIComponent(String(activePreview.port));
      const popoutUrl = `/preview-popout?url=${urlParam}&port=${portParam}`;
      const newWin = window.open(popoutUrl, '_blank', 'noopener,noreferrer');
      if (!newWin && typeof window !== 'undefined') {
        toast.error('Popup window was blocked by browser. Please allow popups for this site.');
      }
    } catch (err) {
      console.error('[OpenInNewTab] Failed to open new tab:', err);
      toast.error('Could not open preview in new tab.');
    }
  }, [activePreview, webcontainer.startupStage]);

  const handleReloadPreview = useCallback(async () => {
    if (!webcontainer.serverUrl || webcontainer.startupStage !== 'ready') {
      if (
        webcontainer.startupStage === 'installing' ||
        webcontainer.startupStage === 'booting' ||
        webcontainer.startupStage === 'starting_server'
      ) {
        toast('Development server is still starting. Please wait for it to be ready.', { icon: '⏳' });
      } else {
        toast.error('Development server is not running. Please start or restart the dev server.');
      }
      return;
    }

    if (isReloadingPreview) return;
    setIsReloadingPreview(true);
    setPreviewLoadError(null);

    try {
      livePreviewChannel.broadcastReload();
      const targetIframe = isPreviewFullscreen
        ? fullscreenIframeRef.current
        : previewIframeRef.current;

      if (targetIframe) {
        await previewReloadService.reloadPreview(targetIframe, {
          serverUrl: activePreview?.url,
          timeoutMs: 350,
        });
      }
    } catch (err) {
      console.warn('[VSCodeMode] Preview reload warning:', err);
    } finally {
      setTimeout(() => {
        setIsReloadingPreview(false);
      }, 400);
    }
  }, [webcontainer.serverUrl, webcontainer.startupStage, isReloadingPreview, isPreviewFullscreen, activePreview?.url]);

  const handleIframeLoad = useCallback(() => {
    webcontainerService.setPreviewStatus('ready');
    setPreviewLoadError(null);
  }, []);

  const handleIframeError = useCallback(() => {
    webcontainerService.setPreviewStatus('error', 'Unable to render live preview.');
    setPreviewLoadError('Unable to render live preview. Check that the dev server is responding.');
  }, []);

  const monacoOptions = useMemo(
    () => ({
      fontFamily,
      fontSize: workbenchLayout.settings.fontSize || fontSize,
      lineHeight: workbenchLayout.settings.lineHeight || 20,
      minimap: { enabled: workbenchLayout.settings.minimap },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: workbenchLayout.settings.tabSize || 2,
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
      wordWrap: (workbenchLayout.settings.wordWrap ? 'on' : 'off') as 'on' | 'off',
    }),
    [fontFamily, fontSize, workbenchLayout.settings],
  );

  const activeLanguage = activeFile ? monacoLanguageForPath(activeFile.path) : null;
  const hasFiles = project.files.length > 0;

  const handleStartDevServer = useCallback(async () => {
    if (!hasFiles) {
      toast('Nothing to serve — load or create project files first.');
      return;
    }
    openTerminal();
    toast.success('Starting development server...');
    const started = await devServerManager.start('npm run dev');
    if (!started) {
      toast.error('Dev server is already starting or running.');
    }
  }, [hasFiles, openTerminal]);

  const handleInstallDependencies = useCallback(async () => {
    if (!hasFiles) {
      toast('Nothing to install — load or create project files first.');
      return;
    }
    openTerminal();
    toast.success('Running npm install...');
    const container = await webcontainerService.boot();
    const session = await terminalSessionManager.getOrCreateSession(container);
    terminalSessionManager.writeToSession(session.id, 'npm install\r');
  }, [hasFiles, openTerminal]);

  const handleRestartDevServer = useCallback(async () => {
    if (!hasFiles) {
      toast('Nothing to restart — load or create project files first.');
      return;
    }
    if (!webcontainerService.hasNpmManifest(project.files)) {
      toast('No package.json — nothing to install or serve.');
      return;
    }
    openTerminal();
    toast.success('Restarting development server...');
    await devServerManager.restart('npm run dev');
  }, [openTerminal, hasFiles, project.files]);

  const handleNewTerminal = useCallback(() => {
    openTerminal();
    void webcontainerService.createTerminalSession();
  }, [openTerminal]);

  const handleToggleSplitTerminal = useCallback(() => {
    openTerminal();
    const splitId = terminalSessionManager.getSplitSessionId();
    if (splitId) {
      terminalSessionManager.setSplitSessionId(null);
    } else {
      const sessions = terminalSessionManager.listSessions();
      const activeId = terminalSessionManager.getActiveSessionId();
      const other = sessions.find((s) => s.id !== activeId);
      if (other) {
        terminalSessionManager.setSplitSessionId(other.id);
      } else {
        void webcontainerService.createTerminalSession().then((session) => {
          terminalSessionManager.setSplitSessionId(session.id);
        });
      }
    }
  }, [openTerminal]);

  const handleResetContainer = useCallback(() => {
    if (!hasFiles) {
      toast('Nothing to remount — load or create project files first.');
      return;
    }
    void webcontainerService
      .mountProject(project.files, project.dependencies, project.projectType)
      .then((mounted) => {
        if (!mounted || fileOperationProjectRef.current !== activeProjectId) return;
        if (webcontainerService.hasNpmManifest(project.files)) {
          webcontainerService.requestRestart('Container reset');
          toast.success('WebContainer virtual filesystem remounted');
        } else {
          toast('Filesystem remounted — no package.json, staying idle.');
        }
      });
  }, [hasFiles, project.files, project.dependencies, project.projectType, activeProjectId]);

  // Render view content for any dockable container
  const renderViewContent = useCallback(
    (viewId: ViewId, containerId: ContainerId): React.ReactNode => {
      switch (viewId) {
        case 'explorer':
          return (
            <div className="flex h-full w-full flex-col overflow-hidden bg-[#20232B] select-none">
              {/* Explorer Action Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-[#343945] px-3 py-1.5 select-none bg-[#20232B]">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#9AA4B5]">
                  Explorer
                </span>
                <div className="flex items-center gap-0.5">
                  <Tooltip label="New File" side="bottom">
                    <button
                      type="button"
                      onClick={() => treeRef.current?.startNewFile()}
                      aria-label="New File"
                      data-testid="explorer-new-file"
                      className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white"
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
                      className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white"
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
                      className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white"
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
                      className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white"
                    >
                      <FolderDown className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Accordion List */}
              <div
                className="min-h-0 flex-1 overflow-y-auto"
                data-testid="vscode-explorer-scroll"
                onDragOver={handleExplorerDragOver}
                onDragLeave={() => setIsExplorerDropTarget(false)}
                onDrop={handleExplorerDrop}
              >
                {/* INFO Accordion */}
                <div className="border-b border-[#343945]/60">
                  <button
                    type="button"
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-[#9AA4B5] hover:bg-white/5 hover:text-white uppercase select-none"
                  >
                    {isInfoOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Info
                  </button>
                  {isInfoOpen && (
                    <div className="px-5 py-2 text-[11px] text-[#9AA4B5] space-y-1 bg-[#181A20]">
                      <p><span className="text-[#697487]">Framework:</span> React + Vite</p>
                      <p><span className="text-[#697487]">Runtime:</span> In-Browser WebContainer</p>
                      <p><span className="text-[#697487]">Files:</span> {project.files.length} loaded</p>
                      <p><span className="text-[#697487]">Cost:</span> $0.00 (Local-First Compute)</p>
                    </div>
                  )}
                </div>

                {/* PROJECT_NAME Accordion (Contains FileTreeView) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsProjectRootOpen(!isProjectRootOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-[#E5E9F1] hover:bg-white/5 uppercase select-none"
                  >
                    {isProjectRootOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    <span className="truncate">{projectName}</span>
                    <span className="ml-auto rounded bg-[#181A20] px-1 text-[9px] text-[#697487]">
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

                {/* OUTLINE Accordion */}
                <div className="border-t border-[#343945]/60">
                  <button
                    type="button"
                    onClick={() => setIsOutlineOpen(!isOutlineOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-[#9AA4B5] hover:bg-white/5 hover:text-white uppercase select-none"
                  >
                    {isOutlineOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Outline
                  </button>
                  {isOutlineOpen && (
                    <div className="px-5 py-2 text-[11px] text-[#697487] italic bg-[#181A20]">
                      {activePath ? `Active symbol structure: ${activePath}` : 'No symbols to display'}
                    </div>
                  )}
                </div>

                {/* TIMELINE Accordion */}
                <div className="border-t border-[#343945]/60">
                  <button
                    type="button"
                    onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                    className="flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-[11px] font-bold tracking-wider text-[#9AA4B5] hover:bg-white/5 hover:text-white uppercase select-none"
                  >
                    {isTimelineOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Timeline
                  </button>
                  {isTimelineOpen && (
                    <div className="px-5 py-2 text-[11px] text-[#697487] italic bg-[#181A20]">
                      Workspace file history active
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        case 'code-assist':
          return (
            <CodeAssistPanel
              project={project}
              onApplyFiles={handleApplyCodeAssistFiles}
              onClose={() => {
                setWorkbenchLayout((prev) => ({
                  ...prev,
                  primarySidebar: { ...prev.primarySidebar, activeViewId: 'explorer' },
                }));
              }}
            />
          );

        case 'search':
          return (
            <WorkspaceSearchPanel
              files={project.files}
              activePath={activePath}
              projectId={effectiveProjectId}
              onNavigateToLocation={navigateToLocation}
              onChangeFile={handleChange}
            />
          );

        case 'source-control':
          return (
            <GitSourceControlPanel
              files={project.files}
              dirtyPaths={dirtyPaths}
              activePath={activePath}
              onOpenFile={openFile}
            />
          );

        case 'packages':
          return (
            <div className="flex h-full w-full flex-col overflow-hidden bg-[#20232B]">
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
                onClose={() => {
                  setWorkbenchLayout((prev) => ({
                    ...prev,
                    primarySidebar: { ...prev.primarySidebar, activeViewId: 'explorer' },
                  }));
                }}
                onChangeFile={(path, content) => {
                  onChangeFile(path, content);
                  void webcontainerService.syncFile(path, content);
                }}
              />
            </div>
          );

        case 'preview':
          return (
            <WorkbenchLivePreview
              activePreview={activePreview}
              webcontainerState={webcontainer}
              deviceViewport={deviceViewport}
              setDeviceViewport={setDeviceViewport}
              isReloadingPreview={isReloadingPreview}
              onReloadPreview={handleReloadPreview}
              onOpenInNewTab={handleOpenInNewTab}
              previewLoadError={previewLoadError}
              copiedUrl={copiedUrl}
              setCopiedUrl={setCopiedUrl}
              previewIframeRef={previewIframeRef}
              onIframeLoad={handleIframeLoad}
              onIframeError={handleIframeError}
              onOpenTerminal={openTerminal}
              onStartDevServer={handleStartDevServer}
              onInstallDependencies={handleInstallDependencies}
              onRestartDevServer={handleRestartDevServer}
              onFullscreen={() => setIsPreviewFullscreen(true)}
            />
          );

        case 'terminal':
          return (
            <div className="h-full w-full overflow-hidden bg-[#181A20]" data-testid="terminal-container">
              <TerminalTab
                project={project}
                resolvedPackages={[]}
                unresolvedPackages={[]}
                isResolvingPackages={false}
                isActive={workbenchLayout.bottomPanel.visible && workbenchLayout.bottomPanel.activeViewId === 'terminal'}
                projectId={effectiveProjectId}
              />
            </div>
          );

        case 'problems':
          return (
            <ProblemsPanel
              diagnostics={diagnostics}
              onNavigateToDiagnostic={(uri, line, col) => navigateToLocation(uri, line, col)}
            />
          );

        case 'output':
          return <OutputPanel />;

        case 'ports':
          return (
            <div className="flex h-full flex-col p-4 text-xs bg-[#181A20] text-[#E5E9F1]">
              <span className="font-bold tracking-wider uppercase text-[#9AA4B5] mb-2">Ports & Endpoints</span>
              <div className="rounded border border-[#343945] bg-[#20232B] p-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${webcontainer.startupStage === 'ready' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="font-semibold text-white">Vite Development Server</span>
                </div>
                <p className="text-[#9AA4B5] text-[11px] mt-1.5 font-mono">
                  Port: {webcontainer.serverPort || 5173}
                </p>
                <p className="text-[#697487] text-[10px] truncate mt-0.5 font-mono">
                  URL: {webcontainer.serverUrl || `http://localhost:${webcontainer.serverPort || 5173}/`}
                </p>
              </div>
            </div>
          );

        default:
          return <div className="p-4 text-[#697487]">Panel content not found.</div>;
      }
    },
    [
      project,
      activePath,
      dirtyPaths,
      openFile,
      openToSide,
      handleCreateFile,
      handleCreateFolder,
      handleRenameFile,
      handleDeleteFile,
      handleDuplicateFile,
      handleApplyCodeAssistFiles,
      handleChange,
      effectiveProjectId,
      navigateToLocation,
      onChangeFile,
      activePreview,
      webcontainer,
      deviceViewport,
      isReloadingPreview,
      handleReloadPreview,
      handleOpenInNewTab,
      previewLoadError,
      copiedUrl,
      handleIframeLoad,
      handleIframeError,
      openTerminal,
      handleStartDevServer,
      handleInstallDependencies,
      handleRestartDevServer,
      isInfoOpen,
      isOutlineOpen,
      isTimelineOpen,
      isProjectRootOpen,
      projectName,
      handleExplorerDragOver,
      handleExplorerDrop,
      diagnostics,
      workbenchLayout.bottomPanel.visible,
      workbenchLayout.bottomPanel.activeViewId,
    ],
  );

  return (
    <>
      <WorkbenchShell
        projectName={projectName}
        layout={workbenchLayout}
        onUpdateLayout={setWorkbenchLayout}
        onApplyPreset={(preset) => {
          setWorkbenchLayout((prev) => WORKBENCH_PRESETS[preset](prev));
        }}
        onResetLayout={() => {
          setWorkbenchLayout(createDefaultWorkbenchLayout());
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProjects={onOpenProjects}
        onExit={onExit}
        onOpenQuickOpen={openQuickOpen}
        onOpenCommandPalette={openCommandPalette}
        renderViewContent={renderViewContent}
        editorAreaProps={{
          layout: workbenchLayout.editorLayout,
          files: project.files,
          dirtyPaths,
          activeConflict,
          isDiffMode,
          onToggleDiffMode: () => setIsDiffMode((prev) => !prev),
          onResolveKeepMine: handleResolveKeepMine,
          onResolveUseExternal: handleResolveUseExternal,
          onSelectTab: (groupId, path) => {
            if (groupId === 'group-2') {
              setSplitActivePath(path);
            } else {
              setActivePath(path);
            }
          },
          onCloseTab: (groupId, path, event) => {
            if (groupId === 'group-2') {
              closeSplitTab(path, event);
            } else {
              closeTab(path, event);
            }
          },
          onSplitEditor: (direction) => {
            if (isSplitActive) {
              setSplitDirection(direction);
            } else {
              const other =
                openPaths.find((p) => p !== activePath) ||
                project.files.find((f) => f.path !== activePath)?.path ||
                activePath;
              if (other) {
                setSplitDirection(direction);
                openToSide(other);
              }
            }
          },
          onCloseSplit: closeSplitPane,
          onMoveTabToOtherGroup: (path, fromGroupId) => {
            moveTabToOtherPane(path, fromGroupId === 'group-1' ? 'left' : 'right');
          },
          onSplitResize: (ratio) => setSplitRatio(ratio),
          onFileChange: handleChange,
          onEditorMount: handleEditorMount,
          onSplitEditorMount: handleSplitEditorMount,
          monacoLanguageForPath,
          isDark,
          monacoOptions,
        }}
        webcontainerState={webcontainer}
        dirtyCount={dirtyPaths.size}
        isCodeAssistGenerating={codeAssistState.isGenerating}
        diagnostics={diagnostics}
        onOpenSnapshots={() => setIsSnapshotsOpen(true)}
        onOpenVoiceCommands={() => setIsVoiceCommandsOpen(true)}
        onOpenCodeRabbit={() => setIsCodeRabbitOpen(true)}
        onResetContainer={handleResetContainer}
        onNewTerminal={handleNewTerminal}
        onToggleSplitTerminal={handleToggleSplitTerminal}
        cursor={cursor}
        activeLanguage={activeLanguage}
      />

      {/* Fullscreen Preview Overlay */}
      {isPreviewFullscreen && activePreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#181A20] text-white shadow-2xl"
          role="dialog"
          aria-label="Fullscreen Live Preview"
        >
          <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#343945] bg-[#20232B] px-4">
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
                onClick={() => void handleReloadPreview()}
                disabled={isReloadingPreview || !activePreview?.url}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs bg-[#262A33] hover:bg-[#343945] text-gray-200 transition-colors"
                title="Reload preview"
                data-testid="fullscreen-preview-reload-btn"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isReloadingPreview ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-[11px]">
                  {isReloadingPreview ? 'Reloading...' : 'Reload'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs bg-[#262A33] hover:bg-[#343945] text-gray-200 transition-colors"
                title="Open in new tab"
                data-testid="fullscreen-preview-open-new-tab-btn"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">New Tab</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewFullscreen(false)}
                className="flex items-center gap-1.5 rounded bg-[#6366F1] hover:bg-[#4F46E5] px-3 py-1 text-xs font-semibold text-white transition-colors"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </header>

          <iframe
            ref={fullscreenIframeRef}
            src={activePreview.url}
            title="Fullscreen live preview"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
            data-testid="fullscreen-preview-iframe"
          />
        </div>
      )}

      {/* Hidden file & folder inputs */}
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
        // @ts-expect-error — webkitdirectory is standard in Chromium
        webkitdirectory=""
        directory=""
        className="hidden"
        data-testid="explorer-folder-input"
        onChange={(event) => {
          const raw = Array.from(event.target.files ?? []);
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

      {/* Modals */}
      <WorkbenchSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={workbenchLayout.settings}
        onUpdateSettings={(newSettings) => {
          setWorkbenchLayout((prev) => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings },
          }));
        }}
        onResetLayout={() => {
          setWorkbenchLayout(createDefaultWorkbenchLayout());
        }}
      />

      <CodeRabbitReviewModal
        isOpen={isCodeRabbitOpen}
        onClose={() => setIsCodeRabbitOpen(false)}
        files={project.files.map((f) => ({
          filename: f.path,
          content: f.content,
          language: f.language,
        }))}
        onApplyFixToFile={(filePath, newContent) => {
          onChangeFile(filePath, newContent);
          void webcontainerService.syncFile(filePath, newContent);
          toast.success(`Applied fix to ${filePath}`);
        }}
      />

      <VoiceCommandPanel
        isOpen={isVoiceCommandsOpen}
        onClose={() => setIsVoiceCommandsOpen(false)}
      />

      <SnapshotManagerModal
        isOpen={isSnapshotsOpen}
        onClose={() => setIsSnapshotsOpen(false)}
        onRestore={handleRestoreSnapshot}
        onPreview={() => {}}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => {
          setIsCommandPaletteOpen(false);
          setTimeout(() => editorRef.current?.focus(), 20);
        }}
        actions={[
          {
            id: 'workbench.action.quickOpen',
            title: 'File: Quick Open...',
            section: 'File',
            shortcut: 'Ctrl+P',
            icon: <Search className="w-4 h-4 text-indigo-400" />,
            perform: () => openQuickOpen(),
          },
          {
            id: 'workbench.action.togglePrimarySidebar',
            title: 'View: Toggle Primary Sidebar',
            section: 'View',
            shortcut: 'Ctrl+B',
            icon: <Sliders className="w-4 h-4 text-indigo-400" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                primarySidebar: { ...prev.primarySidebar, visible: !prev.primarySidebar.visible },
              }));
            },
          },
          {
            id: 'workbench.action.toggleBottomPanel',
            title: 'View: Toggle Bottom Panel',
            section: 'View',
            shortcut: 'Ctrl+J',
            icon: <TerminalSquare className="w-4 h-4 text-indigo-400" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                bottomPanel: { ...prev.bottomPanel, visible: !prev.bottomPanel.visible },
              }));
            },
          },
          {
            id: 'workbench.action.findInFiles',
            title: 'Search: Find in Files',
            section: 'Search',
            shortcut: 'Ctrl+Shift+F',
            icon: <Search className="w-4 h-4 text-cyan-400" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                primarySidebar: { ...prev.primarySidebar, visible: true, activeViewId: 'search' },
              }));
            },
          },
          {
            id: 'workbench.view.explorer',
            title: 'View: Focus Explorer',
            section: 'View',
            shortcut: 'Ctrl+Shift+E',
            icon: <FilePlus className="w-4 h-4 text-slate-300" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                primarySidebar: { ...prev.primarySidebar, visible: true, activeViewId: 'explorer' },
              }));
            },
          },
          {
            id: 'workbench.view.codeAssist',
            title: 'View: Focus GB Assist',
            section: 'View',
            icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                primarySidebar: { ...prev.primarySidebar, visible: true, activeViewId: 'code-assist' },
              }));
            },
          },
          {
            id: 'workbench.action.terminal.toggleTerminal',
            title: 'View: Toggle Terminal',
            section: 'Terminal',
            shortcut: 'Ctrl+`',
            icon: <TerminalSquare className="w-4 h-4 text-indigo-400" />,
            perform: () => {
              setWorkbenchLayout((prev) => ({
                ...prev,
                bottomPanel: {
                  ...prev.bottomPanel,
                  visible: prev.bottomPanel.visible && prev.bottomPanel.activeViewId === 'terminal' ? false : true,
                  activeViewId: 'terminal',
                },
              }));
            },
          },
          {
            id: 'workbench.action.splitEditor',
            title: isSplitActive ? 'View: Close Split Editor' : 'View: Split Editor',
            section: 'View',
            shortcut: 'Ctrl+\\',
            icon: <Columns className="w-4 h-4 text-slate-300" />,
            perform: () => {
              if (isSplitActive) {
                closeSplitPane();
              } else {
                const other =
                  openPaths.find((p) => p !== activePath) ||
                  project.files.find((f) => f.path !== activePath)?.path ||
                  activePath;
                if (other) openToSide(other);
              }
            },
          },
          {
            id: 'workbench.action.preset.default',
            title: 'Preset: Apply Default Workbench Layout',
            section: 'Presets',
            perform: () => setWorkbenchLayout((prev) => WORKBENCH_PRESETS.DEFAULT(prev)),
          },
          {
            id: 'workbench.action.preset.focus',
            title: 'Preset: Apply Focus (Maximized Editor)',
            section: 'Presets',
            perform: () => setWorkbenchLayout((prev) => WORKBENCH_PRESETS.FOCUS(prev)),
          },
          {
            id: 'workbench.action.preset.preview',
            title: 'Preset: Apply Preview Focused Layout',
            section: 'Presets',
            perform: () => setWorkbenchLayout((prev) => WORKBENCH_PRESETS.PREVIEW_FOCUSED(prev)),
          },
          {
            id: 'workbench.action.preset.ai',
            title: 'Preset: Apply AI Workflow Layout',
            section: 'Presets',
            perform: () => setWorkbenchLayout((prev) => WORKBENCH_PRESETS.AI_WORKFLOW(prev)),
          },
          {
            id: 'workbench.action.preset.terminal',
            title: 'Preset: Apply Terminal Focused Layout',
            section: 'Presets',
            perform: () => setWorkbenchLayout((prev) => WORKBENCH_PRESETS.TERMINAL_FOCUSED(prev)),
          },
          {
            id: 'workbench.action.openSettings',
            title: 'Preferences: Open Workbench Settings',
            section: 'Preferences',
            perform: () => setIsSettingsOpen(true),
          },
          {
            id: 'workbench.action.restartDevServer',
            title: 'WebContainer: Restart Development Server',
            section: 'Server',
            icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
            perform: () => void handleRestartDevServer(),
          },
        ]}
        files={project.files}
        onSelectFile={(path) => {
          navigateToLocation(path);
        }}
        initialMode={commandPaletteMode}
      />
    </>
  );
};

export default VSCodeMode;
