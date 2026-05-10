import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { KategoriInfra, KategoriFormData } from '../../types';

const EMPTY_FORM: KategoriFormData = {
  value: '', label: '', icon: '📍', color: '#3B82F6', urutan: '',
};

export default function AdminKategori() {
  const [list, setList]       = useState<KategoriInfra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [form, setForm]       = useState<KategoriFormData>(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [jumlahInfra, setJumlahInfra] = useState<Record<string, number>>({});

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const [katRes, infraRes] = await Promise.all([
        api.get('/kategori'),
        api.get('/infrastruktur'),
      ]);
      setList(katRes.data);
      const items = infraRes.data.data || infraRes.data;
      const counts: Record<string, number> = {};
      for (const item of items) counts[item.kategori] = (counts[item.kategori] || 0) + 1;
      setJumlahInfra(counts);
    } catch { /* handled below */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (k: KategoriInfra) => {
    setForm({ value: k.value, label: k.label, icon: k.icon, color: k.color, urutan: k.urutan });
    setEditId(k.id); setError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value || !form.label || !form.icon || !form.color) {
      setError('Semua field wajib diisi'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form, urutan: Number(form.urutan) || 0 };
      if (editId) { await api.put(`/kategori/${editId}`, payload); }
      else        { await api.post('/kategori', payload); }
      setShowForm(false);
      fetchList();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (k: KategoriInfra) => {
    if (!confirm(`Hapus kategori "${k.label}"?`)) return;
    try {
      await api.delete(`/kategori/${k.id}`);
      fetchList();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus');
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{list.length} kategori terdaftar</p>
          <button onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2">
            <span>＋</span> Tambah Kategori
          </button>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Belum ada kategori</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Icon</th>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-left">Value</th>
                  <th className="px-4 py-3 text-left">Warna</th>
                  <th className="px-4 py-3 text-center">Urutan</th>
                  <th className="px-4 py-3 text-center">Jml Infra</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xl">{k.icon}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{k.label}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{k.value}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: k.color }} />
                        <span className="text-xs text-gray-500 font-mono">{k.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{k.urutan}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        (jumlahInfra[k.value] ?? 0) > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {jumlahInfra[k.value] ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(k)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        <button
                          onClick={() => handleDelete(k)}
                          disabled={(jumlahInfra[k.value] ?? 0) > 0}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          title={(jumlahInfra[k.value] ?? 0) > 0 ? 'Kategori masih digunakan' : 'Hapus'}
                        >Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-gray-800">
                  {editId ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Value (slug) *</label>
                    <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder="restoran" disabled={!!editId}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 font-mono" />
                    <p className="text-xs text-gray-400 mt-0.5">Huruf kecil &amp; underscore</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label *</label>
                    <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                      placeholder="Restoran"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji) *</label>
                    <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      placeholder="🍽️"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Warna *</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                      <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="flex-1 px-2 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Urutan</label>
                    <input type="number" value={form.urutan} onChange={e => setForm(f => ({ ...f, urutan: parseInt(e.target.value) || '' }))}
                      placeholder="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ {error}</div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">
                    Batal
                  </button>
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
