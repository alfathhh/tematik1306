# PROMPT.md — Peta Tematik Padang Pariaman

> 📌 **Untuk Junior Developer & AI Assistant**
> Dokumen ini adalah panduan lengkap membangun aplikasi dari nol.
> Ikuti step-by-step secara berurutan. Jangan loncat ke step berikutnya sebelum step saat ini selesai dan berjalan dengan benar.

---

## Gambaran Besar Aplikasi

Kita membangun **aplikasi web peta tematik interaktif** untuk Kabupaten Padang Pariaman, Sumatera Barat.

Aplikasi ini terdiri dari **dua sisi**:

| Sisi | URL | Akses |
|---|---|---|
| **Client** | `/` | Publik, siapa saja bisa buka tanpa login |
| **Admin** | `/admin` | Tersembunyi, tidak ada link dari halaman client |

**Apa yang bisa dilakukan pengguna di halaman Client?**
- Melihat peta interaktif Padang Pariaman
- Melihat titik-titik infrastruktur (restoran, rumah ibadah, dll.) di atas peta
- Memfilter infrastruktur berdasarkan kategori
- Memfilter tampilan peta berdasarkan wilayah (kecamatan → nagari → korong)
- Mencari infrastruktur lewat search bar
- Melihat statistik kependudukan dan infrastruktur

**Apa yang bisa dilakukan Admin?**
- Login ke halaman admin
- Mengelola (tambah/edit/hapus) data infrastruktur
- Mengelola kategori infrastruktur secara dinamis
- Mengelola data statistik
- Import/export data via file Excel

---

## Tech Stack yang Digunakan

Gunakan tech stack berikut. Jangan ganti kecuali ada alasan kuat.

| Bagian | Teknologi | Alasan |
|---|---|---|
| Frontend | **React + Vite + TypeScript** | Modern, cepat, sudah familiar |
| Peta | **Leaflet.js** (via react-leaflet) | Mudah digunakan, dokumentasi lengkap |
| Basemap | OpenStreetMap + Google XYZ Tiles | OSM gratis, Google sebagai opsional |
| State Management | **Zustand** | Sederhana, tidak boilerplate |
| Backend | **Node.js + Express + TypeScript** | Familiar, fleksibel |
| Database | **PostgreSQL** | Robust, support spasial via PostGIS |
| ORM | **Prisma** | Type-safe, mudah migrasi |
| Auth | **JWT** (JSON Web Token) | Standar industri |
| Import/Export | **exceljs** (backend) | Mudah handle xlsx |
| Upload File | **multer** | Middleware upload file untuk Express |

---

## Struktur Folder

```
padang-pariaman-map/
├── client/                        # Frontend React
│   ├── public/
│   │   └── geojson/               # File batas wilayah (statis)
│   │       ├── kabupaten.geojson
│   │       ├── kecamatan.geojson
│   │       ├── nagari.geojson
│   │       └── korong.geojson
│   └── src/
│       ├── components/
│       │   ├── map/               # Komponen peta
│       │   ├── filter/            # Filter kategori & wilayah
│       │   ├── search/            # Search bar
│       │   ├── statistik/         # Panel statistik
│       │   └── admin/             # Komponen khusus admin
│       ├── hooks/                 # Custom React hooks
│       ├── pages/
│       │   ├── ClientMap.tsx      # Halaman utama publik
│       │   └── admin/             # Halaman-halaman admin
│       ├── store/                 # Zustand global state
│       └── lib/
│           ├── api.ts             # Axios instance + interceptors
│           └── mapUtils.ts        # Helper fungsi peta
│
└── server/                        # Backend Express
    └── src/
        ├── routes/                # Endpoint API
        ├── middleware/            # Auth middleware
        ├── prisma/                # Schema database
        └── utils/                 # Helper (excel, upload)
```

---

## Konsep Penting: Kode Wilayah

> ⚠️ **Wajib dipahami sebelum mulai coding.**

Setiap wilayah punya kode unik. Kode ini digunakan sebagai **primary key** dan **relasi antar wilayah**.

| Level | Nama Lokal | Kode | Panjang | Contoh |
|---|---|---|---|---|
| 1 | Kabupaten | `kdkab` | 4 digit | `1305` |
| 2 | Kecamatan | `kdkec` | 6 digit | `130501` |
| 3 | Nagari (Desa) | `kddesa` | 10 digit | `1305010001` |
| 4 | Korong (Dusun) | `kdsls` | 12 digit | `130501000101` |

**Aturan penting:** Kode level bawah selalu dimulai dengan kode level atas.
- `kdkec` (`130501`) dimulai dengan `kdkab` (`1305`)
- `kddesa` (`1305010001`) dimulai dengan `kdkec` (`130501`)
- `kdsls` (`130501000101`) dimulai dengan `kddesa` (`1305010001`)

