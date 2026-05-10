import multer from 'multer';
import path from 'path';

// Konfigurasi multer untuk upload file Excel ke /tmp
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, '/tmp');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter: hanya terima file .xlsx
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file .xlsx yang diperbolehkan'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // maksimal 10MB
});
