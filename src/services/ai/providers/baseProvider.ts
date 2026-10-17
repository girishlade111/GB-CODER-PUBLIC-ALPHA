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
}

export interface IAiProvider {
  readonly id: AiProviderId;
  readonly name: string;
  readonly defaultBaseUrl: string;

  getAvailableModels(): AiModelInfo[];

  streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{ fullContent: string; reasoning?: string }>;

  testConnection(apiKey: string, baseUrl?: string): Promise<ConnectionDiagnosticResult>;
}
