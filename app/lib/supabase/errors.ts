import type { User } from '@supabase/supabase-js';

const MESSAGE_BY_PATTERN: { pattern: string; message: string }[] = [
  { pattern: 'invalid login credentials', message: 'Email atau password salah.' },
  { pattern: 'email not confirmed', message: 'Email belum diverifikasi. Cek kotak masuk email kamu.' },
  { pattern: 'user already registered', message: 'Email sudah terdaftar. Silakan masuk.' },
  { pattern: 'password should be at least', message: 'Password minimal 6 karakter.' },
  { pattern: 'provider is not enabled', message: 'Provider OAuth ini belum diaktifkan di project Supabase.' },
  { pattern: 'unsupported provider', message: 'Provider OAuth ini belum diaktifkan di project Supabase.' },
  { pattern: 'rate limit', message: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' },
  { pattern: 'failed to fetch', message: 'Tidak bisa menghubungi Supabase. Cek koneksi kamu.' },
];

/**
 * Ubah error Supabase/JS menjadi pesan bahasa Indonesia yang aman ditampilkan.
 *
 * Pesan asli (Inggris) tetap dipakai bila belum ada padanannya, supaya error
 * tidak pernah "hilang" tanpa penjelasan.
 */
export function mapAuthErrorMessage(error: unknown): string {
  const fallback = 'Terjadi kesalahan. Coba lagi.';

  if (!error) {
    return fallback;
  }

  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const normalized = rawMessage.toLowerCase();

  const matched = MESSAGE_BY_PATTERN.find((entry) => normalized.includes(entry.pattern));

  if (matched) {
    return matched.message;
  }

  return rawMessage || fallback;
}

function readMetadataString(metadata: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
}

/**
 * Ambil nama & avatar dari metadata provider (Google: `full_name`/`picture`,
 * GitHub: `name`/`avatar_url`).
 */
export function readUserProfileMetadata(user: User): { name: string | null; avatar: string | null } {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    name: readMetadataString(metadata, ['full_name', 'name', 'user_name']),
    avatar: readMetadataString(metadata, ['avatar_url', 'picture']),
  };
}
