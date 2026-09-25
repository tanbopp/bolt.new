# TAHAPAN-1-NOTES.md — Auth & User Layer

> Catatan kerja Tahapan 1. Dibuat mengikuti `WORKFLOW.md` §9.
> Status di §1 dan §8 diupdate setiap selesai fase.

---

## §1 Status

| Item | Nilai |
|---|---|
| Tahap | 1 — Auth & User Layer |
| Status | 🟡 Hampir selesai (lihat §8: 3 kriteria diblokir konfigurasi luar) |
| Tanggal | 2026-09-26 |
| Base | `eda10b1` + Tahapan 0 (`v0.0-setup`) |
| PRD | `PRD-Docs/PRD_Tahap-1.md` |
| Stack auth | `@supabase/supabase-js` 2.117.2 + `@supabase/ssr` 0.12.7 |
| Testing | Playwright 1.63 + axe-core |

---

## §2 Investigasi

### 2.1 Kenyataan codebase vs asumsi PRD

PRD Tahapan 1 (`§3.1`, `§11`) mengasumsikan base **Vite + React SPA** dengan
`src/`, React Router, dan Monaco. Base fork yang sebenarnya berbeda:

| Asumsi PRD | Kenyataan fork | Dampak |
|---|---|---|
| `src/` | `app/` (Remix flat routes) | Semua path file berbeda |
| React Router (`react-router-dom`) | Router Remix (`@remix-run/react`) | Guard route pakai `loader`, bukan route middleware |
| Monaco Editor | **CodeMirror 6** (bawaan upstream) | Tidak disentuh (di luar scope) |
| Tailwind CSS | **UnoCSS** (presetUno, kompatibel utility Tailwind) | Token & arbitrary value perlu verifikasi |
| `dist/` | `build/` (Remix + Cloudflare) | Audit bundle diarahkan ke `build/` |
| — | Cloudflare Pages/Workers (`wrangler`, `nodejs_compat`) | Env server dibaca dari `process.env` (dev) / `context.cloudflare.env` (prod) |

### 2.2 Design token yang benar-benar tersedia

`DESIGN-GUARDRAILS.md` §2 menyebut token ala shadcn (`bg-background`,
`text-muted-foreground`, `text-destructive`, `border-border`). Token itu **tidak ada**
di `uno.config.ts`/`variables.scss`. Yang ada adalah token `bolt-elements-*`:

`bg-bolt-elements-background-depth-1..4`, `text-bolt-elements-textPrimary|Secondary|Tertiary`,
`border-bolt-elements-borderColor`, `text-bolt-elements-icon-success|error`,
`bg-bolt-elements-item-backgroundActive|Accent`, `text-bolt-elements-item-contentAccent`,
`bg-bolt-elements-dividerColor`, palet `accent|gray|red|green|orange`.

### 2.3 Titik integrasi yang dipakai

- `app/root.tsx` → ditambahkan `loader` (guard) + `ToastProvider`.
- `app/components/header/Header.tsx` → **tidak ada** tombol "Sign in" bawaan
  (PRD §7.6 mengasumsikan ada); `UserMenu` ditambahkan ke sisi kanan header.
- `app/lib/.server/llm/api-key.ts` → pola env server yang diikuti
  (`process.env` untuk dev, `cloudflareEnv` untuk produksi).
- `app/components/ui/Dialog.tsx` → pola penulisan wrapper Radix yang diikuti.
- `app/utils/classNames.ts` → helper class (bukan `cn()` seperti di `CONVENTIONS.md` §6).

### 2.4 Status project Supabase (saat investigasi)

- Anon key & service key valid; provider auth aktif: **email saja**.
- `mailer_autoconfirm = false` → login hanya bisa setelah email dikonfirmasi.
- Tabel `public.users` **belum ada** (404/PGRST205).
- Tidak ada Supabase access token / CLI login di mesin ini → DDL & konfigurasi
  provider **tidak bisa** dijalankan dari sisi agent (lihat §4 D18 dan §8).

