import { defineMiddleware } from 'astro:middleware';

// Astro is static in production. This hook protects dev SSR; runtime API
// failures use the generated documents through status-response.cjs.
export const onRequest = defineMiddleware(async (context, next) => {
  try { return await next(); }
  catch (error) {
    console.error('[marketing] Page rendering failed', error);
    if (!import.meta.env.DEV || context.url.pathname === '/__status/error/500') throw error;
    const response = await context.rewrite('/__status/error/500');
    return new Response(response.body, { status: 500, headers: response.headers });
  }
});
