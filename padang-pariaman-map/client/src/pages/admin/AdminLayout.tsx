import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/cn';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/></svg>
  )},
  { to: '/admin/infrastruktur', label: 'Infrastruktur', end: false, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
  )},
  { to: '/admin/kategori', label: 'Kategori', end: false, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )},
  { to: '/admin/statistik', label: 'Statistik', end: false, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )},
];

export default function AdminLayout() {
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  function handleLogout() { logout(); navigate('/admin/login'); }

  return (
    <div className="min-h-screen flex bg-neutral-100">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-neutral-900/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-200/60 shadow-soft z-50 flex flex-col transition-transform duration-250',
        'lg:translate-x-0 lg:static lg:z-auto lg:shadow-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/></svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-display font-bold text-neutral-900 truncate">Admin Panel</div>
            <div className="text-[10px] text-neutral-400 truncate">Padang Pariaman</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-50 text-brand-700 [&_svg]:stroke-brand-600'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            )}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-700">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-neutral-900 truncate">{user?.username || 'Admin'}</div>
              <div className="text-[10px] text-neutral-400">Administrator</div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-200/60 px-4 py-3 flex items-center gap-3 lg:px-6">
          <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <h1 className="text-sm font-display font-semibold text-neutral-900">Sistem Informasi Infrastruktur</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
