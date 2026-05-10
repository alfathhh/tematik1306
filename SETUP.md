# Setup Guide - Peta Tematik Padang Pariaman

> **Panduan lengkap untuk setup dan menjalankan aplikasi Peta Tematik Interaktif Kabupaten Padang Pariaman.**

## ⚠️ PENTING: Project Structure

Ini adalah **monorepo** dengan struktur:

```
padang-pariaman-map/
├── server/          ← Backend (Express + Prisma + PostgreSQL)
└── client/          ← Frontend (React + Vite)
```

**Setiap folder adalah package yang terpisah dengan dependencies sendiri.**

---

## Prerequisites

- **Node.js** v20+ (cek dengan `node --version`)
- **npm** v9+ atau **yarn** (cek dengan `npm --version`)
- **PostgreSQL** 15+ running dan accessible
- **Git** untuk version control

---

## Step 1: Clone Repository

```bash
git clone https://github.com/alfathhh/tematik1306.git
cd tematik1306/padang-pariaman-map
```

---

## Step 2: Setup Backend

Backend berisi database schema dan API endpoints.

### 2.1 Install Dependencies

```bash
cd server
npm install
```

### 2.2 Setup Environment Variables

Copy `.env.example` menjadi `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/tematik1306"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
```

**Catatan:**
- `DATABASE_URL`: Sesuaikan dengan kredensial PostgreSQL Anda
- `JWT_SECRET`: Gunakan random string yang kuat (minimal 32 karakter)
- `PORT`: Port untuk backend (default: 3001)

### 2.3 Generate Prisma Client

```bash
npm run prisma:generate
```

✅ **Output yang diharapkan:**
```
Prisma Client has been successfully generated
```

### 2.4 Setup Database (Migration)

Pastikan PostgreSQL running, kemudian jalankan:

```bash
npm run prisma:migrate
```

Jika diminta nama migration, ketik: `init`

✅ **Output yang diharapkan:**
```
✔ Generated Prisma Client (X.X.X in Ym)
✔ Successfully created 4 new tables in your database
```

### 2.5 Seed Data Awal

Tambahkan kategori infrastruktur dan admin user default:

```bash
npm run prisma:seed
```

✅ **Verifikasi:** Buka Prisma Studio untuk melihat data:

```bash
npm run prisma:studio
```

Akan membuka browser di `http://localhost:5555`. Pastikan ada tabel:
- `admin_users` (1 record: username `admin`, password `admin123`)
- `kategori_infra` (6 records: restoran, rumah_ibadah, pasar, dll.)

### 2.6 Jalankan Backend Development Server

```bash
npm run dev
```

✅ **Output yang diharapkan:**
```
Server running on port 3001
```

**Cek apakah backend berjalan:**

```bash
# Di terminal lain, test endpoint publik
curl http://localhost:3001/api/kategori
```

Harusnya return JSON array kategori.

---

## Step 3: Setup Frontend

Frontend adalah React app yang terpisah dari backend.

### 3.1 Install Dependencies

```bash
# Dari folder root padang-pariaman-map
cd ../client
npm install
```

✅ **Verifikasi:** Pastikan tidak ada error di output.

### 3.2 Setup Environment Variables (Opsional)

Jika backend berjalan di host/port berbeda, buat `.env.local`:

```bash
VITE_API_URL=http://localhost:3001
```

Jika tidak ada, default-nya sudah `http://localhost:3001`.

### 3.3 Jalankan Frontend Development Server

```bash
npm run dev
```

✅ **Output yang diharapkan:**
```
VITE v5.X.X ready in X ms

➜ Local: http://localhost:5173/
```

Buka browser ke `http://localhost:5173`

---

## ✅ Verifikasi Setup Lengkap

Pastikan kedua server berjalan:

1. **Backend** di `http://localhost:3001`
   - Test: `curl http://localhost:3001/api/kategori`
   - Harusnya return: `[{ id: 1, value: "restoran", ... }, ...]`

2. **Frontend** di `http://localhost:5173`
   - Buka browser, seharusnya melihat peta Padang Pariaman
   - Coba filter kategori (sidebar kiri)
   - Coba login admin di `/admin`
   - Username: `admin`, Password: `admin123`

---

## 🔧 Troubleshooting

### Error: "Prisma schema not found"

```
Error: Could not find Prisma Schema that is required for this command.
```

**Penyebab:** Menjalankan `prisma` command dari folder yang salah.

**Solusi:** **Selalu jalankan Prisma command dari folder `server/`**

```bash
cd server
npm run prisma:generate     # ✅ Benar
npm run prisma:migrate      # ✅ Benar
npm run prisma:seed         # ✅ Benar

# JANGAN jalankan dari client folder:
cd ../client
npm run prisma:generate     # ❌ AKAN ERROR
```

### Error: "database connection failed"

```
Can't reach database server at `localhost:5432`
```

**Penyebab:** PostgreSQL tidak running atau `DATABASE_URL` salah.

**Solusi:**

1. Pastikan PostgreSQL running:
   - **Windows (pgAdmin):** Buka Services → PostgreSQL harus "Running"
   - **macOS (Homebrew):** `brew services start postgresql@15`
   - **Linux:** `sudo systemctl start postgresql`

2. Verifikasi `DATABASE_URL` di `server/.env` benar

3. Test koneksi:
   ```bash
   psql "postgresql://username:password@localhost:5432/tematik1306"
   ```

### Error: "PORT 3001 already in use"

**Solusi:** Ganti PORT di `server/.env` atau kill process yang menggunakan port tersebut:

```bash
# Linux/macOS
lsof -i :3001          # Cari PID
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: "ECONNREFUSED" saat login admin

Berarti frontend tidak bisa connect ke backend.

**Solusi:**

1. Pastikan backend running: `cd server && npm run dev`
2. Cek `VITE_API_URL` di frontend (harus sesuai backend port)
3. Test backend: `curl http://localhost:3001/api/kategori`

---

## 📝 Catatan Penting

### Prisma Schema Location

- **Schema file:** `server/prisma/schema.prisma`
- **Semua Prisma command harus dari `server/` folder**
- Client tidak perlu Prisma; menggunakan types dari `@prisma/client` di server

### Admin User Default

- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ **Ubah password di production!** Buka Prisma Studio dan hash password baru dengan bcrypt.

### Database Credentials

Jangan commit `.env` ke Git! File sudah ada di `.gitignore`.

---

## 🚀 Development Workflow

Setiap kali membuka project:

```bash
# Terminal 1: Jalankan backend
cd padang-pariaman-map/server
npm run dev

# Terminal 2: Jalankan frontend
cd padang-pariaman-map/client
npm run dev
```

Kedua server harus running bersamaan untuk dev experience optimal.

---

## 📚 Referensi Lengkap

- **PROMPT.md** — Dokumentasi teknis lengkap aplikasi
- **PRD.md** — Product Requirements Document
- **Prisma Docs:** https://www.prisma.io/docs/
- **React Leaflet:** https://react-leaflet.js.org/
- **Tailwind CSS:** https://tailwindcss.com/

---

## ❓ Pertanyaan?

Jika ada error atau pertanyaan:

1. Baca dokumentasi di PROMPT.md atau PRD.md
2. Cek bagian Troubleshooting di atas
3. Buka GitHub Issues untuk report bug
