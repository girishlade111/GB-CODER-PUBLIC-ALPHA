import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react';
import { Code2, MessageSquare, Mic, LayoutTemplate, BarChart3, CheckCircle, Zap } from 'lucide-react';
// Phase 1: Critical components - loaded immediately (not lazy)
import NavigationBar from './components/NavigationBar';
import AppSidebar from './components/AppSidebar';
import FileExplorer from './components/FileExplorer';
import DependenciesPanel from './components/DependenciesPanel';
import MultiFileEditor from './components/MultiFileEditor';
import EditorPanel from './components/EditorPanel';
import TabbedRightPanel from './components/TabbedRightPanel';
import Footer from './components/ui/Footer';
import Tooltip from './components/ui/Tooltip';

// ===== NEW FEATURES IMPORTS =====
import { Toaster, toast } from 'react-hot-toast';
import ExportShareMenu from './components/ExportShareMenu';
import { CodeTemplate } from './services/codeTemplatesService';

// Lazy-loaded modal components (only shown when their show* state is true)
const AIChatAssistant = lazy(() => import('./components/AIChatAssistant'));
const VoiceCommandPanel = lazy(() => import('./components/VoiceCommandPanel'));
const TemplateSelectorModal = lazy(() => import('./components/TemplateSelectorModal'));
const CodeStatsDashboard = lazy(() => import('./components/CodeStatsDashboard'));
const ValidationPanel = lazy(() => import('./components/ValidationPanel'));
const CustomInjectionManager = lazy(() => import('./components/CustomInjectionManager'));
const BuildFromPromptModal = lazy(() => import('./components/BuildFromPromptModal'));

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
import { useFileUpload } from './hooks/useFileUpload';
import { useTheme } from './hooks/useTheme';
import { useCodeSelection } from './hooks/useCodeSelection';
import { useSelectionOperations } from './hooks/useSelectionOperations';
import { useProject } from './hooks/useProject';
import { useSettings } from './hooks/useSettings';
import { useFocusMode } from './hooks/useFocusMode';
import { useProgressiveLoad } from './hooks/useProgressiveLoad';
import { useCodeWriter } from './hooks/useCodeWriter';
import { useProjectBundle } from './hooks/useProjectBundle';
import { useFileWorkspace } from './hooks/useFileWorkspace';
import SelectionToolbar from './components/SelectionToolbar';
import SelectionSidebar from './components/SelectionSidebar';
import { downloadAsZip } from './utils/downloadUtils';
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
import PreviewSharePage from './components/PreviewSharePage';


