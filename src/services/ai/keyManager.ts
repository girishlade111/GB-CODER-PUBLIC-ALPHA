/**
 * Secure In-Memory Key Manager for BYOK (Bring-Your-Own-Key).
 *
 * Rules:
 * - Keys are kept in memory by default.
 * - Never written to plaintext localStorage.
 * - Optional explicit user opt-in to persist in sessionStorage (scoped to browser tab).
 * - Never logged or serialized in error telemetry.
 */

import { AiProviderId } from './types.ts';

const SESSION_PREFIX = 'gbcoder_ai_key_session_';

class KeyManager {
  // In-memory key store (default)
  private memoryKeys = new Map<AiProviderId, string>();

  /**
   * Retrieves the API key for a provider.
   * Checks in-memory cache first, then sessionStorage if previously enabled.
   */
  public getApiKey(provider: AiProviderId): string {
    const memKey = this.memoryKeys.get(provider);
    if (memKey) return memKey;

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const sessionKey = window.sessionStorage.getItem(`${SESSION_PREFIX}${provider}`);
        if (sessionKey) {
          this.memoryKeys.set(provider, sessionKey);
          return sessionKey;
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
        return envKey.trim();
      }
    }

    return '';
  }

  /**
   * Sets the API key for a provider.
   * @param provider The AI provider
   * @param key The API key (plain string)
   * @param persistInSession If true, stores in sessionStorage for the duration of this tab
   */
  public setApiKey(provider: AiProviderId, key: string, persistInSession = false): void {
    const trimmed = key.trim();
    if (!trimmed) {
      this.clearApiKey(provider);
      return;
    }

    this.memoryKeys.set(provider, trimmed);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (persistInSession) {
          window.sessionStorage.setItem(`${SESSION_PREFIX}${provider}`, trimmed);
        } else {
          window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}`);
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
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(`${SESSION_PREFIX}${provider}`);
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
   * Clears all API keys from memory and sessionStorage.
   */
  public clearAllKeys(): void {
    this.memoryKeys.clear();
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
        }
      } catch {
        // ignore
      }
    }
  }
}

export const keyManager = new KeyManager();
