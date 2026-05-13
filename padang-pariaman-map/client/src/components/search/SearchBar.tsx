import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import type { Infrastruktur } from '../../types';
import { cn } from '../../lib/cn';

interface Props {
  onSelect?: (infra: Infrastruktur) => void;
  className?: string;
}

export default function SearchBar({ onSelect, className }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/infrastruktur/search', { params: { q: val } });
        setResults(res.data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }

  function handleSelect(infra: Infrastruktur) {
    setQuery(infra.nama);
    setOpen(false);
    onSelect?.(infra);
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Cari infrastruktur..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200/60 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 shadow-soft placeholder:text-neutral-400"
          aria-label="Cari infrastruktur"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {loading
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/><path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        </div>
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-neutral-200/60 shadow-pop z-50 overflow-hidden max-h-60 overflow-y-auto panel-scroll">
          {results.map(infra => (
            <button key={infra.id} type="button" onClick={() => handleSelect(infra)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors">
              {infra.kategori && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: infra.kategori.warna || '#6B7280' }} />}
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">{infra.nama}</div>
                {(infra.kecamatan || infra.kategori) && (
                  <div className="text-[11px] text-neutral-500 truncate">{[infra.kategori?.label, infra.kecamatan?.nama].filter(Boolean).join(' · ')}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !results.length && !loading && query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-neutral-200/60 shadow-pop z-50 px-4 py-3 text-sm text-neutral-400">Tidak ditemukan hasil.</div>
      )}
    </div>
  );
}
