import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

/**
 * Fixture E2E untuk Tahapan 1.
 *
 * Membaca kredensial dari `.env.local` (file ini sudah ada sejak Tahapan 0 dan
 * tidak di-commit). `SUPABASE_SERVICE_ROLE_KEY` **hanya** dipakai di dalam test
 * runner Node — tidak pernah masuk bundle client.
 */

export type SupabaseTestEnv = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

export type TestAuthUser = {
  id: string;
  email: string;
};

let cachedEnv: SupabaseTestEnv | null = null;

function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    env[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
  }

  return env;
}

export function supabaseTestEnv(): SupabaseTestEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const envPath = fileURLToPath(new URL('../../.env.local', import.meta.url));
  let content: string;

  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    throw new Error(`File .env.local tidak ditemukan di ${envPath}. Jalankan Tahapan 0 dulu.`);
  }

  const parsed = parseEnvFile(content);
  const url = parsed.SUPABASE_URL;
  const anonKey = parsed.SUPABASE_ANON_KEY;
  const serviceRoleKey = parsed.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local');
  }

  cachedEnv = { url, anonKey, serviceRoleKey };

  return cachedEnv;
}

/** Email unik per test supaya test independen (CONVENTIONS.md §11). */
export function uniqueTestEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

/**
 * Buka halaman lalu tunggu React selesai hidrasi (penanda `data-hydrated` di
 * `<html>`, di-set oleh `app/root.tsx`).
 *
 * Tanpa ini, submit form bisa terjadi sebelum hidrasi dan browser melakukan
 * submit native (GET + query string) alih-alih memanggil handler React.
 */
export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached', timeout: 30_000 });
}

export function adminHeaders(): Record<string, string> {
  const { serviceRoleKey } = supabaseTestEnv();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

export function anonHeaders(): Record<string, string> {
  const { anonKey } = supabaseTestEnv();

  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Membuat user yang emailnya sudah terkonfirmasi langsung lewat Admin API,
 * supaya test tidak perlu menunggu email verifikasi.
 */
export async function createConfirmedUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<TestAuthUser> {
  const { url } = supabaseTestEnv();
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.name },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gagal membuat user test (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { id: string; email: string };

  return { id: payload.id, email: payload.email };
}

export async function deleteUser(userId: string): Promise<void> {
  const { url } = supabaseTestEnv();

  await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  }).catch(() => undefined);
}

/** Konfirmasi email user yang dibuat lewat form signup. */
export async function confirmUserEmail(userId: string): Promise<void> {
  const { url } = supabaseTestEnv();
  const response = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ email_confirm: true }),
  });

  if (!response.ok) {
    throw new Error(`Gagal konfirmasi user (${response.status}): ${await response.text()}`);
  }
}

export async function findUserByEmail(email: string): Promise<TestAuthUser | null> {
  const { url } = supabaseTestEnv();
  const response = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, { headers: adminHeaders() });

  if (!response.ok) {
    throw new Error(`Gagal membaca daftar user (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { users?: { id: string; email?: string }[] };
  const found = payload.users?.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());

  return found && found.email ? { id: found.id, email: found.email } : null;
}

/** Cek apakah migrasi `0001_users.sql` sudah dijalankan. */
export async function isProfileTableReady(): Promise<boolean> {
  const { url } = supabaseTestEnv();
  const response = await fetch(`${url}/rest/v1/users?select=id&limit=1`, { headers: adminHeaders() });

  return response.ok;
}

export type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  credits: number;
};

const PROFILE_COLUMNS = 'id,email,name,plan,credits';

export async function fetchProfileRow(userId: string): Promise<ProfileRow | null> {
  const { url } = supabaseTestEnv();
  const response = await fetch(`${url}/rest/v1/users?id=eq.${userId}&select=${PROFILE_COLUMNS}`, {
    headers: adminHeaders(),
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as ProfileRow[];

  return rows[0] ?? null;
}

/**
 * Query `public.users` memakai access token milik user (anon key + JWT),
 * sehingga policy RLS benar-benar diuji.
 */
export async function fetchProfilesWithUserToken(
  accessToken: string,
  filter: string,
): Promise<{ status: number; rows: ProfileRow[] }> {
  const { url, anonKey } = supabaseTestEnv();
  const response = await fetch(`${url}/rest/v1/users?${filter}&select=${PROFILE_COLUMNS}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });

  const rows = response.ok ? ((await response.json()) as ProfileRow[]) : [];

  return { status: response.status, rows };
}

/** Login lewat Auth REST API untuk mendapatkan access token user. */
export async function signInForAccessToken(email: string, password: string): Promise<string> {
  const { url, anonKey } = supabaseTestEnv();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Gagal login via REST (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { access_token: string };

  return payload.access_token;
}
