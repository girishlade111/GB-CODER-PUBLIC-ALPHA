import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * DESIGN.md ships a single light system, so there is no variant to choose.
 * The type is retained as `'light'` so existing `settings.theme` reads and
 * persisted blobs keep type-checking.
 */
export type ThemeVariant = 'light';
export type EditorFontFamily = 'JetBrains Mono' | 'Fira Code' | 'Monaco' | 'Consolas' | 'Default';
export type AIProviderId = 'inception' | 'atria' | 'nvidia';

export interface AIProviderOption {
    id: AIProviderId;
    name: string;
    model: string;
    badge: string;
    description: string;
}

export const AI_PROVIDERS: AIProviderOption[] = [
    {
        id: 'inception',
        name: 'Inception Labs',
        model: 'mercury-2.5',
        badge: 'Fast (~4s)',
        description: 'Mercury 2.5 — ultra-fast generation with reasoning',
    },
    {
        id: 'atria',
        name: 'Atria ASI',
        model: 'Atria-Dawn-Preview',
        badge: '256k Context',
        description: 'Atria Dawn Preview — deep reasoning & long context',
    },
    {
        id: 'nvidia',
        name: 'NVIDIA NIM',
        model: 'qwen/qwen3.5-397b-a17b',
        badge: 'Qwen 3.5 397B',
        description: 'Qwen 3.5 via NVIDIA NIM Foundation',
    },
];

export interface AppSettings {
    editorFontFamily: EditorFontFamily;
    editorFontSize: number;
    theme: ThemeVariant;
    autoRunJS: boolean;
    previewDelay: number;
    /** Speak short confirmations after a voice command runs. */
    voiceFeedback: boolean;
    /** Keep the microphone open for several commands instead of one. */
    voiceContinuous: boolean;
    /** BCP-47 tag passed to SpeechRecognition. */
    voiceLanguage: string;
    /**
     * Show AI ghost-text suggestions in the editor, accepted with Tab.
     *
     * Off by default: this sends the surrounding code to a paid model on every
     * typing pause, so it should be a deliberate choice rather than a default
     * that quietly spends the user's quota.
     */
    inlineCopilotEnabled: boolean;
    /** CodeRabbit AI API Key for bug & error detection */
    codeRabbitApiKey: string;
    /** AI Provider for Build with AI and Editor features */
    aiProvider: AIProviderId;
    /** Optional custom API keys */
    inceptionApiKey?: string;
    atriaApiKey?: string;
    nvidiaApiKey?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
    editorFontFamily: 'JetBrains Mono',
    editorFontSize: 14,
    theme: 'light',
    autoRunJS: true,
    previewDelay: 300,
    // Off by default: audio that starts talking unprompted is intrusive.
    voiceFeedback: false,
    voiceContinuous: false,
    voiceLanguage: 'en-US',
    inlineCopilotEnabled: false,
    codeRabbitApiKey: import.meta.env.VITE_CODERABBIT_API_KEY || '',
    aiProvider: 'inception',
    inceptionApiKey: '',
    atriaApiKey: '',
    nvidiaApiKey: '',
};

export const useSettings = () => {
    const [storedSettings, setSettings] = useLocalStorage<AppSettings>(
        'gb-coder-settings',
        DEFAULT_SETTINGS
    );

    /*
     * Installs that predate a newly added setting have it missing from their
     * persisted blob, which would otherwise surface as `undefined` and turn
     * controlled inputs uncontrolled. Defaults backfill on every read.
     */
    const settings = useMemo<AppSettings>(
        () => ({ ...DEFAULT_SETTINGS, ...storedSettings, theme: 'light' }),
        [storedSettings]
    );

    // Update individual settings
    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings((prev) => ({
            ...prev,
            ...partial,
            // The theme is no longer user-selectable.
            theme: 'light',
        }));
    }, [setSettings]);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, [setSettings]);

    // Get font family CSS value
    const getFontFamilyCSS = useCallback((fontFamily: EditorFontFamily): string => {
        switch (fontFamily) {
            case 'JetBrains Mono':
                return 'JetBrains Mono, Monaco, Consolas, monospace';
            case 'Fira Code':
                return 'Fira Code, Monaco, Consolas, monospace';
            case 'Monaco':
                return 'Monaco, Consolas, monospace';
            case 'Consolas':
                return 'Consolas, monospace';
            case 'Default':
                return 'monospace';
            default:
                return 'JetBrains Mono, Monaco, Consolas, monospace';
        }
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
        getFontFamilyCSS,
    };
};
