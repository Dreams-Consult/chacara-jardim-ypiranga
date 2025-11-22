'use client';

import React, { useState } from 'react';
import { Lot, LotStatus, Block } from '@/types';

interface CinemaStyleLotSelectorProps {
  lots: Lot[];
  blocks?: Block[];
  onLotSelect?: (lot: Lot) => void;
  onMultipleSelect?: (lots: Lot[]) => void;
  onLotEdit?: (lot: Lot) => void;
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
  selectedLotIds = [],
  allowMultipleSelection = false,
  lotsPerRow = 10,
}: CinemaStyleLotSelectorProps) {
  const [selectedLotForModal, setSelectedLotForModal] = useState<Lot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLot, setEditedLot] = useState<Lot | null>(null);

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
    // Permite editar lotes disponíveis e bloqueados
    setIsEditing(!!onLotEdit && (lot.status === LotStatus.AVAILABLE || lot.status === LotStatus.BLOCKED));
  };

  const handleAddLot = () => {
    if (!selectedLotForModal) return;

    if (allowMultipleSelection) {
      const isSelected = selectedLotIds.includes(selectedLotForModal.id);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedLotIds.filter(id => id !== selectedLotForModal.id);
      } else {
        newSelection = [...selectedLotIds, selectedLotForModal.id];
      }

      const selectedLots = sortedLots.filter(l => newSelection.includes(l.id));
      onMultipleSelect?.(selectedLots);
    } else {
      onLotSelect?.(selectedLotForModal);
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
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-white font-semibold mb-4 text-center text-lg">
          Selecione o(s) Lote(s)
        </h3>

        <div
          className="grid gap-2 justify-center"
          style={{
            gridTemplateColumns: `repeat(${lotsPerRow}, minmax(0, 1fr))`,
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
                  ${getLotColor(lot)}
                  ${isClickable ? 'cursor-pointer transform hover:scale-105' : 'cursor-not-allowed opacity-70'}
                  ${isSelected ? 'ring-2 ring-blue-300 ring-offset-2 ring-offset-gray-900' : ''}
                `}
                onClick={() => handleLotClick(lot)}
                title={`Lote ${lot.lotNumber} - ${lot.status}`}
              >
                <span className="text-white font-bold text-sm select-none">
                  {lot.lotNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalhes do lote */}
      {selectedLotForModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700 my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  Lote {selectedLotForModal.lotNumber}
                </h3>
                <button
                  onClick={() => {
                    setSelectedLotForModal(null);
                    setIsEditing(false);
                    setEditedLot(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {isEditing && editedLot ? (
                // Modo de edição
                <>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Número do Lote *</label>
                    <input
                      type="text"
                      value={editedLot.lotNumber}
                      onChange={(e) => setEditedLot({ ...editedLot, lotNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 01, A1, etc"
                    />
                  </div>

                  {blocks.length > 0 && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Quadra</label>
                      <select
                        value={editedLot.blockId || ''}
                        onChange={(e) => setEditedLot({ ...editedLot, blockId: e.target.value || undefined })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer"
                    >
                      <option value={LotStatus.AVAILABLE}>Disponível</option>
                      <option value={LotStatus.RESERVED}>Reservado</option>
                      <option value={LotStatus.SOLD}>Vendido</option>
                      <option value={LotStatus.BLOCKED}>Bloqueado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Área (m²) *</label>
                    <input
                      type="number"
                      value={editedLot.size}
                      onChange={(e) => {
                        const newSize = parseFloat(e.target.value) || 0;
                        const pricePerM2 = editedLot.pricePerM2 || 0;
                        setEditedLot({
                          ...editedLot,
                          size: newSize,
                          price: newSize * pricePerM2
                        });
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="300"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preço por m² (R$) *</label>
                    <input
                      type="number"
                      value={editedLot.pricePerM2}
                      onChange={(e) => {
                        const newPricePerM2 = parseFloat(e.target.value) || 0;
                        const size = editedLot.size || 0;
                        setEditedLot({
                          ...editedLot,
                          pricePerM2: newPricePerM2,
                          price: size * newPricePerM2
                        });
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="150"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Preço Total (R$)</label>
                    <input
                      type="number"
                      value={editedLot.price}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Calculado automaticamente: Área × Preço/m²</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Descrição</label>
                    <textarea
                      value={editedLot.description || ''}
                      onChange={(e) => setEditedLot({ ...editedLot, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Informações adicionais sobre o lote"
                    />
                  </div>
                </>
              ) : (
                // Modo de visualização
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p className={`font-bold text-lg ${
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

                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">Área</p>
                      <p className="font-bold text-lg text-white">{selectedLotForModal.size}m²</p>
                    </div>
                  </div>

                  {selectedLotForModal.blockId && blocks.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">Quadra</p>
                      <p className="font-bold text-lg text-white">
                        {blocks.find(b => b.id === selectedLotForModal.blockId)?.name || 'Não identificada'}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-1">Valor Total</p>
                    <p className="font-bold text-2xl text-white">
                      R$ {selectedLotForModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {selectedLotForModal.pricePerM2 && (
                      <p className="text-gray-400 text-sm mt-1">
                        R$ {selectedLotForModal.pricePerM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²
                      </p>
                    )}
                  </div>

                  {selectedLotForModal.description && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-2">Descrição</p>
                      <p className="text-white text-sm">{selectedLotForModal.description}</p>
                    </div>
                  )}

                  {selectedLotForModal.status !== LotStatus.AVAILABLE && selectedLotForModal.status !== LotStatus.BLOCKED && onLotEdit && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Este lote está {selectedLotForModal.status === LotStatus.RESERVED ? 'reservado' : 'vendido'}. Para editá-lo, cancele a {selectedLotForModal.status === LotStatus.RESERVED ? 'reserva' : 'venda'} primeiro.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedLotForModal(null);
                  setIsEditing(false);
                  setEditedLot(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
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
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Salvar Alterações
                  </button>
                ) : (
                  (selectedLotForModal.status === LotStatus.AVAILABLE || selectedLotForModal.status === LotStatus.BLOCKED) && (
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
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Editar Lote
                    </button>
                  )
                )
              ) : (
                <button
                  onClick={handleAddLot}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
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
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
          <h4 className="text-white font-bold mb-2">
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
            <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/20">
              <span>Total:</span>
              <span>R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
        <h3 className="text-white font-semibold mb-3">Legenda:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded"></div>
            <span className="text-white/80 text-sm">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded"></div>
            <span className="text-white/80 text-sm">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded"></div>
            <span className="text-white/80 text-sm">Vendido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-500 rounded"></div>
            <span className="text-white/80 text-sm">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
