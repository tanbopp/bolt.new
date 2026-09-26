import { expect, test, type Page } from '@playwright/test';
import {
  confirmUserEmail,
  createConfirmedUser,
  deleteUser,
  fetchProfileRow,
  fetchProfilesWithUserToken,
  findUserByEmail,
  gotoHydrated,
  isEmailRateLimitMessage,
  isProfileTableReady,
  signInForAccessToken,
  uniqueTestEmail,
} from '../fixtures/test-user';

const PASSWORD = 'Password123!';

/**
 * E2E Tahapan 1 — Auth & User Layer.
 *
 * Test yang butuh tabel `public.users` akan otomatis di-skip bila migrasi
 * `supabase/migrations/0001_users.sql` belum dijalankan di project Supabase
 * (lihat `notes/TAHAPAN-1-NOTES.md`).
 */

let profileTableReady = false;
const createdUserIds: string[] = [];

test.beforeAll(async () => {
  profileTableReady = await isProfileTableReady();

  if (!profileTableReady) {
    console.warn(
      '[auth.spec] Tabel public.users belum ada → jalankan supabase/migrations/0001_users.sql. Test terkait akan di-skip.',
    );
  }
});

test.afterEach(async () => {
  while (createdUserIds.length > 0) {
    await deleteUser(createdUserIds.pop() as string);
  }
});

