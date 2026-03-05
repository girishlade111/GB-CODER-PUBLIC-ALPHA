import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Terminal, Copy, Maximize2, Minimize2,
  Filter, Trash2, AlertCircle, Info,
  AlertTriangle, Bug, Zap, CheckCircle, Eye, EyeOff,
  XCircle, Play, Cpu, HardDrive
} from 'lucide-react';
import { LogLevel } from '../types/console.types';
import { ConsoleLog } from '../types';
import TerminalConsolePanel from './Console/TerminalConsolePanel';

interface EnhancedConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
  html: string;
  css: string;
  javascript: string;
  className?: string;
}

type ConsoleMode = 'console' | 'validator' | 'preview' | 'terminal';

interface ValidationResult {
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: 'html' | 'css' | 'js';
}

const EnhancedConsole: React.FC<EnhancedConsoleProps> = ({
  logs,
  onClear,
  html,
  css,
  javascript,
  className = '',
}) => {
  // Core state
  const [activeMode, setActiveMode] = useState<ConsoleMode>('console');
  const [isExpanded, setIsExpanded] = useState(false);

  // Basic Console state
  const [basicFilter, setBasicFilter] = useState<LogLevel | 'all'>('all');

  // Validator state
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [autoValidate, setAutoValidate] = useState(true);

  // Preview Console state
  const [previewMessages, setPreviewMessages] = useState<Array<{
    id: string;
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    timestamp: number;
    source?: 'html' | 'css' | 'js';
    line?: number;
  }>>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    domNodes: 0,
    executionTime: 0
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Common refs
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top to show newest responses
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = 0;
    }
  }, [logs, previewMessages]);

  // Get filtered logs for Basic Console
  const filteredBasicLogs = useMemo(() => {
    if (basicFilter === 'all') return logs;
    return logs.filter(log => log.type === basicFilter);
  }, [logs, basicFilter]);

  // HTML Validation
  const validateHTML = useCallback((htmlCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Check for unclosed tags
      const openTags = htmlCode.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) || [];
      const closeTags = htmlCode.match(/<\/([a-z][a-z0-9]*)>/gi) || [];

      const openTagNames = openTags.map(tag => tag.match(/<([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);
      const closeTagNames = closeTags.map(tag => tag.match(/<\/([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);

      // Self-closing tags
      const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

      openTagNames.forEach((tag, index) => {
        if (tag && !selfClosing.includes(tag.toLowerCase())) {
          const openCount = openTagNames.filter(t => t === tag).length;
          const closeCount = closeTagNames.filter(t => t === tag).length;
          if (openCount !== closeCount) {
            const lineNumber = htmlCode.substring(0, index).split('\n').length;
            results.push({
              line: lineNumber,
              severity: 'error',
              message: `Unclosed tag: <${tag}>`,
              source: 'html'
            });
          }
        }
      });

      // Check for missing required attributes
      if (htmlCode.includes('<img') && !htmlCode.match(/<img[^>]+alt=/i)) {
        const lineNumber = htmlCode.split('\n').findIndex(line => line.includes('<img'));
        results.push({
          line: lineNumber + 1,
          severity: 'warning',
          message: 'Image tags should have alt attributes for accessibility',
          source: 'html'
        });
      }

      if (htmlCode.includes('<a') && !htmlCode.match(/<a[^>]+href=/i)) {
        const lineNumber = htmlCode.split('\n').findIndex(line => line.includes('<a'));
        results.push({
          line: lineNumber + 1,
          severity: 'warning',
          message: 'Anchor tags should have href attributes',
          source: 'html'
        });
      }

      // Check for deprecated tags
      const deprecatedTags = ['center', 'font', 'tt', 'strike', 'big'];
      deprecatedTags.forEach(deprecated => {
        const regex = new RegExp(`<${deprecated}[^>]*>`, 'gi');
        const matches = htmlCode.match(regex);
        if (matches) {
          matches.forEach(match => {
            const lineNumber = htmlCode.substring(0, htmlCode.indexOf(match)).split('\n').length;
            results.push({
              line: lineNumber,
              severity: 'warning',
              message: `Deprecated tag: ${match} - consider using modern alternatives`,
              source: 'html'
            });
          });
        }
      });

    } catch (error) {
      results.push({
        severity: 'error',
        message: `HTML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'html'
      });
    }

    return results;
  }, []);

  // CSS Validation
  const validateCSS = useCallback((cssCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Check for unclosed braces
      const openBraces = (cssCode.match(/{/g) || []).length;
      const closeBraces = (cssCode.match(/}/g) || []).length;

      if (openBraces !== closeBraces) {
        const lineNumber = cssCode.split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'error',
          message: 'Unclosed CSS braces - missing closing }',
          source: 'css'
        });
      }

      // Check for missing semicolons
      const rules = cssCode.match(/[^{}]+{[^{}]+}/g) || [];
      rules.forEach((rule) => {
        const declarations = rule.match(/{([^}]+)}/)?.[1];
        if (declarations) {
          const lines = declarations.split('\n').filter(l => l.trim());
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{')) {
              const lineNumber = cssCode.substring(0, cssCode.indexOf(rule)).split('\n').length +
                declarations.substring(0, declarations.indexOf(line)).split('\n').length;
              results.push({
                line: lineNumber,
                severity: 'warning',
                message: `Missing semicolon: ${trimmedLine.substring(0, 30)}...`,
                source: 'css'
              });
            }
          });
        }
      });

      // Check for invalid properties (basic validation)
      const invalidProperties = ['invalid-prop', 'badattribute', 'wrongstyle'];
      invalidProperties.forEach(prop => {
        const regex = new RegExp(`${prop}\\s*:`, 'gi');
        if (regex.test(cssCode)) {
          const lineNumber = cssCode.split('\n').findIndex(line => line.includes(prop));
          results.push({
            line: lineNumber + 1,
            severity: 'warning',
            message: `Potentially invalid CSS property: ${prop}`,
            source: 'css'
          });
        }
      });

    } catch (error) {
      results.push({
        severity: 'error',
        message: `CSS parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'css'
      });
    }

    return results;
  }, []);

  // JavaScript Validation
  const validateJS = useCallback((jsCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Basic syntax check using Function constructor
      new Function(jsCode);
    } catch (error) {
      if (error instanceof Error) {
        // Try to extract line number from error message
        const lineMatch = error.message.match(/line (\d+)/);
        const line = lineMatch ? parseInt(lineMatch[1]) : undefined;

        results.push({
          line,
          severity: 'error',
          message: `Syntax error: ${error.message}`,
          source: 'js'
        });
      }
    }

    // Check for common issues
    if (jsCode.includes('var ')) {
      const varMatches = jsCode.matchAll(/var\s+\w+/g);
      Array.from(varMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'warning',
          message: 'Consider using let or const instead of var',
          source: 'js'
        });
      });
    }

    if (jsCode.match(/==(?!=)/g)) {
      const doubleEqualsMatches = jsCode.matchAll(/[^=]==[^=]/g);
      Array.from(doubleEqualsMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'warning',
          message: 'Consider using === instead of == for strict equality',
          source: 'js'
        });
      });
    }

    if (jsCode.includes('===') && jsCode.match(/[^=]===[^=]/g)) {
      const tripleEqualsMatches = jsCode.matchAll(/[^=]===[^=]/g);
      Array.from(tripleEqualsMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'info',
          message: 'Good use of strict equality (===)',
          source: 'js'
        });
      });
    }

    // Check for console.log in production (if minified)
    if (jsCode.includes('console.log') && jsCode.length > 1000) {
      results.push({
        severity: 'warning',
        message: 'Consider removing console.log statements for production',
        source: 'js'
      });
    }

    return results;
  }, []);

  // Run validation
  const runValidation = useCallback(() => {
    const htmlErrors = validateHTML(html);
    const cssErrors = validateCSS(css);
    const jsErrors = validateJS(javascript);

    const allResults = [...htmlErrors, ...cssErrors, ...jsErrors];
    setValidationResults(allResults);

    return allResults;
  }, [html, css, javascript, validateHTML, validateCSS, validateJS]);

  // Auto-validate when code changes
  useEffect(() => {
    if (autoValidate && activeMode === 'validator') {
      const timer = setTimeout(runValidation, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, javascript, autoValidate, activeMode, runValidation]);

  // Add message to Preview Console
  const addPreviewMessage = useCallback((msg: Omit<typeof previewMessages[0], 'id' | 'timestamp'>) => {
    setPreviewMessages(prev => [...prev, {
      ...msg,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }]);
  }, []);

  // Clear Preview Console
  const clearPreviewMessages = () => {
    setPreviewMessages([]);
  };

  // Run code in iframe for Preview Console
  const runPreviewCode = useCallback(() => {
    if (!iframeRef.current) return;

    // Clear previous messages
    clearPreviewMessages();

    // Create complete HTML document
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    // Capture console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'log',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalLog.apply(console, args);
    };

    console.error = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalError.apply(console, args);
    };

    console.warn = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'warn',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalWarn.apply(console, args);
    };

    console.info = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'info',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalInfo.apply(console, args);
    };

    // Capture errors
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: message + ' (Line: ' + lineno + ')',
        source: 'js',
        line: lineno
      }, '*');
      return false;
    };

    // Performance monitoring
    window.addEventListener('load', function() {
      const loadTime = performance.now();
      window.parent.postMessage({
        type: 'performance',
        data: {
          loadTime: loadTime,
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
          domNodes: document.querySelectorAll('*').length
        }
      }, '*');
    });

    // Network request monitoring
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const startTime = Date.now();
      return originalFetch.apply(this, args).then(response => {
        const duration = Date.now() - startTime;
        window.parent.postMessage({
          type: 'network',
          data: {
            url: args[0],
            method: 'GET',
            status: response.status,
            duration: duration,
            timestamp: startTime
          }
        }, '*');
        return response;
      });
    };

    // Run user code
    try {
      ${javascript}
    } catch (error) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: 'Runtime error: ' + error.message,
        source: 'js'
      }, '*');
    }
  </script>
