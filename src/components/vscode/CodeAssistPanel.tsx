/**
 * GB Assist Interactive AI Coding Assistant Panel (Phase 3A).
 *
 * Features:
 * - Real BYOK model provider selection (Gemini, OpenRouter, OpenAI, Custom, Mock).
 * - Live chunked streaming with stop generation control.
 * - Project-aware context: active file chip, attached files chip picker, @ file mentions.
 * - Token budget meter.
 * - Structured edit proposals with Monaco Diff side-by-side inspection.
 * - Per-file Apply/Reject and Apply All with automatic rollback checkpoint.
 * - Project-scoped conversation history.
 */

import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback } from 'react';
import {
  Columns,
  Search,
  ChevronDown,
  ChevronRight,
  Send,
  MessageSquare,
  X,
  Check,
  Loader2,
  StopCircle,
  Brain,
  Sliders,
  FileCode,
  Plus,
  FileText,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MultiFileProject } from '../../types/files';
import {
  CodeAssistMode,
  ProposedFileEdit,
} from '../../services/ai/types';
import { assistAgentService } from '../../services/ai/assistAgentService';
import { providerRegistry } from '../../services/ai/providerRegistry';
import { ContextBuilder } from '../../services/ai/contextBuilder';
import { AiProviderSettingsModal } from './AiProviderSettingsModal';
import { AiMonacoDiffModal } from './AiMonacoDiffModal';

interface CodeAssistPanelProps {
  project: MultiFileProject;
  activePath?: string | null;
  isEditorDirty?: (path: string) => boolean;
  onApplyFiles?: (files: Array<{ path: string; content: string }>) => void;
  onClose?: () => void;
}

const subscribeAssist = (onChange: () => void) => assistAgentService.subscribe(onChange);
const getAssistSnapshot = () => assistAgentService.getState();

const AVAILABLE_MODES: Array<{ id: CodeAssistMode; title: string; desc: string }> = [
  {
    id: 'Code',
    title: 'Code',
    desc: 'Full assistance: writes code, proposes diffs, and solves bugs.',
  },
  {
    id: 'Ask',
    title: 'Ask',
    desc: 'Q&A mode: explains code and architecture without proposing edits.',
  },
  {
    id: 'Debug',
    title: 'Debug',
    desc: 'Systematic debugging: traces errors and fixes edge cases.',
  },
  {
    id: 'Plan',
    title: 'Plan',
    desc: 'High-level planning: designs architecture steps and checklists.',
  },
];

