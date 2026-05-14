import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Statistik } from '../types';

interface UseStatistikOptions {
  idkab?: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
  indikator?: string;
  aggregate?: boolean;
}

export function useStatistik(options: UseStatistikOptions = {}) {
  const { idkab, idkec, iddesa, idsls, indikator, aggregate } = options;

  const [data, setData]       = useState<Statistik[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (idkab)  params.idkab  = idkab;
    if (idkec)  params.idkec  = idkec;
    if (iddesa) params.iddesa = iddesa;
    if (idsls)  params.idsls  = idsls;
    if (indikator) params.indikator = indikator;
    if (aggregate) params.aggregate = 'true';

    async function fetchStatistik() {
      try {
        const res = await api.get('/statistik', { params });
        setData(res.data.data || res.data);
      } catch (err) {
        setError('Gagal memuat data statistik');
        console.error('useStatistik error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistik();
  }, [idkab, idkec, iddesa, idsls, indikator, aggregate]);

  return { data, loading, error };
}
