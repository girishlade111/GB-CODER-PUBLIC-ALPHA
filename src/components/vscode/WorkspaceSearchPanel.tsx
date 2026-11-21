import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Codicon from '../ui/Codicon';
import toast from 'react-hot-toast';
import { ProjectFile } from '../../types/files';
import {
  SearchOptions,
  searchWorkspaceFiles,
  safeReplaceSingleMatch,
  safeReplaceInFile,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  SearchMatch,
} from '../../services/search/workspaceSearchService';
import Tooltip from '../ui/Tooltip';

interface WorkspaceSearchPanelProps {
  files: ProjectFile[];
  activePath: string | null;
  projectId?: string | null;
  onNavigateToLocation: (path: string, line?: number, column?: number) => void;
  onChangeFile: (path: string, content: string) => void;
}

const getFileCodicon = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <Codicon name="file-code" className="text-[13px] text-[#3794ff] shrink-0" />;
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <Codicon name="file-code" className="text-[13px] text-[#cca700] shrink-0" />;
    case 'json':
    case 'jsonc':
      return <Codicon name="json" className="text-[13px] text-[#cca700] shrink-0" />;
    case 'html':
    case 'htm':
      return <Codicon name="browser" className="text-[13px] text-[#e37933] shrink-0" />;
    case 'css':
    case 'scss':
    case 'less':
      return <Codicon name="symbol-color" className="text-[13px] text-[#4ec9b0] shrink-0" />;
    case 'md':
    case 'markdown':
      return <Codicon name="markdown" className="text-[13px] text-[#75beff] shrink-0" />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <Codicon name="file-media" className="text-[13px] text-[#b180d7] shrink-0" />;
    default:
      return <Codicon name="file" className="text-[13px] text-[#cccccc] shrink-0" />;
  }
};

