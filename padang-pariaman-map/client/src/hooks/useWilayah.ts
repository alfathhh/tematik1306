import { useState, useEffect } from 'react';
import api from '../lib/api';
import { WilayahOption } from '../types';

// Hook untuk fetch daftar kecamatan
export function useKecamatan(kdkab: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!kdkab) return;

    setLoading(true);
    api.get('/wilayah/kecamatan', { params: { kdkab } })
      .then(res => setData(res.data))
      .catch(err => console.error('useKecamatan error:', err))
      .finally(() => setLoading(false));
  }, [kdkab]);

  return { data, loading };
}

// Hook untuk fetch daftar nagari
export function useNagari(kdkec: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!kdkec) { setData([]); return; }

    setLoading(true);
    api.get('/wilayah/nagari', { params: { kdkec } })
      .then(res => setData(res.data))
      .catch(err => console.error('useNagari error:', err))
      .finally(() => setLoading(false));
  }, [kdkec]);

  return { data, loading };
}

// Hook untuk fetch daftar korong
export function useKorong(kddesa: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!kddesa) { setData([]); return; }

    setLoading(true);
    api.get('/wilayah/korong', { params: { kddesa } })
      .then(res => setData(res.data))
      .catch(err => console.error('useKorong error:', err))
      .finally(() => setLoading(false));
  }, [kddesa]);

  return { data, loading };
}
