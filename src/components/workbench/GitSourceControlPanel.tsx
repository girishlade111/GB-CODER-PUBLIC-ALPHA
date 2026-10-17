import React from 'react';
import { GitBranch, FileCode, AlertCircle } from 'lucide-react';
import { ProjectFile } from '../../types/files';

interface GitSourceControlPanelProps {
  files: ProjectFile[];
  dirtyPaths: Set<string> | string[];
  activePath: string | null;
  onOpenFile: (path: string) => void;
}

export const GitSourceControlPanel: React.FC<GitSourceControlPanelProps> = ({
  files,
  dirtyPaths,
  activePath,
  onOpenFile,
}) => {
  const dirtySet = Array.isArray(dirtyPaths) ? new Set(dirtyPaths) : dirtyPaths;
  const modifiedFiles = files.filter((f) => dirtySet.has(f.path));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#20232B] text-xs select-none">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#343945] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 text-[#6366F1]" />
          <span className="font-bold tracking-wider uppercase text-[#E5E9F1] text-[11px]">
            Source Control
          </span>
        </div>
        <span className="rounded bg-[#181A20] px-1.5 py-0.5 text-[10px] text-[#9AA4B5]">
          {modifiedFiles.length} modified
        </span>
      </div>

      {/* Honesty Banner */}
      <div className="border-b border-[#343945] bg-[#181A20] px-3 py-2 text-[11px] text-[#9AA4B5] leading-relaxed">
        <div className="flex items-start gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-[#6366F1] shrink-0 mt-0.5" />
          <span>
            Tracking local unsaved workspace modifications. For remote Git operations (commit, push, branches), use the integrated terminal.
          </span>
        </div>
      </div>

      {/* Changes list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-[#697487]">
          Changes ({modifiedFiles.length})
        </div>

        {modifiedFiles.length === 0 ? (
          <div className="p-4 text-center text-[#697487] italic">
            No uncommitted or dirty changes in workspace.
          </div>
        ) : (
          <div className="space-y-0.5">
            {modifiedFiles.map((file) => {
              const name = file.path.split('/').pop() || file.path;
              const isActive = file.path === activePath;
              return (
                <div
                  key={file.path}
                  onClick={() => onOpenFile(file.path)}
                  className={`flex cursor-pointer items-center justify-between rounded px-2 py-1 transition-colors ${
                    isActive
                      ? 'bg-[#6366F1]/20 text-[#E5E9F1]'
                      : 'text-[#9AA4B5] hover:bg-white/5 hover:text-[#E5E9F1]'
                  }`}
                  title={file.path}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{name}</span>
                    <span className="truncate text-[10px] text-[#697487]">
                      {file.path.slice(0, file.path.lastIndexOf('/'))}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-400 shrink-0">
                    M
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
