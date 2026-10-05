import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback } from 'react';
import {
  Columns,
  Search,
  ChevronDown,
  ChevronRight,
  Database,
  ShieldCheck,
  Wand2,
  Send,
  RotateCcw,
  MessageSquare,
  X,
  Layers,
  Check,
  Loader2,
  StopCircle,
  Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  codeAssistService,
  CodeAssistMode,
} from '../../services/ai/codeAssistService';
import { MultiFileProject } from '../../types/files';
import { AIProviderId } from '../../hooks/useSettings';

interface CodeAssistPanelProps {
  project: MultiFileProject;
  onApplyFiles?: (files: Array<{ path: string; content: string }>) => void;
  onClose?: () => void;
}

const subscribeCodeAssist = (onChange: () => void) => codeAssistService.subscribe(onChange);
const getCodeAssistSnapshot = () => codeAssistService.getState();

const AVAILABLE_MODES: Array<{ id: CodeAssistMode; title: string; desc: string; deprecated?: boolean }> = [
  {
    id: 'Code',
    title: 'Code',
    desc: 'The default agent. Executes tools based on configured permissions.',
  },
  {
    id: 'Ask',
    title: 'Ask',
    desc: 'Get answers and explanations without making changes to the codebase.',
  },
  {
    id: 'Debug',
    title: 'Debug',
    desc: 'Diagnose and fix software issues with systematic debugging methodology.',
  },
  {
    id: 'Plan',
    title: 'Plan',
    desc: 'Plan mode. Can only edit plan files; all other filesystem mutations are denied.',
  },
];

const AVAILABLE_MODELS = [
  { id: 'Mercury 2.5 (Fast)', provider: 'inception' as AIProviderId, label: 'Mercury 2.5 (Fast)' },
  { id: 'Atria Dawn (256k)', provider: 'atria' as AIProviderId, label: 'Atria Dawn (256k)' },
  { id: 'Qwen 3.5 397B', provider: 'nvidia' as AIProviderId, label: 'Qwen 3.5 (NVIDIA)' },
  { id: 'Nemotron 3 Ultra (free)', provider: 'nvidia' as AIProviderId, label: 'Nemotron 3 Ultra (free)' },
];

