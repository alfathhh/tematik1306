import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Statistik } from '../types';

interface UseStatistikOptions {
  idkab?: string;
  idkec?: string;
  iddesa?: string;
}

export function useStatistik(options: UseStatistikOptions = {}) {
  const { idkab, idkec, iddesa } = options;

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

    api.get('/statistik', { params })
      .then(res => setData(res.data.data || res.data))
      .catch(err => {
        setError('Gagal memuat data statistik');
        console.error('useStatistik error:', err);
      })
      .finally(() => setLoading(false));
  }, [idkab, idkec, iddesa]);

  return { data, loading, error };
}
