# ISSUE: Missing Store Modules — Vite Pre-transform Error

**Tanggal ditemukan:** 2026-05-13  
**Severity:** 🔴 Critical — App tidak bisa dijalankan  
**Branch:** `feat/ui-refresh-foundation`  
**PR:** #5  

---

## Deskripsi Masalah

Saat menjalankan `npm run dev` di folder `client/`, Vite melempar error
`Failed to resolve import` untuk 3 modul store yang **tidak ada** di codebase:

```
Failed to resolve import "../../store/kategoriStore"  → FilterKategori.tsx:3
Failed to resolve import "../../store/wilayahStore"   → FilterWilayah.tsx:3
Failed to resolve import "../../store/statistikStore" → StatistikPanel.tsx:3
```

App langsung blank/crash, tidak ada halaman yang bisa dibuka.

---

## Root Cause

Pada fase F2-F3 UI refresh, subagent menulis ulang ketiga komponen tersebut
dengan mengimport store **fiktif** yang tidak pernah dibuat di project ini.
Store yang ada hanyalah:

| File | Hook yang diekspor |
|---|---|
| `store/filterStore.ts` | `useFilterStore` — state kategoriAktif + wilayah cascade |
| `store/mapStore.ts`    | `useMapStore` — basemap, zoom, mapInstance |
| `store/authStore.ts`   | `useAuthStore` — login/logout |

Selain itu terdapat dua bug sekunder pada file yang sama:

1. **Tipe field salah** — subagent mereferensikan `k.warna` padahal field di
   `KategoriInfra` bernama `k.color` (lihat `types/index.ts`).
2. **API komponen Select salah** — subagent memanggil `<Select options={[...]} />`
   padahal komponen `ui/Select` menerima `children` (`<option>` elements),
   bukan prop `options`.

---

## File yang Terdampak

| File | Error | Fix |
|---|---|---|
| `src/components/filter/FilterKategori.tsx` | import `kategoriStore` tidak ada; pakai `k.warna` | Pakai `useFilterStore` + `api.get('/kategori')` lokal; ganti `k.warna` → `k.color` |
| `src/components/filter/FilterWilayah.tsx` | import `wilayahStore` tidak ada; `<Select options>` | Pakai `useFilterStore` + hooks `useKecamatan/useNagari/useKorong`; pakai `<option>` children |
| `src/components/statistik/StatistikPanel.tsx` | import `statistikStore` tidak ada | Pakai hooks `useStatistik` + `useInfrastruktur` yang sudah ada |

---

## Langkah Reproduksi

```bash
cd padang-pariaman-map/client
npm install
npm run dev
# → Vite error di konsol, halaman putih di browser
```

---

## Fix

Lihat commit `fix(ui): missing store imports` di branch `feat/ui-refresh-foundation`.

Ringkasan perubahan:
- `FilterKategori.tsx` → gunakan `useFilterStore` untuk state, fetch kategori via
  `api.get('/kategori')` lokal, field `k.color` (bukan `k.warna`)
- `FilterWilayah.tsx` → gunakan `useFilterStore` untuk state wilayah cascade,
  `useKecamatan/useNagari/useKorong` hooks, `<option>` children pada `<Select>`
- `StatistikPanel.tsx` → gunakan `useStatistik` + `useInfrastruktur` hooks

---

---

## Bug #2 — Named Export vs Default Import Mismatch (StatistikCard, BarChart, DonutChart)

**Tanggal ditemukan:** 2026-05-13  
**Severity:** 🔴 Critical — halaman `/` crash saat render StatistikPanel

### Error

```
Uncaught SyntaxError: The requested module '/src/components/statistik/BarChart.tsx'
does not provide an export named 'default'
```

### Root Cause

Subagent menulis 3 komponen statistik dengan **named export** (`export function X`)
namun `StatistikPanel.tsx` mengimport ketiganya sebagai **default import** (`import X from './X'`).
Selain itu terjadi **prop schema mismatch** — nama prop berbeda antara pemakai dan penyedia:

| File | Export lama | Import di StatistikPanel | Prop schema lama | Prop schema baru |
|---|---|---|---|---|
| `BarChart.tsx` | `export function BarChart` | `import BarChart from '...'` | `{label, value, color?}` | `{name, nilai, satuan?}` |
| `DonutChart.tsx` | `export function DonutChart` | `import DonutChart from '...'` | `{label, value, color?}` | `{name, value, color}` |
| `StatistikCard.tsx` | `export function StatistikCard` | `import StatistikCard from '...'` | `{label, value, color, icon?}` | `{indikator, nilai, satuan?, tahun?}` |

