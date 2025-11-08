import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Map, Lot, LotStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useMapSelection = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const selectedMapIdRef = useRef<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Buscar apenas informações dos mapas (sem lotes)
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        console.log('Buscando mapas da API...');
        const response = await axios.get(`${API_URL}/mapas`);
        const mapsData = response.data;
        console.log('Resposta da API /mapas:', mapsData);

        if (Array.isArray(mapsData) && mapsData.length > 0) {
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

          console.log(`${allMaps.length} mapas carregados`);
          setMaps(allMaps);

          // Se já existe um mapa selecionado (refresh após compra), manter o mesmo
          if (selectedMapIdRef.current) {
            console.log(`Mantendo mapa selecionado: ${selectedMapIdRef.current}`);
            // Recarregar apenas os lotes do mapa atual
            await loadLotsForMap(selectedMapIdRef.current);
          } else {
            // Primeira carga: selecionar o primeiro mapa
            if (allMaps.length > 0) {
              const firstMap = allMaps[0];
              setSelectedMap(firstMap);
              selectedMapIdRef.current = firstMap.id;
              await loadLotsForMap(firstMap.id);
            }
          }
        } else {
          console.log('Nenhum mapa retornado pela API');
          setMaps([]);
          setLots([]);
          setSelectedMap(null);
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
      console.log(`Buscando lotes do mapa ${mapId}...`);
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId },
        timeout: 10000,
      });

      const data = response.data[0]; // API retorna array, pegamos o primeiro elemento
      console.log('Resposta da API /mapas/lotes:', data);

      if (data && Array.isArray(data.lots)) {
        const lotsWithMapId = data.lots.map((lot: Lot) => ({
          ...lot,
          mapId: data.mapId || mapId,
          createdAt: new Date(lot.createdAt),
          updatedAt: new Date(lot.updatedAt),
        }));

        console.log(`${lotsWithMapId.length} lotes carregados para o mapa ${mapId}`);
        setLots(lotsWithMapId);
      } else {
        console.log('Nenhum lote encontrado para o mapa', mapId);
        setLots([]);
      }
    } catch (error) {
      console.error('Erro ao carregar lotes do mapa:', error);
      setLots([]);
    } finally {
      setIsLoadingLots(false);
    }
  };

  const handleLotClick = useCallback((lot: Lot) => {
    if (lot.status === LotStatus.AVAILABLE) {
      setSelectedLot(lot);
      setShowPurchaseModal(true);
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
    showPurchaseModal,
    isLoading,
    isLoadingLots,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handlePurchaseSuccess,
    handlePurchaseClose,
    selectMap,
  };
};
