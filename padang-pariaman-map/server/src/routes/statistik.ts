import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import { readExcelFile, cleanupFile, createStatistikExcel, ImportError } from '../utils/excel';
import { MAX_IMPORT_ROWS } from '../constants';

const router = Router();
const prisma = new PrismaClient();

// GET /api/statistik
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { idkab, idkec, iddesa, idsls, tahun, indikator, page, limit } = req.query;

  try {
    const where: Record<string, unknown> = {};
    if (idkab)    where.idkab    = String(idkab);
    if (idkec)    where.idkec    = String(idkec);
    if (iddesa)   where.iddesa   = String(iddesa);
    if (idsls)    where.idsls    = String(idsls);
    if (tahun)    where.tahun    = parseInt(String(tahun));
    if (indikator) where.indikator = { contains: String(indikator), mode: 'insensitive' };

    const pageNum  = page  ? parseInt(String(page))  : 1;
    const limitNum = limit ? parseInt(String(limit)) : undefined;
    const skip = limitNum ? (pageNum - 1) * limitNum : undefined;

    const [data, total] = await Promise.all([
      prisma.statistik.findMany({ where, orderBy: [{ tahun: 'desc' }, { indikator: 'asc' }], skip, take: limitNum }),
      prisma.statistik.count({ where }),
    ]);

    if (limitNum) {
      res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } else {
      res.json({ data, total });
    }
  } catch (error) {
    console.error('Error GET statistik:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/statistik/export
router.get('/export', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { idkec, iddesa, tahun } = req.query;
  try {
    const where: Record<string, unknown> = {};
    if (idkec)  where.idkec  = String(idkec);
    if (iddesa) where.iddesa = String(iddesa);
    if (tahun)  where.tahun  = parseInt(String(tahun));

    const data = await prisma.statistik.findMany({ where, orderBy: { indikator: 'asc' } });
    const buffer = await createStatistikExcel(data as Record<string, unknown>[]);
    const tanggal = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="statistik_export_${tanggal}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error export statistik:', error);
    res.status(500).json({ error: 'Gagal export data' });
  }
});

// GET /api/statistik/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    const stat = await prisma.statistik.findUnique({ where: { id } });
    if (!stat) { res.status(404).json({ error: 'Data statistik tidak ditemukan' }); return; }
    res.json(stat);
  } catch (error) {
    console.error('Error GET statistik by id:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/statistik
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { idkab, idkec, iddesa, idsls, indikator, nilai, satuan, tahun } = req.body;

  if (!idkab || !indikator || nilai === undefined || !tahun) {
    res.status(400).json({ error: 'Field idkab, indikator, nilai, dan tahun wajib diisi' }); return;
  }

  const nilaiNum = parseFloat(nilai);
  const tahunNum = parseInt(tahun);
  if (isNaN(nilaiNum)) { res.status(400).json({ error: 'Field nilai harus berupa angka' }); return; }
  if (isNaN(tahunNum) || tahunNum < 2000 || tahunNum > 2100) { res.status(400).json({ error: 'Field tahun tidak valid' }); return; }

  try {
    const stat = await prisma.statistik.create({
      data: { idkab, idkec: idkec || null, iddesa: iddesa || null, idsls: idsls || null, indikator, nilai: nilaiNum, satuan: satuan || null, tahun: tahunNum },
    });
    res.status(201).json(stat);
  } catch (error) {
    console.error('Error POST statistik:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/statistik/import
router.post('/import', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: 'File Excel (.xlsx) wajib diunggah' }); return; }

  const filePath = req.file.path;
  try {
    const rows = await readExcelFile(filePath);
    if (rows.length > MAX_IMPORT_ROWS) { res.status(400).json({ error: `Jumlah baris melebihi batas maksimum ${MAX_IMPORT_ROWS}` }); return; }

    let berhasil = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nomorBaris = i + 2;
      try {
        const idkab    = String(row['idkab']    ?? '').trim();
        const idkec    = row['idkec']   ? String(row['idkec']).trim()   : null;
        const iddesa   = row['iddesa']  ? String(row['iddesa']).trim()  : null;
        const idsls    = row['idsls']   ? String(row['idsls']).trim()   : null;
        const indikator = String(row['indikator'] ?? '').trim();
        const nilai    = parseFloat(String(row['nilai'] ?? ''));
        const satuan   = row['satuan'] ? String(row['satuan']).trim() : null;
        const tahun    = parseInt(String(row['tahun'] ?? ''));

        if (!idkab)     { errors.push({ baris: nomorBaris, pesan: 'idkab tidak boleh kosong' }); continue; }
        if (!indikator) { errors.push({ baris: nomorBaris, pesan: 'indikator tidak boleh kosong' }); continue; }
        if (isNaN(nilai)) { errors.push({ baris: nomorBaris, pesan: 'nilai harus berupa angka' }); continue; }
        if (isNaN(tahun)) { errors.push({ baris: nomorBaris, pesan: 'tahun tidak valid' }); continue; }

        await prisma.statistik.create({ data: { idkab, idkec, iddesa, idsls, indikator, nilai, satuan, tahun } });
        berhasil++;
      } catch {
        errors.push({ baris: nomorBaris, pesan: 'Gagal menyimpan baris ini' });
      }
    }

    res.json({ berhasil, gagal: errors.length, errors });
  } catch (error) {
    console.error('Error import statistik:', error);
    res.status(500).json({ error: 'Gagal memproses file Excel' });
  } finally {
    cleanupFile(filePath);
  }
});

// PUT /api/statistik/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { idkab, idkec, iddesa, idsls, indikator, nilai, satuan, tahun } = req.body;

  if (!idkab || !indikator || nilai === undefined || !tahun) {
    res.status(400).json({ error: 'Field idkab, indikator, nilai, dan tahun wajib diisi' }); return;
  }

  const nilaiNum = parseFloat(nilai);
  const tahunNum = parseInt(tahun);
  if (isNaN(nilaiNum)) { res.status(400).json({ error: 'Nilai harus berupa angka' }); return; }
  if (isNaN(tahunNum)) { res.status(400).json({ error: 'Tahun tidak valid' }); return; }

  try {
    const stat = await prisma.statistik.update({
      where: { id },
      data: { idkab, idkec: idkec || null, iddesa: iddesa || null, idsls: idsls || null, indikator, nilai: nilaiNum, satuan: satuan || null, tahun: tahunNum },
    });
    res.json(stat);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') { res.status(404).json({ error: 'Data statistik tidak ditemukan' }); return; }
    console.error('Error PUT statistik:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/statistik/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await prisma.statistik.delete({ where: { id } });
    res.json({ message: 'Data statistik berhasil dihapus' });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') { res.status(404).json({ error: 'Data statistik tidak ditemukan' }); return; }
    console.error('Error DELETE statistik:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
