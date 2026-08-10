import { Laminar, observe } from '@lmnr-ai/lmnr';

let isInitialized = false;

export function initLaminar() {
  if (isInitialized) return;
  
  const apiKey =
    (import.meta.env && import.meta.env.VITE_LMNR_PROJECT_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.LMNR_PROJECT_API_KEY) ||
    '13pMPcBJ0QfFIdYve0ZQ2ShJlz8QPTxcaWmNp0J5EDemEYipiv3UDKl7Fc09QoHa';

  if (apiKey) {
    try {
      Laminar.initialize({
        projectApiKey: apiKey,
      });
      isInitialized = true;
      console.log('[Laminar] Tracing initialized successfully.');
    } catch (err) {
      console.error('[Laminar] Failed to initialize tracing:', err);
    }
  } else {
    console.warn('[Laminar] Project API key missing.');
  }
}

export { Laminar, observe };
