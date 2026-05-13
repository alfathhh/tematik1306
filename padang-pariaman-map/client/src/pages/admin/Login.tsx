import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  React.useEffect(() => { document.title = 'Login Admin — Peta Tematik Padang Pariaman'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-neutral-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-brand mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/></svg>
          </div>
          <h1 className="text-xl font-display font-bold text-neutral-900">Portal Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">Peta Tematik Kabupaten Padang Pariaman</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-medium text-neutral-700">Username</label>
              <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" autoComplete="username" required />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-neutral-700">Password</label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">Masuk</Button>
          </form>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">© 2025 Dinas PUPR Kabupaten Padang Pariaman</p>
      </div>
    </div>
  );
}
