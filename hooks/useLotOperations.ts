import { Lot, LotStatus } from '@/types';
import { saveLot, deleteLot } from '@/lib/storage';

/**
 * Hook customizado para operações CRUD de lotes
 * Encapsula toda a lógica de negócio relacionada a lotes
 */
export function useLotOperations(mapId: string) {
  /**
   * Cria ou atualiza um lote
   */
  const saveOrUpdateLot = (lot: Lot): boolean => {
    try {
      const lotToSave: Lot = {
        ...lot,
        updatedAt: new Date(),
      };

      saveLot(lotToSave);
      return true;
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      return false;
    }
  };

  /**
   * Remove um lote
   */
  const removeLot = (lotId: string): boolean => {
    try {
      deleteLot(lotId);
      return true;
    } catch (error) {
      console.error('Erro ao remover lote:', error);
      return false;
    }
  };

  /**
   * Cria um novo lote com valores padrão
   */
  const createNewLot = (): Lot => ({
    id: '', // ID será gerado pelo backend (autoincrement)
    mapId,
    lotNumber: '',
    status: LotStatus.AVAILABLE,
    price: 0,
    size: 0,
    description: '',
    features: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    saveOrUpdateLot,
    removeLot,
    createNewLot,
  };
}
