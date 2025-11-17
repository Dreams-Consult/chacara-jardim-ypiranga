'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname.replace('/chacara-jardim-ypiranga', '');
    if (path && path !== '/') {
      router.replace(path);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Carregando...</h1>
        <p className="text-gray-600">Aguarde um momento</p>
      </div>
    </div>
  );
}
