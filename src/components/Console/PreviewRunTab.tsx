import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Cpu, HardDrive, Info, Play, Terminal } from 'lucide-react';

/**
 * The Preview sub-tab: a self-contained scratch runner with its own iframe,
 * separate from the main Live Preview.
 *
 * Behaviour is carried over unchanged from the previous implementation -- this
 * tab was explicitly out of scope. The one correction is that its `message`
 * listener now checks `event.source` against its own iframe. Previously it
 * listened on `window` with no source check, so it also captured output from the
 * main Live Preview and reported it here as if this runner had produced it.
 */

interface PreviewRunTabProps {
  html: string;
  css: string;
  javascript: string;
  showPreview: boolean;
  runSignal: number;
  onCountChange: (count: number) => void;
}

interface PreviewMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

const ICONS: Record<PreviewMessage['type'], React.ReactNode> = {
  error: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  info: <Info className="w-3.5 h-3.5 text-sky-400" />,
  log: <Terminal className="w-3.5 h-3.5 text-gray-500" />,
};

const COLORS: Record<PreviewMessage['type'], string> = {
  error: 'text-red-300',
  warn: 'text-amber-300',
  info: 'text-sky-300',
  log: 'text-gray-300',
};

const PreviewRunTab: React.FC<PreviewRunTabProps> = ({
  html,
  css,
  javascript,
  showPreview,
  runSignal,
  onCountChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [metrics, setMetrics] = useState({ loadTime: 0, memoryUsage: 0, domNodes: 0 });
  const idRef = useRef(0);

  useEffect(() => onCountChange(messages.length), [messages.length, onCountChange]);

  const addMessage = useCallback((type: PreviewMessage['type'], message: string) => {
    idRef.current += 1;
    setMessages((current) => [
      ...current,
      { id: `preview-${idRef.current}`, type, message, timestamp: Date.now() },
    ]);
  }, []);

  const run = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setMessages([]);

    const document_ = iframe.contentDocument;
    if (!document_) return;

    document_.open();
    document_.write(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>${css}</style></head>
<body>
${html}
<script>
  var forward = function (level, args) {
    window.parent.postMessage({
      type: 'gb-preview-run',
      level: level,
      message: args.map(function (a) {
        try { return typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a); }
        catch (e) { return String(a); }
      }).join(' ')
    }, '*');
  };
  ['log', 'error', 'warn', 'info'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      forward(level, args);
      try { original.apply(console, args); } catch (e) {}
    };
  });
  window.onerror = function (message, source, lineno) {
    forward('error', [message + ' (line ' + lineno + ')']);
    return false;
  };
  window.addEventListener('load', function () {
    window.parent.postMessage({
      type: 'gb-preview-perf',
      data: {
        loadTime: performance.now(),
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
        domNodes: document.querySelectorAll('*').length
      }
    }, '*');
  });
  try { ${javascript} } catch (error) { forward('error', ['Runtime error: ' + error.message]); }
</script>
</body>
</html>`);
    document_.close();
  }, [html, css, javascript]);

  // Run only on an explicit request, as before.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    run();
  }, [runSignal, run]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Scoped to this tab's own iframe.
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { type?: string; level?: PreviewMessage['type']; message?: string; data?: typeof metrics };
      if (data?.type === 'gb-preview-run' && data.level) {
        addMessage(data.level, data.message ?? '');
      } else if (data?.type === 'gb-preview-perf' && data.data) {
        setMetrics((current) => ({ ...current, ...data.data }));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addMessage]);

  return (
    <div className="flex h-full min-h-0">
      <div className={`overflow-y-auto font-mono text-xs bg-matte-black ${showPreview ? 'w-1/2' : 'w-full'}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 px-4 text-center">
            <Play className="w-5 h-5 mb-2 opacity-50" />
            <p className="text-sm">Press Run to execute this snippet in an isolated frame.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2 px-2 py-1 border-b border-gray-800/40">
              <span className="mt-0.5 flex-shrink-0">{ICONS[message.type]}</span>
              <pre className={`flex-1 whitespace-pre-wrap ${COLORS[message.type]}`}>{message.message}</pre>
            </div>
          ))
        )}
      </div>

      {showPreview && (
        <div className="w-1/2 border-l border-stroke-subtle bg-white flex flex-col min-h-0">
          <div className="bg-surface-raised px-3 py-1.5 border-b border-stroke-subtle text-xs text-content-secondary flex items-center justify-between flex-shrink-0">
            <span>Isolated run</span>
            <span className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              {metrics.loadTime.toFixed(0)}ms
              <HardDrive className="w-3 h-3 ml-1" />
              {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
            </span>
          </div>
          <iframe ref={iframeRef} className="w-full flex-1 border-0" title="Isolated preview" sandbox="allow-scripts" />
        </div>
      )}
    </div>
  );
};

export default PreviewRunTab;
