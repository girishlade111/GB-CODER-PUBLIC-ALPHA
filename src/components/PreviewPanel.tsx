import React, { useEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Maximize2, X, Play, Eye, Package } from 'lucide-react';
import { JSEditorMode } from '../types';
import { MOUNT_ELEMENT_ID, ProjectType } from '../types/files';
import { externalLibraryService } from '../services/externalLibraryService';
import {
  StackMappingContext,
  buildConsoleBridgeScript,
  mapStackFrame,
  parseBridgeMessage,
} from '../services/consoleBridge';
import type { ConsoleMessage, ResolvedStackFrame } from '../types/consoleFeed';

type ViewMode = 'desktop' | 'tablet' | 'mobile' | 'fullscreen';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
  jsEditorMode?: JSEditorMode;
  /** Receives every captured console call, with stack frames already resolved. */
  onConsoleMessage: (message: Omit<ConsoleMessage, 'id' | 'count'>) => void;
  /**
   * Fired when a fresh preview document reports itself live. Browser devtools
   * clear on navigation, and the console feed follows the same rule.
   */
  onPreviewReset?: () => void;
  autoRunJS?: boolean;
  previewDelay?: number;
  /**
   * Multi-file project mode. `plain` (the default) keeps the original
   * html/css/javascript pipeline completely untouched.
   */
  projectType?: ProjectType;
  /** Pre-bundled IIFE for react/vue projects. Ignored in plain mode. */
  bundledCode?: string;
  /** CSS collected from the module graph for react/vue projects. */
  bundledCss?: string;
  /** Bare specifier -> CDN URL, rendered as an import map. */
  importMap?: Record<string, string>;
  /** True while CDN packages are being resolved for the first time. */
  isResolvingPackages?: boolean;
}

/**
 * Lazily transpile TypeScript/TSX code using a dynamic import of the
 * TypeScript compiler. This keeps the 3.5 MB compiler out of the
 * critical-ui bundle and only loads it when actually needed.
 */
async function transpileTypeScript(code: string): Promise<{ code: string; compilationError: string | null }> {
  try {
    const ts = await import('typescript');
    const result = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2015,
        jsx: ts.JsxEmit.React,
      },
      reportDiagnostics: true,
    });

    const errorDiagnostic = result.diagnostics?.find(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    );

    if (errorDiagnostic) {
      throw new Error(ts.flattenDiagnosticMessageText(errorDiagnostic.messageText, '\n'));
    }

    return {
      code: result.outputText,
      compilationError: null,
    };
  } catch (error) {
    return {
      code,
      compilationError: error instanceof Error ? error.message : 'Unknown TypeScript compilation error',
    };
  }
}

