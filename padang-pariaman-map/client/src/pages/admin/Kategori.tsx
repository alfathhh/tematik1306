import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface Kategori {
  id: string;
  label: string;
  value: string;
  warna: string;
  icon?: string;
  _count?: { infrastruktur: number };
}

const WARNA_PRESETS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

export default function KategoriPage() {
  const [list, setList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Kategori | null>(null);
  const [form, setForm] = useState({ label: '', value: '', warna: WARNA_PRESETS[0], icon: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Kategori — Admin Peta Tematik'; load(); }, []);

  function load() {
    setLoading(true);
    api.get('/admin/kategori').then(res => setList(res.data)).catch(console.error).finally(() => setLoading(false));
  }

  function openAdd() { setEditing(null); setForm({ label: '', value: '', warna: WARNA_PRESETS[0], icon: '' }); setOpen(true); }
  function openEdit(k: Kategori) { setEditing(k); setForm({ label: k.label, value: k.value, warna: k.warna, icon: k.icon || '' }); setOpen(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/kategori/${editing.id}`, form);
      else await api.post('/admin/kategori', form);
      setOpen(false);
      load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kategori ini?')) return;
    try { await api.delete(`/admin/kategori/${id}`); load(); }
    catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-neutral-900">Kategori</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Kelola kategori infrastruktur</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Tambah
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-50">{[1,2,3].map(i => <div key={i} className="px-5 py-3 flex gap-3"><div className="flex-1 h-4 bg-neutral-100 rounded animate-pulse" /></div>)}</div>
        ) : !list.length ? (
          <div className="px-5 py-10 text-center text-sm text-neutral-400">Belum ada kategori.</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {list.map(k => (
              <div key={k.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: k.warna + '20', border: `1.5px solid ${k.warna}60` }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: k.warna }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900">{k.label}</div>
                  <div className="text-xs text-neutral-400">{k.value} · {k._count?.infrastruktur ?? 0} titik</div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => openEdit(k)} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button type="button" onClick={() => handleDelete(k.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Label</label><Input value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} placeholder="Contoh: Jalan Raya" required /></div>
          <div className="space-y-1"><label className="text-xs font-medium text-neutral-700">Value (slug)</label><Input value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} placeholder="contoh: jalan-raya" required /></div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-700">Warna</label>
            <div className="flex flex-wrap gap-2">
              {WARNA_PRESETS.map(w => (
                <button key={w} type="button" onClick={() => setForm(f => ({...f, warna: w}))} className="w-7 h-7 rounded-lg border-2 transition-all" style={{ backgroundColor: w, borderColor: form.warna === w ? w : 'transparent', outline: form.warna === w ? `2px solid ${w}60` : 'none', outlineOffset: '1px' }} />
              ))}
            </div>
            <Input value={form.warna} onChange={e => setForm(f => ({...f, warna: e.target.value}))} placeholder="#3B82F6" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={saving}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
