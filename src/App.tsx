import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  Suspense,
} from 'react';
/*
 * `lazyWithRecovery` rather than React's `lazy`: a hashed chunk that no longer
 * exists on the server (because a new version was deployed while this tab stayed
 * open) otherwise fails with an unactionable "Failed to fetch dynamically
 * imported module". See src/utils/loadChunk.ts.
 */
import { lazyWithRecovery, loadChunk } from './utils/loadChunk';
import { Code2, Eye, Share2 } from 'lucide-react';
// Phase 1: Critical components - loaded immediately (not lazy)
import NavigationBar from './components/NavigationBar';
import AppSidebar from './components/AppSidebar';
import EditorPanel from './components/EditorPanel';
import TabbedRightPanel from './components/TabbedRightPanel';
import Footer from './components/ui/Footer';
import Tooltip from './components/ui/Tooltip';
import LazyFallback from './components/ui/LazyFallback';
import DropZoneOverlay from './components/DropZoneOverlay';
import { useImportDrop } from './hooks/useImportDrop';
/*
 * VS Code mode's route and its persistence layer.
 *
 * Both are imported eagerly, and deliberately: the very first render has to know
 * whether the URL addresses VS Code mode, and starting that decision in an effect
 * would show the standard editor for a frame first. Neither module names anything
 * from the full-stack feature, so this does not pull that chunk into the initial
 * payload — `npm run verify:bundle` enforces that.
 */
import { EDITOR_ROUTE, VSCODE_ROUTE, isVSCodeModePath, navigateTo } from './utils/appRoutes';
import {
  clearWorkspace,
  loadWorkspace,
  saveWorkspace,
} from './services/vscodeWorkspaceStore';
/*
 * The project layer. Eager for the same reason as the route helpers: the first
 * render has to know whether a project is active, because that decides between
 * the dashboard and an editor. None of it names anything from the full-stack
 * feature, so the initial payload is unaffected.
 */
import {
  EditorStyle,
  FileSnapshot,
  ProjectRecord,
  createProject as createProjectRecord,
  deleteProject as deleteProjectRecord,
  getProject,
  listProjects,
  readActiveProjectId,
  readProjectFiles,
  saveProjectFiles,
  snapshotOf,
  suggestProjectName,
  touchProject,
  updateProject,
  writeActiveProjectId,
} from './services/projects/projectDatabase';
/*
 * Not lazy, deliberately. The dashboard is the first screen on a cold start, so
 * deferring it would trade a smaller bundle for a spinner on the one view
 * everybody sees first.
 */
import ProjectDashboard from './components/projects/ProjectDashboard';
/*
 * Type-only imports from the lazy import chunk. `import type` is erased during
 * compilation, so naming these types does not create a runtime dependency and
 * the chunk stays out of the initial bundle.
 */
import type { ImportPlan as ImportPlanType } from './services/import/importEngine';
import type { DetectedProjectKind as DetectedKind } from './services/import/projectDetection';

// ===== NEW FEATURES IMPORTS =====
import { Toaster, toast } from 'react-hot-toast';
import { CodeTemplate } from './services/codeTemplatesService';
import type { DiffFile } from './components/AiDiffModal';

// Lazy-loaded modal components (only shown when their show* state is true)
const AiDiffModal = lazyWithRecovery(() => import('./components/AiDiffModal'));
const AIChatAssistant = lazyWithRecovery(() => import('./components/AIChatAssistant'));
const VoiceCommandPanel = lazyWithRecovery(() => import('./components/VoiceCommandPanel'));
const TemplateSelectorModal = lazyWithRecovery(() => import('./components/TemplateSelectorModal'));
const CodeStatsDashboard = lazyWithRecovery(() => import('./components/CodeStatsDashboard'));
const CustomInjectionManager = lazyWithRecovery(() => import('./components/CustomInjectionManager'));
const BuildFromPromptModal = lazyWithRecovery(() => import('./components/BuildFromPromptModal'));

/*
 * Everything past the core HTML/CSS/JS editor is a separate chunk, fetched the
 * first time the user reaches for it. The sidebar entries that open these are
 * plain icons and labels in the core bundle, so the shell is complete on first
 * paint while none of this code is.
 */
const FileExplorer = lazyWithRecovery(() => import('./components/FileExplorer'));
const DependenciesPanel = lazyWithRecovery(() => import('./components/DependenciesPanel'));
const MultiFileEditor = lazyWithRecovery(() => import('./components/MultiFileEditor'));
const ExportShareModal = lazyWithRecovery(() => import('./components/ExportShareModal'));
const ImportModal = lazyWithRecovery(() => import('./components/ImportModal'));
const PreviewSharePage = lazyWithRecovery(() => import('./components/PreviewSharePage'));
const ImportReviewModal = lazyWithRecovery(() => import('./components/ImportReviewModal'));
const NewProjectModal = lazyWithRecovery(() => import('./components/projects/NewProjectModal'));

/*
 * The full-stack feature (VS Code mode, sandbox panel, sandbox client, E2B
 * vocabulary) behind ONE dynamic import. It is a separate chunk from both the
 * core editor and the import/detection chunk, and is only ever rendered after a
 * detected full-stack project is confirmed — so it is only ever fetched then.
 */
const VSCodeMode = lazyWithRecovery(
  () =>
    import('./features/fullstack/fullstackFeature').then((module) => ({
      default: module.VSCodeMode,
    })),
  'Full-stack editor mode',
);

// Phase 2: High priority - lazy loaded after initial render
// (EnhancedConsole is used inside TabbedRightPanel, not here directly)

