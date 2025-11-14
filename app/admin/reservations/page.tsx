'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Reservation {
  id: number;
  lot_id: number;
  seller_id: number | null;
  map_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  message: string | null;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_cpf: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      console.log('[Reservations] 🔄 Carregando reservas...');

      // Carregar todas as reservas do endpoint
      const response = await axios.get(`${API_URL}/reservas`, { timeout: 10000 });
      const allReservations: Reservation[] = Array.isArray(response.data) ? response.data : [];

      console.log('[Reservations] 📦 Total de reservas recebidas:', allReservations.length);

      // DEV e ADMIN veem todas as reservas, outros perfis filtram por CPF
      let filteredReservations: Reservation[];

      if (user?.role === UserRole.DEV || user?.role === UserRole.ADMIN) {
        // DEV e ADMIN veem tudo
        filteredReservations = allReservations;
        console.log('[Reservations] ✅ Usuário DEV/ADMIN - exibindo todas as reservas:', allReservations.length);
      } else if (user?.cpf) {
        // Outros perfis filtram por CPF do vendedor
        filteredReservations = allReservations.filter((reservation) => {
          // Remove formatação do CPF para comparação
          const userCpf = user.cpf.replace(/\D/g, '');
          const sellerCpf = reservation.seller_cpf.replace(/\D/g, '');
          return sellerCpf === userCpf;
        });
        console.log('[Reservations] ✅ Reservas filtradas por CPF:', filteredReservations.length, '(CPF:', user.cpf, ')');
      } else {
        filteredReservations = allReservations;
      }

      // Ordenar reservas da mais recente para a mais antiga
      filteredReservations.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
      });

      setReservations(filteredReservations);
    } catch (error) {
      console.error('[Reservations] ❌ Erro ao carregar reservas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.cpf, user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling automático a cada 3 segundos
  useRealtimeUpdates(() => {
    console.log('🔄 Auto-refresh de reservas');
    loadData();
  }, 3000);

  const handleApprove = async (reservationId: number) => {
    if (!confirm('Tem certeza que deseja aprovar esta reserva?\n\nIsso marcará o lote como VENDIDO.')) {
      return;
    }

    try {
      await axios.put(`${API_URL}/reserva/confirmacao`, {
        reservationId: reservationId.toString(),
        status: 'completed',
        lotStatus: 'sold'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      console.log('[Reservations] ✅ Reserva aprovada e lote marcado como vendido');
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('[Reservations] ❌ Erro ao aprovar reserva:', error);
      alert('Erro ao aprovar reserva. Tente novamente.');
    }
  };

  const handleReject = async (reservationId: number) => {
    if (!confirm('Tem certeza que deseja rejeitar esta reserva?')) {
      return;
    }

    try {
      await axios.put(`${API_URL}/reserva/confirmacao`, {
        reservationId: reservationId.toString(),
        status: 'cancelled',
        lotStatus: 'available'
      });
      console.log('[Reservations] ✅ Reserva rejeitada com sucesso');
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('[Reservations] ❌ Erro ao rejeitar reserva:', error);
      alert('Erro ao rejeitar reserva. Tente novamente.');
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
        <p className="text-white/70">Gerencie as reservas de lotes realizadas</p>

        {/* Badge informativo baseado no perfil */}
        {user?.role === UserRole.DEV || user?.role === UserRole.ADMIN ? (
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg text-sm border border-purple-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Exibindo todas as reservas (Perfil: {user.role === UserRole.DEV ? 'DEV' : 'ADMIN'})
          </div>
        ) : user?.cpf && (
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm border border-blue-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Exibindo apenas suas reservas (CPF: {user.cpf})
          </div>
        )}
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
          <p className="text-white text-4xl font-bold">{reservations.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Pendentes</p>
          <p className="text-white text-4xl font-bold">
            {reservations.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium mb-1">Concluídas</p>
          <p className="text-white text-4xl font-bold">
            {reservations.filter(r => r.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Reservas Realizadas
        </h2>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] rounded-full mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/70 text-lg">Nenhuma reserva encontrada</p>
            <p className="text-white/50 text-sm mt-2">As reservas aparecerão aqui quando forem criadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-[var(--surface)] rounded-xl border-2 border-[var(--border)] overflow-hidden hover:border-[var(--primary)]/30 transition-colors"
              >
                {/* Header do Card */}
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/50 font-mono text-xs">#{reservation.id}</span>
                      {reservation.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Pendente
                        </span>
                      )}
                      {reservation.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                          Concluída
                        </span>
                      )}
                      {reservation.status === 'cancelled' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          Cancelada
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg truncate">{reservation.customer_name}</h3>
                    <p className="text-white/60 text-sm truncate">{reservation.customer_email}</p>
                  </div>

                  {/* Botão de expandir/recolher */}
                  <button
                    onClick={() => setExpandedReservation(
                      expandedReservation === reservation.id ? null : reservation.id
                    )}
                    className="flex-shrink-0 p-2 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--background)] transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 text-white transition-transform ${
                        expandedReservation === reservation.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Detalhes expandidos */}
                {expandedReservation === reservation.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/50 text-xs font-medium mb-1">CPF do Cliente</p>
                        <p className="text-white font-mono text-sm">{reservation.customer_cpf}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs font-medium mb-1">Telefone</p>
                        <p className="text-white text-sm">{reservation.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs font-medium mb-1">Vendedor</p>
                        <p className="text-white text-sm">{reservation.seller_name}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs font-medium mb-1">Data da Reserva</p>
                        <p className="text-white text-sm">
                          {new Date(reservation.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {reservation.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-3">
                        <button
                          onClick={() => handleApprove(reservation.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-md cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aprovar Reserva
                        </button>
                        <button
                          onClick={() => handleReject(reservation.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-md cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejeitar Reserva
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
