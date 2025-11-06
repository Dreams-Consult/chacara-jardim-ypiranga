# Documentação da API - Requisições do Frontend

Este documento descreve as requisições HTTP que o frontend faz para a API backend.

## Configuração

Configure a URL base da API no arquivo `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5678/webhook-test/loteamento
```

## Endpoints Utilizados

### 1. Buscar Mapas e Lotes

**Endpoint:** `GET /mapas`

**Descrição:** Retorna a lista de todos os mapas/plantas de loteamento com seus respectivos lotes.

**Request:**
```typescript
const response = await axios.get(`${API_URL}/mapas`);
```

**Response Example:**
```json
[
  {
    "mapId": "1762192028364",
    "name": "Mapa Chácara Jardim Ypiranga",
    "description": "Loteamento residencial",
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "width": 1920,
    "height": 1080,
    "createdAt": "2025-11-06 14:00:00",
    "updatedAt": "2025-11-06 14:00:00",
    "lots": [
      {
        "id": "1",
        "lotNumber": "1",
        "status": "available",
        "price": 50000,
        "size": 250,
        "description": "Lote de exemplo 1",
        "features": [
          "Água encanada",
          "Energia elétrica"
        ],
        "area": {
          "points": [
            { "x": 100, "y": 100 },
            { "x": 200, "y": 100 },
            { "x": 200, "y": 200 },
            { "x": 100, "y": 200 }
          ]
        },
        "createdAt": "2025-11-06 14:11:57",
        "updatedAt": "2025-11-06 14:11:57"
      }
    ]
  }
]
```

**Observação:** A resposta inclui tanto os dados completos do mapa (nome, descrição, imageUrl, dimensões) quanto seus lotes. O frontend extrai essas informações e as processa separadamente.

**Campos do Mapa:**
- `mapId` ou `id`: ID único do mapa
- `name`: Nome do mapa (opcional, default: "Mapa {id}")
- `description`: Descrição do mapa (opcional)
- `imageUrl`: URL da imagem em Base64 (opcional)
- `width`: Largura da imagem em pixels (opcional, default: 800)
- `height`: Altura da imagem em pixels (opcional, default: 600)
- `createdAt`: Data de criação (ISO string)
- `updatedAt`: Data da última atualização (ISO string)
- `lots`: Array de lotes associados ao mapa

**Processamento no Frontend (Página Principal):**
```typescript
const response = await axios.get(`${API_URL}/mapas`);
const mapsData = response.data;

if (mapsData.length > 0) {
  const firstMapData = mapsData[0];

  // Criar objeto Map
  const map: Map = {
    id: firstMapData.mapId || firstMapData.id,
    name: firstMapData.name || `Mapa ${firstMapData.mapId}`,
    description: firstMapData.description || '',
    imageUrl: firstMapData.imageUrl || '',
    imageType: 'image',
    width: firstMapData.width || 800,
    height: firstMapData.height || 600,
    createdAt: firstMapData.createdAt ? new Date(firstMapData.createdAt) : new Date(),
    updatedAt: firstMapData.updatedAt ? new Date(firstMapData.updatedAt) : new Date(),
  };

  // Processar lotes
  const lotsWithMapId = firstMapData.lots.map((lot: Lot) => ({
    ...lot,
    mapId: firstMapData.mapId,
    createdAt: new Date(lot.createdAt),
    updatedAt: new Date(lot.updatedAt),
  }));

  setMaps([map]);
  setLots(lotsWithMapId);
}
```

**Processamento no Frontend (Gerenciamento de Mapas):**
```typescript
const response = await axios.get(`${API_URL}/mapas`);
const mapsData = response.data;

const processedMaps = mapsData.map((mapData: MapApiResponse) => ({
  id: mapData.mapId || mapData.id || '',
  name: mapData.name || `Mapa ${mapData.mapId || mapData.id}`,
  description: mapData.description || '',
  imageUrl: mapData.imageUrl || '',
  imageType: 'image' as const,
  width: mapData.width || 800,
  height: mapData.height || 600,
  createdAt: mapData.createdAt ? new Date(mapData.createdAt) : new Date(),
  updatedAt: mapData.updatedAt ? new Date(mapData.updatedAt) : new Date(),
}));

setMaps(processedMaps);
```

**Tipos TypeScript:**
```typescript
interface Map {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageType: 'image' | 'pdf';
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

enum LotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
}

interface Coordinate {
  x: number;
  y: number;
}

interface LotArea {
  points: Coordinate[];
}

interface Lot {
  id: string;
  mapId?: string;
  lotNumber: string;
  area: LotArea;
  status: LotStatus;
  price: number;
  size: number;
  description?: string;
  features?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

---

### 2. Criar Novo Mapa

**Endpoint:** `POST /criarMapa`

**Descrição:** Cria um novo mapa/planta de loteamento.

**Request Body:**
```typescript
{
  name: string;
  description: string;
  imageUrl: string; // Base64 data URI da imagem
}
```

**Request Example:**
```typescript
const requestData = {
  name: "Mapa Chácara Jardim Ypiranga",
  description: "Loteamento principal",
  imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
};