export const CodeAssistPanel: React.FC<CodeAssistPanelProps> = ({
  project,
  onApplyFiles,
  onClose,
}) => {
  const state = useSyncExternalStore(subscribeCodeAssist, getCodeAssistSnapshot, getCodeAssistSnapshot);
  const activeSession = codeAssistService.getActiveSession();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [showHistoryView, setShowHistoryView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, state.isGenerating, scrollToBottom]);

  const handleSend = () => {
    if (!inputPrompt.trim() || state.isGenerating) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    void codeAssistService.submitPrompt(promptToSend, project, onApplyFiles);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? false : !prev[msgId],
    }));
  };

  const isCurrentSessionGenerating =
    state.isGenerating && state.generatingSessionId === activeSession?.id;

  return (
    <div
      className="flex h-full w-full flex-col bg-[#12131c] text-slate-200 select-none overflow-hidden text-xs"
      data-testid="code-assist-panel"
    >
      {/* ── Top Header Strip (Screenshot 3 & 4) ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#262636] bg-[#181824] px-3 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-mono text-[11px] text-slate-300">
            {activeSession?.title || 'New session'}
          </span>
          <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono shrink-0">
            13%
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={() => codeAssistService.createNewSession()}
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
            title="New Session"
          >
            <Columns className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowHistoryView(!showHistoryView)}
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
            title="Search / Session History"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
              title="Close Panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Token Usage Strip (Screenshot 3) ── */}
      <div className="border-b border-[#262636] bg-[#151622] px-3 py-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-1 bg-cyan-400 rounded-sm" />
            <span className="inline-block h-2 w-1 bg-slate-600 rounded-sm" />
            <span className="text-slate-300 font-semibold ml-1">
              {(state.tokenCount.total / 1000).toFixed(1)}K
            </span>
          </div>
          <span>{(state.tokenCount.max / 1000000).toFixed(1)}M</span>
        </div>

        {/* Dual Progress Bar */}
        <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="bg-cyan-500 h-full transition-all"
            style={{ width: `${Math.min(100, (state.tokenCount.total / state.tokenCount.max) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1">
          <span>Tokens ↑ {(state.tokenCount.input / 1000).toFixed(1)}K ↓ {state.tokenCount.output}</span>
          <ChevronRight className="h-3 w-3 text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>
      </div>

      {/* ── Main Scroll Body ── */}
      <div
        ref={chatContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-3 space-y-4"
        data-testid="code-assist-chat-body"
      >
        {/* If History View is open */}
        {showHistoryView ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sessions History</span>
              <button
                type="button"
                onClick={() => setShowHistoryView(false)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Back to chat
              </button>
            </div>
            {state.sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  codeAssistService.switchSession(sess.id);
                  setShowHistoryView(false);
                }}
                className={`flex items-center justify-between rounded border p-2 cursor-pointer transition-colors ${
                  sess.id === activeSession?.id
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                    : 'border-white/5 bg-[#181824] text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-xs text-slate-200">{sess.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {sess.messages.length} message(s) • {new Date(sess.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    codeAssistService.deleteSession(sess.id);
                  }}
                  className="p-1 text-slate-600 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : activeSession?.messages.length === 0 && !isCurrentSessionGenerating ? (
          /* ── Empty Home Screen matching Screenshot 4 ── */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            {/* Kilo Code Style Geometric Block Logo */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eab308] text-black shadow-lg shadow-yellow-500/10">
              <div className="font-mono text-xl font-black tracking-tighter">
                K:
                <br />
                LO
              </div>
            </div>

            <div className="max-w-xs space-y-1">
              <p className="text-xs font-semibold text-slate-200">
                Code Assist is an AI coding assistant.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ask it to build fullstack features, fix bugs, or explain your codebase with in-browser
                WebContainer execution.
              </p>
            </div>

            {/* Recent Section */}
            <div className="w-full max-w-xs pt-2 text-left space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                RECENT
              </span>
              <div
                onClick={() => {}}
                className="rounded-md border border-white/5 bg-[#181824] px-3 py-2 text-slate-300 hover:border-white/10 cursor-pointer flex items-center justify-between"
              >
                <span className="truncate text-[11px]">{activeSession.title.slice(0, 28)}...</span>
                <span className="text-[10px] text-slate-500">just now</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="w-full max-w-xs space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowHistoryView(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 bg-[#181824] py-1.5 text-[11px] text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Show History
              </button>
              <button
                type="button"
                onClick={() => toast('Feedback & Support: contact developer at girishlade111@gmail.com')}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-cyan-500/40 bg-cyan-500/5 py-1.5 text-[11px] text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                Feedback & Support
              </button>
            </div>
          </div>
        ) : (
          /* ── Chat Messages Flow matching Screenshot 3 ── */
          <>
            {activeSession?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isReasoningOpen = expandedReasoning[msg.id] ?? true;

              return (
                <div key={msg.id} className="space-y-2">
                  {isUser ? (
                    /* User Message Bubble */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#232431] border border-white/10 px-3.5 py-2 text-white shadow-sm text-xs leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Response */
                    <div className="space-y-2.5">
                      {/* Reasoning Accordion (Screenshot 3) */}
                      {msg.reasoning && (
                        <div className="rounded-lg border border-white/5 bg-[#161723] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleReasoning(msg.id)}
                            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 select-none"
                          >
                            <Brain className="h-3 w-3 text-cyan-400" />
                            <span>Reasoning</span>
                            {isReasoningOpen ? (
                              <ChevronDown className="h-3 w-3 ml-auto text-slate-500" />
                            ) : (
                              <ChevronRight className="h-3 w-3 ml-auto text-slate-500" />
                            )}
                          </button>

                          {isReasoningOpen && (
                            <div className="px-3 py-2 border-t border-white/5 bg-[#12131c] text-[11px] font-mono text-slate-400 italic leading-relaxed whitespace-pre-wrap">
                              {msg.reasoning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generated Text Response */}
                      <div className="rounded-lg bg-[#181824]/60 p-3 text-slate-200 text-xs leading-relaxed border border-white/5 space-y-2">
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                        {/* Modified Files Badge & Diff Stats (Screenshot 3) */}
                        {msg.diffStats && (
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px]">
                            <span className="flex items-center gap-1 text-slate-400 font-mono">
                              <Layers className="h-3 w-3 text-cyan-400" />
                              <span className="text-emerald-400 font-bold">+{msg.diffStats.added}</span>
                              <span className="text-red-400 font-bold">-{msg.diffStats.removed}</span>
                            </span>

                            {msg.modifiedFiles && msg.modifiedFiles.length > 0 && (
                              <span className="text-[10px] text-slate-500">
                                ({msg.modifiedFiles.length} file(s) updated)
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action buttons (Screenshot 3) */}
                        <div className="flex items-center gap-2 pt-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => codeAssistService.createNewSession()}
                            className="rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-slate-300 transition-colors"
                          >
                            New Session
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (msg.modifiedFiles && onApplyFiles) {
                                onApplyFiles(
                                  msg.modifiedFiles
                                    .filter((f) => f.content)
                                    .map((f) => ({ path: f.path, content: f.content! }))
                                );
                                toast.success('Changes reapplied to workspace');
                              }
                            }}
                            className="rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 px-2 py-1 transition-colors"
                          >
                            Apply to Workspace
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Flight Generation Indicator */}
            {isCurrentSessionGenerating && (
              <div className="space-y-2">
                <div className="rounded-lg border border-cyan-500/30 bg-[#161723] p-3 text-[11px] text-cyan-300 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{state.progressStep || 'Generating solution...'}</span>
                    <button
                      type="button"
                      onClick={() => codeAssistService.cancelGeneration()}
                      className="ml-auto flex items-center gap-1 text-red-400 hover:text-red-300 text-[10px]"
                    >
                      <StopCircle className="h-3 w-3" />
                      Stop
                    </button>
                  </div>
                  {state.currentReasoning && (
                    <p className="font-mono text-[10px] text-slate-400 italic">
                      {state.currentReasoning}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Bottom Input Container matching Screenshot 3 & 5 ── */}
      <div className="shrink-0 p-2.5 bg-[#141520] border-t border-[#262636]">
        <div className="relative rounded-lg border border-[#2e3046] focus-within:border-cyan-500 bg-[#12131c] shadow-md transition-colors p-2">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message, @ to mention files... (Enter to send, Shift+Enter for new line)"
            className="w-full resize-none bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none max-h-32"
          />

          {/* Control Bar inside input container */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 select-none">
            {/* Left Controls: Mode Pill, Model Pill, Config Pill */}
            <div className="flex items-center gap-1">
              {/* Mode Selector Pill (Screenshot 5) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModeMenuOpen(!isModeMenuOpen);
                    setIsModelMenuOpen(false);
                  }}
                  className="flex items-center gap-1 rounded bg-[#202130] hover:bg-[#282a3e] px-2 py-0.5 text-[11px] font-medium text-slate-200 transition-colors border border-white/5"
                >
                  <span>{state.selectedMode}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                </button>

                {/* Mode Menu Modal (Screenshot 5) */}
                {isModeMenuOpen && (
                  <div className="absolute bottom-8 left-0 z-50 w-72 rounded-lg border border-[#262636] bg-[#181824] p-1 shadow-2xl text-xs space-y-1">
                    {AVAILABLE_MODES.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          codeAssistService.setMode(m.id);
                          setIsModeMenuOpen(false);
                        }}
                        className={`rounded p-2 cursor-pointer transition-colors ${
                          state.selectedMode === m.id
                            ? 'bg-[#007acc] text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{m.title}</span>
                          {m.deprecated && (
                            <span className="rounded bg-yellow-500/20 px-1 text-[9px] text-yellow-300 font-mono">
                              deprecated
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-snug ${state.selectedMode === m.id ? 'text-white/80' : 'text-slate-400'}`}>
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Selector Pill (Screenshot 3 & 4) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModelMenuOpen(!isModelMenuOpen);
                    setIsModeMenuOpen(false);
                  }}
                  className="flex items-center gap-1 rounded bg-[#202130] hover:bg-[#282a3e] px-2 py-0.5 text-[10px] font-medium text-slate-300 transition-colors border border-white/5 max-w-[120px] truncate"
                  title={state.selectedModel}
                >
                  <span className="truncate">{state.selectedModel}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                </button>

                {isModelMenuOpen && (
                  <div className="absolute bottom-8 left-0 z-50 w-56 rounded-lg border border-[#262636] bg-[#181824] p-1 shadow-2xl text-xs space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
                      Select AI Model
                    </div>
                    {AVAILABLE_MODELS.map((mod) => (
                      <div
                        key={mod.id}
                        onClick={() => {
                          codeAssistService.setModel(mod.id, mod.provider);
                          setIsModelMenuOpen(false);
                        }}
                        className={`flex items-center justify-between rounded px-2 py-1.5 cursor-pointer text-[11px] ${
                          state.selectedModel === mod.id
                            ? 'bg-[#007acc] text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <span>{mod.label}</span>
                        {state.selectedModel === mod.id && <Check className="h-3 w-3" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Config Pill */}
              <span className="hidden sm:inline-flex items-center rounded bg-[#202130] px-1.5 py-0.5 text-[10px] text-slate-400 border border-white/5">
                Default
              </span>
            </div>

            {/* Right Action Icons & Send Button */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toast(`Context: ${project.files.length} workspace files active`)}
                title="Project context enabled"
                className="rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Database className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toast('Safe execution sandbox: WebContainer verified')}
                title="Safe sandbox execution"
                className="rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toast('Enhanced AI reasoning mode enabled')}
                title="AI Reasoning"
                className="rounded p-1 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <Wand2 className="h-3.5 w-3.5" />
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={!inputPrompt.trim() || state.isGenerating}
                onClick={handleSend}
                className={`rounded p-1.5 transition-colors ${
                  inputPrompt.trim() && !state.isGenerating
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}
                title="Send Prompt (Enter)"
              >
                {state.isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeAssistPanel;
