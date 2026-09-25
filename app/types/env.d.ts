/**
 * Deklarasi env yang boleh dibaca dari kode.
 *
 * Hanya variabel di bawah ini (plus prefix `VITE_`) yang di-inline oleh Vite,
 * lihat `envPrefix` di `vite.config.ts`. `SUPABASE_SERVICE_ROLE_KEY` dan
 * `SUPABASE_JWT_SECRET` sengaja tidak dideklarasikan di sini agar tidak bisa
 * diakses dari client bundle.
 */
interface ImportMetaEnv {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
