import React, { useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';

interface FotoUploadProps {
  value: string;       // current fotoUrl (single photo)
  onChange: (url: string) => void;
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl]   = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError('');
    const file = files[0];
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await api.post('/upload/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.fotoUrl);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Upload gagal.');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleManualSave() {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowManual(false);
      setManualUrl('');
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative w-full h-40 group rounded-xl overflow-hidden border border-neutral-200">
          <img src={value} alt="Foto infrastruktur" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              🔄 Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-xs font-medium text-white hover:bg-red-600"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      )}

      {/* Drop zone — only show when no photo */}
      {!value && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center cursor-pointer transition-colors',
            'hover:border-primary-300 hover:bg-primary-50/30',
            uploading && 'opacity-60 pointer-events-none',
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin text-primary-500">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs text-neutral-500">Mengunggah...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs text-neutral-500">Klik atau seret foto ke sini</span>
              <span className="text-[10px] text-neutral-400">JPG, PNG, WebP · maks 5MB</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Manual URL input */}
      {!showManual ? (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="text-xs text-primary-600 hover:underline"
        >
          Atau isi URL manual
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
          />
          <button
            type="button"
            onClick={handleManualSave}
            className="px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => { setShowManual(false); setManualUrl(''); }}
            className="px-3 py-2 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50"
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
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