export const CodeAssistPanel: React.FC<CodeAssistPanelProps> = ({
  project,
  activePath,
  isEditorDirty,
  onApplyFiles,
  onClose,
}) => {
  const state = useSyncExternalStore(subscribeAssist, getAssistSnapshot, getAssistSnapshot);

  // Sync active project into assistAgentService
  useEffect(() => {
    if (project?.id) {
      assistAgentService.setProject(project.id);
    }
  }, [project?.id]);

  const activeSession = assistAgentService.getActiveSession();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [diffModalState, setDiffModalState] = useState<{
    isOpen: boolean;
    proposals: ProposedFileEdit[];
    messageId: string;
    fileIndex: number;
  }>({
    isOpen: false,
    proposals: [],
    messageId: '',
    fileIndex: 0,
  });

  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [showHistoryView, setShowHistoryView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, state.isGenerating, state.currentStreamContent, scrollToBottom]);

  // Handle Send Prompt
  const handleSend = async () => {
    if (!inputPrompt.trim() || state.isGenerating) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    await assistAgentService.submitPrompt(promptToSend, project, activePath);
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

  // Apply a single proposed file edit
  const handleApplySingleEdit = async (messageId: string, editId: string) => {
    const res = await assistAgentService.applyEdit(messageId, editId, {
      project,
      isEditorDirty,
      onChangeFile: (path, content) => {
        if (onApplyFiles) onApplyFiles([{ path, content }]);
      },
      onCreateFile: (path, content) => {
        if (onApplyFiles) onApplyFiles([{ path, content }]);
      },
    });

    if (res.success) {
      toast.success('Changes applied to workspace');
    } else {
      toast.error(`Failed to apply edit: ${res.error}`);
    }
  };

  // Reject a single proposed file edit
  const handleRejectSingleEdit = (messageId: string, editId: string) => {
    assistAgentService.rejectEdit(messageId, editId);
    toast('Edit proposal rejected');
  };

  // Apply all pending proposed edits for a message
  const handleApplyAllForMessage = async (messageId: string, edits: ProposedFileEdit[]) => {
    const pending = edits.filter((e) => e.status === 'pending');
    for (const edit of pending) {
      await handleApplySingleEdit(messageId, edit.id);
    }
    toast.success(`Applied ${pending.length} file change(s) to workspace`);
  };

  // Context summary calculations
  const assembledContext = ContextBuilder.assembleContext(
    project,
    activePath,
    state.attachedContextPaths,
    inputPrompt
  );

  const availableModels = providerRegistry.getModelsForProvider(state.selectedProvider);
  const currentProviderObj = providerRegistry.getProvider(state.selectedProvider);

  return (
    <div
      className="flex h-full w-full flex-col bg-[#12131c] text-slate-200 select-none overflow-hidden text-xs"
      data-testid="code-assist-panel"
    >
      {/* ── Top Header Strip ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#262636] bg-[#181824] px-3 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-mono text-[11px] text-slate-300">
            {activeSession?.title || 'New session'}
          </span>
          <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[10px] text-cyan-400 font-mono shrink-0">
            {currentProviderObj.name.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {/* Provider BYOK Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            data-testid="open-ai-settings-btn"
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
            title="Configure BYOK Model Providers & API Keys"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
          </button>

          {/* New Session Button */}
          <button
            type="button"
            onClick={() => assistAgentService.createNewSession()}
            data-testid="new-assist-session-btn"
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
            title="New Conversation Session"
          >
            <Columns className="h-3.5 w-3.5" />
          </button>

          {/* Search / Session History */}
          <button
            type="button"
            onClick={() => setShowHistoryView(!showHistoryView)}
            data-testid="assist-history-btn"
            className="rounded p-1 hover:bg-white/10 hover:text-white transition-colors"
            title="Sessions History"
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

      {/* ── Context & Token Meter Strip ── */}
      <div className="border-b border-[#262636] bg-[#151622] px-3 py-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block h-2 w-1 bg-cyan-400 rounded-sm" />
            <span className="text-slate-300 font-semibold truncate">
              {assembledContext.files.length} file(s) in context
            </span>
            <span className="text-slate-500">
              (~{(assembledContext.totalEstimatedTokens / 1000).toFixed(1)}k tokens)
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsContextPickerOpen(!isContextPickerOpen)}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <Plus className="h-3 w-3" />
              <span>Context</span>
            </button>
          </div>
        </div>

        {/* Active Context Chips */}
        {assembledContext.files.length > 0 && (
          <div className="flex items-center gap-1 pt-1 overflow-x-auto pb-0.5">
            {assembledContext.files.map((cf) => {
              const isAttached = state.attachedContextPaths.includes(cf.path);
              const isActive = cf.path === activePath;

              return (
                <div
                  key={cf.path}
                  className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono shrink-0 border ${
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                  title={`${cf.path} (${cf.linesCount} lines, ${cf.charCount} chars)`}
                >
                  <FileText className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[100px]">{cf.path.split('/').pop()}</span>
                  {isActive && <span className="text-[8px] opacity-75">(active)</span>}
                  {isAttached && (
                    <button
                      type="button"
                      onClick={() => assistAgentService.toggleAttachedContextPath(cf.path)}
                      className="hover:text-red-400 ml-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* File Picker Dropdown (when +Context is clicked) */}
        {isContextPickerOpen && (
          <div className="mt-2 rounded-lg border border-[#2e3046] bg-[#18192c] p-2 space-y-1 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase">
              <span>Attach File to Context</span>
              <button
                type="button"
                onClick={() => setIsContextPickerOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            {project.files.map((f) => {
              const isSelected = state.attachedContextPaths.includes(f.path) || f.path === activePath;
              return (
                <div
                  key={f.path}
                  onClick={() => {
                    assistAgentService.toggleAttachedContextPath(f.path);
                  }}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-[10px] font-mono transition-colors ${
                    isSelected ? 'bg-cyan-500/10 text-cyan-300' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className="truncate">{f.path}</span>
                  {isSelected && <Check className="h-3 w-3 text-cyan-400" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Main Chat Scroll Body ── */}
      <div
        className="min-h-0 flex-1 overflow-y-auto p-3 space-y-4"
        data-testid="code-assist-chat-body"
      >
        {/* Sessions History View */}
        {showHistoryView ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Conversations History</span>
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
                  assistAgentService.switchSession(sess.id);
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
                    {sess.messages.length} message(s) • {new Date(sess.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    assistAgentService.deleteSession(sess.id);
                  }}
                  className="p-1 text-slate-600 hover:text-red-400"
                  title="Delete conversation"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : activeSession?.messages.length === 0 && !state.isGenerating ? (
          /* Empty Initial State */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eab308] text-black shadow-lg shadow-yellow-500/10">
              <div className="font-mono text-xl font-black tracking-tighter leading-tight">
                GB<br />AI
              </div>
            </div>

            <div className="max-w-xs space-y-1">
              <p className="text-xs font-semibold text-slate-200">
                GB Assist AI Pair Programmer
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your model provider (Gemini, OpenRouter, OpenAI) to chat, inspect your project, and propose safe code edits with Monaco diff review.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="w-full max-w-xs space-y-1.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 bg-[#181824] py-1.5 text-[11px] text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Sliders className="h-3 w-3 text-cyan-400" />
                Configure BYOK Model Provider
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputPrompt('Explain the project structure and suggest improvements');
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-cyan-500/40 bg-cyan-500/5 py-1.5 text-[11px] text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                "Explain the project structure..."
              </button>
            </div>
          </div>
        ) : (
          /* Messages List */
          <>
            {activeSession?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isReasoningOpen = expandedReasoning[msg.id] ?? true;

              return (
                <div key={msg.id} className="space-y-2">
                  {isUser ? (
                    /* User Bubble */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#232431] border border-white/10 px-3.5 py-2 text-white shadow-sm text-xs leading-relaxed space-y-1">
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                        {msg.contextFiles && msg.contextFiles.length > 0 && (
                          <div className="text-[9px] text-slate-400 pt-1 border-t border-white/5 flex items-center gap-1">
                            <FileText className="h-2.5 w-2.5" />
                            <span>Included: {msg.contextFiles.map((c) => c.path.split('/').pop()).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Response */
                    <div className="space-y-2.5">
                      {/* Reasoning Accordion */}
                      {msg.reasoning && (
                        <div className="rounded-lg border border-white/5 bg-[#161723] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleReasoning(msg.id)}
                            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 select-none"
                          >
                            <Brain className="h-3 w-3 text-cyan-400" />
                            <span>Thinking Process</span>
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

                      {/* Main Message Content */}
                      <div className="rounded-lg bg-[#181824]/60 p-3 text-slate-200 text-xs leading-relaxed border border-white/5 space-y-2.5">
                        <div className="whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.content}
                        </div>

                        {/* Structured Edit Proposals Card */}
                        {msg.proposedEdits && msg.proposedEdits.length > 0 && (
                          <div className="mt-3 rounded-lg border border-[#2e3046] bg-[#12131c] p-3 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                                <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Proposed File Changes ({msg.proposedEdits.length})</span>
                              </div>
                              {msg.proposedEdits.some((e) => e.status === 'pending') && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyAllForMessage(msg.id, msg.proposedEdits!)}
                                  data-testid="apply-all-proposals-btn"
                                  className="rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold transition-colors"
                                >
                                  Apply All
                                </button>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {msg.proposedEdits.map((edit, idx) => {
                                const isApplied = edit.status === 'applied';
                                const isRejected = edit.status === 'rejected';

                                return (
                                  <div
                                    key={edit.id}
                                    className="flex items-center justify-between rounded bg-[#18192c] border border-white/5 p-2 text-[11px]"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono text-slate-200 truncate max-w-[140px]" title={edit.path}>
                                        {edit.path}
                                      </span>
                                      <span className="text-[9px] font-mono font-bold text-emerald-400">+{edit.addedLines}</span>
                                      <span className="text-[9px] font-mono font-bold text-red-400">-{edit.removedLines}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* Review Diff Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDiffModalState({
                                            isOpen: true,
                                            proposals: msg.proposedEdits!,
                                            messageId: msg.id,
                                            fileIndex: idx,
                                          });
                                        }}
                                        data-testid="review-diff-btn"
                                        className="rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[10px] text-cyan-300 border border-white/10 transition-colors"
                                      >
                                        Review Diff
                                      </button>

                                      {/* Per-File Apply / Status */}
                                      {isApplied ? (
                                        <span className="flex items-center gap-0.5 text-emerald-400 font-semibold text-[10px]">
                                          <Check className="h-3 w-3" /> Applied
                                        </span>
                                      ) : isRejected ? (
                                        <span className="text-slate-500 text-[10px]">Rejected</span>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleRejectSingleEdit(msg.id, edit.id)}
                                            className="rounded hover:bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
                                          >
                                            Reject
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleApplySingleEdit(msg.id, edit.id)}
                                            data-testid="apply-single-edit-btn"
                                            className="rounded bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-semibold transition-colors shadow"
                                          >
                                            Apply
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Model / Provider Stamp */}
                        {msg.modelId && (
                          <div className="pt-1 text-[9px] text-slate-500 font-mono flex items-center justify-between">
                            <span>via {msg.modelId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                toast.success('Response copied to clipboard');
                              }}
                              className="hover:text-slate-300 flex items-center gap-1"
                            >
                              <Copy className="h-2.5 w-2.5" /> Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Flight Streaming Bubble */}
            {state.isGenerating && (
              <div className="space-y-2">
                {/* Live Reasoning */}
                {state.currentReasoning && (
                  <div className="rounded-lg border border-white/5 bg-[#161723] p-2 text-[11px] font-mono text-slate-400 italic">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-sans not-italic mb-1 text-[10px] font-semibold">
                      <Brain className="h-3 w-3" /> Thinking...
                    </div>
                    {state.currentReasoning}
                  </div>
                )}

                {/* Live Streaming Content */}
                <div className="rounded-lg border border-cyan-500/40 bg-[#161723] p-3 text-xs text-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-cyan-300 pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{state.progressStep || 'Generating...'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => assistAgentService.cancelGeneration()}
                      data-testid="stop-generation-btn"
                      className="flex items-center gap-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-500/30 transition-colors"
                    >
                      <StopCircle className="h-3 w-3" /> Stop
                    </button>
                  </div>

                  <div className="whitespace-pre-wrap font-sans min-h-[24px]">
                    {state.currentStreamContent || '...'}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Bottom Input Container ── */}
      <div className="shrink-0 p-2.5 bg-[#141520] border-t border-[#262636]">
        <div className="relative rounded-lg border border-[#2e3046] focus-within:border-cyan-500 bg-[#12131c] shadow-md transition-colors p-2">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask GB Assist, type @ to mention files... (Enter to send, Shift+Enter for new line)"
            data-testid="ai-prompt-input"
            className="w-full resize-none bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none max-h-32"
          />

          {/* Control Bar inside input container */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 select-none">
            {/* Left Controls: Mode Pill & Model Selector */}
            <div className="flex items-center gap-1">
              {/* Mode Selector Pill */}
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

                {isModeMenuOpen && (
                  <div className="absolute bottom-8 left-0 z-50 w-64 rounded-lg border border-[#262636] bg-[#181824] p-1 shadow-2xl text-xs space-y-1">
                    {AVAILABLE_MODES.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          assistAgentService.setMode(m.id);
                          setIsModeMenuOpen(false);
                        }}
                        className={`rounded p-2 cursor-pointer transition-colors ${
                          state.selectedMode === m.id
                            ? 'bg-[#007acc] text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold">{m.title}</div>
                        <p className={`text-[10px] mt-0.5 leading-snug ${state.selectedMode === m.id ? 'text-white/80' : 'text-slate-400'}`}>
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModelMenuOpen(!isModelMenuOpen);
                    setIsModeMenuOpen(false);
                  }}
                  data-testid="ai-model-selector-pill"
                  className="flex items-center gap-1 rounded bg-[#202130] hover:bg-[#282a3e] px-2 py-0.5 text-[10px] font-medium text-slate-300 transition-colors border border-white/5 max-w-[130px] truncate"
                  title={state.selectedModel}
                >
                  <span className="truncate">{state.selectedModel.split('/').pop()}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                </button>

                {isModelMenuOpen && (
                  <div className="absolute bottom-8 left-0 z-50 w-64 rounded-lg border border-[#262636] bg-[#181824] p-1 shadow-2xl text-xs space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Available Models</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModelMenuOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="text-cyan-400 hover:underline"
                      >
                        Settings
                      </button>
                    </div>
                    {availableModels.map((mod) => (
                      <div
                        key={mod.id}
                        onClick={() => {
                          assistAgentService.setModel(mod.id);
                          setIsModelMenuOpen(false);
                        }}
                        className={`flex items-center justify-between rounded px-2 py-1.5 cursor-pointer text-[11px] ${
                          state.selectedModel === mod.id
                            ? 'bg-[#007acc] text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{mod.name}</span>
                        {state.selectedModel === mod.id && <Check className="h-3 w-3 shrink-0 ml-1" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Icons & Send Button */}
            <div className="flex items-center gap-1">
              {/* Send / Stop Button */}
              {state.isGenerating ? (
                <button
                  type="button"
                  onClick={() => assistAgentService.cancelGeneration()}
                  className="rounded p-1.5 bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 transition-colors"
                  title="Stop generation"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputPrompt.trim()}
                  onClick={handleSend}
                  data-testid="send-ai-prompt-btn"
                  className={`rounded p-1.5 transition-colors ${
                    inputPrompt.trim()
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'
                  }`}
                  title="Send Prompt (Enter)"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BYOK Provider Settings Modal ── */}
      <AiProviderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* ── Monaco Diff Preview Modal ── */}
      <AiMonacoDiffModal
        isOpen={diffModalState.isOpen}
        onClose={() => setDiffModalState((prev) => ({ ...prev, isOpen: false }))}
        proposals={diffModalState.proposals}
        initialFileIndex={diffModalState.fileIndex}
        onApplyProposal={(editId) => handleApplySingleEdit(diffModalState.messageId, editId)}
        onRejectProposal={(editId) => handleRejectSingleEdit(diffModalState.messageId, editId)}
        onApplyAll={() => handleApplyAllForMessage(diffModalState.messageId, diffModalState.proposals)}
      />
    </div>
  );
};

export default CodeAssistPanel;
