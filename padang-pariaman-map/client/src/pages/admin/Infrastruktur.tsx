import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Infrastruktur, KategoriInfra, InfrastrukturFormData } from '../../types';
import { ADMIN_PAGE_SIZE, IDKAB_PADANG_PARIAMAN } from '../../constants';
import { MapContainer as LeafletMap, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useKecamatanGeoJSON, useNagariGeoJSON, useKorongGeoJSON } from '../../hooks/useWilayahGeoJSON';
import { FotoUpload } from '../../components/admin/FotoUpload';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/cn';

/**
 * AdminInfrastruktur — halaman CRUD data infrastruktur.
 *
 * Fix: versi lama mengimport useKategoriStore dan useWilayahStore yang tidak ada,
 * dan menggunakan { FotoUpload } dengan prop schema berbeda (value: string[]).
 * Sekarang fetch kategori langsung dari API dan pakai hooks useKecamatan/useNagari/useKorong.
 */

// Fix Leaflet default icon (hilang saat di-bundle oleh Vite)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const EMPTY_FORM: InfrastrukturFormData = {
  nama: '', kategori: '', alamat: '', fotoUrl: '',
  lat: '', lng: '', idkab: IDKAB_PADANG_PARIAMAN,
  idkec: '', iddesa: '', idsls: '',
};

