import React from 'react';
import { X, Check, AlertCircle, Code2, ChevronDown, ChevronRight } from 'lucide-react';
import { SelectionOperationResult } from '../services/selectionOperationsService';
import { EditorLanguage } from '../types';

interface SelectionResultPanelProps {
    result: SelectionOperationResult;
    language: EditorLanguage;
    onClose: () => void;
    onApplyChanges?: (code: string) => void;
}

const SelectionResultPanel: React.FC<SelectionResultPanelProps> = ({
    result,
    language,
    onClose,
    onApplyChanges,
}) => {
    const [showDiff, setShowDiff] = React.useState(false);

    const getOperationTitle = () => {
        switch (result.operation) {
            case 'explain':
                return 'Code Explanation';
            case 'debug':
                return 'Debug Analysis';
            case 'optimize':
                return 'Code Optimization';
            case 'improveUI':
                return 'UI Improvement';
            default:
                return 'Result';
        }
    };

    const getOperationIcon = () => {
        switch (result.operation) {
            case 'explain':
                return '💡';
            case 'debug':
                return '🐛';
            case 'optimize':
                return '⚡';
            case 'improveUI':
                return '🎨';
            default:
                return '✨';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-400 bg-red-900/20 border-red-700';
            case 'medium':
                return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
            case 'low':
                return 'text-blue-400 bg-blue-900/20 border-blue-700';
            default:
                return 'text-content-on-dark-soft bg-product/20 border-stroke-dark';
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-dark-gray border-l border-stroke-dark shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="bg-product px-6 py-4 border-b border-stroke-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{getOperationIcon()}</span>
                    <div>
                        <h2 className="text-lg font-semibold text-bright-white">{getOperationTitle()}</h2>
                        <p className="text-xs text-content-on-dark-soft uppercase">{language}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-product-active rounded transition-colors text-content-on-dark-soft hover:text-bright-white"
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Explanation */}
                <div className="bg-product-soft border border-stroke-dark rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-bright-white mb-2 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Analysis
                    </h3>
                    <p className="text-sm text-content-on-dark whitespace-pre-wrap leading-relaxed">
                        {result.explanation}
                    </p>
                </div>

                {/* Confidence Score */}
                {result.confidence !== undefined && (
                    <div className="bg-product border border-stroke-dark rounded-lg p-4">
                        <h3 className="text-[13px] font-medium text-content-on-dark mb-2">Confidence</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-product-elevated border border-stroke-dark rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-500 rounded-full"
                                    style={{ width: `${result.confidence}%` }}
                                />
                            </div>
                            <span className="text-[12px] font-medium text-content-on-dark">{result.confidence}%</span>
                        </div>
                    </div>
                )}

                {/* Issues (Debug) */}
                {result.issues && result.issues.length > 0 && (
                    <div className="bg-product-soft border border-stroke-dark rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-bright-white mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Issues Found ({result.issues.length})
                        </h3>
                        <div className="space-y-2">
                            {result.issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded border ${getSeverityColor(issue.severity)}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold uppercase">{issue.type}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-black/30">
                                            {issue.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm">{issue.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Improvements (Optimize/ImproveUI) */}
                {result.improvements && result.improvements.length > 0 && (
                    <div className="bg-product-soft border border-stroke-dark rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-bright-white mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Improvements ({result.improvements.length})
                        </h3>
                        <ul className="space-y-2">
                            {result.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-content-on-dark">
                                    <span className="text-green-400 mt-0.5">✓</span>
                                    <span>{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Code Changes */}
                {result.hasCodeChanges && result.suggestedCode && (
                    <div className="bg-product-soft border border-stroke-dark rounded-lg overflow-hidden">
                        <button
                            onClick={() => setShowDiff(!showDiff)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-product-active transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-bright-white flex items-center gap-2">
                                <Code2 className="w-4 h-4" />
                                Suggested Code
                            </h3>
                            {showDiff ? (
                                <ChevronDown className="w-4 h-4 text-content-on-dark-soft" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-content-on-dark-soft" />
                            )}
                        </button>

                        {showDiff && (
                            <div className="border-t border-stroke-dark">
                                <div className="p-4 bg-product">
                                    <pre className="text-xs text-content-on-dark overflow-x-auto">
                                        <code>{result.suggestedCode}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Apply Changes Button */}
            {result.hasCodeChanges && result.suggestedCode && onApplyChanges && (
                <div className="bg-product px-6 py-4 border-t border-stroke-dark">
                    <button
                        onClick={() => onApplyChanges(result.suggestedCode!)}
                        className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-content-on-dark font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-[13px]"
                    >
                        <Check className="w-4 h-4" />
                        Apply Changes
                    </button>
                    <p className="text-[11.5px] text-content-on-dark-soft text-center mt-2">
                        This will replace the selected code in your editor
                    </p>
                </div>
            )}
        </div>
    );
};

export default SelectionResultPanel;
