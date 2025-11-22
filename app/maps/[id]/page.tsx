'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Map, Lot, Block } from '@/types';
import InteractiveMap from '@/components/InteractiveMap';
import CinemaStyleLotSelector from '@/components/CinemaStyleLotSelector';
import PurchaseModal from '@/components/PurchaseModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function MapViewPage() {
  const params = useParams();
  const router = useRouter();
  const mapId = params.id as string;

  const [map, setMap] = useState<Map | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLots, setSelectedLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLots, setLoadingLots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [lotsPerRow, setLotsPerRow] = useState(15);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados do mapa
      const mapResponse = await axios.get(`${API_URL}/mapas`, {
        timeout: 10000,
      });

      const mapData = mapResponse.data.find((m: any) => m.mapId === mapId || m.id === mapId);

      if (mapData) {
        const mapObj: Map = {
          id: mapData.mapId || mapData.id || mapId,
          name: mapData.name || `Mapa ${mapData.mapId || mapId}`,
          description: mapData.description || '',
          imageUrl: mapData.imageUrl || '',
          imageType: 'image',
          width: mapData.width || 800,
          height: mapData.height || 600,
          createdAt: mapData.createdAt ? new Date(mapData.createdAt) : new Date(),
          updatedAt: mapData.updatedAt ? new Date(mapData.updatedAt) : new Date(),
        };
        setMap(mapObj);

        // Carregar quadras do mapa
        const blocksResponse = await axios.get(`${API_URL}/mapas/quadras`, {
          params: { mapId },
          timeout: 10000,
        });

        if (Array.isArray(blocksResponse.data)) {
          const blocksData = blocksResponse.data.map((block: any) => ({
            id: block.id,
            mapId: block.mapId,
            name: block.name,
            description: block.description || '',
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt),
          }));
          setBlocks(blocksData);

          // Se houver quadras, selecionar a primeira automaticamente
          if (blocksData.length > 0) {
            setSelectedBlockId(blocksData[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do mapa:', err);
      setError('Erro ao carregar o mapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockLots = async (blockId: string) => {
    if (!blockId) return;

    try {
      setLoadingLots(true);
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId, blockId },
        timeout: 10000,
      });

      const data = response.data[0];
      if (data && data.lots && Array.isArray(data.lots)) {
        const lotsWithMapId = data.lots.map((lot: Lot) => ({
          ...lot,
          mapId: data.mapId || mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));
        setLots(lotsWithMapId);
      } else {
        setLots([]);
      }
    } catch (err) {
      console.error('Erro ao carregar lotes da quadra:', err);
      setLots([]);
    } finally {
      setLoadingLots(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      loadMapData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  useEffect(() => {
    if (selectedBlockId) {
      loadBlockLots(selectedBlockId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId]);

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
    if (selectedBlockId) {
      loadBlockLots(selectedBlockId);
    }
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

        {/* Seleção de Quadras */}
        {blocks.length > 0 && (
          <div className="mb-6 bg-[var(--card-bg)] rounded-xl p-6 shadow-[var(--shadow-md)]">
            <h2 className="text-white text-xl font-semibold mb-4">
              Selecione a Quadra
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => {
                    setSelectedBlockId(block.id);
                    setSelectedLots([]);
                  }}
                  className={`p-4 rounded-xl font-semibold transition-all ${
                    selectedBlockId === block.id
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-sm mb-1">Quadra</div>
                  <div className="text-lg font-bold">{block.name}</div>
                  {block.description && (
                    <div className="text-xs mt-1 opacity-80">{block.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {blocks.length === 0 && !loading && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-yellow-500 font-semibold">
              Nenhuma quadra cadastrada neste loteamento.
            </p>
          </div>
        )}

        {/* Controles de visualização */}
        {selectedBlockId && (
          <>
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
                {loadingLots ? (
                  <span className="flex items-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Carregando lotes...
                  </span>
                ) : (
                  <>
                    Total de lotes na quadra: <span className="font-bold text-white">{lots.length}</span>
                  </>
                )}
              </div>
            </div>

            {/* Seletor de Lotes Estilo Cinema */}
            {loadingLots ? (
              <div className="mb-8 bg-[var(--card-bg)] rounded-xl p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-white/70">Carregando lotes da quadra...</p>
              </div>
            ) : lots.length > 0 ? (
              <div className="mb-8">
                <CinemaStyleLotSelector
                  lots={lots}
                  onMultipleSelect={handleMultipleSelect}
                  selectedLotIds={selectedLots.map(l => l.id)}
                  allowMultipleSelection={true}
                  lotsPerRow={lotsPerRow}
                />
              </div>
            ) : (
              <div className="mb-8 bg-gray-800/50 rounded-xl p-12 text-center border-2 border-dashed border-gray-700">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-white/70 text-lg font-semibold mb-2">
                  Nenhum lote disponível nesta quadra
                </p>
                <p className="text-white/50 text-sm">
                  Selecione outra quadra acima para ver os lotes disponíveis
                </p>
              </div>
            )}
          </>
        )}

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
