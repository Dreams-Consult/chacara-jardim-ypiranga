'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InteractiveMap from '@/components/InteractiveMap';
import LotSelector from '@/components/LotSelector';
import PurchaseModal from '@/components/PurchaseModal';
import { useMapSelection } from '@/hooks/useMapSelection';
import { LotStatus } from '@/types';

export default function AdminMapsLotsPage() {
  const {
    maps,
    blocks,
    selectedBlock,
    lots,
    selectedMap,
    selectedLots, // Mudado de selectedLot para selectedLots
    viewingLot,
    showPurchaseModal,
    isLoading,
    isLoadingBlocks,
    isLoadingLots,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handleToggleLotSelection, // Nova função para adicionar/remover da lista
    handleOpenPurchaseModal, // Nova função
    handleClearSelection, // Nova função
    handlePurchaseSuccess,
    handlePurchaseClose,
    handleViewClose,
    selectMap,
    selectBlock,
    isLotSelected, // Helper para verificar se está selecionado
  } = useMapSelection();

  const [reservations, setReservations] = useState<any[]>([]);

  // Função para buscar reservas
  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservas');
      setReservations(response.data);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    }
  };

  // Buscar reservas para mostrar informações nos tooltips e modais
  useEffect(() => {
    fetchReservations();
  }, []);

  // Recarregar reservas quando os lotes mudarem (indica que houve uma alteração)
  useEffect(() => {
    if (lots.length > 0) {
      fetchReservations();
    }
  }, [lots.length, reservedLotsCount, soldLotsCount]);

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
            <p className="text-white text-lg font-semibold">Carregando mapas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Loteamentos</h1>
        <p className="text-white/70">Visualize e gerencie os lotes disponíveis para compra</p>
      </div>

      {maps.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-white mb-2">Selecione um Mapa</label>
          <select
            value={selectedMap?.id || ''}
            onChange={(e) => selectMap(e.target.value)}
            className="w-full sm:w-auto px-5 py-3 bg-white border-none rounded-xl text-[#1c1c1c] font-semibold shadow-[var(--shadow-md)] focus:ring-4 focus:ring-[var(--accent)]/30 transition-all cursor-pointer"
          >
            {maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMap && (
        <>
          {isLoadingBlocks && (
            <div className="mb-6 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <p className="text-white/70">Carregando quadras...</p>
            </div>
          )}

          {!isLoadingBlocks && blocks.length === 0 && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <p className="text-yellow-500 font-semibold">
                Nenhuma quadra cadastrada neste mapa.
              </p>
            </div>
          )}

          {/* Estatísticas e Legenda */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Estatísticas
              </h2>
              <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[var(--success)] rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-white">Disponível</span>
                </div>
                <span className="font-bold text-white text-xl">{availableLotsCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[var(--warning)] rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-white">Reservado</span>
                </div>
                <span className="font-bold text-white text-xl">{reservedLotsCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[var(--danger)] rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-white">Vendido</span>
                </div>
                <span className="font-bold text-white text-xl">{soldLotsCount}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-white">Bloqueado</span>
                </div>
                <span className="font-bold text-white text-xl">{lots.filter(lot => lot.status === LotStatus.BLOCKED).length}</span>
              </div>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Legenda
              </h2>
              <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--success)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--success)]/30">
                <div className="w-5 h-5 bg-[var(--success)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-[var(--foreground)]">Disponível para compra</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--warning)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--warning)]/30">
                <div className="w-5 h-5 bg-[var(--warning)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-[var(--foreground)]">Reservado</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--danger)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--danger)]/30">
                <div className="w-5 h-5 bg-[var(--danger)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-white">Vendido</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-transparent transition-all border-2 border-transparent hover:border-gray-500/30">
                <div className="w-5 h-5 bg-gray-500 rounded shadow-md"></div>
                <span className="text-sm font-semibold text-white">Bloqueado</span>
              </div>
              </div>
            </div>
            </div>

          {/* Seleção de Quadras */}
          {blocks.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-2">Selecione uma Quadra</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => selectBlock(block.id)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      selectedBlock?.id === block.id
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <div className="text-xs mb-1">Quadra</div>
                    <div className="text-lg font-bold">{block.name}</div>
                    {block.description && (
                      <div className="text-xs mt-1 opacity-80 truncate">{block.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seletor Cinema-Style */}
          <div className="mb-8">
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Selecione os Lotes
                {selectedBlock && <span className="text-white/60 text-lg">- {selectedBlock.name}</span>}
              </h2>
              <p className="text-white/70 mb-6">Clique nos lotes abaixo para selecioná-los. Você pode selecionar múltiplos lotes de uma vez.</p>
              
              {isLoadingLots ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <p className="text-white/70">Carregando lotes da quadra...</p>
                </div>
              ) : lots.length > 0 ? (
                <LotSelector
                  lots={lots}
                  onMultipleSelect={(lots) => {
                    // Recebe um array com um único lote para fazer toggle
                    if (lots.length === 1) {
                      handleToggleLotSelection(lots[0]);
                    }
                  }}
                  selectedLotIds={selectedLots.map(l => l.id)}
                  allowMultipleSelection={true}
                  lotsPerRow={15}
                  reservations={reservations}
                />
              ) : selectedBlock ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-white/70 text-lg font-semibold mb-2">
                    Nenhum lote disponível nesta quadra
                  </p>
                  <p className="text-white/50 text-sm">
                    Selecione outra quadra acima para ver os lotes disponíveis
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 bg-blue-500/10 rounded-xl border-2 border-dashed border-blue-500/30">
                  <svg className="w-16 h-16 mx-auto mb-4 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-400 text-lg font-semibold">
                    Selecione uma quadra acima para visualizar os lotes
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {maps.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary)]/20 rounded-full mb-4 shadow-md">
            <svg className="w-10 h-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-white text-lg font-semibold">Nenhum mapa disponível no momento.</p>
        </div>
      )}

      {selectedMap && (
        <>
          {/* Mapa Interativo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative mb-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Visualização do Mapa</h2>
                <InteractiveMap
                  imageUrl={selectedMap.imageUrl}
                  lots={lots}
                  onLotClick={handleLotClick}
                  selectedLotIds={selectedLots.map(lot => lot.id)} // Passa IDs dos lotes selecionados
                />
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Use os botões de zoom para ampliar/reduzir a visualização
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estatísticas
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[var(--success)] rounded-full shadow-md"></div>
                  <span className="text-sm font-semibold text-white">Disponível</span>
                </div>
                <span className="font-bold text-white text-xl">{availableLotsCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[var(--warning)] rounded-full shadow-md"></div>
                  <span className="text-sm font-semibold text-white">Reservado</span>
                </div>
                <span className="font-bold text-white text-xl">{reservedLotsCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[var(--danger)] rounded-full shadow-md"></div>
                  <span className="text-sm font-semibold text-white">Vendido</span>
                </div>
                <span className="font-bold text-white text-xl">{soldLotsCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full shadow-md"></div>
                  <span className="text-sm font-semibold text-white">Bloqueado</span>
                </div>
                <span className="font-bold text-white text-xl">{lots.filter(lot => lot.status === LotStatus.BLOCKED).length}</span>
                </div>
              </div>
              </div>

              <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Legenda
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--success)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--success)]/30">
                <div className="w-5 h-5 bg-[var(--success)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-[var(--foreground)]">Disponível para compra</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--warning)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--warning)]/30">
                <div className="w-5 h-5 bg-[var(--warning)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-[var(--foreground)]">Reservado</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-[var(--danger)]/10 hover:to-transparent transition-all border-2 border-transparent hover:border-[var(--danger)]/30">
                <div className="w-5 h-5 bg-[var(--danger)] rounded shadow-md"></div>
                <span className="text-sm font-semibold text-white">Vendido</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-transparent transition-all border-2 border-transparent hover:border-gray-500/30">
                <div className="w-5 h-5 bg-gray-500 rounded shadow-md"></div>
                <span className="text-sm font-semibold text-white">Bloqueado</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Barra de Ação Flutuante para Seleção Múltipla */}
      {selectedLots.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 min-w-[300px] sm:min-w-[400px] border-2 border-blue-400/30">
            {/* Contador de Lotes */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{selectedLots.length}</span>
              </div>
              <div className="text-white">
                <p className="font-bold text-lg leading-tight">
                  {selectedLots.length === 1 ? '1 Lote' : `${selectedLots.length} Lotes`}
                </p>
                <p className="text-white/80 text-sm">Selecionado{selectedLots.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-12 bg-white/20"></div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearSelection}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>

              <button
                onClick={handleOpenPurchaseModal}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enviar Reserva
              </button>
            </div>
          </div>
        </div>
      )}


      {showPurchaseModal && selectedLots.length > 0 && (
        <PurchaseModal
          lots={selectedLots} // Mudado de lot para lots
          onClose={handlePurchaseClose}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Modal de Visualização de Lote */}
      {viewingLot && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleViewClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 rounded-t-2xl ${
              viewingLot.status === LotStatus.AVAILABLE
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : viewingLot.status === LotStatus.RESERVED
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : viewingLot.status === LotStatus.BLOCKED
              ? 'bg-gradient-to-r from-gray-500 to-gray-700'
              : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Lote {viewingLot.lotNumber}</h2>
                  <p className="text-white/90 text-sm mt-1">
                    {viewingLot.status === LotStatus.AVAILABLE && '✓ Disponível'}
                    {viewingLot.status === LotStatus.RESERVED && '🔒 Reservado'}
                    {viewingLot.status === LotStatus.SOLD && '✓ Vendido'}
                    {viewingLot.status === LotStatus.BLOCKED && '🔒 Bloqueado'}
                  </p>
                </div>
                <button
                  onClick={handleViewClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Informação de status */}
              {viewingLot.status !== LotStatus.AVAILABLE && (
                <div className={`rounded-xl p-4 border-2 ${
                viewingLot.status === LotStatus.RESERVED
                  ? 'bg-amber-50 border-amber-300'
                  : viewingLot.status === LotStatus.SOLD
                  ? 'bg-red-50 border-red-300'
                  : viewingLot.status === LotStatus.BLOCKED
                  ? 'bg-gray-200 border-gray-400'
                  : 'bg-gray-100 border-gray-300'
                }`}>
                <p className={`text-sm font-medium ${
                viewingLot.status === LotStatus.RESERVED
                  ? 'text-amber-800'
                  : viewingLot.status === LotStatus.SOLD
                  ? 'text-red-800'
                  : 'text-gray-700'
                }`}>
                {viewingLot.status === LotStatus.RESERVED &&
                  '⚠️ Este lote está reservado.'}
                {viewingLot.status === LotStatus.SOLD &&
                  '✓ Este lote foi vendido.'}
                {viewingLot.status === LotStatus.BLOCKED &&
                  '⛔ Este lote está bloqueado e não pode ser reservado.'}
                </p>
              </div>
              )}

              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Número do Lote</label>
                <p className="text-xl font-bold text-gray-900">{viewingLot.lotNumber}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                viewingLot.status === LotStatus.AVAILABLE
                  ? 'bg-green-100 text-green-800'
                  : viewingLot.status === LotStatus.RESERVED
                  ? 'bg-amber-100 text-amber-800'
                  : viewingLot.status === LotStatus.SOLD
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-200 text-gray-700'
                }`}>
                {viewingLot.status === LotStatus.AVAILABLE && 'Disponível'}
                {viewingLot.status === LotStatus.RESERVED && 'Reservado'}
                {viewingLot.status === LotStatus.SOLD && 'Vendido'}
                {viewingLot.status === LotStatus.BLOCKED && 'Bloqueado'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Área</label>
                <p className="text-xl font-bold text-gray-900">{viewingLot.size} m²</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">Preço Total</label>
                <p className="text-xl font-bold text-gray-900">
                R$ {viewingLot.price.toLocaleString('pt-BR')}
                </p>
                {viewingLot.pricePerM2 && (
                <p className="text-xs text-gray-600 mt-1">
                  R$ {viewingLot.pricePerM2.toLocaleString('pt-BR')}/m²
                </p>
                )}
              </div>
              </div>

              {/* Descrição */}
              {viewingLot.description && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-2">Descrição</label>
                <p className="text-gray-900 leading-relaxed">{viewingLot.description}</p>
              </div>
              )}

              {/* Características */}
              {viewingLot.features && viewingLot.features.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-3">Características</label>
                <div className="flex flex-wrap gap-2">
                {viewingLot.features.map((feature, index) => (
                  <span
                  key={index}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg"
                  >
                  {feature}
                  </span>
                ))}
                </div>
              </div>
              )}

              {/* Área desenhada removida - lot.area.points não existe mais */}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center gap-3">
              <button
                onClick={handleViewClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>

              {viewingLot.status === LotStatus.AVAILABLE && (
                <button
                  onClick={() => {
                    handleToggleLotSelection(viewingLot);
                    handleViewClose();
                  }}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isLotSelected(viewingLot.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLotSelected(viewingLot.id) ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remover da Lista
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar à Lista
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
