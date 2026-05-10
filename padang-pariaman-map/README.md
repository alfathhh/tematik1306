# 🗺️ Peta Tematik Interaktif Kabupaten Padang Pariaman

Aplikasi web peta interaktif untuk visualisasi data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat.

---

## ✨ Fitur Utama

### Halaman Publik (`/`)
- 🗺️ **Peta Interaktif** — Leaflet.js dengan toggle basemap OSM ↔ Google Satellite
- 🏷️ **Filter Kategori** — Aktifkan/nonaktifkan marker per kategori infrastruktur
- 📍 **Filter Wilayah** — Cascade: Kabupaten → Kecamatan → Nagari → Korong
- 🔍 **Search** — Pencarian infrastruktur dengan debounce 300ms + flyTo peta
- 📊 **Panel Statistik** — Card, Bar Chart, Donut Chart — update real-time sesuai filter wilayah

### Panel Admin (`/admin`) — URL tersembunyi, tidak ada link dari halaman publik
- 🔐 **Login** aman dengan JWT (7 hari)
- 🏗️ **Kelola Infrastruktur** — CRUD + MapPicker koordinat + **Upload Foto** + Import/Export Excel
- 📸 **Upload Foto** — Drag & drop atau klik pilih gambar (JPG/PNG/WebP, maks 5MB), preview langsung
- 📈 **Kelola Statistik** — CRUD + Import/Export Excel
- 🏷️ **Kelola Kategori** — CRUD dengan color picker + proteksi hapus jika masih dipakai

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| CSS | **Tailwind CSS** (utility-first) |
| Peta | Leaflet.js via react-leaflet |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Excel | exceljs + multer |
| Upload Foto | multer (simpan ke `server/uploads/images/`) |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone & Masuk ke Folder

```bash
git clone https://github.com/alfathhh/tematik1306.git
cd tematik1306/padang-pariaman-map
```

### 2. Setup Backend

```bash
cd server
npm install

# Salin .env dan isi konfigurasi
cp .env.example .env
# Edit .env: isi DATABASE_URL dan JWT_SECRET
```

Contoh isi `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/padang_pariaman_map"
JWT_SECRET="string_acak_panjang_minimal_32_karakter"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

```bash
# Generate Prisma client
npx prisma generate

# Buat tabel database
npx prisma migrate dev --name init

# Isi data awal (admin + 6 kategori + contoh data)
npm run prisma:seed

# Jalankan server (port 3000)
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install

# Jalankan frontend (port 5173)
npm run dev
```

### 4. Akses Aplikasi

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Halaman peta publik |
| `http://localhost:5173/admin/login` | Login panel admin |

**Kredensial default:**
| Field | Nilai |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ **Penting:** Ganti password default segera setelah login pertama di environment production!

---

## 📸 Fitur Upload Foto

Foto infrastruktur dapat diunggah langsung dari form admin:

1. Buka form **Tambah / Edit Infrastruktur**
2. Di bagian **Foto** — **drag & drop** gambar atau klik untuk memilih file
3. Format yang didukung: JPG, JPEG, PNG, WebP — maks **5MB**
4. Preview muncul otomatis. Hover untuk tombol **🔄 Ganti** atau **🗑️ Hapus**
5. Atau klik **"Atau isi URL manual"** untuk memasukkan link gambar dari internet

Foto tersimpan di: `server/uploads/images/`
URL akses foto: `http://localhost:3000/uploads/images/<nama-file>`

> Kolom `foto_url` di template import Excel **bisa dikosongkan** — foto bisa diupload lewat admin panel setelah data diimport.

---

## 📁 Struktur Folder

```
padang-pariaman-map/
├── client/                        # Frontend React + Vite + Tailwind
│   ├── public/
│   │   └── geojson/               # File GeoJSON batas wilayah (statis)
│   │       ├── kabupaten.geojson
│   │       ├── kecamatan.geojson
│   │       ├── nagari.geojson
│   │       └── korong.geojson
│   └── src/
│       ├── components/
│       │   ├── map/               # Komponen peta Leaflet
│       │   ├── filter/            # Filter kategori & wilayah
│       │   ├── search/            # SearchBar dengan debounce
│       │   ├── statistik/         # Panel statistik & charts
│       │   └── admin/             # FotoUpload, MapPicker, dll.
│       ├── pages/
│       │   ├── ClientMap.tsx      # Halaman peta publik
│       │   └── admin/             # Login, Dashboard, Infrastruktur, dll.
│       ├── store/                 # Zustand stores (map, filter, auth)
│       ├── hooks/                 # Custom hooks (debounce, wilayah, dll.)
│       ├── lib/                   # Axios instance, map utils
│       └── types/                 # TypeScript interfaces
│
└── server/                        # Backend Express + TypeScript
    ├── uploads/
    │   └── images/                # Foto yang diupload admin (dibuat otomatis)
    └── src/
        ├── routes/                # API routes (auth, infrastruktur, dll.)
        │   └── upload.ts          # POST /api/upload/foto
        ├── middleware/            # JWT auth middleware
        ├── prisma/                # Schema & seed
        └── utils/                 # Excel & upload (multer) utils
```

