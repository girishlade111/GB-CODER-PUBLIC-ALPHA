import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Sparkles, Wand2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings, AI_PROVIDERS, type AIProviderId } from '../hooks/useSettings';
import {
  AiParseError,
  AiRequestError,
  AiResponseEnvelope,
  GeneratedProjectPayload,
  ProjectContext,
  parseAiJson,
  validateGeneratedProject,
} from '../types/ai';

interface BuildFromPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (html: string, css: string, javascript: string) => void;
  /** FULL current editor contents, sent as reference context with the request. */
  projectContext?: ProjectContext;
  /**
   * Seed text for the prompt box, used by the voice flow. Nothing is generated
   * automatically: the transcript is shown so the user can confirm or edit it.
   */
  initialPrompt?: string;
}

const QUICK_START_PROMPTS = [
  'Login form with glassmorphism',
  'Dark mode todo app with localStorage',
  'CSS animation showcase',
  'Product landing page hero section',
  'Interactive calculator',
  'Developer portfolio hero',
];

const LOADING_MESSAGES = [
  'Reading your prompt...',
  'Writing HTML structure...',
  'Styling with CSS...',
  'Adding JavaScript logic...',
  'Almost ready...',
];

const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 10;
const COOLDOWN_MS = 8000;
// Covers the initial attempt plus one stricter retry.
const TIMEOUT_MS = 95000;

/**
 * Parses and validates generated code. Throws AiParseError when the payload
 * cannot be trusted, so broken output is never applied to the editor.
 */
const parseGeneratedCode = (responseText: string): GeneratedProjectPayload =>
  validateGeneratedProject(parseAiJson(responseText), responseText);

