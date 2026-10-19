/**
 * GB Assist Orchestration & Agent Service (Phase 3A Foundation).
 *
 * Coordinates:
 * - BYOK providers & streaming chat
 * - Project-aware context assembly
 * - Structured edit proposals
 * - Project-scoped conversation persistence
 * - Real-time state subscription for React UI
 */

import { MultiFileProject } from '../../types/files.ts';
import {
  AiProviderId,
  CodeAssistMode,
  CodeAssistMessage,
  CodeAssistSession,
  CodeAssistState,
  ProposedFileEdit,
} from './types.ts';
import { keyManager } from './keyManager.ts';
import { providerRegistry } from './providerRegistry.ts';
import { ContextBuilder, estimateTokens, DEFAULT_CONTEXT_BUDGET_TOKENS } from './contextBuilder.ts';
import { ContextBudget } from './contextBudget.ts';
import { EditProposalService } from './editProposalService.ts';
import { ConversationStore } from './conversationStore.ts';
import { ToolRegistry } from './tools/toolRegistry.ts';
import { ToolExecutor } from './tools/toolExecutor.ts';
import { ToolCallRecord } from './tools/types.ts';
import { agentEngine } from './agent/agentEngine.ts';

class AssistAgentService {
  private state: CodeAssistState;
  private generationId = 0;
  private listeners = new Set<() => void>();
  private abortController: AbortController | null = null;

  constructor() {
    this.state = this.createInitialState('default');
  }

