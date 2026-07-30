import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface KeyboardShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Shortcut {
    category: string;
    shortcuts: {
        keys: string;
        description: string;
    }[];
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const { isDark } = useTheme();

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const shortcuts: Shortcut[] = [
        {
            category: 'Editor',
            shortcuts: [
                { keys: 'Ctrl+S', description: 'Save project' },
                { keys: 'Shift+Alt+F', description: 'Format code (HTML/CSS/JS)' },
                { keys: 'Ctrl+/', description: 'Toggle line comment' },
                { keys: 'Ctrl+Z', description: 'Undo' },
                { keys: 'Ctrl+Y', description: 'Redo' },
            ],
        },
        {
            category: 'Multi-Cursor',
            shortcuts: [
                { keys: 'Alt+Click', description: 'Add cursor at position' },
                { keys: 'Ctrl+Alt+Down', description: 'Add cursor below' },
                { keys: 'Ctrl+Alt+Up', description: 'Add cursor above' },
                { keys: 'Ctrl+D', description: 'Select next occurrence' },
            ],
        },
        {
            category: 'Export & Import',
            shortcuts: [
                { keys: 'Ctrl/Cmd+Shift+E', description: 'Open Export & Share' },
                { keys: 'Ctrl/Cmd+Shift+I', description: 'Open Import dialog' },
                { keys: 'Ctrl/Cmd+Shift+S', description: 'Save screenshot as PNG' },
            ]
        },
        {
            category: 'Preview',
            shortcuts: [
                { keys: 'Ctrl+Enter', description: 'Run preview' },
                { keys: 'Ctrl+Shift+P', description: 'Command palette' },
            ],
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className={`w-full max-w-2xl mx-4 rounded-xl shadow-2xl border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <Keyboard className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Keyboard Shortcuts
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-6">
                        {shortcuts.map((section, index) => (
                            <div key={index}>
                                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {section.category}
                                </h3>
                                <div className="space-y-2">
                                    {section.shortcuts.map((shortcut, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {shortcut.description}
                                            </span>
                                            <kbd
                                                className={`px-3 py-1.5 rounded-md font-mono text-sm border ${isDark
                                                    ? 'bg-gray-800 border-gray-600 text-blue-400'
                                                    : 'bg-gray-100 border-gray-300 text-blue-600'
                                                    }`}
                                            >
                                                {shortcut.keys}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Press <kbd className={`px-2 py-0.5 rounded font-mono text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;
