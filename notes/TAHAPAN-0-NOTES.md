# TAHAPAN-0-NOTES.md — Setup Environment & Fork bolt.new

> Catatan kerja Tahapan 0. Dibuat mengikuti `WORKFLOW.md` §9.
> Naikkan status di §1 setiap selesai fase.

---

## §1 Status

| Item | Nilai |
|---|---|
| Tahap | 0 — Setup Environment & Base Fork |
| Status | ✅ Done |
| Tanggal | 2026-09-25 |
| Base repo | fork `tanbopp/bolt.new` (parent `stackblitz/bolt.new`) |
| Commit baseline | `eda10b1` — `chore: bug template to suggest projects public or accessible by URL (#4222)` |
| Dev server | `pnpm run dev` → http://localhost:5173 |

---

## §2 Investigasi

Kondisi awal workspace: **hanya 5 dokumen + `.env`**, belum ada `.git`, belum ada kode.

| Aspek | Temuan |
|---|---|
| Toolchain lokal | Node `v25.8.1`, pnpm `9.4.0` (via corepack, mengikuti field `packageManager`), git `2.48.1.windows.1` |
| Pin upstream (`.tool-versions`) | `nodejs 20.15.1`, `pnpm 9.4.0` — Node lokal lebih baru dari pin |
| Stack upstream | Remix `2.10` + Vite `5.3` + UnoCSS + Cloudflare Pages/Workers (`wrangler ^3.63`) |
| WebContainer | `@webcontainer/api@1.3.0-internal.10` |
| Editor upstream | **CodeMirror 6** (`app/components/editor/codemirror/`) — **bukan** Monaco |
| Terminal upstream | xterm + `/bin/jsh` (`app/utils/shell.ts`) |
| Jumlah file upstream | 139 file tracked |
| Env yang dipakai server upstream | `ANTHROPIC_API_KEY` (`app/lib/.server/llm/api-key.ts`) |

Prasyarat `AGENTS.md` §1 yang **tidak ada** di workspace: `docs/PRD-TAHAPAN-0.md`,
`notes/TAHAPAN-0-NOTES.md`, `perencanaan stack.txt`, `tahapan.txt`,
`TEMPLATE-TAHAPAN-NOTES.md`. Lihat §4 (Deviasi).

---

## §3 Keputusan Teknis

1. **Fork, bukan clone polos.** Fork `tanbopp/bolt.new` dibuat via GitHub API
   (`POST /repos/stackblitz/bolt.new/forks`). Remote:
   - `origin` → `https://github.com/tanbopp/bolt.new.git`
   - `upstream` → `https://github.com/stackblitz/bolt.new.git`
2. **Kode bolt.new ditaruh di root workspace**, berdampingan dengan dokumen kontrak
   (`AGENTS.md`, `CONVENTIONS.md`, dst). Branch kerja: `main` (tracking `origin/main`).
3. **`.env` → `.env.local`.** `CONTRIBUTING.md` upstream mengharuskan `.env.local`;
   `CONVENTIONS.md` §9 juga menyebut `.env.local`. `.env` tetap jadi sumber asli dari user,
   `.env.local` adalah mirror yang dibaca Vite/Remix saat runtime. Keduanya sudah
   di-ignore oleh `.gitignore` upstream (`/.env*`, `*.local`).
4. **Line ending LF dipaksa.** `core.autocrlf=true` (default Git di Windows) membuat
   checkout CRLF, sementara Prettier memakai `endOfLine: "lf"` → 7.864 error lint.
   Solusi: `git config core.autocrlf false` + `.gitattributes` baru (`* text=auto eol=lf`).
5. **Tidak menyentuh AI/model & skema DB.** Integrasi DeepSeek dan pembuatan tabel
   Supabase adalah scope tahap berikutnya (lihat `v0.1-auth`, `v0.2-persistence` di
   `AGENTS.md` §6/§7). Tahap ini hanya memastikan base jalan + Supabase terhubung.

---

## §4 Deviasi

