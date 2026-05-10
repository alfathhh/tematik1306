# CLAUDE.md — Panduan AI untuk Project Peta Tematik Padang Pariaman

## Identitas Project

Ini adalah aplikasi **peta tematik interaktif** untuk Kabupaten Padang Pariaman, Sumatera Barat.
Terdiri dari dua sisi: **Client** (publik) dan **Admin** (tersembunyi, no public link).

---

## Aturan Umum

- Tulis kode dalam **Bahasa Indonesia** untuk komentar dan variabel yang domain-spesifik, sisanya English
- Gunakan **TypeScript** jika memungkinkan (React + Vite + TS, atau Next.js)
- Semua komponen harus **mobile-responsive**
- Jangan pernah hardcode kredensial; gunakan `.env`
- Gunakan `async/await`, bukan `.then().catch()` berantai
- Selalu handle error state, loading state, dan empty state di UI

---

## Struktur Folder

```
/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/         # MapContainer, MarkerLayer, WilayahLayer, Popup
│   │   │   ├── filter/      # FilterInfra, FilterWilayah (cascade dropdown)
│   │   │   ├── search/      # SearchBar, SearchResults
│   │   │   ├── statistik/   # StatistikPanel, StatCard, Chart
│   │   │   └── admin/       # AdminLayout, InfraTable, StatistikTable, KategoriTable, ImportModal
│   │   ├── hooks/
│   │   │   ├── useInfrastruktur.ts
│   │   │   ├── useWilayah.ts
│   │   │   ├── useStatistik.ts
│   │   │   └── useKategori.ts
│   │   ├── pages/
│   │   │   ├── ClientMap.tsx
│   │   │   └── admin/
│   │   │       ├── Login.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Infrastruktur.tsx
│   │   │       ├── Statistik.tsx
│   │   │       └── Kategori.tsx
│   │   ├── store/           # Zustand atau Context
│   │   └── lib/
│   │       ├── api.ts        # axios instance + interceptors
│   │       └── mapUtils.ts   # helper bounds, zoom, filter GeoJSON
│   └── public/
│       └── geojson/
│           ├── kabupaten.geojson
│           ├── kecamatan.geojson
│           ├── nagari.geojson
│           └── korong.geojson
│
└── server/                  # Express backend
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── infrastruktur.ts
    │   │   ├── statistik.ts
    │   │   └── wilayah.ts
    │   ├── middleware/
    │   │   └── auth.ts       # JWT verify middleware
    │   ├── db/
    │   │   └── index.ts      # pg / drizzle / prisma client
    │   └── utils/
    │       ├── excel.ts      # import/export xlsx
    │       └── upload.ts     # multer config
    └── .env
```

---

## Primary Key Wilayah

> **PENTING** — Selalu gunakan kode ini secara konsisten di seluruh codebase:

| Level | Kode | Panjang | Contoh |
|---|---|---|---|
| Kabupaten | `kdkab` | 4 char | `1305` |
| Kecamatan | `kdkec` | 6 char | `130501` |
| Nagari | `kddesa` | 10 char | `1305010001` |
| Korong | `kdsls` | 12 char | `130501000101` |

Aturan cascade:
- `kdkec` dimulai dengan `kdkab`
- `kddesa` dimulai dengan `kdkec`
- `kdsls` dimulai dengan `kddesa`

Gunakan ini untuk filter relasional: `WHERE kdsls LIKE $1 || '%'` tidak perlu join.

---

## Kategori Infrastruktur

Kategori bersifat **dinamis** — disimpan di tabel `kategori_infra` dan dikelola dari halaman admin. **Jangan hardcode** daftar kategori di frontend.

```typescript
// Type
export interface KategoriInfra {
  id: string;
  value: string;   // slug unik, e.g. 'restoran'
  label: string;   // e.g. 'Restoran'
  icon: string;    // emoji, e.g. '🍽️'
  color: string;   // hex, e.g. '#F97316'
  urutan: number;
}

// Hook — load sekali saat app mount, cache di store global
export function useKategori() {
  // fetch GET /api/kategori
  // simpan di Zustand/Context agar tidak re-fetch tiap render
}
```

**Seed data awal** (insert via migration):
```sql
INSERT INTO kategori_infra (value, label, icon, color, urutan) VALUES
  ('restoran',     'Restoran',     '🍽️', '#F97316', 1),
  ('rumah_ibadah', 'Rumah Ibadah', '🕌', '#8B5CF6', 2),
  ('pasar',        'Pasar',        '🛒', '#EAB308', 3),
  ('toko',         'Toko',         '🏪', '#06B6D4', 4),
  ('kesehatan',    'Kesehatan',    '🏥', '#22C55E', 5),
  ('lainnya',      'Lainnya',      '📍', '#6B7280', 99);
```

---

## Aturan Map

### Basemap

```typescript
const BASEMAPS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  google: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
    attribution: '© Google',
  },
};
```

### Default Map Config

```typescript
const MAP_CONFIG = {
  center: [-0.5397, 100.1187] as [number, number],  // Padang Pariaman
  zoom: 11,
  minZoom: 9,
  maxZoom: 18,
};
```

### Layer Behavior

- **Marker infrastruktur:** hanya render jika kategori-nya di-checklist AND masuk dalam batas wilayah yang dipilih
- **GeoJSON wilayah:** selalu tampil sebagai outline; saat wilayah dipilih, di-highlight dengan opacity berbeda
- **Cluster:** gunakan `react-leaflet-cluster` jika jumlah marker > 100

