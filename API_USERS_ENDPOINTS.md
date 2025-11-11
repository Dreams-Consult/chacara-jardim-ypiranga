# API - Endpoints de Usuários

Este documento descreve os endpoints necessários para o gerenciamento de usuários.

## Base URL
```
NEXT_PUBLIC_API_URL=/webhook
```

---

## 1. Buscar Usuário por CPF

**Endpoint:** `GET /usuarios?cpf={cpf}`

**Descrição:** Retorna os dados completos de um usuário pelo CPF. Usado após login bem-sucedido para carregar informações adicionais.

**Parâmetros de Query:**
- `cpf` (string, obrigatório): CPF sem formatação (apenas números, 11 dígitos)

**Exemplo:**
```
GET /usuarios?cpf=12345678901
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "cpf": "12345678901",
    "creci": "123456-F",
    "role": "vendedor",
    "status": "approved",
    "createdAt": "2025-11-11T10:00:00.000Z",
    "updatedAt": "2025-11-11T10:00:00.000Z"
  }
}
```

**IMPORTANTE:** Não retornar o campo `password` na resposta!

**Response Error (404 - Não Encontrado):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

**Response Error (400 - CPF Inválido):**
```json
{
  "success": false,
  "message": "CPF inválido"
}
```

**Uso:**
Este endpoint é chamado automaticamente após um login bem-sucedido para salvar os dados completos do usuário no localStorage do navegador.

---

## 2. Criar Usuário (Registro Público)

**Endpoint:** `POST /usuarios/criar`

**Descrição:** Cria um novo usuário no sistema. Usado tanto pelo formulário de registro público quanto pelo admin.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678901",
  "creci": "123456-F",
  "role": "vendedor",
  "status": "pending",
  "password": "senha123"
}
```

**Campos:**
- `name` (string, obrigatório): Nome completo do usuário
- `email` (string, obrigatório): Email válido
- `cpf` (string, obrigatório): CPF sem formatação (apenas números)
- `creci` (string, opcional): Número do CRECI (pode ser null)
- `role` (string, obrigatório): Perfil - "dev", "admin" ou "vendedor"
- `status` (string, obrigatório): Status - "pending", "approved" ou "rejected"
- `password` (string, obrigatório): Senha do usuário

**Response Success (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "cpf": "12345678901",
    "creci": "123456-F",
    "role": "vendedor",
    "status": "pending",
    "createdAt": "2025-11-11T10:00:00.000Z",
    "updatedAt": "2025-11-11T10:00:00.000Z"
  }
}
```

**Response Error (409 - Conflito):**
```json
{
  "success": false,
  "message": "Este email já está cadastrado"
}
```
ou
```json
{
  "success": false,
  "message": "Este CPF já está cadastrado"
}
```

**Response Error (400 - Dados Inválidos):**
```json
{
  "success": false,
  "message": "Dados inválidos"
}
```

---

## 3. Login de Usuário

**Endpoint:** `GET /usuarios/login?cpf={cpf}&password={password}`

**Descrição:** Autentica um usuário no sistema usando CPF e senha enviados via query parameters.

**Parâmetros de Query:**
- `cpf` (string, obrigatório): CPF sem formatação (apenas números, 11 dígitos)
- `password` (string, obrigatório): Senha do usuário (deve ser URL encoded)

**Exemplo:**
```
GET /usuarios/login?cpf=12345678901&password=senha123
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "cpf": "12345678901",
    "creci": "123456-F",
    "role": "vendedor",
    "status": "approved",
    "createdAt": "2025-11-11T10:00:00.000Z",
    "updatedAt": "2025-11-11T10:00:00.000Z"
  }
}
```

**IMPORTANTE:** Não retornar o campo `password` na resposta!

**Response Error (401 - Não Autorizado):**
```json
{
  "success": false,
  "message": "CPF ou senha inválidos"
}
```

**Response Error (403 - Status Pendente/Rejeitado):**
```json
{
  "success": false,
  "message": "Sua conta está aguardando aprovação"
}
```
ou
```json
{
  "success": false,
  "message": "Sua conta foi rejeitada"
}
```

---

## 4. Listar Usuários (Admin)

