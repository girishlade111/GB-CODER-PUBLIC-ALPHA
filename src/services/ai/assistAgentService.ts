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
} from './types.ts';
import { keyManager } from './keyManager.ts';
import { providerRegistry } from './providerRegistry.ts';
import { ContextBuilder, estimateTokens } from './contextBuilder.ts';
import { EditProposalService } from './editProposalService.ts';
import { ConversationStore } from './conversationStore.ts';

class AssistAgentService {
  private state: CodeAssistState;
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

    const defaultModel =
      defaultProvider === 'gemini'
        ? 'gemini-2.5-flash'
        : defaultProvider === 'openrouter'
        ? 'anthropic/claude-3.5-sonnet'
        : 'mock-coder-fast';

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
      selectedProvider: defaultProvider,
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

    // Abort active generation from previous project
    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch {}
      this.abortController = null;
    }

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
    const models = providerRegistry.getModelsForProvider(providerId);
    const resolvedModel = modelId || models[0]?.id || this.state.selectedModel;

    this.state = {
      ...this.state,
      selectedProvider: providerId,
      selectedModel: resolvedModel,
    };
    this.notify();
  }

  public setModel(modelId: string, providerId?: AiProviderId): void {
    this.state = {
      ...this.state,
      selectedModel: modelId,
      selectedProvider: providerId || this.state.selectedProvider,
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
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.state = {
      ...this.state,
      isGenerating: false,
      generatingSessionId: null,
      progressStep: 'Generation stopped',
    };
    this.notify();
  }

  /**
   * Submits a prompt to the AI provider with live streaming.
   */
  public async submitPrompt(
    prompt: string,
    project: MultiFileProject,
    activePath?: string | null
  ): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed || this.state.isGenerating) return;

    const targetProjectId = this.state.currentProjectId;
    const sessionId = this.state.activeSessionId;
    const userMsgId = `msg-${Date.now()}`;

    // 1. Assemble Project Context
    const assembledContext = ContextBuilder.assembleContext(
      project,
      activePath,
      this.state.attachedContextPaths,
      trimmed
    );

    const userMsg: CodeAssistMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      contextFiles: assembledContext.files.map((f) => ({ path: f.path, linesCount: f.linesCount })),
    };

    // 2. Append User Message
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

      // 3. Build messages array
      const systemPrompt = ContextBuilder.buildSystemPrompt(
        assembledContext,
        project.projectType || 'react'
      );

      // Build conversation history for provider
      const activeSession = this.getActiveSession();
      const priorMessages = activeSession.messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...priorMessages,
      ];

      this.state.progressStep = `Streaming from ${this.state.selectedModel}...`;
      this.notify();

      let streamContent = '';
      let streamReasoning = '';

      // 4. Stream chat response
      const result = await provider.streamChat(
        apiMessages,
        {
          apiKey,
          model: this.state.selectedModel,
          signal: this.abortController.signal,
        },
        (chunk) => {
          // If project switched while streaming, discard chunk to avoid cross-project pollution
          if (this.state.currentProjectId !== targetProjectId) return;

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

      // 5. Parse structured edit proposals from response
      const proposedEdits = EditProposalService.parseProposals(result.fullContent, project.files);

      const assistantMsg: CodeAssistMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.fullContent,
        timestamp: Date.now(),
        reasoning: result.reasoning || streamReasoning || undefined,
        providerId: this.state.selectedProvider,
        modelId: this.state.selectedModel,
        proposedEdits: proposedEdits.length > 0 ? proposedEdits : undefined,
        appliedEditsStatus: proposedEdits.length > 0 ? 'unapplied' : undefined,
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
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
        this.cancelGeneration();
        return;
      }

      if (this.state.currentProjectId !== targetProjectId) {
        return;
      }

      console.error('[AssistAgentService] Generation failed:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      const assistantErrorMsg: CodeAssistMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `⚠️ **AI Request Error**\n\n${errorMsg}`,
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
      this.abortController = null;
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
}

export const assistAgentService = new AssistAgentService();
