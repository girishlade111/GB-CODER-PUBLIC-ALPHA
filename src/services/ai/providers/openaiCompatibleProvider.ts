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
  ModelDiscoveryResult,
  ApiKeyVerificationResult,
} from '../types.ts';
import { IAiProvider, StreamChatOptions } from './baseProvider.ts';
import { discoverModels } from '../modelDiscoveryService.ts';
import { keyManager, extractOrigin, cleanApiKey } from '../keyManager.ts';

/**
 * Redacts API keys, credentials, and tokens from error messages and URLs.
 * Defensive against non-string inputs (objects, arrays, errors, numbers)
 * to completely eliminate any "TypeError: result.split is not a function".
 */
export function redactSecretsFromText(text: unknown, customSecret?: string): string {
  if (text === null || text === undefined) return '';
  let str: string;
  if (typeof text === 'string') {
    str = text;
  } else if (text instanceof Error) {
    str = text.message || String(text);
  } else if (typeof text === 'object') {
    try {
      str = JSON.stringify(text);
    } catch {
      str = String(text);
    }
  } else {
    str = String(text);
  }

  if (!str) return '';
  let result = str;

  const redactKeyAndPrefixes = (key: string) => {
    if (!key || key.length < 6) return;
    result = result.split(key).join('[REDACTED_API_KEY]');
    if (key.length >= 8) {
      const prefix = key.slice(0, 6);
      const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const maskRegex = new RegExp(`${escapedPrefix}[A-Za-z0-9_.*-]{2,}`, 'gi');
      result = result.replace(maskRegex, '[REDACTED_API_KEY]');
    }
  };

  if (typeof customSecret === 'string') {
    redactKeyAndPrefixes(customSecret);
  }

  try {
    const activeKeys = keyManager.getAllActiveKeys();
    for (const k of activeKeys) {
      redactKeyAndPrefixes(k);
    }
  } catch {}

  // Redact words containing asterisks masking keys (e.g. token_val_***)
  result = result.replace(/\b[A-Za-z0-9_-]{4,}\*+[A-Za-z0-9_.*-]*\b/g, '[REDACTED_API_KEY]');

  // Redact URL query parameter keys: ?key=... or &key=... or &api_key=...
  result = result.replace(/([?&](?:key|api_key|token)=)[^&\s"'`]+/gi, '$1[REDACTED_API_KEY]');
  // Redact Bearer tokens
  result = result.replace(/Bearer\s+[A-Za-z0-9_.*-]{6,}/gi, 'Bearer [REDACTED_SECRET]');
  // Redact opaque and standard key parameters (e.g. api_key: "...", key: "...")
  result = result.replace(/api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9_.*-]{4,}['"]?/gi, 'api_key: [REDACTED_API_KEY]');
  // Redact standard and partially masked API key patterns
  result = result.replace(/sk-or-v1-[A-Za-z0-9_.*-]{4,}/gi, '[REDACTED_API_KEY]');
  result = result.replace(/sk-[A-Za-z0-9_.*-]{4,}/gi, '[REDACTED_API_KEY]');
  result = result.replace(/AIzaSy[A-Za-z0-9_.*-]{4,}/gi, '[REDACTED_API_KEY]');
  result = result.replace(/gsk_[A-Za-z0-9_.*-]{4,}/gi, '[REDACTED_API_KEY]');
  // Redact "Incorrect API key provided: ..." messages
  result = result.replace(/(?:Incorrect|Invalid) API key (?:provided:?\s*)([^\s"'`]+)/gi, 'Invalid API key provided: [REDACTED_API_KEY]');
  return result;
}

/**
 * Normalizes user-entered base URLs, stripping trailing slashes and
 * preventing duplicate /chat/completions suffixes.
 */
export function normalizeBaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/chat/completions')) {
    url = url.slice(0, -'/chat/completions'.length);
  }
  return url.replace(/\/+$/, '');
}

/**
 * Validates custom HTTP headers against injection and dangerous overrides.
 */
export function validateCustomHeaders(
  headers?: Record<string, string> | Array<{ name: string; value: string }> | null
): {
  valid: boolean;
  sanitized: Record<string, string>;
  error?: string;
} {
  const result: Record<string, string> = {};
  if (!headers) {
    return { valid: true, sanitized: result };
  }
  const entries = Array.isArray(headers)
    ? headers.map((h) => [h.name, h.value] as const)
    : Object.entries(headers);

  for (const [rawKey, rawVal] of entries) {
    const key = (rawKey || '').trim();
    const val = (rawVal || '').trim();
    if (!key && !val) continue;
    if (!key) {
      return { valid: false, sanitized: {}, error: 'Header name cannot be empty.' };
    }
    // Check RFC 7230 token characters for header names: letters, digits, hyphens, underscores
    if (!/^[A-Za-z0-9_-]+$/.test(key)) {
      return {
        valid: false,
        sanitized: {},
        error: `Invalid header name "${key}". Only alphanumeric characters, hyphens, and underscores are allowed.`,
      };
    }
    // Reject newline/control character injection in name or value
    const hasControlChar = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if ((c >= 0 && c <= 31) || c === 127) return true;
      }
      return false;
    };
    if (hasControlChar(key) || hasControlChar(val)) {
      return {
        valid: false,
        sanitized: {},
        error: `Header "${key}" contains prohibited control characters or newlines.`,
      };
    }
    // Disallow overriding critical browser-controlled headers
    const lowerKey = key.toLowerCase();
    if (['host', 'content-length', 'transfer-encoding', 'connection'].includes(lowerKey)) {
      return {
        valid: false,
        sanitized: {},
        error: `Header "${key}" cannot be overridden for browser security.`,
      };
    }
    result[key] = val;
  }

  return { valid: true, sanitized: result };
}

/**
 * Validates custom endpoint URLs for security.
 * Enforces HTTPS for remote hosts while permitting plain HTTP strictly for genuine loopback.
 * Rejects 0.0.0.0 as an invalid/insecure client destination.
 */
export function validateEndpointUrl(endpointUrl: string): { valid: boolean; error?: string } {
  if (!endpointUrl || typeof endpointUrl !== 'string') {
    return { valid: false, error: 'Endpoint URL cannot be empty.' };
  }
  const trimmed = endpointUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: `Invalid URL format: "${endpointUrl}".` };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are supported.` };
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash) return { valid: false, error: 'Endpoint URLs cannot contain credentials, query parameters or fragments.' };

  const hostname = parsed.hostname.toLowerCase();

  // Never treat 0.0.0.0 as an approved browser-client loopback destination
  if (hostname === '0.0.0.0') {
    return {
      valid: false,
      error: 'Insecure destination: "0.0.0.0" is not an approved browser-client loopback destination. Use "localhost" or "127.0.0.1" for local development.',
    };
  }

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1';

  if (parsed.protocol === 'http:' && !isLocal) {
    return {
      valid: false,
      error: `Insecure HTTP endpoint detected for remote host "${parsed.hostname}". HTTPS is required to protect your API keys in transit.`,
    };
  }

  return { valid: true };
}

export class OpenAiCompatibleProvider implements IAiProvider {
  public readonly id: AiProviderId;
  public readonly name: string;
  public readonly defaultBaseUrl: string;
  private defaultModels: AiModelInfo[];
  private catalogRefreshed = false;
  private customHeaders: Record<string, string> = {};
  private baseUrlOverride?: string;

  constructor(
    id: AiProviderId,
    name: string,
    defaultBaseUrl: string,
    defaultModels: AiModelInfo[],
    customHeaders?: Record<string, string>
  ) {
    this.id = id;
    this.name = name;
    this.defaultBaseUrl = defaultBaseUrl;
    this.defaultModels = defaultModels;
    if (customHeaders) {
      this.customHeaders = customHeaders;
    }
  }

  public setBaseUrlOverride(url?: string): void {
    this.baseUrlOverride = url ? normalizeBaseUrl(url) : undefined;
  }

  public getBaseUrl(): string {
    return this.baseUrlOverride || this.defaultBaseUrl;
  }

  public getAvailableModels(): AiModelInfo[] {
    return this.defaultModels;
  }

  public setModels(models: AiModelInfo[]): void {
    this.defaultModels = models;
    this.catalogRefreshed = true;
  }

  public setCustomHeaders(headers: Record<string, string>): void {
    this.customHeaders = headers;
  }

  public getCustomHeaders(): Record<string, string> {
    return { ...this.customHeaders };
  }

  private resolveHeaders(apiKey?: string, extraHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Apply custom headers first
    const mergedExtra = { ...this.customHeaders, ...(extraHeaders || {}) };
    for (const [k, v] of Object.entries(mergedExtra)) {
      if (k && v) {
        headers[k] = v;
      }
    }

    // Set canonical Authorization header if apiKey is present
    const cleanedKey = cleanApiKey(apiKey);
    if (cleanedKey) {
      // Remove any existing case-variant Authorization headers to prevent duplicate header fields
      for (const headerKey of Object.keys(headers)) {
        if (headerKey.toLowerCase() === 'authorization') {
          delete headers[headerKey];
        }
      }
      headers['Authorization'] = `Bearer ${cleanedKey}`;
    }

    if (this.id === 'openrouter') {
      headers['HTTP-Referer'] = 'https://code.ladestack.in';
      headers['X-Title'] = 'GB Coder (LadeStack)';
    }

    return headers;
  }

  public async streamChat(
    messages: Array<import('./baseProvider.ts').ProviderChatMessage | { role: 'user' | 'assistant' | 'system'; content: string }>,
    options: StreamChatOptions,
    onChunk: (chunk: ChatCompletionChunk) => void
  ): Promise<{
    fullContent: string;
    reasoning?: string;
    toolCalls?: import('../tools/types').ToolCallRecord[];
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  }> {
    if (this.catalogRefreshed && !this.defaultModels.some((m) => m.id === options.model)) {
      throw new Error(`Selected model is unavailable: ${options.model}. Refresh models and explicitly select an available model.`);
    }
    const requestSignal = AbortSignal.any([...(options.signal ? [options.signal] : []), AbortSignal.timeout(90000)]);
    const rawBaseUrl = options.baseUrl || this.baseUrlOverride || this.defaultBaseUrl;
    const urlValidation = validateEndpointUrl(rawBaseUrl);
    if (!urlValidation.valid) {
      throw new Error(`Endpoint Configuration Error: ${urlValidation.error}`);
    }

    const baseUrl = normalizeBaseUrl(rawBaseUrl);
    const url = `${baseUrl}/chat/completions`;
    const targetOrigin = extractOrigin(url);

    const effectiveApiKey = options.apiKey || keyManager.getApiKey(this.id);
    if (effectiveApiKey && effectiveApiKey.trim()) {
      const authorized = keyManager.isKeyOrProviderAuthorized(
        this.id,
        effectiveApiKey,
        targetOrigin,
        this.defaultBaseUrl
      );
      if (!authorized) {
        throw new Error(
          `Security Exception: Outbound request to "${targetOrigin}" rejected. Destination origin is not authorized for provider "${this.id}" credentials.`
        );
      }
    }

    const hasAuth = Boolean(
      effectiveApiKey ||
      this.customHeaders['Authorization'] ||
      options.customHeaders?.['Authorization']
    );
    if (!hasAuth && (this.id === 'openai' || this.id === 'openrouter')) {
      throw new Error(`API key required for ${this.name}. Configure your key in GB Assist settings.`);
    }

    const formattedMessages = messages.map((m: any, mIdx: number) => {
      if (m.role === 'tool') {
        return {
          role: 'tool',
          tool_call_id: m.toolCallId || m.id || `call_${mIdx}`,
          name: m.name,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? ''),
        };
      }
      if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
        return {
          role: 'assistant',
          content: m.content || null,
          tool_calls: m.toolCalls.map((tc: any, tcIdx: number) => ({
            id: tc.id || `call_${mIdx}_${tcIdx}`,
            type: 'function',
            function: {
              name: tc.toolName || tc.name,
              arguments: tc.rawArgs || (typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args || {})),
            },
          })),
        };
      }
      return {
        role: m.role,
        content: m.content || '',
      };
    });

    const requestBody: Record<string, unknown> = {
      model: options.model,
      messages: formattedMessages,
      stream: true,
      ...(this.id === 'openai' || this.id === 'openrouter' ? { stream_options: { include_usage: true } } : {}),
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
        headers: this.resolveHeaders(effectiveApiKey, options.customHeaders),
        body: JSON.stringify(requestBody),
        signal: requestSignal,
        redirect: 'manual',
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
      throw new Error(`Connection error with ${this.name}: ${redactSecretsFromText(msg, options.apiKey)}`);
    }

    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
      throw new Error(
        `Security Exception: HTTP redirect from ${url} was rejected to prevent authorization header and credential leakage to an unauthorized destination.`
      );
    }

    if (!response.ok) {
      let rawErrorText = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          rawErrorText = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          rawErrorText = errorJson.error;
        }
      } catch {
        // non-json response
      }

      const errorText = redactSecretsFromText(rawErrorText, effectiveApiKey);

      if (response.status === 401 || response.status === 403) {
        const detailSuffix = errorText ? `: ${errorText}` : '';
        throw new Error(`Authentication Failed (${response.status}): Invalid API key for ${this.name}${detailSuffix}`);
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const retrySuffix = retryAfter ? ` (retry after ${retryAfter}s)` : '';
        throw new Error(`Rate Limit Exceeded (429) on ${this.name}${retrySuffix}: ${errorText}`);
      }
      if (response.status === 400 && (errorText.toLowerCase().includes('tool') || errorText.toLowerCase().includes('function'))) {
        throw new Error(`Model Incompatible: Selected model "${options.model}" does not support tool calling. Error: ${errorText}`);
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
    let parsedUsage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined = undefined;
    const toolCallAccumulators = new Map<number, { id: string; name: string; arguments: string }>();

    const processEvent = (event: string): boolean => {
      const data = event.split(/\r?\n/).filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart()).join('\n').trim();
      if (!data) return false;
      if (data === '[DONE]') return true;
      let parsed;
      try { parsed = JSON.parse(data); }
      catch { throw new Error('Invalid SSE: provider returned a malformed JSON event. Retry or check streaming compatibility.'); }
      if (parsed.error) throw new Error(`Provider stream error: ${redactSecretsFromText(parsed.error.message || parsed.error, options.apiKey).slice(0, 1000)}`);
      if (parsed.usage) {
        parsedUsage = { promptTokens: parsed.usage.prompt_tokens, completionTokens: parsed.usage.completion_tokens, totalTokens: parsed.usage.total_tokens };
        onChunk({ actualUsage: parsedUsage });
      }
      const delta = parsed.choices?.[0]?.delta;
      if (!delta) return false;
      if (typeof delta.content === 'string' && delta.content) {
        fullContent += delta.content;
        onChunk({ contentDelta: delta.content });
      }
      const reasoningDelta = delta.reasoning_content || delta.reasoning;
      if (typeof reasoningDelta === 'string' && reasoningDelta) {
        reasoning += reasoningDelta;
        onChunk({ reasoningDelta });
      }
      for (const tc of delta.tool_calls || []) {
        const idx = tc.index ?? 0;
        const acc = toolCallAccumulators.get(idx) || { id: tc.id || `call-${Date.now()}-${idx}`, name: '', arguments: '' };
        if (tc.id) acc.id = tc.id;
        acc.name += tc.function?.name || '';
        acc.arguments += tc.function?.arguments || '';
        toolCallAccumulators.set(idx, acc);
        onChunk({ toolCallDelta: { id: acc.id, index: idx, name: acc.name, argumentsDelta: tc.function?.arguments } });
      }
      return false;
    };
    const abortReader = () => { void reader.cancel().catch(() => {}); };
    requestSignal.addEventListener('abort', abortReader, { once: true });
    try {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        throw new Error(`Unsupported streaming response (${contentType || 'missing Content-Type'}). Expected text/event-stream.`);
      }
      let complete = false;
      while (!complete) {
        requestSignal.throwIfAborted();
        const { done, value } = await reader.read();
        requestSignal.throwIfAborted();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        if (buffer.length > 2_000_000 || fullContent.length > 2_000_000) throw new Error('Provider stream exceeded response size limit.');
        let boundary;
        while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
          const event = buffer.slice(0, boundary.index);
          buffer = buffer.slice(boundary.index + boundary[0].length);
          if (processEvent(event)) { complete = true; break; }
        }
        if (done) {
          if (!complete && buffer.trim()) processEvent(buffer);
          break;
        }
      }
      if (!fullContent.trim() && !toolCallAccumulators.size) {
        if (reasoning.trim()) {
          throw new Error(
            'Provider Compatibility Error: Model produced reasoning tokens but no assistant answer content. Ensure the selected model and provider configuration support text completions.'
          );
        } else {
          throw new Error('Empty provider response: no assistant text or tool calls. Check the selected model and streaming support.');
        }
      }
      onChunk({ isComplete: true });
    } finally {
      requestSignal.removeEventListener('abort', abortReader);
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }

    const toolCalls: import('../tools/types').ToolCallRecord[] = [];
    if (toolCallAccumulators.size > 0) {
      const { ToolExecutor } = await import('../tools/toolExecutor.ts');
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
      usage: parsedUsage,
    };
  }

  public async testConnection(
    apiKey: string,
    baseUrl?: string,
    modelId?: string,
    customHeaders?: Record<string, string>,
    consentToInference?: boolean
  ): Promise<ConnectionDiagnosticResult> {
    const start = performance.now();
    const rawBaseUrl = baseUrl || this.baseUrlOverride || this.defaultBaseUrl;
    const urlValidation = validateEndpointUrl(rawBaseUrl);
    if (!urlValidation.valid) {
      return {
        success: false,
        latencyMs: 0,
        message: `Endpoint Configuration Error: ${urlValidation.error}`,
        errorDetails: urlValidation.error,
        errorCategory: 'config',
        suggestedAction: 'Check the Base URL format. HTTPS is required for remote endpoints.',
      };
    }

    const resolvedUrl = normalizeBaseUrl(rawBaseUrl);

    // Validate custom headers if provided
    const headerValidation = validateCustomHeaders(customHeaders || this.customHeaders);
    if (!headerValidation.valid) {
      return {
        success: false,
        latencyMs: 0,
        message: `Header Configuration Error: ${headerValidation.error}`,
        errorDetails: headerValidation.error,
        errorCategory: 'config',
        suggestedAction: 'Fix or remove invalid custom headers.',
      };
    }

    // Determine target model to test
    const availableModels = this.getAvailableModels();
    const targetModel = (modelId || '').trim() || (availableModels[0]?.id || '').trim();

    if (!targetModel) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No model selected. Please select or enter a valid model ID before testing connection.',
        errorDetails: 'Missing target model ID.',
        errorCategory: 'config',
        suggestedAction: 'Add at least one model ID in the Models section or fetch available models from the provider.',
      };
    }

    // If consentToInference is explicitly false, validate configuration only without billable probe
    if (consentToInference === false) {
      return {
        success: true,
        latencyMs: 0,
        message: `Configuration is valid for ${this.name} (${resolvedUrl}). Test Connection probe requires explicit consent.`,
        endpointTested: resolvedUrl,
      };
    }

    const url = `${resolvedUrl}/chat/completions`;
    const targetOrigin = extractOrigin(url);

    if (apiKey && apiKey.trim()) {
      const authorized = keyManager.isKeyOrProviderAuthorized(
        this.id,
        apiKey,
        targetOrigin,
        this.defaultBaseUrl
      );
      if (!authorized) {
        return {
          success: false,
          latencyMs: 0,
          message: `Security Exception: Outbound request to "${targetOrigin}" rejected. Destination origin is not authorized for provider "${this.id}" credentials.`,
          errorDetails: `Unauthorized destination origin "${targetOrigin}".`,
          endpointTested: url,
          httpStatus: 403,
          errorCategory: 'auth',
          suggestedAction: 'Explicitly authorize this endpoint destination in provider settings before testing connection.',
        };
      }
    }

    try {
      const mergedHeaders = this.resolveHeaders(apiKey, headerValidation.sanitized);

      const response = await fetch(url, {
        method: 'POST',
        headers: mergedHeaders,
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
        redirect: 'manual',
      });

      const latencyMs = Math.round(performance.now() - start);

      if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
        return {
          success: false,
          latencyMs,
          message: 'Connection failed: HTTP redirect rejected to prevent credential leakage.',
          errorDetails: 'Endpoint redirected to an unauthorized destination.',
          endpointTested: url,
          httpStatus: response.status,
          errorCategory: 'auth',
          suggestedAction: 'Verify that the Base URL points directly to the final API endpoint without redirects.',
        };
      }

      if (response.ok) {
        return {
          success: true,
          latencyMs,
          message: `Connected successfully to ${this.name} (${latencyMs}ms, model: "${targetModel}").`,
          endpointTested: url,
          httpStatus: response.status,
        };
      }

      let errorMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (typeof errorJson?.error?.message === 'string') {
          errorMsg = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          errorMsg = errorJson.error;
        } else if (typeof errorJson?.message === 'string') {
          errorMsg = errorJson.message;
        } else if (typeof errorJson?.detail === 'string') {
          errorMsg = errorJson.detail;
        } else if (errorJson?.error && typeof errorJson.error === 'object') {
          errorMsg = JSON.stringify(errorJson.error);
        } else if (errorJson && typeof errorJson === 'object') {
          errorMsg = JSON.stringify(errorJson);
        }
      } catch {
        try {
          const rawText = await response.text();
          if (rawText && rawText.length < 500) {
            errorMsg = rawText;
          }
        } catch {}
      }

      let sanitizedError = redactSecretsFromText(errorMsg, apiKey);

      let errorCategory: ConnectionDiagnosticResult['errorCategory'] = 'unknown';
      let suggestedAction = 'Review provider configuration and credentials.';

      if (response.status === 401 || response.status === 403) {
        errorCategory = 'auth';
        const providerDetail = sanitizedError ? ` - ${sanitizedError}` : '';
        sanitizedError = `Authentication failed (${response.status}): Invalid API key for ${this.name}${providerDetail}`;
        suggestedAction = 'Check that your API key is valid, active, and has permissions for this endpoint.';
      } else if (response.status === 404) {
        errorCategory = 'not_found';
        suggestedAction = `The endpoint or model "${targetModel}" was not found. Verify the model ID and Base URL.`;
      } else if (response.status === 429) {
        errorCategory = 'rate_limit';
        suggestedAction = 'Provider rate limit or quota exceeded. Check your plan quota or wait before retrying.';
      } else if (response.status === 400 || response.status === 422) {
        errorCategory = 'config';
        suggestedAction = `Invalid request payload or unsupported model parameters. Verify model ID "${targetModel}".`;
      } else if (response.status >= 500) {
        errorCategory = 'server';
        suggestedAction = 'The remote AI provider server encountered an internal error. Try again later.';
      }

      return {
        success: false,
        latencyMs,
        message: `Connection failed (${response.status}): ${sanitizedError}`,
        errorDetails: sanitizedError,
        endpointTested: url,
        httpStatus: response.status,
        errorCategory,
        suggestedAction,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const msg = redactSecretsFromText(rawMsg, apiKey);
      const isCors = msg.includes('Failed to fetch') || msg.includes('NetworkError');

      return {
        success: false,
        latencyMs,
        message: isCors
          ? `Browser CORS restriction: Cannot reach ${resolvedUrl} directly from the browser. For direct browser BYOK, OpenRouter is recommended.`
          : `Network error: ${msg}`,
        corsRestricted: isCors,
        errorDetails: msg,
        endpointTested: url,
        errorCategory: isCors ? 'cors' : 'network',
        suggestedAction: isCors
          ? 'Configure CORS headers on your API server (Access-Control-Allow-Origin: *), or use OpenRouter.'
          : 'Check your internet connection and endpoint availability.',
      };
    }
  }

  public async fetchAvailableModels(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<ModelDiscoveryResult> {
    return discoverModels({
      baseUrl: baseUrl || this.baseUrlOverride || this.defaultBaseUrl,
      apiKey: apiKey || keyManager.getApiKey(this.id),
      providerId: this.id,
      customHeaders: customHeaders || this.customHeaders,
      signal,
    });
  }

  /**
   * Diagnostic Non-Inference Key Verification Gate.
   * Directly verifies credential validity without consuming tokens or sending an inference prompt.
   * Uses GET https://openrouter.ai/api/v1/key for OpenRouter, or GET /models for OpenAI.
   */
  public async verifyApiKey(
    apiKey?: string,
    baseUrl?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<ApiKeyVerificationResult> {
    const start = performance.now();
    const effectiveApiKey = cleanApiKey(apiKey || keyManager.getApiKey(this.id));
    if (!effectiveApiKey) {
      return {
        success: false,
        latencyMs: 0,
        message: `API key is required to verify ${this.name}.`,
        endpointTested: '',
        errorCategory: 'config',
        keyState: 'invalid',
        suggestedAction: 'Please enter your API key in the provider settings.',
      };
    }

    const rawBaseUrl = baseUrl || this.baseUrlOverride || this.defaultBaseUrl;
    const urlValidation = validateEndpointUrl(rawBaseUrl);
    if (!urlValidation.valid) {
      return {
        success: false,
        latencyMs: 0,
        message: `Invalid base URL: ${urlValidation.error}`,
        endpointTested: rawBaseUrl,
        errorCategory: 'config',
        keyState: 'unverified',
        suggestedAction: 'Correct the Base URL in provider settings.',
      };
    }

    const resolvedUrl = normalizeBaseUrl(rawBaseUrl);
    // Security check: Outbound origin authorization
    const isAuthorized = keyManager.isKeyOrProviderAuthorized(
      this.id,
      effectiveApiKey,
      resolvedUrl,
      this.defaultBaseUrl
    );
    if (!isAuthorized) {
      return {
        success: false,
        latencyMs: 0,
        message: `Destination Authorization Required: Origin "${extractOrigin(resolvedUrl)}" is not authorized for ${this.name} credentials.`,
        endpointTested: resolvedUrl,
        errorCategory: 'auth',
        keyState: 'unverified',
        suggestedAction: 'Reset the Base URL or explicitly authorize routing credentials to this origin.',
      };
    }

    // Determine target verification URL
    // OpenRouter has dedicated GET /key endpoint
    // OpenAI and other OpenAI-compatible endpoints verify credentials via GET /models
    let verifyEndpoint = `${resolvedUrl}/key`;
    if (this.id === 'openai') {
      verifyEndpoint = `${resolvedUrl}/models`;
    }

    const headers = this.resolveHeaders(effectiveApiKey, customHeaders);
    // GET requests should not send Content-Type: application/json
    delete headers['Content-Type'];

    const requestSignal = AbortSignal.any([
      ...(signal ? [signal] : []),
      AbortSignal.timeout(15000),
    ]);

    try {
      const response = await fetch(verifyEndpoint, {
        method: 'GET',
        headers,
        signal: requestSignal,
        redirect: 'manual',
      });

      const latencyMs = Math.round(performance.now() - start);

      if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
        return {
          success: false,
          latencyMs,
          httpStatus: response.status,
          message: `Redirect from ${verifyEndpoint} was rejected to prevent credential leakage.`,
          endpointTested: verifyEndpoint,
          errorCategory: 'auth',
          keyState: 'unverified',
          suggestedAction: 'Ensure Base URL points directly to the final API without redirects.',
        };
      }

      if (response.ok) {
        let keyDetails: ApiKeyVerificationResult['keyDetails'] = undefined;
        let detailSummary = '';
        try {
          const json = await response.json();
          if (json?.data) {
            keyDetails = {
              label: json.data.label,
              limit: json.data.limit,
              usage: json.data.usage,
              isFreeTier: json.data.is_free_tier,
              rateLimit: json.data.rate_limit,
            };
            const parts: string[] = [];
            if (json.data.label) parts.push(`Label: "${json.data.label}"`);
            if (typeof json.data.usage === 'number') parts.push(`Usage: $${json.data.usage.toFixed(4)}`);
            if (json.data.limit !== undefined) {
              parts.push(`Limit: ${json.data.limit === null ? 'Unlimited' : '$' + json.data.limit}`);
            }
            if (json.data.is_free_tier !== undefined) {
              parts.push(json.data.is_free_tier ? 'Free tier' : 'Paid tier');
            }
            if (parts.length > 0) {
              detailSummary = ` (${parts.join(', ')})`;
            }
          }
        } catch {}

        return {
          success: true,
          latencyMs,
          httpStatus: response.status,
          message: `API Key verified successfully with ${this.name}${detailSummary}.`,
          endpointTested: verifyEndpoint,
          keyState: 'valid',
          keyDetails,
        };
      }

      // Handle non-200 responses
      let rawErrorText = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          rawErrorText = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          rawErrorText = errorJson.error;
        }
      } catch {
        try {
          const text = await response.text();
          if (text && text.length < 300) rawErrorText = text;
        } catch {}
      }

      const sanitizedError = redactSecretsFromText(rawErrorText, effectiveApiKey);

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          latencyMs,
          httpStatus: response.status,
          message: `Authentication Failed (${response.status}): ${sanitizedError || 'Invalid API key'}`,
          endpointTested: verifyEndpoint,
          errorCategory: 'auth',
          keyState: 'invalid',
          suggestedAction: 'The provider rejected your API key. Generate a new key in your OpenRouter account and paste it here.',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          latencyMs,
          httpStatus: response.status,
          message: `Rate Limit Exceeded (${response.status}): ${sanitizedError}`,
          endpointTested: verifyEndpoint,
          errorCategory: 'rate_limit',
          keyState: 'rate_limited',
          suggestedAction: 'Wait a moment before retrying or check your account rate limit.',
        };
      }

      return {
        success: false,
        latencyMs,
        httpStatus: response.status,
        message: `Key verification returned HTTP ${response.status}: ${sanitizedError}`,
        endpointTested: verifyEndpoint,
        errorCategory: 'unknown',
        keyState: 'unverified',
        suggestedAction: 'Verify the Base URL and provider status.',
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const msg = redactSecretsFromText(rawMsg, effectiveApiKey);
      const isCors = msg.includes('Failed to fetch') || msg.includes('NetworkError');

      return {
        success: false,
        latencyMs,
        message: isCors
          ? `Browser CORS restriction: Cannot reach ${extractOrigin(resolvedUrl)} directly from this browser origin.`
          : `Network error verifying key: ${msg}`,
        endpointTested: verifyEndpoint,
        errorCategory: isCors ? 'cors' : 'network',
        keyState: 'unverified',
        suggestedAction: isCors
          ? 'Check your network connection or verify that the provider allows direct browser requests.'
          : 'Check your internet connection and try again.',
      };
    }
  }
}
