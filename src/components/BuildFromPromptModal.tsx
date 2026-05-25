import React, { useEffect, useRef, useState } from 'react';
import { Code2, Loader2, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme';

interface GeneratedCode {
  html: string;
  css: string;
  javascript: string;
}

interface BuildFromPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: GeneratedCode;
  onBuild: (code: GeneratedCode) => Promise<void> | void;
}

const extractJsonObject = (text: string): string => {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] || text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('AI response did not contain JSON code output.');
  }

  return candidate.slice(firstBrace, lastBrace + 1);
};

const parseGeneratedCode = (result: string): GeneratedCode => {
  const parsed = JSON.parse(extractJsonObject(result));

  return {
    html: String(parsed.html || ''),
    css: String(parsed.css || ''),
    javascript: String(parsed.javascript || ''),
  };
};

const BuildFromPromptModal: React.FC<BuildFromPromptModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  onBuild,
}) => {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'generate',
          userMessage: userPrompt,
          currentCode,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate code. Please try again.');
      }

      const generatedCode = parseGeneratedCode(String(data?.result || ''));
      await onBuild(generatedCode);
      toast.success('Project built from prompt');
      onClose();
      setPrompt('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate code. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border ${
          isDark ? 'bg-matte-black border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Build from Prompt
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Generate HTML, CSS, and JavaScript into the editor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-5 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={8}
            placeholder="Describe the app or component you want to build..."
            className={`w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 ${
              isDark
                ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700'
                : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
            }`}
          />

          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Ctrl+Enter to generate
            </p>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4" />
                  Build
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildFromPromptModal;
