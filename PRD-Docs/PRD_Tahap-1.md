# PRD — TAHAPAN 1: Auth dan User Layer
## Platform AI Web Builder (Vibe Coding Style)

**Versi:** 1.0
**Scope:** Tahapan 1 saja (Auth & User Layer)
**Parent Roadmap:** Roadmap Pembangunan Platform AI Web Builder
**Base Codebase:** Fork `stackblitz/bolt.new`
**Target Output:** Login multi-provider (Google, GitHub, Email/Password) + tabel user internal + proteksi route + session persist

---

## 1. Ringkasan Eksekutif

Tahapan 1 berfokus pada **lapisan autentikasi dan identitas user**. Setelah Tahapan 0 (fondasi lokal + Supabase project siap), tahap ini menggantikan sistem auth bawaan `bolt.new` dengan **Supabase Auth** yang mendukung tiga provider: Google, GitHub, dan Email/Password. Selain itu, dibuat tabel `users` internal untuk menyimpan profil, plan, dan kredit user.

**Definition of Done tingkat tahapan:**
> User dapat login via Google/GitHub/Email, session persist antar reload, profile tersimpan di tabel `users`, dan route terproteksi redirect ke `/login` jika belum auth.

**Batasan keras:** Tahapan ini **TIDAK** menyentuh persistence project, AI agent, deploy, atau fitur lain. Fokus 100% pada auth & user layer.

---

## 2. Tujuan & Non-Tujuan

### 2.1 Tujuan (In-Scope)
1. Install & konfigurasi `@supabase/ssr` + `@supabase/supabase-js`.
2. Membuat tabel `users` di Supabase dengan skema yang telah ditentukan.
3. Mengaktifkan 3 provider Supabase Auth: Google, GitHub, Email/Password.
4. Membuat middleware proteksi route (redirect ke `/login`).
5. Mengganti tombol "Sign in" bawaan `bolt.new` dengan Supabase Auth UI.
6. Memastikan session persist (refresh token bekerja, tidak logout saat reload).
7. Menyimpan profile user ke tabel `users` (trigger `on_auth_user_created`).
8. Menyediakan halaman `/login`, `/signup`, `/auth/callback`, dan `/logout`.
9. Menyediakan halaman `/account` sederhana untuk menampilkan profil user.
10. Playwright E2E test untuk seluruh alur auth.

### 2.2 Non-Tujuan (Out-of-Scope — JANGAN DIKERJAKAN)
- ❌ Menyimpan project user ke database (itu Tahapan 2).
- ❌ Mengubah model AI atau chat (itu Tahapan 3).
- ❌ Membuat dashboard project (itu Tahapan 2).
- ❌ Integrasi pembayaran / Pakasir (itu Tahapan 14).
- ❌ Credit deduction logic (itu Tahapan 13).
- ❌ Refactor besar-besaran pada komponen chat/editor/preview.

---

## 3. Stack & Konvensi Wajib

