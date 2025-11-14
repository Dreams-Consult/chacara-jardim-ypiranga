import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Map, Lot, LotStatus } from '@/types';
import { useRealtimeUpdates } from './useRealtimeUpdates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useMapSelection = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const selectedMapIdRef = useRef<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [viewingLot, setViewingLot] = useState<Lot | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Atualização automática a cada 3 segundos para sincronizar reservas e novos mapas
  useRealtimeUpdates(() => {
    console.log('🔄 Auto-refresh da página pública: recarregando mapas e lotes...');
    setRefreshKey(prev => prev + 1);
  }, 3000);

  // Buscar apenas informações dos mapas (sem lotes)
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        console.log('📍 [Página Pública] Buscando mapas da API... (refreshKey:', refreshKey, ')');
        const response = await axios.get(`${API_URL}/mapas`);
        const mapsData = response.data;
        console.log('✅ [Página Pública] Resposta da API /mapas:', mapsData);

        // Validar se mapsData é um array
        if (!Array.isArray(mapsData)) {
          console.warn('⚠️ [Página Pública] API não retornou array de mapas:', mapsData);
          setMaps([]);
          setLots([]);
          setSelectedMap(null);
          return;
        }

        if (mapsData.length > 0) {
          // Processar apenas os mapas (sem lotes)
          const allMaps: Map[] = mapsData
            .filter((mapData) => mapData && mapData.mapId)
            .map((mapData) => ({
              id: mapData.mapId,
              name: mapData.name || `Mapa ${mapData.mapId}`,
              imageUrl: mapData.imageUrl || '',
              imageType: mapData.imageType || 'image/png',
              width: mapData.width || 800,
              height: mapData.height || 600,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

          console.log(`✅ [Página Pública] ${allMaps.length} mapas carregados`);
          setMaps(allMaps);

          // Verificar se há um mapa selecionado válido
          const currentMapId = selectedMapIdRef.current;
          const currentMapExists = currentMapId &&
            allMaps.some(m => m.id === currentMapId);

          if (currentMapExists) {
            // Mapa selecionado ainda existe, manter seleção
            console.log(`📌 [Página Pública] Mantendo mapa selecionado: ${currentMapId}`);
            await loadLotsForMap(currentMapId);
          } else if (allMaps.length > 0) {
            // Não há mapa selecionado OU o mapa não existe mais: selecionar o primeiro
            const firstMap = allMaps[0];
            console.log(`🎯 [Página Pública] Selecionando primeiro mapa: ${firstMap.id} - ${firstMap.name}`);
            setSelectedMap(firstMap);
            selectedMapIdRef.current = firstMap.id;
            await loadLotsForMap(firstMap.id);
          }
        } else {
          console.log('📭 [Página Pública] Nenhum mapa retornado pela API');
          setMaps([]);
          setLots([]);
          setSelectedMap(null);
          selectedMapIdRef.current = null;
        }
      } catch (error) {
        console.error('Erro ao buscar mapas:', error);
        setMaps([]);
        setLots([]);
        setSelectedMap(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, [refreshKey]);

  // Função para carregar lotes de um mapa específico
  const loadLotsForMap = async (mapId: string) => {
    setIsLoadingLots(true);
    try {
      console.log(`📦 [Página Pública] Buscando lotes do mapa ${mapId}...`);
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId },
        timeout: 10000,
      });

      console.log('📦 [Página Pública] Resposta da API /mapas/lotes:', response.data);

      // Validar se a resposta é válida
      if (!response.data) {
        console.warn('⚠️ [Página Pública] API retornou resposta vazia para /mapas/lotes');
        setLots([]);
        setIsLoadingLots(false);
        return;
      }

      // API pode retornar array ou objeto único
      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      if (data && Array.isArray(data.lots)) {
        const lotsWithMapId = data.lots.map((lot: Lot) => ({
          ...lot,
          mapId: data.mapId || mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));

        console.log(`✅ [Página Pública] ${lotsWithMapId.length} lotes carregados para o mapa ${mapId}`);
        setLots(lotsWithMapId);
      } else {
        console.log('📭 [Página Pública] Nenhum lote encontrado para o mapa', mapId);
        setLots([]);
      }
    } catch (error) {
      console.error('❌ [Página Pública] Erro ao carregar lotes do mapa:', error);
      setLots([]);
    } finally {
      setIsLoadingLots(false);
    }
  };

  const handleLotClick = useCallback((lot: Lot) => {
    if (lot.status === LotStatus.AVAILABLE) {
      setSelectedLot(lot);
      setShowPurchaseModal(true);
    } else {
      // Lotes reservados ou vendidos abrem modal de visualização
      setViewingLot(lot);
    }
  }, []);

  const handlePurchaseSuccess = useCallback(() => {
    setShowPurchaseModal(false);
    setRefreshKey((prev) => prev + 1);
    alert('Seu interesse foi registrado com sucesso! O lote foi reservado. Entraremos em contato em breve.');
    setSelectedLot(null);
  }, []);

  const handlePurchaseClose = useCallback(() => {
    setShowPurchaseModal(false);
    setSelectedLot(null);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewingLot(null);
  }, []);

  const availableLotsCount = lots.filter((lot) => lot.status === LotStatus.AVAILABLE).length;
  const reservedLotsCount = lots.filter((lot) => lot.status === LotStatus.RESERVED).length;
  const soldLotsCount = lots.filter((lot) => lot.status === LotStatus.SOLD).length;

  const selectMap = useCallback(
    async (mapId: string) => {
      console.log(`Selecionando mapa ${mapId}...`);
      const map = maps.find((m) => m.id === mapId);
      setSelectedMap(map || null);
      selectedMapIdRef.current = map ? mapId : null;

      if (map) {
        await loadLotsForMap(mapId);
      } else {
        setLots([]);
      }
    },
    [maps]
  );

  return {
    maps,
    lots,
    selectedMap,
    selectedLot,
    viewingLot,
    showPurchaseModal,
    isLoading,
    isLoadingLots,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handlePurchaseSuccess,
    handlePurchaseClose,
    handleViewClose,
    selectMap,
  };
};
