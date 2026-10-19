/**
 * Authenticated Model Discovery Service for OpenAI-Compatible AI Providers.
 *
 * Implements capability-aware, bounded GET /models discovery:
 * - Safe URL construction preventing duplicate path segments
 * - Bearer authentication and permitted custom headers
 * - Standard OpenAI/Mistral response normalization ({ data: [{ id }] })
 * - Status code classification (400, 401, 403, 404, 405, 429, 500, CORS, Network, Timeout)
 * - Safe deduplication and bounds-checking (max 5,000 models, 8MB payload)
 * - AbortController timeout and manual cancellation support
 * - Zero billable inference probe execution
 */

import {
  DiscoveredModel,
  ModelDiscoveryResult,
} from './types.ts';
import {
  normalizeBaseUrl,
  validateEndpointUrl,
  validateCustomHeaders,
  redactSecretsFromText,
} from './providers/openaiCompatibleProvider.ts';

const MAX_DISCOVERY_MODELS = 5000;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024; // 8MB
const DEFAULT_TIMEOUT_MS = 15000;

export interface DiscoverModelsParams {
  baseUrl: string;
  apiKey?: string;
  customHeaders?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Safely constructs the models listing URL from a base URL:
 * - Strips trailing slashes
 * - Strips trailing /chat/completions or /models if already present
 * - Ensures /models is appended cleanly without duplicating /v1 or /models
 */
export function constructModelsUrl(rawBaseUrl: string): { valid: boolean; url: string; error?: string } {
  const urlCheck = validateEndpointUrl(rawBaseUrl);
  if (!urlCheck.valid) {
    return { valid: false, url: '', error: urlCheck.error || 'Invalid Base URL.' };
  }

  let base = normalizeBaseUrl(rawBaseUrl);

  // Strip duplicate endpoints if user supplied full endpoint
  if (base.endsWith('/chat/completions')) {
    base = base.slice(0, -'/chat/completions'.length);
  }
  if (base.endsWith('/models')) {
    base = base.slice(0, -'/models'.length);
  }

  base = normalizeBaseUrl(base);
  return { valid: true, url: `${base}/models` };
}

/**
 * Discovers available models from an OpenAI-compatible endpoint.
 */
export async function discoverModels(params: DiscoverModelsParams): Promise<ModelDiscoveryResult> {
  const { baseUrl, apiKey, customHeaders, signal: externalSignal, timeoutMs = DEFAULT_TIMEOUT_MS } = params;

  // 1. Construct and validate discovery URL
  const urlRes = constructModelsUrl(baseUrl);
  if (!urlRes.valid) {
    return {
      success: false,
      models: [],
      error: `Invalid URL: ${urlRes.error}`,
      errorCategory: 'config',
      suggestedAction: 'Check that the Base URL is a valid HTTPS endpoint (or loopback HTTP address).',
    };
  }
  const discoveryUrl = urlRes.url;

  // 2. Validate and prepare custom headers
  const headerValidation = validateCustomHeaders(customHeaders);
  if (!headerValidation.valid) {
    return {
      success: false,
      models: [],
      error: `Header Configuration Error: ${headerValidation.error}`,
      errorCategory: 'config',
      suggestedAction: 'Fix or remove invalid custom headers before fetching models.',
    };
  }

  // 3. Assemble request headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Merge validated custom headers
  if (headerValidation.sanitized) {
    Object.assign(headers, headerValidation.sanitized);
  }

  // Add Bearer Authorization if apiKey is supplied and not already overridden
  if (apiKey && apiKey.trim() && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  // 4. Setup AbortController with timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('Model discovery request timed out'));
  }, timeoutMs);

