import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { FormatResult } from '../types/formatting';
import { EditorLanguage } from '../types';

interface FormatDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    formatResult: FormatResult | null;
    onAccept: () => void;
    onReject: () => void;
    originalCode: string;
}

const FormatDiffModal: React.FC<FormatDiffModalProps> = ({
    isOpen,
    formatResult,
    onAccept,
    onReject,
    originalCode,
}) => {
    const [isDark] = useState(true); // Use dark theme by default

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                onAccept();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onReject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onAccept, onReject]);

    if (!isOpen || !formatResult) return null;

    const getLanguageLabel = (language: EditorLanguage): string => {
        switch (language) {
            case 'html':
                return 'HTML';
            case 'css':
                return 'CSS';
            case 'javascript':
                return 'JavaScript';
            default:
                // Type assertion needed because TypeScript correctly narrows to 'never'
                // after exhaustive checking, but we want a fallback just in case
                return (language as string).toUpperCase();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div
                className={`w-full max-w-6xl h-[90vh] flex flex-col rounded-lg shadow-2xl ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <h2 className="font-sans text-xl font-medium">
                            Format Preview - {getLanguageLabel(formatResult.language)}
                        </h2>
                        {formatResult.isUnsafe && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-yellow-300">Unsafe transformation - review carefully</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onReject}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Changelog */}
                {formatResult.changelog.length > 0 && (
                    <div className="px-6 py-3 bg-gray-900 bg-opacity-50 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Changes Applied:</h3>
                        <ul className="space-y-1">
                            {formatResult.changelog.map((change, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Error Message */}
                {formatResult.error && (
                    <div className="px-6 py-3 bg-red-900 bg-opacity-30 border-b border-red-700">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div>
                                <h3 className="text-sm font-medium text-red-300">Formatting Error</h3>
                                <p className="text-sm text-red-400">{formatResult.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diff Viewer */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-auto">
                        <ReactDiffViewer
                            oldValue={originalCode}
                            newValue={formatResult.formattedCode}
                            splitView={true}
                            useDarkTheme={isDark}
                            leftTitle="Original"
                            rightTitle="Formatted"
                            showDiffOnly={false}
                            styles={{
                                variables: {
                                    dark: {
                                        diffViewerBackground: '#1f2937',
                                        diffViewerColor: '#e5e7eb',
                                        addedBackground: '#064e3b',
                                        addedColor: '#d1fae5',
                                        removedBackground: '#7f1d1d',
                                        removedColor: '#fecaca',
                                        wordAddedBackground: '#065f46',
                                        wordRemovedBackground: '#991b1b',
                                        addedGutterBackground: '#065f46',
                                        removedGutterBackground: '#991b1b',
                                        gutterBackground: '#374151',
                                        gutterBackgroundDark: '#1f2937',
                                        highlightBackground: '#374151',
                                        highlightGutterBackground: '#4b5563',
                                    },
                                },
                                line: {
                                    padding: '4px 8px',
                                    fontSize: '13px',
                                    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-900 bg-opacity-50 border-t border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd> to accept •{' '}
                        <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd> to reject
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onReject}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
                        >
                            Reject
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Accept Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormatDiffModal;
