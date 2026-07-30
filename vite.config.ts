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

          // TypeScript compiler - separate chunk (loaded lazily for TS/TSX mode only)
          if (id.includes('node_modules') && id.includes('typescript')) {
            return 'typescript-compiler';
          }

          // Client-side bundler for multi-file React/Vue projects. Both are
          // heavy and only needed once a framework project is opened, so they
          // must stay out of the entry chunk. Checked before the generic
          // node_modules buckets below so they are not swept into react-core.
          /*
           * esbuild-wasm is left unbucketed for the same reason as JSZip: it is
           * CommonJS, so naming its chunk captured the shared interop helper and
           * created a static edge from the React chunk into it. Its only entry
           * point is a dynamic import in the project bundler, which is enough
           * for Rollup to split it correctly on its own.
           */
          if (id.includes('@vue/compiler-sfc') || id.includes('@vue/compiler-')) {
            return 'vue-compiler';
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
            /*
             * JSZip is deliberately NOT bucketed by hand.
             *
             * Naming a chunk for a CommonJS dependency parks Rollup's generated
             * interop helper inside that chunk. React is also CommonJS and needs
             * the same helper, which created a *static* edge from `react-core`
             * into the JSZip chunk and pulled 95 kB of zip code into first paint
             * even though every `import('jszip')` in the app is dynamic.
             *
             * Left unbucketed, Rollup derives the chunk from the dynamic import
             * boundary and keeps the shared helper somewhere neutral.
             */
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

          /*
           * Application code is deliberately NOT grouped by hand.
           *
           * Two manual buckets used to exist here, `critical-ui` and
           * `deferred-components`, and they actively defeated code splitting.
           * `manualChunks` decides which *chunk* a module lands in, not whether
           * that chunk is eager: putting a lazily-imported module in a chunk
           * that also contains a statically-imported one makes the whole chunk
           * statically reachable, so Vite emits a `modulepreload` for it.
           *
           * Concretely, `EnhancedConsole` is loaded via React.lazy but was
           * grouped into `critical-ui` alongside `NavigationBar`, which dragged
           * it — and through it xterm (275 kB) — into first paint. The chunk
           * named `deferred-components` was preloaded for the same reason.
           *
           * Returning undefined lets Rollup split along the real dynamic
           * `import()` boundaries, which is the only thing that actually
           * determines what loads when.
           */
          return undefined;
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
