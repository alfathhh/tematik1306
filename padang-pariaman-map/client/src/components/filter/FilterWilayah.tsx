import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useKecamatan, useNagari, useKorong } from '../../hooks/useWilayah';
import { KDKAB_PADANG_PARIAMAN, NAMA_KABUPATEN } from '../../constants';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

/**
 * FilterWilayah — cascade dropdown: Kabupaten → Kecamatan → Nagari → Korong.
 * State: useFilterStore (kdkec, kddesa, kdsls, setKdkec, setKddesa, setKdsls, resetWilayah)
 * Data: hooks useKecamatan / useNagari / useKorong
 *
 * Fix: sebelumnya mengimport useWilayahStore dari 'store/wilayahStore' yang tidak ada,
 * dan menggunakan <Select options={[...]}> (prop tidak ada di komponen Select).
 * Sekarang menggunakan useFilterStore + hooks + <option> children.
 */
export default function FilterWilayah() {
  const {
    kdkab, kdkec, kddesa, kdsls,
    setKdkec, setKddesa, setKdsls, resetWilayah,
  } = useFilterStore();

  const { data: kecamatanList, loading: loadingKec }    = useKecamatan(kdkab);
  const { data: nagariList,    loading: loadingNagari } = useNagari(kdkec);
  const { data: korongList,    loading: loadingKorong } = useKorong(kddesa);

  const hasFilter = kdkec !== '' || kddesa !== '' || kdsls !== '';

  // Label untuk breadcrumb
  const kecLabel = kecamatanList.find(k => k.kdkec  === kdkec)?.nama;
  const nagLabel = nagariList.find(n  => n.kddesa   === kddesa)?.nama;
  const korLabel = korongList.find(k  => k.kdsls    === kdsls)?.nama;

  return (
    <div className="space-y-3 p-1">
      {/* Breadcrumb wilayah aktif */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-1 text-[11px] px-2 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
          <span className="font-medium text-primary-700">📍</span>
          <span className="text-primary-600">{NAMA_KABUPATEN}</span>
          {kecLabel && (
            <>
              <span className="text-primary-300">›</span>
              <span className="text-primary-600">{kecLabel}</span>
            </>
          )}
          {nagLabel && (
            <>
              <span className="text-primary-300">›</span>
              <span className="text-primary-600">{nagLabel}</span>
            </>
          )}
          {korLabel && (
            <>
              <span className="text-primary-300">›</span>
              <span className="text-primary-600">{korLabel}</span>
            </>
          )}
        </div>
      )}

      {/* Kabupaten — fixed, tidak bisa diubah */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Kabupaten
        </label>
        <div className="h-10 flex items-center px-3.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 cursor-not-allowed select-none">
          {NAMA_KABUPATEN}
        </div>
      </div>

      {/* Kecamatan — gunakan <option> children, bukan prop options */}
      <Select
        label="Kecamatan"
        value={kdkec}
        onChange={e => setKdkec(e.target.value)}
        disabled={loadingKec}
      >
        <option value="">Semua Kecamatan</option>
        {kecamatanList.map(k => (
          <option key={k.kdkec} value={k.kdkec ?? ''}>
            {k.nama}
          </option>
        ))}
      </Select>

      {/* Nagari */}
      <Select
        label="Nagari / Desa"
        value={kddesa}
        onChange={e => setKddesa(e.target.value)}
        disabled={!kdkec || loadingNagari}
      >
        <option value="">Semua Nagari</option>
        {nagariList.map(n => (
          <option key={n.kddesa} value={n.kddesa ?? ''}>
            {n.nama}
          </option>
        ))}
      </Select>

      {/* Korong */}
      <Select
        label="Korong / Dusun"
        value={kdsls}
        onChange={e => setKdsls(e.target.value)}
        disabled={!kddesa || loadingKorong}
      >
        <option value="">Semua Korong</option>
        {korongList.map(k => (
          <option key={k.kdsls} value={k.kdsls ?? ''}>
            {k.nama}
          </option>
        ))}
      </Select>

      {/* Tombol Reset */}
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={resetWilayah}
          className="text-primary-600 hover:bg-primary-50"
          leftIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 3v5h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Reset ke seluruh kabupaten
        </Button>
      )}
    </div>
  );
}
