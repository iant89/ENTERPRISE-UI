import { defineConfig, devices } from '@playwright/test';

/** Run workflow, advanced, and release-quality interaction checks separately from visual snapshots. */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /phase[345]\.spec\.ts/,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { baseURL: 'http://localhost:4174', trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: process.env.PHASE3_CHROMIUM_PATH ? { executablePath: process.env.PHASE3_CHROMIUM_PATH, args: ['--no-sandbox'] } : {} } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], launchOptions: process.env.PHASE3_CHROMIUM_PATH ? { executablePath: process.env.PHASE3_CHROMIUM_PATH, args: ['--no-sandbox'] } : {} } },
  ],
  webServer: {
    command: 'npm run build:docs && npx vite preview --config docs/vite.config.ts --port 4174 --strictPort',
    url: 'http://localhost:4174', reuseExistingServer: !process.env.CI, timeout: 180_000,
  },
});
