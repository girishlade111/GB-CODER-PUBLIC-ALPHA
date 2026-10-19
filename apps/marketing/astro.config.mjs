import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://code.ladestack.in",
  integrations: [react()],
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
