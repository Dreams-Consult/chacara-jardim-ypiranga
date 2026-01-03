# 🔄 Sistema de Migrations

Este projeto utiliza um sistema de migrations para gerenciar alterações no schema do banco de dados de forma controlada e versionada.

## 📋 Comandos Disponíveis

```bash
# Executar todas as migrations pendentes
npm run migrate

# Ver status das migrations (executadas/pendentes)
npm run migrate:status

# Criar uma nova migration
npm run migrate:create nome_da_migration
```

## 🗂️ Estrutura

```
migrations/
├── 001_initial_schema.sql           # Schema inicial do banco
├── 002_add_contract_column.sql      # Adiciona coluna contract
├── 003_alter_price_column.sql       # Altera precisão da coluna price
├── 004_add_agreed_price_installments.sql  # Adiciona preço acordado
├── 005_add_active_users.sql         # Adiciona coluna active em users
├── 006_add_theme_preference.sql     # Adiciona preferência de tema
└── 007_move_payment_fields_to_lots.sql    # Move campos de pagamento
```

## 🚀 Como Funciona

### 1. Tabela de Controle

O sistema cria automaticamente uma tabela `migrations` no banco de dados para rastrear quais migrations já foram executadas:

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Execução Sequencial

As migrations são executadas em ordem alfabética (por isso usamos prefixos numéricos). Uma migration só é executada se ainda não estiver registrada na tabela `migrations`.

### 3. Segurança

- ✅ **Idempotência**: Migrations usam `IF NOT EXISTS`, `IF EXISTS`, etc.
- ✅ **Atomicidade**: Cada migration é uma transação
- ✅ **Rastreabilidade**: Histórico completo de execução
- ✅ **Versionamento**: Migrations versionadas no Git

## 📝 Criar uma Nova Migration

### Passo 1: Gerar arquivo
```bash
npm run migrate:create adicionar_coluna_xyz
```

Isso cria um arquivo: `migrations/1234567890_adicionar_coluna_xyz.sql`

### Passo 2: Editar a migration

```sql
-- Migration: adicionar_coluna_xyz
-- Created: 2024-12-15T10:30:00.000Z
-- Description: Adiciona coluna xyz na tabela abc

-- ==========================================
-- UP Migration
-- ==========================================

ALTER TABLE abc 
ADD COLUMN IF NOT EXISTS xyz VARCHAR(255) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_xyz ON abc(xyz);
```

### Passo 3: Executar
```bash
npm run migrate
```

## 🔍 Verificar Status

```bash
npm run migrate:status
```

Exemplo de saída:
```
📊 Status das Migrations:
========================
Total disponíveis: 7
Executadas: 5
Pendentes: 2

✅ Executadas:
  - 001_initial_schema.sql
  - 002_add_contract_column.sql
  - 003_alter_price_column.sql
  - 004_add_agreed_price_installments.sql
  - 005_add_active_users.sql

⏳ Pendentes:
  - 006_add_theme_preference.sql
  - 007_move_payment_fields_to_lots.sql
```

## ⚠️ Boas Práticas

### 1. Nunca Editar Migrations Executadas
❌ **Não faça isso:**
```bash
# Editar uma migration já executada
vim migrations/001_initial_schema.sql
```

✅ **Faça isso:**
```bash
# Criar nova migration para fazer alterações
npm run migrate:create corrigir_schema_inicial
```

### 2. Usar IF NOT EXISTS / IF EXISTS
```sql
-- ✅ Correto - idempotente
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active TINYINT(1) DEFAULT 1;

-- ❌ Errado - quebra se rodar duas vezes
ALTER TABLE users 
ADD COLUMN active TINYINT(1) DEFAULT 1;
```

### 3. Testar Localmente Primeiro
```bash
# 1. Backup do banco
mysqldump -u root -p vale_dos_carajas > backup.sql

# 2. Testar migration
npm run migrate

# 3. Verificar resultado
npm run migrate:status

# 4. Se algo der errado, restaurar backup
mysql -u root -p vale_dos_carajas < backup.sql
```

### 4. Nomenclatura Clara
```bash
# ✅ Bom
npm run migrate:create add_user_avatar_column

# ❌ Ruim
npm run migrate:create fix
npm run migrate:create update
```

## 🔄 Fluxo de Trabalho

### Desenvolvimento Local
```bash
# 1. Criar nova migration
npm run migrate:create adicionar_campo_x

# 2. Editar o arquivo criado
# migrations/1234567890_adicionar_campo_x.sql

# 3. Executar localmente
npm run migrate

# 4. Testar aplicação
npm run dev

# 5. Commitar se tudo ok
git add migrations/
git commit -m "feat: adiciona campo x na tabela y"
```

### Deploy em Produção
```bash
# 1. Pull das últimas alterações
git pull origin main

# 2. Instalar dependências
npm install

# 3. Executar migrations pendentes
npm run migrate

# 4. Iniciar aplicação
npm run start
```

## 🛠️ Troubleshooting

### Migration Falhou
```bash
# Ver qual migration falhou
npm run migrate:status

# Verificar erro no console
# Corrigir o problema manualmente no banco
# Registrar a migration manualmente se necessário
INSERT INTO migrations (name) VALUES ('xxx_migration_name.sql');
```

### Resetar Tudo (CUIDADO!)
```bash
# Deletar tabela de controle
mysql -u root -p -e "DROP TABLE migrations;" vale_dos_carajas

# Recriar banco do zero
mysql -u root -p -e "DROP DATABASE vale_dos_carajas;"
mysql -u root -p -e "CREATE DATABASE vale_dos_carajas;"

# Executar todas as migrations
npm run migrate
```

## 📚 Migrations Existentes

| #   | Nome                              | Descrição                                      |
|-----|-----------------------------------|------------------------------------------------|
| 001 | initial_schema                    | Schema inicial completo do banco               |
| 002 | add_contract_column               | Adiciona coluna contract em purchase_requests  |
| 003 | alter_price_column                | Altera precisão da coluna price                |
| 004 | add_agreed_price_installments     | Adiciona preço acordado e parcelas             |
| 005 | add_active_users                  | Adiciona coluna active em users                |
| 006 | add_theme_preference              | Adiciona preferência de tema                   |
| 007 | move_payment_fields_to_lots       | Move campos de pagamento para lotes            |

## 🔐 Segurança

- Migrations são executadas com as credenciais do `.env.local`
- Sempre use `IF NOT EXISTS` / `IF EXISTS`
- Teste em ambiente de dev antes de produção
- Faça backup antes de executar em produção
- Nunca commite dados sensíveis nas migrations

## 📞 Suporte

Se tiver problemas com migrations:
1. Verifique os logs de execução
2. Consulte este README
3. Verifique o schema atual: `DESCRIBE nome_da_tabela;`
4. Execute `npm run migrate:status` para diagnóstico