### 3.1 Stack yang Digunakan (WAJIB — Jangan ganti)
| Layer | Teknologi | Sumber |
|---|---|---|
| UI Framework | React + Vite (bawaan bolt.new) | `stackblitz/bolt.new` |
| Styling | Tailwind CSS (bawaan bolt.new) | `stackblitz/bolt.new` |
| Komponen UI | **Radix UI** (bawaan bolt.new) | `stackblitz/bolt.new` |
| Ikon | **Lucide React** (bawaan bolt.new) | `stackblitz/bolt.new` |
| Editor | Monaco Editor (tidak diubah) | `stackblitz/bolt.new` |
| Auth | Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`) | Supabase |
| Database | Supabase Postgres | Supabase |
| Testing | **Playwright** (WAJIB) | Playwright |
| Routing | React Router (bawaan bolt.new) | `stackblitz/bolt.new` |

### 3.2 Environment Variables (WAJIB pakai yang sudah disediakan)
Gunakan variabel dari `perencanaan stack.txt`. **Jangan hardcode**, **jangan buat nama baru** jika sudah ada.

```bash
# ===== SUPABASE =====
SUPABASE_URL=                    # dari file env yang sudah diisi
SUPABASE_ANON_KEY=               # dari file env yang sudah diisi
SUPABASE_SERVICE_ROLE_KEY=       # ⚠️ server only, JANGAN expose ke client
SUPABASE_JWT_SECRET=             # dari file env yang sudah diisi
```

**Aturan env:**
- Client-side hanya boleh akses `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` dan `SUPABASE_JWT_SECRET` hanya boleh dipakai di server-side route (jika nanti ada API route di tahap ini — untuk trigger profile, cukup pakai anon key + RLS).
- Jangan menambah env baru di luar daftar di `perencanaan stack.txt`.

---

## 4. Larangan Keras — Anti "AI Slop" UI

> **PENTING:** Pelanggaran pada bagian ini dianggap **kegagalan tahapan**, bukan sekadar catatan.

### 4.1 Larangan Komponen Native
**DILARANG KERAS** menggunakan komponen HTML native mentah untuk elemen interaktif berikut:
- ❌ `<button>` mentah → WAJIB pakai `Button` dari Radix UI (atau wrapper bawaan bolt.new).
- ❌ `<input>` mentah → WAJIB pakai `Input` dari Radix UI.
- ❌ `<dialog>` / modal manual → WAJIB pakai `Dialog` dari Radix UI.
- ❌ `<select>` mentah → WAJIB pakai `Select` dari Radix UI.
- ❌ Tooltip manual via `title` attribute → WAJIB pakai `Tooltip` dari Radix UI.
- ❌ Dropdown manual → WAJIB pakai `DropdownMenu` dari Radix UI.
- ❌ Toast manual → WAJIB pakai `Toast` dari Radix UI.
- ❌ Tabs manual → WAJIB pakai `Tabs` dari Radix UI.

**Pengecualian:** Elemen struktural non-interaktif (`<div>`, `<span>`, `<section>`, `<header>`, `<main>`, `<nav>`, `<form>`, `<label>`) boleh native selama styling Tailwind konsisten.

### 4.2 Larangan Visual "AI Slop"
Berikut adalah pola visual yang **DILARANG**:
1. ❌ **Gradient ungu-biru default** ala "AI startup template" tanpa alasan desain.
2. ❌ **Emoji bertebaran** sebagai ikon (mis. 🚀✨🔥) → WAJIB pakai **Lucide React**.
3. ❌ **Card dengan shadow berlebihan + rounded-3xl + gradient border** tanpa hierarki visual.
4. ❌ **Hero section raksasa** di halaman login (login bukan landing page).
5. ❌ **Animasi berlebihan** (bounce, pulse terus-menerus, parallax) di form auth.
6. ❌ **Copywriting puitis berlebihan** ("Unlock your creative potential...") → gunakan copy fungsional.
7. ❌ **Placeholder "Lorem ipsum"**.
8. ❌ **Warna neon** atau kontras rendah (WCAG AA wajib terpenuhi).
9. ❌ **Font dekoratif** (script, handwriting) → gunakan font default bolt.new.
10. ❌ **Icon berukuran tidak konsisten** (mis. 20px, 22px, 24px bercampur) → konsisten 16/20/24.

### 4.3 Standar Visual yang Benar
- Gunakan **design token bawaan bolt.new** (warna, spacing, radius).
- Ikuti **dark mode** bawaan bolt.new (auth page harus support dark mode).
- Ikon: **Lucide React**, ukuran konsisten (16, 20, 24).
- Tombol primer: gunakan `Button variant="primary"` bawaan, jangan bikin sendiri.
- Form: label di atas input, helper text abu-abu, error text merah (`text-red-500`).
- Loading state: **Skeleton** (Radix) atau spinner konsisten.
- Spacing: gunakan skala Tailwind (4, 6, 8, 12, 16), jangan arbitrary value.

---

## 5. Skema Database

### 5.1 Tabel `users` (internal, bukan `auth.users`)
```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar text,
  plan text not null default 'free' check (plan in ('free','pro','team')),
  credits integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index
create index users_email_idx on public.users(email);

-- RLS
alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Trigger: auto insert profile setelah signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5.2 Migration File
Simpan sebagai `supabase/migrations/0001_users.sql` (atau via Supabase SQL Editor, dokumentasikan di README).

---

## 6. Alur Kerja Auth (Flow Detail)

### 6.1 Alur Login Email/Password
```
[User buka /login]
   → [Isi email + password]
   → [Klik "Sign in" (Radix Button)]
   → [supabase.auth.signInWithPassword()]
   → [Jika sukses] → redirect ke / (atau ?redirect=)
   → [Jika gagal] → Toast Radix: "Email atau password salah"
```

### 6.2 Alur Login OAuth (Google/GitHub)
```
[User buka /login]
   → [Klik "Continue with Google" (Radix Button + Lucide icon)]
   → [supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } })]
   → [Redirect ke Google consent]
   → [Callback ke /auth/callback?code=...]
   → [Exchange code for session]
   → [Trigger handle_new_user() insert ke public.users]
   → [Redirect ke /]
```

