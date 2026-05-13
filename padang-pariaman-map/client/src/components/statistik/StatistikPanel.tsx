import React, { useEffect } from 'react';
import type { KategoriInfra } from '../../types';
import { useStatistikStore } from '../../store/statistikStore';
import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import { StatistikCard } from './StatistikCard';

interface Props {
  kategoriList?: KategoriInfra[];
}

export default function StatistikPanel({ kategoriList }: Props) {
  const { data, loading, fetchStatistik } = useStatistikStore();

  useEffect(() => { fetchStatistik(); }, []);

  const donutData = (data?.perKategori || []).map(item => {
    const k = kategoriList?.find(k => k.value === item.label);
    return { label: k?.label || item.label, value: item.value, color: k?.warna };
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex-shrink-0">
        <h2 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Statistik Wilayah</h2>
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll p-4 space-y-5">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatistikCard label="Total" value={data?.total ?? 0} color="brand" />
              <StatistikCard label="Kategori" value={data?.totalKategori ?? 0} color="green" />
            </div>
            {donutData.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">Distribusi Kategori</div>
                <DonutChart data={donutData} size={120} />
              </div>
            )}
            {(data?.perKecamatan || []).length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">Per Kecamatan</div>
                <BarChart data={data?.perKecamatan || []} colorScheme="brand" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
