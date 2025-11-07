import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Map, Lot, LotStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useMapSelection = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get(`${API_URL}/mapas`);
        const mapsData = response.data;

        if (mapsData.length > 0) {
          const firstMapData = mapsData[0];

          const map: Map = {
            id: firstMapData.mapId,
            name: `Mapa ${firstMapData.mapId}`,
            imageUrl: '',
            imageType: 'image',
            width: 800,
            height: 600,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setMaps([map]);
          setSelectedMap(map);

          const lotsWithMapId = firstMapData.lots.map((lot: Lot) => ({
            ...lot,
            mapId: firstMapData.mapId,
            createdAt: new Date(lot.createdAt),
            updatedAt: new Date(lot.updatedAt),
          }));

          setLots(lotsWithMapId);
        }
      } catch (error) {
        console.error('Erro ao buscar mapas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, [refreshKey]);

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

  const selectMap = useCallback((mapId: string) => {
    const map = maps.find((m) => m.id === mapId);
    setSelectedMap(map || null);
  }, [maps]);

  return {
    maps,
    lots,
    selectedMap,
    selectedLot,
    showPurchaseModal,
    isLoading,
    availableLotsCount,
    reservedLotsCount,
    soldLotsCount,
    handleLotClick,
    handlePurchaseSuccess,
    handlePurchaseClose,
    selectMap,
  };
};
