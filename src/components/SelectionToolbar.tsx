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
            enabled: true,
        },
        {
            type: 'debug' as SelectionOperationType,
            icon: Bug,
            label: 'Debug',
            tooltip: 'Find and fix issues',
            enabled: true,
        },
        {
            type: 'optimize' as SelectionOperationType,
            icon: Zap,
            label: 'Optimize',
            tooltip: 'Optimize performance',
            enabled: true,
        },
        {
            type: 'improveUI' as SelectionOperationType,
            icon: Palette,
            label: 'Improve UI',
            tooltip: 'Enhance visual design',
            enabled: language === 'html' || language === 'css',
        },
    ];

    const currentOp = operations.find(op => op.type === currentOperation);

    return (
        <>
            {/* Main Toolbar */}
            <div
                className={`fixed z-50 bg-[#161616] border rounded-md p-1 flex items-center gap-1 transition-all ${
                    isLoading ? 'border-[#e07856]' : 'border-[#2a2a2a]'
                }`}
                style={{
                    top: `${position.top + 20}px`,
                    left: `${position.left}px`,
                }}
            >
                {operations.map((op) => {
                    const Icon = op.icon;
                    const isCurrentOp = currentOperation === op.type;
                    const isDisabled = !op.enabled || (isLoading && !isCurrentOp);

                    return (
                        <button
                            key={op.type}
                            onClick={() => !isDisabled && onOperation(op.type)}
                            disabled={isDisabled}
                            aria-label={isLoading && isCurrentOp ? `${op.label}ing…` : op.tooltip}
                            aria-busy={isLoading && isCurrentOp}
                            className={`p-1.5 rounded-md transition-colors ${
                                isDisabled
                                    ? 'opacity-40 cursor-not-allowed text-[#5c5c5c]'
                                    : isCurrentOp
                                    ? 'bg-[#1c1c1c] text-[#e07856]'
                                    : 'text-[#8a8a8a] hover:text-[#e8e8e8] hover:bg-[#1c1c1c]'
                            }`}
                            title={isLoading && isCurrentOp ? `${op.label}ing...` : op.tooltip}
                        >
                            {isLoading && isCurrentOp ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#e07856]" />
                            ) : (
                                <Icon className="w-4 h-4" />
                            )}
                        </button>
                    );
                })}

                {/* Loading indicator text */}
                {isLoading && currentOp && (
                    <div className="ml-1.5 pr-2 flex items-center gap-2 text-[12px] text-[#8a8a8a] border-l border-[#2a2a2a] pl-2.5">
                        <span className="whitespace-nowrap font-medium text-[#e8e8e8]">
                            {currentOp.label}ing...
                        </span>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            {isLoading && currentOp && (
                <div className="fixed top-4 right-4 z-[100] bg-[#161616] border border-[#2a2a2a] text-[#e8e8e8] px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                    <Loader2 className="w-4 h-4 animate-spin text-[#e07856]" />
                    <div>
                        <p className="text-[13px] font-medium text-[#e8e8e8]">{currentOp.label}ing Code</p>
                        <p className="text-[11.5px] text-[#8a8a8a]">Analyzing selection...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default SelectionToolbar;
