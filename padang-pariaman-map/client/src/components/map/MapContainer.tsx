import React from 'react';
import { MapContainer as LeafletMap, TileLayer, useMapEvents } from 'react-leaflet';
import {
  MAP_CENTER, MAP_DEFAULT_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM,
  BASEMAP_OSM, BASEMAP_GOOGLE, BASEMAP_OSM_ATTRIBUTION, BASEMAP_GOOGLE_ATTRIBUTION
} from '../../constants';
import { useMapStore } from '../../store/mapStore';
import { useFilterStore } from '../../store/filterStore';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import WilayahLayer from './WilayahLayer';
import MarkerLayer from './MarkerLayer';
import BasemapToggle from './BasemapToggle';
import { KategoriInfra } from '../../types';

interface MapContainerProps {
  kategoriList: KategoriInfra[];
}

// Komponen inner untuk menangkap event dan menyimpan map instance
function MapEventHandler() {
  const { setMapInstance } = useMapStore();
  const mapInstance = useMapEvents({
    load: () => setMapInstance(mapInstance),
  });

  React.useEffect(() => {
    setMapInstance(mapInstance);
    return () => setMapInstance(null);
  }, [mapInstance, setMapInstance]);

  return null;
}

// BasemapLayer berdasarkan state
function BasemapLayer() {
  const { basemap } = useMapStore();

  return basemap === 'osm' ? (
    <TileLayer url={BASEMAP_OSM} attribution={BASEMAP_OSM_ATTRIBUTION} />
  ) : (
    <TileLayer url={BASEMAP_GOOGLE} attribution={BASEMAP_GOOGLE_ATTRIBUTION} maxZoom={20} />
  );
}

// Komponen utama peta interaktif
export default function MapContainer({ kategoriList }: MapContainerProps) {
  const { kategoriAktif, kdkab, kdkec, kddesa, kdsls } = useFilterStore();

  // Fetch infrastruktur sesuai filter aktif
  const { data: infrastruktur } = useInfrastruktur({
    kategori: kategoriAktif,
    kdkab,
    kdkec: kdkec || undefined,
    kddesa: kddesa || undefined,
    kdsls: kdsls || undefined,
    enabled: kategoriAktif.length > 0,
  });

  // Buat Map dari kategori value → KategoriInfra untuk lookup cepat
  const kategoriMap = React.useMemo(() => {
    const m = new Map<string, KategoriInfra>();
    kategoriList.forEach((k) => m.set(k.value, k));
    return m;
  }, [kategoriList]);

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapEventHandler />
        <BasemapLayer />
        <WilayahLayer />
        <MarkerLayer
          infrastruktur={infrastruktur}
          kategoriMap={kategoriMap}
        />
      </LeafletMap>

      {/* Tombol toggle basemap */}
      <BasemapToggle />
    </div>
  );
}
