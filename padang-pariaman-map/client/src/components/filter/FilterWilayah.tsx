import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { useWilayahStore } from '../../store/wilayahStore';
import { Select } from '../ui/Select';

export default function FilterWilayah() {
  const { activeKecamatan, activeNagari, setKecamatan, setNagari } = useMapStore();
  const { kecamatanList, nagariList, fetchNagari } = useWilayahStore();

  function handleKecamatan(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setKecamatan(val || null);
    setNagari(null);
    if (val) fetchNagari(val);
  }

  function handleNagari(e: React.ChangeEvent<HTMLSelectElement>) {
    setNagari(e.target.value || null);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-neutral-600">Kecamatan</label>
        <Select value={activeKecamatan || ''} onChange={handleKecamatan} options={kecamatanList.map(k => ({ value: k.id, label: k.nama }))} placeholder="Semua kecamatan" />
      </div>
      {activeKecamatan && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-600">Nagari</label>
          <Select value={activeNagari || ''} onChange={handleNagari} options={nagariList.map(n => ({ value: n.id, label: n.nama }))} placeholder="Semua nagari" />
        </div>
      )}
      {(activeKecamatan || activeNagari) && (
        <button type="button" onClick={() => { setKecamatan(null); setNagari(null); }} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
          Reset filter wilayah
        </button>
      )}
    </div>
  );
}
