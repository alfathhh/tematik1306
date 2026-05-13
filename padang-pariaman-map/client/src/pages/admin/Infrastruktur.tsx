import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FotoUpload } from '../../components/admin/FotoUpload';
import { Badge } from '../../components/ui/Badge';
import { useKategoriStore } from '../../store/kategoriStore';
import { useWilayahStore } from '../../store/wilayahStore';
import type { Infrastruktur } from '../../types';

type FormData = {
  nama: string;
  deskripsi: string;
  kategoriId: string;
  kecamatanId: string;
  nagariId: string;
  lat: string;
  lng: string;
  foto: string[];
};

const EMPTY: FormData = { nama: '', deskripsi: '', kategoriId: '', kecamatanId: '', nagariId: '', lat: '', lng: '', foto: [] };

export default function InfrastrukturPage() {
  const [list, setList] = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Infrastruktur | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { kategoriList, fetchKategori } = useKategoriStore();
  const { kecamatanList, nagariList, fetchKecamatan, fetchNagari } = useWilayahStore();

  useEffect(() => {
    document.title = 'Infrastruktur — Admin Peta Tematik';
    fetchKategori();
    fetchKecamatan();
  }, []);

  useEffect(() => {
    if (form.kecamatanId) fetchNagari(form.kecamatanId);
  }, [form.kecamatanId]);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/infrastruktur').then(res => setList(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(item: Infrastruktur) {
    setEditing(item);
    setForm({ nama: item.nama, deskripsi: item.deskripsi || '', kategoriId: item.kategoriId, kecamatanId: item.kecamatanId || '', nagariId: item.nagariId || '', lat: String(item.lat), lng: String(item.lng), foto: item.foto || [] });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) };
      if (editing) await api.put(`/admin/infrastruktur/${editing.id}`, body);
      else await api.post('/admin/infrastruktur', body);
      setOpen(false);
      load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await api.delete(`/admin/infrastruktur/${id}`); load(); }
    catch (err) { console.error(err); }
    finally { setDeleteConfirm(null); }
  }

  const filtered = list.filter(i => i.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-display font-bold text-neutral-900">Infrastruktur</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Kelola data titik infrastruktur di peta</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Tambah
        </Button>
      </div>

      <div className="relative max-w-xs">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama infrastruktur..." className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400" />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-50">{[1,2,3,4].map(i => <div key={i} className="px-5 py-3 flex gap-3"><div className="flex-1 h-4 bg-neutral-100 rounded animate-pulse" /></div>)}</div>
        ) : !filtered.length ? (
          <div className="px-5 py-10 text-center text-sm text-neutral-400">{search ? 'Tidak ditemukan hasil.' : 'Belum ada data infrastruktur.'}</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {filtered.map(item => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 truncate">{item.nama}</span>
                    <Badge color={item.kategori?.warna as any}>{item.kategori?.label}</Badge>
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">{item.kecamatan?.nama}{item.nagari ? ` · ${item.nagari.nama}` : ''}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button type="button" onClick={() => setDeleteConfirm(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Nama</label><Input value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} required /></div>
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Deskripsi</label><textarea value={form.deskripsi} onChange={e => setForm(f => ({...f, deskripsi: e.target.value}))} className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 resize-none" rows={3} /></div>
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Kategori</label><Select value={form.kategoriId} onChange={e => setForm(f => ({...f, kategoriId: e.target.value}))} required options={kategoriList.map(k => ({value: k.id, label: k.label}))} placeholder="Pilih kategori" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Kecamatan</label><Select value={form.kecamatanId} onChange={e => setForm(f => ({...f, kecamatanId: e.target.value, nagariId: ''}))} options={kecamatanList.map(k => ({value: k.id, label: k.nama}))} placeholder="Pilih kecamatan" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Nagari</label><Select value={form.nagariId} onChange={e => setForm(f => ({...f, nagariId: e.target.value}))} options={nagariList.map(n => ({value: n.id, label: n.nama}))} placeholder="Pilih nagari" disabled={!form.kecamatanId} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Latitude</label><Input value={form.lat} onChange={e => setForm(f => ({...f, lat: e.target.value}))} type="number" step="any" required /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Longitude</label><Input value={form.lng} onChange={e => setForm(f => ({...f, lng: e.target.value}))} type="number" step="any" required /></div>
          </div>
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Foto</label><FotoUpload value={form.foto} onChange={urls => setForm(f => ({...f, foto: urls}))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Infrastruktur">
        <p className="text-sm text-neutral-600 mb-4">Yakin ingin menghapus infrastruktur ini? Tindakan tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
