import React from 'react';
import { TerminalSquare } from 'lucide-react';
import { LayoutPresetId } from '../../services/workbench/workbenchTypes';

interface WorkbenchStatusBarProps {
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  onOpenProblems: () => void;
  diagnostics: { errorCount: number; warningCount: number };
  activeLanguage?: string | null;
  cursor?: { line: number; column: number };
  dirtyCount?: number;
  currentPreset?: LayoutPresetId;
  webcontainerState: {
    startupStage: string;
    serverPort: number | null;
    serverUrl?: string | null;
    runtimeError?: { message: string } | null;
  };
}

const LANGUAGE_LABELS: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  python: 'Python',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  php: 'PHP',
  csharp: 'C#',
  shell: 'Shell',
  sql: 'SQL',
  graphql: 'GraphQL',
  markdown: 'Markdown',
  yaml: 'YAML',
  ini: 'INI',
  xml: 'XML',
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
  plaintext: 'Plain Text',
};

export const WorkbenchStatusBar: React.FC<WorkbenchStatusBarProps> = ({
  isTerminalOpen,
  onToggleTerminal,
  onOpenProblems,
  diagnostics,
  activeLanguage,
  cursor,
  dirtyCount = 0,
  currentPreset = 'DEFAULT',
  webcontainerState,
}) => {
  return (
    <footer
      className="flex h-6 shrink-0 items-center justify-between border-t border-[#343945] bg-[#181A20] px-2 text-[11px] text-[#9AA4B5] select-none z-10"
      data-testid="vscode-status-bar"
    >
      {/* Left items: diagnostics, terminal toggle, dirty count */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenProblems}
          title="Toggle Problems Panel"
          aria-label={`Problems: ${diagnostics.errorCount} errors, ${diagnostics.warningCount} warnings`}
          className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[#9AA4B5] hover:text-[#E5E9F1]"
        >
          <span className="text-rose-400 flex items-center gap-0.5">
            <span className="font-bold">⊗</span> {diagnostics.errorCount}
          </span>
          <span className="text-amber-400 flex items-center gap-0.5">
            <span className="font-bold">⚠</span> {diagnostics.warningCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleTerminal}
          data-testid="vscode-terminal-toggle"
          aria-pressed={isTerminalOpen}
          title="Toggle Terminal Panel (Ctrl+`)"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors text-[#9AA4B5] hover:text-[#E5E9F1]"
        >
          <TerminalSquare className="h-3 w-3 text-[#6366F1]" />
          <span>Terminal</span>
        </button>

        {dirtyCount > 0 && (
          <span
            className="flex items-center gap-1 rounded bg-[#6366F1]/10 border border-[#6366F1]/30 px-1.5 py-0.2 text-[10px] text-[#6366F1]"
            title={`${dirtyCount} unsaved files`}
          >
            <span>●</span> {dirtyCount} unsaved
          </span>
        )}
      </div>

      {/* Right items: ATA, Language, Cursor, Port, Encoding, Preset */}
      <div className="flex items-center gap-2">
        {activeLanguage && (
          <span
            data-testid="status-language"
            className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[#9AA4B5] hover:text-[#E5E9F1]"
          >
            {LANGUAGE_LABELS[activeLanguage] ?? activeLanguage}
          </span>
        )}

        {cursor && (
          <span
            data-testid="status-cursor"
            className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[#9AA4B5] hover:text-[#E5E9F1]"
          >
            Ln {cursor.line}, Col {cursor.column}
          </span>
        )}

        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors hidden md:inline text-[#697487]">
          UTF-8
        </span>

        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors hidden md:inline text-[#697487]">
          Spaces: 2
        </span>

        {/* Real Dev Server / WebContainer status badge */}
        <span
          className="flex items-center gap-1.5 font-medium hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[#9AA4B5] hover:text-[#E5E9F1]"
          title={
            webcontainerState.startupStage === 'ready'
              ? `Dev Server active on port ${webcontainerState.serverPort || 5173}`
              : webcontainerState.startupStage === 'error'
              ? `Runtime Error: ${webcontainerState.runtimeError?.message || 'Check terminal'}`
              : `WebContainer: ${webcontainerState.startupStage}`
          }
          data-testid="status-bar-runtime-status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              webcontainerState.startupStage === 'ready'
                ? 'bg-emerald-400 animate-pulse'
                : webcontainerState.startupStage === 'error'
                ? 'bg-rose-400 animate-pulse'
                : webcontainerState.startupStage === 'installing' ||
                  webcontainerState.startupStage === 'booting'
                ? 'bg-indigo-400 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          {webcontainerState.startupStage === 'ready' && `Port ${webcontainerState.serverPort || 5173}`}
          {webcontainerState.startupStage === 'installing' && 'Installing...'}
          {webcontainerState.startupStage === 'starting_server' && 'Starting Server...'}
          {webcontainerState.startupStage === 'mounting_files' && 'Mounting Files...'}
          {webcontainerState.startupStage === 'booting' && 'Booting Runtime...'}
          {webcontainerState.startupStage === 'error' && 'Runtime Error'}
          {webcontainerState.startupStage === 'idle' && 'Runtime Idle'}
        </span>

        <span className="hidden xl:inline text-[10px] text-[#697487] border-l border-[#343945] pl-2">
          {currentPreset}
        </span>
      </div>
    </footer>
  );
};
