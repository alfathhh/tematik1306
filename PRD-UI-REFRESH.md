# PRD — Peremajaan Tampilan UI Peta Tematik Padang Pariaman

> **Audiens dokumen ini:** Junior developer & AI assistant lain (Claude, Cursor, Copilot, dsb.).
> **Aturan emas:** kalau ragu, baca ulang bagian "Definisi yang Sering Salah Paham" dulu sebelum tanya.

| Field | Nilai |
|---|---|
| **Versi PRD** | 1.0 |
| **Status** | Draft — menunggu review |
| **Tanggal** | 2026-05-13 |
| **Repo** | `alfathhh/tematik1306` |
| **Path kode** | `padang-pariaman-map/` |
| **Estimasi total** | 5–7 hari kerja (1 dev fulltime) |

---

## 1. Ringkasan Eksekutif (TL;DR)

Aplikasi **Peta Tematik Padang Pariaman** secara fitur sudah lengkap (peta, filter, statistik, admin CRUD, import Excel, dll.), **tapi tampilannya masih seperti prototype**: warna acak, spacing tidak konsisten, panel admin terasa kaku, dan kurang ramah di layar mobile.

PRD ini meminta peremajaan **HANYA pada lapisan tampilan (UI)** — tanpa mengubah API, schema database, atau logika bisnis. Hasil akhir: aplikasi terlihat **modern, profesional, konsisten, dan responsif** di handphone, tablet, dan desktop.

**Yang akan diubah:** komponen React, Tailwind config, design tokens, layout, copywriting kecil di UI.
**Yang TIDAK boleh diubah:** endpoint API, struktur tabel, kontrak data, kode wilayah (`kdkab`/`kdkec`/`kddesa`/`kdsls`), validasi import.

---

## 2. Definisi yang Sering Salah Paham

Baca dulu sebelum mulai coding. Kalau salah satu kata ini muncul di tugas, artinya:

| Istilah | Artinya di project ini |
|---|---|
| **Client** | Halaman publik di `/` — siapa pun bisa akses. File: `client/src/pages/ClientMap.tsx`. |
| **Server** *(dalam PRD ini)* | **Panel Admin** di `/admin/*`. Walaupun secara teknis di-render React, kontennya untuk pengelola data (server-side concern). File: `client/src/pages/admin/*`. |
| **Backend** | Express API di folder `server/`. **Tidak punya UI**, jadi tidak masuk scope visual PRD ini. |
| **Wilayah** | Hierarki: Kabupaten → Kecamatan → Nagari → Korong. Jangan ganti istilahnya jadi "desa" atau "kelurahan" di UI. |
| **Infrastruktur** | Titik POI (restoran, masjid, dll.) di peta. Bukan "tempat" atau "lokasi". |

> **Untuk AI lain yang baca ini:** Jika user menyebut "server" dalam konteks _UI_, yang dimaksud adalah panel **Admin**. Jika user menyebut "server" dalam konteks _kode_, yang dimaksud adalah folder `server/`.

---

## 3. Latar Belakang & Masalah

### 3.1 Apa yang sudah ada
Stack saat ini (jangan diganti):
- **Client:** React 18, Vite, TypeScript, **Tailwind CSS v3**, react-leaflet, Zustand, Recharts.
- **Server:** Express, Prisma, PostgreSQL, JWT, multer.

`tailwind.config.js` saat ini **kosong** — `theme.extend` belum diisi. Inilah akar inkonsistensi visual: setiap komponen pakai utility class warna bawaan Tailwind secara ad-hoc.

