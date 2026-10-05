import React from 'react';
import { CheckCircle2, Circle, Loader2, TerminalSquare, RotateCcw } from 'lucide-react';
import { ProjectStartupStage } from '../../services/webcontainer/webcontainerService';

interface StackBlitzStartupLoaderProps {
  stage: ProjectStartupStage;
  serverPort?: number | null;
  onOpenTerminal?: () => void;
  onRestart?: () => void;
}

export const StackBlitzStartupLoader: React.FC<StackBlitzStartupLoaderProps> = ({
  stage,
  serverPort,
  onOpenTerminal,
  onRestart,
}) => {
  const isBooting = stage === 'booting';
  const isInstalling = stage === 'installing';
  const isStarting = stage === 'starting_server';
  const isReady = stage === 'ready';
  const isError = stage === 'error';

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-[#13141f] p-8 text-center select-none"
      data-testid="stackblitz-startup-loader"
    >
      {/* Glowing StackBlitz Lightbulb with Lightning Filament */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-6 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
        <svg
          className="relative h-20 w-20 text-cyan-400 drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]"
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
          ? 'Setup encountered an error'
          : isStarting
          ? 'Starting development server'
          : 'Installing dependencies'}
      </h2>

      <p className="mt-1 max-w-sm text-xs text-slate-400">
        {isReady
          ? `Server is live and listening on port ${serverPort ?? 5173}.`
          : isError
          ? 'Check terminal output for details or restart the process.'
          : 'Running in-browser WebContainer with zero cloud latency.'}
      </p>

      {/* Step Checklist matching StackBlitz */}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 rounded-xl border border-white/10 bg-[#181926]/90 p-4 shadow-xl backdrop-blur-sm text-left">
        {/* Step 1: Booting WebContainer */}
        <div className="flex items-center gap-2.5 text-xs">
          {isBooting ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span className={isBooting ? 'font-medium text-white' : 'text-slate-300'}>
            Booting WebContainer
          </span>
        </div>

        {/* Step 2: Installing dependencies */}
        <div className="flex items-center gap-2.5 text-xs">
          {isBooting ? (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          ) : isInstalling ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span
            className={
              isInstalling
                ? 'font-medium text-white'
                : isBooting
                ? 'text-slate-500'
                : 'text-slate-300'
            }
          >
            Installing dependencies
          </span>
        </div>

        {/* Step 3: Running start command */}
        <div className="flex items-center gap-2.5 text-xs">
          {isReady ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : isStarting ? (
            <Loader2 className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-slate-600" />
          )}
          <span
            className={
              isStarting || isReady
                ? 'font-medium text-white'
                : 'text-slate-500'
            }
          >
            Running start command
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center gap-2.5">
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1e2030] px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition hover:bg-[#282a3f] hover:text-white"
          >
            <TerminalSquare className="h-3.5 w-3.5 text-cyan-400" />
            View Live Terminal
          </button>
        )}
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1e2030] px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition hover:bg-[#282a3f] hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            Restart Process
          </button>
        )}
      </div>
    </div>
  );
};

export default StackBlitzStartupLoader;
