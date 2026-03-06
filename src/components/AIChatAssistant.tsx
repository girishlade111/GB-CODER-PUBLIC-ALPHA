import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, MessageSquare, Trash2, Copy, Check, Code2, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { aiChatAssistant, ChatMessage } from '../services/aiChatAssistant';
import toast from 'react-hot-toast';

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  javascript: string;
  externalLibraries: string[];
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  isOpen,
  onClose,
  html,
  css,
  javascript,
  externalLibraries,
}) => {
  const { isDark } = useTheme();
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
        { html, css, javascript, externalLibraries },
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
    } catch (error) {
      toast.error('Failed to get AI response');
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

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
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
                    isDark ? 'bg-gray-800' : 'bg-gray-200'
                  } rounded-md px-2 py-1`}>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {language}
                    </span>
                    <button
                      onClick={() => handleCopyCode(code, `${message.id}-${index}`)}
                      className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
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
                    isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-800 text-gray-100'
                  }`}>
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
          }

          // Regular text - parse bold and inline code
          return (
            <p
              key={index}
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: part
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
                  .replace(/\n/g, '<br />'),
              }}
            />
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                AI Code Assistant
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-2 text-sm cursor-pointer ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <input
                type="checkbox"
                checked={includeCodeContext}
                onChange={(e) => setIncludeCodeContext(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Include code context
            </label>
            <button
              onClick={clearChat}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Clear chat history"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mb-4">
                <MessageSquare className="w-16 h-16 text-purple-500" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Start a Conversation
              </h3>
              <p className={`max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Ask me anything about your code! I can help with explanations, debugging, refactoring, or generating new code.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
                {[
                  { icon: Code2, text: 'Explain my code', example: 'Explain what the CSS grid layout does in my code' },
                  { icon: Sparkles, text: 'Generate code', example: 'Generate a responsive navigation bar with dropdown menu' },
                  { icon: MessageSquare, text: 'Debug issues', example: 'Why is my flexbox not centering items?' },
                  { icon: Check, text: 'Improve code', example: 'How can I optimize this JavaScript function?' },
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion.example)}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                      isDark
                        ? 'border-gray-700 bg-matte-black hover:bg-gray-800 text-gray-300'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <suggestion.icon className="w-5 h-5 mb-2 text-purple-500" />
                    <p className="font-semibold text-sm">{suggestion.text}</p>
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
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-800 text-gray-100'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-white/70'
                        : isDark
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl p-4 ${
                    isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your code... (Shift+Enter for new line)"
              rows={2}
              className={`flex-1 resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? 'bg-gray-800 text-gray-100 placeholder-gray-500'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                inputValue.trim() && !isLoading
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                  : isDark
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
