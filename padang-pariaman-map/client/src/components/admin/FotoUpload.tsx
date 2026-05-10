import React, { useRef, useState } from 'react';
import api from '../../lib/api';

interface FotoUploadProps {
  value: string;                    // fotoUrl saat ini
  onChange: (url: string) => void;  // dipanggil setelah upload berhasil atau URL manual diubah
}

/**
 * Komponen upload foto infrastruktur.
 * - Drag & drop atau klik untuk pilih file (jpg/jpeg/png/webp, max 5MB)
 * - Preview gambar setelah dipilih / sudah ada URL
 * - Upload ke POST /api/upload/foto → dapat fotoUrl
 * - Bisa juga isi URL manual (toggle)
 */
export default function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [dragging, setDragging]   = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Tentukan apakah URL adalah upload lokal atau eksternal
  const isLocalUpload = value.startsWith('/uploads/');
  // URL untuk preview — lokal perlu prefix base URL server
  const previewUrl = isLocalUpload
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${value}`
    : value;

  const handleFile = async (file: File) => {
    setError('');

    // Validasi tipe
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validasi ukuran (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const res = await api.post('/upload/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onChange(res.data.fotoUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Gagal mengupload foto';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset agar bisa pilih file yang sama lagi
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600">Foto</label>
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
        >
          {showManual ? 'Sembunyikan URL manual' : 'Atau isi URL manual'}
        </button>
      </div>

      {/* Preview jika sudah ada foto */}
      {value && (
        <div className="relative group w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={previewUrl}
            alt="Preview foto"
            className="w-full h-36 object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x160?text=Foto+Tidak+Ditemukan';
            }}
          />
          {/* Overlay tombol hapus */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100"
            >
              🔄 Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-red-600"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      )}

      {/* Drop zone — tampil jika belum ada foto */}
      {!value && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2
            cursor-pointer transition-colors select-none
            ${dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}
            ${uploading ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Mengupload foto...</p>
            </>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <p className="text-xs text-gray-500 text-center">
                <span className="font-medium text-blue-600">Klik untuk pilih</span> atau drag & drop
              </p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP — maks. 5MB</p>
            </>
          )}
        </div>
      )}

      {/* Input file tersembunyi */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Input URL manual (toggle) */}
      {showManual && (
        <div>
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/foto.jpg"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">
            Masukkan URL gambar yang sudah ada di internet
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
