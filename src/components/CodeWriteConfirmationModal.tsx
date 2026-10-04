import React, { useState } from 'react';
import { AlertTriangle, Code, X, CheckCircle2 } from 'lucide-react';

interface CodeWriteConfirmationModalProps {
    isOpen: boolean;
    onAgree: () => void;
    onDecline: () => void;
    onClose: () => void;
}

export const CodeWriteConfirmationModal: React.FC<CodeWriteConfirmationModalProps> = ({
    isOpen,
    onAgree,
    onDecline,
    onClose
}) => {
    const [showWarning, setShowWarning] = useState(false);

    if (!isOpen) return null;

    const handleAgree = () => {
        setShowWarning(true);
    };

    const handleConfirm = () => {
        setShowWarning(false);
        onAgree();
        onClose();
    };

    const handleDecline = () => {
        setShowWarning(false);
        onDecline();
        onClose();
    };

    const handleCancel = () => {
        setShowWarning(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-product-soft border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                {!showWarning ? (
                    /* Initial Confirmation */
                    <>
                        {/* Header */}
                        <div className="bg-product-soft border-b border-white/10 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white tracking-tight">Code Writing Mode</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 group"
                            >
                                <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-8">
                            <p className="text-white/80 text-base mb-8 leading-relaxed">
                                Do you want me to write code directly into your HTML, CSS, and JavaScript sections?
                            </p>

                            <div className="space-y-4 mb-8">
                                {/* Section Mode Option */}
                                <div className="group relative p-5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5">
                                            <div className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                                                <CheckCircle2 className="w-3 h-3 text-white/60" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-medium text-white mb-1.5">Section Mode</p>
                                            <p className="text-sm text-white/50 leading-relaxed">
                                                Code will be written directly into your editor with live animation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chatbot Mode Option */}
                                <div className="group relative p-5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5">
                                            <div className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                                                <CheckCircle2 className="w-3 h-3 text-white/60" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-medium text-white mb-1.5">Chatbot Mode</p>
                                            <p className="text-sm text-white/50 leading-relaxed">
                                                Code will be displayed in the chatbot with copy buttons
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAgree}
                                    className="flex-1 px-6 py-3.5 bg-white hover:bg-white/90 text-black font-medium rounded-xl transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Write to Sections
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
                                >
                                    Chatbot Only
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Warning Step */
                    <>
                        {/* Header */}
                        <div className="bg-product-soft border-b border-white/10 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white tracking-tight">Confirm Action</h3>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 group"
                            >
                                <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-8">
                            <div className="mb-8">
                                <p className="text-white text-lg font-semibold mb-6">
                                    All existing code will be permanently deleted!
                                </p>
                                <p className="text-white/70 text-sm mb-5">
                                    This action will:
                                </p>
                                <ul className="space-y-3 text-sm text-white/60">
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-400 mt-0.5 font-bold">×</span>
                                        <span>Clear ALL code in HTML, CSS, and JavaScript sections</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-400 mt-0.5 font-bold">×</span>
                                        <span>Replace it with the new code from the AI</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-400 mt-0.5 font-bold">×</span>
                                        <span>This cannot be undone (unless you have history saved)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-6 py-3.5 bg-red-500/90 hover:bg-red-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Continue Anyway
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
