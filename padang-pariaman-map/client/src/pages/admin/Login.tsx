import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Login gagal. Periksa username dan password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            🗺️
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Peta Tematik Kab. Padang Pariaman</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Masukkan password"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}
