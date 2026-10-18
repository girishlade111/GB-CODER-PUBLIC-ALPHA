/**
 * Central Provider Registry for GB Assist (Phase 3A).
 *
 * Manages registered model providers, available models, base URLs,
 * and connection diagnostics.
 */

import {
  AiProviderId,
  AiModelInfo,
  ConnectionDiagnosticResult,
  ModelDiscoveryResult,
  ProviderCatalogEntry,
  CustomProviderDefinition,
} from './types.ts';
import { IAiProvider } from './providers/baseProvider.ts';
import { OpenAiCompatibleProvider, validateEndpointUrl } from './providers/openaiCompatibleProvider.ts';
import { GeminiProvider } from './providers/geminiProvider.ts';
import { MockProvider } from './providers/mockProvider.ts';
import { keyManager } from './keyManager.ts';
import { customProviderStore } from './customProviderStore.ts';
import { BUILT_IN_CATALOG } from './providerCatalog.ts';
import { discoverModels } from './modelDiscoveryService.ts';

const OPENROUTER_MODELS: AiModelInfo[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 200000,
    description: 'Premier coding and reasoning model',
    recommended: true,
    supportsStreaming: true,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 64000,
    description: 'Advanced reasoning model with deep thinking traces',
    recommended: false,
    supportsStreaming: true,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 128000,
    description: 'Flagship multimodal OpenAI model via OpenRouter',
    recommended: false,
    supportsStreaming: true,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 128000,
    description: 'Fast and lightweight model via OpenRouter',
    recommended: false,
    supportsStreaming: true,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 131072,
    description: 'Leading open source instruction tuned model',
    recommended: false,
    supportsStreaming: true,
  },
];

const OPENAI_MODELS: AiModelInfo[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    description: 'Fast, capable model for everyday code assistance',
    recommended: true,
    supportsStreaming: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    description: 'Flagship high-intelligence model',
    recommended: false,
    supportsStreaming: true,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    contextWindow: 200000,
    description: 'High-speed reasoning model for coding tasks',
    recommended: false,
    supportsStreaming: true,
  },
];

const CUSTOM_MODELS: AiModelInfo[] = [
  {
    id: 'custom-model',
    name: 'Custom Endpoint Model',
    provider: 'custom',
    contextWindow: 32000,
    description: 'Configurable custom OpenAI-compatible endpoint (Groq, Together, Ollama, etc.)',
    recommended: true,
    supportsStreaming: true,
  },
];

class ProviderRegistry {
  private providers = new Map<AiProviderId, IAiProvider>();
  private activeProviderId: AiProviderId = 'gemini';
  private activeModelMap = new Map<AiProviderId, string>();
  private customProviderIds = new Set<string>();

  constructor() {
    this.registerProvider(new GeminiProvider());
    this.registerProvider(
      new OpenAiCompatibleProvider(
        'openrouter',
        'OpenRouter (BYOK)',
        'https://openrouter.ai/api/v1',
        OPENROUTER_MODELS
      )
    );
    this.registerProvider(
      new OpenAiCompatibleProvider(
        'openai',
        'OpenAI (BYOK)',
        'https://api.openai.com/v1',
        OPENAI_MODELS
      )
    );
    this.registerProvider(
      new OpenAiCompatibleProvider(
        'custom',
        'Custom OpenAI-Compatible',
        'http://localhost:11434/v1',
        CUSTOM_MODELS
      )
    );
    this.registerProvider(new MockProvider());
    this.loadCustomProviders();
  }

  public loadCustomProviders(): void {
    const customList = customProviderStore.getAll();
    for (const def of customList) {
      this.registerCustomProviderInternal(def);
    }
  }

  private registerCustomProviderInternal(def: CustomProviderDefinition): void {
    const models: AiModelInfo[] = (def.models || []).map((m) => ({
      id: m.id,
      name: m.name || m.id,
      provider: def.id,
      contextWindow: m.contextWindow || def.contextWindow || 32000,
      description: `Custom model "${m.name || m.id}" on ${def.name}`,
      recommended: false,
      supportsStreaming: m.supportsStreaming ?? (def.supportsStreaming ?? true),
      supportsToolCalling: m.supportsToolCalling ?? (def.supportsToolCalling ?? false),
    }));

    const headersMap: Record<string, string> = {};
    for (const h of def.headers || []) {
      if (h.name && h.value && !h.isSecret) {
        headersMap[h.name] = h.value;
      }
    }

    const provider = new OpenAiCompatibleProvider(
      def.id,
      def.name,
      def.baseUrl,
      models,
      headersMap
    );

    this.registerProvider(provider);
    this.customProviderIds.add(def.id);
  }

  public registerCustomProvider(def: CustomProviderDefinition): { success: boolean; error?: string } {
    const saveResult = customProviderStore.save(def);
    if (!saveResult.success) {
      return saveResult;
    }
    this.registerCustomProviderInternal(def);
    return { success: true };
  }

  public removeCustomProvider(id: string): boolean {
    const deleted = customProviderStore.delete(id);
    this.providers.delete(id);
    this.customProviderIds.delete(id);
    this.activeModelMap.delete(id);

    if (this.activeProviderId === id) {
      this.activeProviderId = 'gemini';
    }
    return deleted;
  }

