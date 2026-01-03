'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function AdminMapManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Vendedores não têm acesso ao gerenciamento de mapas
    if (user?.role === UserRole.VENDEDOR) {
      router.push('/dashboard');
      return;
    }
    
    // Redirecionar para map-details
    router.replace('/admin/map-details');
  }, [user, router]);

  // Não renderizar nada se for vendedor
  if (user?.role === UserRole.VENDEDOR) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-[var(--foreground)] opacity-70">Redirecionando...</p>
      </div>
    </div>
  );
}
