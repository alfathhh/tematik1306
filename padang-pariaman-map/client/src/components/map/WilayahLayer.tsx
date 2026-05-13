import { useEffect, useMemo, useCallback, useRef } from 'react';
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
const STYLE_KORONG_SELECTED = { color: '#1D4ED8', weight: 3, fillOpacity: 0.25 };
const STYLE_HOVER     = { weight: 3, fillOpacity: 0.22 };

export default function WilayahLayer() {
  const map = useMap();
  const { idkec, iddesa, idsls, setIdkec, setIddesa, setIdsls } = useFilterStore();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

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
  }, [idkec, iddesa]);

  // fitBounds hanya saat level/wilayah berubah, TIDAK saat idsls berubah
  useEffect(() => {
    const bounds = getBoundsFromGeoJSON(displayData);
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
  }, [displayData, map]);

  // Highlight korong yang dipilih tanpa re-render seluruh layer
  useEffect(() => {
    if (level !== 'korong' || !geoJsonRef.current) return;

    geoJsonRef.current.eachLayer((layer) => {
      const feature = (layer as any).feature as GeoJSON.Feature | undefined;
      if (!feature?.properties) return;
      const path = layer as L.Path;
      if (idsls && String(feature.properties.idsls) === idsls) {
        path.setStyle(STYLE_KORONG_SELECTED);
        path.bringToFront();
      } else {
        path.setStyle(STYLE_KORONG);
      }
    });

    // Zoom ke korong yang dipilih
    if (idsls) {
      const selectedFeature = displayData.features.find(
        (f) => f.properties && String(f.properties.idsls) === idsls
      );
      if (selectedFeature) {
        const singleFc: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [selectedFeature],
        };
        const bounds = getBoundsFromGeoJSON(singleFc);
        if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [idsls, level, displayData, map]);

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
          const l = e.target as L.Path;
          const feat = (l as any).feature as GeoJSON.Feature | undefined;
          // Jika korong ini sedang terpilih, kembalikan ke style selected
          if (level === 'korong' && feat?.properties && 
              useFilterStore.getState().idsls === String(feat.properties.idsls)) {
            l.setStyle(STYLE_KORONG_SELECTED);
          } else {
            l.setStyle(baseStyle);
          }
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

  // Style function yang memperhitungkan korong terpilih
  const styleFunction = useCallback(
    (feature?: GeoJSON.Feature) => {
      if (level === 'korong' && feature?.properties && idsls &&
          String(feature.properties.idsls) === idsls) {
        return STYLE_KORONG_SELECTED;
      }
      return baseStyle;
    },
    [level, baseStyle, idsls],
  );

  if (!displayData.features.length) return null;

  return (
    <GeoJSON
      key={`${level}-${idkec}-${iddesa}`}
      ref={(ref) => { geoJsonRef.current = ref as L.GeoJSON | null; }}
      data={displayData}
      style={styleFunction}
      onEachFeature={onEachFeature}
    />
  );
}