### Popup Infrastruktur

```tsx
// Tampilkan dalam urutan ini:
// 1. Foto (fullwidth, height 160px, object-cover)
// 2. Nama (font-bold, text-lg)
// 3. Badge kategori (warna sesuai KATEGORI_INFRA)
// 4. Alamat (text-sm, text-gray-600, ikon 📍)
```

---

## Filter Wilayah (Cascade Dropdown)

```typescript
// State shape
interface FilterWilayah {
  kdkab: string;   // selalu '1305' (Padang Pariaman), tidak bisa diubah
  kdkec: string;   // '' = semua kecamatan
  kddesa: string;  // '' = semua nagari
  kdsls: string;   // '' = semua korong
}

// Reset rule: saat kdkec berubah → reset kddesa & kdsls
//             saat kddesa berubah → reset kdsls
```

Saat filter wilayah berubah:
1. Fetch ulang dropdown level bawahnya
2. Zoom peta ke bounding box wilayah yang dipilih (gunakan `fitBounds` dari GeoJSON feature)
3. Filter marker: hanya tampil marker yang `kdsls.startsWith(kddesa)` (atau level sesuai)

---

## API Client

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

// Attach JWT untuk request admin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect ke /admin/login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);
```

---

## Import Excel

### Format Kolom Infrastruktur

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nama` | string | ✅ | |
| `kategori` | string | ✅ | Harus salah satu dari `value` yang ada di tabel `kategori_infra` |
| `alamat` | string | | |
| `lat` | number | ✅ | Antara -4 dan 2 (Sumbar) |
| `lng` | number | ✅ | Antara 99 dan 105 (Sumbar) |
| `kdkab` | string | ✅ | `1305` |
| `kdkec` | string | ✅ | |
| `kddesa` | string | | |
| `kdsls` | string | | |
| `foto_url` | string | | URL foto |

### Format Kolom Statistik

| Kolom | Tipe | Wajib |
|---|---|---|
| `kdkab` | string | ✅ |
| `kdkec` | string | |
| `kddesa` | string | |
| `kdsls` | string | |
| `indikator` | string | ✅ | Contoh: `jumlah_penduduk`, `jumlah_sd` |
| `nilai` | number | ✅ |
| `satuan` | string | | Contoh: `jiwa`, `unit` |
| `tahun` | number | ✅ |

### Validasi Import

```typescript
function validateInfraRow(row: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  // cek kategori valid (query ke DB atau bandingkan dengan cache kategori)
  // cek lat/lng range
  // cek kdkab === '1305'
  // return errors dengan nomor baris
}
```

---

## Komponen Admin

### Tabel (InfraTable & StatistikTable)

- Pagination: 20 item per halaman
- Kolom sortable
- Search/filter di atas tabel
- Aksi: Edit (ikon pensil) | Hapus (ikon trash, konfirmasi modal)
- Tombol "Tambah" di kanan atas
- Tombol "Import Excel" dan "Export Excel" di kiri atas

### Form & Tabel Kategori (KategoriTable)

- Tabel: kolom icon, label, value (slug), warna (color swatch), urutan, jumlah infra
- Aksi: Edit | Hapus (disabled jika masih ada infra yang pakai kategori ini)
- Form tambah/edit:
  - `label` → auto-generate `value` (slug) dari label (lowercase, underscore)
  - `icon` → input teks emoji (atau emoji picker sederhana)
  - `color` → `<input type="color">` native
  - `urutan` → number input (tentukan posisi di filter client)
- Saat kategori baru ditambah → otomatis muncul di filter client (karena fetch dari API)

### Form Infrastruktur

```tsx
// Field order:
// 1. Nama *
// 2. Kategori * (select)
// 3. Alamat
// 4. Koordinat (lat/lng input + tombol "Pilih di Peta" → mini map picker)
// 5. Wilayah (cascade dropdown kdkab → kdkec → kddesa → kdsls)
// 6. Foto (file upload atau URL)
```

---

## Environment Variables

```bash
# .env (server)
DATABASE_URL=postgresql://user:pass@localhost:5432/padang_pariaman
JWT_SECRET=your-secret-key
UPLOAD_DIR=./uploads
PORT=3001

# .env (client)
VITE_API_URL=http://localhost:3001
```

---

## Hal yang JANGAN Dilakukan

- ❌ Jangan expose `/admin` di navbar atau footer client
- ❌ Jangan skip validasi lat/lng saat import (data bisa salah wilayah)
- ❌ Jangan render semua marker sekaligus tanpa filter aktif (performa buruk)
- ❌ Jangan hardcode `kdkab` di banyak tempat — simpan sebagai konstanta `KDKAB_PADANG_PARIAMAN = '1305'`
- ❌ Jangan lupa `fitBounds` saat wilayah di-filter (UX penting)
- ❌ Jangan simpan password admin plaintext — gunakan bcrypt

---

## Konstanta Penting

```typescript
export const KDKAB_PADANG_PARIAMAN = '1305';
export const MAP_CENTER: [number, number] = [-0.5397, 100.1187];
export const MAP_DEFAULT_ZOOM = 11;
export const ADMIN_ROUTE = '/admin';
export const MAX_IMPORT_ROWS = 5000;
```
