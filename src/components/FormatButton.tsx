import React from 'react';
import { Wand2 } from 'lucide-react';
import { EditorLanguage } from '../types';

interface FormatButtonProps {
    language: EditorLanguage;
    onFormat: () => void;
    isLoading?: boolean;
    hasContent: boolean;
}

const FormatButton: React.FC<FormatButtonProps> = ({
    language,
    onFormat,
    isLoading = false,
    hasContent,
}) => {
    if (!hasContent) return null;

    return (
        <button
            onClick={onFormat}
            disabled={isLoading}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-product-elevated hover:bg-product-active border border-stroke-dark disabled:opacity-40 disabled:cursor-not-allowed text-content-on-dark rounded-md transition-colors text-[12.5px] font-medium z-10"
            title={`Auto-format ${language.toUpperCase()} (Ctrl+Shift+F)`}
        >
            <Wand2 className={`w-3.5 h-3.5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Formatting...' : 'Auto-format'}</span>
        </button>
    );
};

export default FormatButton;
