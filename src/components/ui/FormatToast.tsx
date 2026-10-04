import React, { useEffect, useState } from 'react';
import { Check, X, Undo } from 'lucide-react';

interface FormatToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onUndo?: () => void;
    duration?: number;
    onClose: () => void;
}

const FormatToast: React.FC<FormatToastProps> = ({
    message,
    type = 'success',
    onUndo,
    duration = 3000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 300); // Match animation duration
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const handleUndo = () => {
        if (onUndo) {
            onUndo();
            handleClose();
        }
    };

    if (!isVisible) return null;

    const bgColor = {
        success: 'bg-product-elevated border border-teal',
        error: 'bg-product-elevated border border-danger',
        info: 'bg-product-elevated border border-stroke-dark',
    }[type];

    const iconColor = {
        success: 'text-teal',
        error: 'text-danger',
        info: 'text-content-on-dark-soft',
    }[type];

    const Icon = {
        success: Check,
        error: X,
        info: Check,
    }[type];

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
        >
        <div className={`${bgColor} px-4 py-3 rounded-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <span className="flex-1 text-content-on-dark font-medium">{message}</span>

                {onUndo && (
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-1 px-2 py-1 bg-product-active hover:bg-product-active rounded-md transition-colors text-sm text-content-on-dark-soft hover:text-content-on-dark"
                        title="Undo format"
                    >
                        <Undo className="w-3 h-3" />
                        <span>Undo</span>
                    </button>
                )}

                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-product-active rounded transition-colors text-content-on-dark-soft hover:text-content-on-dark"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FormatToast;
