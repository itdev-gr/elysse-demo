// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sonanbunkers.com',

  // Static by default; data-driven routes opt into on-demand rendering with
  // `export const prerender = false` so dashboard changes go live with no
  // rebuild. The Vercel adapter provides the serverless runtime for those.
  adapter: vercel(),

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