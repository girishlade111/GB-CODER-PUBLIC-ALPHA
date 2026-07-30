import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  Suspense,
  lazy,
} from 'react';
import { Code2, Share2 } from 'lucide-react';
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
 * Type-only imports from the lazy import chunk. `import type` is erased during
 * compilation, so naming these types does not create a runtime dependency and
 * the chunk stays out of the initial bundle.
 */
import type { ImportPlan as ImportPlanType } from './services/import/importEngine';
import type { DetectedProjectKind as DetectedKind } from './services/import/projectDetection';

// ===== NEW FEATURES IMPORTS =====
import { Toaster, toast } from 'react-hot-toast';
import { CodeTemplate } from './services/codeTemplatesService';

// Lazy-loaded modal components (only shown when their show* state is true)
const AIChatAssistant = lazy(() => import('./components/AIChatAssistant'));
const VoiceCommandPanel = lazy(() => import('./components/VoiceCommandPanel'));
const TemplateSelectorModal = lazy(() => import('./components/TemplateSelectorModal'));
const CodeStatsDashboard = lazy(() => import('./components/CodeStatsDashboard'));
const CustomInjectionManager = lazy(() => import('./components/CustomInjectionManager'));
const BuildFromPromptModal = lazy(() => import('./components/BuildFromPromptModal'));

/*
 * Everything past the core HTML/CSS/JS editor is a separate chunk, fetched the
 * first time the user reaches for it. The sidebar entries that open these are
 * plain icons and labels in the core bundle, so the shell is complete on first
 * paint while none of this code is.
 */
const FileExplorer = lazy(() => import('./components/FileExplorer'));
const DependenciesPanel = lazy(() => import('./components/DependenciesPanel'));
const MultiFileEditor = lazy(() => import('./components/MultiFileEditor'));
const ExportShareModal = lazy(() => import('./components/ExportShareModal'));
const ImportModal = lazy(() => import('./components/ImportModal'));
const PreviewSharePage = lazy(() => import('./components/PreviewSharePage'));
const ImportReviewModal = lazy(() => import('./components/ImportReviewModal'));

// Phase 2: High priority - lazy loaded after initial render
// (EnhancedConsole is used inside TabbedRightPanel, not here directly)

