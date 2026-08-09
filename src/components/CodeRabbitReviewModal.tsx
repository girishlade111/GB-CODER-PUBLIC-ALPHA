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
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all ${
          isDark ? 'bg-gray-900/95 border-purple-500/30 text-white' : 'bg-white border-purple-200 text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-orange-900/20 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bug className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  CodeRabbit AI
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Bug & Error Scanner
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Automated AI code review, AST bug detection, security checks & one-click fixes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning || files.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Rescan Code'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
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
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {scanResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Health Score</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    {scanResult.stats.score}/100
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400/50" />
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Critical Bugs</p>
                  <p className="text-2xl font-black text-red-400">{scanResult.stats.critical}</p>
                </div>
                <ShieldAlert className="w-8 h-8 text-red-400/50" />
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Warnings</p>
                  <p className="text-2xl font-black text-amber-400">{scanResult.stats.warning}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-400/50" />
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Files Analyzed</p>
                  <p className="text-2xl font-black text-purple-400">{scanResult.stats.totalFilesScanned}</p>
                </div>
                <FileCode className="w-8 h-8 text-purple-400/50" />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {scanResult && (
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Issues List */}
          {scanResult && filteredIssues.length > 0 ? (
            <div className="space-y-4">
              {filteredIssues.map((issue) => {
                const isApplied = appliedIssues[issue.id];

                return (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-gray-850/60 border-gray-800 hover:border-purple-500/40'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-md ${
                              issue.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {issue.severity}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-gray-800 text-gray-300">
                            {issue.file}:{issue.line}
                          </span>

                          <span className="text-xs font-semibold text-gray-400">
                            Category: <span className="text-purple-400">{issue.category}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white pt-1">{issue.title}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">{issue.description}</p>
                      </div>

                      {issue.suggestedFix && (
                        <button
                          onClick={() => handleApplyFix(issue)}
                          disabled={isApplied}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                            isApplied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 shadow'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          {isApplied ? 'Applied' : 'Apply Fix'}
                        </button>
                      )}
                    </div>

                    {/* Code Snippet & Fix Diff Preview */}
                    {issue.codeSnippet && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-950 font-mono text-[11px] space-y-1.5 border border-gray-800">
                        <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                          Offending Code:
                        </div>
                        <div className="text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/30 overflow-x-auto">
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
