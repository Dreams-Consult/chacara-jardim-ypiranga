'use client';

import React, { useState, useEffect } from 'react';
import { Map, Lot, LotStatus } from '@/types';
import { getMaps, getLots } from '@/lib/storage';
import InteractiveMap from '@/components/InteractiveMap';
import PurchaseModal from '@/components/PurchaseModal';

export default function PublicMapPage() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const mapsData = getMaps();
    setMaps(mapsData);
    if (mapsData.length > 0) {
      setSelectedMap(mapsData[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedMap) {
      const lotsData = getLots().filter((lot) => lot.mapId === selectedMap.id);
      setLots(lotsData);
    }
  }, [selectedMap]);

  const handleLotClick = (lot: Lot) => {
    if (lot.status === LotStatus.AVAILABLE) {
      setSelectedLot(lot);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    alert('Seu interesse foi registrado com sucesso! Entraremos em contato em breve.');
    setSelectedLot(null);
  };

  const availableLotsCount = lots.filter((lot) => lot.status === LotStatus.AVAILABLE).length;
  const reservedLotsCount = lots.filter((lot) => lot.status === LotStatus.RESERVED).length;
  const soldLotsCount = lots.filter((lot) => lot.status === LotStatus.SOLD).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Chácara Jardim Ypiranga</h1>
          <p className="text-gray-600 mt-2">
            Encontre o lote perfeito para você. Clique nos lotes disponíveis para mais informações.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {maps.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Selecione o Mapa</label>
            <select
              value={selectedMap?.id || ''}
              onChange={(e) => {
                const map = maps.find((m) => m.id === e.target.value);
                setSelectedMap(map || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
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
              <div className="bg-white rounded-lg shadow-md p-4">
                <InteractiveMap
                  imageUrl={selectedMap.imageUrl}
                  lots={lots}
                  onLotClick={handleLotClick}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Disponíveis</span>
                    </div>
                    <span className="font-bold">{availableLotsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Reservados</span>
                    </div>
                    <span className="font-bold">{reservedLotsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Vendidos</span>
                    </div>
                    <span className="font-bold">{soldLotsCount}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className="font-bold">{lots.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Legenda</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded opacity-50"></div>
                    <span className="text-sm">Disponível para compra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded opacity-50"></div>
                    <span className="text-sm">Reservado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded opacity-50"></div>
                    <span className="text-sm">Vendido</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Passe o mouse sobre os lotes para ver informações. Clique nos lotes disponíveis para manifestar interesse.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Contato</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> contato@chacaraypiranga.com
                  </p>
                  <p>
                    <strong>Telefone:</strong> (00) 0000-0000
                  </p>
                  <p className="text-gray-600 mt-4">
                    Entre em contato para mais informações sobre os lotes disponíveis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {maps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum mapa disponível no momento.</p>
          </div>
        )}
      </div>

      {showPurchaseModal && selectedLot && (
        <PurchaseModal
          lot={selectedLot}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedLot(null);
          }}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
