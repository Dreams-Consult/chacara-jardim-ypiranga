'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Map, Lot, LotStatus, LotArea } from '@/types';
import InteractiveMap from '@/components/InteractiveMap';

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

  useEffect(() => {
    if (!mapId) return;

    const loadData = async () => {
      try {
        const response = await axios.get(`${API_URL}/mapas`);
        const mapsData = response.data;

        const currentMapData = mapsData.find((m: { mapId: string }) => m.mapId === mapId);

        if (currentMapData) {
          const mapObj: Map = {
            id: currentMapData.mapId,
            name: `Mapa ${currentMapData.mapId}`,
            imageUrl: '',
            imageType: 'image',
            width: 800,
            height: 600,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setMap(mapObj);

          const lotsWithMapId = currentMapData.lots.map((lot: Lot) => ({
            ...lot,
            mapId: currentMapData.mapId,
            createdAt: new Date(lot.createdAt),
            updatedAt: new Date(lot.updatedAt),
          }));

          setLots(lotsWithMapId);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mapId]);

  const reloadLots = async () => {
    try {
      const response = await axios.get(`${API_URL}/mapas`);
      const mapsData = response.data;
      const currentMapData = mapsData.find((m: { mapId: string }) => m.mapId === mapId);

      if (currentMapData) {
        const lotsWithMapId = currentMapData.lots.map((lot: Lot) => ({
          ...lot,
          mapId: currentMapData.mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));

        setLots(lotsWithMapId);
      }
    } catch (error) {
      console.error('Erro ao recarregar lotes:', error);
    }
  };

  const saveLotToAPI = async (lot: Lot) => {
    try {
      await axios.post(`${API_URL}/criarLote`, lot, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      await reloadLots();
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      throw error;
    }
  };

  const deleteLotFromAPI = async (lotId: string) => {
    try {
      await axios.delete(`${API_URL}/deletarLote/${lotId}`, {
        timeout: 10000,
      });
      await reloadLots();
    } catch (error) {
      console.error('Erro ao deletar lote:', error);
      throw error;
    }
  };

  const updateLotStatus = async (lotId: string, status: LotStatus) => {
    try {
      await axios.put(`${API_URL}/atualizarStatusLote/${lotId}`,
        { status },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );
      await reloadLots();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  const handleAreaDrawn = (area: LotArea) => {
    if (editingLot) {
      setEditingLot({ ...editingLot, area });
    }
  };

  const handleSaveLot = async () => {
    if (!editingLot || !editingLot.lotNumber || editingLot.area.points.length < 3) {
      alert('Preencha todos os campos e desenhe a área do lote');
      return;
    }

    const lot: Lot = {
      ...editingLot,
      mapId,
      updatedAt: new Date(),
    };

    try {
      await saveLotToAPI(lot);
      setIsCreating(false);
      setEditingLot(null);
      setSelectedLotId(undefined);
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
          className="text-blue-700 hover:text-blue-900 font-medium hover:underline mb-2 transition-colors"
        >
          ← Voltar para Mapas
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{map.name}</h1>
            {map.description && <p className="text-gray-700 mt-1">{map.description}</p>}
          </div>
          <button
            onClick={handleNewLot}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
          >
            Novo Lote
          </button>
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
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, status: e.target.value as LotStatus })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    onChange={(e) =>
                      setEditingLot({
                        ...editingLot,
                        status: e.target.value as LotStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm transition-all hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                    disabled={editingLot.area.points.length < 3}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingLot(null);
                      setSelectedLotId(undefined);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 shadow-sm transition-colors"
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
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(lot.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          Excluir
                        </button>
                      </div>
                      {lot.status !== LotStatus.SOLD && (
                        <div className="flex gap-2">
                          {lot.status !== LotStatus.AVAILABLE && (
                            <button
                              onClick={() => handleChangeStatus(lot.id, LotStatus.AVAILABLE)}
                              className="flex-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                            >
                              ✓ Marcar Disponível
                            </button>
                          )}
                          {lot.status !== LotStatus.RESERVED && (
                            <button
                              onClick={() => handleChangeStatus(lot.id, LotStatus.RESERVED)}
                              className="flex-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
                            >
                              ⏸ Marcar Reservado
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeStatus(lot.id, LotStatus.SOLD)}
                            className="flex-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                          >
                            ✕ Marcar Vendido
                          </button>
                        </div>
                      )}
                      {lot.status === LotStatus.SOLD && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleChangeStatus(lot.id, LotStatus.AVAILABLE)}
                            className="flex-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors"
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
