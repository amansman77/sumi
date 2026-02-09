import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const siteUrl = import.meta.env.SITE_URL || 'https://sumi.example.com';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [sitemap()],
  trailingSlash: 'never',
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  },
});