type AppView = 'editor' | 'history' | 'about' | 'documentation' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact' | 'preview-share' | 'preview-share-error';

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
  const [fileProject, setFileProject] = useState<MultiFileProject>(() =>
    createPlainProject(defaultHTML, defaultCSS, defaultJS),
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
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
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

  // ===== NEW FEATURES STATE =====
  const [showAIChat, setShowAIChat] = useState(false);
  const [showBuildFromPrompt, setShowBuildFromPrompt] = useState(false);
  const [isBuildAnimating, setIsBuildAnimating] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
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


  // File upload functionality
  const fileUpload = useFileUpload({
    onHtmlUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setHtml(content);
    },
    onCssUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setCss(content);
    },
    onJsUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setJavascript(content);
    },
    onMultipleUpload: (files) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${files.length} files`);

      files.forEach(file => {
        switch (file.language) {
          case 'html':
            setHtml(file.content);
            break;
          case 'css':
            setCss(file.content);
            break;
          case 'javascript':
            setJavascript(file.content);
            break;
        }
      });

    }
  });

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
        setConsoleLogs([]);
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

  // ===== VOICE COMMAND HANDLER =====
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { action } = event.detail;
      
      switch (action) {
        case 'run':
          handleCommand('run');
          break;
        case 'clear_console':
          clearConsoleLogs();
          break;
        case 'format':
          handleFormatHtml();
          handleFormatCss();
          handleFormatJavascript();
          break;
        case 'download':
          downloadAsZip(html, css, javascript);
          break;
        case 'help':
          setShowVoiceCommands(true);
          break;
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
  }, [html, css, javascript]);

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

  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const clearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

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
    setConsoleLogs([]);
    toast.success(`Started a new ${PROJECT_TYPE_LABEL[projectType]} project.`);
  }, []);

  const handleCommand = async (command: string) => {
    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case 'run':
        setConsoleLogs([]);
        break;
      case 'clear':
        clearConsoleLogs();
        break;
      case 'download':
        downloadAsZip(html, css, javascript);
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
    setConsoleLogs([]);
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

    setConsoleLogs([]);
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
    setConsoleLogs([]);

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
    setConsoleLogs([]);
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


  // Render standalone live-preview share page (/preview/:id) - must come
  // first so it bypasses all editor chrome.
  if (currentView === 'preview-share') {
    return (
      <PreviewSharePage
        html={previewShareCode?.html || ''}
        css={previewShareCode?.css || ''}
        javascript={previewShareCode?.javascript || ''}
        shortId={previewShortId}
        isLoading={previewLoading}
        error={previewError}
      />
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
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
    <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
      }`}>
      {/* Navigation Bar */}
      <NavigationBar
        onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
        onRun={() => handleCommand('run')}
        onOpenBuildFromPrompt={() => setShowBuildFromPrompt(true)}
        onImport={fileUpload.uploadFiles}
        onExport={() => downloadAsZip(html, css, javascript)}
        onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
        onSettingsToggle={handleSettingsToggle}
        onClear={handleClearAll}
        onNewProject={handleNewProject}
        currentProjectType={fileProject.projectType}
        autoSaveEnabled={autoSaveEnabled}
        customActions={
          <div className="flex items-center gap-1 sm:gap-2">
            {/* AI Chat */}
            <Tooltip label="AI Chat Assistant" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowAIChat(true)}
                className={toolbarIconButtonClass(isDark)}
                title="AI Chat Assistant"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Voice Commands */}
            <Tooltip label="Voice Commands" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowVoiceCommands(true)}
                className={toolbarIconButtonClass(isDark)}
                title="Voice Commands"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Templates */}
            <Tooltip label="Code Templates" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowTemplates(true)}
                className={toolbarIconButtonClass(isDark)}
                title="Code Templates"
              >
                <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Statistics */}
            <Tooltip label="Code Statistics" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowStats(true)}
                className={toolbarIconButtonClass(isDark)}
                title="Code Statistics"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Validation */}
            <Tooltip label="Code Validation" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowValidation(true)}
                className={toolbarIconButtonClass(isDark)}
                title="Code Validation"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Custom Injection */}
            <Tooltip label="Custom Code Injection" className="hidden sm:inline-flex">
              <button
                onClick={() => setShowInjectionManager(true)}
                className={toolbarIconButtonClass(isDark)}
                title="Custom Code Injection"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Export/Share Menu */}
            <ExportShareMenu
              previewRef={previewRef}
              html={html}
              css={css}
              javascript={javascript}
              externalLibraries={externalLibraries}
            />
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
          onOpenAITools={() => setShowAIChat(true)}
          onOpenSettings={handleSettingsToggle}
        />

        {showFileExplorer && !isMobile && (
          <FileExplorer
            projectType={fileProject.projectType}
            workspace={workspace}
            onClose={() => setShowFileExplorer(false)}
          />
        )}

        {showDependencies && !isMobile && (
          <DependenciesPanel
            project={fileProject}
            resolvedPackages={projectBundle.resolvedPackages}
            unresolvedPackages={projectBundle.unresolvedPackages}
            isResolving={projectBundle.isResolvingPackages}
            onPin={handlePinDependency}
            onUnpin={handleUnpinDependency}
            onClose={() => setShowDependencies(false)}
          />
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
              <MultiFileEditor
                projectType={fileProject.projectType}
                workspace={workspace}
                fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
                fontSize={settings.editorFontSize}
                buildStatus={projectBundle.status}
                buildErrors={projectBundle.errors}
                onSelectionChange={handleMultiFileSelectionChange}
              />
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
              errorCount={consoleLogs.filter(log => log.type === 'error').length}
              // Preview props
              html={html}
              css={css + (customInjectionCode.css ? '\n\n/* Custom Injections */\n' + customInjectionCode.css : '')}
              javascript={javascript + (customInjectionCode.js ? '\n\n// Custom Injections\n' + customInjectionCode.js : '')}
              jsEditorMode={jsEditorMode}
              onConsoleLog={handleConsoleLog}
              autoRunJS={settings.autoRunJS}
              previewDelay={isBuildAnimating ? 60000 : settings.previewDelay}
              // Console props
              consoleLogs={consoleLogs}
              onClearConsole={clearConsoleLogs}
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
            onClose={() => setShowBuildFromPrompt(false)}
            onGenerate={handleBuildFromPrompt}
            projectContext={{ html, css, javascript }}
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
      {showValidation && (
        <Suspense fallback={null}>
          <ValidationPanel
            html={html}
            css={css}
            javascript={javascript}
            isOpen={showValidation}
            onClose={() => setShowValidation(false)}
          />
        </Suspense>
      )}

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