  const combinedAbortHandler = () => {
    timeoutController.abort(new Error('Model discovery cancelled by user or context switch'));
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      return {
        success: false,
        models: [],
        error: 'Model discovery cancelled.',
        errorCategory: 'timeout',
      };
    }
    externalSignal.addEventListener('abort', combinedAbortHandler, { once: true });
  }

  try {
    const response = await fetch(discoveryUrl, {
      method: 'GET',
      headers,
      signal: timeoutController.signal,
      redirect: 'manual',
    });


    // Check for redirect rejection
    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
      return {
        success: false,
        models: [],
        httpStatus: response.status,
        error: 'Model discovery rejected: HTTP redirect received. Redirects are blocked to prevent credential leakage.',
        errorCategory: 'auth',
        suggestedAction: 'Configure the exact final Base URL without redirects.',
      };
    }

    // Handle HTTP error status codes
    if (!response.ok) {
      let rawError = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (typeof errorJson?.error?.message === 'string') {
          rawError = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          rawError = errorJson.error;
        } else if (typeof errorJson?.message === 'string') {
          rawError = errorJson.message;
        } else if (typeof errorJson?.detail === 'string') {
          rawError = errorJson.detail;
        }
      } catch {
        try {
          const text = await response.text();
          if (text && text.length < 500) rawError = text;
        } catch {}
      }

      const sanitizedError = redactSecretsFromText(rawError, apiKey);

      if (response.status === 400) {
        return {
          success: false,
          models: [],
          httpStatus: 400,
          error: `Invalid model discovery request (HTTP 400): ${sanitizedError}`,
          errorCategory: 'config',
          suggestedAction: 'Verify that the endpoint supports standard GET /models.',
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          models: [],
          httpStatus: 401,
          error: `Authentication failed (HTTP 401): ${sanitizedError}`,
          errorCategory: 'auth',
          suggestedAction: 'Check your API key. Ensure the key is valid and has permission to list models.',
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          models: [],
          httpStatus: 403,
          error: `Access forbidden (HTTP 403): ${sanitizedError}`,
          errorCategory: 'auth',
          suggestedAction: 'Your API key does not have permission to access the /models endpoint.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          models: [],
          httpStatus: 404,
          error: 'Automatic model discovery is not supported by this provider (HTTP 404). You can add a model manually.',
          errorCategory: 'not_found',
          suggestedAction: 'Use the "+ Add Model" button to specify your model ID manually.',
        };
      }

      if (response.status === 405) {
        return {
          success: false,
          models: [],
          httpStatus: 405,
          error: 'Model discovery method unsupported (HTTP 405). The provider does not accept GET on this endpoint.',
          errorCategory: 'unsupported',
          suggestedAction: 'Use the "+ Add Model" button to specify your model ID manually.',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          models: [],
          httpStatus: 429,
          error: `Provider rate limit exceeded (HTTP 429): ${sanitizedError}`,
          errorCategory: 'rate_limit',
          suggestedAction: 'Wait a moment before attempting to fetch models again.',
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          models: [],
          httpStatus: response.status,
          error: `Provider server error (HTTP ${response.status}): ${sanitizedError}`,
          errorCategory: 'server',
          suggestedAction: 'The provider service is currently unavailable. Try again later or add models manually.',
        };
      }

      return {
        success: false,
        models: [],
        httpStatus: response.status,
        error: `Model discovery failed (HTTP ${response.status}): ${sanitizedError}`,
        errorCategory: 'network',
        suggestedAction: 'Verify the Base URL and credentials.',
      };
    }

    // 5. Parse response body safely
    let data: unknown;
    try {
      const text = await response.text();
      if (text.length > MAX_RESPONSE_BYTES) {
        return {
          success: false,
          models: [],
          error: 'Model list payload exceeded maximum allowed response size (8MB).',
          errorCategory: 'malformed',
          suggestedAction: 'Use manual model entry to specify desired models.',
        };
      }
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        models: [],
        error: 'Provider returned malformed or non-JSON response from /models endpoint.',
        errorCategory: 'malformed',
        suggestedAction: 'Verify that the Base URL points to an OpenAI-compatible REST API.',
      };
    }

    // 6. Extract model array from response
    // Standard shapes: { data: [...] } or { result: [...] } or direct array [...]
    let rawList: unknown[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        rawList = obj.data;
      } else if (Array.isArray(obj.models)) {
        rawList = obj.models;
      } else if (Array.isArray(obj.result)) {
        rawList = obj.result;
      }
    }

    if (rawList.length === 0) {
      return {
        success: false,
        models: [],
        error: 'No models returned by provider for this account.',
        errorCategory: 'empty',
        suggestedAction: 'Verify that your account has access to models or enter model IDs manually.',
      };
    }

    // 7. Normalize, deduplicate and bounds-check models
    const seenIds = new Set<string>();
    const models: DiscoveredModel[] = [];

    for (const item of rawList) {
      if (models.length >= MAX_DISCOVERY_MODELS) break;
      if (!item) continue;

      let id = '';
      let name = '';
      let description: string | undefined;
      let contextWindow: number | undefined;
      let ownedBy: string | undefined;

      if (typeof item === 'string') {
        id = item.trim();
        name = id;
      } else if (typeof item === 'object') {
        const m = item as Record<string, unknown>;
        if (typeof m.id === 'string') {
          id = m.id.trim();
        } else if (typeof m.name === 'string') {
          id = m.name.trim();
        }

        if (typeof m.name === 'string' && m.name.trim()) {
          name = m.name.trim();
        } else if (typeof m.display_name === 'string' && m.display_name.trim()) {
          name = m.display_name.trim();
        } else {
          name = id;
        }

        if (typeof m.description === 'string' && m.description.trim()) {
          description = m.description.trim();
        }

        if (typeof m.context_length === 'number' && m.context_length > 0) {
          contextWindow = m.context_length;
        } else if (typeof m.context_window === 'number' && m.context_window > 0) {
          contextWindow = m.context_window;
        } else if (typeof m.max_context_tokens === 'number' && m.max_context_tokens > 0) {
          contextWindow = m.max_context_tokens;
        }

        if (!contextWindow && typeof m.max_context_length === 'number' && m.max_context_length > 0) contextWindow = m.max_context_length;

        if (typeof m.owned_by === 'string' && m.owned_by.trim()) {
          ownedBy = m.owned_by.trim();
        }
      }

      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);

      const metadata = (typeof item === 'object' && item ? item : {}) as {
        supported_parameters?: string[];
        capabilities?: { function_calling?: boolean };
        architecture?: { input_modalities?: unknown[]; output_modalities?: unknown[] };
        pricing?: { prompt?: string; completion?: string };
      };
      models.push({
        supportsToolCalling: Array.isArray(metadata.supported_parameters) ? metadata.supported_parameters.includes('tools') :
          typeof metadata.capabilities?.function_calling === 'boolean' ? metadata.capabilities.function_calling : undefined,
        inputModalities: Array.isArray(metadata.architecture?.input_modalities) ? metadata.architecture.input_modalities.filter((m: unknown) => typeof m === 'string') : undefined,
        outputModalities: Array.isArray(metadata.architecture?.output_modalities) ? metadata.architecture.output_modalities.filter((m: unknown) => typeof m === 'string') : undefined,
        pricing: metadata.pricing ? { prompt: metadata.pricing.prompt, completion: metadata.pricing.completion } : undefined,
        id,
        name,
        description,
        contextWindow,
        ownedBy,
      });
    }

    if (models.length === 0) {
      return {
        success: false,
        models: [],
        error: 'Provider response contained no valid model IDs.',
        errorCategory: 'malformed',
        suggestedAction: 'Enter model IDs manually using "+ Add Model".',
      };
    }

    return {
      success: true,
      models,
      httpStatus: response.status,
    };
  } catch (err: unknown) {

    if (err instanceof Error) {
      if (err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('timed out')) {
        return {
          success: false,
          models: [],
          error: 'Model discovery request timed out or was cancelled.',
          errorCategory: 'timeout',
          suggestedAction: 'Verify network connectivity or add models manually.',
        };
      }

      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        return {
          success: false,
          models: [],
          error: 'Browser CORS restriction: Cannot access provider models endpoint from the browser. You can still enter model IDs manually.',
          errorCategory: 'cors',
          suggestedAction: 'Enter the model ID manually using "+ Add Model". The backend or local proxy may still work for chat completions.',
        };
      }
    }

    const rawMsg = err instanceof Error ? err.message : String(err);
    const sanitized = redactSecretsFromText(rawMsg, apiKey);

    return {
      success: false,
      models: [],
      error: `Network error connecting to models endpoint: ${sanitized}`,
      errorCategory: 'network',
      suggestedAction: 'Check your internet connection, endpoint Base URL, and CORS settings.',
    };
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', combinedAbortHandler);
  }
}
