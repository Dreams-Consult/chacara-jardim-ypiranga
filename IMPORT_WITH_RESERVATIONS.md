# Importação de Loteamentos com Reservas

## Visão Geral

O sistema de importação agora suporta a criação automática de **reservas e vendas** durante a importação do JSON. Isso permite importar loteamentos com lotes que já possuem status de reservado, vendido ou bloqueado.

## Estrutura JSON Completa

### Exemplo com Todos os Status

```json
{
  "name": "Loteamento Exemplo",
  "imageUrl": "",
  "imageType": "image/png",
  "width": 800,
  "height": 600,
  "blocks": [
    {
      "name": "Quadra A",
      "description": "Primeira quadra do loteamento",
      "lots": [
        {
          "lotNumber": "01",
          "status": "available",
          "price": 50000,
          "size": 300,
          "description": "Lote disponível",
          "features": ["Esquina", "Frente norte"]
        },
        {
          "lotNumber": "02",
          "status": "reserved",
          "price": 45000,
          "size": 250,
          "description": "Lote reservado",
          "features": ["Frente sul"],
          "reservation": {
            "customer_name": "João Silva",
            "customer_email": "joao.silva@email.com",
            "customer_phone": "(11) 98765-4321",
            "customer_cpf": "12345678900",
            "payment_method": "financing",
            "status": "approved",
            "seller_name": "Maria Vendedora",
            "seller_email": "maria.vendedora@empresa.com",
            "seller_phone": "11987654321",
            "seller_cpf": "98765432100"
          }
        },
        {
          "lotNumber": "03",
          "status": "sold",
          "price": 48000,
          "size": 260,
          "description": "Lote vendido",
          "features": ["Meio de quadra"],
          "reservation": {
            "customer_name": "Maria Santos",
            "customer_email": "maria.santos@email.com",
            "customer_phone": "(11) 91234-5678",
            "customer_cpf": "98765432100",
            "payment_method": "cash",
            "status": "completed",
            "seller_name": "Pedro Corretor",
            "seller_email": "pedro.corretor@empresa.com",
            "seller_phone": "11912345678",
            "seller_cpf": "12312312300"
          }
        },
        {
          "lotNumber": "04",
          "status": "blocked",
          "price": 47000,
          "size": 240,
          "description": "Lote bloqueado para manutenção",
          "features": []
        }
      ]
    }
  ]
}
```

## Status dos Lotes

### 1. `available` (Disponível)
- Lote disponível para venda
- **Não requer** dados de reserva
- Exemplo:
```json
{
  "lotNumber": "01",
  "status": "available",
  "price": 50000,
  "size": 300
}
```

### 2. `reserved` (Reservado)
- Lote reservado por um cliente
- **Requer** objeto `reservation` completo
- Cria automaticamente:
  - Registro na tabela `purchase_requests`
  - Registro na tabela `purchase_request_lots`
- Exemplo:
```json
{
  "lotNumber": "02",
  "status": "reserved",
  "price": 45000,
  "size": 250,
  "reservation": {
    "customer_name": "João Silva",
    "customer_email": "joao.silva@email.com",
    "customer_phone": "(11) 98765-4321",
    "customer_cpf": "12345678900",
    "payment_method": "financing",
    "status": "approved",
    "seller_name": "Maria Vendedora",
    "seller_email": "maria.vendedora@empresa.com",
    "seller_phone": "11987654321",
    "seller_cpf": "98765432100"
  }
}
```

### 3. `sold` (Vendido)
- Lote vendido
- **Requer** objeto `reservation` completo
- Cria automaticamente:
  - Registro na tabela `purchase_requests`
  - Registro na tabela `purchase_request_lots`
- Exemplo:
```json
{
  "lotNumber": "03",
  "status": "sold",
  "price": 48000,
  "size": 260,
  "reservation": {
    "customer_name": "Maria Santos",
    "customer_email": "maria.santos@email.com",
    "customer_phone": "(11) 91234-5678",
    "payment_method": "cash",
    "status": "completed",
    "seller_name": "Pedro Corretor",
    "seller_email": "pedro.corretor@empresa.com",
    "seller_phone": "11912345678",
    "seller_cpf": "12312312300"
  }
}
```

