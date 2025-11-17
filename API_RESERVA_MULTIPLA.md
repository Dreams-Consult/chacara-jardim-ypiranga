# API - Reserva com Múltiplos Lotes

## 📋 Visão Geral

Este documento descreve a nova estrutura da API para suportar **uma única reserva contendo múltiplos lotes**.

### ⚠️ Mudança Importante

**ANTES:** Uma requisição = Uma reserva = Um lote
**AGORA:** Uma requisição = Uma reserva = Múltiplos lotes

---

## 🔄 Endpoint Atualizado

### `POST /mapas/lotes/reservar`

Cria uma nova reserva com um ou mais lotes.

---

## 📤 Estrutura da Requisição

### Formato Atualizado

```json
{
  "lots": [
    {
      "id": "uuid-lote-1",
      "mapId": "uuid-mapa",
      "lotNumber": "A-01",
      "area": {
        "points": [
          { "x": 100, "y": 200 },
          { "x": 150, "y": 250 }
        ]
      },
      "status": "reserved",
      "price": 50000,
      "size": 250,
      "description": "Lote com vista panorâmica",
      "features": ["Vista", "Arborizado"],
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": "uuid-lote-2",
      "mapId": "uuid-mapa",
      "lotNumber": "A-02",
      "area": {
        "points": [
          { "x": 200, "y": 300 },
          { "x": 250, "y": 350 }
        ]
      },
      "status": "reserved",
      "price": 45000,
      "size": 230,
      "description": "Lote próximo ao lago",
      "features": ["Plano", "Próximo à água"],
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "customer": {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "message": "Gostaria de reservar estes lotes adjacentes"
  },
  "seller": {
    "id": "uuid-vendedor",
    "name": "Maria Vendedora",
    "email": "maria@vendas.com",
    "phone": "(11) 91234-5678",
    "cpf": "987.654.321-00"
  },
  "purchaseRequest": {
    "lotIds": ["uuid-lote-1", "uuid-lote-2"],
    "status": "pending",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

---

## 🗄️ Estrutura de Dados

### Objeto Principal

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `lots` | Array | ✅ Sim | Array de lotes a serem reservados |
| `customer` | Object | ✅ Sim | Dados do cliente interessado |
| `seller` | Object | ✅ Sim | Dados do vendedor responsável |
| `purchaseRequest` | Object | ✅ Sim | Dados da solicitação de compra |

### Objeto `lots[]`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | ID único do lote |
| `mapId` | String (UUID) | ID do mapa ao qual o lote pertence |
| `lotNumber` | String | Número identificador do lote (ex: "A-01") |
| `area` | Object | Coordenadas da área desenhada no mapa |
| `status` | String | Status do lote ("reserved") |
| `price` | Number | Preço total do lote em reais |
| `size` | Number | Área do lote em m² |
| `description` | String | Descrição do lote |
| `features` | Array | Características do lote |
| `createdAt` | String (ISO) | Data de criação do lote |
| `updatedAt` | String (ISO) | Data de última atualização |

### Objeto `customer`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | String | ✅ Sim | Nome completo do cliente |
| `email` | String | ✅ Sim | E-mail do cliente |
| `phone` | String | ✅ Sim | Telefone no formato brasileiro |
| `cpf` | String | ✅ Sim | CPF formatado (xxx.xxx.xxx-xx) |
| `message` | String/null | ❌ Não | Mensagem adicional do cliente |

### Objeto `seller`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | String (UUID) | ✅ Sim | ID único do vendedor (do banco) |
| `name` | String | ✅ Sim | Nome completo do vendedor |
| `email` | String | ✅ Sim | E-mail do vendedor |
| `phone` | String | ✅ Sim | Telefone no formato brasileiro |
| `cpf` | String | ✅ Sim | CPF formatado (xxx.xxx.xxx-xx) |

### Objeto `purchaseRequest`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `lotIds` | Array<UUID> | ✅ Sim | Array com IDs de todos os lotes |
| `status` | String | ✅ Sim | Status da solicitação ("pending") |
| `createdAt` | String (ISO) | ✅ Sim | Data/hora da criação da solicitação |

---

## 📥 Estrutura da Resposta

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Reserva criada com sucesso para 2 lote(s)",
  "data": {
    "reservationId": "uuid-reserva",
    "lots": [
      {
        "lotId": "uuid-lote-1",
        "lotNumber": "A-01",
        "status": "reserved"
      },
      {
        "lotId": "uuid-lote-2",
        "lotNumber": "A-02",
        "status": "reserved"
      }
    ],
    "customer": {
      "id": "uuid-cliente",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "totalPrice": 95000,
    "totalArea": 480,
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

### Erro - Lote Indisponível (409 Conflict)

```json
{
  "success": false,
  "message": "Um ou mais lotes não estão disponíveis",
  "unavailableLots": ["A-02"],
  "error": "LOTS_UNAVAILABLE"
}
```

### Erro - Validação (400 Bad Request)

```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    "O campo 'lots' deve conter ao menos 1 lote",
    "CPF do cliente é inválido"
  ]
}
```

---

## 🎯 Lógica de Backend Esperada

### 1. Validação dos Dados

```javascript
// Validar requisição
if (!lots || !Array.isArray(lots) || lots.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Array 'lots' é obrigatório e deve conter ao menos 1 lote"
  });
}

// Validar cada lote
for (const lot of lots) {
  if (!lot.id || !lot.mapId || !lot.lotNumber) {
    return res.status(400).json({
      success: false,
      message: "Dados incompletos em um dos lotes"
    });
  }
}
```

### 2. Verificar Disponibilidade

```javascript
// Verificar se TODOS os lotes estão disponíveis
const unavailableLots = [];

