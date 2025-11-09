'use client';

import React from 'react';
import Link from 'next/link';
import InteractiveMap from '@/components/InteractiveMap';
import PurchaseModal from '@/components/PurchaseModal';
import { useMapSelection } from '@/hooks/useMapSelection';

export default function PublicMapPage() {
  const {
    maps,
    lots,
    selectedMap,
    selectedLot,
    showPurchaseModal,
    isLoading,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handlePurchaseSuccess,
    handlePurchaseClose,
    selectMap,
  } = useMapSelection();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="py-12 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex-shrink-0 w-24 h-28 rounded-2xl border-4 border-[var(--accent)] bg-[var(--background)] flex items-center justify-center shadow-[var(--shadow-xl)] relative">
                <div className="absolute inset-0 rounded-2xl" style={{clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}}></div>
                <span className="text-6xl font-bold text-[var(--accent)] z-10" style={{fontFamily: "Georgia, serif"}}>V</span>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  Vale dos Carajás
                </h1>
                <p className="text-white/90 text-lg sm:text-xl font-normal">
                  Viva próximo à natureza
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--primary)] rounded-full mb-4 animate-pulse shadow-[var(--shadow-lg)]">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-[var(--foreground)] text-lg font-semibold">Carregando mapas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="py-12 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex-shrink-0 w-24 h-28 rounded-2xl border-4 border-[var(--accent)] bg-[var(--background)] flex items-center justify-center shadow-[var(--shadow-xl)] relative">
              <div className="absolute inset-0 rounded-2xl" style={{clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}}></div>
              <span className="text-6xl font-bold text-[var(--accent)] z-10" style={{fontFamily: "Georgia, serif"}}>V</span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                Vale dos Carajás
              </h1>
              <p className="text-white/90 text-lg sm:text-xl font-normal">
                Viva próximo à natureza
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Dados de Exemplo */}
      {maps.length === 1 && maps[0].id === '1762192028364' && (
        <div className="bg-gradient-to-r from-[var(--warning)]/30 to-[var(--accent)]/30 border-b-2 border-[var(--warning-dark)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[var(--warning-dark)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[var(--foreground)] text-sm font-semibold">
                <strong className="font-bold">Modo de Demonstração:</strong> Visualizando dados de exemplo.
                Para acessar a área administrativa,{' '}
                <Link
                  href="/admin/maps"
                  className="underline font-bold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                >
                  clique aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}



      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                      <span className="text-sm font-semibold text-white">Disponível para compra</span>
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

              <div className="bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contato
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white/80 text-xs">Email</p>
                      <p className="text-white font-medium">seunome@domínio.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white/80 text-xs">Telefone</p>
                      <p className="text-white font-medium">(00) 99999-9999</p>
                    </div>
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
            <p className="text-[var(--foreground)] text-lg font-semibold">Nenhum mapa disponível no momento.</p>
          </div>
        )}
      </div>

      {showPurchaseModal && selectedLot && (
        <PurchaseModal
          lot={selectedLot}
          onClose={handlePurchaseClose}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
