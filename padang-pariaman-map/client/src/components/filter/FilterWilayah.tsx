import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useKecamatan, useNagari, useKorong } from '../../hooks/useWilayah';
import { KDKAB_PADANG_PARIAMAN, NAMA_KABUPATEN } from '../../constants';

// Filter wilayah cascade: Kabupaten → Kecamatan → Nagari → Korong
export default function FilterWilayah() {
  const { kdkab, kdkec, kddesa, kdsls, setKdkec, setKddesa, setKdsls, resetWilayah } = useFilterStore();

  const { data: kecamatanList, loading: loadingKec } = useKecamatan(kdkab);
  const { data: nagariList, loading: loadingNagari } = useNagari(kdkec);
  const { data: korongList, loading: loadingKorong } = useKorong(kddesa);

  const hasFilter = kdkec !== '' || kddesa !== '' || kdsls !== '';

  return (
    <div className="space-y-2 p-1">
      {/* Kabupaten — fixed */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Kabupaten</label>
        <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed">
          {NAMA_KABUPATEN}
        </div>
      </div>

      {/* Kecamatan */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</label>
        <select
          value={kdkec}
          onChange={e => setKdkec(e.target.value)}
          disabled={loadingKec}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">-- Semua Kecamatan --</option>
          {kecamatanList.map(k => (
            <option key={k.kdkec} value={k.kdkec ?? ''}>
              {k.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Nagari */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nagari / Desa</label>
        <select
          value={kddesa}
          onChange={e => setKddesa(e.target.value)}
          disabled={!kdkec || loadingNagari}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">-- Semua Nagari --</option>
          {nagariList.map(n => (
            <option key={n.kddesa} value={n.kddesa ?? ''}>
              {n.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Korong */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Korong / Dusun</label>
        <select
          value={kdsls}
          onChange={e => setKdsls(e.target.value)}
          disabled={!kddesa || loadingKorong}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">-- Semua Korong --</option>
          {korongList.map(k => (
            <option key={k.kdsls} value={k.kdsls ?? ''}>
              {k.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Reset */}
      {hasFilter && (
        <button
          onClick={resetWilayah}
          className="w-full mt-1 text-xs text-blue-600 hover:text-blue-800 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          ↩ Reset ke seluruh kabupaten
        </button>
      )}
    </div>
  );
}