Manfaatnya: untuk filter semua infrastruktur di suatu kecamatan, cukup:
```sql
WHERE kdkec = '130501'
```

---

## Konsep Penting: Kategori Dinamis

Kategori infrastruktur **tidak di-hardcode** di kode. Kategori disimpan di database dan bisa dikelola admin kapan saja.

Setiap kategori punya:
- `value` — slug unik, huruf kecil + underscore (e.g., `rumah_ibadah`)
- `label` — nama tampil (e.g., `Rumah Ibadah`)
- `icon` — emoji (e.g., `🕌`)
- `color` — warna hex (e.g., `#8B5CF6`)
- `urutan` — posisi di filter client (angka kecil = tampil duluan)

Data awal (seed):
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

## Database Schema

Jalankan SQL ini untuk membuat semua tabel. **Urutan penting** — buat `kategori_infra` dulu.

```sql
-- 1. Kategori (harus dibuat duluan karena direferensi tabel lain)
CREATE TABLE kategori_infra (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value      TEXT UNIQUE NOT NULL,   -- slug unik, e.g. 'restoran'
  label      TEXT NOT NULL,          -- nama tampil, e.g. 'Restoran'
  icon       TEXT,                   -- emoji, e.g. '🍽️'
  color      TEXT,                   -- warna hex, e.g. '#F97316'
  urutan     INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Infrastruktur (titik di peta)
CREATE TABLE infrastruktur (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama       TEXT NOT NULL,
  kategori   TEXT NOT NULL REFERENCES kategori_infra(value),
  alamat     TEXT,
  foto_url   TEXT,
  lat        NUMERIC(10,7) NOT NULL,
  lng        NUMERIC(10,7) NOT NULL,
  kdkab      VARCHAR(4) NOT NULL DEFAULT '1305',
  kdkec      VARCHAR(6),
  kddesa     VARCHAR(10),
  kdsls      VARCHAR(12),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Statistik wilayah
CREATE TABLE statistik (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kdkab      VARCHAR(4) NOT NULL DEFAULT '1305',
  kdkec      VARCHAR(6),
  kddesa     VARCHAR(10),
  kdsls      VARCHAR(12),
  indikator  TEXT NOT NULL,   -- e.g. 'jumlah_penduduk', 'jumlah_sd'
  nilai      NUMERIC NOT NULL,
  satuan     TEXT,            -- e.g. 'jiwa', 'unit', '%'
  tahun      INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Admin users
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,    -- bcrypt hash, JANGAN simpan plaintext
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## API Endpoints

Semua endpoint diawali `/api`. Endpoint dengan label 🔒 butuh JWT token di header `Authorization: Bearer <token>`.

```
# Autentikasi
POST   /api/auth/login              → { token, username }

# Kategori
GET    /api/kategori                → list semua kategori (public)
POST   /api/kategori             🔒 → tambah kategori baru
PUT    /api/kategori/:id         🔒 → edit kategori
DELETE /api/kategori/:id         🔒 → hapus (gagal jika masih ada infra yang pakai)

# Infrastruktur
GET    /api/infrastruktur           → list, query: ?kategori=&kdkec=&kddesa=&kdsls=&search=
POST   /api/infrastruktur        🔒 → tambah titik baru
PUT    /api/infrastruktur/:id    🔒 → edit titik
DELETE /api/infrastruktur/:id    🔒 → hapus titik
POST   /api/infrastruktur/import 🔒 → upload file .xlsx
GET    /api/infrastruktur/export 🔒 → download file .xlsx

# Statistik
GET    /api/statistik               → list, query: ?kdkab=&kdkec=&kddesa=&kdsls=
POST   /api/statistik            🔒 → tambah data
PUT    /api/statistik/:id        🔒 → edit data
DELETE /api/statistik/:id        🔒 → hapus data
POST   /api/statistik/import     🔒 → upload file .xlsx
GET    /api/statistik/export     🔒 → download file .xlsx

# Wilayah (untuk cascade dropdown)
GET    /api/wilayah/kecamatan       → ?kdkab=1305
GET    /api/wilayah/nagari          → ?kdkec=130501
GET    /api/wilayah/korong          → ?kddesa=1305010001
```

---

## Format File Excel Import

### Infrastruktur

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nama` | teks | ✅ | Nama infrastruktur |
| `kategori` | teks | ✅ | Harus sesuai `value` dari tabel kategori |
| `alamat` | teks | | Alamat lengkap |
| `lat` | angka | ✅ | Latitude (~-0.5 untuk Padang Pariaman) |
| `lng` | angka | ✅ | Longitude (~100.1 untuk Padang Pariaman) |
| `kdkab` | teks | ✅ | Selalu `1305` |
| `kdkec` | teks | ✅ | 6 digit |
| `kddesa` | teks | | 10 digit |
| `kdsls` | teks | | 12 digit |
| `foto_url` | teks | | URL foto (opsional) |

