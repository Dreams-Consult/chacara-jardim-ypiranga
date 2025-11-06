# Exemplo de Uso - Criar Mapa

## Como usar o componente CreateMapModal

### 1. Importar o componente

```typescript
import CreateMapModal from '@/components/CreateMapModal';
import { useState } from 'react';
```

### 2. Adicionar estado e handlers

```typescript
const [showCreateMapModal, setShowCreateMapModal] = useState(false);

const handleCreateMapSuccess = () => {
  // Recarregar lista de mapas
  fetchMaps();
  alert('Mapa criado com sucesso!');
};
```

### 3. Adicionar botão para abrir o modal

```tsx
<button
  onClick={() => setShowCreateMapModal(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Criar Novo Mapa
</button>
```

### 4. Renderizar o modal condicionalmente

```tsx
{showCreateMapModal && (
  <CreateMapModal
    onClose={() => setShowCreateMapModal(false)}
    onSuccess={handleCreateMapSuccess}
  />
)}
```

## Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import CreateMapModal from '@/components/CreateMapModal';

export default function AdminMapsPage() {
  const [showCreateMapModal, setShowCreateMapModal] = useState(false);
  const [maps, setMaps] = useState([]);

  const fetchMaps = async () => {
    // Lógica para buscar mapas da API
  };

  const handleCreateMapSuccess = () => {
    fetchMaps();
    alert('Mapa criado com sucesso!');
  };

  return (
    <div>
      <h1>Gerenciar Mapas</h1>

      <button
        onClick={() => setShowCreateMapModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + Criar Novo Mapa
      </button>

      {/* Lista de mapas aqui */}

      {showCreateMapModal && (
        <CreateMapModal
          onClose={() => setShowCreateMapModal(false)}
          onSuccess={handleCreateMapSuccess}
        />
      )}
    </div>
  );
}
```

## Formato da Requisição

Quando o usuário submete o formulário, o hook `useMapCreation` envia:

```typescript
POST /criarMapa
Content-Type: application/json

{
  "name": "Mapa Chácara Jardim Ypiranga",
  "description": "Loteamento principal",
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Resposta Esperada do Backend

```json
{
  "success": true,
  "message": "Mapa criado com sucesso",
  "data": {
    "mapId": "1699000000000"
  }
}
```

## Features

- ✅ Upload de imagem com preview
- ✅ Conversão automática para Base64
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de erros
- ✅ Loading state durante submissão
- ✅ Design responsivo
- ✅ Acessibilidade (ESC para fechar)
