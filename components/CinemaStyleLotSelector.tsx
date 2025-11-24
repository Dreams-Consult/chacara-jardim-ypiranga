'use client';

import React, { useState } from 'react';
import { Lot, LotStatus, Block } from '@/types';

interface CinemaStyleLotSelectorProps {
  lots: Lot[];
  blocks?: Block[];
  onLotSelect?: (lot: Lot) => void;
  onMultipleSelect?: (lots: Lot[]) => void;
  onLotEdit?: (lot: Lot) => void;
  onLotDelete?: (lotId: string) => void;
  selectedLotIds?: string[];
  allowMultipleSelection?: boolean;
  lotsPerRow?: number;
}

export default function CinemaStyleLotSelector({
  lots,
  blocks = [],
  onLotSelect,
  onMultipleSelect,
  onLotEdit,
  onLotDelete,
  selectedLotIds = [],
  allowMultipleSelection = false,
  lotsPerRow = 10,
}: CinemaStyleLotSelectorProps) {
  const [selectedLotForModal, setSelectedLotForModal] = useState<Lot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLot, setEditedLot] = useState<Lot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pricePerM2Input, setPricePerM2Input] = useState<string>('');

  const sortedLots = [...lots].sort((a, b) => {
    const numA = parseInt(a.lotNumber) || 0;
    const numB = parseInt(b.lotNumber) || 0;
    return numA - numB;
  });

  const handleLotClick = (lot: Lot) => {
    // Se for admin (onLotEdit existe), permite clicar em qualquer lote
    // Se não for admin, só permite clicar em lotes disponíveis
    if (!onLotEdit && lot.status !== LotStatus.AVAILABLE) {
      return;
    }

    // Abre o modal para mostrar detalhes do lote
    setSelectedLotForModal(lot);

    // Garante que pricePerM2 está calculado se não existir
    const lotWithCalculatedPrice = {
      ...lot,
      pricePerM2: lot.pricePerM2 || (lot.size > 0 ? lot.price / lot.size : 0)
    };

    setEditedLot(lotWithCalculatedPrice);
    setPricePerM2Input(lotWithCalculatedPrice.pricePerM2.toFixed(2));
    // Permite editar lotes disponíveis e bloqueados
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
    // Admin pode clicar em qualquer lote
    if (onLotEdit) return true;
    // Cliente só pode clicar em lotes disponíveis
    return lot.status === LotStatus.AVAILABLE;
  };

  const selectedLots = sortedLots.filter(l => selectedLotIds.includes(l.id));
  const totalPrice = selectedLots.reduce((sum, lot) => sum + lot.price, 0);
  const totalSize = selectedLots.reduce((sum, lot) => sum + lot.size, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
        <h3 className="text-white font-semibold mb-3 md:mb-4 text-center text-base md:text-lg">
          Selecione o(s) Lote(s)
        </h3>

        <div
          className="grid gap-1.5 sm:gap-2 justify-center"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${typeof window !== 'undefined' && window.innerWidth < 640 ? '45px' : '60px'}, 1fr))`,
            maxWidth: '100%',
          }}
        >
          {sortedLots.map((lot) => {
            const isSelected = selectedLotIds.includes(lot.id);
            const isClickable = isLotClickable(lot);

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

      {/* Modal de detalhes do lote */}
      {selectedLotForModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl border-t sm:border border-gray-700 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Lote {selectedLotForModal.lotNumber}
                </h3>
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
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select
                      value={editedLot.status}
                      onChange={(e) => setEditedLot({ ...editedLot, status: e.target.value as LotStatus })}
                      className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base cursor-pointer touch-manipulation"
                    >
                      <option value={LotStatus.AVAILABLE}>Disponível</option>
                      <option value={LotStatus.BLOCKED}>Bloqueado</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">💡 Para reservar ou vender, use a página de Reservas</p>
                  </div>

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
                        const pricePerM2 = editedLot.pricePerM2 || 0;
                        // Calcula com precisão: multiplica primeiro, depois arredonda
                        const calculatedPrice = Math.round(newSize * pricePerM2 * 100) / 100;
                        setEditedLot({
                          ...editedLot,
                          size: newSize,
                          price: calculatedPrice
                        });
                      }}
                      className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="300.00"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preço por m² (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricePerM2Input}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPricePerM2Input(value);
                          const newPricePerM2 = value === '' ? 0 : parseFloat(value);
                          if (!isNaN(newPricePerM2)) {
                            const size = editedLot.size || 0;
                            // Calcula com precisão: multiplica primeiro, depois arredonda
                            const calculatedPrice = Math.round(size * newPricePerM2 * 100) / 100;
                            setEditedLot({
                              ...editedLot,
                              pricePerM2: newPricePerM2,
                              price: calculatedPrice
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setPricePerM2Input(value.toFixed(2));
                          }
                        }}
                        className="w-full pl-12 sm:pl-10 pr-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                        placeholder="150.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preço Total (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">R$</span>
                      <input
                        type="text"
                        value={editedLot.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        readOnly
                        className="w-full pl-12 sm:pl-10 pr-4 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-base cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Calculado automaticamente: Área × Preço/m²</p>
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
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Status</p>
                      <p className={`font-bold text-base sm:text-lg ${
                        selectedLotForModal.status === LotStatus.AVAILABLE
                          ? 'text-green-400'
                          : selectedLotForModal.status === LotStatus.RESERVED
                          ? 'text-yellow-400'
                          : selectedLotForModal.status === LotStatus.BLOCKED
                          ? 'text-gray-400'
                          : 'text-red-400'
                      }`}>
                        {selectedLotForModal.status === LotStatus.AVAILABLE
                          ? 'Disponível'
                          : selectedLotForModal.status === LotStatus.RESERVED
                          ? 'Reservado'
                          : selectedLotForModal.status === LotStatus.BLOCKED
                          ? 'Bloqueado'
                          : 'Vendido'}
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
                      R$ {selectedLotForModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {selectedLotForModal.pricePerM2 && (
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        R$ {selectedLotForModal.pricePerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²
                      </p>
                    )}
                  </div>

                  {selectedLotForModal.description && (
                    <div className="bg-gray-800 rounded-xl p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-2">Descrição</p>
                      <p className="text-white text-sm">{selectedLotForModal.description}</p>
                    </div>
                  )}

                  {selectedLotForModal.status !== LotStatus.AVAILABLE && selectedLotForModal.status !== LotStatus.BLOCKED && onLotEdit && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-bold text-orange-800 text-sm mb-1">⚠️ Lote com restrição</p>
                          <p className="text-orange-700 text-sm">
                            Este lote está <strong>{selectedLotForModal.status === LotStatus.RESERVED ? 'reservado' : 'vendido'}</strong>. 
                            Para editá-lo ou excluí-lo, cancele primeiro a {selectedLotForModal.status === LotStatus.RESERVED ? 'reserva' : 'venda'} na página de <strong>Reservas</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700 flex gap-2 sm:gap-3 flex-shrink-0">
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
                      <>
                        {onLotDelete && (
                          <button
                            onClick={async () => {
                              if (confirm(`Tem certeza que deseja excluir o lote ${selectedLotForModal.lotNumber}?`)) {
                                setIsDeleting(true);
                                try {
                                  await onLotDelete(selectedLotForModal.id);
                                  setSelectedLotForModal(null);
                                } finally {
                                  setIsDeleting(false);
                                }
                              }
                            }}
                            disabled={isDeleting}
                            className="px-4 sm:px-6 py-3 text-base bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500 touch-manipulation min-w-[100px] sm:min-w-0"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            // Garante que pricePerM2 está calculado
                            const lotWithCalculatedPrice = {
                              ...selectedLotForModal,
                              pricePerM2: selectedLotForModal.pricePerM2 || (selectedLotForModal.size > 0 ? selectedLotForModal.price / selectedLotForModal.size : 0)
                            };
                            setEditedLot(lotWithCalculatedPrice);
                          }}
                          className="flex-1 px-4 sm:px-6 py-3 text-base bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors touch-manipulation"
                        >
                          Editar Lote
                        </button>
                      </>
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
              <span>R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
