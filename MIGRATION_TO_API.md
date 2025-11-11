# Resumo das Alterações - Migração para API

## Data: 11/11/2025

## Objetivo
Remover o uso de localStorage para gerenciamento de usuários e migrar todas as operações para requisições HTTP ao backend.

---

## Arquivos Modificados

### 1. `/app/register/page.tsx`
**Mudanças:**
- ✅ Adicionado import do `axios`
- ✅ Adicionado `API_URL` para configuração do endpoint
- ✅ Removida verificação de duplicação via localStorage
- ✅ Implementada requisição POST para `/usuarios/criar`
- ✅ CPF é enviado sem formatação (apenas números)
- ✅ CRECI pode ser null
- ✅ Tratamento de erro 409 (conflito - email/CPF já existe)
- ✅ Logs de debug adicionados

**Endpoint usado:**
```
POST /usuarios/criar
```

---

### 2. `/contexts/AuthContext.tsx`
**Mudanças:**
- ✅ Adicionado import do `axios`
- ✅ Adicionado `API_URL` para configuração do endpoint
- ✅ Removida busca de usuários no localStorage
- ✅ Implementada requisição POST para `/usuarios/login`
- ✅ Migrado de `localStorage` para `sessionStorage` (mais seguro)
- ✅ Validação de status (PENDING/REJECTED) mantida
- ✅ CPF normalizado antes de enviar
- ✅ Tratamento de erro 401 (credenciais inválidas)
- ✅ Logs de debug adicionados

**Endpoint usado:**
```
POST /usuarios/login
```

**Segurança:**
- sessionStorage ao invés de localStorage (dados são limpos ao fechar o navegador)
- Senha nunca é armazenada no frontend

---

### 3. `/app/admin/users/page.tsx`
**Mudanças:**
- ✅ Adicionado import do `axios`
- ✅ Adicionado `API_URL` para configuração do endpoint
- ✅ Removido estado inicial com localStorage
- ✅ Adicionado estado `isLoading` com indicador visual
- ✅ Implementada função `loadUsers()` com requisição GET
- ✅ Criação de usuário via POST (sem ID, gerado pelo backend)
- ✅ Atualização de usuário via PUT
- ✅ Exclusão de usuário via DELETE
- ✅ Aprovação de usuário via PUT
- ✅ Rejeição de usuário via PUT
- ✅ Recarregamento automático da lista após cada operação
- ✅ CPF enviado sem formatação
- ✅ Tratamento de erros com mensagens da API
- ✅ Logs de debug adicionados

**Endpoints usados:**
```
GET    /usuarios/listar
POST   /usuarios/criar
PUT    /usuarios/atualizar/:id
DELETE /usuarios/deletar/:id
PUT    /usuarios/aprovar/:id
PUT    /usuarios/rejeitar/:id
```

---

## Documentação Criada

### `/API_USERS_ENDPOINTS.md`
Documentação completa dos 7 endpoints necessários:
1. POST /usuarios/criar - Criar usuário
2. POST /usuarios/login - Login
3. GET /usuarios/listar - Listar todos
4. PUT /usuarios/atualizar/:id - Atualizar
5. DELETE /usuarios/deletar/:id - Excluir
6. PUT /usuarios/aprovar/:id - Aprovar
7. PUT /usuarios/rejeitar/:id - Rejeitar

Inclui:
- Request/Response de cada endpoint
- Códigos de status HTTP
- Mensagens de erro
- Schema do banco de dados
- Índices recomendados
- Notas de segurança

---

## Remoções

### localStorage
Todos os usos de localStorage foram removidos:
- ❌ `localStorage.getItem('users')`
- ❌ `localStorage.setItem('users', ...)`
- ❌ `localStorage.getItem('currentUser')`
- ❌ `localStorage.setItem('currentUser', ...)`
- ❌ `localStorage.removeItem('currentUser')`

### sessionStorage (novo)
Apenas usado para sessão do usuário logado:
- ✅ `sessionStorage.getItem('currentUser')`
- ✅ `sessionStorage.setItem('currentUser', ...)`
- ✅ `sessionStorage.removeItem('currentUser')`

---

## IDs Removidos

