import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://smallestateform.com',
  integrations: [react(), tailwind({ config: './tailwind.config.mjs' })],
  output: 'hybrid',
  adapter: vercel(),
});
