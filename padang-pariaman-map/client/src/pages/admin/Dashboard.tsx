import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { StatistikCard } from '../../components/statistik/StatistikCard';

interface Stats {
  totalInfra: number;
  totalKategori: number;
  totalWilayah: number;
  recentInfra: Array<{ id: string; nama: string; kategori: string; wilayah: string; createdAt: string }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — Admin Peta Tematik';
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-neutral-200 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-display font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Ringkasan data infrastruktur Kabupaten Padang Pariaman</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatistikCard label="Total Infrastruktur" value={stats?.totalInfra ?? 0} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
        } color="brand" />
        <StatistikCard label="Kategori Aktif" value={stats?.totalKategori ?? 0} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        } color="green" />
        <StatistikCard label="Kecamatan Tercakup" value={stats?.totalWilayah ?? 0} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        } color="amber" />
      </div>
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-display font-semibold text-neutral-900">Infrastruktur Terbaru</h2>
        </div>
        {!stats?.recentInfra?.length ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-400">Belum ada data infrastruktur.</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {stats.recentInfra.map(item => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{item.nama}</div>
                  <div className="text-xs text-neutral-500 truncate">{item.kategori} · {item.wilayah}</div>
                </div>
                <div className="text-xs text-neutral-400 flex-shrink-0">{new Date(item.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
