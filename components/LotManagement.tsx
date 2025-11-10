'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Map, Lot, LotStatus, LotArea } from '@/types';
import InteractiveMap from '@/components/InteractiveMap';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function LotManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapId = searchParams.get('mapId') || '';

  const [map, setMap] = useState<Map | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'rectangle'>('rectangle');
  const [previewArea, setPreviewArea] = useState<LotArea | null>(null);

  const loadData = useCallback(async () => {
    if (!mapId) return;

    try {
      console.log(`[LotManagement] 🔄 Carregando dados do mapa ${mapId}...`);
        const response = await axios.get(`${API_URL}/mapas/lotes`, {
          params: { mapId },
          timeout: 10000,
        });
        console.log('[LotManagement] ✅ Resposta recebida:', response.data);

        const data = response.data[0];

        if (data) {
          const mapObj: Map = {
            id: data.mapId || data.id || mapId,
            name: data.name || `Mapa ${data.mapId || mapId}`,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            imageType: 'image',
            width: data.width || 800,
            height: data.height || 600,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          };

          setMap(mapObj);

          if (data.lots && Array.isArray(data.lots)) {
            const lotsWithMapId = data.lots.map((lot: Lot) => {
              // Se area.points vem como string JSON, parsear
              let parsedArea = lot.area;
              if (lot.area && typeof lot.area.points === 'string') {
                try {
                  parsedArea = {
                    ...lot.area,
                    points: JSON.parse(lot.area.points as unknown as string)
                  };
                  console.log('[LotManagement] 🔧 Area.points parseado:', parsedArea.points);
                } catch (e) {
                  console.error('[LotManagement] ❌ Erro ao parsear area.points:', e);
                }
              }

              return {
                ...lot,
                area: parsedArea,
                mapId: data.mapId || mapId,
                createdAt: new Date(lot.createdAt),
                updatedAt: new Date(lot.updatedAt),
              };
            });

            console.log('[LotManagement] 📍 Lotes carregados:', lotsWithMapId.map((l: Lot) => ({
              id: l.id,
              lotNumber: l.lotNumber,
              pointsCount: l.area?.points?.length || 0,
              firstPoint: l.area?.points?.[0],
              lastPoint: l.area?.points?.[l.area?.points?.length - 1]
            })));
            setLots(lotsWithMapId);
          } else {
            setLots([]);
          }
        }
      } catch (error) {
        console.error('[LotManagement] ❌ Erro ao buscar dados:', error);
        const defaultMap: Map = {
          id: mapId,
          name: `Mapa ${mapId}`,
          description: '',
          imageUrl: '',
          imageType: 'image',
          width: 800,
          height: 600,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setMap(defaultMap);
        setLots([]);
        alert('Erro ao carregar dados do mapa. Usando valores padrão.');
      } finally {
        setIsLoading(false);
      }
    }, [mapId]);

  // Carrega os dados inicialmente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza os dados a cada 3 segundos para todos os clientes
  useRealtimeUpdates(() => {
    if (!isCreating && !editingLot) {
      loadData();
    }
  }, 3000);

  const reloadLots = async () => {
    try {
      console.log('[LotManagement] 🔄 Recarregando lotes...');
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId },
        timeout: 10000,
      });
      console.log('[LotManagement] ✅ Lotes recarregados:', response.data);

      const data = response.data[0];

      if (data) {
        if (data.lots && Array.isArray(data.lots)) {
          const lotsWithMapId = data.lots.map((lot: Lot) => {
            // Se area.points vem como string JSON, parsear
            let parsedArea = lot.area;
            if (lot.area && typeof lot.area.points === 'string') {
              try {
                parsedArea = {
                  ...lot.area,
                  points: JSON.parse(lot.area.points as unknown as string)
                };
              } catch (e) {
                console.error('[LotManagement] ❌ Erro ao parsear area.points no reload:', e);
              }
            }

            return {
              ...lot,
              area: parsedArea,
              mapId: data.mapId || mapId,
              createdAt: new Date(lot.createdAt),
              updatedAt: new Date(lot.updatedAt),
            };
          });

          setLots(lotsWithMapId);
        } else {
          setLots([]);
        }
      }
    } catch (error) {
      console.error('Erro ao recarregar lotes:', error);
    }
  };

  const saveLotToAPI = async (lot: Lot) => {
    try {
      console.log('[LotManagement] 📤 Salvando lote:', lot);
      await axios.post(`${API_URL}/mapas/lotes/criar`, lot, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('[LotManagement] ✅ Lote salvo com sucesso');
      await reloadLots();
    } catch (error) {
      console.error('[LotManagement] ❌ Erro ao salvar lote:', error);
      throw error;
    }
  };

  const deleteLotFromAPI = async (lotId: string) => {
    try {
      console.log(`[LotManagement] 🗑️ Deletando lote ${lotId}...`);
      await axios.delete(`${API_URL}/mapas/lotes/deletar`, {
        params: { lotId },
        timeout: 10000,
      });
      console.log('[LotManagement] ✅ Lote deletado com sucesso');
      await reloadLots();
    } catch (error) {
      console.error('[LotManagement] ❌ Erro ao deletar lote:', error);
      throw error;
    }
  };

  const updateLotStatus = async (lotId: string, status: LotStatus) => {
    try {
      console.log(`[LotManagement] 🔄 Atualizando status do lote ${lotId} para ${status}...`);
      await axios.put(`${API_URL}/mapas/lotes/comprar`,
        {
          lotId,
          status
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );
      console.log('[LotManagement] ✅ Status atualizado com sucesso');
      await reloadLots();
    } catch (error) {
      console.error('[LotManagement] ❌ Erro ao atualizar status:', error);
      throw error;
    }
  };

  const handleAreaDrawn = (area: LotArea) => {
    if (editingLot) {
      console.log(`📐 Área desenhada recebida (modo: ${drawingMode}):`, {
        mode: drawingMode,
        pointsCount: area.points.length,
        points: area.points,
        firstPoint: area.points[0],
        lastPoint: area.points[area.points.length - 1]
      });
      setEditingLot({ ...editingLot, area });
      setPreviewArea(area); // Salva a área para pré-visualização
    }
  };

  // Função para trocar o modo de desenho e resetar pontos
  const handleDrawingModeChange = (mode: 'polygon' | 'rectangle') => {
    if (mode !== drawingMode) {
      // Limpa a área desenhada e a pré-visualização ao trocar de modo
      if (editingLot) {
        setEditingLot({ ...editingLot, area: { points: [] } });
      }
      setPreviewArea(null);
      setDrawingMode(mode);
    }
  };

  // Função para validar o número do lote
  const validateLotNumber = async (lotNumber: string): Promise<boolean> => {
    try {
      console.log(`🔍 Validando número do lote ${lotNumber} para o mapa ${mapId}...`);
      const response = await axios.get(`${API_URL}/mapas/lotes/numero-valido`, {
        params: {
          mapId,
          lotNumber,
        },
      });

      // Se lotExists é 0, significa que o lote NÃO existe e pode ser criado
      const lotDoesNotExist = response.data.lotExists === 0;
      console.log(`✅ Resultado da validação (lotExists: ${response.data.lotExists}):`, lotDoesNotExist ? 'Número disponível' : 'Número já existe');
      return lotDoesNotExist;
    } catch (error) {
      console.error('❌ Erro ao validar número do lote:', error);
      alert('Erro ao validar o número do lote. Tente novamente.');
      return false;
    }
  };

  const handleSaveLot = async () => {
    if (!editingLot) {
      alert('Nenhum lote em edição');
      return;
    }

    // Validações obrigatórias
    if (!editingLot.lotNumber || editingLot.lotNumber.trim() === '') {
      alert('❌ Número do lote é obrigatório');
      return;
    }

    // Verificar se o número do lote foi alterado (ao editar) ou se é um novo lote
    const existingLot = lots.find(l => l.id === editingLot.id);
    const lotNumberChanged = !existingLot || existingLot.lotNumber !== editingLot.lotNumber;

    // Validar se o número do lote está disponível na API (apenas se mudou ou é novo)
    if (lotNumberChanged) {
      const isNumberAvailable = await validateLotNumber(editingLot.lotNumber);
      if (!isNumberAvailable) {
        alert(`❌ O número do lote "${editingLot.lotNumber}" já está em uso. Escolha outro número.`);
        return;
      }
    }

    if (editingLot.area.points.length < 3) {
      alert('❌ Desenhe a área do lote no mapa (mínimo 3 pontos)');
      return;
    }

    if (!editingLot.price || editingLot.price <= 0) {
      alert('❌ Informe o preço do lote');
      return;
    }

    if (!editingLot.size || editingLot.size <= 0) {
      alert('❌ Informe o tamanho do lote (m²)');
      return;
    }

    const lot: Lot = {
      ...editingLot,
      mapId,
      updatedAt: new Date(),
    };

    console.log('💾 Salvando lote:', {
      id: lot.id,
      lotNumber: lot.lotNumber,
      pointsCount: lot.area.points.length,
      points: lot.area.points,
      firstPoint: lot.area.points[0],
      lastPoint: lot.area.points[lot.area.points.length - 1]
    });

    try {
      await saveLotToAPI(lot);
      setIsCreating(false);
      setEditingLot(null);
      setSelectedLotId(undefined);
      setPreviewArea(null); // Limpa a pré-visualização após salvar
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar lote. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
      try {
        await deleteLotFromAPI(id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar lote. Tente novamente.');
      }
    }
  };

  const handleChangeStatus = async (lotId: string, newStatus: LotStatus) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;

    const statusLabels = {
      [LotStatus.AVAILABLE]: 'Disponível',
      [LotStatus.RESERVED]: 'Reservado',
      [LotStatus.SOLD]: 'Vendido',
    };

    // Validar se está tentando marcar como vendido sem estar reservado
    if (newStatus === LotStatus.SOLD && lot.status !== LotStatus.RESERVED) {
      alert(`❌ Não é possível finalizar a compra do lote ${lot.lotNumber}.\n\nO lote precisa estar com status "Reservado" antes de ser marcado como "Vendido".`);
      return;
    }

    if (confirm(`Alterar status do lote ${lot.lotNumber} para "${statusLabels[newStatus]}"?`)) {
      try {
        await updateLotStatus(lotId, newStatus);
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar status. Tente novamente.');
      }
    }
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setIsCreating(true);
    setSelectedLotId(lot.id);
  };

  const handleStatusChangeInForm = (newStatus: LotStatus) => {
    if (!editingLot) return;

    // Validar se está tentando marcar como vendido sem estar reservado
    if (newStatus === LotStatus.SOLD && editingLot.status !== LotStatus.RESERVED) {
      alert(`❌ Não é possível marcar o lote como "Vendido".\n\nO lote precisa estar com status "Reservado" antes de ser marcado como "Vendido".`);
      return;
    }

    setEditingLot({ ...editingLot, status: newStatus });
  };

  const handleNewLot = () => {
    setEditingLot({
      id: Date.now().toString(),
      mapId,
      lotNumber: '',
      area: { points: [] },
      status: LotStatus.AVAILABLE,
      price: 0,
      size: 0,
      description: '',
      features: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsCreating(true);
    setSelectedLotId(undefined);
    setPreviewArea(null); // Limpa a pré-visualização ao criar novo lote
  };

  if (isLoading || !map) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/maps')}
          className="text-blue-700 hover:text-blue-900 font-medium hover:underline mb-2 transition-colors cursor-pointer"
        >
          ← Voltar para Mapas
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{map.name}</h1>
            {map.description && <p className="text-gray-700 mt-1">{map.description}</p>}
          </div>
          <div className="flex gap-3 items-center">
            {isCreating && (
              <div className="flex gap-2 border border-gray-300 rounded-lg p-1 bg-gray-50">
                <button
                  onClick={() => handleDrawingModeChange('rectangle')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-all cursor-pointer ${
                    drawingMode === 'rectangle'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Desenhar retângulo (clicar e arrastar)"
                >
                  🔲 Retângulo
                </button>
                <button
                  onClick={() => handleDrawingModeChange('polygon')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-all cursor-pointer ${
                    drawingMode === 'polygon'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Desenhar polígono (clicar ponto a ponto)"
                >
                  📐 Polígono
                </button>
              </div>
            )}
            <button
              onClick={handleNewLot}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg cursor-pointer"
            >
              Novo Lote
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveMap
            imageUrl={map.imageUrl}
            lots={lots}
            isEditMode={isCreating}
            onAreaDrawn={handleAreaDrawn}
            selectedLotId={selectedLotId}
            drawingMode={drawingMode}
            previewArea={previewArea}
            onLotClick={(lot) => {
              if (!isCreating) {
                handleEditLot(lot);
              }
            }}
          />
        </div>

        <div className="space-y-4">
          {isCreating && editingLot && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingLot.area.points.length > 0 ? 'Editar' : 'Novo'} Lote
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Número do Lote</label>
                  <input
                    type="text"
                    value={editingLot.lotNumber}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, lotNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 01, A1, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                  <select
                    value={editingLot.status}
                    onChange={(e) => handleStatusChangeInForm(e.target.value as LotStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value={LotStatus.AVAILABLE}>Disponível</option>
                    <option value={LotStatus.RESERVED}>Reservado</option>
                    <option value={LotStatus.SOLD}>Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Área (m²)</label>
                  <input
                    type="number"
                    value={editingLot.size || ''}
                    onChange={(e) =>
                      setEditingLot({
                        ...editingLot,
                        size: e.target.value === '' ? 0 : parseFloat(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    value={editingLot.price || ''}
                    onChange={(e) =>
                      setEditingLot({
                        ...editingLot,
                        price: e.target.value === '' ? 0 : parseFloat(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                  <select
                    value={editingLot.status}
                    onChange={(e) => handleStatusChangeInForm(e.target.value as LotStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value={LotStatus.AVAILABLE}>Disponível</option>
                    <option value={LotStatus.RESERVED}>Reservado</option>
                    <option value={LotStatus.SOLD}>Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Descrição</label>
                  <textarea
                    value={editingLot.description}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrição do lote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Características (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editingLot.features?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingLot({
                        ...editingLot,
                        features: e.target.value.split(',').map((f) => f.trim()),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Água, Luz, Portaria"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    {editingLot.area.points.length === 0
                      ? '👆 Clique no mapa para desenhar a área do lote'
                      : `✓ ${editingLot.area.points.length} pontos desenhados`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLot}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm transition-all hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                    disabled={editingLot.area.points.length < 3}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingLot(null);
                      setSelectedLotId(undefined);
                      setPreviewArea(null); // Limpa a pré-visualização ao cancelar
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 shadow-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isCreating && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lotes Cadastrados</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">Lote {lot.lotNumber}</h3>
                        <p className="text-sm font-medium">
                          <span className={
                            lot.status === LotStatus.AVAILABLE
                              ? 'text-green-700'
                              : lot.status === LotStatus.RESERVED
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }>
                            {lot.status === LotStatus.AVAILABLE
                              ? 'Disponível'
                              : lot.status === LotStatus.RESERVED
                              ? 'Reservado'
                              : 'Vendido'}
                          </span>
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        R$ {lot.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Área:</span> {lot.size}m²
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLot(lot)}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lot.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                      {lot.status !== LotStatus.SOLD && (
                        <div className="flex gap-2">
                          {lot.status !== LotStatus.AVAILABLE && (
                            <button
                              onClick={() => handleChangeStatus(lot.id, LotStatus.AVAILABLE)}
                              className="flex-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors cursor-pointer"
                            >
                              ✓ Marcar Disponível
                            </button>
                          )}
                          {lot.status !== LotStatus.RESERVED && (
                            <button
                              onClick={() => handleChangeStatus(lot.id, LotStatus.RESERVED)}
                              className="flex-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded hover:bg-amber-200 transition-colors cursor-pointer"
                            >
                              ⏸ Marcar Reservado
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeStatus(lot.id, LotStatus.SOLD)}
                            className="flex-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded hover:bg-red-200 transition-colors cursor-pointer"
                          >
                            ✕ Marcar Vendido
                          </button>
                        </div>
                      )}
                      {lot.status === LotStatus.SOLD && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleChangeStatus(lot.id, LotStatus.AVAILABLE)}
                            className="flex-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors cursor-pointer"
                          >
                            ↻ Reverter para Disponível
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {lots.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4">
                    Nenhum lote cadastrado
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
