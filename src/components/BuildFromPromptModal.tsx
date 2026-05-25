import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Wand2, X } from 'lucide-react';

interface BuildFromPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (html: string, css: string, javascript: string) => void;
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
const TIMEOUT_MS = 45000;

const parseGeneratedCode = (responseText: string) => {
  try {
    return JSON.parse(responseText);
  } catch {
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('No JSON object found in response.');
    }

    return JSON.parse(responseText.slice(firstBrace, lastBrace + 1));
  }
};

const BuildFromPromptModal: React.FC<BuildFromPromptModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPromptValid = promptText.trim().length >= MIN_PROMPT_LENGTH;
  const isCoolingDown = cooldownSeconds > 0;
  const isGenerateDisabled = !isPromptValid || isLoading || isCoolingDown;

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setLoadingMessageIndex(0);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [isOpen]);

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
    if (event.target === event.currentTarget && !isLoading) {
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
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'generate',
          prompt: normalizedPrompt,
        }),
        signal: controller.signal,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error('Generation request failed.');
      }

      const parsed = parseGeneratedCode(responseText);
      // NEW: Empty-panel fallbacks keep generated output safe for all editors.
      const parsedHtml = String(parsed.html ?? '');
      const parsedCss = String(parsed.css ?? '');
      const parsedJavascript = String(parsed.javascript ?? '');
      const html = parsedHtml.trim() ? parsedHtml : '<div class="container"></div>';
      const css = parsedCss.trim() ? parsedCss : '.container { padding: 20px; }';
      const javascript = parsedJavascript.trim() ? parsedJavascript : '';

      onGenerate(html, css, javascript);
      setLastGeneratedPrompt(normalizedPrompt);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      onClose();
    } catch {
      setErrorMessage('Generation failed — try rephrasing your prompt.');
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[560px] rounded-xl border border-gray-700 bg-matte-black p-5 shadow-2xl">
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
              if (error) setError(false);
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
                setError(false);
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

        {error && (
          <div className="mt-3 rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-sm text-red-300">
            Generation failed — try rephrasing your prompt.{' '}
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
