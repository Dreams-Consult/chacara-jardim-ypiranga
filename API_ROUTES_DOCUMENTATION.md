# API Routes - Chácara Jardim Ypiranga

Este documento lista todas as rotas de API criadas no Next.js App Router.

## 📋 Estrutura de Arquivos

```
app/api/
├── mapas/
│   ├── route.ts                    # GET /api/mapas
│   ├── criar/route.ts              # POST /api/mapas/criar
│   ├── deletar/route.ts            # DELETE /api/mapas/deletar
│   ├── quadras/
│   │   ├── route.ts                # GET /api/mapas/quadras
│   │   ├── criar/route.ts          # POST /api/mapas/quadras/criar
│   │   ├── atualizar/route.ts      # PATCH /api/mapas/quadras
│   │   └── deletar/route.ts        # DELETE /api/mapas/quadras/deletar
│   └── lotes/
│       ├── route.ts                # GET /api/mapas/lotes
│       ├── criar/route.ts          # POST /api/mapas/lotes/criar
│       ├── atualizar/route.ts      # PATCH /api/mapas/lotes
│       ├── valido/route.ts         # GET /api/mapas/lotes/valido
│       └── reservar/route.ts       # POST /api/mapas/lotes/reservar
├── reservas/
│   └── route.ts                    # GET /api/reservas
├── reserva/
│   └── confirmacao/route.ts        # PUT /api/reserva/confirmacao
└── usuarios/
    ├── route.ts                    # GET /api/usuarios
    ├── login/route.ts              # GET /api/usuarios/login
    ├── criar/route.ts              # POST /api/usuarios/criar
    ├── aprovar/route.ts            # PUT /api/usuarios/aprovar
    ├── role/route.ts               # PUT /api/usuarios/role
    └── atualizar/
        └── [id]/route.ts           # PUT /api/usuarios/atualizar/[id]
```

## 🗺️ Endpoints de Mapas

### GET /api/mapas
Retorna todos os mapas cadastrados no sistema.

