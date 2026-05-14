import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';

interface FotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

type RasioFoto = '16/9' | '4/3' | '1/1';

interface PengaturanCrop {
  rasio: RasioFoto;
  zoom: number;
  posisiX: number;
  posisiY: number;
}

interface UkuranGambar {
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const RASIO_LABEL: Record<RasioFoto, string> = {
  '16/9': '16:9',
  '4/3': '4:3',
  '1/1': '1:1',
};

const DEFAULT_CROP: PengaturanCrop = {
  rasio: '16/9',
  zoom: 1,
  posisiX: 50,
  posisiY: 50,
};

function buatNamaFile(namaAsli: string) {
  const namaDasar = namaAsli.replace(/\.[^.]+$/, '') || 'foto-infrastruktur';
  return `${namaDasar}-crop.jpg`;
}

function getRasioAngka(rasio: RasioFoto) {
  const [rasioW, rasioH] = rasio.split('/').map(Number);
  return rasioW / rasioH;
}

async function cropFoto(file: File, crop: PengaturanCrop): Promise<File> {
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Gagal membaca foto.'));
      image.src = imageUrl;
    });

    const [rasioW, rasioH] = crop.rasio.split('/').map(Number);
    const targetW = 1280;
    const targetH = Math.round((targetW * rasioH) / rasioW);
    const baseScale = Math.max(targetW / image.naturalWidth, targetH / image.naturalHeight);
    const scale = baseScale * crop.zoom;
    const scaledW = image.naturalWidth * scale;
    const scaledH = image.naturalHeight * scale;
    const drawX = (targetW - scaledW) * (crop.posisiX / 100);
    const drawY = (targetH - scaledH) * (crop.posisiY / 100);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Browser tidak mendukung editor foto.');

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(image, drawX, drawY, scaledW, scaledH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    if (!blob) throw new Error('Gagal membuat hasil crop foto.');

    return new File([blob], buatNamaFile(file.name), { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftUrl, setDraftUrl] = useState('');
  const [crop, setCrop] = useState<PengaturanCrop>(DEFAULT_CROP);
  const [imageSize, setImageSize] = useState<UkuranGambar | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(false);

  const posisiFoto = useMemo(() => {
    if (!imageSize) return undefined;

    const frameAspect = getRasioAngka(crop.rasio);
    const imageAspect = imageSize.width / imageSize.height;
    const baseWidth = imageAspect > frameAspect ? (imageAspect / frameAspect) * 100 : 100;
    const baseHeight = imageAspect > frameAspect ? 100 : (frameAspect / imageAspect) * 100;
    const width = baseWidth * crop.zoom;
    const height = baseHeight * crop.zoom;

    return {
      width: `${width}%`,
      height: `${height}%`,
      left: `${(100 - width) * (crop.posisiX / 100)}%`,
      top: `${(100 - height) * (crop.posisiY / 100)}%`,
    };
  }, [crop.posisiX, crop.posisiY, crop.rasio, crop.zoom, imageSize]);

  useEffect(() => {
    return () => {
      if (draftUrl) URL.revokeObjectURL(draftUrl);
    };
  }, [draftUrl]);

  function resetDraft() {
    if (draftUrl) URL.revokeObjectURL(draftUrl);
    setDraftUrl('');
    setDraftFile(null);
    setImageSize(null);
    setCrop(DEFAULT_CROP);
  }

  function pilihFile(file: File) {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 5MB.');
      return;
    }

    resetDraft();
    setDraftFile(file);
    setDraftUrl(URL.createObjectURL(file));
  }

  async function editFotoAktif() {
    if (!value) return;

    setLoadingEditor(true);
    setError('');

    try {
      const res = await fetch(value, { mode: 'cors' });
      if (!res.ok) throw new Error('Foto tidak bisa dimuat.');

      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('File foto tidak valid.');
      }

      const file = new File([blob], 'foto-infrastruktur.jpg', {
        type: blob.type || 'image/jpeg',
      });
      resetDraft();
      setDraftFile(file);
      setDraftUrl(URL.createObjectURL(file));
    } catch {
      setError('Foto ini tidak bisa diedit langsung. Pilih ulang file foto dari perangkat.');
    } finally {
      setLoadingEditor(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) pilihFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  async function uploadFoto(file: File) {
    setUploading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await api.post('/upload/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.fotoUrl);
      resetDraft();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Upload gagal.');
    } finally {
      setUploading(false);
    }
  }

  async function handleGunakanFoto() {
    if (!draftFile) return;

    try {
      const croppedFile = await cropFoto(draftFile, crop);
      await uploadFoto(croppedFile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memproses foto.');
    }
  }

  function handleManualSave() {
    if (manualUrl.trim()) {
      resetDraft();
      onChange(manualUrl.trim());
      setShowManual(false);
      setManualUrl('');
    }
  }

  return (
    <div className="space-y-3">
      {draftUrl ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div
            className="relative w-full overflow-hidden rounded-lg bg-neutral-100"
            style={{ aspectRatio: crop.rasio }}
          >
            <img
              src={draftUrl}
              alt="Editor crop foto"
              className="absolute max-w-none select-none object-cover"
              draggable={false}
              onLoad={(e) => {
                setImageSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                });
              }}
              style={posisiFoto}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(RASIO_LABEL) as RasioFoto[]).map((rasio) => (
                <button
                  key={rasio}
                  type="button"
                  onClick={() => setCrop((prev) => ({ ...prev, rasio }))}
                  className={cn(
                    'min-w-12 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    crop.rasio === rasio
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  {RASIO_LABEL[rasio]}
                </button>
              ))}
            </div>

            <div className="grid gap-2">
              <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs text-neutral-600">
                <span>Zoom</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.4"
                  step="0.05"
                  value={crop.zoom}
                  onChange={(e) => setCrop((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
                />
              </label>
              <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs text-neutral-600">
                <span>Geser X</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crop.posisiX}
                  onChange={(e) => setCrop((prev) => ({ ...prev, posisiX: Number(e.target.value) }))}
                />
              </label>
              <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs text-neutral-600">
                <span>Geser Y</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crop.posisiY}
                  onChange={(e) => setCrop((prev) => ({ ...prev, posisiY: Number(e.target.value) }))}
                />
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetDraft}
              disabled={uploading}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
            >
              Ganti file
            </button>
            <button
              type="button"
              onClick={handleGunakanFoto}
              disabled={uploading}
              className="rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
            >
              {uploading ? 'Mengunggah...' : 'Gunakan foto'}
            </button>
          </div>
        </div>
      ) : value ? (
        <div className="group relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <div className="aspect-video w-full">
            <img src={value} alt="Foto infrastruktur" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/40 p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={editFotoAktif}
              disabled={loadingEditor}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              {loadingEditor ? 'Memuat...' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Ganti file
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          className={cn(
            'flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-5 text-center transition-colors',
            'hover:border-primary-300 hover:bg-primary-50/30',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="mt-2 text-sm font-medium text-neutral-600">Klik atau seret foto ke sini</span>
          <span className="mt-1 text-xs text-neutral-400">JPG, PNG, WebP maks. 5MB</span>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {!showManual ? (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="text-xs text-primary-600 hover:underline"
        >
          Atau isi URL manual
        </button>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="min-w-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400/40"
          />
          <button
            type="button"
            onClick={handleManualSave}
            className="rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => { setShowManual(false); setManualUrl(''); }}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
          >
            Batal
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
