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
                className={`fixed z-50 bg-product border rounded-md p-1 flex items-center gap-1 transition-all ${
                    isLoading ? 'border-accent' : 'border-stroke-dark'
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
                                    ? 'opacity-40 cursor-not-allowed text-content-on-dark-soft'
                                    : isCurrentOp
                                    ? 'bg-product-elevated text-accent'
                                    : 'text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-elevated'
                            }`}
                            title={isLoading && isCurrentOp ? `${op.label}ing...` : op.tooltip}
                        >
                            {isLoading && isCurrentOp ? (
                                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                            ) : (
                                <Icon className="w-4 h-4" />
                            )}
                        </button>
                    );
                })}

                {/* Loading indicator text */}
                {isLoading && currentOp && (
                    <div className="ml-1.5 pr-2 flex items-center gap-2 text-[12px] text-content-on-dark-soft border-l border-stroke-dark pl-2.5">
                        <span className="whitespace-nowrap font-medium text-content-on-dark">
                            {currentOp.label}ing...
                        </span>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            {isLoading && currentOp && (
                <div className="fixed top-4 right-4 z-[100] bg-product border border-stroke-dark text-content-on-dark px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <div>
                        <p className="text-[13px] font-medium text-content-on-dark">{currentOp.label}ing Code</p>
                        <p className="text-[11.5px] text-content-on-dark-soft">Analyzing selection...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default SelectionToolbar;
