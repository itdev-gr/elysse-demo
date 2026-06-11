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

  // Careers moved from the Contact section to About Us; keep the old URL alive.
  redirects: {
    '/contact/careers/': '/about-us/careers/',
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ]
});