import React from 'react';
import Codicon from '../ui/Codicon';
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
  currentPreset: _currentPreset = 'DEFAULT',
  webcontainerState,
}) => {
  return (
    <footer
      className="flex h-[22px] shrink-0 items-center justify-between border-t border-[#2b2b2b] bg-[#181818] text-[11px] text-[#cccccc] select-none z-10 font-sans"
      data-testid="vscode-status-bar"
    >
      {/* Left items: VS Code Remote Badge, Git branch, Problems, Terminal */}
      <div className="flex h-full items-center">
        {/* Iconic VS Code Blue Remote Indicator */}
        <button
          type="button"
          className="flex h-full items-center gap-1 bg-[#0078d4] hover:bg-[#026ec1] px-2 sm:px-2.5 text-white font-medium transition-colors"
          title="WebContainer Virtual Workspace"
        >
          <Codicon name="remote" className="text-[12px]" />
          <span className="hidden sm:inline text-[11px] font-medium tracking-tight">WebContainer</span>
        </button>

        {/* Source Control Branch */}
        <button
          type="button"
          className="hidden sm:flex h-full items-center gap-1 hover:bg-white/10 px-2 text-[#cccccc] transition-colors"
          title="Current Git Branch: main"
        >
          <Codicon name="source-control" className="text-[12px] text-[#999999]" />
          <span>main</span>
        </button>

        {/* Problems Diagnostics (Errors & Warnings) */}
        <button
          type="button"
          onClick={onOpenProblems}
          title={`Problems: ${diagnostics.errorCount} errors, ${diagnostics.warningCount} warnings`}
          aria-label={`Problems: ${diagnostics.errorCount} errors, ${diagnostics.warningCount} warnings`}
          className="flex h-full items-center gap-2 hover:bg-white/10 px-2 text-[#cccccc] transition-colors"
        >
          <span className="flex items-center gap-0.5">
            <Codicon name="error" className="text-[12px] text-[#f14c4c]" />
            <span className="text-[11px] text-[#cccccc]">{diagnostics.errorCount}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <Codicon name="warning" className="text-[12px] text-[#cca700]" />
            <span className="text-[11px] text-[#cccccc]">{diagnostics.warningCount}</span>
          </span>
        </button>

        {/* Terminal Toggle Button */}
        <button
          type="button"
          onClick={onToggleTerminal}
          data-testid="vscode-terminal-toggle"
          aria-pressed={isTerminalOpen}
          title="Toggle Terminal Panel (Ctrl+`)"
          className="flex h-full items-center gap-1 hover:bg-white/10 px-2 text-[#cccccc] transition-colors"
        >
          <Codicon name="terminal" className="text-[12px] text-[#999999]" />
          <span>Terminal</span>
        </button>

        {/* Unsaved Files Badge */}
        {dirtyCount > 0 && (
          <span
            className="flex items-center gap-1 px-2 text-[10px] text-[#0078d4] font-medium"
            title={`${dirtyCount} unsaved files`}
          >
            <span>●</span> {dirtyCount} unsaved
          </span>
        )}
      </div>

      {/* Right items: Language, Cursor, Encoding, Indentation, WebContainer Port, Notifications */}
      <div className="flex h-full items-center">
        {/* Language Mode */}
        {activeLanguage && (
          <button
            type="button"
            data-testid="status-language"
            className="flex h-full items-center hover:bg-white/10 px-2 text-[#cccccc] transition-colors"
          >
            {LANGUAGE_LABELS[activeLanguage] ?? activeLanguage}
          </button>
        )}

        {/* Cursor Coordinates */}
        {cursor && (
          <button
            type="button"
            data-testid="status-cursor"
            className="hidden sm:flex h-full items-center hover:bg-white/10 px-2 text-[#cccccc] transition-colors"
          >
            Ln {cursor.line}, Col {cursor.column}
          </button>
        )}

        {/* Indentation */}
        <span className="hidden md:flex h-full items-center hover:bg-white/10 px-2 text-[#999999] cursor-pointer transition-colors">
          Spaces: 2
        </span>

        {/* Encoding */}
        <span className="hidden md:flex h-full items-center hover:bg-white/10 px-2 text-[#999999] cursor-pointer transition-colors">
          UTF-8
        </span>

        {/* WebContainer Dev Server Status */}
        <span
          className="flex h-full items-center gap-1 hover:bg-white/10 px-2 text-[#cccccc] cursor-pointer transition-colors"
          title={
            webcontainerState.startupStage === 'ready'
              ? `Dev Server running on port ${webcontainerState.serverPort || 5173}`
              : webcontainerState.startupStage === 'error'
              ? `Runtime Error: ${webcontainerState.runtimeError?.message || 'Check terminal'}`
              : `WebContainer: ${webcontainerState.startupStage}`
          }
          data-testid="status-bar-runtime-status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              webcontainerState.startupStage === 'ready'
                ? 'bg-[#4ec9b0]'
                : webcontainerState.startupStage === 'error'
                ? 'bg-[#f14c4c]'
                : webcontainerState.startupStage === 'installing' ||
                  webcontainerState.startupStage === 'booting'
                ? 'bg-[#0078d4] animate-pulse'
                : 'bg-[#6e7681]'
            }`}
          />
          {webcontainerState.startupStage === 'ready' && `Port ${webcontainerState.serverPort || 5173}`}
          {webcontainerState.startupStage === 'installing' && 'Installing...'}
          {webcontainerState.startupStage === 'starting_server' && 'Starting Server...'}
          {webcontainerState.startupStage === 'mounting_files' && 'Mounting Files...'}
          {webcontainerState.startupStage === 'booting' && 'Booting Runtime...'}
          {webcontainerState.startupStage === 'error' && 'Runtime Error'}
          {webcontainerState.startupStage === 'idle' && 'Standby'}
        </span>

        {/* Notifications Bell */}
        <button
          type="button"
          className="flex h-full items-center hover:bg-white/10 px-2 text-[#999999] hover:text-[#cccccc] transition-colors"
          title="No Notifications"
        >
          <Codicon name="bell" className="text-[12px]" />
        </button>
      </div>
    </footer>
  );
};
