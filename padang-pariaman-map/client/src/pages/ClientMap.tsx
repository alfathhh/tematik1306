import React, { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { KategoriInfra } from '../types';
import MapContainer from '../components/map/MapContainer';
import FilterKategori from '../components/filter/FilterKategori';
import FilterWilayah from '../components/filter/FilterWilayah';
import SearchBar from '../components/search/SearchBar';
import StatistikPanel from '../components/statistik/StatistikPanel';

// Halaman utama publik — Peta Tematik Interaktif
export default function ClientMap() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Fetch kategori untuk diteruskan ke komponen anak
  useEffect(() => {
    api.get('/kategori').then(res => setKategoriList(res.data)).catch(console.error);
  }, []);

  // Map kategori untuk SearchBar
  const kategoriMap = useMemo(() => {
    const m = new Map<string, KategoriInfra>();
    kategoriList.forEach(k => m.set(k.value, k));
    return m;
  }, [kategoriList]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 z-10 shadow-sm flex-shrink-0">
        {/* Logo & Judul */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">
              Peta Tematik
            </h1>
            <p className="text-xs text-gray-500 leading-tight hidden sm:block">
              Kabupaten Padang Pariaman
            </p>
          </div>
        </div>

        {/* Search Bar — tengah */}
        <div className="flex-1 flex justify-center px-2">
          <SearchBar kategoriMap={kategoriMap} />
        </div>

        {/* Tombol toggle panel */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLeftPanel(v => !v)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              showLeftPanel ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Toggle Filter"
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowRightPanel(v => !v)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              showRightPanel ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Toggle Statistik"
          >
            📊
          </button>
        </div>
      </header>

      {/* ===== BODY: Panel Kiri + Peta + Panel Kanan ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel Kiri — Filter */}
        {showLeftPanel && (
          <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Filter Wilayah */}
            <div className="border-b border-gray-100">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  📍 Filter Wilayah
                </h2>
              </div>
              <div className="p-3">
                <FilterWilayah />
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  🏷️ Tampilkan Kategori
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto panel-scroll">
                <FilterKategori />
              </div>
            </div>
          </aside>
        )}

        {/* Peta Utama */}
        <main className="flex-1 relative overflow-hidden">
          <MapContainer kategoriList={kategoriList} />
        </main>

        {/* Panel Kanan — Statistik */}
        {showRightPanel && (
          <aside className="w-72 flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-hidden">
            <StatistikPanel kategoriList={kategoriList} />
          </aside>
        )}
      </div>
    </div>
  );
}
