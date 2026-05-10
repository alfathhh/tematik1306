import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';

interface DashboardStats {
  totalInfrastruktur: number;
  totalKategori: number;
  totalStatistik: number;
  perKategori: { label: string; icon: string; color: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/infrastruktur'),
      api.get('/kategori'),
      api.get('/statistik'),
    ])
      .then(([infraRes, katRes, statRes]) => {
        const infraData = infraRes.data.data || infraRes.data;
        const katList   = katRes.data;
        const statData  = statRes.data.data || statRes.data;

        // Hitung per kategori
        const perKategori = katList.map((k: { value: string; label: string; icon: string; color: string }) => ({
          label: k.label,
          icon: k.icon,
          color: k.color,
          count: infraData.filter((i: { kategori: string }) => i.kategori === k.value).length,
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
    { label: 'Total Infrastruktur', value: stats.totalInfrastruktur, icon: '🏗️', color: 'bg-blue-500' },
    { label: 'Kategori Aktif',      value: stats.totalKategori,      icon: '🏷️', color: 'bg-green-500' },
    { label: 'Data Statistik',      value: stats.totalStatistik,     icon: '📈', color: 'bg-purple-500' },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map(c => (
              <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`${c.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{c.value.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-gray-500">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Per Kategori */}
          {stats && stats.perKategori.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Infrastruktur per Kategori</h2>
              <div className="space-y-3">
                {stats.perKategori.map(k => {
                  const pct = stats.totalInfrastruktur > 0
                    ? Math.round((k.count / stats.totalInfrastruktur) * 100)
                    : 0;
                  return (
                    <div key={k.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          <span>{k.icon}</span> {k.label}
                        </span>
                        <span className="font-medium text-gray-900">{k.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: k.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { href: '/admin/infrastruktur', icon: '🏗️', label: 'Kelola Infrastruktur' },
                { href: '/admin/statistik',     icon: '📈', label: 'Kelola Statistik'     },
                { href: '/admin/kategori',      icon: '🏷️', label: 'Kelola Kategori'      },
              ].map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <span className="text-2xl">{l.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{l.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
