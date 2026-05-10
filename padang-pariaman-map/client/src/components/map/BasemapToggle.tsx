import React from 'react';
import { useMapStore } from '../../store/mapStore';

// Tombol toggle basemap OSM ↔ Google Maps
export default function BasemapToggle() {
  const { basemap, toggleBasemap } = useMapStore();

  return (
    <button
      onClick={toggleBasemap}
      className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 flex items-center gap-2 transition-colors"
      title={`Ganti ke ${basemap === 'osm' ? 'Google Maps' : 'OpenStreetMap'}`}
    >
      <span>{basemap === 'osm' ? '🗺️' : '🛰️'}</span>
      <span className="hidden sm:inline">
        {basemap === 'osm' ? 'OSM' : 'Satelit'}
      </span>
    </button>
  );
}
