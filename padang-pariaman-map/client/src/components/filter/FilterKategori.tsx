import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { KategoriInfra } from '../../types';
import { useFilterStore } from '../../store/filterStore';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

/**
 * FilterKategori — daftar chip kategori infrastruktur.
 * State: useFilterStore (kategoriAktif, toggleKategori, setKategoriAktif)
 * Data: fetch GET /api/kategori sekali saat mount
 *
 * Fix: sebelumnya mengimport useKategoriStore dari 'store/kategoriStore'
 * yang tidak ada. Sekarang menggunakan useFilterStore + api langsung.
 */
export default function FilterKategori() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [loading, setLoading]           = useState(true);
  const { kategoriAktif, toggleKategori, setKategoriAktif } = useFilterStore();

  useEffect(() => {
    api.get('/kategori')
      .then(res => setKategoriList(res.data))
      .catch(err => console.error('Gagal memuat kategori:', err))
      .finally(() => setLoading(false));
  }, []);

  const semuaAktif =
    kategoriList.length > 0 &&
    kategoriList.every(k => kategoriAktif.includes(k.value));

  const toggleSemua = () => {
    if (semuaAktif) setKategoriAktif([]);
    else setKategoriAktif(kategoriList.map(k => k.value));
  };

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (kategoriList.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-neutral-400">Tidak ada kategori tersedia</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {/* Tombol Semua */}
      <button
        type="button"
        onClick={toggleSemua}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-250',
          'focus:outline-none focus-visible:shadow-focus',
          semuaAktif
            ? 'bg-primary-50 text-primary-700 border border-primary-200'
            : 'text-neutral-600 hover:bg-neutral-50 border border-transparent',
        )}
      >
        <span className="text-base" aria-hidden="true">🗺️</span>
        <span className="flex-1 text-left text-xs">Tampilkan Semua</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-neutral-100 my-1" role="separator" />

      {/* Daftar kategori */}
      {kategoriList.map(kat => {
        const aktif = kategoriAktif.includes(kat.value);
        // Gunakan kat.color (bukan kat.warna — field di KategoriInfra adalah 'color')
        const warnaHex = kat.color;

        return (
          <label
            key={kat.value}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors duration-250',
              'focus-within:shadow-focus',
              aktif ? 'border border-opacity-40' : 'hover:bg-neutral-50 border border-transparent',
            )}
            style={aktif ? {
              backgroundColor: `${warnaHex}12`,
              borderColor:     `${warnaHex}40`,
            } : undefined}
          >
            {/* Checkbox tersembunyi (a11y) */}
            <input
              type="checkbox"
              checked={aktif}
              onChange={() => toggleKategori(kat.value)}
              className="sr-only"
              aria-label={`Filter kategori ${kat.label}`}
            />

            {/* Kotak centang kustom */}
            <span
              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all border"
              style={aktif ? {
                backgroundColor: warnaHex,
                borderColor:     warnaHex,
              } : {
                borderColor:     '#cbd5e1',
                backgroundColor: 'white',
              }}
              aria-hidden="true"
            >
              {aktif && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>

            {/* Ikon emoji */}
            <span className="text-base leading-none flex-shrink-0" aria-hidden="true">
              {kat.icon}
            </span>

            {/* Label */}
            <span className="text-xs font-medium text-neutral-700 flex-1">
              {kat.label}
            </span>

            {/* Dot warna */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: warnaHex }}
              aria-hidden="true"
            />
          </label>
        );
      })}
    </div>
  );
}
