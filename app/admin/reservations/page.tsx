'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Lot, LotStatus, Map } from '@/types';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ReservationsPage() {
  const [reservedLots, setReservedLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      console.log('[Reservations] 🔄 Carregando dados...');

      // Carregar mapas
      const mapsResponse = await axios.get(`${API_URL}/mapas`, { timeout: 10000 });
      const mapsData = Array.isArray(mapsResponse.data) ? mapsResponse.data : [];

      interface MapData {
        id: string;
        name: string;
        description?: string;
        imageUrl?: string;
        width?: number;
        height?: number;
        createdAt: string | Date;
        updatedAt: string | Date;
      }

      const loadedMaps: Map[] = mapsData.map((data: MapData) => ({
        id: data.id,
        name: data.name,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        imageType: 'image',
        width: data.width || 800,
        height: data.height || 600,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }));

      // Carregar lotes reservados
      const lotsPromises = loadedMaps.map(async (map) => {
        try {
          const response = await axios.get(`${API_URL}/mapas/lotes`, {
            params: { mapId: map.id },
            timeout: 10000,
          });

          const data = response.data?.[0];
          if (data?.lots && Array.isArray(data.lots)) {
            interface LotData {
              id: string;
              lotNumber: string;
              area: { points: string | { x: number; y: number }[] };
              status: LotStatus;
              price: number;
              size: number;
              description?: string;
              features?: string[];
              createdAt: string | Date;
              updatedAt: string | Date;
            }

            return data.lots
              .filter((lot: LotData) => lot.status === LotStatus.RESERVED)
              .map((lot: LotData) => {
                let parsedArea = lot.area;
                if (lot.area && typeof lot.area.points === 'string') {
                  try {
                    parsedArea = {
                      ...lot.area,
                      points: JSON.parse(lot.area.points as unknown as string),
                    };
                  } catch (e) {
                    console.error('Erro ao parsear area.points:', e);
                  }
                }

                return {
                  ...lot,
                  area: parsedArea,
                  mapId: map.id,
                  mapName: map.name,
                  createdAt: new Date(lot.createdAt),
                  updatedAt: new Date(lot.updatedAt),
                };
              });
          }
          return [];
        } catch (error) {
          console.error(`Erro ao carregar lotes do mapa ${map.id}:`, error);
          return [];
        }
      });

      const lotsArrays = await Promise.all(lotsPromises);
      const flatLots = lotsArrays.flat();
      setReservedLots(flatLots);
      console.log('[Reservations] ✅ Dados carregados:', flatLots.length, 'reservas');
    } catch (error) {
      console.error('[Reservations] ❌ Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling automático a cada 3 segundos
  useRealtimeUpdates(() => {
    console.log('🔄 Auto-refresh de reservas');
    loadData();
  }, 3000);

  const handleFinalizePurchase = async (lot: Lot) => {
    if (!confirm(`Finalizar a compra do lote ${lot.lotNumber}?\n\nIsso irá marcar o lote como VENDIDO.`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/mapas/lotes/status`,
        {
          lotId: lot.id,
          status: LotStatus.SOLD,
        },
        { timeout: 10000 }
      );

      alert(`✅ Lote ${lot.lotNumber} marcado como VENDIDO com sucesso!`);
      await loadData();
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('❌ Erro ao finalizar compra. Tente novamente.');
    }
  };

  const handleRevertReservation = async (lot: Lot) => {
    if (!confirm(`Reverter a reserva do lote ${lot.lotNumber}?\n\nIsso irá marcar o lote como DISPONÍVEL novamente.`)) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/mapas/lotes/status`,
        {
          lotId: lot.id,
          status: LotStatus.AVAILABLE,
        },
        { timeout: 10000 }
      );

      alert(`✅ Reserva do lote ${lot.lotNumber} revertida com sucesso!`);
      await loadData();
    } catch (error) {
      console.error('Erro ao reverter reserva:', error);
      alert('❌ Erro ao reverter reserva. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary)] rounded-full mb-4 animate-pulse shadow-[var(--shadow-lg)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold">Carregando reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Minhas Reservas</h1>
        <p className="text-white/70">Gerencie as reservas de lotes - finalize compras ou reverta reservas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Total de Reservas</p>
          <p className="text-white text-4xl font-bold">{reservedLots.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Mapas com Reservas</p>
          <p className="text-white text-4xl font-bold">
            {new Set(reservedLots.map((lot) => lot.mapId)).size}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Valor Total Reservado</p>
          <p className="text-white text-4xl font-bold">
            R$ {reservedLots.reduce((sum, lot) => sum + lot.price, 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Lotes Reservados
        </h2>

        {reservedLots.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] rounded-full mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/70 text-lg">Nenhuma reserva pendente</p>
            <p className="text-white/50 text-sm mt-2">As reservas aparecerão aqui quando forem criadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 text-white font-semibold">Lote</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Mapa</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Área</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Preço</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Data Reserva</th>
                  <th className="text-right py-3 px-4 text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservedLots.map((lot) => (
                  <tr
                    key={lot.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-white font-bold">{lot.lotNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/70">{lot.mapName || lot.mapId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/70">{lot.size}m²</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-semibold">R$ {lot.price.toLocaleString('pt-BR')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/70">
                        {new Date(lot.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleFinalizePurchase(lot)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Finalizar Compra
                        </button>
                        <button
                          onClick={() => handleRevertReservation(lot)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reverter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
