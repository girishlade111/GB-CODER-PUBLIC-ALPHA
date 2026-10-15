import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trash2,
  Copy,
  Check,
  Search,
  Terminal,
  Server,
  Layers,
  FileCheck,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  OutputLogEntry,
  LogCategory,
  outputLogService,
} from '../../services/logging/outputLogService';
import Tooltip from '../ui/Tooltip';

interface OutputPanelProps {
  activeProjectId?: string | null;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ activeProjectId }) => {
  const [logs, setLogs] = useState<OutputLogEntry[]>(() => outputLogService.getLogs());
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    outputLogService.setProjectId(activeProjectId);
    setLogs(outputLogService.getLogs());
    const unsubscribe = outputLogService.subscribe(() => {
      setLogs([...outputLogService.getLogs()]);
    });
    return unsubscribe;
  }, [activeProjectId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query) ||
          log.level.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, selectedCategory, searchFilter]);

  const handleCopyAll = useCallback(() => {
    if (logs.length === 0) return;
    const formatted = outputLogService.formatAllForClipboard();
    void navigator.clipboard?.writeText(formatted);
    setCopiedAll(true);
    toast.success('All logs copied to clipboard');
    setTimeout(() => setCopiedAll(false), 2000);
  }, [logs.length]);

  const handleClear = useCallback(() => {
    outputLogService.clearLogs();
    toast.success('Output cleared');
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'server':
        return <Server className="h-3 w-3 text-cyan-400" />;
      case 'runtime':
        return <Cpu className="h-3 w-3 text-purple-400" />;
      case 'build':
        return <Layers className="h-3 w-3 text-amber-400" />;
      case 'fs':
        return <FileCheck className="h-3 w-3 text-emerald-400" />;
      case 'system':
      default:
        return <Terminal className="h-3 w-3 text-indigo-400" />;
    }
  };

  const getLevelColor = (level: OutputLogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'warn':
        return 'text-amber-400';
      case 'success':
        return 'text-emerald-400';
      case 'info':
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-[#141622] text-xs font-mono text-slate-300 select-none overflow-hidden"
      data-testid="output-panel"
      role="region"
      aria-label="Output Console"
    >
      {/* Top Header Actions & Category Selector */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#222538] bg-[#11131c] px-3 py-1.5 gap-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 font-sans text-[11px]">
          {(['all', 'system', 'server', 'runtime', 'build', 'fs'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded px-2 py-0.5 capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Channels' : cat === 'fs' ? 'File Sync' : cat}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center w-40">
            <Search className="h-3 w-3 text-slate-500 absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search output..."
              aria-label="Search output"
              className="w-full rounded bg-[#181a29] border border-[#262940] pl-7 pr-2 py-0.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Tooltip label="Copy All Logs" side="bottom">
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={logs.length === 0}
              aria-label="Copy All Logs"
              className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] font-sans text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copiedAll ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>Copy</span>
            </button>
          </Tooltip>

          <Tooltip label="Clear Output" side="bottom">
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear Output"
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-sans text-xs">
            <Terminal className="h-6 w-6 text-slate-600 mb-2" />
            <p>No output messages in this channel</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 py-0.5 leading-relaxed hover:bg-white/[0.02] rounded px-1"
            >
              <span className="text-slate-500 text-[10px] select-none shrink-0 pt-0.5 font-mono">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-sans tracking-wide text-slate-400 shrink-0 select-none">
                {getCategoryIcon(log.category)}
                [{log.category}]
              </span>
              <span className={`break-all ${getLevelColor(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="shrink-0 px-3 py-1 bg-[#10121a] border-t border-[#1e2235] text-[10px] text-slate-500 flex items-center justify-between font-sans">
        <span>Channel: {selectedCategory.toUpperCase()} | Bounded Buffer: Max 500 lines</span>
        <span>{filteredLogs.length} entries</span>
      </div>
    </div>
  );
};

export default OutputPanel;
