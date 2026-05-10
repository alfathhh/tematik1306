import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seed data...');

  // Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash },
  });
  console.log('✓ Admin user selesai');

  // Seed kategori infrastruktur awal
  const kategoriAwal = [
    { value: 'restoran',     label: 'Restoran',     icon: '🍽️', color: '#FF5733', urutan: 1 },
    { value: 'rumah_ibadah', label: 'Rumah Ibadah', icon: '🕌', color: '#3D9970', urutan: 2 },
    { value: 'pasar',        label: 'Pasar',        icon: '🏪', color: '#FF851B', urutan: 3 },
    { value: 'toko',         label: 'Toko',         icon: '🛒', color: '#0074D9', urutan: 4 },
    { value: 'kesehatan',    label: 'Kesehatan',    icon: '🏥', color: '#E74C3C', urutan: 5 },
    { value: 'lainnya',      label: 'Lainnya',      icon: '📍', color: '#7F8C8D', urutan: 6 },
  ];

  for (const kat of kategoriAwal) {
    await prisma.kategoriInfra.upsert({
      where: { value: kat.value },
      update: {},
      create: kat,
    });
  }
  console.log('✓ Kategori infrastruktur selesai');

  // Seed data statistik contoh
  const statistikContoh = [
    { kdkab: '1305', kdkec: '130501', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 45230, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1305', kdkec: '130502', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 38120, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1305', kdkec: '130503', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 29870, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1305', kdkec: '130501', kddesa: null, kdsls: null, indikator: 'Luas Wilayah', nilai: 42.5, satuan: 'km²', tahun: 2024 },
    { kdkab: '1305', kdkec: '130502', kddesa: null, kdsls: null, indikator: 'Luas Wilayah', nilai: 55.3, satuan: 'km²', tahun: 2024 },
    { kdkab: '1305', kdkec: '130503', kddesa: null, kdsls: null, indikator: 'Luas Wilayah', nilai: 38.8, satuan: 'km²', tahun: 2024 },
  ];

  for (const stat of statistikContoh) {
    await prisma.statistik.create({ data: stat });
  }
  console.log('✓ Data statistik contoh selesai');

  // Seed data infrastruktur contoh
  const infraContoh = [
    { nama: 'Rumah Makan Sari Raso', kategori: 'restoran', alamat: 'Jl. Raya Padang Pariaman No. 5, Sungai Limau', lat: -0.5320, lng: 100.1050, kdkab: '1305', kdkec: '130501', kddesa: '1305010001' },
    { nama: 'Masjid Raya Sungai Limau', kategori: 'rumah_ibadah', alamat: 'Jl. Masjid No. 1, Sungai Limau', lat: -0.5350, lng: 100.1100, kdkab: '1305', kdkec: '130501', kddesa: '1305010001' },
    { nama: 'Pasar Sungai Limau', kategori: 'pasar', alamat: 'Jl. Pasar Raya, Sungai Limau', lat: -0.5380, lng: 100.1120, kdkab: '1305', kdkec: '130501', kddesa: '1305010002' },
    { nama: 'Puskesmas Sungai Limau', kategori: 'kesehatan', alamat: 'Jl. Kesehatan No. 3, Sungai Limau', lat: -0.5400, lng: 100.1150, kdkab: '1305', kdkec: '130501', kddesa: '1305010002' },
    { nama: 'Toko Bangunan Maju Jaya', kategori: 'toko', alamat: 'Jl. Industri No. 7, Patamuan', lat: -0.5600, lng: 100.1300, kdkab: '1305', kdkec: '130502', kddesa: '1305020001' },
    { nama: 'Masjid Al-Ikhlas Patamuan', kategori: 'rumah_ibadah', alamat: 'Jl. Masjid Al-Ikhlas, Patamuan', lat: -0.5620, lng: 100.1320, kdkab: '1305', kdkec: '130502', kddesa: '1305020001' },
    { nama: 'Warung Makan Padang', kategori: 'restoran', alamat: 'Jl. Raya Patamuan No. 12', lat: -0.5590, lng: 100.1280, kdkab: '1305', kdkec: '130502', kddesa: '1305020002' },
    { nama: 'Klinik Sehat Bersama', kategori: 'kesehatan', alamat: 'Jl. Klinik No. 2, Patamuan', lat: -0.5610, lng: 100.1310, kdkab: '1305', kdkec: '130502', kddesa: '1305020002' },
  ];

  for (const infra of infraContoh) {
    await prisma.infrastruktur.create({ data: infra });
  }
  console.log('✓ Data infrastruktur contoh selesai');

  console.log('\n✅ Seed selesai!');
  console.log('   Admin login: username=admin, password=admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