**Response:**
```json
[
  {
    "mapId": "1",
    "id": "1",
    "name": "Loteamento Jardim Ypiranga",
    "description": "Loteamento principal",
    "imageUrl": "data:image/png;base64,...",
    "width": 1200,
    "height": 800,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/mapas/criar
Cria um novo mapa.

**Body:**
```json
{
  "name": "Novo Loteamento",
  "description": "Descrição opcional",
  "imageUrl": "data:image/png;base64,...",
  "width": 1200,
  "height": 800
}
```

### DELETE /api/mapas/deletar?mapId=123
Deleta um mapa (verifica se não há lotes associados).

---

## 🏘️ Endpoints de Quadras/Blocos

### GET /api/mapas/quadras?mapId=123
Retorna todas as quadras de um mapa específico.

**Response:**
```json
[
  {
    "id": "1",
    "mapId": "123",
    "name": "Quadra A",
    "description": "Primeira quadra",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/mapas/quadras/criar
Cria uma nova quadra.

**Body:**
```json
{
  "id": "auto-generated-or-provided",
  "mapId": "123",
  "name": "Quadra B",
  "description": "Segunda quadra",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /api/mapas/quadras
Atualiza uma quadra existente.

**Body:**
```json
{
  "id": "1",
  "mapId": "123",
  "name": "Quadra A - Atualizada",
  "description": "Descrição atualizada"
}
```

### DELETE /api/mapas/quadras/deletar?blockId=123
Deleta uma quadra (verifica se não há lotes associados).

---

## 🏠 Endpoints de Lotes

### GET /api/mapas/lotes?mapId=123&blockId=456
Retorna lotes de um mapa (opcionalmente filtrados por quadra).

**Response:**
```json
[
  {
    "mapId": "123",
    "lots": [
      {
        "id": "1",
        "mapId": "123",
        "blockId": "456",
        "lotNumber": "01",
        "status": "available",
        "price": 45000,
        "pricePerM2": 150,
        "size": 300,
        "description": "Lote com vista privilegiada",
        "features": "[\"Água\", \"Luz\"]",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

### POST /api/mapas/lotes/criar
Cria um novo lote.

**Body:**
```json
{
  "id": "auto-generated",
  "mapId": "123",
  "blockId": "456",
  "lotNumber": "02",
  "status": "available",
  "price": 50000,
  "pricePerM2": 150,
  "size": 333.33,
  "description": "Lote de esquina",
  "features": ["Água", "Luz", "Asfalto"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /api/mapas/lotes
Atualiza um lote existente.

**Body:**
```json
{
  "id": "1",
  "mapId": "123",
  "blockId": "456",
  "status": "reserved",
  "price": 48000
}
```

### GET /api/mapas/lotes/valido?idLote=123
Verifica se um lote está disponível para reserva.

**Response:**
```json
{
  "valid": true
}
```

### POST /api/mapas/lotes/reservar
Cria uma ou mais reservas de lotes.

**Body:**
```json
{
  "lotIds": ["1", "2", "3"],
  "customerName": "João da Silva",
  "customerEmail": "joao@email.com",
  "customerPhone": "11999999999",
  "customerCPF": "12345678900",
  "message": "Gostaria de visitar os lotes",
  "sellerId": 1,
  "sellerName": "Maria Vendedora",
  "sellerEmail": "maria@email.com",
  "sellerPhone": "11988888888",
  "sellerCPF": "09876543211"
}
```

---

## 📋 Endpoints de Reservas

### GET /api/reservas
Retorna todas as reservas do sistema.

**Response:**
```json
[
  {
    "id": 1,
    "lot_id": 123,
    "seller_id": 1,
    "map_id": "map-123",
    "customer_name": "João da Silva",
    "customer_email": "joao@email.com",
    "customer_phone": "11999999999",
    "customer_cpf": "12345678900",
    "message": "Gostaria de visitar",
    "seller_name": "Maria Vendedora",
    "seller_email": "maria@email.com",
    "seller_phone": "11988888888",
    "seller_cpf": "09876543211",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### PUT /api/reserva/confirmacao
Aprova ou rejeita uma reserva.

**Body:**
```json
{
  "reservationId": "1",
  "status": "completed",
  "lotStatus": "sold"
}
```

---

## 👥 Endpoints de Usuários

### GET /api/usuarios/login?cpf=12345678900&password=senha123
Autentica um usuário.

**Response:**
```json
{
  "id": "1",
  "name": "Admin",
  "email": "admin@example.com",
  "cpf": "12345678900",
  "phone": "11999999999",
  "creci": "CRECI-12345",
  "role": "admin",
  "status": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/usuarios/
Retorna todos os usuários.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Admin",
    "email": "admin@example.com",
    "cpf": "12345678900",
    "phone": "11999999999",
    "creci": "CRECI-12345",
    "role": "admin",
    "status": "approved",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/usuarios/criar
Cria um novo usuário.

**Body:**
```json
{
  "name": "Novo Vendedor",
  "email": "vendedor@email.com",
  "cpf": "11122233344",
  "phone": "11977777777",
  "creci": "CRECI-54321",
  "role": "vendedor",
  "status": "pending",
  "password": "senha123",
  "first_login": true
}
```

### PUT /api/usuarios/atualizar/[id]?name=...&email=...
Atualiza dados de um usuário.

**Query Params:**
- name
- email
- cpf
- phone
- role
- creci
- password (opcional)

### PUT /api/usuarios/aprovar
Aprova ou rejeita um cadastro de usuário.

**Body:**
```json
{
  "idUsuario": "1",
  "status": "approved"
}
```

### PUT /api/usuarios/role
Altera o cargo de um usuário.

**Body:**
```json
{
  "idUsuario": "1",
  "role": "admin"
}
```

---

## 🔧 Próximos Passos

Todas as rotas estão criadas com estrutura mock. Para conectar ao backend real:

1. **Instalar driver MySQL:**
   ```bash
   npm install mysql2
   ```

2. **Criar arquivo de conexão** (`lib/db.ts`):
   ```typescript
   import mysql from 'mysql2/promise';
   
   export const db = mysql.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
   });
   ```

3. **Substituir os TODO** em cada rota com queries SQL reais.

4. **Adicionar variáveis de ambiente** (`.env.local`):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=senha
   DB_NAME=chacara_db
   ```

---

## 📊 Modelo de Dados SQL

Veja os scripts de criação de banco de dados em:
- `database-update.sql` - Script principal
- `database-blocks-migration.sql` - Migração de quadras

---

## 🚀 Como Testar

Use ferramentas como **Postman**, **Insomnia** ou **Thunder Client** para testar as rotas:

```bash
# Exemplo: Buscar mapas
GET http://localhost:3000/api/mapas

# Exemplo: Criar quadra
POST http://localhost:3000/api/mapas/quadras/criar
Content-Type: application/json
{
  "mapId": "1",
  "name": "Quadra A"
}
```
