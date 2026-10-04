import React, { useEffect } from 'react';
import { X, Settings as SettingsIcon, Database, Trash2, Upload } from 'lucide-react';
import { useSettings, EditorFontFamily, ThemeVariant, AI_PROVIDERS, type AIProviderId } from '../hooks/useSettings';
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

    // DESIGN.md defines a single warm-cream system, so there is nothing to
    // pick here — the control is removed rather than left with one dead option.
    const themeOptions: { value: ThemeVariant; label: string }[] = [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-2xl mx-4 rounded-lg border border-stroke-dark bg-product animate-scale-in text-content-on-dark overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-dark bg-product">
                    <div className="flex items-center gap-2.5">
                        <SettingsIcon className="w-4 h-4 text-content-on-dark-soft" />
                        <h2 className="font-sans text-[18px] font-medium text-content-on-dark">
                            Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-elevated transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[72vh] overflow-y-auto space-y-6">
                    {/* Editor Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Editor
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            {/* Font Family Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-stroke-dark gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Font Family
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Typeface used in the code editor panels.
                                    </p>
                                </div>
                                <select
                                    value={settings.editorFontFamily}
                                    onChange={(e) =>
                                        updateSettings({ editorFontFamily: e.target.value as EditorFontFamily })
                                    }
                                    className="bg-product-elevated border border-stroke-dark text-content-on-dark text-[13px] rounded-md px-3 py-1.5 focus:border-accent outline-none transition-colors"
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
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Font Size ({settings.editorFontSize}px)
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Base text size for editor line rendering.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-48">
                                    <span className="text-[11px] text-content-on-dark-soft">12px</span>
                                    <input
                                        type="range"
                                        min="12"
                                        max="20"
                                        value={settings.editorFontSize}
                                        onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })}
                                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-product-active accent-accent"
                                    />
                                    <span className="text-[11px] text-content-on-dark-soft">20px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Appearance
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Theme Preset
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Active color scheme for the application chrome.
                                    </p>
                                </div>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => updateSettings({ theme: e.target.value as ThemeVariant })}
                                    className="bg-product-elevated border border-stroke-dark text-content-on-dark text-[13px] rounded-md px-3 py-1.5 focus:border-accent outline-none transition-colors"
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
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Behavior
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            {/* Auto-run JS */}
                            <div className="flex items-center justify-between p-4 border-b border-stroke-dark">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Auto-run JavaScript
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-md mt-0.5">
                                        Execute scripts automatically on code changes. When disabled, use the Run button.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.autoRunJS}
                                    onClick={() => updateSettings({ autoRunJS: !settings.autoRunJS })}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        settings.autoRunJS ? 'bg-teal' : 'bg-product-active'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-content-on-dark rounded-full transition-transform ${
                                            settings.autoRunJS ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Preview Delay */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Preview Delay ({settings.previewDelay}ms)
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Debounce interval before refreshing the preview frame.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-48">
                                    <span className="text-[11px] text-content-on-dark-soft">0ms</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1500"
                                        step="100"
                                        value={settings.previewDelay}
                                        onChange={(e) => updateSettings({ previewDelay: parseInt(e.target.value) })}
                                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-product-active accent-accent"
                                    />
                                    <span className="text-[11px] text-content-on-dark-soft">1.5s</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Model Provider */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            AI Model Provider
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Default AI Model
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Select which model powers Build with AI, code explain, fix, and optimize.
                                    </p>
                                </div>
                                <select
                                    value={settings.aiProvider || 'inception'}
                                    onChange={(e) => updateSettings({ aiProvider: e.target.value as AIProviderId })}
                                    className="bg-product-elevated border border-stroke-dark text-content-on-dark text-[13px] rounded-md px-3 py-1.5 focus:border-accent outline-none transition-colors"
                                >
                                    {AI_PROVIDERS.map((provider) => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name} — {provider.model} ({provider.badge})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="px-4 py-2.5 bg-product-elevated/40 border-t border-stroke-dark flex items-center justify-between text-[11.5px] text-content-on-dark-soft">
                                <span className="truncate mr-2">
                                    {AI_PROVIDERS.find((p) => p.id === (settings.aiProvider || 'inception'))?.description}
                                </span>
                                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-product-elevated border border-stroke-dark shrink-0">
                                    {AI_PROVIDERS.find((p) => p.id === (settings.aiProvider || 'inception'))?.model}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CodeRabbit AI */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            CodeRabbit AI Scanner
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product p-4">
                            <div className="text-[13.5px] font-medium text-content-on-dark mb-1">
                                API Key
                            </div>
                            <input
                                type="password"
                                value={settings.codeRabbitApiKey || ''}
                                onChange={(e) => updateSettings({ codeRabbitApiKey: e.target.value })}
                                placeholder="Enter your CodeRabbit / Gemini API Key..."
                                className="w-full px-3 py-1.5 text-[13px] font-mono rounded-md bg-product-elevated border border-stroke-dark text-content-on-dark focus:border-accent outline-none transition-colors"
                            />
                            <p className="text-[12.5px] text-content-on-dark-soft mt-2">
                                Used by the AI bug scanner to audit project code for logic issues and security vulnerabilities.
                            </p>
                        </div>
                    </div>

                    {/* Voice Commands */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Voice Commands
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            {/* Spoken Feedback */}
                            <div className="flex items-center justify-between p-4 border-b border-stroke-dark">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Spoken Feedback
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-md mt-0.5">
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
                                        settings.voiceFeedback ? 'bg-teal' : 'bg-product-active'
                                    } ${!voiceSynthesisSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-content-on-dark rounded-full transition-transform ${
                                            settings.voiceFeedback ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Continuous Listening */}
                            <div className="flex items-center justify-between p-4 border-b border-stroke-dark">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Continuous Listening
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-md mt-0.5">
                                        Keep the microphone active for sequential commands.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.voiceContinuous}
                                    onClick={() => updateSettings({ voiceContinuous: !settings.voiceContinuous })}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        settings.voiceContinuous ? 'bg-teal' : 'bg-product-active'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-content-on-dark rounded-full transition-transform ${
                                            settings.voiceContinuous ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Language */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Recognition Language
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-sm mt-0.5">
                                        Language model used for speech transcription.
                                    </p>
                                </div>
                                <select
                                    value={settings.voiceLanguage}
                                    onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                                    className="bg-product-elevated border border-stroke-dark text-content-on-dark text-[13px] rounded-md px-3 py-1.5 focus:border-accent outline-none transition-colors"
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
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Storage & Snapshots
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-content-on-dark-soft" />
                                    <span className="text-[13.5px] font-medium text-content-on-dark">
                                        Local Storage Usage
                                    </span>
                                </div>
                                <span className="text-[12px] text-content-on-dark-soft">
                                    {(storageUsage.usedBytes / 1024 / 1024).toFixed(2)} MB / {(storageUsage.maxBytes / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>

                            <div className="w-full bg-product-elevated rounded-full h-1.5 mb-4 overflow-hidden border border-stroke-dark">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        storageUsage.percentage > 80 ? 'bg-danger' : 'bg-accent'
                                    }`}
                                    style={{ width: `${Math.min(100, storageUsage.percentage)}%` }}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={cleanUpOldSnapshots}
                                    className="inline-flex items-center gap-1.5 bg-product-elevated hover:bg-product-active border border-stroke-dark text-content-on-dark px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-content-on-dark-soft" />
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
                                    className="inline-flex items-center gap-1.5 bg-product-elevated hover:bg-product-active border border-stroke-dark text-content-on-dark px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5 text-content-on-dark-soft" />
                                    Import Project
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Layout Settings */}
                    <div>
                        <div className="text-[12.5px] font-medium text-content-on-dark-soft mb-2.5">
                            Layout
                        </div>
                        <div className="rounded-lg border border-stroke-dark bg-product overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <div className="text-[13.5px] font-medium text-content-on-dark">
                                        Show Footer
                                    </div>
                                    <p className="text-[12.5px] text-content-on-dark-soft max-w-md mt-0.5">
                                        Toggle footer visibility. When hidden, the workspace fills the viewport.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={!focusMode}
                                    onClick={toggleFocusMode}
                                    className={`relative ml-4 w-9 h-5 rounded-full transition-colors ${
                                        !focusMode ? 'bg-teal' : 'bg-product-active'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-content-on-dark rounded-full transition-transform ${
                                            !focusMode ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-stroke-dark bg-product">
                    <button
                        onClick={resetSettings}
                        className="px-3 py-1.5 text-[12.5px] font-medium text-content-on-dark-soft hover:text-content-on-dark transition-colors rounded-md"
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-product-elevated hover:bg-product-active border border-stroke-dark text-content-on-dark rounded-md text-[13px] font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
