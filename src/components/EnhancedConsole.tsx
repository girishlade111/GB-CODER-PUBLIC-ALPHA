import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Copy,
  Filter,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Terminal,
  TerminalSquare,
  Trash2,
} from 'lucide-react';
import ConsoleTab from './Console/ConsoleTab';
import ValidatorTab, { ValidatorFilter } from './Console/ValidatorTab';
import TerminalTab from './Console/TerminalTab';
import PreviewRunTab from './Console/PreviewRunTab';
import { MultiFileProject } from '../types/files';
import { ValidationSummary } from '../services/validationService';
import { ShellPackage, ShellPackageError } from '../services/localShell';
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
  const [validatorFilter, setValidatorFilter] = useState<ValidatorFilter>('all');
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [previewRunSignal, setPreviewRunSignal] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  /** Set the first time the Terminal tab is opened; never unset. */
  const [hasOpenedTerminal, setHasOpenedTerminal] = useState(false);

  /* A voice command can focus a sub-tab directly. */
  useEffect(() => {
    if (!subTabRequest) return;
    setActiveMode(subTabRequest.tab);
    if (subTabRequest.tab === 'terminal') setHasOpenedTerminal(true);
    onSubTabRequestHandled?.();
  }, [subTabRequest, onSubTabRequestHandled]);

  /** Count shown next to "GB Console" for the active sub-tab. */
  const itemCount = useMemo(() => {
    switch (activeMode) {
      case 'console':
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
  }, [activeMode, consoleFilter, counts.total, messages, validation.issues.length, previewCount]);

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
      text = messages
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

  const tabs: { key: ConsoleMode; label: string; icon: React.ReactNode; badge?: string | null; tone?: string }[] = [
    {
      key: 'console',
      label: 'Console',
      icon: <Terminal className="w-4 h-4" />,
      badge: counts.total > 0 ? String(counts.total) : null,
      tone: counts.error > 0 ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-content-secondary',
    },
    {
      key: 'validator',
      label: 'Validator',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: validatorBadge,
      tone:
        validation.errors > 0
          ? 'bg-red-500/20 text-red-300'
          : validation.warnings > 0
            ? 'bg-amber-500/20 text-amber-300'
            : 'bg-white/10 text-content-secondary',
    },
    { key: 'preview', label: 'Preview', icon: <Play className="w-4 h-4" /> },
    { key: 'terminal', label: 'Terminal', icon: <TerminalSquare className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`bg-surface-base border border-stroke-subtle rounded-lg overflow-hidden flex flex-col h-full min-h-0 ${
        isExpanded ? 'fixed inset-4 z-50' : 'relative'
      } ${className}`}
    >
      {/* Header */}
      <div className="bg-surface-raised px-3 py-1.5 border-b border-stroke-subtle flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs uppercase tracking-wide font-semibold text-content-secondary">
            GB Console
          </h2>
          <span
            className="text-[10px] bg-accent/80 text-white px-2 py-0.5 rounded"
            data-testid="console-item-count"
          >
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {activeMode === 'validator' && (
            <button
              onClick={onRevalidate}
              className="px-2 py-1 rounded text-xs flex items-center gap-1 text-content-secondary hover:bg-white/10"
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
                className="px-2 py-1 rounded text-xs text-content-secondary hover:bg-white/10"
                title="Toggle the preview pane"
              >
                {showPreviewPane ? 'Hide pane' : 'Show pane'}
              </button>
              <button
                onClick={() => setPreviewRunSignal((value) => value + 1)}
                className="px-2 py-1 rounded text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                title="Run this snippet"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
            </>
          )}

          {(activeMode === 'console' || activeMode === 'validator') && (
            <button
              onClick={copyActiveOutput}
              className="p-1.5 rounded text-content-muted hover:bg-white/10 hover:text-content-primary"
              title="Copy output"
              aria-label="Copy output"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {activeMode !== 'terminal' && (
            <button
              onClick={clearActive}
              className="p-1.5 rounded text-content-muted hover:bg-white/10 hover:text-content-primary"
              title={activeMode === 'validator' ? 'Re-run validation' : 'Clear console'}
              aria-label="Clear console"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded((value) => !value)}
            className="p-1.5 rounded text-content-muted hover:bg-white/10 hover:text-content-primary"
            title={isExpanded ? 'Minimize' : 'Maximize'}
            aria-label={isExpanded ? 'Minimize console' : 'Maximize console'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-tab strip, with live counts */}
      <div className="bg-surface-raised border-b border-stroke-subtle flex items-center px-2 flex-shrink-0">
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
            className={`px-3 py-2 -mb-[1px] text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeMode === key
                ? 'text-content-primary border-accent'
                : 'text-content-muted border-transparent hover:text-content-primary'
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
        <div className="bg-surface-base border-b border-stroke-subtle px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-content-muted" />
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
                    : 'bg-white/5 text-content-secondary hover:bg-white/10'
                }`}
              >
                {filter === 'all' ? 'All' : filter.toUpperCase()}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeMode === 'validator' && (
        <div className="bg-surface-base border-b border-stroke-subtle px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-content-muted" />
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
                    : 'bg-white/5 text-content-secondary hover:bg-white/10'
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
        {activeMode === 'console' && <ConsoleTab messages={messages} filter={consoleFilter} />}

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
