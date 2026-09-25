# AGENTS.md — Kontrak Kerja AI Agent (Global)

> File ini adalah **kontrak kerja** antara user dan AI Agent untuk **seluruh tahapan** (0–18).
> Pelanggaran = tahapan dianggap GAGAL.
> Berlaku sejak Tahapan 0 sampai Tahapan 18 selesai.

## 1. Baca Dulu, Kerja Kemudian

Sebelum menulis 1 baris kode di tahap apa pun, AI Agent WAJIB membaca berurutan:

1. `AGENTS.md` (file ini)
2. `CONVENTIONS.md`
3. `DESIGN-GUARDRAILS.md`
4. `WORKFLOW.md`
5. `docs/PRD-TAHAPAN-[N].md` (PRD tahap yang sedang dikerjakan)
6. `notes/TAHAPAN-[N]-NOTES.md` (catatan tahap berjalan, jika sudah ada)
7. `perencanaan stack.txt` (referensi env & stack)
8. `tahapan.txt` (roadmap induk)

Jika salah satu file di atas tidak ada, **STOP** dan minta user melengkapinya.

## 2. Scope Lock

- AI Agent **HANYA** mengerjakan scope tahap yang sedang berjalan (lihat PRD tahap tersebut).
- **DILARANG** menyentuh fitur di tahap lain, meskipun terlihat "gampang" atau "sekalian".
- Jika menemukan bug di luar scope, **catat di `notes/TAHAPAN-[N]-NOTES.md`**, jangan diperbaiki.
- Jika diminta user untuk "sekalian", **tolak** dengan sopan dan ingatkan aturan scope lock.

## 3. Larangan Keras (Zero Tolerance — Semua Tahap)

### 3.1 Komponen

- ❌ `<button>` native → WAJIB Radix `Button`
- ❌ `<input>` native → WAJIB Radix `Input`
- ❌ `<select>` native → WAJIB Radix `Select`
- ❌ `<dialog>` native / modal manual → WAJIB Radix `Dialog`
- ❌ Toast manual / `alert()` → WAJIB Radix `Toast`
- ❌ Dropdown manual → WAJIB Radix `DropdownMenu`
- ❌ Tooltip manual / `title` attr → WAJIB Radix `Tooltip`
- ❌ Tabs manual → WAJIB Radix `Tabs`
- ❌ Emoji sebagai ikon (🚀✨🔥💡) → WAJIB Lucide React

### 3.2 Visual

- ❌ Gradient ungu-biru default ala "AI startup template"
- ❌ Shadow berlebihan + rounded-3xl tanpa hierarki
- ❌ Hero raksasa di halaman fungsional (login, settings, dll)
- ❌ Animasi bounce/pulse terus-menerus
- ❌ Copy puitis ("Unlock your potential...", "Welcome to the future")
- ❌ Lorem ipsum
- ❌ Warna neon / kontras rendah (WCAG AA wajib)
- ❌ Font dekoratif (script/handwriting)

Detail lengkap: lihat `DESIGN-GUARDRAILS.md`.

### 3.3 Teknis

- ❌ Hardcode env (wajib dari `.env.local`)
- ❌ Buat nama env baru jika sudah ada di `perencanaan stack.txt`
- ❌ Expose `SUPABASE_SERVICE_ROLE_KEY` ke client bundle
- ❌ `console.log` yang bocorkan token/session/API key
- ❌ `any` di TypeScript (kecuali documented reason)
- ❌ `waitForTimeout` di Playwright
- ❌ `SELECT *` di production query

## 4. Wajib (Must Do — Semua Tahap)

- ✅ Pakai env dari `perencanaan stack.txt`
- ✅ Pakai Radix UI + Lucide React + Tailwind (bawaan bolt.new)
- ✅ Test dengan Playwright (E2E) untuk fitur yang bisa dites
- ✅ Jalankan verifikasi mandiri (§6 PRD tahap terkait) sebelum menyatakan selesai
- ✅ Commit per sub-fitur dengan pesan konvensional
- ✅ Dokumentasikan deviasi di `notes/TAHAPAN-[N]-NOTES.md`
- ✅ Update `notes/TAHAPAN-[N]-NOTES.md` §1 (status) & §6 (error) selama bekerja

## 5. Aturan Komunikasi

- Jika ada ambiguitas di PRD → tanya user, jangan asumsi.
- Jika env kosong → STOP, minta user isi.
- Jika build gagal 3x berturut-turut dengan error sama → STOP, minta bantuan.
- Jika stuck >30 menit → pecah masalah, dokumentasikan, lanjut.
- Jangan pernah bilang "selesai" tanpa verifikasi §6 PRD tahap terkait hijau.

## 6. Definisi "Selesai" (Per Tahap)

Sebuah tahap selesai **HANYA JIKA**:

1. Semua kriteria penyelesaian di PRD tahap tersebut tercentang.
2. `pnpm run build` sukses.
3. `pnpm run lint` sukses.
4. `pnpm exec playwright test` 100% pass (untuk tahap yang punya test).
5. Audit grep bersih (lihat PRD tahap tersebut).
6. `notes/TAHAPAN-[N]-NOTES.md` §1 diupdate (status: ✅ Done).
7. Git tag sesuai tahap dibuat (mis. `v0.1-auth` untuk Tahap 1).

## 7. Aturan Git

- Commit per sub-fitur, bukan per tahap.
- Format: `<type>(<scope>): <subject>` (lihat `CONVENTIONS.md` §8).
- Tag per tahap: `v0.[N]-[nama-tahap]` (mis. `v0.2-persistence`).
- Jangan force push ke branch utama.
- Jangan commit `.env.local`.

## 8. Aturan Rollback

Jika di tengah tahap ada perubahan besar yang merusak:

1. **Jangan panik.** Commit dulu kondisi rusak dengan pesan `wip:`.
2. Buat branch `fix/tahap-[N]-[masalah]`.
3. Perbaiki di branch.
4. Merge ke branch utama setelah hijau.
5. Jangan `git reset --hard` tanpa konfirmasi user.