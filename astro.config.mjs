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
  site: 'https://elysse-demo.vercel.app',

  // Dev-only toolbar; its stale optimize-dep requests 504 in every console
  // check and it isn't used — off.
  devToolbar: { enabled: false },

  // Static by default; data-driven routes opt into on-demand rendering with
  // `export const prerender = false` so dashboard changes go live with no
  // rebuild. The Vercel adapter provides the serverless runtime for those.
  adapter: vercel(),

  // Careers moved from the About Us section to Contact Us; keep the old URL alive.
  redirects: {
    '/about-us/careers/': '/contact/careers/',
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