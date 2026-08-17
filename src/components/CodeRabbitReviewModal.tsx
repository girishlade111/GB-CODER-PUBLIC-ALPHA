import React, { useState, useEffect } from 'react';
import {
  X,
  Bug,
  ShieldAlert,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  FileCode,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import {
  codeRabbitService,
  CodeRabbitIssue,
  CodeRabbitScanResult,
  CodeFileInput,
} from '../services/codeRabbitService';

interface CodeRabbitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFileInput[];
  onApplyFixToFile?: (filename: string, newContent: string) => void;
}

export const CodeRabbitReviewModal: React.FC<CodeRabbitReviewModalProps> = ({
  isOpen,
  onClose,
  files,
  onApplyFixToFile,
}) => {
  const { isDark } = useTheme();
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [keySaved, setKeySaved] = useState<boolean>(false);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>('Ready');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanResult, setScanResult] = useState<CodeRabbitScanResult | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warning' | 'security' | 'performance'>('all');
  const [appliedIssues, setAppliedIssues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const storedKey = codeRabbitService.getApiKey();
      setApiKey(storedKey);
      if (storedKey && files.length > 0 && !scanResult) {
        handleRunScan();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    codeRabbitService.setApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleRunScan = async () => {
    if (files.length === 0) return;
    setIsScanning(true);
    setScanProgress(0);

    try {
      const result = await codeRabbitService.scanProjectFiles(files, (stage, percent) => {
        setScanStage(stage);
        setScanProgress(percent);
      });
      setScanResult(result);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyFix = (issue: CodeRabbitIssue) => {
    const targetFile = files.find((f) => f.filename === issue.file);
    if (!targetFile || !issue.suggestedFix) return;

    const newContent = codeRabbitService.applyFix(targetFile.content, issue);
    onApplyFixToFile?.(issue.file, newContent);

    setAppliedIssues((prev) => ({ ...prev, [issue.id]: true }));
  };

  const filteredIssues = scanResult?.issues.filter((issue) => {
    if (activeTab === 'critical') return issue.severity === 'critical';
    if (activeTab === 'warning') return issue.severity === 'warning';
    if (activeTab === 'security') return issue.category === 'security';
    if (activeTab === 'performance') return issue.category === 'performance';
    return true;
  }) || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-[#2a2a2a] bg-[#161616] text-[#e8e8e8] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center">
              <Bug className="w-4 h-4 text-[#e07856]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[#e8e8e8]">
                  CodeRabbit AI
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#1c1c1c] text-[#e07856] border border-[#2a2a2a]">
                  Bug &amp; Error Scanner
                </span>
              </div>
              <p className="text-[12.5px] text-[#8a8a8a]">
                AST bug detection, security checks &amp; one-click fixes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning || files.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-medium rounded-md bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] text-[#e8e8e8] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Rescan Code'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8a8a8a] hover:text-[#e8e8e8] hover:bg-[#1c1c1c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Banner */}
        <div className={`px-6 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-gray-950/60 border-gray-800' : 'bg-purple-50/80 border-purple-100'
        }`}>
          <div className="flex items-center gap-2 text-gray-400">
            <Key className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-gray-300">CodeRabbit / Gemini API Key:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your CodeRabbit API Key here..."
                className={`w-full px-3 py-1.5 pr-8 rounded-lg text-xs font-mono border focus:outline-none transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors text-xs shrink-0"
            >
              {keySaved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Scan Progress Bar */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                  {scanStage}
                </span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden">
                <div
                  className="h-full bg-[#e07856] transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {scanResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-[#2a2a2a] bg-[#161616] flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-[#8a8a8a] font-medium">Health Score</p>
                  <p className="text-[20px] font-semibold text-[#3ecf5e]">
                    {scanResult.stats.score}/100
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-[#3ecf5e]/70" />
              </div>

              <div className="p-3.5 rounded-lg border border-[#2a2a2a] bg-[#161616] flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-[#8a8a8a] font-medium">Critical Bugs</p>
                  <p className="text-[20px] font-semibold text-[#e5484d]">{scanResult.stats.critical}</p>
                </div>
                <ShieldAlert className="w-6 h-6 text-[#e5484d]/70" />
              </div>

              <div className="p-3.5 rounded-lg border border-[#2a2a2a] bg-[#161616] flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-[#8a8a8a] font-medium">Warnings</p>
                  <p className="text-[20px] font-semibold text-[#d97706]">{scanResult.stats.warning}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-[#d97706]/70" />
              </div>

              <div className="p-3.5 rounded-lg border border-[#2a2a2a] bg-[#161616] flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-[#8a8a8a] font-medium">Files Analyzed</p>
                  <p className="text-[20px] font-semibold text-[#e8e8e8]">{scanResult.stats.totalFilesScanned}</p>
                </div>
                <FileCode className="w-6 h-6 text-[#8a8a8a]" />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {scanResult && (
            <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-3 overflow-x-auto">
              {[
                { id: 'all', label: `All Issues (${scanResult.issues.length})` },
                { id: 'critical', label: `Critical (${scanResult.stats.critical})` },
                { id: 'warning', label: `Warnings (${scanResult.stats.warning})` },
                { id: 'security', label: 'Security Risks' },
                { id: 'performance', label: 'Performance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#242424] text-[#e8e8e8] border border-[#2a2a2a]'
                      : 'bg-[#1c1c1c] text-[#8a8a8a] hover:text-[#e8e8e8] border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Issues List */}
          {scanResult && filteredIssues.length > 0 ? (
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const isApplied = appliedIssues[issue.id];

                return (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg border border-[#2a2a2a] bg-[#161616] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-md border ${
                              issue.severity === 'critical'
                                ? 'bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/30'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-[#1c1c1c] text-[#8a8a8a] border-[#2a2a2a]'
                            }`}
                          >
                            {issue.severity}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#1c1c1c] text-[#8a8a8a] border border-[#2a2a2a]">
                            {issue.file}:{issue.line}
                          </span>

                          <span className="text-[11.5px] text-[#8a8a8a]">
                            Category: <span className="text-[#e8e8e8]">{issue.category}</span>
                          </span>
                        </div>

                        <h4 className="text-[13.5px] font-medium text-[#e8e8e8] pt-1">{issue.title}</h4>
                        <p className="text-[12.5px] text-[#8a8a8a] leading-relaxed">{issue.description}</p>
                      </div>

                      {issue.suggestedFix && (
                        <button
                          onClick={() => handleApplyFix(issue)}
                          disabled={isApplied}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium shrink-0 transition-colors ${
                            isApplied
                              ? 'bg-[#3ecf5e]/10 text-[#3ecf5e] border border-[#3ecf5e]/30'
                              : 'bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] text-[#e8e8e8]'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5 text-[#e07856]" />
                          {isApplied ? 'Applied' : 'Apply Fix'}
                        </button>
                      )}
                    </div>

                    {/* Code Snippet & Fix Diff Preview */}
                    {issue.codeSnippet && (
                      <div className="mt-3 p-3 rounded-md bg-[#0d0d0d] font-mono text-[11px] space-y-1.5 border border-[#2a2a2a]">
                        <div className="text-[#5c5c5c] text-[10px] uppercase tracking-wider font-medium">
                          Offending Code:
                        </div>
                        <div className="text-[#e5484d] bg-[#e5484d]/10 p-1.5 rounded border border-[#e5484d]/20 overflow-x-auto">
                          - {issue.codeSnippet}
                        </div>

                        {issue.suggestedFix && (
                          <>
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold pt-1">
                              CodeRabbit AI Recommendation:
                            </div>
                            <div className="text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/30 overflow-x-auto">
                              + {issue.suggestedFix}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : scanResult ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Bugs Found!</h3>
              <p className="text-xs text-gray-400">
                CodeRabbit AI scanned your project files and found no bugs matching the active filters.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <Bug className="w-12 h-12 text-orange-400/80 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-white">Ready to Scan for Bugs & Errors</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click "Rescan Code" above to initiate a deep CodeRabbit AI audit across your HTML, CSS, and JS/TS files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeRabbitReviewModal;
