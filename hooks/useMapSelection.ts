import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Map, Lot, LotStatus, Block } from '@/types';
import { useRealtimeUpdates } from './useRealtimeUpdates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useMapSelection = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const selectedMapIdRef = useRef<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<Lot[]>([]); // Mudado para array
  const [viewingLot, setViewingLot] = useState<Lot | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Atualização automática a cada 3 segundos para sincronizar reservas e novos mapas
  useRealtimeUpdates(() => {
    console.log('🔄 Auto-refresh da página pública: recarregando mapas e lotes...');
    setRefreshKey(prev => prev + 1);
  }, 10000);

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
            await loadBlocksForMap(currentMapId);
          } else if (allMaps.length > 0) {
            // Não há mapa selecionado OU o mapa não existe mais: selecionar o primeiro
            const firstMap = allMaps[0];
            console.log(`🎯 [Página Pública] Selecionando primeiro mapa: ${firstMap.id} - ${firstMap.name}`);
            setSelectedMap(firstMap);
            selectedMapIdRef.current = firstMap.id;
            await loadBlocksForMap(firstMap.id);
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

  // Função para carregar quadras de um mapa específico
  const loadBlocksForMap = async (mapId: string) => {
    setIsLoadingBlocks(true);
    try {
      console.log(`📦 [Página Pública] Buscando quadras do mapa ${mapId}...`);
      const response = await axios.get(`${API_URL}/mapas/quadras`, {
        params: { mapId },
        timeout: 10000,
      });

      console.log('📦 [Página Pública] Resposta da API /mapas/quadras:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const blocksData = response.data.map((block: any) => ({
          id: block.id,
          mapId: block.mapId,
          name: block.name,
          description: block.description || '',
          createdAt: new Date(block.createdAt),
          updatedAt: new Date(block.updatedAt),
        }));

        console.log(`✅ [Página Pública] ${blocksData.length} quadras carregadas para o mapa ${mapId}`);
        setBlocks(blocksData);
        
        // Selecionar primeira quadra automaticamente
        if (blocksData.length > 0) {
          const firstBlock = blocksData[0];
          setSelectedBlock(firstBlock);
          await loadLotsForBlock(mapId, firstBlock.id);
        }
      } else {
        console.log('📭 [Página Pública] Nenhuma quadra encontrada para o mapa', mapId);
        setBlocks([]);
        setSelectedBlock(null);
        setLots([]);
      }
    } catch (error) {
      console.error('❌ [Página Pública] Erro ao carregar quadras do mapa:', error);
      setBlocks([]);
      setSelectedBlock(null);
      setLots([]);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  // Função para carregar lotes de uma quadra específica
  const loadLotsForBlock = async (mapId: string, blockId: string) => {
    setIsLoadingLots(true);
    try {
      console.log(`📦 [Página Pública] Buscando lotes do mapa ${mapId}, quadra ${blockId}...`);
      const response = await axios.get(`${API_URL}/mapas/lotes`, {
        params: { mapId, blockId },
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

      // A API agora retorna um array direto de lotes
      if (Array.isArray(response.data) && response.data.length > 0) {
        const lotsData = response.data.map((lot: any) => ({
          id: lot.id?.toString() || '',
          mapId: lot.map_id?.toString() || mapId,
          blockId: lot.block_id?.toString() || blockId,
          lotNumber: lot.lot_number || '',
          status: lot.status as LotStatus || LotStatus.AVAILABLE,
          price: parseFloat(lot.price) || 0,
          size: parseFloat(lot.size) || 0,
          description: lot.description || '',
          features: lot.features ? (typeof lot.features === 'string' ? JSON.parse(lot.features) : lot.features) : [],
          createdAt: new Date(lot.created_at),
          updatedAt: new Date(lot.updated_at),
        }));

        console.log(`✅ [Página Pública] ${lotsData.length} lotes carregados para a quadra ${blockId}`);
        setLots(lotsData);
      } else {
        console.log('📭 [Página Pública] Nenhum lote encontrado para a quadra', blockId);
        setLots([]);
      }
    } catch (error) {
      console.error('❌ [Página Pública] Erro ao carregar lotes da quadra:', error);
      setLots([]);
    } finally {
      setIsLoadingLots(false);
    }
  };

  const handleLotClick = useCallback((lot: Lot) => {
    // Sempre abre o modal de visualização ao clicar
    setViewingLot(lot);
  }, []);

  const handleToggleLotSelection = useCallback((lot: Lot) => {
    // Toggle seleção: adiciona ou remove o lote da lista
    if (lot.status !== LotStatus.AVAILABLE) return;

    setSelectedLots(prev => {
      const isAlreadySelected = prev.some(l => l.id === lot.id);
      if (isAlreadySelected) {
        return prev.filter(l => l.id !== lot.id);
      } else {
        return [...prev, lot];
      }
    });
  }, []);

  const handleOpenPurchaseModal = useCallback(() => {
    if (selectedLots.length > 0) {
      setShowPurchaseModal(true);
    } else {
      alert('Selecione pelo menos um lote disponível antes de enviar a reserva.');
    }
  }, [selectedLots]);

  const handlePurchaseSuccess = useCallback(() => {
    setShowPurchaseModal(false);
    setRefreshKey((prev) => prev + 1);
    alert(`${selectedLots.length === 1 ? 'Seu interesse foi registrado' : 'Seus interesses foram registrados'} com sucesso! ${selectedLots.length === 1 ? 'O lote foi reservado' : 'Os lotes foram reservados'}. Entraremos em contato em breve.`);
    setSelectedLots([]);
  }, [selectedLots.length]);

  const handlePurchaseClose = useCallback(() => {
    setShowPurchaseModal(false);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLots([]);
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
        await loadBlocksForMap(mapId);
      } else {
        setBlocks([]);
        setSelectedBlock(null);
        setLots([]);
      }
    },
    [maps]
  );

  const selectBlock = useCallback(
    async (blockId: string) => {
      console.log(`Selecionando quadra ${blockId}...`);
      const block = blocks.find((b: Block) => b.id === blockId);
      setSelectedBlock(block || null);

      if (block && selectedMap) {
        await loadLotsForBlock(selectedMap.id, blockId);
      } else {
        setLots([]);
      }
    },
    [blocks, selectedMap]
  );

  return {
    maps,
    blocks,
    selectedBlock,
    lots,
    selectedMap,
    selectedLots, // Mudado de selectedLot para selectedLots
    viewingLot,
    showPurchaseModal,
    isLoading,
    isLoadingBlocks,
    isLoadingLots,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handleToggleLotSelection, // Nova função para adicionar/remover lote da seleção
    handleOpenPurchaseModal, // Nova função para abrir modal
    handleClearSelection, // Nova função para limpar seleção
    handlePurchaseSuccess,
    handlePurchaseClose,
    handleViewClose,
    selectMap,
    selectBlock,
    isLotSelected: (lotId: string) => selectedLots.some(l => l.id === lotId), // Helper para verificar se lote está selecionado
  };
};
