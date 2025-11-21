'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Map, Lot } from '@/types';
import InteractiveMap from '@/components/InteractiveMap';
import CinemaStyleLotSelector from '@/components/CinemaStyleLotSelector';
import PurchaseModal from '@/components/PurchaseModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function MapViewPage() {
  const params = useParams();
  const router = useRouter();
  const mapId = params.id as string;

  const [map, setMap] = useState<Map | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLots, setSelectedLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [lotsPerRow, setLotsPerRow] = useState(15);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId },
        timeout: 10000,
      });

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
          const lotsWithMapId = data.lots.map((lot: Lot) => ({
            ...lot,
            mapId: data.mapId || mapId,
            createdAt: new Date(lot.createdAt),
            updatedAt: new Date(lot.updatedAt),
          }));
          setLots(lotsWithMapId);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do mapa:', err);
      setError('Erro ao carregar o mapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      loadMapData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  const handleMultipleSelect = (lots: Lot[]) => {
    setSelectedLots(lots);
  };

  const handlePurchaseClick = () => {
    if (selectedLots.length === 0) {
      alert('Selecione pelo menos um lote para continuar.');
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    setIsPurchaseModalOpen(false);
    setSelectedLots([]);
    loadMapData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error || !map) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Mapa não encontrado'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{map.name}</h1>
          {map.description && (
            <p className="text-white/70">{map.description}</p>
          )}
        </div>

        {/* Visualização do Mapa (apenas visual com zoom/pan) */}
        {map.imageUrl && (
          <div className="mb-8 bg-[var(--card-bg)] rounded-xl p-6 shadow-[var(--shadow-md)]">
            <h2 className="text-white text-xl font-semibold mb-4">
              Visualização do Loteamento
            </h2>
            <div className="bg-white/5 rounded-lg p-4">
              <InteractiveMap
                imageUrl={map.imageUrl}
                lots={lots}
                selectedLotIds={selectedLots.map(l => l.id)}
                isEditMode={false}
              />
            </div>
            <p className="text-white/50 text-sm mt-2 text-center">
              Use os botões de zoom para ampliar/reduzir a visualização. Esta é apenas uma visualização - selecione os lotes abaixo.
            </p>
          </div>
        )}

        {/* Controles de visualização */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="text-white/80 text-sm">
              Lotes por linha:
            </label>
            <input
              type="range"
              min="8"
              max="20"
              value={lotsPerRow}
              onChange={(e) => setLotsPerRow(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-white font-medium">{lotsPerRow}</span>
          </div>
          <div className="text-white/80 text-sm">
            Total de lotes: <span className="font-bold text-white">{lots.length}</span>
          </div>
        </div>

        {/* Seletor de Lotes Estilo Cinema - IGUAL À IMAGEM DO CINEMA */}
        <div className="mb-8">
          <CinemaStyleLotSelector
            lots={lots}
            onMultipleSelect={handleMultipleSelect}
            selectedLotIds={selectedLots.map(l => l.id)}
            allowMultipleSelection={true}
            lotsPerRow={lotsPerRow}
          />
        </div>

        {/* Botão de Compra */}
        {selectedLots.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handlePurchaseClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Continuar com a Reserva ({selectedLots.length} {selectedLots.length === 1 ? 'lote' : 'lotes'})
            </button>
          </div>
        )}
      </div>

      {/* Modal de Compra */}
      {isPurchaseModalOpen && selectedLots.length > 0 && (
        <PurchaseModal
          lots={selectedLots}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
