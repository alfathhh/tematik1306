import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import { Infrastruktur, KategoriInfra } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useMapStore } from '../../store/mapStore';
import { DEBOUNCE_DELAY_MS } from '../../constants';

interface SearchBarProps {
  kategoriMap: Map<string, KategoriInfra>;
}

// Komponen search infrastruktur dengan debounce dan flyTo
export default function SearchBar({ kategoriMap }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { mapInstance } = useMapStore();
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY_MS);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch hasil pencarian saat query berubah (debounced)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    api.get('/infrastruktur', {
      params: { search: debouncedQuery, limit: 5 },
    })
      .then(res => {
        const data = res.data.data || res.data;
        setResults(data);
        setIsOpen(data.length > 0);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Klik hasil pencarian → flyTo + open popup
  const handleSelect = (infra: Infrastruktur) => {
    if (mapInstance) {
      mapInstance.flyTo([infra.lat, infra.lng], 16, { duration: 1 });
    }
    setQuery(infra.nama);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Cari infrastruktur..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-spin">⟳</span>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown hasil */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[2000] overflow-hidden">
          {results.map(infra => {
            const kat = kategoriMap.get(infra.kategori);
            return (
              <button
                key={infra.id}
                onClick={() => handleSelect(infra)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
              >
                <span
                  className="w-7 h-7 flex items-center justify-center rounded-full text-sm flex-shrink-0"
                  style={{ backgroundColor: kat?.color ?? '#7F8C8D', color: 'white' }}
                >
                  {kat?.icon ?? '📍'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{infra.nama}</p>
                  {infra.alamat && (
                    <p className="text-xs text-gray-500 truncate">{infra.alamat}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
