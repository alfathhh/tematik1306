import L from 'leaflet';
import { KategoriInfra } from '../types';
import { createCustomMarker } from './gis/createCustomMarker';

// Buat custom DivIcon untuk marker infrastruktur berdasarkan kategori
export function createMarkerIcon(kategori: KategoriInfra): L.DivIcon {
  return createCustomMarker({ categoryValue: kategori.value, kategori });
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
