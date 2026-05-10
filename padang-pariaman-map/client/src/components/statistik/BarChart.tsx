import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface BarChartProps {
  data: { name: string; nilai: number; satuan?: string }[];
  title?: string;
  color?: string;
}

// Bar chart perbandingan nilai statistik antar wilayah/indikator
export default function BarChart({ data, title, color = '#3B82F6' }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Tidak ada data
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={160}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(v: number, _n, props) => [
              `${v.toLocaleString('id-ID')} ${props.payload?.satuan ?? ''}`,
              'Nilai'
            ]}
          />
          <Bar dataKey="nilai" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8 + (index % 3) * 0.07} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