### 3.2 Masalah konkret yang terlihat
1. **Tidak ada design token** — warna primary, font, radius, shadow tidak terdefinisi.
2. **Filter panel di client** terlihat dempet, tanpa hierarki visual.
3. **Popup peta** tidak punya struktur jelas (foto, judul, badge, alamat campur).
4. **Statistik panel** card-nya datar, chart Recharts pakai warna default (biru-biru semua).
5. **Form admin** label dan input rapat, tidak ada feedback state (focus, error, disabled) yang konsisten.
6. **Tabel admin** header tidak sticky, pagination minimalis, baris terlalu rapat.
7. **Login admin** masih sangat polos (form di tengah halaman putih).
8. **Mobile** — sidebar filter menumpuk peta, tidak ada drawer/sheet pattern.
9. **Loading & empty state** banyak yang tidak ada (cuma blank atau "Loading...").
10. **Branding** tidak ada — tidak ada logo, tagline, atau identitas Padang Pariaman.

---

## 4. Tujuan & Non-Goals

### 4.1 Tujuan (Goals)
- **G1.** Tetapkan design system minimal: warna, tipografi, spacing, radius, shadow, motion.
- **G2.** Konsistensi visual di **semua** halaman client & admin.
- **G3.** Mobile-first responsive (360 / 768 / 1024 / 1440 px).
- **G4.** Aksesibilitas dasar: kontras WCAG **AA**, fokus ring jelas, label form, alt text.
- **G5.** Loading / error / empty state untuk **setiap** komponen yang fetch data.
- **G6.** Performa UI tidak menurun (FCP < 2 s di 3G, bundle JS tidak naik > 15%).

### 4.2 Non-Goals (TIDAK dikerjakan di PRD ini)
- Tidak menambah fitur baru (tetap CRUD + peta + statistik yang sudah ada).
- Tidak migrasi ke Next.js / framework lain.
- Tidak refactor state management (Zustand tetap).
- Tidak ganti library peta atau chart.
- Tidak ubah skema database, endpoint, atau format Excel.
- Tidak buat dark mode (boleh disiapkan token-nya, tapi tidak di-toggle).

---

## 5. Persona & User Journey Singkat

| Persona | Kebutuhan | Halaman utama |
|---|---|---|
| **Warga / Pengunjung** | Lihat fasilitas dekat saya, baca statistik wilayah | `/` (ClientMap) |
| **Admin OPD** | Input data infrastruktur baru, import Excel, lihat ringkasan | `/admin/*` |

**User journey kritis (harus mulus setelah peremajaan):**
1. Warga buka `/` di HP → langsung lihat peta + tombol filter mengambang → tap kategori "Kesehatan" → marker rumah sakit muncul → tap marker → popup rapi tampil.
2. Admin login → dashboard ringkas → klik "Infrastruktur" → tabel rapi → klik "Tambah" → form bersih → upload foto drag-drop → simpan → toast sukses.

---

## 6. Design System (Wajib Dipakai di Semua Komponen)

> Tulis semua token ini ke `client/tailwind.config.js`. Setelah itu, **dilarang** pakai warna/spacing hardcoded di luar token.

### 6.1 Palet Warna
Tema "Bumi Tabuik" — terinspirasi pesisir Padang Pariaman (laut, pasir, tradisi).

```js
// tailwind.config.js → theme.extend.colors
colors: {
  primary: {
    50:  '#f0f9ff',
    100: '#e0f2fe',
    500: '#0284c7',  // aksi utama, link
    600: '#0369a1',  // hover
    700: '#075985',  // active
  },
  accent: {
    500: '#f59e0b',  // CTA sekunder, highlight (pasir/tabuik)
    600: '#d97706',
  },
  neutral: {
    50:  '#f8fafc',  // background utama
    100: '#f1f5f9',  // background card sekunder
    200: '#e2e8f0',  // border
    500: '#64748b',  // teks sekunder
    700: '#334155',  // teks utama
    900: '#0f172a',  // heading
  },
  success: '#16a34a',
  warning: '#eab308',
  danger:  '#dc2626',
}
```

**Warna kategori infrastruktur:** ambil dari kolom `color` di tabel `kategori_infra` (sudah dinamis). **Jangan hardcode di komponen.**

