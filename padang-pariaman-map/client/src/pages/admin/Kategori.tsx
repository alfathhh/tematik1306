import React, { useState, useEffect, useCallback } from 'react';
import { Tags } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { KategoriInfra, KategoriFormData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryColor,
  getCategoryIcon,
  getCategoryIconValue,
} from '../../lib/gis/categoryConfig';
import { cn } from '../../lib/cn';

const WARNA_PRESETS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];

const EMPTY_FORM: KategoriFormData = {
  value: '', label: '', icon: CATEGORY_ICON_OPTIONS[0].value, color: WARNA_PRESETS[0], urutan: '',
};

export default function AdminKategori() {
  React.useEffect(() => { document.title = 'Kategori — Admin Peta Tematik'; }, []);

  const [list, setList]         = useState<KategoriInfra[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<KategoriFormData>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');
  const { toast } = useToast();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/kategori');
      setList(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true);
  };
  const openEdit = (k: KategoriInfra) => {
    const iconValue = getCategoryIconValue(k.value, k);
    setForm({ value: k.value, label: k.label, icon: iconValue, color: k.color, urutan: k.urutan });
    setEditId(k.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.value) {
      setFormError('Label dan value wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, urutan: Number(form.urutan) || 0 };
      if (editId) await api.put(`/kategori/${editId}`, payload);
      else        await api.post('/kategori', payload);
      toast.success(editId ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      setShowForm(false); fetchList();
    } catch (err: unknown) {
      setFormError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan'
      );
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;
    try {
      await api.delete(`/kategori/${showDeleteId}`);
      toast.success('Kategori berhasil dihapus');
      setShowDeleteId(null); fetchList();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus'
      );
      setShowDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="admin-page">
        {/* Toolbar */}
        <div className="admin-toolbar-end">
          <Button
            onClick={openAdd}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          >
            Tambah Kategori
          </Button>
        </div>

        {/* Tabel */}
        <div className="admin-panel">
          <div className="px-4 py-2.5 border-b border-neutral-100 text-xs text-neutral-500">
            {list.length} kategori
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <Tags size={40} className="mx-auto mb-3 text-neutral-300" aria-hidden="true" />
              <p className="text-sm font-medium text-neutral-600">Belum ada kategori</p>
              <p className="text-xs text-neutral-400 mt-1">Klik "Tambah Kategori" untuk memulai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[480px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Kategori</th>
                    <th>Value</th>
                    <th className="text-center">Urutan</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((k, idx) => {
                    const Icon = getCategoryIcon(k.value, k);
                    const warnaHex = getCategoryColor(k.value, k);

                    return (
                    <tr key={k.id}>
                      <td className="text-neutral-400 text-xs">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${warnaHex}20`, border: `1.5px solid ${warnaHex}60` }}
                          >
                            <Icon size={16} style={{ color: warnaHex }} aria-hidden="true" />
                          </div>
                          <span className="font-medium text-neutral-900">{k.label}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">{k.value}</Badge>
                      </td>
                      <td className="text-center text-xs text-neutral-500">{k.urutan}</td>
                      <td>
                        <div className="flex justify-center items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(k)} aria-label="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setShowDeleteId(k.id)}
                            aria-label="Hapus"
                            className="text-danger-500 hover:bg-danger-50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
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
        </div>

        {/* Modal Form Tambah/Edit */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editId ? 'Edit Kategori' : 'Tambah Kategori'}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" form="kat-form" isLoading={saving}>Simpan</Button>
            </>
          }
        >
          <form id="kat-form" onSubmit={handleSave} className="space-y-4">
            <Input
              label="Label"
              required
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Contoh: Jalan Raya"
            />
            <Input
              label="Value (slug)"
              required
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="contoh: jalan-raya"
            />
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-700">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_ICON_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = form.icon === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon: option.value }))}
                      className={cn(
                        'flex h-10 items-center justify-center rounded-xl border transition-all',
                        selected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-focus'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-primary-200 hover:bg-primary-50/50',
                      )}
                      title={option.label}
                      aria-label={`Pilih icon ${option.label}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-700">Warna</label>
              <div className="flex flex-wrap gap-2">
                {WARNA_PRESETS.map(w => (
                  <button
                    key={w} type="button"
                    onClick={() => setForm(f => ({ ...f, color: w }))}
                    className="w-7 h-7 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: w,
                      borderColor: form.color === w ? '#1e293b' : 'transparent',
                      outline: form.color === w ? `2px solid ${w}` : 'none',
                      outlineOffset: '2px',
                    }}
                    aria-label={w}
                  />
                ))}
              </div>
              <Input
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="#3B82F6"
              />
            </div>
            <Input
              label="Urutan"
              type="number"
              value={form.urutan}
              onChange={e => setForm(f => ({ ...f, urutan: parseInt(e.target.value) || '' }))}
              placeholder="0"
            />
            {formError && (
              <div role="alert" className="text-xs text-danger-600 bg-danger-50 border border-danger-500/20 rounded-xl px-3 py-2">
                {formError}
              </div>
            )}
          </form>
        </Modal>

        {/* Modal Konfirmasi Hapus */}
        <Modal
          isOpen={showDeleteId !== null}
          onClose={() => setShowDeleteId(null)}
          title="Hapus Kategori"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button>
              <Button variant="danger" onClick={confirmDelete}>Hapus</Button>
            </>
          }
        >
          <p className="text-sm text-neutral-600">
            Apakah Anda yakin ingin menghapus kategori ini? Kategori yang masih digunakan oleh data infrastruktur tidak dapat dihapus.
          </p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
