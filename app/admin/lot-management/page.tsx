'use client';

import { Suspense } from 'react';
import LotManagement from '@/components/LotManagement';

function LotManagementWrapper() {
  return <LotManagement />;
}

export default function AdminLotsManagementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando...</div>}>
      <LotManagementWrapper />
    </Suspense>
  );
}