export const WorkspaceSearchPanel: React.FC<WorkspaceSearchPanelProps> = ({
  files,
  activePath,
  projectId,
  onNavigateToLocation,
  onChangeFile,
}) => {
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Clear query and search state when project changes
  useEffect(() => {
    setQuery('');
    setReplaceQuery('');
    setCollapsedFiles({});
    setRecentSearches(getRecentSearches());
  }, [projectId]);

  // Options memo
  const options: SearchOptions = useMemo(
    () => ({
      caseSensitive,
      wholeWord,
      useRegex,
      maxResults: 2000,
    }),
    [caseSensitive, wholeWord, useRegex],
  );

  // Search calculation
  const { results, totalMatches, error } = useMemo(() => {
    if (!query) {
      return { results: [], totalMatches: 0, error: null };
    }
    return searchWorkspaceFiles(files, query, options);
  }, [files, query, options]);

  // Save to recent search when non-empty search completes
  useEffect(() => {
    if (query.trim().length > 1 && !error) {
      const timer = setTimeout(() => {
        const updated = saveRecentSearch(query);
        setRecentSearches(updated);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [query, error]);

  const toggleFileCollapse = useCallback((filePath: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [filePath]: !prev[filePath],
    }));
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedFiles({});
  }, []);

  const collapseAll = useCallback(() => {
    const allCollapsed: Record<string, boolean> = {};
    results.forEach((r) => {
      allCollapsed[r.path] = true;
    });
    setCollapsedFiles(allCollapsed);
  }, [results]);

  // Handle single match replace
  const handleReplaceSingle = useCallback(
    (match: SearchMatch) => {
      const targetFile = files.find((f) => f.path === match.path);
      if (!targetFile) return;

      const res = safeReplaceSingleMatch(targetFile.content, match, replaceQuery, options);
      if (!res.valid || res.newContent === undefined) {
        toast.error(res.reason || 'Could not replace: file contents modified.');
        return;
      }

      onChangeFile(match.path, res.newContent);
      toast.success(`Replaced match in ${match.path}`);
    },
    [files, replaceQuery, options, onChangeFile],
  );

  // Handle replace all in one file
  const handleReplaceInFile = useCallback(
    (filePath: string) => {
      const targetFile = files.find((f) => f.path === filePath);
      if (!targetFile) return;

      const fileResult = results.find((r) => r.path === filePath);
      if (!fileResult || fileResult.matches.length === 0) return;

      const res = safeReplaceInFile(targetFile.content, query, replaceQuery, options);
      if (!res.valid || res.newContent === undefined) {
        toast.error(res.reason || 'Failed to replace in file.');
        return;
      }

      onChangeFile(filePath, res.newContent);
      toast.success(`Replaced ${fileResult.matches.length} matches in ${filePath}`);
    },
    [files, results, query, replaceQuery, options, onChangeFile],
  );

  // Handle workspace-wide bulk replace execution
  const handleExecuteBulkReplace = useCallback(() => {
    setConfirmModalOpen(false);
    if (!query || results.length === 0) return;

    let modifiedFilesCount = 0;
    let failedCount = 0;

    results.forEach((fileResult) => {
      const targetFile = files.find((f) => f.path === fileResult.path);
      if (!targetFile) {
        failedCount += 1;
        return;
      }

      const res = safeReplaceInFile(targetFile.content, query, replaceQuery, options);
      if (res.valid && res.newContent !== undefined) {
        onChangeFile(fileResult.path, res.newContent);
        modifiedFilesCount += 1;
      } else {
        failedCount += 1;
      }
    });

    if (failedCount > 0) {
      toast.error(`Replaced across ${modifiedFilesCount} files; ${failedCount} files failed.`, {
        duration: 4000,
      });
    } else {
      toast.success(`Successfully replaced across ${modifiedFilesCount} files.`);
    }
  }, [query, results, files, replaceQuery, options, onChangeFile]);

  return (
    <div
      className="flex h-full flex-col bg-[#181818] text-[12px] text-[#cccccc] font-sans select-none overflow-hidden"
      data-testid="workspace-search-panel"
      role="region"
      aria-label="Workspace Search"
    >
      {/* Top Header (35px) */}
      <div className="flex h-[35px] shrink-0 items-center justify-between border-b border-[#2b2b2b] px-3 bg-[#181818]">
        <span className="font-bold uppercase tracking-wider text-[#858585] text-[11px]">
          Search
        </span>
        {results.length > 0 && (
          <div className="flex items-center gap-0.5">
            <Tooltip label="Expand All" side="bottom">
              <button
                type="button"
                onClick={expandAll}
                aria-label="Expand All"
                className="flex h-6 w-6 items-center justify-center rounded-[2px] hover:bg-white/10 text-[#cccccc] hover:text-white transition-colors cursor-pointer"
              >
                <Codicon name="chevron-down" className="text-[13px]" />
              </button>
            </Tooltip>
            <Tooltip label="Collapse All" side="bottom">
              <button
                type="button"
                onClick={collapseAll}
                aria-label="Collapse All"
                className="flex h-6 w-6 items-center justify-center rounded-[2px] hover:bg-white/10 text-[#cccccc] hover:text-white transition-colors cursor-pointer"
              >
                <Codicon name="chevron-right" className="text-[13px]" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Search & Replace Form Container */}
      <div className="shrink-0 p-2 space-y-1.5 border-b border-[#2b2b2b] bg-[#181818]">
        {/* Search Input Row */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowReplace((prev) => !prev)}
            aria-label={showReplace ? 'Hide Replace' : 'Show Replace'}
            title={showReplace ? 'Hide Replace' : 'Show Replace'}
            className="flex h-6 w-5 shrink-0 items-center justify-center rounded-[2px] text-[#858585] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Codicon
              name="chevron-right"
              className={`text-[12px] transition-transform duration-100 ${
                showReplace ? 'rotate-90 text-[#cccccc]' : ''
              }`}
            />
          </button>

          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search (files & contents)..."
              aria-label="Search query"
              className={`h-[26px] w-full rounded-[2px] border bg-[#1f1f1f] pl-2 pr-20 text-[12px] text-white placeholder-[#858585] outline-none ${
                error
                  ? 'border-[#f14c4c]'
                  : 'border-[#3c3c3c] focus:border-[#0078d4]'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear Search Query"
                className="absolute right-16 top-1 text-[#858585] hover:text-white"
              >
                <Codicon name="close" className="text-[12px]" />
              </button>
            )}

            {/* Match modifier switches inside input */}
            <div className="absolute right-1 top-0.5 flex items-center gap-0.5">
              <Tooltip label="Match Case (Alt+C)" side="bottom">
                <button
                  type="button"
                  onClick={() => setCaseSensitive((prev) => !prev)}
                  aria-pressed={caseSensitive}
                  aria-label="Match Case"
                  className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors cursor-pointer ${
                    caseSensitive
                      ? 'bg-[#0078d4] text-white'
                      : 'text-[#858585] hover:bg-white/10 hover:text-[#cccccc]'
                  }`}
                >
                  <Codicon name="case-sensitive" className="text-[12px]" />
                </button>
              </Tooltip>

              <Tooltip label="Match Whole Word (Alt+W)" side="bottom">
                <button
                  type="button"
                  onClick={() => setWholeWord((prev) => !prev)}
                  aria-pressed={wholeWord}
                  aria-label="Match Whole Word"
                  className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors cursor-pointer ${
                    wholeWord
                      ? 'bg-[#0078d4] text-white'
                      : 'text-[#858585] hover:bg-white/10 hover:text-[#cccccc]'
                  }`}
                >
                  <Codicon name="whole-word" className="text-[12px]" />
                </button>
              </Tooltip>

              <Tooltip label="Use Regular Expression (Alt+R)" side="bottom">
                <button
                  type="button"
                  onClick={() => setUseRegex((prev) => !prev)}
                  aria-pressed={useRegex}
                  aria-label="Use Regular Expression"
                  className={`flex h-5 w-5 items-center justify-center rounded-[2px] transition-colors cursor-pointer ${
                    useRegex
                      ? 'bg-[#0078d4] text-white'
                      : 'text-[#858585] hover:bg-white/10 hover:text-[#cccccc]'
                  }`}
                >
                  <Codicon name="regex" className="text-[12px]" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Error notice if regex is invalid */}
        {error && (
          <div className="text-[11px] text-[#f14c4c] flex items-center gap-1 pl-6">
            <Codicon name="warning" className="text-[12px] shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Replace Input Row (when toggled open) */}
        {showReplace && (
          <div className="flex items-center gap-1 pl-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                aria-label="Replace term"
                className="h-[26px] w-full rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2 text-[12px] text-white placeholder-[#858585] outline-none focus:border-[#0078d4]"
              />
              {replaceQuery && (
                <button
                  type="button"
                  onClick={() => setReplaceQuery('')}
                  aria-label="Clear Replace Term"
                  className="absolute right-1.5 top-1 text-[#858585] hover:text-white"
                >
                  <Codicon name="close" className="text-[12px]" />
                </button>
              )}
            </div>

            <Tooltip label="Replace All in Workspace" side="bottom">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={totalMatches === 0 || !query}
                aria-label="Replace All in Workspace"
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-[2px] transition-colors cursor-pointer ${
                  totalMatches === 0 || !query
                    ? 'text-[#555555] cursor-not-allowed'
                    : 'text-[#cccccc] bg-white/5 hover:bg-[#0078d4] hover:text-white'
                }`}
              >
                <Codicon name="replace-all" className="text-[14px]" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Search Summary & Recent Searches Toggle */}
        <div className="flex items-center justify-between text-[11px] text-[#858585] px-1 pt-0.5">
          <span>
            {query
              ? totalMatches > 0
                ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'} in ${results.length} file${results.length === 1 ? '' : 's'}`
                : 'No matches found'
              : `${files.length} workspace files`}
          </span>

          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRecentSearches((prev) => !prev)}
              aria-label="Recent searches"
              className="flex items-center gap-1 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
            >
              <Codicon name="history" className="text-[12px]" />
              <span>Recent</span>
            </button>
          )}
        </div>

        {/* Recent searches drop-down pill list */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="rounded-[2px] bg-[#1f1f1f] border border-[#3c3c3c] p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#858585] pb-1 border-b border-[#2b2b2b]">
              <span>Recent queries</span>
              <button
                type="button"
                onClick={() => {
                  clearRecentSearches();
                  setRecentSearches([]);
                  setShowRecentSearches(false);
                }}
                className="text-[#858585] hover:text-[#f14c4c] cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
              {recentSearches.map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => {
                    setQuery(rec);
                    setShowRecentSearches(false);
                  }}
                  className="rounded-[2px] bg-white/5 hover:bg-[#04395e] px-2 py-0.5 text-[11px] text-[#cccccc] hover:text-white truncate max-w-full cursor-pointer"
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Tree List */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5 font-sans text-[12px]">
        {/* Empty state: No query yet */}
        {!query && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#858585] p-4">
            <Codicon name="search" className="text-3xl text-[#555555] mb-2" />
            <p className="text-[12px]">Search across project files</p>
            <p className="text-[11px] text-[#666666] mt-1">
              Supports case matching, whole words, and regular expressions.
            </p>
          </div>
        )}

        {/* No results state */}
        {query && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#858585] p-4">
            <Codicon name="search" className="text-3xl text-[#555555] mb-2" />
            <p className="text-[12px] text-[#cccccc]">No results found for "{query}"</p>
            <div className="text-[11px] text-[#666666] mt-2 space-y-1 text-left">
              <p>• Verify case sensitivity switch.</p>
              <p>• Check whole word constraint.</p>
              <p>• Ignored build/dependency dirs are excluded.</p>
            </div>
          </div>
        )}

        {/* File Results */}
        {results.map((fileResult) => {
          const isCollapsed = Boolean(collapsedFiles[fileResult.path]);
          const isFileActive = activePath === fileResult.path;

          return (
            <div key={fileResult.path} className="overflow-hidden">
              {/* File Header (22px) */}
              <div
                className={`flex h-[22px] items-center justify-between px-2 cursor-pointer transition-colors select-none ${
                  isFileActive ? 'bg-[#04395e] text-white font-normal' : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                }`}
                onClick={() => toggleFileCollapse(fileResult.path)}
                role="button"
                aria-expanded={!isCollapsed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFileCollapse(fileResult.path);
                  }
                }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Codicon
                    name="chevron-right"
                    className={`text-[12px] text-[#858585] shrink-0 transition-transform duration-100 ${
                      !isCollapsed ? 'rotate-90 text-[#cccccc]' : ''
                    }`}
                  />
                  {getFileCodicon(fileResult.path)}
                  <span className="truncate text-[12px] font-normal">
                    {fileResult.path}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {showReplace && (
                    <Tooltip label={`Replace in ${fileResult.path}`} side="left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceInFile(fileResult.path);
                        }}
                        aria-label={`Replace in ${fileResult.path}`}
                        className="rounded-[2px] p-0.5 text-[#858585] hover:text-white hover:bg-white/10"
                      >
                        <Codicon name="replace" className="text-[12px]" />
                      </button>
                    </Tooltip>
                  )}
                  <span className="rounded-[2px] bg-[#2a2d2e] px-1 text-[10px] text-[#858585] font-mono">
                    {fileResult.matches.length}
                  </span>
                </div>
              </div>

              {/* Match Items in File */}
              {!isCollapsed && (
                <div className="pl-4 pr-1 py-0.5 space-y-0.5">
                  {fileResult.matches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => onNavigateToLocation(match.path, match.lineNumber, match.column)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${match.path} line ${match.lineNumber}: ${match.matchText}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onNavigateToLocation(match.path, match.lineNumber, match.column);
                        }
                      }}
                      className="group flex h-[20px] items-center justify-between px-2 hover:bg-[#2a2d2e] cursor-pointer transition-colors text-[#cccccc] hover:text-white"
                    >
                      <div className="flex items-baseline gap-2 truncate font-mono text-[11px]">
                        <span className="text-[10px] text-[#858585] shrink-0 select-none">
                          {match.lineNumber}:{match.column}
                        </span>
                        <div className="truncate">
                          <span>{match.prefixText}</span>
                          <span className="bg-[#613214] text-[#cca700] px-0.5 rounded-[2px]">
                            {match.matchText}
                          </span>
                          <span>{match.suffixText}</span>
                        </div>
                      </div>

                      {showReplace && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplaceSingle(match);
                          }}
                          aria-label="Replace this match"
                          title="Replace this match"
                          className="opacity-0 group-hover:opacity-100 rounded-[2px] p-0.5 text-[#858585] hover:text-white hover:bg-white/20 transition-opacity"
                        >
                          <Codicon name="replace" className="text-[12px]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Workspace Replace All Portalled to Body */}
      {confirmModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setConfirmModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-confirm-title"
          >
            <div
              className="w-full max-w-md rounded-[4px] border border-[#3c3c3c] bg-[#252526] p-4 shadow-2xl text-left text-[#cccccc] font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#3c3c3c]">
                <h3 id="replace-confirm-title" className="text-[13px] font-medium text-white flex items-center gap-2">
                  <Codicon name="warning" className="text-[14px] text-[#cca700]" />
                  <span>Confirm Workspace Replace</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  aria-label="Close dialog"
                  className="rounded-[2px] p-1 text-[#858585] hover:text-white"
                >
                  <Codicon name="close" className="text-[12px]" />
                </button>
              </div>

              <div className="py-3 space-y-3 text-[12px] text-[#cccccc]">
                <p>
                  Are you sure you want to replace{' '}
                  <strong className="text-white">{totalMatches}</strong> occurrence{totalMatches === 1 ? '' : 's'}{' '}
                  across <strong className="text-white">{results.length}</strong> file{results.length === 1 ? '' : 's'}?
                </p>

                <div className="rounded-[2px] bg-[#1f1f1f] border border-[#3c3c3c] p-2.5 font-mono text-[11px] space-y-1">
                  <div>
                    <span className="text-[#858585]">Search: </span>
                    <span className="text-[#cca700] font-bold">{query}</span>
                  </div>
                  <div>
                    <span className="text-[#858585]">Replace: </span>
                    <span className="text-[#73c991] font-bold">{replaceQuery || '(empty string)'}</span>
                  </div>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1 rounded-[2px] bg-[#181818] p-2 border border-[#3c3c3c] text-[11px] text-[#858585]">
                  <p className="font-semibold text-[#cccccc] pb-1">Affected Files:</p>
                  {results.map((r) => (
                    <div key={r.path} className="flex justify-between">
                      <span className="truncate">{r.path}</span>
                      <span className="text-[#858585] shrink-0 ml-2">{r.matches.length} matches</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3c3c3c]">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="rounded-[2px] px-3 py-1 text-[12px] text-[#cccccc] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkReplace}
                  className="rounded-[2px] bg-[#0078d4] hover:bg-[#006cbd] px-3 py-1 text-[12px] font-medium text-white transition-colors cursor-pointer"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default WorkspaceSearchPanel;
