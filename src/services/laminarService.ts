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

export async function initLaminar() {
  if (isInitialized) return;

  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LMNR_PROJECT_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.LMNR_PROJECT_API_KEY) ||
    '13pMPcBJ0QfFIdYve0ZQ2ShJlz8QPTxcaWmNp0J5EDemEYipiv3UDKl7Fc09QoHa';

  if (apiKey) {
    try {
      // Dynamic import prevents static Rollup bundling of Node-specific dependencies in Vite browser build
      const mod = await import('@lmnr-ai/lmnr');
      lmnrModule = mod as unknown as LaminarModule;
      if (mod?.Laminar?.initialize) {
        mod.Laminar.initialize({
          projectApiKey: apiKey,
        });
        isInitialized = true;
      }
    } catch {
      // Graceful fallback for browser bundler environments
    }
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