---

## §3 Keputusan Teknis

1. **Guard route di `loader` root** (`app/root.tsx`) — padanan middleware Remix.
   Dilengkapi whitelist route publik: `/login`, `/signup`, `/auth/callback`,
   `/auth/error`, `/logout`, plus prefix `/api/`.
2. **Session berbasis cookie** (`@supabase/ssr`, bukan localStorage) supaya bisa
   dibaca server. `createBrowserClient` (client) + `createServerClient` (loader)
   dibuat per request; `setAll` menulis `Set-Cookie` ke header response loader.
3. **`getUser()` di guard (bukan `getSession()`)** karena auth-js secara eksplisit
   memperingatkan bahwa objek dari `getSession()` berasal dari cookie klien dan
   tidak boleh dipercaya di server. Konsekuensinya ada satu panggilan verifikasi
   token ke Supabase Auth pada setiap request terproteksi (pola yang sama dipakai
   contoh resmi Supabase untuk middleware SSR). Batas keamanan data tetap RLS.
4. **Env mengikuti `.env` yang disediakan**: `SUPABASE_URL` + `SUPABASE_ANON_KEY`
   (tanpa prefix `VITE_` baru) dengan `envPrefix: ['VITE_', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']`
   di `vite.config.ts`. `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_JWT_SECRET`
   **tidak** masuk prefix → tidak mungkin terbaca client.
5. **Toast memakai Radix Toast** (wajib PRD §4.1) melalui
   `app/components/ui/Toast.tsx`, di-mount sekali di root. Toast react-toastify
   bawaan upstream dibiarkan (dipakai chat) — menggantinya di luar scope.
6. **Error login → toast + teks inline** dengan pesan Bahasa Indonesia
   (`app/lib/supabase/errors.ts`).
7. **OAuth callback di client** (`/auth/callback`) karena code verifier PKCE
   disimpan `@supabase/ssr` di cookie yang hanya bisa dibaca browser.
8. **Test DB-aware**: test yang butuh tabel `public.users` otomatis di-skip bila
   migrasi belum dijalankan (auto-aktif setelah dijalankan).
9. **axe-core dijalankan di dalam Playwright** (bukan manual) supaya audit
   kontras/dark mode repeatable.

---

## §4 Deviasi dari PRD & Guardrails

