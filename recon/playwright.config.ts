import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'https://www.sonanbunkers.com',
    trace: 'off',
  },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'laptop-1024',  use: { viewport: { width: 1024, height: 768 } } },
    { name: 'tablet-768',   use: { viewport: { width: 768,  height: 1024 } } },
    { name: 'mobile-390',   use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } } },
  ],
});
