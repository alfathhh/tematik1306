import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FolderKanban, MapPin, Tags } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { KategoriInfra } from '../../types';
import { getCategoryColor, getCategoryIcon } from '../../lib/gis/categoryConfig';

interface DashboardStats {
  totalInfrastruktur: number;
  totalKategori: number;
  totalStatistik: number;
  perKategori: { value: string; label: string; icon: string; color: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard - Admin Peta Tematik';
    Promise.all([
      api.get('/infrastruktur'),
      api.get('/kategori'),
      api.get('/statistik'),
    ])
      .then(([infraRes, katRes, statRes]) => {
        const infraData: { kategori: string }[] = infraRes.data.data ?? infraRes.data;
        const katList: KategoriInfra[] = katRes.data;
        const statData: unknown[] = statRes.data.data ?? statRes.data;

        const perKategori = katList.map((k) => ({
          value: k.value,
          label: k.label,
          icon: k.icon,
          color: k.color,
          count: infraData.filter((i) => i.kategori === k.value).length,
        }));

        setStats({
          totalInfrastruktur: infraRes.data.total ?? infraData.length,
          totalKategori: katList.length,
          totalStatistik: statRes.data.total ?? statData.length,
          perKategori,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = stats ? [
    {
      label: 'Total Infrastruktur',
      value: stats.totalInfrastruktur,
      href: '/admin/infrastruktur',
      icon: MapPin,
      tone: 'bg-sky-50 text-sky-600 ring-sky-100',
    },
    {
      label: 'Kategori Aktif',
      value: stats.totalKategori,
      href: '/admin/kategori',
      icon: Tags,
      tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    },
    {
      label: 'Data Statistik',
      value: stats.totalStatistik,
      href: '/admin/statistik',
      icon: BarChart3,
      tone: 'bg-amber-50 text-amber-600 ring-amber-100',
    },
  ] : [];

  const quickActions = [
    {
      href: '/admin/infrastruktur',
      label: 'Kelola Infrastruktur',
      icon: MapPin,
      className: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
    },
    {
      href: '/admin/statistik',
      label: 'Kelola Statistik',
      icon: BarChart3,
      className: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
    {
      href: '/admin/kategori',
      label: 'Kelola Kategori',
      icon: FolderKanban,
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-page">
        {loading ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton.Card key={i} />)}
            </div>
            <Skeleton.Card className="h-48" />
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <Link key={card.label} to={card.href}>
                  <Card hoverable padding="sm" className="h-full cursor-pointer rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${card.tone}`}>
                        <card.icon size={22} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-2xl font-bold text-neutral-900">
                          {card.value.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-neutral-500">{card.label}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {stats && stats.perKategori.length > 0 && (
              <Card className="rounded-xl">
                <Card.Header>
                  <Card.Title>Distribusi Infrastruktur per Kategori</Card.Title>
                  <Link to="/admin/infrastruktur" className="text-xs font-medium text-primary-600 hover:underline">
                    Lihat semua
                  </Link>
                </Card.Header>
                <div className="space-y-3">
                  {stats.perKategori.sort((a, b) => b.count - a.count).map((kategori) => {
                    const Icon = getCategoryIcon(kategori.value, { icon: kategori.icon });
                    const warnaHex = getCategoryColor(kategori.value, { color: kategori.color });
                    const pct = stats.totalInfrastruktur > 0
                      ? Math.round((kategori.count / stats.totalInfrastruktur) * 100)
                      : 0;

                    return (
                      <div key={kategori.value}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                            <Icon size={16} style={{ color: warnaHex }} aria-hidden="true" />
                            {kategori.label}
                          </span>
                          <span className="font-mono text-xs text-neutral-500">
                            {kategori.count} <span className="text-neutral-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: warnaHex }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card className="rounded-xl">
              <Card.Header>
                <Card.Title>Aksi Cepat</Card.Title>
              </Card.Header>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className={`flex items-center justify-center gap-2 rounded-xl p-4 text-center transition-colors ${action.className}`}
                  >
                    <action.icon size={18} aria-hidden="true" />
                    <span className="text-xs font-medium">{action.label}</span>
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