| # | Deviasi | Alasan |
|---|---|---|
| D1 | Path file mengikuti `app/**` (Remix), bukan `src/**`; import `~/…`, bukan `@/…` | Struktur base fork yang sebenarnya |
| D2 | Guard route memakai `loader` root (Remix), bukan file `middleware.ts` React Router | Remix tidak punya middleware; nama file `app/lib/supabase/middleware.ts` dipertahankan sesuai PRD §11 |
| D3 | Editor tetap CodeMirror (tidak diubah ke Monaco) | Monaco bukan bagian base; mengganti editor = refactor besar di luar scope §2.2 |
| D4 | Token warna memakai `bolt-elements-*`; teks error memakai `text-red-500` | Token shadcn di `DESIGN-GUARDRAILS.md` §2/§7b tidak ada di UnoCSS project |
| D5 | Env tetap `SUPABASE_URL`/`SUPABASE_ANON_KEY` (tidak membuat `VITE_*` baru) | `AGENTS.md` §3.3 melarang nama env baru; `envPrefix` dipakai agar tetap bisa diakses client |
| D6 | Ikon brand OAuth memakai Iconify Phosphor (`i-ph:google-logo`, `i-ph:github-logo`) | **Lucide React v1 tidak lagi menyediakan ikon brand**; seluruh ikon non-brand tetap Lucide |
| D7 | Toast react-toastify bawaan upstream tetap ada di chat | Menyentuh chat = di luar scope; toast auth memakai Radix sesuai PRD |
| D8 | Tautan "Lupa password?" membuka Radix Dialog penjelasan, bukan halaman reset | Reset password tidak ada di §2.1 (In-Scope); dialog menjaga struktur visual §7.1 tanpa route mati |
| D9 | `/auth/callback` menukar `code` di client (bukan loader server) | PKCE code verifier disimpan `@supabase/ssr` di cookie browser |
| D10 | Migration memakai penjaga idempotent (`if not exists`, `drop policy if exists`) + trigger `updated_at` **[TAMBAHAN]** | Aman dijalankan ulang dari SQL Editor; tanpa trigger, `updated_at` = `created_at` selamanya |
| D11 | Varian `primary`/`danger` tombol dibuat solid (`bg-accent-700`/`bg-red-600` + teks putih) | Token tonal bawaan hanya ±2,3:1 (primary) dan ±3,3:1 (danger) di light mode → gagal WCAG AA (K2.5) |
| D12 | `app/root.tsx` men-set `data-hydrated` di `<html>` | Halaman di-render server; tanpa penanda, test bisa submit form sebelum hidrasi (submit native GET) |
| D13 | Route `/api/*` dikecualikan dari guard | Endpoint AI/chat di luar scope Tahapan 1 (dicatat di §9) |
| D14 | Audit grep `<button>`/`<input>` dibatasi ke file baru tahap ini | Upstream `bolt.new` memakai `<button>`/`<input>` native di banyak komponen; menyeragamkannya = refactor besar di luar scope. File baru **0 pelanggaran** (lihat §7) |
| D15 | `aria-label` toggle password: "Tampilkan sandi"/"Sembunyikan sandi" | Supaya `getByLabel('Password')` (contoh PRD §9.3) tetap unik, sekaligus tetap deskriptif |
| D16 | Test yang butuh tabel `users` auto-skip bila migrasi belum jalan | Keterbatasan kredensial (lihat D18); test otomatis aktif setelah migrasi dijalankan |
| D17 | Halaman `/logout` disediakan sebagai route | PRD §2.1 mencantumkannya; logika logout utama tetap di `UserMenu` (§6.4) |
| D18 | Migrasi tabel **belum dijalankan** & provider Google/GitHub **belum diaktifkan** | Keduanya butuh akses yang tidak tersedia: Supabase Management API/PAT (tidak ada di `.env`), SQL Editor (khusus user), dan Client ID/Secret Google (tidak ada di `.env`). Kredensial GitHub **ada** di `.env` dan siap dipakai |
| D19 | PRD berada di `PRD-Docs/PRD_Tahap-1.md`, bukan `docs/PRD-TAHAPAN-1.md` | Mengikuti lokasi file yang diberikan user; `AGENTS.md` §1 menyebut `docs/`. Tidak diduplikasi agar tidak ada dua sumber kebenaran |
| D20 | `eslint.config.mjs`: menambah `ignores` untuk `build/**`, `test-results/**`, `playwright-report/**`, `blob-report/**`, dan mengecualikan `tests/**` dari aturan `no-restricted-imports` | Tanpa ignore, ESLint memindai bundel hasil build (lambat luar biasa, lihat E9). Aturan `../` tidak bisa dipatuhi test karena alias `~/` hanya berlaku untuk `app/` dan Playwright tidak menjalankan resolver path tsconfig |
| D21 | Baru: `vitest.config.ts` | `pnpm test` memungut `tests/e2e/*.spec.ts` (akhiran `.spec.ts` sama) dan gagal; config terpisah memisahkan runner unit vs E2E |
| D22 | Guard server memakai `auth.getUser()` (verified), bukan `getSession()` | Menghapus peringatan resmi Supabase "…could be insecure! …Use supabase.auth.getUser() instead" yang muncul di log dev (lihat §3 & E1) |
| D23 | `playwright.config.ts`: `expect.timeout` 30 s + `waitForURL('/', 60 s)` setelah login; `eslint.config.mjs` juga menambah baris pemisah komentar (aturan `@blitz/lines-around-comment`) | Load pertama halaman workspace di dev server bisa sangat lambat (transform Vite), sehingga timeout default 15 s membuat test flaky |

