/**
 * Base AI Provider contract for GB Assist.
 */

import {
  AiProviderId,
  AiModelInfo,
  ChatCompletionChunk,
  ConnectionDiagnosticResult,
} from '../types.ts';

export interface StreamChatOptions {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  tools?: import('../tools/types').AgentToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required' | string;
  customHeaders?: Record<string, string>;
}

export interface ProviderChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: import('../tools/types').ToolCallRecord[];
}

export interface IAiProvider {
  readonly id: AiProviderId;
  readonly name: string;
  readonly defaultBaseUrl: string;

  getAvailableModels(): AiModelInfo[];

  streamChat(
    messages: Array<ProviderChatMessage | { role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{
    fullContent: string;
    reasoning?: string;
    toolCalls?: import('../tools/types').ToolCallRecord[];
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
    stopReason?: string;
  }>;

  testConnection(
    apiKey: string,
    baseUrl?: string,
    modelId?: string,
    customHeaders?: Record<string, string>,
    consentToInference?: boolean
  ): Promise<ConnectionDiagnosticResult>;

  fetchAvailableModels?(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<import('../types.ts').ModelDiscoveryResult>;

  verifyApiKey?(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<import('../types.ts').ApiKeyVerificationResult>;
}
