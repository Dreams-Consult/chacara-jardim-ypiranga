import { useCallback } from 'react';
import { Map } from '@/types';
import { getMaps, saveMap, deleteMap } from '@/lib/storage';

/**
 * Hook para gerenciar operações de mapas
 * Encapsula lógica de negócio relacionada a mapas
 */
export function useMapOperations() {
  const loadMaps = useCallback((): Map[] => {
    return getMaps();
  }, []);

  const createOrUpdateMap = useCallback((map: Map): void => {
    try {
      saveMap(map);
    } catch (error) {
      console.error('Erro ao salvar mapa:', error);
      throw error;
    }
  }, []);

  const removeMap = useCallback((mapId: string): boolean => {
    try {
      deleteMap(mapId);
      return true;
    } catch (error) {
      console.error('Erro ao deletar mapa:', error);
      return false;
    }
  }, []);

  return {
    loadMaps,
    createOrUpdateMap,
    removeMap,
  };
}
