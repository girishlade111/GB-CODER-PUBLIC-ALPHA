import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast refresh for development
      fastRefresh: true,
      // Exclude storybook stories
      exclude: [],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'tghjkl.jpeg'],
      manifest: {
        name: 'GB Coder',
        short_name: 'GB Coder',
        description: 'Advanced web code editor with AI assistance',
        theme_color: '#1e1e1e',
        background_color: '#1e1e1e',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-jsdelivr-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unpkg-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
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
    ],
    exclude: [
      '@monaco-editor/react',
      'monaco-editor',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Monaco Editor - separate chunk (loaded lazily)
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
            return 'monaco-editor';
          }
          
          // React ecosystem - core chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-core';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            if (id.includes('@vercel') || id.includes('web-vitals')) {
              return 'analytics';
            }
            if (id.includes('axios')) {
              return 'http-client';
            }
            if (id.includes('jszip')) {
              return 'compression';
            }
            if (id.includes('diff') || id.includes('react-diff-viewer')) {
              return 'diff-tools';
            }
            if (id.includes('xterm')) {
              return 'terminal';
            }
            if (id.includes('prettier')) {
              return 'formatter';
            }
          }

          // Critical UI components - load immediately
          if (id.includes('/components/NavigationBar') ||
              id.includes('/components/EditorPanel') ||
              id.includes('/components/TabbedRightPanel') ||
              id.includes('/components/PreviewPanel') ||
              id.includes('/components/EnhancedConsole')) {
            return 'critical-ui';
          }

          // Deferred components - lazy loaded
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
            return 'deferred-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
