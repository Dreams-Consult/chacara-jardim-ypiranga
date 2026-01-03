# API de Quadras - Documentação

## Visão Geral

A API de Quadras permite organizar os lotes de um mapa em blocos/quadras. Cada mapa pode ter várias quadras, e cada quadra pode conter vários lotes.

## Estrutura de Dados

### Block (Quadra)

```typescript
interface Block {
  id: string;          // ID único da quadra (timestamp)
  mapId: string;       // ID do mapa que contém a quadra
  name: string;        // Nome da quadra (ex: "Quadra A", "Setor 1")
  description?: string; // Descrição opcional
  createdAt: Date;     // Data de criação
  updatedAt: Date;     // Data da última atualização
}
```

### Lot (Lote) - Atualizado

```typescript
interface Lot {
  id: string;
  mapId: string;
  blockId?: string;    // ID da quadra (opcional)
  blockName?: string;  // Nome da quadra (opcional, para exibição)
  lotNumber: string;
  status: LotStatus;
  price: number;
  pricePerM2?: number;
  size: number;
  description?: string;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Endpoints

### 1. Listar Quadras de um Mapa

**GET** `/api/mapas/quadras`

Retorna todas as quadras de um mapa específico.

#### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| mapId     | string | Sim         | ID do mapa                   |

#### Exemplo de Request

```bash
GET /api/mapas/quadras?mapId=1762192028364
```

#### Response - Success (200)

```json
[
  {
    "id": "1730678400000",
    "mapId": "1762192028364",
    "name": "Quadra A",
    "description": "Quadra próxima à entrada principal",
    "createdAt": "2024-11-03T10:00:00.000Z",
    "updatedAt": "2024-11-03T10:00:00.000Z"
  },
  {
    "id": "1730678400001",
    "mapId": "1762192028364",
    "name": "Quadra B",
    "description": "Quadra com vista para o lago",
    "createdAt": "2024-11-03T10:05:00.000Z",
    "updatedAt": "2024-11-03T10:05:00.000Z"
  }
]
```

#### Response - Error (400)

```json
{
  "error": "mapId é obrigatório"
}
```

---

### 2. Criar Nova Quadra

**POST** `/api/mapas/quadras/criar`

Cria uma nova quadra em um mapa.

#### Request Body

```json
{
  "id": "1730678400000",
  "mapId": "1762192028364",
  "name": "Quadra A",
  "description": "Quadra próxima à entrada principal",
  "createdAt": "2024-11-03T10:00:00.000Z",
  "updatedAt": "2024-11-03T10:00:00.000Z"
}
```

#### Campos Obrigatórios

- `id`: ID único da quadra (usar timestamp)
- `mapId`: ID do mapa
- `name`: Nome da quadra
- `createdAt`: Data de criação (ISO 8601)
- `updatedAt`: Data de atualização (ISO 8601)

#### Exemplo de Request

```bash
curl -X POST http://localhost:3001/api/mapas/quadras/criar \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1730678400000",
    "mapId": "1762192028364",
    "name": "Quadra A",
    "description": "Quadra próxima à entrada principal",
    "createdAt": "2024-11-03T10:00:00.000Z",
    "updatedAt": "2024-11-03T10:00:00.000Z"
  }'