async function loginViaUi(page: Page, email: string, password: string): Promise<void> {
  await gotoHydrated(page, '/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('/', { timeout: 60_000 });
}

/** K1.7 — route terproteksi mengalihkan ke /login?redirect=... */
test('akses / tanpa login dialihkan ke /login?redirect=/', async ({ page }) => {
  await gotoHydrated(page, '/');

  await expect(page).toHaveURL(/\/login\?redirect=%2F$/);
  await expect(page.getByRole('heading', { name: 'Selamat datang' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();
});

/** K1.10 — error login tampil sebagai toast (role=status), bukan alert() */
test('login dengan password salah menampilkan toast error', async ({ page }) => {
  await gotoHydrated(page, '/login');
  await page.getByLabel('Email').fill('salah@example.com');
  await page.getByLabel('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Masuk' }).click();

  await expect(page.getByRole('status')).toContainText(/salah|gagal/i);
  await expect(page).toHaveURL(/\/login/);
});

/** K1.1 (bagian DB) — trigger mengisi public.users + `on delete cascade` */
test('user baru otomatis mendapat baris profil di public.users', async () => {
  test.skip(!profileTableReady, 'Tabel public.users belum ada (migrasi 0001_users.sql belum dijalankan)');

  const user = await createConfirmedUser({
    email: uniqueTestEmail('trigger'),
    password: PASSWORD,
    name: 'E2E Trigger',
  });

  const profile = await fetchProfileRow(user.id);

  expect(profile, 'trigger on_auth_user_created harus membuat baris public.users').not.toBeNull();
  expect(profile?.email).toBe(user.email);
  expect(profile?.name).toBe('E2E Trigger');
  expect(profile?.plan).toBe('free');
  expect(profile?.credits).toBe(100);

  await deleteUser(user.id);

  const afterDelete = await fetchProfileRow(user.id);

  expect(afterDelete, 'on delete cascade harus ikut menghapus baris profil').toBeNull();
});

/**
 * K1.1 — signup lewat form membuat baris di public.users (via trigger).
 *
 * Signup publik memicu **kirim email konfirmasi**; bila kuota email project
 * sedang habis (`over_email_send_rate_limit`, lihat
 * `notes/TAHAPAN-1-NOTES.md` §9) test ini di-skip dengan alasan eksplisit —
 * mekanisme trigger-nya sendiri sudah diverifikasi test sebelumnya.
 */
test('signup email/password membuat profil di public.users', async ({ page }) => {
  test.skip(!profileTableReady, 'Tabel public.users belum ada (migrasi 0001_users.sql belum dijalankan)');

  const email = uniqueTestEmail('signup');

  await gotoHydrated(page, '/signup');
  await page.getByLabel('Nama').fill('E2E Signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Daftar' }).click();

  const notice = page.getByText(/cek email/i);
  const toast = page.getByRole('status');

  await expect(notice.or(toast).first()).toBeVisible({ timeout: 30_000 });

  if ((await notice.count()) === 0) {
    const toastText = await toast.first().innerText();

    test.skip(isEmailRateLimitMessage(toastText), `Kuota email Supabase habis: ${toastText}`);

    throw new Error(`Signup gagal: ${toastText}`);
  }

  const authUser = await findUserByEmail(email);
  expect(authUser, 'user auth.users harus terbentuk setelah signup').not.toBeNull();

  if (!authUser) {
    return;
  }

  createdUserIds.push(authUser.id);

  // bisa langsung login setelah email dikonfirmasi (bukti signup selesai)
  await confirmUserEmail(authUser.id);

  const profile = await fetchProfileRow(authUser.id);

  expect(profile, 'trigger on_auth_user_created harus membuat baris public.users').not.toBeNull();
  expect(profile?.email).toBe(email);
  expect(profile?.name).toBe('E2E Signup');
  expect(profile?.plan).toBe('free');
  expect(profile?.credits).toBe(100);
});

/** K1.2 + K4.4 — login email/password lalu header menampilkan menu akun */
test('login berhasil diarahkan ke workspace dan header menampilkan menu akun', async ({ page }) => {
  const user = await createConfirmedUser({ email: uniqueTestEmail('login'), password: PASSWORD, name: 'E2E Login' });
  createdUserIds.push(user.id);

  await loginViaUi(page, user.email, PASSWORD);

  await expect(page.getByRole('button', { name: 'Menu akun' })).toBeVisible();
});

/** K1.5 — session persist setelah reload */
test('session tetap ada setelah halaman di-reload', async ({ page }) => {
  const user = await createConfirmedUser({ email: uniqueTestEmail('reload'), password: PASSWORD, name: 'E2E Reload' });
  createdUserIds.push(user.id);

  await loginViaUi(page, user.email, PASSWORD);
  await page.reload();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Menu akun' })).toBeVisible();
});

/** K1.6 — logout menghapus session */
test('log out dari menu akun mengembalikan ke /login', async ({ page }) => {
  const user = await createConfirmedUser({ email: uniqueTestEmail('logout'), password: PASSWORD, name: 'E2E Logout' });
  createdUserIds.push(user.id);

  await loginViaUi(page, user.email, PASSWORD);

  await page.getByRole('button', { name: 'Menu akun' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await expect(page).toHaveURL(/\/login/);

  // session benar-benar hilang: akses / kembali dialihkan ke /login
  await gotoHydrated(page, '/');
  await expect(page).toHaveURL(/\/login/);
});

/** K1.8 — `?redirect=` dihormati setelah login */
test('login menghormati parameter ?redirect=', async ({ page }) => {
  const user = await createConfirmedUser({
    email: uniqueTestEmail('redirect'),
    password: PASSWORD,
    name: 'E2E Redirect',
  });
  createdUserIds.push(user.id);

  await gotoHydrated(page, '/account');
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount$/);

  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Masuk' }).click();

  await expect(page).toHaveURL(/\/account$/);
});

/** K1.9 — halaman /account menampilkan data user */
test('/account menampilkan profil user', async ({ page }) => {
  test.skip(!profileTableReady, 'Tabel public.users belum ada (migrasi 0001_users.sql belum dijalankan)');

  const user = await createConfirmedUser({
    email: uniqueTestEmail('account'),
    password: PASSWORD,
    name: 'E2E Account',
  });
  createdUserIds.push(user.id);

  await loginViaUi(page, user.email, PASSWORD);
  await gotoHydrated(page, '/account');

  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();
  await expect(page.getByText('E2E Account')).toBeVisible();
  await expect(page.getByText('FREE')).toBeVisible();
});

/** K3.2 — RLS: user hanya bisa membaca barisnya sendiri */
test('RLS membatasi user ke barisnya sendiri', async () => {
  test.skip(!profileTableReady, 'Tabel public.users belum ada (migrasi 0001_users.sql belum dijalankan)');

  const userA = await createConfirmedUser({ email: uniqueTestEmail('rls-a'), password: PASSWORD, name: 'RLS A' });
  const userB = await createConfirmedUser({ email: uniqueTestEmail('rls-b'), password: PASSWORD, name: 'RLS B' });
  createdUserIds.push(userA.id, userB.id);

  const token = await signInForAccessToken(userA.email, PASSWORD);

  const own = await fetchProfilesWithUserToken(token, `id=eq.${userA.id}`);
  expect(own.status).toBe(200);
  expect(own.rows).toHaveLength(1);

  const other = await fetchProfilesWithUserToken(token, `id=eq.${userB.id}`);
  expect(other.rows, 'baris user lain tidak boleh terbaca').toHaveLength(0);
});

/** K1.3 / K1.4 — tombol OAuth menjalankan alur signInWithOAuth */
test('tombol "Continue with Google" memicu alur OAuth Supabase', async ({ page }) => {
  await gotoHydrated(page, '/login');
  await page.getByRole('button', { name: 'Continue with Google' }).click();

  /**
   * Hasil yang diterima: redirect ke provider (bila provider aktif) ATAU toast
   * error (bila provider belum diaktifkan di dashboard Supabase).
   */
  await expect
    .poll(
      async () => {
        if (!page.url().startsWith('http://localhost:5173')) {
          return 'redirected';
        }

        return (await page.getByRole('status').count()) > 0 ? 'toast' : 'pending';
      },
      { timeout: 20_000, message: 'alur OAuth harus memicu redirect atau toast error' },
    )
    .not.toBe('pending');
});

/**
 * K1.3/K1.4 (login penuh lewat Google/GitHub) & K4.7 — diverifikasi manual.
 *
 * Diblokir oleh konfigurasi di luar kode: provider Google/GitHub harus
 * diaktifkan di dashboard Supabase (butuh Client ID/Secret provider), dan
 * belum ada kredensial Google di `.env`. Lihat `notes/TAHAPAN-1-NOTES.md`.
 */
test.skip('login penuh via Google/GitHub (manual, butuh provider aktif di dashboard)', async () => {
  /**
   * Dijalankan manual setelah provider diaktifkan: klik OAuth → consent →
   * kembali ke /auth/callback → session terbentuk → /account menampilkan profil.
   */
});
