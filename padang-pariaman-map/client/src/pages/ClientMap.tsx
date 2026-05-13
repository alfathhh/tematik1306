import React, { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { KategoriInfra } from '../types';
import MapContainer from '../components/map/MapContainer';
import FilterKategori from '../components/filter/FilterKategori';
import FilterWilayah from '../components/filter/FilterWilayah';
import StatistikPanel from '../components/statistik/StatistikPanel';
import PublicHeader from '../components/layout/PublicHeader';
import { cn } from '../lib/cn';

export default function ClientMap() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [showFilter, setShowFilter] = useState(true);
  const [showStatistik, setShowStatistik] = useState(true);
  const [mobileSheet, setMobileSheet] = useState<'filter' | 'statistik' | null>(null);

  React.useEffect(() => { document.title = 'Peta Tematik Interaktif — Kabupaten Padang Pariaman'; }, []);

  useEffect(() => { api.get('/kategori').then(res => setKategoriList(res.data)).catch(console.error); }, []);

  const kategoriMap = useMemo(() => {
    const m = new Map<string, KategoriInfra>();
    kategoriList.forEach(k => m.set(k.value, k));
    return m;
  }, [kategoriList]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-100">
      <PublicHeader
        kategoriMap={kategoriMap}
        onToggleFilter={() => { if (window.innerWidth < 1024) setMobileSheet(s => s === 'filter' ? null : 'filter'); else setShowFilter(v => !v); }}
        onToggleStatistik={() => { if (window.innerWidth < 1024) setMobileSheet(s => s === 'statistik' ? null : 'statistik'); else setShowStatistik(v => !v); }}
        filterActive={showFilter}
        statistikActive={showStatistik}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <aside className={cn('hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-neutral-200/60 shadow-soft overflow-hidden transition-all duration-250', !showFilter && 'lg:hidden')} aria-label="Filter peta">
          <div className="border-b border-neutral-100">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
              <h2 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Filter Wilayah</h2>
            </div>
            <div className="p-3"><FilterWilayah /></div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
              <h2 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Tampilkan Kategori</h2>
            </div>
            <div className="flex-1 overflow-y-auto panel-scroll"><FilterKategori /></div>
          </div>
        </aside>
        <main className="flex-1 relative overflow-hidden" role="application" aria-label="Peta interaktif Kabupaten Padang Pariaman">
          <MapContainer kategoriList={kategoriList} />
        </main>
        <aside className={cn('hidden lg:block w-80 flex-shrink-0 bg-neutral-50 border-l border-neutral-200/60 overflow-hidden', !showStatistik && 'lg:hidden')} aria-label="Statistik wilayah">
          <StatistikPanel kategoriList={kategoriList} />
        </aside>
        {mobileSheet && (
          <>
            <div className="lg:hidden absolute inset-0 bg-neutral-900/40 z-30" onClick={() => setMobileSheet(null)} aria-hidden="true" />
            <div className="lg:hidden absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-pop max-h-[75vh] flex flex-col animate-slide-up">
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 bg-neutral-200 rounded-full" /></div>
              <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-sm font-display font-semibold text-neutral-900">{mobileSheet === 'filter' ? 'Filter Peta' : 'Statistik Wilayah'}</h2>
                <button type="button" onClick={() => setMobileSheet(null)} aria-label="Tutup" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto panel-scroll">
                {mobileSheet === 'filter' ? (
                  <div className="p-3 space-y-4"><FilterWilayah /><div className="h-px bg-neutral-100" /><FilterKategori /></div>
                ) : <StatistikPanel kategoriList={kategoriList} />}
              </div>
            </div>
          </>
        )}
        {!mobileSheet && (
          <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            <button type="button" onClick={() => setMobileSheet('filter')} aria-label="Buka filter" className="glass rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-pop text-neutral-700 hover:bg-white active:scale-95 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xs font-medium">Filter</span>
            </button>
            <button type="button" onClick={() => setMobileSheet('statistik')} aria-label="Buka statistik" className="glass rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-pop text-neutral-700 hover:bg-white active:scale-95 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xs font-medium">Statistik</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