```

#### Response - Success (201)

```json
{
  "success": true,
  "message": "Quadra criada com sucesso",
  "blockId": "1730678400000"
}
```

#### Response - Error (400)

```json
{
  "success": false,
  "message": "Nome da quadra é obrigatório",
  "error": "MISSING_REQUIRED_FIELDS"
}
```

---

### 3. Atualizar Quadra

**PATCH** `/api/mapas/quadras`

Atualiza os dados de uma quadra existente.

#### Request Body

```json
{
  "id": "1730678400000",
  "mapId": "1762192028364",
  "name": "Quadra A - Atualizada",
  "description": "Nova descrição da quadra",
  "createdAt": "2024-11-03T10:00:00.000Z",
  "updatedAt": "2024-11-03T14:30:00.000Z"
}
```

#### Campos Obrigatórios

- `id`: ID da quadra a ser atualizada
- `mapId`: ID do mapa
- `name`: Nome atualizado
- `updatedAt`: Nova data de atualização

#### Exemplo de Request

```bash
curl -X PATCH http://localhost:3001/api/mapas/quadras \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1730678400000",
    "mapId": "1762192028364",
    "name": "Quadra A - Atualizada",
    "description": "Nova descrição",
    "updatedAt": "2024-11-03T14:30:00.000Z"
  }'
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "Quadra atualizada com sucesso"
}
```

#### Response - Error (404)

```json
{
  "success": false,
  "message": "Quadra não encontrada",
  "error": "NOT_FOUND"
}
```

---

### 4. Deletar Quadra

**DELETE** `/api/mapas/quadras/deletar`

Deleta uma quadra. **Importante:** Não permite deletar quadras que possuem lotes associados.

#### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| blockId   | string | Sim         | ID da quadra a ser deletada  |

#### Exemplo de Request

```bash
DELETE /api/mapas/quadras/deletar?blockId=1730678400000
```

```bash
curl -X DELETE "http://localhost:3001/api/mapas/quadras/deletar?blockId=1730678400000"
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "Quadra deletada com sucesso"
}
```

#### Response - Error (409) - Quadra com Lotes

```json
{
  "success": false,
  "message": "Não é possível deletar quadra com lotes associados",
  "error": "HAS_LOTS",
  "lotCount": 15
}
```

#### Response - Error (404)

```json
{
  "success": false,
  "message": "Quadra não encontrada",
  "error": "NOT_FOUND"
}
```

---

## Integração com Lotes

### Atribuir Quadra a um Lote

Ao criar ou atualizar um lote, inclua o campo `blockId`:

```json
{
  "id": "1730678500000",
  "mapId": "1762192028364",
  "blockId": "1730678400000",
  "lotNumber": "A-01",
  "status": "available",
  "price": 50000,
  "size": 250,
  ...
}
```

### Listar Lotes de uma Quadra

Use o endpoint existente de lotes e filtre pelo `blockId` no frontend:

```javascript
const response = await axios.get(`${API_URL}/mapas/lotes`, {
  params: { mapId: '1762192028364' }
});

const lotsInBlock = response.data[0].lots.filter(
  lot => lot.blockId === '1730678400000'
);
```

---

## Validações de Negócio

### Criar Quadra

✅ **Permitido:**
- Nome da quadra pode ser repetido em mapas diferentes
- Descrição é opcional

❌ **Não Permitido:**
- Nome vazio
- mapId inválido ou inexistente

### Deletar Quadra

✅ **Permitido:**
- Deletar quadra sem lotes associados

❌ **Não Permitido:**
- Deletar quadra com lotes associados
- Para deletar, primeiro remova ou transfira os lotes

---

## Exemplo de Implementação Backend (n8n/Node.js)

### Listar Quadras

```sql
SELECT
  id,
  mapId,
  name,
  description,
  createdAt,
  updatedAt
FROM blocks
WHERE mapId = {{ $json.query.mapId }}
ORDER BY name ASC;
```

### Criar Quadra

```sql
INSERT INTO blocks (id, mapId, name, description, createdAt, updatedAt)
VALUES (
  {{ $json.body.id }},
  {{ $json.body.mapId }},
  {{ $json.body.name }},
  {{ $json.body.description }},
  {{ $json.body.createdAt }},
  {{ $json.body.updatedAt }}
);
```

### Atualizar Quadra

```sql
UPDATE blocks
SET
  name = {{ $json.body.name }},
  description = {{ $json.body.description }},
  updatedAt = {{ $json.body.updatedAt }}
WHERE id = {{ $json.body.id }};
```

### Deletar Quadra (com validação)

```sql
-- Primeiro, verificar se há lotes
SELECT COUNT(*) as lotCount
FROM lots
WHERE blockId = {{ $json.query.blockId }};

