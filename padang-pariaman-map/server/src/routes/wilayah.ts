import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/wilayah/kecamatan?kdkab=1305
// Ambil daftar kecamatan unik berdasarkan data infrastruktur yang ada
router.get('/kecamatan', async (req: Request, res: Response): Promise<void> => {
  const { kdkab } = req.query;

  if (!kdkab) {
    res.status(400).json({ error: 'Parameter kdkab wajib diisi' });
    return;
  }

  try {
    // Ambil kecamatan unik dari tabel infrastruktur
    const kecamatanRaw = await prisma.infrastruktur.findMany({
      where: { kdkab: String(kdkab) },
      select: { kdkec: true },
      distinct: ['kdkec'],
      orderBy: { kdkec: 'asc' },
    });

    // Juga cek dari statistik
    const kecamatanStat = await prisma.statistik.findMany({
      where: { kdkab: String(kdkab), kdkec: { not: null } },
      select: { kdkec: true },
      distinct: ['kdkec'],
    });

    // Gabungkan dan deduplikasi
    const allKdkec = new Set([
      ...kecamatanRaw.map(k => k.kdkec),
      ...kecamatanStat.map(k => k.kdkec).filter(Boolean),
    ]);

    // Map ke format { kdkec, nama }
    // Nama kecamatan diambil dari kode (sementara menggunakan label berbasis kode)
    const kecamatan = Array.from(allKdkec).sort().map(kdkec => ({
      kdkec,
      nama: `Kecamatan ${kdkec}`,
    }));

    res.json(kecamatan);
  } catch (error) {
    console.error('Error GET kecamatan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/wilayah/nagari?kdkec=130501
// Ambil daftar nagari unik berdasarkan data infrastruktur yang ada
router.get('/nagari', async (req: Request, res: Response): Promise<void> => {
  const { kdkec } = req.query;

  if (!kdkec) {
    res.status(400).json({ error: 'Parameter kdkec wajib diisi' });
    return;
  }

  try {
    const nagariRaw = await prisma.infrastruktur.findMany({
      where: { kdkec: String(kdkec) },
      select: { kddesa: true },
      distinct: ['kddesa'],
      orderBy: { kddesa: 'asc' },
    });

    const nagariStat = await prisma.statistik.findMany({
      where: { kdkec: String(kdkec), kddesa: { not: null } },
      select: { kddesa: true },
      distinct: ['kddesa'],
    });

    const allKddesa = new Set([
      ...nagariRaw.map(n => n.kddesa),
      ...nagariStat.map(n => n.kddesa).filter(Boolean),
    ]);

    const nagari = Array.from(allKddesa).sort().map(kddesa => ({
      kddesa,
      nama: `Nagari ${kddesa}`,
    }));

    res.json(nagari);
  } catch (error) {
    console.error('Error GET nagari:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/wilayah/korong?kddesa=1305010001
// Ambil daftar korong unik berdasarkan data infrastruktur yang ada
router.get('/korong', async (req: Request, res: Response): Promise<void> => {
  const { kddesa } = req.query;

  if (!kddesa) {
    res.status(400).json({ error: 'Parameter kddesa wajib diisi' });
    return;
  }

  try {
    const korongRaw = await prisma.infrastruktur.findMany({
      where: {
        kddesa: String(kddesa),
        kdsls: { not: null },
      },
      select: { kdsls: true },
      distinct: ['kdsls'],
      orderBy: { kdsls: 'asc' },
    });

    const korong = korongRaw
      .filter(k => k.kdsls !== null)
      .map(k => ({
        kdsls: k.kdsls!,
        nama: `Korong ${k.kdsls}`,
      }));

    res.json(korong);
  } catch (error) {
    console.error('Error GET korong:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