### 4. `blocked` (Bloqueado)
- Lote bloqueado/indisponível
- **Não requer** dados de reserva
- Usado para lotes em manutenção, irregular, etc.
- Exemplo:
```json
{
  "lotNumber": "04",
  "status": "blocked",
  "price": 47000,
  "size": 240,
  "description": "Lote bloqueado para manutenção"
}
```

## Objeto Reservation (Reserva)

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `customer_name` | string | Nome completo do cliente |
| `customer_email` | string | Email do cliente |
| `customer_phone` | string | Telefone do cliente |

### Campos Opcionais

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `customer_cpf` | string | - | CPF do cliente (somente números: 12345678900) |
| `payment_method` | string | `cash`, `financing`, `installments` | Método de pagamento (padrão: `cash`) |
| `status` | string | `pending`, `approved`, `rejected`, `completed`, `cancelled` | Status da reserva (padrão: `pending`) |
| `seller_name` | string | - | Nome do vendedor/corretor responsável |
| `seller_email` | string | - | Email do vendedor/corretor |
| `seller_phone` | string | - | Telefone do vendedor (somente números: 11987654321) |
| `seller_cpf` | string | - | CPF do vendedor (somente números: 12345678900) |

**Observação**: Se os campos do vendedor não forem fornecidos, o sistema usará valores padrão:
- `seller_name`: "Sistema de Importação"
- `seller_email`: "importacao@sistema.com"
- `seller_phone`: "00000000000"
- `seller_cpf`: "00000000000"

### Status da Reserva

1. **`pending`** (Pendente): Aguardando análise/aprovação
2. **`approved`** (Aprovado): Reserva aprovada
3. **`rejected`** (Rejeitado): Reserva rejeitada
4. **`completed`** (Concluído): Venda finalizada
5. **`cancelled`** (Cancelado): Reserva cancelada

### Métodos de Pagamento

1. **`cash`** (À vista): Pagamento integral
2. **`financing`** (Financiamento): Financiamento bancário
3. **`installments`** (Parcelamento): Parcelamento direto

## Validações

### Durante a Importação

O sistema valida:

1. **Campos obrigatórios do lote**: `lotNumber`, `price`, `size`
2. **Dados de reserva**: Se o lote tem status `reserved` ou `sold`, o objeto `reservation` é obrigatório
3. **Campos obrigatórios da reserva**: `customer_name`, `customer_email`, `customer_phone`

### Mensagens de Erro

```
❌ "Lote X (reserved) requer customer_name, customer_email e customer_phone na reserva"
```
- Solução: Adicionar todos os campos obrigatórios no objeto `reservation`

```
❌ "Dados de reserva incompletos"
```
- Solução: Verificar se todos os campos obrigatórios estão preenchidos

## Banco de Dados

### Tabelas Afetadas

1. **`maps`**: Armazena o loteamento principal
2. **`blocks`**: Armazena as quadras
3. **`lots`**: Armazena os lotes com seus status
4. **`purchase_requests`**: Armazena as reservas/vendas
5. **`purchase_request_lots`**: Relaciona reservas com múltiplos lotes

### Estrutura de Reserva

```sql
-- Exemplo de registro criado automaticamente
INSERT INTO purchase_requests (
  lot_id,
  map_id,
  customer_name,
  customer_email,
  customer_phone,
  customer_cpf,
  customer_address,
  payment_method,
  status,
  notes
) VALUES (
  '1732288123456abc',
  '1732288123456',
  'João Silva',
  'joao.silva@email.com',
  '(11) 98765-4321',
  '123.456.789-00',
  'Rua Exemplo, 123',
  'financing',
  'approved',
  'Cliente aprovado para financiamento'
);

-- Relacionamento com o lote
INSERT INTO purchase_request_lots (
  purchase_request_id,
  lot_id
) VALUES (
  1,
  '1732288123456abc'
);
```