-- Se lotCount = 0, então deletar
DELETE FROM blocks
WHERE id = {{ $json.query.blockId }};
```

---

## Schema do Banco de Dados

### Tabela: blocks

```sql
CREATE TABLE blocks (
  id VARCHAR(50) PRIMARY KEY,
  mapId VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (mapId) REFERENCES maps(id) ON DELETE CASCADE,
  INDEX idx_mapId (mapId)
);
```

### Tabela: lots (atualizada)

```sql
ALTER TABLE lots
ADD COLUMN blockId VARCHAR(50),
ADD FOREIGN KEY (blockId) REFERENCES blocks(id) ON DELETE SET NULL;

CREATE INDEX idx_blockId ON lots(blockId);
```

**Importante:** Use `ON DELETE SET NULL` para que, se uma quadra for deletada (quando não houver lotes), os lotes que referenciam ela tenham o `blockId` definido como `NULL` em vez de serem deletados.

---

## Fluxo de Trabalho Recomendado

1. **Criar Mapa**
   - POST `/api/mapas/criar`

2. **Criar Quadras no Mapa**
   - POST `/api/mapas/quadras/criar` (Quadra A)
   - POST `/api/mapas/quadras/criar` (Quadra B)
   - POST `/api/mapas/quadras/criar` (Quadra C)

3. **Criar Lotes nas Quadras**
   - POST `/api/mapas/lotes/criar` com `blockId` da Quadra A
   - POST `/api/mapas/lotes/criar` com `blockId` da Quadra B
   - ...

4. **Gerenciar Lotes por Quadra**
   - Filtrar lotes por `blockId` no frontend
   - Permitir transferir lotes entre quadras (atualizar `blockId`)

5. **Reorganizar Estrutura**
   - Mover lotes entre quadras (PATCH lote com novo `blockId`)
   - Renomear quadras (PATCH quadra)
   - Deletar quadras vazias (DELETE quadra sem lotes)

---

## Boas Práticas

1. **Nomenclatura de Quadras:**
   - Use padrões consistentes: "Quadra A", "Quadra B", "Setor 1", "Setor 2"
   - Evite caracteres especiais no nome

2. **Organização:**
   - Crie quadras antes de criar lotes
   - Agrupe lotes logicamente em quadras
   - Use descrições para contextualizar localização

3. **Performance:**
   - Crie índices em `mapId` e `blockId`
   - Use paginação para mapas com muitas quadras

4. **Segurança:**
   - Valide permissões antes de deletar quadras
   - Apenas DEV e ADMIN podem gerenciar quadras
   - Vendedores não têm acesso ao gerenciamento

---

## Códigos de Status HTTP

- `200 OK` - Operação bem-sucedida
- `201 Created` - Quadra criada com sucesso
- `400 Bad Request` - Dados inválidos ou incompletos
- `404 Not Found` - Quadra não encontrada
- `409 Conflict` - Conflito (ex: tentar deletar quadra com lotes)
- `500 Internal Server Error` - Erro interno do servidor

---

## Observações de Migração

Se você já possui lotes cadastrados sem quadras:

1. Todos os lotes existentes terão `blockId = null`
2. Lotes sem quadra continuam funcionando normalmente
3. Você pode atribuir quadras aos lotes existentes posteriormente
4. O filtro "Todas as quadras" mostra lotes com e sem quadra

---

## Testes

### Testar Criação de Quadra

```bash
curl -X POST http://localhost:3001/api/mapas/quadras/criar \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$(date +%s)'000",
    "mapId": "1762192028364",
    "name": "Quadra Teste",
    "description": "Quadra para testes",
    "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "updatedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
```

### Testar Listagem

```bash
curl -X GET "http://localhost:3001/api/mapas/quadras?mapId=1762192028364"
```

### Testar Deleção

```bash
curl -X DELETE "http://localhost:3001/api/mapas/quadras/deletar?blockId=1730678400000"
```

---

## Próximos Passos

- [ ] Implementar endpoints no backend (n8n)
- [ ] Criar tabela `blocks` no banco de dados
- [ ] Adicionar coluna `blockId` na tabela `lots`
- [ ] Testar fluxo completo de CRUD de quadras
- [ ] Validar integridade referencial (ON DELETE SET NULL)
