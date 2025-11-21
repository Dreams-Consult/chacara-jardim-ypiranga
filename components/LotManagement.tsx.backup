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
  const [viewingLot, setViewingLot] = useState<Lot | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'rectangle'>('rectangle');
  const [previewArea, setPreviewArea] = useState<LotArea | null>(null);

  // Limpa a pré-visualização quando começamos a editar um lote diferente
  useEffect(() => {
    if (isCreating) {
      // Quando mudamos de lote ou começamos uma nova edição, limpa a pré-visualização
      setPreviewArea(null);
    }
  }, [isCreating, selectedLotId]);

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

  const updateLotToAPI = async (lot: Lot) => {
    try {
      console.log('[LotManagement] 📝 Atualizando lote:', lot);
      await axios.patch(`${API_URL}/mapas/lotes`, lot, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('[LotManagement] ✅ Lote atualizado com sucesso');
      await reloadLots();
    } catch (error) {
      console.error('[LotManagement] ❌ Erro ao atualizar lote:', error);
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

  const handleAreaDrawn = (area: LotArea) => {
    if (editingLot) {
      console.log(`📐 Área desenhada recebida (modo: ${drawingMode}):`, {
        mode: drawingMode,
        pointsCount: area.points.length,
        points: area.points,
        firstPoint: area.points[0],
        lastPoint: area.points[area.points.length - 1]
      });
      // Substitui completamente a área anterior pela nova área desenhada
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

    // Validação crítica: verificar se a área foi desenhada no mapa
    if (!editingLot.area || !editingLot.area.points || editingLot.area.points.length < 3) {
      alert(
        '❌ Área do lote não foi desenhada!\n\n' +
        'Você precisa desenhar a área do lote no mapa antes de salvar.\n\n' +
        'Clique no mapa para definir pelo menos 3 pontos da área do lote.'
      );
      return;
    }

    if (!editingLot.size || editingLot.size <= 0) {
      alert('❌ Informe o tamanho do lote (m²)');
      return;
    }

    if (!editingLot.pricePerM2 || editingLot.pricePerM2 <= 0) {
      alert('❌ Informe o preço por m² do lote');
      return;
    }

    if (!editingLot.price || editingLot.price <= 0) {
      alert('❌ O preço total do lote deve ser maior que zero');
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
      // Se o lote tem ID, é uma atualização, senão é criação
      if (lot.id && lot.id !== '') {
        await updateLotToAPI(lot);
      } else {
        await saveLotToAPI(lot);
      }
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
    // Encontra o lote que está sendo excluído
    const lotToDelete = lots.find(lot => lot.id === id);

    // Verifica se o lote está reservado ou vendido
    if (lotToDelete && (lotToDelete.status === LotStatus.RESERVED || lotToDelete.status === LotStatus.SOLD)) {
      const statusText = lotToDelete.status === LotStatus.RESERVED ? 'reservado' : 'vendido';
      alert(
        `❌ Não é possível excluir este lote!\n\n` +
        `O Lote ${lotToDelete.lotNumber} está ${statusText}.\n\n` +
        `Para excluir este lote, você precisa primeiro cancelar a ${lotToDelete.status === LotStatus.RESERVED ? 'reserva' : 'venda'} na página de Reservas.`
      );
      return;
    }

    if (confirm('Tem certeza que deseja excluir este lote?')) {
      try {
        await deleteLotFromAPI(id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar lote. Tente novamente.');
      }
    }
  };

  const handleEditLot = (lot: Lot) => {
    // Se o lote não está disponível, abrir modal de visualização
    if (lot.status !== LotStatus.AVAILABLE && lot.status !== LotStatus.BLOCKED) {
      setViewingLot(lot);
      return;
    }

    // Lotes disponíveis podem ser editados normalmente
    setEditingLot(lot);
    setIsCreating(true);
    setSelectedLotId(lot.id);
    setPreviewArea(null); // Limpa qualquer pré-visualização anterior
  };

  const handleNewLot = () => {
    setEditingLot({
      id: '', // ID será gerado pelo backend (autoincrement)
      mapId,
      lotNumber: '',
      area: { points: [] },
      status: LotStatus.AVAILABLE,
      price: 0,
      size: 0,
      pricePerM2: 0,
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
            {!isCreating && (
              <button
                onClick={handleNewLot}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg cursor-pointer"
              >
                Novo Lote
              </button>
            )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 cursor-pointer"
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, status: e.target.value as LotStatus })
                    }
                  >
                    <option value={LotStatus.AVAILABLE}>Disponível</option>
                    <option value={LotStatus.RESERVED}>Reservado</option>
                    <option value={LotStatus.SOLD}>Vendido</option>
                    <option value={LotStatus.BLOCKED}>Bloqueado</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Status é controlado automaticamente pelas reservas
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Área (m²)</label>
                  <input
                    type="number"
                    value={editingLot.size || ''}
                    onChange={(e) => {
                      const newSize = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const pricePerM2 = editingLot.pricePerM2 || 0;
                      setEditingLot({
                        ...editingLot,
                        size: newSize,
                        price: newSize * pricePerM2
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Preço por m² (R$)</label>
                  <input
                    type="number"
                    value={editingLot.pricePerM2 || ''}
                    onChange={(e) => {
                      const newPricePerM2 = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const size = editingLot.size || 0;
                      setEditingLot({
                        ...editingLot,
                        pricePerM2: newPricePerM2,
                        price: size * newPricePerM2
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Preço Total (R$)</label>
                  <input
                    type="number"
                    value={editingLot.price || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculado automaticamente: {editingLot.size || 0} m² × R$ {editingLot.pricePerM2 || 0}
                  </p>
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
                <div className="flex flex-col gap-2">
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
                  {editingLot.id && (
                    <button
                      onClick={async () => {
                        await handleDelete(editingLot.id);
                        // Fecha o menu de edição após excluir
                        setIsCreating(false);
                        setEditingLot(null);
                        setSelectedLotId(undefined);
                        setPreviewArea(null);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir Lote
                    </button>
                  )}
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
                            : lot.status === LotStatus.BLOCKED
                            ? 'text-gray-700'
                            : 'text-red-700'
                          }>
                          {lot.status === LotStatus.AVAILABLE
                            ? 'Disponível'
                            : lot.status === LotStatus.RESERVED
                            ? 'Reservado'
                            : lot.status === LotStatus.BLOCKED
                            ? 'Bloqueado'
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
                        className={`flex-1 px-3 py-1 text-white text-sm font-medium rounded transition-colors shadow-sm hover:shadow-md cursor-pointer ${
                        lot.status === LotStatus.AVAILABLE || lot.status === LotStatus.BLOCKED
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {(lot.status === LotStatus.AVAILABLE || lot.status === LotStatus.BLOCKED) ? 'Editar' : 'Ver Detalhes'}
                      </button>
                      <button
                        onClick={() => handleDelete(lot.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                      >
                        Excluir
                      </button>
                      </div>
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

      {/* Modal de Visualização de Lote (Reservado/Vendido) */}
      {viewingLot && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingLot(null)}
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
                  onClick={() => setViewingLot(null)}
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
                    ? '⚠️ Este lote está reservado e não pode ser editado.'
                    : '✓ Este lote foi vendido e não pode ser editado.'}
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

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Criado em</label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingLot.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Atualizado em</label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingLot.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setViewingLot(null)}
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
