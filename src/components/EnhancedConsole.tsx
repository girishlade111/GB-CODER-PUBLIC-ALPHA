import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle,
  ChevronDown,
  Copy,
  Download,
  FileCode,
  FileText,
  Filter,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Search,
  Terminal,
  TerminalSquare,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConsoleTab from './Console/ConsoleTab';
import ValidatorTab, { ValidatorFilter } from './Console/ValidatorTab';
import TerminalTab from './Console/TerminalTab';
import PreviewRunTab from './Console/PreviewRunTab';
import { MultiFileProject } from '../types/files';
import { ValidationSummary } from '../services/validationService';
import { ShellPackage, ShellPackageError } from '../services/localShell';
import { matchesConsoleMessage } from '../utils/consoleFilter';
import { exportConsoleLogs } from '../utils/consoleExport';
import type { ConsoleLevelFilter, ConsoleMessage } from '../types/consoleFeed';
import type { ConsoleCounts } from '../hooks/useConsoleFeed';

/**
 * The Console panel shell: hosts the Console, Validator, Preview and Terminal
 * sub-tabs.
 *
 * The visual shell (header, tab strip, filter row) is carried over from the
 * existing design; what changed is that every count, filter and action is now
 * wired to real state instead of being decorative.
 */

interface EnhancedConsoleProps {
  messages: ConsoleMessage[];
  counts: ConsoleCounts;
  onClear: () => void;
  html: string;
  css: string;
  javascript: string;
  project: MultiFileProject;
  validation: ValidationSummary;
  isValidating: boolean;
  isValidationReady: boolean;
  onRevalidate: () => void;
  resolvedPackages: ShellPackage[];
  unresolvedPackages: ShellPackageError[];
  isResolvingPackages: boolean;
  /** Voice-driven sub-tab focus request; the nonce allows repeats. */
  subTabRequest?: { tab: ConsoleMode; nonce: number } | null;
  /** Called once the request has been applied, so it is not replayed. */
  onSubTabRequestHandled?: () => void;
  className?: string;
}

type ConsoleMode = 'console' | 'validator' | 'preview' | 'terminal';

const CONSOLE_FILTERS: ConsoleLevelFilter[] = ['all', 'log', 'info', 'warn', 'error'];
const VALIDATOR_FILTERS: ValidatorFilter[] = ['all', 'errors', 'warnings'];

