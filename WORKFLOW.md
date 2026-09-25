# WORKFLOW.md — Alur Kerja Vibecoding (Global)

> File ini mendefinisikan **aturan umum alur kerja** untuk setiap tahap (0–18).
> Workflow spesifik per tahap ada di PRD masing-masing (bagian "Fase Kerja").

## 1. Siklus Kerja Per Tahap

```text
┌─────────────────────────────────────────────┐
│  0. BACA PRD + FILE GLOBAL                  │
│     ↓                                       │
│  1. INVESTIGASI (pahami konteks kode)       │
│     ↓                                       │
│  2. IMPLEMENTASI (1 sub-fitur per commit)   │
│     ↓                                       │
│  3. TEST MANUAL (di browser)                │
│     ↓                                       │
│  4. TEST OTOMATIS (Playwright)              │
│     ↓                                       │
│  5. AUDIT (grep + visual + axe)             │
│     ↓                                       │
│  6. DOKUMENTASI (update NOTES)              │
│     ↓                                       │
│  7. COMMIT + TAG                            │
│     ↓                                       │
│  Jika ada yang gagal → kembali ke step 2    │
└─────────────────────────────────────────────┘
```

## 2. Aturan Umum Per Siklus

Setiap sub-fitur dalam satu tahap WAJIB:

1. **Baca** PRD tahap + file global (`AGENTS.md`, `CONVENTIONS.md`, `DESIGN-GUARDRAILS.md`).
2. **Implementasi** 1 hal spesifik (jangan campur 2 sub-fitur dalam 1 commit).
3. **Test manual** di browser (light + dark mode).
4. **Test otomatis** dengan Playwright (jika sub-fitur punya test).
5. **Audit** dengan grep + axe DevTools.
6. **Dokumentasi** di `notes/TAHAPAN-[N]-NOTES.md`.
7. **Commit** dengan pesan konvensional.
8. **Lanjut** hanya jika semua di atas hijau.

## 3. Struktur Fase Per Tahap

Setiap PRD tahap **WAJIB** mendefinisikan fase kerjanya sendiri. Contoh format:

```text
FASE 0 — Investigasi
FASE 1 — Implementasi A
FASE 2 — Implementasi B
...
FASE N — Test
FASE N+1 — Audit
FASE N+2 — Commit & Tag
```

Setiap fase punya:
- **Tugas** (apa yang dikerjakan)
- **Output** (file/behavior yang dihasilkan)
- **DoD** (Definition of Done — kriteria lulus fase)

## 4. Aturan Per Fase

- ❌ Loncat fase.
- ❌ Gabung 2 fase dalam 1 commit.
- ❌ Lanjut sebelum DoD fase sebelumnya tercapai.
- ✅ Commit di akhir setiap fase.
- ✅ Update `notes/TAHAPAN-[N]-NOTES.md` setelah setiap fase.
- ✅ Jika stuck >30 menit, pecah fase jadi sub-fase.

## 5. Prompt Template untuk AI Agent

Setiap kali mulai sub-task, gunakan template:

```text
Saya di Tahapan [N], Fase [X].
Konteks: [file terkait + kode existing singkat].
Tugas: [1 hal spesifik].
Output: [file/behavior].
Aturan: pakai Radix UI, Lucide, Tailwind, env dari perencanaan stack.txt.
Definition of Done: [kriteria].
```

## 6. Jika Stuck

1. Catat error di `notes/TAHAPAN-[N]-NOTES.md` §6.
2. Pecah jadi sub-masalah.
3. Coba 3 solusi berbeda.
4. Jika masih stuck >30 menit → STOP, minta bantuan user.
5. Jangan lanjut ke fase berikutnya sebelum masalah teratasi.

## 7. Aturan Testing Per Tahap

| Tipe Tahap | Test Manual | Test Playwright |
|---|---|---|
| UI / Auth | Wajib | Wajib |
| Database / API | Wajib | Wajib (jika ada UI) |
| Integrasi (OAuth, webhook) | Wajib | Opsional (manual 1x) |
| Analytics / Logging | Wajib | Opsional |
| Dokumentasi | Wajib | Tidak perlu |

## 8. Aturan Audit Per Tahap

Setiap tahap WAJIB audit:

1. **Grep audit** — cek larangan komponen native & hardcode.
2. **Visual audit** — cek anti AI Slop (`DESIGN-GUARDRAILS.md` §12).
3. **Bundle audit** — cek tidak ada secret di `dist/`.
4. **Aksesibilitas** — axe DevTools, 0 critical.
5. **Responsive** — 375px, 768px, 1440px.
6. **Dark mode** — semua halaman.

## 9. Aturan Dokumentasi Per Tahap

Setiap tahap WAJIB:

- Buat `notes/TAHAPAN-[N]-NOTES.md` (copy dari `TEMPLATE-TAHAPAN-NOTES.md`).
- Isi §1 (status), §2 (investigasi), §3 (keputusan), §4 (deviasi), §6 (error).
- Update setiap selesai fase.
- Isi §8 (checklist akhir) sebelum commit terakhir.

## 10. Aturan Commit Per Tahap

- Commit per sub-fitur dalam tahap.
- Commit terakhir: `feat([scope]): tahapan [N] - [nama]`.
- Tag: `v0.[N]-[nama]`.
- Jangan commit `.env.local`, `node_modules/`, `dist/`.

## 11. Aturan Transisi Antar Tahap

Setelah Tahap N selesai:

1. Pastikan semua kriteria PRD Tahap N hijau.
2. Git tag `v0.[N]-[nama]` dibuat.
3. `notes/TAHAPAN-[N]-NOTES.md` §9 (rekomendasi untuk tahap berikutnya) diisi.
4. **JANGAN** mulai Tahap N+1 tanpa instruksi eksplisit dari user.
5. User akan menyiapkan `docs/PRD-TAHAPAN-[N+1].md`.
6. Baru mulai Tahap N+1 dengan copy template `notes/TAHAPAN-[N+1]-NOTES.md`.