---

## §5 Fase Kerja & Hasil

| Fase | Tugas | Output | DoD |
|---|---|---|---|
| F0 | Investigasi base + Supabase | catatan §2 | ✅ |
| F1 | Dependency: supabase, radix, lucide, playwright, axe | `package.json` | ✅ |
| F2 | Skema DB | `supabase/migrations/0001_users.sql` | ✅ (file siap; **eksekusi** diblokir, D18) |
| F3 | Lapisan Supabase | `app/lib/supabase/{client,server,middleware,env,server-env,browser-env,errors}.ts` | ✅ |
| F4 | Wrapper UI Radix | `app/components/ui/{Button,Input,PasswordInput,Label,Avatar,Badge,Separator,Skeleton,Toast}.tsx` | ✅ |
| F5 | Komponen auth | `app/components/auth/{AuthCard,OAuthButtons,LoginForm,SignupForm,UserMenu,ForgotPasswordDialog}.tsx` | ✅ |
| F6 | Route | `login`, `signup`, `account`, `logout`, `auth.callback`, `auth.error` | ✅ |
| F7 | Proteksi route | loader root + whitelist | ✅ |
| F8 | Playwright E2E + axe | `tests/e2e/{auth,a11y}.spec.ts`, `tests/fixtures/test-user.ts`, `playwright.config.ts` | ✅ |
| F9 | Audit (grep, bundle, visual, a11y) | §7 | ✅ |
| F10 | Dokumentasi + commit + tag | file ini, README, `v0.1-auth` | ✅ |

---

## §6 Error & Solusi

| # | Gejala | Akar masalah | Solusi |
|---|---|---|---|
| E1 | `Error: Slot failed to slot onto its children` saat SSR `/account` | `Button asChild` merender 2 child (ikon Lucide + `<Link>`) sedangkan Radix `Slot` hanya menerima satu child | Bungkus child utama dengan `Slottable`; pemakaian di `/account` juga dipindah (ikon ke dalam `<Link>`) |
| E2 | Klik "Masuk" → URL jadi `/login?email=…&password=…` (password bocor di query) | Form ter-submit **native** karena klik terjadi sebelum React hidrasi | Tambah penanda `data-hydrated` di root + helper `gotoHydrated()` di test |
| E3 | `504 (Outdated Optimize Dep)` untuk `lucide-react`/`nanostores` saat pertama buka | Vite menemukan dependency baru lalu re-optimize di tengah sesi | Restart dev server setelah dependency baru; cache `node_modules/.vite` terisi |
| E4 | axe: kontras gagal pada label "atau", link footer, tombol primer, badge, avatar | Kombinasi token bawaan (accent.500/accent.700 di atas tint 10%) hanya 2–4,3:1 | Ganti ke token/kombinasi kontras: `textSecondary`, `item-contentAccent`+underline, tombol solid `accent-700`/`red-600`, badge `textPrimary`, avatar `textPrimary` |
| E5 | `getByLabel('Password')` menangkap 2 elemen | `aria-label` tombol toggle berisi kata "password" | Toggle memakai "Tampilkan sandi"/"Sembunyikan sandi" |
| E6 | `/account` tidak pernah hidrasi (`html[data-hydrated]` timeout) | Sama dengan E1 (error SSR di halaman itu) | Sama dengan E1 |
| E7 | Test signup/login lewat Google penuh tidak bisa diverifikasi | Provider Google/GitHub belum aktif di dashboard Supabase (butuh Client ID/Secret) | Test di-skip eksplisit + dicatat di §8/§9 |
| E8 | Test yang memeriksa tabel `public.users` gagal | Migrasi belum dijalankan (butuh akses dashboard/CLI) | Auto-skip dengan pesan jelas; aktif otomatis setelah migrasi dijalankan |
| E9 | `pnpm run lint` jalan >6 menit dan melaporkan 2715 error | ESLint ikut memindai `build/**` (bundel hasil build, puluhan MB) karena daftar `ignores` bawaan hanya menyebut `**/bolt/build` yang tidak ada di repo ini | Tambah ignore untuk artefak build/test (D20) → lint kembali < 1 menit |
| E10 | `pnpm test` (vitest) gagal: `tests/e2e/auth.spec.ts` dijalankan sebagai test vitest | Pola default vitest memungut `*.spec.ts`, sama dengan konvensi test E2E Playwright (`CONVENTIONS.md` §1) | Buat `vitest.config.ts` yang hanya menyertakan `app/**/*.spec.*` (D21) |
| E11 | Ratusan error `prettier/prettier Delete ⏎` pada file baru | File baru ditulis dengan line ending CRLF di Windows, sedangkan Prettier memakai `endOfLine: "lf"` (`.gitattributes` hanya berlaku saat file checkout/commit, bukan saat file ditulis langsung) | Normalisasi CRLF→LF untuk file sumber setiap kali selesai mengedit (lihat perintah di riwayat kerja), lalu lint ulang |
| E12 | Test a11y `/account` gagal: `toHaveURL('/')` timeout 15 s padahal login sebenarnya berhasil | Load pertama halaman workspace di dev server dingin (transform Vite untuk chunk besar) melebihi timeout default Playwright 15 s | `expect.timeout` 30 s + `waitForURL('/', { timeout: 60_000 })` (D23) |
| E13 | Playwright `webServer` timeout 240 s: "Port 5173 is in use, trying another one… Local: http://localhost:5174" | Proses dev server lama masih memegang port 5173 walau sudah di-taskkill (proses induk belum mati) | Kill proses pemilik port (bukan hanya child-nya), pastikan port bebas, lalu jalankan ulang |

