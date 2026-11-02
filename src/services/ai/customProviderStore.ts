/**
 * Custom Provider Store for GB Assist.
 *
 * Manages user-configured custom AI providers, custom models, and HTTP headers.
 * Security Rules:
 * - Persists NON-SECRET provider metadata only to localStorage.
 * - API keys and credentials are NEVER persisted here (managed strictly by KeyManager).
 * - Non-destructive migration preserves existing legacy configurations.
 */

import { CustomProviderDefinition, CustomModelConfig } from './types.ts';
import { validateEndpointUrl, normalizeBaseUrl, validateCustomHeaders } from './providers/openaiCompatibleProvider.ts';

const STORAGE_KEY = 'gbcoder_custom_providers_v1';
const LEGACY_STORAGE_KEY = 'gbcoder_ai_custom_config';

const RESERVED_PROVIDER_IDS = new Set(['gemini', 'openrouter', 'openai', 'custom', 'mock']);

export interface ProviderValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export class CustomProviderStore {
  private providers: CustomProviderDefinition[] = [];
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadFromStorage();
    this.migrateLegacyConfig();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.providers = parsed.filter(
            (p) => p && typeof p.id === 'string' && typeof p.baseUrl === 'string'
          );
        }
      }
    } catch {
      this.providers = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      // Scrub any accidental secret keys before persisting
      const sanitized = this.providers.map((p) => ({
        id: p.id,
        name: p.name,
        baseUrl: p.baseUrl,
        description: p.description || '',
        models: p.models || [],
        headers: (p.headers || []).map((h) => ({
          id: h.id,
          name: h.name,
          // If marked secret, do not persist the plaintext value
          value: h.isSecret ? '' : h.value,
          isSecret: Boolean(h.isSecret),
        })),
        contextWindow: p.contextWindow,
        maxTokens: p.maxTokens,
        supportsStreaming: p.supportsStreaming ?? true,
        supportsToolCalling: p.supportsToolCalling ?? false,
        timeoutMs: p.timeoutMs,
        createdAt: p.createdAt || Date.now(),
        updatedAt: Date.now(),
      }));

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // storage unavailable or quota exceeded
    }
  }

  /**
   * Non-destructively migrates any legacy single-custom provider configuration.
   */
  public migrateLegacyConfig(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacyRaw) return;

      const legacy = JSON.parse(legacyRaw);
      if (legacy && typeof legacy.baseUrl === 'string' && legacy.baseUrl.trim()) {
        const existing = this.providers.find((p) => p.id === 'custom' || p.baseUrl === legacy.baseUrl);
        if (!existing) {
          const migratedModels: CustomModelConfig[] = Array.isArray(legacy.models) && legacy.models.length > 0
            ? legacy.models
            : legacy.selectedModel
            ? [{ id: legacy.selectedModel, name: legacy.selectedModel }]
            : [{ id: 'custom-model', name: 'Custom Endpoint Model' }];

          this.providers.push({
            id: 'legacy-custom',
            name: legacy.name || 'Custom Endpoint',
            baseUrl: normalizeBaseUrl(legacy.baseUrl),
            description: 'Migrated from previous custom provider settings',
            models: migratedModels,
            supportsStreaming: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          this.saveToStorage();
        }
      }
    } catch {
      // non-blocking migration
    }
  }

  public getAll(): CustomProviderDefinition[] {
    this.ensureInitialized();
    return [...this.providers];
  }

  public getById(id: string): CustomProviderDefinition | undefined {
    this.ensureInitialized();
    return this.providers.find((p) => p.id === id);
  }

  /**
   * Validates custom provider configuration according to safety and protocol requirements.
   */
  public validate(
    def: Partial<CustomProviderDefinition>,
    isNew = false
  ): ProviderValidationResult {
    const errors: Record<string, string> = {};

    // 1. Provider ID validation
    const rawId = (def.id || '').trim();
    if (!rawId) {
      errors.id = 'Provider ID is required.';
    } else if (!/^[a-z0-9_-]{2,32}$/.test(rawId)) {
      errors.id = 'Provider ID must be 2-32 characters and contain only lowercase letters, numbers, hyphens, and underscores.';
    } else if (isNew && RESERVED_PROVIDER_IDS.has(rawId)) {
      errors.id = `"${rawId}" is a reserved system provider ID. Please choose a different ID.`;
    } else if (isNew && this.providers.some((p) => p.id === rawId)) {
      errors.id = `A provider with ID "${rawId}" already exists.`;
    }

    // 2. Display Name validation
    const rawName = (def.name || '').trim();
    if (!rawName) {
      errors.name = 'Display Name is required.';
    } else if (rawName.length > 64) {
      errors.name = 'Display Name must be 64 characters or fewer.';
    }

    // 3. Base URL validation
    const rawUrl = (def.baseUrl || '').trim();
    if (!rawUrl) {
      errors.baseUrl = 'Base URL is required.';
    } else {
      const urlCheck = validateEndpointUrl(rawUrl);
      if (!urlCheck.valid) {
        errors.baseUrl = urlCheck.error || 'Invalid Base URL.';
      }
    }

    // 4. Models validation
    const models = def.models || [];
    if (models.length === 0) {
      errors.models = 'At least one model must be registered.';
    } else {
      const seenIds = new Set<string>();
      for (let i = 0; i < models.length; i++) {
        const m = models[i];
        const mId = (m.id || '').trim();
        if (!mId) {
          errors[`model_${i}`] = 'Model ID cannot be empty.';
        } else if (seenIds.has(mId)) {
          errors[`model_${i}`] = `Duplicate model ID "${mId}". Each model ID must be unique within this provider.`;
        } else {
          seenIds.add(mId);
        }
      }
    }

    // 5. Headers validation
    if (def.headers && def.headers.length > 0) {
      const headerCheck = validateCustomHeaders(def.headers);
      if (!headerCheck.valid) {
        errors.headers = headerCheck.error || 'Invalid headers configuration.';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Saves or updates a custom provider definition.
   */
  public save(def: CustomProviderDefinition): { success: boolean; error?: string } {
    this.ensureInitialized();
    const existingIndex = this.providers.findIndex((p) => p.id === def.id);
    const validation = this.validate(def, existingIndex === -1);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const cleanDef: CustomProviderDefinition = {
      ...def,
      id: def.id.trim().toLowerCase(),
      name: def.name.trim(),
      baseUrl: normalizeBaseUrl(def.baseUrl),
      models: def.models.map((m) => ({
        ...m,
        id: m.id.trim(),
        name: (m.name || m.id).trim(),
      })),
      headers: (def.headers || []).filter((h) => h.name.trim()),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      this.providers[existingIndex] = cleanDef;
    } else {
      this.providers.push({
        ...cleanDef,
        createdAt: Date.now(),
      });
    }

    this.saveToStorage();
    return { success: true };
  }

  /**
   * Deletes a custom provider by ID.
   */
  public delete(id: string): boolean {
    this.ensureInitialized();
    const initialLen = this.providers.length;
    this.providers = this.providers.filter((p) => p.id !== id);
    if (this.providers.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

export const customProviderStore = new CustomProviderStore();