### Fix

Ketiga file diubah ke **`export default function`** dan prop schema diselaraskan
dengan yang sudah dipakai `StatistikPanel.tsx`. Recharts dipakai sebagai charting
library (sudah tersedia di `package.json`) menggantikan implementasi SVG manual.

---

---

## Bug #3 — Peta Tidak Full + BasemapToggle Tidak Muncul

**Tanggal ditemukan:** 2026-05-13
**Severity:** 🔴 Critical — peta hanya render sebagian, tombol ganti basemap hilang

### Error / Gejala

1. Panel kanan (statistik) muncul, tapi peta di bagian kanan terpotong/tidak penuh
2. Tombol BasemapToggle tidak terlihat di halaman

### Root Cause

**A. Peta tidak full (`MapContainer.tsx`)**

- Leaflet perlu container dengan ukuran eksplisit. `className="w-full h-full"` saja
  tidak cukup jika parent flex belum selesai di-layout saat Leaflet init.
- `MapEventHandler` hanya listen event `load` yang tidak selalu terpanggil —
  Leaflet tidak mendeteksi perubahan ukuran container saat panel toggle.
- Tidak ada `invalidateSize()` sehingga tile tidak mengisi area baru.

**B. BasemapToggle tidak muncul/berfungsi (`BasemapToggle.tsx`)**

- Subagent mendefinisikan 3 opsi: `'osm' | 'satellite' | 'topo'`, padahal
  `mapStore.ts` hanya mengenal tipe `'osm' | 'google'`.
  → `setBasemap('satellite')` dipanggil tapi TypeScript menerima (tidak strict
  runtime check), nilai state tidak berubah, tile tidak berganti.
- Komponen tidak punya `position: absolute` + `z-index` yang cukup
  → tenggelam di bawah tile Leaflet yang punya z-index default ~200-400.

### Fix

**`MapContainer.tsx`:**
- Tambah `ResizeObserver` pada container Leaflet → panggil `map.invalidateSize()`
  otomatis setiap kali lebar/tinggi wrapper berubah (panel toggle, resize window).
- Tambah `style={{ width: '100%', height: '100%' }}` inline sebagai fallback
  lebih reliable dari `className` saja.
- Tambah `style={{ minHeight: 0 }}` pada wrapper div agar flex child tidak overflow.
- `MapEventHandler` sekarang pakai `useEffect` dengan `ResizeObserver` bukan hanya `load` event.
- Import `useMap` di `BasemapLayer` untuk panggil `invalidateSize` saat basemap berubah.

**`BasemapToggle.tsx`:**
- Hapus tipe `'satellite' | 'topo'` yang tidak ada di store.
- Ganti `setBasemap(id)` dengan `toggleBasemap()` (sudah ada di store, toggle osm ↔ google).
- Tambah `position: absolute; bottom: 1.5rem; right: 0.75rem; z-index: 1000` agar
  muncul di atas semua tile Leaflet.
- Style glass morphism via inline style (lebih reliable dari Tailwind `backdrop-blur`
  yang kadang butuh `transform: translateZ(0)` trigger di beberapa browser).

---

## Checklist Verifikasi Setelah Fix

- [ ] `npm run dev` jalan tanpa error Vite
- [ ] Halaman `/` terbuka, peta tampil **penuh** (tidak ada area kosong/abu-abu)
- [ ] Tombol BasemapToggle muncul di pojok kanan-bawah peta
- [ ] Klik tombol BasemapToggle → tile berganti antara OSM dan Google Maps
- [ ] Toggle panel Filter (kiri) → peta resize otomatis mengisi area baru
- [ ] Toggle panel Statistik (kanan) → peta resize otomatis mengisi area baru
- [ ] Filter kategori muncul dan bisa di-toggle
- [ ] Filter wilayah cascade Kecamatan → Nagari → Korong berfungsi
- [ ] Panel statistik tampil sesuai wilayah aktif
- [ ] `npm run build` sukses tanpa error TypeScript

---

## Catatan untuk Developer

> **Aturan ke depan:** Sebelum menulis komponen yang membutuhkan state global,
> selalu cek isi folder `src/store/` terlebih dahulu. Jangan membuat
> import ke file store yang belum ada tanpa membuat file-nya sekalian.
> Gunakan hooks di `src/hooks/` untuk data fetching, bukan store baru.
