import L from 'leaflet';
import { KategoriInfra } from '../types';

// Buat custom DivIcon untuk marker infrastruktur berdasarkan kategori
export function createMarkerIcon(kategori: KategoriInfra): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div class="custom-marker" style="background-color: ${kategori.color};">
        <span class="custom-marker-inner">${kategori.icon}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Hitung bounding box dari GeoJSON FeatureCollection
// Catatan: JANGAN gunakan L.geoJSON(geojson).getBounds() karena L.geoJSON
// menambahkan layer ke peta secara implisit dan tidak pernah di-remove,
// menyebabkan kotak hitam tampil di peta.
export function getBoundsFromGeoJSON(geojson: GeoJSON.FeatureCollection): L.LatLngBounds | null {
  try {
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    function processCoords(coords: unknown): void {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === 'number') {
        // Koordinat tunggal [lng, lat]
        const [lng, lat] = coords as [number, number];
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      } else {
        coords.forEach(processCoords);
      }
    }

    geojson.features.forEach((f) => {
      if (f.geometry) processCoords((f.geometry as any).coordinates);
    });

    if (!isFinite(minLat) || !isFinite(maxLat)) return null;
    const bounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
    return bounds.isValid() ? bounds : null;
  } catch {
    return null;
  }
}

// Filter fitur GeoJSON berdasarkan properti kode wilayah
export function filterGeoJSONByKode(
  geojson: GeoJSON.FeatureCollection,
  field: string,
  value: string
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (f) => f.properties && f.properties[field] === value
    ),
  };
}
