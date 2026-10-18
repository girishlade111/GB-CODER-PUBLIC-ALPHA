/**
 * Central Provider Registry for GB Assist (Phase 3A).
 *
 * Manages registered model providers, available models, base URLs,
 * and connection diagnostics.
 */

import { AiProviderId, AiModelInfo, ConnectionDiagnosticResult } from './types.ts';
import { IAiProvider } from './providers/baseProvider.ts';
import { OpenAiCompatibleProvider } from './providers/openaiCompatibleProvider.ts';
import { GeminiProvider } from './providers/geminiProvider.ts';
import { MockProvider } from './providers/mockProvider.ts';
import { keyManager } from './keyManager.ts';

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

  public async testProviderConnection(
    id: AiProviderId,
    baseUrl?: string
  ): Promise<ConnectionDiagnosticResult> {
    const provider = this.getProvider(id);
    const key = keyManager.getApiKey(id);
    return provider.testConnection(key, baseUrl);
  }
}

export const providerRegistry = new ProviderRegistry();
