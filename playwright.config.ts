import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Konfigurasi Playwright E2E (Tahapan 1 — Auth & User Layer).
 *
 * `workers: 1` + `fullyParallel: false` supaya test auth tidak saling
 * menabrakkan rate limit Supabase Auth.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,

  /**
   * 30 detik, bukan default 15 detik: dev server Vite harus men-transform
   * halaman workspace (`/`) saat pertama kali dibuka sehingga load pertama
   * di satu sesi bisa jauh lebih lambat dari load berikutnya.
   */
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
