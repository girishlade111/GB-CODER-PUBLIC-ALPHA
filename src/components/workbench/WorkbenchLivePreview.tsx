import React from 'react';
import toast from 'react-hot-toast';
import Tooltip from '../ui/Tooltip';
import Codicon from '../ui/Codicon';
import StackBlitzStartupLoader from '../vscode/StackBlitzStartupLoader';
import { devServerManager } from '../../services/webcontainer/devServerManager';
import {
  webcontainerService,
  ProjectStartupStage,
  WebContainerRuntimeError,
} from '../../services/webcontainer/webcontainerService';

interface WorkbenchLivePreviewProps {
  activePreview: { url: string; port: number; label: string } | null;
  webcontainerState: {
    startupStage: ProjectStartupStage;
    serverPort: number | null;
    serverUrl?: string | null;
    runtimeError?: WebContainerRuntimeError | null;
  };
  deviceViewport: 'desktop' | 'tablet' | 'mobile';
  setDeviceViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isReloadingPreview: boolean;
  onReloadPreview: () => Promise<void>;
  onOpenInNewTab: () => void;
  previewLoadError: string | null;
  copiedUrl: boolean;
  setCopiedUrl: (v: boolean) => void;
  previewIframeRef: any;
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
  const devServerState = React.useSyncExternalStore(
    (cb) => devServerManager.subscribe(cb),
    () => devServerManager.getState(),
    () => devServerManager.getState(),
  );
  const activePorts = devServerState.ports.filter((p) => p.active);

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-[#1f1f1f] select-none">
      {/* VS Code Simple Browser Header & Controls */}
      <div className="flex h-[35px] shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-2 text-xs">
        {/* Navigation & Refresh */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip label="Back" side="bottom">
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Back"
              className="flex h-6 w-6 items-center justify-center rounded text-[#6e7681] cursor-not-allowed"
            >
              <Codicon name="arrow-left" className="text-[14px]" />
            </button>
          </Tooltip>
          <Tooltip label="Forward" side="bottom">
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Forward"
              className="flex h-6 w-6 items-center justify-center rounded text-[#6e7681] cursor-not-allowed"
            >
              <Codicon name="arrow-right" className="text-[14px]" />
            </button>
          </Tooltip>
          <Tooltip label={!activePreview?.url ? 'Dev server offline' : 'Reload'} side="bottom">
            <button
              type="button"
              onClick={() => void onReloadPreview()}
              disabled={isReloadingPreview || !activePreview?.url}
              className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                !activePreview?.url
                  ? 'text-[#6e7681] cursor-not-allowed'
                  : isReloadingPreview
                  ? 'text-[#0078d4] cursor-wait'
                  : 'text-[#cccccc] hover:bg-white/10'
              }`}
              data-testid="preview-reload-btn"
            >
              <Codicon
                name="refresh"
                className={`text-[14px] ${isReloadingPreview ? 'animate-spin' : ''}`}
              />
            </button>
          </Tooltip>
        </div>

        {/* Simple Browser URL Address Bar */}
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[2px] border border-[#2b2b2b] bg-[#1f1f1f] px-2.5 h-[22px] text-[11px] text-[#cccccc] font-mono mx-2 group cursor-pointer hover:border-[#0078d4] transition-colors truncate"
          onClick={() => {
            if (!activePreview?.url && !webcontainerState.serverPort) {
              toast('Development server is offline. No URL to copy.');
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
          <Codicon
            name={activePreview?.url || webcontainerState.serverPort ? 'lock' : 'circle-slash'}
            className={`text-[11px] shrink-0 ${
              activePreview?.url || webcontainerState.serverPort ? 'text-[#4ec9b0]' : 'text-[#6e7681]'
            }`}
          />
          <span className="truncate text-[#cccccc] text-[11px]">
            {activePreview?.url
              ? activePreview.url.replace(/^https?:\/\//, '')
              : webcontainerState.serverPort
              ? `localhost:${webcontainerState.serverPort}/`
              : 'http://localhost (Offline)'}
          </span>
          {(activePreview?.url || webcontainerState.serverPort) && (
            <span className="ml-auto opacity-0 group-hover:opacity-100 text-[#999999] hover:text-white shrink-0">
              <Codicon name={copiedUrl ? 'check' : 'copy'} className={`text-[11px] ${copiedUrl ? 'text-[#4ec9b0]' : ''}`} />
            </span>
          )}
        </div>

        {/* Multi-Port Selector */}
        {activePorts.length > 1 && (
          <div
            role="tablist"
            aria-label="Active dev server ports"
            data-testid="preview-port-selector"
            className="flex items-center rounded border border-[#2b2b2b] bg-[#1f1f1f] p-0.5 text-[10px] font-mono shrink-0 mx-1"
          >
            {activePorts.map((p) => {
              const isSelected =
                (devServerState.selectedPort ?? devServerState.serverPort ?? activePreview?.port) === p.port;
              return (
                <button
                  key={p.port}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-testid={`preview-port-btn-${p.port}`}
                  onClick={() => devServerManager.selectPort(p.port)}
                  className={`px-1.5 py-0.5 rounded-[2px] transition-colors ${
                    isSelected
                      ? 'bg-[#0078d4] text-white font-medium'
                      : 'text-[#999999] hover:text-[#cccccc] hover:bg-white/5'
                  }`}
                  title={`Switch preview to port ${p.port}`}
                >
                  :{p.port}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Actions: Viewport, Popout, Maximize, Fullscreen */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Responsive Device Viewport Toggles */}
          <div className="hidden sm:flex items-center rounded border border-[#2b2b2b] bg-[#1f1f1f] p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setDeviceViewport('desktop')}
              title="Desktop (100% Fluid)"
              className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors ${
                deviceViewport === 'desktop' ? 'bg-[#0078d4] text-white' : 'text-[#999999] hover:text-white'
              }`}
            >
              <Codicon name="device-desktop" className="text-[12px]" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('tablet')}
              title="Tablet (768px)"
              className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors ${
                deviceViewport === 'tablet' ? 'bg-[#0078d4] text-white' : 'text-[#999999] hover:text-white'
              }`}
            >
              <Codicon name="tablet" className="text-[12px]" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceViewport('mobile')}
              title="Mobile (375px)"
              className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors ${
                deviceViewport === 'mobile' ? 'bg-[#0078d4] text-white' : 'text-[#999999] hover:text-white'
              }`}
            >
              <Codicon name="device-mobile" className="text-[12px]" />
            </button>
          </div>

          {/* Popout */}
          <Tooltip
            label={!activePreview?.url ? 'Preview not ready (server offline)' : 'Open in New Window'}
            side="bottom"
          >
            <button
              type="button"
              onClick={onOpenInNewTab}
              disabled={!activePreview?.url}
              className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                !activePreview?.url
                  ? 'text-[#6e7681] cursor-not-allowed'
                  : 'text-[#cccccc] hover:bg-white/10 hover:text-white'
              }`}
              data-testid="preview-open-new-tab-btn"
            >
              <Codicon name="link-external" className="text-[13px]" />
            </button>
          </Tooltip>

          {/* Maximize Width Toggle */}
          {onMaximizeWidth && (
            <Tooltip label="Toggle Panel Width" side="bottom">
              <button
                type="button"
                onClick={onMaximizeWidth}
                className="flex h-6 w-6 items-center justify-center rounded text-[#cccccc] hover:bg-white/10 hover:text-white transition-colors"
              >
                <Codicon name="split-horizontal" className="text-[13px]" />
              </button>
            </Tooltip>
          )}

          {/* Fullscreen Toggle */}
          {onFullscreen && (
            <Tooltip label="Fullscreen Preview" side="bottom">
              <button
                type="button"
                onClick={onFullscreen}
                className="flex h-6 w-6 items-center justify-center rounded text-[#cccccc] hover:bg-white/10 hover:text-white transition-colors"
              >
                <Codicon name="screen-full" className="text-[13px]" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-hidden relative bg-[#1f1f1f]">
        {activePreview?.url ? (
          <div
            className={`h-full w-full flex items-center justify-center ${
              deviceViewport === 'mobile'
                ? 'p-4 bg-[#181818]'
                : deviceViewport === 'tablet'
                ? 'p-2 bg-[#181818]'
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
                  ? 'rounded border border-[#2b2b2b] shadow-xl'
                  : ''
              }`}
            >
              <iframe
                ref={previewIframeRef}
                src={activePreview.url}
                title="Simple Browser preview"
                onLoad={onIframeLoad}
                onError={onIframeError}
                className="min-h-0 flex-1 border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
                data-testid="preview-iframe"
              />
            </div>
            {previewLoadError && (
              <div className="absolute top-2 inset-x-4 z-20 flex items-center justify-between gap-2 rounded-[2px] bg-[#252526] border border-[#f14c4c] px-3 py-1.5 text-xs text-[#f14c4c] shadow-lg">
                <span className="flex items-center gap-1.5">
                  <Codicon name="error" className="text-[14px]" />
                  {previewLoadError}
                </span>
                <button
                  type="button"
                  onClick={() => void onReloadPreview()}
                  className="rounded-[2px] bg-[#f14c4c] hover:bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white transition-colors"
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
