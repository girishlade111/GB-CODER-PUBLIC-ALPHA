import React, { useEffect } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useSettings, EditorFontFamily, ThemeVariant } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useFocusMode } from '../hooks/useFocusMode';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings, resetSettings, getFontFamilyCSS } = useSettings();
    const { isDark } = useTheme();
    const { focusMode, toggleFocusMode } = useFocusMode();

    // Close on Escape key
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

    const fontFamilyOptions: EditorFontFamily[] = [
        'JetBrains Mono',
        'Fira Code',
        'Monaco',
        'Consolas',
        'Default',
    ];

    const themeOptions: { value: ThemeVariant; label: string; color: string }[] = [
        { value: 'dark', label: 'Dark', color: 'bg-gray-900' },
        { value: 'dark-blue', label: 'Dark Blue', color: 'bg-blue-900' },
        { value: 'dark-purple', label: 'Dark Purple', color: 'bg-purple-900' },
        { value: 'light', label: 'Light', color: 'bg-gray-100' },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-2xl mx-4 rounded-xl shadow-vscode-modal animate-scale-in border ${isDark ? 'bg-dark-gray border-gray-700' : 'bg-white border-gray-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <SettingsIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h2 className={`text-xl font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                            Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6">
                    {/* Editor Settings Section */}
                    <div>
                        <h3
                            className={`text-xs tracking-wider font-semibold uppercase mb-4 border-l-2 border-vscode-statusbar pl-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                        >
                            Editor Settings
                        </h3>

                        {/* Font Family */}
                        <div className="space-y-2 mb-4">
                            <label
                                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                Font Family
                            </label>
                            <select
                                value={settings.editorFontFamily}
                                onChange={(e) =>
                                    updateSettings({ editorFontFamily: e.target.value as EditorFontFamily })
                                }
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${isDark
                                        ? 'bg-matte-black border-gray-700 text-bright-white focus:border-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                style={{ fontFamily: getFontFamilyCSS(settings.editorFontFamily) }}
                            >
                                {fontFamilyOptions.map((font) => (
                                    <option key={font} value={font} style={{ fontFamily: getFontFamilyCSS(font) }}>
                                        {font}
                                    </option>
                                ))}
                            </select>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Choose the font family for the code editor
                            </p>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <label
                                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                Font Size: {settings.editorFontSize}px
                            </label>
                            <input
                                type="range"
                                min="12"
                                max="20"
                                value={settings.editorFontSize}
                                onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>12px</span>
                                <span>20px</span>
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings Section */}
                    <div>
                        <h3
                            className={`text-xs tracking-wider font-semibold uppercase mb-4 border-l-2 border-vscode-statusbar pl-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                        >
                            Theme
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {themeOptions.map((theme) => (
                                <button
                                    key={theme.value}
                                    onClick={() => updateSettings({ theme: theme.value })}
                                    className={`p-4 rounded-lg border-2 transition-all ${settings.theme === theme.value
                                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                                            : isDark
                                                ? 'border-gray-700 hover:border-gray-600'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${theme.color} border-2 border-gray-600`} />
                                        <div className="text-left">
                                            <div
                                                className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'
                                                    }`}
                                            >
                                                {theme.label}
                                            </div>
                                            {settings.theme === theme.value && (
                                                <div className="text-xs text-blue-500">Active</div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Behavior Settings Section */}
                    <div>
                        <h3
                            className={`text-xs tracking-wider font-semibold uppercase mb-4 border-l-2 border-vscode-statusbar pl-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                        >
                            Behavior
                        </h3>

                        {/* Auto-run JS Toggle */}
                        <div
                            className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-matte-black' : 'border-gray-300 bg-gray-50'
                                } mb-4`}
                        >
                            <div className="flex-1">
                                <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Auto-run JavaScript
                                </div>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    Automatically execute JavaScript when code changes. When disabled, use the "Run JS"
                                    button in the preview panel.
                                </p>
                            </div>
                            <button
                                onClick={() => updateSettings({ autoRunJS: !settings.autoRunJS })}
                                className={`relative ml-4 w-12 h-6 rounded-full transition-colors ${settings.autoRunJS ? 'bg-blue-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.autoRunJS ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Preview Delay Slider */}
                        <div className="space-y-2">
                            <label
                                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                Preview Update Delay: {settings.previewDelay}ms
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1500"
                                step="100"
                                value={settings.previewDelay}
                                onChange={(e) => updateSettings({ previewDelay: parseInt(e.target.value) })}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Instant (0ms)</span>
                                <span>Slow (1500ms)</span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                Debounce delay before updating the preview after code changes
                            </p>
                        </div>
                    </div>

                    {/* Layout Settings Section */}
                    <div>
                        <h3
                            className={`text-xs tracking-wider font-semibold uppercase mb-4 border-l-2 border-vscode-statusbar pl-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}
                        >
                            Layout Settings
                        </h3>

                        {/* Show Footer Toggle */}
                        <div
                            className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-matte-black' : 'border-gray-300 bg-gray-50'
                                }`}
                        >
                            <div className="flex-1">
                                <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Show Footer
                                </div>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    Toggle the footer visibility. When hidden, the editor and preview expand to fill the space.
                                </p>
                            </div>
                            <button
                                onClick={toggleFocusMode}
                                className={`relative ml-4 w-12 h-6 rounded-full transition-colors ${!focusMode ? 'bg-blue-600' : 'bg-gray-600'
                                    }`}
                                aria-label="Toggle footer visibility"
                            >
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${!focusMode ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                >
                    <button
                        onClick={resetSettings}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                                ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-vscode-statusbar hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
