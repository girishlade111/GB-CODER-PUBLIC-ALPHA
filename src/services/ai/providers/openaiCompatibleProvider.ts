/**
 * OpenAI & OpenAI-compatible provider implementation (including OpenRouter and custom endpoints).
 *
 * Supports SSE streaming in browser environments with proper CORS handling.
 */

import {
  AiProviderId,
  AiModelInfo,
  ChatCompletionChunk,
  ConnectionDiagnosticResult,
} from '../types.ts';
import { IAiProvider, StreamChatOptions } from './baseProvider.ts';

export class OpenAiCompatibleProvider implements IAiProvider {
  public readonly id: AiProviderId;
  public readonly name: string;
  public readonly defaultBaseUrl: string;
  private readonly defaultModels: AiModelInfo[];

  constructor(
    id: 'openai' | 'openrouter' | 'custom',
    name: string,
    defaultBaseUrl: string,
    defaultModels: AiModelInfo[]
  ) {
    this.id = id;
    this.name = name;
    this.defaultBaseUrl = defaultBaseUrl;
    this.defaultModels = defaultModels;
  }

  public getAvailableModels(): AiModelInfo[] {
    return this.defaultModels;
  }

  private resolveHeaders(apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (this.id === 'openrouter') {
      headers['HTTP-Referer'] = 'https://code.ladestack.in';
      headers['X-Title'] = 'GB Coder (LadeStack)';
    }

    return headers;
  }

  public async streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{ fullContent: string; reasoning?: string; toolCalls?: import('../tools/types').ToolCallRecord[] }> {
    const baseUrl = (options.baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    const url = `${baseUrl}/chat/completions`;

    if (!options.apiKey && this.id !== 'custom') {
      throw new Error(`API key required for ${this.name}. Configure your key in GB Assist settings.`);
    }

    const requestBody: Record<string, unknown> = {
      model: options.model,
      messages,
      stream: true,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens,
    };

    if (options.tools && options.tools.length > 0) {
      requestBody.tools = options.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
      if (options.toolChoice) {
        requestBody.tool_choice = options.toolChoice;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.resolveHeaders(options.apiKey),
        body: JSON.stringify(requestBody),
        signal: options.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      // Inspect for likely browser CORS limitation
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        throw new Error(
          `Network/CORS error connecting to ${baseUrl}. In browser environments, direct calls to certain endpoints require CORS headers. For direct browser BYOK, OpenRouter is recommended as it officially permits browser CORS.`
        );
      }
      throw new Error(`Connection error with ${this.name}: ${msg}`);
    }

    if (!response.ok) {
      let errorText = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          errorText = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          errorText = errorJson.error;
        }
      } catch {
        // non-json response
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication Failed (${response.status}): Invalid API key for ${this.name}.`);
      }
      if (response.status === 429) {
        throw new Error(`Rate Limit Exceeded (${response.status}) on ${this.name}. Please wait a moment.`);
      }

      throw new Error(`${this.name} API error (${response.status}): ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is missing or streaming not supported by host.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let reasoning = '';
    let buffer = '';
    const toolCallAccumulators = new Map<number, { id: string; name: string; arguments: string }>();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith(':')) continue; // skip keep-alive comments
          if (line === 'data: [DONE]') {
            onChunk({ isComplete: true });
            continue;
          }

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;

              if (delta) {
                // Content chunk
                if (typeof delta.content === 'string' && delta.content) {
                  fullContent += delta.content;
                  onChunk({ contentDelta: delta.content });
                }

                // Reasoning / thinking delta (e.g. DeepSeek R1, QwQ)
                const reasoningDelta = delta.reasoning_content || delta.reasoning;
                if (typeof reasoningDelta === 'string' && reasoningDelta) {
                  reasoning += reasoningDelta;
                  onChunk({ reasoningDelta });
                }

                // Tool calls delta
                if (Array.isArray(delta.tool_calls)) {
                  for (const tc of delta.tool_calls) {
                    const idx = tc.index ?? 0;
                    let acc = toolCallAccumulators.get(idx);
                    if (!acc) {
                      acc = {
                        id: tc.id || `call-${Date.now()}-${idx}`,
                        name: tc.function?.name || '',
                        arguments: '',
                      };
                      toolCallAccumulators.set(idx, acc);
                    }
                    if (tc.id) acc.id = tc.id;
                    if (tc.function?.name) acc.name = tc.function.name;
                    if (tc.function?.arguments) acc.arguments += tc.function.arguments;

                    onChunk({
                      toolCallDelta: {
                        id: acc.id,
                        index: idx,
                        name: acc.name,
                        argumentsDelta: tc.function?.arguments,
                      },
                    });
                  }
                }
              }
            } catch {
              // Ignore partial JSON parse errors in stream
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const toolCalls: import('../tools/types').ToolCallRecord[] = [];
    if (toolCallAccumulators.size > 0) {
      const { ToolExecutor } = await import('../tools/toolExecutor');
      for (const acc of toolCallAccumulators.values()) {
        if (acc.name) {
          toolCalls.push(ToolExecutor.createToolCallRecord(acc.name, acc.arguments, acc.id));
        }
      }
    }

    return {
      fullContent,
      reasoning: reasoning || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  public async testConnection(apiKey: string, baseUrl?: string): Promise<ConnectionDiagnosticResult> {
    const start = performance.now();
    const resolvedUrl = (baseUrl || this.defaultBaseUrl).replace(/\/+$/, '');
    const url = `${resolvedUrl}/chat/completions`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.resolveHeaders(apiKey),
        body: JSON.stringify({
          model: this.defaultModels[0]?.id || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);

      if (response.ok) {
        return {
          success: true,
          latencyMs,
          message: `Connected successfully to ${this.name} (${latencyMs}ms).`,
        };
      }

      let errorMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {}

      return {
        success: false,
        latencyMs,
        message: `Connection failed: ${errorMsg}`,
        errorDetails: errorMsg,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      const isCors = msg.includes('Failed to fetch') || msg.includes('NetworkError');

      return {
        success: false,
        latencyMs,
        message: isCors
          ? `Browser CORS restriction: Cannot reach ${resolvedUrl} directly from the browser. For direct browser BYOK, OpenRouter is recommended.`
          : `Network error: ${msg}`,
        corsRestricted: isCors,
        errorDetails: msg,
      };
    }
  }
}