---

## 🗂️ API Endpoints

### Publik (tanpa auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login admin, dapat JWT |
| GET | `/api/kategori` | Daftar kategori infrastruktur |
| GET | `/api/infrastruktur` | Daftar infrastruktur (dengan filter) |
| GET | `/api/statistik` | Data statistik wilayah |
| GET | `/api/wilayah/kecamatan` | Daftar kecamatan |
| GET | `/api/wilayah/nagari` | Daftar nagari |
| GET | `/api/wilayah/korong` | Daftar korong |

### Protected (butuh JWT)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST/PUT/DELETE | `/api/kategori/:id` | CRUD kategori |
| POST/PUT/DELETE | `/api/infrastruktur/:id` | CRUD infrastruktur |
| POST | `/api/infrastruktur/import` | Import dari Excel |
| GET | `/api/infrastruktur/export` | Export ke Excel |
| POST/PUT/DELETE | `/api/statistik/:id` | CRUD statistik |
| POST | `/api/statistik/import` | Import statistik dari Excel |
| GET | `/api/statistik/export` | Export statistik ke Excel |
| **POST** | **`/api/upload/foto`** | **Upload foto (JPG/PNG/WebP, maks 5MB)** |
| DELETE | `/api/upload/foto/:filename` | Hapus foto dari server |

---

## 🗺️ Kode Wilayah

Sistem hierarki kode wilayah Kabupaten Padang Pariaman:

| Level | Field | Panjang | Contoh | Catatan |
|-------|-------|---------|--------|---------|
| Kabupaten | `kdkab` | 4 digit | `1305` | Selalu tetap |
| Kecamatan | `kdkec` | 6 digit | `130501` | Dimulai dengan `1305` |
| Nagari | `kddesa` | 10 digit | `1305010001` | Dimulai dengan `kdkec` |
| Korong | `kdsls` | 12 digit | `130501000101` | Dimulai dengan `kddesa` |

---

## 📊 Template Import Excel

### Infrastruktur (kolom wajib & opsional)

| Kolom | Header | Wajib | Keterangan |
|-------|--------|-------|------------|
| A | `nama` | ✅ | Nama infrastruktur |
| B | `kategori` | ✅ | Value kategori (contoh: `restoran`) |
| C | `alamat` | ❌ | Alamat lengkap |
| D | `foto_url` | ❌ | URL foto eksternal — **kosongkan jika foto akan diupload via admin** |
| E | `lat` | ✅ | Latitude (contoh: `-0.5397`) |
| F | `lng` | ✅ | Longitude (contoh: `100.1187`) |
| G | `kdkab` | ✅ | Harus `1305` |
| H | `kdkec` | ✅ | 6 digit, dimulai `1305` |
| I | `kddesa` | ✅ | 10 digit |
| J | `kdsls` | ❌ | 12 digit (korong, opsional) |

### Statistik

| Kolom | Header | Wajib | Keterangan |
|-------|--------|-------|------------|
| A | `kdkab` | ✅ | Kode kabupaten |
| B | `kdkec` | ❌ | Kode kecamatan |
| C | `kddesa` | ❌ | Kode nagari |
| D | `kdsls` | ❌ | Kode korong |
| E | `indikator` | ✅ | Nama indikator (contoh: `Jumlah Penduduk`) |
| F | `nilai` | ✅ | Angka |
| G | `satuan` | ❌ | Satuan (contoh: `jiwa`) |
| H | `tahun` | ✅ | Tahun data (contoh: `2024`) |

---

## 🔒 Catatan Keamanan

- URL `/admin` **tidak diekspos** di navbar, footer, atau link manapun di halaman publik
- Password admin di-hash dengan **bcrypt (cost factor 10)**
- File `.env` **tidak di-commit** ke Git (ada di `.gitignore`)
- Upload foto hanya menerima file gambar (JPG/PNG/WebP), maks 5MB
- Import Excel dibatasi maks **5.000 baris** per file

---

## 📝 Lisensi

MIT License — Dikembangkan untuk Kabupaten Padang Pariaman, Sumatera Barat
