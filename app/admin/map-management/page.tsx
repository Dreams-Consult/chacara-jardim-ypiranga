'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import MapManagement from '@/components/MapManagement';

export default function AdminMapManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Vendedores não têm acesso ao gerenciamento de mapas
    if (user?.role === UserRole.VENDEDOR) {
      console.log('[MapManagement] ⚠️ Vendedor não tem permissão - redirecionando');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Não renderizar nada se for vendedor
  if (user?.role === UserRole.VENDEDOR) {
    return null;
  }

  return <MapManagement />;
}
