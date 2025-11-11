'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import LotManagement from '@/components/LotManagement';

function LotManagementWrapper() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Vendedores não têm acesso ao gerenciamento de lotes
    if (user?.role === UserRole.VENDEDOR) {
      console.log('[LotManagement] ⚠️ Vendedor não tem permissão - redirecionando');
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  // Não renderizar nada se for vendedor
  if (user?.role === UserRole.VENDEDOR) {
    return null;
  }

  return <LotManagement />;
}

export default function AdminLotsManagementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando...</div>}>
      <LotManagementWrapper />
    </Suspense>
  );
}
