/**
 * Core type definitions for GB Assist (Phase 3A: AI Foundation).
 *
 * Defines contracts for BYOK providers, models, chat messages,
 * project context, edit proposals, and connection diagnostics.
 */

export type BuiltInAiProviderId =
  | 'gemini'
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'deepseek'
  | 'mistral'
  | 'together'
  | 'fireworks'
  | 'cerebras'
  | 'deepinfra'
  | 'nvidia'
  | 'inception'
  | 'moonshot'
  | 'minimax'
  | 'huggingface'
  | 'ollama'
  | 'lmstudio'
  | 'vllm'
  | 'custom'
  | 'mock';
export type AiProviderId = BuiltInAiProviderId | (string & {});

export type ProviderIntegrationTier = 'tier_a' | 'tier_b' | 'tier_c' | 'tier_d';
export type ProviderCapabilityStatus = 'supported' | 'unsupported' | 'unknown' | 'not_verified';

export interface AiModelInfo {
  id: string;
  name: string;
  provider: AiProviderId;
  contextWindow: number;
  description: string;
  recommended?: boolean;
  supportsStreaming: boolean;
  supportsToolCalling?: boolean;
}

export interface CustomHeaderConfig {
  id: string;
  name: string;
  value: string;
  isSecret?: boolean;
}

export interface CustomModelConfig {
  id: string;
  name: string;
  contextWindow?: number;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsToolCalling?: boolean;
}

export interface CustomProviderDefinition {
  id: string;
  name: string;
  baseUrl: string;
  description?: string;
  models: CustomModelConfig[];
  headers?: CustomHeaderConfig[];
  contextWindow?: number;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsToolCalling?: boolean;
  timeoutMs?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProviderCatalogEntry {
  id: AiProviderId;
  name: string;
  description: string;
  category: 'popular' | 'other';
  tier: ProviderIntegrationTier;
  iconName?: string;
  defaultBaseUrl?: string;
  docUrl?: string;
  apiKeyHelpUrl?: string;
  browserCorsSupport: boolean;
  toolCallingSupport: boolean | 'unknown';
  streamingSupport: boolean;
  defaultModels?: AiModelInfo[];
  isCustomTemplate?: boolean;
  protocol?: 'openai' | 'anthropic' | 'gemini' | 'azure' | 'aws_bedrock' | 'vertex_ai' | 'custom';
  authType?: 'bearer' | 'x-api-key' | 'iam' | 'oauth' | 'header_custom' | 'none';
  group?: 'popular' | 'compatible' | 'cloud' | 'local' | 'reference';
  tierCRequirements?: string;
  tierDStatus?: string;
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
  endpointTested?: string;
  httpStatus?: number;
  errorCategory?: 'config' | 'auth' | 'not_found' | 'rate_limit' | 'server' | 'cors' | 'timeout' | 'network' | 'unknown';
  suggestedAction?: string;
}

export interface ApiKeyVerificationResult {
  success: boolean;
  httpStatus?: number;
  message: string;
  endpointTested: string;
  errorCategory?: 'config' | 'auth' | 'not_found' | 'rate_limit' | 'server' | 'cors' | 'timeout' | 'network' | 'unknown';
  keyState?: 'valid' | 'invalid' | 'unverified' | 'rate_limited';
  suggestedAction?: string;
  latencyMs?: number;
  diagnosticCase?: 'A' | 'B' | 'C' | 'D' | 'E';
  keyDetails?: {
    label?: string;
    limit?: number | null;
    usage?: number | null;
    isFreeTier?: boolean;
    rateLimit?: {
      requests?: number;
      interval?: string;
    };
  };
}

export interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  ownedBy?: string;
  supportsToolCalling?: boolean;
  inputModalities?: string[];
  outputModalities?: string[];
  pricing?: { prompt?: string; completion?: string };
}

export interface ModelDiscoveryResult {
  success: boolean;
  models: DiscoveredModel[];
  httpStatus?: number;
  error?: string;
  errorCategory?: 'cors' | 'auth' | 'not_found' | 'unsupported' | 'rate_limit' | 'server' | 'network' | 'timeout' | 'malformed' | 'empty' | 'config';
  suggestedAction?: string;
}

export interface ChatCompletionChunk {
  contentDelta?: string;
  reasoningDelta?: string;
  toolCallDelta?: { id?: string; index?: number; name?: string; argumentsDelta?: string };
  isComplete?: boolean;
  actualUsage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  error?: string;
}

export type CodeAssistMode = 'Code' | 'Ask' | 'Debug' | 'Plan' | 'Agent';

export interface ContextFileReference {
  path: string;
  content: string;
  language: string;
  linesCount: number;
  charCount: number;
  isTruncated?: boolean;
  reason: 'active_file' | 'user_attached' | 'at_mention' | 'relevant_context';
}

export interface AssembledProjectContext {
  activeFilePath?: string;
  files: ContextFileReference[];
  totalEstimatedTokens: number;
  budgetTokens: number;
  isOverBudget: boolean;
  summary: string;
  excludedSensitiveFiles?: string[];
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
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  reasoning?: string;
  providerId?: AiProviderId;
  modelId?: string;
  name?: string;
  toolCallId?: string;
  contextFiles?: Array<{ path: string; linesCount: number }>;
  proposedEdits?: ProposedFileEdit[];
  appliedEditsStatus?: 'unapplied' | 'applied' | 'rejected' | 'partial';
  toolCalls?: import('./tools/types').ToolCallRecord[];
  plan?: import('./agent/types').AgentPlan;
  agentTaskState?: import('./agent/types').AgentTaskState;
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
