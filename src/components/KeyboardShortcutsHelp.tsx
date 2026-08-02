import React, { useEffect, useState, useMemo } from 'react';
import { X, Keyboard, Search, Settings } from 'lucide-react';
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
        customizable?: boolean;
    }[];
}

const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');

const formatKeys = (keys: string) => {
    if (!isMac) return keys.replace(/Cmd\//g, '').replace(/\/Cmd/g, '');
    return keys
        .replace(/Ctrl\/Cmd\+/g, '⌘')
        .replace(/Cmd\/Ctrl\+/g, '⌘')
        .replace(/Ctrl\+/g, '⌃')
        .replace(/Alt\+/g, '⌥')
        .replace(/Shift\+/g, '⇧');
};

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Reset search when opened
    useEffect(() => {
        if (isOpen) setSearchQuery('');
    }, [isOpen]);

    if (!isOpen) return null;

    const allShortcuts: Shortcut[] = [
        {
            category: 'General',
            shortcuts: [
                { keys: 'Ctrl/Cmd+K', description: 'Command Palette', customizable: true },
                { keys: 'Ctrl/Cmd+S', description: 'Format & Save', customizable: true },
                { keys: 'Ctrl/Cmd+Shift+E', description: 'Open Export & Share' },
                { keys: 'Ctrl/Cmd+Shift+I', description: 'Open Import dialog' },
                { keys: '?', description: 'Show Keyboard Shortcuts' },
            ],
        },
        {
            category: 'Editor',
            shortcuts: [
                { keys: 'Ctrl/Cmd+/', description: 'Toggle line comment' },
                { keys: 'Shift+Alt+F', description: 'Format Document' },
                { keys: 'Ctrl/Cmd+D', description: 'Select next occurrence' },
                { keys: 'Alt+Click', description: 'Add cursor at position' },
                { keys: 'Ctrl/Cmd+Alt+Down', description: 'Add cursor below' },
                { keys: 'Ctrl/Cmd+Alt+Up', description: 'Add cursor above' },
                { keys: 'Ctrl/Cmd+Z', description: 'Undo' },
                { keys: 'Ctrl/Cmd+Y', description: 'Redo' },
            ],
        },
        {
            category: 'AI Tools',
            shortcuts: [
                { keys: 'Ctrl/Cmd+Shift+A', description: 'Build with AI', customizable: true },
                { keys: 'Ctrl/Cmd+Shift+X', description: 'Explain selected code', customizable: true },
                { keys: 'Ctrl/Cmd+Shift+F', description: 'Find and Fix', customizable: true },
            ],
        },
        {
            category: 'Preview & Run',
            shortcuts: [
                { keys: 'Ctrl/Cmd+Enter', description: 'Run preview' },
                { keys: 'Ctrl/Cmd+Shift+R', description: 'Run in Sandbox' },
                { keys: 'Ctrl/Cmd+Shift+S', description: 'Save screenshot' },
            ],
        },
        {
            category: 'Navigation',
            shortcuts: [
                { keys: 'Ctrl/Cmd+B', description: 'Toggle Sidebar', customizable: true },
                { keys: 'Ctrl/Cmd+J', description: 'Toggle Console/Panel', customizable: true },
                { keys: 'Ctrl/Cmd+Shift+M', description: 'Toggle Validator', customizable: true },
            ],
        },
    ];

    const filteredShortcuts = allShortcuts.map(section => ({
        ...section,
        shortcuts: section.shortcuts.filter(s => 
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.keys.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.shortcuts.length > 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <Keyboard className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Keyboard Shortcuts
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className={`px-6 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 focus-within:border-gray-600' : 'bg-gray-50 border-gray-200 focus-within:border-gray-300'}`}>
                        <Search className={`w-4 h-4 mr-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Search shortcuts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-transparent border-none outline-none text-sm ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-8">
                        {filteredShortcuts.map((section, index) => (
                            <div key={index}>
                                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {section.category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                    {section.shortcuts.map((shortcut, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between py-2 px-3 rounded-lg border ${isDark ? 'border-transparent hover:border-gray-700 hover:bg-gray-800/50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {shortcut.description}
                                                </span>
                                                {shortcut.customizable && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'}`} title="Customizable (Coming Soon)">
                                                        <Settings className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </div>
                                            <kbd
                                                className={`px-2 py-1 rounded-md font-mono text-xs border ${isDark
                                                    ? 'bg-gray-800 border-gray-700 text-gray-300 shadow-sm shadow-black/50'
                                                    : 'bg-white border-gray-200 text-gray-600 shadow-sm'
                                                }`}
                                            >
                                                {formatKeys(shortcut.keys)}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredShortcuts.length === 0 && (
                            <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                No shortcuts found for "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsHelp;
