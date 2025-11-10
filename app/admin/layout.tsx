'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Se estiver na página de gerenciar mapas, marcar como visitado
    if (pathname === '/admin/map-management') {
      localStorage.setItem('hasVisitedMapManagement', 'true');
    }
  }, [pathname]);

  // Verificar se já visitou (apenas no cliente)
  const hasVisitedMapManagement = typeof window !== 'undefined' 
    ? localStorage.getItem('hasVisitedMapManagement') === 'true' || pathname === '/admin/map-management'
    : false;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/admin/dashboard',
    },
    {
      id: 'maps',
      label: 'Mapas e Lotes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      path: '/admin/maps',
    },
    {
      id: 'reservations',
      label: 'Minhas Reservas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      path: '/admin/reservations',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--card-bg)] min-h-screen border-r border-[var(--border)] shadow-[var(--shadow-md)]">
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin</h1>
                <p className="text-xs text-white/70">Vale dos Carajás</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-[var(--shadow-md)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface)] hover:shadow-[var(--shadow-sm)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="px-4 py-4">
            <div className="border-t border-[var(--border)]"></div>
          </div>

          {/* Legacy Links (mantém compatibilidade com páginas antigas) */}
          <div className="px-4 pb-4">
            <p className="text-xs font-bold text-[var(--foreground)]/60 mb-2 px-4">FERRAMENTAS</p>
            <div className="space-y-1">
              <Link
                href="/admin/map-management"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  pathname === '/admin/map-management'
                    ? 'bg-[var(--surface)] text-[var(--primary)]'
                    : 'text-[var(--foreground)]/70 hover:bg-[var(--surface)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Gerenciar Mapas</span>
              </Link>
              {hasVisitedMapManagement && (
                <Link
                  href="/admin/lot-management"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    pathname?.startsWith('/admin/lot-management')
                      ? 'bg-[var(--surface)] text-[var(--primary)]'
                      : 'text-[var(--foreground)]/70 hover:bg-[var(--surface)]/50 hover:text-[var(--foreground)]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Lotes</span>
                </Link>
              )}
              <Link
                href="/admin/data"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  pathname === '/admin/data'
                    ? 'bg-[var(--surface)] text-[var(--primary)]'
                    : 'text-[var(--foreground)]/70 hover:bg-[var(--surface)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span>Dados</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
