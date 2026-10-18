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
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MultiFileProject } from '../../types/files';
import {
  CodeAssistMode,
  ProposedFileEdit,
} from '../../services/ai/types';
import { assistAgentService } from '../../services/ai/assistAgentService';
import { providerRegistry } from '../../services/ai/providerRegistry';
import { ContextBuilder, isSensitiveFilePath } from '../../services/ai/contextBuilder';
import { AiProviderSettingsModal } from './AiProviderSettingsModal';
import { AiMonacoDiffModal } from './AiMonacoDiffModal';

interface CodeAssistPanelProps {
  project: MultiFileProject;
  projectId?: string;
  activePath?: string | null;
  isEditorDirty?: (path: string) => boolean;
  onApplyFiles?: (files: Array<{ path: string; content: string }>) => void;
  onClose?: () => void;
}

const subscribeAssist = (onChange: () => void) => assistAgentService.subscribe(onChange);
const getAssistSnapshot = () => assistAgentService.getState();

const AVAILABLE_MODES: Array<{ id: CodeAssistMode; title: string; desc: string }> = [
  {
    id: 'Agent',
    title: 'Agent',
    desc: 'Autonomous coding agent: plans, modifies files, runs approved commands, and self-corrects.',
  },
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
  projectId,
  activePath,
  isEditorDirty,
  onApplyFiles,
  onClose,
}) => {
  const state = useSyncExternalStore(subscribeAssist, getAssistSnapshot, getAssistSnapshot);

  // Sync active project into assistAgentService
  useEffect(() => {
    const effectiveId = projectId || (project as { id?: string })?.id;
    if (effectiveId) {
      assistAgentService.setProject(effectiveId);
    }
  }, [projectId, project]);

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
    await assistAgentService.submitPrompt(promptToSend, project, activePath, {
      onChangeFile: (p, c) => onApplyFiles?.([{ path: p, content: c }]),
      onCreateFile: (p, c) => onApplyFiles?.([{ path: p, content: c }]),
      isEditorDirty,
    });
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
  const handleApplySingleEdit = async (messageId: string, editId: string): Promise<boolean> => {
    const effectiveId = projectId || (project as { id?: string })?.id;
    const res = await assistAgentService.applyEdit(messageId, editId, {
      project,
      projectId: effectiveId,
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
      return true;
    } else {
      toast.error(`Failed to apply edit: ${res.error}`, { duration: 5000 });
      return false;
    }
  };

  // Reject a single proposed file edit
  const handleRejectSingleEdit = (messageId: string, editId: string) => {
    assistAgentService.rejectEdit(messageId, editId);
    toast('Edit proposal rejected');
  };

  // Apply all pending proposed edits for a message with partial failure tracking
  const handleApplyAllForMessage = async (messageId: string, edits: ProposedFileEdit[]) => {
    const pending = edits.filter((e) => e.status === 'pending');
    let appliedCount = 0;
    let failedCount = 0;

    for (const edit of pending) {
      const ok = await handleApplySingleEdit(messageId, edit.id);
      if (ok) appliedCount++;
      else failedCount++;
    }

    if (appliedCount > 0 && failedCount === 0) {
      toast.success(`Applied ${appliedCount} file change(s) to workspace`);
    } else if (appliedCount > 0 && failedCount > 0) {
      toast(`Applied ${appliedCount} change(s), ${failedCount} failed. Check errors.`, { icon: '⚠️' });
    }
  };

  // Tool Execution Handlers (Phase 3B)
  const [expandedToolOutputs, setExpandedToolOutputs] = useState<Record<string, boolean>>({});

  const toggleToolOutput = (toolCallId: string) => {
    setExpandedToolOutputs((prev) => ({
      ...prev,
      [toolCallId]: !prev[toolCallId],
    }));
  };

  const handleApproveTool = async (messageId: string, toolCallId: string) => {
    const effectiveId = projectId || (project as { id?: string })?.id;

    // Check if autonomous agent has a pending approval for this tool
    const agentTask = assistAgentService.getAgentTaskState();
    if (agentTask?.pendingApproval && agentTask.pendingApproval.toolCall.id === toolCallId) {
      assistAgentService.approveAgentAction(agentTask.pendingApproval.id);
      toast.success('Agent action approved');
      return;
    }

    const res = await assistAgentService.approveToolCall(messageId, toolCallId, {
      project,
      projectId: effectiveId,
      activePath,
    });
    if (res.success) {
      toast.success('Tool executed successfully');
    } else {
      toast.error(`Tool execution failed: ${res.error}`);
    }
  };

  const handleDenyTool = (messageId: string, toolCallId: string) => {
    const agentTask = assistAgentService.getAgentTaskState();
    if (agentTask?.pendingApproval && agentTask.pendingApproval.toolCall.id === toolCallId) {
      assistAgentService.denyAgentAction(agentTask.pendingApproval.id, 'Denied by user');
      toast('Agent action denied');
      return;
    }

    assistAgentService.denyToolCall(messageId, toolCallId);
    toast('Tool execution denied');
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
            {assembledContext.excludedSensitiveFiles && assembledContext.excludedSensitiveFiles.length > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 text-[9px] text-amber-400 font-sans"
                title={`Protected secret files excluded from context: ${assembledContext.excludedSensitiveFiles.join(', ')}`}
              >
                <ShieldAlert className="h-2.5 w-2.5" />
                {assembledContext.excludedSensitiveFiles.length} protected
              </span>
            )}
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
              const isSensitive = isSensitiveFilePath(f.path);
              const isSelected = state.attachedContextPaths.includes(f.path) || f.path === activePath;

              if (isSensitive) {
                return (
                  <div
                    key={f.path}
                    className="flex items-center justify-between px-2 py-1 rounded text-[10px] font-mono text-slate-500 bg-red-950/20 cursor-not-allowed opacity-60"
                    title="Protected secret file: excluded from AI context for security"
                  >
                    <span className="truncate line-through">{f.path}</span>
                    <span className="text-[8px] text-amber-500/80 uppercase font-sans">Protected</span>
                  </div>
                );
              }

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

                        {/* Autonomous Task Plan & Progress Card (Phase 3C) */}
                        {(msg.agentTaskState?.plan || msg.plan) && (
                          <div
                            className="mt-3 rounded-lg border border-[#2e3046] bg-[#12131c] p-3 space-y-2.5"
                            data-testid="agent-plan-card"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                                <Brain className="h-3.5 w-3.5 text-indigo-400" />
                                <span>{(msg.agentTaskState?.plan || msg.plan)?.title}</span>
                              </div>
                              {msg.agentTaskState?.status && (
                                <span
                                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold ${
                                    msg.agentTaskState.status === 'completed'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : msg.agentTaskState.status === 'failed'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : msg.agentTaskState.status === 'cancelled'
                                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                                      : msg.agentTaskState.status === 'awaiting_approval'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  }`}
                                  data-testid="agent-status-badge"
                                >
                                  {msg.agentTaskState.status}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {(msg.agentTaskState?.plan || msg.plan)?.steps.map((st) => (
                                <div
                                  key={st.id}
                                  className="flex items-start gap-2 text-[11px] text-slate-300 p-1.5 rounded bg-white/[0.02]"
                                >
                                  <div className="mt-0.5">
                                    {st.status === 'completed' && <Check className="h-3 w-3 text-emerald-400" />}
                                    {st.status === 'running' && <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />}
                                    {st.status === 'failed' && <X className="h-3 w-3 text-rose-400" />}
                                    {st.status === 'pending' && <span className="h-2 w-2 rounded-full border border-slate-600 block mt-0.5" />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-200">{st.title}</div>
                                    <div className="text-[10px] text-slate-400">{st.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {msg.agentTaskState?.status === 'completed' && msg.agentTaskState.finalSummary && (
                              <div
                                className="mt-2 rounded bg-emerald-950/30 border border-emerald-500/30 p-2 text-[11px] text-emerald-300 space-y-1"
                                data-testid="agent-completed-summary"
                              >
                                <div className="flex items-center gap-1 font-semibold">
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Task Verified & Completed</span>
                                </div>
                                <div className="text-[10px] text-emerald-200/80 whitespace-pre-wrap">
                                  {msg.agentTaskState.finalSummary}
                                </div>
                              </div>
                            )}

                            {msg.agentTaskState?.status === 'failed' && (
                              <div className="pt-2 border-t border-white/5 flex justify-end">
                                <button
                                  type="button"
                                  data-testid="retry-agent-task-btn"
                                  onClick={() => {
                                    const effectiveId = projectId || (project as { id?: string })?.id;
                                    assistAgentService.retryAgentTask({
                                      project,
                                      projectId: effectiveId,
                                      activePath,
                                      onChangeFile: (p, c) => onApplyFiles?.([{ path: p, content: c }]),
                                      onCreateFile: (p, c) => onApplyFiles?.([{ path: p, content: c }]),
                                      isEditorDirty,
                                    });
                                  }}
                                  className="rounded bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-[10px] font-semibold transition-colors shadow"
                                >
                                  Retry Task
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tool Executions Card (Phase 3B) */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div
                            className="mt-3 rounded-lg border border-[#2e3046] bg-[#12131c] p-3 space-y-2.5"
                            data-testid="tool-executions-container"
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Agent Tools ({msg.toolCalls.length})</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {msg.toolCalls.map((tc) => {
                                const isOutputOpen =
                                  expandedToolOutputs[tc.id] ??
                                  (tc.status === 'completed' || tc.status === 'failed');
                                const isTerminal = tc.permission === 'terminal';
                                const isPending = tc.status === 'pending_approval';
                                const isRunning = tc.status === 'running';
                                const isCompleted = tc.status === 'completed';
                                const isFailed = tc.status === 'failed';
                                const isDenied = tc.status === 'denied';

                                const argsObj = (tc.args || {}) as Record<string, unknown>;

                                return (
                                  <div
                                    key={tc.id}
                                    data-testid={`tool-card-${tc.id}`}
                                    className="rounded bg-[#18192c] border border-white/5 p-2.5 text-[11px] space-y-2"
                                  >
                                    {/* Tool Header: Name, Risk, Status */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-mono font-semibold text-cyan-300 truncate">
                                          {tc.toolName}
                                        </span>
                                        <span
                                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-semibold ${
                                            tc.riskLevel === 'high'
                                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                              : tc.riskLevel === 'moderate'
                                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          }`}
                                        >
                                          {tc.riskLevel}
                                        </span>
                                      </div>

                                      {/* Status Pill */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        {isPending && (
                                          <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                                            <ShieldAlert className="h-3 w-3" /> Awaiting Approval
                                          </span>
                                        )}
                                        {isRunning && (
                                          <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded font-medium">
                                            <Loader2 className="h-3 w-3 animate-spin" /> Running
                                          </span>
                                        )}
                                        {isCompleted && (
                                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                            <Check className="h-3 w-3" /> Completed {tc.durationMs ? `(${tc.durationMs}ms)` : ''}
                                          </span>
                                        )}
                                        {isFailed && (
                                          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                                            <X className="h-3 w-3" /> Failed
                                          </span>
                                        )}
                                        {isDenied && (
                                          <span className="text-[10px] text-slate-500 italic">
                                            Denied by user
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Tool Explanation / Command / Args Details */}
                                    {tc.explanation && (
                                      <div className="text-[10px] text-slate-400 italic">
                                        {tc.explanation}
                                      </div>
                                    )}

                                    {isTerminal && tc.command && (
                                      <div className="rounded bg-black/50 p-1.5 font-mono text-[10px] text-cyan-300 flex items-center justify-between">
                                        <span>
                                          $ {tc.command} {Array.isArray(argsObj.args) ? argsObj.args.join(' ') : ''}
                                        </span>
                                        {tc.cwd && <span className="text-slate-500 text-[9px]">cwd: {tc.cwd}</span>}
                                      </div>
                                    )}

                                    {!isTerminal && tc.args && (
                                      <div className="text-[10px] font-mono text-slate-400 truncate">
                                        {argsObj.path
                                          ? `path: ${String(argsObj.path)}`
                                          : argsObj.query
                                          ? `query: ${String(argsObj.query)}`
                                          : argsObj.pattern
                                          ? `pattern: ${String(argsObj.pattern)}`
                                          : JSON.stringify(tc.args)}
                                      </div>
                                    )}

                                    {/* Approval Action Buttons */}
                                    {isPending && (
                                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                                        <button
                                          type="button"
                                          data-testid="deny-tool-btn"
                                          onClick={() => handleDenyTool(msg.id, tc.id)}
                                          className="rounded border border-white/10 hover:bg-white/10 px-2 py-0.5 text-[10px] text-slate-400 hover:text-white transition-colors"
                                        >
                                          Deny
                                        </button>
                                        <button
                                          type="button"
                                          data-testid="approve-tool-btn"
                                          onClick={() => handleApproveTool(msg.id, tc.id)}
                                          className="rounded bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-semibold transition-colors shadow flex items-center gap-1"
                                        >
                                          <Check className="h-3 w-3" /> Approve & Run
                                        </button>
                                      </div>
                                    )}

                                    {/* Output Toggle & Viewer */}
                                    {(tc.stdout || tc.stderr || tc.result || tc.error || tc.exitCode !== undefined) && (
                                      <div className="pt-1 border-t border-white/5">
                                        <button
                                          type="button"
                                          onClick={() => toggleToolOutput(tc.id)}
                                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200"
                                        >
                                          {isOutputOpen ? (
                                            <ChevronDown className="h-2.5 w-2.5" />
                                          ) : (
                                            <ChevronRight className="h-2.5 w-2.5" />
                                          )}
                                          <span>{isTerminal ? 'Terminal Output' : 'Output Result'}</span>
                                          {tc.exitCode !== undefined && (
                                            <span
                                              className={`ml-auto font-mono ${
                                                tc.exitCode === 0 ? 'text-emerald-400' : 'text-amber-400'
                                              }`}
                                            >
                                              exit code: {tc.exitCode}
                                            </span>
                                          )}
                                        </button>

                                        {isOutputOpen && (
                                          <div className="mt-1.5 space-y-1">
                                            {tc.stdout && (
                                              <pre className="max-h-36 overflow-auto rounded bg-black/60 p-2 font-mono text-[9px] text-slate-300 leading-tight whitespace-pre-wrap">
                                                {tc.stdout}
                                              </pre>
                                            )}
                                            {tc.stderr && (
                                              <pre className="max-h-36 overflow-auto rounded bg-rose-950/20 border border-rose-500/20 p-2 font-mono text-[9px] text-rose-300 leading-tight whitespace-pre-wrap">
                                                {tc.stderr}
                                              </pre>
                                            )}
                                            {!tc.stdout && !tc.stderr && tc.result && (
                                              <pre className="max-h-36 overflow-auto rounded bg-black/60 p-2 font-mono text-[9px] text-slate-300 leading-tight whitespace-pre-wrap">
                                                {typeof tc.result === 'string'
                                                  ? tc.result
                                                  : JSON.stringify(tc.result, null, 2)}
                                              </pre>
                                            )}
                                            {tc.error && (
                                              <div className="rounded bg-rose-950/30 border border-rose-500/30 p-1.5 text-[10px] text-rose-300">
                                                {tc.error}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

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
                      onClick={() => {
                        assistAgentService.stopAgent();
                        assistAgentService.cancelGeneration();
                      }}
                      data-testid="stop-generation-btn"
                      className="flex items-center gap-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-500/30 transition-colors"
                    >
                      <StopCircle className="h-3 w-3" /> {state.selectedMode === 'Agent' ? 'Stop Agent' : 'Stop'}
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
                  data-testid="ai-mode-selector-pill"
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
                        data-testid={`mode-option-${m.id}`}
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
                  onClick={() => {
                    if (state.selectedMode === 'Agent') {
                      assistAgentService.stopAgent('User stopped agent');
                    } else {
                      assistAgentService.cancelGeneration();
                    }
                  }}
                  data-testid={state.selectedMode === 'Agent' ? 'stop-agent-btn' : 'cancel-input-btn'}
                  className="rounded p-1.5 bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 transition-colors"
                  title={state.selectedMode === 'Agent' ? 'Stop agent' : 'Stop generation'}
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
