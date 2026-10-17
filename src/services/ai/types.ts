/**
 * Core type definitions for GB Assist (Phase 3A: AI Foundation).
 *
 * Defines contracts for BYOK providers, models, chat messages,
 * project context, edit proposals, and connection diagnostics.
 */

export type AiProviderId = 'gemini' | 'openrouter' | 'openai' | 'custom' | 'mock';

export interface AiModelInfo {
  id: string;
  name: string;
  provider: AiProviderId;
  contextWindow: number;
  description: string;
  recommended?: boolean;
  supportsStreaming: boolean;
}

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  selectedModel: string;
  isCustom?: boolean;
}

export interface ConnectionDiagnosticResult {
  success: boolean;
  latencyMs: number;
  message: string;
  corsRestricted?: boolean;
  detectedModels?: string[];
  errorDetails?: string;
}

export interface ChatCompletionChunk {
  contentDelta?: string;
  reasoningDelta?: string;
  isComplete?: boolean;
  error?: string;
}

export type CodeAssistMode = 'Code' | 'Ask' | 'Debug' | 'Plan';

export interface ContextFileReference {
  path: string;
  content: string;
  language: string;
  linesCount: number;
  charCount: number;
  isTruncated?: boolean;
  reason: 'active_file' | 'user_attached' | 'at_mention';
}

export interface AssembledProjectContext {
  activeFilePath?: string;
  files: ContextFileReference[];
  totalEstimatedTokens: number;
  budgetTokens: number;
  isOverBudget: boolean;
  summary: string;
}

export interface ProposedFileEdit {
  id: string;
  path: string;
  action: 'modify' | 'create';
  originalContent: string;
  newContent: string;
  addedLines: number;
  removedLines: number;
  explanation?: string;
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: number;
}

export interface CodeAssistMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  reasoning?: string;
  providerId?: AiProviderId;
  modelId?: string;
  contextFiles?: Array<{ path: string; linesCount: number }>;
  proposedEdits?: ProposedFileEdit[];
  appliedEditsStatus?: 'unapplied' | 'applied' | 'rejected' | 'partial';
  error?: string;
}

export interface CodeAssistSession {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: CodeAssistMessage[];
}

export interface CodeAssistState {
  currentProjectId: string;
  sessions: CodeAssistSession[];
  activeSessionId: string;
  isGenerating: boolean;
  generatingSessionId: string | null;
  progressStep: string;
  currentReasoning: string;
  currentStreamContent: string;
  selectedMode: CodeAssistMode;
  selectedProvider: AiProviderId;
  selectedModel: string;
  attachedContextPaths: string[];
  tokenCount: {
    input: number;
    output: number;
    total: number;
    max: number;
  };
}
