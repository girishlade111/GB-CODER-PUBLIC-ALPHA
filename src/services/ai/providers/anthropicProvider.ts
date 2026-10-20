/**
 * Native Anthropic Provider for GB Assist (Messages API).
 *
 * Implements:
 * - Native Messages API (POST /v1/messages)
 * - Anthropic authentication via 'x-api-key' and 'anthropic-version: 2023-06-01'
 * - Direct browser access header 'anthropic-dangerous-direct-browser-access: true'
 * - Line-by-line SSE streaming for text, thinking, and tool_use blocks
 * - Tool calling format conversion and tool result handling
 * - Dedicated non-inference key verification via GET /v1/models
 * - Destination origin authorization boundary enforcement
 * - Complete secret redaction
 */

import {
  AiProviderId,
  AiModelInfo,
  ChatCompletionChunk,
  ConnectionDiagnosticResult,
  ModelDiscoveryResult,
  ApiKeyVerificationResult,
  DiscoveredModel,
} from '../types.ts';
import { IAiProvider, StreamChatOptions, ProviderChatMessage } from './baseProvider.ts';
import { keyManager, extractOrigin, cleanApiKey } from '../keyManager.ts';
import { redactSecretsFromText, normalizeBaseUrl, validateEndpointUrl, validateCustomHeaders } from './openaiCompatibleProvider.ts';

const ANTHROPIC_MODELS: AiModelInfo[] = [
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    description: 'Frontier hybrid reasoning and coding model with extended thinking',
    recommended: true,
    supportsStreaming: true,
    supportsToolCalling: true,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    description: 'State-of-the-art coding, deep reasoning, and agent tool execution',
    recommended: false,
    supportsStreaming: true,
    supportsToolCalling: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    description: 'Ultra-fast, cost-effective model with high coding capability',
    recommended: false,
    supportsStreaming: true,
    supportsToolCalling: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    description: 'Deep analytical reasoning and complex multi-file comprehension',
    recommended: false,
    supportsStreaming: true,
    supportsToolCalling: true,
  },
];

export class AnthropicProvider implements IAiProvider {
  public readonly id: AiProviderId = 'anthropic';
  public readonly name = 'Anthropic';
  public readonly defaultBaseUrl = 'https://api.anthropic.com/v1';
  private models: AiModelInfo[] = [...ANTHROPIC_MODELS];
  private baseUrlOverride?: string;

  public setBaseUrlOverride(url?: string): void {
    this.baseUrlOverride = url ? normalizeBaseUrl(url) : undefined;
  }

  public getBaseUrl(): string {
    return this.baseUrlOverride || this.defaultBaseUrl;
  }

  public getAvailableModels(): AiModelInfo[] {
    return this.models;
  }

  public setModels(models: AiModelInfo[]): void {
    this.models = models;
  }

  private constructEndpoint(path: string, baseUrl?: string): string {
    const raw = baseUrl || this.getBaseUrl();
    const normalized = normalizeBaseUrl(raw);
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    if (normalized.endsWith('/v1')) {
      return `${normalized}${cleanPath}`;
    }
    return `${normalized}/v1${cleanPath}`;
  }

  private resolveHeaders(apiKey?: string, customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };

    const headerValidation = validateCustomHeaders(customHeaders);
    if (headerValidation.valid) {
      Object.assign(headers, headerValidation.sanitized);
    }

    const cleanedKey = cleanApiKey(apiKey);
    if (cleanedKey) {
      headers['x-api-key'] = cleanedKey;
    }

