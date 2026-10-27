import { defineConfig, devices } from '@playwright/test';

/**
 * Drives the manual test battery (Desktop Excel) end to end against a fully
 * local, isolated stack:
 *   - Backend: started separately (see e2e/README.md) on :4000, pointed at
 *     the dedicated `caja_facil_e2e` Postgres database.
 *   - Frontend: this config starts `next dev` on :4001 itself, with
 *     NEXT_PUBLIC_API_URL forced to :4000 regardless of .env.local — so
 *     these tests can never accidentally hit staging/prod.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:4001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx next dev -p 4001',
    url: 'http://localhost:4001',
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      NEXT_PUBLIC_API_TIMEOUT: '5000',
    },
  },
});