### 6.3 Alur Signup Email
```
[User buka /signup]
   → [Isi email + password + nama]
   → [supabase.auth.signUp({ email, password, options: { data: { full_name } } })]
   → [Jika email confirmation aktif] → tampil pesan "Cek email untuk verifikasi"
   → [Jika tidak] → auto login → redirect ke /
```

### 6.4 Alur Logout
```
[User klik avatar di header]
   → [DropdownMenu Radix muncul]
   → [Klik "Log out"]
   → [supabase.auth.signOut()]
   → [Redirect ke /login]
```

### 6.5 Alur Proteksi Route (Middleware)
```
[User akses route terproteksi, mis. /]
   → [Middleware cek session via @supabase/ssr]
   → [Jika tidak ada session] → redirect /login?redirect=<path>
   → [Jika ada session] → lanjut
```

**Route publik (whitelist):** `/login`, `/signup`, `/auth/callback`, `/auth/error`
**Route terproteksi (default):** semua route lain, termasuk `/` (workspace bolt.new).

> **Catatan:** Jika `bolt.new` belum punya React Router, gunakan pola yang sudah ada (kemungkinan pakai `react-router-dom`). Jangan paksa ganti router — sesuaikan dengan yang ada.

---

## 7. Halaman & Komponen yang Harus Dibuat

### 7.1 Halaman `/login`
**Struktur visual (WAJIB ikuti, jangan improvisasi):**
```
┌─────────────────────────────────────────────┐
│              [Logo bolt.new]                │
│                                             │
│              Selamat datang                 │  ← H1, text-2xl, font-semibold
│         Masuk untuk melanjutkan             │  ← text-sm, text-muted
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ [G] Continue with Google              │  │  ← Radix Button, variant outline, full width
│  ├───────────────────────────────────────┤  │
│  │ [GH] Continue with GitHub             │  │  ← Radix Button, variant outline, full width
│  └───────────────────────────────────────┘  │
│                                             │
│  ─────────── atau ───────────               │  ← divider
│                                             │
│  Email                                      │  ← Radix Label
│  [_________________________________]        │  ← Radix Input
│                                             │
│  Password                    Lupa?          │  ← Label + link kecil
│  [_________________________________]        │  ← Radix Input (type password, toggle eye Lucide)
│                                             │
│  [        Masuk        ]                    │  ← Radix Button primary, full width
│                                             │
│  Belum punya akun? Daftar                   │  ← link ke /signup
└─────────────────────────────────────────────┘
```

**Aturan visual:**
- Container: `max-w-sm mx-auto`, padding `p-6`, rounded `rounded-lg`, border `border border-border`.
- Background halaman: `bg-background` (token bolt.new), **bukan gradient**.
- Logo: gunakan logo bolt.new yang sudah ada (jangan generate baru).
- Tombol OAuth: ikon Lucide di kiri, teks di kanan, `justify-start`, `gap-2`.
- Error: Radix Toast (bukan alert()).
- Loading: tombol disabled + spinner Lucide (`Loader2` dengan `animate-spin`).

### 7.2 Halaman `/signup`
Mirip `/login`, tambah field **Nama lengkap**, dan link ke `/login`.

### 7.3 Halaman `/auth/callback`
Route handler yang:
1. Ambil `code` dari query.
2. `supabase.auth.exchangeCodeForSession(code)`.
3. Redirect ke `/` atau `?redirect=`.
4. Jika error → redirect `/auth/error?message=...`.

### 7.4 Halaman `/auth/error`
Tampilkan pesan error dengan Radix Button "Coba lagi" → `/login`.

### 7.5 Halaman `/account` (sederhana)
Tampilkan:
- Avatar user (Radix Avatar).
- Nama, email.
- Plan badge (Radix Badge).
- Sisa credits.
- Tombol "Log out".

### 7.6 Komponen `UserMenu` (di header)
Ganti tombol "Sign in" bawaan dengan:
- Jika belum login: Radix Button "Sign in" → `/login`.
- Jika sudah login: Radix DropdownMenu dengan Avatar → menu: Account, Log out.

---

## 8. Kriteria Penyelesaian (Definition of Done — Per Item)

Tahapan 1 dinyatakan **SELESAI** jika **SEMUA** kriteria berikut terpenuhi dan terverifikasi:

