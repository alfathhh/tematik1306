import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { cn } from '../../lib/cn';

const BASEMAPS = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'satellite', label: 'Satelit' },
  { id: 'topo', label: 'Topografi' },
] as const;

type BasemapId = typeof BASEMAPS[number]['id'];

export default function BasemapToggle() {
  const { basemap, setBasemap } = useMapStore();

  return (
    <div className="glass rounded-xl overflow-hidden shadow-soft flex">
      {BASEMAPS.map((bm, idx) => (
        <button
          key={bm.id}
          type="button"
          onClick={() => setBasemap(bm.id as BasemapId)}
          className={cn(
            'px-3 py-1.5 text-[11px] font-medium transition-all',
            idx !== 0 && 'border-l border-neutral-200/40',
            basemap === bm.id
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
          )}
        >
          {bm.label}
        </button>
      ))}
    </div>
  );
}
