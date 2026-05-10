import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
}

// Donut chart distribusi kategori infrastruktur
export default function DonutChart({ data, title }: DonutChartProps) {
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
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} tempat`, '']} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
