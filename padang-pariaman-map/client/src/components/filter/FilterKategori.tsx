import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { KategoriInfra } from '../../types';
import { useFilterStore } from '../../store/filterStore';

// Panel filter kategori infrastruktur di sisi kiri peta
export default function FilterKategori() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [jumlahPerKategori, setJumlahPerKategori] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { kategoriAktif, toggleKategori, kdkec, kddesa } = useFilterStore();

  // Fetch daftar kategori dari API
  useEffect(() => {
    api.get('/kategori')
      .then(res => setKategoriList(res.data))
      .catch(err => console.error('Gagal memuat kategori:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch jumlah infrastruktur per kategori sesuai filter wilayah
  useEffect(() => {
    const params: Record<string, string> = {};
    if (kdkec) params.kdkec = kdkec;
    if (kddesa) params.kddesa = kddesa;

    api.get('/infrastruktur', { params })
      .then(res => {
        const items = res.data.data || res.data;
        const counts: Record<string, number> = {};
        for (const item of items) {
          counts[item.kategori] = (counts[item.kategori] || 0) + 1;
        }
        setJumlahPerKategori(counts);
      })
      .catch(err => console.error('Gagal memuat jumlah infrastruktur:', err));
  }, [kdkec, kddesa]);

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1">
      {kategoriList.length === 0 ? (
        <p className="text-xs text-gray-400 px-2 py-3 text-center">
          Tidak ada kategori tersedia
        </p>
      ) : (
        kategoriList.map(kat => {
          const aktif = kategoriAktif.includes(kat.value);
          const jumlah = jumlahPerKategori[kat.value] ?? 0;

          return (
            <label
              key={kat.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                aktif
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={aktif}
                onChange={() => toggleKategori(kat.value)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-base">{kat.icon}</span>
              <span className="text-sm text-gray-700 flex-1">{kat.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                aktif ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {jumlah}
              </span>
            </label>
          );
        })
      )}
    </div>
  );
}
