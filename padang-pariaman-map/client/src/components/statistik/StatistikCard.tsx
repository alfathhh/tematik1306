import React from 'react';

interface StatistikCardProps {
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun?: number;
}

// Card angka ringkasan untuk satu indikator statistik
export default function StatistikCard({ indikator, nilai, satuan, tahun }: StatistikCardProps) {
  const formattedNilai = nilai >= 1000
    ? nilai.toLocaleString('id-ID')
    : nilai % 1 !== 0
      ? nilai.toFixed(2)
      : String(nilai);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 truncate">
        {indikator}
      </p>
      <p className="text-2xl font-bold text-gray-800 leading-tight">
        {formattedNilai}
        {satuan && <span className="text-sm font-normal text-gray-500 ml-1">{satuan}</span>}
      </p>
      {tahun && (
        <p className="text-xs text-gray-400 mt-1">Tahun {tahun}</p>
      )}
    </div>
  );
}