</body>
</html>
    `;

    // Write to iframe
    const iframeDoc = iframeRef.current.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(fullHTML);
      iframeDoc.close();
    }

    addPreviewMessage({ type: 'info', message: '✓ Code executed successfully' });
  }, [html, css, javascript, addPreviewMessage]);

  // Listen for messages from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addPreviewMessage({
          type: event.data.level,
          message: event.data.message,
          source: event.data.source,
          line: event.data.line,
        });
      } else if (event.data.type === 'performance') {
        setPerformanceMetrics(prev => ({ ...prev, ...event.data.data }));
      } else if (event.data.type === 'network') {
        // setNetworkRequests(prev => [...prev, event.data.data]); // Removed unused state update
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addPreviewMessage]);



  // UI Helper functions
  const getLogIcon = (type: ConsoleLog['type'] | LogLevel) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <Bug className="w-4 h-4 text-purple-400" />;
      case 'success': return <Zap className="w-4 h-4 text-green-400" />;
      case 'system': return <Terminal className="w-4 h-4 text-purple-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogColor = (type: ConsoleLog['type'] | LogLevel) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      case 'debug': return 'text-purple-300';
      case 'success': return 'text-green-300';
      case 'system': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  const getValidationIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getValidationColor = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
    }
  };

  // Copy output functions
  const copyBasicOutput = () => {
    const text = filteredBasicLogs.map(log =>
      `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyValidationResults = () => {
    const text = validationResults.map(result =>
      `[${result.source.toUpperCase()}] ${result.severity.toUpperCase()}${result.line ? ` (Line ${result.line})` : ''}: ${result.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyPreviewOutput = () => {
    const text = previewMessages.map(msg =>
      `[${new Date(msg.timestamp).toISOString()}] [${msg.type.toUpperCase()}] ${msg.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 flex flex-col h-full min-h-0 ${isExpanded ? 'fixed inset-4 z-50' : 'relative'
      } ${className}`}>
      {/* Header */}
      <div className="bg-dark-gray px-3 py-1.5 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h2 className="text-xs uppercase tracking-wide font-semibold text-gray-300">GB Console</h2>
          <span className="text-[10px] bg-blue-600/80 text-white px-2 py-0.5 rounded">
            {activeMode === 'console' ? filteredBasicLogs.length :
              activeMode === 'validator' ? validationResults.length :
                previewMessages.length} items
          </span>
        </div>

        <div className="flex items-center gap-1">

          {/* Auto-validate toggle (Validator mode) */}
          {activeMode === 'validator' && (
            <label className="flex items-center gap-1 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={autoValidate}
                onChange={(e) => setAutoValidate(e.target.checked)}
                className="rounded"
              />
              Auto-validate
            </label>
          )}

          {/* Preview toggle (Preview mode) */}
          {activeMode === 'preview' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Toggle Preview"
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={() => {
              switch (activeMode) {
                case 'console': copyBasicOutput(); break;
                case 'validator': copyValidationResults(); break;
                case 'preview': copyPreviewOutput(); break;
              }
            }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy Output"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Clear button */}
          <button
            onClick={() => {
              switch (activeMode) {
                case 'console':
                  onClear();
                  break;
                case 'validator':
                  setValidationResults([]);
                  break;
                case 'preview':
                  clearPreviewMessages();
                  break;
              }
            }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Run button (Preview mode) */}
          {activeMode === 'preview' && (
            <button
              onClick={runPreviewCode}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1"
              title="Run Code (Ctrl+Enter)"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          )}

          {/* Validate button (Validator mode) */}
          {activeMode === 'validator' && (
            <button
              onClick={runValidation}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1"
              title="Validate Now"
            >
              <CheckCircle className="w-3 h-3" />
              Validate
            </button>
          )}

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="bg-dark-gray border-b border-gray-700 flex items-center">
        {([
          { key: 'console', label: 'Console', icon: Terminal },
          { key: 'validator', label: 'Validator', icon: CheckCircle },
          { key: 'preview', label: 'Preview', icon: Play },
          { key: 'terminal', label: 'Terminal', icon: Terminal }
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={`px-4 py-2 text-sm border-r border-gray-700 flex items-center gap-2 ${activeMode === key
              ? 'bg-matte-black text-white border-b-2 border-b-vscode-statusbar'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filter Bar (Basic Console mode) */}
      {activeMode === 'console' && (
        <div className="bg-dark-gray border-b border-gray-700 px-3 py-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 mr-1">Filter:</span>
            {(['all', 'log', 'info', 'warn', 'error'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBasicFilter(filter)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${basicFilter === filter
                  ? 'bg-blue-600 text-white shadow-md border border-blue-500'
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
              >
                {filter === 'all' ? 'All' : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${activeMode === 'preview' && showPreview ? 'w-1/2' : 'w-full'}`}>

          {/* BASIC CONSOLE MODE */}
          {activeMode === 'console' && (
            <div ref={outputRef} className="bg-matte-black p-4 h-full overflow-y-auto font-mono text-sm">
              {filteredBasicLogs.length === 0 ? (
                <div className="text-gray-600 text-center py-12">
                  Console output will appear here...
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredBasicLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-1 border-b border-gray-800/50">
                      <span className="text-[10px] font-mono tabular-nums text-gray-500 mt-0.5 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {getLogIcon(log.type)}
                      <pre className={`flex-1 whitespace-pre-wrap ${getLogColor(log.type)}`}>
                        {log.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VALIDATOR MODE */}
          {activeMode === 'validator' && (
            <div className="bg-matte-black p-4 h-full overflow-y-auto">
              {validationResults.length === 0 ? (
                <div className="text-gray-600 text-center py-12">
                  No validation issues found.
                  <br />
                  <span className="text-xs">Code validation will appear here...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded border-l-4 ${result.severity === 'error' ? 'bg-red-900/20 border-red-400' :
                        result.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                          'bg-blue-900/20 border-blue-400'
                        }`}
                    >
                      {getValidationIcon(result.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded">
                            {result.source.toUpperCase()}
                          </span>
                          {result.line && (
                            <span className="text-xs text-gray-400">
                              Line {result.line}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${result.severity === 'error' ? 'bg-red-600 text-white' :
                            result.severity === 'warning' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                            {result.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className={`font-mono text-sm ${getValidationColor(result.severity)}`}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PREVIEW CONSOLE MODE */}
          {activeMode === 'preview' && (
            <div ref={outputRef} className="bg-matte-black p-4 h-full overflow-y-auto font-mono text-sm">
              {previewMessages.length === 0 ? (
                <div className="text-gray-600 text-center py-12">
                  Console output will appear here...
                  <br />
                  <span className="text-xs">Click Run or enable auto-run</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {previewMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 py-1 border-b border-gray-800/50">
                      <span className="text-[10px] font-mono tabular-nums text-gray-500 mt-0.5 flex-shrink-0">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {getLogIcon(msg.type)}
                      <pre className={`flex-1 whitespace-pre-wrap ${getLogColor(msg.type)}`}>
                        {msg.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TERMINAL MODE */}
          {activeMode === 'terminal' && (
            <div className="h-full w-full">
              <TerminalConsolePanel />
            </div>
          )}
        </div>

        {/* Preview Panel (Preview mode only) */}
        {activeMode === 'preview' && showPreview && (
          <div className="w-1/2 border-l border-gray-700 bg-white flex flex-col">
            <div className="bg-dark-gray px-4 py-2 border-b border-gray-700 text-sm text-gray-300 flex items-center justify-between">
              <span>Live Preview</span>
              <div className="flex items-center gap-2 text-xs">
                <Cpu className="w-3 h-3" />
                <span>{performanceMetrics.loadTime.toFixed(0)}ms</span>
                <HardDrive className="w-3 h-3 ml-2" />
                <span>{(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 flex-1"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default EnhancedConsole;
