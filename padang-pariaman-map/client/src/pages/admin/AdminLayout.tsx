import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { to: '/admin/dashboard',      icon: '📊', label: 'Dashboard'      },
  { to: '/admin/infrastruktur',  icon: '🏗️', label: 'Infrastruktur'  },
  { to: '/admin/statistik',      icon: '📈', label: 'Statistik'      },
  { to: '/admin/kategori',       icon: '🏷️', label: 'Kategori'       },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-gray-900 text-white flex-shrink-0 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-700 flex items-center gap-2">
          <span className="text-xl flex-shrink-0">🗺️</span>
          {sidebarOpen && (
            <span className="font-semibold text-sm truncate">Admin Panel</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-gray-700">
          {sidebarOpen && (
            <p className="text-xs text-gray-400 truncate mb-2">👤 {user?.username ?? 'admin'}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full"
            title="Logout"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="text-base font-semibold text-gray-800">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
