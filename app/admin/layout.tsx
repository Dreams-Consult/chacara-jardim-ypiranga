'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, canAccessUsers } = useAuth();

  // Inicializar showLotManagement lendo localStorage (só roda uma vez)
  const [showLotManagement, setShowLotManagement] = useState(() => {
    // Durante SSR, retornar false
    // Durante CSR, ler do localStorage
    return false; // Sempre false no SSR e primeira renderização no client
  });

  // Após montar, verificar localStorage
  useEffect(() => {
    const visited = localStorage.getItem('hasVisitedMapManagement') === 'true';
    if (visited) {
      // Agendar atualização para próximo tick para evitar setState síncrono
      Promise.resolve().then(() => setShowLotManagement(true));
    }
  }, []);

  // Validar sessão e redirecionar
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      console.log('[AdminLayout] ⚠️ Usuário não autenticado - redirecionando para login');
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Marcar como visitado quando entrar em map-management
  useEffect(() => {
    if (pathname === '/admin/map-management' && !showLotManagement) {
      localStorage.setItem('hasVisitedMapManagement', 'true');
      // Agendar atualização para próximo tick
      Promise.resolve().then(() => setShowLotManagement(true));
    }
  }, [pathname, showLotManagement]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = () => {
    if (!user) return null;

    const styles = {
      [UserRole.DEV]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      [UserRole.ADMIN]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      [UserRole.VENDEDOR]: 'bg-green-500/20 text-green-300 border-green-500/30',
    };

    const labels = {
      [UserRole.DEV]: 'DEV',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.VENDEDOR]: 'Vendedor',
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[user.role]}`}>
        {labels[user.role]}
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

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
    <div suppressHydrationWarning className="min-h-screen bg-[var(--background)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--card-bg)] min-h-screen border-r border-[var(--border)] shadow-[var(--shadow-md)] flex flex-col">
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
              {/* Gerenciamento de Mapas - apenas DEV e ADMIN */}
              {user?.role !== UserRole.VENDEDOR && (
                <>
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
                  {showLotManagement && (
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
                </>
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
              {canAccessUsers && (
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    pathname === '/admin/users'
                      ? 'bg-[var(--surface)] text-[var(--primary)]'
                      : 'text-[var(--foreground)]/70 hover:bg-[var(--surface)]/50 hover:text-[var(--foreground)]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Usuários</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="mt-auto border-t border-[var(--border)] p-4">
            <div className="bg-[var(--surface)]/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getRoleBadge()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
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
