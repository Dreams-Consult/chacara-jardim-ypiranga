# API de Reservas - Documentação

## Endpoint de Reserva de Lote

### POST `/api/reservations`

Endpoint para registrar o interesse de um cliente em um lote específico.

#### Headers
```
Content-Type: application/json
```

#### Request Body

```json
{
  "lot": {
    "id": "1730678400000",
    "mapId": "1762192028364",
    "lotNumber": "1",
    "area": {
      "points": [
        { "x": 100, "y": 100 },
        { "x": 200, "y": 100 },
        { "x": 200, "y": 200 },
        { "x": 100, "y": 200 }
      ]
    },
    "status": "available",
    "price": 50000,
    "size": 250,
    "description": "Lote com vista privilegiada",
    "features": ["Água", "Energia", "Vista para o lago"],
    "createdAt": "2024-11-03T10:00:00.000Z",
    "updatedAt": "2024-11-03T10:00:00.000Z"
  },
  "customer": {
    "name": "João da Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "message": "Gostaria de mais informações sobre o lote"
  },
  "purchaseRequest": {
    "id": "1730678400001",
    "lotId": "1730678400000",
    "status": "pending",
    "createdAt": "2024-11-03T14:30:00.000Z"
  }
}
```

#### Estrutura dos Dados

**lot** - Informações completas do lote
- `id` (string): ID único do lote
- `mapId` (string): ID do mapa que contém o lote
- `lotNumber` (string): Número/identificador do lote
- `area` (object): Área geográfica do lote
  - `points` (array): Array de coordenadas {x, y} que formam o polígono
- `status` (string): Status atual - "available" | "reserved" | "sold"
- `price` (number): Preço do lote em reais
- `size` (number): Área do lote em metros quadrados
- `description` (string, opcional): Descrição do lote
- `features` (array, opcional): Lista de características
- `createdAt` (string): Data de criação do lote (ISO 8601)
- `updatedAt` (string): Data da última atualização (ISO 8601)

**customer** - Dados do cliente interessado
- `name` (string, obrigatório): Nome completo do cliente
- `email` (string, obrigatório): Email para contato
- `phone` (string, obrigatório): Telefone para contato
- `cpf` (string, opcional): CPF do cliente
- `message` (string, opcional): Mensagem ou dúvida do cliente

**purchaseRequest** - Metadados da requisição
- `id` (string): ID único da requisição (timestamp)
- `lotId` (string): ID do lote (referência)
- `status` (string): Status da requisição - sempre "pending" no envio
- `createdAt` (string): Data/hora da requisição (ISO 8601)

#### Response - Success (200)

```json
{
  "success": true,
  "message": "Reserva registrada com sucesso",
  "data": {
    "reservationId": "1730678400001",
    "lotId": "1730678400000",
    "status": "pending"
  }
}
```

#### Response - Error (4xx, 5xx)

```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Código do erro"
}
```

#### Códigos de Status HTTP

- `200` - Reserva registrada com sucesso
- `400` - Dados inválidos ou incompletos
- `409` - Lote já está reservado ou vendido
- `500` - Erro interno do servidor

---

## Configuração

1. Defina a URL da API no arquivo `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. Para produção, configure a variável no GitHub Pages ou no seu servidor:
```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

---

## Exemplo de Implementação Backend (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();

