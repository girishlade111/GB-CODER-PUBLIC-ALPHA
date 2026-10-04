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
    const borderColor = type === 'success' ? 'border-teal' : 'border-danger';
    const iconColor = type === 'success' ? 'text-teal' : 'text-danger';
    const Icon = type === 'success' ? Check : AlertCircle;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div
                className={`bg-product-elevated border ${borderColor} px-4 py-3 rounded-lg flex items-center gap-3 min-w-[250px]`}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <span className="flex-1 font-medium text-sm text-content-on-dark">{message}</span>

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-product-active rounded transition-colors text-content-on-dark-soft hover:text-content-on-dark"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CopyToast;
