import React, { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { useFilterStore } from '../../store/filterStore';
import { getBoundsFromGeoJSON, filterGeoJSONByKode } from '../../lib/mapUtils';

// Layer polygon batas wilayah dari file GeoJSON statis
export default function WilayahLayer() {
  const map = useMap();
  const { kdkec, kddesa, kdsls } = useFilterStore();
  const [geojsonData, setGeojsonData] = useState<GeoJSON.FeatureCollection | null>(null);

  // Load GeoJSON kecamatan dari public/geojson/
  useEffect(() => {
    fetch('/geojson/kecamatan.geojson')
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
      .then(data => setGeojsonData(data));
  }, []);

  // fitBounds ke wilayah yang dipilih
  useEffect(() => {
    if (!geojsonData) return;

    let targetGeoJSON: GeoJSON.FeatureCollection = geojsonData;

    if (kdsls) {
      // Coba filter by korong (dari kecamatan.geojson belum ada, skip)
    } else if (kddesa) {
      // Filter by nagari
      const filtered = filterGeoJSONByKode(geojsonData, 'kddesa', kddesa);
      if (filtered.features.length > 0) targetGeoJSON = filtered;
    } else if (kdkec) {
      // Filter by kecamatan
      const filtered = filterGeoJSONByKode(geojsonData, 'kdkec', kdkec);
      if (filtered.features.length > 0) targetGeoJSON = filtered;
    }

    const bounds = getBoundsFromGeoJSON(targetGeoJSON);
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [kdkec, kddesa, kdsls, geojsonData, map]);

  if (!geojsonData) return null;

  return (
    <GeoJSON
      key={JSON.stringify(geojsonData)}
      data={geojsonData}
      style={() => ({
        color: '#3B82F6',
        weight: 1.5,
        opacity: 0.7,
        fillColor: '#3B82F6',
        fillOpacity: 0.05,
      })}
    />
  );
}