---

## §7 Bukti Verifikasi

Semua gate dijalankan pada 2026-09-26 di root workspace ini.

### 7.1 Quality gate

| Gate | Perintah | Hasil |
|---|---|---|
| Lint | `pnpm run lint` | **0 error, 0 warning** |
| Typecheck | `pnpm run typecheck` | **0 error** |
| Unit test | `pnpm test` | **24/24 pass** (1 file, 734 ms) |
| E2E | `pnpm exec playwright test` | **12 passed, 4 skipped, 0 failed** (16 test, 48,2 s) |
| Build | `pnpm run build` | **sukses** — client 43,76 s; SSR 1,22 s (`build/server/index.js` 100,24 kB) |

4 test yang di-skip: 3 test butuh tabel `public.users` (D18) dan 1 test login
penuh OAuth yang memang manual (D18).

### 7.2 Audit keamanan & bundle

- **Secret audit** — seluruh isi `build/` dipindai untuk 12 nilai secret
  (service role, JWT secret, DeepSeek, Vercel, Pakasir ×2, SD, GitHub PAT,
  Langfuse, Cloudflare, Hookdeck ×2): **0 kebocoran**. Satu-satunya nilai yang
  ada di bundel client adalah `SUPABASE_ANON_KEY` — memang kunci publik untuk
  browser.
- **Server-only code** — string `SUPABASE_SERVICE_ROLE_KEY`, `createServerClient`,
  `requireSession`, dan `node:process` **tidak ada** di `build/client/**`
  (tree-shaking Remix membuang `loader` beserta importnya).
- **Grep audit** — di seluruh file fitur baru (`app/components/auth/**`,
  komponen UI baru, `app/routes/{login,signup,account,logout,auth.*}.tsx`):
  - elemen interaktif native (`<button>`, `<input>`, `<select>`, `<dialog>`): **0**
    (hanya ada di wrapper `app/components/ui/Button.tsx` & `Input.tsx`)
  - emoji sebagai ikon (🚀✨🔥💡⚡🎉): **0**
  - `any` / `as any`: **0**
  - `console.log` yang membocorkan token/session: **0**
  - `waitForTimeout` / `getByTestId` di test: **0**

