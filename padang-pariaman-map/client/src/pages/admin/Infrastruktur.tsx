import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Infrastruktur, KategoriInfra, InfrastrukturFormData } from '../../types';
import { ADMIN_PAGE_SIZE, KDKAB_PADANG_PARIAMAN } from '../../constants';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useKecamatan, useNagari, useKorong } from '../../hooks/useWilayah';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const EMPTY_FORM: InfrastrukturFormData = {
  nama: '', kategori: '', alamat: '', fotoUrl: '',
  lat: '', lng: '', kdkab: KDKAB_PADANG_PARIAMAN,
  kdkec: '', kddesa: '', kdsls: '',
};

// Mini peta untuk memilih koordinat
function MapPicker({ lat, lng, onChange }: { lat: number | ''; lng: number | ''; onChange: (lat: number, lng: number) => void }) {
  const center: [number, number] = (lat !== '' && lng !== '') ? [lat, lng] : [-0.5397, 100.1187];

  function ClickHandler() {
    useMapEvents({
      click(e) { onChange(e.latlng.lat, e.latlng.lng); },
    });
    return null;
  }

  return (
    <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} key={`${lat}-${lng}`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {lat !== '' && lng !== '' && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}

export default function AdminInfrastruktur() {
  const [list, setList]           = useState<Infrastruktur[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);

  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [form, setForm]           = useState<InfrastrukturFormData>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  // Import/Export
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ berhasil: number; gagal: number; errors: { baris: number; pesan: string }[] } | null>(null);

  // Wilayah cascade di form
  const { data: kecamatanList } = useKecamatan(KDKAB_PADANG_PARIAMAN);
  const { data: nagariList }    = useNagari(form.kdkec);
  const { data: korongList }    = useKorong(form.kddesa);

  useEffect(() => {
    api.get('/kategori').then(res => setKategoriList(res.data)).catch(console.error);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: ADMIN_PAGE_SIZE };
      if (search)    params.search   = search;
      if (filterKat) params.kategori = filterKat;
      const res = await api.get('/infrastruktur', { params });
      setList(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, filterKat]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (i: Infrastruktur) => {
    setForm({
      nama: i.nama, kategori: i.kategori, alamat: i.alamat ?? '', fotoUrl: i.fotoUrl ?? '',
      lat: i.lat, lng: i.lng, kdkab: i.kdkab, kdkec: i.kdkec, kddesa: i.kddesa, kdsls: i.kdsls ?? '',
    });
    setEditId(i.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kategori || form.lat === '' || form.lng === '' || !form.kdkec || !form.kddesa) {
      setFormError('Field nama, kategori, koordinat, kecamatan, dan nagari wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      if (editId) await api.put(`/infrastruktur/${editId}`, form);
      else        await api.post('/infrastruktur', form);
      setShowForm(false); fetchList();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data infrastruktur ini?')) return;
    try { await api.delete(`/infrastruktur/${id}`); fetchList(); }
    catch (err: unknown) { alert((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/infrastruktur/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); fetchList();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import');
    } finally { setImporting(false); e.target.value = ''; }
  };

  const handleExport = async () => {
    const res = await api.get('/infrastruktur/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `infrastruktur_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

  const kat = (v: string) => kategoriList.find(k => k.value === v);

  return (
    <AdminLayout title="Manajemen Infrastruktur">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama..." className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
            <select value={filterKat} onChange={e => { setFilterKat(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kategori</option>
              {kategoriList.map(k => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className={`cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-xl font-medium ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
              {importing ? '⏳ Importing...' : '📥 Import Excel'}
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <button onClick={handleExport} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-xl font-medium">
              📤 Export Excel
            </button>
            <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl font-medium">
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
            <div className="p-6 text-center text-gray-400 text-sm">Tidak ada data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Kategori</th>
                    <th className="px-4 py-3 text-left">Kecamatan</th>
                    <th className="px-4 py-3 text-left">Koordinat</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((item, idx) => {
                    const k = kat(item.kategori);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * ADMIN_PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{item.nama}</td>
                        <td className="px-4 py-3">
                          {k ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: k.color }}>
                              {k.icon} {k.label}
                            </span>
                          ) : item.kategori}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{item.kdkec}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-4">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-gray-800">{editId ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama *</label>
                    <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                      placeholder="Nama infrastruktur"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kategori *</label>
                    <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Pilih Kategori --</option>
                      {kategoriList.map(k => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alamat</label>
                    <input value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))}
                      placeholder="Alamat lengkap"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL Foto</label>
                    <input value={form.fotoUrl} onChange={e => setForm(f => ({ ...f, fotoUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Map Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Koordinat * — klik peta untuk memilih lokasi
                  </label>
                  <MapPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-0.5">Latitude</label>
                      <input type="number" step="any" value={form.lat}
                        onChange={e => setForm(f => ({ ...f, lat: parseFloat(e.target.value) || '' }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-0.5">Longitude</label>
                      <input type="number" step="any" value={form.lng}
                        onChange={e => setForm(f => ({ ...f, lng: parseFloat(e.target.value) || '' }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>
                  </div>
                </div>

                {/* Wilayah Cascade */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kecamatan *</label>
                    <select value={form.kdkec} onChange={e => setForm(f => ({ ...f, kdkec: e.target.value, kddesa: '', kdsls: '' }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Pilih --</option>
                      {kecamatanList.map(k => <option key={k.kdkec} value={k.kdkec ?? ''}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nagari *</label>
                    <select value={form.kddesa} onChange={e => setForm(f => ({ ...f, kddesa: e.target.value, kdsls: '' }))}
                      disabled={!form.kdkec}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                      <option value="">-- Pilih --</option>
                      {nagariList.map(n => <option key={n.kddesa} value={n.kddesa ?? ''}>{n.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Korong</label>
                    <select value={form.kdsls} onChange={e => setForm(f => ({ ...f, kdsls: e.target.value }))}
                      disabled={!form.kddesa}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                      <option value="">-- Pilih --</option>
                      {korongList.map(k => <option key={k.kdsls} value={k.kdsls ?? ''}>{k.nama}</option>)}
                    </select>
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
