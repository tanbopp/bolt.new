/**
 * Helper redirect yang aman.
 *
 * Dipakai untuk membaca `?redirect=` pada halaman login/signup. Hanya path
 * internal (diawali satu `/`) yang diterima, supaya parameter ini tidak bisa
 * dipakai untuk open redirect ke domain lain.
 */
export function sanitizeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }

  return value;
}

/** Ambil `?redirect=` dari sebuah URL string (aman untuk SSR). */
export function readRedirectParam(url: string, fallback = '/'): string {
  try {
    return sanitizeRedirectPath(new URL(url).searchParams.get('redirect'), fallback);
  } catch {
    return fallback;
  }
}
