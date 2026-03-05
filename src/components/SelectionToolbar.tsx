import React from 'react';
import { Lightbulb, Bug, Zap, Palette, Loader2 } from 'lucide-react';
import { SelectionOperationType } from '../services/selectionOperationsService';
import { EditorLanguage } from '../types';

interface SelectionToolbarProps {
    position: { top: number; left: number };
    language: EditorLanguage;
    onOperation: (operation: SelectionOperationType) => void;
    isLoading: boolean;
    currentOperation?: SelectionOperationType;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    position,
    language,
    onOperation,
    isLoading,
    currentOperation,
}) => {
    const operations = [
        {
            type: 'explain' as SelectionOperationType,
            icon: Lightbulb,
            label: 'Explain',
            tooltip: 'Explain selected code',
            color: 'text-purple-400 hover:text-purple-300',
            bgColor: 'bg-purple-500',
            enabled: true,
        },
        {
            type: 'debug' as SelectionOperationType,
            icon: Bug,
            label: 'Debug',
            tooltip: 'Find and fix issues',
            color: 'text-red-400 hover:text-red-300',
            bgColor: 'bg-red-500',
            enabled: true,
        },
        {
            type: 'optimize' as SelectionOperationType,
            icon: Zap,
            label: 'Optimize',
            tooltip: 'Optimize performance',
            color: 'text-yellow-400 hover:text-yellow-300',
            bgColor: 'bg-yellow-500',
            enabled: true,
        },
        {
            type: 'improveUI' as SelectionOperationType,
            icon: Palette,
            label: 'Improve UI',
            tooltip: 'Enhance visual design',
            color: 'text-blue-400 hover:text-blue-300',
            bgColor: 'bg-blue-500',
            enabled: language === 'html' || language === 'css',
        },
    ];

    const currentOp = operations.find(op => op.type === currentOperation);

    return (
        <>
            {/* Main Toolbar */}
            <div
                className={`fixed z-50 bg-dark-gray border rounded-lg shadow-vscode-toolbar p-1 flex items-center gap-1.5 transition-all duration-300 ${isLoading ? 'border-purple-500 shadow-purple-500/20' : 'border-gray-600'
                    }`}
                style={{
                    top: `${position.top + 20}px`,
                    left: `${position.left}px`,
                }}
            >
                {/* Loading overlay effect */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg animate-pulse pointer-events-none" />
                )}

                {operations.map((op) => {
                    const Icon = op.icon;
                    const isCurrentOp = currentOperation === op.type;
                    const isDisabled = !op.enabled || (isLoading && !isCurrentOp);

                    return (
                        <button
                            key={op.type}
                            onClick={() => !isDisabled && onOperation(op.type)}
                            disabled={isDisabled}
                            className={`relative p-2 rounded-md transition-all duration-200 ${isDisabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : `${op.color} hover:bg-gray-700`
                                } ${isLoading && isCurrentOp ? 'bg-gray-700 ring-2 ring-purple-500' : ''}`}
                            title={isLoading && isCurrentOp ? `${op.label}ing...` : op.tooltip}
                        >
                            {isLoading && isCurrentOp ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Icon className="w-5 h-5" />
                            )}
                        </button>
                    );
                })}

                {/* Loading indicator text */}
                {isLoading && currentOp && (
                    <div className="ml-2 pr-2 flex items-center gap-2 text-sm text-gray-300 border-l border-gray-600 pl-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                        <span className="whitespace-nowrap font-medium">
                            {currentOp.label}ing...
                        </span>
                    </div>
                )}
            </div>

            {/* Full screen loading overlay toast */}
            {isLoading && currentOp && (
                <div className="fixed top-4 right-4 z-[100] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <div>
                        <p className="font-semibold">{currentOp.label}ing Code</p>
                        <p className="text-xs text-purple-200">AI is analyzing your selection...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default SelectionToolbar;