    return headers;
  }

  public async streamChat(
    messages: Array<ProviderChatMessage | { role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{
    fullContent: string;
    reasoning?: string;
    toolCalls?: import('../tools/types').ToolCallRecord[];
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
    stopReason?: string;
  }> {
    const apiKey = cleanApiKey(options.apiKey || keyManager.getApiKey(this.id));
    if (!apiKey) {
      throw new Error(`Anthropic API key is missing. Configure your API key in Settings.`);
    }

    const targetUrl = this.constructEndpoint('/messages', options.baseUrl);
    const validation = validateEndpointUrl(targetUrl);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid Anthropic endpoint URL');
    }

    // Origin Authorization Gate
    const targetOrigin = extractOrigin(targetUrl);
    if (!keyManager.isOriginAuthorized(this.id, targetOrigin)) {
      throw new Error(
        `Security Exception: Destination origin "${targetOrigin}" is not authorized for provider "anthropic".`
      );
    }

    // Separate system messages and group consecutive tool results into a single user turn
    let systemPrompt = '';
    const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: any }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt += (systemPrompt ? '\n\n' : '') + (msg.content || '');
        continue;
      }

      if (msg.role === 'tool') {
        const toolMsg = msg as ProviderChatMessage;
        const toolResultPart = {
          type: 'tool_result',
          tool_use_id: toolMsg.toolCallId || 'call_0',
          content: toolMsg.content || '',
        };
        const lastMsg = anthropicMessages[anthropicMessages.length - 1];
        if (lastMsg && lastMsg.role === 'user' && Array.isArray(lastMsg.content)) {
          lastMsg.content.push(toolResultPart);
        } else {
          anthropicMessages.push({
            role: 'user',
            content: [toolResultPart],
          });
        }
        continue;
      }

      const provMsg = msg as ProviderChatMessage;
      if (provMsg.role === 'assistant' && provMsg.toolCalls && provMsg.toolCalls.length > 0) {
        const contentParts: any[] = [];
        if (provMsg.content) {
          contentParts.push({ type: 'text', text: provMsg.content });
        }
        for (const tc of provMsg.toolCalls) {
          const toolName = tc.toolName || (tc as any).name || '';
          const rawArgs = tc.args !== undefined ? tc.args : (tc as any).arguments;
          let parsedInput: any = {};
          if (typeof rawArgs === 'string') {
            try {
              parsedInput = JSON.parse(rawArgs);
            } catch {
              parsedInput = { input: rawArgs };
            }
          } else {
            parsedInput = rawArgs || {};
          }
          contentParts.push({
            type: 'tool_use',
            id: tc.id,
            name: toolName,
            input: parsedInput || {},
          });
        }
        anthropicMessages.push({
          role: 'assistant',
          content: contentParts.length > 0 ? contentParts : [{ type: 'text', text: '' }],
        });
        continue;
      }

      const currentRole = msg.role === 'assistant' ? 'assistant' : 'user';
      const lastMsg = anthropicMessages[anthropicMessages.length - 1];
      if (lastMsg && lastMsg.role === currentRole) {
        if (typeof lastMsg.content === 'string' && typeof msg.content === 'string') {
          lastMsg.content += `\n\n${msg.content}`;
        } else if (Array.isArray(lastMsg.content)) {
          lastMsg.content.push({ type: 'text', text: msg.content || '' });
        } else {
          anthropicMessages.push({
            role: currentRole,
            content: msg.content || '',
          });
        }
      } else {
        anthropicMessages.push({
          role: currentRole,
          content: msg.content || '',
        });
      }
    }

    // Ensure alternating user/assistant turns if needed, or non-empty messages starting with user
    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Hello' });
    } else if (anthropicMessages[0].role === 'assistant') {
      anthropicMessages.unshift({ role: 'user', content: 'Continue' });
    }

    const payload: Record<string, any> = {
      model: options.model,
      messages: anthropicMessages,
      max_tokens: options.maxTokens || 4096,
      stream: true,
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    if (typeof options.temperature === 'number') {
      payload.temperature = options.temperature;
    }

    // Format tools if provided and tool calling is supported
    if (options.tools && options.tools.length > 0) {
      payload.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters || { type: 'object', properties: {} },
      }));
    }

    const headers = this.resolveHeaders(apiKey, options.customHeaders);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: options.signal,
        redirect: 'error',
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Request cancelled by user.');
      }
      const rawMsg = err?.message || String(err);
      if (/failed to fetch|network|cors|load failed/i.test(rawMsg)) {
        throw new Error(
          `Browser network or CORS restriction encountered while connecting to Anthropic (${targetUrl}). Anthropic's direct browser access header is enabled, but browser CORS policies may require a CORS proxy or desktop bridge.`
        );
      }
      throw new Error(`Failed to connect to Anthropic: ${redactSecretsFromText(rawMsg, apiKey)}`);
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errJson = await response.json();
        errorDetail = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorDetail = await response.text();
      }

      if (response.status === 401) {
        throw new Error(
          `Authentication Failed (401): Invalid API key for Anthropic (BYOK). Detail: ${redactSecretsFromText(
            errorDetail || 'Unauthorized',
            apiKey
          )}`
        );
      }
      if (response.status === 403) {
        throw new Error(
          `Access Denied (403): Your Anthropic API key does not have permission for model "${options.model}". Detail: ${redactSecretsFromText(
            errorDetail,
            apiKey
          )}`
        );
      }
      if (response.status === 429) {
        throw new Error(
          `Rate limit or quota exceeded for Anthropic (429). Detail: ${redactSecretsFromText(errorDetail, apiKey)}`
        );
      }

      throw new Error(
        `Anthropic API error (HTTP ${response.status}): ${redactSecretsFromText(errorDetail, apiKey)}`
      );
    }

    let fullContent = '';
    let fullReasoning = '';
    let stopReason: string | undefined;
    const toolCallRecords: import('../tools/types').ToolCallRecord[] = [];
    const activeToolMap = new Map<number, { id: string; name: string; argsJson: string }>();
    const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    if (!response.body) {
      throw new Error('Empty response body received from Anthropic API.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            let eventObj: any;
            try {
              eventObj = JSON.parse(dataStr);
            } catch {
              continue;
            }

            // Handle Anthropic event types
            const eventType = eventObj.type;

            if (eventType === 'message_start') {
              if (eventObj.message?.usage) {
                usage.promptTokens = eventObj.message.usage.input_tokens || 0;
              }
              if (eventObj.message?.stop_reason) {
                stopReason = eventObj.message.stop_reason;
              }
            } else if (eventType === 'content_block_start') {
              const blockIndex = eventObj.index ?? 0;
              const block = eventObj.content_block;
              if (block?.type === 'tool_use') {
                activeToolMap.set(blockIndex, {
                  id: block.id || `call_${Date.now()}_${blockIndex}`,
                  name: block.name || '',
                  argsJson: '',
                });
              }
            } else if (eventType === 'content_block_delta') {
              const blockIndex = eventObj.index ?? 0;
              const delta = eventObj.delta;
              if (delta?.type === 'text_delta' && delta.text) {
                fullContent += delta.text;
                onChunk({ contentDelta: delta.text });
              } else if (delta?.type === 'thinking_delta' && delta.thinking) {
                fullReasoning += delta.thinking;
                onChunk({ reasoningDelta: delta.thinking });
              } else if (delta?.type === 'input_json_delta' && delta.partial_json) {
                const active = activeToolMap.get(blockIndex);
                if (active) {
                  active.argsJson += delta.partial_json;
                  onChunk({
                    toolCallDelta: {
                      id: active.id,
                      name: active.name,
                      argumentsDelta: delta.partial_json,
                    },
                  });
                }
              }
            } else if (eventType === 'content_block_stop') {
              const blockIndex = eventObj.index ?? 0;
              const active = activeToolMap.get(blockIndex);
              if (active) {
                let parsedArgs: any = {};
                try {
                  parsedArgs = JSON.parse(active.argsJson || '{}');
                } catch {
                  parsedArgs = { raw: active.argsJson };
                }
                const { ToolExecutor } = await import('../tools/toolExecutor.ts');
                toolCallRecords.push(
                  ToolExecutor.createToolCallRecord(active.name, parsedArgs, active.id)
                );
                activeToolMap.delete(blockIndex);
              }
            } else if (eventType === 'message_delta') {
              if (eventObj.delta?.stop_reason) {
                stopReason = eventObj.delta.stop_reason;
              }
              if (eventObj.usage?.output_tokens) {
                usage.completionTokens = eventObj.usage.output_tokens;
                usage.totalTokens = usage.promptTokens + usage.completionTokens;
              }
            } else if (eventType === 'error') {
              throw new Error(
                `Anthropic stream error: ${redactSecretsFromText(
                  eventObj.error?.message || JSON.stringify(eventObj.error),
                  apiKey
                )}`
              );
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Flush any pending tool call blocks that lacked content_block_stop
    if (activeToolMap.size > 0) {
      const { ToolExecutor } = await import('../tools/toolExecutor.ts');
      for (const [, active] of activeToolMap.entries()) {
        let parsedArgs: any = {};
        try {
          parsedArgs = JSON.parse(active.argsJson || '{}');
        } catch {
          parsedArgs = { raw: active.argsJson };
        }
        toolCallRecords.push(
          ToolExecutor.createToolCallRecord(active.name, parsedArgs, active.id)
        );
      }
      activeToolMap.clear();
    }

    if (!fullContent.trim() && toolCallRecords.length === 0 && fullReasoning.trim()) {
      throw new Error(
        'Provider Compatibility Error: Model produced reasoning tokens but no assistant answer content. Ensure the selected model and provider configuration support text completions.'
      );
    }

    onChunk({ isComplete: true, actualUsage: usage });

    return {
      fullContent,
      reasoning: fullReasoning || undefined,
      toolCalls: toolCallRecords.length > 0 ? toolCallRecords : undefined,
      usage,
      stopReason,
    };
  }

  public async verifyApiKey(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<ApiKeyVerificationResult> {
    const key = cleanApiKey(apiKey || keyManager.getApiKey(this.id));
    if (!key) {
      return {
        success: false,
        message: 'No API key provided. Enter your Anthropic API key.',
        endpointTested: '',
        errorCategory: 'config',
        keyState: 'unverified',
        suggestedAction: 'Enter an Anthropic API key (format: sk-ant-...) and retry verification.',
      };
    }

    const testUrl = this.constructEndpoint('/models', baseUrl);
    const targetOrigin = extractOrigin(testUrl);
    if (!keyManager.isOriginAuthorized(this.id, targetOrigin)) {
      return {
        success: false,
        message: `Destination origin "${targetOrigin}" is not authorized for provider "anthropic".`,
        endpointTested: testUrl,
        errorCategory: 'config',
        keyState: 'unverified',
        suggestedAction: 'Verify the Base URL matches authorized Anthropic endpoints.',
      };
    }

    const headers = this.resolveHeaders(key, customHeaders);
    const startTime = Date.now();

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal,
        redirect: 'error',
      });
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          httpStatus: response.status,
          latencyMs,
          endpointTested: testUrl,
          message: `Anthropic API key verified successfully via GET /v1/models (${latencyMs}ms).`,
          keyState: 'valid',
          diagnosticCase: 'A',
        };
      }

      let errorMsg = '';
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorMsg = await response.text();
      }

      if (response.status === 401) {
        return {
          success: false,
          httpStatus: 401,
          latencyMs,
          endpointTested: testUrl,
          message: `Authentication Failed (401): Invalid API key for Anthropic. Upstream: ${redactSecretsFromText(
            errorMsg || 'invalid x-api-key',
            key
          )}`,
          errorCategory: 'auth',
          keyState: 'invalid',
          diagnosticCase: 'B',
          suggestedAction: 'Check your Anthropic API key in console.anthropic.com/settings/keys and re-enter.',
        };
      }

      return {
        success: false,
        httpStatus: response.status,
        latencyMs,
        endpointTested: testUrl,
        message: `Anthropic returned HTTP ${response.status}: ${redactSecretsFromText(errorMsg, key)}`,
        errorCategory: response.status === 429 ? 'rate_limit' : 'server',
        keyState: 'unverified',
        diagnosticCase: 'E',
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const rawMsg = err?.message || String(err);

      if (/redirect/i.test(rawMsg)) {
        return {
          success: false,
          latencyMs,
          endpointTested: testUrl,
          message: 'HTTP redirect detected and rejected to prevent credential forwarding.',
          errorCategory: 'config',
          keyState: 'unverified',
          suggestedAction: 'Use the canonical direct Anthropic API URL (https://api.anthropic.com/v1).',
        };
      }

      if (/network|cors|failed to fetch|load failed/i.test(rawMsg)) {
        return {
          success: false,
          latencyMs,
          endpointTested: testUrl,
          message: `Browser CORS or network failure connecting to Anthropic (${testUrl}). Note: Anthropic restricts direct browser CORS requests.`,
          errorCategory: 'cors',
          keyState: 'unverified',
          diagnosticCase: 'D',
          suggestedAction: 'To use Anthropic directly in browser, configure a CORS proxy or use OpenRouter which natively supports browser CORS.',
        };
      }

      return {
        success: false,
        latencyMs,
        endpointTested: testUrl,
        message: `Connection failed: ${redactSecretsFromText(rawMsg, key)}`,
        errorCategory: 'network',
        keyState: 'unverified',
      };
    }
  }

  public async fetchAvailableModels(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<ModelDiscoveryResult> {
    const key = cleanApiKey(apiKey || keyManager.getApiKey(this.id));
    const testUrl = this.constructEndpoint('/models', baseUrl);
    const headers = this.resolveHeaders(key, customHeaders);

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal,
        redirect: 'error',
      });

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
          errText = await response.text();
        }
        return {
          success: false,
          models: [],
          httpStatus: response.status,
          error: `HTTP ${response.status}: ${redactSecretsFromText(errText, key)}`,
          errorCategory: response.status === 401 ? 'auth' : 'server',
        };
      }

      const json = await response.json();
      const rawList = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const discovered: DiscoveredModel[] = rawList.map((m: any) => ({
        id: m.id || m.name,
        name: m.display_name || m.id || m.name,
        description: `Anthropic Claude model (${m.id})`,
        contextWindow: 200000,
        ownedBy: 'Anthropic',
        supportsToolCalling: true,
      }));

      return {
        success: true,
        models: discovered.length > 0 ? discovered : this.models.map((m) => ({
          id: m.id,
          name: m.name,
          contextWindow: m.contextWindow,
          supportsToolCalling: m.supportsToolCalling,
          description: m.description,
        })),
        httpStatus: 200,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isCors = /cors|network|failed to fetch/i.test(msg);
      return {
        success: false,
        models: this.models.map((m) => ({
          id: m.id,
          name: m.name,
          contextWindow: m.contextWindow,
          supportsToolCalling: m.supportsToolCalling,
          description: m.description,
        })),
        error: isCors
          ? 'Browser CORS restriction prevented dynamic model listing from api.anthropic.com. Using bundled catalog.'
          : redactSecretsFromText(msg, key),
        errorCategory: isCors ? 'cors' : 'network',
      };
    }
  }

  public async testConnection(
    apiKey: string,
    baseUrl?: string,
    modelId?: string,
    customHeaders?: Record<string, string>,
    consentToInference = false
  ): Promise<ConnectionDiagnosticResult> {
    const key = cleanApiKey(apiKey);
    if (!key) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No API key provided. Enter your Anthropic API key.',
        errorCategory: 'config',
        suggestedAction: 'Enter an Anthropic API key.',
      };
    }

    // First attempt non-inference key verification via GET /v1/models
    const verifyResult = await this.verifyApiKey(key, baseUrl, customHeaders);
    if (verifyResult.success) {
      return {
        success: true,
        latencyMs: verifyResult.latencyMs || 0,
        message: `Anthropic connection verified successfully (${verifyResult.latencyMs}ms).`,
        endpointTested: verifyResult.endpointTested,
        httpStatus: 200,
        detectedModels: this.models.map((m) => m.id),
      };
    }

    if (verifyResult.errorCategory === 'auth') {
      return {
        success: false,
        latencyMs: verifyResult.latencyMs || 0,
        message: verifyResult.message,
        endpointTested: verifyResult.endpointTested,
        httpStatus: 401,
        errorCategory: 'auth',
        suggestedAction: verifyResult.suggestedAction,
      };
    }

    if (verifyResult.errorCategory === 'cors') {
      return {
        success: false,
        latencyMs: verifyResult.latencyMs || 0,
        message: verifyResult.message,
        endpointTested: verifyResult.endpointTested,
        corsRestricted: true,
        errorCategory: 'cors',
        suggestedAction: 'Anthropic blocks direct browser calls via CORS. Use OpenRouter for browser BYOK or route through a CORS proxy.',
      };
    }

    if (!consentToInference) {
      return {
        success: false,
        latencyMs: 0,
        message: 'Non-inference verification was inconclusive. Enable billable probe consent to test inference.',
        errorCategory: 'config',
        suggestedAction: 'Check "I consent to a billable test probe" to send a minimal request.',
      };
    }

    // Billable inference test
    const startTime = Date.now();
    try {
      const targetModel = modelId || this.models[0].id;
      await this.streamChat(
        [{ role: 'user', content: 'Ping' }],
        {
          apiKey: key,
          baseUrl,
          model: targetModel,
          maxTokens: 5,
          customHeaders,
        },
        () => {}
      );
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        latencyMs,
        message: `Anthropic test probe succeeded using model "${targetModel}" (${latencyMs}ms).`,
        httpStatus: 200,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const msg = err?.message || String(err);
      return {
        success: false,
        latencyMs,
        message: msg,
        errorCategory: /401/i.test(msg) ? 'auth' : /cors/i.test(msg) ? 'cors' : 'server',
      };
    }
  }
}
