import React from 'react';
import { useMapStore } from '../../store/mapStore';

/**
 * BasemapToggle — tombol melayang kanan-bawah peta untuk ganti basemap.
 *
 * Fix Bug #3:
 * - Sebelumnya mendefinisikan BasemapId = 'osm'|'satellite'|'topo' yang tidak
 *   ada di mapStore (hanya 'osm'|'google') → setBasemap tidak berfungsi.
 * - Sebelumnya tidak punya posisi absolute → tenggelam di bawah komponen lain.
 * - Sekarang: hanya 2 opsi (osm ↔ google), posisi absolute bottom-6 right-3,
 *   z-[1000] agar di atas tile Leaflet, render di luar LeafletMap container.
 */
export default function BasemapToggle() {
  const { basemap, toggleBasemap } = useMapStore();
  const isOsm = basemap === 'osm';

  return (
    <button
      type="button"
      onClick={toggleBasemap}
      aria-label={`Ganti ke ${isOsm ? 'Google Maps' : 'OpenStreetMap'}`}
      title={`Ganti ke ${isOsm ? 'Google Maps' : 'OpenStreetMap'}`}
      className="absolute bottom-6 right-3 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-pop text-xs font-medium text-neutral-700 transition-colors duration-250 focus:outline-none focus-visible:shadow-focus"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.7)',
      }}
    >
      <span aria-hidden="true">{isOsm ? '🛰️' : '🗺️'}</span>
      <span className="hidden sm:inline">{isOsm ? 'Satelit' : 'Peta'}</span>
    </button>
  );
}
