import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, MessageSquare, Trash2, Copy, Check, Code2, Sparkles, Loader2 } from 'lucide-react';
import { aiChatAssistant, ChatMessage } from '../services/aiChatAssistant';
import { ExternalLibrary } from '../services/externalLibraryService';
import toast from 'react-hot-toast';

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  javascript: string;
  externalLibraries: ExternalLibrary[];
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  isOpen,
  onClose,
  html,
  css,
  javascript,
  externalLibraries,
}) => {
  // Escape to dismiss, consistent with the other sidebar-triggered panels.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeCodeContext, setIncludeCodeContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiChatAssistant.sendMessage(
        userMessage.content,
        { html, css, javascript, externalLibraries: externalLibraries.map(lib => lib.name) },
        includeCodeContext
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      aiChatAssistant.addMessage(userMessage);
      aiChatAssistant.addMessage(assistantMessage);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error or timeout occurred.';
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-red-600 dark:text-red-400">AI request failed</span>
          <span className="text-sm">{errorMsg} Your code was not modified.</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSendMessage();
              }}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Retry
            </button>
            <button
              onClick={() => {
                const stackOrMsg = err instanceof Error ? err.stack || err.message : String(err || 'Unknown error');
                navigator.clipboard.writeText(stackOrMsg);
                toast.success('Error copied to clipboard', { id: t.id });
              }}
              className="px-3 py-1 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Copy Error
            </button>
          </div>
        </div>
      ), { duration: 8000 });
      // Remove the optimistically added user message since it failed
      setMessages(prev => prev.slice(0, -1));
      setInputValue(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    aiChatAssistant.clearHistory();
    toast.success('Chat history cleared');
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.role === 'user') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    // Assistant message - parse code blocks
    const parts = message.content.split(/(```[\s\S]*?```)/g);
    
    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (part.startsWith('```')) {
            const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
            if (match) {
              const language = match[1] || 'text';
              const code = match[2].trim();
              const isCopied = copiedId === `${message.id}-${index}`;

              return (
                <div key={index} className="relative group">
                  <div className={`absolute top-2 right-2 flex items-center gap-2 ${
                    'bg-product-active'
                  } rounded-md px-2 py-1`}>
                    <span className={`text-xs ${'text-content-on-dark-soft'}`}>
                      {language}
                    </span>
                    <button
                      onClick={() => handleCopyCode(code, `${message.id}-${index}`)}
                      className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                        'hover:bg-product-hover'
                      }`}
                      title="Copy code"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                    'bg-product-soft text-content-on-dark'
                  }`}>
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
          }

          // Regular text - parse bold and inline code.
          return (
            <p
              key={index}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: renderInlineMarkup(part) }}
            />
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl h-[80vh] rounded-lg border border-stroke-dark bg-product flex flex-col overflow-hidden text-content-on-dark"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke-dark bg-product">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-product-elevated border border-stroke-dark rounded-md">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-sans text-[16px] font-medium text-content-on-dark">
                AI Code Assistant
              </h2>
              <p className="text-[12px] text-content-on-dark-soft">
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-content-on-dark-soft cursor-pointer">
              <input
                type="checkbox"
                checked={includeCodeContext}
                onChange={(e) => setIncludeCodeContext(e.target.checked)}
                className="rounded border-stroke-dark bg-product-elevated text-accent focus:ring-0"
              />
              Include current code context
            </label>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-md text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-elevated transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-content-on-dark-soft hover:text-content-on-dark hover:bg-product-elevated transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-product-soft"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-product border border-stroke-dark rounded-full mb-3">
                <MessageSquare className="w-8 h-8 text-content-on-dark-soft" />
              </div>
              <h3 className="text-[16px] font-semibold text-content-on-dark mb-1">
                Start a Conversation
              </h3>
              <p className="max-w-md text-[12.5px] text-content-on-dark-soft">
                Ask questions about your code, request refactoring, debugging, or new feature implementations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 w-full max-w-2xl">
                {[
                  { icon: Code2, text: 'Explain my code', example: 'Explain what the CSS grid layout does in my code' },
                  { icon: Sparkles, text: 'Generate code', example: 'Generate a responsive navigation bar with dropdown menu' },
                  { icon: MessageSquare, text: 'Debug issues', example: 'Why is my flexbox not centering items?' },
                  { icon: Check, text: 'Improve code', example: 'How can I optimize this JavaScript function?' },
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion.example)}
                    className="p-3.5 rounded-md border border-stroke-dark bg-product hover:bg-product-elevated text-left transition-colors text-content-on-dark"
                  >
                    <suggestion.icon className="w-4 h-4 mb-1.5 text-accent" />
                    <p className="font-medium text-[13px] text-content-on-dark">{suggestion.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 text-[13.5px] ${
                      message.role === 'user'
                        ? 'bg-product-elevated border border-stroke-dark text-content-on-dark'
                        : 'bg-product border border-stroke-dark text-content-on-dark'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p className="text-[11px] mt-2 text-content-on-dark-soft">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-product border border-stroke-dark rounded-lg p-3.5 flex items-center gap-2 text-[12.5px] text-content-on-dark-soft">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stroke-dark bg-product">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your code... (Shift+Enter for new line)"
              rows={2}
              className="flex-1 resize-none rounded-md px-3.5 py-2.5 bg-product-elevated border border-stroke-dark text-content-on-dark placeholder-content-on-dark-soft focus:border-accent outline-none text-[13px] transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-md bg-accent hover:bg-accent-hover text-accent-fg disabled:bg-product-elevated disabled:border disabled:border-stroke-dark disabled:text-content-on-dark-soft transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
