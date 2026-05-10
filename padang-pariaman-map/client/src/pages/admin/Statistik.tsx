import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Statistik, StatistikFormData } from '../../types';
import { ADMIN_PAGE_SIZE, KDKAB_PADANG_PARIAMAN } from '../../constants';
import { useKecamatan, useNagari, useKorong } from '../../hooks/useWilayah';

const EMPTY_FORM: StatistikFormData = {
  kdkab: KDKAB_PADANG_PARIAMAN, kdkec: '', kddesa: '', kdsls: '',
  indikator: '', nilai: '', satuan: '', tahun: new Date().getFullYear(),
};

export default function AdminStatistik() {
  const [list, setList]           = useState<Statistik[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [filterTahun, setFilterTahun] = useState('');
  const [filterKdkec, setFilterKdkec] = useState('');

  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [form, setForm]           = useState<StatistikFormData>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{berhasil:number;gagal:number;errors:{baris:number;pesan:string}[]} | null>(null);

  const { data: kecamatanList } = useKecamatan(KDKAB_PADANG_PARIAMAN);
  const { data: nagariList }    = useNagari(form.kdkec);
  const { data: korongList }    = useKorong(form.kddesa);

  // Tahun unik untuk filter
  const [tahunList, setTahunList] = useState<number[]>([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: ADMIN_PAGE_SIZE };
      if (filterTahun) params.tahun = filterTahun;
      if (filterKdkec) params.kdkec = filterKdkec;
      const res = await api.get('/statistik', { params });
      setList(res.data.data || []);
      setTotal(res.data.total || 0);

      // Ambil tahun unik untuk dropdown filter
      if (tahunList.length === 0) {
        const allRes = await api.get('/statistik');
        const allData = allRes.data.data || allRes.data;
        const tahuns = [...new Set(allData.map((s: Statistik) => s.tahun))] as number[];
        setTahunList(tahuns.sort((a, b) => b - a));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filterTahun, filterKdkec]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (s: Statistik) => {
    setForm({
      kdkab: s.kdkab, kdkec: s.kdkec ?? '', kddesa: s.kddesa ?? '', kdsls: s.kdsls ?? '',
      indikator: s.indikator, nilai: s.nilai, satuan: s.satuan ?? '', tahun: s.tahun,
    });
    setEditId(s.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.indikator || form.nilai === '' || !form.tahun) {
      setFormError('Indikator, nilai, dan tahun wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, nilai: Number(form.nilai), tahun: Number(form.tahun) };
      if (editId) await api.put(`/statistik/${editId}`, payload);
      else        await api.post('/statistik', payload);
      setShowForm(false); fetchList();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data statistik ini?')) return;
    try { await api.delete(`/statistik/${id}`); fetchList(); }
    catch (err: unknown) { alert((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/statistik/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); fetchList();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import');
    } finally { setImporting(false); e.target.value = ''; }
  };

  const handleExport = async () => {
    const res = await api.get('/statistik/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `statistik_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Manajemen Statistik">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Tahun</option>
              {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterKdkec} onChange={e => { setFilterKdkec(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(k => <option key={k.kdkec} value={k.kdkec ?? ''}>{k.nama}</option>)}
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className={`cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-xl font-medium ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
              {importing ? '⏳ Importing...' : '📥 Import Excel'}
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <button onClick={handleExport}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-xl font-medium">
              📤 Export Excel
            </button>
            <button onClick={openAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium">
              ＋ Tambah
            </button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className={`p-3 rounded-xl text-sm ${importResult.gagal > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            ✅ Berhasil: {importResult.berhasil} baris &nbsp;|&nbsp; ❌ Gagal: {importResult.gagal} baris
            {importResult.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-500">Lihat error</summary>
                <ul className="mt-1 space-y-0.5">
                  {importResult.errors.slice(0, 10).map(e => (
                    <li key={e.baris} className="text-xs text-red-600">Baris {e.baris}: {e.pesan}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
            {total} data • Halaman {page}/{totalPages || 1}
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Tidak ada data statistik</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Indikator</th>
                    <th className="px-4 py-3 text-left">Wilayah</th>
                    <th className="px-4 py-3 text-right">Nilai</th>
                    <th className="px-4 py-3 text-left">Satuan</th>
                    <th className="px-4 py-3 text-center">Tahun</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * ADMIN_PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">{item.indikator}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                        {item.kddesa ?? item.kdkec ?? item.kdkab}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700">
                        {item.nilai.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.satuan ?? '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {item.tahun}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1 text-xs text-gray-500">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-gray-800">{editId ? 'Edit Data Statistik' : 'Tambah Data Statistik'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Indikator *</label>
                  <input value={form.indikator} onChange={e => setForm(f => ({ ...f, indikator: e.target.value }))}
                    placeholder="Contoh: Jumlah Penduduk"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nilai *</label>
                    <input type="number" step="any" value={form.nilai}
                      onChange={e => setForm(f => ({ ...f, nilai: parseFloat(e.target.value) || '' }))}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Satuan</label>
                    <input value={form.satuan} onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))}
                      placeholder="jiwa, km², dll"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tahun *</label>
                  <input type="number" value={form.tahun}
                    onChange={e => setForm(f => ({ ...f, tahun: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {/* Wilayah cascade */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Wilayah (opsional — kosong = level kabupaten)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select value={form.kdkec} onChange={e => setForm(f => ({ ...f, kdkec: e.target.value, kddesa: '', kdsls: '' }))}
                        className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Kecamatan --</option>
                        {kecamatanList.map(k => <option key={k.kdkec} value={k.kdkec ?? ''}>{k.nama}</option>)}
                      </select>
                    </div>
                    <div>
                      <select value={form.kddesa} onChange={e => setForm(f => ({ ...f, kddesa: e.target.value, kdsls: '' }))}
                        disabled={!form.kdkec}
                        className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                        <option value="">-- Nagari --</option>
                        {nagariList.map(n => <option key={n.kddesa} value={n.kddesa ?? ''}>{n.nama}</option>)}
                      </select>
                    </div>
                    <div>
                      <select value={form.kdsls} onChange={e => setForm(f => ({ ...f, kdsls: e.target.value }))}
                        disabled={!form.kddesa}
                        className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                        <option value="">-- Korong --</option>
                        {korongList.map(k => <option key={k.kdsls} value={k.kdsls ?? ''}>{k.nama}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ {formError}</div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Batal</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-60">
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