Todos os lugares onde IDs eram gerados no frontend foram removidos:
- ❌ `crypto.randomUUID()` em usuários
- ❌ `Date.now().toString()` em lotes
- ❌ IDs gerados em purchaseRequest

Agora o backend gera todos os IDs via autoincrement.

---

## Fluxo Completo de Registro e Login

### 1. Registro (Público)
```
User preenche formulário
  ↓
Frontend valida dados
  ↓
POST /usuarios/criar
  {
    name, email, cpf, creci,
    role: 'vendedor',
    status: 'pending',
    password
  }
  ↓
Backend cria usuário com ID autoincrement
  ↓
Redireciona para /login?registered=pending
```

### 2. Login (Após Aprovação)
```
User insere CPF e senha
  ↓
Frontend normaliza CPF (remove formatação)
  ↓
POST /usuarios/login
  { cpf, password }
  ↓
Backend valida credenciais e status
  ↓
Se PENDING → Erro: "Aguardando aprovação"
Se REJECTED → Erro: "Conta rejeitada"
Se APPROVED → Retorna dados do usuário
  ↓
Frontend salva em sessionStorage
  ↓
Redireciona para dashboard
```

### 3. Aprovação (Admin)
```
Admin acessa /admin/users
  ↓
GET /usuarios/listar
  ↓
Lista todos os usuários com status
  ↓
Admin clica em "Aprovar"
  ↓
PUT /usuarios/aprovar/:id
  { status: 'approved' }
  ↓
Backend atualiza status
  ↓
Frontend recarrega lista
  ↓
Usuário pode fazer login
```

---

## Variáveis de Ambiente

### `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://192.168.1.232:5678/webhook
```

Todos os componentes usam:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

---

## Segurança Implementada

1. **Senhas:**
   - Nunca armazenadas no frontend
   - Backend deve usar bcrypt para hash

2. **Sessão:**
   - sessionStorage ao invés de localStorage
   - Dados limpos ao fechar navegador

3. **CPF:**
   - Enviado sem formatação (segurança)
   - Normalizado antes de cada requisição

4. **Status:**
   - Validação de PENDING/REJECTED no login
   - Apenas APPROVED pode acessar

5. **Logs:**
   - Console logs com prefixos para debug
   - Erros detalhados para desenvolvimento

---

## Próximos Passos

### Backend (n8n/MySQL)
1. Implementar os 7 endpoints documentados
2. Criar tabela `users` com schema fornecido
3. Adicionar índices recomendados
4. Implementar bcrypt para senhas
5. Validar CPF único e email único
6. Implementar lógica de status

### Frontend (Opcional)
1. Adicionar token JWT para autenticação
2. Implementar refresh de sessão
3. Adicionar loading states mais detalhados
4. Implementar retry de requisições falhas
5. Adicionar cache de usuários (SWR ou React Query)

---

## Testing

### Testar Registro:
1. Acessar `/register`
2. Preencher formulário com CRECI
3. Verificar POST para `/usuarios/criar`
4. Verificar redirecionamento com `?registered=pending`

### Testar Login (Pending):
1. Tentar login com usuário PENDING
2. Verificar erro: "Aguardando aprovação"

### Testar Aprovação:
1. Login como DEV/ADMIN
2. Acessar `/admin/users`
3. Verificar GET `/usuarios/listar`
4. Clicar em "Aprovar" usuário PENDING
5. Verificar PUT `/usuarios/aprovar/:id`

### Testar Login (Approved):
1. Fazer logout
2. Login com usuário aprovado
3. Verificar acesso ao dashboard

---

## Compatibilidade

- ✅ Next.js 16.0.1
- ✅ React 19
- ✅ TypeScript
- ✅ Axios para requisições HTTP
- ✅ Tailwind CSS (estilos mantidos)
- ✅ Turbopack

---

## Notas Importantes

1. **Nenhum dado em localStorage:** Tudo vem da API agora
2. **IDs autoincrement:** Backend gera todos os IDs
3. **CPF sem formatação:** Enviado como string de 11 dígitos
4. **Status obrigatório:** Sempre verificado no login
5. **Documentação completa:** API_USERS_ENDPOINTS.md