/** MapPicker — mini-map untuk pilih koordinat dengan klik. */
function MapPicker({ lat, lng, onChange }: { lat: number | ''; lng: number | ''; onChange: (lat: number, lng: number) => void }) {
  const center: [number, number] = (lat !== '' && lng !== '') ? [lat, lng] : [-0.5397, 100.1187];
  function ClickHandler() {
    useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
    return null;
  }
  return (
    <div className="h-48 rounded-xl overflow-hidden border border-neutral-200">
      <LeafletMap center={center} zoom={12} style={{ height: '100%', width: '100%' }} key={`${lat}-${lng}`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {lat !== '' && lng !== '' && <Marker position={[lat, lng]} />}
      </LeafletMap>
    </div>
  );
}

export default function AdminInfrastruktur() {
  React.useEffect(() => { document.title = 'Infrastruktur — Admin Peta Tematik'; }, []);

  const [list, setList]           = useState<Infrastruktur[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [editId, setEditId]       = useState<number | null>(null);
  const [form, setForm]           = useState<InfrastrukturFormData>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ berhasil: number; gagal: number; errors: { baris: number; pesan: string }[] } | null>(null);
  const { toast } = useToast();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList    = useNagariGeoJSON(form.idkec);
  const korongList    = useKorongGeoJSON(form.iddesa);

  // Fetch kategori dari API (bukan dari store fiktif)
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
      setList(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, search, filterKat]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const openAdd    = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit   = (i: Infrastruktur) => {
    setForm({ nama: i.nama, kategori: i.kategori, alamat: i.alamat ?? '', fotoUrl: i.fotoUrl ?? '', lat: i.lat, lng: i.lng, idkab: i.idkab, idkec: i.idkec, iddesa: i.iddesa, idsls: i.idsls ?? '' });
    setEditId(i.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kategori || form.lat === '' || form.lng === '' || !form.idkec || !form.iddesa) {
      setFormError('Nama, kategori, koordinat, kecamatan, dan nagari wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      if (editId) await api.put(`/infrastruktur/${editId}`, form);
      else        await api.post('/infrastruktur', form);
      toast.success(editId ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
      setShowForm(false); fetchList();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;
    try {
      await api.delete(`/infrastruktur/${showDeleteId}`);
      toast.success('Data berhasil dihapus');
      setShowDeleteId(null); fetchList();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus');
      setShowDeleteId(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/infrastruktur/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); fetchList();
      toast.success(`Import selesai: ${res.data.berhasil} berhasil, ${res.data.gagal} gagal`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import');
    } finally { setImporting(false); e.target.value = ''; }
  };

  const handleExport = async () => {
    const res = await api.get('/infrastruktur/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `infrastruktur_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

  const getKat = (v: string) => kategoriList.find(k => k.value === v);

  return (
    <AdminLayout title="Manajemen Infrastruktur">
      <div className="space-y-4 max-w-7xl">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
            <label className={cn('cursor-pointer text-sm px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors', importing ? 'opacity-60 pointer-events-none bg-neutral-100 text-neutral-500' : 'bg-success-50 hover:bg-success-500/10 text-success-600 border border-success-500/20')}>
              {importing ? <><span className="w-3.5 h-3.5 border-2 border-success-500 border-t-transparent rounded-full animate-spin" /> Importing...</> : <>📥 Import Excel</>}
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <Button variant="secondary" size="sm" onClick={handleExport}>📤 Export Excel</Button>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama..." containerClassName="w-44"
              leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
            <Select value={filterKat} onChange={e => { setFilterKat(e.target.value); setPage(1); }} containerClassName="w-40">
              <option value="">Semua Kategori</option>
              {kategoriList.map(k => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
            </Select>
            <Button onClick={openAdd} leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}>Tambah</Button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className={cn('p-3 rounded-xl text-sm flex items-center justify-between gap-3', importResult.gagal > 0 ? 'bg-warning-50 border border-warning-500/20 text-warning-600' : 'bg-success-50 border border-success-500/20 text-success-600')}>
            <span>✅ Berhasil: <b>{importResult.berhasil}</b> &nbsp;|&nbsp; ❌ Gagal: <b>{importResult.gagal}</b></span>
            <button type="button" onClick={() => setImportResult(null)} className="text-xs hover:underline">Tutup</button>
          </div>
        )}

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/60 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-neutral-100 text-xs text-neutral-500 flex justify-between">
            <span>{total.toLocaleString('id-ID')} data</span>
            <span>Hal. {page}/{totalPages || 1}</span>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl block mb-3" aria-hidden="true">🏗️</span>
              <p className="text-sm font-medium text-neutral-600">Belum ada data infrastruktur</p>
              <p className="text-xs text-neutral-400 mt-1">Klik "Tambah" untuk menambahkan data pertama</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[680px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Kecamatan</th>
                    <th>Koordinat</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, idx) => {
                    const k = getKat(item.kategori);
                    return (
                      <tr key={item.id}>
                        <td className="text-neutral-400 text-xs">{(page - 1) * ADMIN_PAGE_SIZE + idx + 1}</td>
                        <td className="font-medium text-neutral-900 max-w-[200px]">
                          <span className="truncate block">{item.nama}</span>
                        </td>
                        <td>
                          {k ? <Badge color={k.color} icon={<span>{k.icon}</span>}>{k.label}</Badge>
                            : <span className="text-neutral-400 text-xs">{item.kategori}</span>}
                        </td>
                        <td className="text-neutral-500 text-xs font-mono">{item.idkec}</td>
                        <td className="text-neutral-400 text-xs font-mono">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</td>
                        <td>
                          <div className="flex justify-center items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteId(item.id)} aria-label="Hapus" className="text-danger-500 hover:bg-danger-50">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-neutral-100 flex justify-center items-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span className="text-xs text-neutral-500 px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </div>

        {/* Modal Form Tambah/Edit */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}
          title={editId ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'} size="lg"
          footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button><Button type="submit" form="infra-form" isLoading={saving}>Simpan</Button></>}>
          <form id="infra-form" onSubmit={handleSave} className="space-y-4">
            <Input label="Nama" required value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama infrastruktur" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Kategori" required value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map(k => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
              </Select>
              <Input label="Alamat" value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat lengkap" />
            </div>
            <FotoUpload value={form.fotoUrl} onChange={url => setForm(f => ({ ...f, fotoUrl: url }))} />
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Koordinat * — klik peta untuk memilih lokasi</label>
              <MapPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))} />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input label="Latitude" type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: parseFloat(e.target.value) || '' }))} className="font-mono" />
                <Input label="Longitude" type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: parseFloat(e.target.value) || '' }))} className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select label="Kecamatan *" value={form.idkec} onChange={e => setForm(f => ({ ...f, idkec: e.target.value, iddesa: '', idsls: '' }))}>
                <option value="">-- Pilih --</option>
                {kecamatanList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
              </Select>
              <Select label="Nagari *" value={form.iddesa} onChange={e => setForm(f => ({ ...f, iddesa: e.target.value, idsls: '' }))} disabled={!form.idkec}>
                <option value="">-- Pilih --</option>
                {nagariList.map(n => <option key={n.kode} value={n.kode}>{n.nama}</option>)}
              </Select>
              <Select label="Korong" value={form.idsls} onChange={e => setForm(f => ({ ...f, idsls: e.target.value }))} disabled={!form.iddesa}>
                <option value="">-- Pilih --</option>
                {korongList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
              </Select>
            </div>
            {formError && <div role="alert" className="text-xs text-danger-600 bg-danger-50 border border-danger-500/20 rounded-xl px-3 py-2">{formError}</div>}
          </form>
        </Modal>

        {/* Modal Konfirmasi Hapus */}
        <Modal isOpen={showDeleteId !== null} onClose={() => setShowDeleteId(null)} title="Hapus Data" size="sm"
          footer={<><Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button><Button variant="danger" onClick={confirmDelete}>Hapus</Button></>}>
          <p className="text-sm text-neutral-600">Apakah Anda yakin ingin menghapus data infrastruktur ini? Tindakan ini tidak dapat dibatalkan.</p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
