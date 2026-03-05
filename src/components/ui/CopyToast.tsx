import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface CopyToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

const CopyToast: React.FC<CopyToastProps> = ({
    message,
    type = 'success',
    onClose,
}) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const Icon = type === 'success' ? Check : AlertCircle;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div
                className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-vscode-widget flex items-center gap-3 min-w-[250px]`}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium text-sm">{message}</span>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CopyToast;
