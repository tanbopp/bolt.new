import { readSupabaseEnv, type SupabaseEnv } from './env';

/**
 * Resolusi env Supabase untuk kode browser.
 *
 * Nilai di-inline oleh Vite dari `.env.local` (lihat `envPrefix` di
 * `vite.config.ts`), sehingga hanya variabel client-safe yang bisa dibaca:
 * `SUPABASE_URL` dan `SUPABASE_ANON_KEY`. Service role key tidak pernah
 * tersedia di sini.
 */
export function getBrowserSupabaseEnv(): SupabaseEnv {
  return readSupabaseEnv({
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
  });
}