// Phase 3: Deferred - lazy loaded after high priority components
const SnippetsSidebar = lazy(() => import('./components/SnippetsSidebar'));
const ExternalLibraryManager = lazy(() => import('./components/ExternalLibraryManager'));
const CodeHistoryPage = lazy(() => import('./components/history/CodeHistoryPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const DocumentationPage = lazy(() => import('./components/pages/DocumentationPage'));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./components/pages/CookiePolicyPage'));
const DisclaimerPage = lazy(() => import('./components/pages/DisclaimerPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const ExtensionsMarketplace = lazy(() => import('./components/ExtensionsMarketplace'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const KeyboardShortcutsHelp = lazy(() => import('./components/KeyboardShortcutsHelp'));

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
/*
 * PreviewSharePage is intentionally NOT imported here. It is declared with
 * React.lazy below: the standalone share page is only reached via a /preview/:id
 * URL, so bundling it into the entry chunk made every visitor pay for a route
 * almost none of them take.
 */


type AppView = 'editor' | 'history' | 'about' | 'documentation' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact' | 'preview-share' | 'preview-share-error';

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
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInjectionManager, setShowInjectionManager] = useState(false);
  const [customInjectionCode, setCustomInjectionCode] = useState({ css: '', js: '' });
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
  const validation = useValidation(fileProject, isValidationReady);

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
      setIsMobile(window.innerWidth < 1024);
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

  /*
   * ===== DRAG & DROP IMPORT =====
   *
   * The plan is built by the lazy import chunk and reviewed before anything is
   * applied, so a wrong detection never silently replaces the user's work.
   */
  const [importPlan, setImportPlan] = useState<ImportPlanType | null>(null);

  const handleImportPlan = useCallback(
    (plan: ImportPlanType) => {
      if (plan.result.files.length === 0 && plan.detection.kind !== 'fullstack') {
        toast.error('Nothing importable was found in that drop.');
        return;
      }

      /*
       * A single HTML/CSS/JS file dropped into a plain project needs no
       * ceremony: it routes straight to its panel. The review step exists to
       * catch a *mode change* the user did not ask for, and there is none here.
       */
      const isSingleCoreFile =
        plan.result.files.length === 1 &&
        plan.detection.kind === 'simple' &&
        fileProject.projectType === 'plain' &&
        ['html', 'css', 'javascript'].includes(plan.result.files[0].language);

      if (isSingleCoreFile) {
        handleImportResult({ ...plan.result, projectType: 'plain', entry: undefined });
        return;
      }

      setImportPlan(plan);
    },
    [fileProject.projectType, handleImportResult],
  );

  const {
    isDragging: isImportDragging,
    isPreparing: isImportPreparing,
    dropHandlers,
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
    [importPlan, handleImportResult, workspace],
  );

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
  });

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
  const handleLoadTemplate = useCallback((template: CodeTemplate) => {
    codeHistory.saveState({ html, css, javascript }, `Loaded template: ${template.name}`);
    setHtml(template.html);
    setCss(template.css);
    setJavascript(template.javascript);
  }, [html, css, javascript]);

  const handleBuildFromPrompt = useCallback(async (newHtml: string, newCss: string, newJavascript: string) => {
    codeHistory.saveState({ html, css, javascript }, 'Built from prompt');
    clearConsole();
    setIsBuildAnimating(true);
    setHtml('');
    setCss('');
    setJavascript('');

    try {
      await codeWriter.writeCode(newHtml, setHtml);
      await codeWriter.writeCode(newCss, setCss);
      await codeWriter.writeCode(newJavascript, setJavascript);
      toast.success(' Built from prompt! Edit freely or generate again.');
    } finally {
      setIsBuildAnimating(false);
    }
  }, [autoSave, codeHistory, html, css, javascript]);

  const handleUpdateInjections = useCallback((css: string, js: string) => {
    setCustomInjectionCode({ css, js });
  }, []);

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

    codeHistory.saveState({ html, css, javascript }, `Applied ${activeResult.operation}`);

    if (canReplaceSelection) {
      const success = monacoHelper.replaceSelectedCode(selection.editorInstance, newCode, selection.range);

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
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
      }`}
      /*
       * Window-wide drop target. Only the handlers live here; the code that can
       * read a drop is fetched on the first one.
       */
      {...dropHandlers}
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
        currentProjectType={fileProject.projectType}
        autoSaveEnabled={autoSaveEnabled}
        onToggleVoice={handleToggleVoice}
        isVoiceListening={voiceState.isListening}
        customActions={
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Export & Share is the only feature icon left in the top bar;
                every other entry point now lives in the left sidebar. */}
            <Tooltip label="Export & Share" shortcut="⇧⌘E" className="hidden sm:inline-flex">
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
        <AppSidebar
          onToggleFiles={() => setShowFileExplorer((open) => !open)}
          isFilesOpen={showFileExplorer}
          onToggleDependencies={() => setShowDependencies((open) => !open)}
          isDependenciesOpen={showDependencies}
          onOpenTemplates={() => setShowTemplates(true)}
          onOpenImport={() => setShowImport(true)}
          onOpenAIChat={() => setShowAIChat(true)}
          onOpenVoiceCommands={() => setShowVoiceCommands(true)}
          onOpenStatistics={() => setShowStats(true)}
          onOpenInjection={() => setShowInjectionManager(true)}
          onOpenSettings={handleSettingsToggle}
          canDockPanels={!isMobile}
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

        <div className={`grid flex-1 min-w-0 gap-3 px-3 py-3 lg:px-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} h-full`}>
          {/*
            Left column: the three fixed panels for plain projects, or the
            tabbed multi-file editor for React/Vue. Plain mode is unchanged.
          */}
          {fileProject.projectType !== 'plain' ? (
            // min-h keeps the pane from collapsing: unlike the plain-mode
            // column (whose three fixed-height editors give the grid row its
            // height), this column has no intrinsic height of its own.
            <div className="flex h-full w-full flex-col min-h-[calc(100vh-11rem)]">
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
          <div className="flex flex-col space-y-3 w-full min-h-0">
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
            />
          </div>
          )}

          {/* Right Panel - Tabbed Interface for Preview, Console, and AI Suggestions */}
          <div className="flex flex-col w-full h-full min-h-0">
            <TabbedRightPanel
              ref={previewRef}
              errorCount={consoleFeed.counts.error}
              problemCount={validation.summary.errors}
              // Preview props
              html={html}
              css={css + (customInjectionCode.css ? '\n\n/* Custom Injections */\n' + customInjectionCode.css : '')}
              javascript={javascript + (customInjectionCode.js ? '\n\n// Custom Injections\n' + customInjectionCode.js : '')}
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

      {/* Footer */}
      <Footer focusMode={focusMode} />

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
            onImport={handleImportResult}
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
            html={html}
            css={css}
            javascript={javascript}
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
            onUpdateInjections={handleUpdateInjections}
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

    </div>
  );
}

export default App;




