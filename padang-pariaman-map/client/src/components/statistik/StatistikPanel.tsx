import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useStatistik } from '../../hooks/useStatistik';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import StatistikCard from './StatistikCard';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import { Skeleton } from '../ui/Skeleton';
import { KategoriInfra } from '../../types';
import { NAMA_KABUPATEN } from '../../constants';

interface StatistikPanelProps {
  kategoriList: KategoriInfra[];
}

export default function StatistikPanel({ kategoriList }: StatistikPanelProps) {
  const { idkab, idkec, iddesa } = useFilterStore();

  const { data: statistikData, loading: loadingStat } = useStatistik({
    idkab,
    idkec:  idkec  || undefined,
    iddesa: iddesa || undefined,
  });

  const { data: allInfra } = useInfrastruktur({
    idkab,
    idkec:    idkec    || undefined,
    iddesa:   iddesa   || undefined,
    kategori: kategoriList.map(k => k.value),
    enabled:  kategoriList.length > 0,
  });

  const indikatorMap = new Map<string, { nilai: number; satuan?: string; tahun: number }>();
  for (const s of statistikData) {
    if (!indikatorMap.has(s.indikator)) {
      indikatorMap.set(s.indikator, { nilai: s.nilai, satuan: s.satuan ?? undefined, tahun: s.tahun });
    }
  }

  const barData = Array.from(indikatorMap.entries())
    .slice(0, 4)
    .map(([indikator, v]) => ({
      name:   indikator.length > 14 ? indikator.slice(0, 13) + '…' : indikator,
      nilai:  v.nilai,
      satuan: v.satuan,
    }));

  const donutData = kategoriList
    .map(kat => ({
      name:  kat.label,
      value: allInfra.filter(i => i.kategori === kat.value).length,
      color: kat.color,
    }))
    .filter(d => d.value > 0);

  const wilayahLabel = iddesa
    ? `Nagari ${iddesa}`
    : idkec
      ? `Kecamatan ${idkec}`
      : NAMA_KABUPATEN;

  const totalInfra = allInfra.length;

  return (
    <div className="h-full overflow-y-auto panel-scroll px-3 py-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-sm text-neutral-900">Statistik Wilayah</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">{wilayahLabel}</p>
        </div>
        {totalInfra > 0 && (
          <span className="flex-shrink-0 text-[11px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-100">
            {totalInfra} infra
          </span>
        )}
      </div>

      {loadingStat ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton.Card key={i} />)}</div>
      ) : statistikData.length === 0 && donutData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span className="text-4xl" aria-hidden="true">📊</span>
          <p className="text-sm font-medium text-neutral-600">Belum ada data statistik</p>
          <p className="text-xs text-neutral-400">untuk wilayah yang dipilih</p>
        </div>
      ) : (
        <>
          {indikatorMap.size > 0 && (
            <div className="space-y-2">
              {Array.from(indikatorMap.entries()).slice(0, 4).map(([ind, v]) => (
                <StatistikCard key={ind} indikator={ind} nilai={v.nilai} satuan={v.satuan} tahun={v.tahun} />
              ))}
            </div>
          )}
          {barData.length > 1 && (
            <div className="bg-white rounded-xl border border-neutral-200/60 shadow-soft p-4">
              <BarChart data={barData} title="Perbandingan Indikator" />
            </div>
          )}
          {donutData.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200/60 shadow-soft p-4">
              <DonutChart data={donutData} title="Distribusi Infrastruktur" />
            </div>
          )}
          {statistikData.length === 0 && donutData.length > 0 && (
            <p className="text-xs text-neutral-400 text-center py-2">Tidak ada data statistik untuk wilayah ini</p>
          )}
        </>
      )}
    </div>
  );
}
