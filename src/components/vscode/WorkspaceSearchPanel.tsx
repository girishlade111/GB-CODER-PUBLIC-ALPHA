import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  Replace,
  ChevronRight,
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Regex,
  X,
  FileCode,
  AlertTriangle,
  History,
  CornerDownLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProjectFile } from '../../types/files';
import {
  SearchMatch,
  SearchOptions,
  searchWorkspaceFiles,
  safeReplaceSingleMatch,
  safeReplaceInFile,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from '../../services/search/workspaceSearchService';
import Tooltip from '../ui/Tooltip';

interface WorkspaceSearchPanelProps {
  files: ProjectFile[];
  activePath: string | null;
  projectId?: string | null;
  onNavigateToLocation: (path: string, line?: number, column?: number) => void;
  onChangeFile: (path: string, content: string) => void;
}

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
      const file = files.find((f) => f.path === match.path);
      if (!file) {
        toast.error(`File ${match.path} not found.`);
        return;
      }

      const result = safeReplaceSingleMatch(file.content, match, replaceQuery, options);
      if (!result.valid || result.newContent === undefined) {
        toast.error(result.reason || 'Could not replace match.');
        return;
      }

      onChangeFile(match.path, result.newContent);
      toast.success(`Replaced match in ${match.path}`);
    },
    [files, replaceQuery, options, onChangeFile],
  );

  // Handle replace in single file
  const handleReplaceInFile = useCallback(
    (filePath: string) => {
      const file = files.find((f) => f.path === filePath);
      if (!file) {
        toast.error(`File ${filePath} not found.`);
        return;
      }

      const result = safeReplaceInFile(file.content, query, replaceQuery, options);
      if (!result.valid || result.newContent === undefined) {
        toast.error(result.reason || 'Could not replace in file.');
        return;
      }

      onChangeFile(filePath, result.newContent);
      toast.success(`Replaced matches in ${filePath}`);
    },
    [files, query, replaceQuery, options, onChangeFile],
  );

  // Handle bulk workspace replace
  const handleExecuteBulkReplace = useCallback(() => {
    if (!query || results.length === 0) return;

    let modifiedFilesCount = 0;
    let errorsCount = 0;

    for (const fileResult of results) {
      const file = files.find((f) => f.path === fileResult.path);
      if (!file) {
        errorsCount++;
        continue;
      }

      const result = safeReplaceInFile(file.content, query, replaceQuery, options);
      if (result.valid && result.newContent !== undefined) {
        onChangeFile(file.path, result.newContent);
        modifiedFilesCount++;
      } else {
        errorsCount++;
      }
    }

    setConfirmModalOpen(false);

    if (errorsCount > 0) {
      toast(`Replaced across ${modifiedFilesCount} files (${errorsCount} skipped due to changes).`, {
        icon: '⚠️',
      });
    } else {
      toast.success(`Successfully replaced across ${modifiedFilesCount} files.`);
    }
  }, [query, results, files, replaceQuery, options, onChangeFile]);

  return (
    <div
      className="flex h-full flex-col bg-[#181824] text-xs text-slate-300 select-none overflow-hidden"
      data-testid="workspace-search-panel"
      role="region"
      aria-label="Workspace Search"
    >
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#262636] px-3 py-2">
        <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px]">
          Search
        </span>
        {results.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={expandAll}
              title="Expand All"
              aria-label="Expand All"
              className="rounded p-1 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={collapseAll}
              title="Collapse All"
              aria-label="Collapse All"
              className="rounded p-1 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Replace Form Container */}
      <div className="shrink-0 p-2.5 space-y-2 border-b border-[#262636]">
        {/* Search Input Row */}
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowReplace((prev) => !prev)}
            aria-label={showReplace ? 'Hide Replace' : 'Show Replace'}
            title={showReplace ? 'Hide Replace' : 'Show Replace'}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            {showReplace ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search (files & contents)..."
              aria-label="Search query"
              className={`w-full rounded border bg-[#12131c] pl-2.5 pr-20 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                error ? 'border-rose-500 focus:ring-rose-500' : 'border-[#262636] focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear Search Query"
                className="absolute right-16 top-1.5 rounded p-0.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Match modifier switches inside input */}
            <div className="absolute right-1 top-1 flex items-center gap-0.5">
              <Tooltip label="Match Case (Alt+C)" side="bottom">
                <button
                  type="button"
                  onClick={() => setCaseSensitive((prev) => !prev)}
                  aria-pressed={caseSensitive}
                  aria-label="Match Case"
                  className={`rounded p-1 transition-colors ${
                    caseSensitive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <CaseSensitive className="h-3 w-3" />
                </button>
              </Tooltip>

              <Tooltip label="Match Whole Word (Alt+W)" side="bottom">
                <button
                  type="button"
                  onClick={() => setWholeWord((prev) => !prev)}
                  aria-pressed={wholeWord}
                  aria-label="Match Whole Word"
                  className={`rounded p-1 transition-colors ${
                    wholeWord
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <WholeWord className="h-3 w-3" />
                </button>
              </Tooltip>

              <Tooltip label="Use Regular Expression (Alt+R)" side="bottom">
                <button
                  type="button"
                  onClick={() => setUseRegex((prev) => !prev)}
                  aria-pressed={useRegex}
                  aria-label="Use Regular Expression"
                  className={`rounded p-1 transition-colors ${
                    useRegex
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <Regex className="h-3 w-3" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Error notice if regex is invalid */}
        {error && (
          <div className="text-[11px] text-rose-400 flex items-center gap-1 pl-6">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Replace Input Row (when toggled open) */}
        {showReplace && (
          <div className="flex items-center gap-1.5 pl-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                aria-label="Replace term"
                className="w-full rounded border border-[#262636] bg-[#12131c] px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {replaceQuery && (
                <button
                  type="button"
                  onClick={() => setReplaceQuery('')}
                  aria-label="Clear Replace Term"
                  className="absolute right-1.5 top-1.5 rounded p-0.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <Tooltip label="Replace All in Workspace" side="bottom">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={totalMatches === 0 || !query}
                aria-label="Replace All in Workspace"
                className={`rounded p-1 text-xs transition-colors flex items-center justify-center ${
                  totalMatches === 0 || !query
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 bg-white/5 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <Replace className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Search Summary & Recent Searches Toggle */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span>
            {query
              ? totalMatches > 0
                ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'} across ${results.length} file${results.length === 1 ? '' : 's'}`
                : 'No matches found'
              : `${files.length} workspace files`}
          </span>

          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRecentSearches((prev) => !prev)}
              aria-label="Recent searches"
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <History className="h-3 w-3" />
              <span>Recent</span>
            </button>
          )}
        </div>

        {/* Recent searches drop-down pill list */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="rounded bg-[#12131c] border border-[#262636] p-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-[#262636]">
              <span>Recent queries</span>
              <button
                type="button"
                onClick={() => {
                  clearRecentSearches();
                  setRecentSearches([]);
                  setShowRecentSearches(false);
                }}
                className="text-slate-500 hover:text-rose-400"
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
                  className="rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[11px] text-slate-300 truncate max-w-full"
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[11px]">
        {/* Empty state: No query yet */}
        {!query && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 p-4">
            <Search className="h-6 w-6 text-slate-600 mb-2" />
            <p className="font-sans text-xs">Search across project files</p>
            <p className="font-sans text-[11px] text-slate-600 mt-1">
              Supports case matching, whole words, and regular expressions.
            </p>
          </div>
        )}

        {/* No results state */}
        {query && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 p-4">
            <Search className="h-6 w-6 text-slate-600 mb-2" />
            <p className="font-sans text-xs text-slate-400">No results found for "{query}"</p>
            <div className="font-sans text-[11px] text-slate-600 mt-2 space-y-1 text-left">
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
            <div
              key={fileResult.path}
              className="rounded border border-transparent hover:border-[#262636] overflow-hidden"
            >
              {/* File Header */}
              <div
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                  isFileActive ? 'bg-indigo-950/40 text-indigo-200' : 'hover:bg-white/5 text-slate-300'
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
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
                  )}
                  <FileCode className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate font-sans font-medium text-xs">
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
                        className="rounded p-0.5 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Replace className="h-3 w-3" />
                      </button>
                    </Tooltip>
                  )}
                  <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-sans">
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
                      className="group flex items-center justify-between rounded px-2 py-0.5 hover:bg-white/10 cursor-pointer transition-colors text-slate-400 hover:text-slate-200"
                    >
                      <div className="flex items-baseline gap-2 truncate">
                        <span className="text-[10px] text-slate-500 shrink-0 select-none">
                          {match.lineNumber}:{match.column}
                        </span>
                        <div className="truncate">
                          <span>{match.prefixText}</span>
                          <span className="bg-amber-400/25 text-amber-200 font-bold px-0.5 rounded">
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
                          className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-400 hover:text-white hover:bg-white/20 transition-opacity"
                        >
                          <CornerDownLeft className="h-3 w-3" />
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

      {/* Confirmation Modal for Workspace Replace All */}
      {confirmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="replace-confirm-title"
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-[#161824] p-5 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 id="replace-confirm-title" className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Confirm Workspace Replace
              </h3>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                aria-label="Close dialog"
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-300">
              <p>
                Are you sure you want to replace{' '}
                <strong className="text-white">{totalMatches}</strong> occurrence{totalMatches === 1 ? '' : 's'}{' '}
                across <strong className="text-white">{results.length}</strong> file{results.length === 1 ? '' : 's'}?
              </p>

              <div className="rounded bg-black/40 border border-slate-800 p-2.5 font-mono text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500">Search: </span>
                  <span className="text-amber-300 font-bold">{query}</span>
                </div>
                <div>
                  <span className="text-slate-500">Replace: </span>
                  <span className="text-emerald-300 font-bold">{replaceQuery || '(empty string)'}</span>
                </div>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 rounded bg-[#10121a] p-2 border border-slate-800 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-500 pb-1">Affected Files:</p>
                {results.map((r) => (
                  <div key={r.path} className="flex justify-between">
                    <span className="truncate">{r.path}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{r.matches.length} matches</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="rounded px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkReplace}
                className="rounded bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-colors"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSearchPanel;
