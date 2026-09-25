/**
 * Helper env Supabase yang **murni** (tanpa `node:process` maupun
 * `import.meta.env`) sehingga aman dipakai kode server maupun browser.
 *
 * - Kode server memakai `./server-env` (baca `process.env` / env Cloudflare).
 * - Kode browser memakai `./browser-env` (baca `import.meta.env` hasil `envPrefix`).
 */

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/**
 * Nilai `context.cloudflare.env`.
 *
 * Bentuknya didefinisikan di luar aplikasi (`worker-configuration.d.ts`, dashboard
 * Cloudflare), jadi diperlakukan sebagai `unknown` dan dibaca dengan narrowing —
 * tidak perlu mengubah tipe global `Env` milik repo.
 */
export type CloudflareEnvLike = unknown;

/**
 * Ambil nilai string dari env Cloudflare yang tipenya belum diketahui.
 */
export function readCloudflareEnvValue(source: CloudflareEnvLike, key: string): string | undefined {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export const MISSING_ENV_MESSAGE =
  'Konfigurasi Supabase belum lengkap: SUPABASE_URL dan SUPABASE_ANON_KEY wajib terisi di .env.local';

export function readSupabaseEnv(source: Partial<Record<string, string | undefined>>): SupabaseEnv {
  const url = source.SUPABASE_URL;
  const anonKey = source.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(MISSING_ENV_MESSAGE);
  }

  return { url, anonKey };
}
