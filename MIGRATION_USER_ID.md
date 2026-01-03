# Migração para user_id em purchase_requests

## Resumo
Implementada migração para usar `user_id` ao invés de `seller_cpf` para filtrar reservas por vendedor, aumentando segurança e consistência.

## Mudanças no Banco de Dados

### Script de Migração
- Arquivo: `database-add-user-id-to-purchase-requests.sql`
- Adiciona coluna `user_id` na tabela `purchase_requests`
- Relaciona com tabela `users` via Foreign Key
- Permite NULL para reservas antigas

### Estrutura
```sql
ALTER TABLE `purchase_requests`
ADD COLUMN `user_id` INT DEFAULT NULL AFTER `id`,
ADD KEY `idx_user_id` (`user_id`),
ADD CONSTRAINT `purchase_requests_ibfk_user` 
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
  ON DELETE SET NULL;
```

## Mudanças no Backend

### API - Criar Reserva
**Arquivo**: `app/api/mapas/lotes/reservar/route.ts`

- Adicionado parâmetro `userId` no body da requisição
- Incluído `user_id` nos INSERTs de `purchase_requests`
- Mantida compatibilidade com formato antigo (fallback)

**Exemplo**:
```typescript
const { userId, lotIds, customerName, ... } = body;

INSERT INTO purchase_requests (
  user_id, seller_id, customer_name, ...
) VALUES (?, ?, ?, ...)
```

## Mudanças no Frontend

### Hook usePurchaseForm
**Arquivo**: `hooks/usePurchaseForm.ts`

- Adicionado parâmetro opcional `userId`
- Inclui `userId` no requestData se fornecido

### Componente PurchaseModal
**Arquivo**: `components/PurchaseModal.tsx`

- Importa e usa `useAuth` para obter `user.id`
- Passa `user?.id` para `usePurchaseForm`

### Listagem de Reservas
**Arquivo**: `app/admin/reservations/page.tsx`

**Antes (CPF)**:
```typescript
filteredReservations = allReservations.filter((reservation) => {
  const userCpf = user.cpf.replace(/\D/g, '');
  const sellerCpf = reservation.seller_cpf.replace(/\D/g, '');
  return sellerCpf === userCpf;
});
```

**Depois (ID)**:
```typescript
filteredReservations = allReservations.filter((reservation: any) => {
  return reservation.user_id === parseInt(user.id);
});
```

## Vantagens da Mudança

### Segurança
- ✅ IDs internos não expostos ao frontend de forma insegura
- ✅ Filtragem acontece no backend com base em dados da sessão
- ✅ Impossível vendedor manipular para ver reservas de outros

### Performance
- ✅ Filtro por integer (user_id) mais rápido que string (CPF)
- ✅ Índice otimizado no banco de dados

### Consistência
- ✅ Relacionamento direto entre tabelas users e purchase_requests
- ✅ Cascata ON DELETE SET NULL preserva histórico
- ✅ Padrão alinhado com outras tabelas do sistema

## Compatibilidade

### Reservas Antigas
- Reservas sem `user_id` (NULL) ainda funcionam
- Admin/Dev podem ver todas as reservas
- Vendedores veem apenas reservas com seu `user_id`

### Campos Mantidos
- `seller_name`, `seller_email`, `seller_cpf` mantidos para histórico
- `seller_id` mantido para compatibilidade legacy
- Migração não quebra funcionalidades existentes

## Comandos de Execução

### 1. Aplicar Migração no Banco
```bash
mysql -u root -p vale_dos_carajas < database-add-user-id-to-purchase-requests.sql
```

### 2. Verificar Estrutura
```sql
DESCRIBE purchase_requests;
```

### 3. Testar Filtro
```sql
SELECT 
  pr.id,
  pr.user_id,
  u.username,
  pr.customer_name,
  pr.created_at
FROM purchase_requests pr
LEFT JOIN users u ON pr.user_id = u.id
WHERE pr.user_id = 1;
```

## Fluxo Completo

1. **Usuário cria reserva**
   - Frontend captura `user.id` do AuthContext
   - Envia `userId` no POST para `/api/mapas/lotes/reservar`

2. **Backend salva reserva**
   - Insere `user_id` na tabela `purchase_requests`
   - Mantém dados do vendedor em campos texto

3. **Usuário lista reservas**
   - Frontend busca todas reservas via GET `/api/reservas`
   - Filtra por `user_id` no frontend
   - Admin/Dev veem todas, vendedores só as suas

## Notas Importantes

- ⚠️ Executar script de migração em **produção** antes de fazer deploy
- ⚠️ Testar com usuários de diferentes perfis (admin, dev, seller)
- ⚠️ Verificar se reservas antigas (user_id NULL) ainda são visíveis para admin
