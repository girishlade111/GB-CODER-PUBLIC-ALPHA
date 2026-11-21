import React from 'react';
import Codicon from '../ui/Codicon';
import {
  ProjectStartupStage,
  WebContainerRuntimeError,
} from '../../services/webcontainer/webcontainerService';

interface StackBlitzStartupLoaderProps {
  stage: ProjectStartupStage;
  serverPort?: number | null;
  runtimeError?: WebContainerRuntimeError | null;
  onOpenTerminal?: () => void;
  onRestart?: () => void;
  onRetryInstall?: () => void;
  onStartDevServer?: () => void;
  onInstallDependencies?: () => void;
  operationPending?: boolean;
}

export const StackBlitzStartupLoader: React.FC<StackBlitzStartupLoaderProps> = ({
  stage,
  serverPort,
  runtimeError,
  onOpenTerminal,
  onRestart,
  onRetryInstall,
  onStartDevServer,
  onInstallDependencies,
  operationPending = false,
}) => {
  const isBooting = stage === 'booting';
  const isMounting = stage === 'mounting_files';
  const isRuntimeReady = stage === 'runtime_ready';
  const isInstalling = stage === 'installing';
  const isStarting = stage === 'starting_server';
  const isReady = stage === 'ready';
  const isError = stage === 'error';

  const isWorking = isBooting || isMounting || isInstalling || isStarting || operationPending;

  // Step state calculations
  const errorPhase = runtimeError?.phase;
  const isStarted = stage !== 'idle';

  const step1Done = isStarted && !isBooting && !(isError && errorPhase === 'boot');
  const step1Active = isBooting;
  const step1Error = isError && errorPhase === 'boot';

  const step2Done =
    step1Done &&
    !isMounting &&
    !(isError && (errorPhase === 'mount' || errorPhase === 'boot'));
  const step2Active = isMounting;
  const step2Error = isError && errorPhase === 'mount';

  const step3Done =
    step2Done &&
    !isInstalling &&
    (stage === 'starting_server' || stage === 'ready') &&
    !(isError && errorPhase === 'install');
  const step3Active = isInstalling;
  const step3Error = isError && errorPhase === 'install';

  const step4Done = isStarted && isReady;
  const step4Active = isStarting;
  const step4Error = isError && errorPhase === 'server';

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center bg-[#1f1f1f] p-6 text-center select-none"
      data-testid="stackblitz-startup-loader"
    >
      {/* VS Code Subtle Top Indeterminate Progress Line */}
      {isWorking && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#2b2b2b] overflow-hidden">
          <div className="h-full w-1/3 bg-[#0078d4] animate-pulse" />
        </div>
      )}

      {/* VS Code Clean Simple Browser Icon */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#252526] border border-[#2b2b2b]">
        {isError ? (
          <Codicon name="error" className="text-[#f14c4c] text-[28px]" />
        ) : isWorking ? (
          <Codicon name="loading" className="text-[#0078d4] text-[28px] animate-spin" />
        ) : (
          <Codicon name="browser" className="text-[#999999] text-[28px]" />
        )}
      </div>

      {/* Main Title matching VS Code Simple Browser & WebContainer status */}
      <h2 className="text-[13px] font-semibold text-[#cccccc] tracking-normal">
        {isReady
          ? 'Development Server Live'
          : isError
          ? 'WebContainer Runtime Notice'
          : isStarting
          ? 'Starting Development Server...'
          : isInstalling
          ? 'Installing Dependencies...'
          : isMounting
          ? 'Mounting Project Files...'
          : isBooting
          ? 'Initializing WebContainer Runtime...'
          : isRuntimeReady
          ? 'WebContainer Runtime Ready'
          : 'Simple Browser Standby'}
      </h2>

      <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#999999]">
        {isReady
          ? serverPort
            ? `Listening for connections on port ${serverPort}.`
            : 'Listening for connections.'
          : isError
          ? runtimeError?.message || 'Check terminal output for details or retry the operation.'
          : isStarting
          ? 'Spawning development process inside WebContainer...'
          : isInstalling
          ? 'Running npm install in background...'
          : isMounting
          ? 'Synchronizing workspace files to container filesystem...'
          : isBooting
          ? 'Booting virtual container environment...'
          : isRuntimeReady
          ? 'Environment mounted. Start development server or edit source files.'
          : 'No active dev server. Launch a preview below or run npm run dev in Terminal.'}
      </p>

      {/* VS Code Compact Steps List */}
      <div className="mt-6 flex w-full max-w-[280px] flex-col gap-2 rounded border border-[#2b2b2b] bg-[#181818] p-3 text-left">
        {/* Step 1: Boot WebContainer */}
        <div className="flex items-center gap-2 text-[11px]">
          {step1Error ? (
            <Codicon name="error" className="text-[#f14c4c] text-[13px] shrink-0" />
          ) : step1Active ? (
            <Codicon name="loading" className="text-[#0078d4] text-[13px] shrink-0 animate-spin" />
          ) : step1Done ? (
            <Codicon name="pass-filled" className="text-[#4ec9b0] text-[13px] shrink-0" />
          ) : (
            <Codicon name="circle-outline" className="text-[#6e7681] text-[13px] shrink-0" />
          )}
          <span
            className={
              step1Active
                ? 'font-medium text-[#cccccc]'
                : step1Error
                ? 'font-medium text-[#f14c4c]'
                : step1Done
                ? 'text-[#999999]'
                : 'text-[#6e7681]'
            }
          >
            Boot WebContainer
          </span>
        </div>

        {/* Step 2: Mount project files */}
        <div className="flex items-center gap-2 text-[11px]">
          {step2Error ? (
            <Codicon name="error" className="text-[#f14c4c] text-[13px] shrink-0" />
          ) : step2Active ? (
            <Codicon name="loading" className="text-[#0078d4] text-[13px] shrink-0 animate-spin" />
          ) : step2Done ? (
            <Codicon name="pass-filled" className="text-[#4ec9b0] text-[13px] shrink-0" />
          ) : (
            <Codicon name="circle-outline" className="text-[#6e7681] text-[13px] shrink-0" />
          )}
          <span
            className={
              step2Active
                ? 'font-medium text-[#cccccc]'
                : step2Error
                ? 'font-medium text-[#f14c4c]'
                : step2Done
                ? 'text-[#999999]'
                : 'text-[#6e7681]'
            }
          >
            Mount workspace files
          </span>
        </div>

        {/* Step 3: Install dependencies */}
        <div className="flex items-center gap-2 text-[11px]">
          {step3Error ? (
            <Codicon name="error" className="text-[#f14c4c] text-[13px] shrink-0" />
          ) : step3Active ? (
            <Codicon name="loading" className="text-[#0078d4] text-[13px] shrink-0 animate-spin" />
          ) : step3Done ? (
            <Codicon name="pass-filled" className="text-[#4ec9b0] text-[13px] shrink-0" />
          ) : (
            <Codicon name="circle-outline" className="text-[#6e7681] text-[13px] shrink-0" />
          )}
          <span
            className={
              step3Active
                ? 'font-medium text-[#cccccc]'
                : step3Error
                ? 'font-medium text-[#f14c4c]'
                : step3Done
                ? 'text-[#999999]'
                : 'text-[#6e7681]'
            }
          >
            Dependencies (npm install)
          </span>
        </div>

        {/* Step 4: Running dev server */}
        <div className="flex items-center gap-2 text-[11px]">
          {step4Error ? (
            <Codicon name="error" className="text-[#f14c4c] text-[13px] shrink-0" />
          ) : step4Active ? (
            <Codicon name="loading" className="text-[#0078d4] text-[13px] shrink-0 animate-spin" />
          ) : step4Done ? (
            <Codicon name="pass-filled" className="text-[#4ec9b0] text-[13px] shrink-0" />
          ) : (
            <Codicon name="circle-outline" className="text-[#6e7681] text-[13px] shrink-0" />
          )}
          <span
            className={
              step4Active || step4Done
                ? 'font-medium text-[#cccccc]'
                : step4Error
                ? 'font-medium text-[#f14c4c]'
                : 'text-[#6e7681]'
            }
          >
            Dev server (npm run dev)
          </span>
        </div>
      </div>

      {/* VS Code Native Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onStartDevServer && !isReady && !isStarting && !isInstalling && (
          <button
            type="button"
            onClick={onStartDevServer}
            disabled={operationPending || isBooting || isMounting}
            className="flex items-center gap-1.5 rounded-[2px] bg-[#0078d4] hover:bg-[#026ec1] px-3 py-1 text-[11px] font-normal text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
            data-testid="loader-start-server-btn"
          >
            <Codicon name="play" className="text-[12px]" />
            Start Dev Server
          </button>
        )}
        {onInstallDependencies && !isReady && !isStarting && !isInstalling && (
          <button
            type="button"
            onClick={onInstallDependencies}
            disabled={operationPending || isBooting || isMounting}
            className="flex items-center gap-1.5 rounded-[2px] bg-[#313131] hover:bg-[#3c3c3c] border border-[#3c3c3c] px-3 py-1 text-[11px] font-normal text-[#cccccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
            data-testid="loader-install-deps-btn"
          >
            <Codicon name="cloud-download" className="text-[12px]" />
            Install Dependencies
          </button>
        )}
        {onRetryInstall && isError && errorPhase === 'install' && (
          <button
            type="button"
            onClick={onRetryInstall}
            disabled={operationPending}
            className="flex items-center gap-1.5 rounded-[2px] bg-[#0078d4] hover:bg-[#026ec1] px-3 py-1 text-[11px] font-normal text-white transition-colors shadow-none"
            data-testid="loader-retry-install-btn"
          >
            <Codicon name="refresh" className="text-[12px]" />
            Retry Installation
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            disabled={operationPending}
            className="flex items-center gap-1.5 rounded-[2px] bg-[#313131] hover:bg-[#3c3c3c] border border-[#3c3c3c] px-3 py-1 text-[11px] font-normal text-[#cccccc] transition-colors shadow-none"
            data-testid="loader-restart-btn"
          >
            <Codicon name="debug-restart" className="text-[12px]" />
            {isError ? 'Restart Process' : 'Restart Server'}
          </button>
        )}
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 rounded-[2px] bg-[#313131] hover:bg-[#3c3c3c] border border-[#3c3c3c] px-3 py-1 text-[11px] font-normal text-[#cccccc] transition-colors shadow-none"
            data-testid="loader-view-terminal-btn"
          >
            <Codicon name="terminal" className="text-[12px]" />
            Open Terminal
          </button>
        )}
      </div>
    </div>
  );
};

export default StackBlitzStartupLoader;
