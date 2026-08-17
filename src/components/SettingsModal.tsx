import React, { useEffect } from 'react';
import { X, Settings as SettingsIcon, Database, Trash2, Upload } from 'lucide-react';
import { useSettings, EditorFontFamily, ThemeVariant } from '../hooks/useSettings';
import { useFocusMode } from '../hooks/useFocusMode';
import { VOICE_LANGUAGES } from '../services/voiceCommandService';
import { useSnapshots } from '../hooks/useSnapshots';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Spoken feedback is pointless to offer where SpeechSynthesis is missing. */
const voiceSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings, resetSettings, getFontFamilyCSS } = useSettings();
    const { focusMode, toggleFocusMode } = useFocusMode();
    const { storageUsage, cleanUpOldSnapshots, importProject } = useSnapshots();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const success = importProject(content);
                if (success) {
                    alert('Project imported successfully! Reloading...');
                    window.location.reload();
                } else {
                    alert('Failed to import project. Invalid file format.');
                }
            }
        };
        reader.readAsText(file);
    };

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

    const themeOptions: { value: ThemeVariant; label: string }[] = [
        { value: 'dark', label: 'Quiet Dark (Default)' },
        { value: 'dark-blue', label: 'Dark Blue' },
        { value: 'dark-purple', label: 'Dark Slate' },
        { value: 'light', label: 'Light' },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-2xl mx-4 rounded-lg border border-[#2a2a2a] bg-[#161616] animate-scale-in text-[#e8e8e8] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#161616]">
                    <div className="flex items-center gap-2.5">
                        <SettingsIcon className="w-4 h-4 text-[#8a8a8a]" />
                        <h2 className="text-[18px] font-semibold text-[#e8e8e8]">
                            Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-[#8a8a8a] hover:text-[#e8e8e8] hover:bg-[#1c1c1c] transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[72vh] overflow-y-auto space-y-6">
                    {/* Editor Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Editor
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                            {/* Font Family Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#2a2a2a] gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Font Family
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-sm mt-0.5">
                                        Typeface used in the code editor panels.
                                    </p>
                                </div>
                                <select
                                    value={settings.editorFontFamily}
                                    onChange={(e) =>
                                        updateSettings({ editorFontFamily: e.target.value as EditorFontFamily })
                                    }
                                    className="bg-[#1c1c1c] border border-[#2a2a2a] text-[#e8e8e8] text-[13px] rounded-md px-3 py-1.5 focus:border-[#e07856] outline-none transition-colors"
                                    style={{ fontFamily: getFontFamilyCSS(settings.editorFontFamily) }}
                                >
                                    {fontFamilyOptions.map((font) => (
                                        <option key={font} value={font} style={{ fontFamily: getFontFamilyCSS(font) }}>
                                            {font}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Font Size Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Font Size ({settings.editorFontSize}px)
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-sm mt-0.5">
                                        Base text size for editor line rendering.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-48">
                                    <span className="text-[11px] text-[#5c5c5c]">12px</span>
                                    <input
                                        type="range"
                                        min="12"
                                        max="20"
                                        value={settings.editorFontSize}
                                        onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })}
                                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#2a2a2a] accent-[#e07856]"
                                    />
                                    <span className="text-[11px] text-[#5c5c5c]">20px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Appearance
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Theme Preset
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-sm mt-0.5">
                                        Active color scheme for the application chrome.
                                    </p>
                                </div>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => updateSettings({ theme: e.target.value as ThemeVariant })}
                                    className="bg-[#1c1c1c] border border-[#2a2a2a] text-[#e8e8e8] text-[13px] rounded-md px-3 py-1.5 focus:border-[#e07856] outline-none transition-colors"
                                >
                                    {themeOptions.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Behavior Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Behavior
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                            {/* Auto-run JS */}
                            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Auto-run JavaScript
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-md mt-0.5">
                                        Execute scripts automatically on code changes. When disabled, use the Run button.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.autoRunJS}
                                    onClick={() => updateSettings({ autoRunJS: !settings.autoRunJS })}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        settings.autoRunJS ? 'bg-[#3ecf5e]' : 'bg-[#2a2a2a]'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#e8e8e8] rounded-full transition-transform ${
                                            settings.autoRunJS ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Preview Delay */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Preview Delay ({settings.previewDelay}ms)
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-sm mt-0.5">
                                        Debounce interval before refreshing the preview frame.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-48">
                                    <span className="text-[11px] text-[#5c5c5c]">0ms</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1500"
                                        step="100"
                                        value={settings.previewDelay}
                                        onChange={(e) => updateSettings({ previewDelay: parseInt(e.target.value) })}
                                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#2a2a2a] accent-[#e07856]"
                                    />
                                    <span className="text-[11px] text-[#5c5c5c]">1.5s</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CodeRabbit AI */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            CodeRabbit AI Scanner
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] p-4">
                            <div className="text-[13.5px] font-medium text-[#e8e8e8] mb-1">
                                API Key
                            </div>
                            <input
                                type="password"
                                value={settings.codeRabbitApiKey || ''}
                                onChange={(e) => updateSettings({ codeRabbitApiKey: e.target.value })}
                                placeholder="Enter your CodeRabbit / Gemini API Key..."
                                className="w-full px-3 py-1.5 text-[13px] font-mono rounded-md bg-[#1c1c1c] border border-[#2a2a2a] text-[#e8e8e8] focus:border-[#e07856] outline-none transition-colors"
                            />
                            <p className="text-[12.5px] text-[#8a8a8a] mt-2">
                                Used by the AI bug scanner to audit project code for logic issues and security vulnerabilities.
                            </p>
                        </div>
                    </div>

                    {/* Voice Commands */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Voice Commands
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                            {/* Spoken Feedback */}
                            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Spoken Feedback
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-md mt-0.5">
                                        Speak a short confirmation after each command.
                                        {!voiceSynthesisSupported && ' (Unsupported in this browser)'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.voiceFeedback}
                                    onClick={() => updateSettings({ voiceFeedback: !settings.voiceFeedback })}
                                    disabled={!voiceSynthesisSupported}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        settings.voiceFeedback ? 'bg-[#3ecf5e]' : 'bg-[#2a2a2a]'
                                    } ${!voiceSynthesisSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#e8e8e8] rounded-full transition-transform ${
                                            settings.voiceFeedback ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Continuous Listening */}
                            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Continuous Listening
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-md mt-0.5">
                                        Keep the microphone active for sequential commands.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.voiceContinuous}
                                    onClick={() => updateSettings({ voiceContinuous: !settings.voiceContinuous })}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        settings.voiceContinuous ? 'bg-[#3ecf5e]' : 'bg-[#2a2a2a]'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#e8e8e8] rounded-full transition-transform ${
                                            settings.voiceContinuous ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Language */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Recognition Language
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-sm mt-0.5">
                                        Language model used for speech transcription.
                                    </p>
                                </div>
                                <select
                                    value={settings.voiceLanguage}
                                    onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                                    className="bg-[#1c1c1c] border border-[#2a2a2a] text-[#e8e8e8] text-[13px] rounded-md px-3 py-1.5 focus:border-[#e07856] outline-none transition-colors"
                                >
                                    {VOICE_LANGUAGES.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Storage & Snapshots */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Storage & Snapshots
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-[#8a8a8a]" />
                                    <span className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Local Storage Usage
                                    </span>
                                </div>
                                <span className="text-[12px] text-[#8a8a8a]">
                                    {(storageUsage.usedBytes / 1024 / 1024).toFixed(2)} MB / {(storageUsage.maxBytes / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>

                            <div className="w-full bg-[#1c1c1c] rounded-full h-1.5 mb-4 overflow-hidden border border-[#2a2a2a]">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        storageUsage.percentage > 80 ? 'bg-[#e5484d]' : 'bg-[#e07856]'
                                    }`}
                                    style={{ width: `${Math.min(100, storageUsage.percentage)}%` }}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={cleanUpOldSnapshots}
                                    className="inline-flex items-center gap-1.5 bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] text-[#e8e8e8] px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-[#8a8a8a]" />
                                    Clean Auto-Snapshots
                                </button>

                                <input
                                    type="file"
                                    accept=".gbcoder,.json"
                                    ref={fileInputRef}
                                    onChange={handleImport}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] text-[#e8e8e8] px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5 text-[#8a8a8a]" />
                                    Import Project
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Layout Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-[#8a8a8a] mb-2.5">
                            Layout
                        </div>
                        <div className="rounded-lg border border-[#2a2a2a] bg-[#161616] overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <div className="text-[13.5px] font-medium text-[#e8e8e8]">
                                        Show Footer
                                    </div>
                                    <p className="text-[12.5px] text-[#8a8a8a] max-w-md mt-0.5">
                                        Toggle footer visibility. When hidden, the workspace fills the viewport.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={!focusMode}
                                    onClick={toggleFocusMode}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        !focusMode ? 'bg-[#3ecf5e]' : 'bg-[#2a2a2a]'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#e8e8e8] rounded-full transition-transform ${
                                            !focusMode ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#161616]">
                    <button
                        onClick={resetSettings}
                        className="px-3 py-1.5 text-[12.5px] font-medium text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors rounded-md"
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] text-[#e8e8e8] rounded-md text-[13px] font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
