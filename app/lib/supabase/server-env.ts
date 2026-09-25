import { env } from 'node:process';
import { readCloudflareEnvValue, readSupabaseEnv, type CloudflareEnvLike, type SupabaseEnv } from './env';

/**
 * Modul **khusus server** (loader/action/resource route). Jangan diimport dari
 * komponen client — berisi `node:process`.
 */

/**
 * Resolusi env Supabase untuk kode server.
 *
 * Mengikuti pola env di repo ini (lihat `app/lib/.server/llm/api-key.ts`):
 * `process.env` dipakai saat development, `cloudflareEnv` dipakai saat
 * deployed/preview.
 */
export function getServerSupabaseEnv(cloudflareEnv: CloudflareEnvLike): SupabaseEnv {
  return readSupabaseEnv({
    SUPABASE_URL: env.SUPABASE_URL ?? readCloudflareEnvValue(cloudflareEnv, 'SUPABASE_URL'),
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ?? readCloudflareEnvValue(cloudflareEnv, 'SUPABASE_ANON_KEY'),
  });
}
