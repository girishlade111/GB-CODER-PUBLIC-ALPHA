/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ENABLE_AI_SUGGESTIONS?: string;
  readonly VITE_ENABLE_EXTERNAL_LIBRARIES?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_VERCEL_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
