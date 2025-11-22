'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Map } from '@/types';

const API_URL = '/api';

export default function PublicMapsPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/mapas`, { timeout: 10000 });

      if (Array.isArray(response.data)) {
        const mapsData = response.data.map((item: any) => ({
          id: item.mapId || item.id,
          name: item.name || `Mapa ${item.mapId || item.id}`,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          imageType: 'image' as const,
          width: item.width || 800,
          height: item.height || 600,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        }));

        setMaps(mapsData);
      }
    } catch (error) {
      console.error('Erro ao carregar mapas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Carregando loteamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loteamentos Disponíveis
          </h1>
          <p className="text-xl text-gray-300">
            Escolha seu lote e garanta o seu investimento
          </p>
        </div>

        {/* Grid de Mapas */}
        {maps.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Nenhum loteamento disponível</h2>
            <p className="text-gray-400">Em breve teremos novos loteamentos para você.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {maps.map((map) => (
              <div
                key={map.id}
                className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer transform hover:scale-105"
                onClick={() => router.push(`/maps/${map.id}`)}
              >
                {/* Imagem do Mapa */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  {map.imageUrl ? (
                    <img
                      src={map.imageUrl}
                      alt={map.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Informações */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {map.name}
                  </h3>
                  {map.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {map.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">Ver lotes disponíveis</span>
                    <svg
                      className="w-5 h-5 text-blue-400 transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Dúvidas? Entre em contato com nossa equipe de vendas
          </p>
        </div>
      </div>
    </div>
  );
}
