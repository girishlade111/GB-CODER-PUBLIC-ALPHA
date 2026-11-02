import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from 'node:url';

const entry = path => fileURLToPath(new URL(path, import.meta.url));
const statusRoutes = {
  name: 'status-documents-and-dev-gallery',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/__status', entrypoint: entry('./src/dev/status-gallery.astro'), prerender: false });
        injectRoute({ pattern: '/__status/[code]', entrypoint: entry('./src/dev/status-gallery.astro'), prerender: false });
        injectRoute({ pattern: '/__status/error/[code]', entrypoint: entry('./src/dev/status-response.astro'), prerender: false });
        injectRoute({ pattern: '/__status/throw', entrypoint: entry('./src/dev/status-throw.astro'), prerender: false });
      } else if (command === 'build') {
        injectRoute({ pattern: '/_status-documents/[code]', entrypoint: entry('./src/status/error-document.astro'), prerender: true });
      }
    },
    'astro:build:done': async ({ dir }) => {
      const { packStatusDocuments } = await import('../../scripts/pack-status-documents.mjs');
      packStatusDocuments(fileURLToPath(dir));
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://code.ladestack.in",
  integrations: [react(), statusRoutes],
  devToolbar: { enabled: false },
  output: "static",
  build: {
    // Directory format emits about/index.html style output so canonical
    // extensionless URLs (/about, /contact, ...) resolve on static hosts.
    format: "directory",
  },
  server: {
    port: 4321,
  },
});
