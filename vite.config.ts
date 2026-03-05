import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'GB Coder',
        short_name: 'GB Coder',
        description: 'Advanced web code editor with AI assistance',
        theme_color: '#1F2937',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@monaco-editor/react',
    ],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@monaco-editor')) {
              return 'monaco-editor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }

          // Phase 2: High priority components (Preview, Console, AI Suggestions)
          if (id.includes('/components/TabbedRightPanel') ||
            id.includes('/components/PreviewPanel') ||
            id.includes('/components/EnhancedConsole') ||
            id.includes('/components/AISuggestionPanel')) {
            return 'phase2-critical';
          }

          // Phase 3: Deferred components (AI features, settings, etc.)
          if (id.includes('/components/GeminiCodeAssistant') ||
            id.includes('/components/SnippetsSidebar') ||
            id.includes('/components/SettingsModal') ||
            id.includes('/components/HistoryPanel') ||
            id.includes('/components/ExtensionsMarketplace') ||
            id.includes('/components/ExternalLibraryManager') ||
            id.includes('/components/AIEnhancementPopup') ||
            id.includes('/components/CodeExplanationPopup') ||
            id.includes('/components/KeyboardShortcutsHelp') ||
            id.includes('/components/ProjectBar') ||
            id.includes('/components/pages/')) {
            return 'phase3-deferred';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