for (const lot of lots) {
  const dbLot = await db.query(
    'SELECT status FROM lots WHERE id = ?',
    [lot.id]
  );

  if (dbLot.status !== 'available') {
    unavailableLots.push(lot.lotNumber);
  }
}

if (unavailableLots.length > 0) {
  return res.status(409).json({
    success: false,
    message: "Um ou mais lotes não estão disponíveis",
    unavailableLots
  });
}
```

### 3. Criar Reserva Única

```javascript
// Criar UMA reserva
const reservationId = generateUUID();

await db.transaction(async (trx) => {
  // 1. Inserir reserva principal
  await trx('reservations').insert({
    id: reservationId,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone,
    customer_cpf: customer.cpf,
    seller_id: seller.id,
    status: 'pending',
    total_price: lots.reduce((sum, lot) => sum + lot.price, 0),
    total_area: lots.reduce((sum, lot) => sum + lot.size, 0),
    created_at: new Date()
  });

  // 2. Associar TODOS os lotes à reserva
  for (const lot of lots) {
    await trx('reservation_lots').insert({
      reservation_id: reservationId,
      lot_id: lot.id,
      lot_number: lot.lotNumber,
      price: lot.price,
      size: lot.size
    });

    // 3. Atualizar status do lote para 'reserved'
    await trx('lots').where('id', lot.id).update({
      status: 'reserved',
      updated_at: new Date()
    });
  }
});
```

### 4. Estrutura de Tabelas Sugerida

```sql
-- Tabela de Reservas (uma reserva pode ter vários lotes)
CREATE TABLE reservations (
  id VARCHAR(36) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_cpf VARCHAR(14) NOT NULL,
  customer_message TEXT,
  seller_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  total_area DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Tabela de associação Reserva-Lotes (muitos para muitos)
CREATE TABLE reservation_lots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id VARCHAR(36) NOT NULL,
  lot_id VARCHAR(36) NOT NULL,
  lot_number VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reservation_lot (reservation_id, lot_id)
);

-- Tabela de Lotes (status atualizado quando reservado)
CREATE TABLE lots (
  id VARCHAR(36) PRIMARY KEY,
  map_id VARCHAR(36) NOT NULL,
  lot_number VARCHAR(20) NOT NULL,
  status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
  price DECIMAL(10,2) NOT NULL,
  size DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🧪 Exemplo de Teste

### Cenário: Reservar 2 lotes adjacentes

```javascript
const response = await fetch('http://localhost:3001/mapas/lotes/reservar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lots: [
      {
        id: 'lote-uuid-1',
        mapId: 'mapa-uuid',
        lotNumber: 'A-01',
        area: { points: [...] },
        status: 'reserved',
        price: 50000,
        size: 250,
        description: 'Lote 1',
        features: ['Vista'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'lote-uuid-2',
        mapId: 'mapa-uuid',
        lotNumber: 'A-02',
        area: { points: [...] },
        status: 'reserved',
        price: 45000,
        size: 230,
        description: 'Lote 2',
        features: ['Plano'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    customer: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      message: 'Quero lotes adjacentes'
    },
    seller: {
      id: 'vendedor-uuid',
      name: 'Maria',
      email: 'maria@vendas.com',
      phone: '(11) 91234-5678',
      cpf: '987.654.321-00'
    },
    purchaseRequest: {
      lotIds: ['lote-uuid-1', 'lote-uuid-2'],
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  })
});

// Resposta esperada
{
  "success": true,
  "message": "Reserva criada com sucesso para 2 lote(s)",
  "data": {
    "reservationId": "reserva-uuid",
    "lots": [
      { "lotId": "lote-uuid-1", "lotNumber": "A-01", "status": "reserved" },
      { "lotId": "lote-uuid-2", "lotNumber": "A-02", "status": "reserved" }
    ],
    "totalPrice": 95000,
    "totalArea": 480
  }
}
```

---

## ✅ Vantagens da Nova Estrutura

1. **Agrupamento Lógico**: Uma reserva = Uma intenção de compra (pode ter vários lotes)
2. **Melhor UX**: Cliente preenche formulário uma vez para múltiplos lotes
3. **Facilita Gestão**: Vendedor vê todas as reservas agrupadas por cliente
4. **Histórico Claro**: Mais fácil rastrear compras de múltiplos lotes
5. **Atomicidade**: Transação única garante consistência dos dados

---

## 🔄 Migração

### Se já existem reservas no formato antigo

```sql
-- Script para migrar reservas antigas (uma por lote)
-- para o novo formato (uma com múltiplos lotes)

-- 1. Identificar reservas do mesmo cliente criadas próximas
SELECT
  customer_email,
  customer_cpf,
  DATE(created_at) as reservation_date,
  COUNT(*) as total_lots,
  GROUP_CONCAT(id) as reservation_ids,
  GROUP_CONCAT(lot_id) as lot_ids,
  SUM(total_price) as combined_price,
  SUM(total_area) as combined_area
FROM old_reservations
GROUP BY customer_email, customer_cpf, DATE(created_at)
HAVING COUNT(*) > 1;

-- 2. Criar nova reserva unificada
-- 3. Associar todos os lotes
-- 4. Deletar reservas antigas
```

---

## 📞 Suporte

Em caso de dúvidas sobre a implementação, consulte:
- `hooks/usePurchaseForm.ts` (lógica do frontend)
- `components/PurchaseModal.tsx` (interface do usuário)
- `API_DOCUMENTATION.md` (documentação geral da API)

