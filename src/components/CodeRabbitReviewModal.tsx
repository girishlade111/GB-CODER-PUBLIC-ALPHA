import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bug,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  FileCode,
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

  const handleRunScan = useCallback(async () => {
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
  }, [files]);

  useEffect(() => {
    if (isOpen) {
      const storedKey = codeRabbitService.getApiKey();
      setApiKey(storedKey);
      if (storedKey && files.length > 0 && !scanResult) {
        handleRunScan();
      }
    }
  }, [isOpen, files.length, handleRunScan, scanResult]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    codeRabbitService.setApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
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
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-stroke-dark bg-product text-content-on-dark overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-dark bg-product">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-product-elevated border border-stroke-dark flex items-center justify-center">
              <Bug className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-[16px] font-medium text-content-on-dark">
                  CodeRabbit AI
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-product-elevated text-accent border border-stroke-dark">
                  Bug &amp; Error Scanner
                </span>
              </div>
              <p className="text-[12.5px] text-content-on-dark-soft">
                AST bug detection, security checks &amp; one-click fixes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning || files.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-medium rounded-md bg-product-elevated hover:bg-product-active border border-stroke-dark text-content-on-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Rescan Code'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-elevated transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Banner */}
        <div className={`px-6 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-product-soft/60 border-stroke-dark' : 'bg-purple-50/80 border-purple-100'
        }`}>
          <div className="flex items-center gap-2 text-content-on-dark-soft">
            <Key className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium text-content-on-dark">CodeRabbit / Gemini API Key:</span>
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
                    ? 'bg-product-elevated border-stroke-dark text-content-on-dark focus:border-accent'
                    : 'bg-product-elevated border-stroke-dark text-content-on-dark focus:border-accent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-content-on-dark-soft hover:text-content-on-dark"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 rounded-lg font-semibold bg-accent hover:bg-accent-hover text-content-on-dark transition-colors text-xs shrink-0"
            >
              {keySaved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Scan Progress Bar */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-accent-subtle border border-accent/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-accent font-semibold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                  {scanStage}
                </span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-product-elevated border border-stroke-dark overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {scanResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-stroke-dark bg-product flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-content-on-dark-soft font-medium">Health Score</p>
                  <p className="text-[20px] font-semibold text-teal">
                    {scanResult.stats.score}/100
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-teal" />
              </div>

              <div className="p-3.5 rounded-lg border border-stroke-dark bg-product flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-content-on-dark-soft font-medium">Critical Bugs</p>
                  <p className="text-[20px] font-semibold text-danger">{scanResult.stats.critical}</p>
                </div>
                <ShieldAlert className="w-6 h-6 text-danger" />
              </div>

              <div className="p-3.5 rounded-lg border border-stroke-dark bg-product flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-content-on-dark-soft font-medium">Warnings</p>
                  <p className="text-[20px] font-semibold text-[#d97706]">{scanResult.stats.warning}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-[#d97706]/70" />
              </div>

              <div className="p-3.5 rounded-lg border border-stroke-dark bg-product flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] text-content-on-dark-soft font-medium">Files Analyzed</p>
                  <p className="text-[20px] font-semibold text-content-on-dark">{scanResult.stats.totalFilesScanned}</p>
                </div>
                <FileCode className="w-6 h-6 text-content-on-dark-soft" />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {scanResult && (
            <div className="flex items-center gap-2 border-b border-stroke-dark pb-3 overflow-x-auto">
              {[
                { id: 'all', label: `All Issues (${scanResult.issues.length})` },
                { id: 'critical', label: `Critical (${scanResult.stats.critical})` },
                { id: 'warning', label: `Warnings (${scanResult.stats.warning})` },
                { id: 'security', label: 'Security Risks' },
                { id: 'performance', label: 'Performance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-product-active text-content-on-dark border border-stroke-dark'
                      : 'bg-product-elevated text-content-on-dark-soft hover:text-content-on-dark border border-transparent'
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
                    className="p-4 rounded-lg border border-stroke-dark bg-product transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-md border ${
                              issue.severity === 'critical'
                                ? 'bg-danger/15 text-red-300 border-danger/40'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-product-elevated text-content-on-dark-soft border-stroke-dark'
                            }`}
                          >
                            {issue.severity}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-product-elevated text-content-on-dark-soft border border-stroke-dark">
                            {issue.file}:{issue.line}
                          </span>

                          <span className="text-[11.5px] text-content-on-dark-soft">
                            Category: <span className="text-content-on-dark">{issue.category}</span>
                          </span>
                        </div>

                        <h4 className="text-[13.5px] font-medium text-content-on-dark pt-1">{issue.title}</h4>
                        <p className="text-[12.5px] text-content-on-dark-soft leading-relaxed">{issue.description}</p>
                      </div>

                      {issue.suggestedFix && (
                        <button
                          onClick={() => handleApplyFix(issue)}
                          disabled={isApplied}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium shrink-0 transition-colors ${
                            isApplied
                              ? 'bg-teal/10 text-teal border border-teal'
                              : 'bg-product-elevated hover:bg-product-active border border-stroke-dark text-content-on-dark'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5 text-accent" />
                          {isApplied ? 'Applied' : 'Apply Fix'}
                        </button>
                      )}
                    </div>

                    {/* Code Snippet & Fix Diff Preview */}
                    {issue.codeSnippet && (
                      <div className="mt-3 p-3 rounded-md bg-product-soft font-mono text-[11px] space-y-1.5 border border-stroke-dark">
                        <div className="text-content-on-dark-soft text-[10px] uppercase tracking-wider font-medium">
                          Offending Code:
                        </div>
                        <div className="text-red-300 bg-danger/15 p-1.5 rounded border border-danger/40 overflow-x-auto">
                          - {issue.codeSnippet}
                        </div>

                        {issue.suggestedFix && (
                          <>
                            <div className="text-content-on-dark-soft text-[10px] uppercase tracking-wider font-semibold pt-1">
                              CodeRabbit AI Recommendation:
                            </div>
                            <div className="text-success bg-success-subtle p-1.5 rounded border border-success/30 overflow-x-auto">
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
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-base font-bold text-content-on-dark">No Bugs Found!</h3>
              <p className="text-xs text-content-on-dark-soft">
                CodeRabbit AI scanned your project files and found no bugs matching the active filters.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <Bug className="w-12 h-12 text-orange-400/80 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-content-on-dark">Ready to Scan for Bugs & Errors</h3>
              <p className="text-xs text-content-on-dark-soft max-w-md mx-auto">
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
