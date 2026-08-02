import React, { useEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Maximize2, X, Play, Eye, Package, RotateCcw, Laptop, ChevronDown, ZoomIn, Smartphone as MobileIcon, Sparkles, ShieldAlert } from 'lucide-react';
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

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'full';

export interface DevicePreset {
  id: DeviceType;
  name: string;
  width: number | '100%';
  height: number | '100%';
  icon: React.ElementType;
}

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: Smartphone },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'laptop', name: 'Laptop', width: 1024, height: 768, icon: Laptop },
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { id: 'full', name: 'Full Width', width: '100%', height: '100%', icon: Maximize2 },
];

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
  /** Custom Code Injections */
  customInjections?: any[];
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
  customInjections = [],
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Monotonic run counter, and the id of the document currently mounted. */
  const runCounterRef = useRef(0);
  const currentRunIdRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'fullscreen'>('normal');
  const [devicePreset, setDevicePreset] = useState<DeviceType>(() => {
    try { return (localStorage.getItem('gbcoder_device_preset') as DeviceType) || 'full'; }
    catch { return 'full'; }
  });
  const [isPortrait, setIsPortrait] = useState(true);
  const [scale, setScale] = useState(1);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileUA, setIsMobileUA] = useState(false);
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
  
  // Heartbeat & Safe Mode state
  const [isFrozen, setIsFrozen] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
    setIsFrozen(false);
    heartbeatTimeoutRef.current = setTimeout(() => {
      // If we don't receive a heartbeat for 5 seconds and it's not currently loading/empty, it's frozen
      if (!isLoading && !isProjectEmpty && iframeRef.current?.contentWindow) {
        setIsFrozen(true);
        if (iframeRef.current) iframeRef.current.srcdoc = ''; // Pause iframe immediately
      }
    }, 5000);
  }, [isLoading, isProjectEmpty]);

  useEffect(() => {
    // Clear heartbeat on unmount
    return () => {
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
    };
  }, []);

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

    const activeInjections = (customInjections || []).filter((i: any) => i.enabled);
    
    // Process inline injections
    const inlineCssInjections = activeInjections.filter((i: any) => i.type === 'css' && i.target === 'inline');
    const inlineJsInjections = activeInjections.filter((i: any) => i.type === 'js' && i.target === 'inline');
    
    const inlineCss = inlineCssInjections.map((i: any) => i.code).join('\n\n');
    const inlineJs = inlineJsInjections.map((i: any) => i.code).join('\n\n');

    const sanitizedCss = sanitizeCode(effectiveCss + (inlineCss ? '\n/* Custom Injections */\n' + inlineCss : ''), 'css');
    const usesBabel = !isFrameworkProject && (jsEditorMode === 'jsx' || jsEditorMode === 'tsx');
    const executableJavascript = (isFrameworkProject ? bundledCode : transpiledJs) + (inlineJs ? '\n// Custom Injections\n' + inlineJs : '');
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

    // Process tag injections
    const renderInjections = (injections: any[]) => {
      return injections.map((inj: any) => {
        if (inj.type === 'css') return `<style>\n${inj.code}\n</style>`;
        if (inj.type === 'js') return `<script>\n${inj.code}\n</script>`;
        return inj.code;
      }).join('\n');
    };

    const headInjections = renderInjections(activeInjections.filter((i: any) => i.target === 'head'));
    const beforeBodyInjections = renderInjections(activeInjections.filter((i: any) => i.target === 'before-body'));
    const afterBodyInjections = renderInjections(activeInjections.filter((i: any) => i.target === 'after-body'));

    const mockUAScript = isMobileUA
      ? `<script>
          Object.defineProperty(navigator, 'userAgent', {
            get: function () { return 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'; }
          });
          Object.defineProperty(navigator, 'maxTouchPoints', { get: function () { return 5; } });
         </script>`
      : '';

    const heartbeatScript = safeMode ? '' : `<script>
      setInterval(() => {
        window.parent.postMessage({ channel: 'gb-coder-preview-bridge', kind: 'heartbeat' }, '*');
      }, 2000);
    </script>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0${isMobileUA ? ', maximum-scale=1.0, user-scalable=0' : ''}">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; object-src 'none';">
    <title>Preview</title>
    ${mockUAScript}
    ${heartbeatScript}
    ${externalLibsHTML}
    ${jsxRuntimeScripts}
${importMapHTML}
    ${headInjections}
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
    ${beforeBodyInjections}
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
        ${safeMode ? 'console.warn("Running in Safe Mode: JavaScript execution is disabled.");' : `
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeUserCode);
        } else {
            executeUserCode();
        }`}
    </script>
    ${safeMode ? '' : userCodeScript}
    ${safeMode ? '' : moduleScript}
    ${afterBodyInjections}
</body>
</html>`;
  }, [html, css, transpiledJs, compilationError, jsEditorMode, isFrameworkProject, projectType, bundledCode, bundledCss, importMap, isMobileUA, customInjections]);

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
      
      // Throttle iframe refreshes to max 1 per 300ms visually
      if (iframeRef.current) {
         iframeRef.current.srcdoc = content;
         resetHeartbeat();
      }
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [generatePreviewContent]);

  // Use a ref for refreshPreview to avoid dependency issues in event-listener effects
  const refreshPreviewRef = useRef(refreshPreview);
  useEffect(() => {
    refreshPreviewRef.current = refreshPreview;
  }, [refreshPreview]);

  // Refresh preview with throttle (max 1 per previewDelay ms) - HTML/CSS always update, JS only if autoRunJS is true
  const jsForPreview = autoRunJS ? javascript : '';
  const isInitialMount = useRef(true);
  const lastRunTime = useRef<number>(0);
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      refreshPreviewRef.current();
      lastRunTime.current = Date.now();
      return;
    }

    const now = Date.now();
    const timeSinceLastRun = now - lastRunTime.current;

    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = null;
    }

    if (timeSinceLastRun >= previewDelay) {
      refreshPreviewRef.current();
      lastRunTime.current = now;
    } else {
      pendingTimeout.current = setTimeout(() => {
        refreshPreviewRef.current();
        lastRunTime.current = Date.now();
      }, previewDelay - timeSinceLastRun);
    }

    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, [html, css, jsForPreview, jsEditorMode, previewDelay, manualRunTrigger, transpiledJs, bundledCode, bundledCss, projectType, importMap, isMobileUA]);

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

      if (message.kind === 'heartbeat') {
        resetHeartbeat();
        return;
      }

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
        setViewMode('normal');
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

  const handleViewModeChange = (mode: 'fullscreen' | 'normal') => {
    setViewMode(mode);
  };

  const getContainerWidth = () => {
    const preset = DEVICE_PRESETS.find(p => p.id === devicePreset);
    if (!preset || preset.width === '100%') return '100%';
    return isPortrait ? `${preset.width}px` : `${preset.height}px`;
  };

  const getContainerHeight = () => {
    const preset = DEVICE_PRESETS.find(p => p.id === devicePreset);
    if (!preset || preset.height === '100%') return '100%';
    return isPortrait ? `${preset.height}px` : `${preset.width}px`;
  };

  useEffect(() => {
    const preset = DEVICE_PRESETS.find(p => p.id === devicePreset);
    if (!preset || preset.width === '100%') {
      setScale(1);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      const deviceW = isPortrait ? (preset.width as number) : (preset.height as number);
      const deviceH = isPortrait ? (preset.height as number) : (preset.width as number);
      
      const scaleX = Math.min(1, (width - 32) / deviceW);
      const scaleY = Math.min(1, (height - 32) / deviceH);
      setScale(Math.min(scaleX, scaleY));
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [devicePreset, isPortrait]);

  const handleDeviceChange = (deviceId: DeviceType) => {
    setDevicePreset(deviceId);
    setShowDeviceMenu(false);
    try { localStorage.setItem('gbcoder_device_preset', deviceId); } catch {}
  };

  // Render preview content (used in both normal and fullscreen modes)
  const renderPreviewContent = () => (
    <>
      <div className={`${viewMode === 'fullscreen' ? 'bg-gray-800' : 'bg-gray-900'} px-4 py-2 border-b border-gray-700 flex items-center justify-between`}>
        <h2 className="text-sm font-medium text-gray-300">Live Preview</h2>
        <div className="flex items-center gap-3">
          {/* View Mode Toggles */}
          {/* Device Simulator Toggles */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-700 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm"
            >
              {(() => {
                const preset = DEVICE_PRESETS.find(p => p.id === devicePreset);
                const Icon = preset?.icon || Maximize2;
                return <Icon className="w-4 h-4" />;
              })()}
              <span>{DEVICE_PRESETS.find(p => p.id === devicePreset)?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showDeviceMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDeviceMenu(false)}></div>
                <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {DEVICE_PRESETS.map(preset => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleDeviceChange(preset.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                          devicePreset === preset.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {preset.name}
                        </div>
                        {preset.width !== '100%' && (
                          <span className="text-xs text-gray-500">{isPortrait ? preset.width : preset.height}×{isPortrait ? preset.height : preset.width}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {devicePreset !== 'full' && (
            <button
              onClick={() => setIsPortrait(!isPortrait)}
              className="p-1.5 border border-gray-700 rounded bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
              title="Rotate Device"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {scale < 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded border border-gray-700" title="Auto-scaled to fit">
              <ZoomIn className="w-3 h-3" />
              {Math.round(scale * 100)}%
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700"></div>

          {/* Existing Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileUA(!isMobileUA)}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-semibold ${isMobileUA ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 border border-gray-700'}`}
              title="Toggle Mobile User Agent"
            >
              <MobileIcon className="w-3.5 h-3.5" /> UA
            </button>
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
      <div 
        ref={containerRef}
        className={`relative ${viewMode === 'fullscreen' ? 'h-full' : 'h-full'} flex items-center justify-center overflow-auto bg-surface-canvas py-4`}
      >
        {isResolvingPackages && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface-canvas/90 px-6 text-center">
            <Package className="h-6 w-6 animate-pulse text-accent" />
            <p className="text-sm font-medium text-content-secondary">Fetching packages from CDN…</p>
            <p className="text-xs text-content-muted">
              First time only — resolved packages are cached for this session.
            </p>
          </div>
        )}

        {isFrozen && !safeMode && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center backdrop-blur-sm">
            <ShieldAlert className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-bold text-white">Preview stopped responding</h3>
            <p className="text-sm text-gray-300 max-w-sm mb-4">
              We detected a possible infinite loop or heavy script that froze the preview. The preview has been paused to keep the editor responsive.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsFrozen(false);
                  refreshPreviewRef.current();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Reload Preview
              </button>
              <button
                onClick={() => {
                  setSafeMode(true);
                  setIsFrozen(false);
                  refreshPreviewRef.current();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Edit in Safe Mode
              </button>
            </div>
          </div>
        )}

        {safeMode && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-black px-3 py-1.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            SAFE MODE: JS Disabled
            <button 
              onClick={() => {
                setSafeMode(false);
                refreshPreviewRef.current();
              }}
              className="ml-2 px-2 py-0.5 bg-black/20 hover:bg-black/30 rounded transition-colors"
            >
              Resume JS
            </button>
          </div>
        )}

        {isLoading && !isResolvingPackages && !isFrozen && (
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
            <p className="text-xs text-content-muted mb-4">
              Your live preview will appear here as you type
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Build with AI
            </button>
          </div>
        )}
        
        {/* Large HTML Warning */}
        {html.length > 500000 && !isProjectEmpty && (
          <div className="absolute bottom-2 right-2 z-20 bg-amber-500 text-black px-3 py-1.5 rounded-md shadow-lg flex items-center gap-2 text-xs font-bold opacity-75 hover:opacity-100 transition-opacity">
            Large HTML detected — preview may be slower
          </div>
        )}
        <div
          id="preview-container"
          className="transition-all duration-300 ease-in-out relative flex-shrink-0"
          style={{
            width: getContainerWidth(),
            height: getContainerHeight(),
            maxWidth: devicePreset === 'full' ? '100%' : 'none',
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'center center',
            borderRadius: devicePreset !== 'full' ? '12px' : '0',
            overflow: 'hidden',
            boxShadow: devicePreset !== 'full' ? '0 0 0 10px #1a1a1a, 0 0 0 11px #333, 0 20px 40px rgba(0,0,0,0.5)' : 'none',
            background: 'white'
          }}
        >
          {devicePreset !== 'full' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#1a1a1a] rounded-b-xl z-20 pointer-events-none opacity-50"></div>
          )}
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
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setViewMode('normal')}
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
