import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { KategoriInfra } from '../../types';

/**
 * Dashboard admin — ringkasan data infrastruktur, kategori, statistik.
 *
 * Fix: sebelumnya mengimport { StatistikCard } sebagai named export
 * (tidak ada sejak file diubah ke default export) dan menggunakan
 * endpoint /admin/stats yang tidak ada di API. Sekarang fetch langsung
 * dari /infrastruktur, /kategori, /statistik sesuai endpoint yang ada.
 */

interface DashboardStats {
  totalInfrastruktur: number;
  totalKategori: number;
  totalStatistik: number;
  perKategori: { label: string; icon: string; color: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — Admin Peta Tematik';
    Promise.all([
      api.get('/infrastruktur'),
      api.get('/kategori'),
      api.get('/statistik'),
    ])
      .then(([infraRes, katRes, statRes]) => {
        const infraData: { kategori: string }[] = infraRes.data.data ?? infraRes.data;
        const katList: KategoriInfra[]           = katRes.data;
        const statData: unknown[]                = statRes.data.data ?? statRes.data;

        const perKategori = katList.map(k => ({
          label: k.label,
          icon:  k.icon,
          color: k.color,
          count: infraData.filter(i => i.kategori === k.value).length,
        }));

        setStats({
          totalInfrastruktur: infraRes.data.total ?? infraData.length,
          totalKategori:      katList.length,
          totalStatistik:     statRes.data.total ?? statData.length,
          perKategori,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = stats ? [
    {
      label: 'Total Infrastruktur', value: stats.totalInfrastruktur,
      href: '/admin/infrastruktur', bg: 'bg-primary-50', color: 'text-primary-700',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="14" width="6" height="7" rx="0.5" stroke="#0284c7" strokeWidth="2"/></svg>,
    },
    {
      label: 'Kategori Aktif', value: stats.totalKategori,
      href: '/admin/kategori', bg: 'bg-success-50', color: 'text-success-500',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="5" stroke="#16a34a" strokeWidth="2"/><path d="M15 15l4 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Data Statistik', value: stats.totalStatistik,
      href: '/admin/statistik', bg: 'bg-accent-50', color: 'text-accent-600',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/></svg>,
    },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6 max-w-5xl">
        {loading ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton.Card key={i} />)}
            </div>
            <Skeleton.Card className="h-48" />
          </>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryCards.map(c => (
                <Link key={c.label} to={c.href}>
                  <Card hoverable className="h-full cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`${c.bg} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-2xl text-neutral-900">
                          {c.value.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{c.label}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Distribusi per kategori */}
            {stats && stats.perKategori.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Distribusi Infrastruktur per Kategori</Card.Title>
                  <Link to="/admin/infrastruktur" className="text-xs text-primary-600 hover:underline font-medium">
                    Lihat semua →
                  </Link>
                </Card.Header>
                <div className="space-y-3">
                  {stats.perKategori.sort((a, b) => b.count - a.count).map(k => {
                    const pct = stats.totalInfrastruktur > 0
                      ? Math.round((k.count / stats.totalInfrastruktur) * 100) : 0;
                    return (
                      <div key={k.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="flex items-center gap-1.5 text-neutral-700 font-medium">
                            <span aria-hidden="true">{k.icon}</span> {k.label}
                          </span>
                          <span className="text-xs font-mono text-neutral-500">
                            {k.count} <span className="text-neutral-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: k.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Aksi Cepat */}
            <Card>
              <Card.Header><Card.Title>Aksi Cepat</Card.Title></Card.Header>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { href: '/admin/infrastruktur', label: 'Kelola Infrastruktur', bg: 'bg-primary-50 hover:bg-primary-100', text: 'text-primary-700', icon: '🏗️' },
                  { href: '/admin/statistik',     label: 'Kelola Statistik',     bg: 'bg-accent-50 hover:bg-accent-100',   text: 'text-accent-700',  icon: '📈' },
                  { href: '/admin/kategori',      label: 'Kelola Kategori',      bg: 'bg-success-50 hover:bg-success-100', text: 'text-success-600', icon: '🏷️' },
                ].map(l => (
                  <Link key={l.href} to={l.href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${l.bg} transition-colors text-center`}>
                    <span className="text-2xl" aria-hidden="true">{l.icon}</span>
                    <span className={`text-xs font-medium ${l.text}`}>{l.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
