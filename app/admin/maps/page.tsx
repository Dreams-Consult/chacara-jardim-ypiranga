'use client';

import React from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import PurchaseModal from '@/components/PurchaseModal';
import { useMapSelection } from '@/hooks/useMapSelection';
import { LotStatus } from '@/types';

export default function AdminMapsLotsPage() {
  const {
    maps,
    lots,
    selectedMap,
    selectedLot,
    viewingLot,
    showPurchaseModal,
    isLoading,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handlePurchaseSuccess,
    handlePurchaseClose,
    handleViewClose,
    selectMap,
  } = useMapSelection();

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
        <h1 className="text-3xl font-bold text-white mb-2">Mapas e Lotes</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-4 sm:p-6">
              <InteractiveMap
                imageUrl={selectedMap.imageUrl}
                lots={lots}
                onLotClick={handleLotClick}
              />
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
              </div>
            </div>
          </div>
        </div>
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

      {showPurchaseModal && selectedLot && (
        <PurchaseModal
          lot={selectedLot}
          onClose={handlePurchaseClose}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Modal de Visualização de Lote (Reservado/Vendido) */}
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
              viewingLot.status === LotStatus.RESERVED
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Lote {viewingLot.lotNumber}</h2>
                  <p className="text-white/90 text-sm mt-1">
                    {viewingLot.status === LotStatus.RESERVED ? '🔒 Reservado' : '✓ Vendido'}
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
              <div className={`rounded-xl p-4 border-2 ${
                viewingLot.status === LotStatus.RESERVED
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <p className={`text-sm font-medium ${
                  viewingLot.status === LotStatus.RESERVED ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {viewingLot.status === LotStatus.RESERVED
                    ? '⚠️ Este lote está reservado.'
                    : '✓ Este lote foi vendido.'}
                </p>
              </div>

              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Número do Lote</label>
                  <p className="text-xl font-bold text-gray-900">{viewingLot.lotNumber}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    viewingLot.status === LotStatus.RESERVED
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingLot.status === LotStatus.RESERVED ? 'Reservado' : 'Vendido'}
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

              {/* Informações da área desenhada */}
              {viewingLot.area.points.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <label className="block text-sm font-medium text-blue-800 mb-2">Área Desenhada</label>
                  <p className="text-sm text-blue-700">
                    ✓ {viewingLot.area.points.length} pontos definidos no mapa
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={handleViewClose}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
