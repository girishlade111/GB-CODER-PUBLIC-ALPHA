import React, { useState } from 'react';
import { X, Minus, Plus, History, Trash2, ChevronRight, Check, Code2, AlertCircle, Menu } from 'lucide-react';
import { SelectionOperationResult } from '../services/selectionOperationsService';
import { EditorLanguage, HistoryItem } from '../types';

interface SelectionSidebarProps {
    isOpen: boolean;
    isLoading: boolean;
    result: SelectionOperationResult | null;
    language: EditorLanguage | null;
    error: string | null;
    onClose: () => void;
    onApplyChanges?: (code: string) => void;
    history: HistoryItem[];
    onClearHistory: () => void;
    onSelectHistory: (item: HistoryItem) => void;
    isHistoryOpen: boolean;
    onHistoryToggle: (isOpen: boolean) => void;
}

// Custom Lade Stack Loader Component
const LadeStackLoader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            {/* Animated Lade Stack Logo/Loader */}
            <div className="relative w-20 h-20 mb-6">
                {/* Stacked layers animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="w-12 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-10 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                    <div className="w-6 h-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded animate-bounce" style={{ animationDelay: '450ms' }} />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            {/* Lade Stack Text with animated dots */}
            <div className="text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Lade Stack
                </h3>
                <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
                    Analyzing code
                    <span className="inline-flex">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </span>
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-700 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full animate-progress" />
            </div>
        </div>
    );
};

const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
    isOpen,
    isLoading,
    result,
    error,
    onClose,
    onApplyChanges,
    history,
    onClearHistory,
    onSelectHistory,
    isHistoryOpen,
    onHistoryToggle,
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [showDiff, setShowDiff] = useState(false);

    if (!isOpen) return null;

    const getOperationIcon = () => {
        switch (result?.operation) {
            case 'explain': return '💡';
            case 'debug': return '🐛';
            case 'optimize': return '⚡';
            case 'improveUI': return '🎨';
            default: return '✨';
        }
    };

    const getOperationTitle = () => {
        switch (result?.operation) {
            case 'explain': return 'Code Explanation';
            case 'debug': return 'Debug Analysis';
            case 'optimize': return 'Code Optimization';
            case 'improveUI': return 'UI Improvement';
            default: return 'AI Analysis';
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {/* Minimized state - floating pill */}
            {isMinimized && (
                <div
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
                    onClick={() => setIsMinimized(false)}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <span>{getOperationIcon()}</span>
                            <span className="text-sm font-medium">View Result</span>
                        </>
                    )}
                    <Plus className="w-4 h-4 ml-1" />
                </div>
            )}

            {/* Full sidebar */}
            {!isMinimized && (
                <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-matte-black border-l border-gray-700 shadow-2xl z-50 flex flex-col animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onHistoryToggle(!isHistoryOpen)}
                                className={`p-2 rounded-lg transition-colors ${isHistoryOpen ? 'bg-purple-600 text-white' : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'}`}
                                title="View History"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium text-purple-300">Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{getOperationIcon()}</span>
                                    <span className="text-sm font-semibold text-white">{getOperationTitle()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Minimize"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* History Panel (slides in from left) */}
                    {isHistoryOpen && (
                        <div className="absolute left-0 top-0 h-full w-64 bg-dark-gray border-r border-gray-700 z-10 shadow-2xl animate-slideIn">
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Recent History
                                </h3>
                                <div className="flex items-center gap-1">
                                    {history.length > 0 && (
                                        <button
                                            onClick={onClearHistory}
                                            className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                                            title="Clear History"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onHistoryToggle(false)}
                                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto h-[calc(100%-60px)]">
                                {history.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 text-sm">No history yet</p>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {history.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onSelectHistory(item);
                                                    onHistoryToggle(false);
                                                }}
                                                className="w-full p-3 text-left hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-purple-400 uppercase">
                                                        {item.operation}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(item.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 truncate">{item.codePreview}</p>
                                                <span className="text-xs text-gray-500 uppercase">{item.language}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Loading State */}
                        {isLoading && <LadeStackLoader />}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="p-6">
                                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-400">Operation Failed</h4>
                                        <p className="text-sm text-red-300 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Result State */}
                        {result && !isLoading && (
                            <div className="p-4 space-y-4">
                                {/* Explanation */}
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-purple-400" />
                                        Analysis
                                    </h3>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {result.explanation}
                                    </p>
                                </div>

                                {/* Confidence */}
                                {result.confidence !== undefined && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-white mb-2">Confidence</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                                    style={{ width: `${result.confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-white">{result.confidence}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Issues */}
                                {result.issues && result.issues.length > 0 && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                            Issues ({result.issues.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {result.issues.map((issue, i) => (
                                                <div key={i} className={`p-3 rounded border ${issue.severity === 'high' ? 'border-red-700 bg-red-900/20' :
                                                    issue.severity === 'medium' ? 'border-yellow-700 bg-yellow-900/20' :
                                                        'border-blue-700 bg-blue-900/20'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold uppercase">{issue.type}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'high' ? 'bg-red-800 text-red-200' :
                                                            issue.severity === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                                                                'bg-blue-800 text-blue-200'
                                                            }`}>{issue.severity}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300">{issue.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Improvements */}
                                {result.improvements && result.improvements.length > 0 && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-400" />
                                            Improvements
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.improvements.map((imp, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <span className="text-green-400 mt-0.5">✓</span>
                                                    <span>{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Suggested Code */}
                                {result.hasCodeChanges && result.suggestedCode && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setShowDiff(!showDiff)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                                        >
                                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                <Code2 className="w-4 h-4" />
                                                Suggested Code
                                            </h3>
                                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showDiff ? 'rotate-90' : ''}`} />
                                        </button>
                                        {showDiff && (
                                            <div className="border-t border-gray-700 p-3 bg-gray-900/50">
                                                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                                    <code>{result.suggestedCode}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer - Apply Button */}
                    {result?.hasCodeChanges && result.suggestedCode && onApplyChanges && !isLoading && (
                        <div className="p-4 border-t border-gray-700 bg-dark-gray">
                            <button
                                onClick={() => onApplyChanges(result.suggestedCode!)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Check className="w-5 h-5" />
                                Apply Changes
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Styles for animations */}
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
        </>
    );
};

export default SelectionSidebar;
