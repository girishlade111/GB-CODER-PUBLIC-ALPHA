/**
 * Secure In-Memory Key Manager for BYOK (Bring-Your-Own-Key).
 *
 * Rules:
 * - Keys are kept in memory by default.
 * - Never written to plaintext localStorage.
 * - Optional explicit user opt-in to persist in sessionStorage (scoped to browser tab).
 * - Never logged or serialized in error telemetry.
 * - Enforces explicit endpoint origin binding per provider credential.
 */

import { AiProviderId } from './types.ts';

const SESSION_PREFIX = 'gbcoder_ai_key_session_';

/**
 * Extracts and normalizes the origin (protocol + host + port) from an endpoint URL.
 */
export function extractOrigin(url: string): string {
  try {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    const parsed = new URL(trimmed);
    return parsed.origin.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Sanitizes and cleans user-entered API keys:
 * - Trims leading and trailing whitespace, carriage returns, tabs, and newlines.
 * - Strips accidental enclosing single or double quotes (e.g. "sk-..." or 'sk-...').
 * - Strips accidental leading "Bearer " prefix (e.g. copied from curl examples or header specs).
 */
export function cleanApiKey(rawKey?: string): string {
  if (!rawKey) return '';
  let cleaned = rawKey.trim();
  if (!cleaned) return '';

  // Strip enclosing double or single quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Strip accidental "Bearer " or "bearer " prefix
  if (/^bearer\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^bearer\s+/i, '').trim();
  }

  return cleaned.trim();
}

/**
 * Returns the default authorized destination origin for built-in providers.
 */
export function getDefaultProviderOrigin(provider: AiProviderId): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com';
    case 'openrouter':
      return 'https://openrouter.ai';
    case 'gemini':
      return 'https://generativelanguage.googleapis.com';
    case 'anthropic':
      return 'https://api.anthropic.com';
    case 'groq':
      return 'https://api.groq.com';
    case 'deepseek':
      return 'https://api.deepseek.com';
    case 'mistral':
      return 'https://api.mistral.ai';
    case 'together':
      return 'https://api.together.xyz';
    case 'fireworks':
      return 'https://api.fireworks.ai';
    case 'cerebras':
      return 'https://api.cerebras.ai';
    case 'deepinfra':
      return 'https://api.deepinfra.com';
    case 'nvidia':
      return 'https://integrate.api.nvidia.com';
    case 'inception':
      return 'https://api.inceptionlabs.ai';
    case 'moonshot':
      return 'https://api.moonshot.cn';
    case 'minimax':
      return 'https://api.minimax.chat';
    case 'huggingface':
      return 'https://router.huggingface.co';
    case 'dashscope':
      return 'https://dashscope.aliyuncs.com';
    case 'ollama':
      return 'http://localhost:11434';
    case 'lmstudio':
      return 'http://localhost:1234';
    case 'vllm':
      return 'http://localhost:8000';
    case 'mock':
      return '';
    default:
      return '';
  }
}

class KeyManager {
  // In-memory key store (default)
  private memoryKeys = new Map<AiProviderId, string>();

  // Authorized endpoint origins bound to each provider's credential
  private memoryOrigins = new Map<AiProviderId, Set<string>>();

  constructor() {
    this.rehydrateFromSession();
  }

  private rehydrateFromSession(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    try {
      const providers: AiProviderId[] = [
        'openai',
        'openrouter',
        'gemini',
        'anthropic',
        'groq',
        'deepseek',
        'mistral',
        'together',
        'fireworks',
        'cerebras',
        'deepinfra',
        'nvidia',
        'inception',
        'moonshot',
        'minimax',
        'huggingface',
        'ollama',
        'lmstudio',
        'vllm',
        'custom',
      ];
      for (const p of providers) {
        const storedKey = window.sessionStorage.getItem(`${SESSION_PREFIX}${p}`);
        if (storedKey) {
          const cleaned = cleanApiKey(storedKey);
          if (cleaned) {
            this.memoryKeys.set(p, cleaned);
          }
          const storedOrigins = window.sessionStorage.getItem(`${SESSION_PREFIX}${p}_origins`);
          const originSet = new Set<string>();
          if (storedOrigins) {
            try {
              const parsed = JSON.parse(storedOrigins);
              if (Array.isArray(parsed)) {
                for (const o of parsed) {
                  if (typeof o === 'string' && o) originSet.add(extractOrigin(o));
                }
              }
            } catch {}
          }
          if (originSet.size === 0) {
            const defOrig = getDefaultProviderOrigin(p);
            if (defOrig) originSet.add(defOrig);
          }
          this.memoryOrigins.set(p, originSet);
        }
      }
    } catch {
      // Ignore session storage errors
    }
  }

