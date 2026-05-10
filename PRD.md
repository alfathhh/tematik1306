# PRD — Peta Tematik Interaktif Kabupaten Padang Pariaman

> **Versi:** 1.0.0
> **Bahasa:** Indonesia
> **Target Pembaca:** Junior Developer, AI Code Assistant
> **Tujuan Dokumen:** Menjadi satu-satunya referensi teknis yang cukup untuk membangun aplikasi ini dari nol tanpa perlu menebak-nebak.

---

## 1. Ringkasan Produk

**Nama Aplikasi:** Peta Tematik Interaktif Kabupaten Padang Pariaman

**Deskripsi Singkat:**
Aplikasi web yang menampilkan peta interaktif Kabupaten Padang Pariaman, Sumatera Barat. Pengguna publik dapat melihat sebaran infrastruktur (restoran, pasar, rumah ibadah, dll.) beserta data statistik wilayah secara visual. Administrator dapat mengelola data melalui halaman tersembunyi.

**Dua Sisi Aplikasi:**

| Sisi | URL | Akses | Deskripsi |
|------|-----|-------|-----------|
| **Client** | `/` | Publik (tanpa login) | Peta interaktif, filter, search, statistik |
| **Admin** | `/admin` | Privat (JWT login) | CRUD data infrastruktur, statistik, kategori |

> ⚠️ **PENTING:** URL `/admin` tidak boleh muncul di navbar, footer, atau link manapun di halaman client. Admin hanya bisa diakses jika tahu URL-nya secara langsung.

---

## 2. Tujuan & Latar Belakang

### Latar Belakang
Kabupaten Padang Pariaman membutuhkan media visualisasi data spasial yang mudah diakses oleh masyarakat umum. Data infrastruktur (fasilitas publik, layanan kesehatan, pasar, dll.) dan statistik wilayah (per kecamatan/nagari/korong) sebelumnya tersebar di dokumen spreadsheet yang tidak interaktif.

### Tujuan
1. **Visualisasi Spasial** — Menampilkan sebaran infrastruktur di atas peta interaktif dengan marker dan clustering.
2. **Filter & Search** — Memudahkan pengguna menemukan infrastruktur berdasarkan kategori dan wilayah administratif.
3. **Statistik Wilayah** — Menampilkan data statistik per wilayah (kecamatan, nagari, korong) dalam bentuk grafik.
4. **Manajemen Data** — Memberikan antarmuka admin untuk CRUD data + import/export Excel massal.

### Batasan Ruang Lingkup
- Hanya mencakup wilayah Kabupaten Padang Pariaman (kode `1305`).
- Tidak ada fitur komentar/ulasan dari pengguna publik.
- Tidak ada notifikasi real-time.
- Autentikasi hanya untuk admin (single user atau multi user, tapi tidak ada registrasi publik).

---

## 3. Pengguna (User Roles)

### 3.1 Pengguna Publik (Visitor)
- Tidak perlu login.
- Dapat melihat peta, marker infrastruktur, statistik wilayah.
- Dapat menggunakan filter kategori dan filter wilayah.
- Dapat melakukan pencarian infrastruktur.

### 3.2 Administrator
- Login dengan username + password (disimpan di tabel `admin_users`, password di-hash dengan bcrypt).
- Mengakses halaman admin melalui URL `/admin` (tidak dipublikasikan).
- Dapat melakukan CRUD: Kategori, Infrastruktur, Statistik.
- Dapat import data dari file Excel (`.xlsx`) dan export data ke Excel.
- Sesi menggunakan JWT yang disimpan di `localStorage` dengan key `admin_token`.

---

## 4. Tech Stack & Alasan Pemilihan

### Frontend

| Teknologi | Versi | Alasan Pemilihan |
|-----------|-------|-----------------|
| **React** | 18+ | Library UI paling populer, ekosistem luas, cocok untuk komponen peta interaktif |
| **Vite** | 5+ | Build tool cepat, HMR instan, cocok untuk development |
| **TypeScript** | 5+ | Type safety mencegah bug runtime, autocomplete lebih baik |
| **Tailwind CSS** | 3+ | Utility-first CSS framework, styling cepat tanpa custom CSS, konsisten di seluruh komponen |
| **Leaflet.js** via `react-leaflet` | 4+ | Library peta open-source terbaik untuk web, ringan, banyak plugin |
| **Zustand** | 4+ | State management ringan tanpa boilerplate Redux, cukup untuk skala aplikasi ini |

> ⚠️ **CSS:** Seluruh styling menggunakan **Tailwind CSS utility classes**. Hindari penulisan custom CSS kecuali untuk kebutuhan spesifik Leaflet (marker icon, popup) yang tidak bisa di-handle Tailwind.

### Backend

| Teknologi | Versi | Alasan Pemilihan |
|-----------|-------|-----------------|
| **Node.js** | 20+ | Runtime JS di server, konsisten dengan frontend (satu bahasa) |
| **Express** | 4+ | Framework minimal dan fleksibel, cocok untuk REST API |
| **TypeScript** | 5+ | Konsistensi type dengan frontend |
| **PostgreSQL** | 15+ | Database relasional andal, mendukung query geospasial jika dibutuhkan di masa depan |
| **Prisma** | 5+ | ORM modern dengan type-safety, migrasi mudah, query builder intuitif |
| **JWT** | — | Stateless authentication, cocok untuk SPA + REST API |
| **exceljs** | — | Library baca/tulis Excel (.xlsx) terlengkap untuk Node.js |
| **multer** | — | Middleware upload file untuk Express |
| **bcrypt** | — | Hashing password yang aman dengan salt otomatis |

### Basemap

| Basemap | Sumber | Default |
|---------|--------|---------|
| **OpenStreetMap (OSM)** | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | ✅ Ya |
| **Google Maps (Satellite/Hybrid)** | XYZ Tiles Google | ❌ Toggle |

---


