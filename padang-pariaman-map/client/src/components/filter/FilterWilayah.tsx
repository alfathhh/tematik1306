import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import {
  useKecamatanGeoJSON,
  useNagariGeoJSON,
  useKorongGeoJSON,
} from '../../hooks/useWilayahGeoJSON';
import { NAMA_KABUPATEN } from '../../constants';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export default function FilterWilayah() {
  const {
    idkec, iddesa, idsls,
    setIdkec, setIddesa, setIdsls, resetWilayah,
  } = useFilterStore();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList    = useNagariGeoJSON(idkec);
  const korongList    = useKorongGeoJSON(iddesa);

  const hasFilter = idkec !== '' || iddesa !== '' || idsls !== '';

  const kecLabel = kecamatanList.find(k => k.kode === idkec)?.nama;
  const nagLabel = nagariList.find(n => n.kode === iddesa)?.nama;
  const korLabel = korongList.find(k => k.kode === idsls)?.nama;

  return (
    <div className="space-y-3 p-1">
      {/* Breadcrumb */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-1 text-[11px] px-2 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
          <span className="font-medium text-primary-700">📍</span>
          <span className="text-primary-600">{NAMA_KABUPATEN}</span>
          {kecLabel && <><span className="text-primary-300">›</span><span className="text-primary-600">{kecLabel}</span></>}
          {nagLabel && <><span className="text-primary-300">›</span><span className="text-primary-600">{nagLabel}</span></>}
          {korLabel && <><span className="text-primary-300">›</span><span className="text-primary-600">{korLabel}</span></>}
        </div>
      )}

      {/* Kabupaten — fixed */}
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Kabupaten</label>
        <div className="h-10 flex items-center px-3.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 cursor-not-allowed select-none">
          {NAMA_KABUPATEN}
        </div>
      </div>

      <Select label="Kecamatan" value={idkec} onChange={e => setIdkec(e.target.value)}>
        <option value="">Semua Kecamatan</option>
        {kecamatanList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
      </Select>

      <Select label="Nagari / Desa" value={iddesa} onChange={e => setIddesa(e.target.value)} disabled={!idkec}>
        <option value="">Semua Nagari</option>
        {nagariList.map(n => <option key={n.kode} value={n.kode}>{n.nama}</option>)}
      </Select>

      <Select label="Korong / Dusun" value={idsls} onChange={e => setIdsls(e.target.value)} disabled={!iddesa}>
        <option value="">Semua Korong</option>
        {korongList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
      </Select>

      {hasFilter && (
        <Button variant="ghost" size="sm" fullWidth onClick={resetWilayah} className="text-primary-600 hover:bg-primary-50"
          leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
          Reset ke seluruh kabupaten
        </Button>
      )}
    </div>
  );
}
