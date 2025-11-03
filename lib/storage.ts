import { Map, Lot, PurchaseRequest } from '@/types';

const STORAGE_KEYS = {
  MAPS: 'lot_platform_maps',
  LOTS: 'lot_platform_lots',
  PURCHASES: 'lot_platform_purchases',
};

// Helper para serializar dados com datas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeData = (data: any) => {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
};

// Helper para desserializar dados com datas
const deserializeData = (jsonString: string) => {
  return JSON.parse(jsonString, (key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

// Maps
export const getMaps = (): Map[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.MAPS);
  return data ? deserializeData(data) : [];
};

export const saveMap = (map: Map): void => {
  if (typeof window === 'undefined') return;
  const maps = getMaps();
  const index = maps.findIndex((m) => m.id === map.id);
  if (index >= 0) {
    maps[index] = map;
  } else {
    maps.push(map);
  }
  
  try {
    const serializedData = serializeData(maps);
    localStorage.setItem(STORAGE_KEYS.MAPS, serializedData);
  } catch (error) {
    console.error('Erro ao salvar mapa:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Arquivo muito grande para o localStorage. Use uma imagem menor ou de menor qualidade.');
    }
    throw error;
  }
};

export const deleteMap = (id: string): void => {
  if (typeof window === 'undefined') return;
  const maps = getMaps().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MAPS, serializeData(maps));

  // Deletar lotes associados
  const lots = getLots().filter((l) => l.mapId !== id);
  localStorage.setItem(STORAGE_KEYS.LOTS, serializeData(lots));
};

export const getMapById = (id: string): Map | undefined => {
  return getMaps().find((m) => m.id === id);
};

// Lots
export const getLots = (): Lot[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.LOTS);
  return data ? deserializeData(data) : [];
};

export const getLotsByMapId = (mapId: string): Lot[] => {
  return getLots().filter((l) => l.mapId === mapId);
};

export const saveLot = (lot: Lot): void => {
  if (typeof window === 'undefined') return;
  const lots = getLots();
  const index = lots.findIndex((l) => l.id === lot.id);
  if (index >= 0) {
    lots[index] = lot;
  } else {
    lots.push(lot);
  }
  localStorage.setItem(STORAGE_KEYS.LOTS, serializeData(lots));
};

export const deleteLot = (id: string): void => {
  if (typeof window === 'undefined') return;
  const lots = getLots().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOTS, serializeData(lots));
};

export const getLotById = (id: string): Lot | undefined => {
  return getLots().find((l) => l.id === id);
};

// Purchase Requests
export const getPurchaseRequests = (): PurchaseRequest[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  return data ? deserializeData(data) : [];
};

export const savePurchaseRequest = (purchase: PurchaseRequest): void => {
  if (typeof window === 'undefined') return;
  const purchases = getPurchaseRequests();
  purchases.push(purchase);
  localStorage.setItem(STORAGE_KEYS.PURCHASES, serializeData(purchases));
};

export const updatePurchaseRequestStatus = (
  id: string,
  status: PurchaseRequest['status']
): void => {
  if (typeof window === 'undefined') return;
  const purchases = getPurchaseRequests();
  const index = purchases.findIndex((p) => p.id === id);
  if (index >= 0) {
    purchases[index].status = status;
    localStorage.setItem(STORAGE_KEYS.PURCHASES, serializeData(purchases));
  }
};