// Phase 3: Deferred - lazy loaded after high priority components
const SnippetsSidebar = lazyWithRecovery(() => import('./components/SnippetsSidebar'));
const ExternalLibraryManager = lazyWithRecovery(() => import('./components/ExternalLibraryManager'));
const CodeHistoryPage = lazyWithRecovery(() => import('./components/history/CodeHistoryPage'));
const AboutPage = lazyWithRecovery(() => import('./components/pages/AboutPage'));
const DocumentationPage = lazyWithRecovery(() => import('./components/pages/DocumentationPage'));
const PrivacyPolicyPage = lazyWithRecovery(() => import('./components/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazyWithRecovery(() => import('./components/pages/TermsOfServicePage'));
const CookiePolicyPage = lazyWithRecovery(() => import('./components/pages/CookiePolicyPage'));
const DisclaimerPage = lazyWithRecovery(() => import('./components/pages/DisclaimerPage'));
const ContactPage = lazyWithRecovery(() => import('./components/pages/ContactPage'));
const ExtensionsMarketplace = lazyWithRecovery(() => import('./components/ExtensionsMarketplace'));
const SettingsModal = lazyWithRecovery(() => import('./components/SettingsModal'));
const HistoryPanel = lazyWithRecovery(() => import('./components/HistoryPanel'));
const KeyboardShortcutsHelp = lazyWithRecovery(() => import('./components/KeyboardShortcutsHelp'));
const CommandPalette = lazyWithRecovery(() => import('./components/CommandPalette'));

import { useLocalStorage } from './hooks/useLocalStorage';
import { useCodeHistory } from './hooks/useCodeHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { useTheme } from './hooks/useTheme';
import { useCodeSelection } from './hooks/useCodeSelection';
import { useSelectionOperations } from './hooks/useSelectionOperations';
import { useProject } from './hooks/useProject';
import { useSettings } from './hooks/useSettings';
import { useFocusMode } from './hooks/useFocusMode';
import { useProgressiveLoad } from './hooks/useProgressiveLoad';
import { useCodeWriter } from './hooks/useCodeWriter';
import { useProjectBundle } from './hooks/useProjectBundle';
import { useAppShortcuts } from './hooks/useAppShortcuts';
import { useFileWorkspace } from './hooks/useFileWorkspace';
import { useConsoleFeed } from './hooks/useConsoleFeed';
import { useValidation } from './hooks/useValidation';
import { validationService } from './services/validationService';
import { editorNavigator } from './services/editorNavigator';
import SelectionToolbar from './components/SelectionToolbar';
import SelectionSidebar from './components/SelectionSidebar';
import {
  buildStandaloneHtml,
  createZipBlob,
  downloadBlob,
  formatBytes,
  htmlFilename,
  zipFilename,
} from './services/projectArchiveService';
import { ImportResult, applyImport } from './services/projectImportService';
import { capturePreview, captureFilename, downloadCapture } from './services/captureService';
import { clearShareHash, readShareLink } from './services/shareLinkService';
import * as monacoHelper from './utils/monacoSelectionHelper';
import { CodeSnippet, ConsoleLog, EditorLanguage, HistoryItem, JSEditorMode, SnippetType, SnippetScope } from './types';
import {
  MultiFileProject,
  PLAIN_CSS_PATH,
  PLAIN_HTML_PATH,
  PLAIN_JS_PATH,
  PROJECT_TYPE_LABEL,
  ProjectFile,
  ProjectType,
  createPlainProject,
  createProjectOfType,
  getFileContent,
  languageForPath,
  projectToTriple,
  setFileContent,
} from './types/files';
import { migrateSnippets } from './utils/snippetUtils';
import { externalLibraryService, ExternalLibrary } from './services/externalLibraryService';
import { formattingService } from './services/formattingService';
import { SelectionOperationType } from './services/selectionOperationsService';
import { fetchPreviewByID } from './services/shareExportService';
import {
  UNRECOGNIZED_MESSAGE,
  VoiceAttemptDetail,
  VoiceCommandDetail,
  VoiceExportTarget,
  VoiceModalTarget,
  VoicePanelTarget,
  voiceCommandService,
} from './services/voiceCommandService';
import { sandboxTerminal } from './services/sandboxTerminal';
import { customInjectionService } from './services/customInjectionService';
/*
 * PreviewSharePage is intentionally NOT imported here. It is declared with
 * React.lazy below: the standalone share page is only reached via a /preview/:id
 * URL, so bundling it into the entry chunk made every visitor pay for a route
 * almost none of them take.
 */


type AppView = 'editor' | 'history' | 'about' | 'documentation' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact' | 'preview-share' | 'preview-share-error';

/*
 * Start of the desktop range. Mirrors the `desktop` / `compact` screens in
 * tailwind.config.js — mobile ≤640, tablet 641–1024, desktop ≥1025 — so the
 * handful of places that must branch in JS use the same boundary the CSS does.
 */
const DESKTOP_MIN_WIDTH = 1025;

/*
 * ===== VOICE COMMAND GLUE =====
 * Module-level so the external-store subscription identity is stable across
 * renders, which `useSyncExternalStore` requires to avoid resubscribing.
 */
const subscribeToVoice = (onStoreChange: () => void) => voiceCommandService.subscribe(onStoreChange);
const getVoiceSnapshot = () => voiceCommandService.getState();

/** Turns a dictated phrase into a sentence-cased AI prompt. */
const toPromptText = (spoken: string): string =>
  spoken.charAt(0).toUpperCase() + spoken.slice(1);

/** Voice action -> the selection operation it maps onto. */
const VOICE_SELECTION_OPERATIONS: Record<string, SelectionOperationType> = {
  explain: 'explain',
  fix: 'debug',
  optimize: 'optimize',
  enhance_design: 'improveUI',
};

/** Human labels for the "select some code first" message. */
const VOICE_SELECTION_LABELS: Record<string, string> = {
  explain: 'explain code',
  fix: 'find and fix issues',
  optimize: 'optimize performance',
  enhance_design: 'enhance the design',
};

/** First unused `new-file-N` path, so "new file" never needs a dialog. */
const nextVoiceFilePath = (project: MultiFileProject): string => {
  const existing = new Set(project.files.map((file) => file.path));
  for (let index = 1; index <= 99; index += 1) {
    const candidate = `src/new-file-${index}.js`;
    if (!existing.has(candidate)) return candidate;
  }
  return `src/new-file-${Date.now()}.js`;
};

/**
 * Minimal starter template. Previously these were an empty `.container` div and
 * an empty rule, which rendered as a blank gray Live Preview on first load and
 * gave no sense that the editor was working. This renders something immediately
 * while staying small enough to read and delete in one pass.
 */
const defaultHTML = `<div class="container">
  <div class="card">
    <h1 class="card-title">Hello World</h1>
    <p class="card-text">Edit the HTML, CSS or JS to see this update live.</p>
    <button class="card-button" type="button">Get started</button>
  </div>
</div>`;

const defaultCSS = `:root {
  --accent: #7c3aed;
  --surface: #18181b;
  --stroke: #27272a;
  --text: #fafafa;
  --text-muted: #a1a1aa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #0a0a0a;
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

.card {
  max-width: 360px;
  padding: 32px;
  border: 1px solid var(--stroke);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.card-title {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.2;
}

.card-text {
  margin: 0 0 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.card-button {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 120ms ease-out;
}

.card-button:hover {
  filter: brightness(1.12);
}`;

const defaultJS = `const button = document.querySelector('.card-button');

button?.addEventListener('click', () => {
  console.log('Button clicked');
});`;

/**
 * Shared styling for the icon-only buttons in the top toolbar: 6px radius and a
 * subtle white wash on hover so every icon target reads as interactive.
 */
const toolbarIconButtonClass = (isDark: boolean) =>
  `rounded-md p-2 transition-colors ${
    isDark
      ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
      : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
  }`;

/**
 * The workspace VS Code mode shows when nothing has been loaded into it yet —
 * someone opening `/ide` directly, before importing anything.
 *
 * Module-level so its identity is stable: a fresh object each render would look
 * like a new project to every effect and memo inside the mode.
 */
const EMPTY_VSCODE_PROJECT: MultiFileProject = { projectType: 'plain', files: [] };

/** How long to let edits settle before writing the workspace to storage. */
const WORKSPACE_SAVE_DEBOUNCE_MS = 600;

/**
 * How long to let edits settle before writing them to the active project.
 *
 * Longer than the workspace debounce because this write is larger, and a project
 * save is never the thing standing between the user and their next action —
 * navigating away flushes immediately rather than waiting for this.
 */
const PROJECT_SAVE_DEBOUNCE_MS = 1200;

function App() {
  // Progressive loading phases
  const { isPhase3Ready } = useProgressiveLoad();

  /**
   * The multi-file project is the single source of truth for all code.
   *
   * `html` / `css` / `javascript` below are *derived* from it rather than being
   * independent state. That keeps every existing consumer (export, share,
   * templates, snippets, autosave, history, stats, validation, AI) working
   * against the same three values it always used, while the underlying model can
   * now hold an arbitrary number of React/Vue files.
   */
  const [fileProject, setFileProject] = useState<MultiFileProject>(
    () =>
      // A shared link must win: initialising here (rather than in an effect)
      // means useProject seeds itself from the shared code, so its reverse-sync
      // has nothing to overwrite.
      readShareLink() ?? createPlainProject(defaultHTML, defaultCSS, defaultJS),
  );

  const { html, css, javascript } = useMemo(() => projectToTriple(fileProject), [fileProject]);

  /**
   * Last known plain project, preserved so switching plain -> React -> plain is
   * lossless. A framework project has no index.html/script.js to derive from.
   */
  const lastPlainProjectRef = React.useRef<MultiFileProject | null>(null);
  useEffect(() => {
    if (fileProject.projectType === 'plain') lastPlainProjectRef.current = fileProject;
  }, [fileProject]);

  /*
   * These setters intentionally mirror React's `useState` setter contract:
   * they accept either a value or an updater function, because existing call
   * sites use both (e.g. snippet insertion does `setHtml(prev => prev + ...)`).
   * Extra arguments are ignored, which matters because `codeWriter.writeCode`
   * invokes the setter as `onUpdate(text, progress)`.
   */
  const setHtml = useCallback((value: React.SetStateAction<string>) => {
    setFileProject((current) =>
      setFileContent(
        current,
        PLAIN_HTML_PATH,
        typeof value === 'function' ? value(getFileContent(current, PLAIN_HTML_PATH)) : value,
      ),
    );
  }, []);

  const setCss = useCallback((value: React.SetStateAction<string>) => {
    setFileProject((current) =>
      setFileContent(
        current,
        PLAIN_CSS_PATH,
        typeof value === 'function' ? value(getFileContent(current, PLAIN_CSS_PATH)) : value,
      ),
    );
  }, []);

  const setJavascript = useCallback((value: React.SetStateAction<string>) => {
    setFileProject((current) =>
      setFileContent(
        current,
        PLAIN_JS_PATH,
        typeof value === 'function' ? value(getFileContent(current, PLAIN_JS_PATH)) : value,
      ),
    );
  }, []);
  const [jsEditorMode, setJsEditorMode] = useLocalStorage<JSEditorMode>('gb-coder-js-editor-mode', 'javascript');
  /*
   * Console feed. Owns the cap, repeat collapsing, collision-free ids and the
   * per-level counts that drive the badges.
   */
  const consoleFeed = useConsoleFeed();
  /*
   * Destructured because the hook's object identity changes on every new
   * message, while these three callbacks are stable. Depending on the object
   * would invalidate every consumer each time a log arrived.
   */
  const {
    append: appendConsoleMessage,
    appendText: appendConsoleText,
    clear: clearConsole,
    clearPageMessages: clearPreviewMessages,
  } = consoleFeed;
  const { isDark } = useTheme();
  const [snippets, setSnippets] = useLocalStorage<CodeSnippet[]>('gb-coder-snippets', []);
  const [selectionHistory, setSelectionHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  /*
   * `isMobile` means "below the desktop breakpoint" — i.e. the ≤1024px compact
   * range that Tailwind's `compact:` variant covers. Keeping the JS threshold
   * and the CSS breakpoint on the same boundary (1025px) is what stops the
   * layout from disagreeing with itself at 1024px exactly.
   */
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < DESKTOP_MIN_WIDTH);
  /** Off-canvas nav drawer, compact viewports only. */
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  /**
   * Which of the two stacked columns is on screen at ≤1024px. Desktop shows
   * both side by side and ignores this entirely.
   */
  const [mobilePane, setMobilePane] = useState<'code' | 'preview'>('code');
  const [autoSaveEnabled, setAutoSaveEnabled] = useLocalStorage<boolean>('gb-coder-autosave-enabled', true);
  const [showSnippets, setShowSnippets] = useState<boolean>(false);
  const [showFileExplorer, setShowFileExplorer] = useState<boolean>(false);
  const [showDependencies, setShowDependencies] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [previewShareCode, setPreviewShareCode] = useState<{ html: string; css: string; javascript: string } | null>(null);
  const [previewShortId, setPreviewShortId] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showExternalLibraryManager, setShowExternalLibraryManager] = useState<boolean>(false);
  const [externalLibraries, setExternalLibraries] = useState<ExternalLibrary[]>([]);
  const [showExtensionsMarketplace, setShowExtensionsMarketplace] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showExportShare, setShowExportShare] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'screenshot' | 'export' | 'share'>('screenshot');
  const [showImport, setShowImport] = useState<boolean>(false);

  // ===== NEW FEATURES STATE =====
  const [showAIChat, setShowAIChat] = useState(false);
  const [showBuildFromPrompt, setShowBuildFromPrompt] = useState(false);
  const [isBuildAnimating, setIsBuildAnimating] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  /** Transcript routed into Build with AI, awaiting the user's confirmation. */
  const [voiceBuildPrompt, setVoiceBuildPrompt] = useState('');
  /**
   * Voice-driven request to focus a right-hand panel. The nonce makes repeat
   * requests for the same tab distinguishable, so saying "open console" twice
   * works even if the tab is already selected.
   */
  const [rightPanelRequest, setRightPanelRequest] = useState<{
    tab: VoicePanelTarget;
    nonce: number;
  } | null>(null);
  /**
   * Set when a full-stack project is confirmed. Drives VS Code mode, and is kept
   * separate from `fileProject` so leaving the mode cannot disturb the plain /
   * React / Vue editors, which are untouched by this feature.
   */
  const [fullStackProject, setFullStackProject] = useState<MultiFileProject | null>(null);
  /**
   * What to restore when leaving VS Code mode, set only for a *manual* entry.
   *
   * An auto-detected full-stack import has nothing meaningful to go back to and
   * leaves as a plain project. A manual entry does: a React or Vue project must
   * come back as itself, not be silently flattened to plain on exit.
   */
  const [vsCodeReturn, setVsCodeReturn] = useState<{
    projectType: MultiFileProject['projectType'];
    entry?: string;
  } | null>(null);
  /**
   * Whether the URL addresses VS Code mode.
   *
   * Seeded from `window.location` in the initialiser rather than in an effect,
   * for the same reason `fileProject` reads the share link there: an effect runs
   * after the first paint, so the standard editor would render for a frame and
   * then be replaced — the exact flash this route exists to remove.
   *
   * The URL is the source of truth for *which mode is on screen*. It is the only
   * part of the app's state the browser preserves across a refresh by itself.
   */
  const [isVSCodeRoute, setIsVSCodeRoute] = useState<boolean>(() => isVSCodeModePath());
  /**
   * True while the stored workspace is being read back.
   *
   * Distinct from "there is no project": the difference decides whether the mode
   * shows a loading state or tells the user nothing is loaded, and getting it
   * wrong means flashing "No project loaded" over a workspace that is about to
   * appear.
   */
  const [isRestoringWorkspace, setIsRestoringWorkspace] = useState<boolean>(() =>
    isVSCodeModePath(),
  );

  /* ===== PROJECT LAYER =====
   *
   * A project is the unit of work: the editors are only ever shown with one open.
   * `activeProjectId` being null is what puts the dashboard on screen, so it is
   * read from localStorage in the initialiser — synchronously, because deciding
   * this in an effect would render an editor for a frame before replacing it with
   * the dashboard.
   *
   * Only the *pointer* lives in localStorage. Records and files are in IndexedDB,
   * which has no practical size ceiling; see services/projects/projectDatabase.
   */
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    readActiveProjectId(),
  );
  const [activeProject, setActiveProject] = useState<ProjectRecord | null>(null);
  /** True while the pointed-at project's files are being read back. */
  const [isOpeningProject, setIsOpeningProject] = useState<boolean>(
    () => readActiveProjectId() !== null,
  );
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isProjectListLoading, setIsProjectListLoading] = useState<boolean>(true);
  const [showNewProject, setShowNewProject] = useState<boolean>(false);
  const [diffData, setDiffData] = useState<{
    isOpen: boolean;
    files: DiffFile[];
    onApplyAll: () => void;
    onApplyFile: (path: string) => void;
    title?: string;
  } | null>(null);
  /**
   * What was last written for the active project, so a save can send only the
   * files that actually changed rather than rewriting the whole tree.
   */
  const savedFilesRef = React.useRef<FileSnapshot | null>(null);
  /** The most recent unsaved state, held so navigation can flush it on demand. */
  const pendingProjectSaveRef = React.useRef<{ projectId: string; files: ProjectFile[] } | null>(
    null,
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [aiSuggestionsUsed, setAiSuggestionsUsed] = useState(0);
  const [showInjectionManager, setShowInjectionManager] = useState(false);
  const [customInjections, setCustomInjections] = useState<any[]>([]);
  const previewRef = React.useRef<HTMLElement>(null);

  // Settings
  const { settings, updateSettings, getFontFamilyCSS } = useSettings();

  // Focus Mode
  const { focusMode } = useFocusMode();

  // Project Management
  const project = useProject(html, css, javascript, externalLibraries);

  // Format loading states
  const [formatLoadingStates, setFormatLoadingStates] = useState<Record<EditorLanguage, boolean>>({
    html: false,
    css: false,
    javascript: false
  });


  // Selection operations
  const htmlEditorRef = React.useRef<any>(null);
  const cssEditorRef = React.useRef<any>(null);
  const jsEditorRef = React.useRef<any>(null);
  const { selection, updateSelection, clearSelection, hasSelection } = useCodeSelection();
  const selectionOps = useSelectionOperations();

  /** Live microphone state, so the toolbar mic reflects it. */
  const voiceState = useSyncExternalStore(subscribeToVoice, getVoiceSnapshot, getVoiceSnapshot);
  const codeWriter = useCodeWriter();

  // Code history for undo/redo functionality
  const codeHistory = useCodeHistory({ html, css, javascript });

  // Auto-save functionality (project-aware)
  const autoSave = useAutoSave({
    html,
    css,
    javascript,
    interval: 30000, // 30 seconds
    enabled: autoSaveEnabled,
    projectId: project.currentProject?.id, // Make auto-save project-aware
  });

  /**
   * Editor-facing view of the project: open tabs, focused file, per-file dirty
   * state and file CRUD. Dirty markers clear whenever autosave actually writes,
   * so the tab dots reflect real save state rather than a guess.
   */
  const workspace = useFileWorkspace(
    fileProject,
    setFileProject,
    autoSave.lastSaveTime ? new Date(autoSave.lastSaveTime).getTime() : null,
  );

  /*
   * Validation. Debounced inside the hook, and driven from App rather than from
   * the console panel so the problem count stays live even while the user is
   * looking at the Live Preview tab.
   *
   * `isValidationReady` flips once an editor has mounted and handed its Monaco
   * instance to the service, which is what owns the language workers.
   */
  const [isValidationReady, setIsValidationReady] = useState(validationService.isReady());
  const validation = useValidation(fileProject, isValidationReady, workspace.activePath);

  /**
   * Called by every editor on mount. Registers the instance for click-to-jump
   * navigation and hands Monaco to the validation service.
   */
  const handleEditorReady = useCallback(
    (key: string, editor: unknown, monaco: unknown) => {
      editorNavigator.register(key, editor as never);
      if (monaco) {
        validationService.setMonaco(monaco as never);
        setIsValidationReady(true);
        
        // Let Monaco pass Ctrl+S to the global app shortcut handler
        const m = monaco as any;
        const e = editor as any;
        if (m.KeyMod && m.KeyCode && e.addCommand) {
          e.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', ctrlKey: true }));
          });
        }
      }
    },
    [],
  );

  /*
   * Multi-file navigation needs the target file open before its line can be
   * revealed. Plain mode needs nothing: all three editors are always mounted.
   */
  useEffect(() => {
    editorNavigator.setActivationHandler((file) => {
      if (fileProject.projectType === 'plain') return;
      if (fileProject.files.some((projectFile) => projectFile.path === file)) {
        workspace.openFile(file);
      }
    });
    return () => editorNavigator.setActivationHandler(null);
  }, [fileProject, workspace]);

  /*
   * Switching project type unmounts one editor surface and mounts the other.
   * Dropping the registry avoids holding disposed Monaco instances.
   */
  useEffect(() => {
    editorNavigator.reset();
  }, [fileProject.projectType]);


  React.useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < DESKTOP_MIN_WIDTH;
      setIsMobile(compact);
      // Crossing into desktop dismisses the drawer, which has no desktop
      // representation.
      if (!compact) setIsNavDrawerOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // /preview/:id route and ?fork=:id detection - runs once on app init.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadSharedPreview = async (shortId: string, mode: 'preview' | 'fork') => {
      try {
        const sharedCode = await fetchPreviewByID(shortId);

        if (mode === 'preview') {
          setPreviewShareCode(sharedCode);
          setPreviewError(null);
          setPreviewLoading(false);
          return;
        }

        codeHistory.saveState({ html, css, javascript }, 'Forked shared preview');
        setHtml(sharedCode.html);
        setCss(sharedCode.css);
        setJavascript(sharedCode.javascript);
        clearConsole();
        toast.success('Preview opened in editor.');
      } catch (error: any) {
        if (mode === 'preview') {
          setPreviewError(
            error.message === 'PREVIEW_NOT_FOUND'
              ? "This preview has expired or doesn't exist."
              : 'Failed to load preview. Try again.'
          );
          setPreviewLoading(false);
          return;
        }

        toast.error(
          error.message === 'PREVIEW_NOT_FOUND'
            ? "This preview has expired or doesn't exist."
            : 'Failed to load preview. Try again.'
        );
      }
    };

    if (window.location.pathname.startsWith('/preview/')) {
      const shortId = window.location.pathname.split('/preview/')[1]?.split('/')[0] || '';
      setCurrentView('preview-share');
      setPreviewShortId(shortId);
      setPreviewShareCode(null);

      if (shortId.length !== 8) {
        setPreviewError("This preview has expired or doesn't exist.");
        setPreviewLoading(false);
        return;
      }

      setPreviewError(null);
      setPreviewLoading(true);
      loadSharedPreview(shortId, 'preview');
      return;
    }

    if (window.location.pathname === '/preview' || window.location.pathname === '/preview/') {
      setCurrentView('preview-share');
      setPreviewShortId('');
      setPreviewShareCode(null);
      setPreviewError("This preview has expired or doesn't exist.");
      setPreviewLoading(false);
      return;
    }

    const forkId = new URLSearchParams(window.location.search).get('fork') || '';
    if (forkId) {
      if (forkId.length !== 8) {
        toast.error("This preview has expired or doesn't exist.");
        return;
      }

      loadSharedPreview(forkId, 'fork');
    }
  }, []);

  // Handle navigation events
  React.useEffect(() => {
    const handleNavigateToAbout = () => setCurrentView('about');
    const handleNavigateToDocumentation = () => setCurrentView('documentation');
    const handleOpenKeyboardShortcuts = () => setShowKeyboardShortcuts(true);
    const handleNavigateToPrivacy = () => setCurrentView('privacy');
    const handleNavigateToTerms = () => setCurrentView('terms');
    const handleNavigateToCookies = () => setCurrentView('cookies');
    const handleNavigateToDisclaimer = () => setCurrentView('disclaimer');
    const handleNavigateToContact = () => setCurrentView('contact');

    window.addEventListener('navigate-to-about', handleNavigateToAbout);
    window.addEventListener('navigate-to-documentation', handleNavigateToDocumentation);
    window.addEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
    window.addEventListener('navigate-to-privacy', handleNavigateToPrivacy);
    window.addEventListener('navigate-to-terms', handleNavigateToTerms);
    window.addEventListener('navigate-to-cookies', handleNavigateToCookies);
    window.addEventListener('navigate-to-disclaimer', handleNavigateToDisclaimer);
    window.addEventListener('navigate-to-contact', handleNavigateToContact);

    return () => {
      window.removeEventListener('navigate-to-about', handleNavigateToAbout);
      window.removeEventListener('navigate-to-documentation', handleNavigateToDocumentation);
      window.removeEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
      window.removeEventListener('navigate-to-privacy', handleNavigateToPrivacy);
      window.removeEventListener('navigate-to-terms', handleNavigateToTerms);
      window.removeEventListener('navigate-to-cookies', handleNavigateToCookies);
      window.removeEventListener('navigate-to-disclaimer', handleNavigateToDisclaimer);
      window.removeEventListener('navigate-to-contact', handleNavigateToContact);
    };
  }, []);

  // Load external libraries on component mount (deferred to Phase 3)
  useEffect(() => {
    // Don't load libraries until Phase 3 is ready
    if (!isPhase3Ready) return;

    try {
      if (!externalLibraryService) return;

      const libraries = externalLibraryService.getLibraries();
      setExternalLibraries(libraries);
    } catch (error) {
      console.error('[DEBUG] Error loading external libraries:', error);
      // Set empty array as fallback to prevent crashes
      setExternalLibraries([]);
    }
  }, [isPhase3Ready]);


  // Migrate snippets to new format with type and scope (deferred to Phase 3)
  useEffect(() => {
    // Don't migrate snippets until Phase 3 is ready
    if (!isPhase3Ready) return;

    const migratedSnippets = migrateSnippets(snippets);
    // Only update if migration changed anything
    if (JSON.stringify(migratedSnippets) !== JSON.stringify(snippets)) {
      setSnippets(migratedSnippets);
    }
  }, [isPhase3Ready]); // Run when Phase 3 is ready

  // Sync project code when html/css/javascript changes
  useEffect(() => {
    if (project.currentProject) {
      project.updateProjectCode(html, css, javascript);
    }
  }, [html, css, javascript]);

  // Sync external libraries with project
  useEffect(() => {
    if (project.currentProject) {
      project.updateExternalLibraries(externalLibraries);
    }
  }, [externalLibraries]);

  // Load project code when project changes
  useEffect(() => {
    /*
     * Suppressed while a project from the project layer is open. This syncs from
     * the older localStorage record, which only ever holds an html/css/js triple —
     * letting it run would overwrite a multi-file project with a flattened copy of
     * something else.
     */
    if (activeProjectId) return;

    if (project.currentProject && !project.isLoading) {
      const proj = project.currentProject;
      if (proj.html !== html || proj.css !== css || proj.javascript !== javascript) {
        setHtml(proj.html);
        setCss(proj.css);
        setJavascript(proj.javascript);
        setExternalLibraries(proj.externalLibraries);
      }
    }
  }, [project.currentProject?.id]);

  // External Library Manager handlers
  const handleExternalLibraryManagerToggle = () => {
    setShowExternalLibraryManager(!showExternalLibraryManager);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleExternalLibrariesChange = (libraries: ExternalLibrary[]) => {
    setExternalLibraries(libraries);

    window.dispatchEvent(new CustomEvent('external-libraries-updated'));
  };

  /**
   * Bundler diagnostics arrive as flat text. Adapted onto the structured feed so
   * build output and runtime output share one list, one cap and one clear.
   */
  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    appendConsoleText(log.type, log.message, 'build');
  }, [appendConsoleText]);

  const clearConsoleLogs = useCallback(() => {
    clearConsole();
  }, [clearConsole]);

  /**
   * Client-side build for React/Vue projects. A no-op for plain projects, so
   * the default experience pays nothing for this.
   */
  const projectBundle = useProjectBundle({
    project: fileProject,
    onConsoleLog: handleConsoleLog,
  });

  /**
   * Selection handler for the multi-file editor, so the AI selection toolbar
   * works there too. Framework file languages are mapped onto the editor's
   * three-language union that the AI layer expects.
   */
  const handleMultiFileSelectionChange = useCallback(
    (editor: unknown, path: string) => {
      const language = languageForPath(path);
      const editorLanguage: EditorLanguage =
        language === 'css' ? 'css' : language === 'html' ? 'html' : 'javascript';
      updateSelection(editor, editorLanguage);
    },
    [updateSelection],
  );

  /**
   * Switches project type, replacing the workspace with that type's starter
   * files. Plain keeps the user's current code so toggling back is lossless.
   */
  /**
   * Single ZIP path for every caller (menu, terminal, voice, page footers).
   * Previously `downloadUtils.downloadAsZip` wrote an index.html with no
   * <link>/<script>, so the archive rendered unstyled and inert; it also could
   * not represent a multi-file project at all.
   */
  const handleExportZip = useCallback(async () => {
    try {
      const blob = await createZipBlob(fileProject, {
        projectName: project.currentProject?.name ?? 'gb-coder-project',
        externalLibraries,
        resolvedVersions: Object.fromEntries(
          projectBundle.resolvedPackages.map((pkg) => [pkg.name, pkg.resolvedVersion ?? pkg.version]),
        ),
      });
      downloadBlob(blob, zipFilename(project.currentProject?.name));
      toast.success(`Exported ZIP (${formatBytes(blob.size)}).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed.');
    }
  }, [fileProject, externalLibraries, project.currentProject?.name, projectBundle.resolvedPackages]);

  /** Applies a parsed import, preserving undo history. */
  const handleImportResult = useCallback(
    (result: ImportResult) => {
      codeHistory.saveState({ html, css, javascript }, 'Imported files');
      // Merged outside the state updater: updaters must stay pure, and
      // `fileProject` is already a dependency so it is never stale here.
      const { project: merged, summary } = applyImport(fileProject, result);
      setFileProject(merged);
      toast.success(summary);
    },
    [codeHistory, html, css, javascript, fileProject],
  );

  /**
   * Writes any pending edits now instead of waiting for the debounce.
   *
   * Every path that leaves a project awaits this. The debounce exists to avoid
   * writing on each keystroke, not to make navigation lossy, and "I clicked away
   * and my last paragraph vanished" is the one failure this layer must not have.
   *
   * Declared up here, ahead of the import handlers, because they need it too.
   */
  const flushProjectSave = useCallback(async () => {
    const pendingSave = pendingProjectSaveRef.current;
    if (!pendingSave) return;

    pendingProjectSaveRef.current = null;
    savedFilesRef.current = await saveProjectFiles(
      pendingSave.projectId,
      pendingSave.files,
      savedFilesRef.current,
    );
  }, []);

  /**
   * Puts a project's files in front of the user.
   *
   * `fileProject` is set even for a VS Code style project. Leaving that mode hands
   * its files back through the standard import path, which *merges* — so if the
   * two started out different, exiting would fold starter content into the
   * project. Seeding both makes that merge a no-op.
   */
  const applyProjectToEditor = useCallback(
    (record: ProjectRecord, files: ProjectFile[], options: { navigate: boolean }) => {
      const project: MultiFileProject = {
        projectType: record.projectType,
        files,
        entry: record.entry,
      };

      savedFilesRef.current = snapshotOf(files);
      pendingProjectSaveRef.current = null;

      /*
       * On a cold start the URL already says which editor was on screen and the
       * browser preserved that across the refresh, so it wins. When the user is
       * actively opening a project, the record's stored style is what to honour.
       */
      const openInVSCode = options.navigate ? record.editorStyle === 'vscode' : isVSCodeModePath();

      setFileProject(project);

      if (openInVSCode) {
        setFullStackProject(project);
        setVsCodeReturn({ projectType: record.projectType, entry: record.entry });
        setIsVSCodeRoute(true);
        // The project is the source of truth now, so nothing needs restoring.
        setIsRestoringWorkspace(false);
        if (options.navigate) navigateTo(VSCODE_ROUTE);
      } else {
        setFullStackProject(null);
        setVsCodeReturn(null);
        setIsVSCodeRoute(false);
        if (options.navigate) navigateTo(EDITOR_ROUTE);
      }
    },
    [],
  );

  /*
   * ===== DRAG & DROP IMPORT =====
   *
   * The plan is built by the lazy import chunk and reviewed before anything is
   * applied, so a wrong detection never silently replaces the user's work.
   */
  const [importPlan, setImportPlan] = useState<ImportPlanType | null>(null);

  /**
   * Whether an import should become a project of its own.
   *
   * A folder or an archive is a whole project, so bringing one in starts one —
   * that is what "open my project" means. Loose files are an addition to whatever
   * is already open.
   */
  const importShouldCreateProject = useCallback(
    (plan: ImportPlanType): boolean => {
      if (plan.source === 'folder' || plan.source === 'zip') return true;

      /*
       * ...except with nothing open, which is a drop straight onto the dashboard.
       * There is no project to add to, and the alternative is quietly discarding
       * what was just dropped.
       */
      return activeProjectId === null;
    },
    [activeProjectId],
  );

  /**
   * Names a project after whatever was imported.
   *
   * An archive's own extension is not part of its name; everything else already
   * arrives as a bare folder or file name.
   */
  const projectNameFromImport = (plan: ImportPlanType): string => {
    const raw = plan.source === 'zip' ? plan.sourceName.replace(/\.zip$/i, '') : plan.sourceName;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : 'Imported Project';
  };

  /**
   * Turns a confirmed import into a new project and opens it.
   *
   * The editor style comes from the detection the user just confirmed rather than
   * from a separate question: a project with a server side needs the mode that can
   * run one, and asking again about something already decided is noise.
   */
  const createProjectFromImport = useCallback(
    async (plan: ImportPlanType, kind: DetectedKind) => {
      await flushProjectSave();

      const projectType: ProjectType =
        kind === 'react' ? 'react' : kind === 'vue' ? 'vue' : 'plain';
      const editorStyle: EditorStyle = kind === 'fullstack' ? 'vscode' : 'plain';
      /*
       * Mirrors what the existing import path does with the entry point: a forced
       * plain import has no module entry to open, while a framework or full-stack
       * project does.
       */
      const entry = kind === 'fullstack' || projectType !== 'plain' ? plan.result.entry : undefined;

      const record = await createProjectRecord({
        name: projectNameFromImport(plan),
        editorStyle,
        projectType,
        entry,
        files: plan.result.files,
      });

      if (!record) {
        toast.error('Could not save that import as a project. This browser may be blocking storage.');
        return;
      }

      setProjects((current) => [record, ...current]);
      writeActiveProjectId(record.id);
      setActiveProjectId(record.id);
      setActiveProject(record);
      applyProjectToEditor(record, plan.result.files, { navigate: true });
      setIsOpeningProject(false);
      toast.success(`Imported "${record.name}" as a new project.`);
    },
    [applyProjectToEditor, flushProjectSave],
  );

  const handleImportPlan = useCallback(
    (plan: ImportPlanType) => {
      if (plan.result.files.length === 0 && plan.detection.kind !== 'fullstack') {
        /*
         * Reached by the pickers as well as by a drop, so the wording stays
         * neutral about how the files arrived.
         */
        toast.error('No supported files were found. Expected .html, .css, .js, .jsx, .ts, .tsx, .vue or .json.');
        return;
      }

      /*
       * A single HTML/CSS/JS file dropped into a plain project needs no
       * ceremony: it routes straight to its panel. The review step exists to
       * catch a *mode change* the user did not ask for, and there is none here.
       */
      const isSingleCoreFile =
        /*
         * An import that becomes its own project never takes this shortcut, even
         * when it happens to hold one file: a folder containing only `index.html`
         * is still a folder the user asked to open, and it goes to review so the
         * project it creates is the one they confirmed.
         */
        !importShouldCreateProject(plan) &&
        plan.result.files.length === 1 &&
        plan.detection.kind === 'simple' &&
        fileProject.projectType === 'plain' &&
        ['html', 'css', 'javascript'].includes(plan.result.files[0].language);

      // Whichever surface started the import, it is finished with now.
      setShowImport(false);

      if (isSingleCoreFile) {
        handleImportResult({ ...plan.result, projectType: 'plain', entry: undefined });
        return;
      }

      setImportPlan(plan);
    },
    [fileProject.projectType, handleImportResult, importShouldCreateProject],
  );

  const {
    isDragging: isImportDragging,
    isPreparing: isImportPreparing,
    importFiles,
  } = useImportDrop({
    onPlan: handleImportPlan,
    onError: (message) => toast.error(message),
    // A drop while the review modal is open would race with the pending plan.
    disabled: importPlan !== null,
  });

  /** Applies a reviewed plan, honouring any override the user chose. */
  const handleConfirmImport = useCallback(
    (kind: DetectedKind) => {
      if (!importPlan) return;

      /*
       * A folder or archive becomes its own project, named after itself, and is
       * opened in whichever editor its detected kind calls for. Handled before the
       * branches below because those load files into the *current* session, which
       * is not what importing a project means.
       */
      if (importShouldCreateProject(importPlan)) {
        const plan = importPlan;
        setImportPlan(null);
        void createProjectFromImport(plan, kind);
        return;
      }

      /*
       * Full-stack: enter VS Code mode instead of loading the project into the
       * standard editors, which have nowhere to run a server. This is the only
       * path that pulls the full-stack chunk.
       */
      if (kind === 'fullstack') {
        setFullStackProject({
          projectType: 'plain',
          files: importPlan.result.files,
          entry: importPlan.result.entry,
        });
        setImportPlan(null);
        // Entering the mode is a navigation, not just a state change, so the URL
        // has to move with it or a refresh would land back in the editor.
        setIsVSCodeRoute(true);
        navigateTo(VSCODE_ROUTE);
        toast.success('Full-stack project detected — connect a Sandbox to run it.');
        return;
      }

      const projectType: ProjectType =
        kind === 'react' ? 'react' : kind === 'vue' ? 'vue' : 'plain';

      handleImportResult({
        ...importPlan.result,
        projectType,
        // A forced plain import has no module entry to open.
        entry: projectType === 'plain' ? undefined : importPlan.result.entry,
      });

      /*
       * Open the entry file so the import lands somewhere useful rather than on
       * an empty editor. Deferred a tick so the workspace sees the new files.
       */
      const entry = importPlan.result.entry;
      if (projectType !== 'plain' && entry) {
        setShowFileExplorer(true);
        setTimeout(() => workspace.openFile(entry), 0);
      }

      setImportPlan(null);
    },
    [
      importPlan,
      handleImportResult,
      workspace,
      importShouldCreateProject,
      createProjectFromImport,
    ],
  );

  /** Applies an edit made in VS Code mode. */
  const handleFullStackFileChange = useCallback((path: string, content: string) => {
    setFullStackProject((current) => {
      if (!current) return current;
      return {
        ...current,
        files: current.files.map((file) => (file.path === path ? { ...file, content } : file)),
      };
    });
  }, []);

  /**
   * Leaves VS Code mode without losing work: the edited files are handed to the
   * normal import path, so they land in the standard editor rather than being
   * discarded if detection was wrong.
   */
  const leaveVSCodeMode = useCallback(
    /**
     * `updateUrl` is false when the browser has *already* moved — a Back press
     * out of the mode. Pushing another entry there would fight the user's own
     * navigation and leave a history entry they have to press through twice.
     */
    ({ updateUrl }: { updateUrl: boolean }) => {
      const project = fullStackProject;
      const restore = vsCodeReturn;
      setFullStackProject(null);
      setVsCodeReturn(null);
      setIsVSCodeRoute(false);
      setIsRestoringWorkspace(false);
      /*
       * The stored copy is precisely what a refresh would reopen, so leaving has
       * to drop it. Queued behind any in-flight save by the store itself.
       *
       * Skipped when a project is open: that copy was never written in the first
       * place, and the project's own files must survive leaving the mode.
       */
      if (!activeProjectId) void clearWorkspace();
      if (updateUrl) navigateTo(EDITOR_ROUTE);

      /*
       * Nothing was ever loaded — someone opened `/ide` directly and left again.
       * There are no files to hand back, and importing an empty set would clear
       * the editor the user is about to return to.
       */
      if (!project || project.files.length === 0) return;

      handleImportResult({
        files: project.files,
        // Manual entries remember where they came from; auto-detected ones do not.
        projectType: restore?.projectType ?? 'plain',
        entry: restore?.entry,
        warnings: [],
      });
      toast.success('Left VS Code mode. Your files were kept.');
    },
    [fullStackProject, vsCodeReturn, handleImportResult, activeProjectId],
  );

  const handleExitFullStack = useCallback(
    () => leaveVSCodeMode({ updateUrl: true }),
    [leaveVSCodeMode],
  );

  /**
   * Adds files into the project already open in VS Code mode.
   *
   * Runs the *same* `buildImportPlan` pipeline as every other import path, so
   * extension filtering, `node_modules` pruning, zip expansion and folder
   * traversal all behave identically — then merges the result instead of
   * replacing the project, because the Explorer's Load/drop affordances mean "add
   * to what I am looking at", not "start again". Files at an existing path are
   * overwritten, which is what re-importing an edited file should do.
   */
  const handleAddToFullStackProject = useCallback(
    async (input: {
      files?: File[];
      entries?: unknown[];
      handles?: Promise<unknown>[];
      unreadableDirectories?: string[];
    }) => {
      try {
        const engine = await loadChunk(
          () => import('./services/import/importEngine'),
          'The import engine',
        );
        const plan = await engine.buildImportPlan(input);
        const incoming = plan.result.files;

        if (incoming.length === 0) {
          toast.error('No supported files were found in that drop.');
          return;
        }

        setFullStackProject((current) => {
          const byPath = new Map((current?.files ?? []).map((file) => [file.path, file]));
          for (const file of incoming) byPath.set(file.path, file);
          /*
           * `current` is null when the mode is open with nothing loaded — someone
           * arrived at the route directly and used the empty state's Load
           * buttons. That is a first import rather than a merge, so the project
           * is created here instead of the update being dropped.
           */
          return {
            projectType: current?.projectType ?? 'plain',
            entry: current?.entry ?? plan.result.entry,
            files: Array.from(byPath.values()),
          };
        });

        const existingPaths = new Set(fullStackProject?.files.map((file) => file.path) ?? []);
        const added = incoming.filter((file) => !existingPaths.has(file.path)).length;
        const replaced = incoming.length - added;
        toast.success(
          replaced > 0
            ? `Added ${added} file${added === 1 ? '' : 's'}, updated ${replaced}.`
            : `Added ${added} file${added === 1 ? '' : 's'}.`,
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Those files could not be added.');
      }
    },
    [fullStackProject],
  );

  /**
   * Manual switch into VS Code mode.
   *
   * The automatic route only fires for a detected full-stack import, but the
   * Sandbox and Terminal panels live exclusively in this mode — so a plain, React
   * or Vue project had no way to reach them. Reuses `fullStackProject` as "the
   * project currently open in VS Code mode" so the existing file-change and exit
   * wiring applies unchanged.
   */
  const handleEnterVSCodeMode = useCallback(() => {
    if (fullStackProject) return;

    if (fileProject.files.length === 0) {
      toast.error('Add or import some files before switching to VS Code mode.');
      return;
    }

    setVsCodeReturn({ projectType: fileProject.projectType, entry: fileProject.entry });
    setFullStackProject(fileProject);
    // A navigation, not just a state change — see the detected-import path above.
    setIsVSCodeRoute(true);
    navigateTo(VSCODE_ROUTE);
    toast.success('VS Code mode — connect a sandbox in the right-hand panel.');
  }, [fullStackProject, fileProject]);

  /*
   * Rebuilds the workspace after a refresh, or on a direct visit to the route.
   *
   * Files only. The sandbox is deliberately *not* restored: an E2B session does
   * not survive the page unloading and the client has no reattach API, so
   * reporting "Connected" would be a lie about a session that no longer exists.
   * The status bar reads the in-memory sandbox store, which starts empty, so it
   * says Local Mode on its own — which is the truth. The user's API key stays in
   * localStorage, so reconnecting is one click and needs no re-entry.
   */
  useEffect(() => {
    if (!isRestoringWorkspace) return;

    /*
     * A project owns its own files, so the standalone workspace copy must not be
     * read back over them. That copy still matters for `/ide` reached without a
     * project, which is why it is skipped here rather than removed.
     */
    if (activeProjectId) {
      setIsRestoringWorkspace(false);
      return;
    }

    let cancelled = false;
    const finish = () => {
      if (!cancelled) setIsRestoringWorkspace(false);
    };

    void loadWorkspace().then((stored) => {
      if (cancelled) return;

      if (stored && stored.files.length > 0) {
        setFullStackProject({
          projectType: stored.projectType,
          files: stored.files,
          entry: stored.entry,
        });
        // Restores "leaving returns this to React/Vue" across the refresh.
        if (stored.returnTo) setVsCodeReturn(stored.returnTo);
      }

      finish();
    }, finish);

    return () => {
      cancelled = true;
    };
  }, [isRestoringWorkspace, activeProjectId]);

  /*
   * Records the workspace as it changes, debounced so typing does not write on
   * every keystroke.
   *
   * The `isRestoringWorkspace` guard is load-bearing: without it the empty
   * starting state would be written over the stored workspace before the read
   * that is about to replace it has even resolved.
   */
  useEffect(() => {
    if (!isVSCodeRoute || isRestoringWorkspace) return;
    if (!fullStackProject || fullStackProject.files.length === 0) return;
    // With a project open, the project autosave is the one writer. Two writers for
    // the same files would each restore a different version on the next visit.
    if (activeProjectId) return;

    const timer = window.setTimeout(() => {
      void saveWorkspace(fullStackProject, vsCodeReturn);
    }, WORKSPACE_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [isVSCodeRoute, isRestoringWorkspace, fullStackProject, vsCodeReturn, activeProjectId]);

  /*
   * Back and Forward across the mode boundary.
   *
   * The app had no `popstate` listener at all, so without this the URL would
   * change on a Back press while the view stayed where it was.
   */
  useEffect(() => {
    const handlePopState = () => {
      if (isVSCodeModePath()) {
        setIsVSCodeRoute(true);
        /*
         * Forward into the mode after having left it. Leaving cleared the
         * in-memory project, so it has to be read back rather than assumed.
         */
        if (!fullStackProject) setIsRestoringWorkspace(true);
        return;
      }

      if (isVSCodeRoute) leaveVSCodeMode({ updateUrl: false });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isVSCodeRoute, fullStackProject, leaveVSCodeMode]);

  /** Opens a project from the dashboard. */
  const handleOpenProject = useCallback(
    async (record: ProjectRecord) => {
      // The project being left may have unsaved edits.
      await flushProjectSave();

      const [files, touched] = await Promise.all([
        readProjectFiles(record.id),
        touchProject(record.id),
      ]);
      const opened = touched ?? record;

      /*
       * A project with no files means its records were lost while its metadata
       * survived. Reopening into a blank editor would look like data corruption
       * with no explanation, so say so and start it from the standard scaffold.
       */
      const restored =
        files.length > 0 ? files : createPlainProject(defaultHTML, defaultCSS, defaultJS).files;
      if (files.length === 0) {
        toast.error(`"${opened.name}" had no files stored. Starting it fresh.`);
      }

      writeActiveProjectId(opened.id);
      setActiveProjectId(opened.id);
      setActiveProject(opened);
      setProjects((current) => [opened, ...current.filter((item) => item.id !== opened.id)]);
      applyProjectToEditor(opened, restored, { navigate: true });
      setIsOpeningProject(false);
    },
    [applyProjectToEditor, flushProjectSave],
  );

  /** Creates a project from the New Project modal and opens it. */
  const handleCreateProject = useCallback(
    async ({ name, editorStyle }: { name: string; editorStyle: EditorStyle }) => {
      await flushProjectSave();

      // A brand-new project starts from the same scaffold the editor used to open
      // with by default — that content is a starting point, not a landing page.
      const starter = createPlainProject(defaultHTML, defaultCSS, defaultJS);
      const record = await createProjectRecord({
        name,
        editorStyle,
        projectType: 'plain',
        files: starter.files,
      });

      if (!record) {
        toast.error('Could not create the project. This browser may be blocking local storage.');
        return;
      }

      setShowNewProject(false);
      setProjects((current) => [record, ...current]);
      writeActiveProjectId(record.id);
      setActiveProjectId(record.id);
      setActiveProject(record);
      applyProjectToEditor(record, starter.files, { navigate: true });
      setIsOpeningProject(false);
      toast.success(`Created "${record.name}".`);
    },
    [applyProjectToEditor, flushProjectSave],
  );

  const handleDeleteProject = useCallback(
    async (record: ProjectRecord) => {
      // Drop any queued write first, or a save for the project being deleted
      // could be flushed afterwards and recreate its files.
      if (pendingProjectSaveRef.current?.projectId === record.id) {
        pendingProjectSaveRef.current = null;
      }

      await deleteProjectRecord(record.id);
      setProjects((current) => current.filter((item) => item.id !== record.id));

      if (activeProjectId === record.id) {
        savedFilesRef.current = null;
        writeActiveProjectId(null);
        setActiveProjectId(null);
        setActiveProject(null);
      }

      toast.success(`Deleted "${record.name}".`);
    },
    [activeProjectId],
  );

  /** Leaves the active project and returns to the dashboard. */
  const handleReturnToDashboard = useCallback(async () => {
    await flushProjectSave();

    savedFilesRef.current = null;
    writeActiveProjectId(null);
    setActiveProjectId(null);
    setActiveProject(null);
    setFullStackProject(null);
    setVsCodeReturn(null);
    setIsVSCodeRoute(false);
    setIsRestoringWorkspace(false);
    navigateTo(EDITOR_ROUTE);

    // Re-read so the list reflects the lastOpenedAt just written.
    setProjects(await listProjects());
  }, [flushProjectSave]);

  /* The dashboard's list, loaded once. */
  useEffect(() => {
    void listProjects().then((list) => {
      setProjects(list);
      setIsProjectListLoading(false);
    });
  }, []);

  /*
   * Reopens whatever was active when the tab was last closed.
   *
   * Runs once: `isOpeningProject` starts true only when the pointer exists, so an
   * empty pointer goes straight to the dashboard with no async work at all.
   */
  useEffect(() => {
    if (!isOpeningProject) return;

    let cancelled = false;

    void (async () => {
      const id = readActiveProjectId();
      const record = id ? await getProject(id) : null;
      if (cancelled) return;

      if (!record) {
        /*
         * The pointer names a project that is gone — deleted in another tab, or
         * the database was cleared while this key survived. The dashboard is the
         * honest destination; an editor would have nothing to edit.
         */
        writeActiveProjectId(null);
        setActiveProjectId(null);
        setIsOpeningProject(false);
        return;
      }

      const [files, touched] = await Promise.all([
        readProjectFiles(record.id),
        touchProject(record.id),
      ]);
      if (cancelled) return;

      const opened = touched ?? record;
      setActiveProject(opened);
      setProjects((current) => [opened, ...current.filter((item) => item.id !== opened.id)]);
      if (files.length > 0) applyProjectToEditor(opened, files, { navigate: false });
      setIsOpeningProject(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Autosave. Records the pending state on every change and writes it once edits
   * settle.
   *
   * The files come from `fullStackProject` when VS Code mode owns them and from
   * `fileProject` otherwise, so both editors persist through one path rather than
   * each needing its own.
   */
  const projectFilesToPersist = fullStackProject?.files ?? fileProject.files;

  useEffect(() => {
    if (!activeProjectId || isOpeningProject) return;

    pendingProjectSaveRef.current = { projectId: activeProjectId, files: projectFilesToPersist };
    const timer = window.setTimeout(() => {
      void flushProjectSave();
    }, PROJECT_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeProjectId, isOpeningProject, projectFilesToPersist, flushProjectSave]);

  /*
   * Flush when the tab stops being visible.
   *
   * `visibilitychange` rather than `beforeunload`: it fires on tab switches and on
   * mobile backgrounding, where `beforeunload` is unreliable, and it is the last
   * moment an async write is still allowed to start.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') void flushProjectSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushProjectSave]);

  /*
   * Keeps the stored editor style honest.
   *
   * "Opens in its stored editor style" is only true if switching modes inside a
   * project updates the record. Done here rather than in the enter/exit handlers
   * so that feature's logic is left alone.
   */
  useEffect(() => {
    if (!activeProjectId || isOpeningProject || !activeProject) return;

    const style: EditorStyle = isVSCodeRoute ? 'vscode' : 'plain';
    if (activeProject.editorStyle === style) return;

    void updateProject(activeProjectId, { editorStyle: style }).then((updated) => {
      if (!updated) return;
      setActiveProject(updated);
      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    });
  }, [activeProjectId, isOpeningProject, isVSCodeRoute, activeProject]);

  /** Ctrl/Cmd+Shift+S — capture and save a PNG without opening the modal. */
  const handleQuickScreenshot = useCallback(async () => {
    try {
      const capture = await capturePreview(previewRef.current, { format: 'png' });
      downloadCapture(capture, captureFilename('png', project.currentProject?.name ?? 'gb-coder'));
      toast.success('Screenshot saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Screenshot failed.');
    }
  }, [project.currentProject?.name]);

  const handleOpenExport = useCallback((tab: 'screenshot' | 'export' | 'share' = 'screenshot') => {
    setExportModalTab(tab);
    setShowExportShare(true);
  }, []);

  useAppShortcuts({
    onOpenExport: () => handleOpenExport('export'),
    onOpenImport: () => setShowImport(true),
    onQuickScreenshot: handleQuickScreenshot,
    onSave: async () => {
      // Format-on-save functionality
      await Promise.all([
        handleFormatHtml(),
        handleFormatCss(),
        handleFormatJavascript()
      ]);
      toast.success('Code formatted on save.');
    },
    onOpenCommandPalette: () => setShowCommandPalette(true),
    onOpenShortcutsHelp: () => setShowKeyboardShortcuts(true),
  });

  const commandPaletteActions = [
    { id: 'new-file', title: 'New Project', section: 'Files', perform: () => setShowNewProject(true) },
    { id: 'open-project', title: 'Open Project', section: 'Files', perform: () => handleReturnToDashboard() },
    { id: 'format-all', title: 'Format All Files', section: 'Editor', perform: async () => {
        await Promise.all([handleFormatHtml(), handleFormatCss(), handleFormatJavascript()]);
        toast.success('Code formatted.');
      }
    },
    { id: 'build-ai', title: 'Build with AI', section: 'AI', perform: () => setShowBuildFromPrompt(true) },
    { id: 'explain-code', title: 'Explain Selected Code', section: 'AI', perform: () => handleSelectionOperation('explain') },
    { id: 'find-fix', title: 'Find and Fix', section: 'AI', perform: () => handleSelectionOperation('debug') },
    { id: 'optimize-code', title: 'Optimize Performance', section: 'AI', perform: () => handleSelectionOperation('optimize') },
    { id: 'enhance-design', title: 'Enhance Visual Design', section: 'AI', perform: () => handleSelectionOperation('improveUI') },
    { id: 'run-preview', title: 'Run Preview', section: 'Run', perform: () => setManualRunTrigger(prev => prev + 1) },
    { id: 'export-html', title: 'Export as HTML', section: 'Export', perform: () => handleOpenExport('export') },
    { id: 'export-zip', title: 'Export as ZIP', section: 'Export', perform: () => handleOpenExport('export') },
    { id: 'save-screenshot', title: 'Save Screenshot', section: 'Export', perform: () => handleQuickScreenshot() },
    { id: 'toggle-sidebar', title: 'Toggle Sidebar', section: 'View', perform: () => setIsNavDrawerOpen(!isNavDrawerOpen) },
    { id: 'open-templates', title: 'Open Templates Library', section: 'Navigation', perform: () => setShowTemplates(true) },
    { id: 'open-stats', title: 'Open Code Statistics', section: 'Navigation', perform: () => setShowStats(true) },
    { id: 'open-injection', title: 'Open Custom Code Injection', section: 'Navigation', perform: () => setShowInjectionManager(true) },
    { id: 'open-settings', title: 'Open Settings', section: 'Navigation', perform: () => setShowSettings(true) },
    { id: 'show-shortcuts', title: 'Show Keyboard Shortcuts', section: 'Help', perform: () => setShowKeyboardShortcuts(true) },
  ];

  /*
   * Self-contained share links (`#project=...`).
   *
   * The initial value is read in the state initializer above. This clears the
   * hash afterwards (so a refresh cannot silently revert later edits) and also
   * listens for `hashchange`, because pasting a share link into the current tab
   * is a same-document navigation that never remounts the app.
   */
  useEffect(() => {
    if (readShareLink()) {
      clearShareHash();
      toast.success('Opened a shared project.');
    }

    const onHashChange = () => {
      const shared = readShareLink();
      if (!shared) return;
      setFileProject(shared);
      clearShareHash();
      toast.success('Opened a shared project.');
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /** Pins a package version so it survives before the import is written. */
  const handlePinDependency = useCallback((name: string, version: string) => {
    setFileProject((current) => ({
      ...current,
      dependencies: { ...(current.dependencies ?? {}), [name]: version },
    }));
  }, []);

  const handleUnpinDependency = useCallback((name: string) => {
    setFileProject((current) => {
      const { [name]: removed, ...rest } = current.dependencies ?? {};
      void removed;
      return { ...current, dependencies: rest };
    });
  }, []);

  const handleNewProject = useCallback((projectType: ProjectType) => {
    setFileProject((current) => {
      if (current.projectType === projectType) return current;

      /*
       * Returning to plain mode restores the exact files the user last had
       * there. Deriving them from the framework project instead would hand back
       * an empty index.html, silently destroying their work.
       */
      if (projectType === 'plain') {
        return lastPlainProjectRef.current ?? createPlainProject(defaultHTML, defaultCSS, defaultJS);
      }

      return createProjectOfType(projectType);
    });
    clearConsole();
    toast.success(`Started a new ${PROJECT_TYPE_LABEL[projectType]} project.`);
  }, []);

  const handleCommand = async (command: string) => {
    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case 'run':
        clearConsole();
        break;
      case 'clear':
        clearConsoleLogs();
        break;
      case 'download':
        void handleExportZip();
        break;
      case 'theme': {
        const newTheme = args[0] === 'light' ? 'light' : 'dark';
        updateSettings({ theme: newTheme });
        break;
      }
      case 'toggle':
        if (args[0] === 'theme') {
          updateSettings({ theme: isDark ? 'light' : 'dark' });
        }
        break;
      case 'history':
        setCurrentView('history');
        break;
      case 'editor':
        setCurrentView('editor');
        break;
      case 'about':
        setCurrentView('about');
        break;
      case 'documentation':
      case 'docs':
        setCurrentView('documentation');
        break;
      case 'autosave':
        if (args[0] === 'toggle') {
          setAutoSaveEnabled(!autoSaveEnabled);
        }
        break;
      default:
        break;
    }
  };

  const saveSnippet = (name: string, htmlCode: string, cssCode: string, jsCode: string, description?: string, tags?: string[], category?: string, type?: SnippetType, scope?: SnippetScope) => {
    const snippet: CodeSnippet = {
      id: crypto.randomUUID(),
      name,
      description,
      html: htmlCode,
      css: cssCode,
      javascript: jsCode,
      createdAt: new Date().toISOString(),
      tags,
      category,
      type: type || 'full',
      scope: scope || 'private',
    };
    setSnippets(prev => [...prev, snippet]);
  };

  const updateSnippet = (id: string, updates: Partial<CodeSnippet>) => {
    setSnippets(prev => prev.map(snippet =>
      snippet.id === id
        ? { ...snippet, ...updates, updatedAt: new Date().toISOString() }
        : snippet
    ));
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    codeHistory.saveState({ html, css, javascript }, `Loaded snippet: ${snippet.name}`);

    setHtml(snippet.html);
    setCss(snippet.css);
    setJavascript(snippet.javascript);
    clearConsole();
  };





  // NEW: Insert snippet (append to editors)
  const insertSnippet = (snippet: CodeSnippet) => {
    codeHistory.saveState({ html, css, javascript }, `Inserted snippet: ${snippet.name}`);

    // Insert based on snippet type
    const snippetType = snippet.type || 'full';
    switch (snippetType) {
      case 'html':
        setHtml(prev => prev + '\n' + snippet.html);
        break;
      case 'css':
        setCss(prev => prev + '\n' + snippet.css);
        break;
      case 'javascript':
        setJavascript(prev => prev + '\n' + snippet.javascript);
        break;
      case 'full':
        // For full snippets, append all non-empty sections
        if (snippet.html) setHtml(prev => prev + '\n' + snippet.html);
        if (snippet.css) setCss(prev => prev + '\n' + snippet.css);
        if (snippet.javascript) setJavascript(prev => prev + '\n' + snippet.javascript);
        break;
    }

    clearConsole();
  };
  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const handleClearAll = async () => {
    // Save current state to history before clearing
    codeHistory.saveState({ html, css, javascript }, 'Clear all code');

    // Clear all code completely
    setHtml('');
    setCss('');
    setJavascript('');
    clearConsole();

    // Clear auto-save data
    localStorage.removeItem('gb-coder-autosave');
    if (project.currentProject) {
      localStorage.removeItem(`gb-coder-project-autosave-${project.currentProject.id}`);
    }

    // Reset project name if exists
    if (project.currentProject) {
      await project.updateProjectName('Untitled Project');
    }
  };

  // History Panel Handlers
  const handleJumpToSnapshot = (snapshotId: string) => {
    const state = codeHistory.jumpToSnapshot(snapshotId);
    if (state) {
      setHtml(state.html);
      setCss(state.css);
      setJavascript(state.javascript);
    }
  };

  const handleCreateSnapshot = () => {
    codeHistory.createSnapshot();
  };

  // Format handlers
  const handleFormatHtml = async () => {
    setFormatLoadingStates(prev => ({ ...prev, html: true }));
    try {
      const result = await formattingService.formatCode(html, 'html');
      if (result.success && result.formattedCode !== html) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted HTML');
        setHtml(result.formattedCode);
      } else if (result.error) {
        console.error('HTML formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format HTML:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, html: false }));
    }
  };

  const handleFormatCss = async () => {
    setFormatLoadingStates(prev => ({ ...prev, css: true }));
    try {
      const result = await formattingService.formatCode(css, 'css');
      if (result.success && result.formattedCode !== css) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted CSS');
        setCss(result.formattedCode);
      } else if (result.error) {
        console.error('CSS formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format CSS:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, css: false }));
    }
  };

  const handleFormatJavascript = async () => {
    setFormatLoadingStates(prev => ({ ...prev, javascript: true }));
    try {
      const result = await formattingService.formatCode(javascript, 'javascript');
      if (result.success && result.formattedCode !== javascript) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted JavaScript');
        setJavascript(result.formattedCode);
      } else if (result.error) {
        console.error('JavaScript formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format JavaScript:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, javascript: false }));
    }
  };

  // ===== NEW FEATURES HANDLERS =====
  const handleLoadTemplate = useCallback((payload: any, meta: any) => {
    // If it's a multi-file template
    if (payload.files) {
      const newProject: MultiFileProject = {
        projectType: meta.projectType || 'plain',
        files: payload.files,
        id: crypto.randomUUID(),
        name: meta.name
      };
      setFileProject(newProject);
    } else {
      // Legacy or single-file payload
      codeHistory.saveState({ html, css, javascript }, `Loaded template: ${meta?.name || 'Unknown'}`);
      setHtml(payload.html || '');
      setCss(payload.css || '');
      setJavascript(payload.javascript || '');
    }
  }, [html, css, javascript, setFileProject, setHtml, setCss, setJavascript, codeHistory]);

  const handleBuildFromPrompt = useCallback(async (newHtml: string, newCss: string, newJavascript: string) => {
    setDiffData({
      isOpen: true,
      title: 'Review Build with AI',
      files: [
        { path: 'index.html', original: html, suggested: newHtml, language: 'html' },
        { path: 'styles.css', original: css, suggested: newCss, language: 'css' },
        { path: 'script.js', original: javascript, suggested: newJavascript, language: 'javascript' },
      ],
      onApplyFile: (path: string) => {
        if (path === 'index.html') setHtml(newHtml);
        if (path === 'styles.css') setCss(newCss);
        if (path === 'script.js') setJavascript(newJavascript);
      },
      onApplyAll: () => {
        codeHistory.saveState({ html, css, javascript }, 'Built from prompt');
        clearConsole();
        setHtml(newHtml);
        setCss(newCss);
        setJavascript(newJavascript);
        toast.success('Built from prompt! Edit freely or generate again.');
        setDiffData(null);
      }
    });
  }, [html, css, javascript, codeHistory, clearConsole]);

  const loadInjections = useCallback(() => {
    setCustomInjections(customInjectionService.getCustomInjections(project.currentProject?.id));
  }, [project.currentProject?.id]);

  useEffect(() => {
    loadInjections();
  }, [loadInjections]);

  const handleUpdateInjections = useCallback(() => {
    loadInjections();
  }, [loadInjections]);

  // Selection Operation Handlers
  const handleSelectionChange = useCallback((editor: any, language: EditorLanguage) => {
    updateSelection(editor, language);
  }, [updateSelection]);

  const handleSelectionOperation = useCallback(async (operation: SelectionOperationType) => {
    if (!hasSelection || !selection.code || !selection.language) return;

    // Always send the FULL contents of all three files so the AI can see
    // cross-file dependencies. `selection.fullFileCode` comes straight from the
    // Monaco model, so it is the freshest copy of the targeted file.
    /*
     * For a plain project the three fixed files are the whole context. For a
     * React/Vue project the AI gets every file plus which one is focused, so it
     * can reason about imports between them rather than a single snippet.
     */
    const isFrameworkProject = fileProject.projectType !== 'plain';

    const projectContext = {
      html: selection.language === 'html' ? selection.fullFileCode : html,
      css: selection.language === 'css' ? selection.fullFileCode : css,
      javascript: selection.language === 'javascript' ? selection.fullFileCode : javascript,
      ...(isFrameworkProject
        ? {
            projectType: fileProject.projectType,
            activePath: workspace.activePath ?? undefined,
            files: fileProject.files.map((file) => ({
              path: file.path,
              language: file.language,
              content: file.content,
            })),
          }
        : {}),
    };

    try {
      const result = await selectionOps.executeOperation(operation, selection.code, selection.language, projectContext);

      // Save to history if successful
      if (result) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          operation: operation,
          language: selection.language,
          codePreview: selection.code.substring(0, 100) + (selection.code.length > 100 ? '...' : ''),
          result: result
        };
        setSelectionHistory(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error('[App] Operation failed:', error);
    }
  }, [hasSelection, selection, selectionOps, html, css, javascript, fileProject, workspace.activePath]);

  const handleApplySelectionChanges = useCallback((newCode: string) => {
    const activeResult = selectionOps.result;

    if (!activeResult || typeof newCode !== 'string' || !newCode.trim()) {
      toast.error('Nothing to apply — the AI returned no code.');
      return;
    }

    // The AI reports which file its code belongs to. Only a same-file result
    // paired with a live selection may be applied as a range replacement;
    // anything else is a complete file replacement.
    const targetFile: EditorLanguage = activeResult.targetFile || selection.language || 'html';
    const canReplaceSelection =
      activeResult.appliesToSelection !== false &&
      targetFile === selection.language &&
      !!selection.editorInstance &&
      !!selection.range;

    const originalContent = canReplaceSelection ? (selection.code || '') : (targetFile === 'html' ? html : targetFile === 'css' ? css : javascript);

    setDiffData({
      isOpen: true,
      title: `Review: ${activeResult.operation}`,
      files: [{
        path: targetFile === 'html' ? 'index.html' : targetFile === 'css' ? 'styles.css' : 'script.js',
        original: originalContent,
        suggested: newCode,
        language: targetFile,
      }],
      onApplyFile: () => {}, // Handled by applyAll for single file
      onApplyAll: () => {
        codeHistory.saveState({ html, css, javascript }, `Applied ${activeResult.operation}`);

        if (canReplaceSelection) {
          const success = monacoHelper.replaceSelectedCode(selection.editorInstance!, newCode, selection.range!);

          if (!success) {
            toast.error('Could not apply the change to the editor.');
            return;
          }
        } else {
          // Whole-file replacement — including the cross-file case where the real
          // fix lives in a file the user did not have selected.
          const setterByFile: Record<EditorLanguage, (value: string) => void> = {
            html: setHtml,
            css: setCss,
            javascript: setJavascript,
          };

          setterByFile[targetFile](newCode);

          if (targetFile !== selection.language) {
            toast.success(`Applied to the ${targetFile.toUpperCase()} file — that is where the fix belonged.`);
          }
        }

        clearSelection();
        selectionOps.clearResult();
        setDiffData(null);
      }
    });
  }, [selection, selectionOps, codeHistory, html, css, javascript, clearSelection]);

  const handleCloseSelectionResult = useCallback(() => {
    selectionOps.clearResult();
  }, [selectionOps]);

  /* ===================================================================== */
  /* ===== VOICE COMMANDS ================================================ */
  /* ===================================================================== */

  /**
   * Every voice action below has an equivalent button, menu item, or shortcut
   * elsewhere in the app. Voice is an additional way in, never the only one.
   */

  /** Opens Build with AI on a spoken description, awaiting confirmation. */
  const openVoiceBuild = useCallback((promptText: string) => {
    setVoiceBuildPrompt(promptText);
    setShowBuildFromPrompt(true);
  }, []);

  /** "Export as PNG / JPEG / SVG / HTML / ZIP", plus CodePen and JSFiddle. */
  const runVoiceExport = useCallback(
    async (target: VoiceExportTarget) => {
      switch (target) {
        case 'png':
          await handleQuickScreenshot();
          voiceCommandService.speak('Screenshot saved');
          return;
        case 'jpeg':
        case 'svg':
          try {
            const capture = await capturePreview(previewRef.current, { format: target });
            downloadCapture(
              capture,
              captureFilename(target, project.currentProject?.name ?? 'gb-coder'),
            );
            toast.success(`Saved ${target.toUpperCase()}.`);
            voiceCommandService.speak('Export complete');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Capture failed.');
            voiceCommandService.speak('Export failed');
          }
          return;
        case 'html':
          /*
           * A multi-file project cannot collapse into one .html file, so it
           * falls back to the ZIP that preserves its structure.
           */
          if (fileProject.projectType !== 'plain') {
            toast.success('Multi-file projects export as a ZIP — building it now.');
            await handleExportZip();
            return;
          }
          try {
            const standalone = buildStandaloneHtml(fileProject, {
              projectName: project.currentProject?.name ?? 'GB Coder Project',
              externalLibraries,
            });
            downloadBlob(
              standalone,
              htmlFilename(project.currentProject?.name),
              'text/html;charset=utf-8',
            );
            toast.success('Exported standalone HTML.');
            voiceCommandService.speak('Export complete');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Export failed.');
            voiceCommandService.speak('Export failed');
          }
          return;
        case 'zip':
          await handleExportZip();
          voiceCommandService.speak('Export complete');
          return;
        case 'codepen':
        case 'jsfiddle':
          // These need a user gesture on a real form/window, so hand off to the
          // Share tab rather than trying to pop a blocked window.
          handleOpenExport('share');
          toast.success(`Open ${target === 'codepen' ? 'CodePen' : 'JSFiddle'} from the Share tab.`);
          return;
        default:
          handleOpenExport('export');
      }
    },
    [
      handleQuickScreenshot,
      handleExportZip,
      handleOpenExport,
      fileProject,
      externalLibraries,
      project.currentProject?.name,
    ],
  );

  /** "Open templates / settings / statistics / …" */
  const runVoiceOpen = useCallback(
    (target: VoiceModalTarget) => {
      switch (target) {
        case 'templates':
          setShowTemplates(true);
          return 'Templates';
        case 'settings':
          setShowSettings(true);
          return 'Settings';
        case 'statistics':
          setShowStats(true);
          return 'Statistics';
        case 'export':
          handleOpenExport('export');
          return 'Export';
        case 'share':
          handleOpenExport('share');
          return 'Share';
        case 'import':
          setShowImport(true);
          return 'Import';
        case 'history':
          setCurrentView('history');
          return 'History';
        case 'snippets':
          setShowSnippets(true);
          return 'Snippets';
        case 'ai-chat':
          setShowAIChat(true);
          return 'AI Chat';
        case 'shortcuts':
          setShowKeyboardShortcuts(true);
          return 'Keyboard shortcuts';
        case 'dependencies':
          setShowDependencies(true);
          return 'Dependencies';
        case 'libraries':
          setShowExternalLibraryManager(true);
          return 'External libraries';
        case 'extensions':
          setShowExtensionsMarketplace(true);
          return 'Extensions';
        case 'injection':
          setShowInjectionManager(true);
          return 'Custom injection';
        case 'voice':
          setShowVoiceCommands(true);
          return 'Voice commands';
        default:
          return null;
      }
    },
    [handleOpenExport],
  );

  /** "New file" / "Create a new file called utils.js" */
  const runVoiceNewFile = useCallback(
    (spokenPath?: string) => {
      if (fileProject.projectType === 'plain') {
        toast.error('Single-file projects have a fixed HTML, CSS and JS set. Start a React or Vue project to add files.');
        voiceCommandService.speak('New files need a React or Vue project');
        return;
      }

      const path = spokenPath?.trim() || nextVoiceFilePath(fileProject);
      const result = workspace.createFile(path);

      if (!result.ok) {
        toast.error(result.error ?? `Could not create ${path}.`);
        voiceCommandService.speak('Could not create the file');
        return;
      }

      toast.success(`Created ${path}.`);
      voiceCommandService.speak('File created');
    },
    [fileProject, workspace],
  );

  /** Copies the runnable single-file bundle to the clipboard. */
  const runVoiceCopy = useCallback(async () => {
    try {
      const standalone = buildStandaloneHtml(fileProject, {
        projectName: project.currentProject?.name ?? 'GB Coder Project',
        externalLibraries,
      });
      await navigator.clipboard.writeText(standalone);
      toast.success('Copied the full page to the clipboard.');
      voiceCommandService.speak('Copied');
    } catch {
      toast.error('Clipboard access was blocked by the browser.');
      voiceCommandService.speak('Copy failed');
    }
  }, [fileProject, externalLibraries, project.currentProject?.name]);

  /**
   * Central dispatcher for the `voice-command` event. Reads live values from the
   * render scope, so it is re-created every render and reached through a ref
   * (below) to keep a single, permanent event listener.
   */
  /*
   * Deliberately not memoized: it is only ever reached through the ref below,
   * so a stable identity would buy nothing while risking stale reads of
   * `handleCommand` and the formatters, which are plain per-render functions.
   */
  const handleVoiceCommandDetail = async (detail: VoiceCommandDetail) => {
    const { action, param } = detail;

    // Selection-driven AI operations share one guard and one code path.
    const selectionOperation = VOICE_SELECTION_OPERATIONS[action];
    if (selectionOperation) {
      if (!hasSelection || !selection.code) {
        toast.error(`Select some code first, then say it again to ${VOICE_SELECTION_LABELS[action]}.`);
        voiceCommandService.speak('Error: no code selected');
        return;
      }
      await handleSelectionOperation(selectionOperation);
      return;
    }

    switch (action) {
      case 'run':
        await handleCommand('run');
        toast.success('Running code.');
        voiceCommandService.speak('Running code');
        return;

      case 'build_open':
        // No transcript to seed — open the modal as the button would.
        setVoiceBuildPrompt('');
        setShowBuildFromPrompt(true);
        voiceCommandService.speak('Build with AI is open');
        return;

      case 'build':
        if (!param) return;
        openVoiceBuild(toPromptText(param));
        voiceCommandService.speak('Review the prompt, then generate');
        return;

      case 'build_followup': {
        if (!param) return;
        /*
         * Refinements extend the prompt in place when one is being composed;
         * otherwise the phrase stands alone as a fresh prompt. Either way the
         * user still confirms in the modal before anything is generated.
         */
        const addition = toPromptText(param);
        setVoiceBuildPrompt((current) => {
          const base = current.trim();
          if (!base) return addition;
          return `${base.replace(/[.!?]+$/, '')}. ${addition}`;
        });
        setShowBuildFromPrompt(true);
        voiceCommandService.speak('Prompt updated');
        return;
      }

      case 'export':
        await runVoiceExport((param as VoiceExportTarget) ?? 'png');
        return;

      case 'save_project':
        await handleExportZip();
        voiceCommandService.speak('Project saved');
        return;

      case 'open_modal': {
        const opened = runVoiceOpen(param as VoiceModalTarget);
        if (!opened) {
          toast.error(UNRECOGNIZED_MESSAGE);
          return;
        }
        toast.success(`Opened ${opened}.`);
        voiceCommandService.speak(`${opened} open`);
        return;
      }

      case 'new_file':
        runVoiceNewFile(param);
        return;

      case 'clear_console':
        clearConsoleLogs();
        toast.success('Console cleared.');
        voiceCommandService.speak('Console cleared');
        return;

      case 'format':
        await handleFormatHtml();
        await handleFormatCss();
        await handleFormatJavascript();
        voiceCommandService.speak('Code formatted');
        return;

      case 'copy':
        await runVoiceCopy();
        return;

      case 'toggle_theme': {
        const nextTheme =
          param === 'dark' || param === 'light' ? param : isDark ? 'light' : 'dark';
        updateSettings({ theme: nextTheme });
        toast.success(`Switched to ${nextTheme} theme.`);
        voiceCommandService.speak(`${nextTheme} theme`);
        return;
      }

      case 'open_panel': {
        const target = (param as VoicePanelTarget) ?? 'console';
        setRightPanelRequest({ tab: target, nonce: Date.now() });
        toast.success(`Opened the ${target} panel.`);
        voiceCommandService.speak(`${target} open`);
        return;
      }

      case 'validate_now':
        setRightPanelRequest({ tab: 'validator', nonce: Date.now() });
        validation.revalidate();
        toast.success('Re-running validation.');
        voiceCommandService.speak('Checking your code');
        return;

      case 'open_file': {
        if (!param) return;
        /*
         * Normalization lower-cases everything, so the spoken name is matched
         * against real paths case-insensitively rather than guessing casing.
         */
        const wanted = param.toLowerCase();
        const target = fileProject.files.find((file) => {
          const path = file.path.toLowerCase();
          return path === wanted || path.endsWith(`/${wanted}`);
        });

        if (!target) {
          toast.error(`No file matching "${param}".`);
          voiceCommandService.speak('File not found');
          return;
        }
        if (fileProject.projectType === 'plain') {
          toast.success(`${target.path} is already open below.`);
          return;
        }
        workspace.openFile(target.path);
        toast.success(`Opened ${target.path}.`);
        voiceCommandService.speak('File open');
        return;
      }

      case 'undo': {
        const restored = codeHistory.undo();
        if (!restored) {
          toast.error('Nothing left to undo.');
          voiceCommandService.speak('Nothing to undo');
          return;
        }
        setHtml(restored.html);
        setCss(restored.css);
        setJavascript(restored.javascript);
        toast.success('Undone.');
        voiceCommandService.speak('Undone');
        return;
      }

      case 'redo': {
        const restored = codeHistory.redo();
        if (!restored) {
          toast.error('Nothing to redo.');
          voiceCommandService.speak('Nothing to redo');
          return;
        }
        setHtml(restored.html);
        setCss(restored.css);
        setJavascript(restored.javascript);
        toast.success('Redone.');
        voiceCommandService.speak('Redone');
        return;
      }

      case 'share_link':
        handleOpenExport('share');
        toast.success('Create a share link from the Share tab.');
        voiceCommandService.speak('Share options open');
        return;

      case 'set_language': {
        // The service already swapped the recognition instance; persist it.
        if (param) updateSettings({ voiceLanguage: param });
        return;
      }

      case 'start_listening':
        setShowVoiceCommands(true);
        return;

      case 'sandbox_connect':
      case 'sandbox_stop':
        /*
         * Registered so the vocabulary is complete, but the sandbox layer does
         * not exist yet. Saying so is better than appearing to work.
         */
        toast.error('Sandbox mode is not available yet.');
        voiceCommandService.speak('Sandbox mode is not available yet');
        return;

      case 'help':
        setShowVoiceCommands(true);
        voiceCommandService.speak('Here are the commands');
        return;

      case 'unrecognized':
        toast.error(UNRECOGNIZED_MESSAGE);
        return;

      default:
        return;
    }
  };

  /*
   * A ref keeps exactly one listener attached for the app's lifetime while the
   * handler itself always sees fresh state. Re-subscribing on every dependency
   * change would risk dropping an event mid-command.
   */
  const voiceHandlerRef = useRef(handleVoiceCommandDetail);
  useEffect(() => {
    voiceHandlerRef.current = handleVoiceCommandDetail;
  });

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<VoiceCommandDetail>).detail;
      if (!detail) return;
      void voiceHandlerRef.current(detail);
    };

    window.addEventListener('voice-command', listener);
    return () => window.removeEventListener('voice-command', listener);
  }, []);

  /*
   * Every recognition attempt is mirrored into the Console tab at INFO level, so
   * a misfire can be diagnosed from inside the app rather than from devtools.
   */
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<VoiceAttemptDetail>).detail;
      if (!detail) return;

      const confidence = `${Math.round(detail.score * 100)}%`;
      const resolved =
        detail.action === null
          ? 'no match'
          : `${detail.action}${detail.param ? `(${detail.param})` : ''}`;

      appendConsoleText(
        'info',
        `[voice] "${detail.transcript}" -> ${resolved} · ${confidence} · ${detail.outcome}` +
          (detail.matchedPhrase ? ` · matched "${detail.matchedPhrase}"` : ''),
        'voice',
      );
    };

    window.addEventListener('voice-attempt', listener);
    return () => window.removeEventListener('voice-attempt', listener);
  }, [appendConsoleText]);

  /**
   * Settings own the voice preferences; the service is told about changes.
   *
   * Language is reconciled rather than pushed on the first pass. The service
   * restores its own persisted language in its constructor, so blindly applying
   * the settings value here would overwrite a restored choice with the default
   * on every reload.
   */
  const voiceLanguageReconciled = useRef(false);
  useEffect(() => {
    voiceCommandService.setVoiceFeedback(settings.voiceFeedback);
    voiceCommandService.setContinuous(settings.voiceContinuous);

    if (!voiceLanguageReconciled.current) {
      voiceLanguageReconciled.current = true;
      const restored = voiceCommandService.getState().language;
      if (restored && restored !== settings.voiceLanguage) {
        updateSettings({ voiceLanguage: restored });
        return;
      }
    }

    voiceCommandService.setLanguage(settings.voiceLanguage);
  }, [settings.voiceFeedback, settings.voiceContinuous, settings.voiceLanguage, updateSettings]);

  /*
   * Gated voice actions. The sandbox layer does not exist yet, so those commands
   * stay out of the advertised list until a connector registers.
   */
  useEffect(() => {
    voiceCommandService.setCapabilities({ sandbox: sandboxTerminal.isAvailable() });
    return sandboxTerminal.subscribe((available) => {
      voiceCommandService.setCapabilities({ sandbox: available });
    });
  }, []);

  /** Toolbar mic: opens the overlay and starts listening, or stops it. */
  const handleToggleVoice = useCallback(() => {
    if (voiceState.isListening) {
      voiceCommandService.stopListening();
      return;
    }

    /*
     * Opening the overlay auto-starts listening, but if it is *already* open and
     * merely paused (single-command mode stops after each command), setting the
     * same state changes nothing and the mic would stay off. Start it explicitly.
     */
    if (showVoiceCommands) {
      voiceCommandService.startListening();
      return;
    }
    setShowVoiceCommands(true);
  }, [voiceState.isListening, showVoiceCommands]);


  // Render standalone live-preview share page (/preview/:id) - must come
  // first so it bypasses all editor chrome.
  if (currentView === 'preview-share') {
    return (
      <Suspense fallback={<LazyFallback label="shared preview" variant="overlay" />}>
  <PreviewSharePage
          html={previewShareCode?.html || ''}
          css={previewShareCode?.css || ''}
          javascript={previewShareCode?.javascript || ''}
          shortId={previewShortId}
          isLoading={previewLoading}
          error={previewError}
        />
      </Suspense>
    );
  }

  if (currentView === 'preview-share-error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] p-6 text-center text-gray-100">
        <div className="max-w-md">
          <h1 className="mb-3 text-[22px] font-semibold">Invalid preview link</h1>
          <p className="mb-6 text-sm text-gray-400">The code could not be loaded.</p>
          <a
            href="https://code.ladestack.in"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-blue-600"
          >
            Open LadeStack Coder
          </a>
        </div>
      </div>
    );
  }

  // Render about page
  if (currentView === 'about') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                History
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading About Page...</p>
              </div>
            </div>
          }>
            <AboutPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />

        {/* External Library Manager for About page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render documentation page
  if (currentView === 'documentation') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                About
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading Documentation...
                </p>
              </div>
            </div>
          }>
            <DocumentationPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />

        {/* External Library Manager for Documentation page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render history view
  if (currentView === 'history') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                History
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading History...</p>
              </div>
            </div>
          }>
            <CodeHistoryPage selectionHistory={selectionHistory} />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />

        {/* External Library Manager for History page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render Privacy Policy page
  if (currentView === 'privacy') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Privacy Policy...</div>}>
            <PrivacyPolicyPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />
      </div>
    );
  }

  // Render Terms of Service page
  if (currentView === 'terms') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Terms of Service...</div>}>
            <TermsOfServicePage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />
      </div>
    );
  }

  // Render Cookie Policy page
  if (currentView === 'cookies') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Cookie Policy...</div>}>
            <CookiePolicyPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />
      </div>
    );
  }

  // Render Disclaimer page
  if (currentView === 'disclaimer') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Disclaimer...</div>}>
            <DisclaimerPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />
      </div>
    );
  }

  // Render Contact page
  if (currentView === 'contact') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
              onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
            onClear={handleClearAll}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-3 py-1.5 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Contact...</div>}>
            <ContactPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} />
      </div>
    );
  }

  // Render main editor view
  /*
   * Full-stack projects get the VS Code style mode. Returned before the standard
   * editor view so the multi-panel layout is bypassed entirely — the other
   * project modes are completely unaffected by this branch.
   */
  /*
   * Chosen by the *route*, not by whether a project happens to be in memory —
   * that is what lets a refresh land back here. `fullStackProject` is still
   * honoured alongside it so any existing way into the mode keeps working even if
   * it did not move the URL.
   */
  if (isVSCodeRoute || fullStackProject) {
    return (
      /*
       * No NavigationBar here, deliberately. VS Code mode is a full-screen shell
       * with its own top bar, so the app's normal chrome would be a second,
       * redundant header eating vertical space. `overflow-hidden` on a `h-screen`
       * box is what stops the page itself from scrolling, which is the
       * precondition for the mode's four independent scroll regions.
       */
      <div className="flex h-screen flex-col overflow-hidden bg-vsc-editor">
        <div className="min-h-0 flex-1">
          {isRestoringWorkspace ? (
            /*
             * The stored workspace is still being read. A loading state rather
             * than the mode's empty state, because "No project loaded" would be
             * wrong for a workspace that is one tick from appearing — and a
             * message that contradicts itself a moment later is worse than a
             * spinner.
             */
            <LazyFallback label="Restoring your workspace" variant="panel" />
          ) : (
            <Suspense fallback={<LazyFallback label="VS Code mode" variant="panel" />}>
              <VSCodeMode
                project={fullStackProject ?? EMPTY_VSCODE_PROJECT}
                entryReason={vsCodeReturn ? 'manual' : 'detected'}
                onChangeFile={handleFullStackFileChange}
                onExit={handleExitFullStack}
                onAddImport={handleAddToFullStackProject}
                onOpenDependencies={() => setShowDependencies(true)}
                onOpenAIChat={() => setShowAIChat(true)}
                onOpenVoiceCommands={() => setShowVoiceCommands(true)}
                onOpenProjects={() => void handleReturnToDashboard()}
                fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
                fontSize={settings.editorFontSize}
              />
            </Suspense>
          )}
        </div>

        {/*
          The same panels the standard layout uses, rendered here too because this
          branch returns before them. Reached from the mode's icon-only top bar.
          Overlays rather than embedded tabs: these are built as full-screen
          dialogs owned by App, and re-housing them would mean rebuilding them.
        */}
        {showDependencies && (
          <Suspense fallback={null}>
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-l border-vsc-border bg-vsc-sidebar shadow-elevated">
              <DependenciesPanel
                project={fullStackProject ?? EMPTY_VSCODE_PROJECT}
                resolvedPackages={projectBundle.resolvedPackages}
                unresolvedPackages={projectBundle.unresolvedPackages}
                isResolving={projectBundle.isResolvingPackages}
                onPin={handlePinDependency}
                onUnpin={handleUnpinDependency}
                onClose={() => setShowDependencies(false)}
              />
            </div>
          </Suspense>
        )}

        {showAIChat && (
          <Suspense fallback={null}>
            <AIChatAssistant
              isOpen={showAIChat}
              onClose={() => setShowAIChat(false)}
              html={html}
              css={css}
              javascript={javascript}
              externalLibraries={externalLibraries}
            />
          </Suspense>
        )}

        {showVoiceCommands && (
          <Suspense fallback={null}>
            <VoiceCommandPanel
              isOpen={showVoiceCommands}
              onClose={() => setShowVoiceCommands(false)}
              onVoiceFeedbackChange={(enabled) => updateSettings({ voiceFeedback: enabled })}
              onContinuousChange={(enabled) => updateSettings({ voiceContinuous: enabled })}
              onLanguageChange={(language) => updateSettings({ voiceLanguage: language })}
            />
          </Suspense>
        )}

        <Toaster position="bottom-right" />
      </div>
    );
  }

  /*
   * The dashboard, shown whenever no project is active.
   *
   * Placed after the VS Code branch deliberately: `/ide` addresses that mode
   * directly and has its own empty state, so arriving there must not be redirected
   * into the dashboard.
   *
   * Drag-and-drop stays live here — the window-level import handlers are attached
   * by `useImportDrop`, not by the editor's markup — so a folder can be dropped
   * straight onto the dashboard to start a project.
   */
  if (!activeProjectId) {
    return (
      <>
        <DropZoneOverlay isDragging={isImportDragging} isPreparing={isImportPreparing} />

        <ProjectDashboard
          projects={projects}
          isLoading={isProjectListLoading}
          onCreate={() => setShowNewProject(true)}
          onOpen={(record) => void handleOpenProject(record)}
          onDelete={(record) => void handleDeleteProject(record)}
          onImport={() => setShowImport(true)}
        />

        {showNewProject && (
          <Suspense fallback={<LazyFallback label="new project" variant="overlay" />}>
            <NewProjectModal
              suggestedName={suggestProjectName(projects)}
              onCancel={() => setShowNewProject(false)}
              onCreate={(input) => void handleCreateProject(input)}
            />
          </Suspense>
        )}

        {showImport && (
          <Suspense fallback={<LazyFallback label="Import" variant="overlay" />}>
            <ImportModal
              isOpen={showImport}
              onClose={() => setShowImport(false)}
              onFiles={importFiles}
              isDragging={isImportDragging}
            />
          </Suspense>
        )}

        {/* Import review, reachable from a drop onto the dashboard. */}
        {importPlan && (
          <Suspense fallback={<LazyFallback label="import review" variant="overlay" />}>
            <ImportReviewModal
              plan={importPlan}
              onCancel={() => setImportPlan(null)}
              onConfirm={handleConfirmImport}
            />
          </Suspense>
        )}

        <Toaster position="bottom-right" />
      </>
    );
  }

  /*
   * A project is active but its files are still being read.
   *
   * Rendering the editor now would show the previous project's content, or the
   * starter scaffold, for a frame before swapping — which reads as the wrong
   * project having opened.
   */
  if (isOpeningProject) {
    return (
      <div
        className={`grid min-h-screen place-items-center ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}
        data-testid="project-opening"
      >
        <LazyFallback label={activeProject ? activeProject.name : 'your project'} variant="panel" />
      </div>
    );
  }

  return (
    <div
      /* `compact:pb-14` reserves the strip the fixed Code/Preview bar occupies
         so it never covers the footer or the bottom of the active pane. */
      className={`min-h-screen flex flex-col transition-colors compact:pb-14 ${isDark ? 'bg-matte-black' : 'bg-bright-white'
      }`}
      /*
       * Window-wide drop target. Only the handlers live here; the code that can
       * read a drop is fetched on the first one.
       */
      data-testid="app-root"
    >
      {/* Drag affordance — presentation only, always available. */}
      <DropZoneOverlay isDragging={isImportDragging} isPreparing={isImportPreparing} />

      {/* Import review: detection, override, and what was skipped. */}
      {importPlan && (
        <Suspense fallback={<LazyFallback label="import review" variant="overlay" />}>
          <ImportReviewModal
            plan={importPlan}
            onCancel={() => setImportPlan(null)}
            onConfirm={handleConfirmImport}
          />
        </Suspense>
      )}

      {/* Navigation Bar */}
      <NavigationBar
        onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
        onRun={() => handleCommand('run')}
        onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
        onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
        onClear={handleClearAll}
        onNewProject={handleNewProject}
        onNavigateHome={() => void handleReturnToDashboard()}
        currentProjectType={fileProject.projectType}
        autoSaveEnabled={autoSaveEnabled}
        onToggleVoice={handleToggleVoice}
        isVoiceListening={voiceState.isListening}
        onToggleNavDrawer={() => setIsNavDrawerOpen((open) => !open)}
        isNavDrawerOpen={isNavDrawerOpen}
        onOpenExport={() => handleOpenExport('screenshot')}
        customActions={
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Export & Share is the only feature icon left in the top bar;
                every other entry point now lives in the left sidebar. Below
                1025px it moves into the toolbar's overflow menu, which calls
                the same handler. */}
            <Tooltip label="Export & Share" shortcut="⇧⌘E" className="hidden desktop:inline-flex">
              <button
                onClick={() => handleOpenExport('screenshot')}
                className={toolbarIconButtonClass(isDark)}
                title="Export & Share"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>
          </div>
        }
      />



      {/* Main Content — left rail + workspace */}
      <div className="flex flex-1 min-h-0">
        {/*
          Drawer backdrop. Only ever rendered while the drawer is open, and the
          drawer can only open below 1025px, so desktop never sees this node.
        */}
        {isNavDrawerOpen && (
          <div
            /* z-[35] sits above the Code/Preview bar (z-30) so the whole
               viewport really is behind the drawer, but below the top bar
               (z-40) so the hamburger stays reachable to close it. */
            className="fixed inset-0 z-[35] bg-black/60 desktop:hidden"
            onClick={() => setIsNavDrawerOpen(false)}
            aria-hidden="true"
            data-testid="nav-drawer-backdrop"
          />
        )}

        <AppSidebar
          onOpenProjects={() => void handleReturnToDashboard()}
          onToggleFiles={() => setShowFileExplorer((open) => !open)}
          isFilesOpen={showFileExplorer}
          onToggleDependencies={() => setShowDependencies((open) => !open)}
          isDependenciesOpen={showDependencies}
          onOpenTemplates={() => setShowTemplates(true)}
          onOpenImport={() => setShowImport(true)}
          onOpenVSCodeMode={handleEnterVSCodeMode}
          onOpenAIChat={() => setShowAIChat(true)}
          onOpenVoiceCommands={() => setShowVoiceCommands(true)}
          onOpenStatistics={() => setShowStats(true)}
          onOpenInjection={() => setShowInjectionManager(true)}
          onOpenSettings={handleSettingsToggle}
          canDockPanels={!isMobile}
          isDrawerOpen={isNavDrawerOpen}
          onCloseDrawer={() => setIsNavDrawerOpen(false)}
        />

        {showFileExplorer && !isMobile && (
          <Suspense fallback={<LazyFallback label="Files" variant="panel" />}>
  <FileExplorer
              projectType={fileProject.projectType}
              workspace={workspace}
              onClose={() => setShowFileExplorer(false)}
            />
          </Suspense>
        )}

        {showDependencies && !isMobile && (
          <Suspense fallback={<LazyFallback label="Dependencies" variant="panel" />}>
  <DependenciesPanel
              project={fileProject}
              resolvedPackages={projectBundle.resolvedPackages}
              unresolvedPackages={projectBundle.unresolvedPackages}
              isResolving={projectBundle.isResolvingPackages}
              onPin={handlePinDependency}
              onUnpin={handleUnpinDependency}
              onClose={() => setShowDependencies(false)}
            />
          </Suspense>
        )}

        <div className={`grid flex-1 min-w-0 gap-3 px-3 py-3 lg:px-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} h-full`} data-testid="workspace-grid">
          {/*
            Left column: the three fixed panels for plain projects, or the
            tabbed multi-file editor for React/Vue. Plain mode is unchanged.
          */}
          {fileProject.projectType !== 'plain' ? (
            // min-h keeps the pane from collapsing: unlike the plain-mode
            // column (whose three fixed-height editors give the grid row its
            // height), this column has no intrinsic height of its own.
            <div
              className={`flex h-full w-full flex-col min-h-[calc(100vh-11rem)] ${
                mobilePane === 'preview' ? 'compact:hidden' : ''
              }`}
              data-testid="code-column"
            >
              <Suspense fallback={<LazyFallback label="multi-file editor" variant="panel" />}>
  <MultiFileEditor
                  projectType={fileProject.projectType}
                  workspace={workspace}
                  fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
                  fontSize={settings.editorFontSize}
                  buildStatus={projectBundle.status}
                  buildErrors={projectBundle.errors}
                  onSelectionChange={handleMultiFileSelectionChange}
                  onEditorReady={handleEditorReady}
                />
              </Suspense>
            </div>
          ) : (
          <div
            className={`flex flex-col space-y-3 w-full min-h-0 ${
              mobilePane === 'preview' ? 'compact:hidden' : ''
            }`}
            data-testid="code-column"
          >
            <EditorPanel
              title="HTML"
              language="html"
              value={html}
              onChange={setHtml}
              icon={<Code2 className="w-4 h-4 text-orange-400" />}
              onFormat={handleFormatHtml}
              isFormatLoading={formatLoadingStates.html}
              editorRef={htmlEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'html')}
              onEditorReady={(editor, monaco) => handleEditorReady('html', editor, monaco)}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
              errorCount={validation.summary.issues.filter(i => i.source === 'html' && i.severity === 'error').length}
              warningCount={validation.summary.issues.filter(i => i.source === 'html' && i.severity === 'warning').length}
            />

            <EditorPanel
              title="CSS"
              language="css"
              value={css}
              onChange={setCss}
              icon={<Code2 className="w-4 h-4 text-blue-400" />}
              onFormat={handleFormatCss}
              isFormatLoading={formatLoadingStates.css}
              editorRef={cssEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'css')}
              onEditorReady={(editor, monaco) => handleEditorReady('css', editor, monaco)}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
              errorCount={validation.summary.issues.filter(i => i.source === 'css' && i.severity === 'error').length}
              warningCount={validation.summary.issues.filter(i => i.source === 'css' && i.severity === 'warning').length}
            />

            <EditorPanel
              title="JavaScript"
              language="javascript"
              value={javascript}
              onChange={setJavascript}
              icon={<Code2 className="w-4 h-4 text-yellow-400" />}
              onFormat={handleFormatJavascript}
              isFormatLoading={formatLoadingStates.javascript}
              editorRef={jsEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'javascript')}
              onEditorReady={(editor, monaco) => handleEditorReady('javascript', editor, monaco)}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
              jsEditorMode={jsEditorMode}
              onJsEditorModeChange={setJsEditorMode}
              errorCount={validation.summary.issues.filter(i => i.source === 'js' && i.severity === 'error').length}
              warningCount={validation.summary.issues.filter(i => i.source === 'js' && i.severity === 'warning').length}
            />
          </div>
          )}

          {/* Right Panel - Tabbed Interface for Preview, Console, and AI Suggestions */}
          {/*
            `compact:min-h-[70dvh]` is the fix for the invisible preview. Every
            node inside TabbedRightPanel is `flex-1`/`absolute`, so this column
            has no intrinsic height of its own. In the two-column desktop grid
            the row is sized by the editor column next to it, so `h-full`
            resolves to something real. Stacked into a single column the row has
            nothing to take its height from and collapsed to 0px — the iframe
            was mounted and running, just zero-height. A definite minimum height
            on the compact range gives the row something to resolve against.
          */}
          <div
            className={`flex flex-col w-full h-full min-h-0 compact:min-h-[70dvh] ${
              mobilePane === 'code' ? 'compact:hidden' : ''
            }`}
            data-testid="preview-column"
          >
            <TabbedRightPanel
              ref={previewRef}
              errorCount={consoleFeed.counts.error}
              problemCount={validation.summary.errors}
              // Preview props
              html={html}
              css={css}
              javascript={javascript}
              customInjections={customInjections}
              onOpenInjectionManager={() => setShowInjectionManager(true)}
              jsEditorMode={jsEditorMode}
              onConsoleMessage={appendConsoleMessage}
              onPreviewReset={clearPreviewMessages}
              autoRunJS={settings.autoRunJS}
              previewDelay={isBuildAnimating ? 60000 : settings.previewDelay}
              // Console props
              consoleMessages={consoleFeed.messages}
              consoleCounts={consoleFeed.counts}
              onClearConsole={clearConsoleLogs}
              project={fileProject}
              validation={validation.summary}
              isValidating={validation.isValidating}
              isValidationReady={isValidationReady}
              onRevalidate={validation.revalidate}
              panelRequest={rightPanelRequest}
              resolvedPackages={projectBundle.resolvedPackages}
              unresolvedPackages={projectBundle.unresolvedPackages}
              // Multi-file project rendering
              projectType={fileProject.projectType}
              bundledCode={projectBundle.bundle.code}
              bundledCss={projectBundle.bundle.css}
              importMap={projectBundle.bundle.importMap}
              isResolvingPackages={projectBundle.isResolvingPackages}
            />

            {/* Snippets Sidebar - Phase 3 */}
            {isPhase3Ready && (
              <Suspense fallback={null}>
                <SnippetsSidebar
                  isOpen={showSnippets}
                  onClose={() => setShowSnippets(false)}
                  snippets={snippets}
                  onSave={saveSnippet}
                  onLoad={loadSnippet}
                  onInsert={insertSnippet}
                  onDelete={deleteSnippet}
                  onUpdate={updateSnippet}
                  currentCode={{ html, css, javascript }}
                />
              </Suspense>
            )}

            {/* Extensions Marketplace - Phase 3 */}
            {isPhase3Ready && (
              <Suspense fallback={null}>
                <ExtensionsMarketplace
                  isOpen={showExtensionsMarketplace}
                  onClose={() => setShowExtensionsMarketplace(false)}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/*
        Code ⇄ Preview switch for the compact range — the CodePen/JSFiddle
        pattern. Both columns stay mounted; this only flips which one is
        displayed, so Monaco keeps its models and the preview iframe keeps
        running and never reloads on a switch. `hidden` above 1024px.
      */}
      <div
        data-testid="mobile-pane-toggle"
        role="tablist"
        aria-label="Workspace view"
        className="fixed bottom-0 left-0 right-0 z-30 hidden border-t border-stroke-subtle bg-surface-raised compact:grid compact:grid-cols-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === 'code'}
          data-testid="mobile-pane-code"
          onClick={() => setMobilePane('code')}
          className={`flex min-h-[56px] items-center justify-center gap-2 border-t-2 text-sm font-medium transition-colors ${
            mobilePane === 'code'
              ? 'border-accent bg-accent-subtle text-content-primary'
              : 'border-transparent text-content-secondary'
          }`}
        >
          <Code2 className="h-4 w-4" />
          Code
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === 'preview'}
          data-testid="mobile-pane-preview"
          onClick={() => setMobilePane('preview')}
          className={`flex min-h-[56px] items-center justify-center gap-2 border-t-2 text-sm font-medium transition-colors ${
            mobilePane === 'preview'
              ? 'border-accent bg-accent-subtle text-content-primary'
              : 'border-transparent text-content-secondary'
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Footer */}
      <Footer
        focusMode={focusMode}
        errorCount={validation.summary.errors}
        warningCount={validation.summary.warnings}
        onOpenValidator={() => setRightPanelRequest({ tab: 'console', nonce: Date.now() })}
      />

      {/* External Library Manager - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <ExternalLibraryManager
            isOpen={showExternalLibraryManager}
            onClose={() => setShowExternalLibraryManager(false)}
            libraries={externalLibraries}
            onLibrariesChange={handleExternalLibrariesChange}
          />
        </Suspense>
      )}

      {/* Settings Modal - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Help Modal - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <KeyboardShortcutsHelp
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        </Suspense>
      )}

      {/* History Panel - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <HistoryPanel
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            history={codeHistory.allHistory}
            currentIndex={codeHistory.currentIndex}
            onJumpToSnapshot={handleJumpToSnapshot}
            onCreateSnapshot={handleCreateSnapshot}
            getDiffPreview={codeHistory.getDiffPreview}
          />
        </Suspense>
      )}

      {/* ===== NEW FEATURES MODALS ===== */}

      {/* AI Diff Modal */}
      {diffData && (
        <Suspense fallback={null}>
          <AiDiffModal
            isOpen={diffData.isOpen}
            onClose={() => setDiffData(null)}
            onApplyAll={diffData.onApplyAll}
            onApplyFile={diffData.onApplyFile}
            files={diffData.files}
            title={diffData.title}
          />
        </Suspense>
      )}

      {/* Build from Prompt */}
      {showBuildFromPrompt && (
        <Suspense fallback={null}>
          <BuildFromPromptModal
            isOpen={showBuildFromPrompt}
            onClose={() => {
              setShowBuildFromPrompt(false);
              // Drop the dictated prompt so opening the modal manually starts clean.
              setVoiceBuildPrompt('');
            }}
            onGenerate={handleBuildFromPrompt}
            projectContext={{ html, css, javascript }}
            initialPrompt={voiceBuildPrompt}
          />
        </Suspense>
      )}
      
      {/* Export & Share */}
      {showExportShare && (
        <Suspense fallback={<LazyFallback label="Export & Share" variant="overlay" />}>
  <ExportShareModal
            isOpen={showExportShare}
            onClose={() => setShowExportShare(false)}
            project={fileProject}
            previewRef={previewRef}
            externalLibraries={externalLibraries}
            resolvedVersions={Object.fromEntries(
              projectBundle.resolvedPackages.map((pkg) => [pkg.name, pkg.resolvedVersion ?? pkg.version]),
            )}
            projectName={project.currentProject?.name ?? 'gb-coder-project'}
            initialTab={exportModalTab}
          />
        </Suspense>
      )}

      {/* Import */}
      {showImport && (
        <Suspense fallback={<LazyFallback label="Import" variant="overlay" />}>
  <ImportModal
            isOpen={showImport}
            onClose={() => setShowImport(false)}
            onFiles={importFiles}
            isDragging={isImportDragging}
          />
        </Suspense>
      )}

      {/* AI Chat Assistant */}
      {showAIChat && (
        <Suspense fallback={null}>
          <AIChatAssistant
            isOpen={showAIChat}
            onClose={() => setShowAIChat(false)}
            html={html}
            css={css}
            javascript={javascript}
            externalLibraries={externalLibraries}
          />
        </Suspense>
      )}

      {/* Voice Command Panel */}
      {showVoiceCommands && (
        <Suspense fallback={null}>
          <VoiceCommandPanel
            isOpen={showVoiceCommands}
            onClose={() => setShowVoiceCommands(false)}
            onVoiceFeedbackChange={(enabled) => updateSettings({ voiceFeedback: enabled })}
            onContinuousChange={(enabled) => updateSettings({ voiceContinuous: enabled })}
            onLanguageChange={(language) => updateSettings({ voiceLanguage: language })}
          />
        </Suspense>
      )}

      {/* Template Selector */}
      {showTemplates && (
        <Suspense fallback={null}>
          <TemplateSelectorModal
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
            onLoadTemplate={handleLoadTemplate}
          />
        </Suspense>
      )}

      {/* Code Statistics Dashboard */}
      {showStats && (
        <Suspense fallback={null}>
          <CodeStatsDashboard
            project={fileProject}
            aiSuggestionsUsed={aiSuggestionsUsed}
            isOpen={showStats}
            onClose={() => setShowStats(false)}
          />
        </Suspense>
      )}

      {/* Validation Panel */}
      {/* Custom Injection Manager */}
      {showInjectionManager && (
        <Suspense fallback={null}>
          <CustomInjectionManager
            isOpen={showInjectionManager}
            onClose={() => setShowInjectionManager(false)}
            onInjectionsChanged={handleUpdateInjections}
            projectId={project.currentProject?.id}
          />
        </Suspense>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1a1a1a' : '#fff',
            color: isDark ? '#fff' : '#000',
            border: `1px solid ${isDark ? '#333' : '#eee'}`,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* Selection Toolbar - Appears when code is selected */}
      {hasSelection && selection.position && (
        <SelectionToolbar
          position={selection.position}
          language={selection.language!}
          onOperation={handleSelectionOperation}
          isLoading={selectionOps.isLoading}
          currentOperation={selectionOps.result?.operation}
        />
      )}

      {/* Selection Sidebar - Handles Loading, Results, and History */}
      <SelectionSidebar
        isOpen={selectionOps.isLoading || !!selectionOps.result || isHistoryPanelOpen}
        isLoading={selectionOps.isLoading}
        result={selectionOps.result}
        language={selection.language}
        error={selectionOps.error}
        onClose={() => {
          handleCloseSelectionResult();
          setIsHistoryPanelOpen(false);
        }}
        onApplyChanges={selectionOps.result?.hasCodeChanges ? handleApplySelectionChanges : undefined}
        history={selectionHistory}
        onClearHistory={() => setSelectionHistory([])}
        onSelectHistory={(item) => {
          selectionOps.setResult(item.result);
        }}
        onHistoryToggle={setIsHistoryPanelOpen}
        isHistoryOpen={isHistoryPanelOpen}
      />

      {/* Command Palette */}
      {showCommandPalette && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            actions={commandPaletteActions}
          />
        </Suspense>
      )}

    </div>
  );
}

export default App;