## Fluxo de Importação

1. **Upload do JSON** com dados do loteamento
2. **Validação** dos campos obrigatórios
3. **Criação do Mapa** (tabela `maps`)
4. **Para cada Quadra**:
   - Criar registro na tabela `blocks`
   - **Para cada Lote**:
     - Criar registro na tabela `lots`
     - **Se lote está `reserved` ou `sold`**:
       - Validar dados obrigatórios da reserva
       - Criar registro na tabela `purchase_requests`
       - Criar relacionamento na tabela `purchase_request_lots`
5. **Commit** da transação

## Exemplo Prático

### Cenário: Loteamento com 3 quadras

```json
{
  "name": "Chácara Jardim Ypiranga",
  "blocks": [
    {
      "name": "Quadra 01",
      "lots": [
        {"lotNumber": "01", "status": "available", "price": 50000, "size": 300},
        {"lotNumber": "02", "status": "available", "price": 50000, "size": 300},
        {
          "lotNumber": "03",
          "status": "reserved",
          "price": 50000,
          "size": 300,
          "reservation": {
            "customer_name": "Carlos Mendes",
            "customer_email": "carlos@email.com",
            "customer_phone": "(11) 99999-9999",
            "payment_method": "installments",
            "status": "pending",
            "seller_name": "Ana Corretora",
            "seller_email": "ana.corretora@empresa.com",
            "seller_phone": "11999999999",
            "seller_cpf": "45645645600"
          }
        }
      ]
    },
    {
      "name": "Quadra 02",
      "lots": [
        {
          "lotNumber": "01",
          "status": "sold",
          "price": 55000,
          "size": 320,
          "reservation": {
            "customer_name": "Ana Paula",
            "customer_email": "ana@email.com",
            "customer_phone": "(11) 88888-8888",
            "payment_method": "cash",
            "status": "completed",
            "seller_name": "Ricardo Vendedor",
            "seller_email": "ricardo.vendedor@empresa.com",
            "seller_phone": "11888888888",
            "seller_cpf": "78978978900"
          }
        },
        {"lotNumber": "02", "status": "blocked", "price": 55000, "size": 320}
      ]
    }
  ]
}
```

### Resultado

- ✅ 1 mapa criado
- ✅ 2 quadras criadas
- ✅ 5 lotes criados
- ✅ 2 reservas criadas (1 pending + 1 completed)
- ✅ 2 lotes disponíveis
- ✅ 1 lote reservado
- ✅ 1 lote vendido
- ✅ 1 lote bloqueado

## Dicas

1. **Exporte dados existentes**: Use a estrutura de dados do sistema para gerar JSONs de exemplo
2. **Teste com dados pequenos**: Comece com 1-2 quadras para validar o formato
3. **Use ferramentas JSON**: Validadores como JSONLint para verificar sintaxe
4. **Mantenha backups**: Sempre faça backup antes de importações grandes
5. **Valide CPFs**: Use formato padrão (123.456.789-00) para facilitar consultas

## Logs e Debug

Durante a importação, o sistema gera logs detalhados:

```
[API /mapas/importar] ✅ Mapa criado: Loteamento Exemplo (ID: 1732288123456)
[API /mapas/importar]   📦 Quadra criada: Quadra A (ID: 1)
[API /mapas/importar]     🏠 4 lotes criados
[API /mapas/importar]       💰 Reserva criada para lote 02 (Cliente: João Silva)
[API /mapas/importar]       💰 Reserva criada para lote 03 (Cliente: Maria Santos)
[API /mapas/importar] 🎉 Importação concluída: 1 quadras, 4 lotes
```

## Suporte

Para problemas durante a importação:
1. Verifique os logs do console do navegador
2. Verifique os logs do servidor Next.js
3. Valide o formato JSON
4. Confirme que todos os campos obrigatórios estão presentes
