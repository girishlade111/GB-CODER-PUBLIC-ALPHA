import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Copy,
  Check,
  Search,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DiagnosticItem,
  DiagnosticSeverity,
  diagnosticsService,
} from '../../services/diagnostics/diagnosticsService';
import Tooltip from '../ui/Tooltip';

interface ProblemsPanelProps {
  onNavigateToLocation: (path: string, line?: number, column?: number) => void;
  activeProjectId?: string | null;
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  onNavigateToLocation,
  activeProjectId,
}) => {
  const [state, setState] = useState(() => diagnosticsService.getState());
  const [selectedSeverity, setSelectedSeverity] = useState<DiagnosticSeverity | 'all'>('all');
  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    diagnosticsService.setProjectId(activeProjectId);
    const unsubscribe = diagnosticsService.subscribe(() => {
      setState(diagnosticsService.getState());
    });
    return unsubscribe;
  }, [activeProjectId]);

  const filteredItems = useMemo(() => {
    return state.items.filter((item) => {
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) {
        return false;
      }
      if (filterText.trim()) {
        const query = filterText.toLowerCase();
        const msg = item.message.toLowerCase();
        const p = (item.path || '').toLowerCase();
        const code = String(item.code || '').toLowerCase();
        return msg.includes(query) || p.includes(query) || code.includes(query);
      }
      return true;
    });
  }, [state.items, selectedSeverity, filterText]);

  // Group by file path
  const groupedByFile = useMemo(() => {
    const groups: Record<string, DiagnosticItem[]> = {};
    for (const item of filteredItems) {
      const key = item.path || (item.source === 'runtime' ? 'Runtime Environment' : 'Workspace');
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [filteredItems]);

  const handleCopyDiagnostic = useCallback((diag: DiagnosticItem) => {
    const formatted = diagnosticsService.formatDiagnostic(diag);
    void navigator.clipboard?.writeText(formatted);
    setCopiedId(diag.id);
    toast.success('Diagnostic copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div
      className="flex h-full flex-col bg-[#141622] text-xs text-slate-300 font-mono select-none overflow-hidden"
      data-testid="problems-panel"
      role="region"
      aria-label="Workspace Problems"
    >
      {/* Top Filter and Search Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#222538] bg-[#11131c] px-3 py-1.5 gap-2">
        {/* Severity filter buttons */}
        <div className="flex items-center gap-1 font-sans text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedSeverity('all')}
            className={`rounded px-2 py-0.5 transition-colors ${
              selectedSeverity === 'all'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            All ({state.totalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('error')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
              selectedSeverity === 'error'
                ? 'bg-rose-600 text-white font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-rose-300'
            }`}
          >
            <AlertCircle className="h-3 w-3 text-rose-400" />
            Errors ({state.errorCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('warning')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
              selectedSeverity === 'warning'
                ? 'bg-amber-600 text-white font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            Warnings ({state.warningCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('info')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
              selectedSeverity === 'info'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
            }`}
          >
            <Info className="h-3 w-3 text-cyan-400" />
            Info ({state.infoCount})
          </button>
        </div>

        {/* Filter input */}
        <div className="relative flex items-center w-48">
          <Search className="h-3 w-3 text-slate-500 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter problems..."
            aria-label="Filter problems"
            className="w-full rounded bg-[#181a29] border border-[#262940] pl-7 pr-2 py-0.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="shrink-0 px-3 py-1 bg-[#10121a] border-b border-[#1e2235] text-[10px] text-slate-500 flex items-center justify-between font-sans">
        <span>Diagnostics Scope: Open Monaco editor models & container runtime errors</span>
        <span>{filteredItems.length} displayed</span>
      </div>

      {/* Main Problems List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {state.totalCount === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 font-sans p-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/70 mb-2" />
            <p className="text-sm font-medium text-slate-300">No problems detected</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No errors or warnings found in active editor models or runtime environment.
            </p>
          </div>
        )}

        {state.totalCount > 0 && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 font-sans p-6">
            <p className="text-xs text-slate-400">No problems match the current filter</p>
          </div>
        )}

        {Object.entries(groupedByFile).map(([filePath, items]) => (
          <div key={filePath} className="rounded border border-[#222538] bg-[#161826] overflow-hidden">
            {/* File Group Header */}
            <div className="flex items-center justify-between px-2.5 py-1 bg-[#12131f] border-b border-[#222538] text-[11px] font-sans font-medium text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <FileCode className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{filePath}</span>
              </div>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                {items.length}
              </span>
            </div>

            {/* Diagnostic items */}
            <div className="divide-y divide-[#1e2133]">
              {items.map((item) => {
                const isError = item.severity === 'error';
                const isWarning = item.severity === 'warning';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.path) {
                        onNavigateToLocation(item.path, item.line, item.column);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && item.path) {
                        onNavigateToLocation(item.path, item.line, item.column);
                      }
                    }}
                    className="group flex items-start justify-between p-2 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      {isError ? (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-[11px] ${
                              isError
                                ? 'text-rose-200'
                                : isWarning
                                ? 'text-amber-200'
                                : 'text-cyan-200'
                            }`}
                          >
                            {item.message}
                          </span>
                          {item.code && (
                            <span className="text-[10px] text-slate-500 font-sans">
                              [{item.code}]
                            </span>
                          )}
                          <span className="rounded bg-white/5 px-1 py-0.2 text-[9px] uppercase tracking-wider text-slate-400">
                            {item.source}
                          </span>
                        </div>

                        {item.path && item.line && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Line {item.line}, Col {item.column}
                          </p>
                        )}
                      </div>
                    </div>

                    <Tooltip label="Copy message" side="left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyDiagnostic(item);
                        }}
                        aria-label="Copy diagnostic message"
                        className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-opacity shrink-0"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemsPanel;
