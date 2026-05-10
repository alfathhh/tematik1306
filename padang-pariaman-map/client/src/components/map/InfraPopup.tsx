import React from 'react';
import { Infrastruktur, KategoriInfra } from '../../types';

interface InfraPopupProps {
  infra: Infrastruktur;
  kategori?: KategoriInfra;
}

// Konten popup marker infrastruktur di peta
export default function InfraPopup({ infra, kategori }: InfraPopupProps) {
  return (
    <div className="text-sm">
      {/* Foto infrastruktur */}
      {infra.fotoUrl ? (
        <img
          src={infra.fotoUrl}
          alt={infra.nama}
          className="w-full h-32 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/260x128?text=No+Image';
          }}
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
          <span className="text-3xl">{kategori?.icon ?? '📍'}</span>
        </div>
      )}

      {/* Konten popup */}
      <div className="p-3">
        {/* Badge kategori */}
        {kategori && (
          <span
            className="inline-block text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
            style={{ backgroundColor: kategori.color }}
          >
            {kategori.icon} {kategori.label.toUpperCase()}
          </span>
        )}

        {/* Nama infrastruktur */}
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
          {infra.nama}
        </h3>

        {/* Alamat */}
        {infra.alamat && (
          <p className="text-gray-500 text-xs flex gap-1">
            <span>📍</span>
            <span>{infra.alamat}</span>
          </p>
        )}

        {/* Koordinat */}
        <p className="text-gray-400 text-xs mt-1">
          {infra.lat.toFixed(4)}, {infra.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
