import { defineConfig, mergeConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

// `.astro` SSR rendering via `astro/container` requires the SSR (Node) Vite
// environment. happy-dom maps to viteEnvironment: 'client', which causes the
// astro vite plugin to emit a browser-only stub instead of the real factory.
export default defineConfig(async (env) => {
  const astroVite = await getViteConfig({})(env);
  return mergeConfig(astroVite, {
    test: {
      environment: 'node',
    },
  });
});