### 8.1 Kriteria Fungsional
- [ ] **K1.1** — User dapat signup via email/password, dan baris muncul di `public.users` (via trigger).
- [ ] **K1.2** — User dapat login via email/password.
- [ ] **K1.3** — User dapat login via Google OAuth, profile otomatis terbuat di `public.users`.
- [ ] **K1.4** — User dapat login via GitHub OAuth, profile otomatis terbuat di `public.users`.
- [ ] **K1.5** — Session persist: reload halaman tidak logout.
- [ ] **K1.6** — Logout menghapus session dan redirect ke `/login`.
- [ ] **K1.7** — Akses route terproteksi tanpa login → redirect `/login?redirect=...`.
- [ ] **K1.8** — Setelah login, user diarahkan ke `?redirect=` jika ada.
- [ ] **K1.9** — Halaman `/account` menampilkan data user yang benar.
- [ ] **K1.10** — Error login (password salah) menampilkan Toast Radix, bukan `alert()`.

### 8.2 Kriteria Visual
- [ ] **K2.1** — Tidak ada komponen HTML native mentah untuk elemen interaktif (diaudit manual + grep).
- [ ] **K2.2** — Semua ikon pakai Lucide React, ukuran konsisten.
- [ ] **K2.3** — Dark mode berfungsi di semua halaman auth.
- [ ] **K2.4** — Tidak ada gradient ungu-biru default, tidak ada emoji sebagai ikon.
- [ ] **K2.5** — Kontras WCAG AA terpenuhi (cek dengan axe DevTools).
- [ ] **K2.6** — Responsive di 375px, 768px, 1440px.

### 8.3 Kriteria Teknis
- [ ] **K3.1** — `SUPABASE_SERVICE_ROLE_KEY` TIDAK ada di bundle client (cek `dist/`).
- [ ] **K3.2** — RLS aktif di tabel `users`, user hanya bisa select/update baris sendiri.
- [ ] **K3.3** — Tidak ada `console.log` yang bocorkan token/session.
- [ ] **K3.4** — `pnpm run build` sukses tanpa error TypeScript.
- [ ] **K3.5** — `pnpm run lint` sukses.

### 8.4 Kriteria Testing (Playwright — WAJIB)
- [ ] **K4.1** — Test: signup email → cek baris di DB → login → logout.
- [ ] **K4.2** — Test: login email salah → Toast error muncul.
- [ ] **K4.3** — Test: akses `/` tanpa login → redirect `/login`.
- [ ] **K4.4** — Test: login → akses `/` → berhasil, header menampilkan avatar.
- [ ] **K4.5** — Test: reload setelah login → masih login.
- [ ] **K4.6** — Test: klik "Log out" → redirect `/login`, session hilang.
- [ ] **K4.7** — Test (opsional, manual): OAuth Google & GitHub berhasil (bisa di-skip di CI, tapi wajib dites manual 1x).

---

## 9. Instruksi Testing Playwright

### 9.1 Setup
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### 9.2 Struktur Test
```
tests/
  e2e/
    auth.spec.ts
  fixtures/
    test-user.ts
```

### 9.3 Contoh Skenario (wajib diimplementasikan)
```ts
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('redirect ke /login saat belum auth', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('login email salah menampilkan toast', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('salah@example.com');
  await page.getByLabel('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('status')).toContainText(/salah|gagal/i);
});

test('signup → login → logout', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByLabel('Nama').fill('Test User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Daftar' }).click();
  // ... lanjut sesuai konfigurasi email confirmation
});
```

**Aturan testing:**
- Gunakan `getByRole`, `getByLabel` (aksesibilitas) — **bukan** `getByTestId` kecuali terpaksa.
- Setiap test harus **independen** (buat user baru per test, atau cleanup).
- Jangan pakai `waitForTimeout` — pakai `expect(...).toBeVisible()`.
- Test harus jalan di `pnpm exec playwright test`.

---

## 10. Alur Verifikasi Mandiri oleh AI Agent (WAJIB)

Sebelum menyatakan tahapan selesai, AI Agent **HARUS** melakukan checklist berikut **secara berurutan**:

