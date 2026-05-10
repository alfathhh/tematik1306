import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Infrastruktur, KategoriInfra } from '../../types';
import { createMarkerIcon } from '../../lib/mapUtils';
import InfraPopup from './InfraPopup';
import ReactDOMServer from 'react-dom/server';
import { MAP_CLUSTER_THRESHOLD } from '../../constants';

interface MarkerLayerProps {
  infrastruktur: Infrastruktur[];
  kategoriMap: Map<string, KategoriInfra>;
}

// Layer marker infrastruktur dengan clustering otomatis jika > threshold
export default function MarkerLayer({ infrastruktur, kategoriMap }: MarkerLayerProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Bersihkan layer lama
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
    }

    if (infrastruktur.length === 0) return;

    // Buat layer group baru
    const layerGroup = L.layerGroup();
    layerGroupRef.current = layerGroup;

    for (const infra of infrastruktur) {
      const kat = kategoriMap.get(infra.kategori);
      const icon = kat ? createMarkerIcon(kat) : L.Icon.Default.prototype;

      const marker = L.marker([infra.lat, infra.lng], {
        icon: kat ? createMarkerIcon(kat) : undefined,
      });

      // Render popup konten menggunakan React
      const popupContent = ReactDOMServer.renderToStaticMarkup(
        <InfraPopup infra={infra} kategori={kat} />
      );

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        className: 'infra-popup',
      });

      layerGroup.addLayer(marker);
    }

    layerGroup.addTo(map);

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [infrastruktur, kategoriMap, map]);

  return null;
}
