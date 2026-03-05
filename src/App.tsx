import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Code2 } from 'lucide-react';
// Phase 1: Critical components - loaded immediately (not lazy)
import NavigationBar from './components/NavigationBar';
import EditorPanel from './components/EditorPanel';
import TabbedRightPanel from './components/TabbedRightPanel';
import SaveStatusIndicator from './components/ui/SaveStatusIndicator';
import Footer from './components/ui/Footer';

// Phase 2: High priority - lazy loaded after initial render
const EnhancedConsole = lazy(() => import('./components/EnhancedConsole'));

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
import SelectionToolbar from './components/SelectionToolbar';
import SelectionSidebar from './components/SelectionSidebar';
import { downloadAsZip } from './utils/downloadUtils';
import * as monacoHelper from './utils/monacoSelectionHelper';
import { CodeSnippet, ConsoleLog, EditorLanguage, HistoryItem, SnippetType, SnippetScope } from './types';
import { migrateSnippets } from './utils/snippetUtils';
import { externalLibraryService, ExternalLibrary } from './services/externalLibraryService';
import { formattingService } from './services/formattingService';
import { SelectionOperationType } from './services/selectionOperationsService';


type AppView = 'editor' | 'history' | 'about' | 'documentation' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact';

const defaultHTML = `<div class="container">
</div>`;

const defaultCSS = `.container {
}`;

const defaultJS = ``;

function App() {
  // Progressive loading phases
  const { isPhase3Ready } = useProgressiveLoad();

  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [javascript, setJavascript] = useState(defaultJS);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [snippets, setSnippets] = useLocalStorage<CodeSnippet[]>('gb-coder-snippets', []);
  const [selectionHistory, setSelectionHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const [autoSaveEnabled, setAutoSaveEnabled] = useLocalStorage<boolean>('gb-coder-autosave-enabled', true);
  const [showSnippets, setShowSnippets] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [showExternalLibraryManager, setShowExternalLibraryManager] = useState<boolean>(false);
  const [externalLibraries, setExternalLibraries] = useState<ExternalLibrary[]>([]);
  const [showExtensionsMarketplace, setShowExtensionsMarketplace] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

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

  const handleExtensionsToggle = () => {
    setShowExtensionsMarketplace(!showExtensionsMarketplace);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleKeyboardShortcutsToggle = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
  };

  const handleExternalLibrariesChange = (libraries: ExternalLibrary[]) => {
    setExternalLibraries(libraries);

    window.dispatchEvent(new CustomEvent('external-libraries-updated'));
  };

  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const clearConsoleLogs = () => {
    setConsoleLogs([]);
  };

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
        setTheme(newTheme);
        break;
      }
      case 'toggle':
        if (args[0] === 'theme') {
          toggleTheme();
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

  const resetCode = async () => {
    codeHistory.saveState({ html, css, javascript }, 'Reset to default');

    // Reset code to defaults
    setHtml(defaultHTML);
    setCss(defaultCSS);
    setJavascript(defaultJS);
    setConsoleLogs([]);

    // Reset project name to default
    if (project.currentProject) {
      await project.updateProjectName('Untitled Project');
    }
  };

  const handleUndo = () => {
    const previousState = codeHistory.undo();
    if (previousState) {
      setHtml(previousState.html);
      setCss(previousState.css);
      setJavascript(previousState.javascript);
    }
  };

  const handleRedo = () => {
    const nextState = codeHistory.redo();
    if (nextState) {
      setHtml(nextState.html);
      setCss(nextState.css);
      setJavascript(nextState.javascript);
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

  // Selection Operation Handlers
  const handleSelectionChange = useCallback((editor: any, language: EditorLanguage) => {
    updateSelection(editor, language);
  }, [updateSelection]);

  const handleSelectionOperation = useCallback(async (operation: SelectionOperationType) => {
    if (!hasSelection || !selection.code || !selection.language) return;

    const context = selection.fullFileCode;

    try {
      const result = await selectionOps.executeOperation(operation, selection.code, selection.language, context);

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
  }, [hasSelection, selection, selectionOps]);

  const handleApplySelectionChanges = useCallback((newCode: string) => {
    if (!selection.editorInstance || !selection.range) {
      console.error('No editor instance or range available');
      return;
    }

    // Apply the changes using Monaco helper
    const success = monacoHelper.replaceSelectedCode(selection.editorInstance, newCode, selection.range);

    if (success) {
      // Save to history
      codeHistory.saveState({ html, css, javascript }, `Applied ${selectionOps.result?.operation}`);

      // Clear selection and result
      clearSelection();
      selectionOps.clearResult();

    } else {
    }
  }, [selection, selectionOps, codeHistory, html, css, javascript, clearSelection]);

  const handleCloseSelectionResult = useCallback(() => {
    selectionOps.clearResult();
  }, [selectionOps]);


  const handleManualSave = async () => {
    const { error } = await autoSave.manualSave();
    if (error) {
      console.error('Save failed:', error);
    } else {
    }
  };

  // Render about page
  if (currentView === 'about') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onRun={() => handleCommand('run')}
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onSettingsToggle={handleSettingsToggle}
          autoSaveEnabled={autoSaveEnabled}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
        onImport={fileUpload.uploadFiles}
        onExport={() => downloadAsZip(html, css, javascript)}
        onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
        onSettingsToggle={handleSettingsToggle}
        autoSaveEnabled={autoSaveEnabled}
      />



      {/* Main Content */}
      <div className="flex-1 px-2 sm:px-4 lg:px-6 py-4">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} h-full`}>
          {/* Left Panel - Editors */}
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
            />
          </div>

          {/* Right Panel - Tabbed Interface for Preview, Console, and AI Suggestions */}
          <div className="flex flex-col w-full h-full min-h-0">
            <TabbedRightPanel
              errorCount={consoleLogs.filter(log => log.type === 'error').length}
              // Preview props
              html={html}
              css={css}
              javascript={javascript}
              onConsoleLog={handleConsoleLog}
              autoRunJS={settings.autoRunJS}
              previewDelay={settings.previewDelay}
              // Console props
              consoleLogs={consoleLogs}
              onClearConsole={clearConsoleLogs}
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