| # | Deviasi | Alasan |
|---|---|---|
| D1 | `AGENTS.md` §1 mewajibkan `docs/PRD-TAHAPAN-0.md`, `perencanaan stack.txt`, `tahapan.txt`, `TEMPLATE-TAHAPAN-NOTES.md`; keempatnya tidak ada. `AGENTS.md` §5 menyuruh STOP. | User memerintahkan "kerjakan penuh tanpa konfirmasi". Instruksi user diperlakukan sebagai spesifikasi Tahapan 0, dan `Stack.md` sebagai pengganti `perencanaan stack.txt`. **File-file itu masih perlu disiapkan user sebelum Tahap 1.** |
| D2 | Baru: `.gitattributes` (tidak ada di upstream) | Agar `pnpm run lint` hijau di Windows dan tidak regresi. |
| D3 | Ubah 1 baris: hapus `import { IconButton }` di `app/components/sidebar/Menu.client.tsx` | Error ESLint **bawaan upstream** (`@typescript-eslint/no-unused-vars`). Diperlukan agar syarat "lint sukses" (`AGENTS.md` §6.3) terpenuhi. Tidak mengubah perilaku. |
| D4 | `Stack.md` menulis editor = "Monaco Editor", kenyataannya upstream memakai **CodeMirror 6** | Catatan untuk user. Mengganti ke Monaco = perubahan besar, **tidak** dilakukan di tahap ini. Butuh keputusan user. |
| D5 | Nama env client belum diselaraskan dengan `CONVENTIONS.md` §9 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), sedangkan `.env` yang diberikan memakai `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `AGENTS.md` §3.3 melarang membuat nama env baru. Diserahkan ke tahap auth agar tidak menebak. |
| D6 | Node lokal `v25.8.1` ≠ pin `.tool-versions` (`20.15.1`) | Semua script hijau di Node 25, jadi tidak memaksa ganti versi. Perlu keputusan user bila mau disamakan. |

---

## §5 Fase Kerja & Hasil

| Fase | Tugas | Output | DoD |
|---|---|---|---|
| F0 | Audit workspace + toolchain | daftar prasyarat, versi Node/pnpm/git | ✅ |
| F1 | Fork + clone bolt.new | repo lokal, remote `origin`/`upstream`, HEAD `eda10b1` | ✅ |
| F2 | `.env.local` | 42 baris env dari `.env` | ✅ |
| F3 | `pnpm install` | `node_modules` (esbuild + workerd binary ada) | ✅ |
| F4 | `pnpm run dev` | http://localhost:5173 (UI Bolt tampil) | ✅ |
| F5 | Verifikasi WebContainer + editor + preview | bukti di §6/§8 | ✅ |
| F6 | Verifikasi Supabase | project reachable, kunci valid | ✅ |
| F7 | Baseline quality gate | lint / typecheck / test / build hijau | ✅ |
| F8 | Dokumentasi + commit + tag | file ini, `v0.0-setup` | ✅ |

---

## §6 Error & Solusi

| # | Gejala | Akar masalah | Solusi |
|---|---|---|---|
| E1 | `git clone` ke root ditolak ("destination path '.' already exists and is not an empty directory") | Root workspace sudah berisi dokumen | Clone ke folder temp, pindahkan isinya ke root |
| E2 | `Move-Item .git` → `Access to the path ... .git is denied`, lalu `.git` tinggal `objects/` + `FETCH_HEAD` | File lock Git di Windows (proses `git`/`git-remote-https` masih hidup) | Buang `.git` rusak, bangun ulang: `git init` → `git remote add` → `git fetch --depth 1 origin main` → `update-ref` + `symbolic-ref` → `git reset --hard` |
| E3 | `pnpm run dev` tidak mengeluarkan output & port 5173 belum listen | Bukan hang: cold start (esbuild optimize + `workerd` dari Cloudflare dev proxy) butuh ±2 menit | Tunggu; verifikasi lewat port listen + `workerd` process |
| E4 | Lint gagal: 7.864 error `prettier/prettier Delete ⏎` | `core.autocrlf=true` → file checkout CRLF, Prettier `endOfLine: lf` | `core.autocrlf=false`, tambah `.gitattributes`, hapus + checkout ulang seluruh file tracked (139 file) |
| E5 | Lint gagal: 1 error `'IconButton' is defined but never used` | Cacat bawaan upstream di `app/components/sidebar/Menu.client.tsx` | Hapus import yang tidak dipakai (D3) |
| E6 | `GET /rest/v1/` dengan anon key → `401 {"message":"Invalid API key","hint":"Only the service_role API key can be used for this endpoint."}` | Perilaku Supabase terbaru: endpoint root OpenAPI hanya untuk `service_role` | Bukan key invalid. Dibuktikan lewat `/auth/v1/settings` (OK) dan `/auth/v1/token?grant_type=password` → `400 invalid_credentials` (artinya API key diterima) |
| E7 | Smoke test preview tidak melihat event | Di `@webcontainer/api@1.3.0-internal.10` nama event-nya **`port`** (`app/lib/stores/previews.ts`), bukan `server-ready` | Pakai `wc.on('port', (port, type, url) => ...)` |
| E8 | Ketikan ke terminal drawer di UI tidak masuk | Drawer terminal terlipat (±47 px) dan tertutup overlay chat pada ukuran jendela harness | Bukan bug aplikasi. Jalur shell diverifikasi langsung: `wc.spawn('/bin/jsh')` + `echo` berhasil (prompt `~/project ❯`) |
| E9 | Chat AI → toast "There was an error processing your request" + HTTP 500 di `/api/chat` | `.env` yang diberikan berisi `DEEPSEEK_*`, sedangkan base upstream membaca `ANTHROPIC_API_KEY` | Sesuai ekspektasi. Integrasi DeepSeek = tahap AI (di luar scope Tahapan 0) |

---

## §7 Bukti Verifikasi (Evidence)

Semua dijalankan pada http://localhost:5173 (Chrome/Chromium lokal):

1. **UI dasar** — halaman `/` render "Where ideas begin" + prompt box. ✅
2. **WebContainer boot** — `webcontainer` resolve, `workdir=/home/project`,
   runtime diambil dari `w-corp-staticblitz.com` / iframe
   `https://stackblitz.com/headless?version=1.3.0-internal.10`. ✅