  public isCustomProvider(id: AiProviderId): boolean {
    return id === 'custom' || this.customProviderIds.has(id);
  }

  public getProviderCatalog(): ProviderCatalogEntry[] {
    const catalog = [...BUILT_IN_CATALOG];
    const customList = customProviderStore.getAll();
    for (const cp of customList) {
      if (!catalog.some((c) => c.id === cp.id)) {
        catalog.push({
          id: cp.id,
          name: cp.name,
          description: cp.description || `Custom provider at ${cp.baseUrl}`,
          category: 'other',
          iconName: 'Sliders',
          defaultBaseUrl: cp.baseUrl,
          browserCorsSupport: false,
          toolCallingSupport: cp.supportsToolCalling ?? 'unknown',
          streamingSupport: cp.supportsStreaming ?? true,
          defaultModels: (cp.models || []).map((m) => ({
            id: m.id,
            name: m.name || m.id,
            provider: cp.id,
            contextWindow: m.contextWindow || cp.contextWindow || 32000,
            description: `Model on ${cp.name}`,
            supportsStreaming: m.supportsStreaming ?? true,
            supportsToolCalling: m.supportsToolCalling ?? false,
          })),
        });
      }
    }
    return catalog;
  }

  public registerProvider(provider: IAiProvider): void {
    this.providers.set(provider.id, provider);
  }

  public setActiveProvider(id: AiProviderId): void {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  public setActiveModel(providerId: AiProviderId, modelId: string): void {
    this.activeModelMap.set(providerId, modelId);
  }

  public getActiveProvider(): IAiProvider {
    return this.getProvider(this.activeProviderId);
  }

  public getActiveModel(providerId: AiProviderId = this.activeProviderId): string {
    const custom = this.activeModelMap.get(providerId);
    if (custom) return custom;
    const models = this.getModelsForProvider(providerId);
    return models[0]?.id || '';
  }

  public getProvider(id: AiProviderId): IAiProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Unknown AI provider "${id}".`);
    }
    return provider;
  }

  public getAllProviders(): Array<{ id: AiProviderId; name: string; defaultBaseUrl: string }> {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      defaultBaseUrl: p.defaultBaseUrl,
    }));
  }

  public getModelsForProvider(id: AiProviderId): AiModelInfo[] {
    const provider = this.providers.get(id);
    return provider ? provider.getAvailableModels() : [];
  }

  public getAllModels(): AiModelInfo[] {
    const result: AiModelInfo[] = [];
    for (const provider of this.providers.values()) {
      result.push(...provider.getAvailableModels());
    }
    return result;
  }

  public getModelContextLimit(providerId: AiProviderId, modelId?: string): number {
    const targetModel = modelId || this.getActiveModel(providerId);
    const models = this.getModelsForProvider(providerId);
    const matched = models.find((m) => m.id === targetModel);
    if (matched && matched.contextWindow) {
      return matched.contextWindow;
    }
    // Fallback defaults per provider
    if (providerId === 'gemini') return 1048576;
    if (providerId === 'openrouter') return 128000;
    if (providerId === 'openai') return 128000;
    if (providerId === 'custom') return 32000;
    return 32000;
  }

  public validateCustomEndpoint(url: string): { valid: boolean; error?: string } {
    return validateEndpointUrl(url);
  }

  public async testProviderConnection(
    id: AiProviderId,
    baseUrl?: string,
    modelId?: string,
    customHeaders?: Record<string, string>,
    consentToInference?: boolean
  ): Promise<ConnectionDiagnosticResult> {
    let provider = this.providers.get(id);
    if (!provider) {
      provider = this.providers.get('custom');
    }
    if (!provider) {
      return {
        success: false,
        latencyMs: 0,
        message: `Provider "${id}" is not registered.`,
        errorCategory: 'config',
      };
    }
    const key = keyManager.getApiKey(id) || keyManager.getApiKey('custom');
    const targetModel = (modelId || '').trim() || this.getActiveModel(id);
    return provider.testConnection(key, baseUrl, targetModel, customHeaders, consentToInference);
  }

  public async fetchModelsForProvider(
    id: AiProviderId,
    baseUrl?: string,
    apiKey?: string,
    customHeaders?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<ModelDiscoveryResult> {
    const key = apiKey !== undefined ? apiKey : (keyManager.getApiKey(id) || keyManager.getApiKey('custom'));
    const provider = this.providers.get(id);

    if (provider && typeof provider.fetchAvailableModels === 'function') {
      return provider.fetchAvailableModels(key, baseUrl, customHeaders, signal);
    }

    if (baseUrl) {
      return discoverModels({
        baseUrl,
        apiKey: key,
        customHeaders,
        signal,
      });
    }

    return {
      success: false,
      models: [],
      error: `Automatic model discovery is not supported by ${provider?.name || id}. You can add models manually.`,
      errorCategory: 'unsupported',
      suggestedAction: 'Enter model IDs manually using the "+ Add Model" button.',
    };
  }
}

export const providerRegistry = new ProviderRegistry();
