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
export function getBoundsFromGeoJSON(geojson: GeoJSON.FeatureCollection): L.LatLngBounds | null {
  try {
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) return bounds;
    return null;
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
