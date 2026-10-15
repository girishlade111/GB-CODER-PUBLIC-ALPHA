import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  TerminalSquare,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
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
  operationPending?: boolean;
}

export const StackBlitzStartupLoader: React.FC<StackBlitzStartupLoaderProps> = ({
  stage,
  serverPort,
  runtimeError,
  onOpenTerminal,
  onRestart,
  onRetryInstall,
  operationPending = false,
}) => {
  const isBooting = stage === 'booting';
  const isMounting = stage === 'mounting_files';
  const isInstalling = stage === 'installing';
  const isStarting = stage === 'starting_server';
  const isReady = stage === 'ready';
  const isError = stage === 'error';

  // Step state calculations
  const errorPhase = runtimeError?.phase;

  // Step 1: Boot WebContainer
  const step1Done = !isBooting && !(isError && errorPhase === 'boot');
  const step1Active = isBooting;
  const step1Error = isError && errorPhase === 'boot';

  // Step 2: Mount project files
  const step2Done =
    step1Done &&
    !isMounting &&
    !(isError && (errorPhase === 'mount' || errorPhase === 'boot'));
  const step2Active = isMounting;
  const step2Error = isError && errorPhase === 'mount';

  // Step 3: Install dependencies
  const step3Done =
    step2Done &&
    !isInstalling &&
    (stage === 'starting_server' || stage === 'ready') &&
    !(isError && errorPhase === 'install');
  const step3Active = isInstalling;
  const step3Error = isError && errorPhase === 'install';

  // Step 4: Start dev server
  const step4Done = isReady;
  const step4Active = isStarting;
  const step4Error = isError && errorPhase === 'server';

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-[#13141f] p-8 text-center select-none"
      data-testid="stackblitz-startup-loader"
    >
      {/* Glowing StackBlitz Lightbulb with Lightning Filament */}
      <div className="relative mb-6 flex items-center justify-center">
        <div
          className={`absolute -inset-6 rounded-full blur-2xl animate-pulse ${
            isError ? 'bg-rose-500/20' : 'bg-cyan-500/20'
          }`}
        />
        <svg
          className={`relative h-20 w-20 drop-shadow-[0_0_18px_rgba(56,189,248,0.7)] ${
            isError ? 'text-rose-400 drop-shadow-[0_0_18px_rgba(244,63,94,0.7)]' : 'text-cyan-400'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lightbulb glass outline */}
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
          <path d="M9 21h6" />
          {/* Glowing lightning bolt filament inside */}
          <path
            fill="currentColor"
            stroke="none"
            d="M12.5 5.5L9.5 10.5h3l-1 4.5 4-5.5h-3l1-4z"
          />
        </svg>
      </div>

      {/* Main title */}
      <h2 className="text-xl font-semibold tracking-tight text-white">
        {isReady
          ? 'Development Server Ready'
          : isError
          ? 'Setup Encountered an Error'
          : isStarting
          ? 'Starting Development Server'
          : isInstalling
          ? 'Installing Dependencies'
          : isMounting
          ? 'Mounting Project Files'
          : 'Starting WebContainer'}
      </h2>

      <p className="mt-1 max-w-sm text-xs text-slate-400">
        {isReady
          ? `Server is live and listening on port ${serverPort ?? 5173}.`
          : isError
          ? runtimeError?.message || 'Check terminal output for details or retry the operation.'
          : isStarting
          ? 'Launching Vite dev server inside WebContainer...'
          : isInstalling
          ? 'Installing project dependencies...'
          : isMounting
          ? 'Syncing source files to virtual filesystem...'
          : 'Booting WebAssembly Node.js runtime with zero cloud latency...'}
      </p>

      {/* Step Checklist matching professional IDE runtime states */}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 rounded-xl border border-white/10 bg-[#181926]/90 p-4 shadow-xl backdrop-blur-sm text-left">
        {/* Step 1: Booting WebContainer */}
        <div className="flex items-center gap-2.5 text-xs">
          {step1Error ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : step1Active ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : step1Done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          )}
          <span
            className={
              step1Active
                ? 'font-medium text-white'
                : step1Error
                ? 'font-medium text-rose-300'
                : step1Done
                ? 'text-slate-300'
                : 'text-slate-500'
            }
          >
            Booting WebContainer
          </span>
        </div>

        {/* Step 2: Mounting project files */}
        <div className="flex items-center gap-2.5 text-xs">
          {step2Error ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : step2Active ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : step2Done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          )}
          <span
            className={
              step2Active
                ? 'font-medium text-white'
                : step2Error
                ? 'font-medium text-rose-300'
                : step2Done
                ? 'text-slate-300'
                : 'text-slate-500'
            }
          >
            Mounting project files
          </span>
        </div>

        {/* Step 3: Installing dependencies */}
        <div className="flex items-center gap-2.5 text-xs">
          {step3Error ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : step3Active ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : step3Done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          )}
          <span
            className={
              step3Active
                ? 'font-medium text-white'
                : step3Error
                ? 'font-medium text-rose-300'
                : step3Done
                ? 'text-slate-300'
                : 'text-slate-500'
            }
          >
            Installing dependencies
          </span>
        </div>

        {/* Step 4: Running start command */}
        <div className="flex items-center gap-2.5 text-xs">
          {step4Error ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : step4Active ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : step4Done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          )}
          <span
            className={
              step4Active || step4Done
                ? 'font-medium text-white'
                : step4Error
                ? 'font-medium text-rose-300'
                : 'text-slate-500'
            }
          >
            Starting development server
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        {onRetryInstall && isError && errorPhase === 'install' && (
          <button
            type="button"
            onClick={onRetryInstall}
            disabled={operationPending}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/60 px-3 py-1.5 text-xs font-medium text-cyan-300 shadow-sm transition hover:bg-cyan-900/80 hover:text-white"
            data-testid="loader-retry-install-btn"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            Retry Installation
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            disabled={operationPending}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
              isError
                ? 'border-amber-500/30 bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 hover:text-white'
                : 'border-white/10 bg-[#1e2030] text-slate-300 hover:bg-[#282a3f] hover:text-white'
            }`}
            data-testid="loader-restart-btn"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            {isError ? 'Restart Process' : 'Restart Dev Server'}
          </button>
        )}
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1e2030] px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition hover:bg-[#282a3f] hover:text-white"
            data-testid="loader-view-terminal-btn"
          >
            <TerminalSquare className="h-3.5 w-3.5 text-cyan-400" />
            View Live Terminal
          </button>
        )}
      </div>
    </div>
  );
};

export default StackBlitzStartupLoader;