router.post('/reservations', async (req, res) => {
  try {
    const { lot, customer, purchaseRequest } = req.body;

    // Validar dados
    if (!lot || !customer || !purchaseRequest) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos',
        error: 'MISSING_DATA'
      });
    }

    // Validar campos obrigatórios do cliente
    if (!customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e telefone são obrigatórios',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Verificar se lote já está reservado/vendido
    // const existingLot = await db.lots.findById(lot.id);
    // if (existingLot.status !== 'available') {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Lote não está mais disponível',
    //     error: 'LOT_UNAVAILABLE'
    //   });
    // }

    // Salvar no banco de dados
    // await db.reservations.create({
    //   ...purchaseRequest,
    //   lot,
    //   customer
    // });

    // Atualizar status do lote
    // await db.lots.update(lot.id, { status: 'reserved' });

    // Enviar email de notificação (opcional)
    // await sendEmail({
    //   to: customer.email,
    //   subject: 'Interesse registrado - Lote ' + lot.lotNumber,
    //   body: '...'
    // });

    return res.status(200).json({
      success: true,
      message: 'Reserva registrada com sucesso',
      data: {
        reservationId: purchaseRequest.id,
        lotId: lot.id,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Erro ao processar reserva:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
```

---

## Testando a API

### Com cURL

```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "lot": {
      "id": "1730678400000",
      "mapId": "1762192028364",
      "lotNumber": "1",
      "area": {
        "points": [
          {"x": 100, "y": 100},
          {"x": 200, "y": 100},
          {"x": 200, "y": 200},
          {"x": 100, "y": 200}
        ]
      },
      "status": "available",
      "price": 50000,
      "size": 250,
      "createdAt": "2024-11-03T10:00:00.000Z",
      "updatedAt": "2024-11-03T10:00:00.000Z"
    },
    "customer": {
      "name": "João da Silva",
      "email": "joao@example.com",
      "phone": "(11) 98765-4321"
    },
    "purchaseRequest": {
      "id": "1730678400001",
      "lotId": "1730678400000",
      "status": "pending",
      "createdAt": "2024-11-03T14:30:00.000Z"
    }
  }'
```

### Com Postman

1. Método: `POST`
2. URL: `http://localhost:3001/api/reservations`
3. Headers: `Content-Type: application/json`
4. Body: Copie o JSON de exemplo acima

---

## Endpoint de Validação de Lote

### GET `/api/lots/valido?idLote={loteId}`

Verifica se um lote está disponível para reserva antes de processar a compra.
Previne reservas duplicadas e garante que o lote está realmente disponível.

#### Query Parameters

| Parâmetro | Tipo   | Obrigatório | Descrição                    |
|-----------|--------|-------------|------------------------------|
| idLote    | string | Sim         | ID único do lote a verificar |

#### Exemplo de Request

```bash
GET /api/lots/valido?idLote=1730678400000
```

#### Response - Lote Disponível

```json
{
  "isAvailable": 1
}
```

#### Response - Lote Indisponível

```json
{
  "isAvailable": 0
}
```

#### Códigos de Status

- `200 OK` - Verificação realizada com sucesso
- `400 Bad Request` - Parâmetro idLote não fornecido
- `500 Internal Server Error` - Erro ao verificar disponibilidade

#### Exemplo com cURL

```bash
curl -X GET "http://localhost:3001/api/lots/valido?idLote=1730678400000"
```

#### Exemplo com JavaScript

```javascript
const checkLotAvailability = async (lotId) => {
  try {
    const response = await fetch(`/api/lots/valido?idLote=${lotId}`);
    const data = await response.json();

    if (data.isAvailable === 1) {
      console.log('✅ Lote disponível');
      return true;
    } else {
      console.log('❌ Lote não disponível');
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar lote:', error);
    return false;
  }
};

// Uso
const isAvailable = await checkLotAvailability('1730678400000');
```

#### Fluxo de Validação no Frontend

1. **Usuário preenche formulário de compra**
2. **Usuário clica em "Reservar"**
3. **Sistema valida CPFs (cliente + vendedor)**
4. **🔍 Sistema verifica disponibilidade do lote** ← NOVO
5. Se `isAvailable === 0`: Exibe erro e cancela
6. Se `isAvailable === 1`: Prossegue com a reserva
7. **Sistema envia dados para `/mapas/lotes/reservar`**

#### Backend (n8n) - Lógica de Validação

O backend deve verificar:

```sql
-- Verifica se o lote está disponível
SELECT
  CASE
    WHEN status = 'available' THEN 1
    ELSE 0
  END AS isAvailable
FROM lots
WHERE id = {loteId};
```

**Regras de negócio:**
- ✅ `status = 'available'` → `isAvailable: 1`
- ❌ `status = 'reserved'` → `isAvailable: 0`
- ❌ `status = 'sold'` → `isAvailable: 0`
- ❌ Lote não encontrado → `isAvailable: 0`

---

## Comportamento do Frontend

1. **Requisição bem-sucedida (200):**
   - Salva backup no localStorage
   - Atualiza status do lote para "RESERVED"
   - Fecha modal e exibe mensagem de sucesso

2. **Erro de conexão:**
   - Exibe mensagem: "Não foi possível conectar ao servidor"
   - Dados NÃO são salvos localmente (evita inconsistência)

3. **Erro da API (4xx, 5xx):**
   - Exibe mensagem de erro retornada pela API
   - Permite ao usuário tentar novamente

4. **Timeout (10 segundos):**
   - Exibe mensagem de timeout
   - Sugere verificar conexão

---

## Observações Importantes

⚠️ **Segurança:**
- Implemente autenticação e autorização na API
- Valide e sanitize todos os dados recebidos
- Use HTTPS em produção
- Implemente rate limiting para evitar spam

⚠️ **Backup Local:**
- Os dados são salvos no localStorage como backup
- Isso permite funcionar offline temporariamente
- Sincronize com a API quando possível

⚠️ **CORS:**
- Configure CORS no backend para aceitar requisições do frontend
```javascript
app.use(cors({
  origin: 'https://dreams-consult.github.io',
  methods: ['GET', 'POST']
}));
```
