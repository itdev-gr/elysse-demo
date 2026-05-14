import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    viewport: { width: 1440, height: 900 },
    trace: 'off',
  },
  webServer: {
    command: 'pnpm astro preview --port 4321',
    port: 4321,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
