import React from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lock,
  Copy,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Columns,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../ui/Tooltip';
import StackBlitzStartupLoader from '../vscode/StackBlitzStartupLoader';
import { webcontainerService } from '../../services/webcontainer/webcontainerService';

interface WorkbenchLivePreviewProps {
  activePreview: { url: string; port: number; label: string } | null;
  webcontainerState: {
    startupStage: string;
    serverPort: number | null;
    serverUrl?: string | null;
    runtimeError?: { message: string } | null;
  };
  deviceViewport: 'desktop' | 'tablet' | 'mobile';
  setDeviceViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isReloadingPreview: boolean;
  onReloadPreview: () => Promise<void>;
  onOpenInNewTab: () => void;
  previewLoadError: string | null;
  copiedUrl: boolean;
  setCopiedUrl: (v: boolean) => void;
  previewIframeRef: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
  onIframeError: () => void;
  onOpenTerminal: () => void;
  onStartDevServer: () => void;
  onInstallDependencies: () => void;
  onRestartDevServer: () => void;
  onMaximizeWidth?: () => void;
  onFullscreen?: () => void;
}

export const WorkbenchLivePreview: React.FC<WorkbenchLivePreviewProps> = ({
  activePreview,
  webcontainerState,
  deviceViewport,
  setDeviceViewport,
  isReloadingPreview,
  onReloadPreview,
  onOpenInNewTab,
  previewLoadError,
  copiedUrl,
  setCopiedUrl,
  previewIframeRef,
  onIframeLoad,
  onIframeError,
  onOpenTerminal,
  onStartDevServer,
  onInstallDependencies,
  onRestartDevServer,
  onMaximizeWidth,
  onFullscreen,
}) => {
  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-[#181A20] select-none">
      {/* Live Preview Address Bar / Controls */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#343945] bg-[#20232B] px-2 text-xs">
        {/* Navigation & Reload */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => void onReloadPreview()}
            disabled={isReloadingPreview || !activePreview?.url}
            title={
              !activePreview?.url
                ? 'Development server not running'
                : isReloadingPreview
                ? 'Reloading preview...'
                : 'Reload Live Preview'
            }
            className={`rounded p-1 transition-colors ${
              !activePreview?.url
                ? 'text-[#697487] cursor-not-allowed'
                : isReloadingPreview
                ? 'text-cyan-400 bg-white/5 cursor-wait'
                : 'text-[#9AA4B5] hover:bg-white/10 hover:text-[#E5E9F1]'
            }`}
            data-testid="preview-reload-btn"
          >
            <RotateCcw className={`h-3 w-3 ${isReloadingPreview ? 'animate-spin' : ''}`} />
          </button>
          <Tooltip label="Browser history navigation is disabled across container sandbox origin" side="bottom">
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Back"
              className="rounded p-1 text-[#697487] cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          </Tooltip>
          <Tooltip label="Browser history navigation is disabled across container sandbox origin" side="bottom">
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Forward"
              className="rounded p-1 text-[#697487] cursor-not-allowed"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>

        {/* URL Pill */}
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded border border-[#343945] bg-[#181A20] px-2 py-0.5 text-[10px] text-[#E5E9F1] font-mono shadow-inner mx-1.5 group cursor-pointer hover:border-[#6366F1]/50 transition-all truncate"
          onClick={() => {
            if (!activePreview?.url && !webcontainerState.serverPort) {
              toast('Development server is offline. No URL to copy.', { icon: 'ℹ️' });
              return;
            }
            const url = activePreview?.url || `http://localhost:${webcontainerState.serverPort}/`;
            void navigator.clipboard?.writeText(url);
            setCopiedUrl(true);
            toast.success('URL copied to clipboard!');
            setTimeout(() => setCopiedUrl(false), 2000);
          }}
          title={
            activePreview?.url || webcontainerState.serverPort
              ? 'Click to copy URL'
              : 'Development server offline'
          }
          role="button"
          tabIndex={0}
          aria-label={
            activePreview?.url || webcontainerState.serverPort
              ? `Live preview URL: ${activePreview?.url || `localhost:${webcontainerState.serverPort}/`}`
              : 'Development server offline'
          }
        >
          <Lock
            className={`h-2.5 w-2.5 shrink-0 ${
              activePreview?.url || webcontainerState.serverPort ? 'text-emerald-400' : 'text-[#697487]'
            }`}
          />
          <span className="truncate text-[#E5E9F1]">
            {activePreview?.url
              ? activePreview.url.replace(/^https?:\/\//, '')
              : webcontainerState.serverPort
              ? `localhost:${webcontainerState.serverPort}/`
              : 'Server Offline'}
          </span>
          {(activePreview?.url || webcontainerState.serverPort) && (
            <span className="ml-auto opacity-0 group-hover:opacity-100 text-[#697487] hover:text-[#E5E9F1] shrink-0">
              {copiedUrl ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
            </span>
          )}
        </div>

        {/* Right Actions: Viewport mode, Popout, Maximize, Fullscreen */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Responsive Device Viewport Toggles */}
          <div className="hidden sm:flex items-center rounded bg-[#181A20] border border-[#343945] p-0.5">
            <button
              type="button"
              onClick={() => setDeviceViewport('desktop')}
              title="Desktop (100% Fluid)"
              className={`rounded p-0.5 transition-colors ${
                deviceViewport === 'desktop' ? 'bg-[#6366F1] text-white' : 'text-[#9AA4B5] hover:text-white'
              }`}
            >
              <Monitor className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('tablet')}
              title="Tablet Viewport (768px)"
              className={`rounded p-0.5 transition-colors ${
                deviceViewport === 'tablet' ? 'bg-[#6366F1] text-white' : 'text-[#9AA4B5] hover:text-white'
              }`}
            >
              <Tablet className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('mobile')}
              title="Mobile Viewport (375px)"
              className={`rounded p-0.5 transition-colors ${
                deviceViewport === 'mobile' ? 'bg-[#6366F1] text-white' : 'text-[#9AA4B5] hover:text-white'
              }`}
            >
              <Smartphone className="h-3 w-3" />
            </button>
          </div>

          {/* Popout */}
          <Tooltip
            label={!activePreview?.url ? 'Preview not ready (server offline)' : 'Open in New Tab'}
            side="bottom"
          >
            <button
              type="button"
              onClick={onOpenInNewTab}
              disabled={!activePreview?.url}
              title={
                !activePreview?.url
                  ? 'Development server not running'
                  : 'Open in New Tab (Live Popout)'
              }
              className={`rounded p-1 transition-colors ${
                !activePreview?.url
                  ? 'text-[#697487] cursor-not-allowed'
                  : 'text-[#9AA4B5] hover:bg-white/10 hover:text-white'
              }`}
              data-testid="preview-open-new-tab-btn"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          </Tooltip>

          {/* Maximize Width Toggle */}
          {onMaximizeWidth && (
            <Tooltip label="Toggle Panel Width" side="bottom">
              <button
                type="button"
                onClick={onMaximizeWidth}
                className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white transition-colors"
              >
                <Columns className="h-3 w-3" />
              </button>
            </Tooltip>
          )}

          {/* Fullscreen Toggle */}
          {onFullscreen && (
            <Tooltip label="Fullscreen Preview" side="bottom">
              <button
                type="button"
                onClick={onFullscreen}
                className="rounded p-1 text-[#9AA4B5] hover:bg-white/10 hover:text-white transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-hidden relative bg-[#181A20]">
        {activePreview?.url ? (
          <div
            className={`h-full w-full flex items-center justify-center ${
              deviceViewport === 'mobile'
                ? 'p-4 bg-[#121318]'
                : deviceViewport === 'tablet'
                ? 'p-2 bg-[#121318]'
                : ''
            }`}
          >
            <div
              style={{
                width:
                  deviceViewport === 'mobile'
                    ? '375px'
                    : deviceViewport === 'tablet'
                    ? '768px'
                    : '100%',
                height: '100%',
              }}
              className={`flex flex-col bg-white overflow-hidden transition-all duration-200 ${
                deviceViewport !== 'desktop'
                  ? 'rounded-lg shadow-2xl border border-white/20'
                  : ''
              }`}
            >
              <iframe
                ref={previewIframeRef}
                src={activePreview.url}
                title="Live preview"
                onLoad={onIframeLoad}
                onError={onIframeError}
                className="min-h-0 flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
                data-testid="preview-iframe"
              />
            </div>
            {previewLoadError && (
              <div className="absolute top-2 inset-x-4 z-20 flex items-center justify-between gap-2 rounded bg-red-950/90 border border-red-500/40 px-3 py-1.5 text-xs text-red-200 backdrop-blur">
                <span>{previewLoadError}</span>
                <button
                  type="button"
                  onClick={() => void onReloadPreview()}
                  className="rounded bg-red-800/60 hover:bg-red-700/80 px-2 py-0.5 text-[11px] font-medium text-white transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          <StackBlitzStartupLoader
            operationPending={webcontainerService.isAutomaticStartupBusy()}
            stage={webcontainerState.startupStage}
            serverPort={webcontainerState.serverPort}
            runtimeError={webcontainerState.runtimeError}
            onOpenTerminal={onOpenTerminal}
            onStartDevServer={onStartDevServer}
            onInstallDependencies={onInstallDependencies}
            onRestart={() => void onRestartDevServer()}
            onRetryInstall={() => {
              onOpenTerminal();
              webcontainerService.requestRestart('Retry Installation');
            }}
          />
        )}
      </div>
    </div>
  );
};