### Statistik

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `kdkab` | teks | ✅ | Selalu `1305` |
| `kdkec` | teks | | Kosongkan untuk level kabupaten |
| `kddesa` | teks | | Kosongkan untuk level kecamatan |
| `kdsls` | teks | | Kosongkan untuk level nagari |
| `indikator` | teks | ✅ | e.g. `jumlah_penduduk` |
| `nilai` | angka | ✅ | |
| `satuan` | teks | | e.g. `jiwa`, `unit` |
| `tahun` | angka | ✅ | e.g. `2024` |

---

## Fitur Detail: Halaman Client

### Peta Utama
- Center awal: `-0.5397, 100.1187`, zoom 11
- Basemap default: OpenStreetMap
- Toggle ke Google Maps: `https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}`

### Marker Infrastruktur
- Default: **tidak ada marker tampil** (harus diaktifkan via filter)
- Klik marker → popup: foto, nama (bold), badge kategori, alamat
- Jika marker > 100, gunakan clustering (react-leaflet-cluster)

### Filter Infrastruktur (Sidebar)
- Checkbox list dari API, semua mati secara default
- Tampilkan jumlah titik: `Restoran (24)`
- Marker tampil hanya jika: checkbox aktif AND ada di wilayah yang dipilih

### Filter Wilayah (Cascade Dropdown)
```
Kabupaten: [Padang Pariaman]  ← fixed
Kecamatan: [Semua ▾]
Nagari:    [Semua ▾]
Korong:    [Semua ▾]
```
- Pilih kecamatan → reset nagari & korong
- Pilih nagari → reset korong
- Saat dipilih → peta zoom ke batas wilayah tersebut

### Search
- Debounce 300ms → call `GET /api/infrastruktur?search=`
- Klik hasil → `map.flyTo([lat, lng], 16)` + buka popup

### Panel Statistik
- Card grid angka kunci + bar chart + donut chart
- Data berubah sesuai filter wilayah aktif

---

## Fitur Detail: Halaman Admin

> Diakses di `/admin`. Tidak ada link dari halaman client.

### Login
- Submit → `POST /api/auth/login` → simpan JWT ke localStorage key `admin_token`
- Semua halaman admin: cek token, jika tidak ada → redirect ke `/admin/login`

### Manajemen Kategori (`/admin/kategori`)
- Tabel: icon, label, value, warna, urutan, jumlah infra, aksi
- Form: label → auto-generate slug, emoji input, color picker native, urutan
- Hapus: gagal jika masih ada infra yang pakai kategori tersebut

### Manajemen Infrastruktur (`/admin/infrastruktur`)
- Tabel paginated (20/hal) + search + filter kategori
- Form: nama, kategori (dropdown), alamat, koordinat (+ map picker), wilayah cascade, foto
- Import: preview 5 baris → validasi → bulk insert → tampilkan hasil
- Export: download xlsx semua atau filtered

### Manajemen Statistik (`/admin/statistik`)
- Tabel + form (pilih wilayah cascade, indikator, nilai, satuan, tahun)
- Import/export xlsx

---

## Langkah Pengerjaan Step-by-Step

> Ikuti urutan ini. Setiap step harus **selesai dan berjalan** sebelum lanjut ke step berikutnya.

---

### STEP 1 — Setup Project

```bash
# Buat folder utama
mkdir padang-pariaman-map && cd padang-pariaman-map

# Setup backend
mkdir server && cd server
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken multer exceljs prisma @prisma/client
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node nodemon
npx prisma init
cd ..

# Setup frontend
npm create vite@latest client -- --template react-ts
cd client && npm install
npm install axios zustand react-router-dom react-leaflet leaflet @types/leaflet react-leaflet-cluster recharts
```

✅ **Cek:** Backend jalan di port 3001, frontend jalan di port 5173.

---

### STEP 2 — Database & Schema

1. Edit `server/prisma/schema.prisma` dengan semua model
2. Set `DATABASE_URL` di `server/.env`
3. Jalankan: `npx prisma migrate dev --name init`
4. Seed data kategori awal: `npx prisma db seed`

✅ **Cek:** Buka `npx prisma studio` — tabel terbuat, kategori sudah ada.

---

### STEP 3 — Backend Auth

1. Buat `server/src/middleware/auth.ts` — verifikasi JWT
2. Buat `server/src/routes/auth.ts` — `POST /api/auth/login`

