import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Infrastruktur } from '../types';

interface UseInfrastrukturOptions {
  kategori?: string[];   // filter kategori aktif
  kdkab?: string;
  kdkec?: string;
  kddesa?: string;
  kdsls?: string;
  enabled?: boolean;     // jika false, tidak fetch
}

// Hook untuk fetch data infrastruktur dari API
export function useInfrastruktur(options: UseInfrastrukturOptions = {}) {
  const { kategori = [], kdkab, kdkec, kddesa, kdsls, enabled = true } = options;

  const [data, setData]       = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Jangan fetch jika tidak ada kategori aktif (performa)
    if (!enabled || kategori.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (kategori.length > 0) params.kategori = kategori.join(',');
      if (kdkab)  params.kdkab  = kdkab;
      if (kdkec)  params.kdkec  = kdkec;
      if (kddesa) params.kddesa = kddesa;
      if (kdsls)  params.kdsls  = kdsls;

      const res = await api.get('/infrastruktur', { params });
      setData(res.data.data || res.data);
    } catch (err) {
      setError('Gagal memuat data infrastruktur');
      console.error('useInfrastruktur error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(kategori), kdkab, kdkec, kddesa, kdsls, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
