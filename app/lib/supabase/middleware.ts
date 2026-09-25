import { redirect } from '@remix-run/cloudflare';
import type { User } from '@supabase/supabase-js';
import { createScopedLogger } from '~/utils/logger';
import type { CloudflareEnvLike } from './env';
import { createSupabaseServerClient, type SupabaseServerClient } from './server';

const logger = createScopedLogger('AuthMiddleware');

/**
 * Route yang boleh diakses tanpa login.
 *
 * `CONVENTIONS.md` §2 memakai nama `middleware.ts` untuk helper proteksi route.
 * Di Remix tidak ada middleware global, jadi fungsi di file ini dipanggil dari
 * `loader` di `app/root.tsx` (setara middleware: dijalankan sebelum render).
 */
export const PUBLIC_ROUTES: readonly string[] = ['/login', '/signup', '/auth/callback', '/auth/error', '/logout'];

/**
 * Resource route API (mis. `/api/chat`, `/api/enhancer`) tidak dijaga di sini
 * karena PRD Tahapan 1 tidak menyentuh AI/chat. Catat di
 * `notes/TAHAPAN-1-NOTES.md` sebagai rekomendasi tahap berikutnya.
 */
const PUBLIC_PREFIXES: readonly string[] = ['/api/'];

export function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname === `${route}/` || pathname.startsWith(`${route}/`)) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export type AuthGuardResult = {
  supabase: SupabaseServerClient;

  /** User yang **sudah diverifikasi** ke Supabase Auth (`getUser()`). */
  user: User | null;

  /** Header tambahan (berisi `Set-Cookie` bila token di-refresh) untuk response. */
  headers: Headers;
};

/** Hasil `requireSession`: user dijamin ada. */
export type AuthenticatedGuardResult = Omit<AuthGuardResult, 'user'> & { user: User };

/**
 * Membaca & memverifikasi user dari cookie request.
 *
 * Memakai `auth.getUser()` (bukan `getSession()`) sesuai peringatan resmi
 * Supabase: objek dari `getSession()` berasal dari cookie yang dikirim client
 * sehingga tidak boleh dipercaya di server. `getUser()` memvalidasi token ke
 * Supabase Auth dan tetap me-refresh token bila kedaluwarsa (cookie barunya
 * ditulis ke `headers`).
 *
 * Selalu membuat client baru per request — jangan disimpan di variabel global.
 */
export async function updateSession(request: Request, cloudflareEnv?: CloudflareEnvLike): Promise<AuthGuardResult> {
  const headers = new Headers();
  const supabase = createSupabaseServerClient(request, headers, cloudflareEnv);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    const isSessionMissing =
      error.name === 'AuthSessionMissingError' || (error.message ?? '').includes('Auth session missing');

    if (!isSessionMissing && import.meta.env.DEV) {
      logger.error('Gagal memverifikasi user Supabase di server', error);
    }

    return { supabase, user: null, headers };
  }

  return { supabase, user: data.user ?? null, headers };
}

/**
 * Bentuk URL login + `?redirect=` untuk request yang belum terautentikasi.
 */
export function buildLoginRedirect(request: Request): string {
  const url = new URL(request.url);
  const redirectTo = `${url.pathname}${url.search}`;
  const search = new URLSearchParams({ redirect: redirectTo });

  return `/login?${search.toString()}`;
}

/**
 * Guard untuk route terproteksi. Throw redirect ke `/login?redirect=<path>`
 * bila belum ada session (perilaku Remix untuk loader).
 */
export async function requireSession(
  request: Request,
  cloudflareEnv?: CloudflareEnvLike,
): Promise<AuthenticatedGuardResult> {
  const result = await updateSession(request, cloudflareEnv);

  if (!result.user) {
    throw redirect(buildLoginRedirect(request), { headers: result.headers });
  }

  return { ...result, user: result.user };
}
