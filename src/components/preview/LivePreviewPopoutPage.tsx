import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
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
  const [payload, setPayload] = useState<LivePreviewPayload | null>(() =>
    livePreviewChannel.getCurrentState(),
  );
  const [reloadCounter, setReloadCounter] = useState(0);
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>('100%');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial query parameter ?url= if passed directly via URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      const portParam = params.get('port');
      if (urlParam) {
        setPayload({
          type: 'dev_server',
          url: decodeURIComponent(urlParam),
          port: portParam ? parseInt(portParam, 10) : 3000,
          label: `Port ${portParam || 3000}`,
          timestamp: Date.now(),
        });
      }
    }

    const unsubscribe = livePreviewChannel.subscribe((newPayload) => {
      setIsConnected(true);
      if (newPayload.type === 'reload') {
        setReloadCounter((k) => k + 1);
      } else {
        setPayload(newPayload);
      }
    });

    return unsubscribe;
  }, []);

  const handleManualReload = () => {
    setReloadCounter((k) => k + 1);
    livePreviewChannel.broadcastReload();
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
            className="rounded-md p-1.5 text-[#b8b5ad] hover:bg-[#252320] hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Direct Raw URL link */}
          {devServerUrl && (
            <a
              href={devServerUrl}
              target="_blank"
              rel="noreferrer"
              title="Open Direct Dev Server URL"
              className="rounded-md p-1.5 text-[#b8b5ad] hover:bg-[#252320] hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
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
              key={`dev-server-${reloadCounter}-${devServerUrl}`}
              src={devServerUrl}
              title="Live Dev Server"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
            />
          </div>
        ) : srcDoc ? (
          <div
            style={{ width: deviceWidth }}
            className="h-full max-h-full transition-all duration-200 flex flex-col shadow-2xl bg-white"
          >
            <iframe
              key={`srcdoc-${reloadCounter}`}
              srcDoc={srcDoc}
              title="Live Standalone Preview"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
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
            {typeof window !== 'undefined' && window.opener && (
              <button
                onClick={() => window.opener?.focus()}
                className="mt-4 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Switch to GB Coder IDE Tab
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LivePreviewPopoutPage;
