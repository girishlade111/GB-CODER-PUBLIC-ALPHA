// Web Development Optimized Console for HTML, CSS, and JavaScript
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal, Play, Code, Palette, FileCode, AlertCircle, CheckCircle,
  Copy, Download, Maximize2, Minimize2, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { syntaxHighlighter } from '../services/syntaxHighlighter';

interface WebConsoleProps {
  html: string;
  css: string;
  javascript: string;
  onHtmlChange?: (html: string) => void;
  onCssChange?: (css: string) => void;
  onJsChange?: (js: string) => void;
  className?: string;
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
  source?: 'html' | 'css' | 'js';
  line?: number;
}

const WebDevConsole: React.FC<WebConsoleProps> = ({
  html,
  css,
  javascript,
  className = '',
}) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'html' | 'css' | 'js'>('console');
  const [showPreview, setShowPreview] = useState(true);
  const [autoRun, setAutoRun] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Add message to console
  const addMessage = useCallback((msg: Omit<ConsoleMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }]);
  }, []);

  // Clear console
  const clearConsole = () => {
    setMessages([]);
  };

  // Validate HTML
  const validateHTML = useCallback((htmlCode: string) => {
    const errors: string[] = [];
    
    // Check for unclosed tags
    const openTags = htmlCode.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) || [];
    const closeTags = htmlCode.match(/<\/([a-z][a-z0-9]*)>/gi) || [];
    
    const openTagNames = openTags.map(tag => tag.match(/<([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);
    const closeTagNames = closeTags.map(tag => tag.match(/<\/([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);
    
    // Self-closing tags
    const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    
    openTagNames.forEach(tag => {
      if (tag && !selfClosing.includes(tag.toLowerCase())) {
        const openCount = openTagNames.filter(t => t === tag).length;
        const closeCount = closeTagNames.filter(t => t === tag).length;
        if (openCount !== closeCount) {
          errors.push(`Unclosed tag: <${tag}>`);
        }
      }
    });

    // Check for required attributes
    if (htmlCode.includes('<img') && !htmlCode.match(/<img[^>]+alt=/i)) {
      errors.push('Image tags should have alt attributes');
    }

    return errors;
  }, []);

  // Validate CSS
  const validateCSS = useCallback((cssCode: string) => {
    const errors: string[] = [];
    
    // Check for unclosed braces
    const openBraces = (cssCode.match(/{/g) || []).length;
    const closeBraces = (cssCode.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unclosed CSS braces');
    }

    // Check for missing semicolons
    const rules = cssCode.match(/[^{}]+{[^{}]+}/g) || [];
    rules.forEach(rule => {
      const declarations = rule.match(/{([^}]+)}/)?.[1];
      if (declarations) {
        const lines = declarations.split('\n').filter(l => l.trim());
        lines.forEach(line => {
          if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{')) {
            errors.push(`Missing semicolon: ${line.trim().substring(0, 30)}...`);
          }
        });
      }
    });

    return errors;
  }, []);

  // Validate JavaScript
  const validateJS = useCallback((jsCode: string) => {
    const errors: string[] = [];
    
    try {
      // Basic syntax check using Function constructor
      new Function(jsCode);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`Syntax error: ${error.message}`);
      }
    }

    // Check for common issues
    if (jsCode.includes('var ')) {
      errors.push('Consider using let or const instead of var');
    }

    if (jsCode.match(/==(?!=)/g)) {
      errors.push('Consider using === instead of ==');
    }

    return errors;
  }, []);

  // Run code in iframe
  const runCode = useCallback(() => {
    if (!iframeRef.current) return;

    // Validate code
    const htmlErrors = validateHTML(html);
    const cssErrors = validateCSS(css);
    const jsErrors = validateJS(javascript);

    // Clear previous messages
    clearConsole();

    // Show validation errors
    htmlErrors.forEach(err => addMessage({ type: 'warn', message: `HTML: ${err}`, source: 'html' }));
    cssErrors.forEach(err => addMessage({ type: 'warn', message: `CSS: ${err}`, source: 'css' }));
    jsErrors.forEach(err => addMessage({ type: 'error', message: `JS: ${err}`, source: 'js' }));

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

    addMessage({ type: 'info', message: '✓ Code executed successfully' });
  }, [html, css, javascript, validateHTML, validateCSS, validateJS, addMessage]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addMessage({
          type: event.data.level,
          message: event.data.message,
          source: event.data.source,
          line: event.data.line,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addMessage]);

  // Auto-run on code change
  useEffect(() => {
    if (autoRun) {
      const timer = setTimeout(runCode, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, javascript, autoRun, runCode]);

  // Get syntax highlighted code
  const getHighlightedCode = (code: string, language: 'html' | 'css' | 'javascript') => {
    const tokens = syntaxHighlighter.highlight(code, language);
    return syntaxHighlighter.toHTML(code, tokens);
  };

  // Copy code
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addMessage({ type: 'info', message: 'Code copied to clipboard' });
  };

  // Download code
  const downloadCode = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Project</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${javascript}</script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get message icon
  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get message color
  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${
      isExpanded ? 'fixed inset-4 z-50' : 'relative'
    } ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-300">Web Dev Console</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
            {messages.length} messages
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={runCode}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3" />
            Run
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Toggle Preview"
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={downloadCode}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Download HTML"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearConsole}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Clear Console"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center">
        {(['console', 'html', 'css', 'js'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-r border-gray-700 ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
            }`}
          >
            {tab === 'console' && <Terminal className="w-4 h-4 inline mr-1" />}
            {tab === 'html' && <FileCode className="w-4 h-4 inline mr-1" />}
            {tab === 'css' && <Palette className="w-4 h-4 inline mr-1" />}
            {tab === 'js' && <Code className="w-4 h-4 inline mr-1" />}
            {tab.toUpperCase()}
          </button>
        ))}

        <label className="ml-auto px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRun}
            onChange={(e) => setAutoRun(e.target.checked)}
            className="rounded"
          />
          Auto-run
        </label>
      </div>

      <div className="flex" style={{ height: isExpanded ? 'calc(100vh - 200px)' : '400px' }}>
        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${showPreview ? 'w-1/2' : 'w-full'}`}>
          {/* Console Tab */}
          {activeTab === 'console' && (
            <div ref={outputRef} className="bg-black p-4 h-full overflow-y-auto font-mono text-sm">
              {messages.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  Console output will appear here...
                  <br />
                  <span className="text-xs">Click Run or enable Auto-run</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 py-1">
                      <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {getMessageIcon(msg.type)}
                      <pre className={`flex-1 whitespace-pre-wrap ${getMessageColor(msg.type)}`}>
                        {msg.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HTML Tab */}
          {activeTab === 'html' && (
            <div className="bg-gray-900 p-4 h-full overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">HTML Code</span>
                <button
                  onClick={() => copyCode(html)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div
                className="bg-black p-4 rounded font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: getHighlightedCode(html, 'html') }}
              />
            </div>
          )}

          {/* CSS Tab */}
          {activeTab === 'css' && (
            <div className="bg-gray-900 p-4 h-full overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">CSS Code</span>
                <button
                  onClick={() => copyCode(css)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div
                className="bg-black p-4 rounded font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: getHighlightedCode(css, 'css') }}
              />
            </div>
          )}

          {/* JavaScript Tab */}
          {activeTab === 'js' && (
            <div className="bg-gray-900 p-4 h-full overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">JavaScript Code</span>
                <button
                  onClick={() => copyCode(javascript)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div
                className="bg-black p-4 rounded font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: getHighlightedCode(javascript, 'javascript') }}
              />
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-700 bg-white">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-sm text-gray-300">
              Live Preview
            </div>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDevConsole;