### 7.3 Audit aksesibilitas (axe-core, otomatis)

`tests/e2e/a11y.spec.ts` menjalankan axe-core di browser:

| Halaman | Light | Dark |
|---|---|---|
| `/login` | 0 violation | 0 violation |
| `/signup` | 0 violation | 0 violation |
| `/account` (setelah login) | 0 violation | 0 violation |

Awalnya ditemukan 3 kelompok pelanggaran kontras (`atau`, link footer, tombol
primer, badge plan, avatar) yang berasal dari kombinasi token bawaan bolt.new
(`accent.500`/`accent.700` di atas tint 10% → 2,3–4,3:1). Semua diperbaiki di
§4 D11/E4, bukan di-suppress.

### 7.4 Audit visual & responsive

Screenshot `fullPage` diambil untuk `/login`, `/signup` (375/768/1440 px × light/dark)
dan `/account` (375/1440 px × light/dark) — file di `test-results/visual/`
(gitignored). Hasil: kartu auth rapi tanpa overflow di 375 px, hierarki jelas,
tidak ada gradient/emoji/hero, teks terbaca di dark mode (kontras diperkuat oleh
`getUser`-safe token), fokus keyboard terlihat (`focus-visible:ring-accent-500`).

### 7.5 Verifikasi Supabase

| Cek | Hasil |
|---|---|
| Project reachable | ✅ `https://inlejkrqixxpcxniraos.supabase.co` |
| Anon key | ✅ valid (auth settings OK, route data menjawab PGRST205 = tabel belum ada, bukan 401) |
| Service role key | ✅ valid (REST root 200) |
| Provider aktif | ⚠️ hanya **email** — Google & GitHub belum diaktifkan (D18) |
| Tabel `public.users` | ⚠️ **belum ada** — migrasi belum dijalankan (D18) |
| `mailer_autoconfirm` | `false` → signup perlu konfirmasi email |

---

## §8 Checklist Akhir (Kriteria PRD §8)

### 8.1 Fungsional

- [x] **K1.2** login email/password → diuji E2E
- [x] **K1.5** session persist setelah reload → diuji E2E
- [x] **K1.6** logout menghapus session + redirect `/login` → diuji E2E
- [x] **K1.7** akses route terproteksi tanpa login → `/login?redirect=…` → diuji E2E
- [x] **K1.8** login menghormati `?redirect=` → diuji E2E
- [x] **K1.10** error login tampil sebagai toast (role=status), bukan `alert()` → diuji E2E
- [ ] **K1.1** baris `public.users` terbentuk saat signup → **kode + test siap, eksekusi diblokir** (migrasi belum dijalankan; D18)
- [ ] **K1.3** login Google → **kode siap, provider belum aktif** (D18)
- [ ] **K1.4** login GitHub → **kode siap, provider belum aktif** (kredensial GitHub sudah ada di `.env`)
- [ ] **K1.9** `/account` menampilkan data user → halaman + test siap; menampilkan data session + catatan migrasi (diblokir D18)

### 8.2 Visual

- [x] **K2.1** tidak ada komponen native di file baru (audit grep §7)
- [x] **K2.2** ikon Lucide React, ukuran konsisten 16/20 px
- [x] **K2.3** dark mode berfungsi (diuji axe + screenshot light/dark)
- [x] **K2.4** tanpa gradient ungu-biru, tanpa emoji sebagai ikon
- [x] **K2.5** WCAG AA: **0 pelanggaran axe** di `/login`, `/signup` (light+dark) dan `/account` (light+dark)
- [x] **K2.6** responsive 375/768/1440 px (screenshot audit; tidak ada overflow)

### 8.3 Teknis

