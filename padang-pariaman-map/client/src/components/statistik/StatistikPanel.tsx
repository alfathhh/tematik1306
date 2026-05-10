import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useStatistik } from '../../hooks/useStatistik';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import StatistikCard from './StatistikCard';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import { KategoriInfra } from '../../types';

interface StatistikPanelProps {
  kategoriList: KategoriInfra[];
}

// Panel statistik wilayah — update otomatis sesuai filter wilayah aktif
export default function StatistikPanel({ kategoriList }: StatistikPanelProps) {
  const { kdkab, kdkec, kddesa } = useFilterStore();

  const { data: statistikData, loading: loadingStat } = useStatistik({
    kdkab,
    kdkec: kdkec || undefined,
    kddesa: kddesa || undefined,
  });

  // Fetch semua infrastruktur di wilayah ini (tanpa filter kategori) untuk donut chart
  const { data: allInfra } = useInfrastruktur({
    kdkab,
    kdkec: kdkec || undefined,
    kddesa: kddesa || undefined,
    kategori: kategoriList.map(k => k.value),
    enabled: kategoriList.length > 0,
  });

  // Ambil indikator unik untuk cards
  const indikatorMap = new Map<string, { nilai: number; satuan?: string; tahun: number }>();
  for (const s of statistikData) {
    if (!indikatorMap.has(s.indikator)) {
      indikatorMap.set(s.indikator, { nilai: s.nilai, satuan: s.satuan ?? undefined, tahun: s.tahun });
    }
  }

  // Data bar chart: jumlah per indikator (ambil 3 pertama)
  const barData = Array.from(indikatorMap.entries())
    .slice(0, 3)
    .map(([indikator, v]) => ({ name: indikator.slice(0, 12), nilai: v.nilai, satuan: v.satuan }));

  // Data donut chart: distribusi infrastruktur per kategori
  const donutData = kategoriList
    .map(kat => ({
      name: kat.label,
      value: allInfra.filter(i => i.kategori === kat.value).length,
      color: kat.color,
    }))
    .filter(d => d.value > 0);

  const wilayahLabel = kddesa ? `Nagari ${kddesa}` : kdkec ? `Kecamatan ${kdkec}` : 'Kab. Padang Pariaman';

  return (
    <div className="h-full overflow-y-auto panel-scroll p-4 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">
        📊 Statistik — {wilayahLabel}
      </h2>

      {loadingStat ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : statistikData.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">
          Tidak ada data statistik untuk wilayah ini
        </p>
      ) : (
        <>
          {/* Cards ringkasan */}
          <div className="grid grid-cols-1 gap-2">
            {Array.from(indikatorMap.entries()).slice(0, 4).map(([ind, v]) => (
              <StatistikCard
                key={ind}
                indikator={ind}
                nilai={v.nilai}
                satuan={v.satuan}
                tahun={v.tahun}
              />
            ))}
          </div>

          {/* Bar chart */}
          {barData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <BarChart data={barData} title="Perbandingan Indikator" />
            </div>
          )}

          {/* Donut chart */}
          {donutData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <DonutChart data={donutData} title="Distribusi Infrastruktur" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
