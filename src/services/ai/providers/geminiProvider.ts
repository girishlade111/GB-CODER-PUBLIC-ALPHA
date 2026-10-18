/**
 * Google Gemini Provider implementation using official @google/generative-ai SDK.
 *
 * Runs natively in browser environments with zero CORS friction.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiModelInfo,
  ChatCompletionChunk,
  ConnectionDiagnosticResult,
} from '../types.ts';
import { IAiProvider, StreamChatOptions } from './baseProvider.ts';

export class GeminiProvider implements IAiProvider {
  public readonly id = 'gemini' as const;
  public readonly name = 'Google Gemini';
  public readonly defaultBaseUrl = 'https://generativelanguage.googleapis.com';

  private readonly defaultModels: AiModelInfo[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      contextWindow: 1048576,
      description: 'Ultra-fast, cost-effective multimodal model with 1M context',
      recommended: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'gemini',
      contextWindow: 2097152,
      description: 'State-of-the-art coding and reasoning with 2M context',
      recommended: false,
      supportsStreaming: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      contextWindow: 1048576,
      description: 'Fast legacy Gemini 1.5 model',
      recommended: false,
      supportsStreaming: true,
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'gemini',
      contextWindow: 2097152,
      description: 'High-capability reasoning legacy Gemini 1.5 model',
      recommended: false,
      supportsStreaming: true,
    },
  ];

  public getAvailableModels(): AiModelInfo[] {
    return this.defaultModels;
  }

  public async streamChat(
    messages: Array<import('./baseProvider.ts').ProviderChatMessage | { role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{ fullContent: string; reasoning?: string; toolCalls?: import('../tools/types').ToolCallRecord[] }> {
    if (!options.apiKey) {
      throw new Error('API key required for Google Gemini. Please enter your Gemini API key in settings.');
    }

    const genAI = new GoogleGenerativeAI(options.apiKey);

    // Extract system instructions if provided in system message
    const systemMessage = messages.find((m) => m.role === 'system');
    const systemInstruction = systemMessage ? systemMessage.content : undefined;

    let toolsConfig: Array<{ functionDeclarations?: Array<{ name: string; description?: string; parameters?: any }> }> | undefined = undefined;
    if (options.tools && options.tools.length > 0) {
      toolsConfig = [
        {
          functionDeclarations: options.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters as any,
          })),
        },
      ];
    }

    const model = genAI.getGenerativeModel({
      model: options.model,
      systemInstruction,
      tools: toolsConfig as any,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens,
      },
    });

    // Convert messages to Gemini contents format
    // Filter out system message since it was supplied via systemInstruction
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Group into Gemini history with proper role mapping (user, model, function)
    const contents = conversationMessages.map((msg: any) => {
      if (msg.role === 'tool') {
        return {
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_response',
                response: {
                  output: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content ?? ''),
                },
              },
            },
          ],
        };
      }
      if (msg.role === 'assistant') {
        const parts: any[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.toolName || tc.name,
                args: tc.args || {},
              },
            });
          }
        }
        if (parts.length === 0) {
          parts.push({ text: '' });
        }
        return {
          role: 'model',
          parts,
        };
      }
      return {
        role: 'user',
        parts: [{ text: msg.content || '' }],
      };
    });

    if (options.signal?.aborted) {
      throw new Error('Request was aborted.');
    }

    let fullContent = '';
    const toolCalls: import('../tools/types').ToolCallRecord[] = [];
    const { ToolExecutor } = await import('../tools/toolExecutor.ts');

    try {
      const streamingResult = await model.generateContentStream({
        contents,
      });

      for await (const chunk of streamingResult.stream) {
        if (options.signal?.aborted) {
          throw new Error('Generation aborted by user.');
        }

        const chunkText = chunk.text();
        if (chunkText) {
          fullContent += chunkText;
          onChunk({ contentDelta: chunkText });
        }

        const funcCalls = chunk.functionCalls ? chunk.functionCalls() : undefined;
        if (funcCalls && funcCalls.length > 0) {
          for (const fc of funcCalls) {
            const record = ToolExecutor.createToolCallRecord(fc.name, fc.args);
            toolCalls.push(record);
            onChunk({
              toolCallDelta: {
                id: record.id,
                name: fc.name,
                argumentsDelta: JSON.stringify(fc.args),
              },
            });
          }
        }
      }

      onChunk({ isComplete: true });
    } catch (err: unknown) {
      if (options.signal?.aborted) {
        throw new Error('Generation aborted by user.');
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('401')) {
        throw new Error('Authentication Failed: Invalid Gemini API key. Please verify your key in Google AI Studio.');
      }
      throw new Error(`Gemini Error: ${msg}`);
    }

    return { fullContent, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
  }

  public async testConnection(apiKey: string): Promise<ConnectionDiagnosticResult> {
    const start = performance.now();
    if (!apiKey) {
      return {
        success: false,
        latencyMs: 0,
        message: 'API key is required.',
      };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('ping');
      const response = await result.response;
      const text = response.text();
      const latencyMs = Math.round(performance.now() - start);

      if (text) {
        return {
          success: true,
          latencyMs,
          message: `Connected successfully to Google Gemini (${latencyMs}ms).`,
        };
      }

      return {
        success: false,
        latencyMs,
        message: 'No response text received from Gemini.',
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        latencyMs,
        message: `Connection failed: ${msg}`,
        errorDetails: msg,
      };
    }
  }
}
