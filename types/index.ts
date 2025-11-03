export interface Coordinate {
  x: number;
  y: number;
}

export interface LotArea {
  points: Coordinate[]; // Polígono definindo a área do lote
}

export enum LotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
}

export interface Lot {
  id: string;
  mapId: string;
  lotNumber: string;
  area: LotArea;
  status: LotStatus;
  price: number;
  size: number; // Área em m²
  description?: string;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Map {
  id: string;
  name: string;
  description?: string;
  imageUrl: string; // URL da imagem ou PDF convertido
  imageType: 'image' | 'pdf';
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequest {
  id: string;
  lotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCPF?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: Date;
}