const response = await axios.post(`${API_URL}/criarMapa`, requestData, {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

**Response Example:**
```json
{
  "success": true,
  "message": "Mapa criado com sucesso",
  "data": {
    "mapId": "1699000000000"
  }
}
```

---

### 3. Deletar Mapa

**Endpoint:** `DELETE /deletarMapa/{id}`

**Descrição:** Deleta um mapa e todos os lotes associados.

**Request Example:**
```typescript
await axios.delete(`${API_URL}/deletarMapa/${mapId}`, {
  timeout: 10000,
});
```

**Response Example:**
```json
{
  "success": true,
  "message": "Mapa deletado com sucesso"
}
```

---

### 4. Criar Reserva de Lote

**Endpoint:** `POST /reservardb`

**Descrição:** Cria uma solicitação de reserva/compra de um lote.

**Request Body:**
```typescript
{
  lot: {
    id: string;
    mapId: string;
    lotNumber: string;
    area: LotArea;
    status: LotStatus;
    price: number;
    size: number;
    description?: string;
    features?: string[];
    createdAt: Date;
    updatedAt: Date;
  },
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string | null;
    message: string | null;
  },
  purchaseRequest: {
    id: string;
    lotId: string;
    status: string;
    createdAt: string;
  }
}
```

**Request Example:**
```typescript
const requestData = {
  lot: {
    id: lot.id,
    mapId: lot.mapId,
    lotNumber: lot.lotNumber,
    area: lot.area,
    status: lot.status,
    price: lot.price,
    size: lot.size,
    description: lot.description,
    features: lot.features,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt,
  },
  customer: {
    name: formData.customerName,
    email: formData.customerEmail,
    phone: formData.customerPhone,
    cpf: formData.customerCPF || null,
    message: formData.message || null,
  },
  purchaseRequest: {
    id: Date.now().toString(),
    lotId: lot.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
};

const response = await axios.post(`${API_URL}/reservardb`, requestData, {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

**Response Example:**
```json
{
  "success": true,
  "message": "Reserva criada com sucesso",
  "data": {
    "purchaseRequestId": "1699000000000"
  }
}
```

---

## Fluxo de Dados

### Ao Carregar a Página Principal

1. **Buscar Mapas e Lotes:**
   ```typescript
   useEffect(() => {
     const fetchMaps = async () => {
       try {
         const response = await axios.get(`${API_URL}/mapas`);
         const mapsData = response.data;

         if (mapsData.length > 0) {
           const firstMapData = mapsData[0];

           // Criar objeto Map
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

           // Processar lotes
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
       }
     };
     fetchMaps();
   }, [refreshKey]);
   ```

### Ao Manifestar Interesse em um Lote

1. **Usuário clica em um lote disponível**
2. **Modal de reserva é aberto**
3. **Usuário preenche formulário e submete**
4. **POST é enviado para `/reservardb`**
5. **Após sucesso, lotes são recarregados** (incrementando `refreshKey`)
6. **GET `/mapas` é chamado novamente com os dados atualizados**

---

## Tratamento de Erros

### Exemplo de Tratamento:

```typescript
try {
  const response = await axios.get(`${API_URL}/mapas`);
  setMaps(response.data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Erro do servidor:', error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor');
    } else {
      console.error('Erro ao configurar requisição:', error.message);
    }
  }
}
```

---

## Observações Importantes

1. **Timeout:** Requisições POST têm timeout de 10 segundos
2. **Refresh:** Após criar uma reserva, a lista de lotes é recarregada automaticamente
3. **Status:** O backend deve atualizar o status do lote para 'reserved' ao criar uma reserva
4. **Headers:** Todas as requisições POST usam `Content-Type: application/json`
5. **Imagens:** O upload de imagens é feito via Base64 data URI no campo `imageUrl`

---

## Resumo dos Endpoints

| Método | Endpoint | Descrição | Usado Para |
|--------|----------|-----------|------------|
| GET | `/mapas` | Retorna mapas com seus lotes | Carregar dados iniciais e refresh |
| POST | `/criarMapa` | Cria um novo mapa | Adicionar novo loteamento |
| DELETE | `/deletarMapa/{id}` | Deleta um mapa | Remover loteamento |
| POST | `/reservardb` | Cria reserva de lote | Manifestar interesse em lote |

## Exemplo Completo de Integração

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Buscar mapas e lotes
export const fetchMapsAndLots = async () => {
  const response = await axios.get(`${API_URL}/mapas`);
  return response.data;
};

// Criar novo mapa
export const createMap = async (data: { name: string; description: string; imageUrl: string }) => {
  const response = await axios.post(`${API_URL}/criarMapa`, data, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return response.data;
};

// Deletar mapa
export const deleteMap = async (mapId: string) => {
  const response = await axios.delete(`${API_URL}/deletarMapa/${mapId}`, {
    timeout: 10000,
  });
  return response.data;
};

// Criar reserva
export const createReservation = async (data: any) => {
  const response = await axios.post(`${API_URL}/reservardb`, data, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return response.data;
};
```
