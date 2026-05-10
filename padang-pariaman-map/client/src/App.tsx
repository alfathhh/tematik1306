import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Lazy import halaman untuk code splitting
const ClientMap = React.lazy(() => import('./pages/ClientMap'));
const Login     = React.lazy(() => import('./pages/admin/Login'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminKategori      = React.lazy(() => import('./pages/admin/Kategori'));
const AdminInfrastruktur = React.lazy(() => import('./pages/admin/Infrastruktur'));
const AdminStatistik     = React.lazy(() => import('./pages/admin/Statistik'));

// Komponen loading fallback
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat halaman...</p>
      </div>
    </div>
  );
}

// Route guard: redirect ke login jika belum autentikasi
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

// Route redirect: jika sudah login → ke dashboard
function PublicAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Halaman publik */}
          <Route path="/" element={<ClientMap />} />

          {/* Admin routes — URL tidak diexpose di halaman publik */}
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <Login />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kategori"
            element={
              <ProtectedRoute>
                <AdminKategori />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/infrastruktur"
            element={
              <ProtectedRoute>
                <AdminInfrastruktur />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistik"
            element={
              <ProtectedRoute>
                <AdminStatistik />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
