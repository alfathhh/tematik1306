import React, { useEffect } from 'react';
import { BarChart } from '../../components/statistik/BarChart';
import { DonutChart } from '../../components/statistik/DonutChart';
import { useStatistikStore } from '../../store/statistikStore';

export default function StatistikPage() {
  const { data, loading, fetchStatistik } = useStatistikStore();

  useEffect(() => {
    document.title = 'Statistik — Admin Peta Tematik';
    fetchStatistik();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-display font-bold text-neutral-900">Statistik</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Visualisasi data infrastruktur berdasarkan kategori dan wilayah</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-2xl bg-neutral-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-5">
            <h2 className="text-sm font-display font-semibold text-neutral-900 mb-4">Distribusi per Kategori</h2>
            <DonutChart data={data?.perKategori || []} />
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-5">
            <h2 className="text-sm font-display font-semibold text-neutral-900 mb-4">Jumlah per Kecamatan</h2>
            <BarChart data={data?.perKecamatan || []} />
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-5 lg:col-span-2">
            <h2 className="text-sm font-display font-semibold text-neutral-900 mb-4">Trend Penambahan Data</h2>
            <BarChart data={data?.trend || []} colorScheme="brand" />
          </div>
        </div>
      )}
    </div>
  );
}
