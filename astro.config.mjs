import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://smallestateform.com',
  integrations: [react(), sitemap(), tailwind({ config: './tailwind.config.mjs' })],
  output: 'hybrid',
  adapter: vercel(),
});