  /**
   * Retrieves the API key for a provider.
   * Checks in-memory cache first, then sessionStorage if previously enabled.
   */
  public getApiKey(provider: AiProviderId): string {
    const memKey = this.memoryKeys.get(provider);
    if (memKey) return cleanApiKey(memKey);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const sessionKey = window.sessionStorage.getItem(`${SESSION_PREFIX}${provider}`);
        if (sessionKey) {
          const cleaned = cleanApiKey(sessionKey);
          this.memoryKeys.set(provider, cleaned);
          return cleaned;
        }
      } catch {
        // sessionStorage restricted
      }
    }

    // Optional environment fallback for local dev if configured
    if (provider === 'gemini') {
      const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
      const envKey = meta.env?.VITE_GEMINI_API_KEY;
      if (typeof envKey === 'string' && envKey.trim()) {
        return cleanApiKey(envKey);
      }
    }

    return '';
  }

  /**
   * Sets the API key for a provider, binding it to an authorized destination origin.
   * @param provider The AI provider ID
   * @param key The API key (plain string)
   * @param persistInSession If true, stores in sessionStorage for the duration of this tab
   * @param authorizedOrigin Explicit origin authorized for this key (e.g. "https://openrouter.ai")
   */
  public setApiKey(
    provider: AiProviderId,
    key: string,
    persistInSession = false,
    authorizedOrigin?: string
  ): void {
    const cleaned = cleanApiKey(key);
    if (!cleaned) {
      this.clearApiKey(provider);
      return;
    }

    this.memoryKeys.set(provider, cleaned);

    // Resolve authorized destination origin
    const origins = this.memoryOrigins.get(provider) || new Set<string>();
    if (authorizedOrigin) {
      const orig = extractOrigin(authorizedOrigin);
      if (orig) origins.add(orig);
    } else {
      const defOrig = getDefaultProviderOrigin(provider);
      if (defOrig && origins.size === 0) {
        origins.add(defOrig);
      }
    }
    this.memoryOrigins.set(provider, origins);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (persistInSession) {
          window.sessionStorage.setItem(`${SESSION_PREFIX}${provider}`, cleaned);
          if (origins.size > 0) {
            window.sessionStorage.setItem(
              `${SESSION_PREFIX}${provider}_origins`,
              JSON.stringify(Array.from(origins))
            );
          }
        } else {
          window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}`);
          window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}_origins`);
        }
      } catch {
        // ignore storage errors
      }
    }
  }

  /**
   * Removes the key from memory and sessionStorage.
   */
  public clearApiKey(provider: AiProviderId): void {
    this.memoryKeys.delete(provider);
    this.memoryOrigins.delete(provider);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}`);
        window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}_origins`);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Checks whether an API key is available for a provider.
   */
  public hasApiKey(provider: AiProviderId): boolean {
    if (provider === 'mock') return true;
    const key = this.getApiKey(provider);
    return Boolean(key && key.length > 0);
  }

  /**
   * Returns a masked representation of the key for safe UI display (e.g. "sk-...a4b2").
   */
  public getMaskedKey(provider: AiProviderId): string {
    const key = this.getApiKey(provider);
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Checks whether the key is stored in sessionStorage.
   */
  public isPersistedInSession(provider: AiProviderId): boolean {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    try {
      return Boolean(window.sessionStorage.getItem(`${SESSION_PREFIX}${provider}`));
    } catch {
      return false;
    }
  }

  /**
   * Returns all authorized origins for a given provider.
   */
  public getAuthorizedOrigins(provider: AiProviderId): string[] {
    const set = this.memoryOrigins.get(provider);
    if (set && set.size > 0) return Array.from(set);
    const def = getDefaultProviderOrigin(provider);
    return def ? [def] : [];
  }

  /**
   * Authorizes an endpoint destination origin for a provider's credential.
   */
  public authorizeOrigin(provider: AiProviderId, targetUrlOrOrigin: string): void {
    const orig = extractOrigin(targetUrlOrOrigin);
    if (!orig) return;
    const set = this.memoryOrigins.get(provider) || new Set<string>();
    set.add(orig);
    this.memoryOrigins.set(provider, set);

    if (this.isPersistedInSession(provider) && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(
          `${SESSION_PREFIX}${provider}_origins`,
          JSON.stringify(Array.from(set))
        );
      } catch {}
    }
  }

  /**
   * Revokes authorization for an endpoint destination origin.
   */
  public revokeOriginAuthorization(provider: AiProviderId, targetUrlOrOrigin: string): void {
    const orig = extractOrigin(targetUrlOrOrigin);
    if (!orig) return;
    const set = this.memoryOrigins.get(provider);
    if (set) {
      set.delete(orig);
      if (this.isPersistedInSession(provider) && typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem(
            `${SESSION_PREFIX}${provider}_origins`,
            JSON.stringify(Array.from(set))
          );
        } catch {}
      }
    }
  }

  /**
   * Verifies if a target endpoint URL/origin is authorized for a provider.
   */
  public isOriginAuthorized(provider: AiProviderId, targetUrlOrOrigin: string): boolean {
    if (provider === 'mock') return true;
    const targetOrigin = extractOrigin(targetUrlOrOrigin);
    if (!targetOrigin) return false;

    const set = this.memoryOrigins.get(provider);
    if (set && set.has(targetOrigin)) {
      return true;
    }

    // Default origin fallback if no custom origins explicitly set
    const def = getDefaultProviderOrigin(provider);
    if (def && (!set || set.size === 0)) {
      if (def === targetOrigin) return true;
      const alternates: Record<string, string[]> = {
        together: ['https://api.together.xyz', 'https://api.together.ai'],
        huggingface: ['https://router.huggingface.co', 'https://api-inference.huggingface.co'],
        minimax: ['https://api.minimax.chat', 'https://api.minimaxi.chat'],
      };
      if (alternates[provider]?.includes(targetOrigin)) return true;
    }

    return false;
  }

  /**
   * Comprehensive outbound request gate.
   * Verifies that the credential being sent is authorized for the outbound request destination.
   * Checks both provider binding and cross-provider credential leakage without relying on key prefixes.
   */
  public isKeyOrProviderAuthorized(
    providerId?: AiProviderId,
    apiKey?: string,
    targetUrlOrOrigin?: string,
    defaultProviderUrl?: string,
    explicitAuthorizedOrigin?: string
  ): boolean {
    if (!targetUrlOrOrigin) return false;
    const targetOrigin = extractOrigin(targetUrlOrOrigin);
    if (!targetOrigin) return false;

    // Explicit caller-authorized origin match
    if (explicitAuthorizedOrigin && extractOrigin(explicitAuthorizedOrigin) === targetOrigin) {
      return true;
    }

    if (providerId === 'mock') return true;

    // Check provider-level authorization
    if (providerId) {
      const isAuth = this.isOriginAuthorized(providerId, targetOrigin);
      const isDefaultAuth = defaultProviderUrl ? extractOrigin(defaultProviderUrl) === targetOrigin : false;
      if (!isAuth && !isDefaultAuth) {
        return false;
      }
    }

    // Cross-provider credential leakage check:
    // If an apiKey is supplied, verify it doesn't belong exclusively to another provider whose authorized origins do not include targetOrigin.
    if (apiKey && apiKey.trim()) {
      const cleanKey = cleanApiKey(apiKey);
      for (const [otherProvider, otherKey] of this.memoryKeys.entries()) {
        if (otherProvider !== providerId && otherKey === cleanKey) {
          // Key was registered under another provider. Verify if that other provider has authorized this destination.
          if (!this.isOriginAuthorized(otherProvider, targetOrigin)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Returns all active non-empty API keys across all providers in memory for redaction.
   */
  public getAllActiveKeys(): string[] {
    const keys: string[] = [];
    for (const key of this.memoryKeys.values()) {
      if (key && key.trim()) {
        keys.push(key.trim());
      }
    }
    return keys;
  }

  /**
   * Clears all API keys from memory and sessionStorage.
   */
  public clearAllKeys(): void {
    this.memoryKeys.clear();
    this.memoryOrigins.clear();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(SESSION_PREFIX)) {
            toRemove.push(k);
          }
        }
        for (const k of toRemove) {
          window.sessionStorage.removeItem(k);
        }
        const providers: AiProviderId[] = ['openai', 'openrouter', 'gemini', 'custom', 'mock'];
        for (const p of providers) {
          window.sessionStorage.removeItem(`${SESSION_PREFIX}${p}`);
          window.sessionStorage.removeItem(`${SESSION_PREFIX}${p}_origins`);
        }
      } catch {
        // ignore
      }
    }
  }
}

export const keyManager = new KeyManager();
