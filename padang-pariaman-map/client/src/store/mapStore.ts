import { create } from 'zustand';
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from '../constants';
import type { Map as LeafletMap } from 'leaflet';

type BasemapType = 'osm' | 'google';

interface MapState {
  center: [number, number];
  zoom: number;
  basemap: BasemapType;
  mapInstance: LeafletMap | null;

  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBasemap: (basemap: BasemapType) => void;
  toggleBasemap: () => void;
  setMapInstance: (map: LeafletMap | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: MAP_CENTER,
  zoom: MAP_DEFAULT_ZOOM,
  basemap: 'osm',
  mapInstance: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setBasemap: (basemap) => set({ basemap }),

  toggleBasemap: () =>
    set((state) => ({
      basemap: state.basemap === 'osm' ? 'google' : 'osm',
    })),

  setMapInstance: (map) => set({ mapInstance: map }),
}));
