import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    // Directory format emits about/index.html style output so canonical
    // extensionless URLs (/about, /contact, ...) resolve on static hosts.
    format: 'directory',
  },
  server: {
    port: 4321,
  },
});
