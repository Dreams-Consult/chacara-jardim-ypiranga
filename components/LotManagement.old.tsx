'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Map, Lot, LotStatus, LotArea } from '@/types';
import { getMapById, getLotsByMapId, saveLot, deleteLot } from '@/lib/storage';
import InteractiveMap from '@/components/InteractiveMap';

export default function LotManagement() {
  const params = useParams();
  const router = useRouter();
  const mapId = params.mapId as string;

  const [map, setMap] = useState<Map | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>();

  useEffect(() => {
    const loadData = () => {
      const mapData = getMapById(mapId);
      if (mapData) {
        setMap(mapData);
        setLots(getLotsByMapId(mapId));
      }
    };
    loadData();
  }, [mapId]);

  const handleAreaDrawn = (area: LotArea) => {
    if (editingLot) {
      setEditingLot({ ...editingLot, area });
    }
  };

  const handleSaveLot = () => {
    if (!editingLot || !editingLot.lotNumber || editingLot.area.points.length < 3) {
      alert('Preencha todos os campos e desenhe a área do lote');
      return;
    }

    const lot: Lot = {
      ...editingLot,
      mapId,
      updatedAt: new Date(),
    };

    saveLot(lot);
    setLots(getLotsByMapId(mapId));
    setIsCreating(false);
    setEditingLot(null);
    setSelectedLotId(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
      deleteLot(id);
      setLots(getLotsByMapId(mapId));
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

  if (!map) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/maps')}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Voltar para Mapas
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{map.name}</h1>
            {map.description && <p className="text-gray-600">{map.description}</p>}
          </div>
          <button
            onClick={handleNewLot}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">
                {editingLot.area.points.length > 0 ? 'Editar' : 'Novo'} Lote
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Lote</label>
                  <input
                    type="text"
                    value={editingLot.lotNumber}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, lotNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: 01, A1, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Área (m²)</label>
                  <input
                    type="number"
                    value={editingLot.size}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, size: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    value={editingLot.price}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editingLot.status}
                    onChange={(e) =>
                      setEditingLot({
                        ...editingLot,
                        status: e.target.value as LotStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={LotStatus.AVAILABLE}>Disponível</option>
                    <option value={LotStatus.RESERVED}>Reservado</option>
                    <option value={LotStatus.SOLD}>Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={editingLot.description}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Descrição do lote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Água, Luz, Portaria"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {editingLot.area.points.length === 0
                      ? 'Clique no mapa para desenhar a área do lote'
                      : `${editingLot.area.points.length} pontos desenhados`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLot}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isCreating && (
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Lotes Cadastrados</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">Lote {lot.lotNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {lot.status === LotStatus.AVAILABLE
                            ? 'Disponível'
                            : lot.status === LotStatus.RESERVED
                            ? 'Reservado'
                            : 'Vendido'}
                        </p>
                      </div>
                      <span className="text-sm font-bold">
                        R$ {lot.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{lot.size}m²</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLot(lot)}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(lot.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
                {lots.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
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
