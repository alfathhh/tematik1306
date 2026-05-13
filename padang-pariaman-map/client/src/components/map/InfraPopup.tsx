import React from 'react';
import type { Infrastruktur } from '../../types';

interface Props {
  infra: Infrastruktur;
  onClose?: () => void;
}

export default function InfraPopup({ infra, onClose }: Props) {
  return (
    <div className="w-64 font-sans">
      {infra.foto?.[0] && (
        <div className="-mx-3 -mt-3 mb-3 h-32 overflow-hidden rounded-t-xl">
          <img src={infra.foto[0]} alt={infra.nama} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-semibold text-neutral-900 leading-tight">{infra.nama}</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
      {infra.kategori && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2" style={{ backgroundColor: (infra.kategori.warna || '#3B82F6') + '20', color: infra.kategori.warna || '#3B82F6' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: infra.kategori.warna || '#3B82F6' }} />
          {infra.kategori.label}
        </div>
      )}
      {(infra.kecamatan || infra.nagari) && (
        <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
          <span>{[infra.nagari?.nama, infra.kecamatan?.nama].filter(Boolean).join(', ')}</span>
        </div>
      )}
      {infra.deskripsi && (
        <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">{infra.deskripsi}</p>
      )}
      <div className="text-[10px] text-neutral-400 mt-2">{infra.lat.toFixed(6)}, {infra.lng.toFixed(6)}</div>
    </div>
  );
}
