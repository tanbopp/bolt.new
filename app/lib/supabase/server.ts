import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';
import type { CloudflareEnvLike } from './env';
import { getServerSupabaseEnv } from './server-env';

export type SupabaseServerClient = SupabaseClient<Database>;

/**
 * Opsi cookie yang dikirim `@supabase/ssr`. Tipe ditulis struktural (bukan
 * import dari package `cookie`) supaya modul ini tidak bergantung pada
 * dependency tidak langsung.
 */
type SerializeCookieOptions = {
  path?: unknown;
  domain?: unknown;
  maxAge?: unknown;
  expires?: unknown;
  sameSite?: unknown;
  secure?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Parser minimal untuk header `Cookie`. Nilai di-decode dengan aman supaya
 * konsisten dengan cookie yang ditulis browser.
 */
export function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) {
    return [];
  }

  const cookies: { name: string; value: string }[] = [];

  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const name = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    if (!name) {
      continue;
    }

    try {
      cookies.push({ name, value: decodeURIComponent(rawValue) });
    } catch {
      cookies.push({ name, value: rawValue });
    }
  }

  return cookies;
}

/**
 * Serializer minimal header `Set-Cookie` untuk cookie auth Supabase.
 *
 * `maxAge` mengikuti konvensi package `cookie` (detik).
 */
export function serializeCookie(name: string, value: string, options: unknown): string {
  const opts = (options ?? {}) as SerializeCookieOptions;
  const segments = [`${name}=${encodeURIComponent(value)}`];

  segments.push(`Path=${isNonEmptyString(opts.path) ? opts.path : '/'}`);

  if (typeof opts.maxAge === 'number' && Number.isFinite(opts.maxAge)) {
    segments.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  }

  if (isNonEmptyString(opts.domain)) {
    segments.push(`Domain=${opts.domain}`);
  }

  if (opts.expires instanceof Date) {
    segments.push(`Expires=${opts.expires.toUTCString()}`);
  }

  const sameSite = typeof opts.sameSite === 'string' ? opts.sameSite.toLowerCase() : 'lax';

  if (sameSite === 'strict' || sameSite === 'lax' || sameSite === 'none') {
    segments.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
  }

  if (opts.secure === true) {
    segments.push('Secure');
  }

  return segments.join('; ');
}

/**
 * Membuat Supabase client untuk satu request server.
 *
 * **Jangan** simpan instance ini di variabel global — harus dibuat ulang per
 * request (lihat dokumentasi `@supabase/ssr`).
 *
 * `responseHeaders` diisi dengan header `Set-Cookie` bila Supabase melakukan
 * refresh token, sehingga pemanggil (loader) bisa mengembalikannya bersama
 * response.
 */
export function createSupabaseServerClient(
  request: Request,
  responseHeaders: Headers,
  cloudflareEnv?: CloudflareEnvLike,
): SupabaseServerClient {
  const { url, anonKey } = getServerSupabaseEnv(cloudflareEnv);

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie'));
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          responseHeaders.append('Set-Cookie', serializeCookie(name, value, options));
        }

        for (const [key, headerValue] of Object.entries(headers)) {
          responseHeaders.set(key, headerValue);
        }
      },
    },
  });
}
