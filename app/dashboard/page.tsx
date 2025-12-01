'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Map, Lot, LotStatus, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = '/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [maps, setMaps] = useState<Map[]>([]);
  const [allLots, setAllLots] = useState<Lot[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [totalFirstPayments, setTotalFirstPayments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Carregar todos os mapas
      const mapsResponse = await axios.get(`${API_URL}/mapas`, { timeout: 10000 });
      const mapsData = Array.isArray(mapsResponse.data) ? mapsResponse.data : [];

      interface MapData {
        mapId: string;
        name: string;
        description?: string;
        imageUrl?: string;
        width?: number;
        height?: number;
        createdAt: string | Date;
        updatedAt: string | Date;
      }

      const loadedMaps: Map[] = mapsData.map((data: MapData) => ({
        id: data.mapId,
        name: data.name,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        imageType: 'image',
        width: data.width || 800,
        height: data.height || 600,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }));

      setMaps(loadedMaps);

      // Carregar todos os lotes de todos os mapas
      const allLotsPromises = loadedMaps.map(async (map) => {
        try {
          const lotsResponse = await axios.get(`${API_URL}/mapas/lotes`, {
            params: { mapId: map.id },
            timeout: 10000,
          });

          const data = lotsResponse.data?.[0];
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

            return data.lots.map((lot: LotData) => {
              // lot.area não existe mais no retorno da API
              return {
                ...lot,
                mapId: map.id,
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

      const lotsArrays = await Promise.all(allLotsPromises);
      const flatLots = lotsArrays.flat();
      setAllLots(flatLots);

      // Carregar total de pagamentos de entrada das reservas
      try {
        const reservationsResponse = await axios.get(`${API_URL}/reservas`, { timeout: 10000 });
        const reservationsData = Array.isArray(reservationsResponse.data) ? reservationsResponse.data : [];
        setReservations(reservationsData);
        
        // Somar first_payment de cada lote das reservas concluídas (completed)
        const totalPayments = reservationsData.reduce((sum: number, reservation: any) => {
          if (reservation.status === 'completed' && reservation.lots && Array.isArray(reservation.lots)) {
            // Somar first_payment de todos os lotes desta reserva
            const reservationTotal = reservation.lots.reduce((lotSum: number, lot: any) => {
              const lotFirstPayment = parseFloat(lot.first_payment) || 0;
              return lotSum + lotFirstPayment;
            }, 0);
            return sum + reservationTotal;
          }
          return sum;
        }, 0);
        
        setTotalFirstPayments(totalPayments);
      } catch (error) {
        console.error('Erro ao carregar total de pagamentos de entrada:', error);
        setTotalFirstPayments(0);
        setReservations([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirecionar vendedores para a página de mapas
  useEffect(() => {
    if (user?.role === UserRole.VENDEDOR) {
      console.log('⚠️ Vendedor não tem acesso ao dashboard - redirecionando');
      router.push('/maps');
      return;
    }
  }, [user, router]);

  // Carregar dados do dashboard
  useEffect(() => {
    if (user?.role !== UserRole.VENDEDOR) {
      loadDashboardData();
    }
  }, [user]);

  // Não renderizar para vendedores
  if (user?.role === UserRole.VENDEDOR) {
    return null;
  }

  const totalLots = allLots.length;
  const availableLots = allLots.filter((lot) => lot.status === LotStatus.AVAILABLE).length;
  const reservedLots = allLots.filter((lot) => lot.status === LotStatus.RESERVED).length;
  const soldLots = allLots.filter((lot) => lot.status === LotStatus.SOLD).length;
  const blockedSlots = allLots.filter((lot) => lot.status === LotStatus.BLOCKED).length;

  const availableValue = allLots
    .filter((lot) => lot.status === LotStatus.AVAILABLE)
    .reduce((sum, lot) => sum + lot.price, 0);
  
  // Calcular valor reservado usando agreed_price das reservas
  const reservedValue = reservations
    .filter((res: any) => res.status === 'pending')
    .reduce((sum: number, res: any) => {
      if (res.lots && Array.isArray(res.lots)) {
        return sum + res.lots.reduce((lotSum: number, lot: any) => {
          return lotSum + (parseFloat(lot.agreed_price) || parseFloat(lot.price) || 0);
        }, 0);
      }
      return sum;
    }, 0);
  
  // Calcular valor vendido usando agreed_price das reservas
  const soldValue = reservations
    .filter((res: any) => res.status === 'completed')
    .reduce((sum: number, res: any) => {
      if (res.lots && Array.isArray(res.lots)) {
        return sum + res.lots.reduce((lotSum: number, lot: any) => {
          return lotSum + (parseFloat(lot.agreed_price) || parseFloat(lot.price) || 0);
        }, 0);
      }
      return sum;
    }, 0);

  // Valor total = disponíveis (preço base) + reservados (agreed_price) + vendidos (agreed_price)
  const totalValue = availableValue + reservedValue + soldValue;

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
            <p className="text-[var(--foreground)] text-lg font-semibold">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log(maps)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Dashboard</h1>
        <p className="text-[var(--foreground)] opacity-70">Visão geral dos loteamentos</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Total de Loteamentos</p>
          <p className="text-white text-4xl font-bold">{maps.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Total de Lotes</p>
          <p className="text-white text-4xl font-bold">{totalLots}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-[var(--shadow-lg)] border-2 border-yellow-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-300/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v2m0 4h.01" />
              </svg>
            </div>
          </div>
          <p className="text-yellow-900/90 text-sm font-medium mb-1">Lotes Reservados</p>
          <p className="text-yellow-900 text-4xl font-bold">{reservedLots}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Lotes Disponíveis</p>
          <p className="text-white text-4xl font-bold">{availableLots}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Lotes Vendidos</p>
          <p className="text-white text-4xl font-bold">{soldLots}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Lotes Bloqueados</p>
          <p className="text-white text-4xl font-bold">{blockedSlots}</p>
        </div>
      </div>

      {/* Estatísticas de Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Distribuição por Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[var(--foreground)] font-medium">Disponível</span>
                </div>
                <span className="text-[var(--foreground)] font-bold">{availableLots} ({totalLots > 0 ? ((availableLots / totalLots) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[var(--surface)] rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalLots > 0 ? (availableLots / totalLots) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-[var(--foreground)] font-medium">Reservado</span>
                </div>
                <span className="text-[var(--foreground)] font-bold">{reservedLots} ({totalLots > 0 ? ((reservedLots / totalLots) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[var(--surface)] rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalLots > 0 ? (reservedLots / totalLots) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[var(--foreground)] font-medium">Vendido</span>
                </div>
                <span className="text-[var(--foreground)] font-bold">{soldLots} ({totalLots > 0 ? ((soldLots / totalLots) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-[var(--surface)] rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalLots > 0 ? (soldLots / totalLots) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-[var(--foreground)] font-medium">Bloqueado</span>
                </div>
                <span className="text-[var(--foreground)] font-bold">
                  {blockedSlots} ({totalLots > 0 ? ((blockedSlots / totalLots) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-[var(--surface)] rounded-full h-3">
                <div
                  className="bg-gray-500 h-3 rounded-full transition-all"
                  style={{ width: `${totalLots > 0 ? (blockedSlots / totalLots) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Valores Financeiros
          </h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary-light)]/20 border border-[var(--primary)]/30 rounded-xl p-4">
              <p className="text-[var(--foreground)] opacity-70 text-sm font-medium mb-1">Valor Total dos Lotes</p>
              <p className="text-[var(--foreground)] text-3xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-[var(--foreground)] opacity-70 text-sm font-medium mb-1">Disponível para Venda</p>
              <p className="text-[var(--foreground)] text-2xl font-bold">R$ {availableValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-[var(--foreground)] opacity-70 text-sm font-medium mb-1">Valor dos Lotes Reservados</p>
              <p className="text-[var(--foreground)] text-2xl font-bold">R$ {reservedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-[var(--foreground)] opacity-70 text-sm font-medium mb-1">Valor Já Vendido</p>
              <p className="text-[var(--foreground)] text-2xl font-bold">R$ {soldValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-[var(--foreground)] opacity-70 text-sm font-medium mb-1">Total de Entradas Recebidas</p>
              <p className="text-[var(--foreground)] text-2xl font-bold">R$ {totalFirstPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Mapas */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Mapas Cadastrados
        </h2>

        {maps.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] rounded-full mb-4">
              <svg className="w-8 h-8 text-[var(--foreground)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-[var(--foreground)] opacity-70 text-lg">Nenhum mapa cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((map) => {
              const mapLots = allLots.filter((lot) => lot.mapId === map.id);
              const mapAvailable = mapLots.filter((lot) => lot.status === LotStatus.AVAILABLE).length;
              const mapReserved = mapLots.filter((lot) => lot.status === LotStatus.RESERVED).length;
              const mapSold = mapLots.filter((lot) => lot.status === LotStatus.SOLD).length;
              const mapBlocked = mapLots.filter((lot) => lot.status === LotStatus.BLOCKED).length;

              return (
                <div key={map.id} className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] hover:shadow-[var(--shadow-md)] transition-all">
                  <h3 className="text-[var(--foreground)] font-bold text-lg mb-3">{map.name}</h3>
                  {map.description && (
                    <p className="text-[var(--foreground)] opacity-70 text-sm mb-4 line-clamp-2">{map.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--foreground)] opacity-70">Total de Lotes:</span>
                      <span className="text-[var(--foreground)] font-bold">{mapLots.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">Disponíveis:</span>
                      <span className="text-green-400 font-bold">{mapAvailable}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-400">Reservados:</span>
                      <span className="text-yellow-400 font-bold">{mapReserved}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-400">Vendidos:</span>
                      <span className="text-red-400 font-bold">{mapSold}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Bloqueados:</span>
                      <span className="text-gray-500 font-bold">{mapBlocked}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