## 5. Arsitektur Sistem (Gambaran Besar)

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────────────┐  │
│  │   CLIENT (Publik)   │   │      ADMIN (Tersembunyi)    │  │
│  │   Route: /          │   │      Route: /admin/*        │  │
│  │                     │   │                             │  │
│  │  - Peta Interaktif  │   │  - Login                    │  │
│  │  - Filter           │   │  - Dashboard                │  │
│  │  - Search           │   │  - CRUD Infrastruktur       │  │
│  │  - Statistik        │   │  - CRUD Statistik           │  │
│  └─────────────────────┘   │  - CRUD Kategori            │  │
│                             │  - Import/Export Excel      │  │
│                             └─────────────────────────────┘  │
│                                                             │
│         React + Vite + TypeScript + react-leaflet           │
│         State: Zustand | HTTP: axios/fetch                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST API (JSON)
                            │ Authorization: Bearer <JWT>
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    BACKEND (Express + TypeScript)            │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  /auth   │ │/kategori │ │/infra-   │ │  /statistik  │   │
│  │          │ │          │ │struktur  │ │              │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                             │
│  ┌────────────────────┐   ┌───────────────────────────────┐  │
│  │     /wilayah       │   │    JWT Middleware (auth.ts)    │  │
│  │  (kecamatan,nagari,│   │    Validasi token sebelum      │  │
│  │   korong)          │   │    endpoint protected          │  │
│  └────────────────────┘   └───────────────────────────────┘  │
│                                                             │
│              Prisma ORM (query builder + migration)         │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                             │
│   admin_users | kategori_infra | infrastruktur | statistik  │
└─────────────────────────────────────────────────────────────┘

                    GeoJSON Files (Static)
┌─────────────────────────────────────────────────────────────┐
│  client/public/geojson/                                     │
│  ├── kabupaten.geojson                                      │
│  ├── kecamatan.geojson                                      │
│  ├── nagari.geojson                                         │
│  └── korong.geojson                                         │
│                                                             │
│  (File statis, di-load langsung oleh browser, BUKAN via API)│
└─────────────────────────────────────────────────────────────┘
```

**Catatan Arsitektur Penting:**
- File GeoJSON (batas wilayah) adalah file **statis** yang disimpan di `client/public/geojson/` dan di-fetch langsung oleh browser. Tidak melalui backend.
- Data infrastruktur dan statistik disimpan di **database** dan diakses melalui API.
- Kode wilayah (`kdkab`, `kdkec`, `kddesa`, `kdsls`) digunakan sebagai "foreign key logis" antara data di DB dan batas wilayah di GeoJSON.

---

## 6. Struktur Folder

```
padang-pariaman-map/
│
├── client/                          # Frontend React + Vite
│   ├── public/
│   │   └── geojson/                 # File batas wilayah (STATIS)
│   │       ├── kabupaten.geojson    # Batas Kabupaten Padang Pariaman
│   │       ├── kecamatan.geojson    # Batas semua kecamatan
│   │       ├── nagari.geojson       # Batas semua nagari (desa)
│   │       └── korong.geojson       # Batas semua korong (dusun)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/                 # Komponen terkait peta
│   │   │   │   ├── MapContainer.tsx     # Container utama peta Leaflet
│   │   │   │   ├── MarkerLayer.tsx      # Layer marker infrastruktur
│   │   │   │   ├── ClusterLayer.tsx     # Marker clustering (> 100 marker)
│   │   │   │   ├── WilayahLayer.tsx     # Layer polygon batas wilayah
│   │   │   │   ├── BasemapToggle.tsx    # Tombol toggle OSM ↔ Google
│   │   │   │   └── InfraPopup.tsx       # Popup konten marker infrastruktur
│   │   │   │
│   │   │   ├── filter/              # Komponen filter
│   │   │   │   ├── FilterKategori.tsx   # Checkbox list kategori
│   │   │   │   └── FilterWilayah.tsx    # Dropdown cascade wilayah
│   │   │   │
│   │   │   ├── search/              # Komponen pencarian
│   │   │   │   └── SearchBar.tsx        # Input search dengan debounce
│   │   │   │
│   │   │   ├── statistik/           # Komponen panel statistik
│   │   │   │   ├── StatistikPanel.tsx   # Container panel statistik
│   │   │   │   ├── StatistikCard.tsx    # Card angka statistik
│   │   │   │   ├── BarChart.tsx         # Bar chart statistik
│   │   │   │   └── DonutChart.tsx       # Donut chart statistik
│   │   │   │
│   │   │   └── admin/               # Komponen khusus admin
│   │   │       ├── AdminTable.tsx       # Tabel generik dengan pagination
│   │   │       ├── InfraForm.tsx        # Form tambah/edit infrastruktur
│   │   │       ├── StatistikForm.tsx    # Form tambah/edit statistik
│   │   │       ├── KategoriForm.tsx     # Form tambah/edit kategori
│   │   │       └── MapPicker.tsx        # Mini-map untuk pilih koordinat
│   │   │
│   │   ├── hooks/
│   │   │   ├── useInfrastruktur.ts  # Hook fetch data infrastruktur
│   │   │   ├── useStatistik.ts      # Hook fetch data statistik
│   │   │   ├── useWilayah.ts        # Hook fetch data wilayah (cascade)
│   │   │   └── useDebounce.ts       # Hook debounce untuk search
│   │   │
│   │   ├── pages/
│   │   │   ├── ClientMap.tsx        # Halaman utama publik (peta)
│   │   │   └── admin/
│   │   │       ├── Login.tsx        # Halaman login admin
│   │   │       ├── Dashboard.tsx    # Dashboard admin (ringkasan)
│   │   │       ├── Infrastruktur.tsx # Halaman kelola infrastruktur
│   │   │       ├── Statistik.tsx    # Halaman kelola statistik
│   │   │       └── Kategori.tsx     # Halaman kelola kategori
│   │   │
│   │   ├── store/
│   │   │   ├── mapStore.ts          # State peta (center, zoom, filter aktif)
│   │   │   ├── filterStore.ts       # State filter kategori & wilayah
│   │   │   └── authStore.ts         # State autentikasi admin (token)
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios instance + interceptor JWT
│   │   │   └── mapUtils.ts          # Fungsi utilitas peta (fitBounds, dll.)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces & types global
│   │   │
│   │   ├── App.tsx                  # Root component + React Router setup
│   │   └── main.tsx                 # Entry point
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── server/                          # Backend Express + TypeScript
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts              # POST /api/auth/login
    │   │   ├── infrastruktur.ts     # CRUD + import + export infrastruktur
    │   │   ├── statistik.ts         # CRUD + import + export statistik
    │   │   ├── wilayah.ts           # GET kecamatan, nagari, korong
    │   │   └── kategori.ts          # CRUD kategori infrastruktur
    │   │
    │   ├── middleware/
    │   │   └── auth.ts              # Middleware verifikasi JWT
    │   │
    │   ├── prisma/
    │   │   ├── schema.prisma        # Definisi model Prisma
    │   │   └── seed.ts              # Script seed data awal
    │   │
    │   ├── utils/
    │   │   ├── excel.ts             # Fungsi baca/tulis Excel dengan exceljs
    │   │   └── upload.ts            # Konfigurasi multer untuk upload file
    │   │
    │   └── index.ts                 # Entry point Express server
    │
    ├── .env                         # Environment variables (JANGAN di-commit)
    ├── tsconfig.json
    └── package.json
```

---


## 7. Database

### 7.1 Schema Tabel (SQL Lengkap)

```sql
-- ============================================================
-- TABEL 1: admin_users
-- Menyimpan akun administrator aplikasi
-- ============================================================
CREATE TABLE admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,       -- bcrypt hash, cost factor 10
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABEL 2: kategori_infra
-- Menyimpan kategori infrastruktur secara dinamis
-- Contoh: restoran, rumah_ibadah, pasar, dll.
-- ============================================================
CREATE TABLE kategori_infra (
  id         SERIAL PRIMARY KEY,
  value      VARCHAR(50)  NOT NULL UNIQUE,   -- slug (huruf kecil, underscore)
  label      VARCHAR(100) NOT NULL,          -- nama tampil (contoh: "Rumah Ibadah")
  icon       VARCHAR(10)  NOT NULL,          -- emoji (contoh: "🕌")
  color      VARCHAR(7)   NOT NULL,          -- hex color (contoh: "#FF5733")
  urutan     INTEGER      NOT NULL DEFAULT 0, -- urutan tampil di filter
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABEL 3: infrastruktur
-- Menyimpan data titik infrastruktur dengan koordinat dan kode wilayah
-- ============================================================
CREATE TABLE infrastruktur (
  id         SERIAL PRIMARY KEY,
  nama       VARCHAR(255) NOT NULL,
  kategori   VARCHAR(50)  NOT NULL REFERENCES kategori_infra(value) ON DELETE RESTRICT,
  alamat     TEXT,
  foto_url   TEXT,                           -- URL foto (bisa null)
  lat        DOUBLE PRECISION NOT NULL,      -- Latitude (contoh: -0.5397)
  lng        DOUBLE PRECISION NOT NULL,      -- Longitude (contoh: 100.1187)
  kdkab      CHAR(4)  NOT NULL,              -- Kode kabupaten (selalu "1305")
  kdkec      CHAR(6)  NOT NULL,              -- Kode kecamatan (contoh: "130501")
  kddesa     CHAR(10) NOT NULL,              -- Kode nagari/desa (contoh: "1305010001")
  kdsls      CHAR(12),                       -- Kode korong/dusun (bisa null)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABEL 4: statistik
-- Menyimpan data statistik per indikator dan per wilayah
-- Satu baris = satu indikator di satu wilayah untuk satu tahun
-- ============================================================
CREATE TABLE statistik (
  id         SERIAL PRIMARY KEY,
  kdkab      CHAR(4)  NOT NULL,
  kdkec      CHAR(6),                        -- NULL jika statistik level kabupaten
  kddesa     CHAR(10),                       -- NULL jika statistik level kecamatan ke atas
  kdsls      CHAR(12),                       -- NULL jika statistik level nagari ke atas
  indikator  VARCHAR(255) NOT NULL,          -- nama indikator (contoh: "Jumlah Penduduk")
  nilai      DOUBLE PRECISION NOT NULL,      -- nilai numerik
  satuan     VARCHAR(50),                    -- satuan (contoh: "jiwa", "km²")
  tahun      INTEGER NOT NULL,               -- tahun data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Prisma Schema (`server/src/prisma/schema.prisma`):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id           Int      @id @default(autoincrement())
  username     String   @unique @db.VarChar(100)
  passwordHash String   @db.VarChar(255)
  createdAt    DateTime @default(now())

  @@map("admin_users")
}

model KategoriInfra {
  id        Int      @id @default(autoincrement())
  value     String   @unique @db.VarChar(50)
  label     String   @db.VarChar(100)
  icon      String   @db.VarChar(10)
  color     String   @db.VarChar(7)
  urutan    Int      @default(0)
  createdAt DateTime @default(now())

  infrastruktur Infrastruktur[]

  @@map("kategori_infra")
}

model Infrastruktur {
  id        Int      @id @default(autoincrement())
  nama      String   @db.VarChar(255)
  kategori  String   @db.VarChar(50)
  alamat    String?  @db.Text
  fotoUrl   String?  @db.Text
  lat       Float
  lng       Float
  kdkab     String   @db.Char(4)
  kdkec     String   @db.Char(6)
  kddesa    String   @db.Char(10)
  kdsls     String?  @db.Char(12)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  kategoriRef KategoriInfra @relation(fields: [kategori], references: [value])

  @@map("infrastruktur")
}

model Statistik {
  id        Int      @id @default(autoincrement())
  kdkab     String   @db.Char(4)
  kdkec     String?  @db.Char(6)
  kddesa    String?  @db.Char(10)
  kdsls     String?  @db.Char(12)
  indikator String   @db.VarChar(255)
  nilai     Float
  satuan    String?  @db.VarChar(50)
  tahun     Int
  createdAt DateTime @default(now())

  @@map("statistik")
}
```

---

### 7.2 Konsep Kode Wilayah (PENTING — Wajib Dipahami)

Kabupaten Padang Pariaman menggunakan sistem hierarki wilayah administratif dengan **kode numerik berjenjang**. Setiap level wilayah memiliki kode yang merupakan **ekstensi dari kode level di atasnya**.

#### Hierarki Wilayah

```
Provinsi Sumatera Barat (13)
└── Kabupaten Padang Pariaman (1305)        ← 4 digit (kdkab)
    └── Kecamatan (130501, 130502, ...)      ← 6 digit (kdkec)
        └── Nagari/Desa (1305010001, ...)    ← 10 digit (kddesa)
            └── Korong/Dusun (130501000101, ...)  ← 12 digit (kdsls)
```

#### Tabel Kode Wilayah

| Level | Field | Panjang | Contoh | Keterangan |
|-------|-------|---------|--------|------------|
| Kabupaten | `kdkab` | 4 karakter | `1305` | Selalu tetap untuk app ini |
| Kecamatan | `kdkec` | 6 karakter | `130501` | 2 digit terakhir = kode kecamatan |
| Nagari (Desa) | `kddesa` | 10 karakter | `1305010001` | 4 digit terakhir = kode nagari |
| Korong (Dusun) | `kdsls` | 12 karakter | `130501000101` | 2 digit terakhir = kode korong |

#### Aturan Kode Wilayah

**ATURAN WAJIB:** Kode level bawah **selalu dimulai dengan** kode level atasnya.

```
kdkec  LIKE kdkab  || '%'      → "130501" starts with "1305"
kddesa LIKE kdkec  || '%'      → "1305010001" starts with "130501"
kdsls  LIKE kddesa || '%'      → "130501000101" starts with "1305010001"
```

**Cara menggunakannya untuk filter:**

```typescript
// Validasi: apakah sebuah infrastruktur ada di kecamatan tertentu?
const diKecamatan = infra.kdkec === selectedKdkec;

// Validasi: apakah kddesa termasuk dalam kecamatan ini?
const valid = kddesa.startsWith(kdkec); // "1305010001".startsWith("130501") → true

// Query Prisma: cari semua infra di kecamatan 130501
const infra = await prisma.infrastruktur.findMany({
  where: { kdkec: "130501" }
});

// Query Prisma: cari semua infra di nagari 1305010001
const infra = await prisma.infrastruktur.findMany({
  where: { kddesa: "1305010001" }
});
```

#### Mengapa Kode Wilayah Disimpan di Tabel Infrastruktur?

Karena kode wilayah adalah **atribut lokasi** dari setiap infrastruktur. Dengan menyimpan `kdkab`, `kdkec`, `kddesa`, `kdsls` langsung di tabel `infrastruktur`, kita bisa:
1. Filter data dengan query SQL sederhana (tanpa JOIN).
2. Menghitung jumlah infra per wilayah dengan `GROUP BY`.
3. Menghubungkan data ke GeoJSON untuk highlight wilayah di peta.

---

### 7.3 Kategori Dinamis (PENTING)

Kategori infrastruktur **tidak di-hardcode** di frontend. Kategori diambil dari database (`GET /api/kategori`) setiap kali halaman dimuat.

**Mengapa dinamis?**
- Admin bisa menambah kategori baru (misal: "Hotel", "Sekolah") tanpa perlu deploy ulang.
- Icon, warna, dan label bisa diubah langsung dari panel admin.

**Struktur satu kategori:**

```typescript
interface KategoriInfra {
  id: number;
  value: string;    // "restoran" — digunakan sebagai FK di tabel infrastruktur
  label: string;    // "Restoran" — ditampilkan di UI
  icon: string;     // "🍽️" — ditampilkan di marker dan filter
  color: string;    // "#FF5733" — warna marker di peta
  urutan: number;   // 1, 2, 3... — urutan tampil di daftar filter
}
```

**Aturan hapus kategori:**
- Kategori **tidak boleh dihapus** jika masih ada infrastruktur yang menggunakannya.
- Backend mengembalikan error 400 jika mencoba menghapus kategori yang masih dipakai.
- Di database, ini dijamin oleh `ON DELETE RESTRICT` pada FK di tabel `infrastruktur`.

---

### 7.4 Seed Data Awal

```typescript
// server/src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash },
  });

  // Seed kategori infrastruktur awal
  const kategoriAwal = [
    { value: 'restoran',      label: 'Restoran',      icon: '🍽️', color: '#FF5733', urutan: 1 },
    { value: 'rumah_ibadah',  label: 'Rumah Ibadah',  icon: '🕌', color: '#3D9970', urutan: 2 },
    { value: 'pasar',         label: 'Pasar',         icon: '🏪', color: '#FF851B', urutan: 3 },
    { value: 'toko',          label: 'Toko',          icon: '🛒', color: '#0074D9', urutan: 4 },
    { value: 'kesehatan',     label: 'Kesehatan',     icon: '🏥', color: '#E74C3C', urutan: 5 },
    { value: 'lainnya',       label: 'Lainnya',       icon: '📍', color: '#7F8C8D', urutan: 6 },
  ];

  for (const kat of kategoriAwal) {
    await prisma.kategoriInfra.upsert({
      where: { value: kat.value },
      update: {},
      create: kat,
    });
  }

  console.log('Seed selesai!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---


## 8. API Endpoints (Referensi Lengkap)

### Konvensi API
- Base URL: `http://localhost:3000/api` (development)
- Format request/response: `application/json`
- Auth: `Authorization: Bearer <JWT_TOKEN>` (untuk endpoint protected)
- Error format: `{ "error": "pesan error" }`
- Success format: `{ "data": ..., "message": "..." }`

### 8.1 Auth

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `POST` | `/api/auth/login` | ❌ Tidak | Login admin, kembalikan JWT |

**Request `POST /api/auth/login`:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "admin" }
}
```
**Response 401:**
```json
{ "error": "Username atau password salah" }
```

---

### 8.2 Kategori

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/api/kategori` | ❌ Tidak | Ambil semua kategori (publik, untuk filter & marker) |
| `POST` | `/api/kategori` | ✅ JWT | Tambah kategori baru |
| `PUT` | `/api/kategori/:id` | ✅ JWT | Edit kategori |
| `DELETE` | `/api/kategori/:id` | ✅ JWT | Hapus kategori (gagal jika masih dipakai) |

**Response `GET /api/kategori`:**
```json
[
  { "id": 1, "value": "restoran", "label": "Restoran", "icon": "🍽️", "color": "#FF5733", "urutan": 1 },
  { "id": 2, "value": "rumah_ibadah", "label": "Rumah Ibadah", "icon": "🕌", "color": "#3D9970", "urutan": 2 }
]
```

**Request `POST /api/kategori`:**
```json
{
  "value": "sekolah",
  "label": "Sekolah",
  "icon": "🏫",
  "color": "#9B59B6",
  "urutan": 7
}
```

**Response `DELETE /api/kategori/:id` (jika masih dipakai):**
```json
{ "error": "Kategori masih digunakan oleh 12 infrastruktur. Hapus infrastruktur terlebih dahulu." }
```

---

### 8.3 Infrastruktur

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/api/infrastruktur` | ❌ Tidak | Ambil daftar infrastruktur (dengan filter) |
| `GET` | `/api/infrastruktur/:id` | ❌ Tidak | Ambil detail satu infrastruktur |
| `POST` | `/api/infrastruktur` | ✅ JWT | Tambah infrastruktur baru |
| `PUT` | `/api/infrastruktur/:id` | ✅ JWT | Edit infrastruktur |
| `DELETE` | `/api/infrastruktur/:id` | ✅ JWT | Hapus infrastruktur |
| `POST` | `/api/infrastruktur/import` | ✅ JWT | Import dari file Excel (.xlsx) |
| `GET` | `/api/infrastruktur/export` | ✅ JWT | Export ke file Excel (.xlsx) |
| `POST` | `/api/upload/foto` | ✅ JWT | Upload foto infrastruktur (jpg/png/webp, maks 5MB) → kembalikan `fotoUrl` |
| `DELETE` | `/api/upload/foto/:filename` | ✅ JWT | Hapus foto dari server |

**Query params `GET /api/infrastruktur`:**

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `kategori` | string | ❌ | Filter by kategori value (bisa multiple, pisahkan koma) |
| `kdkab` | string | ❌ | Filter by kode kabupaten |
| `kdkec` | string | ❌ | Filter by kode kecamatan |
| `kddesa` | string | ❌ | Filter by kode nagari |
| `kdsls` | string | ❌ | Filter by kode korong |
| `search` | string | ❌ | Cari by nama (ILIKE) |
| `page` | number | ❌ | Halaman (default: 1, untuk admin) |
| `limit` | number | ❌ | Jumlah per halaman (default: 20, untuk admin) |

**Response `GET /api/infrastruktur`:**
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Rumah Makan Padang Sejati",
      "kategori": "restoran",
      "alamat": "Jl. Raya Padang Pariaman No. 5",
      "fotoUrl": "https://...",
      "lat": -0.5397,
      "lng": 100.1187,
      "kdkab": "1305",
      "kdkec": "130501",
      "kddesa": "1305010001",
      "kdsls": "130501000101",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

**Request `POST /api/infrastruktur`:**
```json
{
  "nama": "Puskesmas Patamuan",
  "kategori": "kesehatan",
  "alamat": "Jl. Kesehatan No. 1, Patamuan",
  "fotoUrl": "https://example.com/foto.jpg",
  "lat": -0.55,
  "lng": 100.12,
  "kdkab": "1305",
  "kdkec": "130502",
  "kddesa": "1305020001",
  "kdsls": null
}
```

---

### 8.4 Statistik

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/api/statistik` | ❌ Tidak | Ambil data statistik (dengan filter wilayah/tahun) |
| `POST` | `/api/statistik` | ✅ JWT | Tambah data statistik |
| `PUT` | `/api/statistik/:id` | ✅ JWT | Edit data statistik |
| `DELETE` | `/api/statistik/:id` | ✅ JWT | Hapus data statistik |
| `POST` | `/api/statistik/import` | ✅ JWT | Import dari Excel |
| `GET` | `/api/statistik/export` | ✅ JWT | Export ke Excel |

**Query params `GET /api/statistik`:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `kdkab` | string | Filter by kabupaten |
| `kdkec` | string | Filter by kecamatan |
| `kddesa` | string | Filter by nagari |
| `kdsls` | string | Filter by korong |
| `tahun` | number | Filter by tahun |
| `indikator` | string | Filter by nama indikator |

---

### 8.5 Wilayah

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/api/wilayah/kecamatan` | ❌ Tidak | Daftar kecamatan di kabupaten |
| `GET` | `/api/wilayah/nagari` | ❌ Tidak | Daftar nagari di kecamatan |
| `GET` | `/api/wilayah/korong` | ❌ Tidak | Daftar korong di nagari |

**Query params:**

```
GET /api/wilayah/kecamatan?kdkab=1305
GET /api/wilayah/nagari?kdkec=130501
GET /api/wilayah/korong?kddesa=1305010001
```

**Catatan:** Data wilayah ini diambil dari **database** (distinct kode wilayah yang ada di tabel infrastruktur/statistik) atau dari tabel referensi wilayah tersendiri. Tujuannya untuk dropdown filter cascade di frontend.

**Response `GET /api/wilayah/kecamatan?kdkab=1305`:**
```json
[
  { "kdkec": "130501", "nama": "Sungai Limau" },
  { "kdkec": "130502", "nama": "Patamuan" },
  { "kdkec": "130503", "nama": "2x11 Kayu Tanam" }
]
```

---


## 9. Fitur Client (Halaman Publik)

Halaman publik dapat diakses oleh siapa saja di URL `/`. Tidak ada login yang diperlukan.

### 9.1 Peta Utama

**Komponen:** `MapContainer.tsx`

**Konfigurasi Default Peta:**

```typescript
// Konstanta di lib/mapUtils.ts atau constants.ts
const MAP_CENTER: [number, number] = [-0.5397, 100.1187]; // Pusat Kabupaten Padang Pariaman
const MAP_DEFAULT_ZOOM = 11;
const MAP_MIN_ZOOM = 9;
const MAP_MAX_ZOOM = 18;
```

**Fitur Peta:**
- Menampilkan peta dengan basemap OpenStreetMap secara default.
- Tombol **toggle basemap** di pojok kanan atas untuk beralih antara OSM dan Google Maps XYZ Tiles.
- Layer polygon batas wilayah di-overlay di atas basemap (dari file GeoJSON statis).
- Saat pengguna memilih wilayah di filter, peta otomatis `fitBounds` ke batas wilayah tersebut.

**Google XYZ Tiles URL:**
```
https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}
```
(lyrs=y = Hybrid/Satellite dengan label)

---

### 9.2 Marker & Popup

**Komponen:** `MarkerLayer.tsx`, `ClusterLayer.tsx`, `InfraPopup.tsx`

**Aturan Marker:**
- **Default:** Semua marker **tidak ditampilkan** saat halaman pertama dimuat.
- Marker hanya tampil jika ada **filter kategori yang diaktifkan**.
- Ini untuk mencegah render ribuan marker sekaligus yang bisa memperlambat browser.

**Clustering:**
- Jika jumlah marker yang aktif > 100, gunakan **marker clustering** (library `react-leaflet-markercluster` atau `leaflet.markercluster`).
- Cluster menampilkan angka jumlah marker di dalamnya.
- Klik cluster → zoom in ke area cluster.

**Icon Marker:**
- Warna marker sesuai `color` dari kategori (dari API `/api/kategori`).
- Icon marker menggunakan emoji dari field `icon` kategori, atau custom Leaflet DivIcon.

**Popup Infrastruktur (klik marker):**

```
┌────────────────────────────────┐
│  [Foto jika ada, 100% width]   │
├────────────────────────────────┤
│  🍽️ RESTORAN  (badge kategori) │
│  Rumah Makan Padang Sejati     │
│  📍 Jl. Raya No. 5, Sungai    │
│     Limau                      │
└────────────────────────────────┘
```

- Foto: jika `fotoUrl` null, tampilkan placeholder.
- Badge kategori: background sesuai `color` kategori.
- Popup maksimal lebar 250px.

---

### 9.3 Filter Infrastruktur

**Komponen:** `FilterKategori.tsx`

**Tampilan:**
- Panel di sisi kiri peta (bisa collapsible).
- Daftar checkbox, satu per kategori.
- Setiap checkbox menampilkan: `[icon] [label] ([jumlah])`
  - Contoh: `🍽️ Restoran (24)`
- Jumlah dihitung dari total infrastruktur kategori tersebut **sesuai filter wilayah aktif**.

**Behavior:**
- Saat checkbox dicentang → marker kategori tersebut muncul di peta.
- Saat checkbox dicentang ulang → marker hilang.
- Multiple kategori bisa aktif bersamaan.
- Jika tidak ada filter aktif → tidak ada marker yang tampil.

**State Management:**
```typescript
// filterStore.ts (Zustand)
interface FilterStore {
  kategoriAktif: string[];          // array of kategori.value
  toggleKategori: (value: string) => void;
}
```

---

### 9.4 Filter Wilayah

**Komponen:** `FilterWilayah.tsx`

**Tampilan:**
- 4 dropdown cascade: Kabupaten → Kecamatan → Nagari → Korong
- Kabupaten sudah **fixed** ke "Padang Pariaman" (tidak bisa diubah).
- Kecamatan: dapat dipilih → load nagari terkait.
- Nagari: dapat dipilih setelah kecamatan dipilih → load korong terkait.
- Korong: dapat dipilih setelah nagari dipilih.

**Behavior Cascade:**
- Pilih kecamatan → reset nagari & korong → load nagari baru.
- Pilih nagari → reset korong → load korong baru.
- Tombol "Reset" untuk kembali ke tampilan seluruh kabupaten.

**Behavior Peta:**
- Saat wilayah dipilih → peta `fitBounds` ke bounding box wilayah tersebut dari GeoJSON.
- Data marker dan statistik ikut difilter sesuai wilayah yang dipilih.

**API yang dipanggil:**
```
Saat mount: GET /api/wilayah/kecamatan?kdkab=1305
Pilih kecamatan: GET /api/wilayah/nagari?kdkec=130501
Pilih nagari: GET /api/wilayah/korong?kddesa=1305010001
```

---

### 9.5 Search

**Komponen:** `SearchBar.tsx`

**Tampilan:**
- Input teks di bagian atas halaman (atau overlay di pojok peta).
- Dropdown hasil pencarian muncul di bawah input.

**Behavior:**
- **Debounce 300ms** — API baru dipanggil 300ms setelah pengguna berhenti mengetik.
- Minimum 2 karakter sebelum pencarian dilakukan.
- Panggil `GET /api/infrastruktur?search=<query>&limit=5` untuk mendapat top 5 hasil.
- Tampilkan hasil: `[icon kategori] [nama] — [alamat]`
- Klik hasil → peta **flyTo** ke koordinat infra + buka popup marker.

**Implementasi Debounce:**
```typescript
// hooks/useDebounce.ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

---

### 9.6 Panel Statistik

**Komponen:** `StatistikPanel.tsx`, `StatistikCard.tsx`, `BarChart.tsx`, `DonutChart.tsx`

**Tampilan:**
- Panel di sisi bawah atau kanan halaman (bisa collapsible).
- Menampilkan data statistik wilayah **sesuai filter wilayah yang aktif**.

**Elemen Panel:**
1. **Cards** — Angka ringkasan indikator utama (misal: Total Penduduk: 123.456 jiwa).
2. **Bar Chart** — Perbandingan nilai per kecamatan/nagari untuk indikator tertentu.
3. **Donut Chart** — Distribusi kategori infrastruktur di wilayah tersebut.

**Data Source:**
- Statistik: `GET /api/statistik?kdkec=130501` (sesuai filter wilayah aktif).
- Jumlah infra per kategori: dihitung dari data infrastruktur yang sudah di-fetch.

**Update Dinamis:**
- Saat filter wilayah berubah → panel statistik otomatis refresh data.

---


## 10. Fitur Admin (Halaman Tersembunyi)

### 10.1 Login & Autentikasi

**Halaman:** `pages/admin/Login.tsx`

**Flow Login:**
```
1. User buka /admin → dicek oleh RouteGuard
2. Jika token ada di localStorage['admin_token'] → validasi token
3. Jika token valid → redirect ke /admin/dashboard
4. Jika tidak ada token / token invalid → tampilkan halaman Login

5. User isi form (username + password) → POST /api/auth/login
6. Response 200 → simpan token ke localStorage['admin_token'] → redirect /admin/dashboard
7. Response 401 → tampilkan pesan error
```

**RouteGuard (`ProtectedRoute.tsx`):**
```typescript
// Komponen wrapper untuk semua halaman admin
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
```

**JWT Configuration (backend):**
- Secret key: dari environment variable `JWT_SECRET`
- Expiry: `7d` (7 hari)
- Payload: `{ id, username, iat, exp }`

**Middleware Auth Backend (`middleware/auth.ts`):**
```typescript
// Setiap request ke endpoint protected melewati middleware ini
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}
```

---

### 10.2 Manajemen Kategori

**Halaman:** `pages/admin/Kategori.tsx`
**Komponen form:** `components/admin/KategoriForm.tsx`

**Tampilan Tabel:**

| # | Icon | Label | Value | Warna | Urutan | Jml Infra | Aksi |
|---|------|-------|-------|-------|--------|-----------|------|
| 1 | 🍽️ | Restoran | restoran | 🟠 #FF5733 | 1 | 24 | Edit \| Hapus |
| 2 | 🕌 | Rumah Ibadah | rumah_ibadah | 🟢 #3D9970 | 2 | 48 | Edit \| Hapus |

- Kolom "Jml Infra" menampilkan COUNT infrastruktur per kategori.
- Tombol "Hapus" disabled jika Jml Infra > 0, dengan tooltip penjelasan.

**Form Tambah/Edit:**
- Field: `value` (slug), `label`, `icon` (emoji picker atau text), `color` (color picker), `urutan`
- Validasi:
  - `value`: required, lowercase, hanya huruf dan underscore, unique
  - `label`: required, max 100 karakter
  - `color`: required, format hex (#RRGGBB)
  - `urutan`: required, angka positif

---

### 10.3 Manajemen Infrastruktur

**Halaman:** `pages/admin/Infrastruktur.tsx`
**Komponen form:** `components/admin/InfraForm.tsx`
**Komponen picker:** `components/admin/MapPicker.tsx`

**Tampilan Tabel (Paginated, 20 per halaman):**
- Kolom: No, Nama, Kategori (badge), Kecamatan, Nagari, Koordinat, Aksi (Edit|Hapus)
- Search bar di atas tabel (cari by nama)
- Filter dropdown kategori di atas tabel
- Total records dan navigasi halaman di bawah tabel

**Form Infrastruktur:**

| Field | Tipe Input | Wajib | Validasi |
|-------|-----------|-------|---------|
| Nama | text | ✅ | max 255 karakter |
| Kategori | dropdown (dari API) | ✅ | harus ada di daftar kategori |
| Alamat | textarea | ❌ | — |
| Foto | **Upload file atau URL manual** | ❌ | jpg/png/webp, maks 5MB |
| Latitude | number | ✅ | range -90 sampai 90 |
| Longitude | number | ✅ | range -180 sampai 180 |
| Kecamatan | dropdown cascade | ✅ | dari API wilayah |
| Nagari | dropdown cascade | ✅ | dari API wilayah, tergantung kecamatan |
| Korong | dropdown cascade | ❌ | dari API wilayah, tergantung nagari |
| [Map Picker] | mini peta | — | klik peta → isi lat/lng otomatis |

**Komponen FotoUpload (`components/admin/FotoUpload.tsx`):**
- Drag & drop atau klik untuk pilih file gambar (jpg, jpeg, png, webp)
- Validasi tipe dan ukuran (maks 5MB) di sisi frontend sebelum upload
- Upload ke `POST /api/upload/foto` → mendapat `fotoUrl` otomatis
- Preview gambar setelah upload berhasil (hover untuk Ganti/Hapus)
- Toggle "Isi URL manual" untuk memasukkan link gambar eksternal
- Foto disimpan di `server/uploads/images/` dan diakses via `/uploads/images/<filename>`

---

### 10.4 Manajemen Statistik

**Halaman:** `pages/admin/Statistik.tsx`
**Komponen form:** `components/admin/StatistikForm.tsx`

**Tampilan Tabel:**
- Kolom: No, Indikator, Wilayah (kecamatan/nagari), Nilai, Satuan, Tahun, Aksi
- Filter by tahun dan by level wilayah

**Form Statistik:**

| Field | Tipe Input | Wajib |
|-------|-----------|-------|
| Indikator | text | ✅ |
| Kecamatan | dropdown | ✅ |
| Nagari | dropdown (opsional) | ❌ |
| Korong | dropdown (opsional) | ❌ |
| Nilai | number | ✅ |
| Satuan | text | ❌ |
| Tahun | number | ✅ |

---

### 10.5 Import & Export Excel

**Backend utility:** `server/src/utils/excel.ts`
**Upload middleware:** `server/src/utils/upload.ts`

**Batas Import:** `MAX_IMPORT_ROWS = 5000` baris per file.

**Flow Import:**
```
1. Admin pilih file .xlsx → POST /api/infrastruktur/import (multipart/form-data)
2. Backend terima file via multer → simpan sementara di /tmp
3. Parse Excel dengan exceljs → validasi setiap baris
4. Baris valid → insert ke database
5. Return hasil: { berhasil: N, gagal: M, errors: [...] }
6. Tampilkan ringkasan ke admin
```

**Validasi saat import infrastruktur:**
- `nama`: tidak boleh kosong
- `kategori`: harus ada di tabel `kategori_infra`
- `lat`: angka, range -90 sampai 90 (WAJIB)
- `lng`: angka, range -180 sampai 180 (WAJIB)
- `kdkab`: harus "1305"
- `kdkec`: 6 digit, dimulai dengan "1305"
- `kddesa`: 10 digit, dimulai dengan `kdkec`
- `kdsls`: 12 digit jika diisi, dimulai dengan `kddesa`

**Jika baris tidak valid:** Catat di array `errors` dengan nomor baris dan alasan → lanjut ke baris berikutnya (tidak stop semua import).

---


## 11. Komponen Frontend Utama

Berikut adalah daftar komponen, file-nya, dan tanggung jawab masing-masing:

### Komponen Peta

| Komponen | File | Tanggung Jawab |
|----------|------|----------------|
| `MapContainer` | `components/map/MapContainer.tsx` | Container utama Leaflet. Inisialisasi peta dengan center dan zoom default. Menggabungkan semua layer peta. |
| `BasemapToggle` | `components/map/BasemapToggle.tsx` | Tombol toggle antara OSM dan Google Maps. Menyimpan pilihan basemap ke state. |
| `WilayahLayer` | `components/map/WilayahLayer.tsx` | Menampilkan polygon batas wilayah dari GeoJSON. Highlight wilayah yang dipilih. Handle fitBounds saat wilayah dipilih. |
| `MarkerLayer` | `components/map/MarkerLayer.tsx` | Menampilkan marker infrastruktur. Hanya render marker yang kategorinya aktif di filter. |
| `ClusterLayer` | `components/map/ClusterLayer.tsx` | Wrap `MarkerLayer` dengan clustering ketika jumlah marker > 100. |
| `InfraPopup` | `components/map/InfraPopup.tsx` | Konten popup saat marker diklik: foto, badge kategori, nama, alamat. |

### Komponen Filter

| Komponen | File | Tanggung Jawab |
|----------|------|----------------|
| `FilterKategori` | `components/filter/FilterKategori.tsx` | Daftar checkbox kategori. Fetch data dari `/api/kategori`. Tampilkan jumlah infra per kategori. Update state filter saat checkbox berubah. |
| `FilterWilayah` | `components/filter/FilterWilayah.tsx` | Dropdown cascade Kabupaten → Kecamatan → Nagari → Korong. Fetch API wilayah secara cascade. Update state filter wilayah. Trigger fitBounds di peta. |

### Komponen Search

| Komponen | File | Tanggung Jawab |
|----------|------|----------------|
| `SearchBar` | `components/search/SearchBar.tsx` | Input search dengan debounce 300ms. Fetch `/api/infrastruktur?search=...`. Tampilkan dropdown hasil. Klik hasil → flyTo + popup. |

### Komponen Statistik

| Komponen | File | Tanggung Jawab |
|----------|------|----------------|
| `StatistikPanel` | `components/statistik/StatistikPanel.tsx` | Container panel statistik. Fetch data dari `/api/statistik` sesuai filter wilayah. Orchestrate tampilan card dan chart. |
| `StatistikCard` | `components/statistik/StatistikCard.tsx` | Satu card untuk satu indikator statistik. Tampilkan: nama indikator, nilai, satuan. |
| `BarChart` | `components/statistik/BarChart.tsx` | Bar chart perbandingan nilai statistik. Gunakan library charting (Recharts / Chart.js). |
| `DonutChart` | `components/statistik/DonutChart.tsx` | Donut chart distribusi kategori infrastruktur. |

### Komponen Admin

| Komponen | File | Tanggung Jawab |
|----------|------|----------------|
| `AdminTable` | `components/admin/AdminTable.tsx` | Tabel generik dengan support: kolom kustom, pagination, search, loading state, empty state. |
| `InfraForm` | `components/admin/InfraForm.tsx` | Form tambah/edit infrastruktur. Validasi semua field. Integrasikan MapPicker untuk lat/lng. Dropdown cascade wilayah. |
| `StatistikForm` | `components/admin/StatistikForm.tsx` | Form tambah/edit data statistik. Dropdown wilayah cascade. |
| `KategoriForm` | `components/admin/KategoriForm.tsx` | Form tambah/edit kategori. Input warna dengan color picker. |
| `MapPicker` | `components/admin/MapPicker.tsx` | Mini peta Leaflet untuk memilih koordinat. Klik/geser marker → update field lat/lng di form. |

### Halaman (Pages)

| Halaman | File | Keterangan |
|---------|------|------------|
| `ClientMap` | `pages/ClientMap.tsx` | Halaman utama publik. Menggabungkan: MapContainer, FilterKategori, FilterWilayah, SearchBar, StatistikPanel. |
| `AdminLogin` | `pages/admin/Login.tsx` | Form login admin. Redirect ke dashboard setelah berhasil. |
| `AdminDashboard` | `pages/admin/Dashboard.tsx` | Ringkasan: jumlah infra per kategori, total statistik, dll. |
| `AdminInfrastruktur` | `pages/admin/Infrastruktur.tsx` | Tabel + CRUD infrastruktur + import/export. |
| `AdminStatistik` | `pages/admin/Statistik.tsx` | Tabel + CRUD statistik + import/export. |
| `AdminKategori` | `pages/admin/Kategori.tsx` | Tabel + CRUD kategori. |

### Library & Utilities

| File | Tanggung Jawab |
|------|----------------|
| `lib/api.ts` | Axios instance dengan base URL. Interceptor request: tambahkan header `Authorization: Bearer <token>`. Interceptor response: tangani error 401 → redirect ke login. |
| `lib/mapUtils.ts` | Fungsi helper peta: `getBoundsFromGeoJSON()`, `getMarkerIcon()` berdasarkan kategori, `flyToInfra()`. |
| `store/mapStore.ts` | Zustand store: center, zoom, basemap aktif, referensi map instance. |
| `store/filterStore.ts` | Zustand store: kategoriAktif (array), wilayah terpilih (kdkab, kdkec, kddesa, kdsls). |
| `store/authStore.ts` | Zustand store: token, user info, fungsi login/logout. |

---

## 12. Environment Variables

### Backend (`server/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/padang_pariaman_map"

# JWT
JWT_SECRET="ganti_dengan_string_random_panjang_min_32_karakter"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS (URL frontend)
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`client/.env`)

```env
# URL Backend API
VITE_API_URL="http://localhost:3000/api"

# Koordinat Default Peta
VITE_MAP_CENTER_LAT=-0.5397
VITE_MAP_CENTER_LNG=100.1187
VITE_MAP_DEFAULT_ZOOM=11
```

> ⚠️ **PENTING:** File `.env` **tidak boleh** di-commit ke Git. Tambahkan ke `.gitignore`. Buat file `.env.example` sebagai template tanpa nilai sensitif.

---

## 13. Format File Excel Import

### 13.1 Template Import Infrastruktur

File Excel harus memiliki nama sheet: `Data` (atau sheet pertama)

**Header kolom (baris 1):**

| Kolom | Nama Header | Tipe | Wajib | Keterangan |
|-------|-------------|------|-------|------------|
| A | nama | Text | ✅ | Nama infrastruktur |
| B | kategori | Text | ✅ | Value kategori (contoh: restoran) |
| C | alamat | Text | ❌ | Alamat lengkap |
| D | foto_url | Text | ❌ | URL foto eksternal (opsional — kosongkan jika foto diupload via admin panel) |
| E | lat | Number | ✅ | Latitude, contoh: -0.5397 |
| F | lng | Number | ✅ | Longitude, contoh: 100.1187 |
| G | kdkab | Text | ✅ | Kode kabupaten: 1305 |
| H | kdkec | Text | ✅ | Kode kecamatan, 6 digit |
| I | kddesa | Text | ✅ | Kode nagari, 10 digit |
| J | kdsls | Text | ❌ | Kode korong, 12 digit |

**Contoh baris data:**
```
Rumah Makan Sari | restoran | Jl. Raya No.5 | https://... | -0.5397 | 100.1187 | 1305 | 130501 | 1305010001 | 130501000101
```

---

### 13.2 Template Import Statistik

**Header kolom (baris 1):**

| Kolom | Nama Header | Tipe | Wajib | Keterangan |
|-------|-------------|------|-------|------------|
| A | kdkab | Text | ✅ | Kode kabupaten |
| B | kdkec | Text | ❌ | Kode kecamatan (kosong = level kabupaten) |
| C | kddesa | Text | ❌ | Kode nagari |
| D | kdsls | Text | ❌ | Kode korong |
| E | indikator | Text | ✅ | Nama indikator statistik |
| F | nilai | Number | ✅ | Nilai numerik |
| G | satuan | Text | ❌ | Satuan (jiwa, km², dll.) |
| H | tahun | Number | ✅ | Tahun data (contoh: 2024) |

---

### 13.3 Format Export

Export menghasilkan file `.xlsx` dengan:
- Nama file: `infrastruktur_export_YYYYMMDD.xlsx` atau `statistik_export_YYYYMMDD.xlsx`
- Sheet 1: Data (sesuai header template import)
- Row 1: Header (bold)
- Row 2+: Data

---


## 14. Konstanta Penting

```typescript
// constants.ts — Letakkan di client/src/constants.ts dan server/src/constants.ts

// ===== WILAYAH =====
export const KDKAB_PADANG_PARIAMAN = '1305';

// ===== PETA =====
export const MAP_CENTER: [number, number] = [-0.5397, 100.1187];
export const MAP_DEFAULT_ZOOM = 11;
export const MAP_MIN_ZOOM = 9;
export const MAP_MAX_ZOOM = 18;
export const MAP_CLUSTER_THRESHOLD = 100; // marker > 100 → aktifkan clustering

// ===== ADMIN =====
export const ADMIN_ROUTE = '/admin';           // URL halaman admin
export const ADMIN_TOKEN_KEY = 'admin_token';  // localStorage key
export const ADMIN_PAGE_SIZE = 20;             // jumlah baris per halaman di tabel

// ===== IMPORT =====
export const MAX_IMPORT_ROWS = 5000;           // batas maksimum baris per file import

// ===== API =====
export const DEBOUNCE_DELAY_MS = 300;          // delay debounce search

// ===== BASEMAP URLS =====
export const BASEMAP_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const BASEMAP_GOOGLE = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

// ===== SECURITY =====
export const BCRYPT_COST_FACTOR = 10;          // cost factor bcrypt untuk hash password
export const JWT_EXPIRES_IN = '7d';
```

---

## 15. Aturan & Larangan (DO & DON'T)

### ✅ DO (Wajib Dilakukan)

| No | Aturan | Alasan |
|----|--------|--------|
| 1 | Sembunyikan URL `/admin` — tidak ada link dari halaman publik | Keamanan: mencegah akses tidak sah |
| 2 | Validasi `lat` dan `lng` saat import (range & tipe) | Mencegah data koordinat yang rusak masuk ke DB |
| 3 | Gunakan `bcrypt` dengan cost 10 untuk hash password | Standar keamanan hashing password |
| 4 | Selalu tangani `loading state`, `error state`, dan `empty state` di setiap komponen | UX yang baik, mencegah tampilan blank/crash |
| 5 | Gunakan `async/await` untuk semua operasi asinkron | Konsistensi dan keterbacaan kode |
| 6 | Tambahkan komentar dalam Bahasa Indonesia untuk logika domain-spesifik | Kemudahan pemahaman oleh tim lokal |
| 7 | Gunakan Zustand store untuk state yang dibagi antar komponen | Mencegah prop drilling yang dalam |
| 8 | Jangan render marker jika tidak ada filter yang aktif | Performa: ribuan marker sekaligus = browser lambat |
| 9 | Gunakan clustering jika marker > 100 | Performa rendering peta |
| 10 | Validasi kode wilayah saat import (format dan hirarki) | Mencegah data wilayah tidak konsisten |
| 11 | Simpan `admin_token` di localStorage, bukan cookie | Konsistensi dengan arsitektur SPA + REST |
| 12 | Return error yang informatif dari API (bukan hanya status code) | Kemudahan debugging dan UX form admin |
| 13 | Gunakan Prisma migration untuk perubahan schema | Konsistensi DB di semua environment |
| 14 | Environment variable untuk semua konfigurasi sensitif | Keamanan, portabilitas |
| 15 | Debounce 300ms untuk search input | Mencegah request API berlebihan |
| 16 | Gunakan **Tailwind CSS utility classes** untuk semua styling | Konsistensi, tidak perlu custom CSS terpisah |
| 17 | Untuk styling Leaflet (marker, popup), gunakan CSS class custom di `index.css` (satu-satunya pengecualian Tailwind) | Leaflet tidak mendukung Tailwind langsung pada elemen internalnya |

### ❌ DON'T (Dilarang)

| No | Larangan | Alasan |
|----|----------|--------|
| 1 | Jangan expose `/admin` di navbar, footer, atau link apapun di halaman publik | Keamanan |
| 2 | Jangan render semua marker sekaligus tanpa filter aktif | Performa browser |
| 3 | Jangan hardcode kategori infrastruktur di frontend | Kategori harus bisa diubah admin tanpa deploy ulang |
| 4 | Jangan simpan password dalam plaintext | Keamanan fundamental |
| 5 | Jangan commit file `.env` ke Git | Keamanan credential |
| 6 | Jangan gunakan `.then().catch()` — pakai `async/await` | Konsistensi kode |
| 7 | Jangan hapus kategori yang masih dipakai infrastruktur | Integritas data referensial |
| 8 | Jangan import lebih dari 5000 baris sekaligus | Performa server dan DB |
| 9 | Jangan skip validasi kode wilayah saat import | Konsistensi data spasial |
| 10 | Jangan gunakan `any` TypeScript tanpa alasan kuat | Type safety adalah tujuan penggunaan TypeScript |

---

## 16. Langkah Pengerjaan (Step-by-Step)

Pengerjaan sebaiknya dilakukan berurutan sesuai dependensi. Jangan skip langkah.

### Langkah 1: Setup Project
```bash
# Buat struktur folder
mkdir padang-pariaman-map
cd padang-pariaman-map

# Backend
mkdir server && cd server
npm init -y
npm install express prisma @prisma/client bcrypt jsonwebtoken exceljs multer cors dotenv
npm install -D typescript ts-node @types/express @types/bcrypt @types/jsonwebtoken @types/multer @types/node nodemon

# Frontend
cd ..
npm create vite@latest client -- --template react-ts
cd client
npm install react-leaflet leaflet leaflet.markercluster zustand axios recharts
npm install -D @types/leaflet tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Langkah 2: Konfigurasi TypeScript & Prisma
- Buat `tsconfig.json` di folder server
- Buat `server/src/prisma/schema.prisma` sesuai Section 7.1
- Jalankan `npx prisma migrate dev --name init`

### Langkah 3: Database & Seed
- Setup PostgreSQL database lokal
- Set `DATABASE_URL` di `server/.env`
- Jalankan migrasi Prisma
- Buat dan jalankan `server/src/prisma/seed.ts` (Section 7.4)

### Langkah 4: Backend — Auth
- Buat `server/src/middleware/auth.ts` (JWT middleware)
- Buat `server/src/routes/auth.ts` (POST /api/auth/login)
- Buat `server/src/index.ts` (Express setup, CORS, routes)
- Test: POST login → dapat token

### Langkah 5: Backend — API Kategori
- Buat `server/src/routes/kategori.ts`
- Implementasi GET (public), POST, PUT, DELETE (protected)
- Implementasi pengecekan "masih dipakai" sebelum hapus
- Test semua endpoint dengan Postman/Thunder Client

### Langkah 6: Backend — API Wilayah
- Buat `server/src/routes/wilayah.ts`
- Implementasi GET kecamatan, nagari, korong (query dari DB berdasarkan kode)
- Test cascade: pilih kecamatan → nagari yang muncul benar

### Langkah 7: Backend — API Infrastruktur
- Buat `server/src/utils/upload.ts` (konfigurasi multer)
- Buat `server/src/utils/excel.ts` (read/write Excel)
- Buat `server/src/routes/infrastruktur.ts`
- Implementasi CRUD, import, export
- Test validasi import (lat/lng invalid harus ditolak baris itu)

### Langkah 8: Backend — API Statistik
- Buat `server/src/routes/statistik.ts`
- Implementasi CRUD, import, export
- Test filter by wilayah

### Langkah 9: Frontend — Setup & Routing
- Konfigurasi React Router di `App.tsx`
- Setup route: `/` → ClientMap, `/admin` → redirect, `/admin/login` → Login, `/admin/dashboard`, dll.
- Buat `ProtectedRoute` component
- Setup Axios instance di `lib/api.ts` dengan interceptor
- Konfigurasi Tailwind CSS:
  - `tailwind.config.js`: tambahkan `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
  - `src/index.css`: tambahkan `@tailwind base; @tailwind components; @tailwind utilities;`
  - Import `index.css` di `main.tsx`

### Langkah 10: Frontend — Zustand Stores
- Buat `store/filterStore.ts`, `store/mapStore.ts`, `store/authStore.ts`
- Test: perubahan store ter-reflect di komponen subscriber

### Langkah 11: Frontend — Komponen Peta
- Buat `MapContainer.tsx` dengan Leaflet
- Buat `BasemapToggle.tsx`
- Buat `WilayahLayer.tsx` (load GeoJSON, render polygon)
- Buat `MarkerLayer.tsx` dan `ClusterLayer.tsx`
- Buat `InfraPopup.tsx`
- Test: peta muncul, GeoJSON ter-render, toggle basemap berfungsi

### Langkah 12: Frontend — Filter & Search
- Buat `FilterKategori.tsx` (fetch kategori dari API, checkbox)
- Buat `FilterWilayah.tsx` (dropdown cascade, fetch wilayah)
- Buat `SearchBar.tsx` (debounce, dropdown hasil)
- Buat `useDebounce.ts` hook
- Test: filter kategori → marker muncul/hilang, filter wilayah → fitBounds

### Langkah 13: Frontend — Panel Statistik
- Buat `StatistikPanel.tsx`, `StatistikCard.tsx`, `BarChart.tsx`, `DonutChart.tsx`
- Fetch data dari API sesuai filter wilayah aktif
- Test: ganti filter wilayah → panel statistik update

### Langkah 14: Frontend — Halaman Admin
- Buat `Login.tsx` (form + fetch POST login + simpan token)
- Buat `AdminTable.tsx` (generik, reusable)
- Buat `KategoriForm.tsx`, `InfraForm.tsx` (dengan MapPicker), `StatistikForm.tsx`
- Buat `MapPicker.tsx`
- Implementasi halaman Kategori, Infrastruktur, Statistik
- Test semua CRUD dari admin panel

### Langkah 15: Frontend — Import & Export
- Buat UI upload file Excel di halaman Infrastruktur dan Statistik
- Tampilkan progress dan hasil import (berhasil/gagal/errors)
- Tombol export → download file Excel
- Test: import file valid → data masuk, import file invalid → error per baris ditampilkan

### Langkah 16: Testing & Polish
- Test semua fitur end-to-end
- Test edge cases: kategori kosong, wilayah tanpa data, lat/lng invalid
- Pastikan semua loading/error/empty state ditampilkan
- Verifikasi `/admin` tidak bisa diakses tanpa token
- Verifikasi tidak ada link ke `/admin` di halaman publik
- Build production: `npm run build` di frontend, compile TypeScript di backend

---


## 17. Kriteria Selesai (Definition of Done)

Aplikasi dianggap **selesai** jika semua checklist berikut terpenuhi:

### Backend ✅

- [ ] Database berhasil dibuat dengan 4 tabel sesuai schema
- [ ] Seed data berhasil: 1 admin user + 6 kategori default
- [ ] `POST /api/auth/login` mengembalikan JWT yang valid
- [ ] JWT middleware menolak request tanpa token atau token invalid dengan status 401
- [ ] Semua endpoint CRUD Kategori berfungsi; DELETE gagal dengan pesan jelas jika kategori masih dipakai
- [ ] Semua endpoint CRUD Infrastruktur berfungsi dengan filter query params
- [ ] Semua endpoint CRUD Statistik berfungsi
- [ ] Semua endpoint wilayah cascade berfungsi
- [ ] Import Excel infrastruktur: baris valid masuk DB, baris invalid dilaporkan per-baris
- [ ] Import Excel statistik berfungsi
- [ ] Export Excel infrastruktur dan statistik menghasilkan file yang dapat dibuka
- [ ] Validasi lat/lng saat import menolak nilai di luar range
- [ ] Password tersimpan sebagai bcrypt hash (bukan plaintext)

### Frontend — Client (Publik) ✅

- [ ] Peta Leaflet tampil dengan center dan zoom yang benar
- [ ] Toggle basemap OSM ↔ Google berfungsi
- [ ] Polygon batas wilayah (dari GeoJSON) tampil di peta
- [ ] Tidak ada marker yang tampil saat halaman pertama dimuat (sebelum filter aktif)
- [ ] Marker muncul saat checkbox filter kategori dicentang
- [ ] Marker hilang saat checkbox dicentang ulang
- [ ] Clustering aktif jika marker > 100
- [ ] Klik marker membuka popup dengan foto, badge kategori, nama, alamat
- [ ] Filter wilayah cascade berfungsi: pilih kecamatan → nagari update → korong update
- [ ] Pilih wilayah → peta fitBounds ke wilayah tersebut
- [ ] Search dengan debounce 300ms berfungsi
- [ ] Klik hasil search → flyTo + popup terbuka
- [ ] Panel statistik tampil dan update sesuai filter wilayah
- [ ] URL `/admin` tidak tampil di navbar/footer/link manapun

### Frontend — Admin (Tersembunyi) ✅

- [ ] Akses `/admin/dashboard` tanpa token → redirect ke `/admin/login`
- [ ] Login berhasil → token tersimpan di localStorage → redirect ke dashboard
- [ ] Logout → token dihapus → redirect ke login
- [ ] CRUD Kategori berfungsi lengkap (tambah, edit, hapus)
- [ ] Hapus kategori yang dipakai → error informatif ditampilkan
- [ ] CRUD Infrastruktur berfungsi lengkap dengan MapPicker
- [ ] Tabel infrastruktur paginated dengan search dan filter
- [ ] CRUD Statistik berfungsi lengkap
- [ ] Import Excel infrastruktur: UI upload + tampilan hasil (berhasil/gagal)
- [ ] Import Excel statistik berfungsi
- [ ] Export Excel berfungsi dan file ter-download
- [ ] Form validasi: field required tidak bisa dikosongkan
- [ ] Loading, error, dan empty state ditampilkan di semua halaman

### Kualitas Kode ✅

- [ ] Tidak ada `any` TypeScript yang tidak diperlukan
- [ ] Semua komponen menangani loading dan error state
- [ ] Komentar Bahasa Indonesia pada logika domain-spesifik
- [ ] Tidak ada console.log yang tertinggal di production
- [ ] File `.env` tidak ter-commit (ada di `.gitignore`)
- [ ] File `.env.example` tersedia sebagai template
- [ ] `npm run build` berhasil tanpa error

---

## Lampiran: TypeScript Types Utama

```typescript
// client/src/types/index.ts

export interface KategoriInfra {
  id: number;
  value: string;
  label: string;
  icon: string;
  color: string;
  urutan: number;
}

export interface Infrastruktur {
  id: number;
  nama: string;
  kategori: string;
  alamat?: string;
  fotoUrl?: string;
  lat: number;
  lng: number;
  kdkab: string;
  kdkec: string;
  kddesa: string;
  kdsls?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistik {
  id: number;
  kdkab: string;
  kdkec?: string;
  kddesa?: string;
  kdsls?: string;
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun: number;
  createdAt: string;
}

export interface WilayahOption {
  kode: string;  // kdkec / kddesa / kdsls
  nama: string;
}

export interface FilterWilayahState {
  kdkab: string;
  kdkec?: string;
  kddesa?: string;
  kdsls?: string;
}

export interface ImportResult {
  berhasil: number;
  gagal: number;
  errors: Array<{
    baris: number;
    pesan: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}
```

---

*Dokumen ini dibuat sebagai panduan lengkap pengembangan aplikasi Peta Tematik Interaktif Kabupaten Padang Pariaman. Setiap perubahan desain atau requirement wajib diperbarui di dokumen ini.*
