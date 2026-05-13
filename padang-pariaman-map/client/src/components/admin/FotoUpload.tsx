import React, { useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function FotoUpload({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError('');
    const toUpload = Array.from(files).slice(0, max - value.length);
    if (!toUpload.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append('foto', file);
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urls.push(res.data.url);
      }
      onChange([...value, ...urls]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload gagal.');
    } finally { setUploading(false); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removePhoto(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative w-16 h-16 group">
              <img src={url} alt={"Foto " + (i + 1)} className="w-full h-full object-cover rounded-xl border border-neutral-200" />
              <button type="button" onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white items-center justify-center hidden group-hover:flex shadow">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {value.length < max && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center cursor-pointer transition-colors',
            'hover:border-brand-300 hover:bg-brand-50/30',
            uploading && 'opacity-60 pointer-events-none'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin text-brand-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xs text-neutral-500">Mengunggah...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-400"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-xs text-neutral-500">Klik atau seret foto ke sini</span>
              <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP · maks {max} foto</span>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
