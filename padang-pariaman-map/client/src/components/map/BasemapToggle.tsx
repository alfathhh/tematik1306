import React from 'react';
import { useMapStore } from '../../store/mapStore';

/**
 * BasemapToggle — tombol melayang kanan-bawah peta untuk ganti basemap.
 * Cycle: OSM → Google Satellite → Google Road → OSM
 */
export default function BasemapToggle() {
  const { basemap, toggleBasemap } = useMapStore();

  const getLabel = () => {
    switch (basemap) {
      case 'osm': return 'Satelit';
      case 'google-satellite': return 'Jalan';
      case 'google-road': return 'Peta';
      default: return 'Peta';
    }
  };

  const getEmoji = () => {
    switch (basemap) {
      case 'osm': return '🛰️';
      case 'google-satellite': return '🛣️';
      case 'google-road': return '🗺️';
      default: return '🗺️';
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBasemap}
      aria-label={`Ganti ke ${getLabel()}`}
      title={`Ganti ke ${getLabel()}`}
      className="absolute bottom-6 right-3 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-pop text-xs font-medium text-neutral-700 transition-colors duration-250 focus:outline-none focus-visible:shadow-focus"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.7)',
      }}
    >
      <span aria-hidden="true">{getEmoji()}</span>
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