const BuildFromPromptModal: React.FC<BuildFromPromptModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  projectContext,
  initialPrompt = '',
}) => {
  const { settings, updateSettings } = useSettings();
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(
    settings.aiProvider || 'inception'
  );

  useEffect(() => {
    if (settings.aiProvider) {
      setSelectedProvider(settings.aiProvider);
    }
  }, [settings.aiProvider]);

  const handleProviderSelect = (id: AIProviderId) => {
    setSelectedProvider(id);
    updateSettings({ aiProvider: id });
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const [promptText, setPromptText] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPromptValid = promptText.trim().length >= MIN_PROMPT_LENGTH;
  const isCoolingDown = cooldownSeconds > 0;
  const isGenerateDisabled = !isPromptValid || isLoading || isCoolingDown;

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setLoadingMessageIndex(0);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [isOpen]);

  /*
   * Voice dictation updates `initialPrompt` while the modal is already open
   * (follow-ups such as "add a navbar" append to it), so the textarea has to
   * track it. An empty seed is ignored so opening the modal manually never
   * wipes text the user typed.
   */
  useEffect(() => {
    if (!initialPrompt) return;
    setPromptText(initialPrompt);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      // Caret at the end, ready to keep editing the dictated prompt.
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
  }, [initialPrompt]);

  // NEW: Show prompt-quality feedback even when the disabled button cannot be clicked.
  useEffect(() => {
    if (!promptText) {
      setErrorMessage(null);
      return;
    }

    const normalizedPrompt = promptText.trim();
    const hasMeaningfulText = /[a-zA-Z0-9]/.test(normalizedPrompt);

    if (normalizedPrompt.length < MIN_PROMPT_LENGTH || !hasMeaningfulText) {
      setErrorMessage('Please describe what you want to build in more detail.');
      return;
    }

    if (errorMessage === 'Please describe what you want to build in more detail.') {
      setErrorMessage(null);
    }
  }, [promptText, errorMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // NEW: Abort an in-flight generation when the modal is closed or unmounted.
  useEffect(() => {
    if (isOpen) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  // NEW: Keep a visible client-side cooldown countdown after a successful generation.
  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const updateCooldown = () => {
      const remainingMs = cooldownUntil - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setCooldownSeconds(remainingSeconds);

      if (remainingSeconds === 0) {
        setCooldownUntil(0);
      }
    };

    updateCooldown();
    const intervalId = window.setInterval(updateCooldown, 250);
    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleTryAgain = () => {
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (isGenerateDisabled) return;

    // NEW: Prompt quality validation before making any API request.
    const normalizedPrompt = promptText.trim().slice(0, MAX_PROMPT_LENGTH);
    const hasMeaningfulText = /[a-zA-Z0-9]/.test(normalizedPrompt);

    if (normalizedPrompt.length < MIN_PROMPT_LENGTH || !hasMeaningfulText) {
      setErrorMessage('Please describe what you want to build in more detail.');
      return;
    }

    // NEW: Duplicate prompt confirmation before replacing current generated code.
    if (normalizedPrompt === lastGeneratedPrompt) {
      const shouldRegenerate = window.confirm(
        'You already generated code for this prompt. Generate again and replace current code?'
      );

      if (!shouldRegenerate) return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessageIndex(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    /**
     * One generation attempt. `strictJson` makes the server append the
     * "Return ONLY valid JSON, nothing else" instruction to the system prompt.
     * The payload is fully validated here, so a caller only ever receives
     * output that is safe to write into the editor.
     */
    const requestGeneration = async (strictJson: boolean): Promise<GeneratedProjectPayload> => {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'generate',
          prompt: normalizedPrompt,
          provider: selectedProvider,
          apiKey:
            selectedProvider === 'inception'
              ? settings.inceptionApiKey
              : selectedProvider === 'atria'
                ? settings.atriaApiKey
                : settings.nvidiaApiKey,
          // Full current editor contents travel with every AI request.
          projectContext: {
            html: projectContext?.html ?? '',
            css: projectContext?.css ?? '',
            javascript: projectContext?.javascript ?? '',
          },
          strictJson,
        }),
        signal: controller.signal,
      });

      let data: AiResponseEnvelope | null = null;
      try {
        data = (await response.json()) as AiResponseEnvelope;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new AiRequestError(
          data?.error || 'Generation request failed.',
          response.status,
          response.status !== 413 && response.status !== 400,
        );
      }

      if (typeof data?.result !== 'string' || !data.result.trim()) {
        throw new AiRequestError('AI returned an empty response.', response.status, true);
      }

      // JSON.parse + contract validation BEFORE anything reaches the editor.
      return parseGeneratedCode(data.result);
    };

    try {
      let parsed: GeneratedProjectPayload;

      try {
        parsed = await requestGeneration(false);
      } catch (firstError) {
        if (controller.signal.aborted) throw firstError;

        const isRetryable =
          firstError instanceof AiParseError ||
          (firstError instanceof AiRequestError && firstError.retryable);

        if (!isRetryable) throw firstError;

        // Retry exactly once, with the stricter JSON-only instruction.
        parsed = await requestGeneration(true);
      }

      if (controller.signal.aborted) return;

      // All three keys are always present; blank panels get a minimal seed.
      const html = parsed.html.trim() ? parsed.html : '<div class="container"></div>';
      const css = parsed.css.trim() ? parsed.css : '.container { padding: 20px; }';
      const javascript = parsed.js;

      onGenerate(html, css, javascript);
      setLastGeneratedPrompt(normalizedPrompt);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      onClose();
    } catch (error) {
      if (controller.signal.aborted) return;

      const message =
        error instanceof AiParseError
          ? 'The AI returned malformed output, so nothing was applied. Please try again.'
          : error instanceof AiRequestError
            ? error.message
            : 'Generation failed — try rephrasing your prompt.';

      setErrorMessage(message);
      toast.error(message, { duration: 5000 });
    } finally {
      window.clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[560px] rounded-xl border border-stroke-dark bg-product p-6 shadow-2xl text-content-on-dark animate-scale-in">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/15 p-2 text-accent">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold text-content-on-dark">Build with AI</h2>
              <p className="mt-0.5 text-sm text-content-on-dark-soft">
                Describe what you want to build in plain English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-content-on-dark-soft transition-colors hover:bg-product-elevated hover:text-content-on-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close Build with AI modal"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Model Provider Custom Dropdown */}
        <div className="mb-4 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium text-content-on-dark-soft flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>AI Model:</span>
            </label>
            <span className="text-[11px] font-mono text-content-on-dark-soft bg-product-elevated px-2 py-0.5 rounded border border-stroke-dark">
              {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.badge}
            </span>
          </div>

          {/* Custom Dropdown Trigger Button */}
          <button
            type="button"
            id="ai-model-dropdown-trigger"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            onClick={() => !isLoading && setIsDropdownOpen((prev) => !prev)}
            disabled={isLoading}
            className={`w-full flex items-center justify-between bg-product-elevated border ${
              isDropdownOpen ? 'border-accent ring-1 ring-accent/30' : 'border-stroke-dark hover:border-stroke-subtle'
            } text-content-on-dark text-[13px] rounded-lg px-3.5 py-2.5 outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 overflow-hidden text-left">
              <span className="font-medium text-white truncate">
                {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.name}
              </span>
              <span className="text-content-on-dark-soft text-[11.5px] font-mono truncate">
                — {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.model}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">
                {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.badge}
              </span>
              <ChevronDown className={`h-4 w-4 text-content-on-dark-soft transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Custom Dropdown Menu Listbox */}
          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg border border-stroke-dark bg-[#1e1c19] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
            >
              {AI_PROVIDERS.map((p) => {
                const isSelected = selectedProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      handleProviderSelect(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-all ${
                      isSelected
                        ? 'bg-accent/15 text-white border border-accent/30'
                        : 'hover:bg-product-elevated text-content-on-dark hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white leading-tight">
                          {p.name}
                        </span>
                        <span className="text-[11px] font-mono text-content-on-dark-soft">
                          {p.model}
                        </span>
                      </div>
                      <span className="text-[11px] text-content-on-dark-soft/80 mt-0.5 truncate">
                        {p.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-accent text-white'
                          : 'bg-product-elevated text-content-on-dark-soft border border-stroke-dark'
                      }`}>
                        {p.badge}
                      </span>
                      {isSelected ? (
                        <Check className="h-4 w-4 text-accent" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-1.5 text-[11.5px] text-content-on-dark-soft/80">
            {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.description}
          </p>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={(event) => {
              setPromptText(event.target.value.slice(0, MAX_PROMPT_LENGTH));
              if (errorMessage) setErrorMessage(null);
            }}
            rows={4}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={isLoading}
            placeholder="Example: A glassmorphism login form with animated gradient background and smooth input focus effects"
            className="min-h-[120px] w-full resize-y rounded-lg border border-stroke-dark bg-product-elevated px-4 py-3 pb-8 text-sm text-content-on-dark placeholder-content-on-dark-soft/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="absolute bottom-3 right-3 text-xs text-content-on-dark-soft">
            {promptText.length} / {MAX_PROMPT_LENGTH}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_START_PROMPTS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setPromptText(chip);
                setErrorMessage(null);
                textareaRef.current?.focus();
              }}
              disabled={isLoading}
              className="rounded-full border border-stroke-dark bg-product-elevated px-3 py-1 text-[12px] text-content-on-dark-soft transition-colors hover:border-accent hover:text-content-on-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13.5px] font-semibold transition-all shadow-sm ${
            isGenerateDisabled
              ? 'bg-product-elevated border border-stroke-dark text-content-on-dark-soft/60 cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-white cursor-pointer active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Generate Code</span>
            </>
          )}
        </button>

        {isLoading && (
          <p className="mt-3 text-center text-[12.5px] text-content-on-dark-soft">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        )}

        {errorMessage && (
          <div className="mt-3 rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-sm text-red-300">
            {errorMessage}{' '}
            <button
              type="button"
              onClick={handleTryAgain}
              className="font-medium text-red-200 underline underline-offset-2 hover:text-white"
            >
              Try Again
            </button>
          </div>
        )}

        <p className="mt-4 text-xs text-content-on-dark-soft/75">
          Your current code is auto-saved before generation
        </p>
      </div>
    </div>
  );
};

export default BuildFromPromptModal;