const EnhancedConsole: React.FC<EnhancedConsoleProps> = ({
  messages,
  counts,
  onClear,
  html,
  css,
  javascript,
  project,
  validation,
  isValidating,
  isValidationReady,
  onRevalidate,
  resolvedPackages,
  unresolvedPackages,
  isResolvingPackages,
  subTabRequest,
  onSubTabRequestHandled,
  className = '',
}) => {
  const [activeMode, setActiveMode] = useState<ConsoleMode>('console');
  const [isExpanded, setIsExpanded] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<ConsoleLevelFilter>('all');
  const [consoleSearchQuery, setConsoleSearchQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [validatorFilter, setValidatorFilter] = useState<ValidatorFilter>('all');
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [previewRunSignal, setPreviewRunSignal] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  /** Set the first time the Terminal tab is opened; never unset. */
  const [hasOpenedTerminal, setHasOpenedTerminal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  /* A voice command can focus a sub-tab directly. */
  useEffect(() => {
    if (!subTabRequest) return;
    setActiveMode(subTabRequest.tab);
    if (subTabRequest.tab === 'terminal') setHasOpenedTerminal(true);
    onSubTabRequestHandled?.();
  }, [subTabRequest, onSubTabRequestHandled]);

  /* Close export dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  /** Messages matching the level and search query */
  const filteredConsoleMessages = useMemo(() => {
    let result = consoleFilter === 'all'
      ? messages
      : messages.filter((message) => message.level === consoleFilter);
    if (consoleSearchQuery && consoleSearchQuery.trim()) {
      result = result.filter((message) =>
        matchesConsoleMessage(message, consoleSearchQuery, { isRegex, isCaseSensitive }),
      );
    }
    return result;
  }, [messages, consoleFilter, consoleSearchQuery, isRegex, isCaseSensitive]);

  /** Count shown next to "GB Console" for the active sub-tab. */
  const itemCount = useMemo(() => {
    switch (activeMode) {
      case 'console':
        if (consoleSearchQuery && consoleSearchQuery.trim()) {
          return filteredConsoleMessages.reduce((sum, message) => sum + message.count, 0);
        }
        return consoleFilter === 'all'
          ? counts.total
          : messages
              .filter((message) => message.level === consoleFilter)
              .reduce((sum, message) => sum + message.count, 0);
      case 'validator':
        return validation.issues.length;
      case 'preview':
        return previewCount;
      default:
        return 0;
    }
  }, [
    activeMode,
    consoleFilter,
    consoleSearchQuery,
    filteredConsoleMessages,
    counts.total,
    messages,
    validation.issues.length,
    previewCount,
  ]);

  /** "2 errors, 1 warning" — split when both are present, as the brief asks. */
  const validatorBadge = useMemo(() => {
    const { errors, warnings } = validation;
    if (errors === 0 && warnings === 0) return null;
    const parts: string[] = [];
    if (errors > 0) parts.push(`${errors} error${errors === 1 ? '' : 's'}`);
    if (warnings > 0) parts.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);
    return parts.join(', ');
  }, [validation]);

  const copyActiveOutput = useCallback(() => {
    let text = '';

    if (activeMode === 'console') {
      const messagesToCopy = consoleSearchQuery.trim()
        ? filteredConsoleMessages
        : messages;
      text = messagesToCopy
        .map((message) => {
          const args = message.args
            .map((arg) => ('value' in arg ? String(arg.value) : arg.kind))
            .join(' ');
          return `[${new Date(message.timestamp).toISOString()}] [${message.level.toUpperCase()}] ${args}`;
        })
        .join('\n');
    } else if (activeMode === 'validator') {
      text = validation.issues
        .map(
          (issue) =>
            `${issue.severity.toUpperCase()} ${issue.fileLabel}:${issue.line}:${issue.column} ${issue.rule} — ${issue.message}`,
        )
        .join('\n');
    }

    if (text) void navigator.clipboard.writeText(text);
  }, [activeMode, messages, validation.issues]);

  const clearActive = useCallback(() => {
    if (activeMode === 'console') onClear();
    else if (activeMode === 'validator') onRevalidate();
  }, [activeMode, onClear, onRevalidate]);

  const handleExport = useCallback(
    (format: 'txt' | 'json', exportFilteredOnly: boolean) => {
      const listToExport = exportFilteredOnly ? filteredConsoleMessages : messages;

      if (listToExport.length === 0) {
        toast.error('No console logs to export');
        setShowExportMenu(false);
        return;
      }

      exportConsoleLogs(listToExport, format, {
        filter: consoleFilter,
        searchQuery: consoleSearchQuery,
        totalCount: messages.length,
        baseName:
          exportFilteredOnly && (consoleFilter !== 'all' || consoleSearchQuery.trim())
            ? 'filtered-console-logs'
            : 'console-logs',
      });

      toast.success(
        `Exported ${listToExport.length} log${listToExport.length === 1 ? '' : 's'} (.${format})`,
      );
      setShowExportMenu(false);
    },
    [filteredConsoleMessages, messages, consoleFilter, consoleSearchQuery],
  );

  const tabs: { key: ConsoleMode; label: string; icon: React.ReactNode; badge?: string | null; tone?: string }[] = [
    {
      key: 'console',
      label: 'Console',
      icon: <Terminal className="w-4 h-4" />,
      badge: counts.total > 0 ? String(counts.total) : null,
      tone: counts.error > 0 ? 'bg-danger/20 text-red-300' : 'bg-product-active text-content-on-dark-soft',
    },
    {
      key: 'validator',
      label: 'Validator',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: validatorBadge,
      tone:
        validation.errors > 0
          ? 'bg-danger/20 text-red-300'
          : validation.warnings > 0
            ? 'bg-warning/20 text-yellow-300'
            : 'bg-product-active text-content-on-dark-soft',
    },
    { key: 'preview', label: 'Preview', icon: <Play className="w-4 h-4" /> },
    { key: 'terminal', label: 'Terminal', icon: <TerminalSquare className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`bg-product border border-stroke-dark rounded-lg overflow-hidden flex flex-col h-full min-h-0 ${
        isExpanded ? 'fixed inset-4 z-50' : 'relative'
      } ${className}`}
    >
      {/* Header */}
      <div className="bg-product-soft px-3 py-1.5 border-b border-stroke-dark flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal" />
          <h2 className="font-sans text-xs uppercase tracking-wide font-medium text-content-on-dark-soft">
            GB Console
          </h2>
          <span
            className="text-[10px] bg-accent text-accent-fg px-2 py-0.5 rounded"
            data-testid="console-item-count"
          >
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {activeMode === 'validator' && (
            <button
              onClick={onRevalidate}
              className="px-2 py-1 rounded text-xs flex items-center gap-1 text-content-on-dark-soft hover:bg-product-hover"
              title="Re-run validation now"
            >
              <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
              Validate
            </button>
          )}

          {activeMode === 'preview' && (
            <>
              <button
                onClick={() => setShowPreviewPane((value) => !value)}
                className="px-2 py-1 rounded text-xs text-content-on-dark-soft hover:bg-product-hover"
                title="Toggle the preview pane"
              >
                {showPreviewPane ? 'Hide pane' : 'Show pane'}
              </button>
              <button
                onClick={() => setPreviewRunSignal((value) => value + 1)}
                className="px-2 py-1 rounded text-xs flex items-center gap-1 bg-accent hover:bg-accent-hover text-accent-fg"
                title="Run this snippet"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
            </>
          )}

          {activeMode === 'console' && (
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((open) => !open)}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  showExportMenu
                    ? 'bg-product-hover text-content-on-dark'
                    : 'text-content-on-dark-soft hover:bg-product-hover hover:text-content-on-dark'
                }`}
                title="Export console logs as Text or JSON"
                aria-label="Export Logs"
                aria-expanded={showExportMenu}
                data-testid="console-export-logs-button"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline font-medium">Export</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-60 bg-product-elevated border border-stroke-dark-strong rounded-lg shadow-2xl z-50 p-1.5 text-xs font-sans text-content-on-dark"
                  data-testid="console-export-dropdown"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-content-on-dark-soft border-b border-stroke-dark pb-1.5 mb-1 flex justify-between items-center">
                    <span>Export Logs</span>
                    <span className="text-[10px] text-accent font-mono font-normal">
                      {filteredConsoleMessages.length} log{filteredConsoleMessages.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleExport('txt', true)}
                      className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-product-hover text-content-on-dark transition-colors group"
                      data-testid="console-export-txt-btn"
                    >
                      <FileText className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs">Text File (.txt)</div>
                        <div className="text-[10px] text-content-on-dark-soft truncate">
                          Formatted with timestamps & stack traces
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport('json', true)}
                      className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 hover:bg-product-hover text-content-on-dark transition-colors group"
                      data-testid="console-export-json-btn"
                    >
                      <FileCode className="w-4 h-4 text-teal group-hover:scale-105 transition-transform flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs">JSON File (.json)</div>
                        <div className="text-[10px] text-content-on-dark-soft truncate">
                          Full structured logs & arguments
                        </div>
                      </div>
                    </button>
                  </div>

                  {(consoleFilter !== 'all' || Boolean(consoleSearchQuery && consoleSearchQuery.trim())) &&
                    messages.length !== filteredConsoleMessages.length && (
                      <div className="mt-1.5 pt-1.5 border-t border-stroke-dark">
                        <div className="px-2 py-0.5 text-[10px] text-content-on-dark-soft">
                          Export unfiltered:
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => handleExport('txt', false)}
                            className="px-2 py-1 rounded text-[11px] bg-product-soft hover:bg-product-hover text-center truncate transition-colors text-content-on-dark-soft hover:text-content-on-dark border border-stroke-dark"
                          >
                            All .txt ({messages.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExport('json', false)}
                            className="px-2 py-1 rounded text-[11px] bg-product-soft hover:bg-product-hover text-center truncate transition-colors text-content-on-dark-soft hover:text-content-on-dark border border-stroke-dark"
                          >
                            All .json ({messages.length})
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {(activeMode === 'console' || activeMode === 'validator') && (
            <button
              onClick={copyActiveOutput}
              className="p-1.5 rounded text-content-on-dark-soft hover:bg-product-hover hover:text-content-on-dark"
              title="Copy output"
              aria-label="Copy output"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {activeMode !== 'terminal' && (
            <button
              onClick={clearActive}
              className="p-1.5 rounded text-content-on-dark-soft hover:bg-product-hover hover:text-content-on-dark"
              title={activeMode === 'validator' ? 'Re-run validation' : 'Clear console'}
              aria-label="Clear console"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded((value) => !value)}
            className="p-1.5 rounded text-content-on-dark-soft hover:bg-product-hover hover:text-content-on-dark"
            title={isExpanded ? 'Minimize' : 'Maximize'}
            aria-label={isExpanded ? 'Minimize console' : 'Maximize console'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-tab strip, with live counts */}
      <div className="bg-product-soft border-b border-stroke-dark flex items-center px-2 flex-shrink-0 compact:overflow-x-auto">
        {tabs.map(({ key, label, icon, badge, tone }) => (
          <button
            key={key}
            onClick={() => {
              setActiveMode(key);
              if (key === 'terminal') setHasOpenedTerminal(true);
            }}
            role="tab"
            aria-selected={activeMode === key}
            data-testid={`console-subtab-${key}`}
            className={`px-3 py-2 -mb-[1px] text-sm font-medium border-b-2 flex items-center gap-2 transition-colors compact:min-h-[44px] compact:shrink-0 compact:whitespace-nowrap ${
              activeMode === key
                ? 'text-content-on-dark border-accent'
                : 'text-content-on-dark-soft border-transparent hover:text-content-on-dark'
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            {badge && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tone}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter rows */}
      {activeMode === 'console' && (
        <div className="bg-product border-b border-stroke-dark px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-content-on-dark-soft mr-0.5" />
            {CONSOLE_FILTERS.map((filter) => {
              const count =
                filter === 'all' ? counts.total : counts[filter as keyof ConsoleCounts];
              return (
                <button
                  key={filter}
                  onClick={() => setConsoleFilter(filter)}
                  data-testid={`console-filter-${filter}`}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    consoleFilter === filter
                      ? 'bg-accent text-accent-fg'
                      : 'bg-product-hover text-content-on-dark-soft hover:bg-product-active'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.toUpperCase()}
                  <span className="ml-1 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search / Filter input */}
          <div className="flex items-center gap-1.5 flex-1 max-w-xs sm:max-w-sm min-w-[190px]">
            <div className="relative flex items-center w-full">
              <Search className="w-3.5 h-3.5 text-content-on-dark-soft absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={consoleSearchQuery}
                onChange={(e) => setConsoleSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setConsoleSearchQuery('');
                  }
                }}
                placeholder="Filter logs (e.g. error, fetch, /pattern/)..."
                className="w-full bg-product-soft text-content-on-dark text-xs pl-7 pr-16 py-1 rounded border border-stroke-dark focus:border-accent focus:outline-none placeholder:text-content-on-dark-soft/60"
                data-testid="console-search-input"
                aria-label="Filter console logs"
              />

              <div className="absolute right-1 flex items-center gap-0.5">
                {/* Match Case Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCaseSensitive((v) => !v)}
                  title={isCaseSensitive ? 'Match Case (Active)' : 'Match Case'}
                  className={`px-1 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    isCaseSensitive
                      ? 'bg-accent text-accent-fg'
                      : 'text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-hover'
                  }`}
                  data-testid="console-filter-case-toggle"
                >
                  Aa
                </button>

                {/* Regex Toggle */}
                <button
                  type="button"
                  onClick={() => setIsRegex((v) => !v)}
                  title={isRegex ? 'Use Regular Expression (Active)' : 'Use Regular Expression'}
                  className={`px-1 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    isRegex
                      ? 'bg-accent text-accent-fg'
                      : 'text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-hover'
                  }`}
                  data-testid="console-filter-regex-toggle"
                >
                  .*
                </button>

                {/* Clear button if has query */}
                {consoleSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setConsoleSearchQuery('')}
                    title="Clear filter (Esc)"
                    aria-label="Clear filter"
                    className="p-0.5 text-content-on-dark-soft hover:text-content-on-dark rounded hover:bg-product-hover"
                    data-testid="console-filter-clear-button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Match counter badge when searching */}
            {Boolean(consoleSearchQuery && consoleSearchQuery.trim()) && (
              <span
                className={`text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded font-mono ${
                  filteredConsoleMessages.length > 0
                    ? 'bg-product-active text-content-on-dark-soft'
                    : 'bg-danger/20 text-red-300'
                }`}
                title={`${filteredConsoleMessages.length} matching message${
                  filteredConsoleMessages.length === 1 ? '' : 's'
                }`}
              >
                {filteredConsoleMessages.length} match{filteredConsoleMessages.length === 1 ? '' : 'es'}
              </span>
            )}
          </div>
        </div>
      )}

      {activeMode === 'validator' && (
        <div className="bg-product border-b border-stroke-dark px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-content-on-dark-soft" />
          {VALIDATOR_FILTERS.map((filter) => {
            const count =
              filter === 'all'
                ? validation.issues.length
                : filter === 'errors'
                  ? validation.errors
                  : validation.warnings;
            return (
              <button
                key={filter}
                onClick={() => setValidatorFilter(filter)}
                data-testid={`validator-filter-${filter}`}
                className={`px-2 py-0.5 rounded text-xs font-medium capitalize transition-colors ${
                  validatorFilter === filter
                    ? 'bg-accent text-accent-fg'
                    : 'bg-product-hover text-content-on-dark-soft hover:bg-product-active'
                }`}
              >
                {filter}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeMode === 'console' && (
          <ConsoleTab
            messages={messages}
            filter={consoleFilter}
            searchQuery={consoleSearchQuery}
            isRegex={isRegex}
            isCaseSensitive={isCaseSensitive}
            onClearSearch={() => setConsoleSearchQuery('')}
          />
        )}

        {activeMode === 'validator' && (
          <ValidatorTab
            summary={validation}
            filter={validatorFilter}
            isValidating={isValidating}
            isReady={isValidationReady}
          />
        )}

        {activeMode === 'preview' && (
          <PreviewRunTab
            html={html}
            css={css}
            javascript={javascript}
            showPreview={showPreviewPane}
            runSignal={previewRunSignal}
            onCountChange={setPreviewCount}
          />
        )}

        {/*
          Mounted lazily on first use, then kept alive: xterm loses its
          scrollback and the in-progress input line if it is torn down on every
          tab switch, but mounting it before the tab is ever opened would pay
          for the emulator that most sessions never touch.
        */}
        {hasOpenedTerminal && (
        <div className={`h-full ${activeMode === 'terminal' ? 'block' : 'hidden'}`}>
          <TerminalTab
            project={project}
            resolvedPackages={resolvedPackages}
            unresolvedPackages={unresolvedPackages}
            isResolvingPackages={isResolvingPackages}
            isActive={activeMode === 'terminal'}
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedConsole;