### 6.2 Tipografi
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
}
```
Tambahkan `<link>` Google Fonts di `client/index.html`.

| Skala | Class Tailwind | Pemakaian |
|---|---|---|
| Display | `text-3xl md:text-4xl font-display font-bold` | Hero / judul halaman |
| H1 | `text-2xl font-display font-semibold` | Judul section |
| H2 | `text-xl font-semibold` | Sub-judul |
| Body | `text-sm md:text-base` | Konten utama |
| Caption | `text-xs text-neutral-500` | Meta info |

### 6.3 Spacing, Radius, Shadow, Motion
```js
borderRadius: {
  'xl': '0.875rem',
  '2xl': '1.25rem',
},
boxShadow: {
  'soft':  '0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.06)',
  'pop':   '0 4px 16px rgb(0 0 0 / 0.08), 0 8px 32px rgb(0 0 0 / 0.06)',
  'focus': '0 0 0 3px rgb(2 132 199 / 0.35)',
},
transitionDuration: {
  '250': '250ms',
},
```

**Aturan spacing:** kelipatan **4 px** saja (Tailwind default sudah seperti ini — patuhi).

### 6.4 Komponen Dasar (buat di `client/src/components/ui/`)
Buat folder baru `components/ui/` berisi 8 komponen primitif. Semua komponen lain HARUS pakai ini:

- [ ] `Button.tsx` — varian: `primary | secondary | ghost | danger`, ukuran: `sm | md | lg`, prop `isLoading`.
- [ ] `Input.tsx` — dengan `label`, `error`, `hint`, ikon kiri/kanan opsional.
- [ ] `Select.tsx` — wrapper konsisten untuk `<select>` native (dropdown wilayah pakai ini).
- [ ] `Card.tsx` — wrapper `bg-white rounded-2xl shadow-soft p-4 md:p-6`.
- [ ] `Badge.tsx` — varian by warna kategori (terima prop `color` hex dari API).
- [ ] `Modal.tsx` — overlay + focus trap + close on Esc.
- [ ] `Toast.tsx` — varian success/error/info, auto-dismiss 4 s.
- [ ] `Skeleton.tsx` — placeholder loading animasi pulse.

---

## 7. Scope Halaman — Checklist Eksekusi

> **Cara baca:** setiap item adalah satu PR kecil yang bisa diselesaikan ≤ 4 jam. Centang `[x]` saat selesai.

### 7.1 Client / Halaman Publik

#### A. `pages/ClientMap.tsx` (halaman utama)
- [ ] Layout: peta full-screen, **header transparan mengambang** di atas (logo Padang Pariaman + nama aplikasi + search).
- [ ] **SearchBar** (`components/search/SearchBar.tsx`): pindah ke header, dropdown hasil pakai `Card`, ikon lupa kiri, tombol clear di kanan.
- [ ] **FilterKategori** (`components/filter/FilterKategori.tsx`):
  - Desktop: panel kiri sticky, lebar 280 px.
  - Mobile: **bottom sheet** yang bisa di-swipe (pakai komponen sederhana, tidak perlu library).
  - Tiap chip kategori: ikon emoji + label + dot warna dari `kategori.color`.
- [ ] **FilterWilayah** (`components/filter/FilterWilayah.tsx`): cascade dropdown pakai `Select` dari `ui/`. Tampilkan **breadcrumb** wilayah aktif di atas peta.
- [ ] **BasemapToggle** (`components/map/BasemapToggle.tsx`): jadi tombol melayang kanan-bawah, ikon-only di mobile.
- [ ] **InfraPopup** (`components/map/InfraPopup.tsx`): struktur baru sesuai `CLAUDE.md`:
  ```
  ┌─────────────────────┐
  │ [Foto 16:9 cover]   │
  ├─────────────────────┤
  │ Nama (font-bold)    │
  │ [Badge kategori]    │
  │ 📍 Alamat           │
  └─────────────────────┘
  ```
- [ ] **StatistikPanel** (`components/statistik/*`):
  - Desktop: panel kanan, lebar 360 px, scrollable.
  - Mobile: tab di bottom sheet bersama filter.
  - `StatistikCard`: gunakan `Card`, angka besar (`text-3xl font-display`), label kecil di bawah, tren (▲▼) opsional.
  - `BarChart` & `DonutChart`: pakai palet `primary` + `accent` + warna kategori. Hapus default biru Recharts.
- [ ] **Empty state**: jika tidak ada infrastruktur match filter → ilustrasi sederhana + teks "Belum ada data di wilayah ini".
- [ ] **Loading state**: skeleton untuk panel statistik; spinner kecil di pojok peta saat fetch marker.

#### B. Header / Branding
- [ ] Buat komponen `components/layout/PublicHeader.tsx`.
- [ ] Logo placeholder (`/public/logo-pp.svg` — boleh pakai inisial "PP" dulu).
- [ ] Tagline kecil: "Peta Tematik Kabupaten Padang Pariaman".
- [ ] **JANGAN tampilkan link `/admin`** di mana pun (lihat `CLAUDE.md` → "Hal yang Jangan Dilakukan").

### 7.2 Server / Panel Admin

#### C. `pages/admin/Login.tsx`
- [ ] Layout 2 kolom di desktop: kiri ilustrasi/peta dekoratif, kanan form login.
- [ ] Mobile: form tengah, padding 24 px.
- [ ] Pakai `Input`, `Button` dari `ui/`.
- [ ] Tampilkan error login dengan `Toast` + inline message di bawah field.

#### D. `pages/admin/AdminLayout.tsx` (shell)
- [ ] **Sidebar kiri** (desktop ≥ 1024 px), lebar 240 px, fixed:
  - Logo kecil di atas.
  - Menu: Dashboard, Infrastruktur, Statistik, Kategori.
  - Active state: background `primary-50`, border kiri 3 px `primary-500`.
  - Tombol Logout di bawah.
- [ ] **Topbar** (mobile/tablet): hamburger membuka drawer.
- [ ] Konten utama: padding `p-4 md:p-8`, background `neutral-50`.

#### E. `pages/admin/Dashboard.tsx`
- [ ] Grid 4 `Card` ringkas: total infrastruktur, total kategori, total record statistik, terakhir update.
- [ ] 1 chart Recharts (Bar) jumlah infrastruktur per kategori.
- [ ] 1 list "5 data terbaru" pakai tabel sederhana.

#### F. `pages/admin/Infrastruktur.tsx` & `pages/admin/Statistik.tsx`
Pola sama untuk keduanya:
- [ ] **Toolbar** sticky di atas tabel: kiri "Import Excel" + "Export Excel"; tengah search input; kanan "Tambah" (primary).
- [ ] **Tabel**:
  - Header `bg-neutral-100` sticky, font `text-xs uppercase tracking-wide text-neutral-500`.
  - Baris hover `bg-neutral-50`.
  - Kolom aksi (kanan): ikon edit + hapus, tooltip on hover.
  - Pagination 20/halaman, di bawah, pakai `Button ghost`.
- [ ] **Form Tambah/Edit** dalam `Modal`:
  - Field order sesuai `CLAUDE.md` § Form Infrastruktur.
  - **MapPicker** koordinat: tombol "Pilih di Peta" buka mini-map 320×240 px di dalam modal.
  - **FotoUpload** (`components/admin/FotoUpload.tsx`):
    - Drop zone dashed border `border-neutral-300`, hover `border-primary-500`.
    - Preview 16:9 setelah upload.
    - Tombol Ganti / Hapus muncul on hover preview.
- [ ] **Konfirmasi hapus** pakai `Modal` + tombol danger.
- [ ] **Import Excel** pakai `Modal`: drop file → progress bar → tampilkan hasil (sukses N, gagal M dengan list error per baris).

#### G. `pages/admin/Kategori.tsx`
- [ ] Tabel: ikon (emoji besar), label, value (slug, mono font), warna (color swatch + hex), urutan, jumlah infra.
- [ ] Form: input label auto-generate slug; emoji picker sederhana (input teks dulu, picker fancy boleh nanti); `<input type="color">` native untuk warna; number input urutan.
- [ ] Tombol hapus disabled + tooltip "Masih dipakai oleh N infrastruktur" jika `_count.infra > 0`.

### 7.3 Hal Lintas Halaman
- [ ] **Toast container** global di `App.tsx` (pojok kanan-atas desktop, atas mobile).
- [ ] **Error boundary** sederhana di root → tampilkan `Card` dengan tombol "Reload".
- [ ] **404 page** (`pages/NotFound.tsx`) dengan link kembali ke `/`.
- [ ] **favicon** dan `<title>` per halaman (pakai `useEffect` set `document.title`).

---

## 8. Aksesibilitas (A11y) — Checklist Wajib

- [ ] Semua tombol icon-only punya `aria-label`.
- [ ] Kontras teks vs background **≥ 4.5:1** (cek dengan https://webaim.org/resources/contrastchecker/).
- [ ] Fokus ring terlihat (sudah ada di token `shadow-focus`); jangan `outline-none` tanpa pengganti.
- [ ] Form: setiap `Input` punya `<label htmlFor>` atau `aria-label`.
- [ ] Modal: focus trap + tutup dengan Esc + restore focus ke trigger.
- [ ] Peta: sediakan teks alternatif "Peta interaktif Padang Pariaman" untuk screen reader (`role="application" aria-label`).
- [ ] Gambar foto infrastruktur: `alt={infra.nama}`.

---

## 9. Responsive Breakpoint

Pakai breakpoint Tailwind default. Aturan layout:

| Breakpoint | Lebar | Layout Client | Layout Admin |
|---|---|---|---|
| `<sm` | < 640 px | Peta full, filter di bottom sheet | Drawer hamburger |
| `md` | 768 px | Peta + filter samping (drawer) | Drawer hamburger |
| `lg` | 1024 px | Peta + filter kiri 280 + statistik kanan 360 | Sidebar permanen 240 |
| `xl` | 1280 px+ | Sama seperti lg, container max 1440 | Container max 1440 |

**Test wajib** di Chrome DevTools: iPhone 12 (390), iPad (768), Desktop (1440).

---

## 10. Performance Budget

| Metrik | Target |
|---|---|
| First Contentful Paint (3G simulasi) | < 2 s |
| Largest Contentful Paint | < 2.5 s |
| Total bundle JS (gzip) | tidak naik > 15% dari baseline |
| Marker peta | tetap pakai cluster jika > 100 marker (sudah ada) |
| Foto infrastruktur | `<img loading="lazy">` + `width`/`height` attribute |

**Larangan:**
- Tidak boleh tambah library UI besar (MUI, Ant Design, Chakra) — cukup Tailwind.
- Boleh tambah ringan: `clsx` (untuk class merging), `lucide-react` (icon, opsional).
- **Wajib install Google Fonts via `<link>` dengan `&display=swap`** — bukan `@import` di CSS.

---

## 11. Tech Constraint (HARUS Dipatuhi)

1. **Jangan ubah** file di `server/` kecuali untuk perbaikan kontras/typo di response error string.
2. **Jangan ubah** `prisma/schema.prisma`.
3. **Jangan ubah** kontrak API (path, method, body, response shape).
4. **Jangan ubah** logika di `store/*.ts`, `hooks/*.ts`, `lib/api.ts`. Boleh hanya kalau ada bug yang menghalangi UI.
5. **Boleh** refactor JSX & className di komponen.
6. **Boleh** tambah file baru di `components/ui/`, `components/layout/`, `assets/`.
7. **Wajib** TypeScript strict — tidak ada `any` baru.
8. Komentar & nama file domain pakai **Bahasa Indonesia** sesuai konvensi `CLAUDE.md`.

---

## 12. Rencana Fase

| Fase | Durasi | Output | Bisa demo? |
|---|---|---|---|
| **F1. Foundation** | 1 hari | `tailwind.config.js` lengkap, 8 komponen `ui/`, font terpasang | Ya (storybook manual / halaman demo) |
| **F2. Client refresh** | 2 hari | ClientMap + Header + semua filter + popup + statistik panel | Ya (halaman publik) |
| **F3. Admin refresh** | 2 hari | Login + AdminLayout + Dashboard + 3 halaman CRUD | Ya (panel admin) |
| **F4. Polish & a11y** | 1 hari | Empty/loading state, a11y checklist, 404, toast global, perf check | Ya (production-like) |

**Definition of Done per fase:**
- Tidak ada warning TypeScript / ESLint baru.
- Manual test di mobile (390 px) + desktop (1440 px).
- Screenshot before/after dilampirkan di PR description.
- Tidak ada regression di fitur (semua CRUD, import, filter masih jalan).

---

## 13. Acceptance Criteria (Cara Tahu Sudah Selesai)

Pemilik produk akan memeriksa daftar ini. Kalau **semua** centang, PRD selesai.

- [ ] `tailwind.config.js` punya token `colors`, `fontFamily`, `boxShadow`, `borderRadius` sesuai § 6.
- [ ] Folder `components/ui/` ada dengan minimal 8 komponen di § 6.4.
- [ ] Tidak ada warna hex hardcoded di JSX kecuali yang berasal dari API (`kategori.color`).
- [ ] Halaman `/` dan semua `/admin/*` lulus uji manual di iPhone 12, iPad, Desktop 1440.
- [ ] Lighthouse (mode mobile) Accessibility ≥ 90, Best Practices ≥ 90.
- [ ] Setiap halaman punya: loading state, empty state, error state.
- [ ] Form admin menampilkan error inline + toast saat validasi gagal.
- [ ] Tidak ada link/petunjuk ke `/admin` di halaman publik.
- [ ] `npm run build` di `client/` sukses tanpa error.
- [ ] Bundle size (`dist/assets/*.js`) tidak naik > 15% dari sebelum peremajaan (catat baseline dulu).

---

## 14. Cara Mulai (Untuk Junior Dev / AI)

```bash
# 1. Clone & setup (lihat SETUP.md kalau pertama kali)
cd padang-pariaman-map/client
npm install

# 2. Buat branch baru
git checkout -b feat/ui-refresh-foundation

# 3. Mulai dari Fase 1 — edit tailwind.config.js
#    Ikuti urutan §6.1 → §6.2 → §6.3 → §6.4

# 4. Catat baseline bundle size sebelum mulai:
npm run build
ls -lh dist/assets/*.js   # simpan angkanya di PR description

# 5. Kerjakan checklist §7 satu per satu, commit per checklist item.
```

**Tip untuk AI assistant:** ketika user hanya bilang "lanjutkan", buka file PRD ini, cari checkbox `[ ]` pertama yang belum dicentang di § 7, kerjakan satu item, kemudian centang `[x]` di file ini sebagai bagian dari commit yang sama.

---

## 15. Lampiran — Pertanyaan Terbuka

Hal-hal yang masih perlu keputusan dari pemilik produk:

1. Logo final Pemerintah Kabupaten Padang Pariaman — pakai resmi atau inisial "PP"?
2. Apakah hero header client perlu tagline tambahan? Contoh: "Data terbuka untuk warga".
3. Dark mode — siapkan token saja sekarang, atau tidak sama sekali?
4. Bahasa UI — full Bahasa Indonesia, atau tetap ada beberapa istilah Inggris (Dashboard, Login)?

> **Default jika tidak ada jawaban dalam 3 hari:** pakai inisial "PP", tagline tetap, tanpa dark mode, istilah Inggris boleh untuk Dashboard/Login/Logout/Search.

---

**Selesai.** Jika ada pertanyaan saat eksekusi, buka issue di GitHub dengan label `ui-refresh` dan referensi ke nomor section PRD ini (contoh: "Pertanyaan §7.1.A — popup di mobile").
