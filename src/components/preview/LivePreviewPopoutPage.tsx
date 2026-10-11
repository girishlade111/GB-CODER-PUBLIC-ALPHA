import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Laptop,
  Maximize2,
  Minimize2,
  Monitor,
  Radio,
  RotateCcw,
  Smartphone,
  Tablet,
} from 'lucide-react';
import {
  livePreviewChannel,
  LivePreviewPayload,
} from '../../services/preview/livePreviewChannel';

type DeviceWidth = '100%' | '1440px' | '768px' | '375px';

export const LivePreviewPopoutPage: React.FC = () => {
  // Synchronous initialization: parse query params immediately on first paint
  const [payload, setPayload] = useState<LivePreviewPayload | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      const portParam = params.get('port');
      if (urlParam) {
        return {
          type: 'dev_server',
          url: decodeURIComponent(urlParam),
          port: portParam ? parseInt(portParam, 10) : 5173,
          label: `Port ${portParam || 5173}`,
          timestamp: Date.now(),
        };
      }
    }
    return livePreviewChannel.getCurrentState();
  });

  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>('100%');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcDocIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const unsubscribe = livePreviewChannel.subscribe((newPayload) => {
      if (newPayload.type === 'reload') {
        handleManualReload();
      } else if (newPayload.type === 'dev_server_offline') {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setPayload(newPayload);
      }
    });

    return unsubscribe;
  }, []);

  const handleManualReload = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.location?.reload();
      } catch {
        // Cross-origin fallback: re-assigning src reloads without destroying DOM node
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = currentSrc;
      }
    }
    if (srcDocIframeRef.current) {
      try {
        srcDocIframeRef.current.contentWindow?.location?.reload();
      } catch {
        // Ignored
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const srcDoc = useMemo(() => {
    if (!payload || payload.type !== 'standalone_code') return null;
    const { html, css, javascript } = payload;
    const trimmed = (html || '').trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<!doctype')) {
      return trimmed;
    }
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live Preview</title>
  <style>
    ${css || ''}
  </style>
</head>
<body>
  ${html || ''}
  <script>
    try {
      ${javascript || ''}
    } catch (err) {
      console.error('[LivePreview]', err);
    }
  </script>
</body>
</html>
    `.trim();
  }, [payload]);

  const devServerUrl = payload?.type === 'dev_server' ? payload.url : null;
  const devServerPort = payload?.type === 'dev_server' ? payload.port : null;

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#121110] text-[#faf9f5]"
    >
      {/* Top Browser Bar */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#2d2b27] bg-[#1a1917] px-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 rounded-md bg-[#252320] px-2 py-1 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-xs tracking-tight text-white">
              GB Coder Live
            </span>
          </div>

          {devServerPort && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <Radio className="h-3 w-3" />
              Port {devServerPort}
            </span>
          )}

          {!isConnected && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
              IDE Disconnected
            </span>
          )}
        </div>

        {/* Center: Address Bar */}
        <div className="mx-2 flex max-w-xl flex-1 items-center rounded-lg border border-[#3a3631] bg-[#121110] px-3 py-1 text-xs text-[#b8b5ad]">
          <span className="truncate font-mono text-[11px]">
            {devServerUrl || (payload ? 'in-memory://app-preview' : 'connecting...')}
          </span>
        </div>

        {/* Right: Controls & Viewport presets */}
        <div className="flex items-center gap-1">
          {/* Device Size Toggles */}
          <div className="hidden md:flex items-center rounded-md bg-[#252320] p-0.5 border border-[#3a3631]">
            <button
              onClick={() => setDeviceWidth('100%')}
              title="Responsive 100%"
              className={`rounded p-1 text-xs transition-colors ${
                deviceWidth === '100%'
                  ? 'bg-accent text-white'
                  : 'text-[#8e8b82] hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeviceWidth('1440px')}
              title="Desktop (1440px)"
              className={`rounded p-1 text-xs transition-colors ${
                deviceWidth === '1440px'
                  ? 'bg-accent text-white'
                  : 'text-[#8e8b82] hover:text-white'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeviceWidth('768px')}
              title="Tablet (768px)"
              className={`rounded p-1 text-xs transition-colors ${
                deviceWidth === '768px'
                  ? 'bg-accent text-white'
                  : 'text-[#8e8b82] hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeviceWidth('375px')}
              title="Mobile (375px)"
              className={`rounded p-1 text-xs transition-colors ${
                deviceWidth === '375px'
                  ? 'bg-accent text-white'
                  : 'text-[#8e8b82] hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reload Button */}
          <button
            onClick={handleManualReload}
            title="Reload Preview"
            data-testid="popout-reload-btn"
            className="rounded-md p-1.5 text-[#b8b5ad] hover:bg-[#252320] hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Copy Preview URL Button */}
          <button
            onClick={handleCopyUrl}
            title={copied ? 'Copied Preview URL!' : 'Copy Preview URL'}
            data-testid="popout-copy-url-btn"
            className="rounded-md p-1.5 text-[#b8b5ad] hover:bg-[#252320] hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            data-testid="popout-fullscreen-btn"
            className="rounded-md p-1.5 text-[#b8b5ad] hover:bg-[#252320] hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-accent" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="relative flex flex-1 items-center justify-center overflow-auto bg-[#0a0a09] p-0">
        {devServerUrl ? (
          <div
            style={{ width: deviceWidth }}
            className="h-full max-h-full transition-all duration-200 flex flex-col shadow-2xl bg-white"
          >
            <iframe
              ref={iframeRef}
              src={devServerUrl}
              title="Live Dev Server"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
              data-testid="popout-preview-iframe"
            />
          </div>
        ) : srcDoc ? (
          <div
            style={{ width: deviceWidth }}
            className="h-full max-h-full transition-all duration-200 flex flex-col shadow-2xl bg-white"
          >
            <iframe
              ref={srcDocIframeRef}
              srcDoc={srcDoc}
              title="Live Standalone Preview"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              data-testid="popout-srcdoc-iframe"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#8e8b82]">
            <div className="h-10 w-10 rounded-full bg-[#1a1917] flex items-center justify-center mb-4 border border-[#2d2b27] animate-pulse">
              <Radio className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Waiting for Live Preview...
            </h2>
            <p className="mt-1 text-xs max-w-sm leading-relaxed text-[#8e8b82]">
              Start your dev server (e.g. <code className="text-accent">npm run dev</code>)
              in the GB Coder IDE terminal or make an edit to display your live preview here.
            </p>
            <p className="mt-3 text-[11px] max-w-xs text-[#6e6b62]">
              ⚡ Live WebContainer preview is served dynamically by the active GB Coder IDE session in this browser.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LivePreviewPopoutPage;
