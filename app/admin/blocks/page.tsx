'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import BlockManagement from '@/components/BlockManagement';

export default function AdminBlocksPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Vendedores não têm acesso ao gerenciamento de quadras
    if (user?.role === UserRole.VENDEDOR) {
      console.log('[BlocksPage] ⚠️ Vendedor não tem permissão - redirecionando');
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  // Não renderizar nada se for vendedor
  if (user?.role === UserRole.VENDEDOR) {
    return null;
  }

  return <BlockManagement />;
}