- [x] **K3.1** `SUPABASE_SERVICE_ROLE_KEY` tidak ada di bundle client (audit §7)
- [x] **K3.3** tidak ada `console.log` yang membocorkan token/session (log hanya via logger + gate `import.meta.env.DEV`)
- [x] **K3.4** `pnpm run build` sukses
- [x] **K3.5** `pnpm run lint` sukses
- [ ] **K3.2** RLS aktif & teruji → **SQL + test siap**, eksekusi diblokir (D18)

### 8.4 Testing

- [x] **K4.2** login salah → toast error
- [x] **K4.3** akses `/` tanpa login → redirect `/login`
- [x] **K4.4** login → `/` → header menampilkan menu akun (avatar)
- [x] **K4.5** reload setelah login → masih login
- [x] **K4.6** log out → `/login`, session hilang
- [ ] **K4.1** signup → cek baris DB → login → logout → diblokir (D18), test auto-skip
- [ ] **K4.7** OAuth Google/GitHub manual → diblokir (D18). Yang terverifikasi: klik tombol OAuth benar-benar memicu alur Supabase (redirect/toast error provider), bukan no-op

---

## §9 Rekomendasi untuk Tahap Berikutnya

### 9.1 Aksi yang perlu dilakukan user sebelum Tahapan 1 bisa "100% hijau"

1. **Jalankan migrasi** `supabase/migrations/0001_users.sql` di SQL Editor Supabase
   (atau `supabase link` + `supabase db push`). Setelah itu 3 test yang di-skip
   otomatis aktif (`pnpm exec playwright test`).
2. **Aktifkan provider** di Authentication → Providers:
   - GitHub: pakai `GITHUB_OAUTH_CLIENT_ID`/`GITHUB_OAUTH_CLIENT_SECRET` dari `.env`.
   - Google: butuh Client ID/Secret baru (tidak ada di `.env`).
3. **URL Configuration**: Site URL `http://localhost:5173`,
   Redirect URLs `http://localhost:5173/auth/callback` (+ domain produksi).
   Tanpa ini, `redirectTo` OAuth/email akan jatuh ke Site URL.
4. Opsional untuk development: matikan "Confirm email" agar signup langsung
   menghasilkan session.

### 9.2 Temuan yang sebaiknya ditindaklanjuti

- **Keamanan RLS**: policy `users_update_own` (sesuai PRD) mengizinkan user
  mengubah `plan` dan `credits` miliknya sendiri. Versi yang lebih ketat sudah
  disiapkan sebagai komentar di akhir file migrasi — relevan sebelum Tahapan 13.
- **Guard `/api/*`**: endpoint `/api/chat` & `/api/enhancer` belum ikut dijaga.
  Perlu keputusan di tahap AI (butuh session untuk hitung kredit).
- **Konflik dua sistem toast**: Radix Toast (auth) + react-toastify (chat).
  Sebaiknya diseragamkan ke Radix di tahap refactor UI.
- **Password reset** & `resetPasswordForEmail` belum ada (di luar §2.1).
- **Verifikasi email lintas browser**: alur `exchangeCodeForSession` bergantung
  cookie code-verifier di browser yang sama. Bila nanti butuh konfirmasi dari
  perangkat lain, gunakan custom email template + `verifyOtp({ token_hash })`.
- **Node lokal v25** vs pin `.tool-versions` 20.15.1 (lihat NOTES Tahapan 0).

---

## Hasil Gate Akhir

Semua gate **hijau** pada 2026-09-26: `lint` 0 error, `typecheck` 0 error,
`pnpm test` 24/24 pass, `pnpm exec playwright test` 12 pass / 4 skip / 0 fail,
`pnpm run build` sukses, audit secret 0 bocor, axe 0 violation. Detail di §7.

Yang **belum** hijau hanyalah 3 kriteria yang bergantung pada konfigurasi di luar
kode (migrasi tabel + aktivasi provider OAuth) — langkah persisnya ada di §9.1,
dan test yang relevan akan otomatis aktif setelah migrasi dijalankan.
