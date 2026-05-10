import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Statistik } from '../types';

interface UseStatistikOptions {
  kdkab?: string;
  kdkec?: string;
  kddesa?: string;
}

// Hook untuk fetch data statistik sesuai filter wilayah aktif
export function useStatistik(options: UseStatistikOptions = {}) {
  const { kdkab, kdkec, kddesa } = options;

  const [data, setData]       = useState<Statistik[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (kdkab)  params.kdkab  = kdkab;
    if (kdkec)  params.kdkec  = kdkec;
    if (kddesa) params.kddesa = kddesa;

    api.get('/statistik', { params })
      .then(res => setData(res.data.data || res.data))
      .catch(err => {
        setError('Gagal memuat data statistik');
        console.error('useStatistik error:', err);
      })
      .finally(() => setLoading(false));
  }, [kdkab, kdkec, kddesa]);

  return { data, loading, error };
}