3. **Filesystem** — `webcontainer.mount({ 'index.html': ... })` sukses. ✅
4. **Node di dalam container** — `wc.spawn('node', ['-v'])` → `v22.22.3`. ✅
5. **Shell** — `wc.spawn('/bin/jsh')` + `echo SHELL_OK` → prompt `~/project ❯`. ✅
6. **Preview** — server `node -e "http.createServer(...).listen(5555)"` →
   event `port` membuka `https://<id>--5555--<hash>.local-corp.webcontainer-api.io`;
   panel Preview milik bolt.new sendiri me-render isi server tersebut (`WEB OK`). ✅
7. **Editor** — mode workbench (`/chat/1`) menampilkan tab `Code | Preview`,
   elemen `.cm-editor` (CodeMirror) me-render isi file, FileTree tampil. ✅
8. **Terminal panel** — elemen `.xterm` ter-render + prompt `❯` dari `jsh`. ✅
9. **Quality gate** — `pnpm test` 24/24 pass; `pnpm run lint` 0 error;
   `pnpm run typecheck` 0 error; `pnpm run build` sukses (28,37 s + SSR bundle). ✅
10. **Audit bundle** — 282 file di `build/` dipindai untuk 11 nilai secret
    (service role, JWT secret, DeepSeek, Vercel, Pakasir, SD, GitHub PAT, Langfuse,
    Cloudflare, Hookdeck): **0 kebocoran**. ✅
11. **Supabase** — project `inlejkrqixxpcxniraos` reachable; anon key valid
    (auth settings OK, REST data route menjawab `PGRST205` = tabel belum ada, bukan 401);
    service role valid (REST root 200); storage 200; provider aktif: **email**.
    Tabel `users/profiles/projects/chats/messages` **belum ada** (scope tahap berikutnya). ✅

---

## §8 Checklist Akhir

- [x] `pnpm install` sukses
- [x] `pnpm run dev` jalan (localhost:5173)
- [x] WebContainer boot di lokal
- [x] Editor jalan (CodeMirror 6 — lihat D4)
- [x] Preview jalan (iframe `*.local-corp.webcontainer-api.io`)
- [x] Terminal jalan (xterm + `jsh`)
- [x] `pnpm run lint` 0 error
- [x] `pnpm run typecheck` 0 error
- [x] `pnpm test` 100% pass (24/24)
- [x] `pnpm run build` sukses
- [x] `.env` / `.env.local` terpasang dan tidak ter-commit (`.gitignore` upstream menangkap `/.env*`)
- [x] Audit bundle: tidak ada secret bocor
- [x] Supabase project siap dipakai (kredensial valid)
- [x] Git tag `v0.0-setup`
- [ ] ⚠️ Chat AI end-to-end (butuh wiring model — tahap AI)
- [ ] ⚠️ Tabel & RLS Supabase (butuh PRD tahap persistence)

---

## §9 Rekomendasi untuk Tahap Berikutnya

1. **Lengkapi dokumen kontrak yang masih kosong**: `perencanaan stack.txt`, `tahapan.txt`,
   `docs/PRD-TAHAPAN-[N].md`, `TEMPLATE-TAHAPAN-NOTES.md`. Tanpa ini, setiap tahap
   berikutnya akan kembali memicu pelanggaran `AGENTS.md` §1.
2. **Selaraskan nama env client** (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) sesuai
   `CONVENTIONS.md` §9, atau ubah konvensinya — pilih salah satu sebelum menulis kode auth.
3. **Supabase**: aktifkan provider Google & GitHub (sekarang hanya email), lalu buat
   migrasi `supabase/migrations/0001_users.sql` (users/profiles/projects/chats) dengan RLS.
4. **AI**: base upstream membaca `ANTHROPIC_API_KEY`. Untuk DeepSeek, ubah
   `app/lib/.server/llm/api-key.ts` + `model.ts` dan pakai `deepseek-chat`
   (non-reasoning) sebagai default.
5. **Keputusan editor**: pertahankan CodeMirror (warisan upstream, sudah jalan) atau
   migrasi ke Monaco sesuai `Stack.md` — ini pekerjaan besar, jangan diselipkan ke tahap fitur.
6. **Node**: samakan versi dengan pin upstream (`.tool-versions` 20.15.1) bila ingin
   menghindari risiko ketidakcocokan `wrangler`/`workerd` di masa depan.
