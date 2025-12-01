'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lot, LotStatus, Block } from '@/types';

interface LotSelectorProps {
  lots: Lot[];
  blocks?: Block[];
  onLotSelect?: (lot: Lot) => void;
  onMultipleSelect?: (lots: Lot[]) => void;
  onLotEdit?: (lot: Lot) => void;
  onLotDelete?: (lotId: string) => void;
  onToggleLotStatus?: (lotId: string, currentStatus: LotStatus) => Promise<void>;
  selectedLotIds?: string[];
  allowMultipleSelection?: boolean;
  lotsPerRow?: number;
  reservations?: any[]; // Array de reservas para mostrar no tooltip
  userRole?: string; // Role do usuário para verificar permissões
  userId?: number | string; // ID do usuário para verificar se é responsável pela reserva
}

export default function LotSelector({
  lots,
  blocks = [],
  onLotSelect,
  onMultipleSelect,
  onLotEdit,
  onLotDelete,
  onToggleLotStatus,
  selectedLotIds = [],
  allowMultipleSelection = false,
  lotsPerRow = 10,
  reservations = [],
  userRole,
  userId,
}: LotSelectorProps) {
  const router = useRouter();
  const [selectedLotForModal, setSelectedLotForModal] = useState<Lot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLot, setEditedLot] = useState<Lot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);
  const [pricePerM2Input, setPricePerM2Input] = useState<string>('');
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [hoveredLot, setHoveredLot] = useState<Lot | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const sortedLots = [...lots].sort((a, b) => {
    const numA = parseInt(a.lotNumber) || 0;
    const numB = parseInt(b.lotNumber) || 0;
    return numA - numB;
  });

  const handleLotClick = (lot: Lot) => {
    // Permite clicar em qualquer lote para visualizar informações
    // Admin pode editar, usuário comum só visualiza
    
    // Abre o modal para mostrar detalhes do lote
    setSelectedLotForModal(lot);

    // Garante que pricePerM2 está calculado se não existir
    const lotWithCalculatedPrice = {
      ...lot,
      pricePerM2: lot.pricePerM2 || (lot.size > 0 ? lot.price / lot.size : 0)
    };

    setEditedLot(lotWithCalculatedPrice);
    setPricePerM2Input(lotWithCalculatedPrice.pricePerM2.toFixed(2));
    setPriceDisplay(lotWithCalculatedPrice.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    // Permite editar apenas lotes disponíveis e bloqueados
    setIsEditing(!!onLotEdit && (lot.status === LotStatus.AVAILABLE || lot.status === LotStatus.BLOCKED));
  };

  const handleAddLot = () => {
    if (!selectedLotForModal) return;

    if (allowMultipleSelection && onMultipleSelect) {
      // Apenas notificar qual lote foi clicado para toggle
      onMultipleSelect([selectedLotForModal]);
    } else if (onLotSelect) {
      onLotSelect(selectedLotForModal);
    } 

    setSelectedLotForModal(null);
  };

  const handleToggleBlockStatus = async () => {
    if (!selectedLotForModal) return;
    if (!onToggleLotStatus) return; // Só funciona se onToggleLotStatus estiver disponível

    const newStatus = selectedLotForModal.status === LotStatus.BLOCKED ? LotStatus.AVAILABLE : LotStatus.BLOCKED;

    // Se está desbloqueando, pedir confirmação
    if (selectedLotForModal.status === LotStatus.BLOCKED) {
      if (!confirm(`Deseja desbloquear o lote ${selectedLotForModal.lotNumber}?`)) {
        return;
      }
    }

    setIsTogglingBlock(true);
    try {
      // Usar função específica de toggle
      await onToggleLotStatus(selectedLotForModal.id, selectedLotForModal.status);
      // Atualizar o lote no modal
      setSelectedLotForModal({
        ...selectedLotForModal,
        status: newStatus,
      });
      
      // Mostrar mensagem de sucesso
      if (newStatus === LotStatus.BLOCKED) {
        alert(`Lote ${selectedLotForModal.lotNumber} bloqueado com sucesso!`);
      } else {
        alert(`Lote ${selectedLotForModal.lotNumber} desbloqueado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao alterar status do lote:', error);
      alert('Erro ao alterar status do lote');
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const getLotColor = (lot: Lot): string => {
    if (selectedLotIds.includes(lot.id)) {
      return 'bg-blue-500 hover:bg-blue-600 border-blue-700';
    }

    switch (lot.status) {
      case LotStatus.AVAILABLE:
        return 'bg-green-500 hover:bg-green-600 border-green-700';
      case LotStatus.RESERVED:
        return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700';
      case LotStatus.SOLD:
        return 'bg-red-500 border-red-700';
      case LotStatus.BLOCKED:
        return 'bg-gray-500 border-gray-700';
      default:
        return 'bg-gray-400 border-gray-600';
    }
  };

  const isLotClickable = (lot: Lot): boolean => {
    // Admin/Dev podem clicar em qualquer lote
    if (onLotEdit || onToggleLotStatus) return true;
    
    // Usuários comuns não podem clicar em lotes bloqueados
    if (lot.status === LotStatus.BLOCKED) return false;
    
    // Usuários comuns podem clicar em disponível, reservado e vendido
    return true;
  };

  const handleMouseEnter = (lot: Lot, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredLot(lot);
  };

  const handleMouseLeave = () => {
    setHoveredLot(null);
  };

  const getReservationForLot = (lotId: string) => {
    // Buscar apenas reservas que não estejam canceladas
    return reservations.find(r => 
      r.status !== 'cancelled' &&
      r.lots?.some((l: any) => l.id === lotId || l.id === parseInt(lotId))
    );
  };

  const handleReservationClick = (reservation: any) => {
    if (reservation) {
      // Salvar ID da reserva no sessionStorage para expansão automática
      sessionStorage.setItem('expandReservationId', reservation.id.toString());
      // Redirecionar para a página de reservas
      router.push('/reservations');
    }
  };

  const selectedLots = lots.filter(lot => selectedLotIds.includes(lot.id));
  const totalPrice = selectedLots.reduce((sum, lot) => sum + lot.price, 0);
  const totalSize = selectedLots.reduce((sum, lot) => sum + lot.size, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
        <h3 className="text-white font-semibold mb-3 md:mb-4 text-center text-base md:text-lg">
          Selecione o(s) Lote(s)
        </h3>

        <div
          className="grid gap-1.5 sm:gap-2 justify-center relative"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${typeof window !== 'undefined' && window.innerWidth < 640 ? '45px' : '60px'}, 1fr))`,
            maxWidth: '100%',
          }}
        >
          {sortedLots.map((lot) => {
            const isSelected = selectedLotIds.includes(lot.id);
            const isClickable = isLotClickable(lot);
            const reservation = getReservationForLot(lot.id);

            return (
              <div
                key={lot.id}
                className={`
                  relative aspect-square rounded-lg border-2
                  transition-all duration-200
                  flex items-center justify-center
                  min-h-[45px] sm:min-h-[60px]
                  ${getLotColor(lot)}
                  ${isClickable ? 'cursor-pointer active:scale-95 sm:hover:scale-105 touch-manipulation' : 'cursor-not-allowed opacity-70'}
                  ${isSelected ? 'ring-2 ring-blue-300 ring-offset-1 sm:ring-offset-2 ring-offset-gray-900' : ''}
                `}
                onClick={() => handleLotClick(lot)}
                onMouseEnter={(e) => {
                  // Apenas mostrar tooltip em desktop (não mobile)
                  if (window.innerWidth >= 1024) {
                    handleMouseEnter(lot, e);
                  }
                }}
                onMouseLeave={handleMouseLeave}
                title={`Lote ${lot.lotNumber} - ${lot.status}`}
              >
                <span className="text-white font-bold text-xs sm:text-sm select-none">
                  {lot.lotNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip com informações do lote */}
      {hoveredLot && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[350px] animate-in fade-in duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <h4 className="text-white font-bold text-lg">Lote {hoveredLot.lotNumber}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  hoveredLot.status === LotStatus.AVAILABLE ? 'bg-green-500/20 text-green-300' :
                  hoveredLot.status === LotStatus.RESERVED ? 'bg-yellow-500/20 text-yellow-300' :
                  hoveredLot.status === LotStatus.SOLD ? 'bg-red-500/20 text-red-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {hoveredLot.status === LotStatus.AVAILABLE && 'Disponível'}
                  {hoveredLot.status === LotStatus.RESERVED && 'Reservado'}
                  {hoveredLot.status === LotStatus.SOLD && 'Vendido'}
                  {hoveredLot.status === LotStatus.BLOCKED && 'Bloqueado'}
                </span>
              </div>

              {hoveredLot.status === LotStatus.AVAILABLE && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Área</p>
                      <p className="text-white font-semibold">{hoveredLot.size} m²</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Preço</p>
                      <p className="text-white font-semibold">R$ {hoveredLot.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  {hoveredLot.pricePerM2 && (
                    <div className="text-sm">
                      <p className="text-gray-400">Preço/m²</p>
                      <p className="text-white font-semibold">R$ {hoveredLot.pricePerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  {hoveredLot.description && (
                    <div className="text-sm">
                      <p className="text-gray-400">Descrição</p>
                      <p className="text-white text-xs">{hoveredLot.description}</p>
                    </div>
                  )}
                </>
              )}

              {(hoveredLot.status === LotStatus.RESERVED || hoveredLot.status === LotStatus.SOLD) && (() => {
                const reservation = getReservationForLot(hoveredLot.id);
                return reservation ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="text-gray-400">Cliente</p>
                      <p className="text-white font-semibold">{reservation.customer_name}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400">Vendedor</p>
                      <p className="text-white">{reservation.seller_name}</p>
                    </div>
                    {reservation.created_at && (
                      <div className="text-sm">
                        <p className="text-gray-400">Data</p>
                        <p className="text-white">{new Date(reservation.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Sem informações de reserva disponíveis</p>
                );
              })()}

              {hoveredLot.status === LotStatus.BLOCKED && (
                <div className="text-sm">
                  <p className="text-gray-400">Este lote está bloqueado e não pode ser reservado no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do lote */}
      {selectedLotForModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700 my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Lote {selectedLotForModal.lotNumber}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Botão de excluir apenas para administradores e desenvolvedores */}
                  {onLotDelete && userRole !== 'seller' && (selectedLotForModal.status === LotStatus.AVAILABLE || selectedLotForModal.status === LotStatus.BLOCKED) && (
                    <button
                      onClick={async () => {
                        if (confirm(`Tem certeza que deseja excluir o lote ${selectedLotForModal.lotNumber}?`)) {
                          setIsDeleting(true);
                          try {
                            await onLotDelete(selectedLotForModal.id);
                            setSelectedLotForModal(null);
                            setIsEditing(false);
                            setEditedLot(null);
                          } finally {
                            setIsDeleting(false);
                          }
                        }
                      }}
                      disabled={isDeleting}
                      className="p-2 rounded-lg transition-colors touch-manipulation bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir lote"
                    >
                      {isDeleting ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                  {/* Botão de bloquear/desbloquear apenas para administradores e desenvolvedores */}
                  {onToggleLotStatus && userRole !== 'seller' && (selectedLotForModal.status === LotStatus.AVAILABLE || selectedLotForModal.status === LotStatus.BLOCKED) && (
                    <button
                      onClick={handleToggleBlockStatus}
                      disabled={isTogglingBlock}
                      className={`p-2 rounded-lg transition-colors touch-manipulation ${
                        selectedLotForModal.status === LotStatus.BLOCKED
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 cursor-pointer'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white cursor-pointer'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={selectedLotForModal.status === LotStatus.BLOCKED ? 'Desbloquear lote' : 'Bloquear lote'}
                    >
                      {isTogglingBlock ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          {selectedLotForModal.status === LotStatus.BLOCKED ? (
                            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                          ) : (
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          )}
                        </svg>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedLotForModal(null);
                      setIsEditing(false);
                      setEditedLot(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-2 -m-2 touch-manipulation"
                    aria-label="Fechar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {isEditing && editedLot ? (
                // Modo de edição
                <>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Número do Lote *</label>
                    <input
                      type="text"
                      value={editedLot.lotNumber}
                      onChange={(e) => setEditedLot({ ...editedLot, lotNumber: e.target.value })}
                      className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="Ex: 01, A1, etc"
                    />
                  </div>

                  {blocks.length > 0 && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Quadra</label>
                      <select
                        value={editedLot.blockId || ''}
                        onChange={(e) => setEditedLot({ ...editedLot, blockId: e.target.value || undefined })}
                        className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base cursor-pointer focus:ring-2 focus:ring-blue-500 touch-manipulation"
                      >
                        <option value="">Sem quadra</option>
                        {blocks.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Área (m²) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedLot.size || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newSize = value === '' ? 0 : parseFloat(value);
                        setEditedLot({
                          ...editedLot,
                          size: newSize
                        });
                      }}
                      className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="300.00"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preço Total (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">R$</span>
                      <input
                        type="text"
                        value={priceDisplay}
                        onChange={(e) => {
                          let value = e.target.value;
                          
                          // Remove tudo exceto dígitos
                          value = value.replace(/\D/g, '');
                          
                          if (value === '') {
                            setPriceDisplay('');
                            setEditedLot({
                              ...editedLot,
                              price: 0
                            });
                            return;
                          }
                          
                          // Adiciona zeros à esquerda se necessário
                          value = value.padStart(3, '0');
                          
                          // Separa centavos dos reais
                          const cents = value.slice(-2);
                          const reais = value.slice(0, -2);
                          
                          // Formata com separador de milhar
                          const formattedReais = parseInt(reais).toLocaleString('pt-BR');
                          const formattedValue = `${formattedReais},${cents}`;
                          
                          setPriceDisplay(formattedValue);
                          
                          // Converte para número decimal
                          const numericValue = parseFloat(`${reais}.${cents}`);
                          setEditedLot({
                            ...editedLot,
                            price: numericValue
                          });
                        }}
                        className="w-full pl-12 sm:pl-10 pr-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                        placeholder="0,00"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">💡 Preencha manualmente o valor do lote</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Descrição</label>
                    <textarea
                      value={editedLot.description || ''}
                      onChange={(e) => setEditedLot({ ...editedLot, description: e.target.value })}
                      className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation resize-none"
                      rows={3}
                      placeholder="Informações adicionais sobre o lote"
                    />
                  </div>
                </>
              ) : (
                // Modo de visualização
                <>
                  {(selectedLotForModal.status === LotStatus.RESERVED || selectedLotForModal.status === LotStatus.SOLD) ? (
                    // Visualização mínima para lotes reservados/vendidos
                    (() => {
                      const reservation = getReservationForLot(selectedLotForModal.id);
                      return (
                        <>
                          <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-bold text-lg">Informações do Lote</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedLotForModal.status === LotStatus.RESERVED 
                                  ? 'bg-yellow-500/20 text-yellow-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {selectedLotForModal.status === LotStatus.RESERVED ? 'Reservado' : 'Vendido'}
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 text-sm">Número do Lote</span>
                                <span className="text-white font-bold text-lg">{selectedLotForModal.lotNumber}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 text-sm">Área</span>
                                <span className="text-white font-semibold">{selectedLotForModal.size} m²</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 text-sm">Valor</span>
                                <span className="text-white font-bold text-lg">
                                  R$ {selectedLotForModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              {reservation && (
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-gray-400 text-sm">Comprador/Reservado por</span>
                                  <span className="text-white font-semibold">{reservation.customer_name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {onLotEdit && (
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="font-bold text-orange-800 text-sm mb-1">⚠️ Lote com restrição</p>
                                  <p className="text-orange-700 text-sm">
                                    Este lote não pode ser editado ou excluído enquanto estiver {selectedLotForModal.status === LotStatus.RESERVED ? 'reservado' : 'vendido'}. 
                                    Cancele a {selectedLotForModal.status === LotStatus.RESERVED ? 'reserva' : 'venda'} primeiro na página de <strong>Reservas</strong>.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    // Visualização completa para lotes disponíveis/bloqueados
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Status</p>
                          <p className={`font-bold text-base sm:text-lg ${
                            selectedLotForModal.status === LotStatus.AVAILABLE
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }`}>
                            {selectedLotForModal.status === LotStatus.AVAILABLE ? 'Disponível' : 'Bloqueado'}
                          </p>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Área</p>
                          <p className="font-bold text-base sm:text-lg text-white">{selectedLotForModal.size}m²</p>
                        </div>
                      </div>

                      {selectedLotForModal.blockId && blocks.length > 0 && (
                        <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Quadra</p>
                          <p className="font-bold text-base sm:text-lg text-white">
                            {blocks.find(b => b.id === selectedLotForModal.blockId)?.name || 'Não identificada'}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Valor Total</p>
                        <p className="font-bold text-xl sm:text-2xl text-white">
                          R$ {selectedLotForModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {selectedLotForModal.pricePerM2 && (
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            R$ {selectedLotForModal.pricePerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/m²
                          </p>
                        )}
                      </div>

                      {selectedLotForModal.description && (
                        <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                          <p className="text-gray-400 text-xs sm:text-sm mb-2">Descrição</p>
                          <p className="text-white text-sm">{selectedLotForModal.description}</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700 flex gap-2 sm:gap-3 flex-shrink-0">
              {/* Modal para lotes reservados/vendidos: apenas botão de redirecionar */}
              {(selectedLotForModal.status === LotStatus.RESERVED || selectedLotForModal.status === LotStatus.SOLD) ? (
                (() => {
                  const reservation = getReservationForLot(selectedLotForModal.id);
                  // Verificar se o usuário pode ver o botão de redirecionamento
                  const canViewReservation = userRole === 'admin' || userRole === 'dev' || 
                    (reservation && userId && reservation.user_id == userId); // Usar == para comparar string e number
                  
                  return reservation && canViewReservation ? (
                    <button
                      onClick={() => {
                        handleReservationClick(reservation);
                        setSelectedLotForModal(null);
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 text-base bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors touch-manipulation flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Ir para {selectedLotForModal.status === LotStatus.RESERVED ? 'Reserva' : 'Compra'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedLotForModal(null);
                        setIsEditing(false);
                        setEditedLot(null);
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 text-base bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-semibold rounded-xl transition-colors touch-manipulation"
                    >
                      Fechar
                    </button>
                  );
                })()
              ) : (
                /* Modal para lotes disponíveis/bloqueados: botões normais */
                <>
                  <button
                    onClick={() => {
                      setSelectedLotForModal(null);
                      setIsEditing(false);
                      setEditedLot(null);
                    }}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-3 text-base bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-semibold rounded-xl transition-colors touch-manipulation"
                  >
                    Cancelar
                  </button>
                  {onLotEdit ? (
                    isEditing && editedLot ? (
                      <button
                        onClick={() => {
                          onLotEdit(editedLot);
                          setSelectedLotForModal(null);
                          setIsEditing(false);
                          setEditedLot(null);
                        }}
                        className="flex-1 px-4 sm:px-6 py-3 text-base bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors touch-manipulation"
                      >
                        Salvar Alterações
                      </button>
                    ) : (
                      <>
                        {(selectedLotForModal.status === LotStatus.AVAILABLE || selectedLotForModal.status === LotStatus.BLOCKED) && (
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              // Garante que pricePerM2 está calculado
                              const lotWithCalculatedPrice = {
                                ...selectedLotForModal,
                                pricePerM2: selectedLotForModal.pricePerM2 || (selectedLotForModal.size > 0 ? selectedLotForModal.price / selectedLotForModal.size : 0)
                              };
                              setEditedLot(lotWithCalculatedPrice);
                              setPriceDisplay(lotWithCalculatedPrice.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                            }}
                            className="flex-1 px-4 sm:px-6 py-3 text-base bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors touch-manipulation"
                          >
                            Editar Lote
                          </button>
                        )}
                      </>
                    )
                  ) : (
                    <button
                      onClick={handleAddLot}
                      className="flex-1 px-4 sm:px-6 py-3 text-base bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedLotForModal.status !== LotStatus.AVAILABLE}
                    >
                      {selectedLotIds.includes(selectedLotForModal.id) ? 'Remover da Seleção' : 'Adicionar à Seleção'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {allowMultipleSelection && selectedLots.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 sm:p-4">
          <h4 className="text-white font-bold mb-2 text-base sm:text-lg">
            Seleção Atual ({selectedLots.length} {selectedLots.length === 1 ? 'lote' : 'lotes'})
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-white/80 text-sm">
              <span>Lotes:</span>
              <span className="font-medium">
                {selectedLots.map(l => l.lotNumber).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-white/80 text-sm">
              <span>Área Total:</span>
              <span className="font-medium">{totalSize}m²</span>
            </div>
            <div className="flex justify-between text-white text-base sm:text-lg font-bold pt-2 border-t border-white/20">
              <span>Total:</span>
              <span>R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 shadow-lg">
        <h3 className="text-white font-semibold mb-3 text-base sm:text-lg">Legenda:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded flex-shrink-0"></div>
            <span className="text-white/80 text-xs sm:text-sm">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded flex-shrink-0"></div>
            <span className="text-white/80 text-xs sm:text-sm">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded flex-shrink-0"></div>
            <span className="text-white/80 text-xs sm:text-sm">Vendido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded flex-shrink-0"></div>
            <span className="text-white/80 text-xs sm:text-sm">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
