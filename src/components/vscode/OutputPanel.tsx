import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  OutputLogEntry,
  LogCategory,
  outputLogService,
} from '../../services/logging/outputLogService';
import Tooltip from '../ui/Tooltip';
import Codicon from '../ui/Codicon';

interface OutputPanelProps {
  activeProjectId?: string | null;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ activeProjectId }) => {
  const [logs, setLogs] = useState<OutputLogEntry[]>(() => outputLogService.getLogs());
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

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
        return <Codicon name="server" className="text-[#0078d4] text-[12px]" />;
      case 'runtime':
        return <Codicon name="vm" className="text-[#4ec9b0] text-[12px]" />;
      case 'build':
        return <Codicon name="package" className="text-[#cca700] text-[12px]" />;
      case 'fs':
        return <Codicon name="files" className="text-[#4ec9b0] text-[12px]" />;
      case 'system':
      default:
        return <Codicon name="terminal" className="text-[#9cdcfe] text-[12px]" />;
    }
  };

  const getLevelColor = (level: OutputLogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-[#f14c4c] font-medium';
      case 'warn':
        return 'text-[#cca700]';
      case 'success':
        return 'text-[#4ec9b0]';
      case 'info':
      default:
        return 'text-[#cccccc]';
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-[#1f1f1f] text-xs font-mono text-[#cccccc] select-none overflow-hidden"
      data-testid="output-panel"
      role="region"
      aria-label="Output Console"
    >
      {/* VS Code Output Toolbar Header */}
      <div className="flex h-[32px] shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3 gap-2">
        {/* VS Code Native Output Channel Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="output-channel-select" className="text-[11px] font-sans text-[#999999]">
            Channel:
          </label>
          <select
            id="output-channel-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="h-[22px] rounded-[2px] border border-[#2b2b2b] bg-[#252526] px-2 text-[11px] font-sans text-[#cccccc] outline-none cursor-pointer hover:border-[#0078d4] focus:border-[#0078d4]"
          >
            <option value="all">All Channels</option>
            <option value="server">Server (WebContainer Dev Server)</option>
            <option value="system">System (IDE & Tasks)</option>
            <option value="runtime">Runtime (Execution & Logs)</option>
            <option value="build">Build (Vite / Transpiler)</option>
            <option value="fs">File Sync (Virtual FS)</option>
          </select>
        </div>

        {/* Search, Lock, Copy & Clear Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search Filter Input */}
          <div className="relative flex items-center w-40">
            <Codicon name="filter" className="text-[#6e7681] text-[12px] absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter output..."
              aria-label="Filter output"
              className="h-[22px] w-full rounded-[2px] bg-[#1f1f1f] border border-[#2b2b2b] pl-6 pr-2 text-[11px] text-[#cccccc] placeholder-[#6e7681] focus:outline-none focus:border-[#0078d4]"
            />
          </div>

          {/* Auto-scroll Toggle */}
          <Tooltip label={autoScroll ? 'Turn off Auto-Scroll' : 'Turn on Auto-Scroll'} side="bottom">
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              aria-label="Toggle Auto-Scroll"
              className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                autoScroll ? 'text-[#0078d4] bg-white/5' : 'text-[#6e7681] hover:text-[#cccccc]'
              }`}
            >
              <Codicon name={autoScroll ? 'lock' : 'unlock'} className="text-[13px]" />
            </button>
          </Tooltip>

          {/* Copy All */}
          <Tooltip label="Copy All Logs" side="bottom">
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={logs.length === 0}
              aria-label="Copy All Logs"
              className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#cccccc] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Codicon name={copiedAll ? 'check' : 'copy'} className={`text-[13px] ${copiedAll ? 'text-[#4ec9b0]' : ''}`} />
            </button>
          </Tooltip>

          {/* Clear Output */}
          <Tooltip label="Clear Output" side="bottom">
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear Output"
              className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-[#f14c4c] hover:bg-white/10 transition-colors"
            >
              <Codicon name="clear-all" className="text-[13px]" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6e7681] font-sans text-xs">
            <Codicon name="output" className="text-[28px] text-[#6e7681] mb-2" />
            <p>No output messages in this channel</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 py-0.5 leading-relaxed hover:bg-white/[0.03] rounded px-1"
            >
              <span className="text-[#6e7681] text-[10px] select-none shrink-0 pt-0.5 font-mono">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-sans tracking-wide text-[#999999] shrink-0 select-none">
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
      <div className="shrink-0 px-3 py-1 bg-[#181818] border-t border-[#2b2b2b] text-[10px] text-[#6e7681] flex items-center justify-between font-sans">
        <span>Channel: {selectedCategory.toUpperCase()} | Bounded Buffer: Max 500 lines</span>
        <span>{filteredLogs.length} entries</span>
      </div>
    </div>
  );
};

export default OutputPanel;
