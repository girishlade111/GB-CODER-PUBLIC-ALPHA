import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Wand2, X } from 'lucide-react';
import toast from 'react-hot-toast';
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
      <div className="w-full max-w-[560px] rounded-lg border border-stroke-subtle bg-surface-raised p-6 shadow-elevated">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-600/20 p-2 text-violet-300">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-bright-white">Build with AI</h2>
              <p className="mt-1 text-sm text-gray-400">
                Describe what you want to build in plain English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close Build with AI modal"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
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
            className="min-h-[120px] w-full resize-y rounded-lg border border-gray-700 bg-dark-gray px-4 py-3 pb-8 text-sm text-bright-white placeholder-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
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
              className="rounded-full border border-gray-700 bg-dark-gray px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-violet-500/70 hover:bg-violet-500/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition-all hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-400 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate Code
            </>
          )}
        </button>

        {isLoading && (
          <p className="mt-3 text-center text-sm text-violet-300">
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

        <p className="mt-4 text-xs text-gray-500">
          {' '}
          Your current code is auto-saved before generation
        </p>
      </div>
    </div>
  );
};

export default BuildFromPromptModal;