### 10.1 Pra-Implementasi
1. Baca ulang PRD ini dari awal sampai akhir.
2. Cek `package.json` — pastikan `@supabase/ssr`, `@supabase/supabase-js`, `@playwright/test` sudah terinstall.
3. Cek `.env.local` — pastikan `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sudah terisi (jika kosong, minta user isi, jangan lanjut).
4. Cek struktur folder `bolt.new` — identifikasi lokasi: router, header, tombol "Sign in" bawaan, komponen UI (Radix wrapper).

### 10.2 Saat Implementasi
5. Setiap kali membuat komponen baru, cek: apakah ada Radix wrapper yang sudah ada? Jika ya, pakai itu. Jika tidak, buat wrapper dulu.
6. Setiap kali menulis SQL, cek: apakah RLS sudah aktif? Apakah policy benar?
7. Setiap kali menulis kode yang menyentuh `SUPABASE_SERVICE_ROLE_KEY`, pastikan file tersebut **tidak** di-import dari client component.

### 10.3 Pasca-Implementasi
8. Jalankan `pnpm run build` — harus sukses.
9. Jalankan `pnpm run lint` — harus sukses.
10. Jalankan `pnpm exec playwright test` — semua test harus pass.
11. Grep audit:
    - `grep -r "SUPABASE_SERVICE_ROLE_KEY" src/` → harus **hanya** muncul di file server-side (jika ada).
    - `grep -r "<button" src/` → harus **0 hasil** (kecuali di wrapper Radix).
    - `grep -r "<input" src/` → harus **0 hasil** (kecuali di wrapper Radix).
    - `grep -rE "🚀|✨|🔥|💡" src/` → harus **0 hasil** di halaman auth.
12. Cek manual di browser: buka `/login`, `/signup`, `/account` di light & dark mode.
13. Cek responsive di 375px, 768px, 1440px (DevTools).
14. Cek bundle: `grep -r "service_role" dist/` → harus **0 hasil**.

### 10.4 Jika Ada Error / Hambatan
- **Jangan lanjut** ke item berikutnya sebelum error teratasi.
- Jika stuck >30 menit, pecah masalah jadi sub-masalah.
- Dokumentasikan error + solusi di `TAHAPAN-1-NOTES.md`.
- Jangan menyerahkan ke user sebelum checklist di atas **100% hijau**.

---

## 11. Struktur File yang Diharapkan (Referensi)

```
src/
  lib/
    supabase/
      client.ts          # createBrowserClient
      server.ts          # createServerClient (jika ada SSR)
      middleware.ts      # updateSession helper
  components/
    auth/
      LoginForm.tsx
      SignupForm.tsx
      OAuthButtons.tsx
      UserMenu.tsx
    ui/                  # wrapper Radix (jika belum ada)
      button.tsx
      input.tsx
      toast.tsx
  routes/                # atau pages/, sesuai router bolt.new
    login.tsx
    signup.tsx
    account.tsx
    auth/
      callback.tsx
      error.tsx
  middleware.ts          # proteksi route
supabase/
  migrations/
    0001_users.sql
tests/
  e2e/
    auth.spec.ts
```

---

## 12. Commit & Tag

Setelah semua kriteria terpenuhi:
```bash
git add .
git commit -m "feat(auth): tahapan 1 - supabase auth + user layer"
git tag v0.1-auth
```

---

## 13. Ringkasan Aturan Vibe Coding untuk Tahapan Ini

1. **Satu tahapan = satu sesi.** Jangan campur dengan Tahapan 2.
2. **Test dulu, lanjut kemudian.** Setiap item di §8 harus dicek.
3. **Commit tiap sub-selesai.** Mis. `feat(auth): login form`, `feat(auth): oauth buttons`.
4. **Kalau stuck >30 menit, pecah lagi.**
5. **Prompt template:**
   > "Saya di Tahapan 1. Konteks: [kode existing]. Tugas: [1 hal spesifik]. Output: [file/behavior]. Pastikan pakai Radix UI, Lucide, dan env dari `perencanaan stack.txt`."

---

## 14. Penutup

PRD ini **hanya** untuk Tahapan 1. Tahapan 2 (Project Persistence) akan dibuat terpisah setelah Tahapan 1 dinyatakan **SELESAI** dengan semua kriteria di §8 hijau.

**AI Agent dilarang:**
- ❌ Melanjutkan ke Tahapan 2 tanpa instruksi eksplisit.
- ❌ Mengubah scope di luar §2.1.
- ❌ Menggunakan komponen native untuk elemen interaktif.
- ❌ Membuat visual "AI Slop".
- ❌ Menyerahkan hasil sebelum checklist §10 100% hijau.

**AI Agent wajib:**
- ✅ Baca PRD ini sampai habis sebelum mulai.
- ✅ Cek ulang alur di §10 sebelum menyatakan selesai.
- ✅ Pakai env dari `perencanaan stack.txt`.
- ✅ Test dengan Playwright.
- ✅ Dokumentasikan jika ada penyimpangan dari PRD (dengan alasan teknis).

---

**Disiapkan untuk:** Tahapan 1 — Auth dan User Layer
**Status:** Siap dieksekusi
**Tahapan berikutnya:** Menunggu penyelesaian Tahapan 1