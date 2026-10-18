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
  ): Promise<{ fullContent: string; reasoning?: string; toolCalls?: import('../tools/types').ToolCallRecord[] }>;

  testConnection(apiKey: string, baseUrl?: string): Promise<ConnectionDiagnosticResult>;
}
