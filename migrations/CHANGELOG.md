# 📋 Histórico de Migrations

Este documento registra todas as migrations executadas no projeto.

## Ordem de Execução

### 001_initial_schema.sql
**Data**: 2024-01-01  
**Descrição**: Schema inicial completo do banco de dados
- Criação das tabelas: users, maps, blocks, lots, purchase_requests, purchase_request_lots
- Definição de foreign keys e constraints
- Criação de views úteis (vw_map_statistics, vw_lot_details)
- Índices para performance
- Triggers para automação de status

**Tabelas Criadas**:
- `users` - Usuários do sistema
- `maps` - Mapas/Loteamentos
- `blocks` - Quadras/Blocos
- `lots` - Lotes
- `purchase_requests` - Solicitações de compra
- `purchase_request_lots` - Relacionamento múltiplos lotes

---

### 002_add_contract_column.sql
**Data**: 2024-11-27  
**Descrição**: Adiciona coluna contract na tabela purchase_requests
- Campo TEXT para armazenar informações do contrato

---

### 003_alter_price_column.sql
**Data**: 2024-11-22  
**Descrição**: Altera precisão da coluna price
- Muda de DECIMAL(15,2) para DECIMAL(10,2)
- Valores até R$ 99.999.999,99

---

### 004_add_agreed_price_installments.sql
**Data**: 2024-12-01  
**Descrição**: Adiciona campos para preço acordado e parcelas
- `agreed_price` em purchase_request_lots - DECIMAL(15,2)
- `installments` em purchase_requests - INT

---

### 005_add_active_users.sql
**Data**: 2024-12-05  
**Descrição**: Adiciona coluna active na tabela users
- Campo TINYINT(1) para ativar/desativar usuários
- Default: 1 (ativo)
- Atualiza usuários existentes para ativo

---

### 006_add_theme_preference.sql
**Data**: 2024-12-10  
**Descrição**: Adiciona preferência de tema do usuário
- Campo ENUM('light', 'dark') na tabela users
- Default: 'light'
- Índice para otimização

---

### 007_move_payment_fields_to_lots.sql
**Data**: 2024-11-29  
**Descrição**: Move campos de pagamento para tabela de lotes
- Adiciona `first_payment` e `installments` em purchase_request_lots
- Migra dados existentes de purchase_requests
- Remove colunas antigas de purchase_requests
- Cria índices para performance

---

## Comandos Úteis

```bash
# Ver status das migrations
npm run migrate:status

# Executar migrations pendentes
npm run migrate

# Criar nova migration
npm run migrate:create nome_da_migration
```

## Estrutura de Controle

As migrations são rastreadas na tabela `migrations`:

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Cada migration é executada apenas uma vez e registrada automaticamente.

## Próximas Migrations

Para adicionar novas alterações no schema:

1. Criar migration: `npm run migrate:create nome_descritivo`
2. Editar arquivo gerado em `migrations/`
3. Executar: `npm run migrate`
4. Documentar aqui

## Rollback

⚠️ **ATENÇÃO**: Este sistema não suporta rollback automático.

Para reverter uma migration:
1. Fazer backup do banco antes de executar
2. Se necessário, restaurar o backup
3. Criar nova migration para reverter as mudanças

## Boas Práticas

- ✅ Sempre use `IF NOT EXISTS` / `IF EXISTS`
- ✅ Teste localmente antes de produção
- ✅ Faça backup antes de executar em produção
- ✅ Documente as alterações neste arquivo
- ✅ Nunca edite migrations já executadas
- ✅ Use nomes descritivos para migrations
- ✅ Uma migration = uma responsabilidade
