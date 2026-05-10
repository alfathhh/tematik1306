# 🗺️ Peta Tematik Interaktif Kabupaten Padang Pariaman

Aplikasi web peta interaktif untuk visualisasi data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat.

## ✨ Fitur Utama

### Halaman Publik (`/`)
- 🗺️ **Peta Interaktif** — Leaflet.js dengan toggle basemap OSM ↔ Google Satellite
- 🏷️ **Filter Kategori** — Aktifkan/nonaktifkan marker per kategori infrastruktur
- 📍 **Filter Wilayah** — Cascade: Kabupaten → Kecamatan → Nagari → Korong
- 🔍 **Search** — Pencarian infrastruktur dengan debounce 300ms + flyTo peta
- 📊 **Panel Statistik** — Card, Bar Chart, Donut Chart — update real-time sesuai filter wilayah

### Panel Admin (`/admin`)
- 🔐 **Login** aman dengan JWT (7 hari)
- 🏗️ **Kelola Infrastruktur** — CRUD + MapPicker + Import/Export Excel
- 📈 **Kelola Statistik** — CRUD + Import/Export Excel
- 🏷️ **Kelola Kategori** — CRUD dengan color picker + proteksi hapus

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Peta | Leaflet.js via react-leaflet |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Excel | exceljs + multer |

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 20+
- PostgreSQL 15+
- npm atau yarn

### 1. Clone & Setup

```bash
git clone https://github.com/alfathhh/tematik1306.git
cd tematik1306/padang-pariaman-map
```

### 2. Setup Backend

```bash
cd server
npm install

# Salin .env dan isi DATABASE_URL
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT_SECRET

# Generate Prisma client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init

# Seed data awal (admin user + kategori default)
npm run prisma:seed

# Jalankan server (port 3000)
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install

# Salin .env (opsional, sudah dikonfigurasi dengan proxy)
cp .env.example .env

# Jalankan frontend (port 5173)
npm run dev
```

### 4. Akses Aplikasi

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Halaman peta publik |
| `http://localhost:5173/admin/login` | Login admin |

**Kredensial default admin:**
- Username: `admin`
- Password: `admin123`

> ⚠️ Ganti password setelah pertama kali login di production!

## 📁 Struktur Folder

```
padang-pariaman-map/
├── client/                  # Frontend React + Vite
│   ├── public/geojson/      # File GeoJSON batas wilayah (statis)
│   └── src/
│       ├── components/
│       │   ├── map/         # Komponen peta Leaflet
│       │   ├── filter/      # Filter kategori & wilayah
│       │   ├── search/      # SearchBar
│       │   └── statistik/   # Panel statistik & charts
│       ├── pages/
│       │   ├── ClientMap.tsx        # Halaman publik
│       │   └── admin/               # Halaman admin
│       ├── store/           # Zustand stores
│       ├── hooks/           # Custom hooks
│       ├── lib/             # Axios instance, map utils
│       └── types/           # TypeScript interfaces
│
└── server/                  # Backend Express
    └── src/
        ├── routes/          # API routes
        ├── middleware/      # JWT auth middleware
        ├── prisma/          # Schema & seed
        └── utils/           # Excel & upload utils
```

## 🗂️ API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | ❌ | Login admin |
| GET | `/api/kategori` | ❌ | Daftar kategori |
| GET/POST/PUT/DELETE | `/api/kategori/:id` | ✅ | CRUD kategori |
| GET | `/api/infrastruktur` | ❌ | Daftar infrastruktur (dengan filter) |
| POST/PUT/DELETE | `/api/infrastruktur` | ✅ | CRUD infrastruktur |
| POST | `/api/infrastruktur/import` | ✅ | Import Excel |
| GET | `/api/infrastruktur/export` | ✅ | Export Excel |
| GET | `/api/statistik` | ❌ | Data statistik |
| GET | `/api/wilayah/kecamatan` | ❌ | Daftar kecamatan |
| GET | `/api/wilayah/nagari` | ❌ | Daftar nagari |
| GET | `/api/wilayah/korong` | ❌ | Daftar korong |

## 🗺️ Kode Wilayah

| Level | Field | Panjang | Contoh |
|-------|-------|---------|--------|
| Kabupaten | `kdkab` | 4 digit | `1305` |
| Kecamatan | `kdkec` | 6 digit | `130501` |
| Nagari | `kddesa` | 10 digit | `1305010001` |
| Korong | `kdsls` | 12 digit | `130501000101` |

## 📊 Template Import Excel

### Infrastruktur
| nama | kategori | alamat | foto_url | lat | lng | kdkab | kdkec | kddesa | kdsls |

### Statistik
| kdkab | kdkec | kddesa | kdsls | indikator | nilai | satuan | tahun |

## 📝 Lisensi

MIT License — Dikembangkan untuk Kabupaten Padang Pariaman
