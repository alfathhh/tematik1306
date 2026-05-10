import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import { readExcelFile, cleanupFile, createInfrastrukturExcel, ImportError } from '../utils/excel';
import { KDKAB_PADANG_PARIAMAN, MAX_IMPORT_ROWS } from '../constants';

const router = Router();
const prisma = new PrismaClient();

// GET /api/infrastruktur — Ambil daftar infrastruktur dengan filter
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { kategori, kdkab, kdkec, kddesa, kdsls, search, page, limit } = req.query;

  try {
    const where: Record<string, unknown> = {};

    // Filter kategori (bisa multiple, pisahkan koma)
    if (kategori) {
      const katList = String(kategori).split(',').map(k => k.trim()).filter(Boolean);
      if (katList.length === 1) {
        where.kategori = katList[0];
      } else if (katList.length > 1) {
        where.kategori = { in: katList };
      }
    }

    if (kdkab)  where.kdkab  = String(kdkab);
    if (kdkec)  where.kdkec  = String(kdkec);
    if (kddesa) where.kddesa = String(kddesa);
    if (kdsls)  where.kdsls  = String(kdsls);

    // Search by nama (case-insensitive)
    if (search) {
      where.nama = { contains: String(search), mode: 'insensitive' };
    }

    // Pagination (untuk admin)
    const pageNum  = page  ? parseInt(String(page))  : 1;
    const limitNum = limit ? parseInt(String(limit)) : undefined;
    const skip = limitNum ? (pageNum - 1) * limitNum : undefined;

    const [data, total] = await Promise.all([
      prisma.infrastruktur.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.infrastruktur.count({ where }),
    ]);

    if (limitNum) {
      res.json({
        data,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } else {
      res.json({ data, total });
    }
  } catch (error) {
    console.error('Error GET infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/infrastruktur/export — Export ke Excel (admin) — harus sebelum /:id
router.get('/export', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { kdkec, kddesa, kategori } = req.query;

  try {
    const where: Record<string, unknown> = {};
    if (kdkec)    where.kdkec    = String(kdkec);
    if (kddesa)   where.kddesa   = String(kddesa);
    if (kategori) where.kategori = String(kategori);

    const data = await prisma.infrastruktur.findMany({ where, orderBy: { nama: 'asc' } });

    const buffer = await createInfrastrukturExcel(data as Record<string, unknown>[]);
    const tanggal = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="infrastruktur_export_${tanggal}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error export infrastruktur:', error);
    res.status(500).json({ error: 'Gagal export data' });
  }
});

// GET /api/infrastruktur/:id — Ambil satu infrastruktur
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  try {
    const infra = await prisma.infrastruktur.findUnique({ where: { id } });
    if (!infra) {
      res.status(404).json({ error: 'Infrastruktur tidak ditemukan' });
      return;
    }
    res.json(infra);
  } catch (error) {
    console.error('Error GET infrastruktur by id:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/infrastruktur — Tambah infrastruktur baru (admin)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { nama, kategori, alamat, fotoUrl, lat, lng, kdkab, kdkec, kddesa, kdsls } = req.body;

  if (!nama || !kategori || lat === undefined || lng === undefined || !kdkab || !kdkec || !kddesa) {
    res.status(400).json({ error: 'Field nama, kategori, lat, lng, kdkab, kdkec, kddesa wajib diisi' });
    return;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    res.status(400).json({ error: 'Latitude tidak valid (harus antara -90 dan 90)' });
    return;
  }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    res.status(400).json({ error: 'Longitude tidak valid (harus antara -180 dan 180)' });
    return;
  }

  try {
    const infra = await prisma.infrastruktur.create({
      data: { nama, kategori, alamat, fotoUrl, lat: latNum, lng: lngNum, kdkab, kdkec, kddesa, kdsls: kdsls || null },
    });
    res.status(201).json(infra);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2003') {
      res.status(400).json({ error: 'Kategori tidak valid' });
      return;
    }
    console.error('Error POST infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/infrastruktur/import — Import dari Excel (admin)
router.post('/import', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'File Excel (.xlsx) wajib diunggah' });
    return;
  }

  const filePath = req.file.path;

  try {
    const rows = await readExcelFile(filePath);

    if (rows.length > MAX_IMPORT_ROWS) {
      res.status(400).json({ error: `Jumlah baris melebihi batas maksimum ${MAX_IMPORT_ROWS} baris` });
      return;
    }

    // Ambil semua kategori yang valid dari DB
    const kategoriValid = await prisma.kategoriInfra.findMany({ select: { value: true } });
    const kategoriSet = new Set(kategoriValid.map(k => k.value));

    let berhasil = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nomorBaris = i + 2; // +2 karena baris 1 adalah header

      try {
        const nama      = String(row['nama'] ?? '').trim();
        const kategori  = String(row['kategori'] ?? '').trim();
        const alamat    = row['alamat'] ? String(row['alamat']).trim() : null;
        // foto_url opsional — bisa dikosongkan di Excel, foto bisa diupload lewat admin panel
        const fotoUrl   = row['foto_url'] ? String(row['foto_url']).trim() : null;
        const lat       = parseFloat(String(row['lat'] ?? ''));
        const lng       = parseFloat(String(row['lng'] ?? ''));
        const kdkab     = String(row['kdkab'] ?? '').trim();
        const kdkec     = String(row['kdkec'] ?? '').trim();
        const kddesa    = String(row['kddesa'] ?? '').trim();
        const kdsls     = row['kdsls'] ? String(row['kdsls']).trim() : null;

        // Validasi field wajib
        if (!nama) { errors.push({ baris: nomorBaris, pesan: 'Kolom nama tidak boleh kosong' }); continue; }
        if (!kategori || !kategoriSet.has(kategori)) { errors.push({ baris: nomorBaris, pesan: `Kategori "${kategori}" tidak valid` }); continue; }
        if (isNaN(lat) || lat < -90 || lat > 90) { errors.push({ baris: nomorBaris, pesan: 'Latitude tidak valid' }); continue; }
        if (isNaN(lng) || lng < -180 || lng > 180) { errors.push({ baris: nomorBaris, pesan: 'Longitude tidak valid' }); continue; }
        if (kdkab !== KDKAB_PADANG_PARIAMAN) { errors.push({ baris: nomorBaris, pesan: `kdkab harus "${KDKAB_PADANG_PARIAMAN}"` }); continue; }
        if (kdkec.length !== 6 || !kdkec.startsWith(KDKAB_PADANG_PARIAMAN)) { errors.push({ baris: nomorBaris, pesan: 'kdkec tidak valid (harus 6 digit, dimulai dengan 1305)' }); continue; }
        if (kddesa.length !== 10 || !kddesa.startsWith(kdkec)) { errors.push({ baris: nomorBaris, pesan: 'kddesa tidak valid (harus 10 digit)' }); continue; }
        if (kdsls && (kdsls.length !== 12 || !kdsls.startsWith(kddesa))) { errors.push({ baris: nomorBaris, pesan: 'kdsls tidak valid (harus 12 digit)' }); continue; }
        // Validasi URL foto jika diisi (opsional)
        if (fotoUrl && !fotoUrl.startsWith('http://') && !fotoUrl.startsWith('https://') && !fotoUrl.startsWith('/uploads/')) {
          errors.push({ baris: nomorBaris, pesan: 'foto_url harus berupa URL valid (http/https) — biarkan kosong jika belum ada foto' }); continue;
        }

        await prisma.infrastruktur.create({
          data: { nama, kategori, alamat, fotoUrl, lat, lng, kdkab, kdkec, kddesa, kdsls },
        });
        berhasil++;
      } catch {
        errors.push({ baris: nomorBaris, pesan: 'Gagal menyimpan baris ini' });
      }
    }

    res.json({ berhasil, gagal: errors.length, errors });
  } catch (error) {
    console.error('Error import infrastruktur:', error);
    res.status(500).json({ error: 'Gagal memproses file Excel' });
  } finally {
    cleanupFile(filePath);
  }
});

