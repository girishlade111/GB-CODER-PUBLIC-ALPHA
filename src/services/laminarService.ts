interface LaminarModule {
  Laminar?: {
    initialize: (options: Record<string, unknown>) => void;
    shutdown?: () => Promise<void>;
  };
  observe?: <T>(
    options: { name: string; [key: string]: unknown },
    fn: (...args: unknown[]) => Promise<T> | T
  ) => Promise<T> | T;
}

let lmnrModule: LaminarModule | null = null;
let isInitialized = false;

/**
 * Initialize Laminar telemetry.
 *
 * SECURITY REMEDIATION (F-10 / S-01):
 * - Hardcoded credentials and insecure fallbacks have been removed.
 * - Private API keys MUST NOT be embedded into client source or public VITE_* env vars.
 * - In client-side browser execution, secret-dependent telemetry is disabled to prevent
 *   credential leaks and unwanted third-party requests.
 */
export async function initLaminar(): Promise<void> {
  if (isInitialized) return;

  // In browser environments, disable secret-dependent telemetry initialization
  if (typeof window !== 'undefined') {
    isInitialized = true;
    return;
  }

  // Safe server-side / runtime environment check (Node.js only)
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.LMNR_PROJECT_API_KEY : undefined;

  if (apiKey) {
    try {
      const mod = await import('@lmnr-ai/lmnr');
      lmnrModule = mod as unknown as LaminarModule;
      if (mod?.Laminar?.initialize) {
        mod.Laminar.initialize({
          projectApiKey: apiKey,
        });
        isInitialized = true;
      }
    } catch {
      // Graceful fallback: telemetry failure must never disrupt application execution
      isInitialized = true;
    }
  } else {
    isInitialized = true;
  }
}

export function observe<T>(
  options: { name: string; [key: string]: unknown },
  fn: (...args: unknown[]) => Promise<T> | T
): Promise<T> | T {
  if (lmnrModule && typeof lmnrModule.observe === 'function') {
    try {
      return lmnrModule.observe(options, fn);
    } catch {
      // Fallback to plain execution if trace wrapper fails
    }
  }
  return fn();
}

export const Laminar = {
  initialize: (options: Record<string, unknown>) => {
    if (lmnrModule?.Laminar?.initialize) {
      return lmnrModule.Laminar.initialize(options);
    }
  },
  shutdown: async () => {
    if (lmnrModule?.Laminar?.shutdown) {
      return await lmnrModule.Laminar.shutdown();
    }
  },
};

/**
 * Test utility helpers to safely test fallback and mock behavior in isolation.
 */
export function _resetLaminarStateForTesting(): void {
  lmnrModule = null;
  isInitialized = false;
}

export function _setLaminarModuleForTesting(mod: LaminarModule | null): void {
  lmnrModule = mod;
  isInitialized = true;
}

export function _isLaminarInitialized(): boolean {
  return isInitialized;
}

