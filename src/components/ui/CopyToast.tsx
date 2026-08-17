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
    const borderColor = type === 'success' ? 'border-[#3ecf5e]/30' : 'border-[#e5484d]/30';
    const iconColor = type === 'success' ? 'text-[#3ecf5e]' : 'text-[#e5484d]';
    const Icon = type === 'success' ? Check : AlertCircle;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div
                className={`bg-[#1c1c1c] border ${borderColor} px-4 py-3 rounded-lg flex items-center gap-3 min-w-[250px]`}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <span className="flex-1 font-medium text-sm text-[#e8e8e8]">{message}</span>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#5c5c5c] hover:text-[#e8e8e8]"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CopyToast;
