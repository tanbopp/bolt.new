import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Konfigurasi Vitest terpisah dari `vite.config.ts`.
 *
 * Tujuannya: test unit (`app/**\/*.spec.ts`, dijalankan dengan `pnpm test`) tidak
 * ikut memungut spec E2E Playwright di `tests/e2e/**` — keduanya memakai akhiran
 * `.spec.ts` (lihat `CONVENTIONS.md` §1) tapi runner-nya berbeda:
 * `pnpm test` (vitest) vs `pnpm exec playwright test`.
 *
 * Alias `~` di-deklarasikan ulang karena Vitest tidak lagi membaca
 * `vite-tsconfig-paths` dari `vite.config.ts`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    include: ['app/**/*.spec.{ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**', 'build/**', 'test-results/**'],
  },
});