  private createInitialState(projectId: string): CodeAssistState {
    const sessions = ConversationStore.loadSessions(projectId);
    const activeSessionId = sessions[0]?.id || `session-${Date.now()}`;

    // Prefer gemini by default if available, or openrouter/mock
    const defaultProvider: AiProviderId = keyManager.hasApiKey('gemini')
      ? 'gemini'
      : keyManager.hasApiKey('openrouter')
      ? 'openrouter'
      : 'mock';

    let selectedProvider = defaultProvider;
    try {
      const saved = localStorage.getItem('gb-assist-active-provider');
      if (saved && providerRegistry.getAllProviders().some((p) => p.id === saved)) selectedProvider = saved;
    } catch { /* optional non-secret preference */ }
    const defaultModel = providerRegistry.getActiveModel(selectedProvider);

    return {
      currentProjectId: projectId,
      sessions,
      activeSessionId,
      isGenerating: false,
      generatingSessionId: null,
      progressStep: '',
      currentReasoning: '',
      currentStreamContent: '',
      selectedMode: 'Code',
      selectedProvider,
      selectedModel: defaultModel,
      attachedContextPaths: [],
      tokenCount: {
        input: 0,
        output: 0,
        total: 0,
        max: 128000,
      },
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('[AssistAgentService] Listener error:', err);
      }
    });
  }

  public getState(): CodeAssistState {
    return this.state;
  }

  /**
   * Switches active project context, reloading sessions for that project.
   * Cancels any in-flight streaming from the previous project to prevent context leakage.
   */
  public setProject(projectId: string): void {
    if (!projectId) return;
    if (this.state.currentProjectId === projectId) return;

    agentEngine.setProject(projectId);

    // Abort active generation from previous project
    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch {}
      this.abortController = null;
    }

    this.generationId++;
    const sessions = ConversationStore.loadSessions(projectId);
    this.state = {
      ...this.state,
      currentProjectId: projectId,
      sessions,
      activeSessionId: sessions[0]?.id || `session-${Date.now()}`,
      isGenerating: false,
      generatingSessionId: null,
      progressStep: 'Ready',
      currentReasoning: '',
      currentStreamContent: '',
      attachedContextPaths: [],
    };
    this.notify();
  }

  public getActiveSession(): CodeAssistSession {
    return (
      this.state.sessions.find((s) => s.id === this.state.activeSessionId) ||
      this.state.sessions[0] ||
      ConversationStore.createDefaultSession(this.state.currentProjectId)
    );
  }

  public createNewSession(): string {
    this.cancelGeneration();
    this.clearAttachedContext();
    const newSession = ConversationStore.createNewSession(this.state.currentProjectId);
    this.state = {
      ...this.state,
      sessions: [newSession, ...this.state.sessions.filter((s) => s.id !== newSession.id)],
      activeSessionId: newSession.id,
      currentStreamContent: '',
      currentReasoning: '',
    };
    this.notify();
    return newSession.id;
  }

  public switchSession(sessionId: string): void {
    if (this.state.activeSessionId === sessionId) return;
    this.cancelGeneration();
    this.clearAttachedContext();
    this.state = {
      ...this.state,
      activeSessionId: sessionId,
      currentStreamContent: '',
      currentReasoning: '',
    };
    this.notify();
  }

  public deleteSession(sessionId: string): void {
    const updated = ConversationStore.deleteSession(this.state.currentProjectId, sessionId);
    this.state = {
      ...this.state,
      sessions: updated,
      activeSessionId:
        this.state.activeSessionId === sessionId ? updated[0].id : this.state.activeSessionId,
    };
    this.notify();
  }

  public setMode(mode: CodeAssistMode): void {
    this.state = { ...this.state, selectedMode: mode };
    this.notify();
  }

  public setProvider(providerId: AiProviderId, modelId?: string): void {
    this.cancelGeneration();
    agentEngine.stopAgent('Provider changed');
    const models = providerRegistry.getModelsForProvider(providerId);
    let resolvedModel = '';
    if (modelId && models.some((m) => m.id === modelId)) {
      resolvedModel = modelId;
    } else if (modelId && modelId.trim()) {
      resolvedModel = modelId.trim();
    } else if (models.length > 0) {
      resolvedModel = models[0].id;
    } else {
      resolvedModel = this.state.selectedModel;
    }

    providerRegistry.setActiveProvider(providerId);
    try { localStorage.setItem('gb-assist-active-provider', providerId); } catch { /* optional preference */ }
    if (resolvedModel) {
      providerRegistry.setActiveModel(providerId, resolvedModel);
    }

    this.state = {
      ...this.state,
      selectedProvider: providerId,
      selectedModel: resolvedModel,
    };
    this.notify();
  }

  public setModel(modelId: string, providerId?: AiProviderId): void {
    const trimmed = (modelId || '').trim();
    if (!trimmed) return;
    this.cancelGeneration();
    agentEngine.stopAgent('Model changed');
    const targetProvider = providerId || this.state.selectedProvider;
    providerRegistry.setActiveProvider(targetProvider);
    providerRegistry.setActiveModel(targetProvider, trimmed);

    this.state = {
      ...this.state,
      selectedModel: trimmed,
      selectedProvider: targetProvider,
    };
    this.notify();
  }

  public toggleAttachedContextPath(path: string): void {
    const current = this.state.attachedContextPaths;
    const exists = current.includes(path);
    const updated = exists ? current.filter((p) => p !== path) : [...current, path];
    this.state = { ...this.state, attachedContextPaths: updated };
    this.notify();
  }

  public clearAttachedContext(): void {
    this.state = { ...this.state, attachedContextPaths: [] };
    this.notify();
  }

  public cancelGeneration(): void {
    this.generationId++;
    if (this.state.isGenerating && this.state.currentStreamContent.trim() && this.state.selectedMode !== 'Agent') {
      const partial: CodeAssistMessage = { id: `partial-${Date.now()}-${this.generationId}`, role: 'assistant',
        content: this.state.currentStreamContent, timestamp: Date.now(), providerId: this.state.selectedProvider,
        modelId: this.state.selectedModel, error: 'Generation stopped; partial response preserved.' };
      this.state.sessions = this.state.sessions.map((session) => session.id === this.state.generatingSessionId
        ? { ...session, messages: [...session.messages, partial], updatedAt: Date.now() } : session);
      ConversationStore.saveSessions(this.state.currentProjectId, this.state.sessions);
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.state = {
      ...this.state,
      isGenerating: false,
      generatingSessionId: null,
      progressStep: 'Generation stopped',
      currentStreamContent: '',
      currentReasoning: '',
    };
    this.notify();
  }

  /**
   * Submits a prompt to the AI provider with live streaming.
   */
  public async submitPrompt(
    prompt: string,
    project: MultiFileProject,
    activePath?: string | null,
    options?: {
      onChangeFile?: (path: string, content: string) => void;
      onCreateFile?: (path: string, content: string) => void;
      isEditorDirty?: (path: string) => boolean;
    }
  ): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed || this.state.isGenerating) return;

    if (this.state.selectedMode === 'Agent') {
      await this.startAgentTask(trimmed, {
        project,
        projectId: this.state.currentProjectId,
        activePath,
        onChangeFile: options?.onChangeFile,
        onCreateFile: options?.onCreateFile,
        isEditorDirty: options?.isEditorDirty,
      });
      return;
    }

    const generationId = ++this.generationId;
    const selectedProvider = this.state.selectedProvider;
    const selectedModel = this.state.selectedModel;
    const targetProjectId = this.state.currentProjectId;
    const sessionId = this.state.activeSessionId;
    const userMsgId = `msg-${Date.now()}`;

    // 1. Calculate model-aware context budget
    const modelContextLimit = providerRegistry.getModelContextLimit(
      this.state.selectedProvider,
      this.state.selectedModel
    );
    const budget = ContextBudget.calculateBudget(modelContextLimit, {
      hasTools: true,
      maxOutputTokens: 4096,
    });

    // 2. Assemble Project Context under budget ceiling
    const assembledContext = ContextBuilder.assembleContext(
      project,
      activePath,
      this.state.attachedContextPaths,
      trimmed,
      Math.min(Math.floor(budget.effectiveInputBudget / 2), DEFAULT_CONTEXT_BUDGET_TOKENS)
    );

    const userMsg: CodeAssistMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      contextFiles: assembledContext.files.map((f) => ({ path: f.path, linesCount: f.linesCount })),
    };

    // 3. Append User Message
    const updatedSessions = this.state.sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? trimmed.slice(0, 32) : s.title,
          updatedAt: Date.now(),
          messages: [...s.messages, userMsg],
        };
      }
      return s;
    });

    this.state = {
      ...this.state,
      sessions: updatedSessions,
      isGenerating: true,
      generatingSessionId: sessionId,
      progressStep: 'Connecting to AI provider...',
      currentReasoning: '',
      currentStreamContent: '',
    };
    ConversationStore.saveSessions(this.state.currentProjectId, updatedSessions);
    this.notify();

    this.abortController = new AbortController();

    try {
      const provider = providerRegistry.getProvider(this.state.selectedProvider);
      const apiKey = keyManager.getApiKey(this.state.selectedProvider);

      // 4. Build system prompt
      const systemPrompt = ContextBuilder.buildSystemPrompt(
        assembledContext,
        project.projectType || 'react'
      );

      // 5. Build conversation history with Atomic Tool Block preservation
      const activeSession = this.getActiveSession();
      const rawHistory = activeSession.messages.flatMap((m): import('./providers/baseProvider').ProviderChatMessage[] => {
        const resolved = m.toolCalls?.length && m.toolCalls.every((call) => call.status === 'completed' || call.status === 'failed');
        if (m.role === 'assistant' && resolved) return [
          { role: 'assistant', content: m.content, toolCalls: m.toolCalls },
          ...m.toolCalls!.map((call) => ({ role: 'tool' as const, toolCallId: call.id, name: call.toolName,
            content: JSON.stringify(call.error ? { error: call.error } : call.result ?? {}) })),
        ];
        return [{ role: m.role, content: m.content, toolCallId: m.toolCallId, name: m.name }];
      });

      // Prune history to fit available budget without ever severing tool calls from tool responses
      const prunedPrior = ContextBudget.pruneConversationHistory(
        rawHistory,
        budget.effectiveInputBudget,
        { preserveSystemPrompt: false, preserveInitialUserPrompt: false }
      );

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...prunedPrior,
      ];

      this.state.progressStep = `Streaming from ${this.state.selectedModel}...`;
      this.notify();

      let streamContent = '';
      let streamReasoning = '';

      // 6. Stream chat response with registered tools
      const result = await provider.streamChat(
        apiMessages,
        {
          apiKey,
          model: selectedModel,
          signal: this.abortController.signal,
          baseUrl: providerRegistry.getBaseUrlOverride(selectedProvider),
          tools:
            this.state.selectedMode === 'Ask' ||
            providerRegistry.getModelsForProvider(selectedProvider).find((m) => m.id === selectedModel)?.supportsToolCalling === false
              ? undefined
              : ToolRegistry.getAllTools(),
        },
        (chunk) => {
          // If project switched while streaming, discard chunk to avoid cross-project pollution
          if (generationId !== this.generationId || this.state.currentProjectId !== targetProjectId) return;

          if (chunk.contentDelta) {
            streamContent += chunk.contentDelta;
            this.state.currentStreamContent = streamContent;
            this.notify();
          }
          if (chunk.reasoningDelta) {
            streamReasoning += chunk.reasoningDelta;
            this.state.currentReasoning = streamReasoning;
            this.notify();
          }
        }
      );

      if (generationId !== this.generationId) return;

      // Update actual token metrics if returned by provider
      if (result.usage && result.usage.totalTokens) {
        this.state.tokenCount = {
          input: result.usage.promptTokens ?? this.state.tokenCount.input,
          output: result.usage.completionTokens ?? this.state.tokenCount.output,
          total: result.usage.totalTokens,
          max: modelContextLimit,
        };
      }

      // 5. Process tool calls
      const processedToolCalls: ToolCallRecord[] = [];
      const toolProposals: ProposedFileEdit[] = [];

      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const rawCall of result.toolCalls) {
          if (generationId !== this.generationId) return;
          const toolCall = ToolExecutor.createToolCallRecord(rawCall.toolName, rawCall.args, rawCall.id);

          if (toolCall.permission === 'read') {
            // Auto-execute safe read tools in workspace context
            try {
              await ToolExecutor.executeToolCall(
                toolCall,
                {
                  projectId: targetProjectId,
                  project,
                  activeFilePath: activePath || undefined,
                },
                true
              );
            } catch (err: unknown) {
              toolCall.status = 'failed';
              toolCall.error = err instanceof Error ? err.message : String(err);
            }
          } else if (toolCall.toolName === 'propose_file_edit' || toolCall.toolName === 'create_file') {
            // Edit tool - generates a proposed file edit for Monaco diff
            try {
              const execRes = await ToolExecutor.executeToolCall(
                toolCall,
                {
                  projectId: targetProjectId,
                  project,
                },
                true
              );
              if (execRes.success && execRes.result && typeof execRes.result === 'object' && 'proposal' in execRes.result) {
                toolProposals.push((execRes.result as { proposal: ProposedFileEdit }).proposal);
              }
            } catch (err: unknown) {
              toolCall.status = 'failed';
              toolCall.error = err instanceof Error ? err.message : String(err);
            }
          } else if (toolCall.permission === 'terminal') {
            // Terminal commands ALWAYS require explicit user approval
            toolCall.status = 'pending_approval';
          }

          processedToolCalls.push(toolCall);
        }
      }

      if (processedToolCalls.length && processedToolCalls.every((call) => call.permission === 'read')) {
        const continuation = await provider.streamChat([
          ...apiMessages,
          { role: 'assistant', content: result.fullContent, toolCalls: processedToolCalls },
          ...processedToolCalls.map((call) => ({ role: 'tool' as const, toolCallId: call.id, name: call.toolName,
            content: JSON.stringify(call.error ? { error: call.error } : call.result) })),
        ], { apiKey, model: selectedModel, signal: this.abortController!.signal }, (chunk) => {
          if (generationId !== this.generationId) return;
          if (chunk.contentDelta) {
            streamContent += chunk.contentDelta;
            this.state.currentStreamContent = streamContent;
            this.notify();
          }
        });
        if (generationId !== this.generationId) return;
        result.fullContent = [result.fullContent, continuation.fullContent].filter(Boolean).join('\n');
      }
      if (!result.fullContent.trim() && processedToolCalls.length) {
        result.fullContent = 'Tool actions are shown below. Approve pending actions or use Agent Mode for a multi-step workflow.';
      }

      // 6. Parse structured edit proposals from response (for XML tags and tool proposals)
      const parsedProposals = EditProposalService.parseProposals(result.fullContent, project.files);
      const allProposedEdits = [...parsedProposals, ...toolProposals];

      const assistantMsg: CodeAssistMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.fullContent,
        timestamp: Date.now(),
        reasoning: result.reasoning || streamReasoning || undefined,
        providerId: this.state.selectedProvider,
        modelId: this.state.selectedModel,
        proposedEdits: allProposedEdits.length > 0 ? allProposedEdits : undefined,
        appliedEditsStatus: allProposedEdits.length > 0 ? 'unapplied' : undefined,
        toolCalls: processedToolCalls.length > 0 ? processedToolCalls : undefined,
      };

      // Guard against project context switch while waiting for stream response
      if (this.state.currentProjectId !== targetProjectId) {
        // Project was switched: isolate response by saving to target project's store without mutating active state
        const targetSessions = ConversationStore.loadSessions(targetProjectId);
        const updatedTargetSessions = targetSessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, assistantMsg],
            };
          }
          return s;
        });
        ConversationStore.saveSessions(targetProjectId, updatedTargetSessions);
        return;
      }

      const finalSessions = this.state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, assistantMsg],
          };
        }
        return s;
      });

      const inputTokens = estimateTokens(systemPrompt) + estimateTokens(trimmed);
      const outputTokens = estimateTokens(result.fullContent);

      this.state = {
        ...this.state,
        sessions: finalSessions,
        isGenerating: false,
        generatingSessionId: null,
        progressStep: 'Ready',
        currentReasoning: '',
        currentStreamContent: '',
        tokenCount: {
          input: this.state.tokenCount.input + inputTokens,
          output: this.state.tokenCount.output + outputTokens,
          total: this.state.tokenCount.total + inputTokens + outputTokens,
          max: 128000,
        },
      };

      ConversationStore.saveSessions(this.state.currentProjectId, finalSessions);
      this.notify();
    } catch (err: unknown) {
      if (generationId !== this.generationId) return;
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
        this.cancelGeneration();
        return;
      }

      if (this.state.currentProjectId !== targetProjectId) {
        return;
      }


      const errorMsg = err instanceof Error ? err.message : String(err);

      const assistantErrorMsg: CodeAssistMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `${this.state.currentStreamContent ? this.state.currentStreamContent + '\n\n' : ''}⚠️ **AI Request Error**\n\n${errorMsg}`,
        timestamp: Date.now(),
        providerId: this.state.selectedProvider,
        modelId: this.state.selectedModel,
        error: errorMsg,
      };

      const finalSessions = this.state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, assistantErrorMsg],
          };
        }
        return s;
      });

      this.state = {
        ...this.state,
        sessions: finalSessions,
        isGenerating: false,
        generatingSessionId: null,
        progressStep: 'Error',
        currentReasoning: '',
        currentStreamContent: '',
      };

      ConversationStore.saveSessions(this.state.currentProjectId, finalSessions);
      this.notify();
    } finally {
      if (generationId === this.generationId) this.abortController = null;
    }
  }

  /**
   * Applies an edit proposal to the project files.
   * Enforces project origin matching and immutable state updates.
   */
  public async applyEdit(
    messageId: string,
    editId: string,
    options: {
      project: MultiFileProject;
      projectId?: string;
      isEditorDirty?: (path: string) => boolean;
      onChangeFile: (path: string, content: string) => void;
      onCreateFile?: (path: string, content: string) => void;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const originProjectId = options.projectId || this.state.currentProjectId;
    if (originProjectId && this.state.currentProjectId !== originProjectId) {
      return { success: false, error: 'Cannot apply proposal: workspace has switched to another project.' };
    }

    const session = this.getActiveSession();
    const msg = session.messages.find((m) => m.id === messageId);
    if (!msg || !msg.proposedEdits) return { success: false, error: 'Message or edits not found' };

    const edit = msg.proposedEdits.find((e) => e.id === editId);
    if (!edit) return { success: false, error: 'Edit proposal not found' };

    if (edit.status === 'applied') {
      return { success: false, error: 'This proposal has already been applied.' };
    }

    const res = await EditProposalService.applyEdit({
      project: options.project,
      edit,
      projectId: originProjectId,
      isEditorDirty: options.isEditorDirty,
      onChangeFile: options.onChangeFile,
      onCreateFile: options.onCreateFile,
      createRollbackCheckpoint: true,
    });

    if (res.success) {
      // Guard against project context switch while waiting for async snapshot
      if (originProjectId && this.state.currentProjectId !== originProjectId) {
        return { success: false, error: 'Edit applied but project context changed.' };
      }

      const nextSessions = this.state.sessions.map((s) => {
        if (s.id !== session.id) return s;
        return {
          ...s,
          updatedAt: Date.now(),
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const updatedEdits = (m.proposedEdits || []).map((e) =>
              e.id === editId ? { ...e, status: 'applied' as const, appliedAt: Date.now() } : e
            );
            const allApplied = updatedEdits.every((e) => e.status === 'applied');
            return {
              ...m,
              proposedEdits: updatedEdits,
              appliedEditsStatus: (allApplied ? 'applied' : 'partial') as 'applied' | 'partial',
            };
          }),
        };
      });

      this.state = {
        ...this.state,
        sessions: nextSessions,
      };

      ConversationStore.saveSessions(this.state.currentProjectId, nextSessions);
      this.notify();
    }

    return res;
  }

  /**
   * Rejects an edit proposal.
   * Produces fresh immutable state references to ensure instant UI updates.
   */
  public rejectEdit(messageId: string, editId: string): void {
    const session = this.getActiveSession();
    const msg = session.messages.find((m) => m.id === messageId);
    if (!msg || !msg.proposedEdits) return;

    const edit = msg.proposedEdits.find((e) => e.id === editId);
    if (edit) {
      const nextSessions = this.state.sessions.map((s) => {
        if (s.id !== session.id) return s;
        return {
          ...s,
          updatedAt: Date.now(),
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const updatedEdits = (m.proposedEdits || []).map((e) =>
              e.id === editId ? { ...e, status: 'rejected' as const } : e
            );
            const allRejected = updatedEdits.every((e) => e.status === 'rejected');
            return {
              ...m,
              proposedEdits: updatedEdits,
              appliedEditsStatus: (allRejected ? 'rejected' : 'partial') as 'rejected' | 'partial',
            };
          }),
        };
      });

      this.state = {
        ...this.state,
        sessions: nextSessions,
      };

      ConversationStore.saveSessions(this.state.currentProjectId, nextSessions);
      this.notify();
    }
  }

  /**
   * Approves and executes a pending tool call (e.g. terminal execution).
   */
  public async approveToolCall(
    messageId: string,
    toolCallId: string,
    context: {
      project: MultiFileProject;
      projectId?: string;
      activePath?: string | null;
      onOutput?: (chunk: string) => void;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const originProjectId = context.projectId || this.state.currentProjectId;
    if (originProjectId && this.state.currentProjectId !== originProjectId) {
      return { success: false, error: 'Cannot execute tool: workspace has switched to another project.' };
    }

    const session = this.getActiveSession();
    const msg = session.messages.find((m) => m.id === messageId);
    if (!msg || !msg.toolCalls) {
      return { success: false, error: 'Message or tool calls not found.' };
    }

    const toolCall = msg.toolCalls.find((tc) => tc.id === toolCallId);
    if (!toolCall) {
      return { success: false, error: 'Tool call not found.' };
    }

    if (toolCall.status !== 'pending_approval') {
      return { success: false, error: `Tool call is not pending approval (status: ${toolCall.status}).` };
    }

    // Set running state and notify UI
    toolCall.status = 'running';
    toolCall.startedAt = Date.now();
    this.notify();

    try {
      const execResult = await ToolExecutor.executeToolCall(
        toolCall,
        {
          projectId: originProjectId,
          project: context.project,
          activeFilePath: context.activePath || undefined,
          onOutput: context.onOutput,
        },
        true // pre-approved by user
      );

      // If tool produced a file edit proposal, attach it to message
      if (
        execResult.success &&
        execResult.result &&
        typeof execResult.result === 'object' &&
        'proposal' in execResult.result
      ) {
        const proposal = (execResult.result as { proposal: ProposedFileEdit }).proposal;
        if (proposal) {
          msg.proposedEdits = [...(msg.proposedEdits || []), proposal];
          msg.appliedEditsStatus = msg.appliedEditsStatus || 'unapplied';
        }
      }

      // Persist updated session
      const nextSessions = this.state.sessions.map((s) => {
        if (s.id !== session.id) return s;
        return {
          ...s,
          updatedAt: Date.now(),
          messages: s.messages.map((m) => (m.id === messageId ? { ...m } : m)),
        };
      });

      this.state = {
        ...this.state,
        sessions: nextSessions,
      };

      ConversationStore.saveSessions(this.state.currentProjectId, nextSessions);
      this.notify();

      return {
        success: execResult.success,
        error: execResult.error,
      };
    } catch (err: unknown) {
      const msgError = err instanceof Error ? err.message : String(err);
      toolCall.status = 'failed';
      toolCall.error = msgError;
      this.notify();
      return { success: false, error: msgError };
    }
  }

  /**
   * Denies a pending tool call.
   */
  public denyToolCall(messageId: string, toolCallId: string): void {
    const session = this.getActiveSession();
    const msg = session.messages.find((m) => m.id === messageId);
    if (!msg || !msg.toolCalls) return;

    const toolCall = msg.toolCalls.find((tc) => tc.id === toolCallId);
    if (!toolCall) return;

    toolCall.status = 'denied';
    toolCall.error = 'Tool execution was denied by user.';

    const nextSessions = this.state.sessions.map((s) => {
      if (s.id !== session.id) return s;
      return {
        ...s,
        updatedAt: Date.now(),
        messages: s.messages.map((m) => (m.id === messageId ? { ...m } : m)),
      };
    });

    this.state = {
      ...this.state,
      sessions: nextSessions,
    };

    ConversationStore.saveSessions(this.state.currentProjectId, nextSessions);
    this.notify();
  }

  /**
   * Starts an autonomous multi-step agent task.
   */
  public async startAgentTask(
    prompt: string,
    options: {
      project: MultiFileProject;
      projectId?: string;
      activePath?: string | null;
      onChangeFile?: (path: string, content: string) => void;
      onCreateFile?: (path: string, content: string) => void;
      isEditorDirty?: (path: string) => boolean;
    }
  ): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const effectiveProjectId = options.projectId || this.state.currentProjectId;
    const sessionId = this.state.activeSessionId;

    // Add user prompt message
    const userMsg: CodeAssistMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    // Add initial agent response message
    const assistantMsgId = `agent-msg-${Date.now() + 1}`;
    const initialAssistantMsg: CodeAssistMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: 'Autonomous Agent initialized. Formulating plan...',
      timestamp: Date.now(),
      providerId: this.state.selectedProvider,
      modelId: this.state.selectedModel,
    };

    const nextSessions = this.state.sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          updatedAt: Date.now(),
          messages: [...s.messages, userMsg, initialAssistantMsg],
        };
      }
      return s;
    });

    this.state = {
      ...this.state,
      sessions: nextSessions,
      isGenerating: true,
      generatingSessionId: sessionId,
      progressStep: 'Agent: planning task...',
    };
    this.notify();
    ConversationStore.saveSessions(effectiveProjectId, nextSessions);

    // Sync agentEngine state updates to assistantMsg
    const unsubscribe = agentEngine.subscribe((agentTask) => {
      if (!agentTask || this.state.currentProjectId !== effectiveProjectId || this.state.activeSessionId !== sessionId) return;

      const currentSession = this.getActiveSession();
      const updatedMessages = currentSession.messages.map((m) => {
        if (m.id === assistantMsgId) {
          const latestStep = agentTask.steps[agentTask.steps.length - 1];
          const content =
            agentTask.finalSummary ||
            (agentTask.status === 'awaiting_approval'
              ? `Action requires user approval: ${agentTask.pendingApproval?.toolCall.toolName}`
              : latestStep?.modelResponse || `Autonomous Agent (${agentTask.status})`);

          return {
            ...m,
            content,
            agentTaskState: { ...agentTask },
            plan: agentTask.plan ? { ...agentTask.plan } : undefined,
            toolCalls: agentTask.steps.flatMap((s) => s.toolCalls),
            error: agentTask.error,
          };
        }
        return m;
      });

      const updatedSessionsList = this.state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        }
        return s;
      });

      const isStillRunning =
        agentTask.status === 'planning' ||
        agentTask.status === 'running' ||
        agentTask.status === 'awaiting_approval' ||
        agentTask.status === 'verifying';

      this.state = {
        ...this.state,
        sessions: updatedSessionsList,
        isGenerating: isStillRunning,
        progressStep: `Agent: ${agentTask.status}`,
      };
      this.notify();
      ConversationStore.saveSessions(effectiveProjectId, updatedSessionsList);

      if (!isStillRunning) {
        unsubscribe();
      }
    });

    try {
      await agentEngine.startTask(
        trimmed,
        {
          project: options.project,
          attachedPaths: [...this.state.attachedContextPaths],
          projectId: effectiveProjectId,
          activePath: options.activePath,
          onFileChange: options.onChangeFile,
          onFileCreate: options.onCreateFile,
          isEditorDirty: options.isEditorDirty,
        },
        {
          onStateChange: () => {},
          onStreamContent: (chunk) => {
            if (this.state.currentProjectId !== effectiveProjectId || this.state.activeSessionId !== sessionId) return;
            this.state.currentStreamContent += chunk;
            this.notify();
          },
          onStreamReasoning: (chunk) => {
            if (this.state.currentProjectId !== effectiveProjectId || this.state.activeSessionId !== sessionId) return;
            this.state.currentReasoning += chunk;
            this.notify();
          },
        }
      );
    } catch (err: unknown) {
      console.error('[AssistAgentService] startAgentTask error:', err);
      this.state = {
        ...this.state,
        isGenerating: false,
        progressStep: 'Ready',
      };
      this.notify();
    }
  }

  public stopAgent(reason?: string): void {
    agentEngine.stopAgent(reason);
    this.cancelGeneration();
  }

  public approveAgentAction(approvalId: string): boolean {
    return agentEngine.approveAction(approvalId);
  }

  public denyAgentAction(approvalId: string, reason?: string): boolean {
    return agentEngine.denyAction(approvalId, reason);
  }

  public getAgentTaskState(): import('./agent/types').AgentTaskState | null {
    return agentEngine.getTaskState();
  }

  public async retryAgentTask(options: {
    project: MultiFileProject;
    projectId?: string;
    activePath?: string | null;
    onChangeFile?: (path: string, content: string) => void;
    onCreateFile?: (path: string, content: string) => void;
    isEditorDirty?: (path: string) => boolean;
  }): Promise<import('./agent/types').AgentTaskState> {
    const effectiveProjectId = options.projectId || this.state.currentProjectId;
    return agentEngine.retryTask({
      project: options.project,
      projectId: effectiveProjectId,
      activePath: options.activePath,
      onFileChange: options.onChangeFile,
      onFileCreate: options.onCreateFile,
      isEditorDirty: options.isEditorDirty,
    });
  }
}

export const assistAgentService = new AssistAgentService();
