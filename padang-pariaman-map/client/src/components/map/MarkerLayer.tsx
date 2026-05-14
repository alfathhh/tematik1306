import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Infrastruktur, KategoriInfra } from '../../types';
import { createCustomMarker } from '../../lib/gis/createCustomMarker';
import CustomMapPopout from './CustomMapPopout';

interface MarkerLayerProps {
  infrastruktur: Infrastruktur[];
  kategoriMap: Map<string, KategoriInfra>;
}

// Layer marker infrastruktur
export default function MarkerLayer({ infrastruktur, kategoriMap }: MarkerLayerProps) {
  return (
    <>
      {infrastruktur.map((infra) => {
        const kat = kategoriMap.get(infra.kategori);

        return (
          <Marker
            key={infra.id}
            position={[infra.lat, infra.lng]}
            icon={createCustomMarker({ categoryValue: infra.kategori, kategori: kat })}
          >
            <Popup
              className="custom-map-popup"
              maxWidth={320}
              autoPan
              closeButton={false}
            >
              <CustomMapPopout infra={infra} kategori={kat} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
