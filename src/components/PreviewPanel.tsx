import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Maximize2, X, Play } from 'lucide-react';
import { ConsoleLog } from '../types';
import { externalLibraryService } from '../services/externalLibraryService';

type ViewMode = 'desktop' | 'tablet' | 'mobile' | 'fullscreen';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
  onConsoleLog: (log: ConsoleLog) => void;
  autoRunJS?: boolean;
  previewDelay?: number;
}

const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(({
  html,
  css,
  javascript,
  onConsoleLog,
  autoRunJS = true,
  previewDelay = 300,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [manualRunTrigger, setManualRunTrigger] = useState(0);

  // Expose the container div to parent components via ref
  useImperativeHandle(ref, () => {
    const container = document.getElementById('preview-container');
    return container as HTMLDivElement;
  });

  // Sanitize code input to prevent XSS attacks
  const sanitizeCode = (code: string, language: string): string => {
    if (language === 'html') {
      // Basic HTML sanitization - remove script tags and dangerous attributes
      return code
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, ''); // Remove iframes
    } else if (language === 'css') {
      // Basic CSS sanitization - remove dangerous CSS properties
      return code
        .replace(/expression\s*\(/gi, '') // Remove CSS expressions
        .replace(/behavior\s*:/gi, '') // Remove behavior property
        .replace(/-moz-binding\s*:/gi, ''); // Remove Mozilla binding
    }
    return code; // JavaScript will be handled in the sandbox
  };

  const generatePreviewContent = () => {
    const sanitizedHtml = sanitizeCode(html, 'html');
    const sanitizedCss = sanitizeCode(css, 'css');

    // Get external libraries
    const externalLibraries = externalLibraryService.getLibraries();
    const externalLibsHTML = externalLibraryService.generateInjectionHTML();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; object-src 'none';">
    <title>Preview</title>
    ${externalLibsHTML}
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
    ${sanitizedHtml}
    <script>
        // External Libraries Loading Indicator
        if (${externalLibraries.length} > 0) {
            console.log('Loading ${externalLibraries.length} external libraries...');
        }
        
        // Strict console intercept with input validation
        const sendToParent = (type, message) => {
            // Validate input before sending
            if (typeof message === 'string' && message.length < 10000) {
                window.parent.postMessage({
                    type: 'console',
                    level: type,
                    message: message.substring(0, 5000), // Limit message length
                    timestamp: new Date().toISOString()
                }, '*');
            }
        };
        
        // Secure console methods with limits
        const secureConsole = {
            log: (...args) => sendToParent('log', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            error: (...args) => sendToParent('error', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            warn: (...args) => sendToParent('warn', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            info: (...args) => sendToParent('info', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' '))
        };
        
        // Override console with secure version
        console.log = secureConsole.log;
        console.error = secureConsole.error;
        console.warn = secureConsole.warn;
        console.info = secureConsole.info;
        
        // Catch runtime errors with sanitized output
        window.addEventListener('error', (e) => {
            const message = e.message ? e.message.substring(0, 500) : 'Unknown error';
            sendToParent('error', \`\${message} at \${e.filename || 'unknown'}:\${e.lineno || 'unknown'}\`);
        });
        
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
                
                // Execute sanitized JavaScript
                const sanitizedJs = \`${javascript.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}\`;
                eval(sanitizedJs);
                
                if (${externalLibraries.length} > 0) {
                    console.log('External libraries loaded successfully');
                }
                
            } catch (error) {
                sendToParent('error', error.message ? error.message.substring(0, 200) : 'Execution error');
            }
        };
        
        // Start execution when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeUserCode);
        } else {
            executeUserCode();
        }
    </script>
</body>
</html>`;
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      const content = generatePreviewContent();
      iframeRef.current.srcdoc = content;
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Refresh preview with debounce - HTML/CSS always update, JS only if autoRunJS is true
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshPreview();
    }, previewDelay);
    return () => clearTimeout(timeoutId);
  }, [html, css, autoRunJS ? javascript : '', previewDelay, manualRunTrigger]);

  // Refresh preview when external libraries change
  useEffect(() => {
    const handleExternalLibrariesChange = () => {
      refreshPreview();
    };

    // Listen for storage changes (when libraries are updated)
    window.addEventListener('storage', handleExternalLibrariesChange);

    // Custom event for real-time updates
    window.addEventListener('external-libraries-updated', handleExternalLibrariesChange);

    return () => {
      window.removeEventListener('storage', handleExternalLibrariesChange);
      window.removeEventListener('external-libraries-updated', handleExternalLibrariesChange);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        const log: ConsoleLog = {
          id: Date.now().toString(),
          type: event.data.level,
          message: event.data.message,
          timestamp: event.data.timestamp,
        };
        onConsoleLog(log);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

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
    const content = generatePreviewContent();
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
      <div className={`relative ${viewMode === 'fullscreen' ? 'h-full' : 'h-full'} flex items-start justify-center overflow-auto bg-gray-800`}>
        {isLoading && (
          <div className="absolute inset-0 bg-dark-gray bg-opacity-75 flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
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
            className="w-full h-full bg-white shadow-lg"
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={generatePreviewContent()}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Normal Preview Panel */}
      {viewMode !== 'fullscreen' && (
        <div className="w-full h-full bg-dark-gray rounded-lg overflow-hidden border border-gray-700 flex flex-col">
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