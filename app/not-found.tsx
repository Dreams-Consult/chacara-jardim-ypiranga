'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redireciona automaticamente para a página apropriada
    const redirectTimeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/login');
      }
    }, 2000);

    return () => clearTimeout(redirectTimeout);
  }, [router, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h2>
        
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
          Você será redirecionado automaticamente em alguns segundos...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ir para Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Fazer Login
            </button>
          )}
        </div>

        <div className="mt-8">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Redirecionando...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
