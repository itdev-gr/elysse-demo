// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sonanbunkers.com',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
  },

  integrations: [react(), sitemap()]
});