import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Configuração para Cloudflare Workers
  cloudflare: {
    // Container configuration será automaticamente detectada
  },
});

