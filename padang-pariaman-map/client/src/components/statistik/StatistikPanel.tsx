import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronDown, CircleDot, Layers3 } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { useStatistik } from '../../hooks/useStatistik';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import StatistikCard from './StatistikCard';
import DonutChart from './DonutChart';
import { Skeleton } from '../ui/Skeleton';
import { KategoriInfra } from '../../types';
import { NAMA_KABUPATEN } from '../../constants';

interface StatistikPanelProps {
  kategoriList: KategoriInfra[];
}

type MetrikPanel = {
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun?: number;
  sumber?: string;
};

const JUDUL_UTAMA = ['Jumlah Penduduk', 'Jumlah Infrastruktur', 'Nilai IPM', 'Luas Lahan'];

function normalisasiJudul(value: string) {
  return value.trim().toLowerCase();
}

function formatAngka(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} jt`;
  if (value % 1 !== 0) return value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  return value.toLocaleString('id-ID');
}

export default function StatistikPanel({ kategoriList }: StatistikPanelProps) {
  const { idkab, idkec, iddesa, idsls } = useFilterStore();
  const [judulAktif, setJudulAktif] = useState('Jumlah Penduduk');

  const { data: statistikData, loading: loadingStat } = useStatistik({
    idkab,
    idkec:  idkec  || undefined,
    iddesa: iddesa || undefined,
    idsls:  idsls  || undefined,
    aggregate: true,
  });

  const { data: allInfra } = useInfrastruktur({
    idkab,
    idkec:    idkec    || undefined,
    iddesa:   iddesa   || undefined,
    idsls:    idsls    || undefined,
    kategori: kategoriList.map(k => k.value),
    enabled:  kategoriList.length > 0,
  });

  const metrikStatistik = useMemo(() => {
    const byJudul = new Map<string, MetrikPanel>();

    for (const item of statistikData) {
      const key = normalisasiJudul(item.indikator);
      if (byJudul.has(key)) continue;

      byJudul.set(key, {
        indikator: item.indikator,
        nilai: item.nilai,
        satuan: item.satuan,
        tahun: item.tahun,
        sumber: item.agregat && item.levelSumber
          ? `${item.metodeAgregasi === 'avg' ? 'Rata-rata' : 'Agregat'} dari ${item.jumlahSumber ?? 0} data ${item.levelSumber}`
          : undefined,
      });
    }

    return byJudul;
  }, [statistikData]);

  const totalInfra = allInfra.length;
  const metrikInfra: MetrikPanel = {
    indikator: 'Jumlah Infrastruktur',
    nilai: totalInfra,
    satuan: 'unit',
  };

  const judulTersedia = useMemo(() => {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const judul of JUDUL_UTAMA) {
      const key = normalisasiJudul(judul);
      if (judul === 'Jumlah Infrastruktur' || metrikStatistik.has(key)) {
        result.push(judul);
        seen.add(key);
      }
    }

    for (const item of statistikData) {
      const key = normalisasiJudul(item.indikator);
      if (!seen.has(key)) {
        result.push(item.indikator);
        seen.add(key);
      }
    }

    return result;
  }, [metrikStatistik, statistikData]);

  useEffect(() => {
    if (judulTersedia.length === 0) return;
    const hasActive = judulTersedia.some((judul) => normalisasiJudul(judul) === normalisasiJudul(judulAktif));
    if (!hasActive) setJudulAktif(judulTersedia[0]);
  }, [judulAktif, judulTersedia]);

  const isJumlahInfra = normalisasiJudul(judulAktif) === normalisasiJudul('Jumlah Infrastruktur');
  const metrikAktif = isJumlahInfra ? metrikInfra : metrikStatistik.get(normalisasiJudul(judulAktif));

  const donutData = kategoriList
    .map(kat => ({
      name:  kat.label,
      value: allInfra.filter(i => i.kategori === kat.value).length,
      color: kat.color,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const wilayahLabel = idsls
    ? `Korong ${idsls}`
    : iddesa
      ? `Nagari ${iddesa}`
      : idkec
        ? `Kecamatan ${idkec}`
        : NAMA_KABUPATEN;

  const kosong = !loadingStat && judulTersedia.length === 0 && totalInfra === 0;

  return (
    <div className="h-full w-[min(360px,calc(100vw-2rem))] overflow-y-auto panel-scroll px-3 py-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-sm text-neutral-900">Statistik Wilayah</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{wilayahLabel}</p>
        </div>
        {totalInfra > 0 && (
          <span className="shrink-0 text-[11px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-100">
            {totalInfra} infra
          </span>
        )}
      </div>

      {loadingStat ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton.Card key={i} />)}</div>
      ) : kosong ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <BarChart3 size={34} className="text-neutral-300" aria-hidden="true" />
          <p className="text-sm font-medium text-neutral-600">Belum ada data statistik</p>
          <p className="text-xs text-neutral-400">untuk wilayah yang dipilih</p>
        </div>
      ) : (
        <>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Judul statistik
            </span>
            <span className="relative block">
              <select
                value={judulAktif}
                onChange={(e) => setJudulAktif(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 pr-9 text-sm font-semibold text-neutral-800 shadow-soft outline-none transition-colors focus:border-primary-500 focus-visible:shadow-focus"
              >
                {judulTersedia.map((judul) => (
                  <option key={judul} value={judul}>{judul}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </span>
          </label>

          {isJumlahInfra ? (
            <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-soft space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Jumlah Infrastruktur</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold leading-none text-neutral-900">
                      {formatAngka(totalInfra)}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">unit</span>
                  </div>
                </div>
                <span className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Layers3 size={18} />
                </span>
              </div>

              {donutData.length > 0 ? (
                <>
                  <DonutChart data={donutData} title="Berdasarkan Kategori" />
                  <div className="space-y-2.5">
                    {donutData.map((item) => {
                      const percent = totalInfra > 0 ? Math.round((item.value / totalInfra) * 100) : 0;
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="flex min-w-0 items-center gap-2 text-neutral-600">
                              <CircleDot size={10} style={{ color: item.color }} className="shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="shrink-0 font-semibold text-neutral-800">{item.value} <span className="text-neutral-400">({percent}%)</span></span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-center">
                  <p className="text-sm font-medium text-neutral-600">Belum ada infrastruktur</p>
                  <p className="mt-1 text-xs text-neutral-400">untuk wilayah ini</p>
                </div>
              )}
            </div>
          ) : metrikAktif ? (
            <div className="space-y-2">
              <StatistikCard
                indikator={metrikAktif.indikator}
                nilai={metrikAktif.nilai}
                satuan={metrikAktif.satuan}
                tahun={metrikAktif.tahun}
              />
              {metrikAktif.sumber && (
                <p className="px-1 text-[11px] text-neutral-400">{metrikAktif.sumber}</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4 text-center">
              <p className="text-sm font-medium text-neutral-600">Judul ini belum punya data</p>
              <p className="mt-1 text-xs text-neutral-400">Tambahkan dari halaman admin statistik.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