✅ **Cek:** `POST /api/auth/login` dengan kredensial benar → return token JWT.

---

### STEP 4 — Backend API Kategori

Buat `server/src/routes/kategori.ts` dengan semua endpoint (GET public, POST/PUT/DELETE protected).

✅ **Cek:** `GET /api/kategori` return array kategori dengan data seed.

---

### STEP 5 — Backend API Infrastruktur

Buat `server/src/routes/infrastruktur.ts` dengan semua endpoint termasuk import dan export.

✅ **Cek:** `GET /api/infrastruktur` return array (boleh kosong). Import xlsx berfungsi.

---

### STEP 6 — Backend API Statistik & Wilayah

1. Buat `server/src/routes/statistik.ts` — CRUD + import + export
2. Buat `server/src/routes/wilayah.ts` — cascade dropdown data

✅ **Cek:** Semua endpoint merespons dengan benar.

---

### STEP 7 — Frontend Setup & Routing

1. Setup React Router di `src/App.tsx`
2. Buat `src/lib/api.ts` — axios instance + JWT interceptor
3. Buat route guard: redirect ke `/admin/login` jika tidak ada token

✅ **Cek:** `/admin` redirect ke `/admin/login`. Routing berfungsi.

---

### STEP 8 — Frontend Halaman Login Admin

Buat form login → call API → simpan token → redirect ke dashboard.

✅ **Cek:** Bisa login dan masuk ke dashboard admin.

---

### STEP 9 — Frontend Peta Dasar

1. Import CSS leaflet di `index.html`
2. Buat `MapContainer` dengan center Padang Pariaman + tile OSM
3. Tambah toggle basemap ke Google

✅ **Cek:** Peta muncul, toggle basemap berfungsi.

---

### STEP 10 — Frontend Layer GeoJSON Wilayah

1. Taruh file GeoJSON di `client/public/geojson/`
2. Load dan tampilkan sebagai poligon dengan warna berbeda per level

✅ **Cek:** Batas wilayah muncul di atas peta.

---

### STEP 11 — Frontend Filter Wilayah

1. Buat `FilterWilayah` dengan 4 dropdown cascade
2. Saat pilih kecamatan → fetch nagari → reset level bawah
3. Saat wilayah dipilih → `map.fitBounds()` ke wilayah tersebut

✅ **Cek:** Dropdown cascade berfungsi, peta zoom ke wilayah dipilih.

---

### STEP 12 — Frontend Marker + Filter Kategori

1. Fetch kategori dari API saat app load → simpan ke Zustand
2. Buat `FilterKategori` dengan checkbox (default mati)
3. Saat checkbox aktif → fetch infra → tampilkan marker
4. Klik marker → popup dengan foto, nama, kategori, alamat
5. Gabungkan dengan filter wilayah

✅ **Cek:** Marker muncul saat checkbox aktif, popup berfungsi, filter wilayah mempengaruhi marker.

---

### STEP 13 — Frontend Search

Buat `SearchBar` dengan debounce → dropdown hasil → klik flyTo + buka popup.

✅ **Cek:** Search berfungsi, klik hasil fly to lokasi.

---

### STEP 14 — Frontend Panel Statistik

Buat panel statistik dengan card + chart yang berubah sesuai filter wilayah.

✅ **Cek:** Data statistik muncul dan update saat filter wilayah berubah.

---

### STEP 15 — Frontend Halaman Admin (CRUD)

1. Buat layout admin dengan sidebar navigasi
2. Halaman **Kategori** — tabel + form + konfirmasi hapus
3. Halaman **Infrastruktur** — tabel + form (dengan map picker) + import/export
4. Halaman **Statistik** — tabel + form + import/export

✅ **Cek:** Semua CRUD berfungsi dari halaman admin.

---

### STEP 16 — Polish & Deploy

1. Pastikan semua halaman mobile responsive
2. Tambahkan loading state, error state, dan empty state
3. Test import Excel dengan file sample
4. Build: `npm run build`
5. Deploy backend + serve frontend sebagai static files

✅ **Cek:** Aplikasi berjalan sempurna di semua ukuran layar.

---

## Catatan Tambahan

- **Foto infrastruktur:** Simpan di Cloudinary (gratis) atau folder `/uploads` lokal
- **Google Maps tile:** Gunakan OSM sebagai default; Google untuk opsional toggle
- **Performa marker banyak:** Aktifkan clustering jika data > 500 titik
- **Password admin:** Gunakan bcrypt cost 10. Jangan pernah simpan plaintext
- **Konstanta penting:** `KDKAB = '1305'`, `MAP_CENTER = [-0.5397, 100.1187]`