// PUT /api/infrastruktur/:id — Edit infrastruktur (admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { nama, kategori, alamat, fotoUrl, lat, lng, kdkab, kdkec, kddesa, kdsls } = req.body;

  if (!nama || !kategori || lat === undefined || lng === undefined || !kdkab || !kdkec || !kddesa) {
    res.status(400).json({ error: 'Field nama, kategori, lat, lng, kdkab, kdkec, kddesa wajib diisi' });
    return;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    res.status(400).json({ error: 'Latitude tidak valid' }); return;
  }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    res.status(400).json({ error: 'Longitude tidak valid' }); return;
  }

  try {
    const infra = await prisma.infrastruktur.update({
      where: { id },
      data: { nama, kategori, alamat, fotoUrl, lat: latNum, lng: lngNum, kdkab, kdkec, kddesa, kdsls: kdsls || null },
    });
    res.json(infra);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Infrastruktur tidak ditemukan' }); return;
    }
    console.error('Error PUT infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/infrastruktur/:id — Hapus infrastruktur (admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  try {
    await prisma.infrastruktur.delete({ where: { id } });
    res.json({ message: 'Infrastruktur berhasil dihapus' });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Infrastruktur tidak ditemukan' }); return;
    }
    console.error('Error DELETE infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
