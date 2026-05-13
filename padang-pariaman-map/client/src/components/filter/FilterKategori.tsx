import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { useKategoriStore } from '../../store/kategoriStore';
import { cn } from '../../lib/cn';

export default function FilterKategori() {
  const { activeKategori, toggleKategori, setAllKategori } = useMapStore();
  const { kategoriList } = useKategoriStore();

  const allSelected = kategoriList.length > 0 && kategoriList.every(k => activeKategori.includes(k.value));

  function handleToggleAll() {
    if (allSelected) setAllKategori([]);
    else setAllKategori(kategoriList.map(k => k.value));
  }

  if (!kategoriList.length) return (
    <div className="px-4 py-6 text-center">
      <div className="text-xs text-neutral-400">Memuat kategori...</div>
    </div>
  );

  return (
    <div className="py-2">
      <button type="button" onClick={handleToggleAll} className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        allSelected ? 'text-brand-700' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
      )}>
        <div className={cn('w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors', allSelected ? 'bg-brand-600 border-brand-600' : 'border-neutral-300')}>
          {allSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="font-medium">Semua Kategori</span>
      </button>
      <div className="h-px bg-neutral-100 mx-4 my-1" />
      <div className="space-y-0.5">
        {kategoriList.map(k => {
          const active = activeKategori.includes(k.value);
          return (
            <button key={k.value} type="button" onClick={() => toggleKategori(k.value)} className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-none',
              active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            )}>
              <div className={cn('w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors')} style={{ backgroundColor: active ? k.warna : 'transparent', borderColor: active ? k.warna : '#d1d5db' }}>
                {active && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: k.warna }} />
              <span>{k.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