**Endpoint:** `GET /usuarios/listar`

**Descrição:** Retorna lista de todos os usuários cadastrados no sistema.

**Response Success (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "cpf": "12345678901",
      "creci": "123456-F",
      "role": "vendedor",
      "status": "pending",
      "createdAt": "2025-11-11T10:00:00.000Z",
      "updatedAt": "2025-11-11T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@exemplo.com",
      "cpf": "98765432100",
      "creci": null,
      "role": "admin",
      "status": "approved",
      "createdAt": "2025-11-10T10:00:00.000Z",
      "updatedAt": "2025-11-10T10:00:00.000Z"
    }
  ]
}
```

**IMPORTANTE:** Não retornar o campo `password` na resposta!

---

## 5. Atualizar Usuário (Admin)

**Endpoint:** `PUT /usuarios/atualizar/:id`

**Descrição:** Atualiza os dados de um usuário existente.

**Parâmetros de URL:**
- `id` (number): ID do usuário

**Request Body:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.novo@exemplo.com",
  "cpf": "12345678901",
  "role": "admin",
  "password": "novaSenha123"
}
```

**Campos:**
- `name` (string, opcional): Nome completo
- `email` (string, opcional): Email
- `cpf` (string, opcional): CPF sem formatação
- `role` (string, opcional): Perfil
- `password` (string, opcional): Nova senha (se não enviado, mantém a atual)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva Santos",
    "email": "joao.novo@exemplo.com",
    "cpf": "12345678901",
    "creci": "123456-F",
    "role": "admin",
    "status": "approved",
    "updatedAt": "2025-11-11T11:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## 6. Excluir Usuário (Admin)

**Endpoint:** `DELETE /usuarios/deletar/:id`

**Descrição:** Remove um usuário do sistema.

**Parâmetros de URL:**
- `id` (number): ID do usuário

**Response Success (200):**
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## 7. Aprovar Usuário (Admin)

**Endpoint:** `PUT /usuarios/aprovar/:id`

**Descrição:** Aprova um usuário pendente, permitindo que ele faça login.

**Parâmetros de URL:**
- `id` (number): ID do usuário

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Usuário aprovado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "status": "approved",
    "updatedAt": "2025-11-11T11:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## 8. Rejeitar Usuário (Admin)

**Endpoint:** `PUT /usuarios/rejeitar/:id`

**Descrição:** Rejeita um usuário pendente, impedindo que ele faça login.

**Parâmetros de URL:**
- `id` (number): ID do usuário

**Request Body:**
```json
{
  "status": "rejected"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Usuário rejeitado",
  "user": {
    "id": 1,
    "name": "João Silva",
    "status": "rejected",
    "updatedAt": "2025-11-11T11:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## Modelo de Dados (Database Schema)

### Tabela: `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  creci VARCHAR(50) NULL,
  role ENUM('dev', 'admin', 'vendedor') NOT NULL DEFAULT 'vendedor',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Índices Recomendados:
```sql
CREATE INDEX idx_cpf ON users(cpf);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON users(status);
```

---

## Notas de Implementação

1. **Segurança de Senha:**
   - NUNCA armazenar senhas em texto plano
   - Usar bcrypt ou similar para hash de senhas
   - Nunca retornar senhas nas respostas da API

2. **Validações:**
   - CPF deve ter exatamente 11 dígitos
   - Email deve ser válido
   - Validar se CPF e email já existem antes de criar

3. **Status de Usuário:**
   - Novos registros públicos: `status = 'pending'`
   - Usuários criados por admin: `status = 'approved'`
   - DEV e ADMIN não precisam aprovação (sempre approved)
   - Apenas VENDEDOR com status PENDING precisa de aprovação

4. **Controle de Acesso:**
   - Login: permitir apenas usuários com `status = 'approved'`
   - Ou usuários com `role = 'dev'` ou `role = 'admin'` (independente do status)

5. **Logs:**
   - Registrar tentativas de login
   - Registrar criação/atualização/exclusão de usuários
   - Registrar aprovações/rejeições

6. **Headers:**
   - Todos os endpoints devem aceitar `Content-Type: application/json`
   - Timeout recomendado: 10 segundos