const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(({
  html,
  css,
  javascript,
  jsEditorMode = 'javascript',
  onConsoleMessage,
  onPreviewReset,
  autoRunJS = true,
  previewDelay = 300,
  projectType = 'plain',
  bundledCode = '',
  bundledCss = '',
  importMap = {},
  isResolvingPackages = false,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Monotonic run counter, and the id of the document currently mounted. */
  const runCounterRef = useRef(0);
  const currentRunIdRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  /** React/Vue projects render a bundled module graph instead of raw files. */
  const isFrameworkProject = projectType !== 'plain';
  // Drives the "nothing to preview yet" placeholder. Purely presentational —
  // the iframe still renders as normal underneath.
  const isProjectEmpty = isFrameworkProject
    ? !bundledCode.trim()
    : !html.trim() && !css.trim() && !javascript.trim();
  const [manualRunTrigger, setManualRunTrigger] = useState(0);
  // Holds the transpiled JS when using TS/TSX mode
  const [transpiledJs, setTranspiledJs] = useState<string>(javascript);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  // Holds the generated preview content to avoid recalculating on every render
  const [previewContent, setPreviewContent] = useState<string>('');

  // Expose the container div to parent components via ref
  useImperativeHandle(ref, () => {
    const container = document.getElementById('preview-container');
    return container as HTMLDivElement;
  });

  // Transpile TypeScript/TSX asynchronously when needed
  const shouldTranspile = jsEditorMode === 'typescript' || jsEditorMode === 'tsx';

  useEffect(() => {
    if (isFrameworkProject) return;
    if (!shouldTranspile) {
      setTranspiledJs(javascript);
      setCompilationError(null);
      return;
    }

    let cancelled = false;
    transpileTypeScript(javascript).then((result) => {
      if (!cancelled) {
        setTranspiledJs(result.code);
        setCompilationError(result.compilationError);
      }
    });

    return () => { cancelled = true; };
  }, [javascript, shouldTranspile, isFrameworkProject]);

  // Sanitize code input to prevent XSS attacks (CSS only - HTML runs in sandboxed iframe)
  const sanitizeCode = (code: string, language: string): string => {
    if (language === 'css') {
      return code
        .replace(/expression\s*\(/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/-moz-binding\s*:/gi, '');
    }
    return code;
  };

  const escapeScriptContent = (code: string): string => {
    return code.replace(/<\/script/gi, '<\\/script');
  };

  const generatePreviewContent = useCallback((runId: string) => {
    /*
     * Framework projects substitute the bundler's output for the three raw
     * files: the markup becomes a mount point, the styles are the CSS collected
     * out of the module graph, and the script is the already-compiled IIFE
     * (so neither Babel nor the TypeScript transpiler is involved).
     * Plain mode falls through to the original values unchanged.
     */
    const effectiveHtml = isFrameworkProject
      ? `<div id="${MOUNT_ELEMENT_ID[projectType as Exclude<ProjectType, 'plain'>]}"></div>`
      : html;
    const effectiveCss = isFrameworkProject ? bundledCss : css;

    const sanitizedCss = sanitizeCode(effectiveCss, 'css');
    const usesBabel = !isFrameworkProject && (jsEditorMode === 'jsx' || jsEditorMode === 'tsx');
    const executableJavascript = isFrameworkProject ? bundledCode : transpiledJs;
    const safeJavascript = escapeScriptContent(executableJavascript);
    const compiledJavaScriptString = JSON.stringify(executableJavascript);
    const compilationWarningScript = compilationError
      ? `
        console.warn('TypeScript compilation error — running raw code');
        console.error(${JSON.stringify(compilationError)});
      `
      : '';
    const jsxRuntimeScripts = usesBabel
      ? `
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`
      : '';
    const userCodeScript = usesBabel
      ? `<script type="text/babel">
${safeJavascript}
</script>`
      : '';

    // Get external libraries - NOTE: externalLibraryService.getLibraries() is not a
    // reactive dependency of this useCallback. Library changes are propagated via the
    // 'external-libraries-updated' event listener effect which calls refreshPreviewRef.
    // Do not remove that event listener without adding externalLibraries to deps.
    const externalLibraries = externalLibraryService.getLibraries();
    const externalLibsHTML = externalLibraryService.generateInjectionHTML();

    /*
     * Import map: resolves every bare specifier in the bundle (the framework
     * runtime, the JSX runtime and any npm package) to a CDN URL.
     *
     * One map for everything is what guarantees a single shared React/Vue
     * instance — CDN packages are fetched with esm.sh's `?external=react`, so
     * their own `react` import lands on this same entry rather than a second copy.
     */
    const importMapHTML =
      isFrameworkProject && Object.keys(importMap).length > 0
        ? `    <script type="importmap">${JSON.stringify({ imports: importMap })}</script>`
        : '';

    /*
     * The bundle is an ES module, so it must run as `type="module"`. Module
     * scripts are deferred, which conveniently means the mount node in <body>
     * already exists and the classic console-bridge script has already installed
     * its console overrides before any user code runs.
     */
    const moduleScript = isFrameworkProject
      ? `<script type="module">
${safeJavascript}
</script>`
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; object-src 'none';">
    <title>Preview</title>
    ${externalLibsHTML}
    ${jsxRuntimeScripts}
${importMapHTML}
    <style>
        body { 
            margin: 0; 
            padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: #333;
        }
        ${sanitizedCss}
    </style>
</head>
<body>
    ${effectiveHtml}
    <script>${buildConsoleBridgeScript(runId)}</script>
    <script>
        // External Libraries Loading Indicator
        if (${externalLibraries.length} > 0) {
            console.log('Loading ${externalLibraries.length} external libraries...');
        }
        ${compilationWarningScript}
        
        // Wait for external libraries to load before executing user code
        const waitForLibraries = () => {
            return new Promise((resolve) => {
                if (window.document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });
        };
        
        // Execute user code after libraries are loaded
        const executeUserCode = async () => {
            try {
                // Wait for external libraries to load
                await waitForLibraries();
                
                // Limit execution time to prevent infinite loops
                const startTime = Date.now();
                const MAX_EXECUTION_TIME = 5000; // 5 seconds
                
                const checkTimeout = () => {
                    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                        throw new Error('Script execution timeout');
                    }
                };
                
                ${usesBabel || isFrameworkProject
                  ? `// User code runs from a separate script tag below${isFrameworkProject
                      ? ' (an ES module, so it cannot be eval\'d).'
                      : ' (Babel).'}`
                  : `
                // Execute sanitized JavaScript
                const sanitizedJs = ${compiledJavaScriptString};
                eval(sanitizedJs);
                `}
                
                if (${externalLibraries.length} > 0) {
                    console.log('External libraries loaded successfully');
                }
                
            } catch (error) {
                // Re-thrown through console.error so the bridge captures the
                // real Error object, and with it a mappable stack trace.
                console.error(error);
            }
        };
        
        // Start execution when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeUserCode);
        } else {
            executeUserCode();
        }
    </script>
    ${userCodeScript}
    ${moduleScript}
</body>
</html>`;
  }, [html, css, transpiledJs, compilationError, jsEditorMode, isFrameworkProject, projectType, bundledCode, bundledCss, importMap]);

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      /*
       * Each document gets its own run id. Messages tagged with a superseded id
       * are discarded, so a slow log from the previous preview cannot appear
       * beneath the output of the one that replaced it.
       */
      runCounterRef.current += 1;
      const runId = `run-${runCounterRef.current}`;
      currentRunIdRef.current = runId;
      const content = generatePreviewContent(runId);
      setPreviewContent(content);
      iframeRef.current.srcdoc = content;
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [generatePreviewContent]);

  // Use a ref for refreshPreview to avoid dependency issues in event-listener effects
  const refreshPreviewRef = useRef(refreshPreview);
  useEffect(() => {
    refreshPreviewRef.current = refreshPreview;
  }, [refreshPreview]);

  // Refresh preview with debounce - HTML/CSS always update, JS only if autoRunJS is true
  const jsForPreview = autoRunJS ? javascript : '';
  const isInitialMount = useRef(true);
  useEffect(() => {
    // On initial mount, fire immediately to avoid blank iframe flash
    const delay = isInitialMount.current ? 0 : previewDelay;
    isInitialMount.current = false;
    const timeoutId = setTimeout(() => {
      refreshPreviewRef.current();
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [html, css, jsForPreview, jsEditorMode, previewDelay, manualRunTrigger, transpiledJs, bundledCode, bundledCss, projectType, importMap]);

  // Refresh preview when external libraries change
  useEffect(() => {
    const handleExternalLibrariesChange = () => {
      refreshPreviewRef.current();
    };

    window.addEventListener('storage', handleExternalLibrariesChange);
    window.addEventListener('external-libraries-updated', handleExternalLibrariesChange);

    return () => {
      window.removeEventListener('storage', handleExternalLibrariesChange);
      window.removeEventListener('external-libraries-updated', handleExternalLibrariesChange);
    };
  }, []);

  /*
   * Stack frames arrive as engine text (`at foo (about:srcdoc:12:5)`) and are
   * resolved here, where the shape of the generated document is known.
   *
   * Plain projects run the user's JS through `eval`, so engines report it
   * against `<anonymous>` with script-relative line numbers -- those map
   * directly onto the JS editor. Babel and bundled module output cannot be
   * mapped without source maps, so their frames stay unlinked rather than
   * pointing at a line that has nothing to do with the error.
   */
  const stackContext = useMemo<StackMappingContext>(
    () => ({
      userScriptStartLine: null,
      userScriptIsEvaluated: !isFrameworkProject && jsEditorMode !== 'jsx' && jsEditorMode !== 'tsx',
      scriptFile: 'javascript',
    }),
    [isFrameworkProject, jsEditorMode],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Scoped to this iframe: a bare `window` listener also caught messages
      // from unrelated frames and from other panels' preview documents.
      const message = parseBridgeMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!message) return;

      if (message.kind === 'lifecycle') {
        if (message.runId !== currentRunIdRef.current) return;
        onPreviewReset?.();
        return;
      }

      /*
       * `console.error(err)` carries no call-site stack of its own -- the useful
       * frames belong to the Error that was passed in. Hoist them so the row
       * gets clickable frames instead of burying them inside the argument.
       */
      const errorArgument = message.args.find(
        (arg): arg is Extract<typeof arg, { kind: 'error' }> =>
          arg.kind === 'error' && arg.stack.length > 0,
      );

      /*
       * An explicit Error's own trace beats the call site of the `console.error`
       * that reported it: the former points at where the failure happened, the
       * latter only at the bridge's interceptor.
       */
      const rawFrames = errorArgument ? errorArgument.stack : message.stack;

      const stack: ResolvedStackFrame[] = rawFrames.map((frame) => ({
        frame,
        location: mapStackFrame(frame, stackContext),
      }));

      /*
       * Keep the trace only when at least one frame resolves to a user file, or
       * when the message is an uncaught failure where the trace is the point.
       * Otherwise a plain `console.error('oops')` would trail several lines of
       * unclickable internal frames.
       */
      const hasMappedFrame = stack.some((entry) => entry.location !== null);
      const keepStack = hasMappedFrame || message.origin !== 'console';

      onConsoleMessage({
        level: message.level,
        origin: message.origin,
        args: message.args,
        stack: keepStack ? stack : [],
        timestamp: message.timestamp,
        groupDepth: message.groupDepth,
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleMessage, onPreviewReset, stackContext]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode === 'fullscreen') {
        setViewMode('desktop');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [viewMode]);

  const openInNewTab = () => {
    // A detached tab has no parent to post to; the bridge no-ops there.
    const content = generatePreviewContent('external');
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Get iframe container width based on view mode
  const getContainerWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      case 'fullscreen':
        return '100%';
    }
  };

  // Render preview content (used in both normal and fullscreen modes)
  const renderPreviewContent = () => (
    <>
      <div className={`${viewMode === 'fullscreen' ? 'bg-gray-800' : 'bg-gray-900'} px-4 py-2 border-b border-gray-700 flex items-center justify-between`}>
        <h2 className="text-sm font-medium text-gray-300">Live Preview</h2>
        <div className="flex items-center gap-3">
          {/* View Mode Toggles */}
          <div className="flex items-center gap-1 border border-gray-700 rounded bg-gray-800 p-1">
            <button
              onClick={() => handleViewModeChange('mobile')}
              className={`p-1.5 rounded transition-all ${viewMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('tablet')}
              className={`p-1.5 rounded transition-all ${viewMode === 'tablet'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('desktop')}
              className={`p-1.5 rounded transition-all ${viewMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700"></div>

          {/* Existing Controls */}
          <div className="flex items-center gap-2">
            {viewMode !== 'fullscreen' && (
              <button
                onClick={() => handleViewModeChange('fullscreen')}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={refreshPreview}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {/* Manual Run JS Button - only shown when auto-run is disabled */}
            {!autoRunJS && (
              <button
                onClick={() => setManualRunTrigger(prev => prev + 1)}
                className="p-1.5 hover:bg-gray-700 rounded text-green-400 hover:text-green-300 transition-colors"
                title="Run JavaScript"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={openInNewTab}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className={`relative ${viewMode === 'fullscreen' ? 'h-full' : 'h-full'} flex items-start justify-center overflow-auto bg-surface-canvas`}>
        {isResolvingPackages && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface-canvas/90 px-6 text-center">
            <Package className="h-6 w-6 animate-pulse text-accent" />
            <p className="text-sm font-medium text-content-secondary">Fetching packages from CDN…</p>
            <p className="text-xs text-content-muted">
              First time only — resolved packages are cached for this session.
            </p>
          </div>
        )}

        {isLoading && !isResolvingPackages && (
          <div className="absolute inset-0 bg-surface-canvas/75 flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        {/*
          Placeholder for a genuinely blank project. Sits above the iframe but
          stays click-through so it never interferes with the preview.
        */}
        {isProjectEmpty && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-lg border border-stroke-subtle bg-surface-raised p-3">
              <Eye className="h-6 w-6 text-content-muted" />
            </div>
            <p className="text-sm font-medium text-content-secondary">
              Start typing or use Build with AI to generate code
            </p>
            <p className="text-xs text-content-muted">
              Your live preview will appear here as you type
            </p>
          </div>
        )}
        <div
          id="preview-container"
          className="transition-all duration-300 ease-in-out h-full"
          style={{
            width: getContainerWidth(),
            maxWidth: '100%'
          }}
        >
          <iframe
            ref={iframeRef}
            className={`w-full h-full ${isProjectEmpty ? 'bg-transparent' : 'bg-white shadow-lg'}`}
            title="Code Preview"
            // Security trust model: The sandbox restricts the iframe to only scripts
            // and same-origin access. allow-same-origin is required for console message
            // passing between the iframe and parent via postMessage. User-authored code
            // runs in this sandbox and can access same-origin storage. No sensitive auth
            // tokens or secrets should be stored in localStorage/sessionStorage on this
            // origin. HTML sanitization was intentionally removed because this is a code
            // playground where users expect their script tags to execute.
            sandbox="allow-scripts allow-same-origin"
            srcDoc={previewContent}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Normal Preview Panel */}
      {viewMode !== 'fullscreen' && (
        <div className="w-full h-full bg-surface-base rounded-lg overflow-hidden border border-stroke-subtle flex flex-col">
          {renderPreviewContent()}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {viewMode === 'fullscreen' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          {/* Exit Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setViewMode('desktop')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors border border-gray-600 shadow-lg"
              title="Exit Fullscreen (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 flex flex-col">
            {renderPreviewContent()}
          </div>
        </div>
      )}
    </>
  );
});

export default PreviewPanel;
