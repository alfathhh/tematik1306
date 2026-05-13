import { useEffect, useMemo, useCallback } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useFilterStore } from '../../store/filterStore';
import { getBoundsFromGeoJSON } from '../../lib/mapUtils';
import {
  kecamatanGeoJSON,
  nagariGeoJSON,
  korongGeoJSON,
} from '../../assets/geojson';

function filterByProp(
  fc: GeoJSON.FeatureCollection,
  prop: string,
  value: string,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter(
      (f) => f.properties && String(f.properties[prop]) === value,
    ),
  };
}

const STYLE_KECAMATAN = { color: '#10B981', weight: 1.5, fillOpacity: 0.06 };
const STYLE_NAGARI    = { color: '#F59E0B', weight: 1.5, fillOpacity: 0.08 };
const STYLE_KORONG    = { color: '#EF4444', weight: 1,   fillOpacity: 0.10 };
const STYLE_HOVER     = { weight: 3, fillOpacity: 0.22 };

export default function WilayahLayer() {
  const map = useMap();
  const { idkec, iddesa, idsls, setIdkec, setIddesa, setIdsls } = useFilterStore();

  const { displayData, baseStyle, level } = useMemo(() => {
    if (iddesa) {
      // Tampilkan korong dalam nagari yang dipilih
      const filtered = filterByProp(korongGeoJSON, 'iddesa', iddesa);
      return { displayData: filtered, baseStyle: STYLE_KORONG, level: 'korong' as const };
    }
    if (idkec) {
      // Tampilkan nagari dalam kecamatan yang dipilih
      const filtered = filterByProp(nagariGeoJSON, 'idkec', idkec);
      return { displayData: filtered, baseStyle: STYLE_NAGARI, level: 'nagari' as const };
    }
    // Default — tampilkan semua kecamatan
    return { displayData: kecamatanGeoJSON, baseStyle: STYLE_KECAMATAN, level: 'kecamatan' as const };
  }, [idkec, iddesa, idsls]);

  useEffect(() => {
    const bounds = getBoundsFromGeoJSON(displayData);
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
  }, [displayData, map]);

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const props = feature.properties ?? {};

      let namaWilayah = '';
      if (level === 'kecamatan') namaWilayah = props.nmkec  ?? props.idkec  ?? '';
      else if (level === 'nagari')    namaWilayah = props.nmdesa ?? props.iddesa ?? '';
      else if (level === 'korong')    namaWilayah = props.nmsls  ?? props.idsls  ?? '';

      layer.bindTooltip(namaWilayah, {
        sticky: true,
        className: 'wilayah-tooltip',
        direction: 'top',
        offset: [0, -4],
      });

      layer.on({
        mouseover(e) {
          const l = e.target as L.Path;
          l.setStyle({ ...baseStyle, ...STYLE_HOVER });
          l.bringToFront();
        },
        mouseout(e) {
          (e.target as L.Path).setStyle(baseStyle);
        },
        click() {
          if (level === 'kecamatan' && props.idkec)  setIdkec(String(props.idkec));
          else if (level === 'nagari' && props.iddesa) setIddesa(String(props.iddesa));
          else if (level === 'korong' && props.idsls)  setIdsls(String(props.idsls));
        },
      });
    },
    [level, baseStyle, setIdkec, setIddesa, setIdsls],
  );

  if (!displayData.features.length) return null;

  return (
    <GeoJSON
      key={`${level}-${idkec}-${iddesa}-${idsls}`}
      data={displayData}
      style={() => baseStyle}
      onEachFeature={onEachFeature}
    />
  );
}
