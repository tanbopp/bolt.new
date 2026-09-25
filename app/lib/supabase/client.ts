import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';
import { getBrowserSupabaseEnv } from './browser-env';

export type SupabaseBrowserClient = SupabaseClient<Database>;

let browserClient: SupabaseBrowserClient | null = null;

/**
 * Supabase client untuk browser (client-safe).
 *
 * Session disimpan di cookie oleh `@supabase/ssr` sehingga bisa dibaca server
 * (loader/middleware) untuk proteksi route. Hanya `SUPABASE_URL` dan
 * `SUPABASE_ANON_KEY` yang dipakai — service role key tidak pernah tersedia di
 * sisi client.
 */
export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (browserClient) {
    return browserClient;
  }

  if (import.meta.env.SSR) {
    throw new Error('getSupabaseBrowserClient() hanya boleh dipanggil di browser');
  }

  const { url, anonKey } = getBrowserSupabaseEnv();

  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}
