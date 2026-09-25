# CONVENTIONS.md — Konvensi Kode & Struktur

> File ini adalah **standar penulisan kode** untuk Tahapan 1.
> AI Agent WAJIB ikuti. Pelanggaran = revisi wajib.

## 1. Penamaan File

| Tipe | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `LoginForm.tsx` |
| Hook | camelCase + `use` | `useAuth.ts` |
| Utility | camelCase | `supabaseClient.ts` |
| Route | kebab-case | `auth-callback.tsx` |
| Test | `*.spec.ts` | `auth.spec.ts` |
| SQL Migration | `NNNN_nama.sql` | `0001_users.sql` |
| Konstanta | SCREAMING_SNAKE | `AUTH_PROVIDERS` |

## 2. Struktur Folder

```text
src/
  lib/
    supabase/
      client.ts       # createBrowserClient (client-safe)
      server.ts       # createServerClient (server-only)
      middleware.ts   # updateSession helper
  components/
    auth/             # komponen khusus auth
      LoginForm.tsx
      SignupForm.tsx
      OAuthButtons.tsx
      UserMenu.tsx
    ui/               # wrapper Radix (button, input, dll)
      button.tsx
      input.tsx
      toast.tsx
  routes/             # atau pages/, sesuai router bolt.new
    login.tsx
    signup.tsx
    account.tsx
    auth/
      callback.tsx
      error.tsx
  middleware.ts       # proteksi route
supabase/
  migrations/
    0001_users.sql
tests/
  e2e/
    auth.spec.ts
```

## 3. Import Order

Urutan import WAJIB konsisten:

```ts
// 1. React & framework
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Library eksternal
import { createClient } from '@supabase/supabase-js';

// 3. Komponen UI (Radix wrapper)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 4. Ikon (Lucide)
import { LogIn, Loader2 } from 'lucide-react';

// 5. Util & tipe lokal
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/auth';
```

## 4. Aturan TypeScript

- **WAJIB** type eksplisit untuk function return yang kompleks.
- **DILARANG** `any` — gunakan `unknown` + type guard jika perlu.
- **WAJIB** pakai `type` (bukan `interface`) untuk props komponen, kecuali butuh declaration merging.
- **WAJIB** definisikan tipe di `types/auth.ts` untuk entitas user/session.

Contoh:

```ts
// types/auth.ts
export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  plan: 'free' | 'pro' | 'team';
  credits: number;
  created_at: string;
  updated_at: string;
};
```

## 5. Aturan React

- **WAJIB** functional component + hooks.
- **DILARANG** class component.
- **WAJIB** `useCallback` untuk handler yang di-pass ke child yang di-memo.
- **WAJIB** cleanup di `useEffect` (unsubscribe, abort, dll).
- **DILARANG** `useEffect` untuk derived state — pakai `useMemo`.

Contoh cleanup benar:

```ts
useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });
  return () => sub.subscription.unsubscribe();
}, []);
```

## 6. Aturan Styling

- **WAJIB** Tailwind utility classes.
- **DILARANG** inline `style={}` kecuali nilai dinamis (mis. `width: ${progress}%`).
- **WAJIB** pakai design token bawaan bolt.new (`bg-background`, `text-foreground`, `border-border`, dll).
- **WAJIB** `cn()` helper (bawaan bolt.new) untuk conditional class.
- **DILARANG** arbitrary value Tailwind (`w-[437px]`) kecuali terpaksa + komentar alasan.

Contoh:

```tsx
import { cn } from '@/lib/utils';

<Button
  variant="primary"
  className={cn('w-full', isLoading && 'opacity-50')}
  disabled={isLoading}
>
  Masuk
</Button>
```

## 7. Aturan Error Handling

- **WAJIB** try/catch di setiap Supabase call.
- **WAJIB** tampilkan error via Radix Toast, bukan `alert()`.
- **WAJIB** log error ke console hanya di development.
- **DILARANG** swallow error tanpa log.

Contoh:

```ts
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
} catch (err) {
  toast({ title: 'Gagal masuk', description: (err as Error).message, variant: 'destructive' });
  if (import.meta.env.DEV) console.error(err);
}
```

## 8. Aturan Commit

Format: `<type>(<scope>): <subject>`

Type: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Contoh:

```text
feat(auth): tambah login form email/password
feat(auth): tambah oauth google & github
feat(auth): tambah middleware proteksi route
test(auth): tambah playwright e2e login flow
docs(auth): update README setup supabase
```

## 9. Aturan Env

- **HANYA** pakai env dari `perencanaan stack.txt`.
- **DILARANG** buat nama env baru.
- **WAJIB** prefix `VITE_` untuk env yang diakses client (sesuai Vite).
- **DILARANG** akses `SUPABASE_SERVICE_ROLE_KEY` di client.

Contoh akses benar:

```ts
// client-safe
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 10. Aturan SQL

- **WAJIB** RLS aktif untuk semua tabel user-facing.
- **WAJIB** index untuk kolom yang sering di-query.
- **WAJIB** `timestamptz` (bukan `timestamp`).
- **WAJIB** `on delete cascade` untuk foreign key ke `auth.users`.
- **DILARANG** `SELECT *` di production query.

## 11. Aturan Playwright

- **WAJIB** `getByRole` / `getByLabel` (aksesibilitas).
- **DILARANG** `getByTestId` kecuali terpaksa + komentar.
- **DILARANG** `waitForTimeout` — pakai `expect(...).toBeVisible()`.
- **WAJIB** test independen (buat user baru per test, atau cleanup).
- **WAJIB** jalankan `pnpm exec playwright test` sebelum commit terakhir.

Contoh:

```ts
test('login email salah menampilkan toast', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('salah@example.com');
  await page.getByLabel('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('status')).toContainText(/salah|gagal/i);
});
```

## 12. Aturan Dokumentasi

- **WAJIB** JSDoc untuk function publik yang kompleks.
- **WAJIB** komentar `// TODO:` untuk hal yang sengaja ditunda.
- **WAJIB** update `TAHAPAN-1-NOTES.md` jika ada deviasi dari PRD.