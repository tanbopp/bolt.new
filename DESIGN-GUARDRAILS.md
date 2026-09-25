# DESIGN-GUARDRAILS.md — Pagar Visual Anti AI Slop (Global)

> File ini adalah **tameng** agar UI tidak terlihat seperti template AI generik.
> Berlaku untuk **seluruh tahapan** (0–18), bukan hanya auth.
> Setiap komponen visual WAJIB dicek terhadap file ini sebelum commit.

## 1. Prinsip Desain

1. **Fungsional > Dekoratif.** Halaman fungsional (login, settings, dashboard, editor) bukan landing page.
2. **Hierarki jelas.** Mata user harus tahu harus lihat apa dulu.
3. **Konsisten.** Spacing, radius, warna, ikon — semua dari design token.
4. **Aksesibel.** Kontras WCAG AA, focus ring terlihat, aria-label lengkap.
5. **Tenang.** Tidak ada animasi yang mengganggu produktivitas.

## 2. Design Token (WAJIB Pakai)

Gunakan token bawaan `bolt.new`. **DILARANG** pakai warna hardcode
(`bg-[#7C3AED]`, `text-blue-500`) kecuali warna semantic.

| Token | Kegunaan |
|---|---|
| `bg-background` | Background halaman |
| `bg-card` | Background card |
| `text-foreground` | Teks utama |
| `text-muted-foreground` | Teks sekunder/helper |
| `border-border` | Border default |
| `bg-primary` / `text-primary-foreground` | Tombol primer |
| `bg-destructive` | Tombol/teks error |
| `ring-ring` | Focus ring |

## 3. Spacing Scale

WAJIB pakai skala Tailwind: `1, 2, 3, 4, 6, 8, 12, 16, 24`.
**DILARANG** arbitrary: `p-[13px]`, `gap-[7px]`.

## 4. Radius Scale

| Elemen | Radius |
|---|---|
| Card / container | `rounded-lg` |
| Button / input | `rounded-md` |
| Badge / pill | `rounded-full` |
| Avatar | `rounded-full` |

**DILARANG** `rounded-3xl` untuk card kecil, `rounded-none` untuk button.

## 5. Shadow Scale

| Elemen | Shadow |
|---|---|
| Card default | `shadow-sm` |
| Dropdown / popover | `shadow-md` |
| Modal | `shadow-lg` |

**DILARANG** `shadow-2xl` untuk card, `shadow-inner` + gradient border.

## 6. Ikon (Lucide React)

- Ukuran konsisten: `16` (inline), `20` (button), `24` (header/hero).
- Stroke width: default (`2`) atau `1.5` untuk ikon besar.
- **DILARANG** campur ukuran dalam satu grup (mis. 18 + 20 + 22).

Contoh benar:

```tsx
<Button variant="outline" className="w-full justify-start gap-2">
  <LogIn className="w-4 h-4" />
  Continue with Google
</Button>
```

## 7. Tipografi

| Elemen | Class |
|---|---|
| H1 halaman | `text-2xl font-semibold` |
| H2 section | `text-lg font-semibold` |
| Body | `text-sm` |
| Helper text | `text-xs text-muted-foreground` |
| Error text | `text-xs text-destructive` |

**DILARANG** font dekoratif, `font-thin`, `tracking-widest` di body.

## 8. Warna Status

| Status | Class |
|---|---|
| Error | `text-destructive` / `bg-destructive` |
| Success | `text-green-600` (dark: `text-green-400`) |
| Warning | `text-yellow-600` (dark: `text-yellow-400`) |
| Info | `text-blue-600` (dark: `text-blue-400`) |

**DILARANG** warna neon (`#00FF00`, `#FF00FF`).

## 9. Komponen Wajib Pakai Radix

| Kebutuhan | Radix Component |
|---|---|
| Tombol | `Button` |
| Input teks | `Input` |
| Label | `Label` |
| Dropdown menu | `DropdownMenu` |
| Modal / konfirmasi | `Dialog` |
| Notifikasi error/success | `Toast` |
| Tooltip | `Tooltip` |
| Avatar user | `Avatar` |
| Badge status | `Badge` |
| Divider | `Separator` |
| Loading skeleton | `Skeleton` |
| Tabs | `Tabs` |
| Accordion | `Accordion` |
| Popover | `Popover` |
| Progress bar | `Progress` |
| Switch / toggle | `Switch` |
| Checkbox | `Checkbox` |
| Radio group | `RadioGroup` |
| Slider | `Slider` |
| Scroll area | `ScrollArea` |

> Jika wrapper belum ada → buat dulu di `components/ui/`,
> jangan langsung pakai Radix mentah di komponen fitur.

## 10. State Visual

Setiap komponen interaktif WAJIB punya state:

- **Default**
- **Hover** (`hover:`)
- **Focus** (`focus-visible:ring-2 focus-visible:ring-ring`)
- **Disabled** (`disabled:opacity-50 disabled:cursor-not-allowed`)
- **Loading** (spinner Lucide + disabled)

## 11. Contoh Benar vs Salah

### ❌ SALAH (AI Slop)

```tsx
<div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl shadow-2xl p-8">
  <h1 className="text-5xl font-bold text-white">🚀 Welcome to the Future ✨</h1>
  <button className="bg-white text-purple-500 px-8 py-4 rounded-full">
    Get Started
  </button>
</div>
```

### ✅ BENAR

```tsx
<div className="max-w-sm mx-auto p-6 rounded-lg border border-border bg-card">
  <h1 className="text-2xl font-semibold text-foreground">Masuk</h1>
  <p className="text-sm text-muted-foreground mt-1">Masuk untuk melanjutkan</p>
  <Button variant="primary" className="w-full mt-6">
    <LogIn className="w-4 h-4 mr-2" />
    Masuk
  </Button>
</div>
```

## 12. Pola yang DILARANG (Ringkasan Cepat)

1. ❌ Gradient ungu-biru default ala "AI startup template".
2. ❌ Emoji sebagai ikon (🚀✨🔥💡⚡🎉).
3. ❌ Card dengan shadow berlebihan + rounded-3xl + gradient border.
4. ❌ Hero raksasa di halaman fungsional.
5. ❌ Animasi bounce/pulse terus-menerus.
6. ❌ Copy puitis ("Unlock your potential...", "Welcome to the future").
7. ❌ Lorem ipsum.
8. ❌ Warna neon / kontras rendah.
9. ❌ Font dekoratif (script, handwriting).
10. ❌ Ikon berukuran tidak konsisten dalam satu grup.
11. ❌ `title` attribute sebagai tooltip.
12. ❌ `alert()` / `confirm()` native.
13. ❌ `window.prompt()` untuk input.

## 13. Audit Visual Sebelum Selesai (Per Tahap)

Jalankan di browser untuk **setiap halaman baru** yang dibuat di tahap tersebut:

1. Buka semua halaman baru.
2. Toggle dark mode — semua terbaca.
3. Zoom 200% — tidak ada yang pecah.
4. Responsive 375px, 768px, 1440px — semua rapi.
5. Tab navigation — focus ring terlihat di semua elemen interaktif.
6. Jalankan axe DevTools — 0 critical issues.
7. Cek kontras dengan WebAIM Contrast Checker (min AA).

Jika ada pelanggaran → **PERBAIKI sebelum commit**.

## 14. Cara Pakai File Ini

- **AI Agent:** baca §1–§13 sebelum menulis komponen baru.
- **AI Agent:** jalankan §13 setiap selesai membuat halaman baru.
- **User:** pakai §12 sebagai checklist cepat saat review PR.
- **User:** pakai §11 sebagai referensi saat minta revisi visual.