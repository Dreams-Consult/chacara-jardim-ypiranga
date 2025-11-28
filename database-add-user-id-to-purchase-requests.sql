-- Adicionar coluna user_id na tabela purchase_requests
-- Data: 2025-11-28
-- Descrição: Relacionar reservas com usuários vendedores para controle de acesso

USE vale_dos_carajas;

-- Verificar tipo da coluna id na tabela users
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'vale_dos_carajas' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'id';

-- Adicionar coluna user_id com VARCHAR (compatível com users.id)
ALTER TABLE `purchase_requests`
ADD COLUMN `user_id` VARCHAR(255) DEFAULT NULL AFTER `id`,
ADD KEY `idx_user_id` (`user_id`);

-- Verificar a estrutura da coluna id na tabela users antes de criar FK
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'id';

-- Verificar a estrutura da coluna user_id na tabela purchase_requests
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'purchase_requests' 
  AND COLUMN_NAME = 'user_id';

-- IMPORTANTE: Execute os comandos acima primeiro e verifique se:
-- 1. Ambas as colunas têm o mesmo DATA_TYPE
-- 2. Ambas têm o mesmo CHARACTER_SET_NAME
-- 3. Ambas têm o mesmo COLLATION_NAME
-- 
-- Se houver diferença, ajuste a coluna user_id para corresponder exatamente à coluna id de users
-- Exemplo: Se users.id for VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
-- Execute: ALTER TABLE purchase_requests MODIFY COLUMN user_id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Adicionar Foreign Key (só execute após verificar compatibilidade acima)
-- ALTER TABLE `purchase_requests`
-- ADD CONSTRAINT `purchase_requests_ibfk_user` 
--   FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
--   ON DELETE SET NULL;

-- Comentário sobre a coluna
ALTER TABLE `purchase_requests` 
MODIFY COLUMN `user_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID do vendedor que criou a reserva';

-- Verificar estrutura
DESCRIBE `purchase_requests`;

-- Exibir reservas com informações do vendedor
SELECT 
  pr.id,
  pr.user_id,
  u.username as vendedor_username,
  u.email as vendedor_email,
  pr.customer_name,
  pr.status,
  pr.created_at
FROM purchase_requests pr
LEFT JOIN users u ON pr.user_id = u.id
ORDER BY pr.created_at DESC
LIMIT 10;
